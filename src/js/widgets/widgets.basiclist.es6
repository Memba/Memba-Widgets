/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Note: A DataSource cannot add records without a schema model, which an array does not provide.
// Also kendo.ui.Editable, which kendo.ui.ListView uses, also requires a schema model
// In order to build an array editor for basic types we had to:
// 1. use value binding to get the array of basic type (bolean, date, number, string)
// 2. convert the array into an arrey of { value: ... } objects;
// 3. pass that array with a schema model to the listview datasource

// TODO: New items are not added to ds._pristineData. As a result canceling editing removes new items (but not old ones).

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.listview';
import 'kendo.sortable';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    attr,
    data: { DataSource, ObservableArray },
    destroy,
    format,
    // guid,
    ns,
    support,
    template,
    toString,
    ui: { ListView, plugin, Sortable, Widget },
    // unbind
} = window.kendo;
const logger = new Logger('widgets.basiclist');
const NS = '.kendoBasicList';
const WIDGET_CLASS = 'k-widget kj-basiclist';

const TOOLBAR_TMPL =
    '<div class="k-widget k-toolbar k-header k-floatwrap"><div class="k-toolbar-wrap"><a class="k-button k-button-icontext"><span class="k-icon k-i-plus"></span>{0}</a></div></div>';
const ITEM_TMPL = `<li class="k-list-item">
        <div class="kj-handle"><span class="k-icon k-i-handler-drag" /></div>
        <div class="kj-input-wrap"><input value="#: value$() #" class="k-textbox k-state-disabled" /></div>
        <div class="kj-buttons">
            <a class="k-button k-edit-button" href="\\#"><span class="k-icon k-i-edit"/></a>
            <a class="k-button k-delete-button" href="\\#"><span class="k-icon k-i-delete"/></a>
        </div>
    </li>`;
const EDIT_TMPL = `<li class="k-list-item">
        <div class="kj-handle"><span class="k-icon k-i-handler-drag"/></div>
        <div class="kj-input-wrap"><input data-${ns}bind="value: value" name="value" validationMessage="{0}"/><span data-${ns}for="value" class="k-invalid-msg"/></div>
        <div class="kj-buttons">
            <a class="k-button k-update-button" href="\\#"><span class="k-icon k-i-check"/></a>
            <a class="k-button k-cancel-button" href="\\#"><span class="k-icon k-i-cancel"/></a>
        </div>
    </li>`;

const ATTRIBUTES = {
    boolean: {
        class: 'k-checkbox',
        type: 'checkbox',
    },
    date: {
        style: 'width:100%;',
        type: 'date',
    },
    number: {
        style: 'width:100%;',
        type: 'number',
    },
    string: {
        class: 'k-textbox',
        required: 'required',
        style: 'width:100%;',
        type: 'text',
    },
};
ATTRIBUTES.date[attr('role')] = 'datepicker';
ATTRIBUTES.number[attr('role')] = 'numerictextbox';

/**
 * BasicList
 * @class BasicList
 * @extends Widget
 */
