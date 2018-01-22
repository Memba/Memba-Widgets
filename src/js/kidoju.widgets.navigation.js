/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.sortable',
        './kidoju.data',
        './kidoju.tools',
        './kidoju.widgets.stage'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var ObservableArray = data.ObservableArray;
        var Widget = kendo.ui.Widget;
        var kidoju = window.kidoju;
        var Page = kidoju.data.Page;
        var PageCollectionDataSource = kidoju.data.PageCollectionDataSource;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.navigation');
        var NULL = null;
        var NUMBER = 'number';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var DATABINDING = 'dataBinding';
        var DATABOUND = 'dataBound';
        var MOUSEENTER = 'mouseenter';
        var MOUSELEAVE = 'mouseleave';
        var FOCUS = 'focus';
        var BLUR = 'blur';
        var SELECT = 'select';
        var NS = '.kendoNavigation';
        var WIDGET_CLASS = 'k-widget k-group kj-navigation';
        var HOVER_CLASS = 'k-state-hover';
        var FOCUSED_CLASS = 'k-state-focused';
        var SELECTED_CLASS = 'k-state-selected';
        var PLACEHOLDER_CLASS = 'kj-placeholder';
        var HINT_CLASS = 'kj-hint';
        var DATA_UID = kendo.attr('uid');
        var ALL_ITEMS_SELECTOR = 'div.kj-item[' + DATA_UID + ']';
        var ITEM_BYUID_SELECTOR = 'div.kj-item[' + DATA_UID + '="{0}"]';
        var ARIA_SELECTED = 'aria-selected';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function isGuid(value) {
            // See http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
            return ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
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
            init: function (element, options) {
                var that = this;
                // base call to widget initialization
                Widget.fn.init.call(this, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                // By default, no page is selected
                that._selectedUid = NULL;
                that._templates();
                that._layout();
                that._addSorting();
                that._dataSource();
                // that.refresh();
            },

            /**
             * Wdiget options
             */
            options: {
                name: 'Navigation',
                autoBind: true,
                mode: kendo.ui.Stage.fn.modes.design,
                itemTemplate: '<div data-#: ns #uid="#: uid #" class="kj-item" role="option" aria-selected="false"><div data-#: ns #role="stage"></div></div>',
                pageWidth: 1024, // TODO: assuming page size here: where do we read it from?
                pageHeight: 768,
                selectionBorder: 10, // this is the padding of the page wrapper, which draws a border around it
                pageSpacing: 20, // pageSpacing - selectionBorder determines the margin
                menuIcon: 'calibration_mark.svg',
                messages: {
                    empty: 'No item to display' // TODO: add message in UI (see refresh)
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
            // setOptions: function (options) {
            //    Widget.fn.setOptions.call(this, options);
            //    TODO: we need to read height and width both from styles and options and decide which wins
            // },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Gets/Sets the index of the selected page in the navigation
             * Note: index is 0 based, whereas playbar page numbers are 1 based
             * @method index
             * @param index
             * @returns {*}
             */
            index: function (index) {
                var that = this;
                var page;
                if ($.type(index) === NUMBER) {
                    if ((index % 1 !== 0) || (index < -1) || (index >= that.length())) {
                        throw new RangeError();
                    }
                    page = that.dataSource.at(index);
                    if (page instanceof Page) {
                        that.value(page);
                    } else {
                        that.value(NULL);
                    }
                } else if ($.type(index) === UNDEFINED) {
                    page = that.dataSource.getByUid(that._selectedUid);
                    if (page instanceof Page) {
                        return that.dataSource.indexOf(page);
                    } else {
                        return -1;
                    }
                } else {
                    throw new TypeError();
                }
            },

            /* jshint +W074 */

            /**
             * Gets/Sets the id of the selected page in the navigation
             * @method id
             * @param id
             * @returns {*}
             */
            id: function (id) {
                var that = this;
                var page;
                if ($.type(id) === STRING || $.type(id) === NUMBER) {
                    page = that.dataSource.get(id);
                    if (page instanceof Page) {
                        that.value(page);
                    } else {
                        that.value(NULL);
                    }
                } else if ($.type(id) === UNDEFINED) {
                    page = that.dataSource.getByUid(that._selectedUid);
                    if (page instanceof Page) {
                        return page[page.idField];
                    }
                } else {
                    throw new TypeError();
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Gets/Sets the value of the selected page in the navigation
             * Set to NULL to unselect a page (state where no page is selected)
             *
             * @method value
             * @param page
             * @returns {*}
             */
            value: function (page) {
                var that = this;
                if (page === NULL || page instanceof Page) {
                    var hasChanged = false;
                    if (page === NULL && that._selectedUid !== NULL) {
                        hasChanged = true;
                        that._selectedUid = NULL;
                    } else if (page instanceof Page && that._selectedUid !== page.uid && that.dataSource.indexOf(page) > -1) {
                        hasChanged = true;
                        that._selectedUid = page.uid;
                    }
                    if (hasChanged) {
                        logger.debug('selected page uid set to ' + that._selectedUid);
                        that._toggleSelection();
                        that.trigger(CHANGE, { value: page });
                    }
                } else if ($.type(page) === UNDEFINED) {
                    if (that._selectedUid === NULL) {
                        return NULL;
                    } else {
                        return that.dataSource.getByUid(that._selectedUid) || NULL; // getByUid returns undefined if not found
                    }
                } else {
                    throw new TypeError();
                }
            },

            /* jshint +W074 */

            /**
             * @method total()
             * @returns {*}
             */
            length: function () {
                return (this.dataSource instanceof PageCollectionDataSource) ? this.dataSource.total() : -1;
            },

            /**
             * Returns all children of the ul list
             * This method is required for triggering the dataBinding event
             * @method items
             * @returns {Function|children|t.children|HTMLElement[]|ct.children|node.children|*}
             */
            items: function () {
                return this.element[0].children;
            },

            /**
             * Height of navigation
             * @param value
             * @returns {string}
             */
            height: function (value) {
                var that = this;
                if (value) {
                    if ($.type(value) !== NUMBER) {
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
            width: function (value) {
                var that = this;
                if (value) {
                    if ($.type(value) !== NUMBER) {
                        throw new TypeError();
                    }
                    if (value < 0) {
                        throw new RangeError();
                    }
                    if (value !== that.options.width) {
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
            _templates: function () {
                this._itemTemplate = kendo.template(this.options.itemTemplate);
            },

            /**
             * Changes the dataSource
             * @method setDataSource
             * @param dataSource
             */
            setDataSource: function (dataSource) {
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
            _dataSource: function () {
                var that = this;
                // if the DataSource is defined and the _refreshHandler is wired up, unbind because
                // we need to rebuild the DataSource

                // There is no reason why, in its current state, it would not work with any dataSource
                // if ( that.dataSource instanceof DataSource && that._refreshHandler ) {
                if (that.dataSource instanceof PageCollectionDataSource && that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }

                if (that.options.dataSource !== NULL) {  // use null to explicitly destroy the dataSource bindings

                    // returns the datasource OR creates one if using array or configuration object
                    that.dataSource = PageCollectionDataSource.create(that.options.dataSource);

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
                // Define wrapper for visible bindings
                that.wrapper = that.element;
                // Define element
                that.element
                    .addClass(WIDGET_CLASS)
                    .attr('role', 'listbox')
                    .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALL_ITEMS_SELECTOR, that._toggleHover)
                    .on(FOCUS + NS + ' ' + BLUR + NS, ALL_ITEMS_SELECTOR, that._toggleFocus)
                    .on(CLICK + NS, ALL_ITEMS_SELECTOR, $.proxy(that._click, that));
                kendo.notify(that);
            },

            /**
             * Add sorting
             * @private
             */
            _addSorting: function () {
                var that = this;
                that.element.kendoSortable({
                    filter: ALL_ITEMS_SELECTOR,
                    holdToDrag: kendo.support.touch,
                    hint: function (element) {
                        return element.clone().addClass(HINT_CLASS);  // Note: note used
                    },
                    placeholder: function (element) {
                        return element.clone().addClass(PLACEHOLDER_CLASS);
                    },
                    change: function (e) {
                        assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                        assert.instanceof(kidoju.data.PageCollectionDataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'that.dataSource', 'kidoju.data.PageCollectionDataSource'));
                        if (e.action === 'sort' && e.item instanceof $ && $.type(e.oldIndex) === NUMBER && $.type(e.newIndex) === NUMBER) {
                            var page = that.dataSource.at(e.oldIndex);
                            assert.equal(e.item.attr(kendo.attr('uid')), page.uid, kendo.format(assert.messages.equal.default, 'page.uid', 'e.item.attr("data-uid")'));
                            // console.log(page.instructions + ': ' + e.oldIndex + '-->' + e.newIndex);
                            that.dataSource.remove(page);
                            that.dataSource.insert(e.newIndex, page);
                        }
                    }
                });
            },

            /**
             * Add a navigation item containing a stage(page) wrapped in a div
             * @param page
             * @param index
             * @private
             */
            _addItem: function (page, index) {
                var that = this;
                var navigation = that.element;

                // Check that we get a page that is not already in navigation
                if (page instanceof Page && navigation.find(kendo.format(ITEM_BYUID_SELECTOR, page.uid)).length === 0) {

                    // Create navigation item (actually a selection frame around the thumbnail stage)
                    var navigationItem = $(that._itemTemplate({ uid: page.uid, ns: kendo.ns }))
                        .css({
                            boxSizing: 'border-box',
                            position: 'relative',
                            padding: parseInt(that.options.selectionBorder, 10),
                            margin: parseInt(that.options.pageSpacing, 10) - parseInt(that.options.selectionBorder, 10)
                        });

                    // Add to navigation
                    var nextIndex = $.type(index) === NUMBER ? index : navigation.children(ALL_ITEMS_SELECTOR).length;
                    var nextNavigationItem = navigation.children(ALL_ITEMS_SELECTOR + ':eq(' + nextIndex + ')');
                    if (nextNavigationItem.length) {
                        nextNavigationItem.before(navigationItem);
                    } else {
                        navigation.append(navigationItem);
                    }

                    // Make the stage and bind to components
                    navigationItem.find(kendo.roleSelector('stage')).kendoStage({
                        mode: that.options.mode,
                        enable: false,
                        readonly: true,
                        dataSource: page.components,
                        scale: that._getStageScale()
                    });

                }
            },

            /**
             * Remove a navigation item (and its embedded stage)
             * @param uid
             * @private
             */
            _removeItemByUid: function (uid) {
                // Find and remove navigation item containing stage
                var item = this.element.find(kendo.format(ITEM_BYUID_SELECTOR, uid));
                // kendo.unbind(item);
                kendo.destroy(item);
                item.off().remove();
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Refreshes the widget when dataSource changes
             * @param e
             */
            refresh: function (e) {
                var that = this;
                var selectedIndex = that.index();
                if (e && e.action === undefined) {
                    that.trigger(DATABINDING);
                }
                if (e === undefined || e.action === undefined) {
                    var pages = [];
                    if (e === undefined && that.dataSource instanceof PageCollectionDataSource) {
                        pages = that.dataSource.data();
                    } else if (e && e.items instanceof ObservableArray) {
                        pages = e.items;
                    }
                    $.each(that.element.find(ALL_ITEMS_SELECTOR), function (index, item) {
                        that._removeItemByUid($(item).attr(DATA_UID));
                    });
                    $.each(pages, function (index, page) {
                        that._addItem(page);
                    });
                } else if (e.action === 'add' && $.isArray(e.items) && e.items.length) {
                    $.each(e.items, function (index, page) {
                        selectedIndex = that.dataSource.indexOf(page);
                        that._addItem(page, selectedIndex);
                    });
                } else if (e.action === 'remove' && $.isArray(e.items) && e.items.length) {
                    $.each(e.items, function (index, page) {
                        that._removeItemByUid(page.uid);
                    });
                    selectedIndex = e.index || -1;
                } else if (e.action === 'itemchange') {
                    return;
                }
                var total = that.dataSource.total();
                if (selectedIndex >= total) {
                    selectedIndex = total - 1;
                }
                that.index(selectedIndex);
                // TODO Display a message when there is no data to display?
                that.resize();
                if (e && e.action === undefined) {
                    that.trigger(DATABOUND);
                }
            },

            /* jshint +W074 */

            /**
             * Adds the k-state-selected class to the selected page determined by that._selectedUid
             * This actually adds a coloured border
             * @method displaySelection
             */
            _toggleSelection: function () {
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
            _getStageScale: function () {
                var scale = (this.element.innerWidth() - 2 * parseInt(this.options.pageSpacing, 10) - 2 * parseInt(this.options.selectionBorder, 10)) / parseInt(this.options.pageWidth, 10);
                if (scale < 0) {
                    scale = 0;
                }
                return scale;
            },

            /**
             * Resizes pages according to widget size
             * @method resize
             */
            resize: function () {
                var that = this;
                var navigation = that.element;
                var scale = that._getStageScale();

                // TODO: we are not clear with borders here
                // we actually need the widget's outerWidth and outerHeight
                // becaus a border might be added to pageWidth and pageHeight
                navigation.find(ALL_ITEMS_SELECTOR)
                    .width(scale * parseInt(that.options.pageWidth, 10))
                    .height(scale * parseInt(that.options.pageHeight, 10));

                var stages = navigation.find(kendo.roleSelector('stage'));
                for (var i = 0; i < stages.length; i++) {
                    $(stages[i]).data('kendoStage').scale(scale);
                }
            },

            /**
             * Toggles the hover style when mousing over mavigation items (a stage with ou outer div that acts as a frame)
             * @method _toggleHover
             * @param e
             * @private
             */
            _toggleHover: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                $(e.currentTarget).toggleClass(HOVER_CLASS, e.type === MOUSEENTER);
            },

            /**
             * Toggles the focus style when an explorer item has focus
             * @method _toggleFocus
             * @param e
             * @private
             */
            _toggleFocus: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                $(e.currentTarget).toggleClass(FOCUSED_CLASS, e.type === FOCUS);
            },

            /**
             * Click event handler bond to page wrappers to select a page
             * @method _click
             * @param e
             * @private
             */
            _click: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                e.preventDefault();
                var target = $(e.currentTarget);
                if (!target.is('.' + SELECTED_CLASS)) {
                    var page = this.dataSource.getByUid(target.attr(kendo.attr('uid')));
                    this.value(page);
                }
            },

            /**
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                kendo.unbind(that.element);
                // unbind all other events
                that.element.find('*').off();
                that.element
                    .off()
                    .empty()
                    .removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                that.setDataSource(NULL);
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(Navigation);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
