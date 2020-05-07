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
import Logger from '../common/window.logger.es6';
import tools from '../tools/tools.es6';
import { StubTool } from '../tools/tools.base.es6';
import TOOLS from '../tools/util.constants.es6';

const {
    attr,
    destroy,
    format,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.toolbox');

const NS = '.kendoToolBox';
const WIDGET_CLASS = 'k-widget k-toolbar kj-toolbox';
const BUTTON =
    '<a href="#" class="k-button kj-tool" title="{1}"><img src="{0}" alt="{1}"></a>';
const ROLE = 'role';
const MENU = 'menu';
const MENUITEM = 'menuitem';
const TOOL = 'tool';
const DEFAULT_EXTENSION = '.svg';
const DEFAULT_PATH = '../../styles/images/o_collection/svg/office/';
const DEFAULT_SIZE = 32;

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * ToolBox
 * @class ToolBox
 * @extends Widget
 */
const ToolBox = Widget.extend({
    /**
     * Initialization
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        assert.instanceof(
            HTMLElement,
            element,
            assert.format(
                assert.messages.instanceof.default,
                'element',
                'HTMLElement'
            )
        );
        assert.isPlainObject(
            options,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'options'
            )
        );
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._initTemplate();
        this._render();
        this.enable(this.options.enabled);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'ToolBox',
        enabled: true,
        size: DEFAULT_SIZE,
        iconPath: DEFAULT_PATH,
        extension: DEFAULT_EXTENSION,
        tools, // This is a function to defer loading
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CLICK],

    /**
     * value
     * @method value
     * @param value
     * @returns {*}
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        let ret;
        const { element, options } = this;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = element.find(`.${CONSTANTS.SELECTED_CLASS}`).attr(attr(TOOL));
        } else if (options.tools(value) instanceof StubTool) {
            if (value !== options.tools.active) {
                // the change handler refreshes the widget
                options.tools.active = value;
            }
        } else {
            throw new RangeError(
                format('{0} is not the id of a known tool', value)
            );
        }
        return ret;
    },

    /**
     * Reset the toolbox to selection mode
     * @method reset
     */
    reset() {
        this.value(TOOLS.POINTER);
    },

    /**
     * Icon path
     * @method _initTemplate
     * @see widgets.explorer
     * @private
     */
    _initTemplate() {
        // @see widgets.explorer
        const { options } = this;
        this._iconPath = `${options.iconPath}${
            /\/$/.test(options.iconPath) ? '' : '/'
        }{0}${/^\./.test(options.extension) ? '' : '.'}${options.extension}`;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a ToolBox widget.'
        );
        this.wrapper = element.addClass(WIDGET_CLASS).attr(ROLE, MENU);
        Object.keys(options.tools()).forEach((id) => {
            const tool = options.tools(id);
            if (tool instanceof StubTool) {
                const button = $(
                    format(BUTTON, format(this._iconPath, tool.icon), tool.name)
                )
                    .attr(attr(TOOL), id)
                    .attr(ROLE, MENUITEM)
                    .css({
                        lineHeight: 'normal',
                        margin: `${Math.round(options.size / 16)}px`,
                    });
                button.find('img').height(options.size).width(options.size);
                element.append(button);
            }
        });
        this.refresh();
        if ($.isFunction(this._refreshHandler)) {
            options.tools().unbind(CONSTANTS.CHANGE, this._refreshHandler);
        }
        this._refreshHandler = this.refresh.bind(this);
        options.tools().bind(CONSTANTS.CHANGE, this._refreshHandler);
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const { element, options } = this;
        element
            .find(`${CONSTANTS.DOT}${CONSTANTS.SELECTED_CLASS}`)
            .removeClass(CONSTANTS.SELECTED_CLASS);
        element
            .find(`[${attr(TOOL)}=${options.tools.active}]`)
            .addClass(CONSTANTS.SELECTED_CLASS);
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Enables/disables the widget
     * @method enable
     * @param enable
     */
    enable(enable) {
        const { element } = this;
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        element.off(`${CONSTANTS.CLICK}${NS}`);
        if (enabled) {
            element
                .removeClass(CONSTANTS.DISABLED_CLASS)
                .on(`${CONSTANTS.CLICK}${NS}`, 'a.kj-tool', (e) => {
                    e.preventDefault();
                    const value = $(e.currentTarget).attr(attr(TOOL));
                    if (!this.trigger(CONSTANTS.CLICK, { value })) {
                        this.value(value);
                    }
                });
        } else {
            element.addClass(CONSTANTS.DISABLED_CLASS);
            this.value(TOOLS.POINTER);
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { element, options } = this;
        // Unbind events
        element.off(NS);
        if ($.isFunction(this._refreshHandler)) {
            options.tools().unbind(CONSTANTS.CHANGE, this._refreshHandler);
        }
        delete this._iconPath;
        delete this.wrapper;
        Widget.fn.destroy.call(this);
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'ToolBox')) {
    // Prevents loading several times in karma
    plugin(ToolBox);
}
