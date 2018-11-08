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
import tools from './tools.es6';
import BaseTool from './tools.base.es6';

const { attr, format } = window.kendo;

/**
 * Dummy square tool for testing
 * @class Square
 * @extends BaseTool
 */
var Square = BaseTool.extend({
    id: 'square',
    icon: 'shapes',
    name: 'Square',
    description: 'Square',
    cursor: 'progress',
    templates: {
        play: '<div style="background-color:#00FF00;">PLAY</div>',
        design: '<div style="background-color:#0000FF;">DESIGN</div>',
        review: '<div style="background-color:#FF0000;">REVIEW</div>'
    },
    height: 300,
    width: 300,
    attributes: {
        // src: new adapters.AssetAdapter({ title: 'Image', defaultValue: 'cdn://images/o_collection/svg/office/painting_landscape.svg' }),
        // alt: new adapters.StringAdapter({ title: 'Text', defaultValue: 'Painting Landscape' })
    },

    getHtmlContent(component, mode) {
        assert.instanceof(
            Square,
            this,
            assert.format(assert.messages.instanceof.default, 'this', 'Square')
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
        const modes = kendo.ui.Stage.fn.modes;
        assert.enum(
            Object.values(modes),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(modes)
            )
        );
        return $(this.templates[mode]);
    },

    onEnable(e, component, enabled) {
        const stageElement = $(e.currentTarget);
        if (stageElement.is('.kj-element')) {
            const content = stageElement.children('div');
            assert.ok(
                content.length === 1,
                'Square elements are expected to be constituted of a single div'
            );
            content.off('click');
            if (enabled) {
                content.on('click', () => {
                    window.alert(`Hello from ${component.uid}`);
                });
            }
        }
    },

    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        if (
            stageElement.is('.kj-element') &&
            component instanceof PageComponent
        ) {
            const content = stageElement.children('div');
            if ($.type(component.width) === 'number') {
                content.width(component.width);
            }
            if ($.type(component.height) === 'number') {
                content.height(component.height);
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
tools.register(Square);
