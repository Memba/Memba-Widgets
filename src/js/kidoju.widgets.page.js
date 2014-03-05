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

        //Size
        DEFAULT_SCALE = 1,
        DEFAULT_WIDTH = 1024,
        DEFAULT_HEIGHT = 768,

        //Modes
        MODE = {
            PLAY: 0,
            DESIGN: 1 //TODO
        },

        //Miscellaneous
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
            that._layout();
            that.refresh();
        },

        /**
         * Widget options
         */
        options: {
            name: "Page",
            mode: MODE.PLAY,
            scale: DEFAULT_SCALE,
            height: DEFAULT_HEIGHT,
            width: DEFAULT_WIDTH,
            tools: kidoju.tools,
            value: null
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
                if(that.options.mode !== value) {
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
                if($.type(value) !== NUMBER || value <=0) {
                    throw new TypeError();
                }
                if(that.options.scale !== value) {
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
                that.options.height = value;
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
                that.options.width = value;
            }
            else {
                return that.options.width;
            }
        },

        /**
         * Value of the widget
         * @param value
         * @returns {*}
         */
        value:  function (value) {
            var that = this;
            if (value) {
                //TODO: we need a well formatted object
                that.options.value = value;
            }
            else {
                return that.options.value;
            }
        },

        /**
         * Returns the size for internal use
         * @returns {*}
        _getSize: function() {
            var that = this,
                element = that.element,
                size = kendo.dimensions(this.element);

             if(element.width()>0){
                size.width = element.width();
            }
            if(element.height()>0){
                size.height = element.height();
            }
            if(that.options.width){
                size.width = that.options.width;
            }
            if(that.options.height){
                size.height = that.options.height;
            }

            return size;
        },
         */

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;
            that._clear();
            $(that.element)
                .addClass(CLASS)
                .css('position', 'relative') //!important
                .css('overflow', 'hidden')
                .css('height', that.height() + 'px')
                .css('width', that.width() + 'px');
            $(that.element).on(CLICK, function(e) {
                if(DEBUG && global.console) {
                    global.console.log(MODULE + 'page clicked at (' + e.offsetX + ',' + e.offsetY + ')');
                }
            });
        },

        _addElement: function(tool, x, y) {

        },

        _removeElement: function() {

        },

        /**
         * Refreshes the widget
         */
        refresh: function(e) {
            var that = this;
            //TODO: clear or only redraw what needs to be redrawn
            if ($.isArray(that.value())) { //TODO: Maybe an observable array
                $.each(that.value(), function(index, item) {
                    if ($.type(item.tool) === STRING) {
                        var tool = kidoju.tools[item.tool];
                        if (tool instanceof kidoju.Tool) {
                            var pageItem = tool.create(item);
                            tool.draw(that.element, pageItem, that.mode());
                            tool.addClickHandler(that.element, pageItem);
                        }
                    }
                })
            }
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
        }

    });

    kendo.ui.plugin(Page);

}(jQuery));
