/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    data: { DataSource },
    destroy,
    template,
    ui: { plugin, DataBoundWidget }
} = window.kendo;
const logger = new Logger('widgets.template');
const WIDGET_CLASS = 'kj-template'; // 'k-widget kj-template';

/**
 * Template
 * @class Template
 * @extends DataBoundWidget
 */
const Template = DataBoundWidget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'Widget initialized' });
        this._initTemplate();
        this._render();
        this._dataSource();
        this.value(this.options.value);
    },

    /**
     * Options
     * @property options
     */
    options: {
        autoBind: true,
        dataSource: [],
        name: 'Template',
        template: '',
        value: {},
        valueField: null
    },

    /**
     * Events
     * @property events
     */
    events: [
        // call before mutating DOM.
        // mvvm will traverse DOM, unbind any bound elements or widgets
        CONSTANTS.DATABINDING,
        // call after mutating DOM
        // traverses DOM and binds ALL THE THINGS
        CONSTANTS.DATABOUND
    ],

    /**
     * Value
     * Data to be merged with the template
     * @method value
     * @param value
     * @return {*}
     */
    value(value) {
        // TODO assert value
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * UI items
     * Note: required by MVVM
     * @method items
     */
    items() {
        return []; // this.element.children();
    },

    /**
     * Init template
     * @method _initTemplate
     * @private
     */
    _initTemplate() {
        const t = this.options.template;
        if ($.type(t) === CONSTANTS.STRING && t.length) {
            // try to find a script tag on the page
            // but Kendo UI should normally have found it
            // and t should already be a function in this case
            const script = $(`script#${t}[type="text/x-kendo-template"]`);
            if (script.length) {
                this._template = template(script.html());
            } else {
                this._template = template(t);
            }
        } else if ($.isFunction(t)) {
            // Hopefully, this is kendo.template function
            this._template = t;
        }
    },

    /**
     * _render
     * @method _render
     * @private
     */
    _render() {
        const { element } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
    },

    /**
     * Set a dataSource
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
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHander = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = DataSource.create(this.options.dataSource);

            // bind to the change event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * Set a data source
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
     * Merge template with data
     * @param data
     */
    template(data) {
        let ret;
        try {
            ret = this._template(data);
        } catch (ex) {
            ret = `<span style="color: #f00;">${ex.message}</span>`;
        }
        return ret;
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const { element, options } = this;
        element.children().each((index, item) => {
            destroy(item);
        });
        element.empty();
        if ($.isFunction(this._template)) {
            if (
                $.type(options.valueField) === CONSTANTS.STRING &&
                this.dataSource instanceof DataSource
            ) {
                this.trigger(CONSTANTS.DATABINDING);
                // This requires that this.value() be the idField
                // const data = this.dataSource.get(this.value());
                // The following makes it possible to use any field
                const data = this.dataSource
                    .data()
                    .find(item => item[options.valueField] === this.value());
                if ($.type(data) !== CONSTANTS.UNDEFINED) {
                    element.html(this.template(data));
                }
                this.trigger(CONSTANTS.DATABOUND);
            } else {
                const value = this.value();
                if ($.type(value) !== CONSTANTS.UNDEFINED) {
                    element.html(this.template(value));
                }
            }
            logger.debug({ method: 'refresh', message: 'Widget refreshed' });
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.setDataSource(null);
        this._template = undefined;
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(Template);
