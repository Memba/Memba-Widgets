/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO test and review calculations with rotated draggables and dropzones - https://github.com/kidoju/Kidoju-Widgets/issues/147
// TODO consider adding layout modes - https://github.com/kidoju/Kidoju-Widgets/issues/173

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    getMousePosition,
    getTransformScale,
    snap
} from '../common/window.position.es6';

const {
    attr,
    Class,
    data: { DataSource, ObservableObject },
    destroy,
    format,
    ns,
    roleSelector,
    unbind,
    ui,
    ui: { DataBoundWidget, plugin }
} = window.kendo;
const logger = new Logger('widgets.dropzone');
const NS = '.kendoDropZone';
const WIDGET_CLASS = 'kj-dropzone'; // 'k-widget kj-dropzone';

const MOUSEDOWN = `mousedown${NS} ` + `touchstart${NS}`;
const MOUSEMOVE = `mousemove${NS} ` + `touchmove${NS}`;
const MOUSELEAVE = `mouseleave${NS} ` + `touchleave${NS}`;
const MOUSEUP = `mouseup${NS} ` + `touchend${NS}`;
const ROLE_SELECTOR = 'dropzone';
const DATA_TYPE = 'draggable';

const ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
const CONSTANT = 'constant';

/** *******************************************************************************
 * DropZoneEvents
 ******************************************************************************** */

/**
 * DropZoneEvents
 */
