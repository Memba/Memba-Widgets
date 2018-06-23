/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import assert from '../common/window.assert.es6';

/**
 * LazyLocalTransport
 */
const LazyLocalTransport = BaseTransport.export({
    /**
     * Init
     * @constructor
     * @param options
     */
    init: function (options) {
        assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
        assert.instanceof(pongodb.Collection, options.collection, assert.format(assert.messages.instanceof.default, 'options.collection', 'pongodb.Collection'));
        this._collection = options.collection;
        models.BaseTransport.fn.init.call(this, options);
    },

    /**
     * Get
     * @param options
     */
    get: function (options) {
        assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
        assert.isPlainObject(options.data, assert.format(assert.messages.isPlainObject.default, 'options.data'));
        assert.isFunction(options.error, assert.format(assert.messages.isFunction.default, 'options.error'));
        assert.isFunction(options.success, assert.format(assert.messages.isFunction.default, 'options.success'));
        logger.debug({
            message: 'Get mobile data',
            method: 'app.models.LazyMobileTransport.get',
            data: options.data
        });
        var data = this.parameterMap(options.data, 'get');
        var query = {};
        query[this.idField] = data[this.idField];
        this._collection.findOne(query, this.projection())
        .done(function (response) {
            options.success(response);
        })
        .fail(function (error) {
            options.error.apply(this, error2XHR(error));
        });
    },

    /**
     * Read
     * @param options
     */
    read: function (options) {
        assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
        // assert.isOptionalObject(options.data, assert.format(assert.messages.isOptionalObject.default, 'options.data')); // because of option.data === {}
        assert.isFunction(options.error, assert.format(assert.messages.isFunction.default, 'options.error'));
        assert.isFunction(options.success, assert.format(assert.messages.isFunction.default, 'options.success'));
        var partition = this.partition();
        logger.debug({
            message: 'Read mobile data',
            method: 'app.models.LazyMobileTransport.read',
            data: options.data
        });
        if ($.type(partition) === UNDEFINED) {
            // This lets us create a dataSource without knowing the partition, which can be set in the load method of the data source
            options.success({ total: 0, data: [] });
        } else {
            var query = this.parameterMap(options.data, 'read');
            app.rapi.util.extendQueryWithPartition(query, partition);
            // Filter all records with __state___ === 'destroyed', considering partition is ignored when false
            query.filter.filters.push({ field: '__state__', operator: 'neq',  value: STATE.DESTROYED });
            query = pongodb.util.convertFilter(options.data.filter);
            this._collection.find(query, this.projection())
            .done(function (response) {
                if ($.isArray(response)) {
                    options.success({ total: response.length, data: response });
                } else {
                    options.error.apply(this, error2XHR(new Error('Database should return an array')));
                }
            })
            .fail(function (error) {
                options.error.apply(this, error2XHR(error));
            });
        }
    }
});

/**
 * Default export
 */
export default LazyLocalTransport;

/**
 *  Maintain compatibility with legacy code
 */
window.app = window.app || {};
window.app.models = window.app.models || {};
window.app.models.LazyMobileTransport = LazyLocalTransport;
