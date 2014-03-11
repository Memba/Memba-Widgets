//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        Widget = kendo.ui.Widget,

        //Types
        NUMBER = 'number',

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        KEYDOWN = 'keydown',
        NS = ".kendoPlaybar",

        //Widget
        WIDGET_CLASS = 'k-widget kj-playbar',
        FIRST = ".k-i-seek-w",
        LAST = ".k-i-seek-e",
        PREV = ".k-i-arrow-w",
        NEXT = ".k-i-arrow-e",

        DEBUG = true,
        MODULE = 'kidoju.widgets.playbar: ';

    /**
     * Helpers
     */

    function button(template, idx, text, numeric, title) {
        return template( {
            idx: idx,
            text: text,
            ns: kendo.ns,
            numeric: numeric,
            title: title || ""
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
        update(element, PREV, Math.max(1, index - 1), index <= 1);
    }

    function next(element, index, length) {
        update(element, NEXT, Math.min(length, index + 1), index >= length);
    }

    function last(element, index, length) {
        //update(element, LAST, length, index >= length);
        update(element, LAST, length-1, index >= length-1);
    }


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
            name: 'Playbar',
            iconTemplate: '<a href="\\#" title="#=text#" class="k-link k-pager-nav #= wrapClassName #"><span class="k-icon #= className #">#=text#</span></a>',
            selectTemplate: '<li><span class="k-state-selected">#=text#</span></li>',
            linkTemplate: '<li><a tabindex="-1" href="\\#" class="k-link" data-#=ns#index="#=idx#" #if (title !== "") {# title="#=title#" #}#>#=text#</a></li>',
            buttonCount: 10,
            autoBind: true,
            index: 0,
            numeric: true,
            info: true,
            timer: true,
            input: false,
            previousNext: true,
            refresh: true,
            value: null,
            dataSource: null,
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
         * @property events
         */
        events: [
            CHANGE
        ],

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
            if ( that.dataSource instanceof kidoju.PageCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }
            else {
                that._refreshHandler = $.proxy(that.refresh, that);
            }

            if (that.options.dataSource) {
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageCollectionDataSource.create(that.options.dataSource);

                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            }
        },

        /**
         * index is 0 based, whereas diplayed numbers are 1 based
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
                } else if (value < 0 || value >= that.length()) { //TODO: what if that.length() === 0
                    throw new RangeError();
                } else if (value !== that._index) {
                    that._index = value;
                    that.trigger(CHANGE, { index: value });
                    that.refresh(); //TODO review when MVVM
                }
            } else {
                if (!that._index) {
                    that._index = that.options.index;
                }
                return that._index;
            }
        },
        _index: undefined,

        /**
         * @method total()
         * @returns {*}
         */
        length: function() {
            return (this.dataSource instanceof kidoju.PageCollectionDataSource) ? this.dataSource.total() : 0;
        },

        /**
         * Builds the widget layout
         * @method _layout
         * @private
         */
        _layout: function () {
            /* TODO: Display vertical or horizontal
             * TODO: Add timer (play/pause)
             */
            var that = this,
                playbar = that.element,
                options = that.options,
                index = that.index(),
                length = that.length();

            if (options.previousNext) {
                if (!playbar.find(FIRST).length) {
                    playbar.append(icon(that.iconTemplate, FIRST, options.messages.first, "k-pager-first"));
                    first(playbar, index, length);
                }
                if (!playbar.find(PREV).length) {
                    playbar.append(icon(that.iconTemplate, PREV, options.messages.previous));
                    prev(playbar, index, length);
                }
            }

            if (options.numeric) {
                that.list = playbar.find(".k-pager-numbers");
                if (!that.list.length) {
                    that.list = $('<ul class="k-pager-numbers k-reset" />').appendTo(playbar);
                }
            }

            if (options.input) {
                if (!playbar.find(".k-pager-input").length) {
                    playbar.append('<span class="k-pager-input k-label">'+
                        options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length) +
                        '</span>');
                }
                playbar.on(KEYDOWN + NS, ".k-pager-input input", $.proxy(that._keydown, that));
            }

            if (options.previousNext) {
                if (!playbar.find(NEXT).length) {
                    playbar.append(icon(that.iconTemplate, NEXT, options.messages.next));
                    next(playbar, index, length);
                }
                if (!playbar.find(LAST).length) {
                    playbar.append(icon(that.iconTemplate, LAST, options.messages.last, "k-pager-last"));
                    last(playbar, index, length);
                }
            }

            if (options.refresh) {
                if (!playbar.find(".k-pager-refresh").length) {
                    playbar.append('<a href="#" class="k-pager-refresh k-link" title="' + options.messages.refresh +
                        '"><span class="k-icon k-i-refresh">' + options.messages.refresh + "</span></a>");
                }
                playbar.on(CLICK + NS, ".k-pager-refresh", $.proxy(that._refreshClick, that));
            }

            if (options.info) {
                if (!playbar.find(".k-pager-info").length) {
                    playbar.append('<span class="k-pager-info k-label" />');
                }
            }

            //Add timer

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
                pos, start = 1, end,
                html = '', reminder;

            if (e && e.action == 'itemchange') {
                return; //we only update the playbar on 'add' and 'remove'
            }

            if (options.numeric) {
                if (index + 1 > options.buttonCount) {
                    reminder = ((index + 1) % options.buttonCount);
                    start = (reminder === 0) ? (index + 1 - options.buttonCount) + 1 : (index + 1 - reminder) + 1;
                }
                end = Math.min((start + options.buttonCount) - 1, length);
                if (start > 1) {
                    html += button(that.linkTemplate, start - 1, "...", false, options.messages.morePages);
                }
                for (pos = start; pos <= end; pos++) {
                    html += button(pos == index + 1 ? that.selectTemplate : that.linkTemplate, pos, pos, true);
                }
                if (end < length) {
                    html += button(that.linkTemplate, pos, "...", false, options.messages.morePages);
                }
                if (html === '') {
                    html = that.selectTemplate({ text: 0 });
                }
                that.list.html(html);
            }

            if (options.info) {
                if (length > 0) {
                    html = options.messages.page +
                        ' ' + index + 1 + ' ' +
                        kendo.format(options.messages.of, length);
                } else {
                    html = options.messages.empty;
                }
                that.element.find(".k-pager-info").html(html);
            }

            if (options.input) {
                that.element
                .find(".k-pager-input")
                .html(options.messages.page +
                    '<input class="k-textbox">' +
                    kendo.format(options.messages.of, length))
                .find("input")
                .val(index)
                .attr('disabled', length < 1)
                .toggleClass("k-state-disabled", length < 1);
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
                var input = this.element.find(".k-pager-input").find("input"),
                    index = parseInt(input.val(), 10);
                if (isNaN(index) || index < 1 || index > this.length()) {
                    index = this.index();
                }
                input.val(index);
                this.index(index);
            }
        },

        _refreshClick: function(e) {
            e.preventDefault();
            this.dataSource.read();
        },

        _indexClick: function(e) {
            var target = $(e.currentTarget);
            e.preventDefault();
            if (!target.is(".k-state-disabled")) {
                this.index(parseInt(target.attr(kendo.attr("index"))));
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
            that.setDataSource(null);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Playbar);

}(jQuery));