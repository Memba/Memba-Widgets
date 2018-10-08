/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import Page from './models.page.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

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
        DataSource.fn.init.call(
            this,
            $.extend(true, {}, options, {
                schema: {
                    modelBase: Page,
                    model: Page
                }
            })
        );

        /*
        // PageWithOptions propagates configuration options to PageComponentDataSource
        var PageWithOptions = options && options.schema && ($.type(options.schema.model) === OBJECT) ?
            Page.define({ model: options.schema.model }) : Page;

        // Enforce the use of PageWithOptions items in the page collection data source
        // options contains a property options.schema.model which needs to be replaced with PageWithOptions
        // kidoju.data.DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: PageWithOptions, model: PageWithOptions } }, options));
        DataSource.fn.init.call(this, $.extend(true, {}, options, { schema: { modelBase: PageWithOptions, model: PageWithOptions } }));

        // Let's use a slightly modified reader to leave data conversions to kidoju.data.Model._parseData
        this.reader = new ModelCollectionDataReader(this.reader);
        */
    }

    /**
     * @method remove
     * @param model
     * @returns {*}
     */
    /*
    remove: function (model) {
        return DataSource.fn.remove.call(this, model);
    },
    */

    /**
     * @method insert
     * @param index
     * @param model
     * @returns {*}
     */
    /*
    insert: function (index, model) {
        if (!model) {
            return;
        }
        if (!(model instanceof Page)) {
            var page = model;
            model = this._createNewModel();
            model.accept(page);
        }
        return DataSource.fn.insert.call(this, index, model);
    },
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
            'Incorrect DataSource type. Only PagetDataSource instances are supported'
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
