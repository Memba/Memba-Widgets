/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import Image from './models.image.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

/**
 * ImageDataSource
 * @class ImageDataSource
 * @extends DataSource
 */
const ImageDataSource = DataSource.extend({
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
                    modelBase: Image,
                    model: Image
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
ImageDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof ImageDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only ImageDataSource instances are supported'
        );
    }
    return dataSource instanceof ImageDataSource
        ? dataSource
        : new ImageDataSource(dataSource);
};

/**
 * Default export
 */
export default ImageDataSource;
