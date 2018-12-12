/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import editors from './util.editors.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const { Class } = window.kendo;

/**
 * BaseAdapter
 * @class BaseAdapter
 * @extends Class
 */
const BaseAdapter = Class.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options = {}) {
        assert.isPlainOrEmptyObject(
            options,
            assert.format(
                assert.messages.isPlainOrEmptyObject.default,
                'options'
            )
        );

        // See https://docs.telerik.com/kendo-ui/api/javascript/data/model/methods/define
        this.defaultValue = options.defaultValue;
        this.editable = options.editable;
        this.nullable = options.nullable;
        this.parse = options.parse;
        this.type = options.type;
        this.from = options.from;
        this.validation = options.validation;

        // See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
        this.field = options.field;
        this.title = options.title;
        this.format = options.format;
        this.template = options.template;
        this.editor = options.editor;
        this.attributes = options.attributes;
    },

    /**
     * Get a kendo.data.Model field
     * @see https://docs.telerik.com/kendo-ui/api/javascript/data/model/methods/define
     * @method getField
     * @returns {{}}
     */
    getField() {
        const field = {};
        if (
            [
                CONSTANTS.BOOLEAN,
                CONSTANTS.DATE,
                CONSTANTS.NUMBER,
                CONSTANTS.OBJECT,
                CONSTANTS.STRING
            ].indexOf(this.type) > -1
        ) {
            field.type = this.type;
        }
        if (
            $.type(this.defaultValue) === this.type ||
            $.isFunction(this.defaultValue) ||
            $.type(this.type) === CONSTANTS.UNDEFINED
        ) {
            field.defaultValue = this.defaultValue;
        }
        if ($.type(this.editable) === CONSTANTS.BOOLEAN) {
            field.editable = this.editable;
        }
        if ($.type(this.nullable) === CONSTANTS.BOOLEAN) {
            field.nullable = this.nullable;
        }
        if ($.isFunction(this.parse)) {
            field.parse = this.parse;
        }
        if ($.type(this.from) === CONSTANTS.STRING) {
            field.from = this.from;
        }
        if ($.type(this.validation) === CONSTANTS.OBJECT) {
            field.validation = this.validation;
        }
        return field;
    },

    /**
     * Get a property grid row
     * @see http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
     * @method getRow
     * @param field - This is the MVVM path to the field the data is bound to
     * @returns {{}}
     */
    getRow(field) {
        assert.type(
            CONSTANTS.STRING,
            field,
            assert.format(
                assert.messages.type.default,
                'field',
                CONSTANTS.STRING
            )
        );
        assert.hasLength(
            field,
            assert.format(assert.messages.hasLength.default, 'field')
        );
        const row = {};
        row.field = field; // Mandatory
        if ($.type(this.title) === CONSTANTS.STRING) {
            row.title = this.title;
        }
        if ($.type(this.format) === CONSTANTS.STRING) {
            row.format = this.format;
        }
        if ($.type(this.template) === CONSTANTS.STRING) {
            row.template = this.template;
        }
        if (
            $.isFunction(this.editor) ||
            ($.type(this.editor) === CONSTANTS.STRING &&
                $.isFunction(editors[this.editor]))
        ) {
            row.editor = this.editor;
        }
        if ($.isPlainObject(this.attributes)) {
            row.attributes = this.attributes;
        }
        return row;
    }
});

/**
 * Default export
 */
export default BaseAdapter;
