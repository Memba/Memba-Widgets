/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/codemirror/lib/codemirror.js',
        './vendor/codemirror/mode/javascript/javascript.js',
        './vendor/codemirror/addon/lint/lint.js',
        './vendor/codemirror/addon/lint/jshint.js',
        './vendor/codemirror/addon/lint/javascript-lint.js',
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function (CodeMirror) {

    'use strict';

    // Depending how codemirror.js is loaded
    // We need `CodeMirror` for webpack and `window.CodeMirror` for grunt mocha
    CodeMirror = CodeMirror || window.CodeMirror;

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.codeeditor');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var BEFORECHANGE = 'beforeChange';
        var CHANGE = 'change';
        var JS_COMMENT = '// ';
        // var NS = '.kendoCodeEditor',
        var WIDGET_CLASS = 'k-widget kj-codeeditor';
        var RX_LIBRARY = /^\/\/ ([^\n]+)$/;
        var RX_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class CodeEditor Widget (kendoCodeEditor)
         */
        var CodeEditor = Widget.extend({

            // TODO: Add testing of user value against solution
            // Quite complex, because we need to bring in kidoju.library.js + web workers execution (currently in kidoju.tools)

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
                that._layout();
                that._dataSource();
                that._initValue();
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CodeEditor',
                autoBind: true,
                // dataSource: [],
                custom: 'custom',
                default: 'equal',
                solution: '',
                value: null
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Init value
             * @private
             */
            _initValue: function () { // Consider setOptions
                var options = this.options;
                if ($.type(options.value) === STRING && RX_CUSTOM.test(options.value)) {
                    this.value(options.value);
                } else if ($.type(options.value) === STRING && RX_LIBRARY.test(/*JS_COMMENT +*/options.value)) {
                    this.value(/*JS_COMMENT +*/options.value);
                } else if (this.dataSource && this.dataSource.total()) {
                    this.value(JS_COMMENT + options.default);
                }
            },

            /**
             * Value for MVVM binding
             * Takes/returns either a JS function as a string or a library formula name prefixed by '// '
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING) {
                    that._toggle(value);
                } else if ($.type(value) === UNDEFINED) {
                    var formula = that.dropDownList.text();
                    if ($.type(formula) !== STRING || !formula.length) {
                        return undefined;
                    } else if (formula === that.options.custom) {
                        return that.codeMirror.getDoc().getValue();
                    } else {
                        return JS_COMMENT + that.dropDownList.text();
                    }
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Check that value refers to a custom function not in the code library
             *
             * @param value
             * @returns {*}
             * @private
             */
            _isCustom: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                var customMatches = value.match(RX_CUSTOM);
                if ($.isArray(customMatches) && customMatches.length === 2) {
                    return value;
                }
            },

            /**
             * Check that value refers to a piece of code from the library (dataSource)
             * Returns the name of the library item (without `// `) if found, otherwise undefined
             * @param value
             * @returns {*}
             * @private
             */
            _isInLibrary: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                assert.instanceof(kendo.ui.DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(kendo.data.DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.equal(this.dropDownList.dataSource, this.dataSource, 'this.dropDownList.dataSource and this.dataSource are expected to be the same');
                var libraryMatches = value.match(RX_LIBRARY);
                if ($.isArray(libraryMatches) && libraryMatches.length === 2) {
                    var found = this.dataSource.data().filter(function (item) {
                        return item.name === libraryMatches[1];
                    });
                    if ($.isArray(found) && found.length) {
                        return libraryMatches[1];
                    }
                }
            },

            /**
             * toggle UI for custom vs library code
             * @param value
             * @private
             */
            _toggle: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                assert.instanceof(kendo.ui.DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(CodeMirror, this.codeMirror, kendo.format(assert.messages.instanceof.default, 'this.codeMirror', 'CodeMirror'));
                var that = this;
                if (that._isCustom(value)) {
                    // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
                    that.codeMirror.getDoc().setValue(value);
                } else {
                    // Otherwise, search the library
                    var name = that._isInLibrary(value);
                    if ($.type(name) === UNDEFINED) {
                        // and use default if not found
                        name = that._isInLibrary(JS_COMMENT + that.options.default);
                        assert.type(STRING, name, '`this.options.default` is expected to exist in the library');
                    }
                    that.dropDownList.text(name);
                    that._onDropDownListChange();
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that._setHeader();
                that._setCodeMirror();
            },

            /**
             * Set drop down list with code library and value input
             * @private
             */
            _setHeader: function () {
                var that = this;
                var header = $('<div class="k-header"><div></div><div></div></div>').appendTo(that.element);
                var left = header.find('div').first();
                var right = header.find('div').last();

                // Create the dropDownList
                that.dropDownList = $('<select/>')
                    .appendTo(left)
                    .kendoDropDownList({
                        autoBind: that.options.autoBind,
                        change: $.proxy(that._onDropDownListChange, that), // change is not triggered by dropDownList api calls incl. value(), text(), ...
                        dataTextField: 'name',
                        dataValueField: 'formula',
                        dataSource: that.options.dataSource
                    })
                    .data('kendoDropDownList');

                // create the input field to display solution
                that.input = $('<input class="k-textbox k-state-disabled" disabled>')
                    .appendTo(right)
                    .val(that.options.solution);
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function () {
                assert.instanceof(kendo.ui.DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(CodeMirror, this.codeMirror, kendo.format(assert.messages.instanceof.default, 'this.codeMirror', 'CodeMirror'));
                this.codeMirror.getDoc().setValue(this.dropDownList.value());
            },

            /**
             * Set CodeMirror editor
             * @private
             */
            _setCodeMirror: function () {
                var that = this;
                var div = $('<div class="kj-codemirror"></div>')
                        .appendTo(that.element)
                        .get(0);
                assert.instanceof(window.HTMLElement, div, kendo.format(assert.messages.instanceof.default, 'div', 'HTMLElement'));
                that.codeMirror = CodeMirror(div, {
                    gutters: ['CodeMirror-lint-markers'],
                    lineNumbers: true,
                    lint: true,
                    mode: 'javascript',
                    value: ''
                });

                // Prevent from modifying first lines and last line
                that.codeMirror.on(BEFORECHANGE, function (cm, change) {
                    if (change.origin === 'setValue') {
                        return; // updated using this.value(value)
                    }
                    // if updated by typing into the code editor
                    if ((change.from.line === 0) || // prevent changing the first line
                        (change.from.line === cm.display.renderedView.length - 1) || // prevent changing the last line
                        (change.origin === '+delete' && change.to.line === cm.display.renderedView.length - 1)) { // prevent backspace on the last line or suppr on the previous line
                        // cancel change
                        change.cancel();
                    }
                });

                // Synchronize drop down list with code editor to display `custom` upon any change
                that.codeMirror.on(CHANGE, function (cm, change) {
                    if (that.dropDownList.text() !== that.options.custom) {
                        if (that.codeMirror.getDoc().getValue() !== that.dropDownList.value()) {
                            that.dropDownList.text(that.options.custom);
                        }
                    }
                    // trigger a change event for MVVM value binding
                    that.trigger(CHANGE, { value: that.value() });
                });

            },

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function () {
                assert.instanceof(kendo.ui.DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(kendo.data.DataSource, this.dropDownList.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dropDownList.dataSource', 'kendo.data.DataSource'));
                var that = this;
                var dropDownList = that.dropDownList;
                // MVVM bindings require that.dataSource
                that.dataSource = that.dropDownList.dataSource;
                if (that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                that._refreshHandler = $.proxy(that.refresh, that);
                that.dataSource.bind(CHANGE, that._refreshHandler);
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                assert.instanceof(kendo.ui.DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;
                var dropDownList = that.dropDownList;
                if (dropDownList.dataSource !== dataSource) {
                    dropDownList.setDataSource(dataSource);
                    that._dataSource();
                    that._initValue();
                }
            },

            /**
             * Refresh
             * @param e
             */
            refresh: function (e) {
                assert.instanceof(kendo.ui.DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                this.dropDownList.refresh(e);
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                kendo.unbind(that.element);
                // unbind all other events
                that.element.find('*').off();
                that.element.off();
                // remove descendants
                that.element.empty();
                // remove element classes
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
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(CodeEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
