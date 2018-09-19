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

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).textarea || {
            // TODO
        }
    );
}


var TEXTAREA = '<textarea id="#: properties.name #" class="k-textbox kj-interactive" style="#: attributes.style #" {0}></textarea>';
/**
 * @class Textarea tool
 * @type {void|*}
 */
var Textarea = BaseTool.extend({
    id: 'textarea',
    icon: 'text_area',
    description: i18n.textarea.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 2,
    templates: {
        design: kendo.format(TEXTAREA, ''),
        play: kendo.format(TEXTAREA, 'data-#= ns #bind="value: #: properties.name #.value"'),
        review: kendo.format(TEXTAREA, 'data-#= ns #bind="value: #: properties.name #.value"') + BaseTool.fn.showResult()
    },
    height: 300,
    width: 500,
    attributes: {
        style: new adapters.StyleAdapter({ title: i18n.textarea.attributes.style.title, defaultValue: 'font-size:40px;resize:none;' })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.textarea.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.textarea.properties.question.title }),
        solution: new adapters.TextAdapter({ title: i18n.textarea.properties.solution.title }),
        validation: new adapters.ValidationAdapter({ title: i18n.textarea.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.textarea.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.textarea.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.textarea.properties.omit.title, defaultValue: 0 })
    },

    /**
     * onEnable event handler
     * @class Textarea
     * @method onEnable
     * @param e
     * @param component
     * @param enabled
     */
    onEnable: function (e, component, enabled) {
        var stageElement = $(e.currentTarget);
        if (stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`) && component instanceof PageComponent) {
            stageElement.children('textarea')
            .prop({
                // disabled: !enabled, // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
                readonly: !enabled
            });
        }
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('textarea');
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
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
    validate: function (component, pageIdx) {
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        return ret;
    }

});

/**
 * Registration
 */
tools.register(Textarea);
