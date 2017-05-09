/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.popup',
        './vendor/kendo/kendo.slider',
        './vendor/kendo/kendo.button',
        './vendor/kendo/kendo.colorpicker',
        './vendor/kendo/kendo.combobox',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.toolbar',
        './vendor/kendo/kendo.window'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Class = kendo.Class;
        var data = kendo.data;
        var ToolBar = kendo.ui.ToolBar;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.vectordrawing.toolbar');
        var NUMBER = 'number';
        var RX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        var RX_DASHTYPE = /^(dash|dashDot|dot|longDash|longDashDot|longDashDotDot|solid)$/;
        var RX_FONT = /^(normal\s+|italic\s+|oblique\s+|initial\s+|inherit\s+)?([0-9\.]+[a-z]+\s+)?(.+)$/;
        kendo.vectordrawing = { messages: {} };
        // TOOLS refers to the tools available in the toolbar
        var TOOLS = {
            SELECT: 'select',
            PEN: 'pen',
            LINE: 'line',
            // SHAPE: 'shape',
            CIRCLE: 'circle',
            RECT: 'rect',
            IMAGE: 'image',
            TEXT: 'text'
        };
        var TOOLBAR = [
            // Tools
            TOOLS.SELECT,
            TOOLS.PEN,
            TOOLS.LINE,
            // TOOLS.RECT, // TODO: Move underneath shape
            // TOOLS.CIRCLE, // TODO: Move underneath shape
            'shape',
            TOOLS.IMAGE,
            TOOLS.TEXT,
            // Configuration
            'fillColor',
            'strokeColor',
            'strokeWidth',
            'strokeDashes',
            // opacity // TODO
            [
                'bold',
                'italic'
            ],
            'fontSize',
            'fontFamily',
            // Commands
            'arrange',
            'grid',
            'remove'
        ];

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

            /**
             * Get the mouse (or touch) position
             * @param e
             * @param stage
             * @returns {{x: *, y: *}}
             */
            getMousePosition: function (e, stage) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                // See http://www.jacklmoore.com/notes/mouse-position/
                // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
                // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
                // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
                var originalEvent = e.originalEvent;
                var clientX = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientX : e.clientX;
                var clientY = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientY : e.clientY;
                // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
                // var stage = $(e.target).closest('.kj-stage').find(kendo.roleSelector('stage'));
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                var mouse = {
                    x: clientX - stageOffset.left + ownerDocument.scrollLeft(),
                    y: clientY - stageOffset.top + ownerDocument.scrollTop()
                };
                return mouse;
            },

            /**
             * Get the position of the center of an element
             * @param element
             * @param stage
             * @param scale
             */
            getElementCenter: function (element, stage, scale) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                assert.type(NUMBER, scale, kendo.format(assert.messages.type.default, 'scale', NUMBER));
                // We need getBoundingClientRect to especially account for rotation
                var rect = element[0].getBoundingClientRect();
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                return {
                    left: (rect.left - stageOffset.left + rect.width / 2  + ownerDocument.scrollLeft()) / scale,
                    top: (rect.top - stageOffset.top + rect.height / 2 + ownerDocument.scrollTop()) / scale
                };
            },

            /**
             * Get the scale of an element's CSS transformation
             * Note: the same function is used in kidoju.widgets.stage
             * @param element
             * @returns {Number|number}
             */
            getTransformScale: function (element) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                // element.css('transform') returns a matrix, so we have to read the style attribute
                var match = (element.attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
            }

        };

        /**
         * Be Careful: configDefaults are not the same for paths, plain shapes (rect, circle) and text
         * @type {{fill: {color: undefined}, font: {fontFamily: string, fontSize: number, fontStyle: string}, opacity: number, stroke: {color: string, dashType: string, width: number}}}
         */
        var configDefaults = {
            fill: {
                color: undefined
                // opacity: 1
            },
            font: {
                fontFamily: 'sans-serif',
                fontSize: 12,
                fontStyle: ''
            },
            opacity: 1,
            stroke: {
                color: '#000',
                dashType: 'solid',
                // lineCap: 'butt',
                // lineJoin: 'miter',
                // opacity: 1,
                width: 1
            }
        }

        /**
         * A Configuration class to represent the configuration that is bound to the toolbar and the selected shape
         * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing/text#configuration
         * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing/text#configuration
         */
        var Configuration = kendo.Observable.extend(
            kendo.deepExtend(
                configDefaults,
                {
                    /* This function's cyclomatic complexity is too high. */
                    /* jshint -W074 */

                    /**
                     * Parses an element configuration
                     * @param element
                     */
                    parse: function (element) {
                        this.fill.color = (element.options.fill && element.options.fill.color) || configDefaults.fill.color;
                        var matches = (element.options.font || '').match(RX_FONT);
                        if ($.isArray(matches)) {
                            this.font.fontFamily = (matches[3] || '').trim() || configDefaults.font.fontFamily;
                            this.font.fontSize = parseInt((matches[2] || '').trim(), 10) || configDefaults.font.fontSize;
                            this.font.fontStyle = (matches[1] || '').trim() || configDefaults.font.fontStyle;
                        } else {
                            this.font.fontFamily = configDefaults.font.fontFamily;
                            this.font.fontSize = configDefaults.font.fontSize;
                            this.font.fontStyle = configDefaults.font.fontStyle;
                        }
                        this.opacity = element.options.opacity || configDefaults.opacity;
                        this.stroke.color = (element.options.stroke && element.options.stroke.color) || configDefaults.stroke.color;
                        this.stroke.dashType = (element.options.stroke && element.options.stroke.dashType) || configDefaults.stroke.dashType;
                        this.stroke.width = (element.options.stroke && element.options.stroke.width) || configDefaults.stroke.width;
                    },

                    /**
                     * TODO we need a dataType parameter because path, image and text do not have the same configuration options.
                     * @returns {{}}
                     */
                    toJSON: function (/*TODO dataType*/) {
                        /* jshint maxcomplexity: 11 */

                        function normalizeFont(style, size, family) {
                            var ret;
                            ret = (style || '').trim();
                            ret = (ret + ' ' + (size || '')).trim() + 'px';
                            ret = (ret + ' ' + (family || '')).trim();
                            return ret;
                        }

                        var json = {};
                        // Fill color
                        if (RX_COLOR.test(this.fill.color)&& this.fill.color !== configDefaults.fill.color) {
                            json.fill = json.fill || {};
                            json.fill.color = this.fill.color;
                        }
                        // Font (only applies to text)
                        var font = normalizeFont(this.font.fontStyle, this.font.fontSize, this.font.fontFamily);
                        var defont = normalizeFont(configDefaults.font.fontStyle, configDefaults.font.fontSize, configDefaults.font.fontFamily);
                        if (font !== defont) {
                            json.font = font;
                        }
                        // Opacity
                        if ($.type(this.opacity) === NUMBER && this.opacity >= 0 && this.opacity < configDefaults.opacity) {
                            json.opacity = this.opacity;
                        }
                        // Stroke color (TODO: parse colors)
                        if (RX_COLOR.test(this.stroke.color)&& this.stroke.color !== configDefaults.stroke.color) {
                            json.stroke = json.stroke || {};
                            json.stroke.color = this.stroke.color;
                        }
                        // Stroke dashType
                        if (RX_DASHTYPE.test(this.stroke.dashType) && this.stroke.dashType !== configDefaults.stroke.dashType) {
                            json.stroke = json.stroke || {};
                            json.stroke.dashType = this.stroke.dashType;
                        }
                        // Stroke width
                        if ($.type(this.stroke.width) === NUMBER && this.stroke.width > 0 && this.stroke.width !== configDefaults.stroke.width) {
                            json.stroke = json.stroke || {};
                            json.stroke.width = this.stroke.width;
                        }
                        return json;
                    }

                    /* jshint +W074 */
                }
            )
        );

        var toolDefaults = {
            separator: { type: 'separator' },
            select: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: TOOLS.SELECT,
                iconClass: 'select',
                togglable: true
            },
            pen: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: TOOLS.PEN,
                iconClass: 'pencil',
                togglable: true
            },
            line: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: TOOLS.LINE,
                iconClass: 'shape-line',
                togglable: true
            },
            rect: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: TOOLS.RECT,
                iconClass: 'shape-rect',
                togglable: true
            }, // TODO: Move underneath shape
            circle: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: TOOLS.CIRCLE,
                iconClass: 'shape-circle',
                togglable: true
            }, // TODO: Move underneath shape
            shape: {
                type: 'shapeEx',
                iconClass: 'shape'
            },
            image: {
                type: 'dialogEx',
                dialogName: 'imageEx',
                // group: 'tool',
                iconClass: 'image-insert',
                overflow: 'never', // TODO: Review
                text: '' // TODO: Review
                // togglable: true
            },
            text: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: TOOLS.TEXT,
                iconClass: 'textbox',
                togglable: true
            },
            fillColor: {
                type: 'colorPickerEx',
                property: 'fillColor',
                iconClass: 'apply-format'
            },
            strokeColor: {
                type: 'colorPickerEx',
                property: 'strokeColor',
                iconClass: 'brush'
            },
            strokeWidth: {
                type: 'arrangeEx', // TODO
                iconClass: 'stroke-width'
            },
            strokeDashes: {
                type: 'arrangeEx', // TODO
                iconClass: 'stroke-dashes'
            },
            // TODO Opacity
            bold: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'bold',
                value: true,
                iconClass: 'bold',
                togglable: true
            },
            italic: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'italic',
                value: true,
                iconClass: 'italic',
                togglable: true
            },
            fontSize: {
                type: 'fontSizeEx',
                property: 'fontSize',
                iconClass: 'font-size'
            },
            fontFamily: {
                type: 'fontFamilyEx',
                property: 'fontFamily',
                iconClass: 'text'
            },
            arrange: {
                type: 'arrangeEx',
                iconClass: 'backward-element'
            },
            grid: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'tool',
                value: 'grid',
                iconClass: 'table',
                togglable: false
            },
            remove: {
                type: 'button',
                command: 'ToolbarRemoveCommand',
                iconClass: 'close'
            }
        };

        /*********************************************************************************
         * Commands
         *********************************************************************************/

        var Command = kendo.vectordrawing.Command = kendo.Class.extend({
            init: function (options) {
                this.options = options;
                this._workbook = options.workbook;
                this._property = options && options.property;
                this._state = {};
            },
            range: function (range) {
                if (range !== undefined) {
                    this._setRange(range);
                }
                return this._range;
            },
            _setRange: function (range) {
                this._range = range;
            },
            redo: function () {
                this.exec();
            },
            undo: function () {
                this.setState(this._state);
            },
            getState: function () {
                this._state = this.range().getState(this._property);
            },
            setState: function (state) {
                this.range().setState(state);
            },
            _forEachCell: function (callback) {
                var range = this.range();
                var ref = range._ref;
                ref.forEach(function (ref) {
                    range.sheet().forEach(ref.toRangeRef(), callback.bind(this));
                }.bind(this));
            }
        });
        var TargetValueCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
                this._target = options.target;
                this._value = options.value;
            },
            exec: function () {
                this.getState();
                this.setState(this._value);
            }
        });
        var PropertyChangeCommand = kendo.vectordrawing.PropertyChangeCommand = Command.extend({
            _setRange: function (range) {
                Command.prototype._setRange.call(this, range.skipHiddenCells());
            },
            init: function (options) {
                Command.fn.init.call(this, options);
                this._value = options.value;
            },
            exec: function () {
                var range = this.range();
                if (range.enable()) {
                    this.getState();
                    if (this.options.property === 'format') {
                        this._workbook.trigger('changeFormat', { range: range });
                    }
                    range[this._property](this._value);
                }
            }
        });



        /*********************************************************************************
         * VectorDrawingToolBar Widget
         *********************************************************************************/

        var TOOLBAR_MESSAGES = kendo.vectordrawing.messages.toolbar = {
            // Tools
            select: 'Select',
            pen: 'Pen',
            line: 'Line',
            rect: 'Rectangle', // TODO: Move underneath shape
            circle: 'Circle', // TODO: Move underneath shape
            shape: 'Shape',
            shapeButtons: {
                rect: 'Rectangle',
                circle: 'Circle',
                heart: 'Heart',
                star: 'Star'
            },
            image: 'Image',
            text: 'Text',
            // Configuration
            fillColor: 'Fill Color',
            strokeColor: 'Stroke Color',
            colorPalette: {
                apply: 'Apply',
                cancel: 'Cancel',
                reset: 'Reset color',
                customColor: 'Custom color...'
            },
            colorPicker: {
                reset: 'Reset color',
                customColor: 'Custom color...'
            },
            strokeWidth: 'Stroke Width',
            strokeType: 'Stroke Type',
            opacity: 'Opacity',
            bold: 'Bold',
            italic: 'Italic',
            fontSize: 'Font size',
            fontFamily: 'Font',
            // Commands
            arrange: 'Arrange',
            arrangeButtons: {
                bringToFront: 'Bring to Front',
                sendToBack: 'Sent to Back',
                bringForward: 'Bring Forward',
                sendBackward: 'Send backward'
            },
            grid: 'Grid',
            remove: 'Remove'
        };

        /**
         * VectorDrawingToolBar
         */
        var VectorDrawingToolBar = ToolBar.extend({
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || VectorDrawingToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar kj-vectordrawing-toolbar');
                this._addSeparators(this.element);
                this.bind({
                    click: handleClick,
                    toggle: handleClick
                });
            },
            _addSeparators: function (element) {
                var groups = element.children('.k-widget, a.k-button, .k-button-group');
                groups.before('<span class=\'k-separator\' />');
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            _expandTools: function (tools) {
                function expandTool(toolName) {
                    var options = $.isPlainObject(toolName) ? toolName : toolDefaults[toolName] || {};
                    var spriteCssClass = 'k-icon k-font-icon k-i-' + options.iconClass;
                    var type = options.type;
                    var typeDefaults = {
                        splitButton: { spriteCssClass: spriteCssClass },
                        button: { showText: 'overflow' },
                        colorPicker: { toolIcon: spriteCssClass }
                    };
                    var tool = $.extend({
                        name: options.name || toolName,
                        text: TOOLBAR_MESSAGES[options.name || toolName],
                        spriteCssClass: spriteCssClass,
                        attributes: { title: TOOLBAR_MESSAGES[options.name || toolName] }
                    }, typeDefaults[type], options);
                    if (type === 'splitButton') {
                        tool.menuButtons = tool.menuButtons.map(expandTool);
                    }
                    tool.attributes[kendo.attr('tool')] = toolName;
                    if (options.property) {
                        tool.attributes[kendo.attr('property')] = options.property;
                    }
                    return tool;
                }
                return tools.reduce(function (tools, tool) {
                    if ($.isArray(tool)) {
                        tools.push({
                            type: 'buttonGroup',
                            buttons: tool.map(expandTool)
                        });
                    } else {
                        tools.push(expandTool.call(this, tool));
                    }
                    return tools;
                }, []);
            },

            /* jshint +W074 */

            _click: function (e) {
                var toolName = e.target.attr(kendo.attr('tool'));
                var tool = toolDefaults[toolName] || {};
                var commandType = tool.command;
                if (!commandType) {
                    return;
                }
                var args = {
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
                name: 'VectorDrawingToolBar',
                resizable: true,
                tools: TOOLBAR
            },
            action: function (args) {
                this.trigger('action', args);
            },
            dialog: function (args) {
                this.trigger('dialog', args);
            },
            refresh: function (activeCell) { // TODO check kendo.vectordrawing.js to hook refresh method and replace activeCell with drawing element
                var range = activeCell;
                var tools = this._tools();
                function setToggle(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    var togglable = toolbar && toolbar.options.togglable || overflow && overflow.options.togglable;
                    if (!togglable) {
                        return;
                    }
                    var toggle = false;
                    if (typeof value === 'boolean') {
                        toggle = value;
                    } else if (typeof value === 'string') {
                        toggle = toolbar.options.value === value;
                    }
                    toolbar.toggle(toggle);
                    if (overflow) {
                        overflow.toggle(toggle);
                    }
                }
                function update(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    if (toolbar && toolbar.update) {
                        toolbar.update(value);
                    }
                    if (overflow && overflow.update) {
                        overflow.update(value);
                    }
                }
                for (var i = 0; i < tools.length; i++) {
                    var property = tools[i].property;
                    var tool = tools[i].tool;
                    var value = kendo.isFunction(range[property]) ? range[property]() : range;
                    if (property === 'gridLines') {
                        value = range.sheet().showGridLines();
                    }
                    if (tool.type === 'button') {
                        setToggle(tool, value);
                    } else {
                        update(tool, value);
                    }
                }
            },
            _tools: function () {
                return this.element.find('[' + kendo.attr('property') + ']').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr('data-property'),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },
            destroy: function () {
                this.element.find('[data-command],.k-button').each(function () {
                    var element = $(this);
                    var instance = element.data('instance');
                    if (instance && instance.destroy) {
                        instance.destroy();
                    }
                });
                ToolBar.fn.destroy.call(this);
            }
        });
        kendo.ui.plugin(VectorDrawingToolBar);

        /*********************************************************************************
         * VectorDrawingToolBar Tools
         *********************************************************************************/

        var DropDownTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var dropDownList = $('<select />').kendoDropDownList({ height: 'auto' }).data('kendoDropDownList');
                this.dropDownList = dropDownList;
                this.element = dropDownList.wrapper;
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                dropDownList.bind('open', this._open.bind(this));
                dropDownList.bind('change', this._change.bind(this));
                this.element.width(options.width).attr({
                    'data-command': 'PropertyChangeCommand',
                    'data-property': options.property
                });
            },
            _open: function () {
                var ddl = this.dropDownList;
                var list = ddl.list;
                var listWidth;
                list.css({
                    whiteSpace: 'nowrap',
                    width: 'auto'
                });
                listWidth = list.width();
                if (listWidth) {
                    listWidth += 20;
                } else {
                    listWidth = ddl._listWidth;
                }
                list.css('width', listWidth + kendo.support.scrollbar());
                ddl._listWidth = listWidth;
            },
            _change: function (e) {
                var instance = e.sender;
                var value = instance.value();
                var dataItem = instance.dataItem();
                var popupName = dataItem ? dataItem.popup : undefined;
                if (popupName) {
                    this.toolbar.dialog({ name: popupName });
                } else {
                    this.toolbar.action({
                        command: 'PropertyChangeCommand',
                        options: {
                            property: this.options.property,
                            value: value === 'null' ? null : value
                        }
                    });
                }
            },
            value: function (value) {
                if (value !== undefined) {
                    this.dropDownList.value(value);
                } else {
                    return this.dropDownList.value();
                }
            }
        });
        var PopupTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                this.element = $('<a href=\'#\' class=\'k-button k-button-icon\'>' + '<span class=\'' + options.spriteCssClass + '\'>' + '</span><span class=\'k-icon k-i-arrow-s\'></span>' + '</a>');
                this.element.on('click touchend', this.open.bind(this)).attr('data-command', options.command);
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                this._popup();
            },
            destroy: function () {
                this.popup.destroy();
            },
            open: function (ev) {
                ev.preventDefault();
                this.popup.toggle();
            },
            _popup: function () {
                var element = this.element;
                this.popup = $('<div class=\'k-spreadsheet-popup\' />').appendTo(element).kendoPopup({ anchor: element }).data('kendoPopup');
            }
        });
        var OverflowDialogButton = kendo.toolbar.OverflowButton.extend({
            init: function (options, toolbar) {
                kendo.toolbar.OverflowButton.fn.init.call(this, options, toolbar);
                this.element.on('click touchend', this._click.bind(this));
                this.message = this.options.text;
                var instance = this.element.data('button');
                this.element.data(this.options.type, instance);
            },
            _click: $.noop
        });

        /**
         * ShapeTool and ShapeButton
         */
        var ShapeTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'shapeEx',
                    keypad: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: 'TODO SVG Path',
                    iconClass: 'shape-rect',
                    text: TOOLBAR_MESSAGES.shapeButtons.rect
                },
                {
                    value: 'TODO SVG Path',
                    iconClass: 'shape-circle',
                    text: TOOLBAR_MESSAGES.shapeButtons.circle
                },
                {
                    value: 'TODO SVG Path',
                    iconClass: 'star-outline',
                    text: TOOLBAR_MESSAGES.shapeButtons.star
                },
                {
                    value: 'TODO SVG Path',
                    iconClass: 'heart-outline',
                    text: TOOLBAR_MESSAGES.shapeButtons.heart
                }
                // TODO: add roundRect, triangle, pentagon, hexagon, octogon, arrows, 3d shapes, ...
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarShapeCommand',
                    options: { value: value }
                });
            }
        });
        var ShapeButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'shapeEx' });
            }
        });
        kendo.toolbar.registerComponent('shapeEx', ShapeTool, ShapeButton);

        /**
         * Fill Color and Stroke Color
         */
        function withPreventDefault(f) {
            return function (e) {
                e.preventDefault();
                return f.apply(this, arguments);
            };
        }
        var ColorChooser = kendo.ui.Widget.extend({
            init: function (element, options) {
                kendo.ui.Widget.call(this, element, options);
                this.element = element;
                this.color = options.color;
                this._resetButton();
                this._colorPalette();
                this._customColorPalette();
                this._customColorButton();
                this.resetButton.on('click', withPreventDefault(this.resetColor.bind(this)));
                this.customColorButton.on('click', withPreventDefault(this.customColor.bind(this)));
            },
            options: { name: 'ColorChooser' },
            events: ['change'],
            destroy: function () {
                kendo.unbind(this.dialog.element.find('.k-action-buttons'));
                this.dialog.destroy();
                this.colorPalette.destroy();
                this.resetButton.off('click');
                this.customColorButton.off('click');
            },
            value: function (value) {
                if (value !== undefined) {
                    this.color = value;
                    this.customColorButton.find('.k-icon').css('background-color', this.color);
                    this.colorPalette.value(null);
                    this.flatColorPicker.value(this.color);
                } else {
                    return this.color;
                }
            },
            _change: function (value) {
                this.color = value;
                this.trigger('change', { value: value });
            },
            _colorPalette: function () {
                var element = $('<div />', { 'class': 'k-spreadsheet-color-palette' });
                var colorPalette = this.colorPalette = $('<div />').kendoColorPalette({
                    palette: [
                        '#ffffff',
                        '#000000',
                        '#d6ecff',
                        '#4e5b6f',
                        '#7fd13b',
                        '#ea157a',
                        '#feb80a',
                        '#00addc',
                        '#738ac8',
                        '#1ab39f',
                        '#f2f2f2',
                        '#7f7f7f',
                        '#a7d6ff',
                        '#d9dde4',
                        '#e5f5d7',
                        '#fad0e4',
                        '#fef0cd',
                        '#c5f2ff',
                        '#e2e7f4',
                        '#c9f7f1',
                        '#d8d8d8',
                        '#595959',
                        '#60b5ff',
                        '#b3bcca',
                        '#cbecb0',
                        '#f6a1c9',
                        '#fee29c',
                        '#8be6ff',
                        '#c7d0e9',
                        '#94efe3',
                        '#bfbfbf',
                        '#3f3f3f',
                        '#007dea',
                        '#8d9baf',
                        '#b2e389',
                        '#f272af',
                        '#fed46b',
                        '#51d9ff',
                        '#aab8de',
                        '#5fe7d5',
                        '#a5a5a5',
                        '#262626',
                        '#003e75',
                        '#3a4453',
                        '#5ea226',
                        '#af0f5b',
                        '#c58c00',
                        '#0081a5',
                        '#425ea9',
                        '#138677',
                        '#7f7f7f',
                        '#0c0c0c',
                        '#00192e',
                        '#272d37',
                        '#3f6c19',
                        '#750a3d',
                        '#835d00',
                        '#00566e',
                        '#2c3f71',
                        '#0c594f'
                    ],
                    value: this.color,
                    change: function (e) {
                        this.customColorButton.find('.k-icon').css('background-color', 'transparent');
                        this.flatColorPicker.value(null);
                        this._change(e.value);
                    }.bind(this)
                }).data('kendoColorPalette');
                element.append(colorPalette.wrapper).appendTo(this.element);
            },
            _customColorPalette: function () {
                var element = $('<div />', {
                    class: 'k-spreadsheet-window',
                    html: '<div></div>' + '<div class=\'k-action-buttons\'>' + '<button class=\'k-button k-primary\' data-bind=\'click: apply\'>' + TOOLBAR_MESSAGES.colorPalette.apply + '</button>' + '<button class=\'k-button\' data-bind=\'click: close\'>' + TOOLBAR_MESSAGES.colorPalette.cancel + '</button>' + '</div>'
                });
                var dialog = this.dialog = element.appendTo(document.body).kendoWindow({
                    animation: false,
                    scrollable: false,
                    resizable: false,
                    maximizable: false,
                    modal: true,
                    visible: false,
                    width: 268,
                    open: function () {
                        this.center();
                    }
                }).data('kendoWindow');
                dialog.one('activate', function () {
                    this.element.find('[data-role=flatcolorpicker]').data('kendoFlatColorPicker')._hueSlider.resize();
                });
                var flatColorPicker = this.flatColorPicker = dialog.element.children().first().kendoFlatColorPicker().data('kendoFlatColorPicker');
                var viewModel = kendo.observable({
                    apply: function () {
                        this.customColorButton.find('.k-icon').css('background-color', flatColorPicker.value());
                        this.colorPalette.value(null);
                        this._change(flatColorPicker.value());
                        dialog.close();
                    }.bind(this),
                    close: function () {
                        flatColorPicker.value(null);
                        dialog.close();
                    }
                });
                kendo.bind(dialog.element.find('.k-action-buttons'), viewModel);
            },
            _resetButton: function () {
                this.resetButton = $('<a class=\'k-button k-reset-color\' href=\'#\'>' + '<span class=\'k-icon k-i-reset-color\'></span>' + TOOLBAR_MESSAGES.colorPalette.reset + '</a>').appendTo(this.element);
            },
            _customColorButton: function () {
                this.customColorButton = $('<a class=\'k-button k-custom-color\' href=\'#\'>' + '<span class=\'k-icon\'></span>' + TOOLBAR_MESSAGES.colorPalette.customColor + '</a>').appendTo(this.element);
            },
            resetColor: function () {
                this.colorPalette.value(null);
                this.flatColorPicker.value(null);
                this._change(null);
            },
            customColor: function () {
                this.dialog.open();
            }
        });
        kendo.vectordrawing.ColorChooser = ColorChooser;
        var ColorPicker = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.popup.element.addClass('k-spreadsheet-colorpicker');
                this.colorChooser = new kendo.vectordrawing.ColorChooser(this.popup.element, { change: this._colorChange.bind(this) });
                this.element.attr({ 'data-property': options.property });
                this.element.data({
                    type: 'colorPickerEx',
                    colorPicker: this,
                    instance: this
                });
            },
            destroy: function () {
                this.colorChooser.destroy();
                PopupTool.fn.destroy.call(this);
            },
            update: function (value) {
                this.value(value);
            },
            value: function (value) {
                this.colorChooser.value(value);
            },
            _colorChange: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    options: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
                this.popup.close();
            }
        });
        var ColorPickerButton = OverflowDialogButton.extend({
            init: function (options, toolbar) {
                options.iconName = 'text';
                OverflowDialogButton.fn.init.call(this, options, toolbar);
            },
            _click: function () {
                this.toolbar.dialog({
                    name: 'colorPickerEx',
                    options: {
                        title: this.options.property,
                        property: this.options.property
                    }
                });
            }
        });
        kendo.toolbar.registerComponent('colorPickerEx', ColorPicker, ColorPickerButton);

        /**
         * Stroke Width
         */
        // TODO: Displays a popup with a list of images and a textbox representing stroke widths
        // See

        /**
         * Stroke Dash Type
         */
        // TODO: Displays a popup with a list of images representing dash types
        // see http://docs.telerik.com/kendo-ui/api/javascript/drawing/stroke-options#fields-dashType

        /**
         * Opacity
         */
        // TODO Display a popup with a slider from 0 to 100% to represent opacity
        // see http://docs.telerik.com/kendo-ui/api/javascript/drawing/element#methods-opacity

        /**
         * Font Sizes
         */
        var FONT_SIZES = [
            24,
            26,
            28,
            36,
            48,
            56,
            64,
            72,
            96,
            112,
            128,
            144,
            192
        ];
        var FontSize = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var comboBox = $('<input />').kendoComboBox({
                    change: this._valueChange.bind(this),
                    clearButton: false,
                    dataSource: options.fontSizes || FONT_SIZES,
                    value: configDefaults.font.fontSize
                }).data('kendoComboBox');
                this.comboBox = comboBox;
                this.element = comboBox.wrapper;
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                this.element.width(options.width).attr({
                    'data-command': 'PropertyChangeCommand',
                    'data-property': options.property
                });
                this.element.data({
                    type: 'fontSizeEx',
                    fontSize: this
                });
            },
            _valueChange: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    options: {
                        property: this.options.property,
                        value: kendo.parseInt(e.sender.value())
                    }
                });
            },
            update: function (value) {
                this.value(kendo.parseInt(value) || configDefaults.font.fontSize);
            },
            value: function (value) {
                if (value !== undefined) {
                    this.comboBox.value(value);
                } else {
                    return this.comboBox.value();
                }
            }
        });
        var FontSizeButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({
                    name: 'fontSizeEx',
                    options: {
                        sizes: FONT_SIZES,
                        defaultSize: configDefaults.font.fontSize
                    }
                });
            },
            update: function (value) {
                this._value = value || configDefaults.font.fontSize;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('fontSizeEx', FontSize, FontSizeButton);

        /**
         * Font Families
         */
        var FONT_FAMILIES = [
            'Arial',
            'Courier New',
            'Georgia',
            'Times New Roman',
            'Trebuchet MS',
            'Verdana'
        ];
        var FontFamily = DropDownTool.extend({
            init: function (options, toolbar) {
                DropDownTool.fn.init.call(this, options, toolbar);
                var ddl = this.dropDownList;
                ddl.setDataSource(options.fontFamilies || FONT_FAMILIES);
                ddl.value(configDefaults.font.fontFamily);
                this.element.data({
                    type: 'fontFamily',
                    fontFamily: this
                });
            },
            update: function (value) {
                this.value(value || configDefaults.font.fontFamily);
            }
        });
        var FontFamilyButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({
                    name: 'fontFamilyEx',
                    options: {
                        fonts: FONT_FAMILIES,
                        defaultFont: configDefaults.font.fontFamily
                    }
                });
            },
            update: function (value) {
                this._value = value || configDefaults.font.fontFamily;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('fontFamilyEx', FontFamily, FontFamilyButton);

        /**
         * Arrange (send to back, bring forward)
         */
        var ArrangeTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'arrangeEx',
                    keypad: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: 'front',
                    iconClass: 'front-element',
                    text: TOOLBAR_MESSAGES.arrangeButtons.bringToFront
                },
                {
                    value: 'back',
                    iconClass: 'back-element',
                    text: TOOLBAR_MESSAGES.arrangeButtons.sendToBack
                },
                {
                    value: 'forward',
                    iconClass: 'forward-element',
                    text: TOOLBAR_MESSAGES.arrangeButtons.bringForward
                },
                {
                    value: 'backward',
                    iconClass: 'backward-element',
                    text: TOOLBAR_MESSAGES.arrangeButtons.sendBackward
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarArrangeCommand',
                    options: { value: value }
                });
            }
        });
        var ArrangeButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'arrangeEx' });
            }
        });
        kendo.toolbar.registerComponent('arrangeEx', ArrangeTool, ArrangeButton);

        /**
         * Grid (Snapping)
         */
        // TODO Displays a popup with 0px (no grid), 10px, 25px and 50px options
        // This is the same as the ArrangeTool with different icons

        /*********************************************************************************
         * VectorDrawingToolBar Dialogs
         *********************************************************************************/

        var DIALOG_MESSAGES = kendo.vectordrawing.messages.dialogs = {
            apply: 'Apply',
            save: 'Save',
            cancel: 'Cancel',
            remove: 'Remove',
            retry: 'Retry',
            revert: 'Revert',
            okText: 'OK',
            imageDialog: {
                title: 'Image',
                labels: {
                    text: 'Text',
                    url: 'Address',
                    removeLink: 'Remove link'
                }
            },
            shapeDialog: {
                title: 'Shapes',
                buttons: {
                    rect: 'Rect',
                    circle: 'Circle',
                    star5: 'Star 5',
                    heart: 'Heart'
                }
            },
            fontFamilyDialog: {
                title: 'Font'
            },
            fontSizeDialog: {
                title: 'Font size'
            },
            arrangeDialog: {
                title: 'Arrange',
                buttons: {
                    bringToFront: 'Bring to Front',
                    sendToBack: 'Sent to Back',
                    bringForward: 'Bring Forward',
                    sendBackward: 'Send backward'
                }
            }
        };

        /**
         * Dialog registry
         * @type {{}}
         */
        var registry = {};
        kendo.vectordrawing.dialogs = {
            register: function (name, dialogClass) {
                registry[name] = dialogClass;
            },
            registered: function (name) {
                return !!registry[name];
            },
            create: function (name, options) {
                var DialogClass = registry[name];
                if (DialogClass) {
                    return new DialogClass(options);
                }
            }
        };

        /**
         * Generic dialog registration with toolbar
         */
        kendo.toolbar.registerComponent('dialogEx', kendo.toolbar.ToolBarButton.extend({
            init: function (options, toolbar) {
                kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
                this._dialogName = options.dialogName;
                this.element.bind('click touchend', this.open.bind(this)).data('instance', this);
            },
            open: function () {
                this.toolbar.dialog({ name: this._dialogName });
            }
        }));

        /**
         * VectorDrawingDialog base class
         */
        var VectorDrawingDialog = kendo.vectordrawing.VectorDrawingDialog = kendo.Observable.extend({
            init: function (options) {
                kendo.Observable.fn.init.call(this, options);
                this.options = $.extend(true, {}, this.options, options);
                this.bind(this.events, options);
            },
            events: [
                'close',
                'activate'
            ],
            options: { autoFocus: true },
            dialog: function () {
                if (!this._dialog) {
                    this._dialog = $('<div class=\'k-spreadsheet-window k-action-window\' />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
                        messages: kendo.vectordrawing.messages.dialogs || DIALOG_MESSAGES,
                        errors: this.options.errors
                    })).appendTo(document.body).kendoWindow({
                        autoFocus: this.options.autoFocus,
                        scrollable: false,
                        resizable: false,
                        modal: true,
                        visible: false,
                        width: this.options.width || 320,
                        title: this.options.title,
                        open: function () {
                            this.center();
                        },
                        close: this._onDialogClose.bind(this),
                        activate: this._onDialogActivate.bind(this),
                        deactivate: this._onDialogDeactivate.bind(this)
                    }).data('kendoWindow');
                }
                return this._dialog;
            },
            _onDialogClose: function () {
                this.trigger('close', { action: this._action });
            },
            _onDialogActivate: function () {
                this.trigger('activate');
            },
            _onDialogDeactivate: function () {
                this.trigger('deactivate');
                this.destroy();
            },
            destroy: function () {
                if (this._dialog) {
                    this._dialog.destroy();
                    this._dialog = null;
                }
            },
            open: function () {
                this.dialog().open();
            },
            apply: function () {
                this.close();
            },
            close: function () {
                this._action = 'close';
                this.dialog().close();
            }
        });

        /**
         * Shape
         */
        var ShapeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.shapeDialog || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            value: 'TODO SVG Path',
                            iconClass: 'shape-rect',
                            text: messages.buttons.rect
                        },
                        {
                            value: 'TODO SVG Path',
                            iconClass: 'shape-circle',
                            text: messages.buttons.circle
                        },
                        {
                            value: 'TODO SVG Path',
                            iconClass: 'star-outline',
                            text: messages.buttons.star
                        },
                        {
                            value: 'TODO SVG Path',
                            iconClass: 'heart-outline',
                            text: messages.buttons.heart
                        }
                        // TODO: add roundRect, triangle, pentagon, hexagon, octogon, arrows, 3d shapes, ...
                    ]
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarShapeCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('shapeEx', ShapeDialog);

        /**
         * Image
         */
        var ImageDialog = VectorDrawingDialog.extend({
            options: {
                // template: '<div class=\'k-edit-label\'><label>#: messages.imageDialog.labels.url #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button style=\'float: left\' class=\'k-button\' data-bind=\'click: remove\'>#= messages.imageDialog.labels.removeLink #</button>' + '<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                template: '<div class=\'k-edit-label\'><label>#: messages.imageDialog.labels.url #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.imageDialog.title,
                autoFocus: false
            },
            open: function (url) { // TODO: url especially for edit mode
                var self = this;
                VectorDrawingDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    url: 'https://cdn.kidoju.com/s/en/570cc7f46d1dd91900729417/image.png', // TODO url,
                    // url: 'http://localhost:63342/Kidoju.Widgets/test/data/images/miscellaneous/Elvis.jpg',
                    apply: function () {
                        if (!/\S/.test(model.url)) {
                            model.url = null;
                        }
                        self.trigger('action', {
                            command: 'ToolbarImageCommand',
                            options: { url: model.url }
                        });
                        self.close();
                    },
                    /*
                    remove: function () {
                        model.url = null;
                        model.apply();
                    },
                    */
                    cancel: self.close.bind(self)
                });
                kendo.bind(element, model);
                element.find('input').focus().on('keydown', function (ev) {
                    if (ev.keyCode === 13) {
                        model.url = $(this).val();
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.apply();
                    } else if (ev.keyCode === 27) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.cancel();
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('imageEx', ImageDialog);

        /**
         * Fill and Stroke Colors
         */
        var ColorChooserDialog = VectorDrawingDialog.extend({
            init: function (options) {
                VectorDrawingDialog.fn.init.call(this, options);
                this.element = this.dialog().element;
                this.property = options.property;
                this.options.title = options.title;
                this.viewModel = kendo.observable({
                    apply: this.apply.bind(this),
                    close: this.close.bind(this)
                });
                kendo.bind(this.element.find('.k-action-buttons'), this.viewModel);
            },
            options: { template: '<div></div>' + '<div class=\'k-action-buttons\'>' + '<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#: messages.apply #</button>' + '<button class=\'k-button\' data-bind=\'click: close\'>#: messages.cancel #</button>' + '</div>' },
            apply: function () {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    options: {
                        property: this.property,
                        value: this.value()
                    }
                });
            },
            value: function (e) {
                if (e === undefined) {
                    return this._value;
                } else {
                    this._value = e.value;
                }
            }
        });
        var ColorPickerDialog = ColorChooserDialog.extend({
            init: function (options) {
                options.width = 177;
                ColorChooserDialog.fn.init.call(this, options);
                this._colorPalette();
            },
            _colorPalette: function () {
                var element = this.dialog().element.find('div:first');
                this.colorPalette = element.kendoColorPalette({
                    palette: [
                        '#ffffff',
                        '#000000',
                        '#d6ecff',
                        '#4e5b6f',
                        '#7fd13b',
                        '#ea157a',
                        '#feb80a',
                        '#00addc',
                        '#738ac8',
                        '#1ab39f',
                        '#f2f2f2',
                        '#7f7f7f',
                        '#a7d6ff',
                        '#d9dde4',
                        '#e5f5d7',
                        '#fad0e4',
                        '#fef0cd',
                        '#c5f2ff',
                        '#e2e7f4',
                        '#c9f7f1',
                        '#d8d8d8',
                        '#595959',
                        '#60b5ff',
                        '#b3bcca',
                        '#cbecb0',
                        '#f6a1c9',
                        '#fee29c',
                        '#8be6ff',
                        '#c7d0e9',
                        '#94efe3',
                        '#bfbfbf',
                        '#3f3f3f',
                        '#007dea',
                        '#8d9baf',
                        '#b2e389',
                        '#f272af',
                        '#fed46b',
                        '#51d9ff',
                        '#aab8de',
                        '#5fe7d5',
                        '#a5a5a5',
                        '#262626',
                        '#003e75',
                        '#3a4453',
                        '#5ea226',
                        '#af0f5b',
                        '#c58c00',
                        '#0081a5',
                        '#425ea9',
                        '#138677',
                        '#7f7f7f',
                        '#0c0c0c',
                        '#00192e',
                        '#272d37',
                        '#3f6c19',
                        '#750a3d',
                        '#835d00',
                        '#00566e',
                        '#2c3f71',
                        '#0c594f'
                    ],
                    change: this.value.bind(this)
                }).data('kendoColorPalette');
            }
        });
        kendo.vectordrawing.dialogs.register('colorPickerEx', ColorPickerDialog);
        /*
        var CustomColorDialog = ColorChooserDialog.extend({
            init: function (options) {
                options.width = 268;
                ColorChooserDialog.fn.init.call(this, options);
                this.dialog().setOptions({ animation: false });
                this.dialog().one('activate', this._colorPicker.bind(this));
            },
            _colorPicker: function () {
                var element = this.dialog().element.find('div:first');
                this.colorPicker = element.kendoFlatColorPicker({ change: this.value.bind(this) }).data('kendoFlatColorPicker');
            }
        });
        kendo.vectordrawing.dialogs.register('customColor', CustomColorDialog);
        */

        /**
         * Stroke Width
         */
        // TODO: Displays a popup with a list of images and a textbox representing stroke widths
        // See

        /**
         * Stroke Dash Type
         */
        // TODO: Displays a popup with a list of images representing dash types
        // see http://docs.telerik.com/kendo-ui/api/javascript/drawing/stroke-options#fields-dashType

        /**
         * Opacity
         */
        // TODO Display a popup with a slider from 0 to 100% to represent opacity
        // see http://docs.telerik.com/kendo-ui/api/javascript/drawing/element#methods-opacity

        /**
         * Font Size
         */
        var FontSizeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.fontSizeDialog || DIALOG_MESSAGES;
                VectorDrawingDialog.fn.init.call(this, $.extend({ title: messages.title }, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                var sizes = this.options.sizes;
                var defaultSize = this.options.defaultSize;
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: sizes }),
                    template: '#: data #',
                    value: defaultSize,
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    options: {
                        property: 'fontSize',
                        value: kendo.parseInt(e.sender.value()[0])
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('fontSizeEx', FontSizeDialog);

        /**
         * Font Family
         */
        var FontFamilyDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.fontFamilyDialog || DIALOG_MESSAGES;
                VectorDrawingDialog.fn.init.call(this, $.extend({ title: messages.title }, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                var fonts = this.options.fonts;
                var defaultFont = this.options.defaultFont;
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: fonts }),
                    template: '#: data #',
                    value: defaultFont,
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    options: {
                        property: 'fontFamily',
                        value: e.sender.value()[0]
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('fontFamilyEx', FontFamilyDialog);

        /**
         * Arrange
         */
        var ArrangeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.arrangeDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            property: 'arrange',
                            value: 'front',
                            iconClass: 'front-element',
                            text: messages.buttons.bringToFront
                        },
                        {
                            property: 'arrange',
                            value: 'back',
                            iconClass: 'back-element',
                            text: messages.buttons.sendToBack
                        },
                        {
                            property: 'arrange',
                            value: 'forward',
                            iconClass: 'forward-element',
                            text: messages.buttons.bringForward
                        },
                        {
                            property: 'arrange',
                            value: 'backward',
                            iconClass: 'backward-element',
                            text: messages.buttons.sendBackward
                        }
                    ]
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarArrangeCommand',
                    options: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('arrangeEx', ArrangeDialog);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
