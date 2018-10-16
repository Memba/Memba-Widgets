/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';

const {
    applyEventMap,
    Class,
    eventMap,
    guid,
    Observable,
    preventDefault,
    support
} = window.kendo;
const { now, extend } = $;
const OS = support.mobileOS;
const invalidZeroEvents = OS && OS.android;
let DEFAULT_MIN_HOLD = 800;
const CLICK_DELAY = 300;
let DEFAULT_THRESHOLD = support.browser.msie ? 5 : 0;
const PRESS = 'press';
const HOLD = 'hold';
const SELECT = 'select';
const START = 'start';
const MOVE = 'move';
const END = 'end';
const CANCEL = 'cancel';
const TAP = 'tap';
const DOUBLETAP = 'doubleTap';
const RELEASE = 'release';
const GESTURESTART = 'gesturestart';
const GESTURECHANGE = 'gesturechange';
const GESTUREEND = 'gestureend';
const GESTURETAP = 'gesturetap';
const THRESHOLD = {
    api: 0,
    touch: 0,
    mouse: 9,
    pointer: 9
};
const ENABLE_GLOBAL_SURFACE = !support.touch || support.mouseAndTouchPresent;

export function touchDelta(touch1, touch2) {
    const x1 = touch1.x.location;
    const y1 = touch1.y.location;
    const x2 = touch2.x.location;
    const y2 = touch2.y.location;
    const dx = x1 - x2;
    const dy = y1 - y2;
    return {
        center: {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
        },
        distance: Math.sqrt(dx * dx + dy * dy)
    };
}

export function getTouches(e) {
    const touches = [];
    const { originalEvent, currentTarget } = e;
    let idx = 0;
    let length;
    let changedTouches;
    let touch;
    if (e.api) {
        touches.push({
            id: 2,
            event: e,
            target: e.target,
            currentTarget: e.target,
            location: e,
            type: 'api'
        });
    } else if (e.type.match(/touch/)) {
        changedTouches = originalEvent ? originalEvent.changedTouches : [];
        for ({ length } = changedTouches; idx < length; idx++) {
            touch = changedTouches[idx];
            touches.push({
                location: touch,
                event: e,
                target: touch.target,
                currentTarget,
                id: touch.identifier,
                type: 'touch'
            });
        }
    } else if (support.pointers || support.msPointers) {
        touches.push({
            location: originalEvent,
            event: e,
            target: e.target,
            currentTarget,
            id: originalEvent.pointerId,
            type: 'pointer'
        });
    } else {
        touches.push({
            id: 1,
            event: e,
            target: e.target,
            currentTarget,
            location: e,
            type: 'mouse'
        });
    }
    return touches;
}

const TouchAxis = Class.extend({
    init(axis, location) {
        const that = this;
        that.axis = axis;
        that._updateLocationData(location);
        that.startLocation = that.location;
        that.delta = 0;
        that.velocity = that.delta;
        that.timeStamp = now();
    },
    move(location) {
        const that = this;
        const offset = location[`page${that.axis}`];
        const timeStamp = now();
        const timeDelta = timeStamp - that.timeStamp || 1;
        if (!offset && invalidZeroEvents) {
            return;
        }
        that.delta = offset - that.location;
        that._updateLocationData(location);
        that.initialDelta = offset - that.startLocation;
        that.velocity = that.delta / timeDelta;
        that.timeStamp = timeStamp;
    },
    _updateLocationData(location) {
        const that = this;
        const { axis } = that;
        that.location = location[`page${axis}`];
        that.client = location[`client${axis}`];
        that.screen = location[`screen${axis}`];
    }
});

