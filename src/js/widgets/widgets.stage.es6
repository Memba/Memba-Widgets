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
    keys,
    ui: { plugin, ContextMenu, DataBoundWidget }
} = window.kendo;
const logger = new Logger('widgets.stage');
const NS = '.kendoStage';
const WIDGET_CLASS = 'k-widget kj-stage';
const LOADING_OVERLAY =
    '<div contenteditable="false" class="k-loading-mask" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"><div class="k-loading-image"></div><div class="k-loading-color"></div></div>';


const MOUSEDOWN = `mousedown${NS} touchstart${NS}`;
const MOUSEMOVE = `mousemove${NS} touchmove${NS}`;
const MOUSEUP = `mouseup${NS} touchend${NS}`;
const PROPERTYBINDING = 'propertyBinding';
const PROPERTYBOUND = 'propertyBound';
const SELECT = 'select';
// var ENABLE = 'enable';
const MOVE = 'move';
const RESIZE = 'resize';
const ROTATE = 'rotate'; // This constant is not simply an event
const ABSOLUTE = 'absolute';
const RELATIVE = 'relative';
const HIDDEN = 'hidden';
const DISPLAY = 'display';
const BLOCK = 'block';
const NONE = 'none';
const TOP = 'top';
const LEFT = 'left';
const HEIGHT = 'height';
const WIDTH = 'width';
const CURSOR = 'cursor';
const TRANSFORM = 'transform';
const CSS_ROTATE = 'rotate({0}deg)';
const CSS_SCALE = 'scale({0})';
const DATA_UID = attr('uid');
const DATA_TOOL = attr('tool');
const DATA_COMMAND = attr('command');
const DOT = '.';
const DIV_W_CLASS = '<div class="{0}"></div>';

