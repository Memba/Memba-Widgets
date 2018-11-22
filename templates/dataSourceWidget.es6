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
const NULL = 'null';
const UNDEFINED = 'undefined';
// const NS = '.kendoDataSourceWidget';
const WIDGET_CLASS = 'k-widget kj-data-source-widget';

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
        this._render();
        this.setOptions({
            autoBind: this.options.autoBind,
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            dataSource: this.options.dataSource
        });
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
        enabled: true,
        dataSource: []
    },

    /**
     * setOptions
     * @param options
     */
    setOptions(options) {
        this.options.autoBind = options.autoBind;
        this.enable(options.enabled);
        this.setDataSource(options.dataSource);
    },

    /**
     * _render
     * @method
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
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
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== NULL) {
            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = DataSource.create(this.options.dataSource);

            // bind to the change event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
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
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled = $.type(enable) === UNDEFINED ? true : !!enable;
        // Do something with enabled
        this._enabled = enabled;
    },

    /**
     * Destroy
     * @method destriy
     */
    destroy() {
        this.setDataSource(null);
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(DataSourceWidget);
