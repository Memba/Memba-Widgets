/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const { attr, roleSelector } = window.kendo;

/**
 * Synchronization state
 * @type {{CREATED: string}}
 */
const SYNC_STATE = {
    FIELD: '__state__',
    CREATED: 1,
    DESTROYED: 3,
    UPDATED: 2,
};

/**
 * Generic datasource error handler
 * @param e
 */
function dataSourceErrorHandler(e) {
    // TODO debugger;
    $.noop(e);
}

/**
 * An error helper that converts an error into an array [xhr, status, error]
 * in order to match $.ajax errors
 * @param err
 * @returns {[*,string,*]}
 * @constructor
 */
function error2xhr(err) {
    assert.instanceof(
        Error,
        err,
        assert.format(assert.messages.instanceof.default, 'error', 'Error')
    );
    // JSON.stringify(err) is always {}
    // $.extend is a workaround to collect non-undefined error properties
    const error = $.extend(
        true,
        {},
        {
            // i18n
            message: 'Ajax error',
            name: 'AjaxError',
            originalError: {
                message: err.message,
                name: err.name,
                stack: err.stack && err.stack.toString(),
            },
            status: err.status || err.code || 520,
        }
    );
    // Possible responseText from rapi calls are:
    // - "{"error":{"name":"ApplicationError","i18n":"errors.http.401","status":401,"message":"Unauthorized"}}"
    return [
        {
            readyState: 4,
            responseJSON: { error },
            responseText: JSON.stringify({ error }),
            status: error.status,
            statusText: 'error',
        },
        'error',
        error.message,
    ];
}

/**
 * Merge partition into filter
 * @param query
 * @param partition
 */
function extendQueryWithPartition(query, partition) {
    const q = query || {};
    if ($.isPlainObject(partition)) {
        // && !$.isEmptyObject(partition)) {
        if (q && Array.isArray(q.filter)) {
            q.filter = { logic: 'and', filters: q.filter };
        } else if (
            q &&
            $.isPlainObject(q.filter) &&
            $.type(q.filter.field) === CONSTANTS.STRING &&
            $.type(q.filter.operator) === CONSTANTS.STRING &&
            $.type(q.filter.value) !== CONSTANTS.UNDEFINED
        ) {
            q.filter = { logic: 'and', filters: [q.filter] };
        } else if (
            q &&
            $.isPlainObject(q.filter) &&
            q.filter.logic === 'or' &&
            Array.isArray(q.filter.filters)
        ) {
            q.filter = { logic: 'and', filters: [q.filter] };
        } else if (
            q &&
            $.isPlainObject(q.filter) &&
            q.filter.logic === 'and' &&
            Array.isArray(q.filter.filters)
        ) {
            $.noop(); // q.filter = q.filter;
        } else {
            q.filter = { logic: 'and', filters: [] };
        }
        assert.equal(
            'and',
            q.filter.logic,
            assert.format(
                assert.messages.equal.default,
                'q.filter.logic',
                'and'
            )
        );
        assert.isArray(
            q.filter.filters,
            assert.format(assert.messages.isArray.default, 'q.filter.filters')
        );
        Object.keys(partition).forEach((prop) => {
            if ($.type(partition[prop]) !== CONSTANTS.UNDEFINED) {
                let found;
                for (
                    let i = 0, { length } = q.filter.filters;
                    i < length;
                    i++
                ) {
                    const filter = q.filter.filters[i];
                    if (
                        filter.field === prop &&
                        filter.operator === 'eq' &&
                        filter.value === partition[prop]
                    ) {
                        found = filter;
                        break;
                    }
                }
                if (!found) {
                    q.filter.filters.push({
                        field: prop,
                        operator: 'eq',
                        value: partition[prop],
                    });
                }
            }
        });
    }
    delete q.partition; // if any?
    return q;
}

/**
 * Returns a Kendo UI attribute binding
 * @function getAttributeBinding
 * @param attribute
 * @param value
 */
function getAttributeBinding(attribute, value) {
    assert.type(
        CONSTANTS.STRING,
        attribute,
        assert.format(
            assert.messages.type.default,
            'attribute',
            CONSTANTS.STRING
        )
    );
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    const binding = {};
    if (attribute.length && value.length) {
        // Note: consider improving with toHyphens or toCamelCase is necessary
        binding[attr(attribute)] = value;
    }
    return binding;
}

/**
 * Return true for the mobile application and false for the web application
 * @returns {boolean}
 */
function isMobileApp() {
    // return !!window.cordova;
    // return !! window.kendo.support.mobileOS;
    return $(roleSelector('layout')).length > 0;
}

/**
 * Normalize data source schema
 * @see https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/configuration/schema
 * @param schema
 * @returns {*}
 */
function normalizeSchema(schema) {
    assert.isNonEmptyPlainObject(
        schema,
        assert.format(assert.messages.isNonEmptyPlainObject.default, 'schema')
    );
    return {
        // aggregates
        data(response) {
            return $.isPlainObject(response) &&
                Array.isArray(response.data) &&
                $.type(response.total) === CONSTANTS.NUMBER
                ? response.data
                : response;
        },
        // Note: this is for errors sent with a status code of 200
        // If the response has a field named `error`, it will trigger the error event
        errors: 'error', // 'errors'
        // groups
        // model
        // parse
        total: 'total',
        // type: 'json',
        ...schema,
    };
}

/**
 * Converts [xhr, status, errorThrown] to an Error
 * @param xhr
 * @param status
 * @param errorThrown
 * @returns {Error}
 */
function xhr2error(xhr, status, errorThrown) {
    let error;
    if (xhr instanceof Error) {
        // When there is an error thrown in the promise
        error = xhr;
    } else if (xhr.responseJSON) {
        // When the promise (based on $.ajax) completes
        const jsonError = xhr.responseJSON.error || {};
        error = new Error(jsonError.message || errorThrown || 'Unknown error');
        error.code = xhr.status;
        const { originalError } = jsonError;
        if (originalError) {
            error.originalError = new Error(
                originalError.message || 'Unknown error'
            );
            error.originalError.stack = originalError.stack;
        }
    } else {
        // When api server is unavailable errorThrown is '' (and xhr.status === 0)
        error = new Error(errorThrown || 'Unknown error');
        error.code = xhr.status;
    }
    return error;
}

/**
 * Export
 */
export {
    SYNC_STATE,
    dataSourceErrorHandler,
    error2xhr,
    extendQueryWithPartition,
    getAttributeBinding,
    isMobileApp,
    normalizeSchema,
    xhr2error,
};
