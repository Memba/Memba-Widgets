/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
// import 'kendo.binder';
import 'kendo.toolbar';
// import assert from '../common/window.assert.es6';
// import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    ui: { plugin, ToolBar },
} = window.kendo;
const logger = new Logger('widgets.markdown.toolbar');
// const NS = '.kendoMarkdownToolbar';
// const WIDGET_CLASS = 'k-widget m-markdown-toolbar';

/**
 * ProseMirrorToolBar
 */
const ProseMirrorToolBar = ToolBar.extend({
    /**
     * Initialize widget
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        ToolBar.fn.init.call(this, element, {
            ...options,
            items: [
                {
                    type: 'button',
                    attributes: { 'data-command': 'undo' },
                    icon: 'undo',
                    text: 'Undo',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'redo' },
                    icon: 'redo',
                    text: 'Redo',
                    showText: 'overflow',
                },
                {
                    type: 'separator',
                },
                {
                    type: 'splitButton',
                    attributes: { 'data-command': 'h1' },
                    icon: 'h1',
                    menuButtons: [
                        {
                            icon: 'h1',
                            attributes: { 'data-command': 'h1' },
                            text: 'Heading 1',
                        },
                        {
                            icon: 'h2',
                            attributes: { 'data-command': 'h2' },
                            text: 'Heading 2',
                        },
                        {
                            icon: 'h3',
                            attributes: { 'data-command': 'h3' },
                            text: 'Heading 3',
                        },
                        {
                            icon: 'h4',
                            attributes: { 'data-command': 'h4' },
                            text: 'Heading 4',
                        },
                        {
                            icon: 'h5',
                            attributes: { 'data-command': 'h5' },
                            text: 'Heading 5',
                        },
                        {
                            icon: 'h6',
                            attributes: { 'data-command': 'h6' },
                            text: 'Heading 6',
                        },
                    ],
                    showText: 'overflow',
                    text: 'Heading',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'bold' },
                    icon: 'bold',
                    text: 'Bold',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'italic' },
                    icon: 'italic',
                    text: 'Italic',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'ordered' },
                    icon: 'list-ordered',
                    text: 'Ordered List',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'unordered' },
                    icon: 'list-unordered',
                    text: 'Unordered List',
                    showText: 'overflow',
                },
                {
                    type: 'separator',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'code' },
                    icon: 'code-snippet',
                    text: 'Code',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'hyperlink' },
                    icon: 'hyperlink',
                    text: 'Hyperlink',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'image' },
                    icon: 'image',
                    text: 'Image',
                    showText: 'overflow',
                },
                {
                    type: 'button',
                    attributes: { 'data-command': 'math' },
                    icon: 'sum',
                    text: 'Math Formula',
                    showText: 'overflow',
                },
            ],
            click: this._eventHandler.bind(this),
            toggle: this._eventHandler.bind(this),
        });
        logger.debug({ method: 'init', message: 'widget initialized' });
    },

    /**
     * options
     */
    options: {
        name: 'ProseMirrorToolBar',
    },

    /**
     * events
     */
    events: ToolBar.fn.events.concat(['command']),

    /**
     * Handler toolbar events
     * @param e
     * @private
     */
    _eventHandler(e) {
        this.trigger('command', {
            ...e,
            command: e.item.element.data('command'), // e.g 'color' or 'font'
            // options: ?, // e.g. color or font value
        });
    },

    /**
     * Destroy widget
     */
    destroy() {
        ToolBar.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Register Widget
 */
plugin(ProseMirrorToolBar);