const DropZoneEvents = Class.extend({
    /**
     * Constructor
     * @param options
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
            options.draggable,
            assert.format(
                assert.messages.type.default,
                'options.draggable',
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
        this._draggable = options.draggable;
        this._scaler = options.scaler;
    },

    /**
     * Enable/disable events
     * @param enable
     */
    enable(enable) {
        enable = $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // We need an object so that data is passed by reference between handlers
        const data = {};

        $(document).off(NS);

        if (enable) {
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
        }
    },

    /**
     * Check that all drop zones in same container as stageElement are enabled
     * @param stageElement
     */
    enabled(stageElement) {
        const container =
            stageElement instanceof $
                ? stageElement.closest(this._container)
                : $(document.body);
        const dropZones = container.find(roleSelector(ROLE_SELECTOR));
        container.find(this._draggable).css('cursor', '');
        for (let i = 0, length = dropZones.length; i < length; i++) {
            const dropZone = $(dropZones[i]);
            const dropZoneWidget = dropZone.data('kendoDropZone');
            if (dropZoneWidget instanceof DropZone && dropZoneWidget._enabled) {
                container.find(this._draggable).css('cursor', 'move');
                return true;
            }
        }
        return false;
    },

    /**
     * Get surface point from mouse event
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
        // var point = new geometry.Point(mouse.x / scale, mouse.y / scale);
        const point = { x: mouse.x / scale, y: mouse.y / scale };
        return point;
    },

    /**
     * Get a stage element
     * @param e
     * @private
     */
    _getStageElement(target) {
        const stageElement = $(target).closest(this._draggable);
        if (this.enabled(stageElement)) {
            return stageElement;
        }
    },

    /**
     * mousedown event handler
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
        const stageElement = this._getStageElement(e.target);
        if (stageElement instanceof $ && stageElement.length) {
            e.preventDefault(); // prevent text selection;
            // IMPORTANT: Do not assign e.data directly otherwise the reference
            // to the data object will be lost across events
            e.data.initial = {
                // stageElement.position() does not work when scaled
                top: parseFloat(stageElement.css('top')) || 0,
                left: parseFloat(stageElement.css('left')) || 0
            };
            e.data.mousedown = this._getStagePoint(e);
            e.data.stageElement = stageElement;
            e.data.type = DATA_TYPE;
            // Note: we do not handle rotation
        }
    },

    /**
     * mousemove event handler
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
            e.data.stageElement instanceof $
        ) {
            e.preventDefault();
            const stageElement = e.data.stageElement;
            const container = stageElement.closest(this._container);
            const initial = e.data.initial;
            const mousedown = e.data.mousedown;
            const mouse = this._getStagePoint(e);
            let left = snap(initial.left + mouse.x - mousedown.x, 0);
            let top = snap(initial.top + mouse.y - mousedown.y, 0);
            // Keep dragging within container
            left = Math.round(
                Math.max(
                    0,
                    Math.min(left, container.width() - stageElement.width())
                )
            );
            top = Math.round(
                Math.max(
                    0,
                    Math.min(top, container.height() - stageElement.height())
                )
            );
            e.data.position = { left, top };
            // Update position
            window.requestAnimationFrame(() => {
                // e.data is undefined in this scope
                stageElement.css({ left, top });
            });
        }
    },

    /**
     * mouseleave and mouseup event handler
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
            $.isPlainObject(e.data.position) &&
            e.data.stageElement instanceof $
        ) {
            this._onMouseMove(e);
            this._setDataItem(e.data.stageElement, e.data.position);
            // IMPORTANT: Do not assign e.data directly otherwise the reference
            // to the data object will be lost across events
            e.data.initial = undefined;
            e.data.mousedown = undefined;
            e.data.position = undefined;
            e.data.stageElement = undefined;
            e.data.type = undefined;
        }
    },

    /**
     * Store dragged position
     * @param stageElement
     * @param position
     * @private
     */
    _setDataItem(stageElement, position) {
        assert.instanceof(
            $,
            stageElement,
            assert.format(
                assert.messages.instanceof.default,
                'element',
                'jQuery'
            )
        );
        assert.hasLength(
            stageElement,
            assert.format(assert.messages.hasLength.default, 'stageElement')
        );
        assert.isPlainObject(
            position,
            assert.format(assert.messages.isPlainObject.default, 'position')
        );
        assert.type(
            CONSTANTS.NUMBER,
            position.left,
            assert.format(
                assert.messages.type.default,
                'position.left',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            position.top,
            assert.format(
                assert.messages.type.default,
                'position.top',
                CONSTANTS.NUMBER
            )
        );
        const id = stageElement
            .children(`[${attr(CONSTANTS.ID)}]`)
            .attr(attr(CONSTANTS.ID));
        assert.type(
            CONSTANTS.STRING,
            id,
            assert.format(assert.messages.type.default, 'id', CONSTANTS.STRING)
        );
        const container = stageElement.closest(this._container);
        assert.instanceof(
            $,
            container,
            assert.format(
                assert.messages.instanceof.default,
                'this.container',
                'jQuery'
            )
        );
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, 'this.container')
        );
        container.find(roleSelector(ROLE_SELECTOR)).each((index, dropZone) => {
            const dropZoneWidget = $(dropZone).data('kendoDropZone');
            if (
                dropZoneWidget instanceof DropZone &&
                dropZoneWidget.dataSource instanceof DataSource
            ) {
                const dataSource = dropZoneWidget.dataSource;
                const dataItem = dataSource.get(id);
                // Center hits if option is set
                if (
                    dropZoneWidget.options.center &&
                    dropZoneWidget._checkHit(stageElement)
                ) {
                    const dropZoneParent = dropZoneWidget.element.parent();
                    assert.ok(
                        dropZoneParent.hasClass('kj-element'),
                        '`dropZoneParent` should be a satge element'
                    );
                    position = {
                        left: Math.round(
                            parseInt(dropZoneParent.css('left'), 10) +
                                (dropZoneParent.width() -
                                    stageElement.width()) /
                                    2
                        ),
                        top: Math.round(
                            parseInt(dropZoneParent.css('top'), 10) +
                                (dropZoneParent.height() -
                                    stageElement.height()) /
                                    2
                        )
                    };
                }
                if ($.type(dataItem) === CONSTANTS.UNDEFINED) {
                    dataSource.add({
                        type: DATA_TYPE,
                        id,
                        data: {
                            left: position.left,
                            top: position.top
                        }
                    });
                } else if (dataItem instanceof ObservableObject) {
                    assert.equal(
                        DATA_TYPE,
                        dataItem.type,
                        assert.format(
                            assert.messages.type.default,
                            'dataItem.type',
                            DATA_TYPE
                        )
                    );
                    // Despite iterating over all drop zones, these if conditions ensure we only store once
                    if (dataItem.data.left !== position.left) {
                        dataItem.data.left = position.left;
                    }
                    if (dataItem.data.top !== position.top) {
                        dataItem.data.top = position.top;
                    }
                    dataSource.trigger(CONSTANTS.CHANGE);
                }
                // Ensure we update value on all drop zones
                dropZoneWidget.trigger(CONSTANTS.CHANGE);
            }
        });
    }
});

