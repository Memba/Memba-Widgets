/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.sortable',
        './kidoju.data',
        './kidoju.tools'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        // shorten references to variables for uglification
        // var fn = Function,
        //     global = fn('return this')(),
        var kendo = window.kendo;
        var data = kendo.data;
        var ObservableArray = kendo.data.ObservableArray;
        var Widget = kendo.ui.Widget;
        var kidoju = window.kidoju;
        var PageComponent = kidoju.data.PageComponent;
        var PageComponentCollectionDataSource = kidoju.data.PageComponentCollectionDataSource;
        var PageCollectionDataSource = kidoju.data.PageCollectionDataSource;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.explorer');
        var STRING = 'string';
        var NUMBER = 'number';
        var NULL = null;
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var UL = '<ul tabindex="-1" unselectable="on" role="listbox" class="k-list k-reset" />';
        var DATABINDING = 'dataBinding';
        var DATABOUND = 'dataBound';
        var MOUSEENTER = 'mouseenter';
        var MOUSELEAVE = 'mouseleave';
        var FOCUS = 'focus';
        var BLUR = 'blur';
        var SELECT = 'select';
        var NS = '.kendoExplorer';
        var WIDGET_CLASS = 'k-widget k-group kj-explorer'; // k-list-container k-reset
        var HOVER_CLASS = 'k-state-hover';
        var FOCUSED_CLASS = 'k-state-focused';
        var SELECTED_CLASS = 'k-state-selected';
        var PLACEHOLDER_CLASS = 'kj-placeholder';
        var HINT_CLASS = 'kj-hint';
        var DATA_UID = kendo.attr('uid');
        var ALL_ITEMS_SELECTOR = 'li.kj-item[' + DATA_UID + ']';
        var ITEM_BYUID_SELECTOR = 'li.kj-item[' + DATA_UID + '="{0}"]';
        var ARIA_SELECTED = 'aria-selected';
        var DEFAULT_EXTENSION = '.svg';
        var DEFAULT_PATH = './styles/images/';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function isGuid(value) {
            // http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
            return ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
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

            init: function (element, options) {
                var that = this;
                // Base call to widget initialization
                Widget.fn.init.call(this, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._templates();
                that._layout();
                that._addSorting();
                that._dataSource();
                // that.refresh();
            },

            /**
             * @property options
             */
            options: {
                name: 'Explorer',
                index: 0,
                id: NULL,
                autoBind: true,
                itemTemplate: '<li data-uid="#= uid #" tabindex="-1" unselectable="on" role="option" class="k-item kj-item"><span class="k-in"><img class="k-image kj-image" alt="#= tool #" src="#= icon #">#= tool #</span></li>',
                iconPath: DEFAULT_PATH,
                extension: DEFAULT_EXTENSION,
                messages: {
                    empty: 'No item to display'
                }
            },

            /**
             * @method setOptions
             * @param options
             */
            /*
            setOptions: function (options) {
                Widget.fn.setOptions.call(this, options);
                // TODO initialize properly from that.options.index and that.options.id
            },
            */

            /**
             * @property events
             */
            events: [
                CHANGE,
                DATABINDING,
                DATABOUND,
                SELECT
            ],

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * IMPORTANT: index is 0 based
             * @method index
             * @param index
             * @returns {*}
             */
            index: function (index) {
                /* jshint maxcomplexity: 8 */
                var that = this;
                var component;
                if ($.type(index) === NUMBER) {
                    if ((index % 1 !== 0) || (index < -1) || (index >= that.length())) {
                        throw new RangeError();
                    }
                    component = that.dataSource.at(index);
                    if (component instanceof PageComponent) {
                        that.value(component);
                    } else {
                        that.value(NULL);
                    }
                } else if ($.type(index) === UNDEFINED) {
                    component = that.dataSource.getByUid(that._selectedUid);
                    if (component instanceof PageComponent) {
                        return that.dataSource.indexOf(component);
                    } else {
                        return -1;
                    }
                } else {
                    throw new TypeError();
                }
            },

            /* jshint +W074 */

            /**
             * @method id
             * @param id
             * @returns {*}
             */
            id: function (id) {
                var that = this;
                var component;
                if ($.type(id) === STRING || $.type(id) === NUMBER) {
                    component = that.dataSource.get(id);
                    if (component instanceof PageComponent) {
                        that.value(component);
                    } else {
                        that.value(NULL);
                    }
                } else if ($.type(id) === UNDEFINED) {
                    component = that.dataSource.getByUid(that._selectedUid);
                    if (component instanceof PageComponent) {
                        return component[component.idField];
                    }
                } else {
                    throw new TypeError();
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Gets/Sets the value of the selected component in the explorer
             * @method value
             * @param component
             * @returns {*}
             */
            value: function (component) {
                var that = this;
                if (component === NULL || component instanceof PageComponent) {
                    var hasChanged = false;
                    if (component === NULL && that._selectedUid !== NULL) {
                        hasChanged = true;
                        that._selectedUid = NULL;
                    } else if (component instanceof PageComponent && that._selectedUid !== component.uid && that.dataSource.indexOf(component) > -1) {
                        hasChanged = true;
                        that._selectedUid = component.uid;
                    }
                    if (hasChanged) {
                        logger.debug('selected component uid set to ' + that._selectedUid);
                        that._toggleSelection();
                        that.trigger(CHANGE, { value: component });
                    }
                } else if ($.type(component) === UNDEFINED) {
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
                return (this.dataSource instanceof PageComponentCollectionDataSource) ? this.dataSource.total() : -1;
            },

            /**
             * Returns all children of the ul list
             * This method is required for triggering the dataBinding evvent
             * @method items
             * @returns {Function|children|t.children|HTMLElement[]|ct.children|node.children|*}
             */
            items: function () {
                return this.ul[0].children;
            },

            /**
             * @method _templates
             * @private
             */
            _templates: function () {
                var that = this;
                that.iconPath = that.options.iconPath + (/\/$/.test(that.options.iconPath + '') ? '' : '/') + '{0}' +
                    (/^\./.test(that.options.extension + '') ? '' : '.') + that.options.extension;
                that.itemTemplate = kendo.template(that.options.itemTemplate);
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
                // if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
                if (that.dataSource instanceof PageComponentCollectionDataSource && that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }

                if (that.options.dataSource !== NULL) {  // use null to explicitly destroy the dataSource bindings

                    // returns the datasource OR creates one if using array or configuration object
                    that.dataSource = PageComponentCollectionDataSource.create(that.options.dataSource);

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
                // Add wrapper property for visible bindings
                that.wrapper = that.element;
                // Add ul property
                that.ul = that.element.find('ul.k-list');
                if (!that.ul.length) {
                    that.ul = $(UL).appendTo(that.element);
                }
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
                that.ul.kendoSortable({
                    filter: ALL_ITEMS_SELECTOR,
                    holdToDrag: kendo.support.touch,
                    hint: function (element) {
                        // element is LI, so it needs to be wrapped in UL
                        // but because of styles we need to wrap the UL in a DIV
                        return element.clone()
                            .width(element.width())
                            .height(element.height())
                            .addClass(HINT_CLASS) // Note: note used
                            .wrap(UL).parent().wrap('<div/>').parent();
                    },
                    placeholder: function (element) {
                        return element.clone().addClass(PLACEHOLDER_CLASS);
                    },
                    change: function (e) {
                        assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                        assert.instanceof(kidoju.data.PageComponentCollectionDataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'that.dataSource', 'kidoju.data.PageComponentCollectionDataSource'));
                        if (e.action === 'sort' && e.item instanceof $ && $.type(e.oldIndex) === NUMBER && $.type(e.newIndex) === NUMBER) {
                            var component = that.dataSource.at(e.oldIndex);
                            assert.equal(e.item.attr(kendo.attr('uid')), component.uid, kendo.format(assert.messages.equal.default, 'component.uid', 'e.item.attr("data-uid")'));
                            that.dataSource.remove(component);
                            that.dataSource.insert(e.newIndex, component);
                        }
                    }
                });
            },

            /**
             * Add an explorer item (li) corresponding to a component
             * @param component
             * @param index
             * @private
             */
            _addItem: function (component, index) {
                var that = this;
                var list = that.ul;

                // Check that we get a component that is not already in explorer
                if (list instanceof $ && list.length &&
                    component instanceof PageComponent &&
                    list.find(kendo.format(ITEM_BYUID_SELECTOR, component.uid)).length === 0) {

                    var tool = kidoju.tools[component.tool];
                    if (tool instanceof kidoju.Tool) {

                        // Create explorer item
                        var explorerItem = that.itemTemplate({
                            uid: component.uid,
                            tool: component.tool, // also tool.id
                            icon: kendo.format(that.iconPath, tool.icon)
                        });

                        // Add to explorer list
                        var nextIndex = $.type(index) === NUMBER ? index : list.children(ALL_ITEMS_SELECTOR).length;
                        var nextExplorerItem = list.children(ALL_ITEMS_SELECTOR + ':eq(' + nextIndex + ')');
                        if (nextExplorerItem.length) {
                            nextExplorerItem.before(explorerItem);
                        } else {
                            list.append(explorerItem);
                        }
                    }
                }
            },

            /**
             * Remove an explorer item
             * @param uid
             * @private
             */
            _removeItemByUid: function (uid) {
                if (this.ul instanceof $ && this.ul.length) {
                    // Find and remove an explorer item
                    var item = this.ul.find(kendo.format(ITEM_BYUID_SELECTOR, uid));
                    item.off().remove();
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * @method refresh
             * @param e
             */
            refresh: function (e) {
                var that = this;
                var selectedIndex = that.index();
                if (e && e.action === undefined) {
                    that.trigger(DATABINDING);
                }
                if (e === undefined || e.action === undefined) {
                    var components = [];
                    if (e === undefined && that.dataSource instanceof PageCollectionDataSource) {
                        components = that.dataSource.data();
                    } else if (e && e.items instanceof ObservableArray) {
                        components = e.items;
                    }
                    $.each(that.element.find(ALL_ITEMS_SELECTOR), function (index, item) {
                        that._removeItemByUid($(item).attr(DATA_UID));
                    });
                    $.each(components, function (index, component) {
                        that._addItem(component);
                    });
                } else if (e.action === 'add' && $.isArray(e.items) && e.items.length) {
                    $.each(e.items, function (index, component) {
                        selectedIndex = that.dataSource.indexOf(component);
                        that._addItem(component, selectedIndex);
                    });
                } else if (e.action === 'remove' && $.isArray(e.items) && e.items.length) {
                    $.each(e.items, function (index, page) {
                        that._removeItemByUid(page.uid);
                        selectedIndex = e.index || -1;
                    });
                } else if (e.action === 'itemchange') {
                    return;
                }
                var total = that.dataSource.total();
                if (selectedIndex >= total) {
                    selectedIndex = total - 1;
                }
                that.index(selectedIndex);
                // TODO Display a message when there is no data to display?
                if (e && e.action === undefined) {
                    that.trigger(DATABOUND);
                }
            },

            /* jshint +W074 */

            /**
             * Toggles class on selected item determined by value of widget
             * @private
             */
            _toggleSelection: function () {
                this.ul.find(ALL_ITEMS_SELECTOR)
                    .removeClass(SELECTED_CLASS)
                    .removeProp(ARIA_SELECTED);

                this.ul.find(kendo.format(ITEM_BYUID_SELECTOR, this._selectedUid))
                    .addClass(SELECTED_CLASS)
                    .prop(ARIA_SELECTED, true);
            },

            /**
             * Toggles the hover style when mousing over explorer items
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
             * Click event handler
             * @param e
             * @private
             */
            _click: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                e.preventDefault();
                var target = $(e.currentTarget);
                if (!target.is('.' + SELECTED_CLASS)) {
                    var component = this.dataSource.getByUid(target.attr(kendo.attr('uid')));
                    this.value(component);
                }
            },

            /**
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                var explorer = that.element;
                // unbind kendo
                kendo.unbind(explorer);
                // unbind all other events
                explorer.find('*').off();
                explorer
                    .off(NS)
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
            }

        });

        kendo.ui.plugin(Explorer);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
