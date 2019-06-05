/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.toolbar';
// import assert from '../common/window.assert.es6';
// import CONSTANTS from '../common/window.constants.es6';
// import Logger from '../common/window.logger.es6';

const {
    isFunction,
    ui: { ToolBar }
} = window.kendo;

const MESSAGES = {};
const defaultTools = {};
const toolDefaults = [];

/**
 * BaseToolBar
 * @class BaseToolBar
 * @extends ToolBar
 */
const BaseToolBar = ToolBar.extend({
    init(element, options = {}) {
        const items = this._expandTools(
            options.tools ||
                BaseToolBar.prototype.options.tools[options.toolbarName]
        );
        Object.assign(options, { items });
        ToolBar.fn.init.call(this, element, options);
        const handleClick = this._click.bind(this);
        // this.element.addClass('k-spreadsheet-toolbar');
        this._addSeparators(this.element);
        const that = this;
        this.element.on('keydown', e => {
            let tool;
            if (e.keyCode === 9) {
                tool = that._nextTool(e.shiftKey ? -1 : 1);
                if (tool) {
                    document.activeElement.blur();
                    if ($(tool).is('.k-upload-button')) {
                        $(tool).addClass('k-state-focused');
                    }
                    if ($(tool).find('input').length) {
                        $(tool)
                            .find('input')
                            .focus();
                    } else {
                        tool.focus();
                    }
                    e.preventDefault();
                }
            }
        });
        this.element.on('focusout', function focusout() {
            $(this)
                .find('.k-toolbar-first-visible')
                .removeClass('k-state-focused');
        });
        this.bind({
            click: handleClick,
            toggle: handleClick
        });
    },
    _nextTool(direction) {
        const that = this;
        const tools = that.element.find(
            '.k-widget, .k-button, .k-button-group > a'
        );
        const activeIndex = tools.index(
            $(document.activeElement).closest(
                '.k-widget, .k-button, .k-button-group > a'
            )
        );
        let ret;
        if (activeIndex > 0) {
            ret = tools[activeIndex + direction];
        }
        return ret;
    },
    _addSeparators(element) {
        const groups = element.children(
            '.k-widget, a.k-button, .k-button-group'
        );
        groups.before('<span class="k-separator" />');
    },
    _expandTools(tools) {
        function expandTool(toolName) {
            const options = $.isPlainObject(toolName)
                ? toolName
                : toolDefaults[toolName] || {};
            const spriteCssClass = `k-icon k-i-${options.iconClass}`;
            const { type } = options;
            const typeDefaults = {
                button: { showText: 'overflow' },
                colorPicker: {
                    toolIcon: spriteCssClass,
                    spriteCssClass
                },
                borders: { spriteCssClass },
                alignment: { spriteCssClass },
                merge: { spriteCssClass },
                freeze: { spriteCssClass }
            };
            const tool = $.extend(
                {
                    name: options.name || toolName,
                    text: MESSAGES[options.name || toolName],
                    icon: options.iconClass,
                    attributes: {
                        title: MESSAGES[options.name || toolName],
                        'aria-label': MESSAGES[options.name || toolName]
                    }
                },
                typeDefaults[type],
                options
            );
            if (type === 'splitButton') {
                tool.menuButtons = tool.menuButtons.map(expandTool);
            }
            tool.attributes['data-tool'] = toolName;
            if (options.property) {
                tool.attributes['data-property'] = options.property;
            }
            return tool;
        }
        return tools.reduce(function reduce(all, tool) {
            if ($.isArray(tool)) {
                all.push({
                    type: 'buttonGroup',
                    buttons: tool.map(expandTool)
                });
            } else {
                all.push(expandTool.call(this, tool));
            }
            return all;
        }, []);
    },
    _click(e) {
        const toolName = e.target.attr('data-tool');
        const tool = toolDefaults[toolName] || {};
        const commandType = tool.command;
        if (!commandType) {
            return;
        }
        const args = {
            command: commandType,
            options: {
                property: tool.property || null,
                value: tool.value || null
            }
        };
        if (typeof args.options.value === 'boolean') {
            args.options.value = e.checked ? true : null;
        }
        this.action(args);
    },
    events: [
        'click',
        'toggle',
        'open',
        'close',
        'overflowOpen',
        'overflowClose',
        'action',
        'dialog'
    ],
    options: {
        name: 'StyleToolBar',
        resizable: true,
        tools: defaultTools
    },
    action(args) {
        this.trigger('action', args);
    },
    dialog(args) {
        this.trigger('dialog', args);
    },
    refresh(activeCell) {
        const range = activeCell;
        const tools = this._tools();
        function setToggle(tool, value) {
            const { toolbar } = tool;
            const { overflow } = tool;
            const togglable =
                (toolbar && toolbar.options.togglable) ||
                (overflow && overflow.options.togglable);
            if (!togglable) {
                return;
            }
            let toggle = false;
            if (typeof value === 'boolean') {
                toggle = value;
            } else if (typeof value === 'string') {
                if (
                    Object.prototype.hasOwnProperty.call(
                        toolbar.options,
                        'value'
                    )
                ) {
                    toggle = toolbar.options.value === value;
                } else {
                    toggle = value !== null;
                }
            }
            toolbar.toggle(toggle);
            if (overflow) {
                overflow.toggle(toggle);
            }
        }
        function update(tool, value) {
            const { toolbar } = tool;
            const { overflow } = tool;
            if (toolbar && toolbar.update) {
                toolbar.update(value);
            }
            if (overflow && overflow.update) {
                overflow.update(value);
            }
        }
        for (let i = 0; i < tools.length; i++) {
            const { property } = tools[i];
            const { tool } = tools[i];
            let value = isFunction(range[property]) ? range[property]() : range;
            if (property === 'gridLines') {
                value = range.sheet().showGridLines();
            }
            if (tool.type === 'button') {
                setToggle(tool, value);
            } else {
                update(tool, value);
            }
        }
        this.resize();
    },
    _tools() {
        return this.element
            .find('[data-property]')
            .toArray()
            .map(
                function map(element) {
                    const $element = $(element);
                    return {
                        property: $element.attr('data-property'),
                        tool: this._getItem($element)
                    };
                }.bind(this)
            );
    },
    destroy() {
        this.element.find('[data-command],.k-button').each(() => {
            const element = $(this);
            const instance = element.data('instance');
            if (instance && instance.destroy) {
                instance.destroy();
            }
        });
        ToolBar.fn.destroy.call(this);
    }
});
