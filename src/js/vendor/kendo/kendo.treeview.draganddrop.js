/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.data.js";
import "./kendo.draganddrop.js";

var __meta__ = {
    id: "treeview.draganddrop",
    name: "Hierarchical Drag & Drop",
    category: "framework",
    depends: [ "core", "draganddrop" ],
    advanced: true
};

(function($, undefined) {
    var kendo = window.kendo;
    var ui = kendo.ui;
    var extend = $.extend;
    var VISIBILITY = "visibility";
    var DRAG_STATUS = "k-drag-status";
    var DRAG_STATUS_ELEMENT = `<span class="${DRAG_STATUS}"></span>`;
    var KSTATEHOVER = "k-hover";
    var INPUTSELECTOR = "input,a:not(.k-in),textarea,.k-multiselect-wrap,select,button,a.k-button>.k-icon,button.k-button>.k-icon,span.k-toggle-icon,a.k-button>.k-svg-icon,button.k-button>.k-svg-icon";
    var DROPHINTTEMPLATE = "<div class='k-drop-hint k-drop-hint-h'>" +
                                "<div class='k-drop-hint-start'></div>" +
                                "<div class='k-drop-hint-line'></div>" +
                            "</div>";

    ui.HierarchicalDragAndDrop = kendo.Class.extend({
        init: function(element, options) {
            this.element = element;
            this.hovered = element;
            this.options = extend({
                dragstart: $.noop, drag: $.noop, drop: $.noop, dragend: $.noop
            }, options);

            this._draggable = new ui.Draggable(element, {
                ignore: INPUTSELECTOR,
                filter: options.filter,
                autoScroll: options.autoScroll,
                cursorOffset: {
                    left: 10,
                    top: kendo.support.mobileOS ? -40 / kendo.support.zoomLevel() : 10
                },
                hint: this._hint.bind(this),
                dragstart: this.dragstart.bind(this),
                dragcancel: this.dragcancel.bind(this),
                hintDestroyed: this.dragcancel.bind(this),
                drag: this.drag.bind(this),
                dragend: this.dragend.bind(this),
                holdToDrag: options.holdToDrag,
                clickMoveClick: options.clickMoveClick
            });
        },

        _hint: function(element) {
            return "<div class='k-drag-clue'>" +
                        DRAG_STATUS_ELEMENT +
                        this.options.hintText(element) +
                    "</div>";
        },

        _removeTouchHover: function() {
            if (kendo.support.touch && this.hovered) {
                this.hovered.find("." + KSTATEHOVER).removeClass(KSTATEHOVER);
                this.hovered = false;
            }
        },

        _hintStatus: function(newStatus) {
            var statusElement = this._draggable.hint.find(`.${DRAG_STATUS}`);
            if (newStatus) {
                this.status = newStatus;
                ui.icon(statusElement, {
                    icon: newStatus
                });
            } else {
                this.status = '';
                statusElement.replaceWith(DRAG_STATUS_ELEMENT);
            }
        },

        dragstart: function(e) {
            if (this.dropHint) {
                this.dropHint.remove();
            }

            this.source = e.currentTarget.closest(this.options.itemSelector);

            if (this.options.dragstart(this.source)) {
                e.preventDefault();
            }

            if (this.options.reorderable) {
                this.dropHint = $(DROPHINTTEMPLATE)
                    .css(VISIBILITY, "hidden")
                    .appendTo(this.element);
            } else {
                this.dropHint = $();
            }
        },

        drag: function(e) {
            var options = this.options;
            var source = this.source;
            var target = this.dropTarget = $(kendo.eventTarget(e));
            var container = target.closest(options.allowedContainers);
            var hoveredItem, itemHeight, itemTop, itemContent, delta;
            var insertOnTop, insertOnBottom, addChild;
            var itemData, position, status;

            if (!container.length) {
                // dragging outside of allowed elements
                status = "cancel";
                this._removeTouchHover();
            } else if (source[0] == target[0] || options.contains(source[0], target[0])) {
                // dragging item within itself
                status = "cancel";
            } else if (e.clickMoveClick && e.currentTarget.hasClass("k-drag-cell") && target.closest(".k-drag-cell").length === 0) {
                // click-move-click interaction with drag cell
                status = "cancel";
            } else if (e.clickMoveClick && e.currentTarget.hasClass("k-treeview-leaf") && target.closest(".k-treeview-leaf").length === 0) {
                // click-move-click interaction with TreeView
                status = "cancel";
            } else {
                // moving or reordering item
                status = "insert-middle";

                itemData = options.itemFromTarget(target);
                hoveredItem = itemData.item;

                if (hoveredItem.length) {
                    this._removeTouchHover();
                    itemHeight = kendo._outerHeight(hoveredItem);
                    itemContent = itemData.content;

                    if (options.reorderable) {
                        delta = itemHeight / (itemContent.length > 0 ? 4 : 2);
                        itemTop = kendo.getOffset(hoveredItem).top;

                        insertOnTop = e.y.location < (itemTop + delta);
                        insertOnBottom = (itemTop + itemHeight - delta) < e.y.location;
                        addChild = itemContent.length && !insertOnTop && !insertOnBottom;
                    } else {
                        addChild = true;
                        insertOnTop = false;
                        insertOnBottom = false;
                    }

                    this.hovered = addChild ? container : false;

                    this.dropHint.css(VISIBILITY, addChild ? "hidden" : "visible");

                    if (this._lastHover && this._lastHover[0] != itemContent[0]) {
                        this._lastHover.removeClass(KSTATEHOVER);
                    }

                    this._lastHover = itemContent.toggleClass(KSTATEHOVER, addChild);

                    if (addChild) {
                        status = "plus";
                    } else {
                        position = hoveredItem.position();
                        position.top += insertOnTop ? 0 : itemHeight;

                        this.dropHint.css(position)
                            [insertOnTop ? "prependTo" : "appendTo"]
                            (options.dropHintContainer(hoveredItem));

                        if (insertOnTop && itemData.first) {
                            status = "insert-top";
                        }

                        if (insertOnBottom && itemData.last) {
                            status = "insert-bottom";
                        }
                    }
                } else if (target[0] != this.dropHint[0]) {
                    if (this._lastHover) {
                        this._lastHover.removeClass(KSTATEHOVER);
                    }

                    if (!$.contains(this.element[0], container[0])) {
                        // moving node to different element
                        status = "plus";
                    } else {
                        status = "cancel";
                    }
                }
            }

            this.options.drag({
                originalEvent: e.originalEvent,
                source: source,
                target: target,
                pageY: e.y.location,
                pageX: e.x.location,
                status: status,
                setStatus: function(value) {
                    status = value;
                }
            });

            if (status.indexOf("insert") !== 0) {
                this.dropHint.css(VISIBILITY, "hidden");
            }

            this._hintStatus(status);
        },

        dragcancel: function() {
            if (this.dropHint) {
                this.dropHint.remove();
            }
        },

        dragend: function(e) {
            var position = "over",
                source = this.source,
                destination,
                dropHint = this.dropHint,
                dropTarget = this.dropTarget || $(kendo.eventTarget(e)),
                eventArgs, dropPrevented, requireTarget;

            if (dropHint && dropHint.css(VISIBILITY) == "visible") {
                position = this.options.dropPositionFrom(dropHint);
                destination = dropHint.closest(this.options.itemSelector);
                requireTarget = true;
            } else if (dropTarget) {
                destination = dropTarget.closest(this.options.itemSelector);

                // moving node to root element
                if (!destination.length) {
                    destination = dropTarget.closest(this.options.allowedContainers);
                }
            }

            if (requireTarget && !destination.length) {
                this.dragcancel();
                return;
            }

            eventArgs = {
                originalEvent: e.originalEvent,
                source: source[0],
                destination: destination[0],
                valid: this.status != "cancel",
                setValid: function(newValid) {
                    this.valid = newValid;
                },
                dropTarget: dropTarget[0],
                position: position
            };

            dropPrevented = this.options.drop(eventArgs);

            dropHint.remove();
            this._removeTouchHover();
            if (this._lastHover) {
                this._lastHover.removeClass(KSTATEHOVER);
            }

            if (!eventArgs.valid || dropPrevented) {
                this._draggable.dropped = eventArgs.valid;
                return;
            }

            this._draggable.dropped = true;

            this.options.dragend({
                originalEvent: e.originalEvent,
                source: source,
                destination: destination,
                position: position
            });
        },

        destroy: function() {
            this._lastHover = this.hovered = null;
            this._draggable.destroy();
        }
    });

})(window.kendo.jQuery);
export default kendo;

