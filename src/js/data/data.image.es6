/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assets from '../app/app.assets.es6';
import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './data.base.es6';

const {
    data: { DataSource, ObservableArray },
} = window.kendo;

/**
 * Image
 * @class Image
 * @extends BaseModel
 */
const Image = BaseModel.define({
    id: 'text', // `text` is used for component validation
    fields: {
        text: {
            type: CONSTANTS.STRING,
            /*
            // Note: validation is handled in ../widgets/widgets.imagelist
            validation: {
                required: true,
                pattern: '^\\S.{0,99}$'
            }
            */
        },
        url: {
            type: CONSTANTS.STRING,
            /*
            // Note: validation is handled in ../widgets/widgets.imagelist
            validation: {
                required: true
            }
            */
        },
    },
    url$() {
        const url = this.get('url');
        return assets.image.scheme2http(url);
    },
});

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
                    model: Image,
                },
            })
        );
    },
});

/**
 * create
 * @method create
 * @param options
 */
ImageDataSource.create = (options) => {
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
 * Export
 */
export { Image, ImageDataSource };
