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
        ELEMENT = '<div data-id="{0}" data-tool="{1}" class="kj-element"></div>',
        ELEMENT_CLASS = 'kj-element',
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
        height: 250,
        width: 250,
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
                //if ($.type(options.name) === STRING) {
                //    this.name = options.name;
                //}
                if ($.type(options.cursor) === STRING) {
                    this.cursor = options.cursor;
                }
                if ($.type(options.height) === NUMBER) {
                    this.height = options.height;
                }
                if ($.type(options.width) === NUMBER) {
                    this.width = options.width;
                }
            }
        },
        /**
         * Initializes properties
         * @private
         */
        _getProperties: function() {
            var properties = {};
            //make sure any new property is added
            for(var field in this.properties) {
                properties[field] = this.properties[field].value;
            }
            return properties;
        },
        /**
         * Returns a generic wrapper div for the page element derived from the page item
         * @method _getWrapper
         * @param item
         * @private
         */
        _getWrapper: function(item) {
            var that = this,
                wrapper = $(kendo.format(ELEMENT, item.id, item.tool))
                .css(POSITION, ABSOLUTE)
                .css(HEIGHT, item.height + PX)
                .css(WIDTH, item.width + PX)
                //http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
                //.css({rotate: item.rotate})
                .css({ translate: [item.left, item.top] , rotate: item.rotate})
                .on(CLICK, that._clickHandler)
                .on(RESIZE, that.onResize);
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
            var element = $(e.currentTarget);
            if (element.hasClass(ELEMENT_CLASS)) {
                var page = element.closest(kendo.roleSelector('page')),
                    elementId = element.attr(DATA_ID),
                    toolId = element.attr(DATA_TOOL);
                if ($.type(elementId) === STRING) {
                    if (DEBUG && global.console) {
                        global.console.log(MODULE + 'click on ' + elementId);
                    }
                    var tool = kidoju.tools[toolId];
                    if (tool instanceof kidoju.Tool) {
                        tool._prepareHandles(page);
                        tool._showHandles(page, elementId);
                    }
                    //prevent click event to bubble on page
                    e.preventDefault();
                    e.stopPropagation();
                }
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
                                    .height(size.height)
                                    //Trigger a resize event to resize the content
                                    .trigger(RESIZE, size);
                                $(page).find(HANDLER_SELECTOR)
                                    .width(size.width)
                                    .height(size.height);
                                //that.resize(page, that._transform.id);
                            }
                            else if (that._transform.type === ROTATE) {
                                var rotate = (that._transform.rotate - that._transform.offset + Math.atan2(e.originalEvent.clientY - that._transform.origin.y, e.originalEvent.clientX - that._transform.origin.x))*180/Math.PI;
                                $(page).find(kendo.format(ATTRIBUTE_SELECTOR, DATA_ID, that._transform.id))
                                    .css({rotate: rotate + 'deg'});
                                $(page).find(HANDLER_SELECTOR)
                                    .css({rotate : rotate + 'deg'});

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
                            var rotate = parseInt(pageElement.css(ROTATE))*Math.PI/180,
                                originX = (pageElement.position().left + pageElement.width()*Math.cos(rotate) + pageElement.height()*Math.sin(rotate))/2,
                                originY = (pageElement.position().top + pageElement.width()*Math.sin(rotate) + pageElement.height()*Math.cos(rotate))/2;
                            that._transform = {
                                type: ROTATE,
                                id: id,
                                origin: {   //This is the center of the widget being rotated
                                    //we need origin set only once in dragstart otherwise (in dragover) the values change slightly as we are rotating and the rotation flickers
                                    x: originX,
                                    y: originY
                                },
                                rotate: rotate,
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
         * @param item
         */
        draw: function(page, item) {
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'drawing ' + item.tool + ' ' + item.id);
            }
            var wrapper = this._getWrapper(item),
                content = this.getHtml(item);
            wrapper.append(content);
            $(page).append(wrapper);
            //trigger resize
            //this.resize(page, item);
        },

        /**
         * method getHtml
         * @param item
         * @param mode
         * @returns {string}
         */
        getHtml: function(item, mode) {
            return '';
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         */
        onResize: function(e) {
            $.noop();
        },

    });

    /*******************************************************************************************
     * Property classes
     *******************************************************************************************/
    var properties = kidoju.properties = kidoju.properties || {};

    var Property = properties.Property = kendo.Class.extend({
        value: undefined,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
        //validation????????
    });

    var TextProperty = properties.TextProperty = properties.Property.extend({
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    var IntegerProperty = properties.IntegerProperty = properties.Property.extend({
        value: 0,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    var BooleanProperty = properties.BooleanProperty = properties.Property.extend({
        value: false,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    var FontProperty = properties.FontProperty = properties.Property.extend({

    });

    var ColorProperty = properties.ColorProperty = properties.Property.extend({

    });


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
        templates: {
            default: '<span style="font-family: #= font #; color: #= color#;">#= text#</span>'
        },
        height: 250,
        width: 250,
        properties: {
            text: new properties.TextProperty('Label'),
            font: new properties.TextProperty('Georgia, serif'),
            color: new properties.TextProperty('#FF0000')
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @param mode
         * @returns {*}
         */
        getHtml: function(item, mode) {
            var template = kendo.template(this.templates.default);
            return template(item.getProperties());
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param size
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>input');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                        content.css('font-size', Math.floor(0.75*size.height));
                    }
                    /*
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
                    */
                }
                //prevent click event to bubble on page
                e.preventDefault();
                e.stopPropagation();
            }
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
        templates: {
            default: '<img src="#= src #" alt="#= alt #">'
        },
        height: 250,
        width: 250,
        properties: {
            src: new properties.TextProperty(''),
            alt: new properties.TextProperty('')
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @param mode
         * @returns {*}
         */
        getHtml: function(item) {
            var template = kendo.template(this.templates.default);
            return template(item.getProperties());
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>img');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                    }
                }
                //prevent click event to bubble on page
                e.preventDefault();
                e.stopPropagation();
            }
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
        templates: {
            default: '<input type="text">'
        },
        height: 250,
        width: 250,
        properties: {
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @param mode
         * @returns {*}
         */
        getHtml: function(item, mode) {
            var template = kendo.template(this.templates.default);
            return template(item.getProperties());
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param size
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>input');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                        content.css('font-size', Math.floor(0.75*size.height));
                    }
                }
                //prevent click event to bubble on page
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Textbox);

    /**
     * @class Button tool
     * @type {void|*}
     */
    var Button = kidoju.Tool.extend({
        id: 'button',
        icon: 'button',
        cursor: CURSOR_CROSSHAIR,
        templates: {
            default: '<button type="button">#= text #</button>'
        },
        height: 250,
        width: 250,
        properties: {
            text: new properties.TextProperty('Button')
        },
        getHtml: function(item, mode) {
            var template = kendo.template(this.templates.default);
            return template(item.getProperties());
        },
        addEvents: function(item, mode) {

        },
        removeEvents: function(item, mode) {

        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param size
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>button');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                        content.css('font-size', Math.floor(0.75*size.height));
                    }
                }
                //prevent click event to bubble on page
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Button);


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

}(jQuery));
