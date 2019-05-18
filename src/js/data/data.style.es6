/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO add CSS style parser - see ../common/window.style.es6

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import CONSTANTS from '../common/window.constants.es6';
// import Style from '../common/window.style.es6';
import BaseModel from './data.base.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

/**
 * StyleProperty
 * @class StyleProperty
 * @extends BaseModel
 */
const StyleProperty = BaseModel.define({
    id: 'name',
    fields: {
        name: {
            type: CONSTANTS.STRING
        },
        value: {
            type: CONSTANTS.STRING
        }
    }
});

/**
 * StyleDataSource
 * @class StyleDataSource
 * @extends DataSource
 */
const StyleDataSource = DataSource.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        DataSource.fn.init.call(
            this,
            $.extend(true, {}, options, {
                schema: {
                    modelBase: StyleProperty,
                    model: StyleProperty
                }
            })
        );
    },

    parseString() {},

    toString() {},

    parseJSON() {},

    toJSON() {}
});

/**
 * create
 * @method create
 * @param options
 */
StyleDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof StyleDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only StyleDataSource instances are supported'
        );
    }
    return dataSource instanceof StyleDataSource
        ? dataSource
        : new StyleDataSource(dataSource);
};

/**
 * Exports
 */
export { StyleProperty, StyleDataSource };
