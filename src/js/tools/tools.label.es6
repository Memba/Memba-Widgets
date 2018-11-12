/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import StyleAdapter from './adapters.style.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';

const { format, ns, template } = window.kendo;

// TODO Review these constants
const RX_TEXT = /\S+/i;
const RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).label || {
            description: 'Label',
            help: null,
            name: 'Label',
            attributes: {
                style: { title: 'Style' },
                text: { title: 'Text', defaultValue: 'Label' }
            },
            properties: {
                behavior: { title: 'Behaviour' },
                constant: { title: 'Constant' }
            }
        }
    );
}

/**
 * @class LabelTool
 */
const LabelTool = BaseTool.extend({
    id: 'label',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().description,
    height: 80,
    help: i18n().help,
    icon: 'font',
    menu: ['attributes.text', 'attributes.style'],
    name: i18n().name,
    width: 300,
    templates: {
        default:
            '<div class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #">#= (kendo.htmlEncode(attributes.text) || "").replace(/\\n/g, "<br/>") #</div>'
    },
    attributes: {
        // text: new TextBoxAdapter({ title: i18n().attributes.text.title, defaultValue: i18n().attributes.text.defaultValue }),
        text: new TextAreaAdapter(
            {
                title: i18n().attributes.text.title,
                defaultValue: i18n().attributes.text.defaultValue
            },
            { rows: 2, style: 'resize:vertical; width: 100%;' }
        ),
        style: new StyleAdapter({
            title: i18n().attributes.style.title,
            defaultValue: 'font-size:60px;'
        })
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                title: i18n().properties.behavior.title,
                defaultValue: 'none',
                enum: ['none', 'draggable', 'selectable'] // TODO
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new TextBoxAdapter({
            title: i18n().properties.constant.title
        })
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
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(CONSTANTS.STAGE_MODES)
            )
        );
        const tmpl = template(that.templates.default);
        // The class$ function adds the kj-interactive class to draggable components
        // eslint-disable-next-line no-param-reassign
        component.class$ = function() {
            return `kj-label${
                component.properties.behavior === 'draggable'
                    ? ` ${CONSTANTS.INTERACTIVE_CLASS}`
                    : ''
            }`;
        };
        // The id$ function returns the component id for components that have a behavior
        // eslint-disable-next-line no-param-reassign
        component.id$ = function() {
            return component.properties.behavior !== 'none' &&
                $.type(component.id) === CONSTANTS.STRING &&
                component.id.length
                ? component.id
                : '';
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
            // if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
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
            component.attributes.text === i18n().attributes.text.defaultValue ||
            !RX_TEXT.test(component.attributes.text)
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
                !RX_STYLE.test(component.attributes.style))
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
