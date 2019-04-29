/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import i18n from '../common/window.i18n.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.template.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import StyleAdapter from './adapters.style.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import {
    constantValidator,
    styleValidator,
    textValidator
} from './util.validators.es6';

const { format, htmlEncode, ns, template } = window.kendo;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.label)) {
    $.extend(true, i18n(), {
        tools: {
            label: {
                description: 'Label: <em>#: attributes.text #</em>',
                help: null,
                name: 'Label',
                attributes: {
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Label' }
                },
                properties: {
                    behavior: {
                        source: [
                            { text: 'None', value: 'none' },
                            { text: 'Draggable', value: 'draggable' },
                            { text: 'Selectable', value: 'selectable' }
                        ],
                        title: 'Behaviour'
                    },
                    constant: { title: 'Constant' }
                }
            }
        }
    });
}

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div class="#: class$() #" data-${ns}role="template" data-${ns}template="t-#: id #" style="#: attributes.style #" data-${ns}id="#: id #" data-${ns}behavior="#: properties.behavior #" data-${ns}constant="#: properties.constant #" data-${ns}bind="value: variables$()"></div><script id="t-#: id #" type="text/x-kendo-template">#= template$() #</script>`;
// We need to designate the template in a script, because kendo.init calls parseOption from kendo.core.js
// which tranforms any data-*template tag into a template function assigned to options.template and
// it won't work otherwise because ${'#' + value) fails if value is the template content

const DESIGN = `<div class="#: class$() #" style="#: attributes.style #" data-${ns}id="#: id #" data-${ns}behavior="#: properties.behavior #" data-${ns}constant="#: properties.constant #">#= text$() #</div>`;

/**
 * LabelTool
 * @class LabelTool
 * @extends BaseTool
 */
const LabelTool = BaseTool.extend({
    id: 'label',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().tools.label.description,
    height: 80,
    help: i18n().tools.label.help,
    icon: 'font',
    menu: ['attributes.text', 'attributes.style'],
    name: i18n().tools.label.name,
    width: 300,
    templates: {
        design: DESIGN,
        play: TEMPLATE,
        review: TEMPLATE
    },
    attributes: {
        text: new TextAreaAdapter(
            {
                title: i18n().tools.label.attributes.text.title,
                defaultValue: i18n().tools.label.attributes.text.defaultValue,
                validation: textValidator
            },
            {
                rows: 2,
                style: 'resize:vertical; width: 100%;',
                validationMessage: 'Oops'
            }
        ),
        style: new StyleAdapter(
            {
                title: i18n().tools.label.attributes.style.title,
                defaultValue: 'font-size:60px;',
                validation: styleValidator
            },
            {
                validationMessage: 'Oops'
            }
        )
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                defaultValue: 'none',
                source: i18n().tools.label.properties.behavior.source,
                title: i18n().tools.label.properties.behavior.title
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new TextBoxAdapter(
            {
                title: i18n().tools.label.properties.constant.title,
                validation: constantValidator
            },
            {
                validationMessage: 'Oops'
            }
        )
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
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        assert.enum(
            Object.values(TOOLS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(TOOLS.STAGE_MODES)
            )
        );
        const tmpl = template(that.templates[mode]);
        $.extend(component, {
            // The class$ function adds the kj-interactive class to draggable components
            class$() {
                return `kj-label${
                    component.get('properties.behavior') === 'draggable'
                        ? ` ${CONSTANTS.INTERACTIVE_CLASS}`
                        : ''
                }`;
            },
            // compute variables, html encode text, then replace line feeds with <br/>
            template$() {
                const text = component.get('attributes.text');
                return text
                    .replace(TOOLS.RX_MUSTACHE_VAR, TOOLS.KENDO_VAR)
                    .replace(/\n/g, '<br/>');
            },
            text$() {
                const text = component.get('attributes.text');
                return htmlEncode(text).replace(/\n/g, '<br/>');
            },
            variables$() {
                // We need this to avoid an error when binding the stage
                // but in fact the variables$ will be supplied by data.basetest
                // when binding the test properties
                return {};
            }
        });
        return tmpl(component);
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
            assert.format('e.currentTarget is expected to be a stage element')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        const content = stageElement.children('div');
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(
                component.get('width') -
                    content.outerWidth(true) +
                    content.outerWidth()
            );
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(
                component.get('height') -
                    content.outerHeight(true) +
                    content.outerHeight()
            );
            // if (component.attributes && !TOOLS.RX_FONT_SIZE.test(component.attributes.style)) {
            /*
             * We make a best guess for the number of lines as follows
             * Let's suppose the height (line-height, not font-size) and width of a character are respectively y and x
             * We have y = x * sizeRatio
             * How many of these character rectangles (x, y) can we fit in the content div (width, height)?
             *
             * the label only takes 1 line, if we have:
             * y = height and length <= width/x, that is length <= width*sizeRatio/y or y = height <= length*sizeRatio/width, which is length >= width*sizeRatio/height
             *
             * the label takes 2 lines, if we have:
             * y = height/2 and length <= width/x, that is length <= 2*width*sizeRatio/y or y = height/2 <= length*sizeRatio/width, which is length >= 4*width*sizeRatio/height
             *
             * the label takes n lines if we have sqrt((length*height)/sizeRatio*width) <= lines < sqrt(((length + 1)*height)/sizeRatio*width)
             *
             */
            // var length = component.attributes.text.length;
            // var sizeRatio = 1.6; // font-size being the height, this is the line-height/char-width ratio
            // var lines = Math.max(1, Math.floor(Math.sqrt((length * component.height) / (width * sizeRatio))));
            // We can now make a best guess for the font size
            // var fontRatio = 1.2; // this is the line-height/font-size ration
            // content.css('font-size', Math.floor(component.height / lines / fontRatio));
            // Note: in previous versions, we have tried to iterate through a hidden clone
            // to find that font size that does not trigger an overflow but it is too slow
            // }
        }
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
        const {
            description,
            i18n: { messages }
        } = this; // tool description
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
                i18n().tools.label.attributes.text.defaultValue ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO: We should also check that there is a dropZone on the page if draggable
        // TODO check selectable too
        return ret;
    }
});

/**
 * Registration
 */
tools.register(LabelTool);
