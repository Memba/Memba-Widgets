//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        Widget = kendo.ui.Widget,
        kidoju = global.kidoju,

        //Types
        FUNCTION = 'function',
        STRING = 'string',
        NUMBER = 'number',

        //Events
        CLICK = 'click',
        CHANGE = 'change',
        TRANSLATE = 'translate',
        RESIZE = 'resize',
        ROTATE = 'rotate',

        //Size
        POSITION = 'position',
        RELATIVE = 'relative',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        DEFAULT_SCALE = 1,
        DEFAULT_WIDTH = 1024,
        DEFAULT_HEIGHT = 768,

        //Modes
        MODE = {
            THUMBNAIL: 0,
            DESIGN: 1,
            SOLUTION: 2,
            //Play modes
            LEARN: 3,
            TEST: 4
        },

        //Miscellaneous
        POINTER = 'pointer',
        CLASS = 'k-widget kj-page',
        ELEMENT_SELECTOR = '.kj-element[data-id="{0}"]',

        DEBUG = true,
        MODULE = 'kidoju.widgets.page: ';


    /*******************************************************************************************
     * Page widget
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
     * @class Page Widget (kendoPage)
     */
    var Page = Widget.extend({

        /**
         * Initializes the widget
         * @param element
         * @param options
         */
        init: function (element, options) {
            var that = this;
            options = options || {};
            Widget.fn.init.call(that, element, options);
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
            that._dataSource();
            that._layout();
            //that.refresh();
        },

        modes: {
            thumbnail: MODE.THUMBNAIL,
            design: MODE.DESIGN,
            solution: MODE.SOLUTION,
            //Play modes
            learn: MODE.LEARN,
            test: MODE.TEST
            //We could consider TEST_WITH_HINTS
        },

        /**
         * Widget options
         */
        options: {
            name: "Page",
            autoBind: true,
            mode: MODE.TEST,
            scale: DEFAULT_SCALE,
            height: DEFAULT_HEIGHT,
            width: DEFAULT_WIDTH,
            tools: kidoju.tools,
            dataSource: null
        },

        /**
         * Mode defines the operating mode of the Page Widget
         * @param value
         * @return {*}
         */
        mode: function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                //TODO: test range
                if(value !== that.options.mode) {
                    that.options.mode = value;
                    that.refresh();
                }
            }
            else {
                return that.options.mode;
            }
        },

        /**
         * Scale the widget
         * @param value
         * @return {*}
         */
        scale: function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if(value !== that.options.scale) {
                    that.options.scale = value;
                    if(DEBUG && global.console) {
                        global.console.log(MODULE + 'scale changed to: ' + value);
                    }
                    $(that.element).css({transform: kendo.format('scale({0})', value)});
                }
            }
            else {
                return that.options.scale;
            }
        },

        /**
         * Height of page
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
         * Width of page
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
            if ( that.dataSource instanceof kendo.data.DataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }
            else {
                that._refreshHandler = $.proxy(that.refresh, that);
            }

            if (that.options.dataSource) {
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kendo.data.DataSource.create(that.options.dataSource);

                // bind to the change event to refresh the widget
                that.dataSource.bind( CHANGE, that._refreshHandler );

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
            var that = this,
                page = $(that.element);
            that._clear();
            //Setup page
            //TODO: Implement an innner DIV containing all page elements
            //and have the handler set outside this div
            page
                .addClass(CLASS)
                .css(POSITION, RELATIVE) //!important
                .css('overflow', 'hidden')
                .css(HEIGHT, that.height() + 'px')
                .css(WIDTH, that.width() + 'px')
                .on(CLICK, function(e) {
                    //TODO test mode
                    if(DEBUG && global.console) {
                        global.console.log(MODULE + 'page clicked at (' + e.offsetX + ',' + e.offsetY + ')');
                    }
                    var id = that.options.tools.get('active');
                    if (id !== POINTER) {
                        var tool = that.options.tools[id];
                        //TODO: show creation dialog and test OK/Cancel
                        var item = new kidoju.PageItem({
                            id: kendo.guid(),
                            tool: id,
                            left: e.offsetX,
                            top: e.offsetY,
                            width: tool.width,
                            height: tool.height
                            //rotate: tool.rotate?
                        });
                        that.dataSource.add(item);
                        that.options.tools.set('active', POINTER);
                    } else {
                        var tool = that.options.tools[POINTER];
                        if ($.isFunction(tool._hideHandles)) {
                            tool._hideHandles(that.element);
                        }
                    }
                })
        },

        /**
         * Add an element to the page either on a click or from persistence
         * @param item
         * @param left
         * @param top
         * @private
         */
        _addPageElement: function(item, left, top) {
            var that = this,
                page = $(that.element);
            if (item instanceof kidoju.PageItem) {
                var tool = kidoju.tools[item.tool];
                if (tool instanceof kidoju.Tool) {
                    if ($.type(left) === NUMBER) {
                        item.set(LEFT, left);
                    }
                    if ($.type(top) === NUMBER) {
                        item.set(TOP, top);
                    }
                    var pageElement = tool._draw(page, item);
                    /*
                     tool.draw(widget);
                     var find = that.element.find('.kj-widget');
                     if (find.length > 0) {
                     find.last().after(widget);
                     } else {
                     $(that.element).prepend(widget);
                     }
                     */
                    pageElement
                        .on(TRANSLATE, function (e, position) {
                            var pageElement = $(e.currentTarget),
                                page = pageElement.closest(kendo.roleSelector('page')),
                                widget = page.data('kendoPage'),
                                id = pageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(TOP, position.top);
                            item.set(LEFT, position.left);
                        })
                        .on(RESIZE, function(e, size) {
                            var pageElement = $(e.currentTarget),
                                page = pageElement.closest(kendo.roleSelector('page')),
                                widget = page.data('kendoPage'),
                                id = pageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(HEIGHT, size.height);
                            item.set(WIDTH, size.width);
                        })
                        .on(ROTATE, function(e, rotate) {
                            var pageElement = $(e.currentTarget),
                                page = pageElement.closest(kendo.roleSelector('page')),
                                widget = page.data('kendoPage'),
                                id = pageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(ROTATE, rotate);
                        });
                }
            }
        },

        /**
         * Remove an element from the page
         * @private
         */
        _removePageElement: function(id) {
            var that = this,
                page = $(that.element);
            //TODO hide handles where necessary
            //TODO use a tool method to avoid leaks (remove all event handlers, ...)
            page.find(kendo.format(ELEMENT_SELECTOR, id))
                .off()
                .remove();
        },

        /**
         * Refreshes the widget
         */
        refresh: function(e) {
            var that = this;
            if (e === undefined || e.action === undefined) {
                if (that.dataSource instanceof kendo.data.DataSource) {
                    var data = that.dataSource.data();
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        if ($.type(item.tool) === STRING) {
                            //TODO: clear or only redraw what needs to be redrawn
                            that._addPageElement(item);
                        }
                    }
                }
            } else if (e.action === 'add') {
                for (var i = 0; i < e.items.length; i++) {
                    that._addPageElement(e.items[i]);
                }
            } else if (e.action === 'remove') {
                for (var i = 0; i < e.items.length; i++) {
                    that._removePageElement(e.items[i].id);
                }
            } else if (e.action === 'itemchange') {
                var page = $(that.element);
                for (var i = 0; i < e.items.length; i++) {
                    //NOTE e.field cannot be relied upon, especially when resizing
                    //e.field takes a value of height or width when both change
                    //id and tool are not supposed to change
                    var pageElement = page.find(kendo.format(ELEMENT_SELECTOR, e.items[i].id));
                    //id is not suppoed to change
                    //tool is not supposed to change
                    if(pageElement.css(TRANSLATE) != e.items[i].left + 'px,' + e.items[i].top + 'px') {
                        pageElement.css(TRANSLATE, e.items[i].left + 'px,' + e.items[i].top + 'px');
                    }
                    if(pageElement.height() !== e.items[i].height || pageElement.width() !== e.items[i].width) {
                        pageElement.height(e.items[i].height);
                        pageElement.width(e.items[i].width);
                        //We need to trigger the resize event to ensure the content is resized
                        //but this will update the item triggering a refresh and potentially creating an infinite loop and a stack overflow.
                        //In order to prevent it we test a change of value hereabove, so that the loop stops when values are equal
                        pageElement.trigger(RESIZE, { height: e.items[i].height, width: e.items[i].width });
                    }
                    if(pageElement.css(ROTATE) != e.items[i].rotate) {
                        pageElement.css(ROTATE, e.items[i].rotate + 'deg');
                    }
                    //TODO properties
                }
            }
        },

        /**
         * Page Elements
         * @method items
         * @returns {XMLList|*}
         */
        items: function() {
            //TODO: do not return handler
            return this.element.children();
        },

        /**
         * Clears the DOM from modifications made by the widget
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            //kendo.unbind($(that.element));
            //unbind all other events
            $(that.element).find('*').off();
            $(that.element).off();
            //remove descendants
            $(that.element).empty();
            //remove element classes
            $(that.element).removeClass(CLASS);
        },

        /**
         * Destroys the widget
         */
        destroy: function () {
            var that = this;
            that._clear();
            that.setDataSource(null);
            Widget.fn.destroy.call(this);
        }

    });

    kendo.ui.plugin(Page);

}(jQuery));
