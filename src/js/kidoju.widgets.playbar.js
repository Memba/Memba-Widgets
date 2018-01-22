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
        './kidoju.data',
        './kidoju.tools'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var Widget = kendo.ui.Widget;
        var kidoju = window.kidoju;
        var Page = kidoju.data.Page;
        var PageCollectionDataSource = kidoju.data.PageCollectionDataSource;
        // var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.playbar');
        var STRING = 'string';
        var NUMBER = 'number';
        var NULL = null;
        var CHANGE = 'change';
        var CLICK = 'click';
        var DATABINDING = 'dataBinding';
        var DATABOUND = 'dataBound';
        var KEYDOWN = 'keydown';
        var NS = '.kendoPlayBar';
        var WIDGET_CLASS = 'k-widget k-pager-wrap k-floatwrap kj-playbar';
        var FIRST = '.k-i-seek-w';
        var LAST = '.k-i-seek-e';
        var PREV = '.k-i-arrow-w';
        var NEXT = '.k-i-arrow-e';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function isGuid(value) {
            // http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
            return ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
        }

        function button(template, idx, text, numeric, title) {
            return template({
                idx: idx,
                text: text,
                ns: kendo.ns,
                numeric: numeric,
                title: title || ''
            });
        }

        function icon(template, className, text, wrapClassName) {
            return template({
                className: className.substring(1),
                text: text,
                wrapClassName: wrapClassName || ''
            });
        }

        function update(element, selector, index, disabled) {
            element.find(selector)
                .parent()
                .attr(kendo.attr('index'), index)
                .attr('tabindex', -1)
                .toggleClass('k-state-disabled', disabled);
        }

        function first(element, index) {
            // update(element, FIRST, 1, index <= 1);
            update(element, FIRST, 0, index <= 0);
        }

        function prev(element, index) {
            // update(element, PREV, Math.max(1, index - 1), index <= 1);
            update(element, PREV, Math.max(0, index - 1), index <= 0);
        }

        function next(element, index, length) {
            // update(element, NEXT, Math.min(length, index + 1), index >= length);
            update(element, NEXT, Math.min(length - 1, index + 1), index >= length - 1);
        }

        function last(element, index, length) {
            // update(element, LAST, length, index >= length);
            update(element, LAST, length - 1, index >= length - 1);
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Toolbar widget
         * @class PlayBar
         * @type {*}
         */
        var PlayBar = Widget.extend({

            /**
             * Widget constructor
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                // base call to widget initialization
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                // TODO: review how index is set
                that._selectedIndex = that.options.index || 0;
                that._templates();
                that._layout();
                that._dataSource();
            },

            /**
             * @property options
             */
            options: {
                name: 'PlayBar',
                // dataSource: undefined, // Important undefined is required for _setDataSource to initialize a dataSource
                // value: undefined
                iconTemplate: '<a href="\\#" aria-label="#:text#" title="#:text#" class="k-link k-pager-nav #= wrapClassName #"><span class="k-icon #= className #"></span></a>',
                selectTemplate: '<li><span class="k-state-selected">#: text #</span></li>',
                currentPageTemplate: '<li class="k-current-page"><span class="k-link k-pager-nav">#=text#</span></li>',
                linkTemplate: '<li><a tabindex="-1" href="\\#" class="k-link" data-#=ns#index="#=idx#" #if (title !== "") {# title="#=title#" #}#>#:text#</a></li>',
                buttonCount: 10,
                autoBind: true,
                index: 0, // do we need id too?
                numeric: true,
                info: true,
                input: false,
                previousNext: true,
                refresh: true,
                messages: {
                    empty: 'No page to display',
                    page: 'Page',
                    of: 'of {0}',
                    first: 'Go to the first page',
                    previous: 'Go to the previous page',
                    next: 'Go to the next page',
                    last: 'Go to the last page',
                    refresh: 'Refresh',
                    morePages: 'More pages'
                }
            },

            /**
             * @method setOptions
             * @param options
             */
            // setOptions: function (options) {
            //    Widget.fn.setOptions.call(this, options);
            // },

            /**
             * @property events
             */
            events: [
                CHANGE,
                CLICK,
                DATABINDING,
                DATABOUND
            ],

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Gets/Sets the index of the selected page in the playbar
             * Note: index is 0 based, whereas playbar page numbers are 1 based
             * @method index
             * @param index
             * @returns {*}
             */
            index: function (index) {
                var that = this;
                if (index !== undefined) {
                    if ($.type(index) !== NUMBER || index % 1 !== 0) {
                        throw new TypeError();
                    } else if (index < 0 || (index > 0 && index >= that.length())) {
                        throw new RangeError();
                    } else if (index !== that._selectedIndex) {
                        var page = that.dataSource.at(index);
                        if (page instanceof Page) {
                            that._selectedIndex = index;
                            logger.debug('selected index set to ' + index);
                            that.refresh();
                            that.trigger(CHANGE, {
                                index: index,
                                value: page
                            });
                        }
                    }
                } else {
                    return that._selectedIndex;
                }
            },

            /* jshint +W074 */

            /**
             * Gets/Sets the id of the selected page in the playbar
             * @method id
             * @param id
             * @returns {*}
             */
            id: function (id) {
                var that = this;
                var page;
                if (id !== undefined) {
                    if ($.type(id) !== STRING && $.type(id) !== NUMBER) {
                        throw new TypeError();
                    }
                    page = that.dataSource.get(id);
                    if (page !== undefined) {
                        var index = that.dataSource.indexOf(page);
                        if (index >= 0) { // index = -1 if not found
                            that.index(index);
                        }
                        // if page not found, we do nothing
                    }
                } else {
                    page = that.dataSource.at(that._selectedIndex);
                    if (page instanceof Page) {
                        return page[page.idField];
                    }
                }
            },

            /**
             * Gets/Sets the value of the selected page in the playbar
             * @method value
             * @param value
             * @returns {*}
             */
            value: function (page) {
                var that = this;
                if (page === NULL) {
                    $.noop(); // TODO
                } else if (page !== undefined) {
                    if (!(page instanceof Page)) {
                        throw new TypeError();
                    }
                    var index = that.dataSource.indexOf(page);
                    if (index > -1) {
                        that.index(index);
                    }
                } else {
                    return that.dataSource.at(that._selectedIndex); // This returns undefined if not found
                }
            },

            /**
             * @method length()
             * @returns {*}
             */
            length: function () {
                return (this.dataSource instanceof PageCollectionDataSource) ? this.dataSource.total() : -1;
            },

            /**
             * return number items
             * @returns {*}
             */
            items: function () {
                return this.element.find('ul.k-pager-numbers').children('li:not(.k-current-page)').get();
            },


            /**
             * Initialize templates
             * @private
             */
            _templates: function () {
                var that = this;
                that.iconTemplate = kendo.template(that.options.iconTemplate);
                that.linkTemplate = kendo.template(that.options.linkTemplate);
                that.selectTemplate = kendo.template(that.options.selectTemplate);
                that.currentPageTemplate = kendo.template(that.options.currentPageTemplate);
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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                /* TODO: Display vertical or horizontal
                 * TODO: Add timer (play/pause)
                 * TODO: Add progress bar
                 * TODO: Add tooltips with thumbnails
                 */
                var that = this;
                var playbar = that.element;
                var options = that.options;
                var index = that.index();
                var length = that.length();

                // Add first and previous buttons
                if (options.previousNext) {
                    if (!playbar.find(FIRST).length) {
                        playbar.append(icon(that.iconTemplate, FIRST, options.messages.first, 'k-pager-first'));
                        first(playbar, index, length);
                    }
                    if (!playbar.find(PREV).length) {
                        playbar.append(icon(that.iconTemplate, PREV, options.messages.previous, 'k-pager-previous'));
                        prev(playbar, index, length);
                    }
                }

                // Add numeric buttons
                if (options.numeric) {
                    that.list = playbar.find('.k-pager-numbers');
                    if (!that.list.length) {
                        that.list = $('<ul class="k-pager-numbers k-reset" />').appendTo(playbar);
                    }
                }

                // Add input
                if (options.input) {
                    if (!playbar.find('.k-pager-input').length) {
                        playbar.append('<span class="k-pager-input k-label">' +
                        '<span>' + options.messages.page + '</span>' +
                        '<input class="k-textbox">' +
                        '<span>' + kendo.format(options.messages.of, length) + '</span>' +
                        '</span>');
                    }
                    playbar.on(KEYDOWN + NS, '.k-pager-input input', $.proxy(that._keydown, that));
                }

                // Add next and last buttons
                if (options.previousNext) {
                    if (!playbar.find(NEXT).length) {
                        playbar.append(icon(that.iconTemplate, NEXT, options.messages.next, 'k-pager-next'));
                        next(playbar, index, length);
                    }
                    if (!playbar.find(LAST).length) {
                        playbar.append(icon(that.iconTemplate, LAST, options.messages.last, 'k-pager-last'));
                        last(playbar, index, length);
                    }
                }

                // Add refresh button
                if (options.refresh) {
                    if (!playbar.find('.k-pager-refresh').length) {
                        playbar.append('<a href="#" class="k-pager-refresh k-link" aria-label="' + options.messages.refresh + '" title="' + options.messages.refresh +
                        '"><span class="k-icon k-i-refresh"></span></a>');
                    }
                    playbar.on(CLICK + NS, '.k-pager-refresh', $.proxy(that._refreshClick, that));
                }

                // Add info
                if (options.info) {
                    if (!playbar.find('.k-pager-info').length) {
                        playbar.append('<span class="k-pager-info k-label" />');
                    }
                }

                // Add click handler
                playbar
                    .addClass(WIDGET_CLASS)
                    .on(CLICK + NS, 'a', $.proxy(that._navClick, that))
                    .on(CLICK + NS, '.k-current-page', $.proxy(that._toggleDropDown, that));


                // if (options.autoBind) {
                //    that.refresh();
                // }

                // Required for visible binding
                that.wrapper = that.element;

                kendo.notify(that);
            },

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Refresh the widget when dataSource changes
             * @method refresh
             * @param e
             */
            refresh: function (e) {
                var that = this;
                // var playbar = that.element;
                var options = that.options;
                var index = that.index();
                var length = that.length();
                var idx;
                var start = 0;
                var end;
                var html = '';
                // var position;

                if (e && e.action === 'itemchange') {
                    return; // we only update the playbar on loading, 'add' and 'remove'
                }

                if (e && e.action === undefined) {
                    that.trigger(DATABINDING);
                }

                // Update numeric buttons
                if (options.numeric) {
                    // start is the index of the first numeric button
                    // end is the index of the last numeric button
                    if (index > options.buttonCount - 1) {
                        start = index - index % options.buttonCount;
                    }
                    end = Math.min(start + options.buttonCount - 1, length - 1);
                    if (start > 0) {
                        html += button(that.linkTemplate, start - 1, '...', false, options.messages.morePages);
                    }
                    for (idx = start; idx <= end; idx++) {
                        html += button(idx === index ? that.selectTemplate : that.linkTemplate, idx, idx + 1, true);
                    }
                    if (end < length - 1) { // idx = end + 1 here
                        html += button(that.linkTemplate, idx, '...', false, options.messages.morePages);
                    }
                    if (html === '') {
                        html = that.selectTemplate({ text: 0 });
                    }
                    // Add drop down when there is not enough space to display numeric button
                    html = that.currentPageTemplate({ text: index + 1 }) + html;
                    that.list.removeClass('k-state-expanded').html(html);
                }

                // Update info
                if (options.info) {
                    if (length > 0) {
                        html = '<span>' + options.messages.page + ' ' + '</span>' +
                            '<span>' + (index + 1) + ' ' + kendo.format(options.messages.of, length) + '</span>';
                    } else {
                        html = options.messages.empty;
                    }
                    that.element.find('.k-pager-info').html(html);
                }

                // Update input
                if (options.input) {
                    that.element.find('.k-pager-input')
                        .html(options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length))
                        .find('input')
                        .val(index + 1)
                        .attr('disabled', length < 1)
                        .toggleClass('k-state-disabled', length < 1);
                }

                // Update first, pervious, next, last buttons
                if (options.previousNext) {
                    first(that.element, index, length);
                    prev(that.element, index, length);
                    next(that.element, index, length);
                    last(that.element, index, length);
                }

                if (e && e.action === undefined) {
                    // TODO: we are cheating here: we should have in addedDataItems the pages displayed as numbers
                    // Without addedDataItems, it fails because all data items are not displayed
                    that.trigger(DATABOUND, { addedDataItems: [] });
                }
            },

            /* jshint +W074 */

            /**
             * Event handler triggered
             * @param e
             * @private
             */
            _keydown: function (e) {
                if (e instanceof $.Event && e.keyCode === kendo.keys.ENTER) {
                    var input = this.element.find('.k-pager-input').find('input');
                    var pageNum = parseInt(input.val(), 10);
                    if (isNaN(pageNum) || pageNum < 1 || pageNum > this.length()) {
                        pageNum = this.index() + 1;
                    }
                    input.val(pageNum);
                    this.index(pageNum - 1);
                }
            },

            /**
             * Event handler triggered when clicking the refresh button
             * @method _refreshClick
             * @param e
             * @private
             */
            _refreshClick: function (e) {
                if (e instanceof $.Event) {
                    e.preventDefault();
                    this.dataSource.read();
                }
            },

            /**
             * Toggle the drop down list of numeric buttons
             * @private
             */
            _toggleDropDown: function () {
                this.list.toggleClass('k-state-expanded');
            },

            /**
             *
             * @method _indexClick
             * @param e
             * @private
             */
            _navClick: function (e) {
                if (e instanceof $.Event) {
                    e.preventDefault();
                    var target = $(e.currentTarget);
                    if (!target.is('.k-state-disabled')) {
                        var index = parseInt(target.attr(kendo.attr('index')), 10);
                        if (!isNaN(index)) {
                            this.index(index);
                        }
                    }
                }
            },

            /**
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element)
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

        kendo.ui.plugin(PlayBar);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
