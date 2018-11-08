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
        this._scale = this.options.scale;
        this._height = this.options.height;
        this._width = this.options.width;
        this._enabled = this.options.enabled;
        this._snapAngle = this.options.snapAngle;
        this._snapGrid = this.options.snapGrid;
        this._render();
        this._dataSource();
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
        // TODO Do not return .kj-connector-surface
        return $.makeArray(
            this.stage.children(CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS)
        );
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
        const isReadOnly = !hasPage || !this._enabled;
        const bindUserEntries = hasPage && this.mode() !== modes.DESIGN;
        const designMode = hasPage && this.mode() === modes.DESIGN;
        const enabledDesignMode = designMode && this._enabled;

        // Set mode
        this._toggleNoPageMessage(!hasPage);
        this._toggleReadOnlyOverlay(isReadOnly);
        this._togglePropertyBindings(bindUserEntries);
        this._toggleAdorner(enabledDesignMode);
        this._toggleUserEvents(enabledDesignMode);
        this._toggleVisualDebugElements(enabledDesignMode);
        this._toggleKeyboardEvents(enabledDesignMode);
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
     * Initializes a message when there is no page to display
     * @method _toggleNoPageMessage
     * @param enable
     * @private
     */
    _toggleNoPageMessage(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Remove no-page message
        this.wrapper.children(`.${NOPAGE_CLASS}`).remove();

        // Add no-page message
        if (enabled) {
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
     * Toggle the readonly overlay
     * @method _toggleReadOnlyOverlay
     * @param enable
     * @private
     */
    _toggleReadOnlyOverlay(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Remove overlay
        this.wrapper.children(`.${OVERLAY_CLASS}`).remove();

        // Add overlay
        if (enabled) {
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
     * Toggle the loading overlay
     * @method _toggleLoadingOverlay
     * @param enable
     * @private
     */
    _toggleLoadingOverlay(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        if (enabled) {
            // TODO
        }
    },

    /**
     * Toggle property bindings
     * @method _togglePropertyBindings
     * @param enable
     * @private
     */
    _togglePropertyBindings(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        const that = this;

        // TODO: We might not need a PROPERTYBINDING event for that because this is all internal to ui.Stage
        if (enabled) {
            debugger;
        }

        // Unbind property bindings
        if ($.isFunction(that._propertyBinding)) {
            that.unbind(PROPERTYBINDING, that._propertyBinding);
        }

        if (enabled) {
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
     * Toggle the adorner and handles
     * @method _toggleAdorner
     * @param enable
     * @private
     */
    _toggleAdorner(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Remove adorner
        this._getAdorner().remove();

        // Add adorner if enabled
        if (enabled) {
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
                .appendTo(this.wrapper);
        }
    },

    /**
     * Initialize user events in design mode
     * @method _toggleUserEvents
     * @param enable
     * @private
     */
    _toggleUserEvents(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // $(document).off(NS);
        if (this.userEvents instanceof UserEvents) {
            this.userEvents.destroy();
            this.userEvents = undefined;
        }

        if (enabled) {
            // Add mouse event handlers
            /*
            $(document)
                .on(MOUSEDOWN, this._onMouseDown.bind(this))
                .on(MOUSEMOVE, this._onMouseMove.bind(this))
                .on(MOUSEUP, this._onMouseUp.bind(this));
            */
            this.userEvents = new UserEvents(this.wrapper, {
                global: true,
                // filter: '.kj-handle',
                press: this._onMousePress.bind(this),
                start: this._onMouseStart.bind(this),
                move: this._onMouseMove.bind(this),
                end: this._onMouseEnd.bind(this)
            });
        }
    },

    /**
     * Toggle visual debug elements
     * @method _toggleVisualDebugElements
     * @param enable
     * @private
     */
    _toggleVisualDebugElements(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Remove debug visual elements
        if ($.isFunction(Stage._removeDebugVisualElements)) {
            Stage._removeDebugVisualElements(this.wrapper);
        }

        if (enabled && $.isFunction(Stage._addDebugVisualElements)) {
            Stage._addDebugVisualElements(this.wrapper);
        }
    },

    /**
     * Toggle keyboard events
     * @method _toggleKeyboardEvents
     * @param enable
     * @private
     */
    _toggleKeyboardEvents(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        this.stage
            .prop('tabIndex', -1)
            .off(CONSTANTS.KEYDOWN + NS)
            .off(CONSTANTS.KEYUP + NS);

        if (enabled) {
            this.stage
                .prop('tabIndex', 0)
                .on(CONSTANTS.KEYDOWN + NS, this._onKeyDown.bind(this))
                .on(CONSTANTS.KEYUP + NS, this._onKeyUp.bind(this));
        }
    },

    /**
     * TODO Toggle transform event handlers
     * @param enable
     * @private
     */
    _toggleTransformEventHandlers(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Disable events (Beware KeyUp)
        this.stage
            .off(ENABLE + NS) // TODO uis ENABLE an event????
            .off(MOVE + NS)
            .off(RESIZE + NS)
            .off(ROTATE + NS);

        // Enable event handlers (also in navigation in design mode)
        if (enabled) {
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
        /*
        // uid may be undefined
        assert.match(
            CONSTANTS.RX_GUID,
            uid,
            assert.format(
                assert.messages.match.default,
                CONSTANTS.UID,
                CONSTANTS.RX_GUID
            )
        );
        */
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
                CONSTANTS.UID,
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
            stageElement.attr(attr(CONSTANTS.UID)),
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
     * Event handler triggered for the `press` user event
     * Note: simply show the adorner on the closest stage element
     * @method _onMousePress
     * @param e
     * @private
     */
    _onMousePress(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        const active = this.options.tools.get(CONSTANTS.ACTIVE);
        const target = $((e.touch || {}).initialTouch);
        // Close any context menu left opened
        if (
            this.menu instanceof ContextMenu &&
            !target.is(
                `${CONSTANTS.DOT + HANDLE_CLASS}[${attr(CONSTANTS.ACTION)}="${
                    ACTIONS.MENU
                }"]`
            )
        ) {
            this.menu.close();
        }
        if (active === CONSTANTS.POINTER) {
            // The active tool is the pointer
            // target can possibly be a child of a kj-element
            // or something else (kj-adorner, kj-handle) that is ignored
            const stageElement = target.closest(
                CONSTANTS.DOT + CONSTANTS.ELEMENT_CLASS
            );
            const uid = stageElement.attr(attr(CONSTANTS.UID));
            const component = this.dataSource.getByUid(uid);
            if (component instanceof PageComponent) {
                this.value(component);
                this.trigger(CONSTANTS.SELECT, { value: component });
            } else if (this._getAdorner().find(target).length === 0) {
                this.value(null);
                this.trigger(CONSTANTS.SELECT, { value: null });
            }
        } else if (active !== CONSTANTS.POINTER) {
            e.preventDefault();
            // Find the selected tool
            const tool = tools[active];
            assert.instanceof(
                BaseTool,
                tool,
                assert.format(
                    assert.messages.instanceof.default,
                    'tool',
                    'BaseTool'
                )
            );
            // Find the mouse/touch position and add a component
            const scale = getTransformScale(this.wrapper);
            const offset = this.stage.offset();
            const left = (e.x.location - offset.left) / scale;
            const top = (e.y.location - offset.top) / scale;
            // Check that the mousedown occured within the boundaries of the stage
            if (
                left >= 0 &&
                left <= this.stage.width() &&
                top >= 0 &&
                top <= this.stage.height()
            ) {
                const component = new PageComponent({
                    // id: kendo.guid(),
                    tool: tool.id,
                    left,
                    top,
                    width: tool.width,
                    height: tool.height
                    // rotate: tool.rotate
                });
                // Add triggers the change event on the dataSource
                // which calls the refresh method
                this.dataSource.add(component);
                this._showAdorner(component.uid);
                this.trigger(CONSTANTS.SELECT, { value: component });

                // Reset the pointer tool
                tools.set(CONSTANTS.ACTIVE, CONSTANTS.POINTER);
            }
        }

        // Focus on the stage to receive keyboard events
        this.stage.focus();
    },

    /**
     * Event handler triggered for the `start` user event
     * Note: Start dragging a handle
     * @method _onMouseStart
     * @param e
     * @private
     */
    _onMouseStart(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        const active = this.options.tools.get(CONSTANTS.ACTIVE);
        const target = $((e.touch || {}).initialTouch);
        const action = target.attr(attr(CONSTANTS.ACTION));
        if (
            active === CONSTANTS.POINTER &&
            target.is(CONSTANTS.DOT + HANDLE_CLASS) &&
            action !== ACTIONS.MENU
        ) {
            e.preventDefault();

            // Find the mouse/touch position and add a component
            const scale = getTransformScale(this.wrapper);
            const offset = this.stage.offset();
            const x = (e.x.location - offset.left) / scale;
            const y = (e.y.location - offset.top) / scale;
            const adorner = this._getAdorner();
            const uid = adorner.attr(attr(CONSTANTS.UID));
            const stageElement = this._getStageElementByUid(uid);
            // All the following measurements are scaled to stage coordinates
            adorner.data(STATE, {
                action,
                // top: stageElement.position().top does not work when rotated
                top: parseFloat(stageElement.css(CONSTANTS.TOP)) || 0,
                // left: stageElement.position().left does not work when rotated
                left: parseFloat(stageElement.css(CONSTANTS.LEFT)) || 0,
                height: stageElement.height(),
                width: stageElement.width(),
                angle: getTransformRotation(stageElement),
                scale,
                x,
                y,
                uid
            });

            // Use the handle cursor while dragging
            $(document.body).css(CURSOR, target.css(CURSOR));
        }
    },

    /**
     * Event handler triggered for the `move` user event
     * Note: While dragging a handle
     * @param e
     * @private
     */
    _onMouseMove(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        const target = $((e.touch || {}).initialTouch);
        const action = target.attr(attr(CONSTANTS.ACTION));
        const adorner = this._getAdorner();
        const uid = adorner.attr(attr(CONSTANTS.UID));
        const state = adorner.data(STATE);

        // Weh have s state with a consistent action and uid
        if (
            $.isPlainObject(state) &&
            action === state.action &&
            uid === state.uid
        ) {
            e.preventDefault();

            const stageElement = this._getStageElementByUid(uid);
            const component = this.dataSource.getByUid(state.uid);
            const rect = stageElement[0].getBoundingClientRect();
            const offset = this.stage.offset();
            const doc = $(this.stage[0].ownerDocument);
            const { scale } = state;
            // Find the stage element bounds and the center of rotation
            // Note: these calculations depend on the transformOrigin attribute of this.wrapper
            // ideally we should introduce transformOrigin in the calculation
            const bounds = {
                left: (rect.left - offset.left + doc.scrollLeft()) / scale,
                top: (rect.top - offset.top + doc.scrollTop()) / scale,
                height: rect.height / scale,
                width: rect.width / scale
            };
            const center = {
                x: bounds.left + bounds.width / 2,
                y: bounds.top + bounds.height / 2
            };
            // Find the mouse/touch position and add a component
            const mouse = {
                x: (e.x.location - offset.left) / scale,
                y: (e.y.location - offset.top) / scale
            };
            const dx = mouse.x - state.x; // horizontal distance from S to S'
            const dy = mouse.y - state.y; // vertical distance from S to S'

            if ($.isFunction(Stage._updateDebugVisualElements)) {
                Stage._updateDebugVisualElements({
                    bounds,
                    center,
                    mouse,
                    wrapper: this.wrapper
                });
            }
            if (state.action === ACTIONS.MOVE) {
                component.set(
                    CONSTANTS.LEFT,
                    snap(state.left + dx, this._snapGrid)
                );
                component.set(
                    CONSTANTS.TOP,
                    snap(state.top + dy, this._snapGrid)
                );
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            } else if (state.action === ACTIONS.RESIZE) {
                // See https://github.com/Memba/Kidoju-Widgets/blob/master/test/samples/move-resize-rotate.md
                const centerAfterMove = {
                    // Also C'
                    x: center.x + dx / 2,
                    y: center.y + dy / 2
                };
                const topLeft = {
                    // Also T
                    x: state.left,
                    y: state.top
                };
                const alpha = deg2rad(state.angle);
                const mmprime = getRotatedPoint(topLeft, center, alpha); // Also M=M'
                const topLeftAfterMove = getRotatedPoint(
                    mmprime,
                    centerAfterMove,
                    -alpha
                ); // Also T'
                component.set(CONSTANTS.LEFT, topLeftAfterMove.x);
                component.set(CONSTANTS.TOP, topLeftAfterMove.y);
                component.set(
                    CONSTANTS.HEIGHT,
                    snap(
                        state.height -
                            dx * Math.sin(alpha) +
                            dy * Math.cos(alpha),
                        this._snapGrid
                    )
                );
                component.set(
                    CONSTANTS.WIDTH,
                    snap(
                        state.width +
                            dx * Math.cos(alpha) +
                            dy * Math.sin(alpha),
                        this._snapGrid
                    )
                );
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            } else if (state.action === ACTIONS.ROTATE) {
                const rad = getRadiansBetweenPoints(
                    center,
                    { x: state.x, y: state.y },
                    mouse
                );
                const deg = snap(
                    (360 + state.angle + rad2deg(rad)) % 360,
                    this._snapAngle
                );
                component.set(ROTATE, deg);
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            }
        }
    },

    /**
     * Event handler triggered for the `end` user event
     * Note: Stop dragging a handle
     * @param e
     * @private
     */
    _onMouseEnd(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        const target = $((e.touch || {}).initialTouch);
        const action = target.attr(attr(CONSTANTS.ACTION));
        const adorner = this._getAdorner();
        const uid = adorner.attr(attr(CONSTANTS.UID));
        const state = adorner.data(STATE);

        // Weh have s state with a consistent action and uid
        if (
            $.isPlainObject(state) &&
            action === state.action &&
            uid === state.uid
        ) {
            e.preventDefault();

            // Remove drag start state
            adorner.removeData(STATE);

            // Reset cursor
            $(document.body).css(CURSOR, '');

            // Hide debug visual elements
            if ($.isFunction(Stage._hideDebugVisualElements)) {
                Stage._hideDebugVisualElements(this.wrapper);
            }
        }
    },

    /**
     * Event handler triggered when pressing down a key
     * @method _onKeyDown
     * @param e
     * @private
     */
    _onKeyDown(e) {
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
            [
                keys.DOWN,
                keys.END,
                keys.HOME,
                keys.LEFT,
                keys.PAGEDOWN,
                keys.PAGEUP,
                keys.RIGHT,
                keys.SPACE,
                keys.UP
            ].indexOf(e.which) > -1
        ) {
            // Prevent scrolling (does not prevent keyup)
            e.preventDefault();
        }
    },

    /**
     * Event handler triggered when pressing up a key
     * @method _onKeyUp
     * @param e
     * @private
     */
    _onKeyUp(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const angleStep = this._snapAngle || 1;
        const gridStep = this._snapGrid || 1;
        const altKey = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
        const uid = this._getSelectedUid();
        // If uid is undefined, component is undefined
        const component = this.dataSource.getByUid(uid);
        const that = this;
        const openMenu = () => {
            if (that.menu instanceof ContextMenu) {
                that.menu.open();
                // Focus on menu - https://www.telerik.com/forums/how-to-focus-on-contextmenu
                that.menu.wrapper.focus();
            }
        };
        const incrementPos = (prop, inc) => {
            component.set(
                prop,
                snap(component.get(prop) + inc, that._snapGrid)
            );
        };
        const rotate = inc => {
            component.set(
                'rotate',
                snap(component.get('rotate') + inc, that._snapAngle)
            );
        };
        if (e.which === keys.TAB || component instanceof PageComponent) {
            switch (e.which) {
                case keys.BACKSPACE:
                case keys.DELETE:
                    this.dataSource.remove(component);
                    this.value(null);
                    break;
                case keys.DOWN:
                case keys.PAGEDOWN:
                    if (altKey) {
                        incrementPos(CONSTANTS.HEIGHT, gridStep);
                    } else {
                        incrementPos(CONSTANTS.TOP, gridStep);
                    }
                    break;
                case keys.END:
                    this.index(this.dataSource.total() - 1);
                    this.trigger(CONSTANTS.SELECT, {
                        value: this.dataSource.getByUid(this._getSelectedUid())
                    });
                    this.stage.focus(); // Otherwise it loses focus
                    break;
                case keys.HOME:
                    this.index(0);
                    this.trigger(CONSTANTS.SELECT, {
                        value: this.dataSource.getByUid(this._getSelectedUid())
                    });
                    this.stage.focus(); // Otherwise it loses focus
                    break;
                case keys.LEFT:
                    if (altKey) {
                        incrementPos(CONSTANTS.WIDTH, -gridStep);
                    } else {
                        incrementPos(CONSTANTS.LEFT, -gridStep);
                    }
                    break;
                case keys.RIGHT:
                    if (altKey) {
                        incrementPos(CONSTANTS.WIDTH, gridStep);
                    } else {
                        incrementPos(CONSTANTS.LEFT, gridStep);
                    }
                    break;
                case keys.TAB:
                    // There is nothing we can do with altKey here
                    // because any altKey + Tab is captured by the OS or browser
                    this.index(
                        (this.index() + 1) % (this.dataSource.total() || 1)
                    );
                    this.trigger(CONSTANTS.SELECT, {
                        value: this.dataSource.getByUid(this._getSelectedUid())
                    });
                    this.stage.focus(); // Otherwise it loses focus
                    break;
                case keys.UP:
                case keys.PAGEUP:
                    if (altKey) {
                        incrementPos(CONSTANTS.HEIGHT, -gridStep);
                    } else {
                        incrementPos(CONSTANTS.TOP, -gridStep);
                    }
                    break;
                case keys.SPACE:
                    openMenu();
                    break;
                case keys.NUMPAD_MINUS:
                    rotate(-angleStep);
                    break;
                case keys.NUMPAD_PLUS:
                    rotate(angleStep);
                    break;
                default:
                    if (
                        altKey &&
                        String.fromCharCode(e.which).toLowerCase() === 'm'
                    ) {
                        openMenu();
                    } else if (
                        altKey &&
                        String.fromCharCode(e.which).toLowerCase() === 'r'
                    ) {
                        rotate(angleStep);
                    }
                    break;
            }
        }
    },

    /**
     * Enable/disable the widget
     * @param enable
     */
    enable(enable) {
        this._enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        debugger;
        // TODO iterate through components and call onEnable
        // TODO _initializeMode
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
    Stage._addDebugVisualElements = function(wrapper) {
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
    Stage._updateDebugVisualElements = function(options) {
        if ($.isPlainObject(options)) {
            const { bounds, center, mouse, wrapper } = options;
            // Display center of rotation
            wrapper.children(CONSTANTS.DOT + DEBUG_CENTER_CLASS).css({
                display: 'block',
                left: Math.round(center.x),
                top: Math.round(center.y)
            });

            // Display bounding rectangle
            wrapper.children(CONSTANTS.DOT + DEBUG_BOUNDS_CLASS).css({
                display: 'block',
                left: Math.round(bounds.left),
                top: Math.round(bounds.top),
                height: Math.round(bounds.height),
                width: Math.round(bounds.width)
            });

            // Display mouse calculated position
            wrapper.children(CONSTANTS.DOT + DEBUG_MOUSE_CLASS).css({
                display: 'block',
                left: Math.round(mouse.x),
                top: Math.round(mouse.y)
            });
        }
    };

    /**
     * Hide debug visual elements
     * @param wrapper
     */
    Stage._hideDebugVisualElements = function(wrapper) {
        wrapper
            .children(CONSTANTS.DOT + DEBUG_CENTER_CLASS)
            .css({ display: CONSTANTS.NONE });
        wrapper
            .children(CONSTANTS.DOT + DEBUG_BOUNDS_CLASS)
            .css({ display: CONSTANTS.NONE });
        wrapper
            .children(CONSTANTS.DOT + DEBUG_MOUSE_CLASS)
            .css({ display: CONSTANTS.NONE });
    };

    /**
     * Remove debug visual elements
     * @param wrapper
     */
    Stage._removeDebugVisualElements = function(wrapper) {
        wrapper.children(CONSTANTS.DOT + DEBUG_CENTER_CLASS).remove();
        wrapper.children(CONSTANTS.DOT + DEBUG_BOUNDS_CLASS).remove();
        wrapper.children(CONSTANTS.DOT + DEBUG_MOUSE_CLASS).remove();
    };
}