const BasicList = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.value(this.options.value);
        this.enable(this.options.enabled);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'BasicList',
        // Attributes to add to input
        attributes: {},
        enabled: true,
        messages: {
            toolbar: {
                add: 'Add',
            },
            validation: {
                value: 'A value is required.',
            },
        },
        // type defines a default set of input attributes
        // which can be overriden by specifying attributes hereabove
        type: 'string',
        value: [],
    },

    /**
     * Events
     * Note: the click event is a feature copied from widgets.imagelist
     * where it is used to plug in the asset manager
     * @property events
     */
    events: [CONSTANTS.CHANGE, CONSTANTS.CLICK],

    /**
     * Layout widget
     * @method _render
     * @private
     */
    _render() {
        const { element } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a BasicList widget.'
        );
        this.wrapper = element.addClass(WIDGET_CLASS);
        // Build the toolbar
        this._initToolbar();
        // Build the listview
        this._initListView();
    },

    /**
     * Initialize toolbar
     * @method _initToolbar
     * @private
     */
    _initToolbar() {
        // Add toolbar from template
        this.toolbar = $(
            format(TOOLBAR_TMPL, this.options.messages.toolbar.add)
        ).appendTo(this.element);
    },

    /**
     * Initialize list view
     * @method _initListView
     * @private
     */
    _initListView() {
        // Add the list element
        this.ul = $(`<${CONSTANTS.UL}/>`).appendTo(this.element);

        // Create the list view
        this.listView = this.ul
            .kendoListView({
                dataSource: { data: [] },
                template: template(this._getTemplate()),
                editTemplate: template(this._getEditTemplate()),
                save(e) {
                    // We need to trigger a change and a blur otherwise
                    // the change event might not be raised to induce data bindings
                    e.item
                        .find(
                            'input:not(.k-state-disabled, .k-formatted-value)'
                        )
                        .change()
                        .blur();
                },
            })
            .data('kendoListView');
    },

    /**
     * Compute read template with type and atttibutes
     * @method _getTemplate
     * @private
     */
    _getTemplate() {
        // const { attributes, type } = this.options;
        // const t = $(ITEM_TMPL);
        // const input = t.find(CONSTANTS.INPUT);
        // input.attr({ ...ATTRIBUTES[type], ...attributes });
        // return t[0].outerHTML;
        return ITEM_TMPL;
    },

    /**
     * Compute edit template with type and atttibutes
     * @method _getEditTemplate
     * @private
     */
    _getEditTemplate() {
        const { attributes, messages, type } = this.options;
        const t = $(format(EDIT_TMPL, messages.validation.value));
        const input = t.find(CONSTANTS.INPUT);
        input.attr({ ...ATTRIBUTES[type], ...attributes });
        return t[0].outerHTML;
    },

    /**
     * Value
     * @param value
     */
    value(value) {
        let ret;
        if (
            $.type(value) === CONSTANTS.NULL ||
            Array.isArray(value) ||
            value instanceof ObservableArray
        ) {
            this._setDataSource(value || []);
        } else if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value();
        } else {
            throw new TypeError(
                '`value` should be an array, null or undefined'
            );
        }
        return ret;
    },

    /**
     * Sets listView DataSource
     * @param value
     * @private
     */
    _setDataSource(data) {
        const { listView, options } = this;
        assert.instanceof(
            ListView,
            listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        function refresh(e) {
            if (e.action !== 'sync') {
                this.trigger(CONSTANTS.CHANGE);
            }
        }
        if ($.isFunction(this._refreshHandler)) {
            listView.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }
        const dataSource = new DataSource({
            // change: this._refreshHandler
            data: data.map((value) => ({ /* id: guid(), */ value })),
            schema: {
                model: {
                    id: 'value', // 'id'
                    fields: {
                        /*
                        id: {
                            type: CONSTANTS.STRING,
                        },
                        */
                        value: {
                            type: this.options.type,
                        },
                    },
                    value$() {
                        let ret;
                        const f = options.attributes[attr('format')];
                        const c = options.attributes[attr('culture')];
                        switch (options.type) {
                            // case 'boolean':
                            //     break;
                            case 'date':
                                ret = toString(this.get('value'), f || 'd', c);
                                break;
                            case 'number':
                                ret = toString(this.get('value'), f || 'n', c);
                                break;
                            case 'string':
                            default:
                                ret = this.get('value');
                                break;
                        }
                        return ret;
                    },
                },
            },
        });
        listView.setDataSource(dataSource);
        this._refreshHandler = refresh.bind(this);
        listView.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);
    },

    /**
     * Get value from dataSource
     * @private
     */
    _value() {
        const { listView } = this;
        assert.instanceof(
            ListView,
            listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        return listView.dataSource.data().map((item) => item.get('value'));
    },

    /**
     * Enable/disable the widget
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Cancel any editing in progress
        if (this.listView instanceof ListView) {
            this.listView.cancel();
        }

        // Enable/disable the toolbar
        this.toolbar.toggleClass(CONSTANTS.DISABLED_CLASS, !enabled);
        $('.k-button', this.toolbar).off(NS);
        if (enabled) {
            // Add click event handler for the Add button
            $('.k-button', this.toolbar).on(
                `${CONSTANTS.CLICK}${NS}`,
                this._onToolbarClick.bind(this)
            );
        }

        // Enable/disable the listView
        // this.listView.enable(enabled); does not work (no enable method)
        // this.sortable.enable(enabled); does not work (no enable method)
        // Add event handlers for list buttons, especially to plug in the asset manager
        this.ul.toggleClass(CONSTANTS.DISABLED_CLASS, !enabled);
        // Restore edit button classes on ITEM_TMPL
        // No need to do that for EDIT_TMPL because we have just canceled any editing in progress
        this.ul.children('li').each((index, li) => {
            // @see https://www.telerik.com/forums/disable-listview-template-edit-delete-buttons
            $(li)
                .find('a.k-button')
                .eq(0)
                .toggleClass('k-edit-button', enabled);
            $(li)
                .find('a.k-button')
                .eq(1)
                .toggleClass('k-delete-button', enabled);
        });
        this.ul.off(NS);
        if (enabled) {
            // Add the delegated click event handler for item buttons
            this.ul.on(
                `${CONSTANTS.CLICK}${NS}`,
                'a.k-button',
                this._onItemButtonClick.bind(this)
            );
        }

        // Activate list item sorting
        if (this.sortable instanceof Sortable) {
            this.sortable.destroy();
            this.sortable = undefined;
        }
        if (enabled) {
            // Make the list sortable
            const that = this;
            this.sortable = this.ul
                .kendoSortable({
                    cursor: 'move',
                    // filter: '> .k-listview-content > .k-list-item',
                    filter: '.k-list-item',
                    handler: '.kj-handle, .kj-handle *',
                    holdToDrag: support.touch,
                    ignore: 'input', // otherwise focus and selections won't work properly in inputs
                    placeholder(element) {
                        return element.clone().css('opacity', 0.4);
                    },
                    hint(element) {
                        const hint = element
                            .clone()
                            .removeClass(CONSTANTS.SELECTED_CLASS);
                        hint.find('a.k-button')
                            .addClass(CONSTANTS.DISABLED_CLASS)
                            .removeClass(
                                // Remove any handler from buttons
                                'k-edit-button k-delete-button k-update-button k-cancel-button'
                            );
                        return hint;
                    },
                    change(e) {
                        const { dataSource } = that.listView;
                        const skip = dataSource.skip() || 0;
                        const newIndex = e.newIndex + skip;
                        const dataItem = dataSource.getByUid(
                            e.item.attr(attr(CONSTANTS.UID))
                        );
                        dataSource.remove(dataItem);
                        dataSource.insert(newIndex, dataItem);
                    },
                })
                .data('kendoSortable');
        }
    },

    /**
     * Event handler for clicking the Add button in the toolbar
     * @method _onToolbarClick
     * @param e
     * @private
     */
    _onToolbarClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        e.preventDefault();
        this.listView.cancel();
        const dataItem = this.listView.dataSource.add({});
        this.listView.edit(
            this.element.find(`[${attr(CONSTANTS.UID)}="${dataItem.uid}"]`)
        );
    },

    /**
     * Event handler for clicking any item buttons
     * @method _onItemButtonClick
     * @param e
     * @private
     */
    _onItemButtonClick(e) {
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
        const button = $(e.currentTarget);
        let action;
        if (button.hasClass('k-edit-button')) {
            action = 'edit';
        } else if (button.hasClass('k-delete-button')) {
            action = 'delete';
        } else if (button.hasClass('k-update-button')) {
            action = 'update';
        } else if (button.hasClass('k-cancel-button')) {
            action = 'cancel';
        }
        const listItem = button.closest('.k-list-item');
        const uid = listItem.attr(attr(CONSTANTS.UID));
        const dataItem = this.listView.dataSource.getByUid(uid);
        this.trigger(CONSTANTS.CLICK, { action, item: dataItem });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { element, listView } = this;
        Widget.fn.destroy.call(this);
        this.enable(false);
        // unbind(element);
        if (listView instanceof ListView) {
            if ($.isFunction(this._refreshHandler)) {
                listView.dataSource.unbind(
                    CONSTANTS.CHANGE,
                    this._refreshHandler
                );
                this._refreshHandler = undefined;
            }
            listView.destroy();
            this.listView = undefined;
        }
        // Destroy widget
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'BasicList')) {
    // Prevents loading several times in karma
    plugin(BasicList);
}
