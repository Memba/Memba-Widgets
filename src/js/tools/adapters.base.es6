/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const VALIDATION_DECLARATION =
    'function validate(value, solution, all) {\n\t{0}\n}';

// IMPORTANT TODO Consider pub sub mechanism especially to refresh or disable dependant properties
// TODO: Review HTML encode, especially in property grid????
// TODO Also consider a registry of editors kidoju.editors[editor] = function (container, settings) {}

/**
 * @class BaseAdapter
 * An adapter provides the UI to edit a property, especially from a PageComponent
 */
export default class BaseAdapter {
    /**
     * Constructor
     * @constructor
     * @param options
     */
    constructor(options = {}) {
        assert.type(
            CONSTANTS.OBJECT,
            options,
            assert.format(
                assert.messages.type.default,
                'options',
                CONSTANTS.OBJECT
            )
        );

        // this.value = options.value; // TODO check for any value????

        $.extend(this, {
            // See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
            defaultValue: options.defaultValue,
            editable: options.editable,
            nullable: options.nullable,
            parse: options.parse,
            from: options.from,
            validation: options.validation,

            // See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
            field: options.field,
            title: options.title,
            format: options.format,
            template: options.template,
            editor: options.editor,
            attributes: options.attributes,

            // Data type of adapter
            type: options.type // TODO Symbol?
        });
    }

    static get validationDeclaration() {
        return VALIDATION_DECLARATION;
    }

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
            $.type(this.type) === CONSTANTS.UNDEFINED
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
    }

    /**
     * Get a property grid row
     * See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
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
        // TODO Add validation rules
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
            $.type(this.editor) === CONSTANTS.STRING // &&
            // TODO kidoju.editors does not seem to exist anywhere else
            // ($.type(kidoju.editors) === CONSTANTS.UNDEFINED ||
            //    $.isFunction(kidoju.editors[this.editor])))
        ) {
            row.editor = this.editor;
        }
        // TODO: HTML encode????
        if ($.isPlainObject(this.attributes)) {
            row.attributes = this.attributes;
        }
        return row;
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.adapters = window.kidoju.adapters || {};
window.kidoju.adapters.BaseAdapter = BaseAdapter;
