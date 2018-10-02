/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO error?

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import BaseDataSource from './datasources.base.es6';
import Page from './models.page.es6';

/**
 * PageCollectionDataSource
 * @class PageCollectionDataSource
 * @extends BaseDataSource
 */
const PageCollectionDataSource = BaseDataSource.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        BaseDataSource.fn.init.call(
            this,
            $.extend(true, options, {
                schema: {
                    modelBase: Page,
                    model: Page
                }
            })
        );

        /*
        // PageWithOptions propagates configuration options to PageComponentCollectionDataSource
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
PageCollectionDataSource.create = function (options) {
    options = options && options.push ? { data: options } : options;

    var dataSource = options || {};
    var data = dataSource.data;

    dataSource.data = data;

    if (!(dataSource instanceof PageCollectionDataSource) && dataSource instanceof kendo.data.DataSource) {
        throw new Error('Incorrect DataSource type. Only PageCollectionDataSource instances are supported');
    }

    return dataSource instanceof PageCollectionDataSource ? dataSource : new PageCollectionDataSource(dataSource);
};



/**
 * Default export
 */
export default PageCollectionDataSource;
