/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add easy way to set value to solution to check simple things like // equal
// TODO Max lines/size of code - Limit size of code
// TODO Use solutionadapter to make a value editor (add solution editors)
// TODO Get the component().page() to build all properly for tests or disable tests with all
// TODO show solution, value and params JSON in tooltip
// TODO Add contextual menu to CodeMirror with all.*
// TODO FIx issue with CodeMirror scroll bars (especially horizontal)
// TODOAdd icons and tooltips to diaply teh content of value, params and solution as passed to validation

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
import { PageComponent } from '../data/data.pagecomponent.es6';
import tools from '../tools/tools.es6';
import TOOLS from '../tools/util.constants.es6';
import optimizeEditor from '../tools/util.editors.es6';
import {
    // getLibraryItemKey,
    isCustomFormula,
    stringifyLibraryItem,
    parseLibraryItem,
} from '../tools/util.libraries.es6';
import poolExec from '../workers/workers.exec.es6';

const {
    bind,
    data: { DataSource },
    destroy,
    format,
    getter,
    guid,
    observable,
    Observable,
    template,
    ui: { DataBoundWidget, DropDownList, plugin, Tooltip },
    unbind,
    widgetInstance,
} = window.kendo;
const logger = new Logger('widgets.codeeditor');
const NS = '.kendoCodeEditor';
const WIDGET_CLASS = 'k-widget kj-codeeditor';
const EDITOR_CLASS = 'kj-codeeditor-editor';
const MESSAGE_CLASS = 'kj-codeeditor-message';
const NOTIFICATION_CLASS = 'kj-codeeditor-notification';
const PANEL_CLASS = 'kj-codeeditor-panel';
const LABEL_TMPL =
    '<div class="k-edit-label"><label for="{0}">{1}</label></div>';
const CODE_TMPL = '<span class="k-icon k-i-js"/>';
const FIELD_TMPL = '<div class="k-edit-field" data-container-for="{0}"/>';
const BUTTON_TMPL =
    '<button class="k-button k-primary"><span class="k-icon k-i-{0}"></span>&nbsp;{1}</button>';
const NOTIFICATION_TMPL =
    '<div class="k-widget k-notification k-notification-#: type #" data-role="alert">' +
    '<div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div>' +
    '</div>';
const MESSAGE_TMPL = '<div class="k-block k-error-colored">#: message #</div>';
const TOOLTIP_TMPL = '<pre class="kj-codeeditor-json">{0}</pre>';
const SOLUTION_PROP = 'properties.solution';
const VALIDATION_PROP = 'properties.validation';

/**
 * JSHINT needs to be global for ./src/js/vendor/codemirror/addon/lint/javascript-lint.js
 */
