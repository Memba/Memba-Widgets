/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add broken lines (left Z and right Z)
// TODO Add curved lines (left S and right S)
// TODO Add numbers to graduations (top, bottom)

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.drawing';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    geometry,
    drawing: { Circle, Path, Rect, Surface, Text },
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.shape');
// const NS = '.kendoShape';
const WIDGET_CLASS = 'kj-shape';
const SHAPES = {
    ELLIPSIS: 'ellipsis',
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
 * Get ellipsis
 * @function getEllipsis
 * @param bounds
 * @param style
 */
function getEllipsis(bounds, style = {}) {
    const borderWidth = normalizeNumber((style.stroke || {}).width, 1);
    const center = bounds.origin
        .clone()
        .translate(bounds.size.width / 2, bounds.size.height / 2);
    const arc = new geometry.Arc(center, {
        radiusX: (bounds.size.width - borderWidth) / 2,
        radiusY: (bounds.size.height - borderWidth) / 2,
        startAngle: 0,
        endAngle: 360,
    });
    return Path.fromArc(arc, style).close();
}

/**
 * Get circle
 * @function getCircle
 * @param bounds
 * @param style
 * @returns {*}
 */
function getCircle(bounds, style = {}) {
    const borderWidth = normalizeNumber((style.stroke || {}).width, 1);
    const center = bounds.origin
        .clone()
        .translate(bounds.size.width / 2, bounds.size.height / 2);
    const circle = new geometry.Circle(
        center,
        (bounds.size.width - borderWidth) / 2
    );
    return new Circle(circle, style);
}

/**
 * Get Polygon
 * @function getPolygon
 * @param bounds
 * @param style
 * @param angles
 * @returns {*}
 */
function getPolygon(bounds, style, angles = 4) {
    const borderWidth = normalizeNumber((style.stroke || {}).width, 1);
    const center = bounds.origin
        .clone()
        .translate(bounds.size.width / 2, bounds.size.height / 2);
    const radiusX = (bounds.size.width - borderWidth) / 2;
    const radiusY = (bounds.size.height - borderWidth) / 2;
    const path = new Path(style);
    for (let i = 0; i < angles; i++) {
        const rad = (2 * Math.PI * i) / angles;
        path[i === 0 ? 'moveTo' : 'lineTo'](
            center
                .clone()
                .translate(radiusX * Math.cos(rad), radiusY * Math.sin(rad))
        );
    }
    return path.close();
}

/**
 * Get rectangle
 * @function getRectangle
 * @param bounds
 * @param style
 * @returns {*}
 */
function getRectangle(bounds, style) {
    const borderWidth = normalizeNumber((style.stroke || {}).width, 1);
    const topLeft = bounds.origin
        .clone()
        .translate(borderWidth / 2, borderWidth / 2);
    const size = bounds.size
        .clone()
        .setWidth(bounds.size.width - borderWidth)
        .setHeight(bounds.size.height - borderWidth);
    const rect = new geometry.Rect(topLeft, size);
    return new Rect(rect, style);
}

// TODO Rounded rectangle
// TODO Star
// TODO Heart

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
        angles: 4,
        text: '',
        style: {
            // TODO Match style for formatting toolbar
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
            // TODO text
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
        // Add text
        const text = this._getText(size);
        surface.draw(text);
    },

    /**
     * Get shape
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
        if (shape === SHAPES.ELLIPSIS) {
            ret =
                bounds.size.width === bounds.size.height
                    ? getCircle(bounds, style)
                    : getEllipsis(bounds, style);
        } else if (shape === SHAPES.POLYGON) {
            const angles = normalizeNumber(this.options.angles, 4);
            ret = getPolygon(bounds, style, angles);
        } else if (shape === SHAPES.RECTANGLE) {
            ret = getRectangle(bounds, style);
        }
        return ret;
    },

    /**
     * Get text
     * @param size
     * @returns {*}
     * @private
     */
    _getText(size) {
        // TODO https://www.telerik.com/forums/centering-text-in-rectangle-group
        const {
            options: { text },
        } = this;
        const position = new geometry.Point(10, 10);
        return new Text(text, position);
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
