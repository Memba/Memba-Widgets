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
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        FOCUS = 'focus',
        BLUR = 'blur',
        NS = ".kendoExplorer",

        //Widget
        WIDGET_CLASS = 'k-widget kj-explorer k-group', //k-list-container k-reset
        HOVER_CLASS = 'k-state-hover',
        FOCUSED_CLASS = 'k-state-focused',
        SELECTED_CLASS = 'k-state-selected',
        ALLITEMS_SELECTOR = 'li.k-item[data-uid]',
        UID_SELECTOR = 'li.k-item[data-uid="{0}"]',
        ARIA_SELECTED = 'aria-selected',
        
        DEBUG = true,
        MODULE = 'kidoju.widgets.explorer: ';

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
     * Explorer widget
     * *class
     * @type {*}
     */
    var Explorer = Widget.extend({

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

        /**
         * @property options
         */
        options: {
            name: 'Explorer',
            index: 0,
            id: null,
            autoBind: true,
            itemTemplate: '<li data-uid="#= uid #" tabindex="-1" unselectable="on" role="option" class="k-item"><span class="k-in">#= tool #</span></li>',
            imageTemplate: '<img>', //TODO image template
            messages: {
                empty: 'No item to display'
            }
        },

        /**
         * @method setOptions
         * @param options
         */
        setOptions: function(options) {
            Widget.fn.setOptions.call(this, options);
            //TODO initialize properly from that.options.index and that.options.id
        },

        /**
         * @property events
         */
        events: [
            CHANGE
        ],

        /**
         * IMPORTANT: index is 0 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this;
            if(value !== undefined) {
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'index set to ' + value);
                }
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else {
                    var pageItem = that.dataSource.at(value);
                    that.selection(pageItem);
                }
            } else {
                var pageItem = that.dataSource.getByUid(that._selectedUid);
                if (pageItem instanceof kidoju.PageItem) {
                    return that.dataSource.indexOf(pageItem);
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
            var that = this;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                var pageItem = that.dataSource.get(value);
                that.selection(pageItem);
            } else {
                var pageItem = that.dataSource.getByUid(that._selectedUid);
                if (pageItem instanceof kidoju.PageItem) {
                    return pageItem[pageItem.idField];
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
                if (!(value instanceof kidoju.PageItem)) {
                    throw new TypeError();
                }
                //This might be executed before the dataSource is actually read
                //In this case, we should store the value temporarily
                if (!isGuid(that._selectedUid) && that.dataSource.total() === 0) {
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
                            that.refresh(e); //TODO review when MVVM
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
            return (this.dataSource instanceof kidoju.PageItemCollectionDataSource) ? this.dataSource.total() : 0;
        },

        /**
         * @method items
         * @returns {Function|children|t.children|HTMLElement[]|ct.children|node.children|*}
         */
        items: function() {
            return this.list[0].children;
        },

        /**
         * @method _templates
         * @private
         */
        _templates: function() {
            var that = this;
            that.itemTemplate = kendo.template(that.options.itemTemplate);
            that.imageTemplate = kendo.template(that.options.imageTemplate);
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
            var that = this,
                explorer = that.element;
            that.list = explorer.find('ul.k-list');
            if (!that.list.length) {
                that.list = $('<ul tabindex="-1" unselectable="on" role="listbox" class="k-list k-reset" />').appendTo(explorer);
            }
            explorer
                .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALLITEMS_SELECTOR, that._toggleHover)
                //.on(FOCUS + NS + ' ' + BLUR + NS, ALLITEMS_SELECTOR, that._toggleFocus)
                .on(CLICK + NS , ALLITEMS_SELECTOR, $.proxy(that._click, that))
                .addClass(WIDGET_CLASS);

            kendo.notify(that);
        },

        /**
         * @method refresh
         * @param e
         */
        refresh: function(e) {
            var that = this,
                html = '';

            if (e && e.action === 'itemchange') {
                return; //we only update the playbar on loading, 'add' and 'remove'
            }

            if (e === undefined || e.type !== CHANGE) {

                var data = [];
                if (e=== undefined && that.dataSource instanceof kidoju.PageItemCollectionDataSource) {
                    data = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    data = e.items;
                }
                for (var i = 0; i < data.length; i++) {
                    html += that.itemTemplate(data[i]);
                }
                that.list.html(html);

                //See selection method:
                //MVVM might bind selection before dataSource is read
                //So we wait here until dataSource is read to assign selection
                if(html.length > 0 && that._tmp instanceof kidoju.PageItem) {
                    that.selection(that._tmp);
                    delete that._tmp;
                }
            }

            that.list.find(ALLITEMS_SELECTOR)
                .removeClass(SELECTED_CLASS)
                .removeProp(ARIA_SELECTED);
            that.list.find(kendo.format(UID_SELECTOR, that._selectedUid))
                .addClass(SELECTED_CLASS)
                .prop(ARIA_SELECTED, true);
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass(HOVER_CLASS, e.type === MOUSEENTER);
        },

        /*
        _toggleFocus: function(e) {
            $(e.currentTarget).toggleClass(FOCUSED_CLASS, e.type === FOCUS);
        },
        */

        /**
         * Click event handler
         * @param e
         * @private
         */
        _click: function(e) {
            var target = $(e.currentTarget);
            e.preventDefault();
            if (!target.is('.' + SELECTED_CLASS)) {
                var pageItem = this.dataSource.getByUid(target.attr(kendo.attr("uid")));
                this.selection(pageItem);
            }
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this,
                explorer = that.element;
            //unbind kendo
            kendo.unbind(explorer);
            //unbind all other events
            explorer.find('*').off();
            explorer
                .off(NS)
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

    kendo.ui.plugin(Explorer);

}(jQuery));