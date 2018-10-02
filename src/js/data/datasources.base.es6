/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO error?
// TODO timezones?

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './models.base.es6';

const {
    Class,
    data: { DataSource }
} = window.kendo;

/**
 * BaseDataReader
 * @class BaseDataReader
 * @extends Class
 */
const BaseDataReader = Class.extend({
    /**
     * Init
     * @constructor init
     * @param reader
     */
    init(reader) {
        this.reader = reader;
        if (reader.model) {
            this.model = reader.model;
            // Note: we are not using reader.modelBase
        }
        /*
        // See SchedulerDataReader
        const timezone = schema.timezone;
        this.timezone = timezone;
        this.data = wrapDataAccess($.proxy(this.data, this), timezone);
        this.serialize = wrapDataSerialization(
            $.proxy(this.serialize, this),
            timezone
        );
        */
    },

    /**
     * Errors
     * @method errors
     * @param data
     * @returns {*}
     */
    errors(data) {
        return this.reader.errors(data);
    },

    /**
     * Parse
     * Note: Ensures all models have default values event when properties are missing
     * @method parse
     * @param data
     * @returns {*}
     */
    parse(data) {
        debugger;
        assert.isArray(
            data,
            assert.format(assert.messages.isArray.default, 'data')
        );
        assert.ok(
            Object.prototype.isPrototypeOf.call(
                BaseModel.prototype,
                this.model.prototype
            ),
            'The BaseDataSource schema model should derive from BaseModel'
        );
        const { defaults } = this.model.fn;
        for (let i = 0, { length } = data; i < length; i++) {
            // Note: We assume data[i] is an object
            // eslint-disable-next-line no-param-reassign
            data[i] = $.extend({}, defaults, data[i]);
        }
        return this.reader.parse(data);
    },

    /**
     * Data
     * @method data
     * @param data
     * @returns {*}
     */
    data(data) {
        return this.reader.data(data);
    },

    /**
     * Total
     * @method total
     * @param data
     * @returns {*}
     */
    total(data) {
        return this.reader.total(data);
    },

    /**
     * Groups
     * @method groups
     * @param data
     * @returns {*}
     */
    groups(data) {
        return this.reader.groups(data);
    },

    /**
     * Aggregates
     * @method aggregates
     * @param data
     * @returns {*}
     */
    aggregates(data) {
        return this.reader.aggregates(data);
    },

    /**
     * Serialize
     * @method serialize
     * @param data
     * @returns {*}
     */
    serialize(data) {
        return this.reader.serialize(data);
    }
});

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
 * @class BaseDataSource
 * @extends DataSource
 */
const BaseDataSource = DataSource.extend({
    /**
     * @ constructor
     * @param options
     */
    init(options) {
        /**
        var node = Node.define({ children: options });
        if (options.filter && !options.serverFiltering) {
            this._hierarchicalFilter = options.filter;
            options.filter = null;
        }
         */
        DataSource.fn.init.call(
            this,
            $.extend(
                true,
                {
                    schema: {
                        modelBase: BaseModel,
                        model: BaseModel
                    }
                },
                options
            )
        );
        // Let's use a slightly modified reader to leave data conversions to BaseModel._parseData
        // this.reader = new SchedulerDataReader(this.options.schema, this.reader);
        this.reader = new BaseDataReader(this.reader);
        //
        this._attachBubbleHandlers();
    },

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
    _attachBubbleHandlers() {
        const that = this;
        that._data.bind(CONSTANTS.ERROR, e => {
            that.trigger(CONSTANTS.ERROR, e);
        });
    }
    /*
     * // TODO on any error raise a $(document).trigger('dataError');
     * // https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/events/error
     */
});

/**
 * Default export
 */
export default BaseDataSource;
