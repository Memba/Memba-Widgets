/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import ImageDataSource from '../data/datasources.image.es6';

const {
    destroy,
    htmlEncode,
    keys,
    ui: { plugin, DataBoundWidget }
} = window.kendo;
const logger = new Logger('widgets.imageset');
const NS = '.kendoImageSet';
const WIDGET_CLASS = 'kj-imageset kj-interactive';

/**
 * ImageSet
 * @class ImageSet
 * @extends DataBoundWidget
 */
const ImageSet = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'Widget initialized' });
        this._render();
        this._dataSource();
        this.value(this.options.value);
        this.enable(
            this.element.prop('disabled') ? false : this.options.enabled
        );
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'ImageSet',
        autoBind: true,
        dataSource: [],
        enabled: true,
        height: 100,
        value: null,
        width: 100
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value
     * @method value
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        const { element } = this;
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = element.val();
        } else if (
            this.dataSource instanceof ImageDataSource &&
            this.dataSource.total() > 0 &&
            value !== element.val()
        ) {
            // text is models.image id, so we can use get
            if (this.dataSource.get(value)) {
                element.val(value);
            } else {
                // By default, show the first image
                element.val(this.dataSource.at(0).text);
            }
            this.refresh();
        }
        return ret;
    },

    /**
     * Items
     * @returns {Array}
     */
    items() {
        return [];
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        assert.ok(
            element.is(CONSTANTS.INPUT),
            'Please use an input tag to instantiate an ImageSet widget.'
        );
        this.wrapper = this.element
            .wrap(
                $(`<${CONSTANTS.DIV}/>`)
                    .height(options.height)
                    .width(options.width)
                    .css({
                        cursor: 'pointer',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        display: 'inline-block',
                        outline: 0
                    })
                    .attr({
                        role: 'button'
                    })
                    .addClass(WIDGET_CLASS)
            )
            .parent();
        this.element.hide();
    },

    /**
     * _dataSource
     * @method _dataSource
     * @private
     */
    _dataSource() {
        // if the DataSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the DataSource

        // There is no reason why, in its current state, it would not work with any dataSource
        // if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
        if (
            this.dataSource instanceof ImageDataSource &&
            this._refreshHandler
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
        }

        if (this.options.dataSource !== CONSTANTS.NULL) {
            // use null to explicitly destroy the dataSource bindings
            // returns the datasource OR creates one if using array or configuration object
            this.dataSource = ImageDataSource.create(this.options.dataSource);

            this._refreshHandler = this.refresh.bind(this);

            // bind to the change event to refresh the widget
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * Set a new data source
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
     * Enable/Disable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const { wrapper } = this;
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        wrapper.attr({ tabindex: -1 }).off(NS);
        if (enabled) {
            wrapper
                .attr({ tabindex: 0 }) // This is required for the element to get the focus and support keydown events
                .on(
                    `${CONSTANTS.CLICK}${NS}${CONSTANTS.TOUCHEND}${NS}`,
                    this._onClick.bind(this)
                )
                .on(`${CONSTANTS.KEYDOWN}${NS}`, this._onKeyDown.bind(this));
        }
    },

    /**
     * Event handler for the click event
     * @method _onClick
     * @param e
     * @private
     */
    _onClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const { dataSource, element } = this;
        let image = dataSource.get(this.value());
        const oldIndex = dataSource.indexOf(image);
        let newIndex = oldIndex;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
            newIndex = oldIndex === 0 ? dataSource.total() - 1 : oldIndex - 1;
        } else {
            newIndex = oldIndex === dataSource.total() - 1 ? 0 : oldIndex + 1;
        }
        if (oldIndex !== newIndex) {
            image = dataSource.at(newIndex);
            element.val(image.text);
            this.refresh();
            this.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Event handler for the keydown event (which is enabled by tabindex=0)
     * @method _onKeyDown
     * @param e
     * @private
     */
    _onKeyDown(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const { dataSource, element } = this;
        let image = dataSource.get(this.value());
        const oldIndex = dataSource.indexOf(image);
        let newIndex = oldIndex;
        switch (e.which) {
            case keys.DOWN:
            case keys.LEFT:
                newIndex =
                    oldIndex === 0 ? dataSource.total() - 1 : oldIndex - 1;
                break;
            case keys.RIGHT:
            case keys.UP:
            case keys.SPACEBAR:
                newIndex =
                    oldIndex === dataSource.total() - 1 ? 0 : oldIndex + 1;
                break;
            case keys.END:
            case keys.PAGEUP:
                newIndex = dataSource.total() - 1;
                break;
            case keys.HOME:
            case keys.PAGEDOWN:
                newIndex = 0;
                break;
            default:
                break;
        }
        if (newIndex !== oldIndex) {
            image = dataSource.at(newIndex);
            element.val(image.text);
            this.refresh();
            this.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const { dataSource, wrapper } = this;
        const image = dataSource.get(this.value());
        if (image) {
            wrapper.attr({ title: htmlEncode(image.text) }).css({
                backgroundImage: `url(${window.encodeURI(image.url)})`
            });
        }
        logger.debug({ method: 'refresh', message: 'Widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { wrapper } = this;
        // Unbind events
        wrapper.off(NS);
        // Destroy widget
        DataBoundWidget.fn.destroy.call(this);
        destroy(wrapper);
        logger.debug({ method: 'destroy', message: 'Widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(ImageSet);
