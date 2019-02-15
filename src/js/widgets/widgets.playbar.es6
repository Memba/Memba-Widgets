/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: Display vertical or horizontal - https://github.com/kidoju/Kidoju-Widgets/issues/7
// TODO: Add timer (play/pause) - https://github.com/kidoju/Kidoju-Widgets/issues/3
// TODO: Add progress bar - https://github.com/kidoju/Kidoju-Widgets/issues/4
// TODO: Add tooltips with thumbnails - https://github.com/kidoju/Kidoju-Widgets/issues/18

// TODO issue in toolbar when opening dropdownlist of numbers

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.tooltip';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { Page, PageDataSource } from '../data/data.page.es6';
import './widgets.stage.es6';

const {
    attr,
    destroy,
    format,
    keys,
    ns,
    // roleSelector,
    template,
    ui: { DataBoundWidget, plugin }
    // unbind
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

function button(tmpl, idx, text, numeric, title) {
    return tmpl({
        idx,
        text,
        ns,
        numeric,
        title: title || ''
    });
}

function icon(tmpl, className, text, wrapClassName) {
    return tmpl({
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
        // TODO: review how index is set - probably use this.value()
        this._selectedIndex = this.options.index || 0;
        this._templates();
        this._render();
        this._initTooltip();
        this._dataSource();
    },

    /**
     * Options
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
     * Events
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
     * Sets the data source
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
     * Initializes the data source
     * @method _dataSource
     * @private
     */
    _dataSource() {
        if (
            this.dataSource instanceof PageDataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // use null to explicitly destroy the dataSource bindings
            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = PageDataSource.create(this.options.dataSource);

            // bind to the change event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
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
        const { element, iconTemplate, options } = this;
        const index = this.index();
        const length = this.length();

        // Required for visible binding
        this.wrapper = element;

        // Add first and previous buttons
        if (options.previousNext) {
            if (!element.find(FIRST).length) {
                element.append(
                    icon(
                        iconTemplate,
                        FIRST,
                        options.messages.first,
                        'k-pager-first'
                    )
                );
                first(element, index, length);
            }
            if (!element.find(PREV).length) {
                element.append(
                    icon(
                        iconTemplate,
                        PREV,
                        options.messages.previous,
                        'k-pager-previous'
                    )
                );
                prev(element, index, length);
            }
        }

        // Add numeric buttons
        if (options.numeric) {
            this.ul = element.find('.k-pager-numbers');
            if (!this.ul.length) {
                this.ul = $('<ul class="k-pager-numbers k-reset" />').appendTo(
                    element
                );
            }
        }

        // Add input
        if (options.input) {
            if (!element.find('.k-pager-input').length) {
                element.append(
                    `<span class="k-pager-input k-label"><span>${
                        options.messages.page
                    }</span><input class="k-textbox"><span>${format(
                        options.messages.of,
                        length
                    )}</span></span>`
                );
            }
            element.on(
                CONSTANTS.KEYDOWN + NS,
                '.k-pager-input input',
                this._keydown.bind(this)
            );
        }

        // Add next and last buttons
        if (options.previousNext) {
            if (!element.find(NEXT).length) {
                element.append(
                    icon(
                        iconTemplate,
                        NEXT,
                        options.messages.next,
                        'k-pager-next'
                    )
                );
                next(element, index, length);
            }
            if (!element.find(LAST).length) {
                element.append(
                    icon(
                        iconTemplate,
                        LAST,
                        options.messages.last,
                        'k-pager-last'
                    )
                );
                last(element, index, length);
            }
        }

        // Add refresh button
        if (options.refresh) {
            if (!element.find('.k-pager-refresh').length) {
                element.append(
                    `<a href="#" class="k-pager-refresh k-link" aria-label="${
                        options.messages.refresh
                    }" title="${
                        options.messages.refresh
                    }"><span class="k-icon k-i-refresh"></span></a>`
                );
            }
            element.on(
                CONSTANTS.CLICK + NS,
                '.k-pager-refresh',
                this._refreshClick.bind(this)
            );
        }

        // Add info
        if (options.info) {
            if (!element.find('.k-pager-info').length) {
                element.append('<span class="k-pager-info k-label" />');
            }
        }

        // Add click handler
        element
            .addClass(WIDGET_CLASS)
            .on(CONSTANTS.CLICK + NS, 'a', this._navClick.bind(this))
            .on(
                CONSTANTS.CLICK + NS,
                '.k-current-page',
                this._toggleDropDown.bind(this)
            );
    },

    _initTooltip() {
        const that = this;
        this.tooltip = this.ul
            .kendoTooltip({
                filter: 'span.k-state-selected, a[data-index]',
                width: 256, // 1024 * 0.25
                height: 192, // 768 * 0.25
                position: 'bottom',
                content(e) {
                    const { target } = e;
                    const index =
                        target.attr(attr('index')) ||
                        parseInt(target.text(), 10) - 1;
                    return $(`<${CONSTANTS.DIV}/>`).attr(attr('index'), index);
                },
                show(e) {
                    e.sender.content.css({ padding: 0 });
                    const element = e.sender.content
                        .children(CONSTANTS.DIV)
                        .first();
                    const index = parseInt(element.attr(attr('index')), 10);
                    element.kendoStage({
                        dataSource: that.dataSource.at(index).components,
                        enabled: false,
                        mode: 'play',
                        scale: 0.25
                    });
                },
                hide(e) {
                    destroy(e.sender.content);
                },
                animation: {
                    open: {
                        effects: 'zoom',
                        duration: 150
                    }
                }
            })
            .data('kendoTooltip');
    },

    /**
     * Refresh
     * @method refresh
     * @param e
     */
    refresh(e) {
        const {
            currentPageTemplate,
            element,
            linkTemplate,
            options,
            selectTemplate
        } = this;
        const index = this.index();
        const length = this.length();
        let idx;
        let start = 0;
        let end;
        let html = '';
        // var position;

        if (e && e.action === 'itemchange') {
            return; // we only update the playbar on loading, 'add' and 'remove'
        }

        if (e && e.action === undefined) {
            this.trigger(CONSTANTS.DATABINDING);
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
                    linkTemplate,
                    start - 1,
                    '...',
                    false,
                    options.messages.morePages
                );
            }
            for (idx = start; idx <= end; idx++) {
                html += button(
                    idx === index ? selectTemplate : linkTemplate,
                    idx,
                    idx + 1,
                    true
                );
            }
            if (end < length - 1) {
                // idx = end + 1 here
                html += button(
                    linkTemplate,
                    idx,
                    '...',
                    false,
                    options.messages.morePages
                );
            }
            if (html === '') {
                html = selectTemplate({ text: 0 });
            }
            // Add drop down when there is not enough space to display numeric button
            html = currentPageTemplate({ text: index + 1 }) + html;
            this.ul.removeClass('k-state-expanded').html(html);
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
            element.find('.k-pager-info').html(html);
        }

        // Update input
        if (options.input) {
            element
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
            first(element, index, length);
            prev(element, index, length);
            next(element, index, length);
            last(element, index, length);
        }

        if (e && e.action === undefined) {
            // TODO: we are cheating here: we should have in addedDataItems the pages displayed as numbers
            // Without addedDataItems, it fails because all data items are not displayed
            this.trigger(CONSTANTS.DATABOUND, { addedDataItems: [] });
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
        this.ul.toggleClass('k-state-expanded');
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
     * Destroy
     */
    destroy() {
        this.element.find('*').off();
        this.element
            .off()
            .empty()
            .removeClass(WIDGET_CLASS);
        this.setDataSource(null);
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(PlayBar);
