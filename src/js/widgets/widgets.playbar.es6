/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.sortable';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import Page from '../data/models.page.es6';
import PageDataSource from '../data/datasources.page.es6';

const {
    attr,
    destroy,
    format,
    keys,
    ns,
    roleSelector,
    template,
    ui: { DataBoundWidget, plugin },
    unbind
} = window.kendo;
const logger = new Logger('widgets.playbar');
const NS = '.kendoPlayBar';
const WIDGET_CLASS = 'k-widget k-pager-wrap k-floatwrap kj-playbar';
const FIRST = '.k-i-seek-w';
const LAST = '.k-i-seek-e';
const PREV = '.k-i-arrow-w';
const NEXT = '.k-i-arrow-e';

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

function isGuid(value) {
    // http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
    return (
        $.type(value) === CONSTANTS.STRING &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
            value
        )
    );
}

function button(template, idx, text, numeric, title) {
    return template({
        idx,
        text,
        ns,
        numeric,
        title: title || ''
    });
}

function icon(template, className, text, wrapClassName) {
    return template({
        className: className.substring(1),
        text,
        wrapClassName: wrapClassName || ''
    });
}

function update(element, selector, index, disabled) {
    element
        .find(selector)
        .parent()
        .attr(attr('index'), index)
        .attr('tabindex', -1)
        .toggleClass(CONSTANTS.DISABLED_CLASS, disabled);
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

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * PlayBar
 * @class PlayBar
 * @extends DataBoundWidget
 */
const PlayBar = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        // TODO: review how index is set
        this._selectedIndex = this.options.index || 0;
        this._templates();
        this._render();
        this._dataSource();
    },

    /**
     * @property options
     */
    options: {
        name: 'PlayBar',
        // dataSource: undefined, // Important undefined is required for _setDataSource to initialize a dataSource
        // value: undefined
        iconTemplate:
            '<a href="\\#" aria-label="#:text#" title="#:text#" class="k-link k-pager-nav #= wrapClassName #"><span class="k-icon #= className #"></span></a>',
        selectTemplate:
            '<li><span class="k-state-selected">#: text #</span></li>',
        currentPageTemplate:
            '<li class="k-current-page"><span class="k-link k-pager-nav">#=text#</span></li>',
        linkTemplate:
            '<li><a tabindex="-1" href="\\#" class="k-link" data-#=ns#index="#=idx#" #if (title !== "") {# title="#=title#" #}#>#:text#</a></li>',
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
    //    DataBoundWidget.fn.setOptions.call(this, options);
    // },

    /**
     * @property events
     */
    events: [
        CONSTANTS.CHANGE,
        CONSTANTS.CLICK,
        CONSTANTS.DATABINDING,
        CONSTANTS.DATABOUND
    ],

    /**
     * Gets/Sets the index of the selected page in the playbar
     * Note: index is 0 based, whereas playbar page numbers are 1 based
     * @method index
     * @param index
     * @returns {*}
     */
    index(index) {
        const that = this;
        if (index !== undefined) {
            if ($.type(index) !== CONSTANTS.NUMBER || index % 1 !== 0) {
                throw new TypeError();
            } else if (index < 0 || (index > 0 && index >= that.length())) {
                throw new RangeError();
            } else if (index !== that._selectedIndex) {
                const page = that.dataSource.at(index);
                if (page instanceof Page) {
                    that._selectedIndex = index;
                    logger.debug(`selected index set to ${index}`);
                    that.refresh();
                    that.trigger(CONSTANTS.CHANGE, {
                        index,
                        value: page
                    });
                }
            }
        } else {
            return that._selectedIndex;
        }
    },

    /**
     * Gets/Sets the id of the selected page in the playbar
     * @method id
     * @param id
     * @returns {*}
     */
    id(id) {
        const that = this;
        let page;
        if (id !== undefined) {
            if (
                $.type(id) !== CONSTANTS.STRING &&
                $.type(id) !== CONSTANTS.NUMBER
            ) {
                throw new TypeError();
            }
            page = that.dataSource.get(id);
            if (page !== undefined) {
                const index = that.dataSource.indexOf(page);
                if (index >= 0) {
                    // index = -1 if not found
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
    value(page) {
        const that = this;
        if (page === null) {
            $.noop(); // TODO
        } else if (page !== undefined) {
            if (!(page instanceof Page)) {
                throw new TypeError();
            }
            const index = that.dataSource.indexOf(page);
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
    length() {
        return this.dataSource instanceof PageDataSource
            ? this.dataSource.total()
            : -1;
    },

    /**
     * return number items
     * @returns {*}
     */
    items() {
        return this.element
            .find('ul.k-pager-numbers')
            .children('li:not(.k-current-page)')
            .get();
    },

    /**
     * Initialize templates
     * @private
     */
    _templates() {
        const that = this;
        that.iconTemplate = template(that.options.iconTemplate);
        that.linkTemplate = template(that.options.linkTemplate);
        that.selectTemplate = template(that.options.selectTemplate);
        that.currentPageTemplate = template(that.options.currentPageTemplate);
    },

    /**
     * Changes the dataSource
     * @method setDataSource
     * @param dataSource
     */
    setDataSource(dataSource) {
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
    _dataSource() {
        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource

        // There is no reason why, in its current state, it would not work with any dataSource
        // if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
        if (this.dataSource instanceof PageDataSource && this._refreshHandler) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // use null to explicitly destroy the dataSource bindings
            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = PageDataSource.create(this.options.dataSource);

            this._refreshHandler = this.refresh.bind(this);

            // bind to the change event to refresh the widget
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        /* TODO: Display vertical or horizontal
         * TODO: Add timer (play/pause)
         * TODO: Add progress bar
         * TODO: Add tooltips with thumbnails
         */
        const that = this;
        const playbar = that.element;
        const options = that.options;
        const index = that.index();
        const length = that.length();

        // Add first and previous buttons
        if (options.previousNext) {
            if (!playbar.find(FIRST).length) {
                playbar.append(
                    icon(
                        that.iconTemplate,
                        FIRST,
                        options.messages.first,
                        'k-pager-first'
                    )
                );
                first(playbar, index, length);
            }
            if (!playbar.find(PREV).length) {
                playbar.append(
                    icon(
                        that.iconTemplate,
                        PREV,
                        options.messages.previous,
                        'k-pager-previous'
                    )
                );
                prev(playbar, index, length);
            }
        }

        // Add numeric buttons
        if (options.numeric) {
            that.list = playbar.find('.k-pager-numbers');
            if (!that.list.length) {
                that.list = $(
                    '<ul class="k-pager-numbers k-reset" />'
                ).appendTo(playbar);
            }
        }

        // Add input
        if (options.input) {
            if (!playbar.find('.k-pager-input').length) {
                playbar.append(
                    `<span class="k-pager-input k-label"><span>${
                        options.messages.page
                    }</span><input class="k-textbox"><span>${format(
                        options.messages.of,
                        length
                    )}</span></span>`
                );
            }
            playbar.on(
                CONSTANTS.KEYDOWN + NS,
                '.k-pager-input input',
                that._keydown.bind(that)
            );
        }

        // Add next and last buttons
        if (options.previousNext) {
            if (!playbar.find(NEXT).length) {
                playbar.append(
                    icon(
                        that.iconTemplate,
                        NEXT,
                        options.messages.next,
                        'k-pager-next'
                    )
                );
                next(playbar, index, length);
            }
            if (!playbar.find(LAST).length) {
                playbar.append(
                    icon(
                        that.iconTemplate,
                        LAST,
                        options.messages.last,
                        'k-pager-last'
                    )
                );
                last(playbar, index, length);
            }
        }

        // Add refresh button
        if (options.refresh) {
            if (!playbar.find('.k-pager-refresh').length) {
                playbar.append(
                    `<a href="#" class="k-pager-refresh k-link" aria-label="${
                        options.messages.refresh
                    }" title="${
                        options.messages.refresh
                    }"><span class="k-icon k-i-refresh"></span></a>`
                );
            }
            playbar.on(
                CONSTANTS.CLICK + NS,
                '.k-pager-refresh',
                that._refreshClick.bind(that)
            );
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
            .on(CONSTANTS.CLICK + NS, 'a', that._navClick.bind(that))
            .on(
                CONSTANTS.CLICK + NS,
                '.k-current-page',
                that._toggleDropDown.bind(that)
            );

        // if (options.autoBind) {
        //    that.refresh();
        // }

        // Required for visible binding
        that.wrapper = that.element;

        kendo.notify(that);
    },

    /**
     * Refresh
     * @method refresh
     * @param e
     */
    refresh(e) {
        const that = this;
        // var playbar = that.element;
        const options = that.options;
        const index = that.index();
        const length = that.length();
        let idx;
        let start = 0;
        let end;
        let html = '';
        // var position;

        if (e && e.action === 'itemchange') {
            return; // we only update the playbar on loading, 'add' and 'remove'
        }

        if (e && e.action === undefined) {
            that.trigger(CONSTANTS.DATABINDING);
        }

        // Update numeric buttons
        if (options.numeric) {
            // start is the index of the first numeric button
            // end is the index of the last numeric button
            if (index > options.buttonCount - 1) {
                start = index - (index % options.buttonCount);
            }
            end = Math.min(start + options.buttonCount - 1, length - 1);
            if (start > 0) {
                html += button(
                    that.linkTemplate,
                    start - 1,
                    '...',
                    false,
                    options.messages.morePages
                );
            }
            for (idx = start; idx <= end; idx++) {
                html += button(
                    idx === index ? that.selectTemplate : that.linkTemplate,
                    idx,
                    idx + 1,
                    true
                );
            }
            if (end < length - 1) {
                // idx = end + 1 here
                html += button(
                    that.linkTemplate,
                    idx,
                    '...',
                    false,
                    options.messages.morePages
                );
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
                html =
                    `<span>${options.messages.page} ` +
                    `</span>` +
                    `<span>${index + 1} ${format(
                        options.messages.of,
                        length
                    )}</span>`;
            } else {
                html = options.messages.empty;
            }
            that.element.find('.k-pager-info').html(html);
        }

        // Update input
        if (options.input) {
            that.element
                .find('.k-pager-input')
                .html(
                    `${options.messages.page}<input class="k-textbox">${format(
                        options.messages.of,
                        length
                    )}`
                )
                .find('input')
                .val(index + 1)
                .attr('disabled', length < 1)
                .toggleClass(CONSTANTS.DISABLED_CLASS, length < 1);
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
            that.trigger(CONSTANTS.DATABOUND, { addedDataItems: [] });
        }
    },

    /**
     * Event handler triggered
     * @param e
     * @private
     */
    _keydown(e) {
        if (e instanceof $.Event && e.keyCode === keys.ENTER) {
            const input = this.element.find('.k-pager-input').find('input');
            let pageNum = parseInt(input.val(), 10);
            if (
                Number.isNaN(pageNum) ||
                pageNum < 1 ||
                pageNum > this.length()
            ) {
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
    _refreshClick(e) {
        if (e instanceof $.Event) {
            e.preventDefault();
            this.dataSource.read();
        }
    },

    /**
     * Toggle the drop down list of numeric buttons
     * @private
     */
    _toggleDropDown() {
        this.list.toggleClass('k-state-expanded');
    },

    /**
     *
     * @method _indexClick
     * @param e
     * @private
     */
    _navClick(e) {
        if (e instanceof $.Event) {
            e.preventDefault();
            const target = $(e.currentTarget);
            if (!target.is('.k-state-disabled')) {
                const index = parseInt(target.attr(attr('index')), 10);
                if (!Number.isNaN(index)) {
                    this.index(index);
                }
            }
        }
    },

    /**
     * @method _clear
     * @private
     */
    _clear() {
        const that = this;
        // unbind kendo
        // unbind($(that.element));
        // unbind all other events
        $(that.element)
            .find('*')
            .off();
        $(that.element)
            .off()
            .empty()
            .removeClass(WIDGET_CLASS);
    },

    /**
     * Destroy
     */
    destroy() {
        const that = this;
        DataBoundWidget.fn.destroy.call(that);
        that._clear();
        that.setDataSource(null);
        destroy(that.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(PlayBar);
