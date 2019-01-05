/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Replace with applyEventMap (see scratchPad)
// TODO Consider implementing a drawing surface widget for Connector - https://github.com/kidoju/Kidoju-Widgets/issues/150

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import 'kendo.drawing';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    getElementCenter,
    getMousePosition,
    getTransformScale
} from '../common/window.position.es6';
import { randomColor } from '../common/window.util.es6';

const {
    attr,
    data: { DataSource, Model },
    destroy,
    drawing,
    drawing: { Path, Surface },
    format,
    geometry,
    ui: { DataBoundWidget, plugin },
    unbind
} = window.kendo;
const logger = new Logger('widgets.connector');
const WIDGET = 'kendoConnector';
const NS = CONSTANTS.DOT + WIDGET;
const WIDGET_CLASS = /* 'k-widget */ 'kj-connector';
const MOUSEDOWN = `mousedown${NS} ` + `touchstart${NS}`;
const MOUSEMOVE = `mousemove${NS} ` + `touchmove${NS}`;
const MOUSEUP = `mouseup${NS} ` + `touchend${NS}`;
const SURFACE_CLASS = `${WIDGET_CLASS}-surface`;
const INTERACTIVE_CLASS = 'kj-interactive';
const PATH_WIDTH = 10;
const PATH_LINECAP = 'round';
const SURFACE = 'surface';
const ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
const DATA_TYPE = 'connection';

/**
 * Connector
 * @class Connector Widget (kendoConnector)
 */
