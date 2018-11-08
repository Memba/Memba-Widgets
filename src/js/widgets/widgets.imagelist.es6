/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Use ImageDataSource
// TODO Use Asset.scheme2http

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.listview';
import 'kendo.sortable';
import 'kendo.toolbar';
import 'kendo.tooltip';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    attr,
    data: { DataSource, Model, ObservableArray },
    destroy,
    format,
    htmlEncode,
    support,
    template,
    ui: { DataBoundWidget, ListView, plugin, Tooltip },
    unbind
} = window.kendo;
const logger = new Logger('widgets.imagelist');
const NS = '.kendoImageList';
const WIDGET_CLASS = 'k-widget kj-imagelist';

const TOOLTIP =
    '<div style="background:url({1});" class="kj-imagelist-tooltip"><div class="kj-imagelist-title">{0}</div></div>';
const TOOLBAR =
    '<div class="k-widget k-toolbar k-header k-floatwrap"><div class="k-toolbar-wrap"><div class="k-button k-button-icontext"><span class="k-icon k-i-plus"></span>{0}</div></div></div>';

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

function getReadTemplate(textField, imageField, schemes) {
    const t =
        '<li class="k-list-item">' +
        '<div class="kj-handle"><span class="k-icon k-i-handler-drag"></span></div>' +
        '<div class="kj-text"><input class="k-textbox k-state-disabled" name="{0}" value="#:{0}#" disabled /></div>' +
        '<div class="kj-buttons">' +
        '# if (!!{1}) { #' +
        '<img class="k-image" alt="#:{0}#" src="#:{1}#">' +
        '# } #' +
        '<a class="k-button k-edit-button" href="\\#"><span class="k-icon k-i-edit"></span></a>' +
        '<a class="k-button k-delete-button" href="\\#"><span class="k-icon k-i-close"></span></a>' +
        '</div></li>';
    return format(
        t,
        textField,
        imageField + ($.isEmptyObject(schemes) ? '' : '$()')
    );
}

function getEditTemplate(textField, imageField, messages) {
    const t =
        '<li class="k-list-item">' +
        '<div class="kj-handle"><span class="k-icon k-i-handler-drag"></span></div>' +
        '<div class="kj-text">' +
        '<input class="k-textbox" data-bind="value:{0}" name="{0}" required="required" validationMessage="{2}"/><span data-for="{0}" class="k-invalid-msg"></span>' +
        // '<input type="hidden" data-bind="value:{1}" name="{1}" required="required" validationMessage="{3}"/><span data-for="{1}" class="k-invalid-msg"></span>' +
        '</div><div class="kj-buttons">' +
        '<a class="k-button k-image-button" href="\\#"><span class="k-icon k-i-image-insert"></span></a>' +
        '<a class="k-button k-update-button" href="\\#"><span class="k-icon k-i-check"></span></a>' +
        '<a class="k-button k-cancel-button" href="\\#"><span class="k-icon k-i-cancel"></span></a>' +
        '</div></li>';
    return format(t, textField, imageField, messages.validation.text); // , messages.validation.image);
}

