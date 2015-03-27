/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function(f, define){
    'use strict';
    define(['./kidoju.data', './kidoju.tools'], f);
})(function() {

    'use strict';

    (function ($, undefined) {

        // shorten references to variables for uglification
        //var fn = Function,
        //    global = fn('return this')(),
        var kendo = window.kendo,
            data = kendo.data,
            Widget = kendo.ui.Widget,
            kidoju = window.kidoju,

        //Types
            STRING = 'string',
            NUMBER = 'number',
            NULL = null,

        //Events
            CHANGE = 'change',
            CLICK = 'click',
            DATABINDING = 'dataBinding',
            DATABOUND = 'dataBound',
            MOUSEENTER = 'mouseenter',
            MOUSELEAVE = 'mouseleave',
            FOCUS = 'focus',
            BLUR = 'blur',
            SELECT = 'select',
            NS = '.kendoExplorer',

        //Widget
            WIDGET_CLASS = 'k-widget k-group kj-explorer', //k-list-container k-reset
            HOVER_CLASS = 'k-state-hover',
            FOCUSED_CLASS = 'k-state-focused',
            SELECTED_CLASS = 'k-state-selected',
            DATA_UID = kendo.attr('uid'),
            ALL_ITEMS_SELECTOR = 'li.kj-item[' + DATA_UID + ']',
            ITEM_BYUID_SELECTOR = 'li.kj-item[' + DATA_UID + '="{0}"]',
            ARIA_SELECTED = 'aria-selected';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.explorer: ' + message);
            }
        }

        function isGuid(value) {
            //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
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
                // base call to widget initialization
                Widget.fn.init.call(this, element, options);
                log('widget initialized');
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
                id: NULL,
                autoBind: true,
                itemTemplate: '<li data-uid="#= uid #" tabindex="-1" unselectable="on" role="option" class="k-item kj-item"><span class="k-in"><img class="k-image kj-image" alt="#= tool #" src="#= icon #">#= tool #</span></li>',
                iconPath: './styles/images/',
                messages: {
                    empty: 'No item to display'
                }
            },

            /**
             * @method setOptions
             * @param options
             */
            setOptions: function (options) {
                Widget.fn.setOptions.call(this, options);
                //TODO initialize properly from that.options.index and that.options.id
            },

            /**
             * @property events
             */
            events: [
                CHANGE,
                DATABINDING,
                DATABOUND,
                SELECT
            ],

            /**
             * IMPORTANT: index is 0 based
             * @method index
             * @param index
             * @returns {*}
             */
            index: function (index) {
                var that = this, component;
                if (index !== undefined) {
                    if ($.type(index) !== NUMBER || index % 1 !== 0) {
                        throw new TypeError();
                    } else if (index < 0 || (index > 0 && index >= that.length())) {
                        throw new RangeError();
                    } else {
                        component = that.dataSource.at(index);
                        that.value(component);
                    }
                } else {
                    component = that.dataSource.getByUid(that._selectedUid);
                    if (component instanceof kidoju.PageComponent) {
                        return that.dataSource.indexOf(component);
                    } else {
                        return -1;
                    }
                }
            },

            /**
             * @method id
             * @param id
             * @returns {*}
             */
            id: function (id) {
                var that = this, component;
                if (id !== undefined) {
                    if ($.type(id) !== NUMBER && $.type(id) !== STRING) {
                        throw new TypeError();
                    }
                    component = that.dataSource.get(id);
                    that.value(component);
                } else {
                    component = that.dataSource.getByUid(that._selectedUid);
                    if (component instanceof kidoju.PageComponent) {
                        return component[component.idField];
                    }
                }
            },

            /**
             * Gets/Sets the value of the selected component in the explorer
             * @method value
             * @param component
             * @returns {*}
             */
            value: function (component) {
                var that = this;
                if (component === NULL) {
                    if (that._selectedUid !== NULL) {
                        that._selectedUid = NULL;
                        log('selected component uid set to null');
                        that._toggleSelection();
                        that.trigger(CHANGE, {
                            index: undefined,
                            value: NULL
                        });
                    }
                } else if (component !== undefined) {
                    if (!(component instanceof kidoju.PageComponent)) {
                        throw new TypeError();
                    }
                    // Note: when that.value() was previously named that.selection() with a custom binding
                    // the selection binding was executed before the source binding so we had to record the selected component
                    // in a temp variable (that._tmp) and assign it to the _selectedUid in the refresh method,
                    // that is after the source was bound.
                    // The corresponding code has now been removed after renaming that.selection() into that.value()
                    // because the value binding is executed after the source binding.
                    if (component.uid !== that._selectedUid && isGuid(component.uid)) {
                        var index = that.dataSource.indexOf(component);
                        if (index > -1) {
                            that._selectedUid = component.uid;
                            log('selected component uid set to ' + component.uid);
                            that._toggleSelection();
                            that.trigger(CHANGE, {
                                index: index,
                                value: component
                            });
                        }
                    }
                } else {
                    if (that._selectedUid === NULL) {
                        return NULL;
                    } else {
                        return that.dataSource.getByUid(that._selectedUid); //Returns undefined if not found
                    }
                }
            },

            /**
             * @method total()
             * @returns {*}
             */
            length: function () {
                return (this.dataSource instanceof kidoju.PageComponentCollectionDataSource) ? this.dataSource.total() : -1;
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

                //There is no reason why, in its current state, it would not work with any dataSource
                //if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
                if (that.dataSource instanceof kidoju.PageComponentCollectionDataSource && that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }

                if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                    // returns the datasource OR creates one if using array or configuration object
                    that.dataSource = kidoju.PageComponentCollectionDataSource.create(that.options.dataSource);

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
                //Add wrapper property for visible bindings
                that.wrapper = that.element;
                //Add ul property
                that.ul = that.element.find('ul.k-list');
                if (!that.ul.length) {
                    that.ul = $('<ul tabindex="-1" unselectable="on" role="listbox" class="k-list k-reset" />')
                        .appendTo(that.element);
                }
                //Define element
                that.element
                    .addClass(WIDGET_CLASS)
                    .attr('role', 'listbox')
                    .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALL_ITEMS_SELECTOR, that._toggleHover)
                    .on(FOCUS + NS + ' ' + BLUR + NS, ALL_ITEMS_SELECTOR, that._toggleFocus)
                    .on(CLICK + NS, ALL_ITEMS_SELECTOR, $.proxy(that._click, that));
                kendo.notify(that);
            },

            //TODO add sorting

            /**
             * Add an explorer item (li) corresponding to a component
             * @param component
             * @param index //TODO: with sorting
             * @private
             */
            _addItem: function (component, index) {
                var that = this;

                //Check that we get a component that is not already in explorer
                if (that.ul instanceof $ && that.ul.length &&
                    component instanceof kidoju.PageComponent &&
                    that.ul.find(kendo.format(ITEM_BYUID_SELECTOR, component.uid)).length === 0) {

                    var tool = kidoju.tools[component.tool];
                    if (tool instanceof kidoju.Tool) {
                        //Create explorer item
                        var item = that.itemTemplate({
                            uid: component.uid,
                            tool: component.tool, //also tool.id
                            icon: that.options.iconPath + tool.icon + '.svg'
                        });
                        //Add to explorer list
                        that.ul.append(item); //TODO <----------------------------------------------------- index??????
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
                    //Find and remove an explorer item
                    var item = this.ul.find(kendo.format(ITEM_BYUID_SELECTOR, uid));
                    item.off().remove();
                }
            },

            /**
             * @method refresh
             * @param e
             */
            refresh: function (e) {
                var that = this,
                    html = '';

                if (e && e.action === undefined) {
                    that.trigger(DATABINDING);
                }

                if (e === undefined || e.action === undefined) {
                    var components = [];
                    if (e === undefined && that.dataSource instanceof kidoju.PageCollectionDataSource) {
                        components = that.dataSource.data();
                    } else if (e && e.items instanceof kendo.data.ObservableArray) {
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
                        that._addItem(component);
                        that.trigger(CHANGE, {action: e.action, value: component}); //TODO <--------------------------------------------
                    });
                    //that.select(e.items[e.items.length -1]); //TODO <---------------------------------------------
                } else if (e.action === 'remove' && $.isArray(e.items) && e.items.length) {
                    $.each(e.items, function (index, page) {
                        that._removeItemByUid(page.uid);
                        that.trigger(CHANGE, {action: e.action, value: page});
                        //that._selectByUid(null); //TODO
                    });

                } else if (e.action === 'itemchange') {
                    $.noop(); //TODO
                }

                //Display a message when there is nothing to display
                //if (html.length === 0) {
                //    html = that.options.messages.empty; //TODO: improve
                //}

                that._toggleSelection();

                if (e && e.action === undefined) {
                    that.trigger(DATABOUND);
                }

            },


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
                if (e instanceof $.Event) {
                    $(e.currentTarget).toggleClass(HOVER_CLASS, e.type === MOUSEENTER);
                }
            },

            /**
             * Toggles the focus style when an explorer item has focus
             * @method _toggleFocus
             * @param e
             * @private
             */
            _toggleFocus: function (e) {
                if (e instanceof $.Event) {
                    $(e.currentTarget).toggleClass(FOCUSED_CLASS, e.type === FOCUS);
                }
            },


            /**
             * Click event handler
             * @param e
             * @private
             */
            _click: function (e) {
                if (e instanceof $.Event) {
                    e.preventDefault();
                    var target = $(e.currentTarget);
                    if (!target.is('.' + SELECTED_CLASS)) {
                        var component = this.dataSource.getByUid(target.attr(kendo.attr('uid')));
                        this.value(component);
                    }
                }
            },

            /**
             * @method _clear
             * @private
             */
            _clear: function () {
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
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                that.setDataSource(NULL);
            }

        });

        kendo.ui.plugin(Explorer);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function(_, f){ 'use strict'; f(); });
