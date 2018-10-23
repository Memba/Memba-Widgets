/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Check keyboard use
// TODO focus
// TODO enable
// TODO Consider fx;

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.userevents';
import 'kendo.menu';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    deg2rad,
    getMousePosition,
    getRadiansBetweenPoints,
    getRotatedPoint,
    getTransformScale,
    getTransformRotation,
    rad2deg,
    snap
} from '../common/window.position.es6';
import { isGuid } from '../common/window.util.es6';
import PageComponentDataSource from '../data/datasources.pagecomponent.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import tools from '../tools/tools.es6';
import BaseTool from '../tools/tools.base.es6';

const {
    _outerHeight,
    _outerWidth,
    attr,
    bind,
    data: { Binder, binders, ObservableArray, ObservableObject },
    destroy,
    format,
    init,
    keys,
    support,
    ui: { plugin, ContextMenu, DataBoundWidget },
    unbind,
    UserEvents
} = window.kendo;
const logger = new Logger('widgets.stage');
const NS = '.kendoStage';
const WIDGET_CLASS = 'k-widget kj-stage';
const DEFAULTS = {
    MODE: 'play',
    SCALE: 1,
    WIDTH: 1024,
    HEIGHT: 768
};

const LOADING_OVERLAY =
    '<div contenteditable="false" class="k-loading-mask" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"><div class="k-loading-image"></div><div class="k-loading-color"></div></div>';

const MOUSEDOWN = `mousedown${NS} touchstart${NS}`;
const MOUSEMOVE = `mousemove${NS} touchmove${NS}`;
const MOUSEUP = `mouseup${NS} touchend${NS}`;
const PROPERTYBINDING = 'propertyBinding';
const ENABLE = 'enable';
const MOVE = 'move';
const RESIZE = 'resize';
const ROTATE = 'rotate'; // This constant is not simply an event
const ABSOLUTE = 'absolute';
const RELATIVE = 'relative';
const HIDDEN = 'hidden';
const DISPLAY = 'display';
const BLOCK = 'block';
const CURSOR = 'cursor';
const TRANSFORM = 'transform';
const CSS_ROTATE = 'rotate({0}deg)';
const CSS_SCALE = 'scale({0})';

const ADORNER_CLASS = 'kj-adorner';
const HANDLE_CLASS = 'kj-handle';
const MENU_CLASS = 'kj-menu';
const NOPAGE_CLASS = 'kj-nopage';
const OVERLAY_CLASS = 'kj-overlay';

// TODO Remove ADORNER_SELECTOR
const ADORNER_SELECTOR = `${CONSTANTS.DOT + ADORNER_CLASS}[${attr(
    CONSTANTS.UID
)}="{0}"]`;

// var HANDLE_SELECTOR = '.kj-handle[' + attr(CONSTANTS.ACTION) + '="{0}"]';

const STATE = 'state';
const ACTIONS = {
    MOVE: 'move',
    RESIZE: 'resize',
    ROTATE: 'rotate',
    MENU: 'menu'
};

/** *******************************************************************************
 * Custom Bindings
 ******************************************************************************** */

/**
 * Enable binding the properties value of a Stage widget
 * @type {*|void}
 */
binders.widget.properties = Binder.extend({
    init(widget, bindings, options) {
        Binder.fn.init.call(this, widget.element[0], bindings, options);
        this.widget = widget;
        this._change = $.proxy(this.change, this);
        this.widget.bind(CONSTANTS.CHANGE, this._change);
    },
    change() {
        this.bindings.properties.set(this.widget.properties());
    },
    refresh() {
        this.widget.properties(this.bindings.properties.get());
    },
    destroy() {
        this.widget.unbind(CONSTANTS.CHANGE, this._change);
    }
});

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * Stage
 * @class Stage
 * @extends DataBoundWidget
 */