const ELEMENT_CLASS = 'kj-element';
const ELEMENT = `<div ${DATA_UID}="{0}" ${DATA_TOOL}="{1}" class="${ELEMENT_CLASS}"></div>`;
const ELEMENT_SELECTOR = `${DOT + ELEMENT_CLASS}[${DATA_UID}="{0}"]`;
const OVERLAY_CLASS = 'kj-overlay';
const HANDLE_BOX_CLASS = 'kj-handle-box';
const HANDLE_BOX = format(DIV_W_CLASS, HANDLE_BOX_CLASS);
const HANDLE_BOX_SELECTOR = `${DOT + HANDLE_BOX_CLASS}[${DATA_UID}="{0}"]`;
const HANDLE_CLASS = 'kj-handle';
// Note: without touch-action: none, touch gestures won't work in Internet Explorer
const HANDLE_MOVE = `<span class="${HANDLE_CLASS}" ${DATA_COMMAND}="move" style="touch-action:none;"></span>`;
const HANDLE_RESIZE = `<span class="${HANDLE_CLASS}" ${DATA_COMMAND}="resize" style="touch-action:none;"></span>`;
const HANDLE_ROTATE = `<span class="${HANDLE_CLASS}" ${DATA_COMMAND}="rotate" style="touch-action:none;"></span>`;
const HANDLE_MENU = `<span class="${HANDLE_CLASS}" ${DATA_COMMAND}="menu" style="touch-action:none;"></span>`;
// var HANDLE_SELECTOR = '.kj-handle[' + DATA_COMMAND + '="{0}"]';
const NOPAGE_CLASS = 'kj-nopage';
const STATE = 'state';
const COMMANDS = {
    MOVE: 'move',
    RESIZE: 'resize',
    ROTATE: 'rotate',
    MENU: 'menu'
};
const POINTER = 'pointer';
const ACTIVE_TOOL = 'active';
const DEFAULTS = {
    MODE: 'play',
    SCALE: 1,
    WIDTH: 1024,
    HEIGHT: 768
};
const DEBUG_MOUSE_CLASS = 'debug-mouse';
const DEBUG_MOUSE_DIV = format(DIV_W_CLASS, DEBUG_MOUSE_CLASS);
const DEBUG_BOUNDS_CLASS = 'debug-bounds';
const DEBUG_BOUNDS = format(DIV_W_CLASS, DEBUG_BOUNDS_CLASS);
const DEBUG_CENTER_CLASS = 'debug-center';
const DEBUG_CENTER = '<div class="debug-center"></div>';

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
        this._enabled = this.options.enabled; // TODO was disabled
        this._readonly = this.options.readonly;
        this._snapAngle = this.options.snapAngle;
        this._snapGrid = this.options.snapGrid;
        this._render();
        this._dataSource();
        // this.enable(options.enabled);
    },

    /**
     * DataBoundWidget modes
     */
    modes: CONSTANTS.STAGE_MODES,

    /**
     * Events
     */
    events: [
        CONSTANTS.CHANGE,
        CONSTANTS.DATABINDING,
        CONSTANTS.DATABOUND,
        PROPERTYBINDING,
        PROPERTYBOUND,
        SELECT
    ],

    /**
     * Options
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
     * Mode defines the operating mode of the Stage DataBoundWidget
     * @param value
     * @return {*}
     */
    mode(value) {
        const that = this;
        if ($.type(value) !== CONSTANTS.UNDEFINED) {
            assert.type(
                CONSTANTS.STRING,
                value,
                assert.format(
                    assert.messages.type.default,
                    'value',
                    CONSTANTS.STRING
                )
            );
            if ($.type(that.modes[value]) === CONSTANTS.UNDEFINED) {
                throw new RangeError();
            }
            if (value !== that._mode) {
                that._mode = value;
                that._initializeMode();
                that.refresh();
            }
        } else {
            return that._mode;
        }
    },

    /**
     * Scale the widget
     * @param value
     * @return {*}
     */
    scale(value) {
        const that = this;
        if (value !== undefined) {
            if ($.type(value) !== CONSTANTS.NUMBER) {
                throw new TypeError();
            }
            if (value < 0) {
                throw new RangeError();
            }
            if (value !== that._scale) {
                // TODO: that.options.scale
                that._scale = value;
                that.wrapper.css({
                    transformOrigin: '0 0',
                    transform: format(CSS_SCALE, that._scale)
                });
                that.wrapper.find(DOT + HANDLE_CLASS).css({
                    // transformOrigin: 'center center', // by default
                    transform: format(CSS_SCALE, 1 / that._scale)
                });
                /*
                // Scaling the message does not work very well so we have simply increased the font-size
                that.element.find(DOT + NOPAGE_CLASS).css({
                    // transformOrigin: 'center center', // by default
                    transform: format(CSS_SCALE, 1 / that._scale)
                });
                */
            }
        } else {
            return that._scale;
        }
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
     * @param component
     * @returns {*}
     */
    value(component) {
        const that = this;
        if (component === CONSTANTS.NULL) {
            if (that._selectedUid !== CONSTANTS.NULL) {
                that._selectedUid = CONSTANTS.NULL;
                logger.debug('selected component uid set to null');
                that._toggleSelection();
                that.trigger(CONSTANTS.CHANGE, {
                    index: undefined,
                    value: CONSTANTS.NULL
                });
            }
        } else if (component !== undefined) {
            if (!(component instanceof PageComponent)) {
                throw new TypeError();
            }
            // Note: when that.value() was previously named that.selection() with a custom binding
            // the selection binding was executed before the source binding so we had to record the selected component
            // in a temp variable (that._tmp) and assign it to the _selectedUid in the refresh method,
            // that is after the source was bound.
            // The corresponding code has now been removed after renaming that.selection() into that.value()
            // because the value binding is executed after the source binding.
            if (
                component.uid !== that._selectedUid &&
                util.isGuid(component.uid)
            ) {
                const index = that.dataSource.indexOf(component);
                if (index > -1) {
                    that._selectedUid = component.uid;
                    logger.debug(
                        `selected component uid set to ${component.uid}`
                    );
                    that._toggleSelection();
                    that.trigger(CONSTANTS.CHANGE, {
                        index,
                        value: component
                    });
                }
            }
        } else if (that._selectedUid === CONSTANTS.NULL) {
            return CONSTANTS.NULL;
        } else {
            return that.dataSource.getByUid(that._selectedUid); // Returns undefined if not found
        }
    },

    /**
     * @method total()
     * @returns {*}
     */
    length() {
        return this.dataSource instanceof PageComponentDataSource
            ? this.dataSource.total()
            : -1;
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
     * @param snapValue
     */
    snapAngle(snapValue) {
        if ($.type(snapValue) === CONSTANTS.UNDEFINED) {
            return this._snapAngle;
        }
        if ($.type(snapValue) === CONSTANTS.NUMBER) {
            this._snapAngle = snapValue;
        } else {
            throw new TypeError('Snap angle value should be a number');
        }
    },

    /**
     * Get/set snap grid
     * @param snapValue
     */
    snapGrid(snapValue) {
        if ($.type(snapValue) === CONSTANTS.UNDEFINED) {
            return this._snapGrid;
        }
        if ($.type(snapValue) === CONSTANTS.NUMBER) {
            this._snapGrid = snapValue;
        } else {
            throw new TypeError('Snap grid value should be a number');
        }
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
     * Widget layout
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
     * Initialize mode
     * @private
     */
    _initializeMode() {
        const {
            modes,
            options: { dataSource }
        } = this;

        const hasPage = !!dataSource;
        const isReadOnly = !hasPage || this._disabled || this._readonly;

        // Set mode
        this._toggleNoPageMessage(!hasPage);
        this._toggleReadOnlyOverlay(isReadOnly);
        const bindUserEntries = hasPage && this.mode() !== modes.DESIGN;
        this._togglePropertyBindings(bindUserEntries);
        const designMode = hasPage && this.mode() === modes.DESIGN;
        const enabledDesignMode =
            designMode && !this._disabled && !this._readonly;
        this._toggleHandleBox(enabledDesignMode);
        this._toggleTransformEventHandlers(designMode);
        this._toggleContextMenu(enabledDesignMode);
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
     *
     * @param enable
     * @private
     */
    _toggleLoadingOverlay(enable) {

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
     * Clear mode
     * @private
     */
    _clearMode() {
        // TODO: Possibly remove!!!!!!
        const that = this;
        if (that.stage instanceof $) {
            // Unbind elements
            $.each(
                that.stage.children(DOT + ELEMENT_CLASS),
                (index, stageElement) => {
                    destroy(stageElement);
                }
            );
            that.stage.empty();
        }
    },

    /**
     * Toggle property bindings
     * @param enable
     * @private
     */
    _togglePropertyBindings(enable) {
        const that = this;

        // Unbind property bindings
        if ($.isFunction(that._propertyBinding)) {
            that.unbind(PROPERTYBINDING, that._propertyBinding);
        }

        if (enable) {
            // Bind properties
            that._propertyBinding = $.proxy(function() {
                const widget = this;
                if (widget.properties() instanceof ObservableObject) {
                    $.each(
                        widget.stage.children(DOT + ELEMENT_CLASS),
                        (index, stageElement) => {
                            // kendo.bind does unbind first
                            bind(stageElement, widget.properties());
                        }
                    );
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
    _toggleHandleBox(enable) {
        assert.instanceof(
            $,
            this.wrapper,
            assert.format(
                assert.messages.instanceof.default,
                'this.wrapper',
                'jQuery'
            )
        );
        const that = this;
        const wrapper = that.wrapper;

        // Clear
        if ($.isFunction(that._removeDebugVisualElements)) {
            that._removeDebugVisualElements(wrapper);
        }
        $(document).off(NS);
        wrapper.children(DOT + HANDLE_BOX_CLASS).remove();

        // Setup handles
        if (enable) {
            // Add handles
            $(HANDLE_BOX)
                .css({
                    position: ABSOLUTE,
                    display: NONE
                })
                .append(HANDLE_MOVE)
                .append(HANDLE_RESIZE)
                .append(HANDLE_ROTATE)
                .append(HANDLE_MENU)
                .appendTo(wrapper);

            // Add stage event handlers
            $(document) // was that.wrapper
                .on(MOUSEDOWN, $.proxy(that._onMouseDown, that))
                .on(MOUSEMOVE, $.proxy(that._onMouseMove, that))
                .on(MOUSEUP, $.proxy(that._onMouseUp, that));

            // Add debug visual elements
            if ($.isFunction(that._addDebugVisualElements)) {
                that._addDebugVisualElements(wrapper);
            }
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
        const that = this;
        const stage = that.stage;

        // Clear
        stage.off(NS);

        // Enable event handlers (also in navigation in design mode)
        if (enable) {
            stage
                // .on(ENABLE + NS, DOT + ELEMENT_CLASS, $.proxy(that._enableStageElement, that))
                .on(
                    MOVE + NS,
                    DOT + ELEMENT_CLASS,
                    $.proxy(that._moveStageElement, that)
                )
                .on(
                    RESIZE + NS,
                    DOT + ELEMENT_CLASS,
                    $.proxy(that._resizeStageElement, that)
                )
                .on(
                    ROTATE + NS,
                    DOT + ELEMENT_CLASS,
                    $.proxy(that._rotateStageElement, that)
                );
        }
    },

    /**
     * Event handler called when adding or triggered when enabling an element
     * @param e
     * @param component
     * @param enable
     * @private
     */
    _enableStageElement(e, component, enable) {
        const tools = this.options.tools;
        assert.instanceof(
            ObservableObject,
            tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = tools[component.tool];
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
     * @param e
     * @param component
     * @private
     */
    _moveStageElement(e, component) {
        const tools = this.options.tools;
        assert.instanceof(
            ObservableObject,
            tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = tools[component.tool];
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
     * @param e
     * @param component
     * @private
     */
    _resizeStageElement(e, component) {
        const tools = this.options.tools;
        assert.instanceof(
            ObservableObject,
            tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = tools[component.tool];
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
     * @param e
     * @param component
     * @private
     */
    _rotateStageElement(e, component) {
        const tools = this.options.tools;
        assert.instanceof(
            ObservableObject,
            tools,
            assert.format(
                assert.messages.instanceof.default,
                'this.options.tools',
                'kendo.data.ObservableObject'
            )
        );
        const tool = tools[component.tool];
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
    _toggleContextMenu(enable) {
        const that = this;

        // Clear (noting that kendo.ui.ContextMenu is not available in kidoju-Mobile)
        if (that.menu instanceof ContextMenu) {
            that.menu.destroy();
            that.menu.element.remove();
            that.menu = undefined;
        }

        // Add context menu
        if (enable) {
            // See http://docs.telerik.com/kendo-ui/api/javascript/ui/contextmenu
            that.menu = $('<ul class="kj-stage-menu"></ul>')
                // TODO: Bring forward, Push backward, Edit, etc.....
                .append(
                    `<li ${DATA_COMMAND}="delete">${
                        this.options.messages.contextMenu.delete
                    }</li>`
                )
                .append(
                    `<li ${DATA_COMMAND}="duplicate">${
                        this.options.messages.contextMenu.duplicate
                    }</li>`
                )
                .appendTo(that.wrapper)
                .kendoContextMenu({
                    target: `.kj-handle[${DATA_COMMAND}="menu"]`,
                    showOn: MOUSEDOWN,
                    select: $.proxy(that._contextMenuSelectHandler, that)
                })
                .data('kendoContextMenu');
        }
    },

    /**
     * Event handler for selecting an item in the context menu
     * @param e
     * @private
     */
    _contextMenuSelectHandler(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        assert.instanceof(
            $.Event,
            e.event,
            assert.format(
                assert.messages.instanceof.default,
                'e.event',
                'jQuery.Event'
            )
        );

        // TODO: Consider an event dispatcher so that the same commands can be called from toolbar
        // Check when implementing fonts, colors, etc....
        const that = this;
        let uid;
        let item;
        switch ($(e.item).attr(DATA_COMMAND)) {
            case 'delete':
                uid = that.wrapper
                    .children(DOT + HANDLE_BOX_CLASS)
                    .attr(DATA_UID);
                item = that.dataSource.getByUid(uid);
                that.dataSource.remove(item);
                // This should raise the change event on the dataSource and call the refresh method of the widget
                break;
            case 'duplicate':
                uid = that.wrapper
                    .children(DOT + HANDLE_BOX_CLASS)
                    .attr(DATA_UID);
                item = that.dataSource.getByUid(uid);
                var clone = item.clone();
                clone.top += 10;
                clone.left += 10;
                that.dataSource.add(clone);
                break;
        }

        // Close the menu
        if (that.menu instanceof ContextMenu) {
            that.menu.close();
        }

        // Event is handled, do not propagate
        e.preventDefault();
        // e.stopPropagation();
    },

    /**
     * Add an element onto the stage either on a click or from dataSource
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
        assert.type(
            CONSTANTS.NUMBER,
            component.left,
            assert.format(
                assert.messages.type.default,
                'component.left',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            component.top,
            assert.format(
                assert.messages.type.default,
                'component.top',
                CONSTANTS.NUMBER
            )
        );

        const that = this;
        const stage = that.stage;

        // Cannot add a stage element that already exists on stage
        if (
            stage.children(format(ELEMENT_SELECTOR, component.uid)).length > 0
        ) {
            return;
        }

        // Create stageElement
        const stageElement = $(
            format(ELEMENT, component.uid, component.tool)
        ).css({
            position: ABSOLUTE,
            top: component.get(TOP),
            left: component.get(LEFT),
            height: component.get(HEIGHT),
            width: component.get(WIDTH),
            // transformOrigin: 'center center', // by default
            transform: format(CSS_ROTATE, component.get(ROTATE))
        });

        // Prepare stageElement with component
        that._prepareStageElement(stageElement, component);

        // Check index in the dataSource
        const index = that.dataSource.indexOf(component);

        // Append to the stage at index
        const nextStageElement = stage.children(
            `${DOT + ELEMENT_CLASS}:eq(${index})`
        );
        if (nextStageElement.length) {
            nextStageElement.before(stageElement);
        } else {
            stage.append(stageElement);
        }

        // init stageElement
        that._initStageElement(stageElement, component);
    },

    /**
     * Prepare Stage Element
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
        assert.instanceof(
            $,
            this.stage,
            assert.format(
                assert.messages.instanceof.default,
                'this.stage',
                'jQuery'
            )
        );
        assert.equal(
            component.uid,
            stageElement.attr(attr('uid')),
            'The stageElement data-uid attribute is expected to equal the component uid'
        );

        const tool = this.options.tools[component.tool];
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(assert.messages.instanceof.default, tool, 'BaseTool')
        );
        const mode = this.mode();
        assert.enum(
            Object.values(Stage.fn.modes),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(Stage.fn.modes)
            )
        );
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
        // stageElement.unbind();
        destroy(stageElement);
        stageElement.empty();

        // Append content
        stageElement.append(content);
    },

    /**
     *
     * @param stageElement
     * @private
     */
    _initStageElement(stageElement, component) {
        // In case stageElement is made from kendo UI controls
        kendo.init(stageElement);

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
        this._enableStageElement(
            {
                currentTarget: stageElement,
                preventDefault: $.noop,
                stopPropagation: $.noop
            },
            component,
            this.mode() === this.modes.PLAY
        );
        this._moveStageElement(
            {
                currentTarget: stageElement,
                preventDefault: $.noop,
                stopPropagation: $.noop
            },
            component
        );
        this._resizeStageElement(
            {
                currentTarget: stageElement,
                preventDefault: $.noop,
                stopPropagation: $.noop
            },
            component
        );
        this._rotateStageElement(
            {
                currentTarget: stageElement,
                preventDefault: $.noop,
                stopPropagation: $.noop
            },
            component
        );
    },

    /**
     * Remove an element from the stage
     * @param uid
     * @private
     */
    _removeStageElementByUid(uid) {
        // TODO use a tool method to avoid leaks (remove all event handlers, ...)

        // Find and remove stage element
        const stageElement = this.stage.children(format(ELEMENT_SELECTOR, uid));
        kendo.unbind(stageElement);
        destroy(stageElement);
        stageElement.off(NS).remove();
    },

    /**
     * Show handles on a stage element
     * @method _showHandles
     * @param uid
     * @private
     */
    _showHandles(uid) {
        const that = this;
        const handleBox = that.wrapper.children(DOT + HANDLE_BOX_CLASS);
        if (handleBox.length) {
            // Position handleBox on top of stageElement (same location, same size, same rotation)
            const stageElement = that.stage.children(
                format(ELEMENT_SELECTOR, uid)
            );
            handleBox
                .css({
                    top: stageElement.css(TOP),
                    left: stageElement.css(LEFT),
                    height: stageElement.css(HEIGHT),
                    width: stageElement.css(WIDTH),
                    // transformOrigin: 'center center', // by default
                    transform: stageElement.css(TRANSFORM), // This might return a matrix
                    display: BLOCK
                })
                .attr(DATA_UID, uid); // This is how we know which stageElement to transform when dragging handles

            // Scale and rotate handles
            handleBox.children(DOT + HANDLE_CLASS).css({
                // transformOrigin: 'center center', // by default
                transform: `${format(
                    CSS_ROTATE,
                    -util.getTransformRotation(stageElement)
                )} ${format(CSS_SCALE, 1 / that.scale())}`
            });
        }
    },

    /**
     * Hide handles
     * @method _hideHandles
     * @private
     */
    _hideHandles() {
        this.wrapper
            .children(DOT + HANDLE_BOX_CLASS)
            .css({ display: NONE })
            .removeAttr(DATA_UID);
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
        const activeToolId = tools.get(ACTIVE_TOOL);
        const target = $(e.target);
        const mouse = util.getMousePosition(e, that.stage);
        let stageElement = target.closest(DOT + ELEMENT_CLASS);
        const handle = target.closest(DOT + HANDLE_CLASS);
        let uid;

        // Close any context menu left opened if not selecting a menu item
        if (that.menu instanceof ContextMenu && !target.is('.k-link')) {
            that.menu.close();
        }

        if (activeToolId !== POINTER) {
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
            const scale = util.getTransformScale(that.wrapper);
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

                tools.set(ACTIVE_TOOL, POINTER);
            }

            e.preventDefault(); // otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        } else if (handle.length) {
            // When hitting a handle with the pointer tool
            const command = handle.attr(DATA_COMMAND);
            if (command === COMMANDS.MENU) {
                $.noop(); // TODO: contextual menu here
            } else {
                const handleBox = that.wrapper.children(DOT + HANDLE_BOX_CLASS);
                uid = handleBox.attr(DATA_UID); // the uid of the stageElement which is being selected before hitting the handle
                stageElement = that.stage.children(
                    format(ELEMENT_SELECTOR, uid)
                );
                handleBox.data(STATE, {
                    command,
                    top: parseFloat(stageElement.css(TOP)) || 0, // stageElement.position().top does not work when scaled
                    left: parseFloat(stageElement.css(LEFT)) || 0, // stageElement.position().left does not work when scaled
                    height: stageElement.height(),
                    width: stageElement.width(),
                    angle: util.getTransformRotation(stageElement),
                    scale: util.getTransformScale(that.wrapper),
                    snapGrid: 0, // TODO
                    snapAngle: 0, // TODO
                    mouseX: mouse.x,
                    mouseY: mouse.y,
                    uid
                });

                // log(handleBox.data(STATE));
                $(document.body).css(CURSOR, target.css(CURSOR));
            }
            e.preventDefault(); // otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        } else if (stageElement.length || target.is(DOT + HANDLE_BOX_CLASS)) {
            // When hitting a stage element or the handle box with the pointer tool
            uid = stageElement.attr(DATA_UID);
            if (util.isGuid(uid)) {
                const component = that.dataSource.getByUid(uid);
                if (component instanceof PageComponent) {
                    that.value(component);
                }
            }
        } else if (that.wrapper.find(target).length) {
            // When hitting anything else in the wrapper with the pointer tool
            that.value(CONSTANTS.NULL);
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
        const handleBox = that.wrapper.children(DOT + HANDLE_BOX_CLASS);
        const startState = handleBox.data(STATE);

        // With a startState, we are dragging a handle
        if ($.isPlainObject(startState)) {
            const mouse = util.getMousePosition(e, that.stage);
            const stageElement = that.stage.children(
                format(ELEMENT_SELECTOR, startState.uid)
            );
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

            if (startState.command === COMMANDS.MOVE) {
                item.set(
                    LEFT,
                    util.snap(
                        startState.left +
                            (mouse.x - startState.mouseX) / startState.scale,
                        that._snapGrid
                    )
                );
                item.set(
                    TOP,
                    util.snap(
                        startState.top +
                            (mouse.y - startState.mouseY) / startState.scale,
                        that._snapGrid
                    )
                );
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            } else if (startState.command === COMMANDS.RESIZE) {
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
                const alpha = util.deg2rad(startState.angle);
                const mmprime = util.getRotatedPoint(topLeft, center, alpha); // Also M=M'
                const topLeftAfterMove = util.getRotatedPoint(
                    mmprime,
                    centerAfterMove,
                    -alpha
                ); // Also T'

                // TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                item.set(LEFT, Math.round(topLeftAfterMove.x));
                item.set(TOP, Math.round(topLeftAfterMove.y));
                item.set(
                    HEIGHT,
                    util.snap(
                        startState.height -
                            dx * Math.sin(alpha) +
                            dy * Math.cos(alpha),
                        that._snapGrid
                    )
                );
                item.set(
                    WIDTH,
                    util.snap(
                        startState.width +
                            dx * Math.cos(alpha) +
                            dy * Math.sin(alpha),
                        that._snapGrid
                    )
                );
                // Set triggers the change event on the dataSource which calls the refresh method to update the stage
            } else if (startState.command === COMMANDS.ROTATE) {
                const rad = util.getRadiansBetween2Points(
                    center,
                    {
                        x: startState.mouseX,
                        y: startState.mouseY
                    },
                    mouse
                );
                const deg = util.snap(
                    (360 + startState.angle + util.rad2deg(rad)) % 360,
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
            kendo.ui.Stage,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kendo.ui.Stage'
            )
        );
        const that = this;
        const handleBox = that.wrapper.children(DOT + HANDLE_BOX_CLASS);
        const startState = handleBox.data(STATE);

        if ($.isPlainObject(startState)) {
            // Remove drag start state
            handleBox.removeData(STATE);

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
     * Refresh
     * @param e
     */
    refresh(e) {
        const that = this;
        if (e === undefined || e.action === undefined) {
            const overlay = $(LOADING_OVERLAY).appendTo(this.wrapper);
            let components = [];
            if (
                e === undefined &&
                that.dataSource instanceof PageComponentDataSource
            ) {
                components = that.dataSource.data();
            } else if (e && e.items instanceof ObservableArray) {
                components = e.items;
            }
            that._hideHandles();
            that.trigger(CONSTANTS.DATABINDING);

            // Remove all elements from the stage
            $.each(
                that.stage.children(DOT + ELEMENT_CLASS),
                (index, stageElement) => {
                    that._removeStageElementByUid(
                        $(stageElement).attr(DATA_UID)
                    );
                }
            );

            // Make sure there is nothing left (all elements must do their own cleaning)
            assert.equal(
                0,
                that.element.children().length,
                assert.format(
                    assert.messages.equal.default,
                    'that.element.children()',
                    '0'
                )
            );

            // Add all elements to the stage
            $.each(components, (index, component) => {
                that._addStageElement(component);
            });

            overlay.remove();

            // If the following line triggers `Uncaught TypeError: Cannot read property 'length' of null` in the console
            // This is probably because binding on properties has not been properly set - check html
            // as in <input type="text" style="width: 300px; height: 100px; font-size: 75px;" data-bind="value: ">
            that.trigger(CONSTANTS.DATABOUND);

            // We can only bind properties after all dataBound event handlers have executed
            // otherwise there is a mix of binding sources
            that.trigger(PROPERTYBINDING); // This calls an event handler in _initializePlayMode
            that.trigger(PROPERTYBOUND);
        } else if (e.action === 'add') {
            $.each(e.items, (index, component) => {
                that._addStageElement(component);
                that.value(component);
            });
        } else if (e.action === 'remove') {
            $.each(e.items, (index, component) => {
                that._removeStageElementByUid(component.uid);
                that.trigger(CONSTANTS.CHANGE, {
                    action: e.action,
                    value: component
                });
                if (
                    that.wrapper
                        .children(DOT + HANDLE_BOX_CLASS)
                        .attr(DATA_UID) === component.uid
                ) {
                    that.value(CONSTANTS.NULL);
                }
            });
        } else if (
            e.action === 'itemchange' &&
            Array.isArray(e.items) &&
            e.items.length &&
            e.items[0] instanceof PageComponent
        ) {
            $.each(e.items, (index, component) => {
                const stageElement = that.stage.children(
                    format(ELEMENT_SELECTOR, component.uid)
                );
                const handleBox = that.wrapper.children(
                    format(HANDLE_BOX_SELECTOR, component.uid)
                );
                if (stageElement.length) {
                    switch (e.field) {
                        case LEFT:
                            if (
                                Math.round(stageElement.position().left) !==
                                Math.round(component.left)
                            ) {
                                stageElement.css(LEFT, component.left);
                                handleBox.css(LEFT, component.left);
                                stageElement.trigger(MOVE + NS, component);
                            }
                            break;
                        case TOP:
                            if (
                                Math.round(stageElement.position().top) !==
                                Math.round(component.top)
                            ) {
                                stageElement.css(TOP, component.top);
                                handleBox.css(TOP, component.top);
                                stageElement.trigger(MOVE + NS, component);
                            }
                            break;
                        case HEIGHT:
                            if (
                                Math.round(stageElement.height()) !==
                                Math.round(component.height)
                            ) {
                                stageElement.css(HEIGHT, component.height);
                                handleBox.css(HEIGHT, component.height);
                                stageElement.trigger(RESIZE + NS, component);
                            }
                            break;
                        case WIDTH:
                            if (
                                Math.round(stageElement.width()) !==
                                Math.round(component.width)
                            ) {
                                stageElement.css(WIDTH, component.width);
                                handleBox.css(WIDTH, component.width);
                                stageElement.trigger(RESIZE + NS, component);
                            }
                            break;
                        case ROTATE:
                            if (
                                Math.round(
                                    util.getTransformRotation(stageElement)
                                ) !== Math.round(component.rotate)
                            ) {
                                stageElement.css(
                                    TRANSFORM,
                                    format(CSS_ROTATE, component.rotate)
                                );
                                handleBox.css(
                                    TRANSFORM,
                                    format(CSS_ROTATE, component.rotate)
                                );
                                handleBox
                                    .children(DOT + HANDLE_CLASS)
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
     * Toggle the selection
     * @returns {h|*}
     */
    _toggleSelection() {
        assert.instanceof(
            kendo.ui.Stage,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kendo.ui.Stage'
            )
        );
        const that = this;
        const uid = that._selectedUid;
        const handleBox = that.wrapper.children(DOT + HANDLE_BOX_CLASS);
        // if (that.mode() === that.modes.DESIGN) {
        if (handleBox.length) {
            const stageElement = that.stage.children(
                format(ELEMENT_SELECTOR, uid)
            );
            if (
                util.isGuid(uid) &&
                stageElement.length &&
                handleBox.attr(DATA_UID) !== uid
            ) {
                that._showHandles(uid);
                // select(null) should clear the selection
            } else if (
                uid === CONSTANTS.NULL &&
                uid === CONSTANTS.NULL &&
                handleBox.css(DISPLAY) !== NONE
            ) {
                that._hideHandles();
            }
        }
    },

    /**
     * Stage Elements
     * @method items
     * @returns {*}
     */
    items() {
        // Do not return .kj-connector-surface
        const element = this.element;
        if ($.isFunction(element[0].getElementsByClassName)) {
            // To return an HTMLCollection when possible
            return element[0].getElementsByClassName(ELEMENT_CLASS);
        }
        // Otherwise fallback to a simple array
        return $.makeArray(this.element.children(DOT + ELEMENT_CLASS));
    },

    /**
     * Clears the DOM from modifications made by the widget
     * @private
     */
    _clear() {
        const that = this;
        // clear mode
        that._clearMode();
        // unbind kendo
        kendo.unbind(that.element);
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
        that.setDataSource(CONSTANTS.NULL);
        that._clear();
        destroy(that.element);
    }
});

plugin(Stage);

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

if (window.app && window.app.DEBUG) {
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
                display: NONE
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
                display: NONE
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
                display: NONE
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
            options.wrapper.children(DOT + DEBUG_CENTER_CLASS).css({
                display: 'block',
                left: Math.round(options.center.x / options.scale),
                top: Math.round(options.center.y / options.scale)
            });

            // Display bounding rectangle
            options.wrapper.children(DOT + DEBUG_BOUNDS_CLASS).css({
                display: 'block',
                left: Math.round(options.bounds.left / options.scale),
                top: Math.round(options.bounds.top / options.scale),
                height: Math.round(options.bounds.height / options.scale),
                width: Math.round(options.bounds.width / options.scale)
            });

            // Display mouse calculated position
            options.wrapper.children(DOT + DEBUG_MOUSE_CLASS).css({
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
            wrapper.children(DOT + DEBUG_CENTER_CLASS).css({ display: NONE });
            wrapper.children(DOT + DEBUG_BOUNDS_CLASS).css({ display: NONE });
            wrapper.children(DOT + DEBUG_MOUSE_CLASS).css({ display: NONE });
        }
    };

    /**
     * Remove debug visual elements
     * @param wrapper
     */
    Stage.fn._removeDebugVisualElements = function(wrapper) {
        if (window.app && window.app.DEBUG) {
            wrapper.children(DOT + DEBUG_CENTER_CLASS).remove();
            wrapper.children(DOT + DEBUG_BOUNDS_CLASS).remove();
            wrapper.children(DOT + DEBUG_MOUSE_CLASS).remove();
        }
    };
}
