/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';
import 'kendo.drawing';
import 'kendo.userevents'; // Required for getTouches
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// TODO: import Logger from '../window.logger.es6';

const {
    applyEventMap,
    destroy,
    getTouches,
    roleSelector,
    ui: { plugin, Widget }
    // UserEvents
} = window.kendo;
const { Path, Segment, Surface } = window.kendo.drawing;
const { ObservableArray } = window.kendo.data;
const WIDGET_CLASS = 'k-widget kj-panzoom';

// TODO on('wheel') + kendo.wheelDeltaY

/**
 * PanZoom
 * A kendo.drawing.Surface with panning and zooming
 * @class PanZoom
 * @extends Widget
 */
const PanZoom = Widget.extend({
    /**
     * Constructor
     * @constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        // logger.debug({ method: 'init', message: 'widget initialized' });
        this.wrapper = this.element;
        this._render();
        this.enable(this.options.enable);
        this.value(this.options.value);
    },

    /**
     * Events
     * @field
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @field
     */
    options: {
        name: 'PanZoom',
        enable: true,
        // messages: {},
        stroke: {}, // TODO
        value: []
    },

    /**
     * Value
     * Note: get/set won't work
     * @method
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (Array.isArray(value) || value instanceof ObservableArray) {
            this._value = value;
            this.refresh();
        } else {
            throw new TypeError(
                '`value` is expected to be an Array, an ObservableArray or undefined'
            );
        }
        return ret;
    },

    /**
     * Render the widget
     * @method
     * @private
     */
    _render() {
        this.element.addClass(WIDGET_CLASS).css({
            touchAction: 'none', // Prevents scrolling when scratching (also pinching and zooming)
            userSelect: 'none' // Prevents selecting when scratching
        });
        this.surface = Surface.create(this.element);
    },

    /**
     * Enable/disable the widget
     * @method
     * @param enable
     */
    enable(enable) {
        this._enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        // Note: We cannot use UserEvents because it implements
        // a minimum delta before triggering the start event handler
        /*
        if (this.userEvents instanceof UserEvents) {
            this.userEvents.destroy();
            this.userEvents = undefined;
        }
        if (this._enabled) {
            this.userEvents = new UserEvents(this.element, {
                minHold: 0,
                threshold: 0,
                start: this._onMouseDown.bind(this),
                move: this._onMouseMove.bind(this),
                end: this._onMouseEnd.bind(this)
            });
        }
        */
    },

    /**
     * Refresh
     * @method
     */
    refresh() {
        this.surface.clear();
        this._value.forEach(p => {
            const path = Path.fromSegments(p.segments, p.options);
            this.surface.draw(path);
        });
    },

    /**
     * Destroy
     * @method
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(PanZoom);

/** *****************************************************************************
 * Document events
 ****************************************************************************** */

const NS = '.kendoPanZoom';
const ROLE = 'panzoom';
const eventData = {};

/**
 * mousedown event handler
 * @param e
 * @private
 */
PanZoom._onMouseDown = function onMouseDown(e) {
    const that = $(e.currentTarget).data('kendoPanZoom');
    const touches = getTouches(e);
    e.preventDefault(); // Prevents from executing both mouse and touch events
    if (
        that instanceof PanZoom &&
        that._enabled &&
        Array.isArray(touches) &&
        touches.length
    ) {
        e.data.widget = that;
        e.data.path = new Path();
        e.data.path.moveTo(
            touches[0].location.pageX - that.element.offset().left,
            touches[0].location.pageY - that.element.offset().top
        );
        that.surface.draw(e.data.path);
    }
};

/**
 * mousemove event handler
 * @param e
 * @private
 */
PanZoom._onMouseMove = function onMouseMove(e) {
    e.preventDefault(); // Prevents from executing both mouse and touch events
    if (e.data.widget instanceof PanZoom && e.data.path instanceof Path) {
        const that = $(e.currentTarget).data('kendoPanZoom');
        const touches = getTouches(e);
        if (
            that === e.data.widget &&
            that._enabled &&
            Array.isArray(touches) &&
            touches.length
        ) {
            e.data.path.lineTo(
                touches[0].location.pageX - that.element.offset().left,
                touches[0].location.pageY - that.element.offset().top
            );
        }
    }
};

/**
 * mouseup event handler
 * @param e
 * @private
 */
PanZoom._onMouseEnd = function onMouseEnd(e) {
    e.preventDefault(); // Prevents from executing both mouse and touch events
    if (e.data.widget instanceof PanZoom && e.data.path instanceof Path) {
        PanZoom._onMouseMove(e);
        e.data.widget._value.push({
            segments: e.data.path.toSegments()
            /*
            options: {
                stroke: {
                    color: e.data.path.stroke().color
                }
            }
            */
        });
        e.data.widget.trigger(CONSTANTS.CHANGE);
        delete e.data.path;
        delete e.data.widget;
    }
};

/**
 * Initialize document events
 */
$(document)
    .on(
        applyEventMap(CONSTANTS.MAPDOWN, NS.substr(1)),
        roleSelector(ROLE),
        eventData,
        PanZoom._onMouseDown
    )
    .on(
        applyEventMap(CONSTANTS.MAPMOVE, NS.substr(1)),
        roleSelector(ROLE),
        eventData,
        PanZoom._onMouseMove
    )
    .on(
        applyEventMap(
            `${CONSTANTS.MAPUP} ${CONSTANTS.MAPCANCEL}`,
            NS.substr(1)
        ),
        // roleSelector(ROLE), IMPORTANT! We need to stop drawing wherever mouseup/touchend occurs
        eventData,
        PanZoom._onMouseEnd
    );
