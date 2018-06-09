/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';
import { escapeRegExp } from './window.util.es6';

/**
 * Getter for deep fields
 * Note: Kendo UI implements the same function with eval but "eval is evil"
 * @param doc
 * @param prop
 */
export function getter(doc, prop) {
    assert.type(
        CONSTANTS.OBJECT,
        doc,
        assert.format(assert.messages.type.default, 'doc', CONSTANTS.OBJECT)
    );
    assert.type(
        CONSTANTS.STRING,
        prop,
        assert.format(assert.messages.type.default, 'prop', CONSTANTS.STRING)
    );
    const path = prop.split(CONSTANTS.DOT);
    let value = doc;
    while (path.length > 0) {
        value = value && value[path[0]];
        path.shift();
    }
    return value;
}

/**
 * Setter for deep fields
 * @param doc
 * @param prop
 * @param value
 */
export function setter(doc, prop, value) {
    assert.type(
        CONSTANTS.OBJECT,
        doc,
        assert.format(assert.messages.type.default, 'doc', CONSTANTS.OBJECT)
    );
    assert.type(
        CONSTANTS.STRING,
        prop,
        assert.format(assert.messages.type.default, 'prop', CONSTANTS.STRING)
    );
    // Note: value can be anything
    const path = prop.split(CONSTANTS.DOT);
    let field = doc;
    while (path.length > 1) {
        field[path[0]] = field[path[0]] || {};
        field = field[path[0]];
        path.shift();
    }
    field[path[0]] = value;
}

/**
 * Compare semantic versions (either directly or as a _version property of an object)
 * @see: https://github.com/substack/semver-compare/blob/master/index.js
 * @param a
 * @param b
 * @returns {number}
 */
export function compareVersions(a, b) {
    // Get version as a string property, possibly from an obj.version
    let va = $.type(a) === CONSTANTS.OBJECT ? a._version || a.version : a;
    let vb = $.type(b) === CONSTANTS.OBJECT ? b._version || b.version : b;
    assert.type(
        CONSTANTS.STRING,
        va,
        assert.format(assert.messages.type.default, 'va', CONSTANTS.STRING)
    );
    assert.type(
        CONSTANTS.STRING,
        vb,
        assert.format(assert.messages.type.default, 'vb', CONSTANTS.STRING)
    );
    // Remove `v` prefix if any
    va = va.charAt(0) === 'v' ? va.substr(1) : va;
    vb = vb.charAt(0) === 'v' ? vb.substr(1) : vb;
    // Split into major, minor and patch
    const pa = va.split(CONSTANTS.DOT);
    const pb = vb.split(CONSTANTS.DOT);
    for (let i = 0; i < 3; i++) {
        const na = parseInt(pa[i], 10);
        const nb = parseInt(pb[i], 10);
        if (na > nb) {
            return 1;
        }
        if (nb > na) {
            return -1;
        }
        if (!Number.isNaN(na) && Number.isNaN(nb)) {
            return 1;
        }
        if (Number.isNaN(na) && !Number.isNaN(nb)) {
            return -1;
        }
    }
    return 0;
}

/**
 * Return an array of field names in the form a.b.c
 * Note: arrays are not handled, although they could have been handled as a.b[1].c
 * @param doc
 * @param path
 */
export function listFields(doc, path = '') {
    assert.type(
        CONSTANTS.OBJECT,
        doc,
        assert.format(assert.messages.type.default, 'doc', CONSTANTS.OBJECT)
    );
    assert.type(
        CONSTANTS.STRING,
        path,
        assert.format(assert.messages.type.default, 'path', CONSTANTS.STRING)
    );
    const fields = [];
    Object.keys(doc).forEach(prop => {
        if ($.type(doc[prop]) === CONSTANTS.OBJECT) {
            fields.push(
                ...listFields(
                    doc[prop],
                    path.length > 0 ? path + CONSTANTS.DOT + prop : prop
                )
            );
        } else if (
            $.type(doc[prop]) !== CONSTANTS.FUNCTION && // Exclude functions
            prop.indexOf(CONSTANTS.UNDERSCORE) !== 0 // Exclude private fields
        ) {
            fields.push(path.length > 0 ? path + CONSTANTS.DOT + prop : prop);
        }
    });
    return fields;
}

/**
 * Search for str in a doc's indexed fields
 * Note: str is split into words and each word is searched
 * If all the words are found, even scattered across fields, it is a match
 * @param str
 * @param doc
 * @param textFields
 * @returns {boolean}
 */
