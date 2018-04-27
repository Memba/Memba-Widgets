/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.data';

const { kendo } = window;
const { DataSource, Model, ObservableArray, ObservableObject } = kendo.data;

// TODO: Add asserts

// TODO: Review and include nested properties
// https://docs.telerik.com/kendo-ui/controls/data-management/grid/how-to/binding/use-nested-model-properties

// TODO: Test aggregates

/**
 * kidoju.data.Model enhances kendo.data.Model
 * for aggregation of submodels as as a mongoose document property can designate a subdocument
 * for DataSource of submodels as a mongoose document property can designate an array of subdocuments
 */
const BaseModel = Model.define({
    /**
     * Function called in init(data) and accept(data) to parse data and convert fields to model field types
     * There are several issues with kendo.data.Model that we attempt to fix here:
     * - If data is passed to init, missing properties do not get a default value
     * - passing an ISO UTC string date as a value for a field of type date is not parsed
     * - more generally filed parse functions are not executed on default values, which is an issue with complex types
     * - events are not propagated to parents
     * @param data
     * @private
     */
    _parseData(data) {
        // Build a set of defaults considering some default values are initializer functions
        const defaults = $.extend({}, this.defaults);
        if (this._initializers) {
            // when defaultValue is am initializer function
            for (let idx = 0; idx < this._initializers.length; idx++) {
                const name = this._initializers[idx];
                defaults[name] = this.defaults[name]();
            }
        }
        // Build our parsed data, discarding any fields that does not belong to our model
        const parsed = {};
        Object.keys(this.fields).forEach(prop => {
            const field = this.fields[prop];
            // Some fields get their data from another field
            const from = field.from || prop;
            // If from is `metrics.comments.count` we need `data`, `data.metrics` and `data.metrics.comments` to not be undefined
            // which `true` provides as the safe option of kendo.getter
            let value = data ? kendo.getter(from, true)(data) : undefined;
            if (typeof value === 'undefined') {
                value = defaults[prop];
            }
            parsed[prop] = this._parse(prop, value);
        });
        return parsed;
    },

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
            !(data instanceof Model) &&
            typeof data.hasSubgroups === 'boolean' &&
            Array.isArray(data.items)
        ) {
            // This is called from flattenGroups in kendo.data.js when there are aggregates
            Model.fn.init.call(this, data);
        } else {
            // Call the base init method after parsing data
            Model.fn.init.call(this, this._parseData(data));
        }
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
        // Call the base accept method
        kendo.data.Model.fn.accept.call(this, this._parseData(data));

        // Trigger a change event on the parent observable (possibly a viewModel)
        // Without it, any UI widget data bound to the parent is not updated
        // TODO Review this event thing.......
        if (typeof this.parent === 'function') {
            const parent = this.parent();
            if (parent instanceof ObservableObject) {
                Object.keys(parent).some(prop => {
                    let exit = false;
                    if (
                        parent[prop] instanceof this.constructor &&
                        parent[prop].uid === this.uid
                    ) {
                        // As we have found our nested object in the parent
                        // trigger a change event otherwise UI won't be updated via MVVM
                        parent.trigger('change', { field: prop });
                        // Once we have found the key holding our model in its parent and triggered the change event,
                        // break out of for loop
                        exit = true;
                    }
                    return exit;
                });
            }
            // } else if (parent instanceof ObservableArray) {
            // TODO: What in this case ????
        }
    },

    /**
     * Override shouldSerialize to
     * 1) only serialize fields defined in the Model (any other value should be discarded)
     * 2) discard model fields with property serializable === false
     * @param field
     */
    shouldSerialize(field) {
        // assert.type('string', field, kendo.format(assert.messages.type.default, 'field', 'string'));
        return this.fields.hasOwnProperty(field) && this.fields[field].serializable !== false &&
            kendo.data.Model.fn.shouldSerialize.call(this, field);
    },

    /**
     * Modify original toJSON method to:
     * (1) only serialize actual editable fields with their id
     * (2) optionally serialize the entire tree
     *
     * Note that we have also considered taking a list of fields as parameters
     * to only send the data we know has been modified
     * toPartialJSON was not copied when moving app.models.BaseModel to kidoju.data.Model
     * @param includeDataSources defines whether to include datasources in the result or not
     * This would actually depend upon the fact whether the hierarchy is saved with the root object
     * or the data sources have their own transport to save their nodes.
     * @returns {{}}
     */
    toJSON(includeDataSources) {

        var json = {};
        var value;
        var field;

        for (field in this) {
            if (this.shouldSerialize(field)) {

                value = this[field];

                // Also call toJSON on any kidoju.data.DataSource which aggregates a collection of models (not in original toJSON method)
                // if (value instanceof ObservableObject || value instanceof ObservableArray) {
                if (value instanceof ObservableObject || value instanceof ObservableArray || (includeDataSources && value instanceof DataSource)) {
                    value = value.toJSON(includeDataSources);
                }

                // Also discard undefined values and empty objects (not in original toJSON method)
                // Note: we are not discarding empty arrays though:
                // We are considering that an empty object is a collection of undefined attributes
                // It is not the same with an empty array
                if ($.type(value) !== 'undefined' && // Not an undefined value
                    !($.isPlainObject(value) && $.isEmptyObject(value)) && // Not an empty object {}
                    !($.type(value) === 'object' && value.constructor !== Object)) { // Not an instance of a Class, Model or DataSource
                    json[field] = value;
                }

                // `undefined` is ambiguous because it is also the value of a missing property.
                // if we really want to assign data = undefined or data = {}, we should make data nullable and assign data = null
                // See https://github.com/christkv/mongodb-core/issues/31
                // Note also that this is consistent with JSON.stringify which ignores undefined values
            }
        }

        return json;
    },

    /**
     * Execute validation of the model data considering the rules defined on fields
     * @returns {boolean}
     */
    validate: () => {
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

    // TODO Consider a function that populates validation rules on forms
    // See http://docs.telerik.com/kendo-ui/framework/validator/overview

});

/**
 * Export BaseModel
 */
export default BaseModel;

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.data = window.kidoju.data || {};
window.kidoju.data.Model = BaseModel;
