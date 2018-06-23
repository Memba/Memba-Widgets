/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import LazyRemoteTransport from './transports.lazyremote.es6';

/**
 * RemoteTransport (all CRUD operations with rapi)
 */
const RemoteTransport = LazyRemoteTransport.extend({
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
        const data = this.parameterMap(options.data, 'create');
        // Validate data against partition
        const err = this._validate(data);
        if (err) {
            return options.error.apply(this, error2XHR(err));
        }
        // Execute request
        this._rapi
            .create(data)
            .done(response => {
                options.success({ total: 1, data: [response] });
            })
            .fail(options.error);
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
        const data = this.parameterMap(options.data, 'destroy');
        // Validate data against partition
        const err = this._validate(data);
        if (err) {
            return options.error.apply(this, error2XHR(err)); // TODO review error2XHR
        }
        // Execute request
        this._rapi
            .destroy(data[this.idField])
            .done(response => {
                options.success({ total: 1, data: [response] });
            })
            .fail(options.error);
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
        const data = this.parameterMap(options.data, 'update');
        // Validate data against partition
        const err = this._validate(data);
        if (err) {
            return options.error.apply(this, error2XHR(err));
        }
        // TODO: filter dirty fields --------------------------------
        // Execute request
        this._rapi
            .update(data[this.idField], data)
            .done(response => {
                options.success({ total: 1, data: [response] });
            })
            .fail(options.error);
    }
});

/**
 * Default export
 */
export default RemoteTransport;

/**
 * Maintain compatibility with legacy code
 */
window.app = window.app || {};
window.app.models = window.app.models || {};
window.app.models.RemoteTransport = RemoteTransport;
