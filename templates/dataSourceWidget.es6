/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery'
import * as kendo from 'kendo.data'
import {ValueWidget} from './valueWidget';

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
        super(element, Object.assign({}, ValueWidget.options, options));
        this.events = ValueWidget.events;
        this._dataSource();
    }

    /**
     * fn static getter
     */
    static get fn() {
        return this;
    }

    /**
     * Default events
     */
    static get events() {
        return [CHANGE];
    }

    /**
     * Default options
     */
    static get options() {
        return Object.assign({}, this.prototype.options, {
            name: 'DataSourceWidget',
            source: [],
            value: ''
        });
    }

    /**
     * _dataSource
     * @private
     */
    _dataSource() {
        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource
        if (this.dataSource instanceof DataSource && $.isFunction(this._refreshHandler)) {
            this.dataSource.unbind(CHANGE, this._refreshHandler);
        } else {
            this._refreshHandler = this.refresh.bind(this);
        }

        // returns the datasource OR creates one if using array or configuration object
        this.dataSource = DataSource.create(this.options.dataSource);
        // bind to the change event to refresh the widget
        this.dataSource.bind(CHANGE, this._refreshHandler);

        if (this.options.autoBind) {
            this.dataSource.fetch();
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

// Create a jQuery plugin.
ui.plugin(DataSourceWidget);
