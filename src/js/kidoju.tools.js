//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        kidoju = global.kidoju = global.kidoju || {},

        //Types
        OBJECT = 'object',
        STRING = 'string',
        NUMBER = 'number',

        //Cursors
        CURSOR_DEFAULT = 'default',
        CURSOR_CROSSHAIR = 'crosshair',

        //Events
        CLICK = 'click',

        //Defaults
        DEFAULT_TOP = 0,
        DEFAULT_LEFT = 0,
        DEFAULT_HEIGHT = 100,
        DEFAULT_WIDTH = 300,
        DEFAULT_ROTATE = 0,

        //Miscellaneous
        POINTER = 'pointer',
        PX = 'px',

        DEBUG = true,
        MODULE = 'kidoju.tools: ';

    /**
     * Registry of tools
     * @type {{register: Function}}
     */
    kidoju.tools = kendo.observable({
        active: null,
        register : function(Class) {
            //if(Class instanceof constructor) {
            if($.type(Class.fn) === OBJECT) {
                var obj = new Class();
                if(obj instanceof Tool && $.type(obj.id) === STRING) {
                    if (!this[obj.id]) { //make sure our system tools are not replaced
                        this[obj.id] = obj;
                        if (obj.id === POINTER) {
                            this.active = POINTER;
                        }
                    }
                }
            }
        }
    });

    /**
     * @class Tool
     * @type {void|*}
     */
    var Tool =  kidoju.Tool = kendo.Class.extend({
        id: null,
        icon: null,
        cursor: null,
        playBar: [],
        designBar: [],
        properties: {},
        fields: {},
        /**
         * Constructor
         * @param options
         */
        init: function(options) {
            if($.type(options) === OBJECT) {
                if ($.type(options.id) === STRING) {
                    this.id = options.id;
                }
                if ($.type(options.icon) === STRING) {
                    this.icon = options.icon;
                }
                if ($.type(options.name) === STRING) {
                    this.name = options.name;
                }
                if ($.type(options.cursor) === STRING) {
                    this.cursor = options.cursor;
                }
            }
        },
        /**
         * create a pageItem (with methods) from a dataItem (persisted without methods)
         * @method create
         * @param dataItem
         * @returns {*}
         */
        create: function(dataItem) {
            if (dataItem instanceof PageItem) {
                return dataItem;
            } else if (dataItem === undefined) {
                return new PageItem({ id: kendo.guid(), tool: this.id });
            } else if ($.isPlainObject(dataItem) && dataItem.tool === this.id) {
                return new PageItem(dataItem);
            } else {
                throw new TypeError(); //We do not really know what to do with dataItem
            }
        },
        /**
         * Returns a wrapper div for the page item
         * @method getWrapper
         * @param pageItem
         */
        getWrapper: function(pageItem) {
            var pageElement = $(kendo.format('<div data-id="{0}" data-tool="{1}" class="kj-element"></div>', pageItem.id, pageItem.tool));
            pageElement.css('height', pageItem.height);
            pageElement.css('width', pageItem.width);
            pageElement.css({ translate: [pageItem.left, pageItem.top] , rotate: pageItem.rotate});
            return pageElement;
        },
        /**
         * Add event handlers for teh page Item
         * @method addHandlers
         * @param pageItem
         */
        addClickHandler: function(page, pageItem) {
            var that = this,
                pageElement = $(page).find(kendo.format('[data-id={0}]', pageItem.id));
            pageElement.on(CLICK, function(e) {
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'click on ' + pageItem.id);
                }
                //prevent click event on page
                e.preventDefault();
                e.stopPropagation();
            });
        },
        /**
         * @method draw
         * @param page
         * @param pageItem
         * @param mode
         */
        draw: function(page, pageItem, mode) {
            $.noop();
        },
        /**
         * @method resize
         * @param page
         * @param pageItem
         */
        resize: function(page, pageItem) {
            $.noop();
        },
        /**
         * @method edit
         * @param pageItem
         * @param mode
         */
        edit: function(pageItem, mode) {
            $.noop();
        },
        /**
         * @method validate
         * @param pageItem
         * @returns {boolean}
         */
        validate: function(pageItem) {
            return false;
        }
    });

    /**
     * @class PageItem
     * @type {void|*}
     */
    var PageItem = kidoju.PageItem = kendo.Class.extend({
        id: null,
        tool: null,
        top: DEFAULT_TOP,
        left: DEFAULT_LEFT,
        height: DEFAULT_HEIGHT,
        width: DEFAULT_WIDTH,
        rotate: DEFAULT_ROTATE,
        properties: {},
        fields: {},
        defaults: {},
        solutions: {},
        init: function(dataItem) {
            if (dataItem) {
                if ($.type(dataItem.id) === STRING) {
                    this.id = dataItem.id;
                }
                if ($.type(dataItem.tool) === STRING) {
                    this.tool = dataItem.tool;
                }
                if ($.type(dataItem.top) === NUMBER) {
                    this.top = dataItem.top;
                }
                if ($.type(dataItem.left) === NUMBER) {
                    this.left = dataItem.left;
                }
                if ($.type(dataItem.height) === NUMBER) {
                    this.height = dataItem.height;
                }
                if ($.type(dataItem.width) === NUMBER) {
                    this.width = dataItem.width;
                }
                if ($.type(dataItem.rotate) === NUMBER) {
                    this.rotate = dataItem.rotate; //TODO modulo 360
                }
                if($.isPlainObject(dataItem.properties) && !$.isEmptyObject(dataItem.properties)) {
                    for (var prop in dataItem.properties) {
                        if (dataItem.properties.hasOwnProperty(prop)) {
                            this.properties[prop] = dataItem.properties[prop];
                        }
                    }
                }
                //TODO fields
                //TODO: defaults
                //TODO: solutions
            }
        }
    });


    /*******************************************************************************************
     * TODO Editor classes
     *******************************************************************************************/


    /*******************************************************************************************
     * Tool classes
     *******************************************************************************************/

    /**
     * @class Pointer tool
     * @type {void|*}
     */
    var Pointer = kidoju.Tool.extend({
        id: POINTER,
        icon: 'mouse_pointer',
        cursor: CURSOR_DEFAULT
    });
    kidoju.tools.register(Pointer);

    /**
     * @class Label tool
     * @type {void|*}
     */
    var Label = kidoju.Tool.extend({
        id: 'label',
        icon: 'document_orientation_landscape',
        cursor: CURSOR_CROSSHAIR,
        properties: [
            {id: 'text', type: 'text'},
            {id: 'font', type: 'font'},
            {id: 'color', type: 'color'}
        ],
        init: function(options) {
            kidoju.Tool.fn.init.call(this, options);
        },
        draw: function(page, pageItem, mode) {
            var pageElement = this.getWrapper(pageItem),
                innerElement = $(kendo.format('<span>{0}</span>',pageItem.properties.text));
            innerElement.css('font-family', pageItem.properties.font);
            innerElement.css('color', pageItem.properties.color);
            pageElement.append(innerElement);
            $(page).append(pageElement);
            this.resize(page, pageItem);
        },
        resize: function(page, pageItem) {
            var pageElement = $(page).find(kendo.format('[data-id={0}]', pageItem.id));
            pageElement.fitText();
        },
        edit: function(pageItem, mode, enabled) {
            //if ($(pageItem).hasClass('kj-widget')) {
            //    $(pageItem).prop('contenteditable', enabled);
            //}
        }
    });
    kidoju.tools.register(Label);

    /**
     * @class Image tool
     * @type {void|*}
     */
    var Image = kidoju.Tool.extend({
        id: 'image',
        icon: 'painting_landscape',
        cursor: CURSOR_CROSSHAIR,
        init: function(options) {
            kidoju.Tool.fn.init.call(this, options);
        },
        draw: function(page, pageItem, mode) {
            var pageElement = this.getWrapper(pageItem),
                innerElement = $(kendo.format('<img src="{0}">', pageItem.properties.src));
            pageElement.append(innerElement);
            $(page).append(pageElement);
            this.resize(page, pageItem);
        },
        resize: function(page, pageItem) {
            $.noop();
        },
        edit: function(pageItem, mode, enabled) {
        }
    });
    kidoju.tools.register(Image);

    /**
     * @class Textbox tool
     * @type {void|*}
     */
    var Textbox = kidoju.Tool.extend({
        id: 'textbox',
        icon: 'text_field',
        cursor: CURSOR_CROSSHAIR,
        fields: {
            text: ''
        },
        defaults: {
            text: null
        },
        solutions: {
            text: null
        },
        init: function(options) {
            kidoju.Tool.fn.init.call(this, options);
        },
        draw: function(page, pageItem, mode) {
            var pageElement = this.getWrapper(pageItem),
                innerElement = $('<input type="text">');
            pageElement.append(innerElement);
            $(page).append(pageElement);
            this.resize(page, pageItem);
        },
        resize: function(page, pageItem) {
            var pageElement = $(page).find(kendo.format('[data-id={0}]', pageItem.id)),
                innerElement = pageElement.find('>input');
            innerElement.height(pageElement.height());
            innerElement.width(pageElement.width());
            innerElement.css('font-size', Math.floor(0.9*pageElement.height())); //TODO: review ratio
        },
        edit: function(pageItem, mode, enabled) {
            /*
            if ($(pageItem).hasClass('kj-widget')) {
                if(enabled) {
                    $(pageItem).find('input').removeProp('disabled');
                } else {
                    $(pageItem).find('input').prop('disabled', !enabled);
                }
            }
            */
        }
    });
    kidoju.tools.register(Textbox);

    /**
     * We could also consider
     * Button
     * ButtonGroup
     * HTML
     * Drawing surface
     * Shape
     * Select
     * Checkbox
     * Drop Target
     * Connector
     * Clock
     * Video
     * Sound
     * Text-to-Speech
     * MathJax
     * Grid
     */


    /*******************************************************************************************
     * jQuery fitText plugin
     *******************************************************************************************/

    $.fn.fitText = function(/*options*/) {
        //we could use bigtext, fittext or slabtext
        //https://github.com/zachleat/BigText
        //https://github.com/davatron5000/FitText.js/
        //https://github.com/freqDec/slabText/

        // Setup options
        /*
        var settings = $.extend({
                'minFontSize' : Number.NEGATIVE_INFINITY,
                'maxFontSize' : Number.POSITIVE_INFINITY
            }, options);
        */

        return this.each(function(){

            //http://stackoverflow.com/questions/783899/how-can-i-count-text-lines-inside-an-dom-element-can-i
            //http://jsfiddle.net/C3hTV/
            // Reference the element
            var element = $(this);

            // Resizer() resizes text
            var resizer = function () {
                var size = parseInt(element.css('font-size'));
                var width = element.width();
                var height = element.height();
                // parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)
                var clone = element.clone()
                    .hide()
                    .css('position', 'absolute')
                    //.css('overflow', 'visible')
                    .css('height', 'auto')
                    .css('border', '1px solid red')
                    .width(width);
                element.after(clone);
                //if no overflow, increase until overflow
                while(clone.height() < height) {
                    size++;
                    clone.css('font-size', size + PX);
                }
                //if overflow, decrease until no overflow
                while(clone.height() > height) {
                    size--;
                    clone.css('font-size', size + PX);
                }
                clone.remove();
                element.css('font-size', size + PX);
            };

            // Call once to set.
            resizer();

            // Call on resize. Opera debounces their resize by default.
            //$(window).on('resize orientationchange', resizer);

        });

    };

}(jQuery));
