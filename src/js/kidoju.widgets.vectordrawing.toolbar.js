/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.popup',
        './vendor/kendo/kendo.slider',
        './vendor/kendo/kendo.button',
        './vendor/kendo/kendo.colorpicker',
        './vendor/kendo/kendo.combobox',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.toolbar',
        './vendor/kendo/kendo.window',
        './vendor/kendo/kendo.dataviz.diagram',
        './common/window.assert.es6',
        './common/window.logger.es6',
        './kidoju.image'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kidoju = window.kidoju;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.vectordrawing.toolbar');
        var kendo = window.kendo;
        var deepExtend = kendo.deepExtend;
        var isFunction = kendo.isFunction;
        var getDataUriAndSize = kidoju.image.getDataUriAndSize;
        var DataSource = kendo.data.DataSource;
        var ToolBar = kendo.ui.ToolBar;
        var StaticList = kendo.ui.StaticList;
        var dataviz = kendo.dataviz;
        var Connection = kendo.dataviz.diagram.Connection;
        var Shape = kendo.dataviz.diagram.Shape;
        // var UNDEFINED = 'undefined';
        var BOOLEAN = 'boolean';
        var NUMBER = 'number';
        var STRING = 'string';
        var RX_FILE_ID = /^[\w]{3,50}$/;
        // var RX_DASHTYPE = /^(dash|dashDot|dot|longDash|longDashDot|longDashDotDot|solid)$/;
        // var RX_FONT = /^(normal\s+|italic\s+|oblique\s+|initial\s+|inherit\s+)?([0-9\.]+[a-z]+\s+)?(.+)$/;
        kendo.vectordrawing = { messages: {}};
        var TOOLBAR = [
            'new',
            'open',
            'save',
            // Tools
            'select',
            'pen',
            'line',
            'shape',
            'image',
            'text',
            // Configuration
            'fillColor',
            'opacity',
            'strokeColor',
            'strokeWidth',
            'strokeDashType',
            'startCapType',
            'endCapType',
            [
                'fontWeight',
                'fontStyle'
            ],
            /* 'fontSize', // Not sure we actually need it? */
            'fontFamily',
            // Commands
            'arrange',
            'remove',
            'background',
            'guides'
        ];

        /*********************************************************************************
         * Mixins
         *********************************************************************************/

        /**
         * DiagramElementMixIn for toolbar refresh method
         * @type {{extend: extend, features: features, fillColor: fillColor, opacity: opacity, strokeColor: strokeColor, strokeWidth: strokeWidth, strokeDashType: strokeDashType, startCap: startCap, endCap: endCap, fontWeight: fontWeight, fontStyle: fontStyle, fontSize: fontSize, fontFamily: fontFamily}}
         */
        var DiagramElementMixIn = {
            extend: function (proto) {
                if (!proto.select || !proto.redraw) {
                    throw new Error('Mixin target is not a kendo.dataviz.diagram.DrawingElement.');
                }
                proto.features = this.features;
                proto.fillColor = this.fillColor;
                proto.opacity = this.opacity;
                proto.strokeColor = this.strokeColor;
                proto.strokeWidth = this.strokeWidth;
                proto.strokeDashType = this.strokeDashType;
                proto.startCapType = this.startCapType;
                proto.endCapType = this.endCapType;
                proto.fontWeight = this.fontWeight;
                proto.fontStyle = this.fontStyle;
                proto.fontSize = this.fontSize;
                proto.fontFamily = this.fontFamily;
            },
            features: function () {
                var isConnection = this instanceof Connection;
                var isShape = this instanceof Shape;
                var hasFill = isShape && this.type.toLowerCase() !== 'image';
                var hasStroke = isConnection || hasFill;
                var hasCap = isConnection;
                var hasFont = isShape && this.type.toLowerCase() === 'text';
                return {
                    fillColor: hasFill,
                    opacity: hasFill, // isShape if applicable to images
                    strokeColor: hasStroke,
                    strokeWidth: hasStroke,
                    strokeDashType: hasStroke,
                    startCapType: hasCap,
                    endCapType: hasCap,
                    fontWeight: hasFont,
                    fontStyle: hasFont,
                    fontSize: hasFont,
                    fontFamily: hasFont
                };
            },
            fillColor: function () {
                return this.options.fill && this.options.fill.color;
            },
            opacity: function () {
                return this.options.fill && this.options.fill.opacity;
            },
            strokeColor: function () {
                return this.options.stroke && this.options.stroke.color;
            },
            strokeWidth: function () {
                return this.options.stroke && this.options.stroke.width;
            },
            strokeDashType: function () {
                return this.options.stroke && this.options.stroke.dashType;
            },
            startCapType: function () {
                return this.options.startCap && this.options.startCap.type;
            },
            endCapType: function () {
                return this.options.endCap && this.options.endCap.type;
            },
            // Consider content.color
            fontWeight: function () {
                return this.options.content && this.options.content.fontWeight;
            },
            fontStyle: function () {
                return this.options.content && this.options.content.fontStyle;
            },
            fontSize: function () {
                return this.options.content && this.options.content.fontSize;
            },
            fontFamily: function () {
                return this.options.content && this.options.content.fontFamily;
            }
            // See VectorDrawing._onPropertyChange for applying toolbar values to a shape or connection
        };
        // DiagramElementMixIn.extend(kendo.dataviz.diagram.DiagramElement); // The base class is not public, so we have to do
        DiagramElementMixIn.extend(Connection.fn);
        DiagramElementMixIn.extend(Shape.fn);

        /*********************************************************************************
         * VectorDrawingToolBar Widget
         *********************************************************************************/

        var toolDefaults = {
            separator: { type: 'separator' },
            new: {
                type: 'button',
                command: 'ToolbarNewCommand',
                overflow: 'never',
                iconClass: 'file'
            },
            open: {
                type: 'button',
                command: 'ToolbarOpenCommand',
                overflow: 'never',
                iconClass: 'folder-open'
            },
            save: {
                // type: 'button',
                // command: 'ToolbarSaveCommand',
                // overflow: 'never',
                // iconClass: 'save'
                type: 'vectorDialog',
                dialogName: 'vectorSave',
                iconClass: 'save',
                overflow: 'never', // TODO: Review as commenting raises `component.overflow is not a constructor`
                text: false
                // group: 'tool',
                // togglable: true
            },
            // Cut, Copy, Paste
            select: {
                type: 'button',
                command: 'DrawingToolChangeCommand',
                property: 'tool',
                value: undefined, // !Important
                iconClass: 'select',
                group: 'tool',
                togglable: true
            },
            pen: {
                type: 'button',
                command: 'DrawingToolChangeCommand',
                property: 'tool',
                value: 'PenTool',
                iconClass: 'pencil',
                group: 'tool',
                togglable: true
            },
            line: {
                type: 'button',
                command: 'DrawingToolChangeCommand',
                property: 'tool',
                value: 'PolylineTool',
                iconClass: 'shape-line',
                group: 'tool',
                togglable: true
            },
            shape: {
                type: 'vectorShape',
                iconClass: 'shape'
                // TODO It would be nice to make it togglable as part of the tools group
            },
            image: {
                type: 'vectorDialog',
                dialogName: 'vectorImage',
                iconClass: 'image-insert',
                overflow: 'never', // TODO: Review as commenting raises `component.overflow is not a constructor`
                text: false,
                group: 'tool',
                togglable: true
            },
            text: {
                type: 'vectorDialog',
                dialogName: 'vectorText',
                iconClass: 'edit-tools',
                overflow: 'never', // TODO: Review as commenting raises `component.overflow is not a constructor`
                text: false,
                group: 'tool',
                togglable: true
            },
            fillColor: {
                type: 'vectorColorPicker',
                property: 'fillColor',
                iconClass: 'apply-format'
            },
            opacity: {
                type: 'vectorOpacity',
                property: 'opacity',
                iconClass: 'greyscale'
            },
            strokeColor: {
                type: 'vectorColorPicker',
                property: 'strokeColor',
                iconClass: 'brush'
            },
            strokeWidth: {
                type: 'vectorStrokeWidth',
                property: 'strokeWidth',
                iconClass: 'stroke-width'
            },
            strokeDashType: {
                type: 'vectorStrokeDashType',
                property: 'strokeDashType',
                iconClass: 'stroke-dashes'
            },
            startCapType: {
                type: 'vectorStartCapType',
                property: 'startCapType',
                iconClass: 'arrow-left'
            },
            endCapType: {
                type: 'vectorEndCapType',
                property: 'endCapType',
                iconClass: 'arrow-right'
            },
            fontWeight: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'fontWeight',
                value: true,
                iconClass: 'bold',
                togglable: true
            },
            fontStyle: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'fontStyle',
                value: true,
                iconClass: 'italic',
                togglable: true
            },
            fontSize: {
                type: 'vectorFontSize',
                property: 'fontSize',
                iconClass: 'font-size',
                value: 12
            },
            fontFamily: {
                type: 'vectorFontFamily',
                property: 'fontFamily',
                iconClass: 'font-family',
                value: 'Arial'
            },
            arrange: {
                type: 'vectorArrange',
                iconClass: 'backward-element'
            },
            background: {
                type: 'vectorColorPicker',
                property: 'background',
                iconClass: 'paint'
            },
            guides: {
                type: 'vectorGuides',
                property: 'guides',
                iconClass: 'image-absolute-position'
            },
            remove: {
                type: 'button',
                command: 'ToolbarRemoveCommand',
                iconClass: 'delete'
            }
        };
        var TOOLBAR_MESSAGES = kendo.vectordrawing.messages.toolbar = {
            new: 'New',
            open: 'Open',
            save: 'Save',
            // Tools
            select: 'Select',
            pen: 'Pen',
            line: 'Line',
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
            opacity: 'Opacity',
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
            strokeDashType: 'Dash Type',
            strokeDashTypeButtons: {
                dash: 'dash',
                dashDot: 'dash-dot',
                dot: 'dot',
                longDash: 'long-dash',
                longDashDot: 'long-dash dot',
                longDashDotDot:	'long-dash dot-dot',
                solid: 'solid'
            },
            startCapType: 'Start Cap',
            startCapTypeButtons: {
                none: 'None',
                arrow: 'Arrow',
                circle: 'Circle'
            },
            endCapType: 'End Cap',
            endCapTypeButtons: {
                none: 'None',
                arrow: 'Arrow',
                circle: 'Circle'
            },
            fontWeight: 'Bold',
            fontStyle: 'Italic',
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
            background: 'Background',
            guides: 'Guides',
            remove: 'Remove'
        };

        /**
         * VectorDrawingToolBar
         */
        var VectorDrawingToolBar = ToolBar.extend({

            /**
             * Initialization
             * @param element
             * @param options
             */
            init: function (element, options) {
                options = options || {};
                // BEGIN Add configuration defaults
                options.connectionDefaults = this._copyConnectionDefaults(options.connectionDefaults);
                options.shapeDefaults = this._copyShapeDefaults(options.shapeDefaults);
                this._resetConfiguration();
                // END Add configuration defaults
                options.items = this._expandTools(options.tools || VectorDrawingToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar kj-vectordrawing-toolbar');
                this._addSeparators(this.element);
                this._resetFileInput();
                this.bind({
                    click: handleClick,
                    toggle: handleClick
                });
                logger.info({ method: 'init', message: 'widget initialized' });
            },

            /**
             * Copy connection defaults from VectorDrawing widget
             * @param defaults
             * @returns {{}}
             * @private
             */
            _copyConnectionDefaults: function (defaults) {
                var ret = {};
                // ret.content = defaults.content; // Not used
                ret.endCap = defaults.endCap;
                // ret.hover = defaults.hover; // Not used
                ret.stroke = defaults.stroke;
                ret.startCap = defaults.startCap;
                return ret;
            },

            /**
             * Copy shape defaults from VectorDrawing widget
             * @param defaults
             * @returns {{}}
             * @private
             */
            _copyShapeDefaults: function (defaults) {
                var ret = {};
                ret.content = defaults.content;
                ret.fill = defaults.fill;
                // ret.hover = defaults.hover; // Not used
                ret.stroke = defaults.stroke;
                return ret;
            },

            /**
             * Add separators
             * @param element
             * @private
             */
            _addSeparators: function (element) {
                var groups = element.children('.k-widget, a.k-button, .k-button-group');
                groups.before('<span class="k-separator" />');
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Layout the toolbar
             * @param tools
             * @private
             */
            _expandTools: function (tools) {
                function expandTool(toolName) {
                    var options = $.isPlainObject(toolName) ? toolName : toolDefaults[toolName] || {};
                    var spriteCssClass = 'k-icon k-i-' + options.iconClass;
                    var type = options.type;
                    var typeDefaults = {
                        button: { showText: 'overflow' },
                        splitButton: { spriteCssClass: spriteCssClass },
                        colorPicker: {
                            toolIcon: spriteCssClass,
                            spriteCssClass: spriteCssClass
                        }
                    };
                    var tool = $.extend({
                        name: options.name || toolName,
                        text: TOOLBAR_MESSAGES[options.name || toolName],
                        icon: options.iconClass,
                        spriteCssClass: spriteCssClass,
                        attributes: {
                            title: TOOLBAR_MESSAGES[options.name || toolName],
                            'aria-label': TOOLBAR_MESSAGES[options.name || toolName]
                        }
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

            /**
             * Aad file input button with opacity 0 on top of open button (assuming it exists)
             * @private
             */
            _resetFileInput: function () {
                var that = this;
                // Check for the open button
                var openButton = this.element.children('a[data-tool="open"]');
                if (openButton.length === 1) {
                    var openButtonPos = openButton.position();
                    openButton.prop('tabindex', -1);
                    var form;
                    if (this.fileInput instanceof $) {
                        form = this.fileInput.parent();
                        this.fileInput.off().remove();
                    } else {
                        form = $('<form></form>')
                            .append(this.fileInput)
                            // Position the form with a file input on top of the openButton
                            // So that clicking the openButton actually clicks the transparent file input
                            // to show an open file dialog
                            .css({
                                position: 'absolute',
                                top: openButtonPos.top,
                                left: openButtonPos.left,
                                opacity: 0,
                                overflow: 'hidden'
                            })
                            // Account for padding
                            .outerHeight(openButton.outerHeight())
                            .outerWidth(openButton.outerWidth())
                            .insertAfter(openButton)
                            // Change the state of the covered openButton
                            .hover(function (e) {
                                openButton.toggleClass('k-state-hover', e.type === 'mouseenter');
                            })
                            .mousedown(function () {
                                openButton.addClass('k-state-active');
                            })
                            .mouseup(function () {
                                openButton.removeClass('k-state-active');
                            });
                    }
                    // At this stage, we have an empty form
                    this.fileInput = $('<input type="file" style="font-size:' + openButton.height() + 'px">')
                        .appendTo(form)
                        .change(function (e) {
                            that.trigger('action', {
                                command: 'ToolbarOpenCommand',
                                params: {
                                    file: e.target.files[0]
                                }
                            });
                        })
                        // The following event handlers (in conjunction with tabindex=-1 on openButton)
                        // ensure we can tab through the toolbar, especially the open button
                        // Click the new button, then tab, then enter to show the open file dialog
                        .focus(function () {
                            openButton.addClass('k-state-focused');
                        })
                        .blur(function () {
                            openButton.removeClass('k-state-focused');
                        });
                }
            },

            /**
             * Remove file input (especially when adding hooks)
             * @private
             */
            _destroyFileInput: function () {
                var openButton = this.element.children('a[data-tool="open"]');
                openButton.prop('tabindex', 0);
                if (this.fileInput instanceof $) {
                    this.fileInput.off();
                    this.fileInput.parent().off().remove();
                    this.fileInput = undefined;
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Click event handler
             * @param e
             * @private
             */
            _click: function (e) {
                var toolName = e.target.attr(kendo.attr('tool'));
                var tool = toolDefaults[toolName] || {};
                var commandType = tool.command;
                if (!commandType) {
                    return;
                }
                var args = {
                    command: commandType,
                    params: {
                        property: tool.property || null,
                        value: tool.value || null,
                        options: tool.options || {}
                    }
                };
                if (typeof args.params.value === 'boolean') {
                    args.params.value = e.checked ? true : null;
                }
                this.action(args);
            },

            /* jshint +W074 */

            /**
             * Events
             */
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

            /**
             * Options
             */
            options: {
                name: 'VectorDrawingToolBar',
                resizable: true,
                tools: TOOLBAR,
                connectionDefaults: {},
                shapeDefaults: {}
            },

            /**
             *
             * @param args
             */
            action: function (args) {
                this.trigger('action', args);
            },

            /**
             *
             * @param args
             */
            dialog: function (args) {
                this.trigger('dialog', args);
            },

            /**
             * Refresh the toolbar on a new selection
             * @param selected
             */
            refresh: function (selected) {
                if ($.isArray(selected) && selected.length !== 1) {
                    // For now, we disable fill and stroke buttons on multiple selections
                    // TODO: Disable toolbar options
                    return;
                }
                selected = selected[0];
                var that = this;
                var tools = that._tools();
                function toggle(tool, value) {
                    var toolbarItem = tool.toolbar;
                    var overflowItem = tool.overflow;
                    var togglable = toolbarItem && toolbarItem.options.togglable || overflowItem && overflowItem.options.togglable;
                    if (!togglable) {
                        return;
                    }
                    var toggle = false;
                    if (typeof value === 'boolean') {
                        toggle = value;
                    } else if (typeof value === 'string') {
                        toggle = toolbarItem.options.value === value;
                    }
                    that._configuration[toolbarItem.options.name] = toggle;
                    toolbarItem.toggle(toggle);
                    if (overflowItem) {
                        overflowItem.toggle(toggle);
                    }
                }
                function update(tool, value) {
                    var toolbarItem = tool.toolbar;
                    var overflowItem = tool.overflow;
                    if (toolbarItem && toolbarItem.update) {
                        that._configuration[toolbarItem.options.name] = value;
                        toolbarItem.update(value);
                    }
                    if (overflowItem && overflowItem.update) {
                        overflowItem.update(value);
                    }
                }
                function enable(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    if (toolbar && toolbar.enable) {
                        toolbar.enable(value);
                    }
                    if (overflow && overflow.enable) {
                        overflow.enable(value);
                    }
                }
                for (var i = 0; i < tools.length; i++) {
                    var property = tools[i].property;
                    var tool = tools[i].tool;
                    if (property === 'background') {
                        continue;
                    }
                    // This is what the SpreadSheetToolbar does and we can do it thanks to our DiagramElementMixIn
                    var value = isFunction(selected[property]) ? selected[property]() : selected;
                    if (tool.type === 'button') {
                        toggle(tool, value);
                    } else {
                        update(tool, value);
                    }
                    var features = isFunction(selected.features) && selected.features();
                    enable(tool, features && features[property]);
                }
            },

            /**
             * Use options to reset configuration
             * @private
             */
            _resetConfiguration: function () {
                var connectionDefaults = this.options.connectionDefaults;
                var shapeDefaults = this.options.shapeDefaults;
                this._configuration = {
                    background: 'transparent',
                    fillColor: shapeDefaults.fill && shapeDefaults.fill.color, // TODO content.color?
                    opacity: shapeDefaults.fill && shapeDefaults.fill.opacity,
                    strokeColor: shapeDefaults.stroke && shapeDefaults.stroke.color,
                    strokeWidth: shapeDefaults.stroke && shapeDefaults.stroke.opacity,
                    strokeDashType: shapeDefaults.stroke && shapeDefaults.stroke.opacity,
                    startCapType: connectionDefaults.startCap && connectionDefaults.startCap.type,
                    endCapType: connectionDefaults.endCap && connectionDefaults.endCap.type,
                    fontFamily: shapeDefaults.content && shapeDefaults.content.fontFamily,
                    fontSize: shapeDefaults.content && shapeDefaults.content.fontSize,
                    fontStyle: shapeDefaults.content && shapeDefaults.content.fontStyle,
                    fontWeight: shapeDefaults.content && shapeDefaults.content.fontWeight
                };
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Export the configuration set by toolbar to redraw an element
             * @param element
             */
            getConfiguration: function (element) {
                var defaults = element instanceof Connection ? this.options.connectionDefaults : this.options.shapeDefaults;
                var _configuration = this._configuration;
                var contentOptions = {
                    content: {
                        color: $.type(_configuration.fillColor) === STRING ? _configuration.fillColor : defaults.content && defaults.content.color, // turns null into undefined so as to use shapeDefaults
                        fontFamily: $.type(_configuration.fontFamily) === STRING ? _configuration.fontFamily : defaults.content && defaults.content.fontFamily,
                        fontSize: $.type(_configuration.fontSize) === NUMBER ? _configuration.fontSize : defaults.content && defaults.content.fontSize,
                        fontStyle: $.type(_configuration.fontSize) === BOOLEAN ? (_configuration.fontStyle ? 'italic' : 'normal') : defaults.content && defaults.content.fontStyle,
                        fontWeight: $.type(_configuration.fontWeight) === BOOLEAN ? (_configuration.fontWeight ? 'italic' : 'normal') : defaults.content && defaults.content.fontWeight
                    }
                };
                var fillOptions = {
                    fill: {
                        color: $.type(_configuration.fillColor) === STRING ? _configuration.fillColor : defaults.fill && defaults.fill.color, // turns null into undefined so as to use shapeDefaults
                        opacity: $.type(_configuration.opacity) === NUMBER ? _configuration.opacity : defaults.fill && defaults.fill.opacity
                    }
                };
                var strokeOptions = {
                    stroke: {
                        color: $.type(_configuration.strokeColor) === STRING ? _configuration.strokeColor : defaults.stroke && defaults.stroke.color, // turns null into undefined so as to use shapeDefaults
                        dashType: $.type(_configuration.strokeDashType) === STRING ? _configuration.strokeDashType : defaults.stroke && defaults.stroke.dashType,
                        width: $.type(_configuration.strokeWidth) === NUMBER ? _configuration.strokeWidth : defaults.stroke && defaults.stroke.width
                    }
                };
                var startCapOptions =   {
                    startCap: {
                        // fill: { color: configuration.strokeColor }
                        stroke: {
                            color: $.type(_configuration.strokeColor) === STRING ? _configuration.strokeColor : defaults.stroke && defaults.stroke.color,
                            width: $.type(_configuration.strokeWidth) === NUMBER ? _configuration.strokeWidth : defaults.stroke && defaults.stroke.width
                        },
                        type: $.type(_configuration.startCapType) === STRING ? _configuration.startCapType : defaults.startCap && defaults.startCap.type
                    }
                };
                var endCapOptions = {
                    endCap: {
                        // fill: { color: configuration.strokeColor }
                        stroke: {
                            color: $.type(_configuration.strokeColor) === STRING ? _configuration.strokeColor : defaults.stroke && defaults.stroke.color,
                            width: $.type(_configuration.strokeWidth) === NUMBER ? _configuration.strokeWidth : defaults.stroke && defaults.stroke.width
                        },
                        type: $.type(_configuration.endCapType) === STRING ? _configuration.endCapType : defaults.endCap && defaults.endCap.type
                    }
                };
                var ret = {};
                if (!!element.options.content) {
                    $.extend(ret, contentOptions);
                }
                if (!!element.options.fill) {
                    $.extend(ret, fillOptions);
                }
                if (!!element.options.stroke) {
                    $.extend(ret, strokeOptions);
                }
                if (!!element.options.startCap) {
                    $.extend(ret, startCapOptions);
                }
                if (!!element.options.endCap) {
                    $.extend(ret, endCapOptions);
                }
                return ret;
            },

            /* jshint +W074 */

            /**
             * List tools
             * @private
             */
            _tools: function () {
                return this.element.find('[' + kendo.attr('property') + ']').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr(kendo.attr('property')),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },

            /**
             * Destroy
             */
            destroy: function () {
                this._destroyFileInput();
                this.element.find('[' + kendo.attr('command') + '],.k-button').each(function () {
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
                var dropDownList = $('<select />').attr('title', options.attributes.title).attr('aria-label', options.attributes.title).kendoDropDownList({ height: 'auto' }).data('kendoDropDownList');
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
            _open: function (e) {
                // Note: testing k-state-disabled is not part of the original DropDownTool from SpreadsheetToolbar
                if (this.element.hasClass('k-state-disabled')) {
                    e.preventDefault();
                    return false;
                }
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
                        params: {
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
                this.element = $('<a href="#" class="k-button k-button-icon">' + '<span class="' + options.spriteCssClass + '">' + '</span><span class="k-icon k-i-arrow-60-down"></span>' + '</a>');
                this.element
                    .on('click touchend', this.open.bind(this))
                    .attr('data-command', options.command);
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
            open: function (e) {
                e.preventDefault();
                // Note: testing k-state-disabled is not part of the original DropDownTool from SpreadsheetToolbar
                if (!this.element.hasClass('k-state-disabled')) {
                    this.popup.toggle();
                }
            },
            _popup: function () {
                var element = this.element;
                this.popup = $('<div class="k-spreadsheet-popup kj-vectordrawing-popup" />')
                    .appendTo(element)
                    .kendoPopup({ anchor: element }).data('kendoPopup');
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
                    type: 'vectorShape',
                    vectorShape: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: 'rectangle',
                    iconClass: 'shape-rect',
                    text: TOOLBAR_MESSAGES.shapeButtons.rect,
                    path: ''
                },
                {
                    value: 'circle',
                    iconClass: 'shape-circle',
                    text: TOOLBAR_MESSAGES.shapeButtons.circle,
                    path: ''
                },
                {
                    value: 'path',
                    iconClass: 'star-outline',
                    text: TOOLBAR_MESSAGES.shapeButtons.star,
                    path: 'M 50.000 70.000 L 79.389 90.451 L 69.021 56.180 L 97.553 34.549 L 61.756 33.820 L 50.000 0.000 L 38.244 33.820 L 2.447 34.549 L 30.979 56.180 L 20.611 90.451 Z'
                },
                {
                    value: 'path',
                    iconClass: 'heart-outline',
                    text: TOOLBAR_MESSAGES.shapeButtons.heart,
                    path: 'M 0,0 L 100,100 L 300,0 Z' // TODO Make a heart
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
                    var button = '<a title="' + options.text + '" data-value="' + options.value + '" data-path="' + options.path + '" class="k-button k-button-icon">' + '<span class="k-icon k-i-' + options.iconClass + '"></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class="k-separator" />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                var path = button.attr('data-path');
                this.toolbar.action({
                    command: 'DrawingToolChangeCommand',
                    params: {
                        property: 'tool',
                        value: 'ShapeTool',
                        options: {
                            type: value,
                            path: path
                        }
                    }
                });
            }
        });
        var ShapeButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorShape' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorShape', ShapeTool, ShapeButton);

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
                    html: '<div></div>' + '<div class="k-action-buttons">' + '<button class="k-button k-primary" data-bind="click: apply">' + TOOLBAR_MESSAGES.colorPalette.apply + '</button>' + '<button class="k-button" data-bind="click: close">' + TOOLBAR_MESSAGES.colorPalette.cancel + '</button>' + '</div>'
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
                this.resetButton = $('<a class="k-button k-reset-color" href="#">' + '<span class="k-icon k-i-reset-color"></span>' + TOOLBAR_MESSAGES.colorPalette.reset + '</a>').appendTo(this.element);
            },
            _customColorButton: function () {
                this.customColorButton = $('<a class="k-button k-custom-color" href="#">' + '<span class="k-icon"></span>' + TOOLBAR_MESSAGES.colorPalette.customColor + '</a>').appendTo(this.element);
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
                    type: 'vectorColorPicker',
                    vectorColorPicker: this,
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
                    params: {
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
                if (this.options.enable) {
                    this.toolbar.dialog({
                        name: 'vectorColorPicker',
                        options: {
                            title: this.options.property,
                            property: this.options.property
                        }
                    });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorColorPicker', ColorPicker, ColorPickerButton);

        /**
         * Opacity (Whole shape including fill and stroke)
         */
        var opacityOptions = {
            smallStep: 0.01,
            largeStep: 0.1,
            min: 0,
            max: 1,
            value: 1,
            showButtons: false,
            tickPlacement: 'none',
            tooltip: {
                format: '{0:p0}'
            }
        };
        var OpacityTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.element.data({
                    type: 'vectorOpacity',
                    vectorOpacity: this,
                    instance: this
                });
            },
            destroy: function () {
                this.slider.destroy();
                PopupTool.fn.destroy.call(this);
            },
            update: function (value) {
                this.value($.type(value) !== NUMBER ? 1 : value);
            },
            value: function (value) {
                this.slider.value(value);
            },
            _commandPalette: function () {
                var element = $('<div style="padding:2em 1em 1em 1em" />').appendTo(this.popup.element); // TODO make it a class
                // TODO: Add label???
                this.slider = $('<input>').appendTo(element).kendoSlider(
                    deepExtend(opacityOptions, {
                        change: this._action.bind(this)
                        // slide: this._action.bind(this)
                    })
                ).getKendoSlider();
            },
            _action: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    params: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
            }
        });
        var OpacityButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorOpacity' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorOpacity', OpacityTool, OpacityButton);

        /**
         * Stroke Width
         */
        var StrokeWidthTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.element.data({
                    type: 'vectorStrokeWidth',
                    vectorStrokeWidth: this,
                    instance: this
                });
            },
            destroy: function () {
                this.slider.destroy();
                PopupTool.fn.destroy.call(this);
            },
            update: function (value) {
                this.value(value);
            },
            value: function (value) {
                this.slider.value(value);
            },
            _commandPalette: function () {
                var element = $('<div style="padding:2em 1em 1em 1em" />').appendTo(this.popup.element); // TODO make it a class
                this.slider = $('<input>').appendTo(element).kendoSlider({
                    smallStep: 1,
                    largeStep: 5,
                    min: 0,
                    max: 25,
                    value: 1,
                    showButtons: false,
                    tickPlacement: 'none',
                    tooltip: {
                        format: '{0} pt'
                    },
                    change: this._action.bind(this)
                    // slide: this._action.bind(this)
                }).getKendoSlider();
            },
            _action: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    params: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
            }
        });
        var StrokeWidthButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorStrokeWidth' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorStrokeWidth', StrokeWidthTool, StrokeWidthButton);

        /**
         * Stroke Dash Type
         */
        var StrokeDashTypeTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.element.attr({ 'data-property': 'strokeDashType' });
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                }.bind(this));
                this.element.data({
                    type: 'vectorStrokeDashType',
                    vectorStrokeDashType: this,
                    instance: this
                });
            },
            buttons: [
                {
                    property: 'strokeDashType',
                    value: 'solid',
                    dashArray: '0',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.solid
                },
                {
                    property: 'strokeDashType',
                    value: 'longDash',
                    dashArray: '8 3.5',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.longDash
                },
                {
                    property: 'strokeDashType',
                    value: 'dash',
                    dashArray: '4 3.5',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.dash
                },
                {
                    property: 'strokeDashType',
                    value: 'dot',
                    dashArray: '1.5 3.5',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.dot
                },
                {
                    property: 'strokeDashType',
                    value: 'longDashDot',
                    dashArray: '8 3.5 1.5 3.5',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.longDashDot
                },
                {
                    property: 'strokeDashType',
                    value: 'longDashDotDot',
                    dashArray: '8 3.5 1.5 3.5 1.5 3.5',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.longDashDotDot
                },
                {
                    property: 'strokeDashType',
                    value: 'dashDot',
                    dashArray: '3.5 3.5 1.5 3.5',
                    text: TOOLBAR_MESSAGES.strokeDashTypeButtons.dashDot
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            update: function (selected) {
                var strokeDashType = selected && selected.options && selected.options.stroke && selected.options.stroke.dashType;
                var element = this.popup.element;
                element.find('.k-button').removeClass('k-state-active');
                if (strokeDashType) {
                    element.find('[data-property=strokeDashType][data-value=' + strokeDashType + ']').addClass('k-state-active');
                }
            },
            _commandPalette: function () {
                var element = $('<div />').appendTo(this.popup.element);
                this.buttons.forEach(function (options) {
                    var button = '<a title="' + options.text + '" data-property="' + options.property + '" data-value="' + options.value + '" class="k-button k-button-icontext">' +
                        '<span><svg height="16" width="100"><g><path stroke="#808080" stroke-width="2" stroke-dasharray="' + options.dashArray + '" d="M0 10 L100 10" /></g></svg></span>' +
                        '</a>';

                    // TODO #808080 might not be a good fit for all themes

                    element.append(button);
                });
            },
            _action: function (button) {
                var property = button.attr('data-property');
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    params: {
                        property: property,
                        value: value
                    }
                });
            }
        });
        var StrokeDashTypeButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorStrokeDashType' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorStrokeDashType', StrokeDashTypeTool, StrokeDashTypeButton);

        /**
         * Start Cap Type
         */
        var StartCapTypeTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.element.attr({ 'data-property': 'startCapType' });
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'vectorStartCapType',
                    vectorStartCapType: this,
                    instance: this
                });
            },
            buttons: [
                {
                    property: 'startCapType',
                    value: 'none',
                    iconClass: 'window-minimize',
                    text: TOOLBAR_MESSAGES.startCapTypeButtons.none
                },
                {
                    property: 'startCapType',
                    value: 'ArrowStart',
                    iconClass: 'arrow-60-left',
                    text: TOOLBAR_MESSAGES.startCapTypeButtons.arrow
                },
                {
                    property: 'startCapType',
                    value: 'FilledCircle',
                    iconClass: 'circle',
                    text: TOOLBAR_MESSAGES.startCapTypeButtons.circle
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            update: function (selected) {
                var startCapType = selected && selected.options && selected.options.startCap && selected.options.startCap.type;
                var element = this.popup.element;
                element.find('.k-button').removeClass('k-state-active');
                if (startCapType) {
                    element.find('[data-property=startCapType][data-value=' + startCapType + ']').addClass('k-state-active');
                }
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title="' + options.text + '" data-property="' + options.property + '" data-value="' + options.value + '" class="k-button k-button-icon">' + '<span class="k-icon k-i-' + options.iconClass + '"></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class="k-separator" />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var property = button.attr('data-property');
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    params: {
                        property: property,
                        value: value
                    }
                });
            }
        });
        var StartCapTypeButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorStartCapType' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorStartCapType', StartCapTypeTool, StartCapTypeButton);

        /**
         * End Cap Type
         */
        var EndCapTypeTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.element.attr({ 'data-property': 'endCapType' });
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'vectorEndCapType',
                    vectorEndCapType: this,
                    instance: this
                });
            },
            buttons: [
                {
                    property: 'endCapType',
                    value: 'none',
                    iconClass: 'window-minimize',
                    text: TOOLBAR_MESSAGES.endCapTypeButtons.none
                },
                {
                    property: 'endCapType',
                    value: 'ArrowEnd',
                    iconClass: 'arrow-60-right',
                    text: TOOLBAR_MESSAGES.endCapTypeButtons.arrow
                },
                {
                    property: 'endCapType',
                    value: 'FilledCircle',
                    iconClass: 'circle',
                    text: TOOLBAR_MESSAGES.endCapTypeButtons.circle
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            update: function (selected) {
                var endCapType = selected && selected.options && selected.options.endCap && selected.options.endCap.type;
                var element = this.popup.element;
                element.find('.k-button').removeClass('k-state-active');
                if (endCapType) {
                    element.find('[data-property=endCapType][data-value=' + endCapType + ']').addClass('k-state-active');
                }
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title="' + options.text + '" data-property="' + options.property + '" data-value="' + options.value + '" class="k-button k-button-icon">' + '<span class="k-icon k-i-' + options.iconClass + '"></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class="k-separator" />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var property = button.attr('data-property');
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    params: {
                        property: property,
                        value: value
                    }
                });
            }
        });
        var EndCapTypeButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorEndCapType' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorEndCapType', EndCapTypeTool, EndCapTypeButton);

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
                    value: toolDefaults.fontFamily.value
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
                    type: 'vectorFontSize',
                    vectorFontSize: this,
                    instance: this
                });
            },
            _valueChange: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    params: {
                        property: this.options.property,
                        value: kendo.parseInt(e.sender.value())
                    }
                });
            },
            update: function (value) {
                this.value(kendo.parseInt(value) || toolDefaults.fontSize.value);
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
                if (this.options.enable) {
                    this.toolbar.dialog({
                        name: 'vectorFontSize',
                        options: {
                            sizes: FONT_SIZES,
                            defaultSize: toolDefaults.fontSize.value
                        }
                    });
                }
            },
            update: function (value) {
                this._value = value || toolDefaults.fontSize.value;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('vectorFontSize', FontSize, FontSizeButton);

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
                ddl.value(toolDefaults.fontFamily.value);
                this.element.data({
                    type: 'vectorFontFamily',
                    vectorFontFamily: this,
                    instance: this
                });
            },
            update: function (value) {
                this.value(value || toolDefaults.fontFamily.value);
            }
        });
        var FontFamilyButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({
                        name: 'vectorFontFamily',
                        options: {
                            fonts: FONT_FAMILIES,
                            defaultFont: toolDefaults.fontFamily.value
                        }
                    });
                }
            },
            update: function (value) {
                this._value = value || toolDefaults.fontFamily.value;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('vectorFontFamily', FontFamily, FontFamilyButton);

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
                    type: 'vectorArrange',
                    vectorArrange: this,
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
                    var button = '<a title="' + options.text + '" data-value="' + options.value + '" class="k-button k-button-icon">' + '<span class="k-icon k-i-' + options.iconClass + '"></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class="k-separator" />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarArrangeCommand',
                    params: {
                        value: value
                    }
                });
            }
        });
        var ArrangeButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorArrange' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorArrange', ArrangeTool, ArrangeButton);

        /**
         * Guides (drawing dimensions + snaping grid and angles)
         */
        var GuidesTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.element.data({
                    type: 'vectorGuides',
                    vectorGuides: this,
                    instance: this
                });
            },
            destroy: function () {
                this.slider.destroy();
                PopupTool.fn.destroy.call(this);
            },
            update: function (value) {
                this.value(value);
            },
            value: function (value) {
                this.slider.value(value);
            },
            _commandPalette: function () {
                var element = $('<div style="padding:2em 1em 1em 1em" />').appendTo(this.popup.element); // TODO make it a class
                this.slider = $('<input>').appendTo(element).kendoSlider({
                    smallStep: 5,
                    largeStep: 10,
                    min: 0,
                    max: 50,
                    value: 10,
                    showButtons: false,
                    tickPlacement: 'none',
                    tooltip: {
                        format: '{0} pt'
                    },
                    change: this._action.bind(this)
                    // slide: this._action.bind(this)
                }).getKendoSlider();
            },
            _action: function (e) {
                this.toolbar.action({
                    command: 'GuidesChangeCommand',
                    params: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
            }
        });
        var GuidesButton = OverflowDialogButton.extend({
            _click: function () {
                if (this.options.enable) {
                    this.toolbar.dialog({ name: 'vectorGuides' });
                }
            }
        });
        kendo.toolbar.registerComponent('vectorGuides', GuidesTool, GuidesButton);

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
            saveDialog: {
                title: 'Save As',
                regex: /(\.jpg|\.png|\.svg)$/i,
                default: 'untitled.png',
                labels: {
                    name: 'File name:',
                    type: 'File type:',
                    extensions: '[".JPG", ".PNG", ".SVG", ".SVG+"]'
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
            imageDialog: {
                title: 'Image',
                labels: {
                    url: 'Source'
                }
            },
            textDialog: {
                title: 'Text',
                labels: {
                    text: 'Text'
                }
            },
            // TODO : color dialogs miss a title
            opacityDialog: {
                title: 'Opacity'
            },
            strokeWidthDialog: {
                title: 'Stroke Width'
            },
            strokeDashTypeDialog: {
                title: 'Dash Type',
                buttons: {
                    dash: 'dash',
                    dashDot: 'dash-dot',
                    dot: 'dot',
                    longDash: 'long-dash',
                    longDashDot: 'long-dash dot',
                    longDashDotDot:	'long-dash dot-dot',
                    solid: 'solid'
                }
            },
            startCapTypeDialog: {
                title: 'Start Cap',
                buttons: {
                    none: 'None',
                    arrow: 'Arrow',
                    circle: 'Circle'
                }
            },
            endCapTypeDialog: {
                title: 'End Cap',
                buttons: {
                    none: 'None',
                    arrow: 'Arrow',
                    circle: 'Circle'
                }
            },
            fontSizeDialog: {
                title: 'Font size'
            },
            fontFamilyDialog: {
                title: 'Font'
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
        kendo.toolbar.registerComponent('vectorDialog', kendo.toolbar.ToolBarButton.extend({
            init: function (options, toolbar) {
                kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
                this._dialogName = options.dialogName;
                this.element.bind('click touchend', this.open.bind(this)).data('instance', this);
            },
            open: function () {
                this.toolbar.dialog({ name: this._dialogName, options: { width: 400 } });
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
                    // this._dialog = $('<div class="k-spreadsheet-window k-action-window k-popup-edit-form" />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
                    this._dialog = $('<div class="k-spreadsheet-window k-action-window" />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
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
         * SaveDialog
         */
        var SaveDialog = VectorDrawingDialog.extend({
            options: {
                template: '<div class="k-edit-label"><label>#: messages.saveDialog.labels.name #</label></div>' +
                    '<div class="k-edit-field"><input type="text" name="name" class="k-textbox" data-bind="value: name" /></div>' +
                    '<div class="k-edit-label"><label>#: messages.saveDialog.labels.type #</label></div>' +
                    '<div class="k-edit-field"><input data-role="dropdownlist" data-bind="value: type" data-source="#: messages.saveDialog.labels.extensions #" /></div>' +
                    '<div class="k-action-buttons">' +
                    '<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' +
                    '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>' +
                    '</div>',
                title: DIALOG_MESSAGES.saveDialog.title,
                autoFocus: false
            },
            open: function (options) {
                var self = this;
                VectorDrawingDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var source = (options || {}).source || DIALOG_MESSAGES.saveDialog.default;
                var type = DIALOG_MESSAGES.saveDialog.default.split('.').pop().toUpperCase();
                var name = source.split('/').pop();
                var pos = name.lastIndexOf('.');
                if (pos > 0) {
                    type = name.substr(pos + 1).toUpperCase();
                    name = name.substr(0, pos);
                }
                var model = kendo.observable({
                    name: name, // without extension
                    type: '.' + type,
                    apply: function () {
                        if (validator.validate()) {
                            self.trigger('action', {
                                command: 'ToolbarSaveCommand',
                                params: {
                                    type: 'save',
                                    value: model.name.replace(DIALOG_MESSAGES.saveDialog.regex, '') + model.type.toLowerCase()
                                }
                            });
                            validator.destroy();
                            self.close();
                        }
                    },
                    cancel: self.close.bind(self)
                });
                kendo.bind(element, model);
                var validator = element.kendoValidator({
                    messages: {
                        name: 'Please enter 3 to 50 alphanumeric characters or underscores' // TODO i18n
                    },
                    rules: {
                        name: function (input) {
                            if (input.is('[name="name"]')) {
                                return RX_FILE_ID.test(input.val());
                            }
                            return true;
                        }
                    }
                }).data('kendoValidator');
                element.find('input').focus().on('keydown', function (e) {
                    if (e.keyCode === 13) {
                        model.name = $(this).val();
                        e.stopPropagation();
                        e.preventDefault();
                        model.apply();
                    } else if (e.keyCode === 27) {
                        e.stopPropagation();
                        e.preventDefault();
                        model.cancel();
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorSave', SaveDialog);

        /**
         * ShapeDialog
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
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
                    template: '<a title="#=text#" data-property="#=property#" data-value="#=value#">' + '<span class="k-icon k-i-#=iconClass#"></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarShapeCommand',
                    params: {
                        // property // TODO?????
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorShape', ShapeDialog);

        /**
         * ImageDialog
         */
        var ImageDialog = VectorDrawingDialog.extend({
            options: {
                template: '<div class="k-edit-label"><label>#: messages.imageDialog.labels.url #:</label></div>' + '<div class="k-edit-field"><input class="k-textbox" data-bind="value: url" /></div>' + '<div class="k-action-buttons">' + ('<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' + '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.imageDialog.title,
                autoFocus: false
            },
            open: function (url) {
                var self = this;
                VectorDrawingDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    url: 'https://cdn.kidoju.com/s/en/570cc7f46d1dd91900729417/image.png',
                    // url: 'http://localhost:63342/Kidoju.Widgets/test/data/images/miscellaneous/Elvis.jpg',
                    apply: function () {
                        if (!/\S/.test(model.url)) {
                            model.url = null;
                        }
                        getDataUriAndSize(model.url)
                            .done(function (imgData) {
                                self.trigger('action', {
                                    command: 'DrawingToolChangeCommand',
                                    params: {
                                        property: 'tool',
                                        value: 'ShapeTool',
                                        options: {
                                            type: 'Image',
                                            source: imgData.dataUri,
                                            height: imgData.height,
                                            width: imgData.width
                                        }
                                    }
                                });
                                self.close();
                            })
                            .fail(function (err) {
                                // TODO raise error event
                                // debugger;
                            });
                    },
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
        kendo.vectordrawing.dialogs.register('vectorImage', ImageDialog);

        /**
         * TextDialog
         */
        var TextDialog = VectorDrawingDialog.extend({
            options: {
                template: '<div class="k-edit-label"><label>#: messages.textDialog.labels.text #:</label></div>' + '<div class="k-edit-field"><input class="k-textbox" data-bind="value: text" /></div>' + '<div class="k-action-buttons">' + ('<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' + '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.textDialog.title,
                autoFocus: false
            },
            open: function (text) {
                var self = this;
                VectorDrawingDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    text: 'Text',
                    apply: function () {
                        if (!/\S/.test(model.text)) {
                            model.text = null;
                        }
                        self.trigger('action', {
                            command: 'DrawingToolChangeCommand',
                            params: {
                                property: 'tool',
                                value: 'ShapeTool',
                                options: {
                                    type: 'Text',
                                    text: model.text.trim()
                                }
                            }
                        });
                        self.close();
                    },
                    cancel: self.close.bind(self)
                });
                kendo.bind(element, model);
                element.find('input').focus().on('keydown', function (ev) {
                    if (ev.keyCode === 13) {
                        model.text = $(this).val();
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
        kendo.vectordrawing.dialogs.register('vectorText', TextDialog);

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
            options: { template: '<div></div>' + '<div class="k-action-buttons">' + '<button class="k-button k-primary" data-bind="click: apply">#: messages.apply #</button>' + '<button class="k-button" data-bind="click: close">#: messages.cancel #</button>' + '</div>' },
            apply: function () {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
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
        kendo.vectordrawing.dialogs.register('vectorColorPicker', ColorPickerDialog);
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
         * Opacity
         */
        var OpacityDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.opacityDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    property: 'opacity'
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<div><input style="width:100%;"></div>' }, // TODO add class?
            _list: function () {
                var input = this.dialog().element.find('input');
                this.slider = new kendo.ui.Slider(input[0], {
                    smallStep: 0.01,
                    largeStep: 0.1,
                    min: 0,
                    max: 1,
                    value: 1,
                    showButtons: false,
                    tickPlacement: 'none',
                    tooltip: {
                        format: '{0:p0}'
                    },
                    change: this.apply.bind(this)
                    // slide: this.apply.bind(this)
                });
            },
            apply: function (e) {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorOpacity', OpacityDialog);

        /**
         * Stroke Width
         */
        var StrokeWidthDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.strokeWidthDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    property: 'strokeWidth'
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<div><input></div>' }, // TODO add class?
            _list: function () {
                var input = this.dialog().element.find('input');
                this.slider = new kendo.ui.Slider(input[0], {
                    smallStep: 1,
                    largeStep: 5,
                    min: 1,
                    max: 20,
                    value: 1,
                    showButtons: false,
                    tickPlacement: 'none',
                    tooltip: {
                        format: '{0} pt'
                    },
                    change: this.apply.bind(this)
                    // slide: this.apply.bind(this)
                });
            },
            apply: function (e) {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorStrokeWidth', StrokeWidthDialog);

        /**
         * Stroke Dash Type
         */
        var StrokeDashTypeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.strokeDashTypeDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            property: 'strokeDashType',
                            value: 'solid',
                            dashArray: '0',
                            text: messages.buttons.solid
                        },
                        {
                            property: 'strokeDashType',
                            value: 'longDash',
                            dashArray: '8 3.5',
                            text: messages.buttons.longDash
                        },
                        {
                            property: 'strokeDashType',
                            value: 'dash',
                            dashArray: '4 3.5',
                            text: messages.buttons.dash
                        },
                        {
                            property: 'strokeDashType',
                            value: 'dot',
                            dashArray: '1.5 3.5',
                            text: messages.buttons.dot
                        },
                        {
                            property: 'strokeDashType',
                            value: 'longDashDot',
                            dashArray: '8 3.5 1.5 3.5',
                            text: messages.buttons.longDashDot
                        },
                        {
                            property: 'strokeDashType',
                            value: 'longDashDotDot',
                            dashArray: '8 3.5 1.5 3.5 1.5 3.5',
                            text: messages.buttons.longDashDotDot
                        },
                        {
                            property: 'strokeDashType',
                            value: 'dashDot',
                            dashArray: '3.5 3.5 1.5 3.5',
                            text: messages.buttons.dashDot
                        }
                    ]
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
                    template: '<a title="#=text#" data-property="#=property#" data-value="#=value#">' +
                        '<svg height="16" width="100"><g><path stroke="grey" stroke-width="2" stroke-dasharray="#=dashArray#" d="M0 10 L100 10" /></g></svg>' +

                        // TODO Beware themes noting that I could not get #808080 and \#808080 to work instead of grey

                        '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                if (!dataItem) {
                    $.noop(); // TODO
                    // debugger;
                }
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorStrokeDashType', StrokeDashTypeDialog);

        /**
         * Start Cap Type
         */
        var StartCapTypeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.startCapTypeDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            property: 'startCapType',
                            value: 'none',
                            iconClass: 'window-minimize',
                            text: messages.buttons.none
                        },
                        {
                            property: 'startCapType',
                            value: 'ArrowStart',
                            iconClass: 'arrow-60-left',
                            text: messages.buttons.arrow
                        },
                        {
                            property: 'startCapType',
                            value: 'FilledCircle',
                            iconClass: 'circle',
                            text: messages.buttons.circle
                        }
                    ]
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
                    template: '<a title="#=text#" data-property="#=property#" data-value="#=value#">' + '<span class="k-icon k-icon k-i-#=iconClass#"></span>#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                if (!dataItem) {
                    $.noop(); // TODO
                    // debugger;
                }
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorStartCapType', StartCapTypeDialog);

        /**
         * End Cap Type
         */
        var EndCapTypeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.endCapTypeDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            property: 'endCapType',
                            value: 'none',
                            iconClass: 'window-minimize',
                            text: messages.buttons.none
                        },
                        {
                            property: 'endCapType',
                            value: 'ArrowStart',
                            iconClass: 'arrow-60-right',
                            text: messages.buttons.arrow
                        },
                        {
                            property: 'endCapType',
                            value: 'FilledCircle',
                            iconClass: 'circle',
                            text: messages.buttons.circle
                        }
                    ]
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
                    template: '<a title="#=text#" data-property="#=property#" data-value="#=value#">' + '<span class="k-icon k-icon k-i-#=iconClass#"></span>#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                if (!dataItem) {
                    $.noop(); // TODO
                    // debugger;
                }
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorEndCapType', EndCapTypeDialog);

        /**
         * Font Size
         */
        var FontSizeDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.fontSizeDialog || DIALOG_MESSAGES;
                VectorDrawingDialog.fn.init.call(this, $.extend({ title: messages.title }, options));
                this._list();
            },
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                var sizes = this.options.sizes;
                var defaultSize = this.options.defaultSize;
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: sizes }),
                    template: '#: data #',
                    value: defaultSize,
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                /*
                 var dataItem = e.sender.value()[0];
                 if (!dataItem) {
                     $.noop(); // TODO
                     // debugger;
                 }
                 VectorDrawingDialog.fn.apply.call(this);
                 this.trigger('action', {
                 command: 'PropertyChangeCommand',
                 params: {
                 property: dataItem.property,
                 value: dataItem.value
                 }
                 });
                */
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: 'fontSize', // this.property
                        value: kendo.parseInt(e.sender.value()[0]) // this.value()[0]
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorFontSize', FontSizeDialog);

        /**
         * Font Family
         */
        var FontFamilyDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.fontFamilyDialog || DIALOG_MESSAGES;
                VectorDrawingDialog.fn.init.call(this, $.extend({ title: messages.title }, options));
                this._list();
            },
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                var fonts = this.options.fonts;
                var defaultFont = this.options.defaultFont;
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: fonts }),
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
                    params: {
                        property: 'fontFamily', // this.property
                        value: e.sender.value()[0] // this.value()[0]
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorFontFamily', FontFamilyDialog);

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
            options: { template: '<ul class="k-list k-reset"></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
                    template: '<a title="#=text#" data-property="#=property#" data-value="#=value#">' + '<span class="k-icon k-i-#=iconClass#"></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                if (!dataItem) {
                    $.noop(); // TODO
                    // debugger;
                }
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarArrangeCommand',
                    params: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorArrange', ArrangeDialog);

        /**
         * Guides
         */
        var GuidesDialog = VectorDrawingDialog.extend({
            init: function (options) {
                var messages = kendo.vectordrawing.messages.dialogs.guidesDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    property: 'guides'
                };
                VectorDrawingDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<div><input style="width:100%;"></div>' }, // TODO add class?
            _list: function () {
                var input = this.dialog().element.find('input');
                this.slider = new kendo.ui.Slider(input[0], {
                    smallStep: 5,
                    largeStep: 10,
                    min: 0,
                    max: 50,
                    value: 10,
                    showButtons: false,
                    tickPlacement: 'none',
                    tooltip: {
                        format: '{0} pt'
                    },
                    change: this.apply.bind(this)
                    // slide: this.apply.bind(this)
                });
            },
            apply: function (e) {
                VectorDrawingDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'GuidesChangeCommand',
                    params: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorGuides', GuidesDialog);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