const Stage = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._mode = this.options.mode;
        // Note: CSS styles are entirely discarded
        this._scale = this.options.scale;
        this._height = this.options.height;
        this._width = this.options.width;
        this._enabled = this.options.enabled; // TODO was `disabled`
        this._readonly = this.options.readonly;
        this._snapAngle = this.options.snapAngle;
        this._snapGrid = this.options.snapGrid;
        this._render();
        this._dataSource();
        this._initUserEvents();
        // this.enable(options.enabled);
    },

    /**
     * Stage modes
     */
    modes: CONSTANTS.STAGE_MODES,

    /**
     * Events
     * @property events
     */
    events: [
        CONSTANTS.CHANGE,
        CONSTANTS.DATABINDING,
        CONSTANTS.DATABOUND,
        PROPERTYBINDING,
        CONSTANTS.SELECT // TODO never triggered !!! See HTML too !!!
    ],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Stage',
        autoBind: true,
        mode: DEFAULTS.MODE,
        scale: DEFAULTS.SCALE,
        height: DEFAULTS.HEIGHT,
        width: DEFAULTS.WIDTH,
        tools,
        dataSource: undefined,
        enabled: true,
        readonly: false,
        snapAngle: 0,
        snapGrid: 0,
        messages: {
            contextMenu: {
                delete: 'Delete',
                duplicate: 'Duplicate'
            },
            noPage: 'Please add or select a page'
        }
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    /*
    setOptions: function (options) {
        // setOptions is called by value bindings
        DataBoundWidget.fn.setOptions.call(this, options);
    },
    */

    /**
     * Operating mode of the Stage
     * @method mode
     * @param value
     * @return {*}
     */
    mode(value) {
        assert.typeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._mode;
        } else {
            assert.enum(
                Object.values(Stage.fn.modes),
                value,
                assert.format(
                    assert.messages.enum.default,
                    'value',
                    Object.values(Stage.fn.modes)
                )
            );
            if (value !== this._mode) {
                this._mode = value;
                this._initializeMode();
                this.refresh();
            }
        }
        return ret;
    },

    /**
     * Scale the widget
     * @param value
     * @return {*}
     */
    scale(value) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._mode;
        } else if (value < 0) {
            throw new RangeError('`value` should be a positive number');
        } else if (value !== this._scale) {
            this._scale = value;
            this.wrapper.css({
                // TODO Review
                transformOrigin: '0 0',
                transform: format(CSS_SCALE, this._scale)
            });
            this.wrapper.find(CONSTANTS.DOT + HANDLE_CLASS).css({
                // transformOrigin: 'center center', // by default
                transform: format(CSS_SCALE, 1 / this._scale)
            });
            /*
            // Scaling the message does not work very well so we have simply increased the font-size
            that.element.find(CONSTANTS.DOT + NOPAGE_CLASS).css({
                // transformOrigin: 'center center', // by default
                transform: format(CSS_SCALE, 1 / that._scale)
            });
            */
        }
        return ret;
    },

    /**
     * Height of stage
     * @returns {number|*}
     */
    height() {
        return this._height;
    },

    /**
     * Width of stage
     * @param value
     * @returns {number|*}
     */
    width() {
        return this._width;
    },

    /**
     * IMPORTANT: index is 0 based
     * @method index
     * @param index
     * @returns {*}
     */
    index(index) {
        // TODO select
        const that = this;
        let component;
        if (index !== undefined) {
            if ($.type(index) !== CONSTANTS.NUMBER || index % 1 !== 0) {
                throw new TypeError();
            } else if (index < 0 || (index > 0 && index >= that.length())) {
                throw new RangeError();
            } else {
                component = that.dataSource.at(index);
                that.value(component);
            }
        } else {
            component = that.dataSource.getByUid(that._selectedUid);
            if (component instanceof PageComponent) {
                return that.dataSource.indexOf(component);
            }
            return -1;
        }
    },

    /**
     * @method id
     * @param id
     * @returns {*}
     */
    id(id) {
        // TODO dataItem
        const that = this;
        let component;
        if (id !== undefined) {
            if (
                $.type(id) !== CONSTANTS.NUMBER &&
                $.type(id) !== CONSTANTS.STRING
            ) {
                throw new TypeError();
            }
            component = that.dataSource.get(id);
            that.value(component);
        } else {
            component = that.dataSource.getByUid(that._selectedUid);
            if (component instanceof PageComponent) {
                return component[component.idField];
            }
        }
    },

    /**
     * Gets/Sets the value of the selected component in the explorer
     * @method value
     * @param value
     * @returns {*}
     */
    value(value) {
        assert.nullableInstanceOrUndef(
            PageComponent,
            value,
            assert.format(
                assert.messages.nullableInstanceOrUndef.default,
                'value',
                'PageComponent'
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            // Return the selected component (with adorner)
            if (
                isGuid(this._selectedUid) &&
                this.dataSource instanceof PageComponentDataSource
            ) {
                ret = this.dataSource.getByUid(this._selectedUid); // Returns undefined if not found
            } else {
                ret = null;
            }
        } else if ($.type(value) === CONSTANTS.NULL) {
            // Deselect component (remove the adorner)
            if (isGuid(this._selectedUid)) {
                this._selectedUid = null;
                logger.debug({ method: 'value', message: 'Remove selection' });
                this._toggleSelection();
                this.trigger(CONSTANTS.CHANGE, {
                    index: -1,
                    value: null
                });
            }
        } else if (
            value instanceof PageComponent &&
            isGuid(value.uid) &&
            value.uid !== this._selectedUid
        ) {
            const index = this.dataSource.indexOf(value);
            if (index > -1) {
                this._selectedUid = value.uid;
                logger.debug({ method: 'value', message: 'Remove selection' });
                this._toggleSelection();
                this.trigger(CONSTANTS.CHANGE, {
                    index,
                    value
                });
            }
        }
        return ret;
    },

    /**
     * length
     * @method length
     * @returns {*}
     */
    length() {
        return this.dataSource instanceof PageComponentDataSource
            ? this.dataSource.total()
            : -1;
    },

    /**
     * @method items
     */
    items() {
        return this.stage.children(CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS);
    },

    /**
     * Properties
     * @param value
     * @returns {*}
     */
    properties(value) {
        const that = this;
        if (value) {
            // if (!(value instanceof ObervableObject)) {
            //    throw new TypeError();
            // }
            if (value !== that._properties) {
                that._properties = value;
            }
        } else {
            return that._properties;
        }
    },

    /**
     * Get/set snap angle
     * @method snapAngle
     * @param value
     */
    snapAngle(value) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._snapAngle;
        } else if (value < 0) {
            throw new RangeError('`value` should be a positive number');
        } else if (value !== this._snapAngle) {
            this._snapAngle = value;
            // Note: we do not snap components automatically
        }
        return ret;
    },

    /**
     * Get/set snap grid
     * @method snapGrid
     * @param value
     */
    snapGrid(value) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._snapGrid;
        } else if (value < 0) {
            throw new RangeError('`value` should be a positive number');
        } else if (value !== this._snapGrid) {
            this._snapGrid = value;
            // Note: we do not snap components automatically
        }
        return ret;
    },

    /**
     * Widget layout
     * @method _render
     * @private
     */
    _render() {
        assert.ok(
            this.element.is(CONSTANTS.DIV),
            'Please instantiate this widget with a <div/>'
        );

        // Set this.stage from the div element that makes the widget
        this.stage = this.element.css({
            position: RELATIVE, // !important
            overflow: HIDDEN,
            height: this.height(),
            width: this.width()
            // TODO tabIndex -> focus for key events
        });

        // We need that.wrapper for visible/invisible bindings
        this.wrapper = this.stage
            .wrap(`<${CONSTANTS.DIV}/>`)
            .parent()
            .addClass(WIDGET_CLASS)
            .css({
                position: RELATIVE, // !important
                height: _outerHeight(this.stage),
                width: _outerWidth(this.stage),
                transformOrigin: '0 0', // 'top left', // !important without such attribute, element top left calculations are wrong
                transform: format(CSS_SCALE, this.scale())
            });
    },

    /**
     * Changes the dataSource
     * @method setDataSource
     * @param dataSource
     */
    setDataSource(dataSource) {
        // set the internal data source equal to the one passed in by MVVM
        this.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        this._dataSource();
    },

    /**
     * Binds the widget to the change event of the dataSource
     * See http://docs.telerik.com/kendo-ui/howto/create-custom-kendo-widget
     * @method _dataSource
     * @private
     */
    _dataSource() {
        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource
        if (
            this.dataSource instanceof PageComponentDataSource &&
            this._refreshHandler
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this.dataSource = undefined;
        }

        this._initializeMode();

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // use null to explicitly destroy the dataSource bindings

            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = PageComponentDataSource.create(
                this.options.dataSource
            );

            this._refreshHandler = this.refresh.bind(this);

            // bind to the change event to refresh the widget
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * Initialize mode
     * @method _initializeMode
     * @private
     */
    _initializeMode() {
        const {
            modes,
            options: { dataSource }
        } = this;

        const hasPage = !!dataSource; // TODO and data.length
        const isReadOnly = !hasPage || this._disabled || this._readonly;
        const bindUserEntries = hasPage && this.mode() !== modes.DESIGN;
        const designMode = hasPage && this.mode() === modes.DESIGN;
        const enabledDesignMode =
            designMode && !this._disabled && !this._readonly;

        // Set mode
        this._toggleNoPageMessage(!hasPage);
        this._toggleReadOnlyOverlay(isReadOnly);
        this._togglePropertyBindings(bindUserEntries);
        this._initAdorner(enabledDesignMode);
        this._toggleTransformEventHandlers(designMode);
        this._initContextMenu(enabledDesignMode);
    },

    /**
     * Clear all elements
     * @private
     */
    _clearAll() {
        this.stage
            .children(CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS)
            .each((index, stageElement) => {
                unbind($(stageElement));
                destroy($(stageElement));
            });
        this.stage.empty();
    },

    /**
     * Toggles a message when there is no page to display
     * @private
     */
    _toggleNoPageMessage(enable) {
        // clear
        this.wrapper.children(`.${NOPAGE_CLASS}`).remove();

        // Set overlay
        if (enable) {
            $(`<${CONSTANTS.DIV}/>`)
                .addClass(NOPAGE_CLASS)
                .text(this.options.messages.noPage)
                .css({
                    position: 'absolute', // 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                })
                .appendTo(this.wrapper);
        }
    },

    /**
     * Toggles the readonly overlay
     * @param enable
     * @private
     */
    _toggleReadOnlyOverlay(enable) {
        // clear
        this.wrapper.children(`.${OVERLAY_CLASS}`).remove();

        // set overlay
        if (enable) {
            // Add overlay to disable all controls (including audio and video controls)
            $(`<${CONSTANTS.DIV}/>`)
                .addClass(OVERLAY_CLASS)
                .css({
                    position: ABSOLUTE,
                    display: BLOCK,
                    top: 0,
                    left: 0,
                    height: this.height(),
                    width: this.width()
                })
                .appendTo(this.wrapper);
        }
    },

    /**
     *
     * @param enable
     * @private
     */
    _toggleLoadingOverlay(enable) {
        // TODO
    },

    /**
     * Toggle property bindings
     * @param enable
     * @private
     */
    _togglePropertyBindings(enable) {
        const that = this;

        // TODO: We might not need a PROPERTYBINDING event for that because this is all internal to ui.Stage
        if (enable) {
            debugger;
        }

        // Unbind property bindings
        if ($.isFunction(that._propertyBinding)) {
            that.unbind(PROPERTYBINDING, that._propertyBinding);
        }

        if (enable) {
            // Bind properties
            that._propertyBinding = $.proxy(function() {
                const widget = this;
                if (widget.properties() instanceof ObservableObject) {
                    widget.stage
                        .children(CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS)
                        .each((index, stageElement) => {
                            // kendo.bind does unbind first
                            bind(stageElement, widget.properties());
                        });
                }
            }, that);
            that.bind(PROPERTYBINDING, that._propertyBinding);
        }
    },

    /**
     * Toggle handle box
     * Note:
     * @param enable
     * @private
     */
    _initAdorner(enable) {
        assert.instanceof(
            $,
            this.wrapper,
            assert.format(
                assert.messages.instanceof.default,
                'this.wrapper',
                'jQuery'
            )
        );
        const { wrapper } = this;

        // Clear adorner
        if ($.isFunction(this._removeDebugVisualElements)) {
            this._removeDebugVisualElements(wrapper);
        }
        $(document).off(NS);
        this._getAdorner().remove();

        // Setup adorner
        if (enable) {
            // Note: without touch-action: none,
            // touch gestures won't work in Internet Explorer
            const handle = `<span class="${HANDLE_CLASS}" ${attr(
                CONSTANTS.ACTION
            )}="{0}" style="touch-action:none;"></span>`;

            // Add adorner and handles
            $(`<div class="${ADORNER_CLASS}"/>`)
                .css({
                    position: ABSOLUTE,
                    display: CONSTANTS.NONE
                })
                .append(format(handle, ACTIONS.MOVE))
                .append(format(handle, ACTIONS.RESIZE))
                .append(format(handle, ACTIONS.ROTATE))
                .append(format(handle, ACTIONS.MENU))
                .appendTo(wrapper);

            // Add stage event handlers
            /*
            $(document)
                .on(MOUSEDOWN, this._onMouseDown.bind(this))
                .on(MOUSEMOVE, this._onMouseMove.bind(this))
                .on(MOUSEUP, this._onMouseUp.bind(this));

            // Add debug visual elements
            if ($.isFunction(this._addDebugVisualElements)) {
                this._addDebugVisualElements(wrapper);
            }
            */
        }
    },

    /**
     * TODO
     * @private
     */
    _initUserEvents() {
        if ($.type(this.userEvents) === CONSTANTS.UNDEFINED) {
            this.userEvents = new UserEvents(this.wrapper, {
                global: true,
                filter: '.kj-handle',
                // press: $.noop,
                start: this._onMouseDown.bind(this),
                move: this._onMouseMove.bind(this),
                end: this._onMouseUp.bind(this)
            });
        }
    },

    /**
     * Toggle transform event handlers
     * @param enable
     * @private
     */
    _toggleTransformEventHandlers(enable) {
        assert.instanceof(
            $,
            this.stage,
            assert.format(
                assert.messages.instanceof.default,
                'this.stage',
                'jQuery'
            )
        );

        // Clear
        this.stage.off(NS);

        // Enable event handlers (also in navigation in design mode)
        if (enable) {
            this.stage
                .on(
                    ENABLE + NS,
                    CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS,
                    this._onEnableStageElement.bind(this)
                )
                .on(
                    MOVE + NS,
                    CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS,
                    this._onMoveStageElement.bind(this)
                )
                .on(
                    RESIZE + NS,
                    CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS,
                    this._onResizeStageElement.bind(this)
                )
                .on(
                    ROTATE + NS,
                    CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS,
                    this._onRotateStageElement.bind(this)
                );
        }
    },

    /**
     * Refresh
     * @param e
     */
    refresh(e) {
        const that = this;
        if (e === undefined || e.action === undefined) {
            let components = [];
            if (
                e === undefined &&
                that.dataSource instanceof PageComponentDataSource
            ) {
                components = that.dataSource.data();
            } else if (e && e.items instanceof ObservableArray) {
                components = e.items;
            }

            that.trigger(CONSTANTS.DATABINDING);

            // Add loading overlay
            const overlay = $(LOADING_OVERLAY).appendTo(this.wrapper);

            // Remove all elements from the stage
            that._hideAdorner();
            that._clearAll();

            // Add elements to the stage
            components.forEach(component => {
                that._addStageElement(component);
            });

            // Remove loading overlay
            overlay.remove();

            // If the following line triggers `Uncaught TypeError: Cannot read property 'length' of null` in the console
            // This is probably because binding on properties has not been properly set - check html
            // as in <input type="text" style="width: 300px; height: 100px; font-size: 75px;" data-bind="value: ">
            that.trigger(CONSTANTS.DATABOUND);

            // We can only bind properties after all dataBound event handlers have executed
            // otherwise there is a mix of binding sources
            that.trigger(PROPERTYBINDING); // This calls an event handler in _initializePlayMode
        } else if (e.action === 'add') {
            e.items.forEach(component => {
                that._addStageElement(component);
                that.value(component);
            });
        } else if (e.action === 'remove') {
            e.items.forEach(component => {
                that._removeStageElementByUid(component.uid);
                that.trigger(CONSTANTS.CHANGE, {
                    action: e.action,
                    value: component
                });
                if (
                    that.wrapper
                        .children(CONSTANTS.DOT + ADORNER_CLASS)
                        .attr(attr(CONSTANTS.UID)) === component.uid
                ) {
                    that.value(null);
                }
            });
        } else if (
            e.action === 'itemchange' &&
            Array.isArray(e.items) &&
            e.items.length &&
            e.items[0] instanceof PageComponent
        ) {
            e.items.forEach(component => {
                const stageElement = that._getStageElementByUid(component.uid);
                const adorner = that.wrapper.children(
                    format(ADORNER_SELECTOR, component.uid)
                );
                if (stageElement.length) {
                    switch (e.field) {
                        case CONSTANTS.LEFT:
                            if (
                                Math.round(stageElement.position().left) !==
                                Math.round(component.left)
                            ) {
                                stageElement.css(
                                    CONSTANTS.LEFT,
                                    component.left
                                );
                                adorner.css(CONSTANTS.LEFT, component.left);
                                stageElement.trigger(MOVE + NS, component);
                            }
                            break;
                        case CONSTANTS.TOP:
                            if (
                                Math.round(stageElement.position().top) !==
                                Math.round(component.top)
                            ) {
                                stageElement.css(CONSTANTS.TOP, component.top);
                                adorner.css(CONSTANTS.TOP, component.top);
                                stageElement.trigger(MOVE + NS, component);
                            }
                            break;
                        case CONSTANTS.HEIGHT:
                            if (
                                Math.round(stageElement.height()) !==
                                Math.round(component.height)
                            ) {
                                stageElement.css(
                                    CONSTANTS.HEIGHT,
                                    component.height
                                );
                                adorner.css(CONSTANTS.HEIGHT, component.height);
                                stageElement.trigger(RESIZE + NS, component);
                            }
                            break;
                        case CONSTANTS.WIDTH:
                            if (
                                Math.round(stageElement.width()) !==
                                Math.round(component.width)
                            ) {
                                stageElement.css(
                                    CONSTANTS.WIDTH,
                                    component.width
                                );
                                adorner.css(CONSTANTS.WIDTH, component.width);
                                stageElement.trigger(RESIZE + NS, component);
                            }
                            break;
                        case ROTATE:
                            if (
                                Math.round(
                                    getTransformRotation(stageElement)
                                ) !== Math.round(component.rotate)
                            ) {
                                stageElement.css(
                                    TRANSFORM,
                                    format(CSS_ROTATE, component.rotate)
                                );
                                adorner.css(
                                    TRANSFORM,
                                    format(CSS_ROTATE, component.rotate)
                                );
                                adorner
                                    .children(CONSTANTS.DOT + HANDLE_CLASS)
                                    .css(
                                        TRANSFORM,
                                        `${format(
                                            CSS_ROTATE,
                                            -component.rotate
                                        )} ${format(
                                            CSS_SCALE,
                                            1 / that.scale()
                                        )}`
                                    );
                                stageElement.trigger(ROTATE + NS, component);
                            }
                            break;
                        default:
                            if (
                                /^attributes/.test(e.field) ||
                                /^properties/.test(e.field)
                            ) {
                                that._prepareStageElement(
                                    stageElement,
                                    component
                                );
                                that._initStageElement(stageElement, component);
                            }
                    }
                }
            });
        }
        /*
        } else if (e.action === 'itemchange' && Array.isArray(e.items) && e.items.length && !(e.items[0] instanceof PageComponent)) {
            // This is especially the case for the quiz component when e.field === attributes.data: the e.items[i] is a data entry
            // but in this case using the parent() method to recursively find the component is a dead end
        }
        */
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * _addStageElement
     * @method _addStageElement
     * @param component
     * @private
     */
    _addStageElement(component) {
        assert.instanceof(
            $,
            this.stage,
            assert.format(
                assert.messages.instanceof.default,
                'this.stage',
                'jQuery'
            )
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        assert.type(
            CONSTANTS.STRING,
            component.tool,
            assert.format(
                assert.messages.type.default,
                'component.tool',
                CONSTANTS.STRING
            )
        );

        const { stage } = this;

        // Cannot add a stage element that already exists on stage
        if (this._getStageElementByUid(component.uid).length > 0) {
            return;
        }

        // Create stageElement
        const stageElement = $(
            format(
                `<div ${attr(CONSTANTS.UID)}="{0}" ${attr(
                    'tool'
                )}="{1}" class="${CONSTANTS.ELEMENT_CLASS}"></div>`,
                component.uid,
                component.tool
            )
        ).css({
            position: ABSOLUTE,
            top: component.get(CONSTANTS.TOP),
            left: component.get(CONSTANTS.LEFT),
            height: component.get(CONSTANTS.HEIGHT),
            width: component.get(CONSTANTS.WIDTH),
            // transformOrigin: 'center center', // by default
            transform: format(CSS_ROTATE, component.get(ROTATE))
        });

        // Prepare stageElement with component
        this._prepareStageElement(stageElement, component);

        // Append to the stage at index
        const index = this.dataSource.indexOf(component);
        const nextStageElement = stage.children(
            `${CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS}:eq(${index})`
        );
        if (nextStageElement.length) {
            nextStageElement.before(stageElement);
        } else {
            stage.append(stageElement);
        }

        // init stageElement
        this._initStageElement(stageElement, component);
    },

    /**
     * _getStageElementByUid
     * @method _getStageElementByUid
     * @param uid
     * @private
     */
    _getStageElementByUid(uid) {
        assert.match(
            CONSTANTS.RX_GUID,
            uid,
            assert.format(
                assert.messages.match.default,
                'uid',
                CONSTANTS.RX_GUID
            )
        );
        return this.stage.children(
            format(
                `${CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS}[${attr(
                    CONSTANTS.UID
                )}="{0}"]`,
                uid
            )
        );
    },

    /**
     * _removeStageElementByUid
     * @method _removeStageElementByUid
     * @param uid
     * @private
     */
    _removeStageElementByUid(uid) {
        assert.match(
            CONSTANTS.RX_GUID,
            uid,
            assert.format(
                assert.messages.match.default,
                'uid',
                CONSTANTS.RX_GUID
            )
        );
        const stageElement = this._getStageElementByUid(uid);
        unbind(stageElement);
        destroy(stageElement);
        stageElement.remove();
    },

    /**
     * _prepareStageElement
     * @method _prepareStageElement
     * @param stageElement
     * @param component
     * @private
     */
    _prepareStageElement(stageElement, component) {
        assert.instanceof(
            $,
            stageElement,
            assert.format(
                assert.messages.instanceof.default,
                'stageElement',
                'jQuery'
            )
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        assert.equal(
            component.uid,
            stageElement.attr(attr('uid')),
            'The stageElement data-uid attribute is expected to equal the component uid'
        );

        // Get tool
        const tool = this.options.tools[component.tool];
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(assert.messages.instanceof.default, tool, 'BaseTool')
        );

        // Get stage mode
        const mode = this.mode();
        assert.enum(
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(CONSTANTS.STAGE_MODES)
            )
        );

        // Get html content
        let content = tool.getHtmlContent(component, mode);
        if (!(content instanceof $)) {
            assert.type(
                CONSTANTS.STRING,
                content,
                assert.format(
                    assert.messages.type.default,
                    'tool.getHtmlContent(...)',
                    CONSTANTS.STRING
                )
            );
            content = $(content);
        }

        // Empty stage element
        unbind(stageElement);
        destroy(stageElement);
        stageElement.empty();

        // Append content
        stageElement.append(content);

        // Note: Kendo UI widgets have not been initialized and bound to view models
        // this requires calling _initStageElement next
    },

    /**
     * _initStageElement
     * @method _initStageElement
     * @param stageElement
     * @private
     */
    _initStageElement(stageElement, component) {
        assert.instanceof(
            $,
            stageElement,
            assert.format(
                assert.messages.instanceof.default,
                'stageElement',
                'jQuery'
            )
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );

        // Initialize kendo UI widgets
        init(stageElement);

        // We cannot trigger transform event handlers on stage elements
        // because they are not yet added to the stage to which events are delegated
        // Calling event handlers without raising events here has another benefit:
        // We only need the event handlers in design mode - see _toggleTransformEventHandlers
        /*
        stageElement.trigger(ENABLE + NS, component);
        stageElement.trigger(MOVE + NS, component);
        stageElement.trigger(RESIZE + NS, component);
        stageElement.trigger(ROTATE + NS, component);
        */

        // But we can execute them with an emulated event
        const emulatedEvent = {
            currentTarget: stageElement,
            preventDefault: $.noop,
            stopPropagation: $.noop
        };

        this._onEnableStageElement(
            emulatedEvent,
            component,
            this.mode() === CONSTANTS.STAGE_MODES.PLAY
        );
        this._onMoveStageElement(emulatedEvent, component);
        this._onResizeStageElement(emulatedEvent, component);
        this._onRotateStageElement(emulatedEvent, component);
    },

    /**
     * Event handler called when adding or triggered when enabling an element
     * @method _onEnableStageElement
     * @param e
     * @param component
     * @param enable
     * @private
     */
    _onEnableStageElement(e, component, enable) {
        const { options } = this;
        assert.instanceof(
            ObservableObject,
            options.tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = options.tools[component.tool];
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(
                assert.messages.instanceof.default,
                'tool',
                'BaseTool'
            )
        );
        if ($.isFunction(tool.onEnable)) {
            tool.onEnable(e, component, enable);
        }
    },

    /**
     * Event handler called when adding or triggered when moving an element
     * @method _onMoveStageElement
     * @param e
     * @param component
     * @private
     */
    _onMoveStageElement(e, component) {
        const { options } = this;
        assert.instanceof(
            ObservableObject,
            options.tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = options.tools[component.tool];
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(
                assert.messages.instanceof.default,
                'tool',
                'BaseTool'
            )
        );
        if ($.isFunction(tool.onMove)) {
            tool.onMove(e, component);
        }
    },

    /**
     * Event handler called when adding or triggered when resizing an element
     * @method _onResizeStageElement
     * @param e
     * @param component
     * @private
     */
    _onResizeStageElement(e, component) {
        const { options } = this;
        assert.instanceof(
            ObservableObject,
            options.tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = options.tools[component.tool];
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(
                assert.messages.instanceof.default,
                'tool',
                'BaseTool'
            )
        );
        if ($.isFunction(tool.onResize)) {
            tool.onResize(e, component);
        }
    },

    /**
     * Event handler called when adding or triggered when rotating an element
     * @method _onRotateStageElement
     * @param e
     * @param component
     * @private
     */
    _onRotateStageElement(e, component) {
        const { options } = this;
        assert.instanceof(
            ObservableObject,
            options.tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = options.tools[component.tool];
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(
                assert.messages.instanceof.default,
                'tool',
                'BaseTool'
            )
        );
        if ($.isFunction(tool.onRotate)) {
            tool.onRotate(e, component);
        }
    },

    /**
     * Toggle context menu
     * @param enable
     * @private
     */
    _initContextMenu(enable) {
        // Clear (noting that kendo.ui.ContextMenu is not available in kidoju-Mobile)
        if (this.menu instanceof ContextMenu) {
            this.menu.destroy();
            this.menu.element.remove();
            this.menu = undefined;
        }

        // Add context menu
        if (enable) {
            // See http://docs.telerik.com/kendo-ui/api/javascript/ui/contextmenu
            this.menu = $(`<ul class="${MENU_CLASS}"></ul>`)
                // TODO: Bring forward, Push backward, Edit, etc.....
                .append(
                    `<li ${attr(CONSTANTS.ACTION)}="delete">${
                        this.options.messages.contextMenu.delete
                    }</li>`
                )
                .append(
                    `<li ${attr(CONSTANTS.ACTION)}="duplicate">${
                        this.options.messages.contextMenu.duplicate
                    }</li>`
                )
                .appendTo(this.wrapper)
                .kendoContextMenu({
                    target: `.kj-handle[${attr(CONSTANTS.ACTION)}="menu"]`,
                    showOn: support.click,
                    open: this._onContextMenuOpen.bind(this),
                    select: this._onContextMenuSelect.bind(this)
                })
                .data('kendoContextMenu');
        }
    },

    /**
     * Event handler triggered when opening the context menu
     * @method _onContextMenuOpen
     * @param e
     * @private
     */
    _onContextMenuOpen(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        assert.instanceof(
            ContextMenu,
            e.sender,
            assert.format(
                assert.messages.instanceof.default,
                'e.sender',
                'kendo.ui.ContextMenu'
            )
        );

        if ($(e.item).is(`ul.${MENU_CLASS}`)) {
            // This is the top menu, so let's find the component and tool
            const uid = this._getSelectedUid();
            const component = this.dataSource.getByUid(uid);
            const tool = this.options.tools[component.tool];

            // Discard the old menu, probably referring to another component
            e.sender.remove(`[${attr(CONSTANTS.ACTION)}="component"]`);

            // Get the context menu from the relevant tool
            if (tool instanceof BaseTool && $.isFunction(tool.getContextMenu)) {
                const menu = tool.getContextMenu();
                if (Array.isArray(menu) && menu.length) {
                    const attributes = {};
                    attributes[attr(CONSTANTS.ACTION)] = 'component';
                    e.sender.append([
                        {
                            text: tool.description, // TODO tool.name
                            attr: attributes,
                            items: tool.getContextMenu()
                        }
                    ]);
                }
            }
        }
    },

    /**
     * Event handler triggered when selecting an item in the context menu
     * @method _onContextMenuSelection
     * @param e
     * @private
     */
    _onContextMenuSelect(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        assert.instanceof(
            ContextMenu,
            e.sender,
            assert.format(
                assert.messages.instanceof.default,
                'e.sender',
                'kendo.ui.ContextMenu'
            )
        );

        // Get action
        const action = $(e.item).attr(attr(CONSTANTS.ACTION));
        if (action !== 'component') {
            // Event is handled, do not propagate
            e.preventDefault();

            // Get action and component
            const uid = this._getSelectedUid();
            const component = this.dataSource.getByUid(uid);
            let clone;
            let tool;
            let index;

            // Handle action on component
            switch (action) {
                case 'delete':
                    this.dataSource.remove(component);
                    // TODO This should raise the change event on the dataSource and call the refresh method of the widget
                    break;
                case 'duplicate':
                    clone = component.clone();
                    clone.top += 10;
                    clone.left += 10;
                    index = this.dataSource.indexOf(component);
                    this.dataSource.insert(index + 1, clone);
                    break;
                default:
                    tool = this.options.tools[component.tool];
                    if (
                        tool instanceof BaseTool &&
                        $.isFunction(tool.onContextMenu)
                    ) {
                        tool.onContextMenu(action, component);
                    }
            }

            // Close the menu (does not close automatically)
            e.sender.close();
        }
    },

    /**
     * Get adorner
     * @method _getAdorner
     * @returns {*}
     * @private
     */
    _getAdorner() {
        return this.wrapper.children(CONSTANTS.DOT + ADORNER_CLASS);
    },

    /**
     * Show the adorner and handles on a stage element
     * @method _showAdorner
     * @param uid
     * @private
     */
    _showAdorner(uid) {
        const adorner = this._getAdorner();
        if (adorner.length) {
            // Position adorner on top of stageElement (same location, same size, same rotation)
            const stageElement = this._getStageElementByUid(uid);
            adorner
                .css({
                    top: stageElement.css(CONSTANTS.TOP),
                    left: stageElement.css(CONSTANTS.LEFT),
                    height: stageElement.css(CONSTANTS.HEIGHT),
                    width: stageElement.css(CONSTANTS.WIDTH),
                    // transformOrigin: 'center center', // by default
                    transform: stageElement.css(TRANSFORM), // This might return a matrix
                    display: BLOCK
                })
                // IMPORTANT: Set the uid of the adorner to the uid of the stageElement it is set on
                // This is how we know which stageElement to transform when dragging handles
                .attr(attr(CONSTANTS.UID), uid);

            // Scale back and rotate back handles
            adorner.children(CONSTANTS.DOT + HANDLE_CLASS).css({
                // transformOrigin: 'center center', // by default
                transform: `${format(
                    CSS_ROTATE,
                    -getTransformRotation(stageElement)
                )} ${format(CSS_SCALE, 1 / this.scale())}`
            });
        }
    },

    /**
     * Hide adroner and handles
     * @method _hideAdorner
     * @private
     */
    _hideAdorner() {
        this._getAdorner()
            .css({ display: CONSTANTS.NONE })
            .removeAttr(attr(CONSTANTS.UID));
    },

    /**
     * _getSelectedUid
     * @method _getSelectedUid
     * @private
     */
    _getSelectedUid() {
        return this._getAdorner().attr(attr(CONSTANTS.UID));
    },

    /**
     * Start dragging an element
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
        const that = this;
        const tools = that.options.tools;
        const activeToolId = tools.get(CONSTANTS.ACTIVE);
        const target = $(e.target);
        const mouse = getMousePosition(e, that.stage);
        let stageElement = target.closest(
            CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS
        );
        const handle = target.closest(CONSTANTS.DOT + HANDLE_CLASS);
        let uid;

        // Close any context menu left opened if not selecting a menu item
        if (that.menu instanceof ContextMenu && !target.is('.k-link')) {
            that.menu.close();
        }

        if (activeToolId !== CONSTANTS.POINTER) {
            // When clicking the stage with an active tool, add a new element
            const tool = tools[activeToolId];
            assert.instanceof(
                BaseTool,
                tool,
                assert.format(
                    assert.messages.instanceof.default,
                    'tool',
                    'BaseTool'
                )
            );
            const scale = getTransformScale(that.wrapper);
            const left = mouse.x / scale;
            const top = mouse.y / scale;

            // Check that the mousedown occured within the boundaries of the stage
            if (
                left >= 0 &&
                left <= this.stage.width() &&
                top >= 0 &&
                top <= this.stage.height()
            ) {
                const item = new PageComponent({
                    // id: kendo.guid(),
                    tool: tool.id,
                    left,
                    top,
                    width: tool.width,
                    height: tool.height
                    // rotate: tool.rotate?
                });
                that.dataSource.add(item);
                // Add triggers the change event on the dataSource which calls the refresh method

                tools.set(CONSTANTS.ACTIVE, CONSTANTS.POINTER);
            }

            e.preventDefault(); // otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        } else if (handle.length) {
            // When hitting a handle with the pointer tool
            const action = handle.attr(attr(CONSTANTS.ACTION));
            if (action === ACTIONS.MENU) {
                $.noop(); // TODO: contextual menu here
            } else {
                const adorner = that._getAdorner();
                uid = adorner.attr(attr(CONSTANTS.UID)); // the uid of the stageElement which is being selected before hitting the handle
                stageElement = that._getStageElementByUid(uid);
                adorner.data(STATE, {
                    action,
                    top: parseFloat(stageElement.css(CONSTANTS.TOP)) || 0, // stageElement.position().top does not work when scaled
                    left: parseFloat(stageElement.css(CONSTANTS.LEFT)) || 0, // stageElement.position().left does not work when scaled
                    height: stageElement.height(),
                    width: stageElement.width(),
                    angle: getTransformRotation(stageElement),
                    scale: getTransformScale(that.wrapper),
                    snapGrid: 0, // TODO
                    snapAngle: 0, // TODO
                    mouseX: mouse.x,
                    mouseY: mouse.y,
                    uid
                });

                // log(adorner.data(STATE));
                $(document.body).css(CURSOR, target.css(CURSOR));
            }
            e.preventDefault(); // otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        } else if (
            stageElement.length ||
            target.is(CONSTANTS.DOT + ADORNER_CLASS)
        ) {
            // When hitting a stage element or the handle box with the pointer tool
            uid = stageElement.attr(attr(CONSTANTS.UID));
            if (isGuid(uid)) {
                const component = that.dataSource.getByUid(uid);
                if (component instanceof PageComponent) {
                    that.value(component);
                }
            }
        } else if (that.wrapper.find(target).length) {
            // When hitting anything else in the wrapper with the pointer tool
            that.value(null);
            e.preventDefault(); // otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        }

        // Otherwise, let the event propagate
    },

    /**
     * While dragging an element on stage
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
        const that = this;
        const adorner = this._getAdorner();
        const startState = adorner.data(STATE);

        // With a startState, we are dragging a handle
        if ($.isPlainObject(startState)) {
            const mouse = getMousePosition(e, that.stage);
            const stageElement = that._getStageElementByUid(startState.uid);
            const item = that.dataSource.getByUid(startState.uid);
            const rect = stageElement[0].getBoundingClientRect();
            const bounds = {
                // TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                left:
                    rect.left -
                    that.stage.offset().left +
                    $(that.stage.get(0).ownerDocument).scrollLeft(),
                top:
                    rect.top -
                    that.stage.offset().top +
                    $(that.stage.get(0).ownerDocument).scrollTop(),
                height: rect.height,
                width: rect.width
            };
            const center = {
                x: bounds.left + bounds.width / 2,
                y: bounds.top + bounds.height / 2
            };

            if ($.isFunction(that._updateDebugVisualElements)) {
                that._updateDebugVisualElements({
                    wrapper: that.wrapper,
                    mouse,
                    center,
                    bounds,
                    scale: startState.scale
                });
            }

            if (startState.action === ACTIONS.MOVE) {
                item.set(
                    CONSTANTS.LEFT,
                    snap(
                        startState.left +
                            (mouse.x - startState.mouseX) / startState.scale,
                        that._snapGrid
                    )
                );
                item.set(
                    CONSTANTS.TOP,
                    snap(
                        startState.top +
                            (mouse.y - startState.mouseY) / startState.scale,
                        that._snapGrid
                    )
                );
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            } else if (startState.action === ACTIONS.RESIZE) {
                // See https://github.com/Memba/Kidoju-Widgets/blob/master/test/samples/move-resize-rotate.md
                const dx = (mouse.x - startState.mouseX) / startState.scale; // horizontal distance from S to S'
                const dy = (mouse.y - startState.mouseY) / startState.scale; // vertical distance from S to S'
                const centerAfterMove = {
                    // Also C'
                    x: center.x + dx / 2,
                    y: center.y + dy / 2
                };
                const topLeft = {
                    // Also T
                    x: startState.left,
                    y: startState.top
                };
                const alpha = deg2rad(startState.angle);
                const mmprime = getRotatedPoint(topLeft, center, alpha); // Also M=M'
                const topLeftAfterMove = getRotatedPoint(
                    mmprime,
                    centerAfterMove,
                    -alpha
                ); // Also T'

                // TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                item.set(CONSTANTS.LEFT, Math.round(topLeftAfterMove.x));
                item.set(CONSTANTS.TOP, Math.round(topLeftAfterMove.y));
                item.set(
                    CONSTANTS.HEIGHT,
                    snap(
                        startState.height -
                            dx * Math.sin(alpha) +
                            dy * Math.cos(alpha),
                        that._snapGrid
                    )
                );
                item.set(
                    CONSTANTS.WIDTH,
                    snap(
                        startState.width +
                            dx * Math.cos(alpha) +
                            dy * Math.sin(alpha),
                        that._snapGrid
                    )
                );
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            } else if (startState.action === ACTIONS.ROTATE) {
                const rad = getRadiansBetweenPoints(
                    center,
                    {
                        x: startState.mouseX,
                        y: startState.mouseY
                    },
                    mouse
                );
                const deg = snap(
                    (360 + startState.angle + rad2deg(rad)) % 360,
                    that._snapAngle
                );
                item.set(ROTATE, deg);
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            }

            e.preventDefault();
            e.stopPropagation();
        }
    },

    /**
     * At the end of dragging an element on stage
     * @param e
     * @private
     */
    _onMouseUp(e) {
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
            Stage,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kendo.ui.Stage'
            )
        );
        const that = this;
        const adorner = this._getAdorner();
        const startState = adorner.data(STATE);

        if ($.isPlainObject(startState)) {
            // Remove drag start state
            adorner.removeData(STATE);

            // Reset cursor
            $(document.body).css(CURSOR, '');

            // Hide debug visual elements
            if ($.isFunction(that._hideDebugVisualElements)) {
                that._hideDebugVisualElements(that.wrapper);
            }
        }
    },

    /**
     *
     * @param options
     * @private
     */
    _editable(options) {
        const that = this;
        const wrapper = that.wrapper;
        const disabled = (that._disabled = options.disabled);
        const readonly = (that._readonly = options.readonly);

        // Clear

        // Set
        /*
        if (!disabled && !readonly) {
            // TODO iterate through components and call onEnable
        } else {

        }
        */
    },

    /**
     * Enable/disable the widget
     * @param enable
     */
    enable(enable) {
        this._editable({
            readonly: false,
            disabled: !(enable = enable === undefined ? true : enable)
        });
    },

    /**
     * Make the widget readonly
     * @param readonly
     */
    readonly(readonly) {
        this._editable({
            readonly: readonly === undefined ? true : readonly,
            disabled: false
        });
    },

    /**
     * Toggle the selection
     * @returns {h|*}
     */
    _toggleSelection() {
        assert.instanceof(
            Stage,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kendo.ui.Stage'
            )
        );
        const that = this;
        const uid = that._selectedUid;
        const adorner = this._getAdorner();
        // if (that.mode() === CONSTANTS.STAGE_MODES.DESIGN) {
        if (adorner.length) {
            const stageElement = that._getStageElementByUid(uid);
            if (
                isGuid(uid) &&
                stageElement.length &&
                adorner.attr(attr(CONSTANTS.UID)) !== uid
            ) {
                that._showAdorner(uid);
                // select(null) should clear the selection
            } else if (
                $.type(uid) === CONSTANTS.NULL &&
                adorner.css(DISPLAY) !== CONSTANTS.NONE
            ) {
                that._hideAdorner();
            }
        }
    },

    /**
     * Stage Elements
     * @method items
     * @returns {*}
     */
    items() {
        // TODO Do not return .kj-connector-surface
        return $.makeArray(
            this.stage.children(CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS)
        );
    },

    /**
     * Clears the DOM from modifications made by the widget
     * @private
     */
    _clear() {
        const that = this;
        // clear mode
        that._clearAll();
        // unbind kendo
        unbind(that.element);
        // unbind all other events
        that.element.find('*').off();
        // remove no page div
        that.wrapper.children(`.${NOPAGE_CLASS}`).remove();
        that.wrapper.children(`.${OVERLAY_CLASS}`).remove();
        that.wrapper = undefined;
        // empty and unwrap
        that.element
            .off()
            .empty()
            .unwrap();
    },

    /**
     * Destroy
     */
    destroy() {
        const that = this;
        DataBoundWidget.fn.destroy.call(that);
        that.setDataSource(null);
        that._clear();
        destroy(that.element);
    }
});

