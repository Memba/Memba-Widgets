/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO error: errorHandler
// TODO data, error, total

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import PageComponent from './models.pagecomponent.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

/**
 * PageComponentDataSource
 * @class PageComponentDataSource
 * @extends DataSource
 */
const PageComponentDataSource = DataSource.extend({
    init(options) {
        DataSource.fn.init.call(
            this,
            $.extend(true, options, {
                schema: {
                    modelBase: PageComponent,
                    model: PageComponent
                }
            })
        );
    }
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
