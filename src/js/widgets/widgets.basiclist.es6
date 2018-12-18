/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Note: A DataSource cannot add records without a schema model, which an array does not provide.
// Also kendo.ui.Editable, which kendo.ui.ListView uses, also requires a schema model
// In order to build an array editor we have two options:
// 1. use DataSource and ListView as in widgets.imagelist, but this requires syncing
//   the widget dataSource wrapping an array to an internal DataSource with a schema model
// 2. use an ObservableArray as widget value (vs. source) without ListView
// We have chosen option 1 because it is less work considering widget.imagelist implementation
// and the syncing is done in the refresh and _onChange methods

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.listview';
import 'kendo.sortable';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    attr,
    data: { DataSource },
    destroy,
    format,
    ns,
    support,
    template,
    ui: { DataBoundWidget, ListView, plugin, Sortable },
    unbind
} = window.kendo;
const logger = new Logger('widgets.basiclist');
const NS = '.kendoBasicList';
const WIDGET_CLASS = 'k-widget kj-basiclist';

const TOOLBAR_TMPL =
    '<div class="k-widget k-toolbar k-header k-floatwrap"><div class="k-toolbar-wrap"><div class="k-button k-button-icontext"><span class="k-icon k-i-plus"/>{0}</div></div></div>';
const ITEM_TMPL =
    '<li class="k-list-item">' +
    '<div class="kj-handle"><span class="k-icon k-i-handler-drag"/></div>' +
    '<div class="kj-inputs"><input class="k-textbox k-state-disabled" type="text" value="#:value#" disabled /></div>' +
    '<div class="kj-buttons">' +
    '<a class="k-button k-edit-button" href="\\#"><span class="k-icon k-i-edit"/></a>' +
    '<a class="k-button k-delete-button" href="\\#"><span class="k-icon k-i-delete"/></a>' +
    '</div></li>';
const EDIT_TMPL =
    '<li class="k-list-item">' +
    '<div class="kj-handle"><span class="k-icon k-i-handler-drag"/></div>' +
    '<div class="kj-inputs">' +
    `<input data-${ns}bind="value: value" name="value" validationMessage="{0}"/><span data-${ns}for="value" class="k-invalid-msg"/>` +
    '</div><div class="kj-buttons">' +
    '<a class="k-button k-update-button" href="\\#"><span class="k-icon k-i-check"/></a>' +
    '<a class="k-button k-cancel-button" href="\\#"><span class="k-icon k-i-cancel"/></a>' +
    '</div></li>';

const ATTRIBUTES = {
    boolean: {
        class: 'k-checkbox',
        type: 'checkbox'
    },
    date: {
        style: 'width:100%;',
        type: 'date'
    },
    number: {
        style: 'width:100%;',
        type: 'number'
    },
    string: {
        class: 'k-textbox',
        required: 'required',
        style: 'width:100%;',
        type: 'text'
    }
};
ATTRIBUTES.date[attr('role')] = 'datepicker';
ATTRIBUTES.number[attr('role')] = 'numerictextbox';

/**
 * BasicList
 * @class BasicList
 * @extends DataBoundWidget
 */
const BasicList = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this._dataSource();
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
        autoBind: true,
        dataSource: [],
        enabled: true,
        messages: {
            toolbar: {
                add: 'Add'
            },
            validation: {
                value: 'A value is required.'
            }
        },
        // type defines a default set of input attributes
        // which can be overriden by specifying attributes hereabove
        type: 'string'
    },

    /**
     * Events
     * Note: the click event is a feature copied from widgets.imagelist
     * where it is used to plug in the asset manager
     * @property events
     */
    events: [CONSTANTS.CLICK],

    /**
     * Layout widget
     * @method _render
     * @private
     */
    _render() {
        this.wrapper = this.element.addClass(WIDGET_CLASS);
        // Build the toolbar
        this._initToolbar();
        // Build the textarea
        this._initTextarea();
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
     * Initialze textarea
     * @method _initTextarea
     * @private
     */
    _initTextarea() {
        // TODO
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
                dataSource: [],
                template: template(ITEM_TMPL),
                editTemplate: template(this._getEditTemplate()),
                save(e) {
                    // We need to trigger a change and a blur otherwise
                    // the change event might not be raised to induce data bindings
                    e.item
                        .find('input:not(.k-state-disabled)')
                        .change()
                        .blur();
                }
            })
            .data('kendoListView');
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
        input.attr($.extend({}, ATTRIBUTES[type], attributes));
        return t[0].outerHTML;
    },

    /**
     * Initialize dataSource
     * @method _dataSource
     * @private
     */
    _dataSource() {
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );

        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource
        if (
            this.dataSource instanceof DataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = DataSource.create(this.options.dataSource);

            // bind to the change event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * Sets a dataSource
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
                    filter: '>.k-list-item',
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
                                'k-edit-button k-delete-button k-image-button k-update-button k-cancel-button'
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
                    }
                })
                .data('kendoSortable');
        }
    },

    /**
     * Refresh
     * @method refresh
     * @param e
     */
    refresh(e) {
        if (
            $.type(e) === CONSTANTS.UNDEFINED ||
            $.type(e.action) === CONSTANTS.UNDEFINED
        ) {
            if (
                this.listView instanceof ListView &&
                this.listView.dataSource instanceof DataSource &&
                $.isFunction(this._changeHandler)
            ) {
                this.listView.dataSource.unbind(
                    CONSTANTS.CHANGE,
                    this._changeHandler
                );
                this._changeHandler = undefined;
            }
            const data = this.dataSource.data().map(item => ({ value: item }));
            const dataSource = new DataSource({
                data,
                schema: {
                    model: {
                        id: 'value',
                        fields: {
                            value: {
                                type: this.options.type
                            }
                        }
                    }
                }
            });
            this.listView.setDataSource(dataSource);
            this._changeHandler = this._onChange.bind(this);
            this.listView.dataSource.bind(
                CONSTANTS.CHANGE,
                this._changeHandler
            );
            logger.debug({ method: 'refresh', message: 'widget refreshed' });
        }
    },

    /**
     * Change event handler
     * @method _onChange
     * @param e
     * @private
     */
    _onChange(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        const { action, index, items } = e;
        // Note: this is not the dataSource that raised the event
        // This is the target dataSource we need to sync based on the event
        // We modify the underlying ObservableArray becasue this dataSource
        // has no schema model for inserting new records
        const data = this.dataSource.data();
        switch (action) {
            case 'add':
                data.splice(index, 0, ...items.map(item => item.get('value')));
                break;
            case 'remove':
                data.splice(index, items.length);
                break;
            // case 'sync':
            case 'itemchange':
                // itemchange and sync have no index, so we need to find it
                items.forEach(item => {
                    const idx = this.listView.dataSource.indexOf(item);
                    const value = item.get('value');
                    // data[idx] = value; <-- does not raise a change event
                    data.splice(idx, 1, value);
                });
                break;
            default:
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
        } else if (button.hasClass('k-image-button')) {
            action = 'image';
        } else if (button.hasClass('k-update-button')) {
            action = 'update';
        } else if (button.hasClass('k-cancel-button')) {
            action = 'cancel';
        }
        const listItem = button.closest('.k-list-item');
        const uid = listItem.attr(attr(CONSTANTS.UID));
        const dataItem = this.dataSource.getByUid(uid);
        this.trigger(CONSTANTS.CLICK, { action, item: dataItem });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.enable(false);
        unbind(this.element);
        if (this.listView instanceof ListView) {
            this.listView.destroy();
            this.listView = undefined;
        }
        this.dataSource(null);
        // Destroy widget
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(BasicList);
