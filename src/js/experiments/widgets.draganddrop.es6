/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: this is mostly kendo.dragaanddrop but these Extended widgets work within a scaled container

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.userevents';

const {
    _outerHeight,
    _outerWidth,
    elementUnderCursor,
    getComputedStyles,
    getOffset,
    isFunction,
    isScrollable,
    keys,
    support,
    ui: { Widget, plugin },
    UserEvents
} = window.kendo;

const { document } = window;
const $window = $(window);
const { extend, proxy } = $;
const draggables = {};
const dropTargets = {};
const dropAreas = {};
let lastDropTarget;
const KEYUP = 'keyup';
const DRAGSTART = 'dragstart';
const HOLD = 'hold';
const DRAG = 'drag';
const DRAGEND = 'dragend';
const DRAGCANCEL = 'dragcancel';
const HINTDESTROYED = 'hintDestroyed';
const DRAGENTER = 'dragenter';
const DRAGLEAVE = 'dragleave';
const DROP = 'drop';

const Matrix = window.DOMMatrix || window.WebKitCSSMatrix || window.MSCSSMatrix;

/**
 * Helpers
 */

function contains(parent, child) {
    try {
        return $.contains(parent, child) || parent === child;
    } catch (e) {
        return false;
    }
}

function within(value, range) {
    return Math.min(Math.max(value, range.min), range.max);
}

function numericCssPropery(element, property) {
    return parseInt(element.css(property), 10) || 0;
}

function containerBoundaries(container, element) {
    // BEGIN Added by JLC
    const styles = getComputedStyles(container.parent()[0], ['transform']);
    // https://www.michael1e.com/get-scale-value-css-javascript/
    // https://stackoverflow.com/questions/5603615/get-the-scale-value-of-an-element
    const matrix = new Matrix(styles.transform);
    const scaleX = matrix.a;
    const scaleY = matrix.d;
    // END Added by JLC

    const offset = getOffset(container);
    const minX =
        offset.left +
        numericCssPropery(container, 'borderLeftWidth') +
        numericCssPropery(container, 'paddingLeft');
    const minY =
        offset.top +
        numericCssPropery(container, 'borderTopWidth') +
        numericCssPropery(container, 'paddingTop');
    // const maxX = minX + container.width() - _outerWidth(element, true);
    // const maxY = minY + container.height() - _outerHeight(element, true);
    const maxX =
        minX + scaleX * (container.width() - _outerWidth(element, true));
    const maxY =
        minY + scaleY * (container.height() - _outerHeight(element, true));
    return {
        x: {
            min: minX,
            max: maxX
        },
        y: {
            min: minY,
            max: maxY
        }
    };
}
// TODO kendo.containerBoundaries = containerBoundaries;

function checkTarget(target, targets, areas) {
    let theTarget;
    let theFilter;
    let i = 0;
    const targetLen = targets && targets.length;
    const areaLen = areas && areas.length;
    while (target && target.parentNode) {
        for (i = 0; i < targetLen; i++) {
            theTarget = targets[i];
            if (theTarget.element[0] === target) {
                return {
                    target: theTarget,
                    targetElement: target
                };
            }
        }
        for (i = 0; i < areaLen; i++) {
            theFilter = areas[i];
            if (
                $.contains(theFilter.element[0], target) &&
                support.matchesSelector.call(target, theFilter.options.filter)
            ) {
                return {
                    target: theFilter,
                    targetElement: target
                };
            }
        }
        // eslint-disable-next-line no-param-reassign
        target = target.parentNode;
    }
    return undefined;
}

function destroyDroppable(collection, widget) {
    const groupName = widget.options.group;
    const droppables = collection[groupName];
    let i;
    Widget.fn.destroy.call(widget);
    if (droppables.length > 1) {
        for (i = 0; i < droppables.length; i++) {
            if (droppables[i] === widget) {
                droppables.splice(i, 1);
                break;
            }
        }
    } else {
        droppables.length = 0;
        // eslint-disable-next-line no-param-reassign
        delete collection[groupName];
    }
}

function scrollableRoot() {
    return $(
        support.browser.edge || support.browser.safari
            ? document.body
            : document.documentElement
    );
}

function scrollableViewPort(element) {
    const root = scrollableRoot()[0];
    let top;
    let left;
    if (element[0] === root) {
        top = root.scrollTop;
        left = root.scrollLeft;
        return {
            top,
            left,
            bottom: top + $window.height(),
            right: left + $window.width()
        };
    }
    const offset = element.offset();
    offset.bottom = offset.top + element.height();
    offset.right = offset.left + element.width();
    return offset;
}

