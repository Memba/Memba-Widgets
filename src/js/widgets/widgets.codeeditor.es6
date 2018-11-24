/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add a kendo.ui.validator - https://github.com/kidoju/Kidoju-Widgets/issues/158
// TODO Add testing of user value against solution
// TODO Max lines/size of code
// TODO Use solutionadapter to make a value editor
// TODO Limit size of code
// TODO Get the component().page() to build all properly for tests or disable tests with all

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.binder';
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
import {
    isCustomFormula,
    stringifyLibraryItem,
    parseLibraryItem,
    VALIDATION_CUSTOM
} from '../tools/util.libraries.es6';
import poolExec from '../workers/workers.exec.es6';

const {
    bind,
    data: { DataSource },
    destroy,
    format,
    guid,
    observable,
    Observable,
    template,
    ui: { DataBoundWidget, DropDownList, plugin, Tooltip },
    unbind,
    widgetInstance
} = window.kendo;
const logger = new Logger('widgets.codeeditor');
const NS = '.kendoCodeEditor';
const WIDGET_CLASS = 'k-widget kj-codeeditor';
const LABEL_TMPL = '<label><span>{0}</span></label>';
const BUTTON_TMPL =
    '<button class="k-button"><span class="k-icon k-i-play"></span>&nbsp;{0}</button>';
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
        name: 'CodeEditor',
        autoBind: true,
        enabled: true,
        dataSource: [],
        custom: 'custom',
        default: '// equal',
        solution: null, // TODO Solution Adapter editor --> component
        value: null, // Not the value to test, but the widget value for MVVM bindings
        messages: {
            formula: 'Formula:',
            notApplicable: 'N/A',
            solution: 'Solution:',
            params: 'Params:',
            value: 'Value:',
            test: 'Test',
            success: 'Success',
            failure: 'Failure',
            omit: 'Omit',
            error: 'Error'
        }
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

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
            this._value =
                $.type(value) === CONSTANTS.STRING
                    ? value
                    : this.options.default;
            if (
                this.dataSource instanceof DataSource &&
                this.dataSource.total()
            ) {
                this.refresh();
            }
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        this.wrapper = this.element.addClass(WIDGET_CLASS);
        this._setHeader();
        this._setCodeMirror();
        this._setFooter();
    },

    /**
     * Set drop down list with code library and params input
     * @private
     */
    _setHeader() {
        const { autoBind, dataSource, messages, solution } = this.options;
        const header = $(`<${CONSTANTS.DIV}/>`)
            .addClass('k-header kj-codeeditor-header')
            .appendTo(this.element);

        // Formula container and label
        const formulaWrapper = $(`<${CONSTANTS.DIV}/>`).appendTo(header);
        const formulaLabel = $(format(LABEL_TMPL, messages.formula)).appendTo(
            formulaWrapper
        );

        // Add formula dropDownList
        this.dropDownList = $(`<${CONSTANTS.SELECT}/>`)
            .appendTo(formulaLabel)
            .kendoDropDownList({
                autoBind,
                autoWidth: true,
                change: this._onUserInputChange.bind(this),
                dataBound: () => this.value(this.options.value),
                dataTextField: 'name',
                dataValueField: 'key',
                dataSource
            })
            .data('kendoDropDownList');

        // Solution container and label
        this.solutionWrapper = $(`<${CONSTANTS.DIV}/>`).appendTo(header);
        const solutionLabel = $(format(LABEL_TMPL, messages.solution)).appendTo(
            this.solutionWrapper
        );

        // Add solution readonly input
        $(`<${CONSTANTS.INPUT}>`)
            .addClass('k-textbox k-state-disabled')
            .prop('disabled', true)
            .val(
                // TODO: Review to provide a better solution editor
                $.type(solution) === CONSTANTS.STRING
                    ? solution
                    : JSON.stringify(solution)
            )
            .appendTo(solutionLabel);

        // Param container and label
        this.paramsWrapper = $(`<${CONSTANTS.DIV}/>`).appendTo(header);
        const paramsLabel = $(format(LABEL_TMPL, messages.params)).appendTo(
            this.paramsWrapper
        );
        this.paramsContainer = $(`<${CONSTANTS.DIV}/>`)
            .css({ display: 'inline', width: '100%' })
            .appendTo(paramsLabel);
    },

    /**
     * Set CodeMirror editor
     * @private
     */
    _setCodeMirror() {
        const div = $(`<${CONSTANTS.DIV}/>`)
            .addClass('kj-codeeditor-editor')
            .appendTo(this.element);

        // Initialize JSHINT
        window.JSHINT = window.JSHINT || JSHINT;

        // Initialize CodeMirror
        this.codeMirror = CodeMirror(div.get(0), {
            gutters: ['CodeMirror-lint-markers'],
            lineNumbers: true,
            lint: true,
            mode: 'javascript',
            value: ''
        });

        // Prevent from modifying first lines and last line
        this.codeMirror.on(CONSTANTS.BEFORECHANGE, (cm, change) => {
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
        this.codeMirror.on(
            CONSTANTS.CHANGE,
            this._onUserInputChange.bind(this)
        );

        // Otherwise gutters and line numbers might be misaligned
        this.codeMirror.refresh();
    },

    /**
     * Set value input and test buttons
     * @private
     */
    _setFooter() {
        const {
            options: { messages }
        } = this;

        const footer = $(`<${CONSTANTS.DIV}/>`)
            .addClass('k-header kj-codeeditor-footer')
            .appendTo(this.element);

        // Add value container and label
        const valueWrapper = $(`<${CONSTANTS.DIV}/>`).appendTo(footer);
        const valueLabel = $(format(LABEL_TMPL, messages.value)).appendTo(
            valueWrapper
        );

        // Add value input field
        // TODO use component SolutionAdapter
        this.valueInput = $(`<${CONSTANTS.INPUT}>`)
            .addClass('k-textbox')
            .appendTo(valueLabel);

        // Add test container and label
        const testWrapper = $(`<${CONSTANTS.DIV}/>`).appendTo(footer);

        // Add test button
        this.testButton = $(format(BUTTON_TMPL, messages.test)).appendTo(
            testWrapper
        );

        // Add message block for test result
        this.messageWrapper = $(`<${CONSTANTS.DIV}/>`)
            .addClass('kj-codeeditor-message')
            .appendTo(testWrapper);
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

        // returns the datasource OR creates one if using array or configuration
        this.dataSource = DataSource.create(this.options.dataSource);

        // Pass dataSource to dropDownList
        this.dropDownList.setDataSource(this.dataSource);
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
     * Enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        // Header
        this.dropDownList.enable(enabled);
        this.paramsWrapper.find('*').each((index, item) => {
            const element = $(item);
            const widget = widgetInstance(element);
            if (widget && $.isFunction(widget.enable)) {
                widget.enable(enabled);
            } else if (
                element.is(CONSTANTS.INPUT) ||
                element.is(CONSTANTS.SELECT) ||
                element.is(CONSTANTS.TEXTAREA)
            ) {
                element
                    .prop({ disabled: !enabled })
                    .toggleClass(CONSTANTS.DISABLED_CLASS, !enabled);
            }
        });

        // CodeMirror
        this.codeMirror.setOption('readOnly', enabled ? false : 'nocursor');

        // Footer
        this.valueInput // TODO Use SolutionAdapter
            .prop({ disabled: !enabled })
            .toggleClass(CONSTANTS.DISABLED_CLASS, !enabled);
        this.testButton.toggleClass(CONSTANTS.DISABLED_CLASS, !enabled).off(NS);
        if (enabled) {
            this.testButton.on(
                `${CONSTANTS.CLICK}${NS}`,
                this._onTestButtonClick.bind(this)
            );
        }
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
        assert.instanceof(
            $,
            this.paramsWrapper,
            assert.format(
                assert.messages.instanceof.default,
                'this.paramsWrapper',
                'jQuery'
            )
        );

        const value = this.value() || '';

        // Any changes should remove any pending message
        this.messageWrapper.empty();

        // Clear param editor
        unbind(this.paramsContainer);
        destroy(this.paramsContainer);
        if (this.viewModel instanceof Observable) {
            this.viewModel.unbind(CONSTANTS.CHANGE);
        }
        this.viewModel = undefined;
        this.paramsContainer.empty();

        if (isCustomFormula(value)) {
            // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
            this.dropDownList.text(this.options.custom);

            if (this.codeMirror.getDoc().getValue() !== this._value) {
                this.codeMirror.getDoc().setValue(this._value);
            }
        } else {
            const { options } = this;
            const library = this.dataSource.data();
            // Otherwise, search the library
            let parsed = parseLibraryItem(value, library);
            if ($.type(parsed.item) === CONSTANTS.UNDEFINED) {
                // and use default if not found
                parsed = parseLibraryItem(options.default, library);
                assert.type(
                    CONSTANTS.OBJECT,
                    parsed.item,
                    `\`${options.default}\` is expected to exist in the library`
                );
            }

            const { item, params } = parsed;

            // Reset value in case the original value could not be found and we had to fallback to default
            this._value = stringifyLibraryItem(item, params);

            this.dropDownList.value(item.key);

            // Show/hide params editor when required
            if ($.isFunction(item.editor)) {
                this.viewModel = observable({ params });
                this.viewModel.bind(
                    CONSTANTS.CHANGE,
                    this._onUserInputChange.bind(this)
                );
                item.editor(this.paramsContainer, {
                    field: 'params'
                });
                bind(this.paramsContainer, this.viewModel);
                this.paramsWrapper.show();
                this.solutionWrapper.hide();
            } else {
                this.paramsWrapper.hide();
                this.solutionWrapper.show();
            }

            // Update CodeMirror with code if required
            const code = item.formula;
            if (this.codeMirror.getDoc().getValue() !== code) {
                this.codeMirror.getDoc().setValue(code);
            }
        }

        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Event handler executed when changing the value of the drop down list
     * or the value of validation param in the editor
     * @private
     */
    _onUserInputChange(e, change) {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        const item = this.dropDownList.dataItem();
        if (item) {
            if ($.isPlainObject(e) && e.sender) {
                // Change value in drop down list or params viewModel
                let params;
                if (this.viewModel instanceof Observable) {
                    params = this.viewModel.get('params');
                }
                this.value(stringifyLibraryItem(item, params));
                this.trigger(CONSTANTS.CHANGE);
            } else if (
                e instanceof CodeMirror &&
                change.origin !== 'setValue'
            ) {
                // Change value in CodeMirror (not using the setValue API)
                if (item.key === this.options.custom) {
                    this.value(this.codeMirror.getDoc().getValue());
                } else {
                    const code = this.codeMirror.getDoc().getValue();
                    const cursor = this.codeMirror.getDoc().getCursor();
                    const lines = code.split('\n');
                    [lines[0]] = VALIDATION_CUSTOM.split('\n');
                    this.value(lines.join('\n'));
                    this.codeMirror.getDoc().setCursor(cursor);
                }
                this.trigger(CONSTANTS.CHANGE);
            }
        }
    },

    /**
     * Event handler for clicking the text button
     * @private
     */
    _onTestButtonClick() {
        const { options } = this;
        const code = this.codeMirror.getDoc().getValue();
        const item = this.dropDownList.dataItem();
        const data = {};

        // TODO: Use SolutionAdapter to enter value
        data.value = this.valueInput.val();

        if ($.isFunction(item.editor)) {
            data.solution = this.viewModel.get('params');
        } else {
            data.solution =
                $.type(options.solution) === CONSTANTS.STRING
                    ? JSON.parse(options.solution)
                    : options.solution;
        }

        // avoid error when calling all.val_<id>
        data.all = {};

        // Send to poolExec
        poolExec(code, data, guid())
            .then(this._showResult.bind(this))
            .catch(this._showError.bind(this));
    },

    /**
     * Display result (success, failure, omit)
     * @param res
     * @private
     */
    _showResult(res) {
        const { messages } = this.options;
        this.messageWrapper.empty();
        if (
            $.type(res.result) === CONSTANTS.UNDEFINED ||
            $.type(res.result) === CONSTANTS.NULL
        ) {
            this.messageWrapper.append(
                template(MESSAGE_TMPL)({
                    type: 'warning',
                    message: messages.omit
                })
            );
        } else if (res.result === true) {
            this.messageWrapper.append(
                template(MESSAGE_TMPL)({
                    type: 'success',
                    message: messages.success
                })
            );
        } else if (res.result === false) {
            this.messageWrapper.append(
                template(MESSAGE_TMPL)({
                    type: 'info',
                    message: messages.failure
                })
            );
        }
        const that = this;
        setTimeout(() => {
            if (that.messageWrapper instanceof $) {
                // Note: that.messageWrapper might no more exist
                // if the codeeditor has been closed in the meantime
                that.messageWrapper.empty();
            }
        }, 5000);
    },

    /**
     * Display error
     * @param error
     * @private
     */
    _showError(error) {
        const { messages } = this.options;
        this.messageWrapper.empty();
        this.messageWrapper.append(
            $(
                template(MESSAGE_TMPL)({
                    type: 'error',
                    message: messages.error
                })
            ).attr({ title: error.message })
        );

        if (!(this.tooltip instanceof Tooltip)) {
            this.tooltip = this.messageWrapper.kendoTooltip({
                filter: '.k-notification-error',
                position: 'top',
                width: 250
            });
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // Unbind events
        if (this.dropDownList instanceof DropDownList) {
            this.dropDownList.destroy();
            this.dropDownList = undefined;
        }
        if (this.viewModel instanceof Observable) {
            this.viewModel.unbind(CONSTANTS.CHANGE);
            this.viewModel = undefined;
        }
        if (this.codeMirror instanceof CodeMirror) {
            this.codeMirror.off(CONSTANTS.BEFORECHANGE);
            this.codeMirror.off(CONSTANTS.CHANGE);
        }
        if (this.testButton instanceof $) {
            this.testButton.off(NS);
        }
        if (this.tooltip instanceof Tooltip) {
            this.tooltip.destroy();
            this.tooltip = undefined;
        }
        // Destroy kendo
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
        // Log
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(CodeEditor);
