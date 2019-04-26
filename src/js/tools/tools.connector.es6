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
import { PageComponent } from '../data/data.pagecomponent.es6';
import ColorAdapter from './adapters.color.es6';
import ConnectorAdapter from './adapters.connector.es6';
import DisabledAdapter from './adapters.disabled.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { genericLibrary } from './util.libraries.es6';
import { scoreValidator } from './util.validators.es6';
import i18n from '../common/window.i18n';

const { attr, format, ns } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.connector)) {
    $.extend(true, i18n(), {
        tools: {
            connector: {
                description: 'Connector',
                help: null,
                name: 'Connector',
                attributes: {},
                properties: {}
            }
        }
    });
}

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div data-${ns}role="connector" data-${ns}id="#: properties.name #" data-${ns}target-value="#: properties.solution #" data-${ns}color="#: attributes.color #" {0}></div>`;

/**
 * ConnectorTool
 * @class ConnectorTool
 */
const ConnectorTool = BaseTool.extend({
    id: 'connector',
    icon: 'target',
    description: i18n.connector.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 0.25,
    templates: {
        design: format(
            TEMPLATE,
            `data-${ns}enable="false" data-${ns}create-surface="false"`
        ),
        play: format(
            TEMPLATE,
            `data-${ns}bind="value: #: properties.name #.value, source: interactions"`
        ),
        review:
            format(
                TEMPLATE,
                `data-${ns}bind="value: #: properties.name #.value, source: interactions" data-${ns}enable="false"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 70,
    width: 70,
    attributes: {
        color: new ColorAdapter({
            title: i18n.connector.attributes.color.title,
            defaultValue: '#FF0000'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n.connector.properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n.connector.properties.question.title
        }),
        solution: new ConnectorAdapter({
            title: i18n.connector.properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: i18n.connector.properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n.connector.properties.success.title,
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: i18n.connector.properties.failure.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: i18n.connector.properties.omit.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        disabled: new DisabledAdapter({
            title: i18n.connector.properties.disabled.title,
            defaultValue: false
        })
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
                'PageComponent'
            )
        );
        const content = stageElement.children(
            `div[${attr('role')}="connector"]`
        );
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
        }
        // Redraw the connector widget
        const connectorWidget = content.data('kendoConnector');
        assert.instanceof(
            kendo.ui.Connector,
            connectorWidget,
            assert.format(
                assert.messages.instanceof.default,
                'connectorWidget',
                'kendo.ui.ConnectorTool'
            )
        );
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
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const { description } = this; // tool description
        const { messages } = this.i18n;
        if (
            !component.attributes ||
            !TOOLS.RX_COLOR.test(component.attributes.color)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidColor, description, pageIdx + 1)
            });
        }
        if (
            component.properties &&
            component.properties.disabled &&
            !TOOLS.RX_SOLUTION.test(component.properties.solution)
        ) {
            // component.properties.disabled === false is already tested in BaseTool.fn.validate.call(this, component, pageIdx)
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidSolution,
                    description,
                    component.properties.name,
                    pageIdx + 1
                )
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
tools.register(ConnectorTool);
