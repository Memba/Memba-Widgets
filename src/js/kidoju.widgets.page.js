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
        CHANGE= 'change',

        //Size
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
            var that = this;
            that._clear();
            //Setup page
            $(that.element)
                .addClass(CLASS)
                .css('position', 'relative') //!important
                .css('overflow', 'hidden')
                .css('height', that.height() + 'px')
                .css('width', that.width() + 'px');
            //Implement click event
            $(that.element).on(CLICK, function(e) {
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
                    });
                    that.dataSource.add(item);
                    that.options.tools.set('active', POINTER);
                } else {
                    var tool = that.options.tools[POINTER];
                    if ($.isFunction(tool._hideHandles)) {
                        tool._hideHandles(that.element);
                    }
                }
            });
        },

        /**
         * Add an element to the page either on a click or from persistence
         * @param item
         * @param left
         * @param top
         * @private
         */
        _addPageElement: function(item, left, top) {
            var that = this;
            if (item instanceof kidoju.PageItem) {
                var tool = kidoju.tools[item.tool];
                if (tool instanceof kidoju.Tool) {
                    if ($.type(left) === NUMBER) {
                        item.set('left', left);
                    }
                    if ($.type(top) === NUMBER) {
                        item.set('top', top);
                    }
                    tool.draw(that.element, item);
                }
            }
        },

        /*
         _addWidget: function(tool, position, properties) {
         var that = this;
         if ((tool instanceof kidoju.Tool) && $.isFunction(tool.draw)) {
         position = $.extend({top: 10, left: 10, width: 200, height: 100}, position);
         var widget = $(kendo.format(
         '<div id={0} class="kj-widget" data-tool="{1}" style="position:absolute; top:{2}px; left:{3}px; width:{4}px; height:{5}px"></div>',
         kendo.guid(),
         tool.id,
         position.top,
         position.left,
         position.width,
         position.height
         ));
         tool.draw(widget);
         var find = that.element.find('.kj-widget');
         if (find.length > 0) {
         find.last().after(widget);
         } else {
         $(that.element).prepend(widget);
         }
         widget
         .on(constants.CLICK, function(e) {
         if(that._currentWidget) {
         that._enableEdit(that._currentWidget, false);
         that._hideHandles();
         }
         var targetWidget = $(e.target).closest('.kj-widget').get();
         if (targetWidget !== that._currentWidget) {
         that._currentWidget = targetWidget;
         that._prepareContextMenu();
         }
         that._prepareHandles();
         that._showHandles();
         e.preventDefault();
         e.stopPropagation();
         })
         .on(constants.DBLCLICK, function(e){
         var widget = $(e.target).closest('.kj-widget');
         that._enableEdit(that._currentWidget, true);
         })
         .on('blur', function(e) {
         that._enableEdit(that._currentWidget, false);
         kendo.logToConsole('blur from ' + e.target.toString());
         })
         .on('focusout', function(e) {
         that._enableEdit(that._currentWidget, false);
         kendo.logToConsole('focusout from ' + e.target.toString());
         });
         widget.trigger(constants.CLICK);
         }
         },
         */

        /**
         * Remove an element from the page
         * @private
         */
        _removePageElement: function(id) {
            var that = this;
            //TODO hide handles where necessary
            //TODO use a tool method to avoid leaks (remove all event handlers, ...)
            $(that.element).find(kendo.format('[data-id="{0}"]', id))
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
                for (var i = 0; i < e.items.length; i++) {
                    //TODO test e.field

                    //that._removePageElement(e.items[i].id);
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
