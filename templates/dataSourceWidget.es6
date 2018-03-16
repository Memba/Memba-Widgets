/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.binder';

const CHANGE = 'change';
const { kendo } = window;
const { data, ui } = kendo;
const { DataSource } = data;

/**
 * DataSourceWidget
 */
export default class DataSourceWidget extends ui.Widget {
    /**
     * DataSourceWidget constructor
     * @param element
     * @param options
     */
    constructor(element, options) {
        super(element, Object.assign({}, DataSourceWidget.options, options));
        this.events = DataSourceWidget.events;
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
            autoBind: true,
            dataSource: []
        });
    }

    /**
     * _dataSource
     * @private
     */
    _dataSource() {
        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource
        if (
            this.dataSource instanceof DataSource &&
            $.isFunction(this._refreshHandler)
        ) {
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
     * Note: we should be more clever and use e.action and e.items
     */
    refresh() {
        let list = '<ul>';
        this.dataSource.view().forEach(item => {
            list += `<li>${item}</li>`;
        });
        list += '</ul>';
        this.element.empty();
        this.element.append(list);
    }

    /**
     * Destroy
     */
    destroy() {
        if (
            this.dataSource instanceof DataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CHANGE, this._refreshHandler);
        }
        super.destroy();
        kendo.destroy(this.element);
    }
}

// Create a jQuery plugin.
ui.plugin(DataSourceWidget);
