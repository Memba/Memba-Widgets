/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery'
import * as kendo from 'kendo.data'

const CHANGE = 'change';
const ui = kendo.ui;
const data = kendo.data;
const DataSource = data.DataSource;

/**
 * DataSourceWidget
 */
export class DataSourceWidget extends ui.Widget {

    /**
     * DataSourceWidget constructor
     * @param element
     * @param options
     */
    constructor(element, options) {
        super(element, options);
        this._dataSource();
    }

    /**
     * _dataSource
     * @private
     */
    _dataSource() {
        let that = this;

        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource
        if (that.dataSource instanceof DataSource && $.isFunction(that._refreshHandler)) {
            that.dataSource.unbind(CHANGE, that._refreshHandler);
        } else {
            that._refreshHandler = $.proxy(that.refresh, that);
        }

        // returns the datasource OR creates one if using array or configuration object
        that.dataSource = DataSource.create(that.options.dataSource);
        // bind to the change event to refresh the widget
        that.dataSource.bind(CHANGE, that._refreshHandler);

        if (that.options.autoBind) {
            that.dataSource.fetch();
        }
    }

    /**
     * setDataSource
     * @param dataSource
     */
    setDataSource(dataSource) {
        // set the internal datasource equal to the one passed in by MVVM
        this.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        this._dataSource();
    }

    /**
     * Refresh
     */
    refresh() {
        this.element.text(this._value);
    }

    /**
     * Destroy
     */
    destroy() {
        let that = this;
        if (that.dataSource instanceof DataSource && $.isFunction(that._refreshHandler)) {
            that.dataSource.unbind(CHANGE, that._refreshHandler);
        }
        super.destroy();
        kendo.destroy(this.element);
    }
}

// Add options
DataSourceWidget.prototype.options = {
    source: undefined,
    value: ''
};
// Add events
DataSourceWidget.prototype.events = [ 'change' ];
// Create an alias of the prototype (required by kendo.ui.plugin)
DataSourceWidget.fn = DataSourceWidget.prototype;
// Create a jQuery plugin.
ui.plugin(DataSourceWidget);