export function search(str, doc, textFields) {
    assert.type(
        CONSTANTS.STRING,
        str,
        assert.format(assert.messages.type.default, 'str', CONSTANTS.STRING)
    );
    assert.type(
        CONSTANTS.OBJECT,
        doc,
        assert.format(assert.messages.type.default, 'doc', CONSTANTS.OBJECT)
    );
    // A search on an empty string is always a match
    if (str.length < 1) {
        return true;
    }
    // By default, search all fields (listing textFields is only an optimization)
    textFields = textFields || listFields(doc); // eslint-disable-line no-param-reassign
    assert.isArray(
        textFields,
        assert.format(assert.messages.isArray.default, 'textFields')
    );
    // Match all str words
    const matches = str.split(/\s+/g);
    return textFields.some(path => {
        const value = getter(doc, path);
        if (Array.isArray(value)) {
            // Search string arrays like summary tags
            value.forEach(item => {
                for (let idx = matches.length - 1; idx >= 0; idx--) {
                    if (
                        new RegExp(escapeRegExp(matches[idx]), 'i').test(item)
                    ) {
                        matches.splice(idx, 1);
                    }
                }
            });
        } else if ($.type(value) === CONSTANTS.STRING) {
            // Search string values
            for (let idx = matches.length - 1; idx >= 0; idx--) {
                if (new RegExp(escapeRegExp(matches[idx]), 'i').test(value)) {
                    matches.splice(idx, 1);
                }
            }
        }
        return matches.length === 0;
    });
}

/**
 * Match a doc to a query
 * Note: Match does not handle nested logical operators, including $and and $or
 * @param query
 * @param doc
 * @param textFields for text searches
 */
export function match(query, doc, textFields) {
    assert.type(
        CONSTANTS.OBJECT,
        query,
        assert.format(assert.messages.type.default, 'query', CONSTANTS.OBJECT)
    );
    assert.type(
        CONSTANTS.OBJECT,
        doc,
        assert.format(assert.messages.type.default, 'doc', CONSTANTS.OBJECT)
    );
    return Object.keys(query).every(path => {
        const value = getter(doc, path);
        const criterion = query[path];
        let ret;
        if (criterion instanceof RegExp) {
            ret = criterion.test(value);
        } else if ($.type(criterion) === CONSTANTS.OBJECT) {
            ret = Object.keys(criterion).every(operator => {
                // @see http://docs.mongodb.org/manual/reference/operator/query/
                switch (operator) {
                    case '$caseSensitive': // $text
                    case '$language': // $text
                    case '$options': // $regex
                        return true;
                    case '$eq':
                        return value === criterion[operator];
                    case '$gt':
                        return value > criterion[operator];
                    case '$gte':
                        return value >= criterion[operator];
                    case '$in':
                        return (
                            Array.isArray(value) &&
                            value.indexOf(criterion[operator]) > -1
                        );
                    case '$lt':
                        return value < criterion[operator];
                    case '$lte':
                        return value <= criterion[operator];
                    case '$ne':
                        return value !== criterion[operator];
                    case '$nin':
                        return (
                            Array.isArray(value) &&
                            value.indexOf(criterion[operator]) === -1
                        );
                    case '$regex':
                        if (criterion[operator] instanceof RegExp) {
                            return criterion[operator].test(value);
                        } else if (
                            $.type(criterion[operator]) === CONSTANTS.STRING
                        ) {
                            return new RegExp(
                                criterion[operator],
                                criterion.$options
                            ).test(value);
                        }
                        break; // useless but satisfies eslint
                    case '$search':
                        // See https://docs.mongodb.com/manual/reference/operator/query/text/
                        return search(criterion[operator], doc, textFields);
                    case '$bitsAnySet':
                        return (
                            (criterion[operator] & value) === // eslint-disable-line no-bitwise
                            criterion[operator]
                        );
                    default:
                        return false;
                }
                return false; // useless but satisfies eslint
            });
        } else {
            ret = value === criterion;
        }
        return ret;
    });
}

/**
 * Normalize filter
 * @param filter
 */
export function normalizeFilter(filter) {
    // @see https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/configuration/filter#filter.operator
    const OPERATORS = [
        'eq',
        'neq',
        'isnull',
        'isnotnull',
        'lt',
        'lte',
        'gt',
        'gte',
        'startswith',
        'endswith',
        'contains',
        'doesnotcontain',
        'isempty', // empty string
        'isnotempty'
    ];
    let ret = filter;
    if (Array.isArray(ret)) {
        ret = {
            logic: 'and',
            filters: ret
        };
    }
    assert.isPlainObject(
        ret,
        assert.format(assert.messages.isPlainObject.default, 'filter')
    );
    if (ret.field && ret.operator) {
        ret = {
            logic: 'and',
            filters: [ret]
        };
    }
    assert.equal(
        'and',
        ret.logic,
        assert.format(assert.messages.equal.default, 'filter.logic', 'and')
    );
    assert.isArray(
        ret.filters,
        assert.format(assert.messages.isArray.default, 'filter.filters')
    );
    assert.hasLength(
        ret.filters,
        assert.format(assert.messages.hasLength.default, 'filter.filters')
    );
    const checkFilters = ret.filters.every(
        f =>
            Object.keys(f).length <= 3 &&
            $.type(f.field) === CONSTANTS.STRING &&
            OPERATORS.indexOf(f.operator) > -1
    );
    assert.ok(
        checkFilters,
        'Each filter should have a `field`, an `operator` and optionally a `value`.'
    );
    return {
        logic: ret.logic,
        filters: ret.filters
    };
}