const Touch = Class.extend({
    init(userEvents, target, touchInfo) {
        extend(this, {
            x: new TouchAxis('X', touchInfo.location),
            y: new TouchAxis('Y', touchInfo.location),
            type: touchInfo.type,
            useClickAsTap: userEvents.useClickAsTap,
            threshold: userEvents.threshold || THRESHOLD[touchInfo.type],
            userEvents,
            target,
            currentTarget: touchInfo.currentTarget,
            initialTouch: touchInfo.target,
            id: touchInfo.id,
            pressEvent: touchInfo,
            _clicks: userEvents._clicks,
            supportDoubleTap: userEvents.supportDoubleTap,
            _moved: false,
            _finished: false
        });
    },
    press() {
        this._holdTimeout = setTimeout(
            $.proxy(this, '_hold'),
            this.userEvents.minHold
        );
        this._trigger(PRESS, this.pressEvent);
    },
    _tap(touchInfo) {
        const that = this;
        that.userEvents._clicks += 1;
        if (that.userEvents._clicks === 1) {
            that._clickTimeout = setTimeout(() => {
                if (that.userEvents._clicks === 1) {
                    that._trigger(TAP, touchInfo);
                } else {
                    that._trigger(DOUBLETAP, touchInfo);
                }
                that.userEvents._clicks = 0;
            }, CLICK_DELAY);
        }
    },
    _hold() {
        this._trigger(HOLD, this.pressEvent);
    },
    move(touchInfo) {
        const that = this;
        if (that._finished) {
            return;
        }
        that.x.move(touchInfo.location);
        that.y.move(touchInfo.location);
        if (!that._moved) {
            if (that._withinIgnoreThreshold()) {
                return;
            }
            if (!UserEvents.current || UserEvents.current === that.userEvents) {
                that._start(touchInfo);
            } else {
                return that.dispose();
            }
        }
        if (!that._finished) {
            that._trigger(MOVE, touchInfo);
        }
    },
    end(touchInfo) {
        this.endTime = now();
        if (this._finished) {
            return;
        }
        this._finished = true;
        this._trigger(RELEASE, touchInfo);
        if (this._moved) {
            this._trigger(END, touchInfo);
        } else if (!this.useClickAsTap) {
            if (this.supportDoubleTap) {
                this._tap(touchInfo);
            } else {
                this._trigger(TAP, touchInfo);
            }
        }
        clearTimeout(this._holdTimeout);
        this.dispose();
    },
    dispose() {
        const { userEvents } = this;
        const activeTouches = userEvents.touches;
        this._finished = true;
        this.pressEvent = null;
        clearTimeout(this._holdTimeout);
        activeTouches.splice($.inArray(this, activeTouches), 1);
    },
    skip() {
        this.dispose();
    },
    cancel() {
        this.dispose();
    },
    isMoved() {
        return this._moved;
    },
    _start(touchInfo) {
        clearTimeout(this._holdTimeout);
        this.startTime = now();
        this._moved = true;
        this._trigger(START, touchInfo);
    },
    _trigger(name, touchInfo) {
        const that = this;
        const jQueryEvent = touchInfo.event;
        const data = {
            touch: that,
            x: that.x,
            y: that.y,
            target: that.target,
            event: jQueryEvent
        };
        if (that.userEvents.notify(name, data)) {
            jQueryEvent.preventDefault();
        }
    },
    _withinIgnoreThreshold() {
        const xDelta = this.x.initialDelta;
        const yDelta = this.y.initialDelta;
        return Math.sqrt(xDelta * xDelta + yDelta * yDelta) <= this.threshold;
    }
});

function withEachUpEvent(callback) {
    const downEvents = eventMap.up.split(' ');
    let idx = 0;
    const { length } = downEvents;
    for (; idx < length; idx++) {
        callback(downEvents[idx]);
    }
}