if (!window.JSHINT) {
    // With WebPack, the module is not loaded as global
    window.JSHINT = JSHINT.JSHINT;
}

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
    init(element, options = {}) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this._dataSource();
        this.value(this.options.value);
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
        value: null, // Not the value entered for testing, but the widget value for MVVM bindings
        messages: {
            // custom: 'Custom',
            formula: 'Formula:',
            solution: 'Solution:',
            params: 'Params:',
            value: 'Value:',
            test: 'Test',
            success: 'Success',
            failure: 'Failure',
            omit: 'Omit',
            error: 'Error',
        },
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
        assert.nullableInstanceOrUndef(
            PageComponent,
            value,
            assert.format(
                assert.messages.nullableInstanceOrUndef.default,
                'value',
                'PageComponent'
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (value instanceof PageComponent && value !== this._value) {
            if ($.isFunction(this._changeHandler)) {
                this._value.unbind(CONSTANTS.CHANGE, this._changeHandler);
            }
            this._value = value;
            this._changeHandler = this._onValueChange.bind(this);
            this._value.bind(CONSTANTS.CHANGE, this._changeHandler);
            this.refresh();
        }
        return ret;
    },

    /**
     * Event handler triggered especially when this._value.properties.validation changes
     * @param e
     * @private
     */
    _onValueChange(e) {
        if (e.field === VALIDATION_PROP) {
            // debugger;
        }
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        this.wrapper = this.element.addClass(WIDGET_CLASS);
        this._setControlPanel();
        this._setCodeMirror();
    },

    /**
     * Set control panel on the left
     * @private
     */
    _setControlPanel() {
        const {
            element,
            options: { autoBind, dataSource, messages },
        } = this;
        const panel = $(`<${CONSTANTS.DIV}/>`)
            .addClass(`${PANEL_CLASS} k-edit-form-container`)
            .appendTo(element);

        // Add formula drop down list
        $(format(LABEL_TMPL, 'formula', messages.formula)).appendTo(panel);
        const container = $(format(FIELD_TMPL, 'formula')).appendTo(panel);
        this.dropDownList = $(`<${CONSTANTS.SELECT}/>`)
            .appendTo(container)
            .kendoDropDownList({
                autoBind,
                autoWidth: true,
                change: this._onDropDownListChange.bind(this),
                // dataBound: () => this.value(this.options.value),
                dataTextField: 'name',
                dataValueField: 'key',
                dataSource,
            })
            .data('kendoDropDownList');

        // Add solution
        $(format(LABEL_TMPL, 'solution', messages.solution))
            .append(CODE_TMPL)
            .appendTo(panel);
        $(format(FIELD_TMPL, 'solution')).appendTo(panel);

        // Add params (dynamically added when refreshing)
        $(format(LABEL_TMPL, 'params', messages.params))
            .append(CODE_TMPL)
            .appendTo(panel);
        $(format(FIELD_TMPL, 'params')).appendTo(panel);

        // Add test value
        $(format(LABEL_TMPL, 'value', messages.value))
            .append(CODE_TMPL)
            .appendTo(panel);
        $(format(FIELD_TMPL, 'value')).appendTo(panel);

        // Add test button and notification
        const wrapper = $(`<${CONSTANTS.DIV}/>`)
            .addClass('k-edit-buttons')
            .appendTo(panel);
        this.testButton = $(
            format(BUTTON_TMPL, 'play', messages.test)
        ).appendTo(wrapper);
        $(`<${CONSTANTS.DIV}/>`).addClass(NOTIFICATION_CLASS).appendTo(wrapper);
        $(`<${CONSTANTS.DIV}/>`).addClass(MESSAGE_CLASS).appendTo(panel);

        this.tooltip = panel.kendoTooltip({
            filter: '.k-i-js',
            position: 'right',
            content: (e) => {
                const field = e.target
                    .closest('.k-edit-label')
                    .children('label')
                    .attr('for');
                return format(
                    TOOLTIP_TMPL,
                    JSON.stringify(this.viewModel.get(field), null, 2)
                );
            },
        });
    },

    /**
     * Event handler executed when changing the value of the drop down list
     * @param e
     * @private
     */
    _onDropDownListChange(e) {
        const { dropDownList } = this;
        assert.instanceof(
            DropDownList,
            dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        const item = dropDownList.dataItem();
        if (item && $.isPlainObject(e) && e.sender) {
            // Change value in drop down list or params viewModel
            let params;
            if (this.viewModel instanceof Observable) {
                params = this.viewModel.get('params');
            }
            // if (this._value instanceof PageComponent) {
            this._value.set(
                VALIDATION_PROP,
                stringifyLibraryItem(item, params)
            );
            this.refresh();
            // }
            this.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Set CodeMirror editor
     * @private
     */
    _setCodeMirror() {
        const panel = $(`<${CONSTANTS.DIV}/>`)
            .addClass(EDITOR_CLASS)
            .appendTo(this.element);

        // Initialize JSHINT
        window.JSHINT = window.JSHINT || JSHINT;

        // Initialize CodeMirror
        this.codeMirror = CodeMirror(panel.get(0), {
            gutters: ['CodeMirror-lint-markers'],
            lineNumbers: true,
            lint: true,
            mode: 'javascript',
            value: '',
        });

        // Prevent from modifying first lines and last line
        this.codeMirror.on(
            CONSTANTS.BEFORECHANGE,
            this._onCodeMirrorBeforeChange.bind(this)
        );

        // Synchronize drop down list with code editor to display `custom` upon any change
        this.codeMirror.on(
            CONSTANTS.CHANGE,
            this._onCodeMirrorChange.bind(this)
        );

        // Otherwise gutters and line numbers might be misaligned
        this.codeMirror.refresh();
    },

    /**
     * Event handler triggered before making changes in CodeMirror
     * Note: Captures key inputs before making changes in the editor
     * @param cm
     * @param change
     * @private
     */
    _onCodeMirrorBeforeChange(cm, change) {
        if (change.origin === 'setValue') {
            return;
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
    },

    /**
     * Event handler triggered after making changes in CodeMirror
     * @param cm
     * @param change
     * @private
     */
    _onCodeMirrorChange(cm, change = {}) {
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
            cm,
            assert.format(
                assert.messages.instanceof.default,
                'cm',
                'CodeMirror'
            )
        );
        // Reset notification and message
        this._getErrorMessageWrapper();
        this._getNotificationWrapper();
        const item = this.dropDownList.dataItem();
        if (item && change.origin !== 'setValue') {
            if (item.key === this.options.custom) {
                // Changing a custom formula
                this._value.set(
                    VALIDATION_PROP,
                    this.codeMirror.getDoc().getValue()
                );
                // No need to refresh control panel
                // this.refresh();
            } else {
                // Changing a library item (revert to custom)
                const formula = this.codeMirror.getDoc().getValue();
                const cursor = this.codeMirror.getDoc().getCursor();
                const lines = formula.split('\n');
                [lines[0]] = TOOLS.VALIDATION_CUSTOM.split('\n');
                this._value.set(VALIDATION_PROP, lines.join('\n'));
                this.refresh();
                this.codeMirror.getDoc().setCursor(cursor);
            }
            this.trigger(CONSTANTS.CHANGE);
        }
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
        // Control panel
        const panel = this.element.find(`${CONSTANTS.DOT}${PANEL_CLASS}`);
        panel.find('*').each((index, item) => {
            const element = $(item);
            const isSolution =
                element.closest('.k-edit-field').attr('data-container-for') ===
                'solution';
            const widget = widgetInstance(element);
            if (widget && $.isFunction(widget.enable)) {
                widget.enable(enabled && !isSolution);
            } else if (
                element.is(CONSTANTS.INPUT) ||
                element.is(CONSTANTS.SELECT) ||
                element.is(CONSTANTS.TEXTAREA)
            ) {
                element
                    .prop({ disabled: !enabled || isSolution })
                    .toggleClass(
                        CONSTANTS.DISABLED_CLASS,
                        !enabled || isSolution
                    );
            }
        });
        this.testButton.toggleClass(CONSTANTS.DISABLED_CLASS, !enabled).off(NS);
        if (enabled) {
            this.testButton.on(
                `${CONSTANTS.CLICK}${NS}`,
                this._onTestButtonClick.bind(this)
            );
        }

        // CodeMirror
        this.codeMirror.setOption('readOnly', enabled ? false : 'nocursor');
    },

    /**
     * refresh UI
     * @private
     */
    refresh(/* e */) {
        let item;
        let params;
        const validation = getter(VALIDATION_PROP)(this._value);
        if (!isCustomFormula(validation)) {
            // Search the library
            const library = this.dataSource.data();
            const parsed = parseLibraryItem(validation, library);
            ({ item, params } = parsed);
        }

        // Set drop down list value
        if (item) {
            this._setDropDownListValue(item.key);
        } else {
            // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
            this._setDropDownListValue(this.options.custom);
        }

        // Reset value in case the original value could not be found and we had to fallback to default
        // TODO this._value.set(VALIDATION_PROP, stringifyLibraryItem(item, params));

        // Reset viewModel
        this._resetViewModel();
        // Set solution container
        this._setSolutionContainer(item);
        // Set params container
        this._setParamsContainer(item);
        // Set value container
        this._setValueContainer(item);
        // Reset test message
        this._getNotificationWrapper();
        this._getErrorMessageWrapper();
        // Bind viewModel
        this._bindViewModel(item, params);
        // Set CodeMirror value
        if (item) {
            // Update CodeMirror with code if required
            this._setCodeMirrorValue(item.formula);
        } else {
            this._setCodeMirrorValue(validation);
        }
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Return field container
     * @param field
     * @returns {*}
     * @private
     */
    _getContainer(field) {
        assert.type(
            CONSTANTS.STRING,
            field,
            assert.format(
                assert.messages.type.default,
                'field',
                CONSTANTS.STRING
            )
        );
        const container = this.element.find(
            `${CONSTANTS.DOT}${PANEL_CLASS} .k-edit-field[data-container-for="${field}"]`
        );
        return container;
    },

    /**
     * Set field visibility
     * @param field
     * @param visible
     * @private
     */
    _setVisibility(field, visible) {
        assert.type(
            CONSTANTS.STRING,
            field,
            assert.format(
                assert.messages.type.default,
                'field',
                CONSTANTS.STRING
            )
        );
        assert.type(
            CONSTANTS.BOOLEAN,
            visible,
            assert.format(
                assert.messages.type.default,
                'visible',
                CONSTANTS.BOOLEAN
            )
        );
        this.element
            .find(`label[for="${field}"]`)
            .closest('.k-edit-label')
            .toggle(visible);
        this.element
            .find(`.k-edit-field[data-container-for="${field}"]`)
            .toggle(visible);
    },

    /**
     * Reset view model
     * @private
     */
    _resetViewModel() {
        if (this.viewModel instanceof Observable) {
            this.viewModel.unbind(CONSTANTS.CHANGE);
        }
        // solution
        let container = this._getContainer('solution');
        unbind(container);
        destroy(container);
        // params
        container = this._getContainer('params');
        unbind(container);
        destroy(container);
        // value
        container = this._getContainer('value');
        unbind(container);
        destroy(container);
        this.viewModel = undefined;
    },

    /**
     * Bind view Model
     * @private
     */
    _bindViewModel(item, params) {
        // const tool = tools(this._value.tool);
        // const solution = getter(SOLUTION_PROP)(tool).getField();
        const solution = getter(SOLUTION_PROP)(this._value);
        let value;
        if (solution && $.isFunction(solution.toJSON)) {
            value = solution.toJSON();
        } else if (solution && $.isFunction(solution.slice)) {
            value = solution.slice();
        } else {
            value = solution;
        }
        this.viewModel = observable({ params, solution, value });
        /*
        this.viewModel.bind(
            CONSTANTS.CHANGE,
            this._onDropDownListChange.bind(this)
        );
         */
        // solution
        let container = this._getContainer('solution');
        bind(container, this.viewModel);
        // params
        container = this._getContainer('params');
        bind(container, this.viewModel);
        // value
        container = this._getContainer('value');
        bind(container, this.viewModel);
    },

    /**
     * Set drop down list
     * @param value
     * @private
     */
    _setDropDownListValue(value) {
        const { dropDownList } = this;
        assert.instanceof(
            DropDownList,
            dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        dropDownList.value(value);
    },

    /**
     * Set solution container
     * @private
     */
    _setSolutionContainer(item) {
        const container = this._getContainer('solution');
        const tool = tools(this._value.tool);
        const row = getter(SOLUTION_PROP)(tool).getRow('solution');
        row.editable = true;
        row.model = this._value;
        optimizeEditor(row);
        // Empty container
        container.empty();
        if (item && $.isFunction(item.editor)) {
            this._setVisibility('solution', false);
        } else {
            // const el = row.editor(container, row);
            row.editor(container, row);
            this._setVisibility('solution', true);
            // Note: At this stage, viewModel needs to be bound
        }
    },

    /**
     * Set params container
     * @private
     */
    _setParamsContainer(item) {
        const container = this._getContainer('params');
        // Empty container
        container.empty();
        // Show/hide params editor when required
        if (item && $.isFunction(item.editor)) {
            item.editor(container, { field: 'params' });
            this._setVisibility('params', true);
        } else {
            this._setVisibility('params', false);
        }
    },

    /**
     * Set value container
     * @private
     */
    _setValueContainer() {
        const container = this._getContainer('value');
        const tool = tools(this._value.tool);
        const row = getter(SOLUTION_PROP)(tool).getRow('value');
        row.editable = true;
        row.model = this._value;
        optimizeEditor(row);
        // Empty container
        container.empty();
        // const el = row.editor(container, row);
        row.editor(container, row);
        // Note: At this stage, viewModel needs to be bound
    },

    /**
     * Get notification wrapper
     * @private
     */
    _getNotificationWrapper() {
        // Any changes should remove any pending message
        return this.element
            .find(`${CONSTANTS.DOT}${NOTIFICATION_CLASS}`)
            .empty();
    },

    /**
     * Get error message wrapper
     * @private
     */
    _getErrorMessageWrapper() {
        // Any changes should remove any pending message
        return this.element.find(`${CONSTANTS.DOT}${MESSAGE_CLASS}`).empty();
    },

    /**
     * Set CodeMirror value
     * @param value
     * @private
     */
    _setCodeMirrorValue(value) {
        const { codeMirror } = this;
        assert.instanceof(
            CodeMirror,
            codeMirror,
            assert.format(
                assert.messages.instanceof.default,
                'this.codeMirror',
                'CodeMirror'
            )
        );
        assert.type(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.type.default,
                'value',
                CONSTANTS.STRING
            )
        );
        if (codeMirror.getDoc().getValue() !== value) {
            codeMirror.getDoc().setValue(value);
        }
    },

    /**
     * Event handler for clicking the text button
     * @private
     */
    _onTestButtonClick() {
        const code = this.codeMirror.getDoc().getValue();
        const item = this.dropDownList.dataItem();
        const data = {};

        data.value = this.viewModel.get('value');
        data.solution =
            item && $.isFunction(item.editor)
                ? this.viewModel.get('params')
                : this.viewModel.get('solution');
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
        const wrapper = this._getNotificationWrapper();
        if (
            $.type(res.result) === CONSTANTS.UNDEFINED ||
            $.type(res.result) === CONSTANTS.NULL
        ) {
            wrapper.append(
                template(NOTIFICATION_TMPL)({
                    type: 'warning',
                    message: messages.omit,
                })
            );
        } else if (res.result === true) {
            wrapper.append(
                template(NOTIFICATION_TMPL)({
                    type: 'success',
                    message: messages.success,
                })
            );
        } else if (res.result === false) {
            wrapper.append(
                template(NOTIFICATION_TMPL)({
                    type: 'info',
                    message: messages.failure,
                })
            );
        }
        setTimeout(() => {
            wrapper.empty();
        }, 5000);
    },

    /**
     * Display error
     * @param error
     * @private
     */
    _showError(error) {
        const { messages } = this.options;
        this._getNotificationWrapper().append(
            template(NOTIFICATION_TMPL)({
                type: 'error',
                message: messages.error,
            })
        );
        this._getErrorMessageWrapper().append(template(MESSAGE_TMPL)(error));
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        DataBoundWidget.fn.destroy.call(this);
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
            this.codeMirror = undefined;
        }
        if (this.testButton instanceof $) {
            this.testButton.off(NS);
            this.testButton = undefined;
        }
        if (this.tooltip instanceof Tooltip) {
            this.tooltip.destroy();
            this.tooltip = undefined;
        }
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'CodeEditor')) {
    // Prevents loading several times in karma
    plugin(CodeEditor);
}
