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
        (((window.app || {}).i18n || {}).tools || {}).connector || {
            // TODO
        }
    );
}

var CONNECTOR = '<div data-#= ns #role="connector" data-#= ns #id="#: properties.name #" data-#= ns #target-value="#: properties.solution #" data-#= ns #color="#: attributes.color #" {0}></div>';
/**
 * @class Connector tool
 * @type {void|*}
 */
var Connector = BaseTool.extend({
    id: 'connector',
    icon: 'target',
    description: i18n.connector.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 0.25,
    templates: {
        design: kendo.format(CONNECTOR, 'data-#= ns #enable="false" data-#= ns #create-surface="false"'),
        play: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
        review: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + BaseTool.fn.showResult()
    },
    height: 70,
    width: 70,
    attributes: {
        color: new ColorAdapter({ title: i18n.connector.attributes.color.title, defaultValue: '#FF0000' })
    },
    properties: {
        name: new NameAdapter({ title: i18n.connector.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.connector.properties.question.title }),
        solution: new ConnectorAdapter({ title: i18n.connector.properties.solution.title }),
        validation: new ValidationAdapter({ title: i18n.connector.properties.validation.title }),
        success: new ScoreAdapter({ title: i18n.connector.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.connector.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.connector.properties.omit.title, defaultValue: 0 }),
        disabled: new DisabledAdapter({ title: i18n.connector.properties.disabled.title, defaultValue: false })
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
        var content = stageElement.children('div[' + kendo.attr('role') + '="connector"]');
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        // Redraw the connector widget
        var connectorWidget = content.data('kendoConnector');
        assert.instanceof(kendo.ui.Connector, connectorWidget, assert.format(assert.messages.instanceof.default, 'connectorWidget', 'kendo.ui.Connector'));
        connectorWidget._drawConnector();

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
            !RX_COLOR.test(component.attributes.color)) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidColor, description, pageIdx + 1)
            });
        }
        if (component.properties && component.properties.disabled && !RX_SOLUTION.test(component.properties.solution)) {
            // component.properties.disabled === false is already tested in BaseTool.fn.validate.call(this, component, pageIdx)
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidSolution, description, component.properties.name, pageIdx + 1)
            });
        }
        // TODO: We should also check that there is a matching connector on the page
        // TODO: Check connectors on top of static images and labels
        return ret;
    }

});

/**
 * Registration
 */
tools.register(Connector);
