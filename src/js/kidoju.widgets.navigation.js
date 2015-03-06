/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,
        kidoju = window.kidoju,

        //Types
        NULL = null,
        NUMBER = 'number',
        STRING = 'string',

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        DATABINDING = 'dataBinding',
        DATABOUND = 'dataBound',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        SELECT = 'select',
        NS = '.kendoNavigation',

        //Widget
        WIDGET_CLASS = 'k-widget k-group kj-navigation',
        HOVER_CLASS = 'k-state-hover',
        FOCUSED_CLASS = 'k-state-focused',
        HINT_CLASS = 'kj-hint',
        SELECTED_CLASS = 'k-state-selected',
        ITEM_CLASS = '.kj-item',
        ALL_ITEMS_SELECTOR = '.kj-item[data-uid]',
        ITEM_BYUID_SELECTOR = '.kj-item[data-uid="{0}"]',
        DATA_UID = 'data-uid',
        ARIA_SELECTED = 'aria-selected',

        DEBUG = true,
        MODULE = 'kidoju.widgets.navigation: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function isGuid(value) {
        //See http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
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

        /**
         * Widget constructor
         * @param element
         * @param options
         */
        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            that._templates();
            that._layout();
            that._addSorting();
            that._dataSource();
            //that.refresh();
            log('widget initialized');
        },

        /**
         * Wdiget options
         */
        options: {
            name: 'Navigation',
            autoBind: true,
            itemTemplate: '<div data-uid="#= uid #" class="kj-item" role="option" aria-selected="false"><div data-role="stage"></div></div>',
            addTemplate: '<div data-uid="#= uid #" class="kj-item" role="option" aria-selected="false"><div>#: text #</div></div>',
            pageWidth: 1024, //TODO: assuming page size here: where do we read it from?
            pageHeight: 768,
            selectionBorder: 10, //this is the padding of the page wrapper, which draws a border around it
            pageSpacing: 20, //pageSpacing - selectionBorder determines the margin
            handleIcon: 'calibration_mark.svg',
            messages: {
                newPage: 'New Page'
            }
        },

        /**
         * Widget events
         */
        events: [
            CHANGE,
            DATABINDING,
            DATABOUND,
            SELECT
        ],

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
                log('index set to ' + value);
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
                if ($.type(value) !== STRING && $.type(value) !== NUMBER) {
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
                        if (index > -1) {
                            that._selectedUid = value.uid;
                            var e = $.Event(CHANGE, {
                                index: index,
                                id: value[value.idField],
                                value: value
                            });
                            that._toggleSelection();
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

        /**
         * Templates
         * @private
         */
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
            //Define element
            that.element
                .addClass(WIDGET_CLASS)
                .attr('role', 'listbox')
                .on(CLICK + NS, ALL_ITEMS_SELECTOR, $.proxy(that._clickHandler, that))
                .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALL_ITEMS_SELECTOR, that._toggleHover); //$.proxy(that._toggleHover, that))
            //Define wrapper for visible bindings
            that.wrapper = that.element;
        },

        /**
         * Add a navigation item containing a stage(page) at index to navigation
         * @param page
         * @param index TODO
         * @private
         */
        _addNavigationItem: function(page, index) {
            var that = this,
                navigation = that.element;

            //Check that we get a page that is not already in navigation
            if (page instanceof kidoju.Page && navigation.find(kendo.format(ITEM_BYUID_SELECTOR, page.uid)).length === 0) {

                //Create navigation item (actually a selection frame around the thumbnail stage)
                var navigationItem = $(that.itemTemplate({uid : page.uid}))
                    .css({
                        boxSizing: 'border-box',
                        position: 'relative',
                        padding: parseInt(that.options.selectionBorder),
                        margin: parseInt(that.options.pageSpacing) - parseInt(that.options.selectionBorder)
                    });

                //append the menu icon //TODO<------------------------------------------------------------ icon
                //Top left should be determined by that.options.selectionBorder
                navigationItem.append('<div style="position:absolute; top: 10px; left: 10px; height: 20px; width: 20px; background-color: black;"></div>');

                //Add to navigation
                navigation.append(navigationItem); //TODO <----------------------------------------------------- index

                //Make the stage and bind to components
                navigationItem.find(kendo.roleSelector('stage')).kendoStage({
                    mode: kendo.ui.Stage.fn.modes.thumbnail,
                    dataSource: page.components,
                    scale: that._getStageScale()
                });
            }
        },

        /**
         * Remove a navigation item containing a stage(page) from navigation
         * @param uid
         * @private
         */
        _removeNavigationItemByUid: function(uid) {
            //Find and remove navigation item containing stage
            var navigationItem = this.element.find(kendo.format(ITEM_BYUID_SELECTOR, uid));
            //kendo.unbind(navigationItem);
            kendo.destroy(navigationItem);
            navigationItem.off(NS).remove();
        },

        /**
         * Refreshes the widget when dataSource changes
         * @param e
         */
        refresh: function(e) {
            var that = this;

            if (e=== undefined || e.action === undefined) {
                var pages = [];
                if (e === undefined && that.dataSource instanceof kidoju.PageCollectionDataSource) {
                    pages = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    pages = e.items;
                }
                //that.trigger(DATABINDING);
                $.each(that.element.find(ITEM_CLASS), function(index, navigationItem) {
                    that._removeNavigationItemByUid($(navigationItem).attr(DATA_UID));
                });
                $.each(pages, function(index, page) {
                    that._addNavigationItem(page);
                });
                //that.trigger(DATABOUND);

            } else if (e.action === 'add' && $.isArray(e.items) && e.items.length) {
                $.each(e.items, function(index, page) {
                    that._addNavigationItem(page);
                    that.trigger(CHANGE, {action: e.action, value: page});
                    //that._selectByUid(page.uid); //TODO
                });
            } else if (e.action === 'remove') {
                $.each(e.items, function(index, page) {
                    that._removeNavigationItemByUid(page.uid);
                    that.trigger(CHANGE, {action: e.action, value: page});
                    //that._selectByUid(null); //TODO
                });

            } else if (e.action === 'itemchange') {
                $.noop(); //TODO
            }

            that._toggleSelection();
            that.resize();
        },

        /**
         * Add sorting
         * @private
         */
        _addSorting: function() {
            var that = this;
            that.element.kendoSortable({
                hint:function(element) {
                    return element.clone().addClass(HINT_CLASS);
                },
                change: function(e) {
                    if (e.action === 'sort' && e.item instanceof $ && $.type(e.oldIndex) === NUMBER && $.type(e.newIndex) === NUMBER) {
                        $.noop(); //TODO reorder dataSOurce
                    }
                }
            });
        },

        /**
         * Adds the k-state-selected class to the selected page determined by that._selectedUid
         * This actually adds a coloured border
         * @method displaySelection
         */
        _toggleSelection: function() {
            this.element.find(ALL_ITEMS_SELECTOR)
                .removeClass(SELECTED_CLASS)
                .removeProp(ARIA_SELECTED);

            this.element.find(kendo.format(ITEM_BYUID_SELECTOR, this._selectedUid))
                .addClass(SELECTED_CLASS)
                .prop(ARIA_SELECTED, true);
        },

        /**
         * Get stage scale
         * @returns {number}
         * @private
         */
        _getStageScale: function() {
            var scale = (this.element.innerWidth() - 2 * parseInt(this.options.pageSpacing)) / this.options.pageWidth;
            if (scale < 0) {
                scale = 0;
            }
            return scale;
        },

        /**
         * Resizes pages according to widget size
         * @method resize
         */
        resize: function() {
            var that = this,
                navigation = that.element,
                scale = that._getStageScale();

            //TODO: we are not clear with borders here
            //we actually need the widget's outerWidth and outerHeight
            //becaus a border might be added to pageWidth and pageHeight
            navigation.find(ALL_ITEMS_SELECTOR)
                .width(scale * parseInt(that.options.pageWidth))
                .height(scale * parseInt(that.options.pageHeight));

            var stages = navigation.find(kendo.roleSelector('stage'));
            for (var i = 0; i < stages.length; i++) {
                $(stages[i]).data('kendoStage').scale(scale);
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
                    var page = this.dataSource.getByUid(target.attr(kendo.attr('uid')));
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

}(this, jQuery));
