/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.toolbar';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    ui: { plugin, ToolBar },
} = window.kendo;
const logger = new Logger('widgets.markdown.toolbar');
// const NS = '.kendoMarkdownToolbar';
const WIDGET_CLASS = 'k-widget m-markdown-toolbar';

/**
 * MarkDownToolBar
 */
const MarkdownToolBar = ToolBar.extend({
    init(element, options = {}) {
        ToolBar.fn.init.call(
            this,
            element,
            {
                ...options,
                items: [
                    { type: "button", id: "btn1", text: "Button 1" },
                    { type: "button", id: "btn2", text: "Button 2" }
                ]
            });
        logger.debug({ method: 'init', message: 'widget initialized' });
    },

    options: {
        name: 'MarkdownToolBar'
    },

    destroy() {
        ToolBar.fn.destroy.call(this);
    }
});

/**
 * Register Widget
 */
plugin(MarkdownToolBar);

