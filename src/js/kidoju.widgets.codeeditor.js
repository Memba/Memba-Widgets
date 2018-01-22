/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/codemirror/lib/codemirror.js',    // Keep first or change variables below
        './vendor/codemirror/addon/lint/jshint.js', // Keep second or change variables below
        './vendor/codemirror/mode/javascript/javascript.js',
        './vendor/codemirror/addon/lint/lint.js',
        './vendor/codemirror/addon/lint/javascript-lint.js',
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.tooltip'
    ], f);
})(function (CodeMirror, JSHINT) {

    'use strict';

    // Depending how codemirror.js is loaded
    // We need `CodeMirror` for webpack and `window.CodeMirror` for grunt mocha
    CodeMirror = CodeMirror || window.CodeMirror;

    // We need JSHINT as a global for CodeMirror linting to work - @see ./src/js/vendor/codemirror/addon/lint/javascript-lint.js
    // window.JSHINT is for script tags
    // JSHINT.JSHINT is for webpack
    // JSHINT is for SystemJS (although it does not seem to work)
    window.JSHINT = window.JSHINT || (JSHINT && JSHINT.JSHINT) || JSHINT;
    // window.JSHINT should be a function, not an object containing the actual function

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var DropDownList = kendo.ui.DropDownList;
        var DataSource = kendo.data.DataSource;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.codeeditor');
        var OBJECT = 'object';
        var NUMBER = 'number';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var BEFORECHANGE = 'beforeChange';
        var CHANGE = 'change';
        var CLICK = 'click';
        var LIB_COMMENT = '// ';
        var NS = '.kendoCodeEditor';
        var WIDGET_CLASS = 'k-widget kj-codeeditor';
        var STATE_DISABLED = 'k-state-disabled';
        var RX_VALIDATION_LIBRARY = /^\/\/ ([^\s\[\n]+)( (\[[^\n]+\]))?$/;
        var RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;
        var LABEL_TMPL = '<label><span>{0}</span></label>';
        var MESSAGE_TMPL = '<div class="k-widget k-notification k-notification-#: type #" data-role="alert">' +
            '<div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div>' +
            '</div>';

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
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that._dataSource();
                that._initValue();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CodeEditor',
                autoBind: true,
                dataSource: [],
                custom: 'custom',
                default: '// equal',
                nameField: 'name',
                formulaField: 'formula',
                paramField: 'param',
                workerLib: '',
                timeout: 250,
                solution: '',
                value: null, // Not the value to test, but the widget value for MVVM bindings
                messages: {
                    formula: 'Formula:',
                    notApplicable: 'N/A',
                    solution: 'Solution:',
                    value: 'Value:',
                    test: 'Test',
                    success: 'Success',
                    failure: 'Failure',
                    omit: 'Omit',
                    error: 'Error',
                    ajaxError: 'Error loading worker library.',
                    jsonError: 'Error parsing value as json. Wrap strings in double quotes.',
                    timeoutError: 'The execution of a web worker has timed out.'
                }
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
            _initValue: function () { // Consider making it setOptions(options)
                var options = this.options;
                if ($.type(options.value) === STRING && RX_VALIDATION_CUSTOM.test(options.value)) {
                    this.value(options.value);
                } else if ($.type(options.value) === STRING && RX_VALIDATION_LIBRARY.test(options.value)) {
                    this.value(options.value);
                } else if (this.dataSource instanceof DataSource && this.dataSource.total()) {
                    this.value(options.default);
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
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
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
                var customMatches = value.match(RX_VALIDATION_CUSTOM);
                if ($.isArray(customMatches) && customMatches.length === 2) {
                    return value;
                }
            },

            /**
             * Returns the library item from the code input widget value (that is `// <name> (<paramValue>)`)
             * @param value
             * @returns {*}
             * @private
             */
            _parseLibraryValue: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.equal(this.dropDownList.dataSource, this.dataSource, 'this.dropDownList.dataSource and this.dataSource are expected to be the same');
                var options = this.options;
                var ret = {};
                var libraryMatches = value.match(RX_VALIDATION_LIBRARY);
                if ($.isArray(libraryMatches) && libraryMatches.length === 4) {
                    var paramValue = libraryMatches[3];
                    // Array.find is not available in Internet Explorer, thus the use of Array.filter
                    var found = this.dataSource.data().filter(function (item) {
                        return item[options.nameField] === libraryMatches[1];
                    });
                    if ($.isArray(found) && found.length) {
                        ret.item = found[0];
                    }
                    if (ret.item && $.type(ret.item.param) === STRING && $.type(paramValue) === STRING && paramValue.length > '[]'.length) {
                        ret.paramValue = JSON.parse(paramValue)[0];
                    }
                }
                return ret;
            },

            /* This function has too many statements. */
            /* jshint -W071 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * refresh UI
             * @private
             */
            refresh: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(CodeMirror, this.codeMirror, kendo.format(assert.messages.instanceof.default, 'this.codeMirror', 'CodeMirror'));
                var that = this;
                var options = that.options;

                // Any changes should remove any pending message
                that.messageWrap.empty();

                if (that._isCustom(that._value)) {

                    // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
                    that.dropDownList.text(options.custom);
                    that.paramInput
                        .attr({ placeholder: options.messages.notApplicable })
                        .addClass(STATE_DISABLED)
                        .val('');
                    if (that.codeMirror.getDoc().getValue() !== that._value) {
                        that.codeMirror.getDoc().setValue(that._value);
                    }

                } else {

                    // Otherwise, search the library
                    var parsed = that._parseLibraryValue(that._value);
                    if ($.type(parsed.item) === UNDEFINED) {
                        // and use default if not found
                        parsed = that._parseLibraryValue(options.default);
                        assert.type(OBJECT, parsed.item, '`this.options.default` is expected to exist in the library');
                    }
                    var name = parsed.item[options.nameField];
                    var formula = parsed.item[options.formulaField];
                    var paramName = parsed.item[options.paramField];
                    var paramValue = parsed.paramValue || '';

                    // Reset value in case the original value could not be found and we had to fallback to default
                    that._value = LIB_COMMENT + name + (paramName ? ' ' + JSON.stringify([paramValue]) : '');

                    that.dropDownList.text(name);
                    // Enable/disable paramInput
                    if ($.type(paramName) === STRING && paramName.length) {
                        that.paramInput
                            .attr({ placeholder: paramName })
                            .removeClass(STATE_DISABLED)
                            .val(paramValue);
                    } else {
                        that.paramInput
                            .attr({ placeholder: options.messages.notApplicable })
                            .addClass(STATE_DISABLED)
                            .val('');
                    }
                    var code = kendo.format(formula, paramValue);
                    if (that.codeMirror.getDoc().getValue() !== code) {
                        that.codeMirror.getDoc().setValue(code);
                    }
                }

                logger.debug({ method: 'refresh', message: 'widget refreshed' });
            },

            /* jshint +W074 */
            /* jshint +W071 */

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
                that._setFooter();
            },

            /**
             * Set drop down list with code library and solution input
             * @private
             */
            _setHeader: function () {
                var that = this;
                var options = that.options;
                var header = $('<div class="k-header kj-codeeditor-header"><div></div><div></div></div>').appendTo(that.element);
                var formulaLabel = $(kendo.format(LABEL_TMPL, options.messages.formula)).appendTo(header.find('div:nth-child(1)'));
                var paramDiv = header.find('div:nth-child(2)');

                // Add the dropDownList for library formulas
                that.dropDownList = $('<select/>')
                    .appendTo(formulaLabel)
                    .kendoDropDownList({
                        autoBind: options.autoBind,
                        autoWidth: true,
                        change: $.proxy(that._onUserInputChange, that),
                        dataTextField: options.nameField,
                        dataValueField: options.formulaField,
                        dataSource: options.dataSource
                    })
                    .data('kendoDropDownList');

                // Add the textbox for validation param
                that.paramInput = $('<input class="k-textbox">')
                    .appendTo(paramDiv)
                    .on(CHANGE + NS, $.proxy(that._onUserInputChange, that));
            },

            /**
             * Event handler executed when changing the value of the drop down list in the header or the value of validation param
             * @private
             */
            _onUserInputChange: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;
                var options = that.options;
                var dataItem = that.dropDownList.dataItem();
                if (dataItem) {
                    var name = dataItem[options.nameField];
                    var formula = dataItem[options.formulaField];
                    var paramName = dataItem[options.paramField];
                    var paramValue = that.paramInput.val();
                    if (name === options.custom) {
                        that.value(formula);
                    } else {
                        // Note: We use an array to pass to kendo.format.apply in order to build the formula
                        that.value(LIB_COMMENT + name + (paramName ? ' ' + JSON.stringify([paramValue]) : ''));
                    }
                    that.trigger(CHANGE);
                }
            },

            /**
             * Set CodeMirror editor
             * @private
             */
            _setCodeMirror: function () {
                var that = this;
                var options = that.options;
                var div = $('<div class="kj-codeeditor-editor"></div>')
                        .appendTo(that.element);

                // Initialize CodeMirror
                that.codeMirror = CodeMirror(div.get(0), {
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

                that.codeMirror.on(CHANGE, function (cm, change) {
                    // Synchronize drop down list with code editor to display `custom` upon any change
                    var dataItem = that.dropDownList.dataItem();
                    if (dataItem) {
                        var formula = dataItem[options.formulaField];
                        var name = dataItem[options.nameField];
                        var value = that.codeMirror.getDoc().getValue();
                        var paramValue = that.paramInput.val();
                        var code = kendo.format(formula, paramValue);
                        if (name === options.custom || value !== code) {
                            that.value(value);
                        }
                    }
                    // Trigger a change event if change is the result of typings
                    if (change.origin !== 'setValue') {
                        that.trigger(CHANGE);
                    }

                });

                // Otherwise gutters and line numbers might be misaligned
                that.codeMirror.refresh();
            },

            /**
             * Set value input and test buttons
             * @private
             */
            _setFooter: function () {
                var that = this;
                var options = that.options;
                var footer = $('<div class="k-header kj-codeeditor-footer"><div></div><div></div><div></div></div>').appendTo(that.element);
                var solutionLabel = $(kendo.format(LABEL_TMPL, options.messages.solution)).appendTo(footer.find('div:nth-child(1)'));
                var valueLabel = $(kendo.format(LABEL_TMPL, options.messages.value)).appendTo(footer.find('div:nth-child(2)'));
                var testDiv = footer.find('div:nth-child(3)');

                // Add a disabled input field to display the solution
                that.solutionInput = $('<input class="k-textbox k-state-disabled" disabled>')
                    .val($.type(options.solution) === STRING ? options.solution : JSON.stringify(options.solution))
                    .appendTo(solutionLabel);

                // Add the input field to enter a value
                that.valueInput = $('<input class="k-textbox">')
                    .appendTo(valueLabel);

                // Add the test button
                that.testButton = $(kendo.format('<button class="k-button"><span class="k-icon k-i-play"></span>&nbsp;{0}</button>', options.messages.test))
                    .on(CLICK + NS, $.proxy(that._onTestButtonClick, that))
                    .appendTo(testDiv);

                // Add the message block
                that.messageWrap = $('<div class="kj-codeeditor-message"></div>')
                    .appendTo(testDiv);
            },

            /**
             * Event handler for clicking the text button
             * @private
             */
            _onTestButtonClick: function () {
                var that = this;
                var options = that.options;

                // New test, so empty the message if it is still shown
                that.messageWrap.empty();

                if ($.type(options.workerLib) === STRING && options.workerLib.length) {
                    // Download the worker lib
                    $.ajax({ url: options.workerLib, cache: true, dataType: 'text' })
                        .done(function (workerLib) {
                            $.proxy(that._runTest, that)(workerLib)
                                .done($.proxy(that._showResult, that))
                                .fail($.proxy(that._showError, that));
                        })
                        .fail($.proxy(that._showError, that));

                } else {
                    // No worker lib to download
                    that._runTest()
                        .done($.proxy(that._showResult, that))
                        .fail($.proxy(that._showError, that));
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Run test
             * @param workerLib
             * @private
             */
            _runTest: function (workerLib) {

                var that = this;
                var options = that.options;
                var dfd = $.Deferred();

                // Build the blob
                var code = that.codeMirror.getDoc().getValue();
                var blob = new Blob([
                    ($.type(workerLib) === STRING ? workerLib + ';\n' : '') +
                    'self.onmessage = function (e) {\n' + code + '\nvar data=JSON.parse(e.data);\nif (typeof data.value === "undefined") { self.postMessage(undefined); } else { self.postMessage(validate(data.value, data.solution, data.all)); } self.close(); };'
                ]);
                var blobURL = window.URL.createObjectURL(blob);

                // Count lines of code
                that._lines = (($.type(workerLib) === STRING ? workerLib + ';\n' : '').match(/\n/) || []).length;

                // Build the data to post to the web worker
                var data = {};
                var value = that.valueInput.val();
                if ($.type(value) === STRING && value.length) { // an empty string cannot be parsed
                    try {
                        // try JSON for complex objects/arrays
                        data.value = JSON.parse(value);
                    } catch (ex) {
                        dfd.reject(new Error(options.messages.jsonError));
                        return dfd.promise();
                    }
                }

                data.solution = $.type(options.solution) === STRING ? JSON.parse(options.solution) : options.solution;

                // avoid error when calling all.val_<id>
                data.all = {}; // TODO: detect when all is required and disable test

                // Build teh web worker
                var worker = new window.Worker(blobURL);
                worker.onmessage = function (e) {
                    dfd.resolve(e.data);
                    window.URL.revokeObjectURL(blobURL);
                };
                worker.onerror = function (e) {
                    // e is an ErrorEvent with e.message, e.filename, e.lineno and e.colno
                    dfd.reject(e);
                    window.URL.revokeObjectURL(blobURL);
                };
                worker.postMessage(JSON.stringify(data)); // Start the worker.

                // Terminate the worker on timeOut
                if ($.type(options.timeOut) === NUMBER) {
                    setTimeout(function () {
                        if (dfd.state() === 'pending') {
                            dfd.reject(new Error(options.timeoutError));
                            worker.terminate();
                            window.URL.revokeObjectURL(blobURL);
                        }
                    }, options.timeOut);
                }

                return dfd.promise();

            },

            /* jshint +W074 */

            /**
             * Display result (success, failure, omit)
             * @param xhr
             * @param status
             * @param error
             * @private
             */
            _showResult: function (result) {
                var that = this;
                var options = that.options;
                that._lines = undefined;
                if ($.type(result) === UNDEFINED) {
                    that.messageWrap
                        .append(kendo.template(MESSAGE_TMPL)({ type: 'warning', message: options.messages.omit }));
                } else if (result === true) {
                    that.messageWrap
                        .append(kendo.template(MESSAGE_TMPL)({ type: 'success', message: options.messages.success }));
                } else if (result === false) {
                    that.messageWrap
                        .append(kendo.template(MESSAGE_TMPL)({ type: 'info', message: options.messages.failure }));
                }
                setTimeout(function () {
                    if (that.messageWrap instanceof $) { // Note: that.messageWrap might no more exist if the codeeditor has been closed in the meantime
                        that.messageWrap.empty();
                    }
                }, 5000);
            },

            /**
             * Display error
             * @param xhr
             * @param status
             * @param error
             * @private
             */
            _showError: function (xhr, status, error) {
                var that = this;
                var options = that.options;

                that.messageWrap
                    .append(kendo.template(MESSAGE_TMPL)({ type: 'error', message: options.messages.error }));

                if (!(that.tooltip instanceof kendo.ui.Tooltip)) {
                    that.tooltip = that.messageWrap.kendoTooltip({
                        filter: '.k-notification-error',
                        position: 'top',
                        content: function (e) {
                            if (xhr instanceof window.ErrorEvent) {
                                // This is an error in the worker code
                                return xhr.message + ' at ' + (xhr.lineno - that._lines - 1) + ':' + xhr.colno;
                            } else if (xhr instanceof Error) {
                                return xhr.message;
                            } else if (xhr && status/* && error*/) {
                                // This is an error looding workerLib with $.ajax
                                return options.messages.ajaxError;
                            }
                        }
                    });
                }

                // that._lines = undefined;
            },

            /**
             * _dataSource function to pass the dataSource to the dropDownList
             * @private
             */
            _dataSource: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = kendo.data.DataSource.create(that.options.dataSource);

                // Pass dataSource to dropDownList
                that.dropDownList.setDataSource(that.dataSource);
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
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                if (that.codeMirror instanceof CodeMirror) {
                    that.codeMirror.off(BEFORECHANGE);
                    that.codeMirror.off(CHANGE);
                }
                if (that.paramInput instanceof $) {
                    that.paramInput.off(NS);
                }
                if (that.testButton instanceof $) {
                    that.testButton.off(NS);
                }
                kendo.unbind(wrapper);
                // Release references
                that.dataSource = undefined;
                that.dropDownList = undefined;
                that.paramInput = undefined;
                that.codeMirror = undefined;
                that.solutionInput = undefined;
                that.valueInput = undefined;
                that.testButton = undefined;
                that.messageWrap = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(CodeEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
