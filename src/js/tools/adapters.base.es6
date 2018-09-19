/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const { Class } = window.kendo;

// IMPORTANT TODO Consider pub sub mechanism especially to refresh or disable dependant properties
// TODO: Review HTML encode, especially in property grid????
// TODO Also consider a registry of editors kidoju.editors[editor] = function (container, settings) {}

/**
 * @class BaseAdapter (abstract)
 */
const BaseAdapter = Class.extend({
    /**
     * Constructor
     * @constructor
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

        // See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
        this.defaultValue = options.defaultValue;
        this.editable = options.editable;
        this.nullable = options.nullable;
        this.parse = options.parse;
        this.from = options.from;
        this.validation = options.validation;

        // See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
        this.field = options.field;
        this.title = options.title;
        this.format = options.format;
        this.template = options.template;
        this.editor = options.editor;
        // TODO: HTML encode????
        this.attributes = options.attributes;
    },

    /**
     * Data type: string, number, boolean or date
     */
    type: undefined,

    /**
     * Get a kendo.data.Model field
     * See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
     * @returns {{}}
     */
    getField() {
        const field = {};
        if (
            [
                CONSTANTS.STRING,
                CONSTANTS.NUMBER,
                CONSTANTS.BOOLEAN,
                CONSTANTS.DATE
            ].indexOf(this.type) > -1
        ) {
            field.type = this.type;
        }
        if (
            $.type(this.defaultValue) === this.type ||
            this.type === undefined
        ) {
            // TODO: test that defaultValue is null or an object
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
     * See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
     * @param field - This is the MVVM path to the field the data is bound to
     * @returns {{}}
     */
    getRow(field) {
        if ($.type(field) !== CONSTANTS.STRING || field.length === 0) {
            throw new TypeError();
        }
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
                (kidoju.editors === undefined ||
                    $.isFunction(kidoju.editors[this.editor])))
        ) {
            row.editor = this.editor;
        }
        // TODO: HTML encode????
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
