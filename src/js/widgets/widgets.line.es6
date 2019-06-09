/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

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
    ui: { plugin, Widget }
    // UserEvents
} = window.kendo;
const logger = new Logger('widgets.line');
// const NS = '.kendoLine';
const WIDGET_CLASS = 'kj-line';
const SHAPES = {
    ARROW: 'arrow',
    CIRCLE: 'circle',
    DIAMOND: 'diamond',
    NONE: 'none',
    SQUARE: 'square'
};

function normalizeNumber(value, num = 0) {
    return $.type(value) === CONSTANTS.NUMBER ? value : num;
}

function normalizeShape(value) {
    const shape = String(value).toLowerCase();
    return Object.values(SHAPES).indexOf(shape) === -1 ? 'none' : shape;
}

function getArrowCap(bounds, options) {
    let path;
    if (bounds.origin.x === 0) {
        // left arrow
        path = new Path(options)
            .moveTo(bounds.origin.clone().translate(0, bounds.size.height / 2))
            .lineTo(bounds.origin.clone().translate(bounds.size.width, 0))
            .lineTo(
                bounds.origin
                    .clone()
                    .translate(bounds.size.width / 2, bounds.size.height / 2)
            )
            .lineTo(
                bounds.origin
                    .clone()
                    .translate(bounds.size.width, bounds.size.height)
            )
            .close();
    } else {
        // right arrow
        path = new Path(options)
            .moveTo(bounds.origin)
            .lineTo(
                bounds.origin
                    .clone()
                    .translate(bounds.size.width, bounds.size.height / 2)
            )
            .lineTo(bounds.origin.clone().translate(0, bounds.size.height))
            .lineTo(
                bounds.origin
                    .clone()
                    .translate(bounds.size.width / 2, bounds.size.height / 2)
            )
            .close();
    }
    return path;
}

function getCircleCap(bounds, options) {
    const circle = new geometry.Circle(
        bounds.origin
            .clone()
            .translate(bounds.size.width / 2, bounds.size.height / 2),
        bounds.size.width / 2
    );
    return new Circle(circle, options);
}

