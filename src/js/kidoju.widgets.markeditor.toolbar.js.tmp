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
        './vendor/kendo/kendo.toolbar'
    ], f);
})(function () {
    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.markeditor.toolbar');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';

        kendo.vectordrawing = {messages: {}};
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
                    throw new Error(
                        'Mixin target isnot a kendo.dataviz.diagram.DrawingElement.');
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
                var hasStroke = isConnection || (isShape && this.type.toLowerCase() !== 'text' && this.type.toLowerCase() !== 'image');
                var hasCap = isConnection;
                var hasFont = isShape && this.type.toLowerCase() === 'text'
                return {
                    fillColor: hasFill,
                    opacity: hasFill,
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
                // TODO text color
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
         * MarkEditorToolBar Widget
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
                type: 'button',
                command: 'ToolbarSaveCommand',
                overflow: 'never',
                iconClass: 'save'
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
                iconClass: 'close'
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
         * MarkEditorToolBar
         */
        var MarkEditorToolBar = ToolBar.extend({

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
                options.items = this._expandTools(options.tools || MarkEditorToolBar.prototype.options.tools);
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
                groups.before('<span class=\'k-separator\' />');
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
                            // Chnage the state of the covered openButton
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
                name: 'MarkEditorToolBar',
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
                        // TODO: not sufficient, popups drop down
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

                var ret = {};
                if (!!element.options.content) {
                    $.extend(ret, contentOptions);
                }
                return ret;
            },

            /**
             * List tools
             * @private
             */
            _tools: function () {
                return this.element.find('[' + kendo.attr('property') + ']').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr('data-property'),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },

            /**
             * Destroy
             */
            destroy: function () {
                this._destroyFileInput();
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
        kendo.ui.plugin(MarkEditorToolBar);

        /*********************************************************************************
         * MarkEditorToolBar Tools
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
                this.element = $('<a href=\'#\' class=\'k-button k-button-icon\'>' + '<span class=\'' + options.spriteCssClass + '\'>' + '</span><span class=\'k-icon k-i-arrow-60-down\'></span>' + '</a>');
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
                this.popup = $('<div class=\'k-spreadsheet-popup kj-vectordrawing-popup\' />')
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
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' data-path=\'' + options.path + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
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
                this.toolbar.dialog({ name: 'vectorShape' });
            }
        });
        kendo.toolbar.registerComponent('vectorShape', ShapeTool, ShapeButton);

        /*********************************************************************************
         * MarkEditorToolBar Dialogs
         *********************************************************************************/

        var DIALOG_MESSAGES = kendo.vectordrawing.messages.dialogs = {
            apply: 'Apply',
            save: 'Save',
            cancel: 'Cancel',
            remove: 'Remove',
            retry: 'Retry',
            revert: 'Revert',
            okText: 'OK',
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
                    url: 'Address'
                }
            },
            textDialog: {
                title: 'Text',
                labels: {
                    text: 'Text'
                }
            }
        };

        /**
         * Dialog registry
         * @type {{}}
         */
        var registry = {};
        kendo.markdown.dialogs = {
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
        kendo.toolbar.registerComponent('markdownDialog', kendo.toolbar.ToolBarButton.extend({
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
        var MarkEditorDialog = kendo.markdown.MarkEditorDialog = kendo.Observable.extend({
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
                    // this._dialog = $('<div class=\'k-spreadsheet-window k-action-window k-popup-edit-form\' />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
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
        var ShapeDialog = MarkEditorDialog.extend({
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
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
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
                    params: {
                        // property // TODO?????
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.vectordrawing.dialogs.register('vectorShape', ShapeDialog);

        /**
         * Image
         */
        var ImageDialog = VectorDrawingDialog.extend({
            options: {
                template: '<div class=\'k-edit-label\'><label>#: messages.imageDialog.labels.url #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.imageDialog.title,
                autoFocus: false
            },
            open: function (url) { // TODO: url especially for edit mode
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
                        self.trigger('action', {
                            command: 'DrawingToolChangeCommand',
                            params: {
                                property: 'tool',
                                value: 'ShapeTool',
                                options: {
                                    type: 'image',
                                    source: model.url
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
         * Text
         */
        var TextDialog = VectorDrawingDialog.extend({
            options: {
                template: '<div class=\'k-edit-label\'><label>#: messages.textDialog.labels.text #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: text\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.textDialog.title,
                autoFocus: false
            },
            open: function (text) { // TODO: text especially for edit mode
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
                                    type: 'text',
                                    text: model.text
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

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
