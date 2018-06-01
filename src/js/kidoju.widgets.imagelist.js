/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.sortable',
        './vendor/kendo/kendo.listview',
        './vendor/kendo/kendo.toolbar',
        './vendor/kendo/kendo.tooltip'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var DataSource = kendo.data.DataSource;
        var ListView = kendo.ui.ListView;
        var Tooltip = kendo.ui.Tooltip;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.imagelist');
        var NS = '.kendoImageList';
        var STRING = 'string';
        var CLICK = 'click';
        var WIDGET_CLASS = 'k-widget kj-imagelist';
        var TOOLTIP = '<div style="background:url({1});background-size:cover;background-position:center;height:150px;width:150px"><div style="position:absolute;bottom:0;padding:1em;text-overflow:ellipsis;">{0}</div></div>';
        var TOOLBAR = '<div class="k-widget k-toolbar k-header k-floatwrap"><div class="k-toolbar-wrap"><div class="k-button k-button-icontext"><span class="k-icon k-i-plus"></span>{0}</div></div></div>';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function getTemplate (textField, imageField, schemes) {
            var template = '<li class="k-list-item">' +
                '<div class="kj-handle"><span class="k-icon k-i-handler-drag"></span></div>' +
                '<div class="kj-text"><input class="k-textbox k-state-disabled" name="{0}" value="#:{0}#" disabled /></div>' +
                '<div class="kj-buttons">' +
                '# if (!!{1}) { #' +
                '<img class="k-image" alt="#:{0}#" src="#:{1}#">' +
                '# } #' +
                '<a class="k-button k-edit-button" href="\\#"><span class="k-icon k-i-edit"></span></a>' +
                '<a class="k-button k-delete-button" href="\\#"><span class="k-icon k-i-close"></span></a>' +
                '</div></li>';
            return kendo.format(template, textField, imageField + ($.isEmptyObject(schemes) ? '' : '$()'));
        }

        function getEditTemplate (textField, imageField, messages) {
            var template = '<li class="k-list-item">' +
                '<div class="kj-handle"><span class="k-icon k-i-handler-drag"></span></div>' +
                '<div class="kj-text">' +
                '<input class="k-textbox" data-bind="value:{0}" name="{0}" required="required" validationMessage="{2}"/><span data-for="{0}" class="k-invalid-msg"></span>' +
                // '<input type="hidden" data-bind="value:{1}" name="{1}" required="required" validationMessage="{3}"/><span data-for="{1}" class="k-invalid-msg"></span>' +
                '</div><div class="kj-buttons">' +
                '<a class="k-button k-image-button" href="\\#"><span class="k-icon k-i-image-insert"></span></a>' +
                '<a class="k-button k-update-button" href="\\#"><span class="k-icon k-i-check"></span></a>' +
                '<a class="k-button k-cancel-button" href="\\#"><span class="k-icon k-i-cancel"></span></a>' +
                '</div></li>';
            return kendo.format(template, textField, imageField, messages.validation.text); // , messages.validation.image);
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * ImageList
         * @class ImageList Widget (kendoImageList)
         */
        var ImageList = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that._dataSource();
                // kendo.notify(that);
            },

            /**
             * Options
             */
            options: {
                name: 'ImageList',
                textField: 'text',
                imageField: 'image',
                dataSource: [],
                schemes: {},
                messages: {
                    toolbar: {
                        add: 'Add'
                    },
                    validation: {
                        // image: 'An image url is required.',
                        text: 'Some text is required.'
                    }
                }
            },

            /**
             * Events
             */
            events: [
                CLICK
            ],

            /**
             * Widget layout
             * @private
             */
            _layout: function  () {
                var that = this;
                var element = that.element;
                element.addClass(WIDGET_CLASS);
                // Make the widget work with visible/invisible bindings
                that.wrapper = element;
                // Build the toolbar
                this._toolbar();
                // Build the listview
                this._listView();
            },

            /**
             * Widget toolbar
             * @private
             */
            _toolbar: function  () {
                var that = this;
                var options = that.options;

                // Add toolbar from template
                that.toolbar = $(kendo.format(TOOLBAR, options.messages.toolbar.add)).appendTo(that.element);
                assert.instanceof($, that.toolbar, kendo.format(assert.messages.instanceof.default, 'this.toolbar', 'jQuery'));

                // Add click event handler for the Add button
                $('.k-button', that.toolbar).on(CLICK + NS, function (e) {
                    assert.instanceof(ListView, that.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                    // that.listView.add(); // insert at index = 0
                    that.listView.cancel();
                    // var item = {}; item[options.textField] = ''; item[options.imageField] = '';
                    var dataItem = that.dataSource.add({}); // Requires a model to know the fields to create a new data item with
                    that.listView.edit(that.element.find('[data-uid=\'' + dataItem.uid + '\']'));
                    e.preventDefault();
                });
            },

            /**
             * Widget list view
             * @private
             */
            _listView: function () {
                var that = this;
                var element = that.element;
                var options = that.options;

                // Add the list element
                var list = $('<ul></ul>').appendTo(element);

                // Add the delegated click event handler for item buttons
                list.on(CLICK + NS, '.k-button', $.proxy(that._onItemButtonClick, that));

                // Templates
                var template = getTemplate(options.textField, options.imageField, options.schemes);
                var editTemplate = getEditTemplate(options.textField, options.imageField, options.messages);

                // Create the listview
                that.listView = list.kendoListView({
                    dataSource: that.dataSource,
                    template: kendo.template(template),
                    editTemplate: kendo.template(editTemplate)
                }).data('kendoListView');

                // Make the list sortable
                that.sortable = list.kendoSortable({
                    cursor: 'move',
                    filter: '>.k-list-item',
                    handler: '.kj-handle, .kj-handle *',
                    holdToDrag: kendo.support.touch,
                    ignore: 'input',  // otherwise focus and selections won't work properly in inputs
                    placeholder: function (element) {
                        return element.clone().css('opacity', 0.4);
                    },
                    hint: function (element) {
                        return element.clone().removeClass('k-state-selected');
                    },
                    change: function (e) {
                        var dataSource = that.dataSource;
                        var skip = dataSource.skip() || 0;
                        var newIndex = e.newIndex + skip;
                        var dataItem = dataSource.getByUid(e.item.attr(kendo.attr('uid')));
                        dataSource.remove(dataItem);
                        dataSource.insert(newIndex, dataItem);
                    }
                }).data('kendoSortable');

                // Add tooltips
                this.tooltip = list.kendoTooltip({
                    filter: 'img.k-image',
                    position: 'left',
                    height: '150px',
                    width: '150px',
                    // showOn: 'mouseenter',
                    // autoHide: true,
                    content: function (e) {
                        var target = e.target;
                        // The following is required to fix https://github.com/kidoju/Kidoju-Widgets/issues/175
                        // Noting that popup is not available until the tooltip has been fully initialized, but there is no init event to hook
                        e.sender.popup.element.children('.k-tooltip-content').css({ padding: 0 });
                        return kendo.format(TOOLTIP, kendo.htmlEncode(target.attr('alt')), window.encodeURI(target.attr('src')));
                    }
                }).data('kendoTooltip');
            },

            /**
             * _dataSource function
             * @private
             */
            _dataSource: function () {
                var that = this;
                var options = that.options;

                // returns the dataSource OR creates one if using array or configuration
                var data = options.dataSource;
                if ($.isArray(data) || data instanceof kendo.data.ObservableArray) {
                    var model = { fields: {} };
                    model.fields[options.textField] = { type: STRING };
                    model.fields[options.imageField] = { type: STRING };
                    // Without id, cancel works like remove
                    model.id = options.textField;
                    // IMPORTANT: This means the dataSource needs to have a calculated field named image$ or equivalent if schemes are implemented
                    model[options.imageField + '$'] = function () {
                        var image = this.get(options.imageField);
                        for (var scheme in options.schemes) {
                            if (Object.prototype.hasOwnProperty.call(options.schemes, scheme) && (new RegExp('^' + scheme + '://')).test(image)) {
                                image = image.replace(scheme + '://', options.schemes[scheme]);
                                break;
                            }
                        }
                        return image;
                    };
                    that.dataSource = DataSource.create({
                        data: data,
                        schema: {
                            model: kendo.data.Model.define(model)
                        }
                    });
                } else {
                    that.dataSource = DataSource.create(that.options.dataSource);
                }

                // Set the dataSource on the listview
                assert.instanceof(ListView, that.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                that.listView.setDataSource(that.dataSource);
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                var that = this;
                // set the internal datasource equal to the one passed in by MVVM
                that.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                that._dataSource();
            },

            /**
             * Event handler for clicking any item buttons
             * @param e
             */
            _onItemButtonClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var button = $(e.currentTarget);
                var action;
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
                var listItem = button.closest('.k-list-item');
                if (action !== 'cancel') {
                    // We need to trigger a blur otherwise the change event might not be raised to induce data bindings
                    var input = listItem.find('input.k-textbox:not(.k-state-disabled)');
                    input.blur();
                }
                var uid = listItem.attr(kendo.attr('uid'));
                var dataItem = this.dataSource.getByUid(uid);
                this.trigger(CLICK, { action: action, item: dataItem });
            },

            /**
             * Destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                if (that.listView instanceof ListView) {
                    var list = that.listView.element;
                    list.off(NS);
                }
                if (that.toolbar instanceof $) {
                    $('.k-button', that.toolbar).off(NS);
                }
                kendo.unbind(wrapper);
                // Release references
                that.toolbar = undefined;
                that.listView = undefined;
                that.sortable = undefined;
                that.tooltip = undefined;
                // Destroy kendo bindings
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(ImageList);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
