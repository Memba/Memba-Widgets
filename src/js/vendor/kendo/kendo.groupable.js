/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.draganddrop.js";
import "./kendo.chip.js";
import "./kendo.chiplist.js";
import "./kendo.icons.js";

var __meta__ = {
    id: "groupable",
    name: "Groupable",
    category: "framework",
    depends: [ "core", "draganddrop", "icons" ],
    advanced: true
};

(function($, undefined) {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        outerWidth = kendo._outerWidth,
        kendoAttr = kendo.attr,
        extend = $.extend,
        each = $.each,
        isRtl = false,

        DIR = "dir",
        FIELD = "field",
        TITLE = "title",
        ASCENDING = "asc",
        DESCENDING = "desc",
        REMOVEGROUP = "removeGroup",
        GROUP_SORT = "group-sort",
        DROP_CONTAINER = "k-grouping-drop-container",
        NS = ".kendoGroupable",
        CHANGE = "change",
        hint = function(target) {
            var title = target.attr(kendo.attr("title"));
            if (title) {
                title = kendo.htmlEncode(title);
            }

            return $('<div class="k-group-clue k-drag-clue" />')
                .html(title || target.attr(kendo.attr("field")))
                .prepend(kendo.ui.icon({ icon: "cancel", iconClass: "k-drag-status" }));
        },
        dropCue = $('<div class="k-grouping-dropclue"/>');


    function removeText(element) {
        element.contents().filter(function() {
            return this.nodeType === 3;
        }).remove();
    }

    var Groupable = Widget.extend({
        init: function(element, options) {
            var that = this,
                group = kendo.guid(),
                intializePositions = that._intializePositions.bind(that),
                draggable,
                horizontalCuePosition,
                dropCuePositions = that._dropCuePositions = [];

            Widget.fn.init.call(that, element, options);

            isRtl = kendo.support.isRtl(element);
            horizontalCuePosition = isRtl ? "right" : "left";

            that.draggable = draggable = that.options.draggable || new kendo.ui.Draggable(that.element, {
                filter: that.options.draggableElements,
                hint: hint,
                group: group
            });

            that.groupContainer = $(that.options.groupContainer, that.element)
                .kendoDropTarget({
                    group: draggable.options.group,
                    dragenter: function(e) {
                        if (that._canDrag(e.draggable.currentTarget)) {
                            kendo.ui.icon(e.draggable.hint.find(".k-drag-status"), { icon: "plus" });
                            dropCue.css(horizontalCuePosition, 0).appendTo(that.groupContainer);
                        }
                    },
                    dragleave: function(e) {
                        kendo.ui.icon(e.draggable.hint.find(".k-drag-status"), { icon: "cancel" });

                        dropCue.remove();
                    },
                    drop: function(e) {
                        var targetElement = e.draggable.currentTarget,
                            field = targetElement.attr(kendo.attr("field")),
                            title = targetElement.attr(kendo.attr("title")),
                            colID = targetElement.attr("id"),
                            sourceIndicator = that.indicator(field),
                            dropCuePositions = that._dropCuePositions,
                            lastCuePosition = dropCuePositions[dropCuePositions.length - 1],
                            position,
                            method = "after",
                            parentLeft = isRtl || !lastCuePosition ? 0 : lastCuePosition.element.parent().position().left;
                        var sortOptions = extend({}, that.options.sort, targetElement.data(GROUP_SORT));
                        var dir = sortOptions.dir;

                        if (!targetElement.hasClass("k-chip") && !that._canDrag(targetElement)) {
                            return;
                        }
                        if (lastCuePosition) {
                            position = that._dropCuePosition(kendo.getOffset(dropCue).left + parentLeft + parseInt(lastCuePosition.element.css("marginLeft"), 10) * (isRtl ? -1 : 1) + parseInt(lastCuePosition.element.css("marginRight"), 10));
                            if (position && that._canDrop($(sourceIndicator), position.element, position.left)) {
                                if (position.before) {
                                    method = "before";
                                }

                                position.element[method](sourceIndicator || that.buildIndicator(field, title, dir, colID).wrapper);
                                that._setIndicatorSortOptions(field, sortOptions);
                                that._change();
                            }
                        } else {
                            removeText(that._messageContainer);
                            that._list.element.show();
                            that._list.add(that.buildIndicator(field, title, dir, colID).element);
                            that._setIndicatorSortOptions(field, sortOptions);
                            that._change();
                        }
                    }
                })
                .kendoDraggable({
                    filter: "div.k-chip",
                    hint: hint,
                    group: draggable.options.group,
                    dragcancel: that._dragCancel.bind(that),
                    dragstart: function(e) {
                        var element = e.currentTarget,
                            marginLeft = parseInt(element.css("marginLeft"), 10),
                            elementPosition = element.position(),
                            left = isRtl ? elementPosition.left - marginLeft : elementPosition.left + outerWidth(element);

                        intializePositions();
                        dropCue.css("left", left).appendTo(that.groupContainer);
                        kendo.ui.icon(this.hint.find(".k-drag-status"), { icon: "plus" });
                    },
                    dragend: function() {
                        that._dragEnd(this);
                    },
                    drag: that._drag.bind(that)
                });

            draggable.bind([ "dragend", "dragcancel", "dragstart", "drag" ],
            {
                dragend: function() {
                    that._dragEnd(this);
                },
                dragcancel: that._dragCancel.bind(that),
                dragstart: function(e) {

                    if (!that.options.allowDrag && !that._canDrag(e.currentTarget)) {
                        e.preventDefault();
                        return;
                    }

                    intializePositions();
                },
                drag: that._drag.bind(that)
            });

            that.dataSource = that.options.dataSource;
            that._messageContainer = that.groupContainer.find("." + DROP_CONTAINER);

            if (!that._messageContainer.length) {
                that._messageContainer = $('<div/>').addClass(DROP_CONTAINER).appendTo(that.groupContainer);
            }

            that._createList();

            if (that.dataSource && that._refreshHandler) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            } else {
                that._refreshHandler = that.refresh.bind(that);
            }

            if (that.dataSource) {
                that.dataSource.bind("change", that._refreshHandler);
                that.refresh();
            }
        },

        refresh: function() {
            var that = this,
                dataSource = that.dataSource;
            var groups = dataSource.group() || [];
            var fieldAttr = kendoAttr(FIELD);
            var titleAttr = kendoAttr(TITLE);

            if (that.groupContainer) {
                if (that._list) {
                    that._list.remove(that._list.items());
                    that._list.element.hide();
                }

                if (groups.length) {
                    removeText(that._messageContainer);
                }

                each(groups, function(index, group) {
                    var field = group.field;
                    var dir = group.dir;
                    var element = that.element
                        .find(that.options.filter)
                        .filter(function() {
                            return $(this).attr(fieldAttr) === field;
                        });
                    var indicator = that.buildIndicator(field, element.attr(titleAttr), dir, element.attr("id"));

                    that._list.add(indicator.element);
                    that._list.element.show();
                    that._setIndicatorSortOptions(field, extend({}, that.options.sort, { dir: dir, compare: group.compare }));
                });
            }

            that._invalidateGroupContainer();
        },

        destroy: function() {
            var that = this;

            Widget.fn.destroy.call(that);

            that.groupContainer.off(NS);

            if (that.groupContainer.data("kendoDropTarget")) {
                that.groupContainer.data("kendoDropTarget").destroy();
            }

            if (that.groupContainer.data("kendoDraggable")) {
                that.groupContainer.data("kendoDraggable").destroy();
            }

            if (!that.options.draggable) {
                that.draggable.destroy();
            }

            if (that.dataSource && that._refreshHandler) {
                that.dataSource.unbind("change", that._refreshHandler);
                that._refreshHandler = null;
            }

            if (that._list) {
                that._list.destroy();
            }

            that.groupContainer = that.element = that.draggable = null;
        },

        events: ["change", "removeGroup"],

        options: {
            name: "Groupable",
            filter: "th",
            draggableElements: "th",
            messages: {
                empty: "Drag a column header and drop it here to group by that column"
            },
            sort: {
                dir: ASCENDING,
                compare: null
            },
            enableContextMenu: false
        },

        indicator: function(field) {
            var indicators = $(".k-chip", this.groupContainer);
            return $.grep(indicators, function(item)
                {
                    return $(item).attr(kendo.attr("field")) === field;
                })[0];
        },

        removeHandler: function(e) {
            var that = this;

            that._removeIndicator(e.sender.wrapper);
        },

        clickHandler: function(e) {
            var that = this;
            var indicator = e.sender.wrapper;
            var dirIcon = indicator.find(".k-chip-icon");
            var newDir = dirIcon.attr(kendoAttr(DIR)) === ASCENDING ? DESCENDING : ASCENDING;

            if ($(e.originalEvent.target).closest('.k-groupable-context-menu').length) {
                return;
            }

            dirIcon.attr(kendoAttr(DIR), newDir);
            that._change();
        },

        buildIndicator: function(field, title, dir, id) {
            var that = this;
            var indicator;
            var icon;
            var wrapper;

            dir = dir || (that.options.sort || {}).dir || ASCENDING;
            indicator = $(`<div/>`)
                            .kendoChip({
                                icon: `sort-${(dir || "asc") == "asc" ? "asc-small" : "desc-small"}`,
                                iconClass: 'k-chip-icon',
                                label: `${title || field}`,
                                removable: true,
                                size: that.options.size || "medium",
                                remove: that.removeHandler.bind(that),
                                click: that.clickHandler.bind(that),
                                actions: that.options.enableContextMenu ? [
                                    { icon: "more-vertical", iconClass: "k-groupable-context-menu" }
                                ] : null
                            }).data("kendoChip");
            wrapper = indicator.wrapper;
            icon = wrapper.find(".k-chip-icon").first();
            wrapper.attr(`data-${kendo.ns}field`, field);
            wrapper.attr(`data-${kendo.ns}title`, title || "");

            if (id) {
                wrapper.attr(`data-${kendo.ns}id`, id);
            }

            icon.attr("title", `(sorted ${dir == "asc" ? "ascending" : "descending"})`);
            icon.attr(`data-${kendo.ns}dir`, dir);

            return indicator;
        },

        _setIndicatorSortOptions: function(field, options) {
            var indicator = $(this.indicator(field));
            indicator.data(GROUP_SORT, options);
        },

        aggregates: function() {
            var that = this;
            var names;
            var idx;
            var length;

            return that.element.find(that.options.filter).map(function() {
                var cell = $(this),
                    aggregate = cell.attr(kendo.attr("aggregates")),
                    member = cell.attr(kendo.attr("field"));

                if (aggregate && aggregate !== "") {
                    names = aggregate.split(",");
                    aggregate = [];
                    for (idx = 0, length = names.length; idx < length; idx++) {
                        aggregate.push({ field: member, aggregate: names[idx] });
                    }
                }
                return aggregate;
            }).toArray();
        },

        descriptors: function() {
            var that = this,
                indicators = $(".k-chip", that.groupContainer),
                field,
                aggregates = that.aggregates();

            return $.map(indicators, function(item) {
                item = $(item);
                field = item.attr(kendo.attr("field"));
                var sortOptions = that.options.sort || {};
                var indicatorSortOptions = item.data(GROUP_SORT) || {};
                var dirIcon = item.find(".k-chip-icon");

                return {
                    field: field,
                    dir: dirIcon.attr(kendo.attr("dir")),
                    aggregates: aggregates || [],
                    colID: item.attr(kendo.attr("id")),
                    compare: indicatorSortOptions.compare || sortOptions.compare
                };
            });
        },

        _removeIndicator: function(indicator) {
            var that = this;

            that.trigger(REMOVEGROUP, {
                field: indicator.attr(kendo.attr("field")),
                colID: indicator.attr(kendo.attr("id")),
            });
            that._list.remove(indicator);
            indicator.off();
            indicator.removeData();
            that._invalidateGroupContainer();
            that._change();
        },

        _change: function() {
            var that = this;
            if (that.dataSource) {
                var descriptors = that.descriptors();
                if (that.trigger("change", { groups: descriptors })) {
                    that.refresh();
                    return;
                }
                that.dataSource.group(descriptors);
            }
        },

        _dropCuePosition: function(position) {
            var that = this;
            var dropCuePositions = this._dropCuePositions;
            if (!dropCue.is(":visible") || dropCuePositions.length === 0) {
                return;
            }

            position = Math.ceil(position);

            var lastCuePosition = dropCuePositions[dropCuePositions.length - 1],
                left = lastCuePosition.left,
                right = lastCuePosition.right,
                marginLeft = parseInt(lastCuePosition.element.css("marginLeft"), 10),
                marginRight = parseInt(lastCuePosition.element.css("marginRight"), 10),
                parentLeft = lastCuePosition.element.parent().position().left - parseInt(that.groupContainer.css("paddingLeft"), 10);

            if (position >= right && !isRtl || position < left && isRtl) {
                position = {
                    left: lastCuePosition.element.position().left + (!isRtl ? outerWidth(lastCuePosition.element) + marginRight : parentLeft - marginLeft),
                    element: lastCuePosition.element,
                    before: false
                };
            } else {
                position = $.grep(dropCuePositions, function(item) {
                    return (item.left <= position && position <= item.right) || (isRtl && position > item.right);
                })[0];

                if (position) {
                    position = {
                        left: isRtl ? position.element.position().left + outerWidth(position.element) + marginRight + parentLeft : position.element.position().left - marginLeft,
                        element: position.element,
                        before: true
                    };
                }
            }

            return position;
        },
        _drag: function(event) {
            var position = this._dropCuePosition(event.x.location);

            if (position) {
                dropCue.css({ left: position.left, right: "auto" });
            }
        },
        _canDrag: function(element) {
            var field = element.attr(kendo.attr("field"));

            return element.attr(kendo.attr("groupable")) != "false" &&
                field &&
                (element.hasClass("k-chip") ||
                    !this.indicator(field));
        },
        _canDrop: function(source, target, position) {
            var next = source.next(),
                result = source[0] !== target[0] && (!next[0] || target[0] !== next[0] || (!isRtl && position > next.position().left || isRtl && position < next.position().left));
            return result;
        },
        _dragEnd: function(draggable) {
            var that = this,
                field = draggable.currentTarget.attr(kendo.attr("field")),
                sourceIndicator = that.indicator(field);

            if (draggable !== that.options.draggable && !draggable.dropped && sourceIndicator) {
                that._removeIndicator($(sourceIndicator));
            }

            that._dragCancel();
        },
        _dragCancel: function() {
            dropCue.remove();
            this._dropCuePositions = [];
        },
        _intializePositions: function() {
            var that = this,
                indicators = $(".k-chip", that.groupContainer),
                left;

            that._dropCuePositions = $.map(indicators, function(item) {
                item = $(item);
                left = kendo.getOffset(item).left;
                return {
                    left: parseInt(left, 10),
                    right: parseInt(left + outerWidth(item), 10),
                    element: item
                };
            });
        },
        _invalidateGroupContainer: function() {
            var that = this;
            var groupContainer = that.groupContainer;
            var list = that._list;

            if (groupContainer && list && list.element.is(":empty")) {
                this._messageContainer.text(this.options.messages.empty);
            }
        },

        _createList: function() {
            var that = this;

            that.groupContainer.find(".k-chip-list").remove();
            that._list = $("<div/>").kendoChipList({ selectable: "none", size: that.options.size || "medium" }).data("kendoChipList");
            that._list.element.insertBefore(that._messageContainer);
        }
    });

    kendo.ui.plugin(Groupable);

})(window.kendo.jQuery);
export default kendo;

