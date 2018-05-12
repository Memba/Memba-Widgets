/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';

const {
    data: { DataSource },
    ui: { plugin, Widget, DataBoundWidget }
} = window.kendo;
const CHANGE = 'change';

/**
 * DataSourceWidget
 */
const DataSourceWidget = DataBoundWidget.extend({
    /**
     * Constructor
     * @constructor
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        this.wrapper = this.element;
        // this.render();
        // this.enable(this.options.enabled);
        this._dataSource();
    },

    /**
     * Widget events
     */
    events: [CHANGE],

    /**
     * Default options
     */
    options: {
        name: 'DataSourceWidget',
        autoBind: true,
        // enabled: true,
        dataSource: []
    },

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
    },

    /**
     * setDataSource
     * @param dataSource
     */
    setDataSource(dataSource) {
        // set the internal datasource equal to the one passed in by MVVM
        this.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        this._dataSource();
    },

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
    },

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
        DataBoundWidget.fn.destroy.call(this)
    }
});

// Register widget
plugin(DataSourceWidget);