/**
 * Registration
 */
plugin(Stage);

/** *******************************************************************************
 * Visual debug helpers
 ******************************************************************************** */

if (window.app && window.app.DEBUG) {
    const DEBUG_MOUSE_CLASS = 'debug-mouse';
    const DEBUG_MOUSE_DIV = `<div class="${DEBUG_MOUSE_CLASS}"/>`;
    const DEBUG_BOUNDS_CLASS = 'debug-bounds';
    const DEBUG_BOUNDS = `<div class="${DEBUG_BOUNDS_CLASS}"/>`;
    const DEBUG_CENTER_CLASS = 'debug-center';
    const DEBUG_CENTER = `<div class="${DEBUG_CENTER_CLASS}"/>`;

    /**
     * Add debug visual eleemnts
     * @param wrapper
     */
    Stage.fn._addDebugVisualElements = function(wrapper) {
        // Add bounding rectangle
        $(DEBUG_BOUNDS)
            .css({
                position: ABSOLUTE,
                border: '1px dashed #FF00FF',
                display: CONSTANTS.NONE
            })
            .appendTo(wrapper);

        // Add center of rotation
        $(DEBUG_CENTER)
            .css({
                position: ABSOLUTE,
                height: '20px',
                width: '20px',
                marginTop: '-10px',
                marginLeft: '-10px',
                borderRadius: '50%',
                backgroundColor: '#FF00FF',
                display: CONSTANTS.NONE
            })
            .appendTo(wrapper);

        // Add calculated mouse position
        $(DEBUG_MOUSE_DIV)
            .css({
                position: ABSOLUTE,
                height: '20px',
                width: '20px',
                marginTop: '-10px',
                marginLeft: '-10px',
                borderRadius: '50%',
                backgroundColor: '#00FFFF',
                display: CONSTANTS.NONE
            })
            .appendTo(wrapper);
    };

    /**
     * Update debug visual elements
     * @param options
     */
    Stage.fn._updateDebugVisualElements = function(options) {
        if ($.isPlainObject(options) && options.scale > 0) {
            // Display center of rotation
            options.wrapper.children(CONSTANTS.DOT + DEBUG_CENTER_CLASS).css({
                display: 'block',
                left: Math.round(options.center.x / options.scale),
                top: Math.round(options.center.y / options.scale)
            });

            // Display bounding rectangle
            options.wrapper.children(CONSTANTS.DOT + DEBUG_BOUNDS_CLASS).css({
                display: 'block',
                left: Math.round(options.bounds.left / options.scale),
                top: Math.round(options.bounds.top / options.scale),
                height: Math.round(options.bounds.height / options.scale),
                width: Math.round(options.bounds.width / options.scale)
            });

            // Display mouse calculated position
            options.wrapper.children(CONSTANTS.DOT + DEBUG_MOUSE_CLASS).css({
                display: 'block',
                left: Math.round(options.mouse.x / options.scale),
                top: Math.round(options.mouse.y / options.scale)
            });
        }
    };

    /**
     * Hide debug visual elements
     * @param wrapper
     */
    Stage.fn._hideDebugVisualElements = function(wrapper) {
        if (window.app && window.app.DEBUG) {
            wrapper
                .children(CONSTANTS.DOT + DEBUG_CENTER_CLASS)
                .css({ display: CONSTANTS.NONE });
            wrapper
                .children(CONSTANTS.DOT + DEBUG_BOUNDS_CLASS)
                .css({ display: CONSTANTS.NONE });
            wrapper
                .children(CONSTANTS.DOT + DEBUG_MOUSE_CLASS)
                .css({ display: CONSTANTS.NONE });
        }
    };

    /**
     * Remove debug visual elements
     * @param wrapper
     */
    Stage.fn._removeDebugVisualElements = function(wrapper) {
        if (window.app && window.app.DEBUG) {
            wrapper.children(CONSTANTS.DOT + DEBUG_CENTER_CLASS).remove();
            wrapper.children(CONSTANTS.DOT + DEBUG_BOUNDS_CLASS).remove();
            wrapper.children(CONSTANTS.DOT + DEBUG_MOUSE_CLASS).remove();
        }
    };
}
