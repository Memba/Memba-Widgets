/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.grid',
        './vendor/kendo/kendo.combobox'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.styleeditor');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var KEYPRESS = 'keypress';
        // var NS = '.kendoStyleEditor';
        var WIDGET_CLASS = 'k-grid k-widget kj-styleeditor';
        var COLON = ':';
        var SEMICOLON = ';';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Normalize value
         * Removes spaces around colons and semi-colons and end with semi-colon
         * @param value
         */
        function normalizeValue(value) {
            assert.type(STRING, value, kendo.format(assert.messages.type.default), 'value', STRING);
            return value.replace(/[\s]*(\:|\;)[\s]*/g, '$1') + ((value.length && value.charAt(value.length - 1) === SEMICOLON) ? '' : SEMICOLON);
        }


        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class StyleEditor Widget (kendoStyleEditor)
         */
        var StyleEditor = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug('widget initialized');
                // if ($.isFunction($.fn.kendoGrid)) {
                that._setDataSource();
                that.value(that.options.value);
                that._layout();
                that._setDestroyHandler();
                that._setKeyPressHandler();
                // }
                // TODO a simple textarea would do when running kendo-core without grid
            },

            /**
             * StyleEditor options
             * @property options
             */
            options: {
                name: 'StyleEditor',
                height: 400,
                value: '',
                messages: {
                    columns: {
                        name: 'Name',
                        value: 'Value'
                    },
                    toolbar: {
                        create: 'New Style',
                        destroy: 'Delete'
                    },
                    validation: {
                        name: 'Name is required',
                        value: 'Value is required'
                    }
                }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /* This function has too many statements. */
            /* jshint -W071 */

            /**
             * Gets or sets the style value
             * @param value
             * @returns {string}
             */
            value: function (value) {

                /*
                // Sort function on style names
                // Sorting is not user-friendly as positions change unexpectedly in the grid
                function sort(a, b) {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                }
                */

                var that = this;
                var i;
                var data;
                if ($.type(value) === STRING) {
                    var _value = that.value();
                    value = normalizeValue(value);
                    if (value !== _value) {
                        // Break the various style names/values and fill the data source
                        var styles = value.split(SEMICOLON);
                        data = [];
                        for (i = 0; i < styles.length; i++) {
                            var style = styles[i].split(COLON);
                            if ($.isArray(style) && style.length === 2) {
                                data.push({ name: style[0].trim(), value: style[1].trim() });
                            }
                        }
                        that._dataSource.data(data); // (data.sort(sort));
                        // that.trigger(CHANGE);
                    }
                } else if ($.type(value) === UNDEFINED) {
                    // Convert the data source into an HTML style attribute
                    value = '';
                    data = that._dataSource.data();
                    for (i = 0; i < data.length; i++) {
                        var name = data[i].name;
                        var val = data[i].value;
                        if ($.type(name) === STRING && $.type(val) === STRING) {
                            name = name.trim();
                            val = val.trim();
                            if (name.length && val.length) {
                                value += name + COLON + val + SEMICOLON;
                            }
                        }
                    }
                    return value;
                } else {
                    throw new TypeError('value is expected to be a string if not undefined');
                }
            },

            /* jshint +W071 */
            /* jshint +W074 */

            /**
             * Sets the data source
             * @private
             */
            _setDataSource: function () {
                var that = this;
                // This dataSource is private to the widget
                that._dataSource = new kendo.data.DataSource({
                    autoSync: true,
                    change: function (e) {
                        // triggers the change event for MVVM
                        // that.trigger(CHANGE, { value: that.value() }); // otherwise that.value is executed twice (also by MVVM)
                        that.trigger(CHANGE);
                    },
                    data: [],
                    schema: {
                        model: {
                            id: 'name',
                            fields: {
                                name: {
                                    type: 'string',
                                    validation: {
                                        required: true
                                    }
                                },
                                value: {
                                    type: 'string',
                                    validation: {
                                        required: true
                                    }
                                }
                            }
                        }
                    }
                });
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {

                // This function is taken from http://demos.kendoui.com/web/grid/editing-custom.html
                // See also http://www.telerik.com/forums/kendo-ui-grid-s-combobox-editor-template-validation
                function cssDropDownEditor(container, options) {
                    // We cannot set the combobox name for validation before initializing the kendo ui widget
                    // See http://www.telerik.com/forums/comboxbox-in-grid-with-validation
                    // $('<input name="style_name" data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.name + '">')
                    var combobox = $('<input data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.name + '">')
                        .appendTo(container)
                        .kendoComboBox({
                            autoBind: false,
                            change: function (e) {
                                // The change event handler assigns a default value depending on the style name
                                if (e /*instanceof $.Event*/ && e.sender instanceof kendo.ui.ComboBox) {
                                    var dataItem = e.sender.dataItem();
                                    // var grid = container.closest('.k-grid').data('kendoGrid');
                                    var grid = that.element.data('kendoGrid');
                                    var uid = container.parent().attr(kendo.attr('uid'));
                                    if (grid instanceof kendo.ui.Grid && $.type(uid) === 'string' && $.type(dataItem) !== UNDEFINED) {
                                        var style = grid.dataSource.getByUid(uid);
                                        style.set('value', dataItem.get('value'));
                                    }
                                }
                            },
                            // dataSource: viewModel.css,
                            dataTextField: 'name',
                            dataValueField: 'name'
                        })
                        .data('kendoComboBox');
                    // The workaround for validation to work is to set the name after initializing the kendo ui widget
                    // TODO http://www.telerik.com/forums/how-to-enforce-validation-in-grid-sample
                    combobox.element.attr('name', 'name');
                    $('<span class="k-invalid-msg" data-for="name"></span>').appendTo(container);
                }

                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that.grid = that.element
                    .kendoGrid({
                    columns: [
                        { field: 'name', title: that.options.messages.columns.name, editor: cssDropDownEditor, template: '#=name#' },
                        { field: 'value', title: that.options.messages.columns.value }
                    ],
                    /*
                     dataBound: function (e) {
                     if (e.sender instanceof kendo.ui.Grid) {
                     var selected = e.sender.select();
                     if (selected instanceof $ && selected.length === 0) {
                     e.sender.select('tr:eq(1)');
                     e.sender.editCell('tr:eq(1) td:eq(0)');
                     }
                     }
                     },
                     */
                    dataSource: that._dataSource,
                    edit: function (e) {
                        if (e /*instanceof $.Event*/ && e.sender instanceof kendo.ui.Grid && e.container instanceof $) {
                            // Select the edited row
                            this.select(e.container.parent());
                            // Find the combobox and update dataSource
                            var comboBox = e.container.find('input:not(.k-input)').data('kendoComboBox');
                            if (comboBox instanceof kendo.ui.ComboBox) {
                                var styles = e.sender.dataSource.data();
                                var css = [];
                                var all = [
                                    // This is where we define all style names displayed in the combo box and their respective default values
                                    { name: 'background-color', value: '#FFFFFF' },
                                    { name: 'border-color', value: '#000000' },
                                    { name: 'border-radius', value: '5px' },
                                    { name: 'border-style', value: 'solid' },
                                    { name: 'border-width', value: '1px' },
                                    { name: 'color', value: '#000000' },
                                    { name: 'font-family', value: 'Arial, Helvetica Neue, Helvetica, sans-serif' },
                                    { name: 'font-size', value: '20px' },
                                    { name: 'font-style', value: 'italic' },
                                    { name: 'font-weight', value: 'bold' },
                                    { name: 'padding', value: '10px' },
                                    { name: 'margin', value: '10px' },
                                    { name: 'text-align', value: 'center' },
                                    { name: 'text-decoration', value: 'underline' }
                                ];
                                for (var i = 0; i < all.length; i++) {
                                    var found = false;
                                    for (var j = 0; j < styles.length; j++) {
                                        /* Blocks are nested too deeply. */
                                        /* jshint -W073 */
                                        if (all[i].name === styles[j].name && all[i].name !== comboBox.value()) {
                                            found = true;
                                            break;
                                        }
                                        /* jshint +W073 */
                                    }
                                    if (!found) {
                                        css.push(all[i]);
                                    }
                                }
                                comboBox.setDataSource(css);
                            }
                        }
                    },
                    editable: true,
                    height: that.options.height,
                    resizable: true,
                    selectable: 'row',
                    sortable: true,
                    toolbar: [
                        { name: 'create', text: that.options.messages.toolbar.create },
                        { name: 'destroy', text: that.options.messages.toolbar.destroy }
                    ]
                })
                    .data('kendoGrid');

            },

            /**
             * Add a click event handler for the destroy button
             * @private
             */
            _setDestroyHandler: function () {
                var element = this.element;
                element.find('.k-grid-toolbar>.k-grid-delete').click(function (e) {
                    var grid = element.data('kendoGrid');
                    if (grid instanceof kendo.ui.Grid) {
                        var selected = grid.select();
                        if (selected instanceof $ && selected.length) {
                            // allthough shorter, the following displays an alert to confirm deletion
                            // grid.removeRow(selected);
                            var uid = selected.attr(kendo.attr('uid'));
                            var style = grid.dataSource.getByUid(uid);
                            grid.dataSource.remove(style);
                        }
                    }
                });
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Set a keypress event handler to prevent some unhealthy characters to be used for style names and values
             * @private
             */
            _setKeyPressHandler: function () {
                var element = this.element;
                element.find('table').on(KEYPRESS, function (e) {
                    if (e /*instanceof $.Event*/ && e.target instanceof window.HTMLElement) {
                        var input = $(e.target);
                        if (input.hasClass('k-input') && input.parent().hasClass('k-dropdown-wrap')) {
                            // the drop down with a list of style names has the focus
                            // allowed characters are a-z (96-123) and minus/hiphen/dash (45)
                            if (!(e.which === 45 || (e.which > 96 && e.which < 123))) {
                                e.preventDefault();
                            }
                        } else if (input.hasClass('k-textbox') && input.parent().hasClass('k-edit-cell')) {
                            // the textbox for style value has the focus
                            // do not allow < (60), > (62), ; (59) and " (34)
                            if (e.which === 34 || e.which === 59 || e.which === 60 || e.which === 62) {
                                e.preventDefault();
                            }
                        }
                    }
                });
            },

            /* jshint +W074 */

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                that.element.find('*').off();
                that.element.off();
                // remove descendants
                that.element.empty();
                that.element.removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                // if ($.isFunction(that._refreshHandler)) {
                //    that.options.tools.unbind(CHANGE, that._refreshHandler);
                // }
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(StyleEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
