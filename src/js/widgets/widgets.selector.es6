/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO use applyEventMap - See scratchpad

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import 'kendo.drawing';
import 'kendo.toolbar';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    getMousePosition,
    getTransformScale
} from '../common/window.position.es6';
import { isAnyArray, randomId } from '../common/window.util.es6';

const {
    attr,
    Class,
    data: { DataSource, ObservableObject },
    deepExtend,
    destroy,
    drawing: { Arc, Element, exportImage, Group, Path, Surface },
    format,
    geometry,
    ns,
    roleSelector,
    unbind,
    ui: { DataBoundWidget, plugin, ToolBar, Widget }
} = window.kendo;
const logger = new Logger('widgets.selector');
const WIDGET = 'kendoSelector';
const NS = CONSTANTS.DOT + WIDGET;
const WIDGET_CLASS = 'kj-selector'; // 'k-widget kj-selector';

const MOUSEDOWN = `mousedown${NS} ` + `touchstart${NS}`;
const MOUSEMOVE = `mousemove${NS} ` + `touchmove${NS}`;
const MOUSELEAVE = `mouseleave${NS} ` + `touchleave${NS}`;
const MOUSEUP = `mouseup${NS} ` + `touchend${NS}`;
const TOGGLE = 'toggle';
const CONSTANT = 'constant';
const SURFACE_CLASS = `${WIDGET_CLASS}-surface`;
const INTERACTIVE_CLASS = 'kj-interactive';
const ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
const ROLE_SELECTOR = 'selector';
const DATA_TYPE = 'selection';
const BUTTON_PREFIX = 'button_';
const ICON_SIZE = 16;
const MIN_RADIUS = 15;
const HIT_RADIUS = 15;

/** *******************************************************************************
 * SelectorEvents
 ******************************************************************************** */

/**
 * SelectorEvents
 */
const SelectorEvents = Class.extend({
    /**
     * Init mouse events to draw on surface
     * Note: There is only one set of event handlers shared across all selector surfaces
     * @constructor
     */
    init(options) {
        assert.isPlainObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
        );
        assert(
            CONSTANTS.STRING,
            options.container,
            assert.format(
                assert.messages.type.default,
                'options.container',
                CONSTANTS.STRING
            )
        );
        assert(
            CONSTANTS.STRING,
            options.scaler,
            assert.format(
                assert.messages.type.default,
                'options.scaler',
                CONSTANTS.STRING
            )
        );
        this._container = options.container;
        this._scaler = options.scaler;
    },

    /**
     * Enable/Disable events
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // We need an object so that data is passed by reference between handlers
        const data = {};

        $(document).off(NS);

        if (enabled) {
            // Note: mouse events cannot be caught on the selector surface,
            // because any element on top of the selector surface captures them first.
            // We need to let all mouse events bubble up to the container to ensure
            // events do not stop being captured while drawing a path when moving over other elements
            $(document)
                .on(
                    MOUSEDOWN,
                    this._container,
                    data,
                    this._onMouseDown.bind(this)
                )
                .on(
                    MOUSEMOVE,
                    this._container,
                    data,
                    this._onMouseMove.bind(this)
                )
                .on(
                    MOUSELEAVE,
                    this._container,
                    data,
                    this._onMouseEnd.bind(this)
                )
                .on(MOUSEUP, data, this._onMouseEnd.bind(this));

            // Note: MOUSEUP should end the path even if it is triggered outside the container.
        }
    },

    /**
     * Get stage point from mouse event
     * Note: this gives us stage coordinates that do not depend on scale
     * @param e
     * @private
     */
    _getStagePoint(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            window.Element,
            e.target,
            assert.format(
                assert.messages.instanceof.default,
                'e.target',
                'Element'
            )
        );
        assert.type(
            CONSTANTS.STRING,
            this._container,
            assert.format(
                assert.messages.type.default,
                'this._container',
                CONSTANTS.STRING
            )
        );
        assert.type(
            CONSTANTS.STRING,
            this._scaler,
            assert.format(
                assert.messages.type.default,
                'this._scaler',
                CONSTANTS.STRING
            )
        );
        const container = $(e.target).closest(this._container);
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, 'container')
        );
        const scaler = container.closest(this._scaler);
        const scale = scaler.length ? getTransformScale(scaler) : 1;
        const mouse = getMousePosition(e, container);
        return new geometry.Point(mouse.x / scale, mouse.y / scale);
    },

    /**
     * Get the closest selector surface
     * @param target
     * @private
     */
    _getSelectorSurface(target) {
        assert.instanceof(
            $,
            target,
            assert.format(
                assert.messages.instanceof.default,
                'target',
                'jQuery'
            )
        );
        assert.hasLength(
            target,
            assert.format(assert.messages.hasLength.default, 'target')
        );
        assert.type(
            CONSTANTS.STRING,
            this._container,
            assert.format(
                assert.messages.type.default,
                'this._container',
                CONSTANTS.STRING
            )
        );
        const container = target.closest(this._container);
        const selectorSurface = container
            .find(roleSelector('selectorsurface'))
            .data('kendoSelectorSurface');
        if (
            selectorSurface instanceof SelectorSurface &&
            selectorSurface.enabled()
        ) {
            return selectorSurface;
        }
    },

    /**
     * Mouse down event handler
     * @param e
     * @private
     */
    _onMouseDown(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            window.Element,
            e.target,
            assert.format(
                assert.messages.instanceof.default,
                'e.target',
                'Element'
            )
        );
        const target = $(e.target);
        // Do not interfere with interactive elements
        if (target.closest(CONSTANTS.DOT + INTERACTIVE_CLASS).length) {
            return;
        }
        const selectorSurface = this._getSelectorSurface(target);
        // Make sure we have an enabled selector surface, otherwise discard mouse event
        if (selectorSurface instanceof SelectorSurface) {
            const point = this._getStagePoint(e);
            const pulled = selectorSurface._pullSelections(point);
            // If we are not removing selections under point, we are adding a new selection
            if (Array.isArray(pulled) && pulled.length === 0) {
                const stroke = selectorSurface.activeSelector.options.stroke;
                const path = new Path({ stroke });
                path.moveTo(point);
                selectorSurface.drawingSurface.draw(path);
                // IMPORTANT: Do not assign e.data directly otherwise the reference
                // to the data object will be lost across events
                e.data.type = DATA_TYPE;
                e.data.path = path;
                e.data.selectorSurface = selectorSurface;
                logger.debug({
                    method: '_onMouseDown',
                    message: 'Started new selection',
                    data: stroke
                });
            }
        }
    },

    /**
     * Mouse move event handler
     * @param e
     * @private
     */
    _onMouseMove(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        if (
            $.isPlainObject(e.data) &&
            e.data.type === DATA_TYPE &&
            e.data.path instanceof Path
        ) {
            e.preventDefault();
            const point = this._getStagePoint(e);
            e.data.path.lineTo(point);
        }
    },

    /**
     * Mouse up event handler
     * @param e
     * @private
     */
    _onMouseEnd(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        if (
            $.isPlainObject(e.data) &&
            e.data.type === DATA_TYPE &&
            e.data.path instanceof Path
        ) {
            e.preventDefault();
            if (e.data.selectorSurface instanceof SelectorSurface) {
                const rect = e.data.path.bbox();
                e.data.selectorSurface._pushSelection(rect);
            }
            // IMPORTANT: Do not assign e.data directly otherwise the reference
            // to the data object will be lost across events
            e.data.type = undefined;
            e.data.path = undefined;
            e.data.selectorSurface = undefined;
            // This is a workaround because mouseleave triggers a selection in chrome (not in FF or Edge)
            if ($.isFunction(window.getSelection)) {
                const sel = window.getSelection();
                sel.removeAllRanges();
            }
        }
    }
});

