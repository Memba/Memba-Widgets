/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import Asset from './models.asset.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

/**
 * AssetDataSource
 * @class AssetDataSource
 * @extends DataSource
 */
const AssetDataSource = DataSource.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        const AssetWithSchemes =
            options && options.schemes
                ? Asset.define({ schemes: options.schemes })
                : Asset;
        DataSource.fn.init.call(
            this,
            $.extend(true, {}, options, {
                schema: {
                    modelBase: AssetWithSchemes,
                    model: AssetWithSchemes
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
AssetDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof AssetDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only AssetDataSource instances are supported'
        );
    }
    return dataSource instanceof AssetDataSource
        ? dataSource
        : new AssetDataSource(dataSource);
};

/**
 * Default export
 */
export default AssetDataSource;
