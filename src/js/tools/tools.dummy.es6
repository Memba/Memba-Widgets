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
import { BaseTool } from './tools.base.es6';

const { format } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE =
    '<div style="position: absolute; top: 0; left: 0; right:0; bottom: 0; background-color: {0}; border: solid 1px \\\\#000; color: \\\\#fff; padding: 10px;">{1}</div>';

/**
 * Dummy square tool without adapters for testing
 * @class DummyTool
 * @extends BaseTool
 */
const DummyTool = BaseTool.extend({
    id: 'dummy',
    height: 300,
    width: 300,
    // menu: [],
    templates: {
        play: format(TEMPLATE, '\\\\#0f0', 'PLAY'),
        design: format(TEMPLATE, '\\\\#00f', 'DESIGN'),
        review: format(TEMPLATE, '\\\\#f00', 'REVIEW')
    },
    // attributes: {},
    // properties: {},

    /**
     * onEnable
     * @method onEnable
     * @param e
     * @param component
     * @param enabled
     */
    onEnable(e, component, enabled) {
        assert.type(
            CONSTANTS.OBJECT,
            e,
            // Note: we are not asserting that e is a $.Event
            // to call onEnable({ currentTarget: el[0] }, component )
            assert.format(assert.messages.type.default, 'e', CONSTANTS.OBJECT)
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
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            assert.format('e.currentTarget is expected to be a stage element')
        );
        const content = stageElement.children(CONSTANTS.DIV);
        content.off(CONSTANTS.CLICK);
        if (enabled) {
            content.on(CONSTANTS.CLICK, () => {
                // eslint-disable-next-line no-alert
                window.alert(`Hello from ${component.uid}`);
            });
        }
    }
});

/**
 * Default eport
 */
export default DummyTool;