/**
 * Singleton to share SelectorEvents
 * @returns {SelectorEvents}
 */
SelectorEvents.getSingleton = function(options) {
    assert.isPlainObject(
        options,
        assert.format(assert.messages.isPlainObject.default, 'options')
    );
    assert(
        CONSTANTS.STRING,
        options.container,
        assert.format(
            assert.messages.type.default,
            'options.container',
            CONSTANTS.STRING
        )
    );
    assert(
        CONSTANTS.STRING,
        options.scaler,
        assert.format(
            assert.messages.type.default,
            'options.scaler',
            CONSTANTS.STRING
        )
    );
    if (!SelectorEvents._instance) {
        SelectorEvents._instance = new SelectorEvents(options);
    }
    // Note: all selectors on the same page should have the same options.container and options.scaler
    assert.equal(
        options.container,
        SelectorEvents._instance._container,
        assert.format(
            assert.messages.equal.default,
            'SelectorEvents._instance._container',
            'options.container'
        )
    );
    assert.equal(
        options.scaler,
        SelectorEvents._instance._scaler,
        assert.format(
            assert.messages.equal.default,
            'SelectorEvents._instance._scaler',
            'options.scaler'
        )
    );
    return SelectorEvents._instance;
};

/** *******************************************************************************
 * SelectorToolBar Widget
 ******************************************************************************** */

/**
 * SelectorToolBar
 * @class SelectorToolBar
 * @extends ToolBar
 */
