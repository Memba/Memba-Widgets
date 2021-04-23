/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import '../widgets/widgets.connector.es6';
import ColorAdapter from './adapters.color.es6';
import ConnectorAdapter from './adapters.connector.es6';
import DisabledAdapter from './adapters.disabled.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { genericLibrary } from './util.libraries.es6';
import { questionValidator, scoreValidator } from './util.validators.es6';

const {
    format,
    ns,
    roleSelector,
    ui: { Connector },
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="connector"
    data-${ns}id="#: properties.name #"
    data-${ns}target-value="#: properties.solution #"
    data-${ns}color="#: attributes.color #" {0}>
    </div>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value, source: interactions"`;
const DISABLED = `data-${ns}enable="false"`; // TODO use enabled
const NO_SURFACE = `data-${ns}create-surface="false"`;

/**
 * ConnectorTool
 * @class ConnectorTool
 */
const ConnectorTool = BaseTool.extend({
    id: 'connector',
    childSelector: `${CONSTANTS.DIV}${roleSelector('connector')}`,
    height: 70,
    width: 70,
    weight: 0.25,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, `${DISABLED} ${NO_SURFACE}`),
        play: format(TEMPLATE, BINDING),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        color: new ColorAdapter({
            title: __('tools.connector.attributes.color.title'),
            defaultValue: '#ff0000',
        }),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.connector.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.connector.properties.question.help'),
            title: __('tools.connector.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new ConnectorAdapter({
            help: __('tools.connector.properties.solution.help'),
            title: __('tools.connector.properties.solution.title'),
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: __('tools.connector.properties.validation.title'),
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.connector.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.connector.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.connector.properties.omit.title'),
            validation: scoreValidator,
        }),
        disabled: new DisabledAdapter({
            defaultValue: false,
            title: __('tools.connector.properties.disabled.title'),
        }),
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        BaseTool.fn.onResize.call(this, e, component);
        const stageElement = $(e.currentTarget);
        const content = stageElement.children(this.childSelector);
        // Redraw the connector widget
        // TODO Consider implementing the resize method on kendo.ui.Connector to remove onResize here
        const connector = content.data('kendoConnector');
        assert.instanceof(
            Connector,
            connector,
            assert.format(
                assert.messages.instanceof.default,
                'connector',
                'kendo.ui.Connector'
            )
        );
        connector._drawConnector();
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
        if (
            !component.attributes ||
            !TOOLS.RX_COLOR.test(component.attributes.color)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidColor'),
                    toolName,
                    pageIdx + 1
                ),
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
                    __('tools.messages.invalidSolution'),
                    toolName,
                    component.properties.name,
                    pageIdx + 1
                ),
            });
        }
        // TODO: We should also check that there is a matching connector on the page
        // TODO: Check connectors on top of static images and labels
        return ret;
    },
});

/**
 * Default eport
 */
export default ConnectorTool;
