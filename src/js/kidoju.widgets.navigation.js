/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

        //Types
        NULL = null,
        NUMBER = 'number',
        STRING = 'string',
        EMPTY_GUID = '00000000-0000-0000-0000-000000000000',

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        NS = '.kendoNavigation',

        //Widget
        WIDGET_CLASS = 'k-widget k-group kj-navigation',
        HOVER_CLASS = 'k-state-hover',
        FOCUSED_CLASS = 'k-state-focused',
        SELECTED_CLASS = 'k-state-selected',
        ALL_WRAPPERS_SELECTOR = '.kj-navigation-page[data-uid]',
        WRAPPER_BYUID_SELECTOR = '.kj-navigation-page[data-uid="{0}"]',
        ARIA_SELECTED = 'aria-selected',
        SCROLLBAR_WIDTH = 20,

        DEBUG = true,
        MODULE = 'kidoju.widgets.navigation: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function isGuid(value) {
        //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        return  ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
    }

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * Navigation widget
     * *class
     * @type {*}
     */
    var Navigation = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
            that._templates();
            that._layout();
            that._dataSource();
            //that.refresh();
        },

        options: {
            name: 'Navigation',
            autoBind: true,
            itemTemplate: '<div data-uid="#= uid #" class="kj-navigation-page" role="option" aria-selected="false"><div data-role="page"></div></div>',
            addTemplate: '<div data-uid="#= uid #" class="kj-navigation-page" role="option" aria-selected="false"><div>#= text #</div></div>',
            pageWidth: 1024, //TODO: assuming page size here: where do we read it from?
            pageHeight: 768,
            selectionBorder: 10, //this is the padding of the page wrapper, which draws a border around it
            pageSpacing: 20, //pageSpacing - selectionBorder determines the margin
            messages: {
                newPage: 'New Page'
            }
        },

        /**
         * @method setOptions
         * @param options
         */
        //setOptions: function(options) {
        //    Widget.fn.setOptions.call(this, options);
        //    TODO: we need to read height and width both from styles and options and decide which wins
        //},

        /**
         * IMPORTANT: index is 0 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this, page;
            if(value !== undefined) {
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'index set to ' + value);
                }
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else {
                    page = that.dataSource.at(value);
                    that.selection(page);
                }
            } else {
                page = that.dataSource.getByUid(that._selectedUid);
                if (page instanceof kidoju.Page) {
                    return that.dataSource.indexOf(page);
                } else {
                    return -1;
                }
            }
        },

        /**
         * @method id
         * @param value
         * @returns {*}
         */
        id: function (value) {
            var that = this, page;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                page = that.dataSource.get(value);
                that.selection(page);
            } else {
                page = that.dataSource.getByUid(that._selectedUid);
                if (page instanceof kidoju.Page) {
                    return page[page.idField];
                } else {
                    return undefined;
                }
            }
        },

        /**
         * @method selection
         * @param value
         * @returns {*}
         */
        selection: function(value) {
            var that = this;
            if (value !== undefined) {
                if (!(value instanceof kidoju.Page)) {
                    throw new TypeError();
                }
                //This might be executed before the dataSource is actually read
                //In this case, we should store the value temporarily to only assign it in the refresh method
                if (!isGuid(that._selectedUid) && that.length() === 0) {
                    that._tmp = value;
                } else {
                    if (value.uid !== that._selectedUid) {
                        var index = that.dataSource.indexOf(value);
                        if (index >= 0) { //index === -1 if not found
                            that._selectedUid = value.uid;
                            var e = $.Event(CHANGE, {
                                index: index,
                                id: value[value.idField],
                                value: value
                            });
                            that.refresh(e);
                            that.trigger(CHANGE, e);
                        }
                    }
                }
            } else {
                return that.dataSource.getByUid(that._selectedUid);
                //This returns undefined if not found
            }
        },

        /**
         * @method total()
         * @returns {*}
         */
        length: function() {
            return (this.dataSource instanceof kidoju.PageCollectionDataSource) ? this.dataSource.total() : 0;
        },

        /**
         * Height of navigation
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
         * Width of navigation
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


        _templates: function() {
            this.itemTemplate = kendo.template(this.options.itemTemplate);
            this.addTemplate = kendo.template(this.options.addTemplate);
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
            if ( that.dataSource instanceof kidoju.PageCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageCollectionDataSource.create(that.options.dataSource);

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
            that.element
                .addClass(WIDGET_CLASS)
                .attr('role', 'listbox')
                .on(CLICK + NS, ALL_WRAPPERS_SELECTOR, $.proxy(that._clickHandler, that))
                .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALL_WRAPPERS_SELECTOR, that._toggleHover); //$.proxy(that._toggleHover, that))
        },

        /**
         * Refreshes the widget when dataSource changes
         * @param e
         */
        refresh: function(e) {
            var that = this,
                navigation = that.element,
                scale = (navigation.width()  - SCROLLBAR_WIDTH - 2 * parseInt(that.options.pageSpacing)) / that.options.pageWidth;
            if (e=== undefined || e.action === undefined) {
                var data = [];
                if (e === undefined && that.dataSource instanceof kidoju.PageCollectionDataSource) {
                    data = that.dataSource.data(); //view();
                } else if (e.items) {
                    data = e.items;
                }
                for (var i = 0; i < data.length ; i++) {
                    if (data[i] instanceof kidoju.Page) {
                        if (navigation.find(kendo.format(WRAPPER_BYUID_SELECTOR, data[i].uid)).length) {
                            //TODO: refresh
                        } else {
                            $(that.itemTemplate({uid : data[i].uid}))
                                .css('box-sizing', 'border-box')
                                .css('position', 'relative')
                                .css('padding', parseInt(that.options.selectionBorder))
                                .css('margin', parseInt(that.options.pageSpacing) - parseInt(that.options.selectionBorder))
                                .append('<div style="position:absolute; top: 10px; left: 10px; height: 20px; width: 20px; background-color: black;"></div>')
                                .appendTo(navigation)
                                .find(kendo.roleSelector('page')).kendoPage({
                                    mode: kendo.ui.Page.fn.modes.thumbnail,
                                    dataSource: data[i].items,
                                    //width: ???,
                                    //height: ???,
                                    scale: scale
                                });
                        }
                    }
                }
            }

            that.displaySelection();
            that.resize();

            /*
            if(e.action === 'add') {
                $.noop();
            } else if (e.action === 'remove') {
                $.noop();
            } else if (e.action === 'itemchange') {
                $.noop();
            }
            */
        },

        /**
         * Adds the k-state-selected class to the selected page determined by that._selectedUid
         * This actually adds a coloured border
         * @method displaySelection
         */
        displaySelection: function() {
            var that = this,
                navigation = that.element;

            navigation.find(ALL_WRAPPERS_SELECTOR)
                .removeClass(SELECTED_CLASS)
                .removeProp(ARIA_SELECTED);

            navigation.find(kendo.format(WRAPPER_BYUID_SELECTOR, that._selectedUid))
                .addClass(SELECTED_CLASS)
                .prop(ARIA_SELECTED, true);
        },

        /**
         * Resizes pages according to widget size
         * @method resize
         */
        resize: function() {
            var that = this,
                navigation = that.element,
                scale = (navigation.width() - 2 * parseInt(that.options.pageSpacing)) / that.options.pageWidth;

            //TODO: we are not clear with borders here
            //we actually need the widget's outerWidth and outerHeight
            //becaus a border might be added to pageWidth and pageHeight
            navigation.find(ALL_WRAPPERS_SELECTOR)
                .width(scale * parseInt(that.options.pageWidth))
                .height(scale * parseInt(that.options.pageHeight));

            var pages = navigation.find(kendo.roleSelector('page'));
            for (var i = 0; i < pages.length; i++) {
                $(pages[i]).data('kendoPage').scale(scale);
            }
        },

        /**
         * Toggles the hover style when mousing over the page wrapper (page + selection border)
         * @method _toggleHover
         * @param e
         * @private
         */
        _toggleHover: function(e) {
            if (e instanceof $.Event) {
                var target = $(e.currentTarget);
                target.toggleClass('k-state-hover', e.type === MOUSEENTER);
            }
        },

        /**
         * Click event handler bond to page wrappers to select a page
         * @method _clickHandler
         * @param e
         * @private
         */
        _clickHandler: function(e) {
            if (e instanceof $.Event) {
                var that = this,
                    target = $(e.currentTarget),
                    navigation = target.closest(kendo.roleSelector('navigation'));
                e.preventDefault();
                if (!target.is('.' + SELECTED_CLASS)) {
                    var page = this.dataSource.getByUid(target.attr(kendo.attr("uid")));
                    this.selection(page);
                }
            }
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            kendo.unbind(that.element);
            //unbind all other events
            that.element.find('*').off();
            that.element
                .off()
                .empty()
                .removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Navigation);

}(jQuery));