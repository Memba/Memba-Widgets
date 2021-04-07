/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
                { type: 'button', id: 'btn1', text: 'Button 1' },
                { type: 'button', id: 'btn2', text: 'Button 2' },
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
            command: e.id, // e.g 'color' or 'font'
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
