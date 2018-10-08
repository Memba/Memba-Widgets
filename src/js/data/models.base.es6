/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider a function/widget that populates validation rules on forms
// See http://docs.telerik.com/kendo-ui/framework/validator/overview
// TODO Consider an LRUCache for history
// TODO timezones?

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    data: { DataSource, Model, ObservableArray, ObservableObject },
    getter
} = window.kendo;

/**
 * BaseModel enhances kendo.data.Model
 * for nesting submodels as a mongoose document property can designate a subdocument
 * for nesting datasources of submodels as a mongoose document property can designate an array of subdocuments
 */
const BaseModel = Model.define({
    /**
     * Modify original init method
     * to add casting of object properties into their underlying type
     * For example, if a model field of type date receives a string value, it will be cast into a date
     * and if a model field designates a submodel, it will be cast into that submodel
     * @see http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
     * @param data
     */
    init(data) {
        if (
            data &&
            !(data instanceof Model) && // BaseModel inherits from Model
            $.type(data.hasSubgroups) === CONSTANTS.BOOLEAN &&
            Array.isArray(data.items)
        ) {
            // This is called from flattenGroups in kendo.data.js when there are aggregates
            Model.fn.init.call(this, data); // TODO Check when grouping and aggregating
        } else {
            // Call the base init method after parsing data
            Model.fn.init.call(this, this._parseData(data));
        }
    },

    /**
     * _parse
     * Note: assigns the field defaultValue when the value is undefined
     * This needs to be done in the _parse method in order to work with
     * new kendo.data.DataSource({ data: [...]})
     * @method _parse
     * @param name (field name)
     * @param value
     * @returns {*}
     * @private
     */
    _parse(name, value) {
        assert.type(
            CONSTANTS.STRING,
            name,
            assert.format(
                assert.messages.type.default,
                'name',
                CONSTANTS.STRING
            )
        );
        const field = this.fields[name];
        /*
        // TODO: The original _parse function calls getFieldName which seems to traverse a hierarchy
        // Which might make sense with grouping and aggregating
        if (!field) {
            field = getFieldByName(this.fields, name);
        }
        */
        if (field && $.type(value) === CONSTANTS.UNDEFINED) {
            const { _initializers } = this;
            let defaultValue = this.defaults[name];
            if (
                Array.isArray(_initializers) &&
                _initializers.indexOf(name) > -1
            ) {
                defaultValue = defaultValue();
            }
            // eslint-disable-next-line no-param-reassign
            value = defaultValue;
        }
        return Model.fn._parse.call(this, name, value);
    },

    /**
     * Function called in init(data) and accept(data) to parse data and convert fields to model field types
     * There are several issues with kendo.data.Model that we attempt to fix here:
     * - If data is passed to init, missing properties do not get a default value
     * - passing an ISO UTC string date as a value for a field of type date is not parsed
     * - more generally parse functions are not executed on default values, which is an issue with complex types
     * - events are not propagated to parents
     * @param data
     * @private
     */
    _parseData(data) {
        // eslint-disable-next-line no-param-reassign
        data = data || {}; // Can be undefined or null
        assert.type(
            CONSTANTS.OBJECT,
            data,
            assert.format(
                assert.messages.type.default,
                data,
                'data',
                CONSTANTS.OBJECT
            )
        );
        // Build our parsed data, discarding any fields that does not belong to our model
        const parsed = {};
        Object.keys(this.fields).forEach(name => {
            const field = this.fields[name];
            // Some fields get their data from another field
            const from = field.from || name;
            // `true` provides a safe option for kendo.getter
            // in order to ensure that we are not calling a nested property
            // on an undefined field
            const value = data ? getter(from, true)(data) : undefined;
            parsed[name] = this._parse(name, value);
        });
        return parsed;
    },

    /**
     * Modify original accept method
     * Add casting of properties into their underlying type (see init above)
     * @see http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
     * Trigger a change event on the parent observable (hierarchies of models and submodels)
     * @see http://www.telerik.com/forums/triggering-a-change-event-on-the-parent-observable-when-calling-kendo-data-model-accept-method
     * @param data
     * @returns {boolean}
     */
    accept(data) {
        // Call the base accept method after parsing data
        Model.fn.accept.call(this, this._parseData(data));

        // TODO: What if data is ony partial? Do we reset the other fields to default values?

        // TODO Review this event thing.......
        // Trigger a change event on the parent observable (possibly a viewModel)
        // Without it, any UI widget data bound to the parent is not updated
        /*
        if ($.type(this.parent) === CONSTANTS.FUNCTION) {
            const parent = this.parent();
            if (parent instanceof ObservableObject) {
                Object.keys(parent).some(key => {
                    let exit = false;
                    if (
                        parent[key] instanceof this.constructor &&
                        parent[key].uid === this.uid
                    ) {
                        // As we have found our nested object in the parent
                        // trigger a change event otherwise UI won't be updated via MVVM
                        parent.trigger(CONSTANTS.CHANGE, { field: key });
                        // Once we have found the key holding our model in its parent and triggered the change event,
                        // break out of for loop
                        exit = true;
                    }
                    return exit;
                });
            } else if (parent instanceof ObservableArray) {
                // TODO or DataSource????
                parent.some((item, index) => {
                    let exit = false;
                    if (
                        item instanceof this.constructor &&
                        item.uid === this.uid
                    ) {
                        // As we have found our nested object in the parent
                        // trigger a change event otherwise UI won't be updated via MVVM
                        parent.trigger(CONSTANTS.CHANGE, {
                            action: 'itemchange',
                            index,
                            items: [item]
                        });
                        // Once we have found the key holding our model in its parent and triggered the change event,
                        // break out of for loop
                        exit = true;
                    }
                    return exit;
                });
            }
        }*/
    },

    /**
     * Override shouldSerialize to
     * 1) only serialize fields defined in the Model (any other value should be discarded)
     * 2) discard model fields with property serializable === false
     * @param field
     */
    shouldSerialize(field) {
        assert.type(
            CONSTANTS.STRING,
            field,
            assert.format(
                assert.messages.type.default,
                field,
                'field',
                CONSTANTS.STRING
            )
        );
        return (
            // Note: all fields are replicated on inherited models
            // Checking hasOwnProperty only ensures this.fields[field] exists
            Object.prototype.hasOwnProperty.call(this.fields, field) &&
            this.fields[field].serializable !== false &&
            Model.fn.shouldSerialize.call(this, field)
        );
    },

    /**
     * Modified version of the original toJSON method to:
     * (1) exclude fields marked as serializable: false
     * (2) recursivley use toJSON when available on nested models and data sources
     * @returns {{}}
     */
    toJSON() {
        const json = {};
        Object.keys(this).forEach(key => {
            if (this.shouldSerialize(key)) {
                let value = this[key];
                // `undefined` is ambiguous because it is also the value of a missing property.
                // Note also that this is consistent with JSON.stringify which ignores undefined values
                // We also do not want to pass nullable values to MongoDB
                // See https://github.com/christkv/mongodb-core/issues/31
                if (
                    $.type(value) !== CONSTANTS.UNDEFINED &&
                    $.type(value) !== CONSTANTS.NULL
                ) {
                    if (
                        $.type(value) !== CONSTANTS.DATE &&
                        $.type(value.toJSON) === CONSTANTS.FUNCTION
                    ) {
                        // Call toJSON on any object that implements such method except dates
                        value = value.toJSON();
                    } else if (value instanceof DataSource) {
                        // IMPORTANT! value.read() should have been called first
                        value = value.data().toJSON();
                    }

                    // Now discard
                    // - functions and symbols, which should not happen considering shouldSerialize(key)
                    // - empty objects and empty arrays (not in original toJSON method but no point storing them in MongoDB):
                    // - all objects that are not plain objects, especially instances of Class, Model or DataSource
                    // Note, this is far from perfect because a plain object containing a nested property of such types would go through
                    if (
                        $.type(value) !== CONSTANTS.FUNCTION &&
                        $.type(value) !== CONSTANTS.SYMBOL &&
                        !($.isPlainObject(value) && $.isEmptyObject(value)) && // TODO: review with patch
                        !(Array.isArray(value) && value.length === 0) && // TODO: review with patch
                        !(
                            $.type(value) === CONSTANTS.OBJECT &&
                            value.constructor !== Object
                        )
                    ) {
                        // If this.fields[key].from === `metrics.comments.count`
                        // We need to extend json with { metrics: { comments: {} } }
                        // Before we can assign metrics.comments.count
                        // Unfortunately kendo.setter does not create objects
                        // so kendo.setter('metrics.comments.count')(json. value) does not work
                        // @see also https://docs.telerik.com/kendo-ui/controls/data-management/grid/how-to/binding/use-nested-model-properties
                        const chain = (this.fields[key].from || key).split(
                            CONSTANTS.DOT
                        );
                        let cursor = json;
                        while (chain.length > 1) {
                            const prop = chain.shift();
                            cursor[prop] = cursor[prop] || {};
                            cursor = cursor[prop];
                        }
                        cursor[chain[0]] = value;
                    }
                }
            }
        });
        return json;
    }

    /**
     * Execute validation of the model data considering the rules defined on fields
     * @returns {boolean}
     */
    /*
    validate() {
        var that = this;
        var validated = true;
        for (var field in that.fields) {
            if (that.fields.hasOwnProperty(field)) {
                var validation = that.fields[field].validation;
                if (!$.isPlainObject(validation)) {
                    continue;
                }
                if (validation.required === true && !that[field]) { // nullable fields?
                    validated = false;
                    break;
                }
                if ($.type(validation.pattern) === 'string' && !(new RegExp(validation.pattern)).test(that[field])) {
                    validated = false;
                    break;
                }
                if ($.type(validation.min) === 'number' && !Number.isNaN(parseFloat(that[field])) && parseFloat(that[field]) < validation.min) {
                    validated = false;
                    break;
                }
                if ($.type(validation.max) === 'number' && !Number.isNaN(parseFloat(that[field])) && parseFloat(that[field]) > validation.max) {
                    validated = false;
                    break;
                }
            }
        }
        return validated; // Should we return an array of errors instead
    }
    */
});

/**
 * Default export
 */
export default BaseModel;
