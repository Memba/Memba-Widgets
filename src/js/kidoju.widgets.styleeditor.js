/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
        './vendor/kendo/kendo.slider',
        './vendor/kendo/kendo.button',
        './vendor/kendo/kendo.colorpicker',
        './vendor/kendo/kendo.grid',
        './vendor/kendo/kendo.combobox',
        './kidoju.widgets.unitinput'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {
        /* jshint maxstatements: 35 */

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var Grid = ui.Grid;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.styleeditor');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var KEYPRESS = 'keypress';
        var NS = '.kendoStyleEditor';
        var CLICK = 'click';
        var WIDGET_CLASS = 'k-grid k-widget kj-styleeditor';
        var TOOLBAR_SELECTOR = '.k-grid-toolbar';
        // var ADD_SELECTOR = '.k-grid-add';
        var DELETE_SELECTOR = '.k-grid-delete';
        var TABLE_SELECTOR = 'table';
        var INPUT_SELECTOR = 'input';
        var COLON = ':';
        var SEMICOLON = ';';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /* If a strict mode function is executed using function invocation, its 'this' value will be undefined. */
        /* The following functions raise this error because this is undefined in functions that are not part of a prototype, but we use bind to call them */
        /* jshint -W040 */

        /**
         * Normalize value
         * Removes spaces around colons and semi-colons and end with semi-colon
         * @param value
         */
        function normalizeValue(value) {
            assert.type(STRING, value, kendo.format(assert.messages.type.default), 'value', STRING);
            return value.replace(/[\s]*(\:|\;)[\s]*/g, '$1') + ((value.length && value.charAt(value.length - 1) === SEMICOLON) ? '' : SEMICOLON);
        }

        function borderStyle(container, options) {
            // https://www.w3schools.com/cssref/pr_border-style.asp
            return comboBox.bind(this)(container, options,  {
                dataSource: ['dashed', 'dotted', 'double', 'groove', 'hidden', 'inherit', 'initial', 'inset', 'none', 'outset', 'ridge', 'solid']
            });
        }

        function comboBox(container, options, widgetOptions) {
            // We cannot set the comboBox name for validation before initializing the kendo ui widget
            // See http://www.telerik.com/forums/comboxbox-in-grid-with-validation
            // $('<input name="name" data-bind="value: ' + options.field + '" required data-required-msg="' + this.options.messages.validation.value + '">')
            var input = $('<input data-bind="value: ' + options.field + '" required data-required-msg="' + this.options.messages.validation.value + '">')
                .appendTo(container)
                .kendoComboBox(widgetOptions)
                .data('kendoComboBox');
            // The workaround for validation to work is to set the name after initializing the kendo ui widget
            // TODO http://www.telerik.com/forums/how-to-enforce-validation-in-grid-sample
            input.element.attr('name', 'value');
            $('<span class="k-invalid-msg" data-for="value"></span>').appendTo(container);
        }

        function cssSize(container, options) {
            // https://www.w3schools.com/cssref/css_units.asp
            return unitInput.bind(this)(container, options, {
                units: ['%', 'em', 'px', 'rem', 'vh', 'vw'],
                nonUnits: ['auto', 'inherit', 'initial']
            });
        }

        function colorPicker(container, options) {
            var that = this;
            // We cannot set the colorpicker name for validation before initializing the kendo ui widget
            // See http://www.telerik.com/forums/comboxbox-in-grid-with-validation
            // $('<input name="name" data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.value + '">')
            var colorPicker = $('<input data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.value + '">')
                .appendTo(container)
                .kendoColorPicker()
                .data('kendoColorPicker');
            // The workaround for validation to work is to set the name after initializing the kendo ui widget
            // TODO http://www.telerik.com/forums/how-to-enforce-validation-in-grid-sample
            colorPicker.element.attr('name', 'value');
            $('<span class="k-invalid-msg" data-for="value"></span>').appendTo(container);
        }

        function fontFamily(container, options) {
            // https://www.w3schools.com/cssref/pr_font_font-style.asp
            return comboBox.bind(this)(container, options, {
                dataSource: ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana']
            });
        }

        function fontStyle(container, options) {
            // https://www.w3schools.com/cssref/pr_font_font-style.asp
            return comboBox.bind(this)(container, options, {
                dataSource:  ['inherit', 'initial', 'italic', 'normal', 'oblique']
            });
        }

        function fontWeight(container, options) {
            return comboBox.bind(this)(container, options, {
                dataSource: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'bold', 'bolder', 'inherit', 'initial', 'lighter', 'normal']
            });
        }

        function textAlign(container, options) {
            // https://www.w3schools.com/cssref/pr_text_text-align.asp
            return comboBox.bind(this)(container, options,  {
                dataSource: ['center', 'inherit', 'initial', 'justify', 'left', 'right']
            });
        }

        function textDecoration(container, options) {
            // https://www.w3schools.com/cssref/pr_text_text-decoration.asp
            return comboBox.bind(this)(container, options,  {
                dataSource: ['inherit', 'initial', 'line-through', 'none', 'overline', 'underline']
            });
        }

        function opacitySlider(container, options) {
            // TODO
        }

        function unitInput(container, options, widgetOptions) {
            // We cannot set the comboBox name for validation before initializing the kendo ui widget
            // See http://www.telerik.com/forums/comboxbox-in-grid-with-validation
            // $('<input name="name" data-bind="value: ' + options.field + '" required data-required-msg="' + this.options.messages.validation.value + '">')
            var unitinput = $('<input data-' + kendo.ns + 'bind="value: ' + options.field + '" required data-required-msg="' + this.options.messages.validation.value + '" style="width:100%;">')
                .appendTo(container)
                .kendoUnitInput(widgetOptions)
                .data('kendoUnitInput');
            // The workaround for validation to work is to set the name after initializing the kendo ui widget
            // TODO http://www.telerik.com/forums/how-to-enforce-validation-in-grid-sample
            unitinput.element.attr('name', 'value');
            $('<span class="k-invalid-msg" data-for="value"></span>').appendTo(container);
        }

        function verticalAlign(container, options) {
            // https://www.w3schools.com/cssref/pr_pos_vertical-align.asp
            // https://www.w3schools.com/cssref/css_units.asp
            return unitInput.bind(this)(container, options, {
                units: ['%', 'em', 'px', 'rem', 'vh', 'vw'],
                nonUnits: ['baseline', 'bottom', 'inherit', 'initial', 'middle', 'sub', 'super', 'text-bottom', 'text-top', 'top']
            });
        }

        /* jshint +W040 */

        var CSS_STYLES = [
            // This is where we define all style names displayed in the combo box and their respective default values
            { name: 'background-color', value: '#ffffff', editor: colorPicker },
            { name: 'border-color', value: '#000000', editor: colorPicker },
            { name: 'border-radius', value: '5px', editor: cssSize },
            { name: 'border-style', value: 'solid', editor: borderStyle },
            { name: 'border-width', value: '1px', editor: cssSize },
            { name: 'color', value: '#000000', editor: colorPicker },
            { name: 'font-family', value: 'Times New Roman', editor: fontFamily },
            { name: 'font-size', value: '20px', editor: cssSize },
            { name: 'font-style', value: 'italic', editor: fontStyle },
            { name: 'font-weight', value: 'bold', editor: fontWeight },
            { name: 'padding', value: '10px', editor: cssSize },
            { name: 'margin', value: '10px', editor: cssSize },
            { name: 'opacity', value: '1' },
            { name: 'text-align', value: 'center', editor: textAlign },
            { name: 'text-decoration', value: 'underline', editor: textDecoration },
            { name: 'vertical-align', value: 'middle', editor: verticalAlign }
        ];


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
                logger.debug({ method: 'init', message: 'widget initialized' });
                // if ($.isFunction($.fn.kendoGrid)) {
                that._setDataSource();
                that.value(that.options.value);
                that._layout();
                that._setEventHandlers();
                // }
                // Note: a simple textarea would do when running kendo-core without grid
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

            /* This function has too many statements. */
            /* jshint -W071 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

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
                        // Because of this, we have to implement additional plumbing
                        // See: http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#methods-editCell
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

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that._setGrid();
                that.element.addClass(WIDGET_CLASS);
            },

            /**
             * Set the grid
             * @private
             */
            _setGrid: function () {
                var that = this;
                var options = that.options;
                that.grid = that.element
                    .kendoGrid({
                        columns: [
                            {
                                field: 'name',
                                title: options.messages.columns.name,
                                editor: that._cssNameEditor.bind(that),
                                template: '#=name#'
                            },
                            {
                                field: 'value',
                                title: options.messages.columns.value,
                                editor: that._cssValueEditor.bind(that),
                                template: '#=value#'
                            }
                        ],
                        dataBound: that._onDataBound.bind(that),
                        dataSource: that._dataSource,
                        editable: 'incell',
                        edit: that._onGridEdit.bind(that),
                        height: options.height,
                        resizable: true,
                        scrollable: true,
                        selectable: 'row',
                        sortable: true,
                        toolbar: [
                            { name: 'create', text: options.messages.toolbar.create },
                            { name: 'destroy', text: options.messages.toolbar.destroy }
                        ]
                    })
                    .data('kendoGrid');
            },

            /**
             * The CSS property name editor (a drop down list of names)
             * This function is taken from http://demos.kendoui.com/web/grid/editing-custom.html
             * @See also http://www.telerik.com/forums/kendo-ui-grid-s-combobox-editor-template-validation
             * @param container
             * @param options
             * @private
             */
            _cssNameEditor: function (container, options) {
                var that = this;
                // We cannot set the combobox name for validation before initializing the kendo ui widget
                // See http://www.telerik.com/forums/comboxbox-in-grid-with-validation
                // $('<input name="style_name" data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.name + '">')
                var combobox = $('<input data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.name + '">')
                    .appendTo(container)
                    .kendoComboBox({
                        autoBind: true,
                        change: function (e) {
                            // The change event handler assigns a default value depending on the style name
                            if (e /*instanceof $.Event*/ && e.sender instanceof kendo.ui.ComboBox) {
                                var dataItem = e.sender.dataItem();
                                // var grid = container.closest('.k-grid').data('kendoGrid');
                                var grid = that.element.data('kendoGrid');
                                var uid = container.parent().attr(kendo.attr('uid'));
                                if (grid instanceof kendo.ui.Grid && $.type(uid) === 'string' && $.type(dataItem) !== UNDEFINED) {
                                    var row = grid.dataSource.getByUid(uid);
                                    row.set('value', dataItem.get('value'));
                                }
                            }
                        },
                        dataSource: { data: CSS_STYLES },
                        dataTextField: 'name',
                        dataValueField: 'name'
                    })
                    .data('kendoComboBox');
                // The workaround for validation to work is to set the name after initializing the kendo ui widget
                // TODO http://www.telerik.com/forums/how-to-enforce-validation-in-grid-sample
                combobox.element.attr('name', 'name');
                $('<span class="k-invalid-msg" data-for="name"></span>').appendTo(container);
            },

            /**
             * The CSS property value editor switches to a custom editor based on property name
             * @param container
             * @param options
             * @private
             */
            _cssValueEditor: function (container, options) {
                var that = this;
                // Find the corresponding property name and custom editor
                var name = container.closest('tr.k-state-selected').children().first().text();
                var found = CSS_STYLES.filter(function (item) { return item.name === name; });
                // Switch to the corresponding editor or fallback to a simple textbox
                if ($.isArray(found) && found.length && found[0] && $.isFunction(found[0].editor)) {
                    return found[0].editor.bind(that)(container, options);
                } else {
                    var textbox = $('<input type="text" name="value" class="k-textbox" data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.value + '">')
                        .appendTo(container);
                    $('<span class="k-invalid-msg" data-for="value"></span>').appendTo(container);
                }
            },

            /**
             * Event handler for the grid dataBound event
             * Clicking `New Style` executes addRow which triggers a sync event on the dataSource
             * This triggers a refresh on the grid which cancels edit mode
             * We restore edit mode here below assuming that if the first dataItem has empty properties, it has just been added
             * @private
             */
            _onDataBound: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(Grid, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Grid'));
                var dataItem = e.sender.dataSource.at(0);
                if (dataItem && dataItem.name === '' && dataItem.value === '') {
                    e.sender.editCell(e.sender.element.find('td:eq(0)'));
                }
            },

            /**
             * Event handler for editing a grid row
             * @param e
             * @private
             */
            _onGridEdit: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(Grid, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Grid'));
                assert.instanceof($, e.container, kendo.format(assert.messages.instanceof.default, 'e.container', 'jQuery'));
                // Select the edited row
                var row = e.container.closest('tr');
                e.sender.select(e.container.closest('tr'));
                // if editing a css property name (and not a css property value)
                if (e.container.is('td:eq(0)')) {
                    // Find the combobox and update dataSource with a list of styles that does not contain styles already defined
                    var comboBox = e.container.find(kendo.roleSelector('combobox')).data('kendoComboBox');
                    if (comboBox instanceof kendo.ui.ComboBox) {
                        var rows = e.sender.dataSource.data();
                        var css = [];
                        for (var i = 0; i < CSS_STYLES.length; i++) {
                            var found = false;
                            for (var j = 0; j < rows.length; j++) {
                                /* Blocks are nested too deeply. */
                                /* jshint -W073 */
                                if (CSS_STYLES[i].name === rows[j].name &&
                                    CSS_STYLES[i].name !== comboBox.value()) {
                                    found = true;
                                    break;
                                }
                                /* jshint +W073 */
                            }
                            if (!found) {
                                css.push(CSS_STYLES[i]);
                            }
                        }
                        comboBox.setDataSource(css);
                        comboBox.focus();
                    }
                }
            },

            /* jshint +W074 */
            /* jshint +W071 */

            /**
             * Sets the data source
             * @private
             */
            _setDataSource: function () {
                var that = this;
                // This dataSource is private to the widget because data is assigned through value binding instead of source binding
                that._dataSource = new kendo.data.DataSource({
                    autoSync: true,
                    change: function (e) {
                        // triggers the change event on the widget for value binding
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
             * Refresh the grid
             */
            refresh: function () {
                var that = this;
                if (that.grid instanceof kendo.ui.Grid) {
                    that.grid.refresh();
                }
            },

            /**
             * Add a click event handlers for the toolbar
             * @private
             */
            _setEventHandlers: function () {
                var that = this;
                var element = that.element;
                element.find(TOOLBAR_SELECTOR)
                    .on(CLICK + NS, DELETE_SELECTOR, that._onDeleteClick.bind(that));
                element.find(TABLE_SELECTOR)
                    .on(KEYPRESS + NS, INPUT_SELECTOR, that._onInputKeyPress.bind(that));
            },

            /**
             * Event handler for clicking the `Delete` button
             * Note: Since the dataSource does not have transport destroy, delete is not processed
             * @param e
             * @private
             */
            _onDeleteClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(Grid, this.grid, kendo.format(assert.messages.instanceof.default, 'this.grid', 'kendo.ui.Grid'));
                e.preventDefault();
                var grid = this.grid;
                var selected = grid.select();
                if (selected instanceof $ && selected.length) {
                    // although shorter, the following displays an alert to confirm deletion, which we do not want
                    // grid.removeRow(selected);
                    var uid = selected.attr(kendo.attr('uid'));
                    var dataItem = grid.dataSource.getByUid(uid);
                    grid.dataSource.remove(dataItem);
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Event handler for input key press
             * to prevent some unhealthy characters to be used for style names and values
             * @private
             */
            _onInputKeyPress: function (e) {
                assert.instanceof($.Event, e, assert.messages.instanceof.default, 'e', 'jQuery.Event');
                var input = $(e.target);
                if (input.hasClass('k-input') && input.parent().hasClass('k-dropdown-wrap')) {
                    // the drop down with a list of style names has the focus
                    // allowed characters are a-z (96-123) and minus/hiphen/dash (45)
                    if (!(e.which === 45 || (e.which > 96 && e.which < 123))) {
                        e.preventDefault();
                    }
                } else if (input.hasClass('k-textbox') && input.parent().hasClass('k-edit-cell')) {
                    // the textbox for style value has the focus
                    // do not allow < (60), > (62), : (58), ; (59) and " (34)
                    if (e.which === 34 || e.which === 58 || e.which === 59 || e.which === 60 || e.which === 62) {
                        e.preventDefault();
                    }
                }
            },

            /* jshint +W074 */

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                wrapper.find(TABLE_SELECTOR)
                    .off(KEYPRESS + NS);
                wrapper.find(TOOLBAR_SELECTOR)
                    .off(CLICK + NS);
                that._dataSource.unbind(CHANGE);
                kendo.unbind(wrapper);
                // Clear references
                that.grid = undefined;
                that._dataSource = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(StyleEditor);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
