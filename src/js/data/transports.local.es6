/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import CONSTANTS from '../common/window.constants.es6';
import assert from '../common/window.assert.es6';
import Logger from '../common/window.logger.es6';
import LazyLocalTransport from './transports.local.es6';
import LazyRemoteTransport from './transports.lazyremote';

const logger = new Logger('transports.local');

/**
 * LocalTransport (using pongodb and localForage)
 */
const LocalTransport = LazyLocalTransport.extend({
    /**
     * Create
     * @param options
     */
    create(options) {
        assert.isPlainObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
        );
        assert.isPlainObject(
            options.data,
            assert.format(assert.messages.isPlainObject.default, 'options.data')
        );
        assert.isFunction(
            options.error,
            assert.format(assert.messages.isFunction.default, 'options.error')
        );
        assert.isFunction(
            options.success,
            assert.format(assert.messages.isFunction.default, 'options.success')
        );
        logger.debug({
            message: 'Create mobile data',
            method: 'app.models.MobileTransport.create',
            data: options.data
        });
        // Clean object to avoid DataCloneError: Failed to execute 'put' on 'IDBObjectStore': An object could not be cloned.
        const item = JSON.parse(
            JSON.stringify(this.parameterMap(options.data, 'create'))
        );
        /*
        if (item.updated) {
            // Beware! JSON.parse(JSON.stringify(...)) converts dates to ISO Strings, so we need to be consistent
            item.updated = new Date().toISOString();
        }
        */
        if (!item[this.idField]) {
            item.__state__ = STATE.CREATED;
        }
        // Validate item against partition
        const err = this._validate(item);
        if (err) {
            return options.error.apply(this, error2XHR(err));
        }
        // Unless we give one ourselves, the collection will give the item an id
        this._collection
            .insert(item)
            .done(() => {
                // Note: the item now has an id
                options.success({ total: 1, data: [item] });
            })
            .fail(function(error) {
                options.error.apply(this, error2XHR(error));
            });
    },

    /**
     * Destroy
     * @param options
     */
    destroy(options) {
        assert.isPlainObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
        );
        assert.isPlainObject(
            options.data,
            assert.format(assert.messages.isPlainObject.default, 'options.data')
        );
        assert.isFunction(
            options.error,
            assert.format(assert.messages.isFunction.default, 'options.error')
        );
        assert.isFunction(
            options.success,
            assert.format(assert.messages.isFunction.default, 'options.success')
        );
        logger.debug({
            message: 'Destroy mobile data',
            method: 'app.models.MobileTransport.destroy',
            data: options.data
        });
        // Clean object to avoid DataCloneError: Failed to execute 'put' on 'IDBObjectStore': An object could not be cloned.
        const item = JSON.parse(
            JSON.stringify(this.parameterMap(options.data, 'destroy'))
        );
        const idField = this.idField;
        const id = item[idField];
        if (item.__state__ === STATE.CREATED) {
            // Items with __state__ === 'created' can be safely removed because they do not exist on the remote server
            if (RX_MONGODB_ID.test(id)) {
                this._collection
                    .remove({ id })
                    .done(function(response) {
                        if (response && response.nRemoved === 1) {
                            options.success({ total: 1, data: [item] });
                        } else {
                            options.error.apply(
                                this,
                                error2XHR(new Error('Not found'))
                            );
                        }
                    })
                    .fail(function(error) {
                        options.error.apply(this, error2XHR(error));
                    });
            } else {
                // No need to hit the database, it won't be found
                options.error.apply(this, error2XHR(new Error('Not found')));
            }
        } else {
            if (item.updated) {
                // Beware! JSON.parse(JSON.stringify(...)) converts dates to ISO Strings, so we need to be consistent
                item.updated = new Date().toISOString();
            }
            item.__state__ = STATE.DESTROYED;
            // Validate item against partition
            const err = this._validate(item);
            if (err) {
                return options.error.apply(this, error2XHR(err));
            }
            // Execute request
            if (RX_MONGODB_ID.test(id)) {
                item[idField] = undefined;
                this._collection
                    .update({ id }, item)
                    .done(function(response) {
                        if (
                            response &&
                            response.nMatched === 1 &&
                            response.nModified === 1
                        ) {
                            item[idField] = id;
                            options.success({ total: 1, data: [item] });
                        } else {
                            options.error.apply(
                                this,
                                error2XHR(new Error('Not found'))
                            );
                        }
                    })
                    .fail(function(error) {
                        options.error.apply(this, error2XHR(error));
                    });
            } else {
                // No need to hit the database, it won't be found
                options.error.apply(this, error2XHR(new Error('Not found')));
            }
        }
    },

    /**
     * Update
     * @param options
     */
    update(options) {
        assert.isPlainObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
        );
        assert.isPlainObject(
            options.data,
            assert.format(assert.messages.isPlainObject.default, 'options.data')
        );
        assert.isFunction(
            options.error,
            assert.format(assert.messages.isFunction.default, 'options.error')
        );
        assert.isFunction(
            options.success,
            assert.format(assert.messages.isFunction.default, 'options.success')
        );
        logger.debug({
            message: 'Update mobile data',
            method: 'app.models.MobileTransport.update',
            data: options.data
        });
        // Clean object to avoid DataCloneError: Failed to execute 'put' on 'IDBObjectStore': An object could not be cloned.
        const item = JSON.parse(
            JSON.stringify(this.parameterMap(options.data, 'update'))
        );
        if (item.updated) {
            // Beware! JSON.parse(JSON.stringify(...)) converts dates to ISO Strings, so we need to be consistent
            item.updated = new Date().toISOString();
        }
        if ($.type(item.__state__) === UNDEFINED) {
            // Do not change the state of created and destroyed items
            item.__state__ = STATE.UPDATED;
        }
        // Validate item against partition
        const err = this._validate(item);
        if (err) {
            return options.error.apply(this, error2XHR(err));
        }
        // Execute request
        const idField = this.idField;
        const id = item[idField];
        if (RX_MONGODB_ID.test(id)) {
            item[idField] = undefined;
            this._collection
                .update({ id }, item, { upsert: true })
                .done(function(response) {
                    if (
                        response &&
                        response.nMatched === 1 &&
                        response.nModified + response.nUpserted === 1
                    ) {
                        item[idField] = id;
                        options.success({ total: 1, data: [item] });
                    } else {
                        options.error.apply(
                            this,
                            error2XHR(new Error('Not found'))
                        );
                    }
                })
                .fail(function(error) {
                    options.error.apply(this, error2XHR(error));
                });
        } else {
            // No need to hit the database, it won't be found
            options.error.apply(this, error2XHR(new Error('Not found')));
        }
    }
});

/**
 * Default export
 */
export default LocalTransport;

/**
 *  Maintain compatibility with legacy code
 */
window.app = window.app || {};
window.app.models = window.app.models || {};
window.app.models.MobileTransport = LocalTransport;