/** *******************************************************************************
 * DataBoundWidget
 ******************************************************************************** */

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
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this._dataSource();
        this.enable(this.options.enabled);
    },

    /**
     * Options
     */
    options: {
        name: 'ImageList',
        dataSource: [],
        enabled: true,
        imageField: 'image', // TODO Replace with ImageDataSource!!!!
        messages: {
            toolbar: {
                add: 'Add'
            },
            validation: {
                // image: 'An image url is required.',
                text: 'Some text is required.'
            }
        },
        schemes: {},
        textField: 'text'
    },

    /**
     * Events
     */
    events: [CONSTANTS.CLICK],

    /**
     * DataBoundWidget layout
     * @private
     */
    _render() {
        const { element } = this;
        this.wrapper = element.addClass(WIDGET_CLASS);
        // Build the toolbar
        this._toolbar();
        // Build the listview
        this._listView();
    },

    /**
     * DataBoundWidget toolbar
     * @private
     */
    _toolbar() {
        // Add toolbar from template
        this.toolbar = $(
            format(TOOLBAR, this.options.messages.toolbar.add)
        ).appendTo(this.element);
    },

    /**
     * DataBoundWidget list view
     * @private
     */
    _listView() {
        const { options } = this;

        // Add the list element
        const list = $(`<CONSTANTS.UL/>`).appendTo(this.element);

        // Templates
        const readTemplate = getReadTemplate(
            options.textField,
            options.imageField,
            options.schemes
        );
        const editTemplate = getEditTemplate(
            options.textField,
            options.imageField,
            options.messages
        );

        // Create the list view
        this.listView = list
            .kendoListView({
                dataSource: [],
                template: template(readTemplate),
                editTemplate: template(editTemplate)
            })
            .data('kendoListView');

        // Make the list sortable
        const that = this;
        this.sortable = list
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
                    return element
                        .clone()
                        .removeClass(CONSTANTS.SELECTED_CLASS);
                },
                change(e) {
                    const skip = that.dataSource.skip() || 0;
                    const newIndex = e.newIndex + skip;
                    const dataItem = that.dataSource.getByUid(
                        e.item.attr(attr(CONSTANTS.UID))
                    );
                    debugger;
                    that.dataSource.remove(dataItem);
                    that.dataSource.insert(newIndex, dataItem);
                }
            })
            .data('kendoSortable');

        // Add tooltips
        this.tooltip = list
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
                        TOOLTIP,
                        htmlEncode(target.attr('alt')),
                        window.encodeURI(target.attr('src'))
                    );
                }
            })
            .data('kendoTooltip');
    },

    /**
     * _dataSource function
     * @private
     */
    _dataSource() {
        const that = this;
        const options = that.options;

        // TODO use ImageDataSource
        // TODO Add validation from models.image.es6

        // returns the dataSource OR creates one if using array or configuration
        const data = options.dataSource;
        if ($.isArray(data) || data instanceof ObservableArray) {
            const model = { fields: {} };
            model.fields[options.textField] = { type: CONSTANTS.STRING };
            model.fields[options.imageField] = { type: CONSTANTS.STRING };
            // Without id, cancel works like remove
            model.id = options.textField;
            // IMPORTANT: This means the dataSource needs to have a calculated field named image$ or equivalent if schemes are implemented
            model[`${options.imageField}$`] = function() {
                let image = this.get(options.imageField);
                for (const scheme in options.schemes) {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            options.schemes,
                            scheme
                        ) &&
                        new RegExp(`^${scheme}://`).test(image)
                    ) {
                        image = image.replace(
                            `${scheme}://`,
                            options.schemes[scheme]
                        );
                        break;
                    }
                }
                return image;
            };
            that.dataSource = DataSource.create({
                data,
                schema: {
                    model: Model.define(model)
                }
            });
        } else {
            that.dataSource = DataSource.create(that.options.dataSource);
        }

        // Set the dataSource on the listview
        assert.instanceof(
            ListView,
            that.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        that.listView.setDataSource(that.dataSource);
    },

    /**
     * sets the dataSource for source binding
     * @param dataSource
     */
    setDataSource(dataSource) {
        // set the internal datasource equal to the one passed in by MVVM
        this.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        this._dataSource();
    },

    /**
     * enable/disable the widget
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Enable/disable the toolbar
        assert.instanceof(
            $,
            this.toolbar,
            assert.format(
                assert.messages.instanceof.default,
                'this.toolbar',
                'jQuery'
            )
        );

        $('.k-button', this.toolbar).off(NS);
        if (enabled) {
            // Add click event handler for the Add button
            $('.k-button', this.toolbar).on(
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                this._onToolbarClick.bind(this)
            );
        }

        // Enable/disable the listView
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );

        this.listView.element.off(NS);
        if (enabled) {
            // Add the delegated click event handler for item buttons
            this.listView.element.on(
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                '.k-button',
                this._onItemButtonClick.bind(this)
            );
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
        e.preventDefault();
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        this.listView.cancel();
        const dataItem = this.dataSource.add({});
        this.listView.edit(this.element.find(`[data-uid='${dataItem.uid}']`));
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
        if (action !== 'cancel') {
            // We need to trigger a blur otherwise
            // the change event might not be raised to induce data bindings
            listItem.find('input.k-textbox:not(.k-state-disabled)').blur();
        }
        const uid = listItem.attr(attr(CONSTANTS.UID));
        const dataItem = this.dataSource.getByUid(uid);
        this.trigger(CONSTANTS.CLICK, { action, item: dataItem });
    },

    /**
     * Destroy
     */
    destroy() {
        const { element } = this;
        this.enable(false);
        unbind(element);
        // Release references
        // TODO _refreshHandler ???
        this.dataSource = undefined;
        this.toolbar = undefined;
        this.listView = undefined;
        this.sortable = undefined;
        this.tooltip = undefined;
        // Destroy widget
        DataBoundWidget.fn.destroy.call(this);
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(ImageList);
