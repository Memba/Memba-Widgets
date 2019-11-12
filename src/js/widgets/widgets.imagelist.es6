/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.listview';
import 'kendo.sortable';
import 'kendo.tooltip';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { ImageDataSource } from '../data/data.image.es6';

const {
    attr,
    destroy,
    format,
    htmlEncode,
    ns,
    support,
    template,
    ui: { DataBoundWidget, ListView, plugin, Sortable, Tooltip }
    // unbind
} = window.kendo;
const logger = new Logger('widgets.imagelist');
const NS = '.kendoImageList';
const WIDGET_CLASS = 'k-widget kj-imagelist';

const TOOLTIP_TMPL =
    '<div style="background-image:url({1});" class="kj-imagelist-tooltip"><div class="kj-imagelist-title">{0}</div></div>';
const TOOLBAR_TMPL =
    '<div class="k-widget k-toolbar k-header k-floatwrap"><div class="k-toolbar-wrap"><div class="k-button k-button-icontext"><span class="k-icon k-i-plus"/>{0}</div></div></div>';
const ITEM_TMPL =
    '<li class="k-list-item">' +
    '<div class="kj-handle"><span class="k-icon k-i-handler-drag"/></div>' +
    '<div class="kj-input-wrap"><input class="k-textbox k-state-disabled" name="text" value="#:text#" disabled /></div>' +
    '<div class="kj-buttons">' +
    '# if (url$().length) { #' +
    '<img class="k-image" alt="#:text#" src="#:url$()#">' +
    '# } #' +
    '<a class="k-button k-edit-button" href="\\#"><span class="k-icon k-i-edit"/></a>' +
    '<a class="k-button k-delete-button" href="\\#"><span class="k-icon k-i-delete"/></a>' +
    '</div></li>';
const EDIT_TMPL =
    '<li class="k-list-item">' +
    '<div class="kj-handle"><span class="k-icon k-i-handler-drag"/></div>' +
    '<div class="kj-input-wrap">' +
    `<input data-${ns}bind="value:text" name="text" validationMessage="{0}"/><span data-${ns}for="text" class="k-invalid-msg"/>` +
    '# if ({1}) { #' +
    `<input type="hidden" data-${ns}bind="value:url$()" name="url" required="required" validationMessage="{2}"/><span data-${ns}for="url" class="k-invalid-msg"/>` +
    '# } #' +
    '</div><div class="kj-buttons">' +
    '<a class="k-button k-image-button" href="\\#"><span class="k-icon k-i-image-insert"/></a>' +
    '<a class="k-button k-update-button" href="\\#"><span class="k-icon k-i-check"/></a>' +
    '<a class="k-button k-cancel-button" href="\\#"><span class="k-icon k-i-cancel"/></a>' +
    '</div></li>';

/**
 * ImageList
 * @class ImageList
 * @extends DataBoundWidget
 */
const ImageList = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
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
        name: 'ImageList',
        attributes: {
            class: 'k-textbox',
            // Note: pattern validation won't work without type="text"
            // Also it cannot enforce required="required" which is also needed to prevent empty inputs
            type: 'text',
            required: 'required',
            pattern: '^\\\\S.{0,99}$'
        },
        autoBind: true,
        dataSource: [],
        enabled: true,
        requireImages: false, // whether images are required
        messages: {
            toolbar: {
                add: 'Add'
            },
            validation: {
                text: 'An alternate text of 1 to 100 characters is required.',
                url: 'An image url is required.'
            }
        }
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CLICK],

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
                        .find('input.k-textbox:not(.k-state-disabled)')
                        .change()
                        .blur();
                }
            })
            .data('kendoListView');

        // Add tooltips
        this.tooltip = this.ul
            .kendoTooltip({
                filter: 'img.k-image',
                position: 'left',
                height: '150px',
                width: '150px',
                // showOn: 'mouseenter',
                // autoHide: true,
                content(e) {
                    const { target } = e;
                    // The following is required to fix https://github.com/kidoju/Kidoju-DataBoundWidgets/issues/175
                    // Noting that popup is not available until the tooltip has been fully initialized, but there is no init event to hook
                    e.sender.popup.element
                        .children('.k-tooltip-content')
                        .css({ padding: 0 });
                    return format(
                        TOOLTIP_TMPL,
                        htmlEncode(target.attr('alt')),
                        window.encodeURI(target.attr('src'))
                    );
                }
            })
            .data('kendoTooltip');
    },

    /**
     * Compute read template with type and atttibutes
     * @method _getTemplate
     * @private
     */
    _getTemplate() {
        // const { attributes, messages, requireImages } = this.options;
        // const t = $(
        //     format(
        //         ITEM_TMPL,
        //         messages.validation.text,
        //         String(!!requireImages),
        //         messages.validation.url
        //     )
        // );
        // const input = t.find(CONSTANTS.INPUT).first();
        // input.attr({ ...attributes });
        // return t[0].outerHTML;
        return ITEM_TMPL;
    },

    /**
     * Compute edit template with type and atttibutes
     * @method _getEditTemplate
     * @private
     */
    _getEditTemplate() {
        const { attributes, messages, requireImages } = this.options;
        const t = $(
            format(
                EDIT_TMPL,
                messages.validation.text,
                String(!!requireImages),
                messages.validation.url
            )
        );
        const input = t.find(CONSTANTS.INPUT).first();
        input.attr({ ...attributes });
        return t[0].outerHTML;
    },

    /**
     * Initialize data source
     * @method _dataSource
     * @private
     */
    _dataSource() {
        // Set the dataSource on the listview
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );

        // Note: Without a schema, the Add button won't work because otherwise
        // the listView does not know the properties to create a new dataItem with
        this.dataSource = ImageDataSource.create(this.options.dataSource);

        this.listView.setDataSource(this.dataSource);
    },

    /**
     * Set data source
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
                        const { dataSource } = that;
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
        const dataItem = this.dataSource.add({});
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
        const dataItem = this.listView.dataSource.getByUid(uid);
        this.trigger(CONSTANTS.CLICK, { action, item: dataItem });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { element, listView, tooltip } = this;
        DataBoundWidget.fn.destroy.call(this);
        this.enable(false);
        // unbind(element);
        if (listView instanceof ListView) {
            listView.destroy();
            this.listView = undefined;
        }
        if (tooltip instanceof Tooltip) {
            tooltip.destroy();
            this.tooltip = undefined;
        }
        this.dataSource = undefined;
        // Destroy widget
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'ImageList')) {
    // Prevents loading several times in karma
    plugin(ImageList);
}