/**
 * Converts a Kendo UI filter to a MongoDB query
 * Note: Like match here above convertFilter does not handle nested logical operators, including and and or
 * @param filter, a normalized filter
 */
export function convertFilter(filter) {
    assert.equal(
        'and',
        filter.logic,
        assert.format(assert.messages.equal.default, 'filter.logic', 'and')
    );
    assert.isArray(
        filter.filters,
        assert.format(assert.messages.isArray.default, 'filter.filters')
    );
    const query = {};
    filter.filters.forEach(f => {
        const op = {};
        if (
            f.field === '$text' &&
            f.operator === 'eq' &&
            $.type(f.value) !== CONSTANTS.UNDEFINED
        ) {
            // Note: we do not handle f.ignoreCase
            op.$text = { $search: f.value };
        } else if ($.type(f.field) === CONSTANTS.STRING) {
            switch (f.operator) {
                case 'eq':
                default:
                    op[f.field] = { $eq: f.value };
                    break;
                case 'neq':
                    op[f.field] = { $ne: f.value };
                    break;
                case 'isnull':
                    op[f.field] = { $eq: null };
                    break;
                case 'isnotnull':
                    op[f.field] = { $ne: null };
                    break;
                case 'lt':
                    op[f.field] = { $lt: f.value };
                    break;
                case 'lte':
                    op[f.field] = { $lte: f.value };
                    break;
                case 'gt':
                    op[f.field] = { $gt: f.value };
                    break;
                case 'gte':
                    op[f.field] = { $gte: f.value };
                    break;
                case 'flags': // Not a Kendo UI operator - used with age groups
                    op[f.field] = { $bitsAnySet: f.value };
                    break;
                case 'startswith':
                    op[f.field] = {
                        $regex: `^${f.value}`,
                        $options: 'i'
                    };
                    break;
                case 'endswith':
                    op[f.field] = {
                        $regex: `${f.value}$`,
                        $options: 'i'
                    };
                    break;
                case 'contains':
                    op[f.field] = { $regex: f.value, $options: 'i' };
                    break;
                case 'doesnotcontain':
                    // https://docs.mongodb.com/manual/reference/operator/query/not/
                    // http://stackoverflow.com/questions/20175122/how-can-i-use-not-like-operator-in-mongodb
                    // op[f.field] = { $not: new RegExp(f.value, 'i') };
                    op[f.field] = {
                        $regex: `^((?!${f.value}).)*$`,
                        $options: 'i'
                    };
                    break;
                case 'isempty':
                    op[f.field] = { $eq: '' };
                    break;
                case 'isnotempty':
                    op[f.field] = { $ne: '' };
            }
        }
        // Note extend might not be the perfect choice because it would replace { a: 1 } with {a : 2 }
        // matching all items where a is 2 instead of matching no items because a cannot be both 1 and 2
        $.extend(query, op);
    });
    return query;
}

/**
 * Converts a Kendo UI sort to MongoDB sort options
 * @param options
 */
export function convertSort(options) {
    const ret = {};
    let sort = options;
    if (
        $.type(sort) === CONSTANTS.UNDEFINED ||
        $.isEmptyObject(sort) ||
        (Array.isArray(sort) && sort.length === 0)
    ) {
        return ret;
    }
    if (
        $.isPlainObject(sort) &&
        $.type(sort.field) === CONSTANTS.STRING &&
        $.type(sort.dir) === CONSTANTS.STRING
    ) {
        sort = [sort];
    }
    assert.isArray(
        sort,
        assert.format(assert.messages.isArray.default, 'options')
    );
    sort.forEach(order => {
        if (
            $.type(order.field) === CONSTANTS.STRING &&
            $.type(order.dir) === CONSTANTS.STRING
        ) {
            ret[order.field] = order.dir === 'desc' ? -1 : 1; // Makes 'asc' or anything else the default sort order
        }
    });
    return ret;
}

/**
 * Maintain compatibility with legacy code
 */
window.pongodb = window.pongodb || {};
window.pongodb.util = window.pongodb.util || {};
window.pongodb.util.compareVersions = compareVersions;
window.pongodb.util.convertFilter = convertFilter;
window.pongodb.util.convertSort = convertSort;
window.pongodb.util.getter = getter;
window.pongodb.util.listFields = listFields;
window.pongodb.util.match = match;
window.pongodb.util.search = search;
window.pongodb.util.normalizeFilter = normalizeFilter;
window.pongodb.util.setter = setter;