const SelectorToolBar = ToolBar.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        ToolBar.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'toolbar initialized' });
        this.bind(TOGGLE, this._onToggle);
        // kendo.notify(that);
    },

    /**
     * Options
     */
    options: {
        name: 'SelectorToolBar',
        iconSize: ICON_SIZE,
        resizable: false
    },

    /**
     * Register corresponding selector surface, the surface the selected color applies to
     */
    registerSelectorSurface(selectorSurface) {
        assert.instanceof(
            SelectorSurface,
            selectorSurface,
            assert.format(
                assert.messages.instanceof.default,
                'selectorSurface',
                'kendo.ui.SelectorSurface'
            )
        );
        this.selectorSurface = selectorSurface;
    },

    /**
     * Button toggle event handler
     * @private
     */
    _onToggle(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        assert.type(
            CONSTANTS.STRING,
            e.id,
            assert.format(
                assert.messages.type.default,
                'e.id',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            SelectorSurface,
            this.selectorSurface,
            assert.format(
                assert.messages.instanceof.default,
                'this.selectorSurface',
                'kendo.ui.SelectorSurface'
            )
        );
        assert.isArray(
            this.selectorSurface.selectors,
            assert.format(
                assert.messages.isArray.default,
                'this.selectorSurface.selectors'
            )
        );
        const id = e.id.substr(BUTTON_PREFIX.length);
        for (
            let i = 0, length = this.selectorSurface.selectors.length;
            i < length;
            i++
        ) {
            if (this.selectorSurface.selectors[i].options.id === id) {
                this.selectorSurface.activeSelector = this.selectorSurface.selectors[
                    i
                ];
                break;
            }
        }
    },

    /**
     * Create toolbar icon
     * @param: selector
     * @private
     */
    _createButton(selector) {
        assert.instanceof(
            Selector,
            selector,
            assert.format(
                assert.messages.instanceof.default,
                'selector',
                'kendo.ui.Selector'
            )
        );
        assert.instanceof(
            SelectorSurface,
            this.selectorSurface,
            assert.format(
                assert.messages.instanceof.default,
                'this.selectorSurface',
                'kendo.ui.SelectorSurface'
            )
        );
        const dfd = $.Deferred();
        const iconSize = parseInt(this.options.iconSize, 10) || ICON_SIZE;
        // @see https://docs.telerik.com/kendo-ui/api/javascript/drawing/stroke-options
        const stroke = deepExtend({}, selector.options.stroke, {
            dashType: 'solid',
            opacity: 1,
            width: 2
        });
        const border = Math.floor(iconSize / 10);
        const root = new Group();
        const rect = new geometry.Rect(
            [border, border],
            [iconSize - 2 * border, iconSize - 2 * border]
        );
        let element;
        switch (selector.options.shape) {
            case Selector.fn.shapes.circle:
                element = this.selectorSurface._createCirclePath(rect, stroke);
                break;
            case Selector.fn.shapes.cross:
                element = this.selectorSurface._createCrossPath(rect, stroke);
                break;
            case Selector.fn.shapes.rect:
                element = this.selectorSurface._createRectPath(rect, stroke);
                break;
        }
        if (element instanceof Element) {
            element.transform(geometry.transform().translate(border, border));
            root.append(element);
        }
        // https://docs.telerik.com/kendo-ui/api/javascript/drawing/methods/exportsvg
        // drawing.exportSVG(root)
        exportImage(root, { width: iconSize, height: iconSize })
            .then(dataUri => {
                dfd.resolve({
                    group: 'selectors',
                    id: BUTTON_PREFIX + selector.options.id,
                    imageUrl: dataUri,
                    showText: 'overflow',
                    text:
                        selector.options.shape.substr(0, 1).toUpperCase() +
                        selector.options.shape.substr(1).toLowerCase, // TODO: i18n
                    togglable: true,
                    type: 'button'
                });
            })
            .catch(dfd.reject);
        return dfd.promise();
    },

    /**
     * Refresh
     * Note: Making selectorSurface.selectors an ObservableArray instead of a simple array raises a stack overflow
     */
    refresh() {
        assert.instanceof(
            SelectorSurface,
            this.selectorSurface,
            assert.format(
                assert.messages.instanceof.default,
                'this.selectorSurface',
                'kendo.ui.SelectorSurface'
            )
        );
        assert.isArray(
            this.selectorSurface.selectors,
            assert.format(
                assert.messages.isArray.default,
                'this.selectorSurface.selectors'
            )
        );
        function removeButtonGroup() {
            // k-button-group in kendo.ui & km-buttongroup (wo second -) in kendo.mobile.ui
            const buttonGroup = that.element.children(
                '.k-button-group, .km-buttongroup'
            );
            if (buttonGroup.length) {
                that.remove(buttonGroup);
            }
        }
        var that = this;
        const selectorSurface = that.selectorSurface;
        const length = selectorSurface.selectors.length; // TODO check enabled
        if (length > 1) {
            // Rebuild all buttons
            const promises = [];
            for (let i = 0; i < length; i++) {
                promises.push(that._createButton(selectorSurface.selectors[i]));
            }
            $.when.apply(that, promises).then(function() {
                // Remove buttons
                removeButtonGroup();
                // Add buttons
                const buttons = Array.prototype.slice.call(arguments);
                assert.equal(
                    length,
                    buttons.length,
                    assert.format(
                        assert.messages.equal.default,
                        'buttons.length',
                        'length'
                    )
                );
                that.add({ type: 'buttonGroup', buttons });
                // Toggle the active selector
                assert.instanceof(
                    Selector,
                    selectorSurface.activeSelector,
                    assert.format(
                        assert.messages.instanceof.default,
                        'selectorSurface.activeSelector',
                        'kendo.ui.Selector'
                    )
                );
                that.toggle(
                    CONSTANTS.HASH +
                        BUTTON_PREFIX +
                        selectorSurface.activeSelector.options.id,
                    true
                );
                // Show the toolbar with at least two buttons
                that.wrapper.toggle(true);
            });
        } else {
            removeButtonGroup();
            that.wrapper.toggle(false);
        }
    },

    /**
     * Destroy widget
     */
    destroy() {
        const element = this.element;
        // Unref
        this.selectorSurface = undefined;
        // Destroy
        ToolBar.fn.destroy.call(this);
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(SelectorToolBar);

/** *******************************************************************************
 * SelectorSurface Widget
 ******************************************************************************** */

/**
 * SelectorSurface
 * Note: SelectorSurface does not extend drawing.Surface
 * because drawing surfaces are created using drawing.Surface.create
 * @class SelectorSurface
 * @extends Widget
 */
var SelectorSurface = Widget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug('surface initialized');
        this.selectors = [];
        this._layout();
        this._initToolBar();
        // kendo.notify(this);
    },

    /**
     * Options
     */
    options: {
        name: 'SelectorSurface',
        container: '',
        toolbar: ''
    },

    /**
     * Layout
     * @private
     */
    _layout() {
        const element = (this.wrapper = this.element);
        element.addClass(SURFACE_CLASS).attr(attr(CONSTANTS.ID), randomId()); // Add an id to match the toolbar
        this.drawingSurface = Surface.create(element);
    },

    /**
     * Init toolbar
     * @private
     */
    _initToolBar() {
        const toolbarContainer = $(this.options.toolbar);
        const id = this.element.attr(attr(CONSTANTS.ID));
        if (toolbarContainer.length) {
            const toolBar = toolbarContainer
                .find(format(ATTRIBUTE_SELECTOR, attr(CONSTANTS.ID), id))
                .data('kendoSelectorToolBar');
            if (toolBar instanceof SelectorToolBar) {
                this.toolBar = toolBar;
            } else {
                const toolbarElement = $(`<${CONSTANTS.DIV}/>`).appendTo(
                    toolbarContainer
                );
                this.toolBar = toolbarElement
                    .kendoSelectorToolBar()
                    .data('kendoSelectorToolBar');
            }
            this.toolBar.registerSelectorSurface(this);
        }
    },

    /**
     * Register a selector
     * @param selector
     * @private
     */
    registerSelector(selector) {
        assert.instanceof(
            Selector,
            selector,
            assert.format(
                assert.messages.instanceof.default,
                'selector',
                'Selector'
            )
        );
        assert.isArray(
            this.selectors,
            assert.format(assert.messages.isArray.default, 'this.selectors')
        );
        if (this.selectors.indexOf(selector) === -1) {
            if (this.selectors.length > 0) {
                const first = this.selectors[0];
                assert.equal(
                    first.options.container,
                    selector.options.container,
                    assert.format(
                        assert.messages.equal.default,
                        'first.options.container',
                        'selector.options.container'
                    )
                );
                assert.equal(
                    first.options.scaler,
                    selector.options.scaler,
                    assert.format(
                        assert.messages.equal.default,
                        'first.options.scaler',
                        'selector.options.scaler'
                    )
                );
                assert.equal(
                    first.options.selectable,
                    selector.options.selectable,
                    assert.format(
                        assert.messages.equal.default,
                        'first.options.selectable',
                        'selector.options.selectable'
                    )
                );
                assert.equal(
                    first.options.toolbar,
                    selector.options.toolbar,
                    assert.format(
                        assert.messages.equal.default,
                        'first.options.toolbar',
                        'selector.options.toolbar'
                    )
                );
                // Note: they should also have the same data source
            }
            this.selectors.push(selector);
            if (!(this.activeSelector instanceof Selector)) {
                this.activeSelector = selector;
            }
            this.toolBar.refresh();
        }
    },

    /**
     * Unregister selector with surface
     * @param selector
     */
    unregisterSelector(selector) {
        assert.instanceof(
            Selector,
            selector,
            assert.format(
                assert.messages.instanceof.default,
                'selector',
                'Selector'
            )
        );
        assert.isArray(
            this.selectors,
            assert.format(assert.messages.isArray.default, 'this.selectors')
        );
        const index = this.selectors.indexOf(selector);
        if (index > -1) {
            this.selectors.splice(index, 1);
            if (this.activeSelector === selector) {
                this.activeSelector = this.selectors[0]; // Note: this means the activeSelector could potentially be undefined
            }
            this.toolBar.refresh();
        }
    },

    /**
     * Return true if at least one selector is enabled
     * @returns {boolean}
     */
    enabled() {
        assert.isArray(
            this.selectors,
            assert.format(assert.messages.isArray.default, 'this.selectors')
        );
        for (let i = 0, length = this.selectors.length; i < length; i++) {
            if (this.selectors[i]._enabled) {
                return true;
            }
        }
        return false;
    },

    /**
     * Get data item from selector
     * @param selector
     * @private
     */
    _getDataItem(selector) {
        assert.instanceof(
            Selector,
            selector,
            assert.format(
                assert.messages.instanceof.default,
                'selector',
                'kendo.ui.Selector'
            )
        );
        assert.type(
            CONSTANTS.STRING,
            selector.options.id,
            assert.format(
                assert.messages.type.default,
                'selector.options.id',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            DataSource,
            selector.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'selector.dataSource',
                'kendo.data.DataSource'
            )
        );
        const items = selector.dataSource
            .view()
            .filter(
                dataItem =>
                    dataItem.type === DATA_TYPE &&
                    dataItem.id === selector.options.id
            );
        assert.ok(
            items.length <= 1,
            'There should be no more than one dataItem per selector'
        );
        return items[0];
    },

    /**
     * Create a new data item from selector
     * @param selector
     * @private
     */
    _createDataItem(selector) {
        assert.instanceof(
            Selector,
            selector,
            assert.format(
                assert.messages.instanceof.default,
                'selector',
                'kendo.ui.Selector'
            )
        );
        assert.type(
            CONSTANTS.STRING,
            selector.options.id,
            assert.format(
                assert.messages.type.default,
                'selector.options.id',
                CONSTANTS.STRING
            )
        );
        return {
            id: selector.options.id,
            type: DATA_TYPE,
            data: {
                // Remember shape and stroke in case author makes changes in a new version
                shape: selector.options.shape,
                stroke: selector.options.stroke,
                selections: []
            }
        };
    },

    /**
     * Check that a data item is empty
     * @param dataItem
     * @returns {boolean}
     * @private
     */
    _isEmptyDataItem(dataItem) {
        return (
            !dataItem ||
            !dataItem.data ||
            !Array.isArray(dataItem.data.selections) ||
            dataItem.data.selections.length === 0
        );
    },

    /**
     * Check small rect selection to discard
     * @param rect
     * @private
     */
    _isSmallSelection(selector, rect) {
        assert.instanceof(
            Selector,
            selector,
            assert.format(
                assert.messages.instanceof.default,
                'selector',
                'kendo.ui.Selector'
            )
        );
        assert.instanceof(
            geometry.Rect,
            rect,
            assert.format(
                assert.messages.instanceof.default,
                'rect',
                'kendo.geometry.Rect'
            )
        );
        const radius = parseInt(selector.options.minRadius, 10) || MIN_RADIUS;
        return (
            Math.sqrt(
                Math.pow(rect.size.height, 2) + Math.pow(rect.size.width, 2)
            ) <=
            2 * Math.sqrt(2) * radius
        );
    },

    /**
     * Push new selection to active selector data item in data source
     * @param rect
     * @private
     */
    _pushSelection(rect) {
        assert.instanceof(
            geometry.Rect,
            rect,
            assert.format(
                assert.messages.instanceof.default,
                'rect',
                'kendo.geometry.Rect'
            )
        );
        assert.instanceof(
            Selector,
            this.activeSelector,
            assert.format(
                assert.messages.instanceof.default,
                'this.activeSelector',
                'kendo.ui.Selector'
            )
        );
        assert.instanceof(
            DataSource,
            this.activeSelector.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.activeSelector.dataSource',
                'kendo.data.DataSource'
            )
        );
        const selector = this.activeSelector;
        const dataSource = selector.dataSource;
        // Discard small selection that anyone will struggle to see on mobile
        if (!this._isSmallSelection(selector, rect)) {
            // Find the dataItem corresponding to the selector
            let dataItem = this._getDataItem(selector);
            let found = true;
            if ($.type(dataItem) === CONSTANTS.UNDEFINED) {
                found = false;
                dataItem = this._createDataItem(selector);
            }
            // Round the origin and size to spare storage space
            const origin = [
                Math.round(rect.origin.x),
                Math.round(rect.origin.y)
            ];
            const size = [
                Math.round(rect.size.width),
                Math.round(rect.size.height)
            ];
            // Add the origin and size to the dataItem corresponding to the selector
            dataItem.data.selections.push({ origin, size });
            if (!found) {
                dataSource.add(dataItem);
            }
            selector.trigger(CONSTANTS.CHANGE);
            logger.debug({
                method: '_pushSelection',
                message: 'Added new selection',
                data: { origin, size }
            });
        } else {
            // Remove the small path
            this.refresh();
        }
    },

    /**
     * Pull rects containing point from active selector data item in data source
     * @param point
     * @returns {{type: string, data: {color, origin: {x: number, y: number}, shape: *, size: {height: number, width: number}}}}
     * @private
     */
    _pullSelections(point) {
        assert.instanceof(
            geometry.Point,
            point,
            assert.format(
                assert.messages.instanceof.default,
                'point',
                'kendo.geometry.Point'
            )
        );
        assert.instanceof(
            Selector,
            this.activeSelector,
            assert.format(
                assert.messages.instanceof.default,
                'this.activeSelector',
                'kendo.ui.Selector'
            )
        );
        assert.instanceof(
            DataSource,
            this.activeSelector.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.activeSelector.dataSource',
                'kendo.data.DataSource'
            )
        );
        const ret = [];
        const selector = this.activeSelector;
        const dataSource = selector.dataSource;
        // Find the dataItem corresponding to the selector
        const dataItem = this._getDataItem(selector);
        // Check and remove selections containing point
        if ($.type(dataItem) !== CONSTANTS.UNDEFINED) {
            // We take a slice to avoid several change events on the dataSource as we splice
            const selections = dataItem.data.selections.slice();
            // We need to start with the highest index otherwise indexes change as we splice
            for (let idx = selections.length - 1; idx >= 0; idx--) {
                const rect = new geometry.Rect(
                    selections[idx].origin,
                    selections[idx].size
                );
                if (rect.containsPoint(point)) {
                    ret.push(selections.splice(idx, 1));
                }
            }
            if (selections.length === 0) {
                // Remove will now trigger a change event to redraw
                dataSource.remove(dataItem);
            } else if (ret.length > 0) {
                // Set will now trigger a change event to redraw
                dataItem.set('data.selections', selections);
            }
        }
        if (ret.length) {
            selector.trigger(CONSTANTS.CHANGE);
            logger.debug({
                method: '_pullSelection',
                message: 'Removed selections',
                data: { point: [Math.round(point.x), Math.round(point.y)] }
            });
        }
        return ret;
    },

    /**
     * Create a rect
     * @param dataItem
     * @param stroke
     * @private
     */
    _createRectPath(rect, stroke) {
        assert.instanceof(
            geometry.Rect,
            rect,
            assert.format(
                assert.messages.instanceof.default,
                'rect',
                'kendo.geometry.Rect'
            )
        );
        assert.isPlainObject(
            stroke,
            assert.format(assert.messages.isPlainObject.default, 'stroke')
        );
        const RECT_RADIUS = 10;
        const path = new Path({ stroke });
        const x = rect.origin.x;
        const y = rect.origin.y;
        const height = rect.size.height;
        const width = rect.size.width;
        path.moveTo(x + width - RECT_RADIUS, y)
            .curveTo(
                [x + width, y],
                [x + width, y],
                [x + width, y + RECT_RADIUS]
            )
            .lineTo([x + width, y + height - RECT_RADIUS])
            .curveTo(
                [x + width, y + height],
                [x + width, y + height],
                [x + width - RECT_RADIUS, y + height]
            )
            .lineTo([x + RECT_RADIUS, y + height])
            .curveTo(
                [x, y + height],
                [x, y + height],
                [x, y + height - RECT_RADIUS]
            )
            .lineTo(x, y + RECT_RADIUS)
            .curveTo([x, y], [x, y], [x + RECT_RADIUS, y])
            .close();
        return path;
    },

    /**
     * Create a circle
     * @param rect
     * @param stroke
     * @private
     */
    _createCirclePath(rect, stroke) {
        assert.instanceof(
            geometry.Rect,
            rect,
            assert.format(
                assert.messages.instanceof.default,
                'rect',
                'kendo.geometry.Rect'
            )
        );
        assert.isPlainObject(
            stroke,
            assert.format(assert.messages.isPlainObject.default, 'stroke')
        );
        const arcGeometry = new geometry.Arc(
            [
                rect.origin.x + rect.size.width / 2,
                rect.origin.y + rect.size.height / 2
            ], // center
            {
                radiusX: rect.size.width / 2,
                radiusY: rect.size.height / 2,
                startAngle: 0,
                endAngle: 360,
                anticlockwise: false
            }
        );
        // We need to deepExtend stroke to remove all observable wrapping from dataSource
        return new Arc(arcGeometry, { stroke });
    },

    /**
     * Create a cross
     * @param rect
     * @param stroke
     * @private
     */
    _createCrossPath(rect, stroke) {
        assert.instanceof(
            geometry.Rect,
            rect,
            assert.format(
                assert.messages.instanceof.default,
                'rect',
                'kendo.geometry.Rect'
            )
        );
        assert.isPlainObject(
            stroke,
            assert.format(assert.messages.isPlainObject.default, 'stroke')
        );
        const CROSS_CURVE = 0.5;
        const path = new Path({ stroke });
        const x = rect.origin.x;
        const y = rect.origin.y;
        const height = rect.size.height;
        const width = rect.size.width;
        path.moveTo(x + width, y)
            .lineTo(x + CROSS_CURVE * width, y + (1 - CROSS_CURVE) * height)
            .curveTo(
                [x, y + height],
                [x, y + height],
                [x, y + (1 - CROSS_CURVE) * height]
            )
            .lineTo(x, y + CROSS_CURVE * height)
            .curveTo(
                [x, y],
                [x, y],
                [x + CROSS_CURVE * width, y + CROSS_CURVE * height]
            )
            .lineTo(x + width, y + height);
        return path;
    },

    /**
     * Draw the selector group of selections from dataItem
     * @param dataItem
     * @private
     */
    _createSelectorGroup(dataItem) {
        assert.type(
            CONSTANTS.OBJECT,
            dataItem,
            assert.format(
                assert.messages.type.default,
                'dataItem',
                CONSTANTS.OBJECT
            )
        );
        assert.type(
            CONSTANTS.STRING,
            dataItem.id,
            assert.format(
                assert.messages.type.default,
                'dataItem.id',
                CONSTANTS.STRING
            )
        );
        assert.equal(
            DATA_TYPE,
            dataItem.type,
            assert.format(
                assert.messages.type.default,
                'dataItem.type',
                DATA_TYPE
            )
        );
        assert.type(
            CONSTANTS.OBJECT,
            dataItem.data,
            assert.format(
                assert.messages.type.default,
                'dataItem.data',
                CONSTANTS.OBJECT
            )
        );
        const selections = dataItem.data.selections;
        const group = new Group();
        // We need a plain object for stroke
        const stroke =
            dataItem.data.stroke instanceof ObservableObject
                ? dataItem.data.stroke.toJSON()
                : dataItem.data.stroke || {};
        // Iterate over selections to draw all shapes in group
        for (let idx = 0, length = selections.length; idx < length; idx++) {
            const rect = new geometry.Rect(
                selections[idx].origin,
                selections[idx].size
            );
            switch (dataItem.data.shape) {
                case Selector.fn.shapes.circle:
                    group.append(this._createCirclePath(rect, stroke));
                    break;
                case Selector.fn.shapes.cross:
                    group.append(this._createCrossPath(rect, stroke));
                    break;
                case Selector.fn.shapes.rect:
                    group.append(this._createRectPath(rect, stroke));
                    break;
            }
        }
        return group;
    },

    /**
     * Refresh
     */
    refresh(e) {
        assert.instanceof(
            SelectorSurface,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kendo.ui.SelectorSurface'
            )
        );
        // We need to refresh even when there are no registered selectors, especially in review mode
        // assert.isArray(this.selectors, assert.format(assert.messages.isArray.default, 'this.selectors'));
        assert.instanceof(
            Surface,
            this.drawingSurface,
            assert.format(
                assert.messages.instanceof.default,
                'this.drawingSurface',
                'kendo.drawing.Surface'
            )
        );
        const container = this.drawingSurface.element.closest(
            this.options.container
        );
        const selectors = container.find(roleSelector(ROLE_SELECTOR));
        // Collect a hash of all data items
        const dataItems = {};
        selectors.each((index, selector) => {
            const selectorWidget = $(selector).data('kendoSelector');
            if (
                selectorWidget instanceof Selector &&
                selectorWidget.dataSource instanceof DataSource
            ) {
                selectorWidget.dataSource.view().forEach(item => {
                    // If the dataSource contains selectors from other pages, they will be listed
                    dataItems[item.id] = item;
                });
            }
        });
        // Clear the surface
        this.drawingSurface.clear();
        // Draw all groups
        for (const id in dataItems) {
            // We should not draw a group when the dataItem corresponds to a selector which is not on the page
            if (
                dataItems.hasOwnProperty(id) &&
                selectors.closest(
                    format(ATTRIBUTE_SELECTOR, attr(CONSTANTS.ID), id)
                ).length
            ) {
                const group = this._createSelectorGroup(dataItems[id]);
                this.drawingSurface.draw(group);
            }
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // Unbind
        unbind(this.element);
        // destroy toolbar
        if (this.toolBar instanceof SelectorToolBar) {
            this.toolBar.destroy();
            this.toolBar.wrapper.remove();
            this.toolBar = undefined;
        }
        // Release references
        this.activeSelector = undefined;
        this.drawingSurface = undefined;
        this.selectors = undefined;
        // Destroy kendo
        Widget.fn.destroy.call(this);
        destroy(this.element);
        // Remove widget class
        // element.removeClass(SURFACE_CLASS);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(SelectorSurface);

/** *******************************************************************************
 * Selector Widget
 ******************************************************************************** */

/**
 * Selector
 * @class Selector
 * @extends DataBoundWidget
 */
var Selector = DataBoundWidget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        const that = this;
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._layout();
        this._dataSource();
        SelectorEvents.getSingleton(this.options).enable(true);
        this.enable(this.options.enable);
        // kendo.notify(that);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Selector',
        id: null,
        autoBind: true,
        dataSource: null,
        scaler: 'div.kj-stage',
        container: `div.kj-stage>div[data-${ns}role="stage"]`,
        selectable: `div.kj-element>[data-${ns}behavior="selectable"]`,
        toolbar: '', // This points to a container div for including the toolbar
        empty: '',
        hitRadius: HIT_RADIUS,
        minRadius: MIN_RADIUS,
        shape: 'circle',
        stroke: {
            color: '#FF0000',
            dashType: 'solid',
            opacity: 1,
            width: 12
        },
        enable: true
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Enumeration of possible shapes
     */
    shapes: {
        circle: 'circle',
        cross: 'cross',
        rect: 'rect'
    },

    /**
     * Value for MVVM binding
     * Value returns an array of selectable values
     *
     * @param value
     */
    value(value) {
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            assert.instanceof(
                Selector,
                this,
                assert.format(
                    assert.messages.instanceof.default,
                    'this',
                    'Selector'
                )
            );
            assert.instanceof(
                SelectorSurface,
                this.selectorSurface,
                assert.format(
                    assert.messages.instanceof.default,
                    'this.selectorSurface',
                    'kendo.ui.SelectorSurface'
                )
            );
            let ret;
            const that = this;
            const element = that.element;
            const options = that.options;
            const selectorSurface = that.selectorSurface;
            const dataItem = selectorSurface._getDataItem(that);
            if (
                dataItem &&
                dataItem.data &&
                isAnyArray(dataItem.data.selections) &&
                dataItem.data.selections.length
            ) {
                ret = [];
                const container = element.closest(options.container);
                assert.ok(
                    $.contains(container[0], selectorSurface.element[0]),
                    'The selector and its selector surface should be children of the same container'
                );
                const selectables = container.find(options.selectable);
                const isValued = new Array(selectables.length);
                selectables.each((index, selectable) => {
                    selectable = $(selectable);
                    const constant = selectable.attr(attr(CONSTANT));
                    const bbox = that._getBBox(selectable);
                    for (
                        let i = 0, length = dataItem.data.selections.length;
                        i < length;
                        i++
                    ) {
                        const selection = dataItem.data.selections[i];
                        const rect = new geometry.Rect(
                            selection.origin,
                            selection.size
                        );
                        if (that._checkHit(bbox, rect) && !isValued[index]) {
                            // Make sure intersecting selections do not duplicate values
                            isValued[index] = true;
                            // Add constant
                            ret.push(constant);
                        }
                    }
                });
            } else if (this.options.empty) {
                // This allows deliberately empty selections
                ret = [this.options.empty];
            }
            return ret;
        }
    },

    /**
     * Builds the widget layout
     * @private
     */
    _layout() {
        const element = (this.wrapper = this.element);
        element.addClass(WIDGET_CLASS);
        this._initSurface();
    },

    /**
     * Init drawing surface
     * @private
     */
    _initSurface() {
        const options = this.options;
        const container = this.element.closest(options.container);
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, options.container)
        );
        let surfaceElement = container.find(CONSTANTS.DOT + SURFACE_CLASS);
        if (!surfaceElement.length) {
            assert.isUndefined(
                this.selectorSurface,
                assert.format(
                    assert.messages.isUndefined.default,
                    'this.selectorSurface'
                )
            );
            // Find interactive elements
            const firstInteractiveElement = container
                .children()
                .has(CONSTANTS.DOT + INTERACTIVE_CLASS)
                .first();
            surfaceElement = $(`<${CONSTANTS.DIV}/>`)
                .addClass(SURFACE_CLASS)
                .css({ position: 'absolute', top: 0, left: 0 })
                .height(container.height())
                .width(container.width());
            if (firstInteractiveElement.length) {
                // Make sure interactive elements stay on top
                surfaceElement.insertBefore(firstInteractiveElement);
            } else {
                // Otherwise simply append on top of all elements
                surfaceElement.appendTo(container);
            }
            surfaceElement.kendoSelectorSurface({
                container: options.container,
                toolbar: options.toolbar
            });
        }
        this.selectorSurface = surfaceElement.data('kendoSelectorSurface');
    },

    /**
     * _dataSource function to bind the refresh handler to the change event
     * @private
     */
    _dataSource() {
        // TODO Review for null

        // bind to the reset event to reset the dataSource
        if (this.dataSource instanceof DataSource &&  $.isFunction(this._refreshHandler)) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // returns the datasource OR creates one if using array or configuration
            this.dataSource = DataSource.create(this.options.dataSource);
            // Note: without that.dataSource, source bindings won't work

            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            // trigger a read on the dataSource if one hasn't happened yet
            if (this.options.autoBind) {
                // that.dataSource.fetch();
                this.dataSource.filter({
                    field: 'type',
                    operator: 'eq',
                    value: DATA_TYPE
                });
            }

            // We need to trigger a change to recalculate value after source and value bindings
            // TODO Review need for that
            setTimeout(() => {
                this.trigger(CONSTANTS.CHANGE);
            }, 0);
        }
    },

    /**
     * Sets the dataSource for source binding
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
     * Enable/disable user interactivity on container
     */
    enable(enable) {
        assert.instanceof(
            SelectorSurface,
            this.selectorSurface,
            assert.format(
                assert.messages.instanceof.default,
                'this.selectorSurface',
                'kendo.ui.SelectorSurface'
            )
        );
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        // Register/unregister selector with surface (and toolbar)
        if (this._enabled !== enabled) {
            this._enabled = enabled;
            if (this._enabled) {
                this.selectorSurface.registerSelector(this);
            } else {
                this.selectorSurface.unregisterSelector(this);
            }
        }
    },

    /**
     * Get the bounding box of an element
     * @param element
     * @private
     */
    _getBBox(element) {
        const options = this.options;
        const container = element.closest(options.container);
        const scaler = container.closest(options.scaler);
        const scale = scaler.length ? getTransformScale(scaler) : 1;
        const boundingRect = element.get(0).getBoundingClientRect(); // boundingRect includes transformations, meaning it is scaled
        const ownerDocument = $(container.get(0).ownerDocument);
        const stageOffset = container.offset();
        const rect = new geometry.Rect(
            [
                (boundingRect.left -
                    stageOffset.left +
                    ownerDocument.scrollLeft()) /
                    scale,
                (boundingRect.top -
                    stageOffset.top +
                    ownerDocument.scrollTop()) /
                    scale
            ],
            [boundingRect.width / scale, boundingRect.height / scale] // getBoundingClientRect includes borders
        );
        return rect;
    },

    /**
     * Check that a bbox, representing the bounding rect of a selectable, is selected by a selection
     * @param bbox
     * @param selection
     * @private
     */
    _checkHit(bbox, selection) {
        assert.instanceof(
            geometry.Rect,
            bbox,
            assert.format(
                assert.messages.instanceof.default,
                bbox,
                'kendo.geometry.Rect'
            )
        );
        assert.instanceof(
            geometry.Rect,
            selection,
            assert.format(
                assert.messages.instanceof.default,
                selection,
                'kendo.geometry.Rect'
            )
        );
        const hitRadius = parseInt(this.options.hitRadius, 10) || HIT_RADIUS;
        const center = bbox.center();
        return (
            selection.containsPoint(center.translate(-hitRadius, 0)) &&
            selection.containsPoint(center.translate(2 * hitRadius, 0)) &&
            selection.containsPoint(center.translate(-hitRadius, -hitRadius)) &&
            selection.containsPoint(center.translate(0, 2 * hitRadius))
        );
    },

    /**
     * Refresh
     * @param e
     */
    refresh(e) {
        assert.instanceof(
            SelectorSurface,
            this.selectorSurface,
            assert.format(
                assert.messages.instanceof.default,
                'this.selectorSurface',
                'kendo.ui.SelectorSurface'
            )
        );
        // Set the sender to the selector
        if ($.isPlainObject(e)) {
            e.sender = this;
        }
        // Delegate to the surface
        this.selectorSurface.refresh.bind(this.selectorSurface)(e);
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // unbind dataSource
        this.setDataSource(null);
        unbind(this.element);
        // dereference selectors and destroy surface
        if (this.selectorSurface instanceof SelectorSurface) {
            this.selectorSurface.unregisterSelector(this);
            if (this.selectorSurface.selectors.length === 0) {
                this.selectorSurface.destroy();
                this.selectorSurface.wrapper.remove();
                if (
                    $(document).find(roleSelector('surfaceselector')).length ===
                    0
                ) {
                    // Note: As we play a Kidoju, SelectorEvents_instance survives between pages
                    SelectorEvents.getSingleton(this.options).enable(false);
                }
            }
            this.selectorSurface = undefined;
        }
        // Destroy kendo
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(Selector);
