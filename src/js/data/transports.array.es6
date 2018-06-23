/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.data';
import CONSTANTS from '../common/window.constants.es6';
import assert from '../common/window.assert.es6';
import { error2xhr } from '../common/window.util.es6';
import ObjectId from '../common/pongodb.objectid.es6';
import BaseTransport from './transports.base.es6';

const {
    data: { Query }
} = window.kendo;

// The in-memory database
const db = new Map();

/**
 * ArrayTransport
 */
const ArrayTransport = BaseTransport.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     */
    init(options = {}) {
        BaseTransport.fn.init.call(this, options);
        // We need a string collection for a map key
        assert.type(
            CONSTANTS.STRING,
            options.collection,
            assert.format(
                assert.messages.type.default,
                'options.collection',
                CONSTANTS.STRING
            )
        );
        // Create the collection
        if (!db.has(this._collection)) {
            db.set(this._collection, []);
        }
    },

    /**
     * data getter
     */
    data() {
        return db.get(this._collection);
    },

    /**
     * Create
     * @param options
     */
    create(options) {
        assert.crud(options);
        const idField = this.idField();
        /** Depends on defaultValue and nullable
        assert.isUndefined(
            options.data[idField],
            assert.format(
                assert.messages.isUndefined.default,
                `options.data['${idField}']`
            )
        );
        */
        const item = options.data;
        item[idField] = new ObjectId().toString();
        this.data().push(item);
        options.success(item);
    },

    /**
     * Destroy
     * @param options
     */
    destroy(options) {
        assert.crud(options);
        const idField = this.idField();
        assert.isDefined(
            options.data[idField],
            assert.format(
                assert.messages.isDefined.default,
                `options.data['${idField}']`
            )
        );
        const found = this.data().some((item, index) => {
            if (item[idField] === options.data[idField]) {
                this.data().splice(index, 1);
                options.success();
                return true;
            }
            return false;
        });
        if (!found) {
            const error = Object.assign(new Error(CONSTANTS.NOT_FOUND_ERR), {
                status: 404
            });
            options.error(...error2xhr(error));
        }
    },

    /**
     * Get
     * @param options
     */
    get(options) {
        assert.crud(options);
        const idField = this.idField();
        assert.isDefined(
            options.data[idField],
            assert.format(
                assert.messages.isDefined.default,
                `options.data['${idField}']`
            )
        );
        // TODO apply projection
        const found = this.data().some(item => {
            if (item[idField] === options.data[idField]) {
                options.success(item);
                return true;
            }
            return false;
        });
        if (!found) {
            const error = Object.assign(new Error(CONSTANTS.NOT_FOUND_ERR), {
                status: 404
            });
            options.error(...error2xhr(error));
        }
    },

    /**
     * Read
     * @param options
     */
    read(options) {
        assert.crud(options);
        const query = Query.process(
            this.data(),
            $.extend({ filter: {} }, options.data) // otherwise total is undefined when filter is undefined
        );
        // TODO apply projection
        options.success(query);
    },

    /**
     * Update
     * @param options
     */
    update(options) {
        assert.crud(options);
        const idField = this.idField();
        assert.isDefined(
            options.data[idField],
            assert.format(
                assert.messages.isDefined.default,
                `options.data['${idField}']`
            )
        );
        const found = this.data().some((item, index) => {
            if (item[idField] === options.data[idField]) {
                this.data()[index] = $.extend(this.data()[index], options.data);
                options.success();
                return true;
            }
            return false;
        });
        if (!found) {
            const error = Object.assign(new Error(CONSTANTS.NOT_FOUND_ERR), {
                status: 404
            });
            options.error(...error2xhr(error));
        }
    }
});

/**
 * Default export
 */
export default ArrayTransport;

/**
 * Maintain compatibility with legacy code
 */
window.app = window.app || {};
window.app.models = window.app.models || {};
window.app.models.ArrayTransport = ArrayTransport;
