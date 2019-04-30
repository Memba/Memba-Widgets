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
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';

const { format } = window.kendo;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.square)) {
    $.extend(true, i18n(), {
        tools: {
            square: {
                description: 'Square',
                help: null,
                name: 'Square'
            }
        }
    });
}

/**
 * Template
 * @type {string}
 */
const TEMPLATE =
    '<div style="position: absolute; top: 0; left: 0; right:0; bottom: 0; background-color: {0}; border: solid 1px #000; color: #fff; padding: 10px;">{1}</div>';

/**
 * Dummy square tool without adapters for testing
 * @class SquareTool
 * @extends BaseTool
 */
const SquareTool = BaseTool.extend({
    id: 'square',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().tools.square.description,
    height: 300,
    help: i18n().tools.square.help,
    icon: 'shapes',
    // menu: [],
    name: i18n().tools.square.name,
    width: 300,
    templates: {
        play: format(TEMPLATE, '#0f0', 'PLAY'),
        design: format(TEMPLATE, '#00f', 'DESIGN'),
        review: format(TEMPLATE, '#f00', 'REVIEW')
    },
    // attributes: {},
    // properties: {},

    /**
     * getHtmlContent
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {jQuery|HTMLElement}
     */
    getHtmlContent(component, mode) {
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
        return $(this.templates[mode]);
    },

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
        if (stageElement.is(CONSTANTS.ELEMENT_CLASS)) {
            const content = stageElement.children(CONSTANTS.DIV);
            content.off(CONSTANTS.CLICK);
            if (enabled) {
                content.on(CONSTANTS.CLICK, () => {
                    window.alert(`Hello from ${component.uid}`);
                });
            }
        }
    },

    /**
     * onResize
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
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
        if (
            stageElement.is(CONSTANTS.ELEMENT_CLASS) &&
            component instanceof PageComponent
        ) {
            const content = stageElement.children(CONSTANTS.DIV);
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
            // prevent any side effect
            e.preventDefault();
            // prevent event to bubble on stage
            e.stopPropagation();
        }
    }
});

/**
 * Registration
 */
tools.register(SquareTool);