/**
 * Singleton to share DropZoneEvents
 * @param options
 * @returns {DropZoneEvents}
 */
DropZoneEvents.getSingleton = function(options) {
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
        options.draggable,
        assert.format(
            assert.messages.type.default,
            'options.draggable',
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
    if (!DropZoneEvents._instance) {
        DropZoneEvents._instance = new DropZoneEvents(options);
    }
    // Note: all dropzones on the same page should have the same options.container and options.scaler
    assert.equal(
        options.container,
        DropZoneEvents._instance._container,
        assert.format(
            assert.messages.equal.default,
            'SelectorEvents._instance._container',
            'options.container'
        )
    );
    assert.equal(
        options.draggable,
        DropZoneEvents._instance._draggable,
        assert.format(
            assert.messages.equal.default,
            'SelectorEvents._instance._draggable',
            'options.draggable'
        )
    );
    assert.equal(
        options.scaler,
        DropZoneEvents._instance._scaler,
        assert.format(
            assert.messages.equal.default,
            'SelectorEvents._instance._scaler',
            'options.scaler'
        )
    );
    return DropZoneEvents._instance;
};

/** *******************************************************************************
 * DropZone Widget
 ******************************************************************************** */

/**
 * DropZone
 * @class DropZone Widget (kendoDropZone)
 */
var DropZone = DataBoundWidget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        options = options || {};
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this._dataSource();
        this.enable(this.options.enable);
        // kendo.notify(this);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'DropZone',
        autoBind: true,
        dataSource: [],
        value: [],
        scaler: 'div.kj-stage', // that.wrapper in widgets.stage
        container: `div.kj-stage>div[data-${ns}role="stage"]`, // that.stage in widgets.stage
        draggable: `div.kj-element:has([data-${ns}behavior="draggable"])`, // a stage element containing a draggable
        center: false,
        empty: '', // to force a value when empty
        enable: true
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value for MVVM binding (cannot be set)
     */
    value(value) {
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            const that = this;
            let ret;
            const container = that.element.closest(that.options.container);
            assert.instanceof(
                $,
                container,
                assert.format(
                    assert.messages.instanceof.default,
                    'container',
                    'jQuery'
                )
            );
            assert.hasLength(
                container,
                assert.format(assert.messages.hasLength.default, 'container')
            );
            // We check the dataSource for draggables which have been moved
            that.dataSource.view().forEach(dataItem => {
                if (
                    dataItem &&
                    dataItem.type === DATA_TYPE &&
                    $.type(dataItem.id) === CONSTANTS.STRING
                ) {
                    ret = ret || [];
                    // Find the corresponding draggable and stageElement, considering it might be on another page this not found
                    const draggable = container
                        .find(that.options.draggable)
                        .children(
                            format(
                                ATTRIBUTE_SELECTOR,
                                attr(CONSTANTS.ID),
                                dataItem.id
                            )
                        );
                    if (draggable.length > 0) {
                        const stageElement = draggable.parent();
                        // Check whether it hits the drop zone
                        if (that._checkHit(stageElement)) {
                            ret.push(draggable.attr(attr(CONSTANT)));
                        }
                    }
                }
            });
            // Without hit, check and set the empty option
            if (ret.length === 0 && that.options.empty) {
                ret.push(that.options.empty);
            }
            return ret;
        }
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
        const stageWidget = this.element
            .closest(this.options.container)
            .data('kendoStage');
        this._dataBoundHandler = this._resetEvents.bind(this);
        if (ui.Stage && stageWidget instanceof ui.Stage) {
            // One of the difficulties with this Kendo UI widget, is the fact that it needs to sit below draggables for draggables to move above it
            // This means it is instantiated before draggable elements, so we need to bind drop zones to the stage CONSTANTS.DATABOUND event
            stageWidget.bind(CONSTANTS.DATABOUND, this._dataBoundHandler);
        } else if (window.app && window.app.DEBUG) {
            // This is essentially for running/testing without a stage widget
            setTimeout(this._dataBoundHandler, 100);
        }
    },

    /**
     * Init events
     * @param e
     * @private
     */
    _resetEvents() {
        const events = DropZoneEvents.getSingleton(this.options);
        events.enable(events.enabled());
    },

    /**
     * Enable/disable the widget
     * Initialize mouse events
     * @param enable
     * @private
     */
    enable(enable) {
        enable = $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        if (this._enabled !== enable) {
            this._enabled = enable;
            this._resetEvents();
        }
    },

    /**
     * _dataSource function to bind refresh to the change event
     * @private
     */
    _dataSource() {
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

            // trigger a read on the dataSource if one hasn't happened yet
            if (this.options.autoBind) {
                // Filter dataSource on data type
                // TODO See connector - here replaces fetch
                this.dataSource.filter({
                    field: 'type',
                    operator: 'eq',
                    value: DATA_TYPE
                });
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
     * Checks whether a stage element hits this drop zone
     * @param stageElement
     * @returns {boolean}
     * @private
     */
    _checkHit(stageElement) {
        // Note: this does not account for rotated elements and drop zones
        const element = stageElement[0].getBoundingClientRect();
        const dropzone = this.element[0].getBoundingClientRect();
        const center = {
            top: element.top + element.height / 2,
            left: element.left + element.width / 2
        };
        // Check the center is within the drop zone
        return (
            center.left >= dropzone.left &&
            center.left <= dropzone.left + dropzone.width &&
            center.top >= dropzone.top &&
            center.top <= dropzone.top + dropzone.height
        );
    },

    /**
     * Check initial positions of draggables and add corresponding data items when they `hit` this drop zone
     * Note: if a draggable is initially positioned within a drop zone, it might not be part of its value since there is no corresponding data item in the data source
     * @private
     */
    _initDraggables: $.noop,

    /**
     * Refresh
     */
    refresh(e) {
        const that = this;
        // We need setTimeout otherwise options.center does not execute properly
        // requestAnimationFrame(function () {
        setTimeout(() => {
            const container = that.element.closest(that.options.container);
            let dataItems = that.dataSource.view(); // dataSource is filtered
            if ($.isPlainObject(e) && Array.isArray(e.items)) {
                dataItems = e.items;
            }
            $.each(dataItems, (index, dataItem) => {
                if (
                    dataItem &&
                    dataItem.type === DATA_TYPE &&
                    $.type(dataItem.id) === CONSTANTS.STRING
                ) {
                    const draggable = container
                        .find(that.options.draggable)
                        .children(
                            format(
                                ATTRIBUTE_SELECTOR,
                                attr(CONSTANTS.ID),
                                dataItem.id
                            )
                        );
                    // the draggable corresponding to this dataItem might be on another page when the dataSource is share across pages
                    if (draggable.length > 0) {
                        draggable.parent().css({
                            left: dataItem.data.left,
                            top: dataItem.data.top
                        });
                    }
                }
            });
        }, 100);
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // Unbind
        this.setDataSource(null);
        unbind(this.element);
        const stageWidget = this.element
            .closest(this.options.container)
            .data('kendoStage');
        if (
            $.isFunction(this._dataBoundHandler) &&
            ui.Stage &&
            stageWidget instanceof ui.Stage
        ) {
            stageWidget.unbind(CONSTANTS.DATABOUND, this._dataBoundHandler);
            this._dataBoundHandler = undefined;
        }
        // Unref
        this.enable(false);
        // Destroy
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
        // remove element classes
        // element.removeClass(WIDGET_CLASS);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(DropZone);
