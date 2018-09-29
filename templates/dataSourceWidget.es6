/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';

const {
    data: { DataSource },
    destroy,
    ui: { plugin, DataBoundWidget }
} = window.kendo;
const CHANGE = 'change';

/**
 * DataSourceWidget
 * @class DataSourceWidget
 * @extends DataBoundWidget
 */
const DataSourceWidget = DataBoundWidget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        this.wrapper = this.element;
        // this._render();
        // this.enable(this.options.enabled);
        this._dataSource();
    },

    /**
     * Events
     * @property events
     */
    events: [CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'DataSourceWidget',
        autoBind: true,
        // enabled: true,
        dataSource: []
    },

    /**
     * _dataSource
     * @method _dataSource
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
     * Set data source
     * @method setDataSource
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
     * @method refresh
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
     * @method destriy
     */
    destroy() {
        if (
            this.dataSource instanceof DataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
    }
});

// Register widget
plugin(DataSourceWidget);