function findScrollableParent(element) {
    const root = scrollableRoot();
    if (
        !element ||
        element === document.body ||
        element === document.documentElement
    ) {
        return root;
    }
    let parent = $(element)[0];
    while (parent && !isScrollable(parent) && parent !== document.body) {
        parent = parent.parentNode;
    }
    if (parent === document.body) {
        return root;
    }
    return $(parent);
}

function autoScrollVelocity(mouseX, mouseY, rect) {
    const velocity = {
        x: 0,
        y: 0
    };
    const AUTO_SCROLL_AREA = 50;
    if (mouseX - rect.left < AUTO_SCROLL_AREA) {
        velocity.x = -(AUTO_SCROLL_AREA - (mouseX - rect.left));
    } else if (rect.right - mouseX < AUTO_SCROLL_AREA) {
        velocity.x = AUTO_SCROLL_AREA - (rect.right - mouseX);
    }
    if (mouseY - rect.top < AUTO_SCROLL_AREA) {
        velocity.y = -(AUTO_SCROLL_AREA - (mouseY - rect.top));
    } else if (rect.bottom - mouseY < AUTO_SCROLL_AREA) {
        velocity.y = AUTO_SCROLL_AREA - (rect.bottom - mouseY);
    }
    return velocity;
}

/*
TODO
kendo.ui.Draggable.utils = {
    autoScrollVelocity,
    scrollableViewPort,
    findScrollableParent
};
*/

/**
 * DropTargetEx
 * @class DropTargetEx
 * @extends Widget
 */
const DropTargetEx = Widget.extend({
    init(element, options) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        const { group } = that.options;
        if (!(group in dropTargets)) {
            dropTargets[group] = [that];
        } else {
            dropTargets[group].push(that);
        }
    },
    events: [DRAGENTER, DRAGLEAVE, DROP],
    options: {
        name: 'DropTargetEx',
        group: 'default'
    },
    destroy() {
        destroyDroppable(dropTargets, this);
    },
    // eslint-disable-next-line consistent-return
    _trigger(eventName, e) {
        const that = this;
        const draggable = draggables[that.options.group];
        if (draggable) {
            return that.trigger(
                eventName,
                extend({}, e.event, {
                    draggable,
                    dropTarget: e.dropTarget
                })
            );
        }
    },
    _over(e) {
        this._trigger(DRAGENTER, e);
    },
    _out(e) {
        this._trigger(DRAGLEAVE, e);
    },
    _drop(e) {
        const that = this;
        const draggable = draggables[that.options.group];
        if (draggable) {
            draggable.dropped = !that._trigger(DROP, e);
        }
    }
});
DropTargetEx.destroyGroup = function(groupName) {
    const group = dropTargets[groupName] || dropAreas[groupName];
    let i;
    if (group) {
        for (i = 0; i < group.length; i++) {
            Widget.fn.destroy.call(group[i]);
        }
        group.length = 0;
        delete dropTargets[groupName];
        delete dropAreas[groupName];
    }
};
DropTargetEx._cache = dropTargets;

/**
 * DropTargetAreaEx
 * @class DropTargetAreaEx
 * @extends DropTargetEx
 */
const DropTargetAreaEx = DropTargetEx.extend({
    init(element, options) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        const { group } = that.options;
        if (!(group in dropAreas)) {
            dropAreas[group] = [that];
        } else {
            dropAreas[group].push(that);
        }
    },
    destroy() {
        destroyDroppable(dropAreas, this);
    },
    options: {
        name: 'DropTargetAreaEx',
        group: 'default',
        filter: null
    }
});

/**
 * DraggableEx
 * @class DraggableEx
 * @extends Widget
 */
