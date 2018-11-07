/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Page from './models.page.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

/**
 * dataMethod
 * @function dataMethod
 * Note: as in kendo.data.HierarchicalDataSource
 * @param name
 * @returns {function(...[*]=): *}
 */
/*
function dataMethod(name) {
    return function(...args) {
        const data = this._data;
        const result = DataSource.fn[name].apply(
            this,
            Array.prototype.slice.call(args)
        );
        if (this._data !== data) {
            this._attachBubbleHandlers();
        }
        return result;
    };
}
*/

/**
 * PageDataSource
 * @class PageDataSource
 * @extends DataSource
 */
const PageDataSource = DataSource.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        if (options && options.schema) {
            assert.ok(
                $.type(options.schema.model) === CONSTANTS.UNDEFINED ||
                    Object.prototype.isPrototypeOf.call(
                        Page.prototype,
                        options.schema.model.prototype
                    ),
                '`model` should derive from Page'
            );
            assert.ok(
                $.type(options.schema.modelBase) === CONSTANTS.UNDEFINED ||
                    Object.prototype.isPrototypeOf.call(
                        Page.prototype,
                        options.schema.modelBase.prototype
                    ),
                '`modelBase` should derive from Page'
            );

            // Propagates Page options to PageComponentDataSource
            // especially in the case where the wtream is defined with
            // a hierarchy of CRUD transports
            if ($.isPlainObject(options.schema.model)) {
                $.extend(true, options, {
                    schema: {
                        modelBase: Page.define(
                            $.isPlainObject(options.schema.modelBase)
                                ? options.schema.modelBase
                                : options.schema.model
                        ),
                        model: Page.define(options.schema.model)
                    }
                });
            }
        }

        DataSource.fn.init.call(
            this,
            $.extend(
                true,
                {
                    schema: {
                        modelBase: Page,
                        model: Page
                    }
                },
                options
            )
        );

        // See https://www.telerik.com/forums/_attachbubblehandlers
        // this._attachBubbleHandlers();
    }

    /**
     * _attachBubbleHandlers
     * @method _attachBubbleHandlers
     * @private
     */
    /*
    _attachBubbleHandlers() {
        const that = this;
        that._data.bind(CONSTANTS.ERROR, e => {
            that.trigger(CONSTANTS.ERROR, e);
        });
    },

    success: dataMethod('success'),
    data: dataMethod('data')
    */
});

/**
 * @method create
 * @param options
 */
PageDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof PageDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only PageDataSource instances are supported'
        );
    }
    return dataSource instanceof PageDataSource
        ? dataSource
        : new PageDataSource(dataSource);
};

/**
 * Default export
 */
export default PageDataSource;
