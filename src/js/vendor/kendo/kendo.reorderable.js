/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.reorderable',[ "./kendo.core", "./kendo.draganddrop" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "reorderable",
    name: "Reorderable",
    category: "framework",
    depends: [ "core", "draganddrop" ],
    advanced: true
};

(function ($, undefined) {
    var kendo = window.kendo,
        outerWidth = kendo._outerWidth,
        outerHeight = kendo._outerHeight,
        getOffset = kendo.getOffset,
        Widget = kendo.ui.Widget,
        CHANGE =  "change",
        KREORDERABLE = "k-reorderable";

    var Reorderable = Widget.extend({
        init: function(element, options) {
            var that = this,
                draggable,
                group = kendo.guid() + "-reorderable";

            Widget.fn.init.call(that, element, options);

            element = that.element.addClass(KREORDERABLE);
            options = that.options;

            that.draggable = draggable = options.draggable || new kendo.ui.Draggable(element, {
                group: group,
                autoScroll: true,
                filter: options.filter,
                hint: options.hint
            });

            if(!that.options.dropFilter) {
                that.options.dropFilter = draggable.options.filter;
            }

            that.reorderDropCue = that.options.reorderDropCue;

            element.find(options.dropFilter).kendoDropTarget({
                group: draggable.options.group,
                dragenter: function(e) {
                    var externalDraggableInstance = that._externalDraggable(e);

                    if (!that._draggable && !externalDraggableInstance) {
                        return;
                    }

                    if (externalDraggableInstance) {
                        that._handleExternalDraggable(externalDraggableInstance);
                    }

                    var dropTarget = this.element, offset;

                    var denied = that._isPartOfSortable(that._draggable) ? (!that._dropTargetAllowed(dropTarget) || that._isLastDraggable()) : false;

                    that.toggleHintClass(e.draggable.hint, denied);

                    if (!denied) {
                        offset = getOffset(dropTarget);
                        var cueOffset = { top: offset.top, left: offset.left};
                        var isHorizontal = options.orientation === "horizontal";

                        if (!options.smartPosition || (options.inSameContainer && !options.inSameContainer({
                            source: dropTarget,
                            target: that._draggable,
                            sourceIndex: that._index(dropTarget),
                            targetIndex: that._index(that._draggable)
                        }))) {
                            that._dropTarget = dropTarget;
                        } else {
                            if (that._index(dropTarget) > that._index(that._draggable) && options.smartPosition) {
                                cueOffset[isHorizontal ? "left" : "top"] += isHorizontal ? outerWidth(dropTarget) : outerHeight(dropTarget);
                            }
                        }

                        that.reorderDropCue.css({
                            height: outerHeight(dropTarget),
                            top: cueOffset.top,
                            left: cueOffset.left,
                            zIndex: 19000
                        })
                        .appendTo(document.body);

                        if (options.positionDropCue) {
                            options.positionDropCue(that.reorderDropCue, dropTarget);
                        }
                    }
                },
                dragleave: function(e) {
                    that.toggleHintClass(e.draggable.hint, true);
                    that.reorderDropCue.remove();
                    that._dropTarget = null;
                },
                drop: function() {
                    that._dropTarget = null;

                    if (!that._draggable) {
                        return;
                    }
                    var dropTarget = this.element;
                    var draggable = that._draggable;
                    var dropIndex = that._index(dropTarget);

                    var isAfter = that.options.orientation === "horizontal" ?
                        getOffset(that.reorderDropCue).left > getOffset(dropTarget).left :
                        getOffset(that.reorderDropCue).top > getOffset(dropTarget).top;

                    dropIndex = isAfter ? dropIndex + 1 : dropIndex;

                    if (that._dropTargetAllowed(dropTarget) && !that._isLastDraggable() && that._index(draggable) !== dropIndex) {
                        that.trigger(CHANGE, {
                            element: that._draggable,
                            target: dropTarget,
                            oldIndex: that._index(draggable),
                            newIndex: that._index(dropTarget),
                            position: isAfter ? "after" : "before"
                        });
                    }

                    if(that.reorderDropCue) {
                        that.reorderDropCue.remove();
                    }
                }
            });

            draggable.bind([ "dragcancel", "dragend", "dragstart", "drag" ], {
                dragcancel: that._dragcancel.bind(that),
                dragend: that._dragend.bind(that),
                dragstart: that._dragstart.bind(that),
                drag: that._drag.bind(that)
            });
        },

        options: {
            name: "Reorderable",
            filter: "*",
            orientation: "horizontal",
            deniedIcon: "k-i-cancel",
            allowIcon: "k-i-plus",
            reorderDropCue: $('<div class="k-reorder-cue"></div></div>'),
            smartPosition: true
        },

        events: [
            CHANGE
        ],

        toggleHintClass: function (hint, denied) {
            var that = this,
                options = that.options;

            hint = $(hint);

            if (denied) {
                hint.find(".k-drag-status").removeClass(options.allowIcon).addClass(options.deniedIcon);
            } else {
                hint.find(".k-drag-status").removeClass(options.deniedIcon).addClass(options.allowIcon);
            }
        },

        _handleExternalDraggable: function (draggable) {
            var that = this;

            that._dragcancelHandler = that._dragcancel.bind(that);
            that._dragendHandler = that._dragend.bind(that);
            that._dragstartHandler = that._dragstart.bind(that);
            that._dragHandler =  that._drag.bind(that);

            that._draggable = draggable.currentTarget.closest(that.options.dropFilter);
            that._draggableInstance = draggable;
            that._elements = that.element.find(that.options.dropFilter);

            draggable.bind([ "dragcancel", "dragend", "dragstart", "drag" ], {
                dragcancel: that._dragcancelHandler,
                dragend: that._dragendHandler,
                dragstart: that._dragstartHandler,
                drag: that._dragHandler
            });
        },

        _dragcancel: function() {
            var that = this;

            if(that._draggableInstance && (that._dragcancelHandler || that._dragendHandler ||
                that._dragstartHandler || that._dragHandler)) {

                    that._draggableInstance.unbind({
                    dragcancel: that._dragcancelHandler,
                    dragend: that._dragendHandler,
                    dragstart: that._dragstartHandler,
                    drag: that._dragHandler
                });
            }

            if(that.reorderDropCue) {
                that.reorderDropCue.remove();
            }

            that._draggable = null;
            that._elements = null;

        },
        _dragend: function() {
            var that = this;

            if(that._draggableInstance && (that._dragcancelHandler || that._dragendHandler ||
                that._dragstartHandler || that._dragHandler)) {

                    that._draggableInstance.unbind({
                    dragcancel: that._dragcancelHandler,
                    dragend: that._dragendHandler,
                    dragstart: that._dragstartHandler,
                    drag: that._dragHandler
                });
            }

            if(that.reorderDropCue) {
                that.reorderDropCue.remove();
            }

            that._draggable = null;
            that._elements = null;
        },
        _dragstart: function(e) {
            var that = this;
            var target = $(e.currentTarget);

            that._draggable = target.is(that.options.dropFilter) ? target : target.closest(that.options.dropFilter);
            that._elements = that.element.find(that.options.dropFilter);
        },
        _drag: function(e) {
            var that = this,
                dropIndex, sourceIndex, denied,
                offset = {},
                target = $(e.currentTarget).closest(that.options.dropFilter);

            if (!that._dropTarget || (that.options.smartPosition && e.sender.hint.find(".k-drag-status").hasClass("k-i-cancel"))) {
                return;
            }

            dropIndex = that._index(that._dropTarget);
            sourceIndex = that._index(target);
            sourceIndex = dropIndex > sourceIndex ? sourceIndex + 1 : sourceIndex;

            if(that.options.orientation === "horizontal") {
                var dropStartOffset = getOffset(that._dropTarget).left;
                var width = outerWidth(that._dropTarget);

                if (e.pageX > dropStartOffset + width / 2) {
                    offset.left = dropStartOffset + width;
                    dropIndex += 1;
                } else {
                    offset.left = dropStartOffset;
                }
            } else {
                var dropStartTop = getOffset(that._dropTarget).top;
                var height = outerHeight(that._dropTarget);

                if (e.pageY > dropStartTop + height / 2) {
                    offset.top = dropStartTop + height;
                    dropIndex += 1;
                } else {
                    offset.top = dropStartTop;
                }
            }

            that.reorderDropCue.css(offset);

            if (that.options.positionDropCue) {
                that.options.positionDropCue(that.reorderDropCue, that._dropTarget);
            }

            if (that._isPartOfSortable(target)) {

                denied = sourceIndex === dropIndex || (that.options.dragOverContainers && !that.options.dragOverContainers(sourceIndex, dropIndex));

                that.toggleHintClass(e.sender.hint, denied);
            }
        },

        _isPartOfSortable: function (draggable) {
            var that = this;

            return that._elements.index(draggable) >= 0;
        },

        _externalDraggable: function(e) {
            var that = this,
                options = that.options;

            if(!that._draggable && options.externalDraggable) {
                return options.externalDraggable(e);
            }

            return null;
        },

        _isLastDraggable: function() {
            var inSameContainer = this.options.inSameContainer,
                draggable = this._draggable[0],
                elements = this._elements.get(),
                found = false,
                item;

            if (!inSameContainer) {
                return false;
            }

            while (!found && elements.length > 0) {
                item = elements.pop();
                found = draggable !== item && inSameContainer({
                    source: draggable,
                    target: item,
                    sourceIndex: this._index(draggable),
                    targetIndex: this._index(item)
                });
            }

            return !found;
        },

        _dropTargetAllowed: function(dropTarget) {
            var inSameContainer = this.options.inSameContainer,
                dragOverContainers = this.options.dragOverContainers,
                draggable = this._draggable;

            if (draggable[0] === dropTarget[0]) {
                return false;
            }

            if (!inSameContainer || !dragOverContainers) {
                return true;
            }

            if (inSameContainer({ source: draggable,
                target: dropTarget,
                sourceIndex: this._index(draggable),
                targetIndex: this._index(dropTarget)
            })) {
                return true;
            }

            return dragOverContainers(this._index(draggable), this._index(dropTarget));
        },

        _index: function(element) {
            return this._elements.index(element);
        },

        destroy: function() {
           var that = this;


           Widget.fn.destroy.call(that);

           that.element.find(that.options.dropFilter).each(function() {
               var item = $(this);
               if (item.data("kendoDropTarget")) {
                   item.data("kendoDropTarget").destroy();
                }
            });

            if (that.draggable) {
                that.draggable.destroy();

                that.draggable.element = that.draggable = null;
            }

            that.reorderDropCue.remove();
            that.elements = that.reorderDropCue = that._elements = that._draggable = null;
       }
    });

    kendo.ui.plugin(Reorderable);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });


