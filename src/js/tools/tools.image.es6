/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert';
import CONSTANTS from '../common/window.constants';
import PageComponent from '../data/models.pagecomponent.es6';
import AssetAdapter from './adapters.asset.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import { ToolAssets, assets } from './util.assets.es6';

const {
    format,
    ns,
    template,
    ui: { Stage }
} = window.kendo;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).image || {
            description: 'Image',
            attributes: {
                alt: { title: 'Text', defaultValue: 'Image' },
                src: {
                    title: 'Source',
                    defaultValue:
                        'cdn://images/o_collection/svg/office/painting_landscape.svg'
                },
                style: { title: 'Style' }
            },
            properties: {
                behavior: { title: 'Behaviour' },
                constant: { title: 'Constant' }
            }
        }
    );
}

/**
 * @class Image tool
 * @type {void|*}
 */
const Image = BaseTool.extend({
    id: 'image',
    icon: 'painting_landscape',
    description: i18n().description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default:
            '<img src="#: src$() #" alt="#: attributes.alt #" class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #">'
    },
    height: 250,
    width: 250,
    attributes: {
        alt: new TextBoxAdapter({
            title: i18n().attributes.alt.title,
            defaultValue: i18n().attributes.alt.defaultValue
        }),
        src: new AssetAdapter({
            title: i18n().attributes.src.title,
            defaultValue: i18n().attributes.src.defaultValue
        }),
        style: new StyleAdapter({ title: i18n().attributes.style.title })
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                title: i18n().properties.behavior.title,
                defaultValue: 'none',
                enum: ['none', 'draggable', 'selectable']
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new TextBoxAdapter({ title: i18n().properties.constant.title })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const that = this;
        assert.instanceof(
            Image,
            that,
            assert.format(assert.messages.instanceof.default, 'this', 'Image')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        assert.enum(
            Object.keys(Stage.fn.modes),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.keys(Stage.fn.modes)
            )
        );
        assert.instanceof(
            ToolAssets,
            assets.image,
            assert.format(
                assert.messages.instanceof.default,
                'assets.image',
                'kidoju.ToolAssets'
            )
        );
        const tmpl = template(that.templates.default);
        // The class$ function adds the kj-interactive class to draggable components
        component.class$ = function() {
            return `kj-image${
                component.properties.behavior === 'draggable'
                    ? ` ${CONSTANTS.INTERACTIVE_CLASS}`
                    : ''
            }`;
        };
        // The id$ function returns the component id for components that have a behavior
        component.id$ = function() {
            return component.properties.behavior !== 'none' &&
                $.type(component.id) === CONSTANTS.STRING &&
                component.id.length
                ? component.id
                : '';
        };
        // The src$ function resolves urls with schemes like cdn://sample.jpg
        component.src$ = function() {
            let src = component.attributes.get('src');
            const schemes = assets.image.schemes;
            for (const scheme in schemes) {
                if (
                    Object.prototype.hasOwnProperty.call(schemes, scheme) &&
                    new RegExp(`^${scheme}://`).test(src)
                ) {
                    src = src.replace(`${scheme}://`, schemes[scheme]);
                    break;
                }
            }
            return src;
        };
        return tmpl($.extend(component, { ns }));
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            format('e.currentTarget is expected to be a stage element')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        const content = stageElement.children('img');
        // Assuming we can get the natural size of the image, we shall keep proportions
        const { naturalHeight, naturalWidth } = content[0];
        if (naturalHeight && naturalWidth) {
            const height = component.get('height');
            const width = component.get('width');
            const rectLimitedByHeight = {
                height: Math.round(height),
                width: Math.round((height * naturalWidth) / naturalHeight)
            };
            /*
             // Note: comparing rectLimitedByHeight and rectLimitedByWidth does not work because
             // we are using the component size and not the mouse position
             // therefore, we can only reduce the size proportionnaly, not increase it
             var rectLimitedByWidth = {
             height: Math.round(width * naturalHeight / naturalWidth),
             width: Math.round(width)
             };
             // if (rectLimitedByHeight.height * rectLimitedByHeight.width <= rectLimitedByWidth.height * rectLimitedByWidth.width) {
             if (rectLimitedByHeight.width <= width) {
             */
            if (height !== rectLimitedByHeight.height) {
                // avoids a stack overflow
                component.set('height', rectLimitedByHeight.height);
            }
            if (width !== rectLimitedByHeight.width) {
                // avoids a stack overflow
                component.set('width', rectLimitedByHeight.width);
            }
            /*
             } else if(rectLimitedByWidth.height <= height) {
             if (height !== rectLimitedByWidth.height) {
             component.set('height', rectLimitedByWidth.height);
             }
             if (width !== rectLimitedByWidth.width) {
             component.set('width', rectLimitedByWidth.width);
             }
             }
             */
        }
        // Set content size
        content.outerHeight(
            component.get('height') -
                content.outerHeight(true) +
                content.outerHeight()
        );
        content.outerWidth(
            component.get('width') -
                content.outerWidth(true) +
                content.outerWidth()
        );
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const description = this.description; // tool description
        const messages = this.i18n.messages;
        if (
            !component.attributes ||
            !component.attributes.alt ||
            component.attributes.alt === i18n().attributes.alt.defaultValue ||
            !RX_TEXT.test(component.attributes.alt)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    messages.invalidAltText,
                    description,
                    pageIdx + 1
                )
            });
        }
        if (
            !component.attributes ||
            !component.attributes.src ||
            component.attributes.src === i18n().attributes.src.defaultValue ||
            !RX_IMAGE.test(component.attributes.src)
        ) {
            ret.push({
                type:
                    component.attributes.src ===
                    i18n().attributes.src.defaultValue
                        ? CONSTANTS.WARNING
                        : CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidImageFile,
                    description,
                    pageIdx + 1
                )
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !RX_STYLE.test(component.attributes.style))
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidStyle,
                    description,
                    pageIdx + 1
                )
            });
        }
        // TODO: We should also check that there is a dropZone/Selector on the page if draggable/selectable
        return ret;
    }
});

/**
 * Registration
 */
tools.register(Image);
