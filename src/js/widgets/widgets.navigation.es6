/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider horizontal

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.sortable';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { Page, PageDataSource } from '../data/data.page.es6';
import TOOLS from '../tools/util.constants.es6';
import './widgets.stage.es6';

const {
    attr,
    data: { ObservableArray },
    destroy,
    format,
    notify,
    ns,
    roleSelector,
    support,
    template,
    ui: { DataBoundWidget, plugin /* , Stage */ },
    unbind,
} = window.kendo;
const logger = new Logger('widgets.navigation');
const NS = '.kendoNavigation';
const WIDGET_CLASS = 'k-widget k-group kj-navigation';

const PLACEHOLDER_CLASS = 'kj-placeholder';
const HINT_CLASS = 'kj-hint';
const ALL_ITEMS_SELECTOR = `div.kj-navigation-item[${attr(CONSTANTS.UID)}]`;
const ITEM_BYUID_SELECTOR = `div.kj-navigation-item[${attr(
    CONSTANTS.UID
)}="{0}"]`;
const ARIA_SELECTED = 'aria-selected';
const ITEM_TEMPLATE = `<div data-${ns}uid="#: uid #" class="kj-navigation-item" role="option" aria-selected="false"><div data-${ns}role="stage"></div></div>`;

/**
 * Navigation
 * @class Navigation
 * @extends DataBoundWidget
 */
