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
import PageComponent from './models.pagecomponent.es6';

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
 * PageComponentDataSource
 * @class PageComponentDataSource
 * @extends DataSource
 */
const PageComponentDataSource = DataSource.extend({
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
                        PageComponent.prototype,
                        options.schema.model.prototype
                    ),
                '`model` should derive from PageComponent'
            );
            assert.ok(
                $.type(options.schema.modelBase) === CONSTANTS.UNDEFINED ||
                    Object.prototype.isPrototypeOf.call(
                        PageComponent.prototype,
                        options.schema.modelBase.prototype
                    ),
                '`modelBase` should derive from PageComponent'
            );

            // Propagates Page options to PageComponentDataSource
            // especially in the case where the stream is defined with
            // a hierarchy of CRUD transports
            if ($.isPlainObject(options.schema.model)) {
                $.extend(true, options, {
                    schema: {
                        modelBase: PageComponent.define(
                            $.isPlainObject(options.schema.modelBase)
                                ? options.schema.modelBase
                                : options.schema.model
                        ),
                        model: PageComponent.define(options.schema.model)
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
                        modelBase: PageComponent,
                        model: PageComponent
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
 * create
 * @method create
 * @param options
 */
PageComponentDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof PageComponentDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only PageComponentDataSource instances are supported'
        );
    }
    return dataSource instanceof PageComponentDataSource
        ? dataSource
        : new PageComponentDataSource(dataSource);
};

/**
 * Default export
 */
export default PageComponentDataSource;
