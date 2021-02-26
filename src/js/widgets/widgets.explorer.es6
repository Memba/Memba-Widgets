/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.sortable';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { PageDataSource } from '../data/data.page.es6';
import {
    PageComponent,
    PageComponentDataSource,
} from '../data/data.pagecomponent.es6';
import tools from '../tools/tools.es6';
import { StubTool } from '../tools/tools.base.es6';

const {
    attr,
    data: { ObservableArray },
    destroy,
    format,
    keys,
    ns,
    support,
    template,
    ui: { DataBoundWidget, plugin },
} = window.kendo;
const logger = new Logger('widgets.explorer');

const NS = '.kendoExplorer';
const WIDGET_CLASS = 'k-widget k-group kj-explorer'; // k-list-container k-reset
const UL =
    '<ul tabindex="-1" unselectable="on" role="listbox" class="k-list k-reset" />';
const PLACEHOLDER_CLASS = 'kj-placeholder';
const HINT_CLASS = 'kj-hint';
const ALL_ITEMS_SELECTOR = `li.kj-explorer-item[${attr(CONSTANTS.UID)}]`;
const ITEM_BYUID_SELECTOR = `li.kj-explorer-item[${attr(CONSTANTS.UID)}="{0}"]`;
const ARIA_SELECTED = 'aria-selected';
const DEFAULT_EXTENSION = '.svg';
const DEFAULT_PATH = '../../styles/images/o_collection/svg/office/';

/**
 * Explorer
 * @class Explorer
 * @extends DataBoundWidget
 */