const Navigation = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        // By default, no page is selected
        this._selectedUid = null;
        this._templates();
        this._render();
        this._addSorting();
        this._dataSource();
        // this.refresh();
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Navigation',
        autoBind: true,
        enabled: true, // TODO readonly
        itemTemplate: ITEM_TEMPLATE,
        menuIcon: 'calibration_mark.svg', // TODO not used
        mode: TOOLS.STAGE_MODES.DESIGN,
        pageWidth: 1024, // TODO: assuming page size here: where do we read it from?
        pageSpacing: 20, // pageSpacing - selectionBorder determines the margin
        pageHeight: 768,
        selectionBorder: 10, // this is the padding of the page wrapper, which draws a border around it
        messages: {
            empty: 'No page to display', // TODO: add message in UI (see refresh)
        },
    },

    /**
     * Events
     * @property events
     */
    events: [
        CONSTANTS.CHANGE,
        CONSTANTS.DATABINDING,
        CONSTANTS.DATABOUND,
        CONSTANTS.SELECT,
    ],

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    // setOptions: function (options) {
    //    DataBoundWidget.fn.setOptions.call(this, options);
    //    TODO: we need to read height and width both from styles and options and decide which wins
    // },

    /**
     * Gets/Sets the index of the selected page in the navigation
     * Note: index is 0 based, whereas playbar page numbers are 1 based
     * @method index
     * @param index
     * @returns {*}
     */
    index(index) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            index,
            assert.format(
                assert.messages.typeOrUndef.default,
                'index',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        let page;
        if ($.type(index) === CONSTANTS.UNDEFINED) {
            page = this.dataSource.getByUid(this._selectedUid); // TODO check null or undefined
            ret = page instanceof Page ? this.dataSource.indexOf(page) : -1;
        } else {
            page = this.dataSource.at(index);
            if (page instanceof Page) {
                this.value(page);
            } else {
                this.value(null);
            }
        }
        return ret;
    },

    /**
     * Gets/Sets the id of the selected page in the navigation
     * @method id
     * @param id
     * @returns {*}
     */
    id(id) {
        // TODO use asserts
        let page;
        let ret;
        if (
            $.type(id) === CONSTANTS.STRING ||
            $.type(id) === CONSTANTS.NUMBER
        ) {
            page = this.dataSource.get(id);
            if (page instanceof Page) {
                this.value(page);
            } else {
                this.value(null);
            }
        } else if ($.type(id) === CONSTANTS.UNDEFINED) {
            page = this.dataSource.getByUid(this._selectedUid);
            if (page instanceof Page) {
                ret = page[page.idField];
            }
        } else {
            throw new TypeError('Invalid id');
        }
        return ret;
    },

    /**
     * Gets/Sets the value of the selected page in the navigation
     * Set to null to unselect a page (state where no page is selected)
     *
     * @method value
     * @param page
     * @returns {*}
     */
    value(page) {
        assert.nullableInstanceOrUndef(
            Page,
            page,
            assert.format(
                assert.messages.nullableInstanceOrUndef.default,
                'page',
                'Page'
            )
        );
        let ret;
        if (page === null || page instanceof Page) {
            let hasChanged = false;
            if (page === null && this._selectedUid !== null) {
                hasChanged = true;
                this._selectedUid = null;
            } else if (
                page instanceof Page &&
                this._selectedUid !== page.uid &&
                this.dataSource.indexOf(page) > -1
            ) {
                hasChanged = true;
                this._selectedUid = page.uid;
            }
            if (hasChanged) {
                logger.debug(`selected page uid set to ${this._selectedUid}`);
                this._toggleSelection();
                this.trigger(CONSTANTS.CHANGE, { value: page });
            }
        } else if ($.type(page) === CONSTANTS.UNDEFINED) {
            ret =
                this._selectedUid === null
                    ? null
                    : this.dataSource.getByUid(this._selectedUid) || null; // getByUid returns undefined if not found
        }
        return ret;
    },

    /**
     * lengths
     * @method length()
     * @returns {*}
     */
    length() {
        return this.dataSource instanceof PageDataSource
            ? this.dataSource.total()
            : -1;
    },

    /**
     * Returns all children of the ul list
     * This method is required for triggering the dataBinding event
     * @method items
     * @returns {Function|children|t.children|HTMLElement[]|ct.children|node.children|*}
     */
    items() {
        return this.element[0].children;
    },

    /**
     * Height of navigation
     * @method height
     * @param height
     * @returns {string}
     */
    height(height) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            height,
            assert.format(
                assert.messages.typeOrUndef.default,
                'height',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(height) === CONSTANTS.UNDEFINED) {
            ret = this.options.height;
        } else if (height < 0) {
            throw new RangeError(
                '`height` is expected to be a positive number.'
            );
        } else if (height !== this.options.height) {
            this.options.height = height;
        }
        return ret;
    },

    /**
     * Width of navigation
     * @method width,
     * @param width
     * @returns {string}
     */
    width(width) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            width,
            assert.format(
                assert.messages.typeOrUndef.default,
                'width',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(width) === CONSTANTS.UNDEFINED) {
            ret = this.options.width;
        } else if (width < 0) {
            throw new RangeError(
                '`width` is expected to be a positive number.'
            );
        } else if (width !== this.options.width) {
            this.options.width = width;
        }
        return ret;
    },

    /**
     * Templates
     * @private
     */
    _templates() {
        this._itemTemplate = template(this.options.itemTemplate);
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
        if (
            this.dataSource instanceof PageDataSource &&
            $.isFunction(this._refreshHandler)
        ) {
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
     * @private
     */
    _render() {
        this.wrapper = this.element
            .addClass(WIDGET_CLASS)
            .attr('role', 'listbox')
            .on(
                `${CONSTANTS.MOUSEENTER}${NS} ${CONSTANTS.MOUSELEAVE}${NS}`,
                ALL_ITEMS_SELECTOR,
                this._onToggleHover.bind(this)
            )
            .on(
                `${CONSTANTS.FOCUS}${NS} ${CONSTANTS.BLUR}${NS}`,
                ALL_ITEMS_SELECTOR,
                this._onToggleFocus.bind(this)
            )
            .on(
                CONSTANTS.CLICK + NS,
                ALL_ITEMS_SELECTOR,
                this._onClick.bind(this)
            );
        // TODO debugger;
        notify(this);
    },

    /**
     * Enable/disable
     * Note: This allows click slections but no sorting (it is a read-only mode)
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        if (enabled) {
            // TODO allow click selections but no sorting
            // TODO: maybe we need to divide between enabled and readonly
            $.noop();
        }
    },

    /**
     * Add sorting
     * @private
     */
    _addSorting() {
        const that = this;
        that.element.kendoSortable({
            filter: ALL_ITEMS_SELECTOR,
            holdToDrag: support.touch,
            hint(element) {
                return element.clone().addClass(HINT_CLASS); // Note: note used
            },
            placeholder(element) {
                return element.clone().addClass(PLACEHOLDER_CLASS);
            },
            change(e) {
                assert.isNonEmptyPlainObject(
                    e,
                    assert.format(
                        assert.messages.isNonEmptyPlainObject.default,
                        'e'
                    )
                );
                assert.instanceof(
                    PageDataSource,
                    that.dataSource,
                    assert.format(
                        assert.messages.instanceof.default,
                        'that.dataSource',
                        'PageDataSource'
                    )
                );
                if (
                    e.action === 'sort' &&
                    e.item instanceof $ &&
                    $.type(e.oldIndex) === CONSTANTS.NUMBER &&
                    $.type(e.newIndex) === CONSTANTS.NUMBER
                ) {
                    const page = that.dataSource.at(e.oldIndex);
                    assert.equal(
                        e.item.attr(attr(CONSTANTS.UID)),
                        page.uid,
                        assert.format(
                            assert.messages.equal.default,
                            'page.uid',
                            'e.item.attr("data-uid")'
                        )
                    );
                    // console.log(page.instructions + ': ' + e.oldIndex + '-->' + e.newIndex);
                    that.dataSource.remove(page);
                    that.dataSource.insert(e.newIndex, page);
                }
            },
        });
    },

    /**
     * Add a navigation item containing a stage(page) wrapped in a div
     * @param page
     * @param index
     * @private
     */
    _addItem(page, index) {
        const navigation = this.element;

        // Check this we get a page this is not already in navigation
        if (
            page instanceof Page &&
            navigation.find(format(ITEM_BYUID_SELECTOR, page.uid)).length === 0
        ) {
            // Create navigation item (actually a selection frame around the thumbnail stage)
            const navigationItem = $(this._itemTemplate({ uid: page.uid })).css(
                {
                    boxSizing: 'border-box',
                    position: 'relative',
                    padding: parseInt(this.options.selectionBorder, 10),
                    margin:
                        parseInt(this.options.pageSpacing, 10) -
                        parseInt(this.options.selectionBorder, 10),
                }
            );

            // Add to navigation
            const nextIndex =
                $.type(index) === CONSTANTS.NUMBER
                    ? index
                    : navigation.children(ALL_ITEMS_SELECTOR).length;
            const nextNavigationItem = navigation.children(
                `${ALL_ITEMS_SELECTOR}:eq(${nextIndex})`
            );
            if (nextNavigationItem.length) {
                nextNavigationItem.before(navigationItem);
            } else {
                navigation.append(navigationItem);
            }

            // Make the stage and bind to components
            const stage = navigationItem
                .find(roleSelector('stage'))
                .kendoStage({
                    mode: this.options.mode,
                    enabled: false,
                    readonly: true,
                    dataSource: page.components,
                    scale: this._getStageScale(),
                })
                .data('kendoStage');

            // Set page style
            stage.style(page.style);
        }
    },

    /**
     * Remove a navigation item (and its embedded stage)
     * @param uid
     * @private
     */
    _removeItemByUid(uid) {
        // Find and remove navigation item containing stage
        const item = this.element.find(format(ITEM_BYUID_SELECTOR, uid));
        // kendo.unbind(item);
        destroy(item);
        item.off().remove();
    },

    /**
     * Refresh
     * @param e
     */
    refresh(e) {
        const that = this;
        let selectedIndex = that.index();
        if (e && e.action === undefined) {
            that.trigger(CONSTANTS.DATABINDING);
        }
        if (e === undefined || e.action === undefined) {
            let pages = [];
            if (e === undefined && that.dataSource instanceof PageDataSource) {
                pages = that.dataSource.data();
            } else if (e && e.items instanceof ObservableArray) {
                pages = e.items;
            }
            that.element.find(ALL_ITEMS_SELECTOR).each((index, el) => {
                that._removeItemByUid($(el).attr(attr(CONSTANTS.UID)));
            });
            pages.forEach((page) => {
                that._addItem(page);
            });
        } else if (
            e.action === 'add' &&
            Array.isArray(e.items) &&
            e.items.length
        ) {
            e.items.forEach((page) => {
                selectedIndex = that.dataSource.indexOf(page);
                that._addItem(page, selectedIndex);
            });
        } else if (
            e.action === 'remove' &&
            Array.isArray(e.items) &&
            e.items.length
        ) {
            e.items.forEach((page) => {
                that._removeItemByUid(page.uid);
            });
            selectedIndex = e.index || -1;
        } else if (e.action === 'itemchange') {
            if (e.field === 'style') {
                e.items.forEach((page) => {
                    // TODO Review
                    const item = that.element.find(
                        format(ITEM_BYUID_SELECTOR, page.uid)
                    );
                    const stage = item
                        .find(roleSelector('stage'))
                        .data('kendoStage');
                    stage.style(page.style);
                });
            }
            return;
        }
        const total = that.dataSource.total();
        if (selectedIndex >= total) {
            selectedIndex = total - 1;
        }
        that.index(selectedIndex);
        // TODO Display a message when there is no data to display?
        if (e && e.action === undefined) {
            that.trigger(CONSTANTS.DATABOUND);
        }
        that.resize();
    },

    /**
     * Adds the k-state-selected class to the selected page determined by that._selectedUid
     * This actually adds a coloured border
     * @method displaySelection
     */
    _toggleSelection() {
        this.element
            .find(ALL_ITEMS_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .removeProp(ARIA_SELECTED);

        this.element
            .find(format(ITEM_BYUID_SELECTOR, this._selectedUid))
            .addClass(CONSTANTS.SELECTED_CLASS)
            .prop(ARIA_SELECTED, true);
    },

    /**
     * Get stage scale
     * @returns {number}
     * @private
     */
    _getStageScale() {
        let scale =
            (this.element.innerWidth() -
                2 * parseInt(this.options.pageSpacing, 10) -
                2 * parseInt(this.options.selectionBorder, 10)) /
            parseInt(this.options.pageWidth, 10);
        if (scale < 0) {
            scale = 0;
        }
        return scale;
    },

    /**
     * Resizes pages according to widget size
     * @method resize
     */
    resize() {
        const scale = this._getStageScale();

        // TODO: we are not clear with borders here
        // we actually need the widget's outerWidth and outerHeight
        // because a border might be added to pageWidth and pageHeight
        this.element
            .find(ALL_ITEMS_SELECTOR)
            .width(scale * parseInt(this.options.pageWidth, 10))
            .height(scale * parseInt(this.options.pageHeight, 10))
            .find(roleSelector('stage'))
            .each((index, element) => {
                $(element).data('kendoStage').scale(scale);
            });
        logger.debug({
            method: 'resize',
            message: 'widget resized',
            data: { scale },
        });
    },

    /**
     * Toggles the hover style when mousing over mavigation items (a stage with ou outer div that acts as a frame)
     * @method _onToggleHover
     * @param e
     * @private
     */
    _onToggleHover(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        $(e.currentTarget).toggleClass(
            CONSTANTS.HOVER_CLASS,
            e.type === CONSTANTS.MOUSEENTER
        );
    },

    /**
     * Toggles the focus style when an explorer item has focus
     * @method _onToggleFocus
     * @param e
     * @private
     */
    _onToggleFocus(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        $(e.currentTarget).toggleClass(
            CONSTANTS.FOCUSED_CLASS,
            e.type === CONSTANTS.FOCUS
        );
    },

    /**
     * Click event handler bond to page wrappers to select a page
     * @method _onClick
     * @param e
     * @private
     */
    _onClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        e.preventDefault();
        const target = $(e.currentTarget);
        if (!target.is(`${CONSTANTS.DOT}${CONSTANTS.SELECTED_CLASS}`)) {
            const page = this.dataSource.getByUid(
                target.attr(attr(CONSTANTS.UID))
            );
            this.value(page);
        }
    },

    /**
     * Destroy
     */
    destroy() {
        const that = this;
        // unbind kendo
        unbind(that.element);
        // unbind all other events
        that.element.find('*').off();
        that.element.off().empty().removeClass(WIDGET_CLASS);
        that.setDataSource(null);
        DataBoundWidget.fn.destroy.call(that);
        destroy(that.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Navigation')) {
    // Prevents loading several times in karma
    plugin(Navigation);
}
