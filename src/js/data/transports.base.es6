/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import CONSTANTS from '../common/window.constants.es6';
import assert from '../common/window.assert.es6';

// TODO: maybe it is better to inject the BaseModel to automatically build projection????

const collection = Symbol('collection');
const idField = Symbol('idField');
const partition = Symbol('partition');
const projection = Symbol('projection');

/**
 * Parameter map to change options.data payload before sending to rapi
 * @param data
 * @param type (create, destroy, get, read or update)
 * @returns {*}
 */
function parameterMap(data /* , type */) {
    return data;
}

/**
 * BaseTransport
 */
export default class BaseTransport {
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
        this[collection] = options.collection;
        assert.isDefined(
            CONSTANTS.OBJECT,
            this[collection],
            assert.format(
                assert.messages.isDefined.default,
                'options.collection'
            )
        );
        this[idField] = options.idField || 'id';
        assert.type(
            CONSTANTS.STRING,
            this[idField],
            assert.format(
                assert.messages.type.default,
                'options.idField',
                CONSTANTS.STRING
            )
        );
        this.partition = options.partition;
        this.projection = options.projection;
        if ($.isFunction(options.parameterMap)) {
            this.parameterMap = options.parameterMap.bind(this);
        } else {
            this.parameterMap = parameterMap.bind(this);
        }
    }

    /**
     * collection
     * @returns {*}
     */
    get collection() {
        return this[collection];
    }

    /**
     * idField
     * @returns {*}
     */
    get idField() {
        return this[idField];
    }

    /**
     * partition getter (list of table rows)
     * Note: some partition fields impact the endpoint (url), other partition fields impact the query (filter)
     */
    get partition() {
        return this[partition];
    }

    /**
     * partition setter (list of table rows)
     * Note: some partition fields impact the endpoint (url), other partition fields impact the query (filter)
     * @param value
     */
    set partition(value) {
        assert.typeOrUndef(
            CONSTANTS.OBJECT,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'partition',
                CONSTANTS.OBJECT
            )
        );
        // Note value can be an empty object
        this[partition] = value;
    }

    /**
     * projection getter (list of table columns)
     */
    get projection() {
        return this[projection];
    }

    /**
     * projection setter (list of table columns)
     * @param value
     */
    set projection(value) {
        assert.typeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'projection',
                CONSTANTS.STRING
            )
        );
        this[projection] = value;
    }

    /**
     * Validates a data dataItem against the current partition
     * @param dataItem
     * @private
     */
    _validate(dataItem) {
        let ret;
        const errors = [];
        Object.keys(this.partition).forEach(field => {
            let value = dataItem;
            // TODO use getter
            // TODO check from fields
            // We need to find the value of composite properties like in dataItem['prop1.prop2'] which should be read as dataItem.prop1.prop2
            // We need that for activity.author.userId or activity.version.language
            const props = field.split('.');
            for (let i = 0, { length } = props; i < length; i++) {
                value = value[props[i]];
            }
            if (this.partition[field] !== value) {
                const err = new Error(`Invalid ${field}`);
                err.field = field;
                errors.push(err);
            }
        });
        if (errors.length) {
            ret = new Error('Bad request');
            ret.code = 400;
            ret.errors = errors;
        }
        return ret;
    }

    /**
     * Create
     */
    // eslint-disable-next-line class-methods-use-this
    create() {
        throw new Error(CONSTANTS.NOT_IMPLEMENTED_ERR);
    }

    /**
     * Create
     */
    // eslint-disable-next-line class-methods-use-this
    destroy() {
        throw new Error(CONSTANTS.NOT_IMPLEMENTED_ERR);
    }

    /**
     * Get
     */
    // eslint-disable-next-line class-methods-use-this
    get() {
        throw new Error(CONSTANTS.NOT_IMPLEMENTED_ERR);
    }

    /**
     * Read
     */
    // eslint-disable-next-line class-methods-use-this
    read() {
        throw new Error(CONSTANTS.NOT_IMPLEMENTED_ERR);
    }

    /**
     * Update
     */
    // eslint-disable-next-line class-methods-use-this
    update() {
        throw new Error(CONSTANTS.NOT_IMPLEMENTED_ERR);
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.app = window.app || {};
window.app.models = window.app.models || {};
window.app.models.BaseTransport = BaseTransport;