const DraggableEx = Widget.extend({
    init(element, options) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        that._activated = false;
        that.userEvents = new UserEvents(that.element, {
            global: true,
            allowSelection: true,
            filter: that.options.filter,
            threshold: that.options.distance,
            start: proxy(that._start, that),
            hold: proxy(that._hold, that),
            move: proxy(that._drag, that),
            end: proxy(that._end, that),
            cancel: proxy(that._cancel, that),
            select: proxy(that._select, that)
        });
        that._afterEndHandler = proxy(that._afterEnd, that);
        that._captureEscape = proxy(that._captureEscape, that);
    },
    events: [HOLD, DRAGSTART, DRAG, DRAGEND, DRAGCANCEL, HINTDESTROYED],
    options: {
        name: 'DraggableEx',
        distance: support.touch ? 0 : 5,
        group: 'default',
        cursorOffset: null,
        axis: null,
        container: null,
        filter: null,
        ignore: null,
        holdToDrag: false,
        autoScroll: false,
        dropped: false
    },
    cancelHold() {
        this._activated = false;
    },
    _captureEscape(e) {
        const that = this;
        if (e.keyCode === keys.ESC) {
            that._trigger(DRAGCANCEL, { event: e });
            that.userEvents.cancel();
        }
    },
    _updateHint(e) {
        const that = this;
        let coordinates;
        const {
            boundaries,
            options: { axis, cursorOffset }
        } = that;
        if (cursorOffset) {
            coordinates = {
                left: e.x.location + cursorOffset.left,
                top: e.y.location + cursorOffset.top
            };
        } else {
            that.hintOffset.left += e.x.delta;
            that.hintOffset.top += e.y.delta;
            coordinates = $.extend({}, that.hintOffset);
        }
        if (boundaries) {
            coordinates.top = within(coordinates.top, boundaries.y);
            coordinates.left = within(coordinates.left, boundaries.x);
        }
        if (axis === 'x') {
            delete coordinates.top;
        } else if (axis === 'y') {
            delete coordinates.left;
        }
        // BEGIN Added
        that.hintOffset = $.extend({}, coordinates);
        // END Added
        that.hint.css(coordinates);
    },
    _shouldIgnoreTarget(target) {
        const ignoreSelector = this.options.ignore;
        return ignoreSelector && $(target).is(ignoreSelector);
    },
    _select(e) {
        if (!this._shouldIgnoreTarget(e.event.target)) {
            e.preventDefault();
        }
    },
    _start(e) {
        const that = this;
        const { options } = that;
        const container = options.container ? $(options.container) : null;
        const { hint } = options;
        if (
            this._shouldIgnoreTarget(e.touch.initialTouch) ||
            (options.holdToDrag && !that._activated)
        ) {
            that.userEvents.cancel();
            return;
        }
        that.currentTarget = e.target;
        that.currentTargetOffset = getOffset(that.currentTarget);
        if (hint) {
            if (that.hint) {
                that.hint.stop(true, true).remove();
            }
            that.hint = isFunction(hint)
                ? $(hint.call(that, that.currentTarget))
                : hint;
            const offset = getOffset(that.currentTarget);
            that.hintOffset = offset;
            that.hint
                .css({
                    position: 'absolute',
                    zIndex: 20000,
                    left: offset.left,
                    top: offset.top
                })
                .appendTo(document.body);
            that.angular('compile', () => {
                that.hint.removeAttr('ng-repeat');
                let scopeTarget = $(e.target);
                while (
                    !scopeTarget.data('$$kendoScope') &&
                    scopeTarget.length
                ) {
                    scopeTarget = scopeTarget.parent();
                }
                return {
                    elements: that.hint.get(),
                    scopeFrom: scopeTarget.data('$$kendoScope')
                };
            });
        }
        draggables[options.group] = that;
        that.dropped = false;
        if (container) {
            that.boundaries = containerBoundaries(container, that.hint);
        }
        $(document).on(KEYUP, that._captureEscape);
        if (that._trigger(DRAGSTART, e)) {
            that.userEvents.cancel();
            that._afterEnd();
        }
        that.userEvents.capture();
    },
    _hold(e) {
        this.currentTarget = e.target;
        if (this._trigger(HOLD, e)) {
            this.userEvents.cancel();
        } else {
            this._activated = true;
        }
    },
    _drag(e) {
        e.preventDefault();
        const cursorElement = this._elementUnderCursor(e);
        if (this.options.autoScroll && this._cursorElement !== cursorElement) {
            this._scrollableParent = findScrollableParent(cursorElement);
            this._cursorElement = cursorElement;
        }
        this._lastEvent = e;
        this._processMovement(e, cursorElement);
        if (this.options.autoScroll) {
            if (this._scrollableParent[0]) {
                const velocity = autoScrollVelocity(
                    e.x.location,
                    e.y.location,
                    scrollableViewPort(this._scrollableParent)
                );
                this._scrollCompenstation = $.extend({}, this.hintOffset);
                this._scrollVelocity = velocity;
                if (velocity.y === 0 && velocity.x === 0) {
                    clearInterval(this._scrollInterval);
                    this._scrollInterval = null;
                } else if (!this._scrollInterval) {
                    this._scrollInterval = setInterval(
                        $.proxy(this, '_autoScroll'),
                        50
                    );
                }
            }
        }
        if (this.hint) {
            this._updateHint(e);
        }
    },
    _processMovement(e, cursorElement) {
        this._withDropTarget(cursorElement, (target, targetElement) => {
            if (!target) {
                if (lastDropTarget) {
                    lastDropTarget._trigger(
                        DRAGLEAVE,
                        extend(e, {
                            dropTarget: $(lastDropTarget.targetElement)
                        })
                    );
                    lastDropTarget = null;
                }
                return;
            }
            if (lastDropTarget) {
                if (targetElement === lastDropTarget.targetElement) {
                    return;
                }
                lastDropTarget._trigger(
                    DRAGLEAVE,
                    extend(e, { dropTarget: $(lastDropTarget.targetElement) })
                );
            }
            target._trigger(
                DRAGENTER,
                extend(e, { dropTarget: $(targetElement) })
            );
            lastDropTarget = extend(target, { targetElement });
        });
        this._trigger(
            DRAG,
            extend(e, {
                dropTarget: lastDropTarget,
                elementUnderCursor: cursorElement
            })
        );
    },
    _autoScroll() {
        const parent = this._scrollableParent[0];
        const velocity = this._scrollVelocity;
        const compensation = this._scrollCompenstation;
        if (!parent) {
            return;
        }
        const cursorElement = this._elementUnderCursor(this._lastEvent);
        this._processMovement(this._lastEvent, cursorElement);
        let yIsScrollable;
        let xIsScrollable;
        const isRootNode = parent === scrollableRoot()[0];
        if (isRootNode) {
            yIsScrollable = document.body.scrollHeight > $window.height();
            xIsScrollable = document.body.scrollWidth > $window.width();
        } else {
            yIsScrollable = parent.offsetHeight <= parent.scrollHeight;
            xIsScrollable = parent.offsetWidth <= parent.scrollWidth;
        }
        const yDelta = parent.scrollTop + velocity.y;
        const yInBounds =
            yIsScrollable && yDelta > 0 && yDelta < parent.scrollHeight;
        const xDelta = parent.scrollLeft + velocity.x;
        const xInBounds =
            xIsScrollable && xDelta > 0 && xDelta < parent.scrollWidth;
        if (yInBounds) {
            parent.scrollTop += velocity.y;
        }
        if (xInBounds) {
            parent.scrollLeft += velocity.x;
        }
        if (this.hint && isRootNode && (xInBounds || yInBounds)) {
            if (yInBounds) {
                compensation.top += velocity.y;
            }
            if (xInBounds) {
                compensation.left += velocity.x;
            }
            this.hint.css(compensation);
        }
    },
    _end(e) {
        this._withDropTarget(
            this._elementUnderCursor(e),
            (target, targetElement) => {
                if (target) {
                    target._drop(
                        extend({}, e, { dropTarget: $(targetElement) })
                    );
                    lastDropTarget = null;
                }
            }
        );
        this._cancel(this._trigger(DRAGEND, e));
    },
    _cancel(isDefaultPrevented) {
        const that = this;
        that._scrollableParent = null;
        this._cursorElement = null;
        clearInterval(this._scrollInterval);
        that._activated = false;
        if (that.hint && !that.dropped) {
            setTimeout(() => {
                that.hint.stop(true, true);
                if (isDefaultPrevented) {
                    that._afterEndHandler();
                } else {
                    that.hint.animate(
                        that.currentTargetOffset,
                        'fast',
                        that._afterEndHandler
                    );
                }
            }, 0);
        } else {
            that._afterEnd();
        }
    },
    _trigger(eventName, e) {
        const that = this;
        return that.trigger(
            eventName,
            extend({}, e.event, {
                x: e.x,
                y: e.y,
                currentTarget: that.currentTarget,
                initialTarget: e.touch ? e.touch.initialTouch : null,
                dropTarget: e.dropTarget,
                elementUnderCursor: e.elementUnderCursor
            })
        );
    },
    _elementUnderCursor(e) {
        let target = elementUnderCursor(e);
        const { hint } = this;
        if (hint && contains(hint[0], target)) {
            hint.hide();
            target = elementUnderCursor(e);
            if (!target) {
                target = elementUnderCursor(e);
            }
            hint.show();
        }
        return target;
    },
    _withDropTarget(element, callback) {
        let result;
        const { group } = this.options;
        const targets = dropTargets[group];
        const areas = dropAreas[group];
        if ((targets && targets.length) || (areas && areas.length)) {
            result = checkTarget(element, targets, areas);
            if (result) {
                callback(result.target, result.targetElement);
            } else {
                callback();
            }
        }
    },
    destroy() {
        const that = this;
        Widget.fn.destroy.call(that);
        that._afterEnd();
        that.userEvents.destroy();
        this._scrollableParent = null;
        this._cursorElement = null;
        clearInterval(this._scrollInterval);
        that.currentTarget = null;
    },
    _afterEnd() {
        const that = this;
        if (that.hint) {
            that.hint.remove();
        }
        delete draggables[that.options.group];
        that.trigger('destroy');
        that.trigger(HINTDESTROYED);
        $(document).off(KEYUP, that._captureEscape);
    }
});

/**
 * Registration
 */
plugin(DropTargetEx);
plugin(DropTargetAreaEx);
plugin(DraggableEx);