export const UserEvents = Observable.extend({
    init(element, options) {
        const that = this;
        let filter;
        const ns = guid();
        options = options || {};
        filter = that.filter = options.filter;
        that.threshold = options.threshold || DEFAULT_THRESHOLD;
        that.minHold = options.minHold || DEFAULT_MIN_HOLD;
        that.touches = [];
        that._maxTouches = options.multiTouch ? 2 : 1;
        that.allowSelection = options.allowSelection;
        that.captureUpIfMoved = options.captureUpIfMoved;
        that.useClickAsTap = !options.fastTap && !support.delayedClick();
        that.eventNS = ns;
        that._clicks = 0;
        that.supportDoubleTap = options.supportDoubleTap;
        element = $(element).handler(that);
        Observable.fn.init.call(that);
        extend(that, {
            element,
            surface:
                options.global && ENABLE_GLOBAL_SURFACE
                    ? $(element[0].ownerDocument.documentElement)
                    : $(options.surface || element),
            stopPropagation: options.stopPropagation,
            pressed: false
        });
        that.surface
            .handler(that)
            .on(applyEventMap('move', ns), '_move')
            .on(applyEventMap('up cancel', ns), '_end');
        element.on(applyEventMap('down', ns), filter, '_start');
        if (that.useClickAsTap) {
            element.on(applyEventMap('click', ns), filter, '_click');
        }
        if (support.pointers || support.msPointers) {
            if (support.browser.version < 11) {
                const defaultAction = 'pinch-zoom double-tap-zoom';
                element.css(
                    '-ms-touch-action',
                    options.touchAction && options.touchAction !== 'none'
                        ? `${defaultAction} ${options.touchAction}`
                        : defaultAction
                );
            } else {
                element.css('touch-action', options.touchAction || 'none');
            }
        }
        if (options.preventDragEvent) {
            element.on(applyEventMap('dragstart', ns), preventDefault);
        }
        element.on(
            applyEventMap('mousedown', ns),
            filter,
            { root: element },
            '_select'
        );
        if (that.captureUpIfMoved && support.eventCapture) {
            const surfaceElement = that.surface[0];
            const preventIfMovingProxy = $.proxy(that.preventIfMoving, that);
            withEachUpEvent(eventName => {
                surfaceElement.addEventListener(
                    eventName,
                    preventIfMovingProxy,
                    true
                );
            });
        }
        that.bind(
            [
                PRESS,
                HOLD,
                TAP,
                DOUBLETAP,
                START,
                MOVE,
                END,
                RELEASE,
                CANCEL,
                GESTURESTART,
                GESTURECHANGE,
                GESTUREEND,
                GESTURETAP,
                SELECT
            ],
            options
        );
    },
    preventIfMoving(e) {
        if (this._isMoved()) {
            e.preventDefault();
        }
    },
    destroy() {
        const that = this;
        if (that._destroyed) {
            return;
        }
        that._destroyed = true;
        if (that.captureUpIfMoved && support.eventCapture) {
            const surfaceElement = that.surface[0];
            withEachUpEvent(eventName => {
                surfaceElement.removeEventListener(
                    eventName,
                    that.preventIfMoving
                );
            });
        }
        that.element.kendoDestroy(that.eventNS);
        that.surface.kendoDestroy(that.eventNS);
        that.element.removeData('handler');
        that.surface.removeData('handler');
        that._disposeAll();
        that.unbind();
        delete that.surface;
        delete that.element;
        delete that.currentTarget;
    },
    capture() {
        UserEvents.current = this;
    },
    cancel() {
        this._disposeAll();
        this.trigger(CANCEL);
    },
    notify(eventName, data) {
        const that = this;
        const { touches } = that;
        if (this._isMultiTouch()) {
            switch (eventName) {
                case MOVE:
                    eventName = GESTURECHANGE;
                    break;
                case END:
                    eventName = GESTUREEND;
                    break;
                case TAP:
                    eventName = GESTURETAP;
                    break;
            }
            extend(data, { touches }, touchDelta(touches[0], touches[1]));
        }
        return this.trigger(eventName, extend(data, { type: eventName }));
    },
    press(x, y, target) {
        this._apiCall('_start', x, y, target);
    },
    move(x, y) {
        this._apiCall('_move', x, y);
    },
    end(x, y) {
        this._apiCall('_end', x, y);
    },
    _isMultiTouch() {
        return this.touches.length > 1;
    },
    _maxTouchesReached() {
        return this.touches.length >= this._maxTouches;
    },
    _disposeAll() {
        const { touches } = this;
        while (touches.length > 0) {
            touches.pop().dispose();
        }
    },
    _isMoved() {
        return $.grep(this.touches, touch => touch.isMoved()).length;
    },
    _select(e) {
        if (!this.allowSelection || this.trigger(SELECT, { event: e })) {
            e.preventDefault();
        }
    },
    _start(e) {
        const that = this;
        let idx = 0;
        const { filter } = that;
        let target;
        const touches = getTouches(e);
        const { length } = touches;
        let touch;
        const { which } = e;
        if ((which && which > 1) || that._maxTouchesReached()) {
            return;
        }
        UserEvents.current = null;
        that.currentTarget = e.currentTarget;
        if (that.stopPropagation) {
            e.stopPropagation();
        }
        for (; idx < length; idx++) {
            if (that._maxTouchesReached()) {
                break;
            }
            touch = touches[idx];
            if (filter) {
                target = $(touch.currentTarget);
            } else {
                target = that.element;
            }
            if (!target.length) {
                // eslint-disable-next-line no-continue
                continue;
            }
            touch = new Touch(that, target, touch);
            that.touches.push(touch);
            touch.press();
            if (that._isMultiTouch()) {
                that.notify('gesturestart', {});
            }
        }
    },
    _move(e) {
        this._eachTouch('move', e);
    },
    _end(e) {
        this._eachTouch('end', e);
    },
    _click(e) {
        const data = {
            touch: {
                initialTouch: e.target,
                target: $(e.currentTarget),
                endTime: now(),
                x: {
                    location: e.pageX,
                    client: e.clientX
                },
                y: {
                    location: e.pageY,
                    client: e.clientY
                }
            },
            x: e.pageX,
            y: e.pageY,
            target: $(e.currentTarget),
            event: e,
            type: 'tap'
        };
        if (this.trigger('tap', data)) {
            e.preventDefault();
        }
    },
    _eachTouch(methodName, e) {
        const that = this;
        const dict = {};
        const touches = getTouches(e);
        const activeTouches = that.touches;
        let idx;
        let touch;
        let touchInfo;
        let matchingTouch;
        for (idx = 0; idx < activeTouches.length; idx++) {
            touch = activeTouches[idx];
            dict[touch.id] = touch;
        }
        for (idx = 0; idx < touches.length; idx++) {
            touchInfo = touches[idx];
            matchingTouch = dict[touchInfo.id];
            if (matchingTouch) {
                matchingTouch[methodName](touchInfo);
            }
        }
    },
    _apiCall(type, x, y, target) {
        this[type]({
            api: true,
            pageX: x,
            pageY: y,
            clientX: x,
            clientY: y,
            target: $(target || this.element)[0],
            stopPropagation: $.noop,
            preventDefault: $.noop
        });
    }
});

UserEvents.defaultThreshold = function(value) {
    DEFAULT_THRESHOLD = value;
};

UserEvents.minHold = function(value) {
    DEFAULT_MIN_HOLD = value;
};
