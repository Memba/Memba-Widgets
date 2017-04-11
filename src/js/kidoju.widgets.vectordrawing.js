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
        // TODO: we also need spreadsheet for the toolbar
        './kidoju.widjets.common'
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
        var WIDGET_CLASS = 'kj-drawing';
        var WIDGET_SELECTOR = DOT + 'kj-drawing';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var UID = 'uid';
        var CURSOR = {
            CROSSAIR: 'crosshair',
            DEFAULT: 'default',
            MOVE: 'move',
            NESW_RESIZE: 'nesw-resize', // for top right and bottom left
            NWSE_RESIZE: 'nwse-resize' // for top left and bottom right
            // SAMPLE: url(smiley.gif),url(myBall.cur),auto;
        };
        var HANDLES = {
            BBOX: 'handles.bbox',
            BOTTOMLEFT: 'handles.bottomLeft',
            BOTTOMRIGHT: 'handles.bottomRight',
            TOPLEFT: 'handles.topLeft',
            TOPRIGHT: 'handles.topRight'
        };
        var TRANSFORMATION = {
            ROTATE: 'rotate',
            SCALE: 'scale',
            TRANSLATE: 'translate'
        };
        var RX_COLOR = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
        var RX_DASHTYPE = /^(dash|dashDot|dot|longDash|longDashDot|longDashDotDot|solid)$/;
        var RX_FONT = /^(normal\s+|italic\s+|oblique\s+|initial\s+|inherit\s+)?([0-9\.]+[a-z]+\s+)?(.+)$/;
        var TOOLS = [
            'select',
            'pen',
            'line',
            'rect',
            'circle',
            'text'
        ];
        var TOOLBAR = [
            TOOLS,
            [
                'bold',
                'italic'
            ],
            'backgroundColor',
            'textColor',
            'fontSize',
            'fontFamily'
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

            toJSON: function () {
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
                that._layout();
                that._dataSource();
                that._tool = 'select';
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
                    resizable: false, // TODO
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
                // touch-action: 'none' is for Internet Explorer - https://github.com/jquery/jquery/issues/2987
                that.element
                    .addClass(WIDGET_CLASS)
                    .css({ touchAction: 'none' });
                that.surface = drawing.Surface.create(that.element);
                // that.surface = drawing.Surface.create(that.element, { type: 'canvas' }); // TODO: remove the type, for testing only
                // that.surface = drawing.Surface.create(that.element, { type: 'svg' }); // TODO: remove the type, for testing only
                that._initToolBar();
            },

            /**
             * Initialize toolbar
             * @private
             */
            _initToolBar: function () {
                var that = this;
                var options = that.options;
                that.toolBar = $(DIV)
                    .appendTo(options.toolbar.container)
                    .kendoVectorDrawingToolBar({
                        tools: options.toolbar.tools,
                        resizable: options.toolbar.resizable,
                        action: $.proxy(that._onToolBarAction, that),
                        dialog: $.proxy(that._onToolBarDialog, that)
                    })
                    .data('kendoVectorDrawingToolBar');
                that._setTool('select');
            },

            /**
             * Set the current tool
             * @private
             */
            _setTool: function (tool) {
                assert.enum(TOOLS, tool, kendo.format(assert.messages.enum.default, 'tool', TOOLS));
                window.assert(VectorDrawingToolBar, this.toolBar, kendo.format(assert.messages.instanceof.default, 'this.toolBar', 'kendo.ui.VectorDrawingToolBar'));
                var buttonElement = this.toolBar.element.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('tool'), tool));
                this.toolBar.toggle(buttonElement, true);
                if (tool === 'select') {
                    this.wrapper.css({ cursor: CURSOR.DEFAULT });
                } else {
                    this.wrapper.css({ cursor: CURSOR.CROSSAIR });
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
                switch (e.command) {
                    case 'PropertyChangeCommand':
                        switch (e.options.property) {
                            case 'tool':
                                this._setTool(e.options.value);
                                // TODO selecting anything else than text should reset font to defaults
                                break;
                            case 'bold':
                            case 'italic':
                                this._configuration.fontStyle = e.options.property;
                                break;
                            case 'background':
                                this._configuration.fill.color = e.options.value;
                                break;
                            case 'color':
                                this._configuration.stroke.color = e.options.value;
                                break;
                            case 'fontSize':
                                this._configuration.font.fontSize = e.options.value;
                                break;
                            case 'fontFamily':
                                this._configuration.font.fontFamily = e.options.value;
                                break;
                        }
                        // Update selected element if any
                        if (e.options.property !== 'tool' &&
                            $.isPlainObject(this._selection) && this._selection.element instanceof kendo.drawing.Element) {
                            var uid = this._selection.element.options.get(UID);
                            var dataItem = this.dataSource.getByUid(uid);
                            // Note: there is room for optimization by testing changes before assigning
                            dataItem.set('configuration', this._configuration.toJSON());
                        }
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
                // debugger;
            },

            /**
             * Apply new configuration to element
             * @param element
             * @private
             */
            _applyConfiguration: function (element) {

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
                // Note: we might also want to test that the element is on the surface
                var size = 10;
                var bbox = element.clippedBBox();
                var group = new drawing.Group();
                // handleBox
                var rectGeometry = bbox;
                var rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handleBox, { cursor: CURSOR.MOVE }));
                rect.options.set('role', HANDLES.BBOX);
                group.append(rect);
                // top left handle
                var position = bbox.topLeft();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.NWSE_RESIZE }));
                rect.options.set('role', HANDLES.TOPLEFT);
                group.append(rect);
                // top right handle
                position = bbox.topRight();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.NESW_RESIZE }));
                rect.options.set('role', HANDLES.TOPRIGHT);
                group.append(rect);
                // bottom right handle
                position = bbox.bottomRight();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.NWSE_RESIZE }));
                rect.options.set('role', HANDLES.BOTTOMRIGHT);
                group.append(rect);
                // bottom left handle
                position = bbox.bottomLeft();
                rectGeometry = new geometry.Rect([position.x - size / 2, position.y - size / 2], [size, size]);
                rect = new drawing.Rect(rectGeometry, $.extend(true, {}, this.options.handle, { cursor: CURSOR.NESW_RESIZE }));
                rect.options.set('role', HANDLES.BOTTOMLEFT);
                group.append(rect);
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
                assert.isPlainObject(this._selection, kendo.format(assert.messages.isPlainObject.default, 'this._selection'));
                assert.instanceof(drawing.Group, this._selection.handles, kendo.format(assert.messages.instanceof.default, 'this._selection', 'kendo.drawing.Group'));
                var role;
                var handles = this._selection.handles;
                for (var i = 0, length = handles.children.length; i < length; i++) {
                    var handle = handles.children[i];
                    var bbox = handle.clippedBBox(); // TODO: Beware transformations!!!!!
                    if ((position.x >= bbox.origin.x) && (position.x <= bbox.origin.x + bbox.size.width) &&
                        (position.y >= bbox.origin.y) && (position.y <= bbox.origin.y + bbox.size.height)) {
                        if ($.type(role) === UNDEFINED || handle.options.get('role') !== HANDLES.BBOX) {
                            role = handle.options.get('role');
                        }
                    }
                }
                return role;
            },

            /**
             * Select an element and display handles
             * @param element
             * @private
             */
            _select: function (element) {
                assert.instanceof(drawing.Element, element, kendo.format(assert.messages.instanceof.default, 'element', 'kendo.drawing.Element'));
                assert.type(STRING, element.options.get(UID), kendo.format(assert.messages.type.default, 'element.options.get(\'uid\')', STRING));
                // Note: we cannot rely on the element which might have been redrawn via the refresh method so let's use the uid to retrieve it from the surface
                var uid = element.options.get(UID);
                element = this._getElementByUid(uid);
                // Draw the handles
                var handles = this._getHandles(element);
                this.surface.draw(handles);
                // Update selection
                this._selection = {
                    element: element, // Note: we could consider an array to allow for multiple selections
                    handles: handles
                };
                // Parse element configuration
                this._configuration.parse(element);
            },

            /**
             * Unselect the current selection
             * @private
             */
            _unselect: function () {
                assert.instanceof(VectorDrawing, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.ui.VectorDrawing'));
                // Remove the handles
                // this.surface.exportVisual().children.pop();
                // Redraw
                // this.surface.resize(true);

                // Redraw from database (removes handles)
                this._selection = undefined;
                this.refresh();
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
                if (this.element.has(e.target)) {
                    var position = this._getMousePosition(e);
                    switch (this._tool) {
                        case 'select':
                            // The surface click event and surface.eventTarget(e) won't work properly because our widget is scaled.
                            // Also elements with no fill won't receive the event when clicked in the fill area.
                            // So we need to find the element at position ourselves.
                            var element = this._getElementAtPosition(position);
                            if ($.isPlainObject(this._selection) && this._selection.element === element) {
                                // If the element is already selected, we are on for transformations depending on the part of the handleBox which has been clicked
                                this._startTransformation(position, e.data);
                            } else if (element instanceof kendo.drawing.Element) {
                                this._unselect();
                                this._select(element);
                            } else {
                                this._unselect();
                            }
                            break;
                        case 'circle':
                            this._startCircle(position, e.data);
                            break;
                        case 'image':
                            this._startImage(position, e.data);
                            break;
                        case 'line':
                            this._startLine(position, e.data);
                            break;
                        case 'pen':
                            this._startPen(position, e.data);
                            break;
                        case 'rect':
                            this._startRect(position, e.data);
                            break;
                        // TODO:: shapes like in MsPaint
                        case 'text':
                            this._startText(position, e.data);
                            break;
                    }
                    // Make sure we know which widget we are dealing with in case there are several on the page
                    e.data.widget = this;
                }
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
                // Discard mouse events unless there is e.data
                if ($.type(e.data) === OBJECT && e.data.widget === this) {
                    var position = this._getMousePosition(e);
                    switch (this._tool) {
                        case 'select':
                            this._continueTransformation(position, e.data);
                            break;
                        case 'circle':
                            this._continueCircle(position, e.data);
                            break;
                        case 'image':
                            $.noop();
                            break;
                        case 'line':
                            $.noop();
                            break;
                        case 'pen':
                            this._continuePen(position, e.data);
                            break;
                        case 'rect':
                            this._continueRect(position, e.data);
                            break;
                        case 'text':
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
                // Discard mouse events unless there is e.data
                if ($.type(e.data) === OBJECT &&  e.data.widget === this) {
                    var position = this._getMousePosition(e);
                    switch (this._tool) {
                        case 'select':
                            this._endTransformation(position, e.data);
                            break;
                        case 'circle':
                            this._endCircle(position, e.data);
                            break;
                        case 'image':
                            $.noop();
                            break;
                        case 'line':
                            this._continueLine(position, e.data);
                            break;
                        case 'pen':
                            this._endPen(position, e.data);
                            break;
                        case 'rect':
                            this._endRect(position, e.data);
                            break;
                        case 'text':
                            $.noop();
                            break;
                    }
                    // Make sure we know MouseUp did occur
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
                    // Reset data for next shape
                    // We cannot assign a new object as in e.data = {} otherwise we lose the referenced object set in this._initMouseEvents
                    for (var prop in e.data) {
                        if (e.data.hasOwnProperty(prop)) {
                            delete e.data[prop];
                        }
                    }
                    // Reset tool
                    this._setTool('select');
                    // Cancel everyting if mouseUp did not occur on the surface
                    if (!mouseUp) {
                        this.refresh();
                    }

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
                assert.isEmptyObject(data, kendo.format(assert.messages.isEmptyObject.default, 'data'));
                var handleRole = this._getHandleRoleAtPosition(position);
                switch (handleRole) {
                    case HANDLES.BOTTOMLEFT:
                    case HANDLES.BOTTOMRIGHT:
                    case HANDLES.TOPLEFT:
                    case HANDLES.TOPRIGHT:
                        data.transformation = TRANSFORMATION.SCALE;
                        data.role = handleRole;
                        data.previous = position;
                        break;
                    // Note: handles are tested first because they overlap the bbox
                    case HANDLES.BBOX:
                        data.transformation = TRANSFORMATION.TRANSLATE;
                        data.previous = position;
                        break;
                    default:
                        data.transformation = TRANSFORMATION.ROTATE;
                        // TODO
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
                var elementTransform = this._selection.element.transform() || geometry.transform();
                elementTransform = elementTransform.multiply(transformation);
                this._selection.element.transform(elementTransform);
                var handlesTransform = this._selection.handles.transform() || geometry.transform();
                handlesTransform = handlesTransform.multiply(transformation);
                this._selection.handles.transform(handlesTransform);
            },

            /**
             * End transformation
             * @param position
             * @param data
             * @private
             */
            _endTransformation: function (position, data) {
                // assert.instanceof(geometry.Point, position, kendo.format(assert.messages.instanceof.default, 'position', 'kendo.geometry.Point'));
                // assert.isPlainObject(data, kendo.format(assert.messages.isPlainObject.default, 'data'));
                this._continueTransformation(position, data);
                var uid = this._selection.element.options.get(UID);
                var dataItem = this.dataSource.getByUid(uid);
                var transform = this._selection.element.transform() || geometry.transform();
                dataItem.set('transformation', transform.matrix().toArray());
            },

            /**
             * Start drawing a circle with a mouse (MouseDown)
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
             * Continue drawing a circle with a mouse (MouseMove)
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
             * End drawing a circle with a mouse (MouseUp)
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
                    type: 'circle',
                    center: circleGeometry.getCenter().toArray(),
                    radius: circleGeometry.getRadius(),
                    configuration: this._configuration.toJSON()
                });
            },

            /**
             *
             * @param position
             * @param data
             * @private
             */
            _startLine: function (position, data) {

            },

            /**
             * Start drawing freely (pen) with a mouse (MouseDown)
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
             * Continue drawing freely (pen) with a mouse (MouseMove)
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
             * End drawing freely (pen) with a mouse (MouseUp)
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
                    type: 'path',
                    svg: data.path.stringify(),
                    // closed: false,
                    configuration: this._configuration.toJSON()
                });
            },

            /**
             *
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
                    type: 'rect',
                    origin: rectGeometry.getOrigin().toArray(),
                    size: [rectGeometry.getSize().width, rectGeometry.getSize().height],
                    configuration: this._configuration.toJSON()
                });
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
                            case 'circle':
                                that._drawCircle(dataItem);
                                break;
                            case 'image':
                                that._drawImage(dataItem);
                                break;
                            case 'path':
                                that._drawPath(dataItem);
                                break;
                            case 'rect':
                                that._drawRect(dataItem);
                                break;
                            case 'text':
                                that._drawText(dataItem);
                                break;
                        }
                    }
                    // Restore selection
                    if ($.isPlainObject(this._selection) && this._selection.element instanceof drawing.Element) {
                        // Note that the surface has just been redrawn with new elements
                        that._select(this._selection.element);
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
                assert.equal('circle', dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', 'circle'));
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
                assert.equal('image', dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', 'image'));
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
                assert.equal('path', dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', 'path'));
                var uid = dataItem.get(UID);
                var item = dataItem.toJSON();
                // Draw shape
                var path = new drawing.Path.parse(item.svg, item.configuration);
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
                assert.equal('rect', dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', 'rect'));
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
                assert.equal('text', dataItem.type, kendo.format(assert.messages.equal.default, 'dataItem.type', 'text'));
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
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                $(document).off(NS);
                // Release references
                that.toolBar.destroy();
                that.toolBar.element.remove();
                that.toolBar = undefined;
                that.surface = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
                // Remove widget class
                element.removeClass(WIDGET_CLASS);
            }
        });

        kendo.ui.plugin(VectorDrawing);

        /*********************************************************************************
         * VectorDrawingToolBar Widget
         *********************************************************************************/

        var MESSAGES = {
            alignment: 'Alignment',
            alignmentButtons: {
                justtifyLeft: 'Align left',
                justifyCenter: 'Center',
                justifyRight: 'Align right',
                justifyFull: 'Justify',
                alignTop: 'Align top',
                alignMiddle: 'Align middle',
                alignBottom: 'Align bottom'
            },
            backgroundColor: 'Background',
            bold: 'Bold',
            borders: 'Borders',
            colorPicker: {
                reset: 'Reset color',
                customColor: 'Custom color...'
            },
            copy: 'Copy',
            cut: 'Cut',
            fontFamily: 'Font',
            fontSize: 'Font size',
            format: 'Custom format...',
            formatTypes: {
                automatic: 'Automatic',
                number: 'Number',
                percent: 'Percent',
                financial: 'Financial',
                currency: 'Currency',
                date: 'Date',
                time: 'Time',
                dateTime: 'Date time',
                duration: 'Duration',
                moreFormats: 'More formats...'
            },
            formatDecreaseDecimal: 'Decrease decimal',
            formatIncreaseDecimal: 'Increase decimal',
            italic: 'Italic',
            merge: 'Merge cells',
            mergeButtons: {
                mergeCells: 'Merge all',
                mergeHorizontally: 'Merge horizontally',
                mergeVertically: 'Merge vertically',
                unmerge: 'Unmerge'
            },
            open: 'Open...',
            paste: 'Paste',
            quickAccess: {
                redo: 'Redo',
                undo: 'Undo'
            },
            textColor: 'Text Color',
            textWrap: 'Wrap text',
            underline: 'Underline',
            validation: 'Data validation...',
            hyperlink: 'Link'
        };
        var toolDefaults = {
            separator: { type: 'separator' },
            select: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: 'select',
                iconClass: 'arrow-up',
                togglable: true
            },
            pen: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: 'pen',
                iconClass: 'pencil',
                togglable: true
            },
            line: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: 'line',
                iconClass: 'shape-line',
                togglable: true
            },
            rect: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: 'rect',
                iconClass: 'shape-rect',
                togglable: true
            },
            circle: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: 'circle',
                iconClass: 'shape-circle',
                togglable: true
            },
            text: {
                type: 'button',
                command: 'PropertyChangeCommand',
                group: 'tool',
                property: 'tool',
                value: 'text',
                iconClass: 'font-family',
                togglable: true
            },
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
            backgroundColor: {
                type: 'colorPicker',
                property: 'background',
                iconClass: 'background'
            },
            textColor: {
                type: 'colorPicker',
                property: 'color',
                iconClass: 'foreground-color'
            },
            fontSize: {
                type: 'fontSize',
                property: 'fontSize',
                iconClass: 'font-size'
            },
            fontFamily: {
                type: 'fontFamily',
                property: 'fontFamily',
                iconClass: 'text'
            },
            alignment: {
                type: 'alignment',
                iconClass: 'align-left'
            }
        };

        var VectorDrawingToolBar = ToolBar.extend({
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || VectorDrawingToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar');
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
                        text: MESSAGES[options.name || toolName],
                        spriteCssClass: spriteCssClass,
                        attributes: { title: MESSAGES[options.name || toolName] }
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
                resizable: false,
                tools: TOOLBAR
            },
            action: function (args) {
                this.trigger('action', args);
            },
            dialog: function (args) {
                this.trigger('dialog', args);
            },
            refresh: function (activeCell) {
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

        var registry = {};
        // TODO check!!!!
        kendo.drawing.dialogs = {
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
        var DrawingDialog = kendo.drawing.DrawingDialog = kendo.Observable.extend({
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
                        messages: kendo.spreadsheet.messages.dialogs || MESSAGES,
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

        /*
        var HyperlinkDialog = DrawingDialog.extend({
            options: {
                template: '<div class=\'k-edit-label\'><label>#: messages.linkDialog.labels.url #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button style=\'float: left\' class=\'k-button\' data-bind=\'click: remove\'>#= messages.linkDialog.labels.removeLink #</button>' + '<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: MESSAGES.linkDialog.title,
                autoFocus: false
            },
            open: function (range) {
                var self = this;
                SpreadsheetDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    url: range.link(),
                    apply: function () {
                        if (!/\S/.test(model.url)) {
                            model.url = null;
                        }
                        self.trigger('action', {
                            command: 'HyperlinkCommand',
                            options: { link: model.url }
                        });
                        self.close();
                    },
                    remove: function () {
                        model.url = null;
                        model.apply();
                    },
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
        kendo.spreadsheet.dialogs.register('hyperlink', HyperlinkDialog);
        */

        /*
         kendo.toolbar.registerComponent('dialog', kendo.toolbar.ToolBarButton.extend({
         init: function (options, toolbar) {
         kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
         this._dialogName = options.dialogName;
         this.element.bind('click touchend', this.open.bind(this)).data('instance', this);
         },
         open: function () {
         this.toolbar.dialog({ name: this._dialogName });
         }
         }));
         kendo.toolbar.registerComponent('exportAsDialog', kendo.toolbar.Item.extend({
         init: function (options, toolbar) {
         this._dialogName = options.dialogName;
         this.toolbar = toolbar;
         this.element = $('<button class=\'k-button k-button-icon\' title=\'' + options.attributes.title + '\'>' + '<span class=\'k-icon k-font-icon k-i-xls\' />' + '</button>').data('instance', this);
         this.element.bind('click', this.open.bind(this)).data('instance', this);
         },
         open: function () {
         this.toolbar.dialog({ name: this._dialogName });
         }
         }));
         */
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

        // Font sizes
        var FONT_SIZES = [
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            16,
            18,
            20,
            22,
            24,
            26,
            28,
            36,
            48,
            72
        ];
        var DEFAULT_FONT_SIZE = 12;
        var FontSize = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var comboBox = $('<input />').kendoComboBox({
                    change: this._valueChange.bind(this),
                    clearButton: false,
                    dataSource: options.fontSizes || FONT_SIZES,
                    value: DEFAULT_FONT_SIZE
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
                    type: 'fontSize',
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
                this.value(kendo.parseInt(value) || DEFAULT_FONT_SIZE);
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
                    name: 'fontSize',
                    options: {
                        sizes: FONT_SIZES,
                        defaultSize: DEFAULT_FONT_SIZE
                    }
                });
            },
            update: function (value) {
                this._value = value || DEFAULT_FONT_SIZE;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('fontSize', FontSize, FontSizeButton);

        // Font families
        var FONT_FAMILIES = [
            'Arial',
            'Courier New',
            'Georgia',
            'Times New Roman',
            'Trebuchet MS',
            'Verdana'
        ];
        var DEFAULT_FONT_FAMILY = 'Arial';
        var FontFamily = DropDownTool.extend({
            init: function (options, toolbar) {
                DropDownTool.fn.init.call(this, options, toolbar);
                var ddl = this.dropDownList;
                ddl.setDataSource(options.fontFamilies || FONT_FAMILIES);
                ddl.value(DEFAULT_FONT_FAMILY);
                this.element.data({
                    type: 'fontFamily',
                    fontFamily: this
                });
            },
            update: function (value) {
                this.value(value || DEFAULT_FONT_FAMILY);
            }
        });
        var FontFamilyButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({
                    name: 'fontFamily',
                    options: {
                        fonts: FONT_FAMILIES,
                        defaultFont: DEFAULT_FONT_FAMILY
                    }
                });
            },
            update: function (value) {
                this._value = value || DEFAULT_FONT_FAMILY;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('fontFamily', FontFamily, FontFamilyButton);

        // Alignment
        /*
         var AlignmentTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this.element.attr({ 'data-property': 'alignment' });
         this._commandPalette();
         this.popup.element.on('click', '.k-button', function (e) {
         this._action($(e.currentTarget));
         }.bind(this));
         this.element.data({
         type: 'alignment',
         alignment: this,
         instance: this
         });
         },
         buttons: [
         {
         property: 'textAlign',
         value: 'left',
         iconClass: 'justify-left',
         text: MESSAGES.alignmentButtons.justtifyLeft
         },
         {
         property: 'textAlign',
         value: 'center',
         iconClass: 'justify-center',
         text: MESSAGES.alignmentButtons.justifyCenter
         },
         {
         property: 'textAlign',
         value: 'right',
         iconClass: 'justify-right',
         text: MESSAGES.alignmentButtons.justifyRight
         },
         {
         property: 'textAlign',
         value: 'justify',
         iconClass: 'justify-full',
         text: MESSAGES.alignmentButtons.justifyFull
         },
         {
         property: 'verticalAlign',
         value: 'top',
         iconClass: 'align-top',
         text: MESSAGES.alignmentButtons.alignTop
         },
         {
         property: 'verticalAlign',
         value: 'center',
         iconClass: 'align-middle',
         text: MESSAGES.alignmentButtons.alignMiddle
         },
         {
         property: 'verticalAlign',
         value: 'bottom',
         iconClass: 'align-bottom',
         text: MESSAGES.alignmentButtons.alignBottom
         }
         ],
         destroy: function () {
         this.popup.element.off();
         PopupTool.fn.destroy.call(this);
         },
         update: function (range) {
         var textAlign = range.textAlign();
         var verticalAlign = range.verticalAlign();
         var element = this.popup.element;
         element.find('.k-button').removeClass('k-state-active');
         if (textAlign) {
         element.find('[data-property=textAlign][data-value=' + textAlign + ']').addClass('k-state-active');
         }
         if (verticalAlign) {
         element.find('[data-property=verticalAlign][data-value=' + verticalAlign + ']').addClass('k-state-active');
         }
         },
         _commandPalette: function () {
         var buttons = this.buttons;
         var element = $('<div />').appendTo(this.popup.element);
         buttons.forEach(function (options, index) {
         var button = '<a title=\'' + options.text + '\' data-property=\'' + options.property + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
         if (index !== 0 && buttons[index - 1].property !== options.property) {
         element.append($('<span class=\'k-separator\' />'));
         }
         element.append(button);
         });
         },
         _action: function (button) {
         var property = button.attr('data-property');
         var value = button.attr('data-value');
         this.toolbar.action({
         command: 'PropertyChangeCommand',
         options: {
         property: property,
         value: value
         }
         });
         }
         });
         var AlignmentButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'alignment' });
         }
         });
         kendo.toolbar.registerComponent('alignment', AlignmentTool, AlignmentButton);
         */

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
