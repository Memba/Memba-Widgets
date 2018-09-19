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
import BaseTool from './tools.base.es6';

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).dropzone || {
            // TODO
        }
    );
}

var DROPZONE = '<div id="#: properties.name #" data-#= ns #role="dropzone" data-#= ns #center="#: attributes.center #"  data-#= ns #empty="#: attributes.empty #" style="#: attributes.style #" {0}><div>#: attributes.text #</div></div>';
// TODO: Check whether DROPZONE requires class="kj-interactive"
/**
 * @class DropZone tool
 * @type {void|*}
 */
var DropZone = BaseTool.extend({
    id: 'dropzone',
    icon: 'elements_selection',
    description: i18n.dropzone.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: kendo.format(DROPZONE, 'data-#= ns #enable="false"'),
        play: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
        review: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + BaseTool.fn.showResult()
    },
    height: 250,
    width: 250,
    attributes: {
        center: new BooleanAdapter({ title: i18n.dropzone.attributes.center.title, defaultValue: i18n.dropzone.attributes.center.defaultValue }),
        empty: new StringAdapter({ title: i18n.dropzone.attributes.empty.title }),
        text: new StringAdapter({ title: i18n.dropzone.attributes.text.title, defaultValue: i18n.dropzone.attributes.text.defaultValue }),
        style: new StyleAdapter({ title: i18n.dropzone.attributes.style.title, defaultValue: 'font-size:30px;border:dashed 3px #e1e1e1;' })
    },
    properties: {
        name: new NameAdapter({ title: i18n.dropzone.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.dropzone.properties.question.title }),
        solution: new StringArrayAdapter({ title: i18n.dropzone.properties.solution.title }),
        validation: new ValidationAdapter({ title: i18n.dropzone.properties.validation.title }),
        success: new ScoreAdapter({ title: i18n.dropzone.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.dropzone.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.dropzone.properties.omit.title, defaultValue: 0 }),
        disabled: new DisabledAdapter({ title: i18n.dropzone.properties.disabled.title, defaultValue: false })
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$: function (testItem) {
        var ret = (testItem.value || []).slice();
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$: function (testItem) {
        var ret = (testItem.solution || '').split('\n');
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
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
        var content = stageElement.children('div');
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
        // Note: any text is acceptable
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
        // TODO: we should also check that there are draggable components on the page
        // TODO: Check order of draggables 'on top' of drop zone
    }

});

/**
 * Registration
 */
tools.register(DropZone);
