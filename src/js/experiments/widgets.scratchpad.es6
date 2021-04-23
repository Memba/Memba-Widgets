/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';
import 'kendo.drawing';
import 'kendo.userevents'; // Required for getTouches
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    applyEventMap,
    data: { ObservableArray },
    drawing: { Path, Segment, Surface },
    destroy,
    getTouches,
    roleSelector,
    ui: { plugin, Widget }
    // UserEvents
} = window.kendo;
const logger = new Logger('widgets.scratchpad');
const WIDGET_CLASS = 'k-widget kj-scratchpad';

// TODO add asserts and logs
// TODO constrain within ScratchPad
// TODO Consider path stroke options
// TODO Consider scaling within Kidoju Stage
// TODO use pathEx to smoothen lines and reduce data size

/** *****************************************************************************
 * Path serialization
 ****************************************************************************** */

/**
 * fromArray of [anchor, controlIn, controlOut]
 * @param segments
 */
Path.fromSegments = function fromSegments(segments, options) {
    const path = new Path(options);
    segments.forEach((segment, index, all) => {
        if (index === 0) {
            path.moveTo(segment[0]);
        } else if (
            segment[1].length === 2 && // If the segment has a controlIn
            all[index - 1][2].length === 2 // and the previsous segment has a controlOut
        ) {
            path.curveTo(
                all[index - 1][2], // controlOut
                segment[1], // controlIn
                segment[0] // anchor
            );
        } else {
            path.lineTo(segment[0]);
        }
    });
    return path;
};

/**
 * toArray of [anchor, controlIn, controlOut]
 */
Path.prototype.toSegments = function toSegments() {
    const ret = [];
    const empty = {
        toArray() {
            return [];
        }
    };
    for (let i = 0, { length } = this.segments; i < length; i++) {
        const segment = this.segments[i];
        assert.instanceof(
            Segment,
            segment,
            assert.format(
                assert.messages.instanceof.default,
                'segment',
                'kendo.drawing.Segment'
            )
        );
        ret.push([
            segment.anchor().toArray(),
            (segment.controlIn() || empty).toArray(),
            (segment.controlOut() || empty).toArray()
        ]);
    }
    return ret;
};

/** *****************************************************************************
 * Kendo UI Widget
 ****************************************************************************** */

/**
 * ScratchPad
 * @class ScratchPad
 * @extends Widget
 */
const ScratchPad = Widget.extend({
    /**
     * Constructor
     * @constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
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
        name: 'ScratchPad',
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
        const { element } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a ScratchPad widget.'
        );
        this.wrapper = element.addClass(WIDGET_CLASS).css({
            touchAction: 'none', // Prevents scrolling when scratching (also pinching and zooming)
            userSelect: 'none' // Prevents selecting when scratching
        });
        this.surface = Surface.create(element);
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
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method
     */
    destroy() {
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
        destroy(this.element);
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'ScratchPad')) {
    // Prevents loading several times in karma
    plugin(ScratchPad);
}

/** *****************************************************************************
 * Document events
 ****************************************************************************** */

const NS = '.kendoScratchPad';
const ROLE = 'scratchpad';
const eventData = {};

/**
 * mousedown event handler
 * @param e
 * @private
 */
ScratchPad._onMouseDown = function onMouseDown(e) {
    const that = $(e.currentTarget).data('kendoScratchPad');
    const touches = getTouches(e);
    e.preventDefault(); // Prevents from executing both mouse and touch events
    if (
        that instanceof ScratchPad &&
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
ScratchPad._onMouseMove = function onMouseMove(e) {
    e.preventDefault(); // Prevents from executing both mouse and touch events
    if (e.data.widget instanceof ScratchPad && e.data.path instanceof Path) {
        const that = $(e.currentTarget).data('kendoScratchPad');
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
ScratchPad._onMouseEnd = function onMouseEnd(e) {
    e.preventDefault(); // Prevents from executing both mouse and touch events
    if (e.data.widget instanceof ScratchPad && e.data.path instanceof Path) {
        ScratchPad._onMouseMove(e);
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
        ScratchPad._onMouseDown
    )
    .on(
        applyEventMap(CONSTANTS.MAPMOVE, NS.substr(1)),
        roleSelector(ROLE),
        eventData,
        ScratchPad._onMouseMove
    )
    .on(
        applyEventMap(
            `${CONSTANTS.MAPUP} ${CONSTANTS.MAPCANCEL}`,
            NS.substr(1)
        ),
        // roleSelector(ROLE), IMPORTANT! We need to stop drawing wherever mouseup/touchend occurs
        eventData,
        ScratchPad._onMouseEnd
    );