const Explorer = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._templates();
        this._render();
        this._addSorting();
        this._dataSource();
        this.enable(
            this.element.prop('disabled') ? false : !!this.options.enabled
        );
        // this.refresh();
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Explorer',
        autoBind: true,
        enabled: true,
        extension: DEFAULT_EXTENSION,
        id: null,
        iconPath: DEFAULT_PATH,
        index: 0,
        itemTemplate: `<li data-${ns}uid="#= uid #" tabindex="-1" unselectable="on" role="option" class="k-item kj-explorer-item"><span class="k-in"><img class="k-image" alt="#= tool #" src="#= icon$() #"><span class="k-text">#= description$() #</span></span></li>`,
        messages: {
            empty: 'No item to display',
        },
        tools,
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
     * @method setOptions
     * @param options
     */
    /*
    setOptions: function (options) {
        DataBoundWidget.fn.setOptions.call(this, options);
        // TODO initialize properly from that.options.index and that.options.id
    },
    */

    /**
     * IMPORTANT: index is 0 based
     * @method index
     * @param index
     * @returns {*}
     */
    index(index) {
        // TODO call it select() ???
        // https://docs.telerik.com/kendo-ui/api/javascript/ui/combobox/methods/select
        // https://docs.telerik.com/kendo-ui/api/javascript/ui/dropdownlist/methods/select
        // https://docs.telerik.com/kendo-ui/api/javascript/ui/dropdownlist/methods/dataitem
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            index,
            assert.format(
                assert.messages.type.default,
                'index',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        let component;
        if ($.type(index) === CONSTANTS.NUMBER) {
            if (index % 1 !== 0 || index < -1 || index >= this.length()) {
                throw new RangeError();
            }
            component = this.dataSource.at(index);
            if (component instanceof PageComponent) {
                this.value(component);
            } else {
                this.value(null);
            }
        } else if ($.type(index) === CONSTANTS.UNDEFINED) {
            component = this.dataSource.getByUid(this._selectedUid);
            ret =
                component instanceof PageComponent
                    ? this.dataSource.indexOf(component)
                    : -1;
        }
        return ret;
    },

    /**
     * @method id
     * @param id
     * @returns {*}
     */
    id(id) {
        // Note: we do not use numbers as ids
        assert.typeOrUndef(
            CONSTANTS.STRING, // CONSTANTS.NUMBER
            id,
            assert.format(
                assert.messages.typeOrUndef.default,
                'id',
                CONSTANTS.STRING // CONSTANTS.NUMBER
            )
        );
        let ret;
        let component;
        if ($.type(id) === CONSTANTS.UNDEFINED) {
            component = this.dataSource.getByUid(this._selectedUid);
            if (component instanceof PageComponent) {
                ret = component[component.idField];
            }
        } else {
            component = this.dataSource.get(id);
            this.value(component instanceof PageComponent ? component : null);
        }
        return ret;
    },

    /**
     * Gets/Sets the value of the selected component in the explorer
     * @method value
     * @param component
     * @returns {*}
     */
    value(component) {
        assert.nullableInstanceOrUndef(
            PageComponent,
            component,
            assert.format(
                assert.messages.nullableInstanceOrUndef.default,
                'component',
                'PageComponent'
            )
        );
        let ret;
        if ($.type(component) === CONSTANTS.UNDEFINED) {
            ret =
                $.type(this._selectedUid) === CONSTANTS.NULL
                    ? null
                    : this.dataSource.getByUid(this._selectedUid) || null;
            // Note: getByUid returns undefined if not found
        } else {
            let hasChanged = false;
            if (
                $.type(component) === CONSTANTS.NULL &&
                this._selectedUid !== null
            ) {
                hasChanged = true;
                this._selectedUid = null;
            } else if (
                component instanceof PageComponent &&
                this._selectedUid !== component.uid &&
                this.dataSource.indexOf(component) > -1
            ) {
                hasChanged = true;
                this._selectedUid = component.uid;
            }
            if (hasChanged) {
                logger.debug(
                    `selected component uid set to ${this._selectedUid}`
                );
                this._toggleSelection();
                this.trigger(CONSTANTS.CHANGE, { value: component });
            }
        }
        return ret;
    },

    /**
     * @method total()
     * @returns {*}
     */
    length() {
        return this.dataSource instanceof PageComponentDataSource
            ? this.dataSource.total()
            : -1;
    },

    /**
     * Toggles class on selected item determined by value of widget
     * @private
     */
    _toggleSelection() {
        this.ul
            .find(ALL_ITEMS_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .removeProp(ARIA_SELECTED);

        this.ul
            .find(format(ITEM_BYUID_SELECTOR, this._selectedUid))
            .addClass(CONSTANTS.SELECTED_CLASS)
            .prop(ARIA_SELECTED, true);
    },

    /**
     * Returns all children of the ul list
     * This method is required for triggering the dataBinding evvent
     * @method items
     * @returns {Function|children|t.children|HTMLElement[]|ct.children|node.children|*}
     */
    items() {
        return this.ul[0].children;
    },

    /**
     * @method _templates
     * @private
     */
    _templates() {
        const { extension, iconPath, itemTemplate } = this.options;
        this.iconPath = `${
            iconPath + (/\/$/.test(`${iconPath}`) ? '' : '/')
        }{0}${/^\./.test(`${extension}`) ? '' : '.'}${extension}`;
        this.itemTemplate = template(itemTemplate);
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const { element } = this;
        // Add wrapper property for visible bindings
        this.wrapper = element.addClass(WIDGET_CLASS).attr('role', 'listbox');
        // Add ul property
        this.ul = element.find('ul.k-list');
        if (!this.ul.length) {
            this.ul = $(UL).appendTo(element);
        }
    },

    /**
     * Enables or disables the widget.
     * @method enable
     * @param enable
     */
    enable(enable) {
        const { element } = this;
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        element.off(NS);
        if (enabled) {
            // TODO Add touch and pointer events
            // CONSTANTS.TAP event does not exist
            element
                .on(
                    `${CONSTANTS.MOUSEENTER}${NS} ${CONSTANTS.MOUSELEAVE}${NS}`,
                    ALL_ITEMS_SELECTOR,
                    this._onToggleHover.bind(this)
                )
                .on(
                    `${CONSTANTS.BLUR}${NS} ${CONSTANTS.FOCUS}${NS}`,
                    ALL_ITEMS_SELECTOR,
                    this._onToggleFocus.bind(this)
                )
                .on(
                    `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TAP}${NS}`,
                    ALL_ITEMS_SELECTOR,
                    this._onClick.bind(this)
                );
        }
    },

    // TODO focus + keyboard events

    /**
     * Toggles the hover style when mousing over explorer items
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
     * Widget navigation using arrows
     * @method _onKeyDown
     * @param e
     * @private
     */
    _onKeyDown(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const key = e.which;
        if (key === keys.HOME) {
            this._firstItem();
        } else if (key === keys.END) {
            this._lastItem();
        }
    },

    /**
     * Click event handler
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
        if (!target.is(`.${CONSTANTS.SELECTED_CLASS}`)) {
            const component = this.dataSource.getByUid(
                target.attr(attr(CONSTANTS.UID))
            );
            this.value(component);
        }
    },

    /**
     * Add sorting
     * @private
     */
    _addSorting() {
        this.ul.kendoSortable({
            filter: ALL_ITEMS_SELECTOR,
            holdToDrag: support.touch,
            hint(element) {
                // element is LI, so it needs to be wrapped in UL
                // but because of styles we need to wrap the UL in a DIV
                return element
                    .clone()
                    .width(element.width())
                    .height(element.height())
                    .addClass(HINT_CLASS) // Note: note used
                    .wrap(UL)
                    .parent()
                    .wrap(`<${CONSTANTS.DIV}/>`)
                    .parent();
            },
            placeholder(element) {
                return element.clone().addClass(PLACEHOLDER_CLASS);
            },
            change: this._onChange.bind(this),
        });
    },

    /**
     * _onChange
     * @method _onChange
     * @param e
     * @private
     */
    _onChange(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        assert.instanceof(
            PageComponentDataSource,
            this.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'that.dataSource',
                'PageComponentDataSource'
            )
        );
        if (
            e.action === 'sort' &&
            e.item instanceof $ &&
            $.type(e.oldIndex) === CONSTANTS.NUMBER &&
            $.type(e.newIndex) === CONSTANTS.NUMBER
        ) {
            const component = this.dataSource.at(e.oldIndex);
            assert.equal(
                e.item.attr(attr(CONSTANTS.UID)),
                component.uid,
                assert.format(
                    assert.messages.equal.default,
                    'component.uid',
                    `e.item.attr("data-${ns}uid")`
                )
            );
            this.dataSource.remove(component);
            this.dataSource.insert(e.newIndex, component);
        }
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
        if (
            this.dataSource instanceof PageComponentDataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // use null to explicitly destroy the dataSource bindings

            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = PageComponentDataSource.create(
                this.options.dataSource
            );

            // bind to the change event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
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
     * @method refresh
     * @param e
     */
    refresh(e) {
        const that = this;
        let selectedIndex = that.index();
        if (e && $.type(e.action) === CONSTANTS.UNDEFINED) {
            that.trigger(CONSTANTS.DATABINDING);
        }
        if (
            $.type(e) === CONSTANTS.UNDEFINED ||
            $.type(e.action) === CONSTANTS.UNDEFINED
        ) {
            let components = [];
            if (
                $.type(e) === CONSTANTS.UNDEFINED &&
                that.dataSource instanceof PageDataSource
            ) {
                components = that.dataSource.data();
            } else if (e && e.items instanceof ObservableArray) {
                components = e.items;
            }
            $.each(that.element.find(ALL_ITEMS_SELECTOR), (index, item) => {
                that._removeItemByUid($(item).attr(attr(CONSTANTS.UID)));
            });
            $.each(components, (index, component) => {
                that._addItem(component);
            });
        } else if (
            e.action === 'add' &&
            Array.isArray(e.items) &&
            e.items.length
        ) {
            $.each(e.items, (index, component) => {
                selectedIndex = that.dataSource.indexOf(component);
                that._addItem(component, selectedIndex);
            });
        } else if (
            e.action === 'remove' &&
            Array.isArray(e.items) &&
            e.items.length
        ) {
            $.each(e.items, (index, page) => {
                that._removeItemByUid(page.uid);
                selectedIndex = e.index || -1;
            });
        } else if (e.action === 'itemchange') {
            return;
        }
        const total = that.dataSource.total();
        if (selectedIndex >= total) {
            selectedIndex = total - 1;
        }
        that.index(selectedIndex);
        // TODO Display a message when there is no data to display?
        if (e && $.type(e.action) === CONSTANTS.UNDEFINED) {
            that.trigger(CONSTANTS.DATABOUND);
        }
    },

    /**
     * Remove an explorer item
     * @param uid
     * @private
     */
    _removeItemByUid(uid) {
        if (this.ul instanceof $ && this.ul.length) {
            // Find and remove an explorer item
            const item = this.ul.find(format(ITEM_BYUID_SELECTOR, uid));
            item.off().remove();
        }
    },

    /**
     * Add an explorer item (li) corresponding to a component
     * @param component
     * @param index
     * @private
     */
    _addItem(component, index) {
        const { iconPath, options, ul } = this;

        // Check that we get a component that is not already in explorer
        if (
            ul instanceof $ &&
            ul.length &&
            component instanceof PageComponent &&
            ul.find(format(ITEM_BYUID_SELECTOR, component.uid)).length === 0
        ) {
            const tool = options.tools(component.tool);
            if (tool instanceof StubTool) {
                // Create explorer item
                const explorerItem = this.itemTemplate(
                    $.extend(component, {
                        descriptions$() {
                            return tool.getDescription(component);
                        },
                        icon$() {
                            return format(iconPath, tool.icon);
                        },
                    })
                );

                // Add to explorer ul
                const nextIndex =
                    $.type(index) === CONSTANTS.NUMBER
                        ? index
                        : ul.children(ALL_ITEMS_SELECTOR).length;
                const nextExplorerItem = ul.children(
                    `${ALL_ITEMS_SELECTOR}:eq(${nextIndex})`
                );
                if (nextExplorerItem.length) {
                    nextExplorerItem.before(explorerItem);
                } else {
                    ul.append(explorerItem);
                }
            }
        }
    },

    /**
     * Destroy
     */
    destroy() {
        this.setDataSource(null);
        this.enable(false);
        this.ul = undefined;
        this.wrapper = undefined;
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Explorer')) {
    // Prevents loading several times in karma
    plugin(Explorer);
}
