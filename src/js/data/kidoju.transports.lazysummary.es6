/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import assert from '../common/window.assert.es6';
import BaseTransport from './kidoju.transports.base.es6';

/**
 * LazyRemoteTransport
 * A read-only transport
 */
const LazyRemoteTransport = BaseTransport.extend({
    /**
     * Init
     * @constructor
     * @param options
     */
    init(options) {
        assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
        assert.isFunction(options.collection, kendo.format(assert.messages.isFunction.default, 'options.collection'));
        this._collection = options.collection; // Something like app.rapi.v2.activities
        BaseTransport.fn.init.call(this, options);
    },

    /**
     * Gets/sets a partition
     * @param value
     */
    partition(value) {
        if ($.type(value) === UNDEFINED) {
            return models.BaseTransport.fn.partition.call(this);
        } else {
            models.BaseTransport.fn.partition.call(this, value);
            this._rapi = this._collection(this._partition);
            assert.isFunction(this._rapi.create, kendo.format(assert.messages.isFunction.default, 'this._rapi.create'));
            assert.isFunction(this._rapi.destroy, kendo.format(assert.messages.isFunction.default, 'this._rapi.destroy'));
            assert.isFunction(this._rapi.get, kendo.format(assert.messages.isFunction.default, 'this._rapi.get'));
            assert.isFunction(this._rapi.read, kendo.format(assert.messages.isFunction.default, 'this._rapi.read'));
            assert.isFunction(this._rapi.update, kendo.format(assert.messages.isFunction.default, 'this._rapi.update'));
        }
    },

    /**
     * Get
     * @param options
     */
    get: function (options) {
        assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
        assert.isPlainObject(options.data, kendo.format(assert.messages.isPlainObject.default, 'options.data'));
        assert.isFunction(options.error, kendo.format(assert.messages.isFunction.default, 'options.error'));
        assert.isFunction(options.success, kendo.format(assert.messages.isFunction.default, 'options.success'));
        // Fields are part of options.data, filter and sort order are not applicable
        var data = this.parameterMap(options.data, 'get');
        this._rapi.get(data[this.idField], { fields: data.fields }).done(options.success).fail(options.error);
    },

    /**
     * Read
     * @param options
     */
    read: function (options) {
        assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
        assert.isPlainObject(options.data, kendo.format(assert.messages.isPlainObject.default, 'options.data'));
        assert.isFunction(options.error, kendo.format(assert.messages.isFunction.default, 'options.error'));
        assert.isFunction(options.success, kendo.format(assert.messages.isFunction.default, 'options.success'));
        var partition = this.partition();
        if ($.type(partition) === UNDEFINED) {
            // This lets us create a dataSource without knowing the partition, which can be set in the load method of the data source
            options.success({ total: 0, data: [] });
        } else {
            // Fields, filters and default sort order are part of options.data
            var data = this.parameterMap(options.data, 'read');
            // data.partition = undefined;
            this._rapi.read(data).done(options.success).fail(options.error);
        }
    }
});

/**
 * Default export
 */
export default LazyRemoteTransport;
