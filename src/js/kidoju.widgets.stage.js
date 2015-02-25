/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function (window, $, undefined) {

    'use strict';

    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        kidoju = window.kidoju,

        //Types
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        NS = '.kendoStage',
        MOUSEDOWN = 'mousedown',
        MOUSEMOVE = 'mousemove',
        MOUSEUP = 'mouseup',//TODO: mouseout
        TOUCHSTART = 'touchstart',
        TOUCHMOVE = 'touchmove',
        TOUCHEND = 'touchend',
        CHANGE = 'change',
        DATABINDING = 'dataBinding',
        DATABOUND = 'dataBound',
        PROPBINDING = 'propertyBinding',
        PROPBOUND = 'propertyBound',
        SELECT = 'select',
        MOVE = 'move',
        RESIZE = 'resize',
        ROTATE = 'rotate', //This constant is not simply an event

        //CSS
        ABSOLUTE = 'absolute',
        RELATIVE = 'relative',
        HIDDEN = 'hidden',
        DISPLAY = 'display',
        BLOCK = 'block',
        NONE = 'none',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        CURSOR = 'cursor',
        TRANSFORM = 'transform',
        CSS_ROTATE = 'rotate({0}deg)',
        CSS_SCALE = 'scale({0})',

        //Elements
        WRAPPER = '<div class="k-widget kj-stage" />',
        //WRAPPER_CLASS = '.kj-stage',
        ELEMENT = '<div data-id="{0}" data-tool="{1}" class="kj-element"></div>',
        ELEMENT_SELECTOR = '.kj-element[data-id="{0}"]',
        ELEMENT_CLASS = '.kj-element',
        THUMBNAIL_OVERLAY = '<div class="kj-overlay"></div>',
        THUMBNAIL_OVERLAY_CLASS = '.kj-overlay',
        HANDLE_BOX = '<div class="kj-handle-box"></div>',
        HANDLE_BOX_SELECTOR = '.kj-handle-box[data-id="{0}"]',
        HANDLE_BOX_CLASS = '.kj-handle-box',
        HANDLE_MOVE = '<span class="kj-handle" data-command="move"></span>',
        HANDLE_RESIZE = '<span class="kj-handle" data-command="resize"></span>',
        HANDLE_ROTATE = '<span class="kj-handle" data-command="rotate"></span>',
        HANDLE_MENU = '<span class="kj-handle" data-command="menu"></span>',
        //HANDLE_SELECTOR = '.kj-handle[data-command="{0}"]',
        HANDLE_CLASS = '.kj-handle',
        DATA_ID = 'data-id',
        //DATA_TOOL = 'data-tool',
        DATA_COMMAND = 'data-command',
        STATE = 'state',
        COMMANDS = {
            MOVE: 'move',
            RESIZE: 'resize',
            ROTATE: 'rotate',
            MENU: 'menu'
        },

        //Logic
        POINTER = 'pointer',
        ACTIVE_TOOL = 'active',
        DEFAULTS = {
            MODE: 'thumbnail',
            SCALE: 1,
            WIDTH: 1024,
            HEIGHT: 768
        },

        //Debug
        DEBUG = true,
        DEBUG_MOUSE = '<div class="debug-mouse"></div>',
        DEBUG_MOUSE_CLASS = '.debug-mouse',
        DEBUG_BOUNDS = '<div class="debug-bounds"></div>',
        DEBUG_BOUNDS_CLASS = '.debug-bounds',
        DEBUG_CENTER = '<div class="debug-center"></div>',
        DEBUG_CENTER_CLASS = '.debug-center',
        MODULE = 'kidoju.widgets.stage: ';


    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * @class Stage Widget (kendoStage)
     */
    var Stage = Widget.extend({

        /**
         * Initializes the widget
         * @param element
         * @param options
         */
        init: function (element, options) {

            /*
             var that = this,
             input = $(element);
             input.type = NUMBER;
             that.ns = ns;
             options = $.extend({}, {
             value: parseFloat(input.attr('value') || RATING_MIN),
             min: parseFloat(input.attr('min') || RATING_MIN),
             max: parseFloat(input.attr('max') || RATING_MAX),
             step: parseFloat(input.attr('step') || RATING_STEP),
             disabled: input.prop('disabled'),
             readonly: input.prop('readonly')
             }, options);
             Widget.fn.init.call(that, element, options);
             that._layout();
             that.refresh();
             kendo.notify(that);
            */

            var that = this;
            Widget.fn.init.call(that, element, options);
            util.log('widget initialized');
            that.setOptions(options);
            that._layout();
            that._dataSource();
        },

        /**
         * Widget modes
         */
        modes: {
            thumbnail: 'thumbnail',
            design: 'design',
            play: 'play'
        },

        /**
         * Widget events
         */
        events: [
            CHANGE,
            DATABINDING,
            DATABOUND,
            PROPBINDING,
            PROPBOUND,
            SELECT
        ],

        /**
         * Widget options
         */
        options: {
            name: 'Stage',
            autoBind: true,
            mode: DEFAULTS.MODE,
            scale: DEFAULTS.SCALE,
            height: DEFAULTS.HEIGHT,
            width: DEFAULTS.WIDTH,
            tools: kidoju.tools,
            dataSource: undefined
        },

        /**
         * @method setOptions
         * @param options
         */
        setOptions: function(options) {
            Widget.fn.setOptions.call(this, options);
            //TODO: we need to read scale, height and width both from styles and options and decide which wins
            this._mode = this.options.mode;
            this._scale = this.options.scale;
            this._height = this.options.height;
            this._width = this.options.width;
        },

        /**
         * Mode defines the operating mode of the Stage Widget
         * @param value
         * @return {*}
         */
        mode: function (value) {
            var that = this;
            if (value !== undefined) {
                if($.type(value) !== STRING) {
                    throw new TypeError();
                }
                if (!that.modes[value]) {
                    throw new RangeError();
                }
                if(value !== that._mode) {
                    that._mode = value;
                    that._initializeMode();
                    //TODO: trigger event?
                }
            }
            else {
                return that._mode;
            }
        },

        /**
         * Scale the widget
         * @param value
         * @return {*}
         */
        scale: function (value) {
            var that = this;
            if (value !== undefined) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if(value !== that._scale) { //TODO: that.options.scale
                    that._scale = value;
                    that.wrapper.css({
                        transformOrigin: '0 0',
                        transform: kendo.format(CSS_SCALE, that._scale)
                    });
                    that.wrapper.find(HANDLE_CLASS).css({
                        //transformOrigin: 'center center', //by default
                        transform: kendo.format(CSS_SCALE, 1/that._scale)
                    });
                }
            }
            else {
                return that._scale;
            }
        },

        /**
         * Height of stage
         * @param value
         * @returns {string}
         */
        height:  function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if (value !== that.options.height) {
                    that.options.height = value;
                }
            }
            else {
                return that.options.height;
            }
        },

        /**
         * Width of stage
         * @param value
         * @returns {string}
         */
        width:  function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if(value !== that.options.width) {
                    that.options.width = value;
                }
            }
            else {
                return that.options.width;
            }
        },

        /**
         * Properties
         * @param value
         * @returns {*}
         */
        properties:  function (value) {
            var that = this;
            if (value) {
                //if(!(value instanceof kendo.data.ObervableObject)) {
                //    throw new TypeError();
                //}
                if(value !== that._properties) {
                    that._properties = value;
                }
            }
            else {
                return that._properties;
            }
        },

        /**
         * Changes the dataSource
         * @method setDataSource
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
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
        _dataSource: function() {
            var that = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource

            //There is no reason why, in its current state, it would not work with any dataSource
            //if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
            if ( that.dataSource instanceof kidoju.PageComponentCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageComponentCollectionDataSource.create(that.options.dataSource);

                that._refreshHandler = $.proxy(that.refresh, that);

                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            }
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;

            that._clear();

            //Set that.stage from the div element that makes the widget
            that.stage = that.element
                .wrap(WRAPPER)
                .css({
                    position: RELATIVE,  //!important
                    overflow: HIDDEN,
                    height: that.height(),
                    width: that.width()
                });

            //We need that.wrapper for visible/invisible bindings
            that.wrapper = that.stage.parent()
                .css({
                    position: RELATIVE,  //!important
                    height: that.height(),
                    width: that.width(),
                    transformOrigin: '0 0', //'top left', //!important without such attribute, element top left calculations are wrong
                    transform: kendo.format(CSS_SCALE, that.scale())
                });

            //Initialize mode
            that._initializeMode();
        },

        /**
         * Initialize mode
         * @private
         */
        _initializeMode: function() {

            var that = this;

            //Clear mode
            that._clearMode();

            //Set mode
            switch(that.mode()) {
                case that.modes.thumbnail:
                    that._initializeThumbnailMode(); //default mode
                    break;
                case that.modes.design:
                    that._initializeDesignMode();
                    break;
                case that.modes.play:
                    that._initializePlayMode();
                    break;

            }
        },

        /**
         * Clear mode
         * @private
         */
        _clearMode: function() {
            var that = this;

            //Clear events
            that.wrapper.off(NS);
            that.stage.off(NS);

            //Clear DOM
            that.wrapper.find(HANDLE_BOX_CLASS).remove();
            that.wrapper.find(THUMBNAIL_OVERLAY_CLASS).remove();

            //Unbind
            if($.isFunction(that._propertyBinding)) {
                that.unbind(PROPBINDING, that._propertyBinding);
            }
            $.each(that.stage.find(ELEMENT_CLASS), function(index, stageElement) {
                kendo.unbind(stageElement);
            });
        },

        /**
         * Add delegated event handlers on stage elements
         * @private
         */
        _addElementEventHandlers: function() {

            var that = this;

            //Translation
            that.stage.on(MOVE + NS, ELEMENT_CLASS, function(e, item) {
                if (that.options.tools instanceof kendo.data.ObservableObject) {
                    var tool = that.options.tools[item.tool];
                    if (tool instanceof kidoju.Tool && $.isFunction(tool.onMove)) {
                        tool.onMove(e, item);
                    }
                }
            });

            //Resizing
            that.stage.on(RESIZE + NS, ELEMENT_CLASS, function(e, item) {
                if (that.options.tools instanceof kendo.data.ObservableObject) {
                    var tool = that.options.tools[item.tool];
                    if (tool instanceof kidoju.Tool && $.isFunction(tool.onResize)) {
                        tool.onResize(e, item);
                    }
                }
            });

            //Rotation
            that.stage.on(ROTATE + NS, ELEMENT_CLASS, function(e, item) {
                if (that.options.tools instanceof kendo.data.ObservableObject) {
                    var tool = that.options.tools[item.tool];
                    if (tool instanceof kidoju.Tool && $.isFunction(tool.onRotate)) {
                        tool.onRotate(e, item);
                    }
                }
            });
        },

        /**
         * Initialize thumbnail mode
         * @private
         */
        _initializeThumbnailMode: function() {

            var that = this;

            //Add overlay to disable all controls
            $(THUMBNAIL_OVERLAY)
                .css({
                    position: ABSOLUTE,
                    display: BLOCK,
                    top: 0,
                    left: 0,
                    height: that.height(),
                    width: that.width()
                    //backgroundColor: '#FF0000',
                    //opacity: 0.1
                })
                .appendTo(that.wrapper);

            //Add delegated element event handlers
            that._addElementEventHandlers();

        },

        /**
         * Initialize design mode
         * @private
         */
        _initializeDesignMode: function() {

            var that = this;

            //Add handles
            $(HANDLE_BOX)
                .css({
                    position: ABSOLUTE,
                    display: NONE
                })
                .append(HANDLE_MOVE)
                .append(HANDLE_RESIZE)
                .append(HANDLE_ROTATE)
                .append(HANDLE_MENU)
                .appendTo(that.wrapper);

            //Add stage event handlers
            that.wrapper.on(MOUSEDOWN + NS + ' ' + TOUCHSTART + NS, $.proxy(that._onMouseDown, that));
            that.wrapper.on(MOUSEMOVE + NS + ' ' + TOUCHMOVE + NS, $.proxy(that._onMouseMove, that));
            that.wrapper.on(MOUSEUP + NS + ' ' + TOUCHEND + NS, $.proxy(that._onMouseUp, that));

            //Add delegated element event handlers
            that._addElementEventHandlers();

            //Add debug visual elements
            util.addDebugVisualElements(that.wrapper);

            //Add context menu - See http://docs.telerik.com/kendo-ui/api/javascript/ui/contextmenu
            that.menu = $('<ul class="kj-stage-menu"></ul>')
                .append('<li data-command="lock">Lock</li>') //TODO Use constants + localize in messages
                .append('<li data-command="delete">Delete</li>')//TODO: Bring forward, Push backward, Edit, etc.....
                .appendTo(that.wrapper)
                .kendoContextMenu({
                    target: '.kj-handle[data-command="menu"]',
                    showOn: MOUSEDOWN + ' ' + TOUCHSTART,
                    select: $.proxy(that._contextMenuSelectHandler, that)
                })
                .data('kendoContextMenu');

            $.noop();
        },

        /**
         * Event handler for selecting an item in the context menu
         * @param e
         * @private
         */
        _contextMenuSelectHandler: function(e) {
            //TODO: Consider an event dispatcher so that the same commands can be called from toolbar
            //Check when implementing fonts, colors, etc....
            var that = this;
            switch($(e.item).attr(DATA_COMMAND)) {
                case 'lock':
                    break;
                case 'delete':
                    var id = that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID),
                        item = that.dataSource.get(id);
                    that.dataSource.remove(item);
                    //This should raise teh change event on the dataSource and call the refresh method of the widget
                    break;
            }
        },

        /**
         * Initialize assess mode
         * @private
         */
        _initializePlayMode: function() {

            var that = this;

            //Add delegated element event handlers
            that._addElementEventHandlers();

            //Bind properties
            if($.isFunction(that._propertyBinding)) {
                that.unbind(PROPBINDING, that._propertyBinding);
            }
            that._propertyBinding = $.proxy(function() {
                var widget = this;
                if (widget.properties() instanceof kendo.data.ObservableObject) {
                    $.each(widget.stage.find(ELEMENT_CLASS), function(index, stageElement) {
                        //kendo.unbind(stageElement); //kendo.bind does unbind
                        kendo.bind(stageElement, widget.properties());
                    });
                }
            }, that);
            that.bind(PROPBINDING, that._propertyBinding);

        },

        /**
         * Add an element to the stage either on a click or from persistence
         * @param item
         * @param mouseX
         * @param mouseY
         * @private
         */
        _addStageElement: function(item, mouseX, mouseY) {
            var that = this;

            //Check we have an item which is not already on stage
            if (item instanceof kidoju.PageComponent && that.stage.find(kendo.format(ELEMENT_SELECTOR, item.id)).length === 0) {

                //When adding a new item on the stage, position it at mouse click coordinates
                if ($.type(mouseX) === NUMBER && $.type(mouseY) === NUMBER) {
                    item.set(LEFT, mouseX);
                    item.set(TOP, mouseY);
                }

                var tool = that.options.tools[item.tool];
                if (tool instanceof kidoju.Tool) {

                    var stageElement = $(kendo.format(ELEMENT, item.id, item.tool))
                        .css({
                            position: ABSOLUTE,
                            top: item.get(TOP),
                            left: item.get(LEFT),
                            height: item.get(HEIGHT),
                            width: item.get(WIDTH),
                            //transformOrigin: 'center center', //by default
                            transform: kendo.format(CSS_ROTATE, item.get(ROTATE))
                        });

                    stageElement.append(tool.getHtml(item));
                    that.stage.append(stageElement);

                    //trigger events to transform the stageElement (most often resize)
                    stageElement.trigger(MOVE + NS, item);
                    stageElement.trigger(RESIZE + NS, item);
                    stageElement.trigger(ROTATE + NS, item);
                }
            }

        },

        /**
         * Remove an element from the stage
         * @param id
         * @private
         */
        _removeStageElement: function(id) {

            //TODO use a tool method to avoid leaks (remove all event handlers, ...)

            //Find and remove stage element
            var stageElement = this.stage.find(kendo.format(ELEMENT_SELECTOR, id));
            kendo.unbind(stageElement);
            stageElement.off(NS).remove();
        },

        /**
         * Show handles on a stage element
         * @method _showHandles
         * @param id
         * @private
         */
        _showHandles: function(id){
            var that = this,
                handleBox = that.wrapper.find(HANDLE_BOX_CLASS);
            if (handleBox.length) {

                //Position handleBox on top of stageElement (same location, same size, same rotation)
                var stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, id));
                handleBox
                    .css({
                        top: stageElement.css(TOP),
                        left: stageElement.css(LEFT),
                        height: stageElement.css(HEIGHT),
                        width: stageElement.css(WIDTH),
                        //transformOrigin: 'center center', //by default
                        transform: stageElement.css(TRANSFORM), //This might return a matrix
                        display: BLOCK
                    })
                    .attr(DATA_ID, id); //This is how we know which stageElement to transform when dragging handles

                //Scale and rotate handles
                handleBox.find(HANDLE_CLASS)
                    .css({
                        //transformOrigin: 'center center', //by default
                        transform: kendo.format(CSS_ROTATE, -util.getTransformRotation(stageElement)) + ' ' + kendo.format(CSS_SCALE, 1/that.scale())
                    });
            }
        },

        /**
         * Hide handles
         * @method _hideHandles
         * @private
         */
        _hideHandles: function(){
            this.wrapper.find(HANDLE_BOX_CLASS)
                .css({display: NONE})
                .removeAttr(DATA_ID);
        },

        /**
         * Start dragging an element
         * @param e
         * @private
         */
        // This function's cyclomatic complexity is too high.
        /* jshint -W074 */
        _onMouseDown: function(e) {

            //TODO: also drag with keyboard arrows

            var that = this,
                activeId = that.options.tools.get(ACTIVE_TOOL),
                target = $(e.target),
                mouse = util.getMousePosition(e),
                stageElement = target.closest(ELEMENT_CLASS),
                handle = target.closest(HANDLE_CLASS);

            //When clicking the stage with an active tool
            if (activeId !== POINTER) {
                //TODO: show optional creation dialog and test OK/Cancel
                var tool = that.options.tools[activeId];
                if(tool instanceof kidoju.Tool) {
                    var item = new kidoju.PageComponent({
                        id: kendo.guid(),
                        tool: tool.id,
                        //e.offsetX and e.offsetY do not work in Firefox
                        left: mouse.x,
                        top: mouse.y,
                        width: tool.width,
                        height: tool.height
                        //rotate: tool.rotate?
                    });
                    that.dataSource.add(item);
                    //Add triggers the change event on the dataSource which calls the refresh method
                }
                that.options.tools.set(ACTIVE_TOOL, POINTER);

            //When hitting a handle with the pointer tool
            } else if (handle.length) {
                var command = handle.attr(DATA_COMMAND);
                if (command === COMMANDS.MENU) {
                    $.noop(); //TODO: contextual menu here
                } else {
                    var handleBox = that.wrapper.find(HANDLE_BOX_CLASS),
                        id = handleBox.attr(DATA_ID); //the id of the stageElement which is being selected before hitting the handle
                    stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, id));
                    handleBox.data(STATE, {
                        command: command,
                        top: parseFloat(stageElement.css(TOP)) || 0, //stageElement.position().top does not work when scaled
                        left: parseFloat(stageElement.css(LEFT)) || 0, //stageElement.position().left does not work when scaled
                        height: stageElement.height(),
                        width: stageElement.width(),
                        angle: util.getTransformRotation(stageElement),
                        scale: util.getTransformScale(that.wrapper),
                        snapGrid: 0, //TODO
                        snapAngle: 0, //TODO
                        mouseX: mouse.x,
                        mouseY: mouse.y,
                        id: id
                    });

                    //log(handleBox.data(STATE));
                    $(document.body).css(CURSOR, target.css(CURSOR));
                }

            //When hitting a stage element or the handle box with the pointer tool
            } else if (stageElement.length || target.is(HANDLE_BOX_CLASS)) {
                that.select(stageElement.attr(DATA_ID));

            //When hitting anything else with the pointer tool
            } else {
                that.select(null);
            }

            e.preventDefault(); //otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        },
        /* jshint +W074 */

        /**
         * While dragging an element on stage
         * @param e
         * @private
         */
        _onMouseMove: function(e) {

            var that = this,
                handleBox = that.wrapper.find(HANDLE_BOX_CLASS),
                startState = handleBox.data(STATE);

            //With a startState, we are dragging a handle
            if ($.isPlainObject(startState)) {

                var mouse = util.getMousePosition(e),
                    stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, startState.id)),
                    item = that.options.dataSource.get(startState.id),
                    rect = stageElement[0].getBoundingClientRect(),
                    bounds = {
                        //TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                        left: rect.left - that.stage.offset().left + $(document.body).scrollLeft(),
                        top: rect.top - that.stage.offset().top + $(document.body).scrollTop(),
                        height: rect.height,
                        width: rect.width
                    },
                    center = {
                        x: bounds.left + bounds.width / 2,
                        y: bounds.top + bounds.height / 2
                    };

                util.updateDebugVisualElements({
                    wrapper: that.wrapper,
                    mouse: mouse,
                    center: center,
                    bounds: bounds,
                    scale: startState.scale
                });

                if (startState.command === COMMANDS.MOVE) {
                    item.set(LEFT, util.snap(startState.left + (mouse.x - startState.mouseX)/startState.scale, startState.snapGrid));
                    item.set(TOP, util.snap(startState.top + (mouse.y - startState.mouseY)/startState.scale, startState.snapGrid));
                    //Set triggers the change event on the dataSource which calls the refresh method to update the stage

                } else if (startState.command === COMMANDS.RESIZE) {
                    //See https://github.com/Memba/Kidoju-Widgets/blob/master/test/samples/move-resize-rotate.md
                    var dx = (mouse.x - startState.mouseX)/startState.scale, //horizontal distance from S to S'
                        dy = (mouse.y - startState.mouseY)/startState.scale, //vertical distance from S to S'
                        centerAfterMove = { //Also C'
                            x: center.x + dx/ 2,
                            y: center.y + dy/ 2
                        },
                        topLeft = { //Also T
                            x: startState.left,
                            y: startState.top
                        },
                        alpha = util.deg2rad(startState.angle),
                        mmprime = util.getRotatedPoint(topLeft, center, alpha), //Also M=M'
                        topLeftAfterMove = util.getRotatedPoint(mmprime, centerAfterMove, -alpha); //Also T'

                    //TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                    item.set(LEFT, topLeftAfterMove.x);
                    item.set(TOP, topLeftAfterMove.y);
                    item.set(HEIGHT, util.snap(startState.height - dx * Math.sin(alpha) + dy * Math.cos(alpha), startState.snapGrid));
                    item.set(WIDTH, util.snap(startState.width + dx * Math.cos(alpha) + dy * Math.sin(alpha), startState.snapGrid));
                    //Set triggers the change event on the dataSource which calls the refresh method to update the stage

                } else if (startState.command === COMMANDS.ROTATE) {
                    var rad = util.getRadiansBetween2Points(center, {x: startState.mouseX, y: startState.mouseY}, mouse),
                        deg = util.snap((360 + startState.angle + util.rad2deg(rad)) % 360, startState.snapAngle);
                    item.set(ROTATE, deg);
                    //Set triggers the change event on the dataSource which calls the refresh method to update the stage
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
        _onMouseUp: function(e) {

            var that = this,
                handleBox = that.wrapper.find(HANDLE_BOX_CLASS),
                startState = handleBox.data(STATE);

            if ($.isPlainObject(startState)) {

                //Remove drag start state
                handleBox.removeData(STATE);

                //Reset cursor
                $(document.body).css(CURSOR, '');

                //Hide debug visual elements
                util.hideDebugVisualElements(that.wrapper);

            }
        },

        /**
         * Refresh a stage widget
         * @param e
         */
        // This function's cyclomatic complexity is too high.
        /* jshint -W074 */
        refresh: function(e) {
            var that = this;
            if (e === undefined || e.action === undefined) {
                var components = [];
                if (e=== undefined && that.dataSource instanceof kendo.data.PageComponentCollectionDataSource) {
                    components = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    components = e.items;
                }
                that._hideHandles();
                that.trigger(DATABINDING);
                $.each(that.stage.find(ELEMENT_CLASS), function(index, stageElement) {
                    that._removeStageElement($(stageElement).attr(DATA_ID));
                });
                $.each(components, function(index, component) {
                    that._addStageElement(component);
                });
                that.trigger(DATABOUND);

                // We can only bind properties after all dataBound event handlers have executed
                // otherwise there is a mix of binding sources
                that.trigger(PROPBINDING); //This calls an event handler in _initializePlayMode
                that.trigger(PROPBOUND);

            } else if (e.action === 'add') {
                $.each(e.items, function(index, component) {
                    that._addStageElement(component);
                    that.trigger(CHANGE, {action: e.action, value: component});
                    that.select(component.id);
                });

            } else if (e.action === 'remove') {
                $.each(e.items, function(index, component) {
                    that._removeStageElement(component.id);
                    that.trigger(CHANGE, {action: e.action, value: component});
                    if (that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID) === component.id) {
                        that.select(null);
                    }
                });

            } else if (e.action === 'itemchange') {
                $.each(e.items, function(index, component) {
                    var stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, component.id)),
                        handleBox = that.wrapper.find(kendo.format(HANDLE_BOX_SELECTOR, component.id));
                    if (stageElement.length) {
                        switch (e.field) {
                            case LEFT:
                                stageElement.css(LEFT, component.left);
                                handleBox.css(LEFT, component.left);
                                stageElement.trigger(MOVE + NS, component);
                                break;
                            case TOP:
                                stageElement.css(TOP, component.top);
                                handleBox.css(TOP, component.top);
                                stageElement.trigger(MOVE + NS, component);
                                break;
                            case HEIGHT:
                                stageElement.css(HEIGHT, component.height);
                                handleBox.css(HEIGHT, component.height);
                                stageElement.trigger(RESIZE + NS, component);
                                break;
                            case WIDTH:
                                stageElement.css(WIDTH, component.width);
                                handleBox.css(WIDTH, component.width);
                                stageElement.trigger(RESIZE + NS, component);
                                break;
                            case ROTATE:
                                stageElement.css(TRANSFORM, kendo.format(CSS_ROTATE, component.rotate));
                                handleBox.css(TRANSFORM, kendo.format(CSS_ROTATE, component.rotate));
                                handleBox.find(HANDLE_CLASS).css(TRANSFORM, kendo.format(CSS_ROTATE, -component.rotate) + ' ' + kendo.format(CSS_SCALE, 1/that.scale()));
                                stageElement.trigger(ROTATE + NS, component);
                                break;
                            //TODO attributes
                            //TODO properties
                        }
                    }
                });
            }
        },
        /* jshint +W074 */

        /**
         * Select a stage element
         * @param id
         * @returns {h|*}
         */
        select: function (id) {
            var that = this;
            if (that.mode() === that.modes.design) {

                //select() should return the id of the selected stage element / page item
                if (id === undefined) {
                    return that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID);

                //select(id) should select the corresponding stage element unless it is already selected
                } else if ($.type(id) === STRING && that.stage.find(kendo.format(ELEMENT_SELECTOR, id)).length && that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID) !== id) {
                    that._showHandles(id);
                    that.trigger(SELECT, {value: that.options.dataSource.get(id)});

                //select(null) should clear the selection
                } else if (id === null && that.wrapper.find(HANDLE_BOX_CLASS).css(DISPLAY) !== NONE) {
                    that._hideHandles();
                    that.trigger(SELECT, {value: null});
                }
            }
        },

        /**
         * Stage Elements
         * @method items
         * @returns {XMLList|*}
         */
        items: function() {
            return this.stage.children();
        },

        /**
         * Clears the DOM from modifications made by the widget
         * @private
         */
        _clear: function() {
            var that = this;
            //TODO: remove wrapper!!
            //unbind kendo
            kendo.unbind(that.element);
            //unbind all other events
            that.element.find('*').off();
            that.element
                .off()
                .empty();
                //.removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget
         */
        destroy: function () {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Stage);

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    /**
     * Utility functions
     */
    var util = {

        /**
         * Log a message
         * @param message
         */
        log: function(message) {
            if (DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log(MODULE + message);
            }
        },

        /**
         * Convert radians to degrees
         * @param deg
         * @returns {number}
         */
        deg2rad: function(deg) {
            return deg*Math.PI/180;
        },

        /**
         * Convert degrees to radians
         * @param rad
         * @returns {number}
         */
        rad2deg: function(rad) {
            return rad*180/Math.PI;
        },

        /**
         * Snapping consists in rounding the value to the closest multiple of snapValue
         * @param value
         * @param snapValue
         * @returns {*}
         */
        snap: function (value, snapValue) {
            if (snapValue) {
                return value % snapValue < snapValue / 2 ? value - value % snapValue : value + snapValue - value % snapValue;
            } else {
                return value;
            }
        },

        /**
         * Get the rotation angle (in degrees) of an element's CSS transformation
         * @param element
         * @returns {Number|number}
         */
        getTransformRotation: function(element) {
            //$(element).css('transform') returns a matrix, so we have to read the style attribute
            var match = ($(element).attr('style') || '').match(/rotate\([\s]*([0-9\.]+)[deg\s]*\)/);
            return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 0 : 0;
        },

        /**
         * Get the scale of an element's CSS transformation
         * @param element
         * @returns {Number|number}
         */
        getTransformScale: function(element) {
            //$(element).css('transform') returns a matrix, so we have to read the style attribute
            var match = ($(element).attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
            return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
        },

        /**
         * Get the mouse (or touch) position
         * @param e
         * @returns {{x: *, y: *}}
         */
        getMousePosition: function(e) {
            //See http://www.jacklmoore.com/notes/mouse-position/
            //See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
            //See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
            //ATTENTION: e.originalEvent.touches instanceof TouchList, not Array
            var clientX = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0].clientX : e.clientX,
                clientY = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0].clientY : e.clientY,
                //IMPORTANT: Pos is relative to the stage and e.offsetX / e.offsetY does not work in Firefox
                stage = $(e.currentTarget).find(kendo.roleSelector('stage')),
                mouse = {
                    x: clientX - stage.offset().left + $(document.body).scrollLeft(), //TODO: any other scrolled parent to consider????????
                    y: clientY - stage.offset().top + $(document.body).scrollTop()
                };
            return mouse;
        },

        /**
         * Rotate a point by an angle around a center
         * @param point
         * @param center
         * @param radians
         * @returns {*}
         */
        getRotatedPoint: function(point, center, radians) {
            if ($.isPlainObject(point) && $.type(point.x) === 'number' && $.type(point.y) === 'number' &&
                $.isPlainObject(center) && $.type(center.x) === 'number' && $.type(center.y) === 'number' &&
                $.type(radians) === 'number') {
                return {
                    //See http://stackoverflow.com/questions/786472/rotate-a-point-by-another-point-in-2d
                    //See http://www.felixeve.co.uk/how-to-rotate-a-point-around-an-origin-with-javascript/
                    x: center.x + (point.x - center.x) * Math.cos(radians) - (point.y - center.y) * Math.sin(radians),
                    y: center.y + (point.x - center.x) * Math.sin(radians) + (point.y - center.y) * Math.cos(radians)
                };
            } else {
                return undefined;
            }
        },

        /**
         * Calculate the angle between two points rotated around a center
         * @param center
         * @param p1
         * @param p2
         * @returns {*}
         */
        getRadiansBetween2Points: function(center, p1, p2) {
            if ($.isPlainObject(center) && $.type(center.x) === 'number' && $.type(center.y) === 'number' &&
                $.isPlainObject(p1) && $.type(p1.x) === 'number' && $.type(p1.y) === 'number' &&
                $.isPlainObject(p2) && $.type(p2.x) === 'number' && $.type(p2.y) === 'number') {
                //See http://www.euclideanspace.com/maths/algebra/vectors/angleBetween/
                //See http://stackoverflow.com/questions/7586063/how-to-calculate-the-angle-between-a-line-and-the-horizontal-axis
                //See http://code.tutsplus.com/tutorials/euclidean-vectors-in-flash--active-8192
                //See http://gamedev.stackexchange.com/questions/69649/using-atan2-to-calculate-angle-between-two-vectors
                return Math.atan2(p2.y - center.y, p2.x - center.x) - Math.atan2(p1.y - center.y, p1.x - center.x);
            } else {
                return undefined;
            }
        },

        /**
         * Add debug visual eleemnts
         * @param wrapper
         */
        addDebugVisualElements: function(wrapper) {
            if(DEBUG) {

                //Add bounding rectangle
                $(DEBUG_BOUNDS)
                    .css({
                        position: ABSOLUTE,
                        border: '1px dashed #FF00FF',
                        display: NONE
                    })
                    .appendTo(wrapper);

                //Add center of rotation
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

                //Add calculated mouse position
                $(DEBUG_MOUSE)
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
            }
        },

        /**
         * Update debug visual elements
         * @param options
         */
        updateDebugVisualElements: function(options) {
            if(DEBUG && $.isPlainObject(options) && options.scale > 0) {

                //Display center of rotation
                options.wrapper.find(DEBUG_CENTER_CLASS).css({
                    display: 'block',
                    left: options.center.x / options.scale,
                    top: options.center.y / options.scale
                });

                //Display bounding rectangle
                options.wrapper.find(DEBUG_BOUNDS_CLASS).css({
                    display: 'block',
                    left: options.bounds.left / options.scale,
                    top: options.bounds.top / options.scale,
                    height: options.bounds.height / options.scale,
                    width: options.bounds.width / options.scale
                });

                //Display mouse calculated position
                options.wrapper.find(DEBUG_MOUSE_CLASS).css({
                    display: 'block',
                    left: options.mouse.x / options.scale,
                    top: options.mouse.y / options.scale
                });
            }
        },

        /**
         * Hide debug visual elements
         * @param wrapper
         */
        hideDebugVisualElements: function(wrapper) {
            if (DEBUG) {
                wrapper.find(DEBUG_CENTER_CLASS).css({display: NONE});
                wrapper.find(DEBUG_BOUNDS_CLASS).css({display: NONE});
                wrapper.find(DEBUG_MOUSE_CLASS).css({display: NONE});
            }
        }

    };

}(this, jQuery));
