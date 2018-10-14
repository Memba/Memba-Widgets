/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import tools from '../tools/tools.es6';
import BaseTool from '../tools/tools.base.es6';

const {
    attr,
    data: { DataSource },
    destroy,
    format,
    ui: { DropDownList, plugin, DataBoundWidget }
} = window.kendo;
const logger = new Logger('widgets.codeinput');

const NS = '.kendoCodeInput';
const WIDGET_CLASS = /* 'k-widget */ 'kj-codeinput';

const LIB_COMMENT = '// ';
const RX_VALIDATION_LIBRARY = /^\/\/ ([^\s\[\n]+)( (\[[^\n]+\]))?$/;
const RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;

/**
 * CodeInput
 * Displays as a drop down list when value is // xxxxx refering to a library formula
 * Displays as an readonly input containing the word "custom" when value is a validate custom function
 * IMPORTANT: this is not the value that is displayed: it is either `custom` or value stripped of `// `
 * @class CodeInput
 * @extends widget
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
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'CodeInput',
        autoBind: true,
        dataSource: [],
        custom: 'custom',
        default: '// equal',
        nameField: 'name',
        formulaField: 'formula',
        paramField: 'param',
        value: null
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
     * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
     * @param value
     */
    value(value) {
        assert.typeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
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
        const matches = value.match(RX_VALIDATION_CUSTOM);
        if ($.isArray(matches) && matches.length === 2) {
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
        const options = this.options;
        const ret = {};
        const libraryMatches = value.match(RX_VALIDATION_LIBRARY);
        if ($.isArray(libraryMatches) && libraryMatches.length === 4) {
            const paramValue = libraryMatches[3];
            // Array.find is not available in Internet Explorer, thus the use of Array.filter
            const found = this.dataSource
                .data()
                .filter(item => item[options.nameField] === libraryMatches[1]);
            if ($.isArray(found) && found.length) {
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
     * Toggle UI for custom vs library code
     * @private
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
            this.paramInput,
            assert.format(
                assert.messages.instanceof.default,
                'this.paramInput',
                'jQuery'
            )
        );

        const that = this;
        const options = that.options;

        if (that._isCustom(that._value)) {
            // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
            that.dropDownList.text('');
            that.dropDownList.wrapper.hide();
            that.customInput.show();
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
            const paramName = parsed.item[options.paramField];
            const paramValue = parsed.paramValue;

            // Reset value in case the original value could not be found and we had to fallback to default
            that._value =
                LIB_COMMENT +
                name +
                (paramName ? ` ${JSON.stringify([paramValue])}` : '');

            that.customInput.hide();
            that.dropDownList.wrapper.show();
            that.dropDownList.text(name);

            if ($.type(paramName) === CONSTANTS.STRING && paramName.length) {
                that.paramInput
                    .attr('placeholder', paramName)
                    .val(paramValue)
                    .show();
            } else {
                that.paramInput
                    .removeAttr('placeholder')
                    .val('')
                    .hide();
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
        const options = that.options;
        that.wrapper = that.element;
        that.element.addClass(WIDGET_CLASS);

        // Static input showing `Custom`
        that.customInput = $(
            '<input class="k-textbox k-state-disabled" disabled>'
        )
            .width('100%')
            .val(options.custom)
            .appendTo(that.element);

        // Drop down list to choose from library
        that.dropDownList = $('<select/>')
            .width('100%')
            .appendTo(that.element)
            .kendoDropDownList({
                autoBind: options.autoBind,
                autoWidth: true,
                change: $.proxy(that._onUserInputChange, that),
                dataBound: $.proxy(that._initValue, that),
                dataTextField: options.nameField,
                dataValueField: options.formulaField,
                dataSource: options.dataSource
            })
            .data('kendoDropDownList');

        // Param textbox
        that.paramInput = $('<input class="k-textbox">')
            .css({ marginTop: '0.25em' })
            .width('100%')
            .hide()
            .appendTo(that.element)
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
        const options = that.options;
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
     * Enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        this.dropDownList.enable(enabled);
        this.paramInput.toggleClass(CONSTANTS.DISABLED_CLASS, !enabled);
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const wrapper = that.wrapper;
        // Unbind events
        if (that.paramInput instanceof $) {
            that.paramInput.off(NS);
        }
        kendo.unbind(wrapper);
        // Release references;
        that.dataSource = undefined;
        that.dropDownList = undefined;
        that.customInput = undefined;
        that.paramInput = undefined;
        // Destroy kendo;
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.wrapper);
    }
});

/**
 * Registration
 */
plugin(CodeInput);
