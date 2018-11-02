/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.dropdownlist';
import 'kendo.tooltip';
import CodeMirror from '../vendor/codemirror/lib/codemirror';
import JSHINT from '../vendor/codemirror/addon/lint/jshint';
import '../vendor/codemirror/mode/javascript/javascript';
import '../vendor/codemirror/addon/lint/lint';
import '../vendor/codemirror/addon/lint/javascript-lint';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    data: { DataSource },
    destroy,
    format,
    template,
    ui: { DataBoundWidget, DropDownList, plugin, Tooltip }
} = window.kendo;
const logger = new Logger('widgets.codeeditor');

const NS = '.kendoCodeEditor';
const WIDGET_CLASS = 'k-widget kj-codeeditor';
const BEFORECHANGE = 'beforeChange';
const LIB_COMMENT = '// ';
const RX_VALIDATION_LIBRARY = /^\/\/ ([^\s[\n]+)( ([[^\n]+]))?$/;
const RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;
const LABEL_TMPL = '<label><span>{0}</span></label>';
const MESSAGE_TMPL =
    '<div class="k-widget k-notification k-notification-#: type #" data-role="alert">' +
    '<div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div>' +
    '</div>';

/**
 * CodeEditor
 * @class CodeEditor
 * @extends DataBoundWidget
 */
const CodeEditor = DataBoundWidget.extend({
    // TODO: Add testing of user value against solution
    // Quite complex, because we need to bring in kidoju.library.js + web workers execution (currently in kidoju.tools)

    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this._dataSource();
        this._initValue();
    },

    /**
     * Options
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
            jsonError:
                'Error parsing value as json. Wrap strings in double quotes.',
            timeoutError: 'The execution of a web worker has timed out.'
        }
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Init value
     * @private
     */
    _initValue() {
        // Consider making it setOptions(options)
        const { options } = this;
        if (
            $.type(options.value) === CONSTANTS.STRING &&
            RX_VALIDATION_CUSTOM.test(options.value)
        ) {
            this.value(options.value);
        } else if (
            $.type(options.value) === CONSTANTS.STRING &&
            RX_VALIDATION_LIBRARY.test(options.value)
        ) {
            this.value(options.value);
        } else if (
            this.dataSource instanceof DataSource &&
            this.dataSource.total()
        ) {
            this.value(options.default);
        }
    },

    /**
     * Value for MVVM binding
     * Takes/returns either a JS function as a string or a library formula name prefixed by '// '
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * Check that value refers to a custom function not in the code library
     *
     * @param value
     * @returns {*}
     * @private
     */
    _isCustom(value) {
        assert.type(
            CONSTANTS.STRING,
            value,
            assert.format(assert.messages.type.default, value, CONSTANTS.STRING)
        );
        const customMatches = value.match(RX_VALIDATION_CUSTOM);
        if (Array.isArray(customMatches) && customMatches.length === 2) {
            return value;
        }
    },

    /**
     * Returns the library item from the code input widget value (that is `// <name> (<paramValue>)`)
     * @param value
     * @returns {*}
     * @private
     */
    _parseLibraryValue(value) {
        assert.type(
            CONSTANTS.STRING,
            value,
            assert.format(assert.messages.type.default, value, CONSTANTS.STRING)
        );
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        assert.instanceof(
            DataSource,
            this.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.dataSource',
                'kendo.data.DataSource'
            )
        );
        assert.equal(
            this.dropDownList.dataSource,
            this.dataSource,
            'this.dropDownList.dataSource and this.dataSource are expected to be the same'
        );
        const { options } = this;
        const ret = {};
        const libraryMatches = value.match(RX_VALIDATION_LIBRARY);
        if (Array.isArray(libraryMatches) && libraryMatches.length === 4) {
            const paramValue = libraryMatches[3];
            // Array.find is not available in Internet Explorer, thus the use of Array.filter
            const found = this.dataSource
                .data()
                .filter(item => item[options.nameField] === libraryMatches[1]);
            if (Array.isArray(found) && found.length) {
                ret.item = found[0];
            }
            if (
                ret.item &&
                $.type(ret.item.param) === CONSTANTS.STRING &&
                $.type(paramValue) === CONSTANTS.STRING &&
                paramValue.length > '[]'.length
            ) {
                ret.paramValue = JSON.parse(paramValue)[0];
            }
        }
        return ret;
    },

    /**
     * refresh UI
     * @private
     */
    refresh() {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        assert.instanceof(
            CodeMirror,
            this.codeMirror,
            assert.format(
                assert.messages.instanceof.default,
                'this.codeMirror',
                'CodeMirror'
            )
        );
        const that = this;
        const { options } = that;

        // Any changes should remove any pending message
        that.messageWrap.empty();

        if (that._isCustom(that._value)) {
            // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
            that.dropDownList.text(options.custom);
            that.paramInput
                .attr({ placeholder: options.messages.notApplicable })
                .addClass(CONSTANTS.DISABLED_CLASS)
                .val('');
            if (that.codeMirror.getDoc().getValue() !== that._value) {
                that.codeMirror.getDoc().setValue(that._value);
            }
        } else {
            // Otherwise, search the library
            let parsed = that._parseLibraryValue(that._value);
            if ($.type(parsed.item) === CONSTANTS.UNDEFINED) {
                // and use default if not found
                parsed = that._parseLibraryValue(options.default);
                assert.type(
                    CONSTANTS.OBJECT,
                    parsed.item,
                    '`this.options.default` is expected to exist in the library'
                );
            }
            const name = parsed.item[options.nameField];
            const formula = parsed.item[options.formulaField];
            const paramName = parsed.item[options.paramField];
            const paramValue = parsed.paramValue || '';

            // Reset value in case the original value could not be found and we had to fallback to default
            that._value =
                LIB_COMMENT +
                name +
                (paramName ? ` ${JSON.stringify([paramValue])}` : '');

            that.dropDownList.text(name);
            // Enable/disable paramInput
            if ($.type(paramName) === CONSTANTS.STRING && paramName.length) {
                that.paramInput
                    .attr({ placeholder: paramName })
                    .removeClass(CONSTANTS.DISABLED_CLASS)
                    .val(paramValue);
            } else {
                that.paramInput
                    .attr({ placeholder: options.messages.notApplicable })
                    .addClass(CONSTANTS.DISABLED_CLASS)
                    .val('');
            }
            const code = format(formula, paramValue);
            if (that.codeMirror.getDoc().getValue() !== code) {
                that.codeMirror.getDoc().setValue(code);
            }
        }

        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const that = this;
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
    _setHeader() {
        const that = this;
        const { options } = that;
        const header = $(
            '<div class="k-header kj-codeeditor-header"><div></div><div></div></div>'
        ).appendTo(that.element);
        const formulaLabel = $(
            format(LABEL_TMPL, options.messages.formula)
        ).appendTo(header.find('div:nth-child(1)'));
        const paramDiv = header.find('div:nth-child(2)');

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
            .on(CONSTANTS.CHANGE + NS, $.proxy(that._onUserInputChange, that));
    },

    /**
     * Event handler executed when changing the value of the drop down list in the header or the value of validation param
     * @private
     */
    _onUserInputChange() {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        const that = this;
        const { options } = that;
        const dataItem = that.dropDownList.dataItem();
        if (dataItem) {
            const name = dataItem[options.nameField];
            const formula = dataItem[options.formulaField];
            const paramName = dataItem[options.paramField];
            const paramValue = that.paramInput.val();
            if (name === options.custom) {
                that.value(formula);
            } else {
                // Note: We use an array to pass to kendo.format.apply in order to build the formula
                that.value(
                    LIB_COMMENT +
                        name +
                        (paramName ? ` ${JSON.stringify([paramValue])}` : '')
                );
            }
            that.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Set CodeMirror editor
     * @private
     */
    _setCodeMirror() {
        const that = this;
        const { options } = that;
        const div = $('<div class="kj-codeeditor-editor"></div>').appendTo(
            that.element
        );

        // Initialize JSHINT
        window.JSHINT = window.JSHINT || JSHINT;

        // Initialize CodeMirror
        that.codeMirror = CodeMirror(div.get(0), {
            gutters: ['CodeMirror-lint-markers'],
            lineNumbers: true,
            lint: true,
            mode: 'javascript',
            value: ''
        });

        // Prevent from modifying first lines and last line
        that.codeMirror.on(BEFORECHANGE, (cm, change) => {
            if (change.origin === 'setValue') {
                return; // updated using this.value(value)
            }
            // if updated by typing into the code editor
            if (
                change.from.line === 0 || // prevent changing the first line
                change.from.line === cm.display.renderedView.length - 1 || // prevent changing the last line
                (change.origin === '+delete' &&
                    change.to.line === cm.display.renderedView.length - 1)
            ) {
                // prevent backspace on the last line or suppr on the previous line
                // cancel change
                change.cancel();
            }
        });

        // Synchronize drop down list with code editor to display `custom` upon any change
        that.codeMirror.on(CONSTANTS.CHANGE, (cm, change) => {
            const dataItem = that.dropDownList.dataItem();
            if (dataItem) {
                const formula = dataItem[options.formulaField];
                const name = dataItem[options.nameField];
                const value = that.codeMirror.getDoc().getValue();
                const paramValue = that.paramInput.val();
                const code = format(formula, paramValue);
                if (name === options.custom || value !== code) {
                    that.value(value);
                }
            }
            // Trigger a change event if change is the result of typings
            if (change.origin !== 'setValue') {
                that.trigger(CONSTANTS.CHANGE);
            }
        });

        // Otherwise gutters and line numbers might be misaligned
        that.codeMirror.refresh();
    },

    /**
     * Set value input and test buttons
     * @private
     */
    _setFooter() {
        const that = this;
        const { options } = that;
        const footer = $(
            '<div class="k-header kj-codeeditor-footer"><div></div><div></div><div></div></div>'
        ).appendTo(that.element);
        const solutionLabel = $(
            format(LABEL_TMPL, options.messages.solution)
        ).appendTo(footer.find('div:nth-child(1)'));
        const valueLabel = $(
            format(LABEL_TMPL, options.messages.value)
        ).appendTo(footer.find('div:nth-child(2)'));
        const testDiv = footer.find('div:nth-child(3)');

        // Add a disabled input field to display the solution
        that.solutionInput = $(
            '<input class="k-textbox k-state-disabled" disabled>'
        )
            .val(
                $.type(options.solution) === CONSTANTS.STRING
                    ? options.solution
                    : JSON.stringify(options.solution)
            )
            .appendTo(solutionLabel);

        // Add the input field to enter a value
        that.valueInput = $('<input class="k-textbox">').appendTo(valueLabel);

        // Add the test button
        that.testButton = $(
            format(
                '<button class="k-button"><span class="k-icon k-i-play"></span>&nbsp;{0}</button>',
                options.messages.test
            )
        )
            .on(CONSTANTS.CLICK + NS, $.proxy(that._onTestButtonClick, that))
            .appendTo(testDiv);

        // Add the message block
        that.messageWrap = $(
            '<div class="kj-codeeditor-message"></div>'
        ).appendTo(testDiv);
    },

    /**
     * Event handler for clicking the text button
     * @private
     */
    _onTestButtonClick() {
        const that = this;
        const { options } = that;

        // New test, so empty the message if it is still shown
        that.messageWrap.empty();

        if (
            $.type(options.workerLib) === CONSTANTS.STRING &&
            options.workerLib.length
        ) {
            // Download the worker lib
            $.ajax({ url: options.workerLib, cache: true, dataType: 'text' })
                .then(workerLib => {
                    $.proxy(that._runTest, that)(workerLib)
                        .then($.proxy(that._showResult, that))
                        .catch($.proxy(that._showError, that));
                })
                .catch($.proxy(that._showError, that));
        } else {
            // No worker lib to download
            that._runTest()
                .then($.proxy(that._showResult, that))
                .catch($.proxy(that._showError, that));
        }
    },

    /**
     * Run test
     * @param workerLib
     * @private
     */
    _runTest(workerLib) {
        const that = this;
        const { options } = that;
        const dfd = $.Deferred();

        // Build the blob
        const code = that.codeMirror.getDoc().getValue();
        const blob = new Blob([
            `${
                $.type(workerLib) === CONSTANTS.STRING ? `${workerLib};\n` : ''
            }self.onmessage = function (e) {\n${code}\nvar data=JSON.parse(e.data);\nif (typeof data.value === "undefined") { self.postMessage(undefined); } else { self.postMessage(validate(data.value, data.solution, data.all)); } self.close(); };`
        ]);
        const blobURL = window.URL.createObjectURL(blob);

        // Count lines of code
        that._lines = (
            ($.type(workerLib) === CONSTANTS.STRING
                ? `${workerLib};\n`
                : ''
            ).match(/\n/) || []
        ).length;

        // Build the data to post to the web worker
        const data = {};
        const value = that.valueInput.val();
        if ($.type(value) === CONSTANTS.STRING && value.length) {
            // an empty string cannot be parsed
            try {
                // try JSON for complex objects/arrays
                data.value = JSON.parse(value);
            } catch (ex) {
                dfd.reject(new Error(options.messages.jsonError));
                return dfd.promise();
            }
        }

        data.solution =
            $.type(options.solution) === CONSTANTS.STRING
                ? JSON.parse(options.solution)
                : options.solution;

        // avoid error when calling all.val_<id>
        data.all = {}; // TODO: detect when all is required and disable test

        // Build teh web worker
        const worker = new window.Worker(blobURL);
        worker.onmessage = function(e) {
            dfd.resolve(e.data);
            window.URL.revokeObjectURL(blobURL);
        };
        worker.onerror = function(e) {
            // e is an ErrorEvent with e.message, e.filename, e.lineno and e.colno
            dfd.reject(e);
            window.URL.revokeObjectURL(blobURL);
        };
        worker.postMessage(JSON.stringify(data)); // Start the worker.

        // Terminate the worker on timeOut
        if ($.type(options.timeOut) === CONSTANTS.NUMBER) {
            setTimeout(() => {
                if (dfd.state() === 'pending') {
                    dfd.reject(new Error(options.timeoutError));
                    worker.terminate();
                    window.URL.revokeObjectURL(blobURL);
                }
            }, options.timeOut);
        }

        return dfd.promise();
    },

    /**
     * Display result (success, failure, omit)
     * @param xhr
     * @param status
     * @param error
     * @private
     */
    _showResult(result) {
        const that = this;
        const { options } = that;
        that._lines = undefined;
        if ($.type(result) === CONSTANTS.UNDEFINED) {
            that.messageWrap.append(
                template(MESSAGE_TMPL)({
                    type: 'warning',
                    message: options.messages.omit
                })
            );
        } else if (result === true) {
            that.messageWrap.append(
                template(MESSAGE_TMPL)({
                    type: 'success',
                    message: options.messages.success
                })
            );
        } else if (result === false) {
            that.messageWrap.append(
                template(MESSAGE_TMPL)({
                    type: 'info',
                    message: options.messages.failure
                })
            );
        }
        setTimeout(() => {
            if (that.messageWrap instanceof $) {
                // Note: that.messageWrap might no more exist if the codeeditor has been closed in the meantime
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
    _showError(xhr, status, error) {
        const that = this;
        const { options } = that;

        that.messageWrap.append(
            template(MESSAGE_TMPL)({
                type: 'error',
                message: options.messages.error
            })
        );

        if (!(that.tooltip instanceof Tooltip)) {
            that.tooltip = that.messageWrap.kendoTooltip({
                filter: '.k-notification-error',
                position: 'top',
                content(e) {
                    if (xhr instanceof window.ErrorEvent) {
                        // This is an error in the worker code
                        return `${xhr.message} at ${xhr.lineno -
                            that._lines -
                            1}:${xhr.colno}`;
                    }
                    if (xhr instanceof Error) {
                        return xhr.message;
                    }
                    if (xhr && status /* && error */) {
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
    _dataSource() {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        const that = this;

        // returns the datasource OR creates one if using array or configuration
        that.dataSource = DataSource.create(that.options.dataSource);

        // Pass dataSource to dropDownList
        that.dropDownList.setDataSource(that.dataSource);
    },

    /**
     * sets the dataSource for source binding
     * @param dataSource
     */
    setDataSource(dataSource) {
        const that = this;
        // set the internal datasource equal to the one passed in by MVVM
        that.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        that._dataSource();
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const wrapper = that.wrapper;
        // Unbind events
        if (that.codeMirror instanceof CodeMirror) {
            that.codeMirror.off(BEFORECHANGE);
            that.codeMirror.off(CONSTANTS.CHANGE);
        }
        if (that.paramInput instanceof $) {
            that.paramInput.off(NS);
        }
        if (that.testButton instanceof $) {
            that.testButton.off(NS);
        }
        // kendo.unbind(wrapper);
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
        DataBoundWidget.fn.destroy.call(that);
        destroy(wrapper);
        // Remove widget class
        // wrapper.removeClass(WIDGET_CLASS);
    }
});

/**
 * Registration
 */
plugin(CodeEditor);
