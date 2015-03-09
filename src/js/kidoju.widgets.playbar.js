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
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        KEYDOWN = 'keydown',
        NS = '.kendoPlaybar',

        //Widget
        WIDGET_CLASS = 'k-widget kj-playbar',
        FIRST = '.k-i-seek-w',
        LAST = '.k-i-seek-e',
        PREV = '.k-i-arrow-w',
        NEXT = '.k-i-arrow-e',

        DEBUG = true,
        MODULE = 'kidoju.widgets.playbar: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function isGuid(value) {
        //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        return  ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
    }

    function button(template, idx, text, numeric, title) {
        return template( {
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
        //update(element, FIRST, 1, index <= 1);
        update(element, FIRST, 0, index <= 0);
    }

    function prev(element, index) {
        //update(element, PREV, Math.max(1, index - 1), index <= 1);
        update(element, PREV, Math.max(0, index - 1), index <= 0);
    }

    function next(element, index, length) {
        //update(element, NEXT, Math.min(length, index + 1), index >= length);
        update(element, NEXT, Math.min(length - 1, index + 1), index >= length - 1);
    }

    function last(element, index, length) {
        //update(element, LAST, length, index >= length);
        update(element, LAST, length - 1, index >= length - 1);
    }

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * Toolbar widget
     * @class Playbar
     * @type {*}
     */
    var Playbar = Widget.extend({

        /**
         * Widget constructor
         * @method init
         * @param element
         * @param options
         */
        init: function(element, options) {
            var that = this;
            options = options || {};
            // base call to widget initialization
            Widget.fn.init.call(that, element, options);
            log('widget initialized');
            //TODO: review how index is set
            that._index = that.options.index || 0;
            that._templates();
            that._layout();
            that._dataSource();
            //that.refresh();
        },

        /**
         * @property options
         */
        options: {
            name: 'Playbar',
            iconTemplate: '<a href="\\#" title="#:text#" class="k-link k-pager-nav #= wrapClassName #"><span class="k-icon #= className #">#:text#</span></a>',
            selectTemplate: '<li><span class="k-state-selected">#: text #</span></li>',
            linkTemplate: '<li><a tabindex="-1" href="\\#" class="k-link" data-#=ns#index="#=idx#" #if (title !== "") {# title="#=title#" #}#>#:text#</a></li>',
            buttonCount: 10,
            autoBind: true,
            index: 0, //TODO: do we need id too?
            numeric: true,
            info: true,
            timer: true,
            input: false,
            previousNext: true,
            refresh: true,
            //value: NULL, //TODO: we do not seem to have a use for value
            dataSource: undefined, //Important undefined is required for _SetDataSource to initialize a dataSource
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
        //setOptions: function(options) {
        //    Widget.fn.setOptions.call(this, options);
        //},

        /**
         * @property events
         */
        events: [
            CHANGE
        ],

        /**
         * IMPORTANT: index is 0 based, whereas playbar page numbers are 1 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this;
            if(value !== undefined) {
                log('index set to ' + value);
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else if (value !== that._index) {
                    that._index = value;
                    that.refresh(); //TODO review when MVVM
                    var page = that.dataSource.at(that._index);
                    that.trigger(CHANGE, {
                        index: value,
                        id: (page instanceof kidoju.Page) ? page[page.idField] : undefined,
                        value: page
                    });
                }
            } else {
                return that._index;
            }
        },

        /**
         * @method id
         * @param value
         * @returns {*}
         */
        id: function (value) {
            var that = this,
                page;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                page = that.dataSource.get(value);
                if (page !== undefined) {
                    var index = that.dataSource.indexOf(page);
                    if (index >= 0) { //index = -1 if not found
                        that.index(index);
                    }
                    //if page not found, we do nothing
                }
            } else {
                page = that.dataSource.at(that._index);
                if (page instanceof kidoju.Page) {
                    return page[page.idField];
                } else {
                    return undefined;
                }
            }
        },

        /**
         * @method value
         * @param value
         * @returns {*}
         */
            //value binding requires valueTextField
        value: function(value) {
            var that = this;
            if (value !== undefined) {
                var index = that.dataSource.indexOf(value);
                if (index >= 0) { //index = -1 if not found
                    that.index(index);
                }
                //if page not found, we do nothing
            } else {
                return that.dataSource.at(that._index);
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
         * Initialize templates
         * @private
         */
        _templates: function() {
            var that = this;
            that.iconTemplate = kendo.template(that.options.iconTemplate);
            that.linkTemplate = kendo.template(that.options.linkTemplate);
            that.selectTemplate = kendo.template(that.options.selectTemplate);
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
         * @method _layout
         * @private
         */
        _layout: function () {
            /* TODO: Display vertical or horizontal
             * TODO: Add timer (play/pause)
             * TODO: Add progress bar
             * TODO: Add tooltips with thumbnails
             */
            var that = this,
                playbar = that.element,
                options = that.options,
                index = that.index(),
                length = that.length();

            if (options.previousNext) {
                if (!playbar.find(FIRST).length) {
                    playbar.append(icon(that.iconTemplate, FIRST, options.messages.first, 'k-pager-first'));
                    first(playbar, index, length);
                }
                if (!playbar.find(PREV).length) {
                    playbar.append(icon(that.iconTemplate, PREV, options.messages.previous));
                    prev(playbar, index, length);
                }
            }

            if (options.numeric) {
                that.list = playbar.find('.k-pager-numbers');
                if (!that.list.length) {
                    that.list = $('<ul class="k-pager-numbers k-reset" />').appendTo(playbar);
                }
            }

            if (options.input) {
                if (!playbar.find('.k-pager-input').length) {
                    playbar.append('<span class="k-pager-input k-label">'+
                        options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length) +
                        '</span>');
                }
                playbar.on(KEYDOWN + NS, '.k-pager-input input', $.proxy(that._keydown, that));
            }

            if (options.previousNext) {
                if (!playbar.find(NEXT).length) {
                    playbar.append(icon(that.iconTemplate, NEXT, options.messages.next));
                    next(playbar, index, length);
                }
                if (!playbar.find(LAST).length) {
                    playbar.append(icon(that.iconTemplate, LAST, options.messages.last, 'k-pager-last'));
                    last(playbar, index, length);
                }
            }

            if (options.refresh) {
                if (!playbar.find('.k-pager-refresh').length) {
                    playbar.append('<a href="#" class="k-pager-refresh k-link" title="' + options.messages.refresh +
                        '"><span class="k-icon k-i-refresh">' + options.messages.refresh + '</span></a>');
                }
                playbar.on(CLICK + NS, '.k-pager-refresh', $.proxy(that._refreshClick, that));
            }

            if (options.info) {
                if (!playbar.find('.k-pager-info').length) {
                    playbar.append('<span class="k-pager-info k-label" />');
                }
            }

            //TODO Add timer

            playbar
                .on(CLICK + NS , 'a', $.proxy(that._indexClick, that))
                .addClass(WIDGET_CLASS + ' k-pager-wrap k-widget');

            //if (options.autoBind) {
            //    that.refresh();
            //}

            kendo.notify(that);
        },

        /**
         * Refreshed teh widget when dataSource changes
         * @method refresh
         * @param e
         */
        refresh: function(e) {
            var that = this,
                playbar = that.element,
                options = that.options,
                index = that.index(),
                length = that.length(),
                idx, start = 0, end,
                html = '', position;

            if (e && e.action === 'itemchange') {
                return; //we only update the playbar on loading, 'add' and 'remove'
            }

            if (options.numeric) {
                //start is the index of the first numeric button
                //end is the index of the last numeric button
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
                if (end < length - 1) { //idx = end + 1 here
                    html += button(that.linkTemplate, idx, '...', false, options.messages.morePages);
                }
                if (html === '') {
                    html = that.selectTemplate({ text: 0 });
                }
                that.list.html(html);
            }

            if (options.info) {
                //TODO: we could consider a progress bar?
                if (length > 0) {
                    html = options.messages.page +
                        ' ' + (index + 1) + ' ' +
                        kendo.format(options.messages.of, length);
                } else {
                    html = options.messages.empty;
                }
                that.element.find('.k-pager-info').html(html);
            }

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

            if (options.previousNext) {
                first(that.element, index, length);
                prev(that.element, index, length);
                next(that.element, index, length);
                last(that.element, index, length);
            }
        },

        _keydown: function(e) {
            if (e.keyCode === kendo.keys.ENTER) {
                var input = this.element.find('.k-pager-input').find('input'),
                    pageNum = parseInt(input.val(), 10);
                if (isNaN(pageNum) || pageNum < 1 || pageNum > this.length()) {
                    pageNum = this.index() + 1;
                }
                input.val(pageNum);
                this.index(pageNum - 1);
            }
        },

        /**
         * @method _refreshClick
         * @param e
         * @private
         */
        _refreshClick: function(e) {
            e.preventDefault();
            this.dataSource.read();
        },

        /**
         * @method _indexClick
         * @param e
         * @private
         */
        _indexClick: function(e) {
            var target = $(e.currentTarget);
            e.preventDefault();
            //TODO: would it be more reliable to use the id instead of index (requires an update of templates)
            if (!target.is('.k-state-disabled')) {
                this.index(parseInt(target.attr(kendo.attr('index')), 10));
            }
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            //kendo.unbind($(that.element));
            //unbind all other events
            $(that.element).find('*').off();
            $(that.element)
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

    kendo.ui.plugin(Playbar);

}(this, jQuery));
