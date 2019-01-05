/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.binder';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    isCustomFormula,
    parseLibraryItem,
    stringifyLibraryItem
} from '../tools/util.libraries.es6';
import CodeMirror from '../vendor/codemirror/lib/codemirror';

const {
    bind,
    data: { DataSource },
    destroy,
    observable,
    Observable,
    ui: { DropDownList, plugin, DataBoundWidget },
    unbind,
    widgetInstance
} = window.kendo;
const logger = new Logger('widgets.codeinput');
const NS = '.kendoCodeInput';
const WIDGET_CLASS = /* 'k-widget */ 'kj-codeinput';

/**
 * CodeInput
 * Displays as a drop down list when value is // xxxxx refering to a library formula
 * Displays as an readonly input containing the word "custom" when value is a validate custom function
 * IMPORTANT: this is not the value that is displayed: it is either `custom` or value stripped of `// `
 * @class CodeInput
 * @extends DataBoundWidget
 */
const CodeInput = DataBoundWidget.extend({
    /**
     * Constructor
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
        name: 'CodeInput',
        autoBind: true,
        enabled: true,
        dataSource: [],
        custom: 'custom',
        default: '// equal',
        value: null
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value for MVVM binding
     * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
     * @method value
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
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element.addClass(WIDGET_CLASS);

        // Static input showing `Custom`
        this.customInput = $(
            '<input class="k-textbox k-state-disabled" disabled>'
        )
            .width('100%')
            .val(options.custom)
            .appendTo(element);

        // Drop down list to choose from library
        this.dropDownList = $(`<${CONSTANTS.SELECT}/>`)
            .width('100%')
            .appendTo(element)
            .kendoDropDownList({
                autoBind: options.autoBind,
                autoWidth: true,
                change: this._onUserInputChange.bind(this),
                dataBound: () => this.value(this.options.value),
                dataTextField: 'name',
                dataValueField: 'key',
                dataSource: options.dataSource
            })
            .data('kendoDropDownList');

        // Param editor container
        this.paramContainer = $(`<${CONSTANTS.DIV}/>`)
            .css({ marginTop: '0.25em' })
            .width('100%')
            .hide()
            .appendTo(element);
    },

    /**
     * _dataSource function to pass the dataSource to the dropDownList
     * @method _dataSource
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
     * Sets the dataSource for source binding
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
     * Enable/disable
     * @methid enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        this.dropDownList.enable(enabled);
        this.paramContainer.find('*').each((index, item) => {
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
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        assert.instanceof(
            $,
            this.customInput,
            assert.format(
                assert.messages.instanceof.default,
                'this.customInput',
                'jQuery'
            )
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
            $,
            this.paramContainer,
            assert.format(
                assert.messages.instanceof.default,
                'this.paramContainer',
                'jQuery'
            )
        );
        const value = this.value() || '';

        // Clear param editor
        unbind(this.paramContainer);
        destroy(this.paramContainer);
        if (this.viewModel instanceof Observable) {
            this.viewModel.unbind(CONSTANTS.CHANGE);
        }
        this.viewModel = undefined;
        this.paramContainer.empty().hide();

        if (isCustomFormula(value)) {
            // Hide drop down list
            this.dropDownList.text(this.options.custom);
            this.dropDownList.wrapper.hide();

            // Show custom input
            this.customInput.show();
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

            // Hide custom input
            this.customInput.hide();

            // Show drop down list
            this.dropDownList.wrapper.show();
            this.dropDownList.value(item.key);

            // Show editor when required
            if ($.isFunction(item.editor)) {
                this.viewModel = observable({ params });
                this.viewModel.bind(
                    CONSTANTS.CHANGE,
                    this._onUserInputChange.bind(this)
                );
                item.editor(this.paramContainer, { field: 'params' });
                bind(this.paramContainer, this.viewModel);
                this.paramContainer.show();
            }
        }
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Event handler executed when changing the value of the drop down list
     * or the value of validation param in the editor
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
        const item = this.dropDownList.dataItem();
        if (item) {
            if (item.key === this.options.custom) {
                this.value(item.formula);
            } else {
                let params;
                if (this.viewModel instanceof Observable) {
                    params = this.viewModel.get('params');
                }
                this.value(stringifyLibraryItem(item, params));
            }
            this.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        if (this.dropDownList instanceof DropDownList) {
            this.dropDownList.destroy();
            this.dropDownList = undefined;
        }
        if (this.viewModel instanceof Observable) {
            this.viewModel.unbind(CONSTANTS.CHANGE);
            this.viewModel = undefined;
        }
        // Destroy kendo;
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
        // Log
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(CodeInput);
