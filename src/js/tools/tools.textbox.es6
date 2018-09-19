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
import BaseTool from './tools.base.es6';

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).textbox || {
            // TODO
        }
    );
}



    // Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
var TEXTBOX = '<input type="text" id="#: properties.name #" class="kj-interactive" data-#= ns #role="maskedtextbox" data-#= ns #prompt-char="\u25CA" style="#: attributes.style #" {0}>';
/**
 * @class Textbox tool
 * @type {void|*}
 */
var Textbox = BaseTool.extend({
    id: 'textbox',
    icon: 'text_field',
    description: i18n.textbox.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: kendo.format(TEXTBOX, ''),
        play: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"'),
        review: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"') + BaseTool.fn.showResult()
    },
    height: 80,
    width: 300,
    attributes: {
        mask: new StringAdapter({ title: i18n.textbox.attributes.mask.title }),
        style: new StyleAdapter({ title: i18n.textbox.attributes.style.title })
    },
    properties: {
        name: new NameAdapter({ title: i18n.textbox.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.textbox.properties.question.title }),
        solution: new StringAdapter({ title: i18n.textbox.properties.solution.title }),
        validation: new ValidationAdapter({ title: i18n.textbox.properties.validation.title }),
        success: new ScoreAdapter({ title: i18n.textbox.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.textbox.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.textbox.properties.omit.title, defaultValue: 0 })
    },

    /**
     * onEnable event handler
     * @class Textbox
     * @method onEnable
     * @param e
     * @param component
     * @param enabled
     */
    onEnable: function (e, component, enabled) {
        var stageElement = $(e.currentTarget);
        if (stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`) && component instanceof PageComponent) {
            stageElement.find('input')
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
        var content = stageElement.find('input'); // span > input
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width')  - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
            if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                content.css('font-size', Math.floor(0.65 * content.height()));
            }
        }
        // This is a trick because of http://docs.telerik.com/kendo-ui/framework/mvvm/overview#important-notes
        // In other words it is impossible to set a mask that only contains digits declaratively (data-mask attribute)
        // See also http://docs.telerik.com/kendo-ui/api/javascript/ui/maskedtextbox#configuration-mask
        var maskedTextBoxWidget = content.data('kendoMaskedTextBox');
        if (kendo.ui.MaskedTextBox && maskedTextBoxWidget instanceof kendo.ui.MaskedTextBox &&
            maskedTextBoxWidget.options.mask !== component.attributes.mask) {
            maskedTextBoxWidget.setOptions({ mask: component.attributes.mask });
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
        // TODO: validate mask
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
tools.register(Textbox);

