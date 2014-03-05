//Copyright ©2011-2012 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        Widget = kendo.ui.Widget,
        kidoju = global.kidoju,
        constants = kidoju.constants;


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
            if(options.toolbox) { //we have designated a toolbox
                if ($(options.toolbox).data('kendoToolbox') instanceof Widget) { //the toolbox is ready
                    that._toolbox = $(options.toolbox).data('kendoToolbox');
                } else {  //the toolbox is not ready yet, wait for it
                    $(options.toolbox).on('toolboxready', function(e){
                        that._toolbox = $(options.toolbox).data('kendoToolbox');
                    });
                }
            }
            that._dataSource();
            that._layout();
        },

        /**
         * Widget options
         */
        options: {
            name: "Page",
            dataSource: null, //and not source (exception to the data-X parsing)
            mode: constants.MODE_THUMBNAIL, //MODE_DESIGN, MODE_SOLUTION, ...
            scale: 1,
            toolbox: null //this is the DOM id of the toolbox widget
            //editor: null //this is the DOM id of the property editor widget (CAREFUL! pop-up window as OK + Cancel button, side panel does not)
            //contextmenu: null //we might also want to designate the context menu
        },

        /**
         * Mode defines the operating mode of the Page Widget
         * @param value
         * @return {*}
         */
        mode: function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== constants.STRING) {
                    throw new TypeError();
                }
                if ((constants.MODE_DESIGN + constants.MODE_SOLUTION + constants.MODE_PLAY + constants.MODE_CORRECTION).indexOf(value) < 0 ) {
                    value = constants.MODE_THUMBNAIL;
                }
                if(that.options.mode !== value) {
                    that.options.mode = value;
                    that.refresh();
                }
                //return;
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
                if($.type(value) !== constants.NUMBER || value <=0) {
                    throw new TypeError();
                }
                if(that.options.scale !== value) {
                    $(that.element).scale(value);
                    that.options.scale = value;
                }
                //return;
            }
            else {
                return that.options.scale;
            }
        },

        /**
         * Private variables
         */
        //This is the active widget
        _currentWidget: null,
        //We currently need _currentTransform because dataTransfer.getData
        //returns an empty string when called in a dragover event handler in IE
        //dataTransfer.getData only seems to work in a drop event handler in IE
        _currentTransform: null,
        //The connected toolbox
        _toolbox: null,

        /**
         * Binds the widget to the change event of the data source
         * @private
         */
        _dataSource: function () {
            var that = this;
            if (that.options.dataSource) {
                if (that._refreshHandler) {
                    that.options.dataSource.unbind(constants.CHANGE, that._refreshHandler);
                }
                else {
                    that._refreshHandler = $.proxy(that.refresh, that);
                }
                // bind to the change event to refresh the widget
                that.options.dataSource.bind(constants.CHANGE, that._refreshHandler);
            }
        },

        /**
         * Sets the dataSource
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },


        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {

            var that = this;

            that._clear();
            $(that.element)
                .addClass('k-widget kj-page')
                .css('position', 'relative'); //!important

            /*
             if (that.options.dataSource) {
             type = that.options.dataSource.get(that.options.type);
             text = that.options.dataSource.get(that.options.text);
             } else {
             type = that.type();
             text = that.text();
             }
             */

            $(that.element)
                .on(constants.CLICK, function(e) {
                    that._currentWidget = null;
                    that._hideHandles();
                    that._hideContextMenu();
                    var tool = that._toolbox.getTool();
                    if (that._toolbox instanceof Widget &&  tool instanceof kidoju.Tool && tool.id !== constants.TOOL_SELECT) {
                        that._addWidget(tool, {left: e.offsetX, top: e.offsetY});
                    }
                    that._toolbox.reset();
                    e.preventDefault();
                    e.stopPropagation();
                });

        },

        /**
         * Refreshes the widget as the dataSource changes
         */
        refresh: function(e) {
            var that = this;
            if (!e) {  //force a full refresh
                that._layout();
            } else {
                //Changes to the dataSource affect the databound fields
                if(($.type(e.field) === constants.STRING) && ((that.options.text.indexOf(e.field) > -1) || (that.options.type.indexOf(e.field) > -1))) {
                    that._layout();
                }
            }
        },

        /**
         *
         * @param tool
         * @param position
         * @param properties
         * @private
         */
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

        _removeWidget: function(widget) {
            var that = this;
            //TODO: call destroy on Tool
            //widget.find('*').off();
            //widget.off();

        },

        /**
         *
         * @param widget
         * @param enabled
         * @private
         */
        _enableEdit: function (widget, enabled) {
            var that = this;
            if (that._toolbox instanceof Widget && $.isFunction(that._toolbox.getTool)) {
                var tool = that._toolbox.getTool($(widget).attr('data-tool'));
                if($.isFunction(tool.edit)) {
                    tool.edit(widget, that.options.mode, enabled);
                }
            }
        },

        /**
         * Prepare handles for the active widget
         * @private
         */
        _prepareHandles: function() {
            var that = this;
            if($(that.element).find('.kj-handler').length === 0) {
                $(that.element)
                    .append('<div class="kj-handler"></div>')
                    .on(constants.DRAGENTER, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on(constants.DRAGOVER, function (e) {
                        //TODO check the bounds of container
                        //TODO: snap to grid and to angles option
                        if (that._currentTransform.type === 'translate') {
                            $(that._currentWidget)
                                .css('left', Math.round(that._currentTransform.offset.x + e.originalEvent.clientX) + 'px')
                                .css('top', Math.round(that._currentTransform.offset.y + e.originalEvent.clientY) + 'px');
                            $(that.element).find('.kj-handler')
                                .css('top', $(that._currentWidget).css('top'))
                                .css('left', $(that._currentWidget).css('left'));
                        } else if (that._currentTransform.type === 'scale') {
                            $(that._currentWidget)
                                .css('width', Math.round(that._currentTransform.offset.x + e.originalEvent.clientX) + 'px')
                                .css('height', Math.round(that._currentTransform.offset.y + e.originalEvent.clientY) + 'px');
                            $(that.element).find('.kj-handler')
                                .css('width', $(that._currentWidget).css('width'))
                                .css('height', $(that._currentWidget).css('height'));
                        } else if (that._currentTransform.type === 'rotate') {
                            var angle = Math.round(that._currentTransform.currentAngle - that._currentTransform.offsetAngle + Math.atan2(e.originalEvent.clientY - that._currentTransform.origin.y, e.originalEvent.clientX - that._currentTransform.origin.x)*(180/Math.PI));
                            $(that._currentWidget)
                                .css('transform', 'rotate(' + angle + 'deg)');  //TODO: css vendor prefixes  + modulo?
                            $(that.element).find('.kj-handler')
                                .css('transform', $(that._currentWidget).css('transform'));
                            /*
                             $('#console').html(
                             'originX: ' + that._currentTransform.origin.x + '<br/>' +
                             'originY: ' + that._currentTransform.origin.y + '<br/>' +
                             'angle: ' + angle + '<br/>'
                             );
                             */
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on(constants.DROP, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                $(that.element).find('.kj-handler')
                    .append('<span class="kj-handler-button kj-drag-button"></span>')
                    .append('<span class="kj-handler-button kj-resize-button"></span>')
                    .append('<span class="kj-handler-button kj-rotate-button"></span>')
                    .append('<span class="kj-handler-button kj-menu-button"></span>')
                    .css('position', 'absolute')
                    .css('display', 'none');
                $(that.element).find('.kj-handler .kj-drag-button')
                    .prop(constants.DRAGGABLE, true)
                    .on(constants.DRAGSTART, function(e){
                        that._currentTransform = {
                            type: 'translate',
                            offset: {
                                x: $(that._currentWidget).position().left - e.originalEvent.clientX,
                                y: $(that._currentWidget).position().top - e.originalEvent.clientY
                            }};
                    });
                $(that.element).find('.kj-handler .kj-resize-button')
                    .prop(constants.DRAGGABLE, true)
                    .on(constants.DRAGSTART, function(e){
                        that._currentTransform = {
                            type: 'scale',
                            offset: {
                                x: $(that._currentWidget).width()- e.originalEvent.clientX,
                                y: $(that._currentWidget).height() - e.originalEvent.clientY
                            }};
                    });
                $(that.element).find('.kj-handler .kj-rotate-button')
                    .prop(constants.DRAGGABLE, true)
                    .on(constants.DRAGSTART, function(e){
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
                        that._currentTransform = {
                            type:'rotate',
                            origin: {   //This is the center of the widget being rotated
                                //we need origin set only once in dragstart otherwise (in dragover) the values change slightly as we are rotating and the rotation flickers
                                x: originX,
                                y: originY
                            },
                            currentAngle: currentAngle * (180/Math.PI), //in degrees
                            //The offset angle takes into account the position of the handle that drives the rotation
                            offsetAngle: Math.atan2(e.originalEvent.clientY - originY, e.originalEvent.clientX - originX) * (180/Math.PI) //in degrees
                        };
                    });
                $(that.element).find('.kj-handler .kj-menu-button')
                    .on(constants.CLICK, function(e) {
                        that._showContextMenu(e.clientX - e.offsetX + 40, e.clientY - e.offsetY + 40);
                        e.preventDefault();
                        e.stopPropagation();
                    });
            }
        },

        /**
         * Show handles on a widget created by a tool from the toolbox
         * @private
         */
        _showHandles: function(){
            var that = this;
            if (!that._currentWidget) {
                return;
            }
            $(that.element).find('.kj-handler')
                .css('top', $(that._currentWidget).css('top'))
                .css('left', $(that._currentWidget).css('left'))
                .css('width', $(that._currentWidget).css('width'))
                .css('height', $(that._currentWidget).css('height'))
                .css('padding', '30px')
                .css('margin', '-30px')
                .css('transform', $(that._currentWidget).css('transform'))//TODO: CSS vendor prefixes
                .css('display', 'block');
        },

        /**
         * Hide handles
         * @private
         */
        _hideHandles: function(){
            var that = this;
            $(that.element).find('.kj-handler')
                .css('display', 'none');
        },

        /**
         * Prepare context menu for active widget
         * @private
         */
        _prepareContextMenu: function() {
            var that = this;
            if (!that._currentWidget) {
                return;
            }
            //Even though we append a context menu to the page element
            //the contextual menu plugin (kendo labs) removes it to place it in the document
            //so that it cannot be found withing the page element
            if ($(document).find('.kj-context-menu').length === 0) {
                $(that.element).append('<ul class="kj-context-menu" style="display:none"></ul>');
            }
            var menu = $(document).find('.kj-context-menu').first();
            if (menu.data('kendoExtContextMenu') instanceof kendo.ui.Menu){
                menu.data('kendoExtContextMenu').destroy();
            }
            menu.kendoExtContextMenu({
                width: "175px",
                items: [
                    {
                        text: "Add Item",
                        iconCss: "k-add"
                    },
                    {
                        text: "Rename Category",
                        iconCss: "k-edit"
                    },
                    {
                        separator: true
                    },
                    {
                        text: "Delete Category",
                        iconCss: "k-delete"
                    }
                ],
                itemSelect: function (e) {
                    var msg = kendo.format('You selected: "{0}" on "{1}"',
                        $(e.item).text().trim(),
                        $(e.target).text());
                    window.alert(msg);
                }
            });
        },

        /**
         * Show context menu for active widget
         * @param x top of the element containing the menu
         * @param y left of the element containing the menu
         * @private
         */
        _showContextMenu: function(x, y) {
            //var that = this;
            //if (!that._currentWidget) {
            //    return;
            //}
            var find = $(document).find('.kj-context-menu');
            if (find.length > 0 && find.first().data('kendoExtContextMenu') instanceof kendo.ui.Menu) {
                find.first().data('kendoExtContextMenu').show(x, y);
            }
        },

        /**
         * Hide context menu for active widget
         * @private
         */
        _hideContextMenu: function() {
            var find = $(document).find('.kj-context-menu');
            if (find.length > 0 && find.first().data('kendoExtContextMenu') instanceof kendo.ui.Menu) {
                find.first().data('kendoExtContextMenu').hide();
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
            $(that.element).removeClass('k-widget kj-page');
        },

        /**
         * Destroys the widget including bounds to the data source
         */
        destroy: function () {
            var that = this;
            that._clear();
            if (that.options.dataSource) {
                if (that._refreshHandler) {
                    that.options.dataSource.unbind(constants.CHANGE, that._refreshHandler);
                }
            }
        }

    });

    kendo.ui.plugin(Page);

}(jQuery));
