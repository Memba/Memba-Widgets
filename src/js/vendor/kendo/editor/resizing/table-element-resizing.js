/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../main.js";
import "../../kendo.resizable.js";
import "./resizing-utils.js";

(function(kendo, undefined) {
    var $ = kendo.jQuery;
    var extend = $.extend;
    var noop = $.noop;

    var Editor = kendo.ui.editor;
    var Class = kendo.Class;

    var KEY_DOWN = "keydown";
    var MOUSE_DOWN = "mousedown";
    var MOUSE_ENTER = "mouseenter";
    var MOUSE_LEAVE = "mouseleave";
    var MOUSE_MOVE = "mousemove";
    var MOUSE_UP = "mouseup";

    var COMMA = ",";
    var DOT = ".";
    var LAST_CHILD = ":last-child";

    var TABLE = "table";

    var TableElementResizing = Class.extend({
        init: function(element, options) {
            var that = this;

            that.options = extend({}, that.options, options);

            that.options.tags = Array.isArray(that.options.tags) ? that.options.tags : [that.options.tags];

            if ($(element).is(TABLE)) {
                that.element = element;
                that._attachEventHandlers();
            }
        },

        destroy: function() {
            var that = this;
            var eventNamespace = that.options.eventNamespace;

            if (that.element) {
                $(that.element).off(eventNamespace);
                that.element = null;
            }

            $(that.options.rootElement).off(KEY_DOWN + eventNamespace);

            that._destroyResizeHandle();
        },

        options: {
            tags: [],
            min: 0,
            rootElement: null,
            eventNamespace: "",
            rtl: false,
            handle: {
                dataAttribute: "",
                height: 0,
                width: 0,
                classNames: {},
                template: ""
            }
        },

        _attachEventHandlers: function() {
            var that = this;
            var options = that.options;

            $(that.element).on(MOUSE_MOVE + options.eventNamespace, options.tags.join(COMMA), that.detectElementBorderHovering.bind(that));
        },

        resizingInProgress: function() {
            var that = this;
            var resizable = that._resizable;

            if (resizable) {
                return !!resizable.resizing;
            }

            return false;
        },

        resize: noop,

        detectElementBorderHovering: function(e) {
            var that = this;
            var options = that.options;
            var handleOptions = options.handle;
            var tableElement = $(e.currentTarget);
            var resizeHandle = that.resizeHandle;
            var dataAttribute = handleOptions.dataAttribute;

            if (!that.resizingInProgress()) {
                if (!tableElement.is(LAST_CHILD) && that.elementBorderHovered(tableElement, e)) {
                    if (resizeHandle) {
                        if (resizeHandle.data(dataAttribute) && resizeHandle.data(dataAttribute) !== tableElement[0]) {
                            that.showResizeHandle(tableElement, e);
                        }
                    }
                    else {
                        that.showResizeHandle(tableElement, e);
                    }
                }
                else {
                    if (resizeHandle) {
                        that._destroyResizeHandle();
                    }
                }
            }
        },

        elementBorderHovered: noop,

        showResizeHandle: function(tableElement, e) {
            var that = this;

            if (e.buttons !== 0) {
                //prevent showing when a mouse button is still being pressed
                return;
            }

            that._initResizeHandle();
            that.setResizeHandlePosition(tableElement);
            that.setResizeHandleDimensions();
            that.setResizeHandleDataAttributes(tableElement[0]);
            that._attachResizeHandleEventHandlers();

            that._initResizable(tableElement);

            that._hideResizeMarker();
            that.resizeHandle.show();
        },

        _initResizeHandle: function() {
            var that = this;
            var options = that.options;

            that._destroyResizeHandle();

            that.resizeHandle = $(options.handle.template).appendTo(options.rootElement);
        },

        setResizeHandlePosition: noop,

        setResizeHandleDimensions: noop,

        setResizeHandleDataAttributes: function(tableElement) {
            var that = this;

            that.resizeHandle.data(that.options.handle.dataAttribute, tableElement);
        },

        _attachResizeHandleEventHandlers: function() {
            var that = this;
            var options = that.options;
            var eventNamespace = options.eventNamespace;
            var markerClass = options.handle.classNames.marker;
            var resizeHandle = that.resizeHandle;

            that.resizeHandle
                .on(MOUSE_DOWN + eventNamespace, function() {
                    resizeHandle.find(DOT + markerClass).show();
                })
                .on(MOUSE_UP + eventNamespace, function() {
                    resizeHandle.find(DOT + markerClass).hide();
                });
        },

        _hideResizeMarker: function() {
            var that = this;

            that.resizeHandle.find(DOT + that.options.handle.classNames.marker).hide();
        },

        _destroyResizeHandle: function() {
            var that = this;

            if (that.resizeHandle) {
                that._destroyResizable();
                that.resizeHandle.off(that.options.eventNamespace).remove();
                that.resizeHandle = null;
            }
        },

        _initResizable: function(tableElement) {
            var that = this;

            if (!that.resizeHandle) {
                return;
            }

            that._destroyResizable();

            that._resizable = new kendo.ui.Resizable(tableElement, {
                draggableElement: that.resizeHandle[0],
                start: that.onResizeStart.bind(that),
                resize: that.onResize.bind(that),
                resizeend: that.onResizeEnd.bind(that)
            });
        },

        _destroyResizable: function() {
            var that = this;

            if (that._resizable) {
                that._resizable.destroy();
                that._resizable = null;
            }
        },

        onResizeStart: function() {
            this._disableKeyboard();
        },

        onResize: function(e) {
            this.setResizeHandleDragPosition(e);
        },

        setResizeHandleDragPosition: noop,

        onResizeEnd: function(e) {
            var that = this;

            that.resize(e);
            that._destroyResizeHandle();
            that._enableKeyboard();
        },

        _enableKeyboard: function() {
            var options = this.options;

            $(options.rootElement).off(KEY_DOWN + options.eventNamespace);
        },

        _disableKeyboard: function() {
            var options = this.options;

            $(options.rootElement).on(KEY_DOWN + options.eventNamespace, function(e) {
                e.preventDefault();
            });
        },

        _forceResizing: function(e) {
            var resizable = this._resizable;

            if (resizable && resizable.userEvents) {
                resizable.userEvents._end(e);
            }
        }
    });

    var ResizingFactory = Class.extend({
        create: function(editor, options) {
            var that = this;
            var resizingName = options.name;
            var NS = options.eventNamespace;

            $(editor.body)
                .on(MOUSE_ENTER + NS, TABLE, function(e) {
                    var table = e.currentTarget;
                    var resizing = editor[resizingName];

                    e.stopPropagation();

                    if (resizing) {
                        if (resizing.element !== table && !resizing.resizingInProgress()) {
                            that._destroyResizing(editor, options);
                            that._initResizing(editor, table, options);
                        }
                    }
                    else {
                        that._initResizing(editor, table, options);
                    }
                })
                .on(MOUSE_LEAVE + NS, TABLE, function(e) {
                    var parentTable;
                    var resizing = editor[resizingName];

                    e.stopPropagation();

                    if (resizing && !resizing.resizingInProgress() && !resizing.resizeHandle) {
                        parentTable = $(resizing.element).parents(TABLE)[0];

                        if (parentTable) {
                            that._destroyResizing(editor, options);
                            that._initResizing(editor, parentTable, options);
                        }
                    }
                })
                .on(MOUSE_LEAVE + NS, function() {
                    var resizing = editor[resizingName];

                    if (resizing && !resizing.resizingInProgress()) {
                        that._destroyResizing(editor, options);
                    }
                })
                .on(MOUSE_UP + NS, function(e) {
                    var resizing = editor[resizingName];
                    var parentTable;

                    if (resizing && resizing.resizingInProgress()) {
                        parentTable = $(e.target).parents(TABLE)[0];

                        if (parentTable) {
                            resizing._forceResizing(e);
                            that._destroyResizing(editor, options);
                            that._initResizing(editor, parentTable, options);
                        }
                    }
                });
        },

        dispose: function(editor, options) {
            $(editor.body).off(options.eventNamespace);
        },

        _initResizing: function(editor, tableElement, options) {
            var resizingName = options.name;
            var resizingType = options.type;

            editor[resizingName] = new resizingType(tableElement, {
                rtl: kendo.support.isRtl(editor.element),
                rootElement: editor.body
            });
        },

        _destroyResizing: function(editor, options) {
            var resizingName = options.name;

            if (editor[resizingName]) {
                editor[resizingName].destroy();
                editor[resizingName] = null;
            }
        }
    });
    ResizingFactory.current = new ResizingFactory();

    TableElementResizing.create = function(editor, options) {
        ResizingFactory.current.create(editor, options);
    };

    TableElementResizing.dispose = function(editor, options) {
        ResizingFactory.current.dispose(editor, options);
    };

    extend(Editor, {
        TableElementResizing: TableElementResizing
    });

})(window.kendo);
