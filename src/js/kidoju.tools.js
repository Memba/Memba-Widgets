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
        POINTER = 'pointer',

        //Events
        CLICK = 'click',
        DRAGGABLE = 'draggable',
        DRAGSTART = 'dragstart',
        DRAGENTER = 'dragenter',
        DRAGOVER = 'dragover',
        DROP = 'drop',

        //Defaults
        DEFAULT_TOP = 0,
        DEFAULT_LEFT = 0,
        DEFAULT_HEIGHT = 100,
        DEFAULT_WIDTH = 300,
        DEFAULT_ROTATE = 0,
        DEFAULT_MARGIN = 20,

        //Miscellaneous
        WRAPPER = '<div data-id="{0}" data-tool="{1}" class="kj-element"></div>',
        DATA_ID = 'data-id',
        DATA_TOOL = 'data-tool',
        DATA_ELEMENT = 'data-element',
        ATTRIBUTE_SELECTOR = '[{0}="{1}"]',
        HANDLER = '<div class="kj-handler"></div>',
        HANDLER_SELECTOR = '.kj-handler',
        HANDLER_DRAG = '<span class="kj-handler-button kj-drag-button"></span>',
        HANDLER_DRAG_SELECTOR = '.kj-drag-button',
        HANDLER_RESIZE = '<span class="kj-handler-button kj-resize-button"></span>',
        HANDLER_RESIZE_SELECTOR = '.kj-resize-button',
        HANDLER_ROTATE = '<span class="kj-handler-button kj-rotate-button"></span>',
        HANDLER_ROTATE_SELECTOR = '.kj-rotate-button',
        HANDLER_MENU = '<span class="kj-handler-button kj-menu-button"></span>',
        HANDLER_MENU_SELECTOR = '.kj-menu-button',
        POSITION = 'position',
        ABSOLUTE = 'absolute',
        DISPLAY = 'display',
        NONE = 'none',
        BLOCK = 'block',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        MARGIN = 'margin',
        PADDING = 'padding',
        RESIZE = 'resize',
        TRANSLATE = 'translate',
        ROTATE = 'rotate',
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
         * TODO: not sure this method belongs here
         * @method create
         * @param dataItem
         * @returns {*}
         */
        getPageItem: function(dataItem) {
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
         * Returns a generic wrapper div for the page element derived from the page item
         * @method _getPageElementWrapper
         * @param pageItem
         * @private
         */
        _getPageElementWrapper: function(pageItem) {
            var that = this,
                wrapper = $(kendo.format(WRAPPER, pageItem.id, pageItem.tool))
                .css(POSITION, ABSOLUTE)
                //.css('top', pageItem.top + PX)
                //.css('left', pageItem.left + PX)
                //.css(TOP, DEFAULT_TOP + PX)
                //.css(LEFT, DEFAULT_LEFT + PX)
                .css(HEIGHT, pageItem.height + PX)
                .css(WIDTH, pageItem.width + PX)
                //http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
                //.css({rotate: pageItem.rotate})
                .css({ translate: [pageItem.left, pageItem.top] , rotate: pageItem.rotate})
                .on(CLICK, $.proxy(that._clickHandler, that));
            return wrapper;
        },

        /**
         * Click handler on page element
         * Displays the handlers
         * @param e
         * @private
         */
        _clickHandler: function(e) {
            //TODO, we need to consider the mode here too
            var page = $(e.currentTarget).closest(kendo.roleSelector('page'));
            var id = $(e.currentTarget).attr(DATA_ID);
            if ($.type(id) === STRING) {
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'click on ' + id);
                }
                this._prepareHandles(page);
                this._showHandles(page, id);
                //prevent click event to bubble on page
                e.preventDefault();
                e.stopPropagation();
            }
        },

        /**
         * Prepare handles
         * @private
         */
        _prepareHandles: function(page) {
            var that = this;
            if($(page).find(HANDLER_SELECTOR).length === 0) {
                var handler = $(HANDLER)
                    .css(POSITION, ABSOLUTE)
                    .css(DISPLAY, NONE)
                    .append(HANDLER_DRAG)
                    .append(HANDLER_RESIZE)
                    .append(HANDLER_ROTATE)
                    .append(HANDLER_MENU)
                    .on(DRAGENTER, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on(DRAGOVER, function (e) {
                        //TODO Implement mode
                        if ($.isPlainObject(that._transform) && $.type(that._transform.id) === STRING)  {
                            if (that._transform.type === TRANSLATE) {
                                //TODO check the bounds of container
                                //TODO: snap to grid option
                                var translate = (that._transform.offset.x + e.originalEvent.clientX) + PX + ',' + (that._transform.offset.y + e.originalEvent.clientY) + PX;
                                $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, that._transform.id))
                                    .css(TRANSLATE, translate);
                                $(page).find(HANDLER_SELECTOR)
                                    .css(TRANSLATE, translate);
                            }
                            else if (that._transform.type === RESIZE) {
                                //TODO check the bounds of container
                                //TODO: snap to grid option
                                var size = {
                                    width: that._transform.offset.x + e.originalEvent.clientX,
                                    height: that._transform.offset.y + e.originalEvent.clientY
                                };
                                $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, that._transform.id))
                                    //.css('width', Math.round(that._transform.offset.x + e.originalEvent.clientX) + 'px')
                                    //.css('height', Math.round(that._transform.offset.y + e.originalEvent.clientY) + 'px');
                                    .width(size.width)
                                    .height(size.height);
                                $(page).find(HANDLER_SELECTOR)
                                    .width(size.width)
                                    .height(size.height);
                                that.resize(page, that._transform.id);
                            }
                            else if (that._transform.type === 'rotate') {
                                var degrees = ((that._transform.angle - that._transform.offset + Math.atan2(e.originalEvent.clientY - that._transform.origin.y, e.originalEvent.clientX - that._transform.origin.x))*180/Math.PI + 360) % 360;
                                $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, that._transform.id))
                                    .css(ROTATE, degrees + 'deg');
                                $(page).find(HANDLER_SELECTOR)
                                    .css(ROTATE, degrees + 'deg');

                                // $('#console').html(
                                // 'originX: ' + that._transform.origin.x + '<br/>' +
                                // 'originY: ' + that._transform.origin.y + '<br/>' +
                                // 'angle: ' + angle + '<br/>'
                                // );

                            }
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on(DROP, function (e) {
                        //delete the transform
                        delete that._transform;
                        e.preventDefault();
                        e.stopPropagation();
                    });
                handler.find(HANDLER_DRAG_SELECTOR)
                    .prop(DRAGGABLE, true)
                    .on(DRAGSTART, function(e){
                        //find the handler and the element the transformation applies to
                        var id = $(e.currentTarget).closest(HANDLER_SELECTOR).attr(DATA_ELEMENT);
                        //if found
                        if ($.type(id) === STRING) {
                            //get the page element
                            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id));
                            //find the current position
                            var position = pageElement.css(TRANSLATE).split(',');
                            //create a transformation object
                            that._transform = {
                                type: TRANSLATE,
                                id: id,
                                offset: {
                                    x: parseInt(position[0]) - e.originalEvent.clientX,
                                    y: parseInt(position[1]) - e.originalEvent.clientY
                                }
                            };
                            //next step occurs in the DRAGOVER event handler
                        }
                    });
                handler.find(HANDLER_RESIZE_SELECTOR)
                    .prop(DRAGGABLE, true)
                    .on(DRAGSTART, function(e){
                        //find the handler and the element the transformation applies to
                        var id = $(e.currentTarget).closest(HANDLER_SELECTOR).attr(DATA_ELEMENT);
                        //if found
                        if ($.type(id) === STRING) {
                            //get the page element
                            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id));
                            //create a transformation object
                            that._transform = {
                                type: RESIZE,
                                id: id,
                                offset: {
                                    x: pageElement.width()- e.originalEvent.clientX,
                                    y: pageElement.height() - e.originalEvent.clientY
                                }};
                            //next step occurs in the DRAGOVER event handler
                        }
                    });
                handler.find(HANDLER_ROTATE_SELECTOR)
                    .prop(DRAGGABLE, true)
                    .on(DRAGSTART, function(e){
                        //find the handler and the element the transformation applies to
                        var id = $(e.currentTarget).closest(HANDLER_SELECTOR).attr(DATA_ELEMENT);
                        //if found
                        if ($.type(id) === STRING) {
                            //get the page element
                            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id));
                            /*
                            var cssTransform = $(that._currentWidget).css('transform'),
                                pos1 = cssTransform.indexOf('('),
                                pos2 = cssTransform.indexOf(')'),
                                currentAngle = 0;
                            if (pos1 > 0) {
                                var matrix = cssTransform.substr(pos1 + 1, pos2-pos1-1).split(','),
                                //This is the angle of rotation of the widget before rotating it further
                                //TODO: http://css-tricks.com/get-value-of-css-rotation-through-javascript/
                                    currentAngle = Math.atan2(matrix[1], matrix[0]);
                            }
                            //This is the center of the widget being rotated
                            var originX = Math.round($(that._currentWidget).position().left + ($(that._currentWidget).width()*Math.abs(Math.cos(currentAngle)) + $(that._currentWidget).height()*Math.abs(Math.sin(currentAngle)))/2),
                                originY = Math.round($(that._currentWidget).position().top + ($(that._currentWidget).width()*Math.abs(Math.sin(currentAngle)) + $(that._currentWidget).height()*Math.abs(Math.cos(currentAngle)))/2);
                            */
                            var angle = parseInt(pageElement.css(ROTATE))*Math.PI/180,
                                originX = (pageElement.position().left + pageElement.width()*Math.cos(angle) + pageElement.height()*Math.sin(angle))/2,
                                originY = (pageElement.position().top + pageElement.width()*Math.sin(angle) + pageElement.height()*Math.cos(angle))/2;
                            that._transform = {
                                type: ROTATE,
                                id: id,
                                origin: {   //This is the center of the widget being rotated
                                    //we need origin set only once in dragstart otherwise (in dragover) the values change slightly as we are rotating and the rotation flickers
                                    x: originX,
                                    y: originY
                                },
                                angle: angle,
                                //The offset angle takes into account the position of the handle that drives the rotation
                                offset: Math.atan2(e.originalEvent.clientY - originY, e.originalEvent.clientX - originX)
                            };
                        }
                    });
                handler.find(HANDLER_MENU_SELECTOR)
                    .on(CLICK, function(e) {
                        if (DEBUG && global.console) {
                            global.console.log(MODULE + 'click on handler menu');
                        }
                       /*
                        that._showContextMenu(e.clientX - e.offsetX + 40, e.clientY - e.offsetY + 40);
                        */
                        e.preventDefault();
                        e.stopPropagation();
                    });
                $(page).append(handler);
            }
        },

        /**
         * Show handles on a page element
         * @param page
         * @param id
         * @private
         */
        _showHandles: function(page, id){
            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id));
            $(page).find(HANDLER_SELECTOR)
                //.css(TOP, pageElement.css(TOP))
                //.css(LEFT, pageElement.css(LEFT))
                .css(HEIGHT, pageElement.css(HEIGHT))
                .css(WIDTH, pageElement.css(WIDTH))
                .css(PADDING, DEFAULT_MARGIN + PX)
                .css(MARGIN, '-' + DEFAULT_MARGIN + PX)
                .css(TRANSLATE, pageElement.css(TRANSLATE))
                .css(ROTATE, pageElement.css(ROTATE))
                .css(DISPLAY, BLOCK)
                .attr(DATA_ELEMENT, id);
        },

        /**
         * Hide handles
         * @private
         */
        _hideHandles: function(page){
            $(page).find(HANDLER_SELECTOR)
                .css(DISPLAY, NONE)
                .removeAttr(DATA_ELEMENT);
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
     * A PageItem is what we store and a PageElement is what we display
     * @class PageItem
     * @type {void|*}
     * TODO: Probably use a model rather than a class
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
            var pageElement = this._getPageElementWrapper(pageItem),
                innerElement = $(kendo.format('<span>{0}</span>',pageItem.properties.text));
            innerElement.css('font-family', pageItem.properties.font);
            innerElement.css('color', pageItem.properties.color);
            pageElement.append(innerElement);
            $(page).append(pageElement);
            this.resize(page, pageItem.id);
        },
        resize: function(page, id) {
            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id));
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
            var pageElement = this._getPageElementWrapper(pageItem),
                innerElement = $(kendo.format('<img src="{0}">', pageItem.properties.src));
            pageElement.append(innerElement);
            $(page).append(pageElement);
            this.resize(page, pageItem.id);
        },
        resize: function(page, id) {
            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id)),
                innerElement = pageElement.find('>img');
            innerElement.width(pageElement.width());
            innerElement.height(pageElement.height());
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
            var pageElement = this._getPageElementWrapper(pageItem),
                innerElement = $('<input type="text">');
            pageElement.append(innerElement);
            $(page).append(pageElement);
            this.resize(page, pageItem.id);
        },
        resize: function(page, id) {
            var pageElement = $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, id)),
                innerElement = pageElement.find('>input');
            innerElement.width(pageElement.width());
            innerElement.height(pageElement.height());
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
                    .css(POSITION, ABSOLUTE)
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
