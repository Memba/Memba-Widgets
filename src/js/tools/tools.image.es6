/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assets from '../app/app.assets.es6';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import AssetAdapter from './adapters.asset.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import { BaseTool } from './tools.base.es6';
// import ToolAssets from './util.assets.es6';
import TOOLS from './util.constants.es6';
import {
    altValidator,
    constantValidator,
    styleValidator,
} from './util.validators.es6';

const { format, ns } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<img src="#: src$() #" alt="#: attributes.alt #" class="#: class$() #" style="#: attributes.style #" data-${ns}id="#: id$() #" data-${ns}behavior="#: properties.behavior #" data-${ns}constant="#: properties.constant #">`;

/**
 * ImageTool
 * @class ImageTool
 * @extends BaseTool
 */
const ImageTool = BaseTool.extend({
    id: 'image',
    childSelector: CONSTANTS.IMG,
    height: 250,
    menu: ['attributes.src', 'attributes.alt'],
    width: 250,
    templates: {
        default: TEMPLATE,
    },
    attributes: {
        alt: new TextBoxAdapter({
            defaultValue: __('tools.image.attributes.alt.defaultValue'),
            help: __('tools.image.attributes.alt.help'),
            title: __('tools.image.attributes.alt.title'),
            validation: altValidator,
        }),
        src: new AssetAdapter({
            defaultValue: __('tools.image.attributes.src.defaultValue'),
            help: __('tools.image.attributes.src.help'),
            title: __('tools.image.attributes.src.title'),
        }),
        style: new StyleAdapter({
            title: __('tools.image.attributes.style.title'),
            validation: styleValidator,
        }),
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                defaultValue: 'none',
                source: __('tools.image.properties.behavior.source'),
                title: __('tools.image.properties.behavior.title'),
            },
            {
                style: 'width: 100%;',
            }
        ),
        constant: new TextBoxAdapter({
            title: __('tools.image.properties.constant.title'),
            validation: constantValidator,
        }),
    },

    /**
     * getAssets
     * @method getAssets
     * @param component
     * @returns {{audio: Array, image: Array, video: Array}}
     */
    getAssets(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return {
            audio: [],
            image: [component.get('attributes.src')],
            video: [],
        };
    },

    /**
     * getHtmlContent
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        $.extend(component, {
            // The class$ function adds the kj-interactive class to draggable components
            class$() {
                return `kj-image${
                    component.get('properties.behavior') === 'draggable'
                        ? ` ${CONSTANTS.INTERACTIVE_CLASS}`
                        : ''
                }`;
            },
            // The id$ function returns the component id for components that have a behavior
            id$() {
                return component.get('properties.behavior') !== 'none' &&
                    $.type(component.id) === CONSTANTS.STRING &&
                    component.id.length
                    ? component.id
                    : '';
            },
            // The src$ function resolves urls with schemes like cdn://sample.jpg
            src$() {
                const src = component.get('attributes.src');
                return assets.image.scheme2http(src);
            },
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * onResize
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        const content = stageElement.children(this.childSelector);
        // Assuming we can get the natural size of the image, we shall keep proportions
        const { naturalHeight, naturalWidth } = content[0];
        if (naturalHeight && naturalWidth) {
            const height = component.get('height');
            const width = component.get('width');
            // Keep the height, change the width
            const w = (height * naturalWidth) / naturalHeight;
            if (width !== w) {
                // `if` avoids a stack overflow
                component.set('width', w);
            }
        }
        BaseTool.fn.onResize.call(this, e, component);
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const {
            description,
            i18n: { messages },
        } = this; // tool description
        // TODO use component.get('attributes.alt')
        if (
            !component.attributes ||
            !component.attributes.alt ||
            component.attributes.alt ===
                __('tools.image.attributes.alt.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.alt)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    messages.invalidAltText,
                    description,
                    pageIdx + 1
                ),
            });
        }
        if (
            !component.attributes ||
            !component.attributes.src ||
            component.attributes.src ===
                __('tools.image.attributes.src.defaultValue') ||
            !TOOLS.RX_IMAGE.test(component.attributes.src)
        ) {
            ret.push({
                type:
                    component.attributes.src ===
                    __('tools.image.attributes.src.defaultValue')
                        ? CONSTANTS.WARNING
                        : CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidImageFile,
                    description,
                    pageIdx + 1
                ),
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidStyle,
                    description,
                    pageIdx + 1
                ),
            });
        }
        // TODO: We should also check that there is a dropZone/Selector on the page if draggable/selectable
        return ret;
    },
});

/**
 * Default export
 */
export default ImageTool;
