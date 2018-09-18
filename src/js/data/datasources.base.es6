/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
// import $ from 'jquery';
import 'kendo.data';
// import assert from '../common/window.assert.es6';
// import CONSTANTS from '../common/window.constants.es6';

const {
    data: { DataSource }
} = window.kendo;

/*
function dataMethod(name) {
    return function () {
        const data = this._data;
        const result = DataSource.fn[name].apply(this, slice.call(arguments));
        if (this._data != data) {
            this._attachBubbleHandlers();
        }
        return result;
    };
}
*/

/**
 * BaseDataSource
 * Note: enhances kendo.data.DataSource
 */
const BaseDataSource = DataSource.extend({
    /**
     * @ constructor
     * @param options
     */
    // init: dataMethod('init'),
    /**
     * @method success
     */
    // success: dataMethod('success'),
    /**
     * @method data
     */
    // data: dataMethod('data'),
    /**
     * @method _attachBubbleHandlers
     * @private
     */
    /*
     _attachBubbleHandlers: function () {
         var that = this;
         that._data.bind(ERROR, function (e) {
            that.trigger(ERROR, e);
         });
     },
     */
    /*
     * // TODO on any error raise a $(document).trigger('dataError');
     * // https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/events/error
     */
});

/**
 * Default export
 */
export default BaseDataSource;