function getDiamondCap(bounds, options) {
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

function getSquareCap(bounds, options) {
    const rect = new geometry.Rect(bounds.origin, bounds.size);
    return new Rect(rect, options);
}

/**
 * Line
 * @class Line
 * @extends Widget
 */
const Line = Widget.extend({
    /**
     * Constructor
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
        name: 'Line',
        endCap: {
            fill: {
                color: '#999'
            },
            opacity: 1,
            scale: 4,
            shape: 'none',
            stroke: {
                width: 0
            }
        },
        line: {
            // fill: {},
            opacity: 1,
            stroke: {
                color: '#999',
                dashType: 'solid',
                // lineCap: 'butt',
                // lineJoin: 'miter',
                // opacity: 1,
                width: 5
            }
        },
        smallSteps: {
            fill: {
                color: '#999'
            },
            opacity: 1,
            scale: 3,
            count: 0,
            stroke: {
                color: '#999',
                width: 1
            }
        },
        startCap: {
            fill: {
                color: '#999'
            },
            opacity: 1,
            scale: 2,
            shape: 'none',
            stroke: {
                width: 0
            }
        },
        steps: {
            fill: {
                color: '#999'
            },
            opacity: 1,
            scale: 4,
            count: 0,
            stroke: {
                color: '#999',
                width: 2
            }
        }
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
            'Please use a div tag to instantiate a Line widget.'
        );
        this.wrapper = element.addClass(WIDGET_CLASS).css({
            touchAction: 'none', // Prevents scrolling (also pinching and zooming)
            userSelect: 'none' // Prevents selecting
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
        // Add line
        const line = this._getLine(size);
        surface.draw(line);
        // Add graduations
        const graduations = this._getGraduations(size);
        if (graduations instanceof Group) {
            surface.draw(graduations);
        }
        // Add startCap
        const startCap = this._getStartCap(size);
        if (startCap instanceof Element) {
            surface.draw(startCap);
        }
        // Add endCap
        const endCap = this._getEndCap(size);
        if (endCap instanceof Element) {
            surface.draw(endCap);
        }
    },

    /**
     * Get line path
     * @param size
     * @returns {*}
     * @private
     */
    _getLine(size) {
        const {
            options: { line, startCap, endCap }
        } = this;
        const path = new Path({
            // cursor
            fill: line.fill,
            opacity: line.opacity,
            stroke: line.stroke
        });
        const lineWidth = normalizeNumber(((line || {}).stroke || {}).width);
        const startShift =
            normalizeShape((startCap || {}).shape) === 'none'
                ? 0
                : (normalizeNumber((startCap || {}).scale) * lineWidth) / 2;
        const endShift =
            normalizeShape(endCap.shape) === 'none'
                ? 0
                : (normalizeNumber((endCap || {}).scale) * lineWidth) / 2;
        path.moveTo(startShift, size.height / 2)
            .lineTo(size.width - endShift, size.height / 2)
            .close();
        return path;
    },

    /**
     * Get graduations (group)
     * @param size
     * @private
     */
    _getGraduations(size) {
        const {
            options: { line, smallSteps, steps } // TODO number
        } = this;
        let group;
        // stepCount is the number of primary graduations
        // 10 means 10 spaces or 11 (n+1) primary graduations from 0 to 10
        const stepCount = normalizeNumber((steps || {}).count);
        if (stepCount > 0) {
            group = new Group();
            // stepHeight is the height of a primary graduation
            const stepHeight =
                normalizeNumber((steps || {}).scale) *
                normalizeNumber(((line || {}).stroke || {}).width);
            // stepWidth is the stroke width of a primary graduation
            const stepWidth = normalizeNumber(
                ((steps || {}).stroke || {}).width
            );
            // smallStepCount is the number of secondary graduations within a primary graduation space
            // 5 means 5 spaces or 4 (n-1) secondary graduations at x.2, x.4, x.6 and x.8 (x and 2x being primary graduations)
            const smallStepCount = normalizeNumber((smallSteps || {}).count);
            // smallStepHeight is the height of a secondary graduation
            const smallStepHeight =
                normalizeNumber((smallSteps || {}).scale) *
                normalizeNumber(((line || {}).stroke || {}).width);
            // smallStepWidth is the stroke width of a secondary graduation
            const smallStepWidth = normalizeNumber(
                ((smallSteps || {}).stroke || {}).width
            );
            // Loop through steps (primary graduations)
            for (let i = 0; i <= stepCount; i++) {
                const stepPath = new Path({
                    fill: steps.fill,
                    opacity: steps.opacity,
                    stroke: steps.stroke
                });
                const stepSpace = (size.width - stepWidth) / stepCount;
                const stepX = stepWidth / 2 + i * stepSpace;
                stepPath
                    .moveTo(stepX, (size.height - stepHeight) / 2)
                    .lineTo(stepX, (size.height + stepHeight) / 2)
                    .close();
                group.append(stepPath);
                // TODO: Add numbers
                // Loop through small steps (secondary graduations)
                for (let j = 1; j < smallStepCount; j++) {
                    const smallStepPath = new Path({
                        fill: smallSteps.fill,
                        opacity: smallSteps.opacity,
                        stroke: smallSteps.stroke
                    });
                    const smallStepX =
                        stepX +
                        smallStepWidth / 2 +
                        (j * (stepSpace - smallStepWidth)) / smallStepCount;
                    smallStepPath
                        .moveTo(smallStepX, (size.height - smallStepHeight) / 2)
                        .lineTo(smallStepX, (size.height + smallStepHeight) / 2)
                        .close();
                    group.append(smallStepPath);
                }
            }
        }
        return group;
    },

    /**
     * Get start cap
     * @param size
     * @private
     */
    _getStartCap(size) {
        const {
            options: { line, startCap }
        } = this;
        const shape = normalizeShape((startCap || {}).shape);
        const capScale = normalizeNumber((startCap || {}).scale);
        const lineWidth = normalizeNumber(((line || {}).stroke || {}).width);
        const bounds = {
            origin: new geometry.Point(
                0,
                (size.height - capScale * lineWidth) / 2
            ),
            size: new geometry.Size(capScale * lineWidth, capScale * lineWidth)
        };
        const options = {
            fill: startCap.fill,
            opacity: startCap.opacity,
            stroke: startCap.stroke
        };
        let cap;
        switch (shape) {
            case SHAPES.ARROW:
                cap = getArrowCap(bounds, options);
                break;
            case SHAPES.CIRCLE:
                cap = getCircleCap(bounds, options);
                break;
            case SHAPES.DIAMOND:
                cap = getDiamondCap(bounds, options);
                break;
            case SHAPES.SQUARE:
                cap = getSquareCap(bounds, options);
                break;
            case SHAPES.NONE:
            default:
                break;
        }
        return cap;
    },

    /**
     * Get end cap
     * @param size
     * @returns {*}
     * @private
     */
    _getEndCap(size) {
        const {
            options: { line, endCap }
        } = this;
        const shape = normalizeShape((endCap || {}).shape);
        const capScale = normalizeNumber((endCap || {}).scale);
        const lineWidth = normalizeNumber(((line || {}).stroke || {}).width);
        const bounds = {
            origin: new geometry.Point(
                size.width - capScale * lineWidth,
                (size.height - capScale * lineWidth) / 2
            ),
            size: new geometry.Size(capScale * lineWidth, capScale * lineWidth)
        };
        const options = {
            fill: endCap.fill,
            opacity: endCap.opacity,
            stroke: endCap.stroke
        };
        let cap;
        switch (shape) {
            case SHAPES.ARROW:
                cap = getArrowCap(bounds, options);
                break;
            case SHAPES.CIRCLE:
                cap = getCircleCap(bounds, options);
                break;
            case SHAPES.DIAMOND:
                cap = getDiamondCap(bounds, options);
                break;
            case SHAPES.SQUARE:
                cap = getSquareCap(bounds, options);
                break;
            case SHAPES.NONE:
            default:
                break;
        }
        return cap;
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
plugin(Line);
