/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add broken lines (left Z and right Z)
// TODO Add curved lines (left S and right S)
// TODO Add numbers to graduations (top, bottom)

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.drawing';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    geometry,
    drawing: { Circle, Element, Group, Path, Rect, Surface },
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.shape');
// const NS = '.kendoShape';
const WIDGET_CLASS = 'kj-shape';
const SHAPES = {
    CIRCLE: 'circle',
    POLYGON: 'polygon',
    RECTANGLE: 'rectangle',
};

/**
 * Normalize a number
 * @function normalizeNumber
 * @param value
 * @param num
 * @returns {number}
 */
function normalizeNumber(value, num = 0) {
    return $.type(value) === CONSTANTS.NUMBER ? value : num;
}

/**
 * Normalize a shape
 * @function normalizeShape
 * @param value
 * @returns {string}
 */
function normalizeShape(value) {
    const shape = String(value).toLowerCase();
    return Object.values(SHAPES).indexOf(shape) === -1
        ? SHAPES.RECTANGLE
        : shape;
}

/**
 * Get circle
 * @function getCircle
 * @param bounds
 * @param options
 * @returns {*}
 */
function getCircle(bounds, options) {
    const circle = new geometry.Circle(
        bounds.origin
            .clone()
            .translate(bounds.size.width / 2, bounds.size.height / 2),
        bounds.size.width / 2
    );
    return new Circle(circle, options);
}

/**
 * Get diamond cap
 * @function getDiamondCap
 * @param bounds
 * @param options
 * @returns {*}
 */
function getPolygon(bounds, options) {
    const path = new Path(options);
    path.moveTo(bounds.origin.clone().translate(bounds.size.width / 2, 0))
        .lineTo(
            bounds.origin
                .clone()
                .translate(bounds.size.width, bounds.size.height / 2)
        )
        .lineTo(
            bounds.origin
                .clone()
                .translate(bounds.size.width / 2, bounds.size.height)
        )
        .lineTo(bounds.origin.clone().translate(0, bounds.size.height / 2))
        .close();
    return path;
}

/**
 * Get rectangle
 * @function getRectangle
 * @param bounds
 * @param options
 * @returns {*}
 */
function getRectangle(bounds, options) {
    const rect = new geometry.Rect(bounds.origin, bounds.size);
    return new Rect(rect, options);
}

/**
 * Shape
 * @class Shape
 * @extends Widget
 */
const Shape = Widget.extend({
    /**
     * Init
     * @constructor
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.resize();
    },

    /**
     * Events
     * @field
     */
    // events: [],

    /**
     * Options
     * @field
     */
    options: {
        name: 'Shape',
        shape: SHAPES.RECTANGLE,
        text: '', // TODO: Should we add text?
        style: {
            // TODO Match style for formatting toolbar
            // TODO text
            fill: {
                color: '#33ccff',
            },
            opacity: 1,
            stroke: {
                color: '#999',
                dashType: 'solid',
                // lineCap: 'butt',
                // lineJoin: 'miter',
                // opacity: 1,
                width: 5,
            },
        },
    },

    /**
     * Shapes
     */
    shapes: SHAPES,

    /**
     * Render the widget
     * @method
     * @private
     */
    _render() {
        const { element } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a Shape widget.'
        );
        this.wrapper = element.addClass(WIDGET_CLASS).css({
            touchAction: CONSTANTS.none, // Prevents scrolling (also pinching and zooming)
            userSelect: CONSTANTS.none, // Prevents selecting
            // TODO maybe we need to add height 100% if undefined - check html
        });
        this.surface = Surface.create(element);
    },

    /**
     * Resize (redraw) the widget
     */
    resize() {
        const { surface } = this;
        surface.clear();
        surface.resize();
        const size = surface.getSize();
        // Add shape
        const shape = this._getShape(size);
        surface.draw(shape);
        // TODO add text
    },

    /**
     * Get line path
     * @param size
     * @returns {*}
     * @private
     */
    _getShape(size) {
        let ret;
        const {
            options: { style },
        } = this;
        const shape = normalizeShape(this.options.shape);
        const bounds = {
            origin: new geometry.Point(0, 0),
            size: new geometry.Size(size.width, size.height),
        };
        if (shape === SHAPES.RECTANGLE) {
            ret = getRectangle(bounds, style);
        }
        return ret;
    },

    /**
     * Destroy
     * @method
     */
    destroy() {
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
        destroy(this.element);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Shape')) {
    // Prevents loading several times in karma
    plugin(Shape);
}
