/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        ns = '.kendoStage',
        kidoju = global.kidoju,

        //Types
        FUNCTION = 'function',
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        DRAGSTART = 'dragstart',
        DRAG = 'drag',
        DRAGEND = 'dragend',
        CLICK = 'click' + ns,
        TRANSLATE = 'translate' + ns,
        RESIZE = 'resize' + ns,
        ROTATE = 'rotate' + ns,

        //Size
        ABSOLUTE = 'absolute',
        RELATIVE = 'relative',
        HIDDEN = 'hidden',
        BLOCK = 'block',
        NONE = 'none',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        PX = 'px',
        CSS_ROTATE = 'rotate({0}deg)',
        CSS_SCALE = 'scale({0})',
        DEFAULT_SCALE = 1,
        DEFAULT_WIDTH = 1024,
        DEFAULT_HEIGHT = 768,

        //Elements
        POINTER = 'pointer',
        WRAPPER = '<div class="k-widget kj-stage" />',
        ELEMENT = '<div data-id="{0}" data-tool="{1}" class="kj-element"></div>',
        ELEMENT_SELECTOR = '.kj-element[data-id="{0}"]',
        ELEMENT_CLASS = '.kj-element',
        DATA_ID = 'data-id',
        DATA_TOOL = 'data-tool',
        HANDLE_BOX = '<div class="kj-handle-box"></div>',
        HANDLE_BOX_SELECTOR = '.kj-handle-box',
        HANDLE_SELECTOR = '.kj-handle',
        HANDLE_TRANSLATE = '<span class="kj-handle kj-translate-handle" draggable="true"></span>',
        HANDLE_TRANSLATE_SELECTOR = '.kj-translate-handle',
        HANDLE_RESIZE = '<span class="kj-handle kj-resize-handle" draggable="true"></span>',
        HANDLE_RESIZE_SELECTOR = '.kj-resize-handle',
        HANDLE_ROTATE = '<span class="kj-handle kj-rotate-handle" draggable="true"></span>',
        HANDLE_ROTATE_SELECTOR = '.kj-rotate-handle',
        HANDLE_MENU = '<span class="kj-handle kj-menu-handle"></span>',
        HANDLE_MENU_SELECTOR = '.kj-menu-handle',

        DEBUG = true,
        MODULE = 'kidoju.widgets.stage: ';


    /*******************************************************************************************
     * Stage widget
     *
     * Drag and drop is extensively explained at:
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * http://www.html5laboratory.com/drag-and-drop.php
     * http://stackoverflow.com/questions/11529788/html-5-drag-events
     * http://stackoverflow.com/questions/5500615/internet-explorer-9-drag-and-drop-dnd
     * http://nettutsplus.s3.amazonaws.com/64_html5dragdrop/demo/index.html
     * http://github.com/guillaumebort/jquery-ndd
     *******************************************************************************************/

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
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
            that.setOptions(options);
            that._layout();
            that._dataSource();
        },

        modes: {
            thumbnail: 'thumbnail',
            design: 'design',
            solution: 'solution',
            //Play modes
            learn: 'learn', //in learn mode, you can flip the stage and see the solution
            assess: 'assess' //in test mode, you cannot see the solution
            //We could also consider a test mode with hints
            //and a correction mode displaying correct vs. incorrect answers
        },

        /**
         * Widget options
         */
        options: {
            name: "Stage",
            autoBind: true,
            mode: 'thumbnail',
            scale: DEFAULT_SCALE,
            height: DEFAULT_HEIGHT,
            width: DEFAULT_WIDTH,
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
                //TODO: test range
                if(value !== that._mode) {
                    that._mode = value;
                    that.refresh();
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
                if(value !== that._scale) {
                    that._scale = value;
                    that.wrapper
                        .css({ transformOrigin: '0px 0px' })//TODO: review
                        .css({ transform: kendo.format(CSS_SCALE, that._scale) });
                    that.wrapper.find(HANDLE_SELECTOR)
                        .css({ transform: kendo.format(CSS_SCALE, 1/that._scale) });
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
            if ( that.dataSource instanceof kidoju.PageItemCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageItemCollectionDataSource.create(that.options.dataSource);

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

            //Set that.stage
            that.stage = that.element
                .wrap(WRAPPER)
                .css({
                    position: RELATIVE,  //!important
                    overflow: HIDDEN,
                    height: that.height(),
                    width: that.width()
                });

            //We need that.wrapper for visible/invisible bindings
            //that.wrapper also contains that.stage and that.handles (for translating, resizing and rotating)
            that.wrapper = that.stage.parent().css({
                position: RELATIVE,  //!important
                height: that.height(),
                width: that.width(),
                //transformOrigin ?????????
                transform: kendo.format(CSS_SCALE, that._scale) //options and scale()????
            });

            //that.wrapper contains that.element (the stage) and that.handles (the bounding box with handles)

            //Click handler to select or create stage elements from page items in design mode
            if(that.mode() === that.modes.design) {
                that.stage.on(CLICK, $.proxy(that._onStageClick, that));
            }
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
            if (item instanceof kidoju.PageItem) {

                //When adding a new item on the stage, position it at mouse click coordinates
                if ($.type(mouseX) === NUMBER) {
                    item.set(LEFT, mouseX);
                }
                if ($.type(mouseY) === NUMBER) {
                    item.set(TOP, mouseY);
                }

                var tool = that.options.tools[item.tool];
                if (tool instanceof kidoju.Tool) {

                    var stageElement = $(kendo.format(ELEMENT, item.id, item.tool))
                        .css({ //http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
                            position: ABSOLUTE,
                            top: item.get(TOP),
                            left: item.get(LEFT),
                            height: item.get(HEIGHT),
                            width: item.get(WIDTH),
                            transform: kendo.format(CSS_ROTATE, item.rotate)
                        });

                    //TODO: This actually depends on MODE ??????????????????????????
                    stageElement.on(CLICK, $.proxy(that._onStageElementClick, that));

                    /*
                    if($.type(tool.onClick === FUNCTION)) {
                        stageElement.on(CLICK, $.proxy(tool.onClick, item));
                    }
                    if($.type(tool.onTranslate === FUNCTION)) {
                        stageElement.on(TRANSLATE, $.proxy(tool.onTranslate, item));
                    }
                    */
                    if($.type(tool.onResize === FUNCTION)) {
                        stageElement.on(RESIZE, $.proxy(tool.onResize, item));
                    }
                    /*
                    if($.type(tool.onRotate === FUNCTION)) {
                        stageElement.on(ROTATE, $.proxy(tool.onRotate, item));
                    }
                    */

                    stageElement.append(tool.getHtml(item));
                    that.stage.append(stageElement);

                    stageElement.trigger(RESIZE, { height: item.height, width: item.width }); //TODO: should not we send item???


                    //TODO Add event namespace TRANSLATE + NS
                    //Events could be added on the stage itself
                    stageElement
                        .on(TRANSLATE, function (e, position) {
                            var stageElement = $(e.currentTarget),
                                stage = stageElement.closest(kendo.roleSelector('stage')),
                                widget = stage.data('kendoStage'),
                                id = stageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(TOP, position.top);
                            item.set(LEFT, position.left);
                        })
                        .on(RESIZE, function(e, size) {
                            var stageElement = $(e.currentTarget),
                                stage = stageElement.closest(kendo.roleSelector('stage')),
                                widget = stage.data('kendoStage'),
                                id = stageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(HEIGHT, size.height);
                            item.set(WIDTH, size.width);
                        })
                        .on(ROTATE, function(e, rotate) {
                            var stageElement = $(e.currentTarget),
                                stage = stageElement.closest(kendo.roleSelector('stage')),
                                widget = stage.data('kendoStage'),
                                id = stageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(ROTATE, rotate);
                        });

                    //TODO: add behaviours here!!!
                }
            }
        },

        /**
         * Remove an element from the stage
         * @private
         */
        _removeStageElement: function(id) {
            var that = this;
            //TODO hide handles where necessary
            //TODO use a tool method to avoid leaks (remove all event handlers, ...)
            that.stage.find(kendo.format(ELEMENT_SELECTOR, id))
                .off()//TODO namespace .off(that.ns)
                .remove();
        },

        /**
         * Handler triggered when clicking the stage (but not an element)
         * @param e
         * @private
         */
        _onStageClick: function(e) {

            var that = this,
                id = that.options.tools.get('active'),
                tool = that.options.tools[id];

            if (id !== POINTER) {

                //TODO: show optional creation dialog and test OK/Cancel

                var item = new kidoju.PageItem({
                    id: kendo.guid(),
                    tool: id,
                    left: e.offsetX, //originalEvent? offest()?
                    top: e.offsetY,
                    width: tool.width,
                    height: tool.height
                    //rotate: tool.rotate?
                });

                that.dataSource.add(item);
                that.options.tools.set('active', POINTER);

            } else {

                that._hideHandles();

            }
        },

        /**
         * Handler trigger when clicking a stage element
         * @method onClick
         * @param e
         */
        _onStageElementClick: function(e) {

            var that = this,
                stageElement = $(e.currentTarget);

            if (that instanceof kendo.ui.Stage && stageElement.is(ELEMENT_CLASS)) {

                var elementId = stageElement.attr(DATA_ID),
                    toolId = stageElement.attr(DATA_TOOL),
                    tool = kidoju.tools[toolId];

                if ($.type(elementId) === STRING && tool instanceof kidoju.Tool && that.mode() === that.modes.design) {
                    $.proxy(that._ensureHandles, that)();
                    $.proxy(that._showHandles, that)(elementId);
                }
            }

            //prevent click event from bubbling to the stage
            e.preventDefault();
            e.stopPropagation();
        },


        /**
         * Ensure handles within wrapper
         * @method _ensureHandles
         * @param stage
         * @private
         */
        _ensureHandles: function() {

            var that = this;
            if(that.wrapper.find(HANDLE_BOX_SELECTOR).length === 0) {

                //Create handles
                var handleBox = $(HANDLE_BOX)
                    .css({
                        position: ABSOLUTE,
                        display: NONE
                    })
                    .append(HANDLE_TRANSLATE)
                    .append(HANDLE_RESIZE)
                    .append(HANDLE_ROTATE)
                    .append(HANDLE_MENU);

                //Scale handles
                handleBox.find(HANDLE_SELECTOR)
                    .css({ transform: kendo.format(CSS_SCALE, 1/that._scale) });

                //Add handle box to wrapper
                that.wrapper.append(handleBox);

                //Clean before (re)creating new event handlers
                that.wrapper.off();

                //Add dragstart event handler
                that.wrapper.on(DRAGSTART, function(e) {

                    var handle = $(e.target),
                        handleBox = handle.parent(),
                        stage = that.stage;

                    if (handle.is('.kj-handle')) {
                        handleBox.data('drag', {
                            top: parseFloat(handleBox.css('top')) || 0, //box.position().top does not work when scaled
                            left: parseFloat(handleBox.css('left')) || 0, //box.position().left does not work when scaled
                            height: handleBox.height(),
                            width: handleBox.width(),
                            angle: 0, //util.getElementRotation(),
                            scale: util.getElementScale(stage),
                            clientX: e.originalEvent.clientX,
                            clientY: e.originalEvent.clientY,
                            id: handleBox.attr(DATA_ID)
                        });
                    }
                });

                //Add drag event handler
                that.wrapper.on(DRAG, function(e) {
                    var handle = $(e.target),
                        handleBox = handle.parent(),
                        startState = handleBox.data('drag'),
                        stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, startState.id));

                    if (handle.is('.kj-translate-handle')) {

                        if (e.originalEvent.clientX && e.originalEvent.clientY) {
                            var translation = {
                                top: startState.top + (e.originalEvent.clientY - startState.clientY)/startState.scale,
                                left: startState.left + (e.originalEvent.clientX - startState.clientX)/startState.scale
                            };
                            handleBox.css(translation);
                            stageElement.css(translation);
                        }

                    } else if (handle.is('.kj-resize-handle')) {

                        if (e.originalEvent.clientX && e.originalEvent.clientY) {
                            var Y = (e.originalEvent.clientY - startState.clientY) / startState.scale,
                                X = (e.originalEvent.clientX - startState.clientX) / startState.scale,
                                resizing = {
                                    //transformOrigin: 'top left',
                                    height: startState.height - X * Math.sin(startState.angle) + Y * Math.cos(startState.angle),
                                    width: startState.width + X * Math.cos(startState.angle) + Y * Math.sin(startState.angle)
                                };
                            handleBox.css(resizing);
                            stageElement.css(resizing);
                            stageElement.trigger(RESIZE, resizing);
                        }


                    } else if (handle.is('.kj-rotate-handle')) {

                        if (e.originalEvent.clientX && e.originalEvent.clientY) {
                            var cx = that.stage.offset().left + parseFloat(handleBox.css('left')) || 0 /*box.position().left*/ + handleBox.width() / 2,
                                cy = that.stage.offset().top + parseFloat(handleBox.css('top')) || 0 /*box.position().top*/ + handleBox.height() / 2,
                                deg = (Math.atan2(e.originalEvent.clientY - cy, e.originalEvent.clientX - cx) - Math.atan2(startState.clientY - cy, startState.clientX - cx)) * 180 / Math.PI,
                            //  deg = (360 + Math.atan2(o.offsetY - cy, o.offsetX - cx)*180/Math.PI) % 360,
                                rotation = {
                                    //transformOrigin: 'center center', //by default
                                    transform: 'rotate(' + deg + 'deg)'
                                };
                            handleBox.css(rotation);
                            handleBox.find(HANDLE_SELECTOR).css({
                                //transformOrigin: 'center center', //by default
                                transform: 'rotate(-' + deg + 'deg)'
                            });
                            stageElement.css(rotation);
                            stageElement.trigger(RESIZE, rotation);
                        }
                    }

                    e.stopPropagation();

                });

                //Add dragend event handler
                that.wrapper.on(DRAGEND, function(e) {

                    //TODO set final position here????

                    //Simply remove data
                    var handleBox = $(e.target).parent();
                    handleBox.removeData('drag');

                    e.stopPropagation();

                });

                //Add click event handler on menu handle
                //TODO
            }

        },

        /**
         * Show handler on a stage element
         * @method _showHandler
         * @param id
         * @private
         */
        _showHandles: function(id){

            var that = this,
                stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, id)),
                handleBox = that.wrapper.find(HANDLE_BOX_SELECTOR);

            if (handleBox.length) {
                handleBox
                    .css({
                        top: stageElement.css(TOP),
                        left: stageElement.css(LEFT),
                        height: stageElement.css(HEIGHT),
                        width: stageElement.css(WIDTH),
                        //transform: TODO
                        display: BLOCK
                    })
                    .attr(DATA_ID, id);
            }
        },

        /**
         * Test handles for a stage element/item
         * @method _hasHandles
         * @param id
         * @returns {boolean}
         * @private
         */
        _hasHandles: function(id) {
            return this.wrapper.find(HANDLE_BOX_SELECTOR).attr(DATA_ID) === id;
        },

        /**
         * Hide handles
         * @method _hideHandles
         * @private
         */
        _hideHandles: function(){
            this.wrapper.find(HANDLE_BOX_SELECTOR)
                .css({display: NONE})
                .removeAttr(DATA_ID);
        },

        /**
         * Refreshes the widget
         */
        refresh: function(e) {
            var that = this,
                i = 0;
            if (e === undefined || e.action === undefined) {
                var data = [];
                if (e=== undefined && that.dataSource instanceof kendo.data.PageItemCollectionDataSource) {
                    data = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    data = e.items;
                }
                //if (that.mode() === that.modes.assess) {
                //    kendo.unbind(that._container, that.properties());
                //}
                //that._container.find('*').off();
                //that._container.empty();
                for (i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (item instanceof kidoju.PageItem) {
                        that._addStageElement(item);
                    }
                }
                if(that.mode() === that.modes.assess) {
                    if (that.properties() instanceof kendo.data.ObservableObject) {
                        //kendo.bind(that._container, that.properties());
                    }
                }
            } else if (e.action === 'add') {
                for (i = 0; i < e.items.length; i++) {
                    that._addStageElement(e.items[i]);
                }
            } else if (e.action === 'remove') {
                for (i = 0; i < e.items.length; i++) {
                    that._removeStageElement(e.items[i].id);
                }
            } else if (e.action === 'itemchange') {
                for (i = 0; i < e.items.length; i++) {
                    //NOTE e.field cannot be relied upon, especially when resizing
                    //e.field takes a value of height or width when both change
                    //id and tool are not supposed to change
                    var stageElement = that._container.find(kendo.format(ELEMENT_SELECTOR, e.items[i].id));
                    //id is not suppoed to change
                    //tool is not supposed to change
                    if(stageElement.css(TRANSLATE) != e.items[i].left + 'px,' + e.items[i].top + 'px') {
                        stageElement.css(TRANSLATE, e.items[i].left + 'px,' + e.items[i].top + 'px');
                    }
                    if(stageElement.height() !== e.items[i].height || stageElement.width() !== e.items[i].width) {
                        stageElement.height(e.items[i].height);
                        stageElement.width(e.items[i].width);
                        //We need to trigger the resize event to ensure the content is resized
                        //but this will update the item triggering a refresh and potentially creating an infinite loop and a stack overflow.
                        //In order to prevent it we test a change of value hereabove, so that the loop stops when values are equal
                        stageElement.trigger(RESIZE, { height: e.items[i].height, width: e.items[i].width });
                    }
                    if(stageElement.css(ROTATE) != e.items[i].rotate) {
                        stageElement.css(ROTATE, e.items[i].rotate + 'deg');
                    }
                    //TODO attributes
                    //TODO properties
                }
            }
        },

        /**
         * Stage Elements
         * @method items
         * @returns {XMLList|*}
         */
        items: function() {
            //TODO: do not return handler
            return this._container.children();
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

    var util = {

        deg2rad: function(deg) {
            return deg*Math.PI/180;
        },

        rad2deg: function(rad) {
            return rad*180/Math.PI;
        },

        getElementRotation: function(element) {
            //$(element).css('transform') returns a matrix, so we read style
            var match = ($(element).attr('style') || '').match(/rotate\([\s]*([0-9]+)[deg\s]*\)/);
            return $.isArray(match) && match.length > 1 ? parseInt(match[1]) || 0 : 0;
        },

        getElementScale: function(element) {
            var match = ($(element).attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
            return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
        }

    };

}(jQuery));
