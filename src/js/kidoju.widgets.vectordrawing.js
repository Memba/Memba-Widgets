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
        './vendor/kendo/kendo.color',
        './vendor/kendo/kendo.drawing',
        './vendor/kendo/kendo.popup',
        './vendor/kendo/kendo.slider',
        './vendor/kendo/kendo.button',
        './vendor/kendo/kendo.colorpicker',
        './vendor/kendo/kendo.combobox',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.toolbar',
        './vendor/kendo/kendo.window',
        './kendo.drawing.pathEx'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var DataSource = data.DataSource;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var ToolBar = kendo.ui.ToolBar;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.vectordrawing');
        var NUMBER = 'number';
        var OBJECT = 'object';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoVectorDrawing';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var DIV = '<div/>';
        var WIDGET_CLASS = 'kj-vectordrawing';
        var WIDGET_SELECTOR = DOT + 'kj-vectordrawing';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var UID = 'uid';
        var DBLCLICK_TTL = 300;
        var CURSOR = {
            CROSSHAIR: 'crosshair',
            DEFAULT: 'default',
            MOVE: 'move',
            NW_RESIZE: 'nw-resize',
            N_RESIZE: 'n-resize',
            NE_RESIZE: 'ne-resize',
            E_RESIZE: 'e-resize',
            SE_RESIZE: 'se-resize',
            S_RESIZE: 's-resize',
            SW_RESIZE: 'sw-resize',
            W_RESIZE: 'w-resize',
            ROTATE: 'crosshair' // or url(rotation.cur), crosshair;
        };
        var HANDLES = {
            BBOX: 'bbox',
            NW: 'nw',
            N: 'n',
            NE: 'ne',
            E: 'e',
            SE: 'se',
            S: 's',
            SW: 'sw',
            W: 'w',
            R: 'r'
        };
        var TRANSFORMATION = {
            ROTATE: 'rotate',
            SCALE: 'scale',
            TRANSLATE: 'translate'
        };
        var RX_COLOR = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
        var RX_DASHTYPE = /^(dash|dashDot|dot|longDash|longDashDot|longDashDotDot|solid)$/;
        var RX_FONT = /^(normal\s+|italic\s+|oblique\s+|initial\s+|inherit\s+)?([0-9\.]+[a-z]+\s+)?(.+)$/;
        // DATA_TYPE refers to the types of objects in dataSource
        var DATA_TYPE = {
            CIRCLE: 'circle', // TODO: Make it a path
            IMAGE: 'image',
            PATH: 'path', // TODO: maybe a multipath?
            RECT: 'rect', // TODO: Make it a path
            TEXT: 'text'
        };
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

        var DEFAULTS = {
            FILL_COLOR: undefined,
            FONT_FAMILY: 'sans-serif',
            FONT_SIZE: 12,
            FONT_STYLE: '',
            OPACITY: 1,
            STROKE_COLOR: '#000',
            STROKE_DASHTYPE: 'solid',
            STROKE_WIDTH: 1
        };
        /**
         * A kendo.drawing configuration class
         * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing/text#configuration
         */
        var Configuration = kendo.Class.extend({
            fill: {
                color: DEFAULTS.FILL_COLOR
                // opacity: 1
            },
            font: {
                fontFamily: DEFAULTS.FONT_FAMILY,
                fontSize: DEFAULTS.FONT_SIZE,
                fontStyle: DEFAULTS.FONT_STYLE
            },
            opacity: DEFAULTS.OPACITY,
            stroke: {
                color: DEFAULTS.STROKE_COLOR,
                dashType: DEFAULTS.STROKE_DASHTYPE,
                // lineCap: 'butt',
                // lineJoin: 'miter',
                // opacity: 1,
                width: DEFAULTS.STROKE_WIDTH
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Parses an element configuration
             * @param element
             */
            parse: function (element) {
                this.fill.color = (element.options.fill && element.options.fill.color) || DEFAULTS.FILL_COLOR;
                var matches = (element.options.font || '').match(RX_FONT);
                if ($.isArray(matches)) {
                    this.font.fontFamily = (matches[3] || '').trim() || DEFAULTS.FONT_FAMILY;
                    this.font.fontSize = parseInt((matches[2] || '').trim(), 10) || DEFAULTS.FONT_SIZE;
                    this.font.fontStyle = (matches[1] || '').trim() || DEFAULTS.FONT_STYLE;
                } else {
                    this.font.fontFamily = DEFAULTS.FONT_FAMILY;
                    this.font.fontSize = DEFAULTS.FONT_SIZE;
                    this.font.fontStyle = DEFAULTS.FONT_STYLE;
                }
                this.opacity = element.options.opacity || DEFAULTS.OPACITY;
                this.stroke.color = (element.options.stroke && element.options.stroke.color) || DEFAULTS.STROKE_COLOR;
                this.stroke.dashType = (element.options.stroke && element.options.stroke.dashType) || DEFAULTS.STROKE_DASHTYPE;
                this.stroke.width = (element.options.stroke && element.options.stroke.width) || DEFAULTS.STROKE_WIDTH;
            },

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            // TODO: a generic toJSON is not good enough
            // TODO: we need a method per data type or a dataType parameter because path, image and text do not have the same configuratoion options.

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
                if (RX_COLOR.test(this.fill.color)&& this.fill.color !== DEFAULTS.FILL_COLOR) {
                    json.fill = json.fill || {};
                    json.fill.color = this.fill.color;
                }
                // Font (only applies to text)
                var font = normalizeFont(this.font.fontStyle, this.font.fontSize, this.font.fontFamily);
                var defont = normalizeFont(DEFAULTS.FONT_STYLE, DEFAULTS.FONT_SIZE, DEFAULTS.FONT_FAMILY);
                if (font !== defont) {
                    json.font = font;
                }
                // Opacity
                if ($.type(this.opacity) === NUMBER && this.opacity >= 0 && this.opacity < DEFAULTS.OPACITY) {
                    json.opacity = this.opacity;
                }
                // Stroke color (TODO: parse colors)
                if (RX_COLOR.test(this.stroke.color)&& this.stroke.color !== DEFAULTS.STROKE_COLOR) {
                    json.stroke = json.stroke || {};
                    json.stroke.color = this.stroke.color;
                }
                // Stroke dashType
                if (RX_DASHTYPE.test(this.stroke.dashType) && this.stroke.dashType !== DEFAULTS.STROKE_DASHTYPE) {
                    json.stroke = json.stroke || {};
                    json.stroke.dashType = this.stroke.dashType;
                }
                // Stroke width
                if ($.type(this.stroke.width) === NUMBER && this.stroke.width > 0 && this.stroke.width !== DEFAULTS.STROKE_WIDTH) {
                    json.stroke = json.stroke || {};
                    json.stroke.width = this.stroke.width;
                }
                return json;
            }

            /* jshint +W074 */
        });

        /*********************************************************************************
         * VectorDrawing Widget
         *********************************************************************************/

        /**
         * VectorDrawing
         * @class VectorDrawing Widget (kendoVectorDrawing)
         */
        var VectorDrawing = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                that._dialogs = [];
                that._layout();
                that._dataSource();
                that._tool = TOOLS.SELECT;
                that._configuration = new Configuration();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'VectorDrawing',
                id: null,
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                enable: true,
                toolbar: {
                    container: '#toolbar',
                    resizable: true,
                    tools: TOOLBAR
                },
                handle: {
                    stroke: {
                        color: '#808080'
                    },
                    fill: {
                        color: '#ffffff'
                    }
                },
                handleBox: {
                    stroke: {
                        color: '#808080',
                        dashType: 'dot'
                    },
                    fill: { // Important! otherwise the cursor won't show
                        color: '#FFFFFF',
                        opacity: 0
                    }
                }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                // TODO: Review
                var that = this;
                if ($.type(value) === STRING || $.type(value) === NULL) {
                    that._value = value;
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a nullable string if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element
                    .addClass(WIDGET_CLASS)
                    .css({ touchAction: 'none' }); // For Internet Explorer - https://github.com/jquery/jquery/issues/2987
                that.surface = drawing.Surface.create(that.element);
                // that.surface = drawing.Surface.create(that.element, { type: 'canvas' }); // For testing only
                // that.surface = drawing.Surface.create(that.element, { type: 'svg' }); // For testing only
                that._initToolBar();
            },

            /**
             * Initialize toolbar
             * @private
             */
            _initToolBar: function () {
                var that = this;
                var options = that.options;
                that.toolbar = $(DIV)
                    .appendTo(options.toolbar.container)
                    .kendoVectorDrawingToolBar({
                        tools: options.toolbar.tools,
                        resizable: options.toolbar.resizable,
                        action: $.proxy(that._onToolBarAction, that),
                        dialog: $.proxy(that._onToolBarDialog, that)
                    })
                    .data('kendoVectorDrawingToolBar');
                that._setTool(TOOLS.SELECT);
            },

            /**
             * Set the current tool
             * @private
             */
            _setTool: function (tool) {
                assert.type(STRING, tool, kendo.format(assert.messages.type.default, 'tool', STRING));
                assert.type(STRING, TOOLS[tool.toUpperCase()], kendo.format(assert.messages.type.default, 'TOOLS[tool.toUpperCase()]', STRING));
                window.assert(VectorDrawingToolBar, this.toolbar, kendo.format(assert.messages.instanceof.default, 'this.toolbar', 'kendo.ui.VectorDrawingToolBar'));
                var buttonElement = this.toolbar.element.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('tool'), tool));
                this.toolbar.toggle(buttonElement, true);
                if (tool === TOOLS.SELECT) {
                    this.wrapper.css({ cursor: CURSOR.DEFAULT });
                } else {
                    this.wrapper.css({ cursor: CURSOR.CROSSHAIR });
                    this._unselect();
                }
                this._tool = tool;
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Event handler for triggering an action event from the toolbar
             * @param e
             * @private
             */
            _onToolBarAction: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                switch (e.command) {
                    case 'PropertyChangeCommand':
                        this._onPropertyChange(e.options);
                        break;
                    case 'ToolbarArrangeCommand':
                        this._onToolbarArrange(e.options);
                        break;
                    case 'ToolbarImageCommand':
                        this._onToolbarImage(e.options);
                        break;
                    case 'ToolbarRemoveCommand':
                        this._onToolbarRemove(e.options);
                        break;
                    default:
                        $.noop();
                }
            },

            /* jshint +W074 */

            /**
             * Event handler for triggering a dialog event from the toolbar
             * @param e
             * @private
             */
            _onToolBarDialog: function (e) {
                this._openDialog(e.name, e.options);
            },

            /**
             * Open dialog
             * @param name
             * @param options
             * @returns {name}
             */
            _openDialog: function (name, options) {
                var dialog = kendo.vectordrawing.dialogs.create(name, options);
                if (dialog) {
                    dialog.bind('action', this._onToolBarAction.bind(this));
                    dialog.bind('deactivate', this._destroyDialog.bind(this));
                    this._dialogs.push(dialog);
                    var element;
                    if ($.isPlainObject(this._selection)) {
                        element = this._getElementByUid(this._selection.uid);
                    }
                    dialog.open(element);
                    return dialog;
                }
            },

            /**
             * Destroy dialog
             * @private
             */
            _destroyDialog: function () {
                this._dialogs.pop();
            },

            /**
             * Event handler for PropertyChangeCommand
             * @param options
             * @private
             */
            _onPropertyChange: function (options) {
                assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
                var that = this;
                switch (options.property) {
                    case 'tool':
                        that._setTool(options.value);
                        // TODO selecting anything else than text should reset font to defaults
                        break;
                    case 'fillColor':
                        that._configuration.fill.color = options.value;
                        break;
                    case 'strokeColor':
                        that._configuration.stroke.color = options.value;
                        break;
                    case 'strokeWidth':
                        that._configuration.stroke.width = options.value;
                        break;
                    case 'strokeType':
                        that._configuration.stroke.dashType = options.value;
                        break;
                    case 'bold':
                    case 'italic':
                        that._configuration.fontStyle = options.property;
                        break;
                    case 'fontSize':
                        that._configuration.font.fontSize = options.value;
                        break;
                    case 'fontFamily':
                        that._configuration.font.fontFamily = options.value;
                        break;
                }
                // Update selected element if any
                if (options.property !== 'tool' && $.isPlainObject(that._selection) && $.type(that._selection.uid) === STRING) {
                    var dataItem = that.dataSource.getByUid(that._selection.uid);
                    // Note: there is room for optimization by testing changes before assigning
                    // TODO: with/without font which only applies to text
                    dataItem.set('configuration', that._configuration.toJSON());
                }
            },

            /**
             * Event handler for ToolbarArrangeCommand
             * @param options
             * @private
             */
            _onToolbarArrange: function(options) {
                assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
                var that = this;
                if ($.isPlainObject(that._selection) && $.type(that._selection.uid) === STRING) {
                    var dataItem = that.dataSource.getByUid(that._selection.uid);
                    var oldIndex = that.dataSource.indexOf(dataItem);
                    var total = that.dataSource.total();
                    var newIndex = oldIndex;
                    switch (options.value) {
                        case 'forward':
                            newIndex = Math.min(oldIndex + 1, total - 1);
                            break;
                        case 'front':
                            newIndex = total - 1;
                            break;
                        case 'back':
                            newIndex = 0;
                            break;
                        case 'backward':
                            newIndex = Math.max(oldIndex - 1, 0);
                            break;
                    }
                    that.dataSource.remove(dataItem);
                    that.dataSource.insert(newIndex, dataItem);
                    // Note: this triggers that.refresh which redraws the surface
                }
            },

            /**
             * Event handler for ToolbarImageCommand
             * @param options
             * @private
             */
            _onToolbarImage: function (options) {
                this._setTool(TOOLS.IMAGE); // TODO: probably not here - should be done before opening the dialog and teh button should be active (orange)
                this._image = options.url;
            },

            /**
             * Event handler for ToolbarRemoveCommand
             * @private
             */
            _onToolbarRemove: function() {
                var that = this;
                if ($.isPlainObject(that._selection) && $.type(that._selection.uid) === STRING) {
                    var dataItem = that.dataSource.getByUid(that._selection.uid);
                    // Remove element from selection
                    that._selection = undefined;
                    // Remove from dataSource, which triggers the refresh method
                    that.dataSource.remove(dataItem);
                }
            },

            /**
             * Apply new configuration to element
             * @param element
             * @private
             */
            _applyConfiguration: function (element) {
                // TODO
            },

            /**
             * Init mouse events
             * @private
             */
            _initMouseEvents: function () {
                // IMPORTANT
                // We can have several containers containing connectors on a page
                // But we only have one set of event handlers shared across all containers
                // So we cannot use `this`, which is specific to this math graph
                var that = this;
                var data = {}; // We need an object so that data is passed by reference between handlers
                $(document).off(NS);
                if (that._enabled) {
                    $(document) // MouseDown has to occur on the widget surface, but MouseUp and MouseEnd can occur anywhere on the document
                        .on(MOUSEDOWN, WIDGET_SELECTOR, data, $.proxy(that._onMouseDown, that))
                        .on(MOUSEMOVE, data, $.proxy(that._onMouseMove, that))
                        .on(MOUSEUP, WIDGET_SELECTOR, data, $.proxy(that._onMouseUp, that))
                        .on(MOUSEUP, data, $.proxy(that._onMouseEnd, that));
                }
            },

            /**
             * Get mouse position in canvas coordinates from screen cooordinates
             * considering the widgets might be scaled
             * @param e
             * @private
             */
            _getMousePosition: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                assert.ok(this._enabled, kendo.format(assert.messages.ok.default, 'this._enabled'));
                var scaler = this.element.closest(this.options.scaler);
                var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                var mouse = util.getMousePosition(e, this.element);
                return new geometry.Point(mouse.x / scale, mouse.y / scale).round();
            },

            /**
             * Find element at position
             * @param position
             * @private
             */
            _getElementAtPosition: function (position) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                var elements = this.surface.exportVisual().children;
                var ret;
                // The last elements are on top of the others, so we loop from last to first
                for (var i = elements.length - 1; i >= 0; i--) {
                    var element = elements[i];
                    if (element instanceof drawing.Group && $.type(element.options.get(UID) === UNDEFINED)) {
                        // This is our handle group which should be discarded
                        continue;
                    }
                    // containsPoint does not work with shapes that have no fill color
                    // if (elements[i].containsPoint(position)) {
                    var bbox = element.clippedBBox(); // TODO: beware transformations, especially rotations
                    if ((position.x >= bbox.origin.x) && (position.x <= bbox.origin.x + bbox.size.width) &&
                        (position.y >= bbox.origin.y) && (position.y <= bbox.origin.y + bbox.size.height)) {
                        ret = element;
                        break;
                    }
                }
                return ret;
            },

            /**
             * Get a drawing element form its uid
             * @param uid
             * @private
             */
            _getElementByUid: function (uid) {
                assert.type(STRING, uid, kendo.format(assert.messages.type.default, UID, STRING));
                assert.instanceof(Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                var children = this.surface.exportVisual().children;
                for (var i = 0, length = children.length; i < length; i++) {
                    if (children[i].options.get(UID) === uid) {
                        return children[i];
                    }
                }
            },

            /**
             * Get handles around element
             * @param element
             * @private
             */
            _getHandles: function (element) {
                assert.instanceof(drawing.Element, element, kendo.format(assert.messages.instanceof.default, 'element', 'kendo.drawing.Element'));
                // The following two lines test that we display handles on a drawing.Element which has a valid uid with a dataItem in dataSource
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.instanceof(kendo.data.ObservableObject, this.dataSource.getByUid(element.options.get(UID)), kendo.format(assert.messages.instanceof.default, 'this.dataSource.getByUid(element.options.get(UID))', 'kendo.data.ObservableObject'));
                var size = 10;
                var dist = 40;
                var bbox = element.clippedBBox();
                var group = new drawing.Group();
                // handleBox
                var rectGeometry = bbox;
                var rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handleBox, { cursor: CURSOR.MOVE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.BBOX);
                group.append(rect);
                // line to rotation handle
                var position = new geometry.Point((bbox.topLeft().x + bbox.topRight().x) / 2, bbox.topRight().y);
                var center = new geometry.Point((bbox.topLeft().x + bbox.topRight().x) / 2, bbox.topRight().y - dist);
                var path = new drawing.Path($.extend(true, {}, this.options.handleBox));
                path.moveTo(position).lineTo(center);
                group.append(path);
                // nw (top left) handle
                position = bbox.topLeft();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.NW_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.NW);
                group.append(rect);
                // n (top) handle
                position = new geometry.Point((bbox.topLeft().x + bbox.topRight().x) / 2, bbox.topRight().y);
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.N_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.N);
                group.append(rect);
                // ne (top right) handle
                position = bbox.topRight();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.NE_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.NE);
                group.append(rect);
                // e (right) handle
                position = new geometry.Point(bbox.topRight().x, (bbox.topRight().y + bbox.bottomRight().y) / 2);
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.E_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.E);
                group.append(rect);
                // se (bottom right handle)
                position = bbox.bottomRight();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.SE_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.SE);
                group.append(rect);
                // s (bottom handle)
                position = new geometry.Point((bbox.bottomLeft().x + bbox.bottomRight().x) / 2, bbox.bottomRight().y);
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.S_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.S);
                group.append(rect);
                // sw (bottom left handle)
                position = bbox.bottomLeft();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.SW_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.SW);
                group.append(rect);
                // w (left) handle
                position = new geometry.Point(bbox.topLeft().x, (bbox.topLeft().y + bbox.bottomLeft().y) / 2);
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.W_RESIZE })); // TODO cursor depends on rotation
                rect.options.set('role', HANDLES.W);
                group.append(rect);
                // r (rotation) handle
                var circleGeometry = new geometry.Circle(center, size /  2);
                var circle = new drawing.Circle(circleGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.ROTATE }));
                circle.options.set('role', HANDLES.R);
                group.append(circle);
                // Return the group that makes the handle box
                return group;
            },

            /**
             * Get handle role at position
             * @param position
             * @private
             */
            _getHandleRoleAtPosition: function (position) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                if (this._selection) {
                    assert.instanceof(drawing.Group, this._selection.handles, kendo.format(assert.messages.instanceof.default, 'this._selection', 'kendo.drawing.Group'));
                    var role;
                    var handles = this._selection.handles;
                    for (var i = 0, length = handles.children.length; i < length; i++) {
                        var handle = handles.children[i];
                        var bbox = handle.clippedBBox(); // TODO: Beware transformations: clippedBBox might not be the right one !!!!!
                        if ((position.x >= bbox.origin.x) && (position.x <= bbox.origin.x + bbox.size.width) &&
                            (position.y >= bbox.origin.y) && (position.y <= bbox.origin.y + bbox.size.height)) {
                            if ($.type(role) === UNDEFINED || handle.options.get('role') !== HANDLES.BBOX) {
                                role = handle.options.get('role');
                            }
                        }
                    }
                    return role;
                }
            },

            /**
             * Select an element and display handles
             * @param element
             * @private
             */
            _select: function (element) {
                if (element instanceof drawing.Element) {
                    var uid = element.options.get(UID);
                    if (this.dataSource.getByUid(uid) instanceof kendo.data.ObservableObject) {
                        assert.type(STRING, uid, kendo.format(assert.messages.type.default, 'uid', STRING));
                        // Draw the handles
                        var handles = this._getHandles(element);
                        this.surface.draw(handles);
                        // Update selection
                        this._selection = {
                            // Note: we cannot rely on the element which might be redrawn via the refresh method.
                            // This is the reason why we store teh dataSource uid in the element optionStore and use the same uid to keep track of selection
                            uid: uid, // Note: we could consider an array to allow for multiple selections
                            handles: handles
                        };
                        // Parse element configuration
                        this._configuration.parse(element);
                        // TODO refresh toolbar
                    }
                }
            },

            /**
             * Unselect the current selection
             * @private
             */
            _unselect: function () {
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                // Redraw from database (removes handles)
                this._selection = undefined;
                this.refresh();
            },

            /**
             * Edit an element on double click
             * @param element
             * @private
             */
            _edit: function (element) {
                // TODO edit an element by double clicking it
                if (element instanceof drawing.Path || element instanceof drawing.MultiPath) {
                    // See comment in this._drawPath for including drawing.MultiPath
                    // paths get handles on each anchor and possibly handles for control points
                    window.alert('Edit a path/shape');
                } else if (element instanceof drawing.Image) {
                    // images can be changed
                    window.alert('Edit an image');
                } else if (element instanceof drawing.Text) {
                    // text turns into a (SVG) textbox
                    window.alert('Edit text');
                }
            },

            /**
             * Unedit an element
             * @param element
             * @private
             */
            _unedit: function () {
                // TODO Unedit exits edit mode especially for text and paths
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * MouseDown event handler
             * @param e
             * @private
             */
            _onMouseDown: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                assert.ok(this.element.has(e.target), 'MouseDown event should have occurred on the widget that handles the event');
                var that = this;
                // The surface click event and surface.eventTarget(e) won't work properly because our widget is scaled, so we need our own positioning
                var position = that._getMousePosition(e);
                // Clear mousedown form e.data
                if ([TOOLS.SELECT, TOOLS.LINE].indexOf(that._tool) === -1) {
                    delete e.data.mousedown;
                }
                switch (that._tool) {
                    case TOOLS.SELECT:
                        that._startSelect(position, e.data);
                        break;
                    case TOOLS.CIRCLE:
                        that._startCircle(position, e.data);
                        break;
                    case TOOLS.IMAGE:
                        that._startImage(position, e.data);
                        break;
                    case TOOLS.LINE:
                        if ($.type(e.data.path) === UNDEFINED) {
                            that._startLine(position, e.data);
                            e.data.mousedown = Date.now();
                        } else if (Date.now() > e.data.mousedown + DBLCLICK_TTL) {
                            that._breakLine(position, e.data);
                            e.data.mousedown = Date.now();
                        } else {
                            // A double-click ends the path
                            that._endLine(position, e.data);
                            e.data.endLine = true;
                        }
                        break;
                    case TOOLS.PEN:
                        that._startPen(position, e.data);
                        break;
                    case TOOLS.RECT:
                        that._startRect(position, e.data);
                        break;
                    case 'shape':
                        that._startShape(position, e.data);
                        break;
                    case TOOLS.TEXT:
                        that._startText(position, e.data);
                        break;
                }
                // Make sure we know which widget we are dealing with in case there are several widgets on the page
                e.data.widget = that;
            },

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * MouseMove event handler
             * @param e
             * @private
             */
            _onMouseMove: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                var that = this;
                // Discard mouse events unless there is e.data
                if ($.type(e.data) === OBJECT && e.data.widget === that) {
                    var position = that._getMousePosition(e);
                    switch (that._tool) {
                        case TOOLS.SELECT:
                            if ($.type(e.data.transformation) === STRING) {
                                that._continueTransformation(position, e.data);
                            }
                            break;
                        case TOOLS.CIRCLE:
                            that._continueCircle(position, e.data);
                            break;
                        case TOOLS.IMAGE:
                            that._continueImage(position, e.data);
                        case TOOLS.LINE:
                            that._continueLine(position, e.data);
                            break;
                        case TOOLS.PEN:
                            that._continuePen(position, e.data);
                            break;
                        case TOOLS.RECT:
                            that._continueRect(position, e.data);
                            break;
                        case 'shape':
                            that._continueShape(position, e.data);
                            break;
                        case TOOLS.TEXT:
                            $.noop();
                            break;
                    }
                }
            },

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * MouseUp event handler (within the widget boundaries)
             * Proceed with the current action
             * @param e
             * @private
             */
            _onMouseUp: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                var that = this;
                // Discard mouse events unless there is e.data
                if ($.type(e.data) === OBJECT &&  e.data.widget === that) {
                    var position = that._getMousePosition(e);
                    switch (that._tool) {
                        case TOOLS.SELECT:
                            if ($.type(e.data.transformation) === STRING) {
                                that._endTransformation(position, e.data);
                            }
                            break;
                        case TOOLS.CIRCLE:
                            that._endCircle(position, e.data);
                            break;
                        case TOOLS.IMAGE:
                            that._endImage(position, e.data);
                            break;
                        case TOOLS.PEN:
                            that._endPen(position, e.data);
                            break;
                        case TOOLS.RECT:
                            that._endRect(position, e.data);
                            break;
                        case TOOLS.LINE:
                        case 'shape':
                        case TOOLS.TEXT:
                            $.noop();
                            break;
                    }
                    // Make sure we know MouseUp did occur on the drawing.Surface
                    // Becuase any action resulting for a mouseUp outside the drawing.Surface should be discarded
                    e.data.mouseUp = true;
                }
            },

            /* jshint +W074 */

            /**
             * MouseUp event handler (anywhere on the document)
             * Cancels the current action if _mouseUp did not occur to avoid `losing` elements at far coordinates
             * @param e
             * @private
             */
            _onMouseEnd: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                // Discard mouse events unless there is e.data
                if ($.type(e.data) === OBJECT &&  e.data.widget === this) {
                    var mouseUp = e.data.mouseUp;
                    // Reset data for next shape unless we are drawing a multiline
                    if (this._tool !== TOOLS.LINE || e.data.endLine === true) {
                        // We cannot assign a new object as in e.data = {} otherwise we lose the referenced object set in this._initMouseEvents
                        for (var prop in e.data) {
                            if (e.data.hasOwnProperty(prop) && (prop !== 'mousedown' || this._tool !== TOOLS.SELECT)) {
                                // Reset e.data except mousedown for the select tool
                                delete e.data[prop];
                            }
                        }
                        // Reset tool
                        this._setTool(TOOLS.SELECT);
                    }
                    // Cancel everyting if mouseUp did not occur on the surface
                    if (!mouseUp) {
                        this.refresh();
                    }
                }
            },

            /**
             * Start selection
             * @param position
             * @param data
             * @private
             */
            _startSelect: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                var that = this;
                // Elements with no fill won't receive a mouse event when clicked in the fill area.
                // So we need to find the element at position ourselves.
                var role = that._getHandleRoleAtPosition(position);
                var element = that._getElementAtPosition(position);
                if (role === HANDLES.BBOX && $.type(data.mousedown) === NUMBER && Date.now() < data.mousedown + DBLCLICK_TTL) {
                    // This is a double click (the first click displayed the handleBox)
                    delete data.mousedown;
                    that._unedit();
                    that._edit(element);
                } else if ($.type(role) === STRING) {
                    // This is a mousedown on any handle including the bbox
                    if (role === 'bbox') {
                        data.mousedown = Date.now();
                    } else {
                        delete data.mousedown;
                    }
                    data.role = role;
                    that._startTransformation(position, data);
                } else if (element instanceof kendo.drawing.Element) {
                    // Record the first mousedown
                    data.mousedown = Date.now();
                    that._unselect();
                    that._select(element);
                } else {
                    delete data.mousedown;
                    that._unselect();
                }
            },

            /**
             * Start transformation
             * @param position
             * @param data
             * @private
             */
            _startTransformation: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.type(STRING, data.role, kendo.format(assert.messages.type.default, 'data.role', STRING));
                switch (data.role) {
                    case HANDLES.NW:
                    case HANDLES.N:
                    case HANDLES.NE:
                    case HANDLES.E:
                    case HANDLES.SE:
                    case HANDLES.S:
                    case HANDLES.SW:
                    case HANDLES.W:
                        // TODO: Corner handles scale proportionally
                        data.transformation = TRANSFORMATION.SCALE;
                        data.previous = position;
                        break;
                    case HANDLES.R:
                        data.transformation = TRANSFORMATION.ROTATE;
                        // TODO
                        break;
                    // Note: handles are tested first because they overlap the bbox
                    case HANDLES.BBOX:
                    default:
                        data.transformation = TRANSFORMATION.TRANSLATE;
                        data.previous = position;
                        break;
                }
            },

            /**
             * Continue Transformation
             * @param position
             * @param data
             * @private
             */
            _continueTransformation: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.type(STRING, data.transformation, kendo.format(assert.messages.type.default, 'data.transformation', STRING));
                var transformation = new geometry.Transformation();
                switch (data.transformation) {
                    case TRANSFORMATION.ROTATE:
                        // TODO
                        break;
                    case TRANSFORMATION.SCALE:
                        // TODO
                        break;
                    case TRANSFORMATION.TRANSLATE:
                        transformation.translate(position.x - data.previous.x, position.y - data.previous.y);
                        data.previous = position;
                        break;
                }
                var element = this._getElementByUid(this._selection.uid);
                var elementTransform = element.transform() || geometry.transform();
                elementTransform = elementTransform.multiply(transformation);
                element.transform(elementTransform);
                var handles = this._selection.handles;
                var handlesTransform = handles.transform() || geometry.transform();
                handlesTransform = handlesTransform.multiply(transformation);
                handles.transform(handlesTransform);
            },

            /**
             * End transformation
             * @param position
             * @param data
             * @private
             */
            _endTransformation: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.type(STRING, data.transformation, kendo.format(assert.messages.type.default, 'data.transformation', STRING));
                this._continueTransformation(position, data);
                var uid = this._selection.uid;
                var dataItem = this.dataSource.getByUid(uid);
                var element = this._getElementByUid(uid);
                var transform = element.transform() || geometry.transform();
                dataItem.set('transformation', transform.matrix().toArray());
            },

            /**
             * Start drawing a circle (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startCircle: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
                var circleGeometry = new geometry.Circle(position, 1);
                var circle = new drawing.Circle(circleGeometry, this._configuration.toJSON());
                this.surface.draw(circle);
                data.origin = position;
                data.circle = circle;
            },

            /**
             * Continue drawing a circle (MouseMove)
             * @param position
             * @param data
             * @private
             */
            _continueCircle: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.instanceof(geometry.Point, data.origin, kendo.format(assert.messages.instanceof.default, 'data.origin', 'kendo.geometry.Point'));
                assert.instanceof(drawing.Circle, data.circle, kendo.format(assert.messages.instanceof.default, 'data.circle', 'kendo.drawing.Circle'));
                var origin = data.origin;
                var center = new geometry.Point((origin.x + position.x) /  2, (origin.y + position.y) /  2);
                // var radius = position.distanceTo(origin) / (2 * sqrt (2));
                var radius = Math.sqrt(Math.pow(position.x - origin.x, 2) + Math.pow(position.y - origin.y, 2)) / (2 * Math.sqrt(2));
                data.circle.geometry(new geometry.Circle(center, radius));
            },

            /**
             * End drawing a circle (MouseUp)
             * @param position
             * @param data
             * @private
             */
            _endCircle: function (position, data) {
                // This._continueCircle has asserts
                // assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                this._continueCircle(position, data);
                var circleGeometry = data.circle.geometry();
                this.dataSource.add({
                    type: DATA_TYPE.CIRCLE, // TODO Make it a path
                    center: circleGeometry.getCenter().toArray(),
                    radius: circleGeometry.getRadius(),
                    configuration: this._configuration.toJSON()
                });
            },

            /**
             * Start drawing an image (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startImage: function (position, data) {
                data.origin = position;
                data.src = this._image;
                var rect = new geometry.Rect(position, [250, 250]); // TODO consider naturalHeight and naturalWidth at least for proportions (load in hidden img tag)
                var image = new drawing.Image(data.src, rect);
                this.surface.draw(image);
            },


            /**
             * Continue drawing an image (MouseMove)
             * @param position
             * @param data
             * @private
             */
            _continueImage: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // TODO: resizes the shape
            },


            /**
             * End drawing an image (MouseUp)
             * @param position
             * @param data
             * @private
             */
            _endImage: function (position, data) {
                // this._continueImage has asserts
                // assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                this._continueImage(position, data);
                this.dataSource.add({
                    type: DATA_TYPE.IMAGE,
                    src: data.src, // TODO a url or an encoded stream????
                    origin: data.origin.toArray(),
                    size: [250, 250], // TODO Review with _continueImage
                    configuration: this._configuration.toJSON() // TODO: Only opacity see http://docs.telerik.com/kendo-ui/api/javascript/drawing/image#configuration
                });
            },

            /**
             * Start drawing line (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startLine: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
                var path = new drawing.PathEx(this._configuration.toJSON());
                path.moveTo(position);
                path.lineTo(position);
                this.surface.draw(path);
                data.origin = position;
                data.path = path;
            },

            /**
             * Break drawing line (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _breakLine: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.instanceof(geometry.Point, data.origin, kendo.format(assert.messages.instanceof.default, 'data.origin', 'kendo.geometry.Point'));
                assert.instanceof(drawing.Path, data.path, kendo.format(assert.messages.instanceof.default, 'data.path', 'kendo.drawing.Path'));
                data.path.lineTo(position.round());
            },

            /**
             * Move drawing line (MouseLine)
             * @param position
             * @param data
             * @private
             */
            _continueLine: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.instanceof(geometry.Point, data.origin, kendo.format(assert.messages.instanceof.default, 'data.origin', 'kendo.geometry.Point'));
                assert.instanceof(drawing.Path, data.path, kendo.format(assert.messages.instanceof.default, 'data.path', 'kendo.drawing.Path'));
                data.path.segments[data.path.segments.length - 1].anchor(position.round());
            },

            /**
             * End drawing line (MouseUp)
             * @param position
             * @param data
             * @private
             */
            _endLine: function (position, data) {
                // this._continueLine has asserts
                // assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                this._continueLine(position, data);
                this.dataSource.add({
                    type: DATA_TYPE.PATH,
                    svg: data.path.stringify(),
                    // closed: false, // TODO maybe a dialog box here to close and fill the path or is there a better option?
                    configuration: this._configuration.toJSON()
                });
            },

            /**
             * Start free drawing (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startPen: function (position, data) {
                // TODO use bezier curves to remove useless points as in
                // https://github.com/soswow/fit-curve
                // http://soswow.github.io/fit-curve/demo/
                // http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
                var path = new drawing.PathEx(this._configuration.toJSON());
                path.moveTo(position);
                this.surface.draw(path);
                data.origin = position;
                data.path = path;
            },

            /**
             * Continue free drawing (MouseMove)
             * @param position
             * @param data
             * @private
             */
            _continuePen: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.instanceof(geometry.Point, data.origin, kendo.format(assert.messages.instanceof.default, 'data.origin', 'kendo.geometry.Point'));
                assert.instanceof(drawing.Path, data.path, kendo.format(assert.messages.instanceof.default, 'data.path', 'kendo.drawing.Path'));
                data.path.lineTo(position.round());
            },

            /**
             * End free drawing (MouseUp)
             * @param position
             * @param data
             * @private
             */
            _endPen: function (position, data) {
                // this._continuePen has asserts
                // assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                this._continuePen(position, data);
                data.path.simplify(10, true).smooth();
                this.dataSource.add({
                    type: DATA_TYPE.PATH,
                    svg: data.path.stringify(),
                    // closed: false, // TODO maybe a dialog box here to close and fill the path or is there a better option?
                    configuration: this._configuration.toJSON()
                });
            },

            /**
             * Start drawing a rect (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startRect: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
                var rectGeometry = new geometry.Rect(position, [1, 1]);
                var rect = new drawing.Rect(rectGeometry, this._configuration.toJSON());
                this.surface.draw(rect);
                data.origin = position;
                data.rect = rect;
            },

            /**
             *
             * @param position
             * @param data
             * @private
             */
            _continueRect: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                assert.instanceof(geometry.Point, data.origin, kendo.format(assert.messages.instanceof.default, 'data.origin', 'kendo.geometry.Point'));
                assert.instanceof(drawing.Rect, data.rect, kendo.format(assert.messages.instanceof.default, 'data.rect', 'kendo.drawing.Rect'));
                var origin = data.origin;
                // Change position of origin depending where we move to
                var size = [Math.abs(position.x - origin.x), Math.abs(position.y - origin.y)];
                data.rect.geometry(new geometry.Rect(origin, size));
            },

            /**
             *
             * @param position
             * @param data
             * @private
             */
            _endRect: function (position, data) {
                // this._continueRect has asserts
                // assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                this._continueRect(position, data);
                var rectGeometry = data.rect.geometry();
                this.dataSource.add({
                    type: DATA_TYPE.RECT,
                    origin: rectGeometry.getOrigin().toArray(),
                    size: [rectGeometry.getSize().width, rectGeometry.getSize().height],
                    configuration: this._configuration.toJSON()
                });
            },

            /**
             * Start drawing a shape (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startShape: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
            },

            /**
             * Continue drawing a shape (MouseMove)
             * @param position
             * @param data
             * @private
             */
            _continueShape: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
                // TODO: resizes the shape
            },

            /**
             * Start drawing text (MouseDown)
             * @param position
             * @param data
             * @private
             */
            _startText: function (position, data) {
                assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
            },

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function () {
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = DataSource.create(that.options.dataSource);

                // bind to the change event to refresh the widget
                if (that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                that._refreshHandler = $.proxy(that.refresh, that);
                that.dataSource.bind(CHANGE, that._refreshHandler);

                // trigger a read on the dataSource if one hasn't happened yet
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                var that = this;
                // set the internal datasource equal to the one passed in by MVVM
                that.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                that._dataSource();
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Refresh upon changing the dataSource
             * Redraw all connections
             */
            refresh: function () {
                var that = this;
                assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                if (that.surface instanceof Surface) {
                    var dataItems = this.dataSource.data();
                    // Clear surface
                    that.surface.clear();
                    // Draw all items in dataSource
                    for (var i = 0; i < dataItems.length; i++) {
                        var dataItem = dataItems[i];
                        switch (dataItem.type) {
                            case DATA_TYPE.CIRCLE: // TODO: make it a path
                                that._drawCircle(dataItem);
                                break;
                            case DATA_TYPE.IMAGE:
                                that._drawImage(dataItem);
                                break;
                            case DATA_TYPE.PATH:
                                that._drawPath(dataItem);
                                break;
                            case DATA_TYPE.RECT: // TODO make it a path
                                that._drawRect(dataItem);
                                break;
                            case DATA_TYPE.TEXT:
                                that._drawText(dataItem);
                                break;
                        }
                    }
                    // Restore selection
                    if ($.isPlainObject(this._selection) && $.type(this._selection.uid) === STRING) {
                        // Note that the surface has just been redrawn with new elements
                        var element = this._getElementByUid(this._selection.uid);
                        that._select(element);
                    }
                }
            },

            /* jshint +W074 */

            /**
             * Draw a circle
             * @param dataItem
             * @private
             */
            _drawCircle: function (dataItem) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                assert.equal(DATA_TYPE.CIRCLE, dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', DATA_TYPE.CIRCLE));
                var uid = dataItem.get(UID);
                var item = dataItem.toJSON();
                // Draw shape
                var circleGeometry = new geometry.Circle(item.center, item.radius);
                var circle = new drawing.Circle(circleGeometry, item.configuration);
                // Apply transformations
                var matrix = $.isArray(item.transformation) ? new geometry.Matrix(
                    item.transformation[0],
                    item.transformation[1],
                    item.transformation[2],
                    item.transformation[3],
                    item.transformation[4],
                    item.transformation[5]
                ) : geometry.Matrix.unit();
                var transform = new geometry.Transformation(matrix);
                circle.transform(transform);
                // Track uid correspondence with dataSource
                circle.options.set(UID, uid);
                this.surface.draw(circle);
            },

            /**
             * Draw an image
             * @param dataItem
             * @private
             */
            _drawImage: function (dataItem) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                assert.equal(DATA_TYPE.IMAGE, dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', DATA_TYPE.IMAGE));
                var uid = dataItem.get(UID);
                var item = dataItem.toJSON();
                // Draw shape
                var rectGeometry = new geometry.Rect(item.origin, item.size);
                var image = new drawing.Image(item.src, rectGeometry);
                // Apply transformations
                var matrix = $.isArray(item.transformation) ? new geometry.Matrix(
                    item.transformation[0],
                    item.transformation[1],
                    item.transformation[2],
                    item.transformation[3],
                    item.transformation[4],
                    item.transformation[5]
                ) : geometry.Matrix.unit();
                var transform = new geometry.Transformation(matrix);
                image.transform(transform);
                // Track uid correspondence with dataSource
                image.options.set(UID, uid);
                this.surface.draw(image);
            },

            /**
             * Draw a path
             * @param dataItem
             * @private
             */
            _drawPath: function (dataItem) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                assert.equal(DATA_TYPE.PATH, dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', DATA_TYPE.PATH));
                var uid = dataItem.get(UID);
                var item = dataItem.toJSON();
                // Draw path: drawing.Path.parse returns a drawing.MultiPath
                // @see https://github.com/telerik/kendo-ui-core/issues/3106
                var path = drawing.Path.parse(item.svg, item.configuration);
                // Apply transformations
                var matrix = $.isArray(item.transformation) ? new geometry.Matrix(
                    item.transformation[0],
                    item.transformation[1],
                    item.transformation[2],
                    item.transformation[3],
                    item.transformation[4],
                    item.transformation[5]
                ) : geometry.Matrix.unit();
                var transform = new geometry.Transformation(matrix);
                path.transform(transform);
                // Track uid correspondence with dataSource
                path.options.set(UID, uid);
                this.surface.draw(path);
            },

            /**
             * Draw a rectangle
             * @param dataItem
             * @private
             */
            _drawRect: function (dataItem) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                assert.equal(DATA_TYPE.RECT, dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', DATA_TYPE.RECT));
                var uid = dataItem.get(UID);
                var item = dataItem.toJSON();
                var rectGeometry = new geometry.Rect(item.origin, item.size);
                var rect = new drawing.Rect(rectGeometry, item.configuration);
                var matrix = $.isArray(item.transformation) ? new geometry.Matrix(
                    item.transformation[0],
                    item.transformation[1],
                    item.transformation[2],
                    item.transformation[3],
                    item.transformation[4],
                    item.transformation[5]
                ) : geometry.Matrix.unit();
                var transform = new geometry.Transformation(matrix);
                rect.transform(transform);
                rect.options.set(UID, uid);
                this.surface.draw(rect);
            },

            /**
             * Draw text
             * @param dataItem
             * @private
             */
            _drawText: function (dataItem) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                assert.equal(DATA_TYPE.TEXT, dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', DATA_TYPE.TEXT));
                var uid = dataItem.get(UID);
                var item = dataItem.toJSON();
                // Position
                var point = geometry.Point.create(item.position);
                var text = new drawing.Text(item.text, point, item.configuration);
                var matrix = $.isArray(item.transformation) ? new geometry.Matrix(
                    item.transformation[0],
                    item.transformation[1],
                    item.transformation[2],
                    item.transformation[3],
                    item.transformation[4],
                    item.transformation[5]
                ) : geometry.Matrix.unit();
                var transform = new geometry.Transformation(matrix);
                text.transform(transform);
                text.options.set(UID, uid);
                this.surface.draw(text);
            },

            /**
             * Enable/disable user interactivity on connector
             */
            enable: function (enabled) {
                this._enabled = !!enabled;
                this._initMouseEvents();
            },

            /**
             * Resizes the drawing surface
             * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing/surface#methods-resize
             */
            resize: function () {
                // TODO - save/export should have the right size
                this.surface.resize();
            },

            /**
             * Open SVG file
             */
            open: function () {
                // TODO - we should be able to roundtrip with save
            },

            /**
             * Save SVG file
             * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing#methods-exportSVG
             */
            save: function () {
                assert.instanceof(Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                // TODO: unselect/unedit before to avoid exporting handles
                var root = this.surface.exportVisual();
                return drawing.exportSVG(root);
                // TODO: add done callback to reselect after
            },

            /**
             * Export as PNG
             * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing#methods-exportImage
             * @see https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
             */
            export: function () {
                assert.instanceof(Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                // TODO: unselect/unedit before to avoid exporting handles
                var root = this.surface.exportVisual();
                return drawing.exportImage(root);
                // TODO: add done callback to reselect after
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                $(document).off(NS);
                // Release references
                that.toolbar.destroy();
                that.toolbar.element.remove();
                that.toolbar = undefined;
                that.surface = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
                // Remove widget class
                element.removeClass(WIDGET_CLASS);
            }

        });
        kendo.ui.plugin(VectorDrawing);

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
         * VectorDrawingToolBar Widget
         *********************************************************************************/

        kendo.vectordrawing = { messages: {} };

        var TOOLBAR_MESSAGES = kendo.vectordrawing.messages.toolbar = {
            //Tools
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
                    'class': 'k-spreadsheet-window',
                    'html': '<div></div>' + '<div class=\'k-action-buttons\'>' + '<button class=\'k-button k-primary\' data-bind=\'click: apply\'>' + TOOLBAR_MESSAGES.colorPalette.apply + '</button>' + '<button class=\'k-button\' data-bind=\'click: close\'>' + TOOLBAR_MESSAGES.colorPalette.cancel + '</button>' + '</div>'
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
                    value: DEFAULTS.FONT_SIZE
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
                this.value(kendo.parseInt(value) || DEFAULTS.FONT_SIZE);
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
                        defaultSize: DEFAULTS.FONT_SIZE
                    }
                });
            },
            update: function (value) {
                this._value = value || DEFAULTS.FONT_SIZE;
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
                ddl.value(DEFAULTS.FONT_FAMILY);
                this.element.data({
                    type: 'fontFamily',
                    fontFamily: this
                });
            },
            update: function (value) {
                this.value(value || DEFAULTS.FONT_FAMILY);
            }
        });
        var FontFamilyButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({
                    name: 'fontFamilyEx',
                    options: {
                        fonts: FONT_FAMILIES,
                        defaultFont: DEFAULTS.FONT_FAMILY
                    }
                });
            },
            update: function (value) {
                this._value = value || DEFAULTS.FONT_FAMILY;
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
                    url: 'http://combiboilersleeds.com/images/image/image-7.jpg', // TODO url,
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
                    if (ev.keyCode == 13) {
                        model.url = $(this).val();
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.apply();
                    } else if (ev.keyCode == 27) {
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
        var ColorChooser = VectorDrawingDialog.extend({
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
        var ColorPickerDialog = ColorChooser.extend({
            init: function (options) {
                options.width = 177;
                ColorChooser.fn.init.call(this, options);
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
        var CustomColorDialog = ColorChooser.extend({
            init: function (options) {
                options.width = 268;
                ColorChooser.fn.init.call(this, options);
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