var Connector = DataBoundWidget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        const that = this;
        options = options || {};
        DataBoundWidget.fn.init.call(that, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        that._enabled = that.element.prop('disabled')
            ? false
            : that.options.enable;
        that._layout();
        that._ensureSurface();
        that._dataSource();
        that._drawConnector();
        that._addMouseHandlers();
        that.value(that.options.value);
        kendo.notify(that);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Connector',
        id: null,
        value: null,
        targetValue: null, // Cannot be undefined otherwise it won't be read
        autoBind: true,
        dataSource: [],
        scaler: 'div.kj-stage',
        container: `div.kj-stage>div[data-${kendo.ns}role="stage"]`, // TODO: container might not be necessary but we need a Surface Widget??? https://github.com/kidoju/Kidoju-Widgets/issues/166
        color: '#FF0000',
        // in design mode: createSurface = false, enable = false
        // in play mode: createSurface = true, enabled = true
        // in review mode: createSurface = true, enable = false
        createSurface: true,
        enable: true
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value for MVVM binding
     * @param value
     */
    value(value) {
        const that = this;
        if (
            $.type(value) === CONSTANTS.STRING ||
            $.type(value) === CONSTANTS.NULL
        ) {
            that._value = value;
        } else if ($.type(value) === CONSTANTS.UNDEFINED) {
            return that._value;
        } else {
            throw new TypeError(
                '`value` is expected to be a nullable string if not undefined'
            );
        }
    },

    /**
     * Builds the widget layout
     * @private
     */
    _layout() {
        const that = this;
        that.wrapper = that.element;
        // touch-action: 'none' is for Internet Explorer - https://github.com/jquery/jquery/issues/2987
        // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
        that.element
            .addClass(WIDGET_CLASS)
            .addClass(INTERACTIVE_CLASS)
            .css({ touchAction: 'none' });
        that.surface = drawing.Surface.create(that.element);
    },

    /**
     * Ensure connection surface for all connectors
     * @private
     */
    _ensureSurface() {
        const that = this;
        const options = that.options;
        const container = that.element.closest(options.container);
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, options.container)
        );
        // ensure surface
        let surface = container.data(SURFACE);
        if (options.createSurface && !(surface instanceof Surface)) {
            let surfaceElement = container.find(CONSTANTS.DOT + SURFACE_CLASS);
            if (surfaceElement.length === 0) {
                // assert.ok(this.element.hasClass(WIDGET_CLASS), 'this._layout should be called before this._ensureSurface');
                const firstElementWithDraggable = container
                    .children()
                    .has(CONSTANTS.DOT + INTERACTIVE_CLASS)
                    .first();
                assert.hasLength(
                    firstElementWithDraggable,
                    assert.format(
                        assert.messages.hasLength.default,
                        'firstElementWithDraggable'
                    )
                );
                surfaceElement = $(`<CONSTANTS.DIV/>`)
                    .addClass(SURFACE_CLASS)
                    .css({ position: 'absolute', top: 0, left: 0 })
                    .height(container.height())
                    .width(container.width());
                surfaceElement.insertBefore(firstElementWithDraggable);
                surfaceElement.empty();
                surface = Surface.create(surfaceElement);
                container.data(SURFACE, surface);
            }
        }
    },

    /**
     * Draw the connector circle that begins or ends a connection
     * @private
     */
    _drawConnector() {
        assert.instanceof(
            Surface,
            this.surface,
            assert.format(
                assert.messages.instanceof.default,
                'this.surface',
                'kendo.drawing.Surface'
            )
        );
        const that = this; // this is the connector widget
        const options = that.options;
        const color = options.color;
        const element = that.element;
        const x = element.width() / 2; // parseInt(options.width, 10) / 2;
        const y = element.height() / 2; // parseInt(options.height, 10) / 2;
        const radius = Math.max(0, Math.min(x, y) - 10); // Add some space around radius to make it easier to grab on mobile devices
        const group = new drawing.Group();
        const outerCircleGeometry = new geometry.Circle([x, y], 0.8 * radius);
        const outerCircle = new drawing.Circle(outerCircleGeometry).stroke(
            color,
            0.2 * radius
        );
        group.append(outerCircle);
        const innerCircleGeometry = new geometry.Circle([x, y], 0.5 * radius);
        const innerCircle = new drawing.Circle(innerCircleGeometry)
            .stroke(color, 0.1 * radius)
            .fill(color);
        group.append(innerCircle);
        that.surface.clear();
        that.surface.draw(group);
    },

    /**
     * Add mouse event handlers
     * @private
     */
    _addMouseHandlers() {
        // IMPORTANT
        // We can have several containers containing connectors on a page
        // But we only have on set of event handlers shared across all containers
        // So we cannot use `this`, which is specific to this connector
        let element;
        let path;
        let target;
        $(document)
            .off(NS)
            .on(MOUSEDOWN, CONSTANTS.DOT + WIDGET_CLASS, e => {
                e.preventDefault(); // prevents from selecting the div
                element = $(e.currentTarget);
                const elementWidget = element.data(WIDGET);
                if (
                    elementWidget instanceof Connector &&
                    elementWidget._enabled
                ) {
                    elementWidget._dropConnection();
                    const scaler = element.closest(
                        elementWidget.options.scaler
                    );
                    const scale = scaler.length ? getTransformScale(scaler) : 1;
                    const container = element.closest(
                        elementWidget.options.container
                    );
                    assert.hasLength(
                        container,
                        assert.format(
                            assert.messages.hasLength.default,
                            elementWidget.options.container
                        )
                    );
                    const mouse = getMousePosition(e, container);
                    const center = getElementCenter(element, container, scale);
                    const surface = container.data(SURFACE);
                    assert.instanceof(
                        Surface,
                        surface,
                        assert.format(
                            assert.messages.instanceof.default,
                            'surface',
                            'kendo.drawing.Surface'
                        )
                    );
                    path = new drawing.Path({
                        stroke: {
                            color: elementWidget.options.color,
                            lineCap: PATH_LINECAP,
                            width: PATH_WIDTH
                        }
                    });
                    path.moveTo(center.left, center.top);
                    path.lineTo(mouse.x / scale, mouse.y / scale);
                    surface.draw(path);
                }
            })
            .on(MOUSEMOVE, e => {
                if (element instanceof $ && path instanceof Path) {
                    const elementWidget = element.data(WIDGET);
                    assert.instanceof(
                        Connector,
                        elementWidget,
                        assert.format(
                            assert.messages.instanceof.default,
                            'elementWidget',
                            'kendo.ui.Connector'
                        )
                    );
                    const scaler = element.closest(
                        elementWidget.options.scaler
                    );
                    const scale = scaler.length ? getTransformScale(scaler) : 1;
                    const container = element.closest(
                        elementWidget.options.container
                    );
                    assert.hasLength(
                        container,
                        assert.format(
                            assert.messages.hasLength.default,
                            elementWidget.options.container
                        )
                    );
                    const mouse = getMousePosition(e, container);
                    path.segments[1]
                        .anchor()
                        .move(mouse.x / scale, mouse.y / scale);
                }
            })
            .on(MOUSEUP, CONSTANTS.DOT + WIDGET_CLASS, e => {
                if (element instanceof $ && path instanceof Path) {
                    const targetElement =
                        e.originalEvent && e.originalEvent.changedTouches
                            ? document.elementFromPoint(
                                  e.originalEvent.changedTouches[0].clientX,
                                  e.originalEvent.changedTouches[0].clientY
                              )
                            : e.currentTarget;
                    target = $(targetElement).closest(
                        CONSTANTS.DOT + WIDGET_CLASS
                    );
                    const targetWidget = target.data(WIDGET);
                    // with touchend, target === element
                    // BUG REPORT  here: https://github.com/jquery/jquery/issues/2987
                    if (
                        element.attr(attr(CONSTANTS.ID)) !==
                            target.attr(attr(CONSTANTS.ID)) &&
                        targetWidget instanceof Connector &&
                        targetWidget._enabled
                    ) {
                        const elementWidget = element.data(WIDGET);
                        assert.instanceof(
                            Connector,
                            elementWidget,
                            assert.format(
                                assert.messages.instanceof.default,
                                'elementWidget',
                                'kendo.ui.Connector'
                            )
                        );
                        const container = element.closest(
                            elementWidget.options.container
                        );
                        assert.hasLength(
                            container,
                            assert.format(
                                assert.messages.hasLength.default,
                                elementWidget.options.container
                            )
                        );
                        const targetContainer = target.closest(
                            targetWidget.options.container
                        );
                        assert.hasLength(
                            targetContainer,
                            assert.format(
                                assert.messages.hasLength.default,
                                targetWidget.options.container
                            )
                        );
                        if (container[0] === targetContainer[0]) {
                            elementWidget._addConnection(target);
                        } else {
                            // We cannot erase so we need to redraw all
                            elementWidget.refresh();
                        }
                    } else {
                        target = undefined;
                    }
                }
                // Note: The MOUSEUP events bubble and the following handler is always executed after this one
            })
            .on(MOUSEUP, e => {
                if (path instanceof Path) {
                    path.close();
                }
                if (
                    element instanceof $ &&
                    $.type(target) === CONSTANTS.UNDEFINED
                ) {
                    const elementWidget = element.data(WIDGET);
                    if (elementWidget instanceof Connector) {
                        elementWidget.refresh();
                    }
                }
                path = undefined;
                element = undefined;
                target = undefined;
            });
    },

    /**
     * _dataSource function to bind refresh to the change event
     * @private
     */
    _dataSource() {
        // TODO review fro null

        // bind to the change event to refresh the widget
        if (
            this.dataSource instanceof DataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // returns the datasource OR creates one if using array or configuration
            this.dataSource = DataSource.create(this.options.dataSource);

            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            // TODO See dropzone - here before fetch
            // Filter dataSource
            this.dataSource.filter({
                field: 'type',
                operator: 'eq',
                value: DATA_TYPE
            });

            // trigger a read on the dataSource if one hasn't happened yet
            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * sets the dataSource for source binding
     * @param dataSource
     */
    setDataSource(dataSource) {
        const that = this;
        // set the internal datasource equal to the one passed in by MVVM
        that.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        that._dataSource();
    },

    /**
     * Add connection
     * Note: use this.value(string)
     * @param target
     */
    _addConnection(target) {
        target = $(target);
        const that = this;
        let ret = false;
        const options = that.options;
        const element = that.element;
        const id = element.attr(attr(CONSTANTS.ID));
        const container = that.element.closest(options.container);
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, options.container)
        );
        const targetId = target.attr(attr(CONSTANTS.ID));
        const targetWidget = target.data(WIDGET);
        if (id !== targetId && targetWidget instanceof Connector) {
            const targetContainer = target.closest(
                targetWidget.options.container
            );
            assert.hasLength(
                targetContainer,
                assert.format(
                    assert.messages.hasLength.default,
                    targetWidget.options.container
                )
            );
            if (container[0] === targetContainer[0]) {
                assert.instanceof(
                    DataSource,
                    that.dataSource,
                    assert.format(
                        assert.messages.instanceof.default,
                        'this.dataSource',
                        'kendo.data.DataSource'
                    )
                );
                const originId = id < targetId ? id : targetId;
                const destinationId = id < targetId ? targetId : id;
                const originWidget = id < targetId ? that : targetWidget;
                const destinationWidget = id < targetId ? targetWidget : that;
                const connections = that.dataSource.view();
                const originConnection = connections.find(
                    connection =>
                        connection.type === DATA_TYPE && // The dataSource is already filtered, so this might be redundant
                        (connection.id === originId ||
                            connection.data.target === originId)
                );
                const destinationConnection = connections.find(
                    connection =>
                        connection.type === DATA_TYPE && // The dataSource is already filtered, so this might be redundant
                        (connection.id === destinationId ||
                            connection.data.target === destinationId)
                );
                if (
                    ($.type(originConnection) === CONSTANTS.UNDEFINED &&
                        $.type(destinationConnection) ===
                            CONSTANTS.UNDEFINED) ||
                    originConnection !== destinationConnection
                ) {
                    if (originConnection) {
                        that.dataSource.remove(originConnection);
                        originWidget._dropConnection();
                    }
                    if (destinationConnection) {
                        that.dataSource.remove(destinationConnection);
                        destinationWidget._dropConnection();
                    }
                    that.dataSource.add({
                        type: DATA_TYPE,
                        id: originId,
                        data: {
                            target: destinationId,
                            color: randomColor()
                        }
                    });
                    originWidget._value = destinationWidget.options.targetValue;
                    destinationWidget._value = originWidget.options.targetValue;
                    // if (originWidget.element[0].kendoBindingTarget && !(originWidget.element[0].kendoBindingTarget.source instanceof kidoju.data.PageComponent)) {
                    if (
                        originWidget.element[0].kendoBindingTarget &&
                        !(
                            originWidget.element[0].kendoBindingTarget
                                .source instanceof Model
                        )
                    ) {
                        originWidget.trigger(CONSTANTS.CHANGE, {
                            value: originWidget._value
                        });
                    }
                    // if (destinationWidget.element[0].kendoBindingTarget && !(destinationWidget.element[0].kendoBindingTarget.source instanceof kidoju.data.PageComponent)) {
                    if (
                        destinationWidget.element[0].kendoBindingTarget &&
                        !(
                            destinationWidget.element[0].kendoBindingTarget
                                .source instanceof Model
                        )
                    ) {
                        destinationWidget.trigger(CONSTANTS.CHANGE, {
                            value: destinationWidget._value
                        });
                    }
                }
                ret = true;
            }
        }
        return ret;
    },

    /**
     * Remove connection
     * Note: use this.value(null)
     */
    _dropConnection() {
        const that = this;
        const options = that.options;
        const element = that.element;
        const id = element.attr(attr(CONSTANTS.ID));
        const container = that.element.closest(options.container);
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, options.container)
        );
        assert.instanceof(
            DataSource,
            that.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.dataSource',
                'kendo.data.DataSource'
            )
        );
        const found = that.dataSource.view().find(
            connection =>
                connection.type === DATA_TYPE && // The dataSource is already filtered, so this might be redundant
                (connection.id === id || connection.data.target === id)
        );
        if (found) {
            const targetId = found.id === id ? found.data.target : found.id;
            const target = container.find(
                format(ATTRIBUTE_SELECTOR, attr(CONSTANTS.ID), targetId)
            );
            const targetWidget = target.data(WIDGET);
            that.dataSource.remove(found);
            that._value = null;
            if (targetWidget instanceof Connector) {
                targetWidget._value = null;
            }
            that.trigger(CONSTANTS.CHANGE, { value: null });
            if (targetWidget instanceof Connector) {
                targetWidget.trigger(CONSTANTS.CHANGE, { value: null });
            }
        }
    },

    /**
     * Refresh
     * Redraw all connections
     */
    refresh() {
        const that = this;
        const options = that.options;
        const container = that.element.closest(options.container);
        assert.instanceof(
            $,
            container,
            assert.format(
                assert.messages.instanceof.default,
                'container',
                'jQuery'
            )
        );
        assert.instanceof(
            DataSource,
            that.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.dataSource',
                'kendo.data.DataSource'
            )
        );
        const surface = container.data(SURFACE);
        if (surface instanceof Surface) {
            // Clear surface
            surface.clear();
            // Redraw all connections
            that.dataSource.view().forEach(connection => {
                const origin = container.find(
                    format(
                        ATTRIBUTE_SELECTOR,
                        attr(CONSTANTS.ID),
                        connection.id
                    )
                );
                const originWidget = origin.data(WIDGET);
                const destination = container.find(
                    format(
                        ATTRIBUTE_SELECTOR,
                        attr(CONSTANTS.ID),
                        connection.data.target
                    )
                );
                const destinationWidget = destination.data(WIDGET);
                // Only connector widgets can be connected
                if (
                    originWidget instanceof Connector &&
                    destinationWidget instanceof Connector
                ) {
                    const scaler = origin.closest(originWidget.options.scaler);
                    const scale = scaler.length ? getTransformScale(scaler) : 1;
                    const originCenter = getElementCenter(
                        origin,
                        container,
                        scale
                    );
                    const destinationCenter = getElementCenter(
                        destination,
                        container,
                        scale
                    );
                    const path = new drawing.Path({
                        stroke: {
                            color: connection.data.color,
                            lineCap: PATH_LINECAP,
                            width: PATH_WIDTH
                        }
                    })
                        .moveTo(originCenter.left, originCenter.top)
                        .lineTo(destinationCenter.left, destinationCenter.top);
                    surface.draw(path);
                }
            });
        }

        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Enable/disable user interactivity on connector
     */
    enable(enabled) {
        // this._enabled is checked in _addMouseHandlers
        this._enabled = enabled;
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const element = that.element;
        const container = element.closest(that.options.container);
        const surface = container.data(SURFACE);
        DataBoundWidget.fn.destroy.call(that);
        // unbind document events
        $(document).off(NS);
        // unbind and destroy all descendants
        unbind(element);
        destroy(element);
        // unbind all other events (probably redundant)
        element.find('*').off();
        element.off();
        // remove descendants
        element.empty();
        // remove widget class
        element.removeClass(WIDGET_CLASS);
        // If last connector on stage, remove surface
        if (
            container.find(CONSTANTS.DOT + WIDGET_CLASS).length === 0 &&
            surface instanceof Surface
        ) {
            destroy(surface.element);
            surface.element.remove();
            container.removeData(SURFACE);
        }
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(Connector);
