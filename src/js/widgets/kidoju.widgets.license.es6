/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions
import $ from 'jquery';
import 'kendo.binder';
// import assert from '../window.assert.es6';
import CONSTANTS from '../window.constants.es6';
// TODO: import Logger from '../window.logger.es6';

const {
    ui: { plugin, Widget }
} = window.kendo;
const NS = '.kendoLicense';
const WIDGET_CLASS = 'kj-license'; // 'k-widget kj-license';

/*
@see https://en.wikipedia.org/wiki/Creative_Commons_license
Note: reverse the order to get a binary value and convert to decimal
   License     |    attribution    |   shareAlike   |   nonCommercial  |    noDerivative   |   value
   CC0         |         0         |        0       |         0        |         0         |   0000 = 0
   BY          |         1         |        0       |         0        |         0         |   0001 = 1
   BY-NC-ND    |         1         |        0       |         1        |         1         |   1101 = 13
Note: we are only offering 3 licenses, especially discarding SA licenses because a user needs a minimum of points to get indexed
*/
const LICENSES = [0, 1, 13];

/** *****************************************************************************
 * Kendo UI Widget
 ****************************************************************************** */

// TODO Do not forget accepting CC License
// https://creativecommons.org/platform/toolkit/#license-chooser
// See https://creativecommons.org/about/program-areas/education-oer/
// https://creativecommons.org/about/downloads

/**
 * License
 */
const License = Widget.extend({
    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        // logger.debug({ method: 'init', message: 'widget initialized' });
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
        this.value(this.options.value);
        this.enable(this.options.enabled);
    },

    /**
     * Events
     */
    events: [],

    /**
     * Options
     */
    options: {
        name: 'License',
        value: 0,
        enabled: true
    },

    /**
     * Value
     * Note: get/set won't work
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (LICENSES.indexOf(value) > -1) {
            this._value = value;
            this.refresh();
        } else if ($.type(value) === CONSTANTS.NUMBER) {
            throw new RangeError('`value` is expected to be 0, 1 or 13');
        } else {
            throw new TypeError(
                '`value` is expected to be a number or undefined'
            );
        }
        return ret;
    },

    /**
     * Enable/disable the widget
     * @param enabled
     */
    enable(enabled) {
        this._enabled =
            $.type(enabled) === CONSTANTS.UNDEFINED ? true : !!enabled;
        if (this._enabled) {
            this.element.removeClass(CONSTANTS.DISABLED_CLASS);
            this.element.off(NS);
        } else {
            this.element.addClass(CONSTANTS.DISABLED_CLASS);
            this.element.on(CONSTANTS.CLICK + NS, 'a', e => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    },

    /**
     * Refresh
     */
    refresh() {
        /* eslint-disable no-bitwise */
        const by = (this._value & 1) === 1;
        const sa = (this._value & 2) === 2;
        const nc = (this._value & 4) === 4;
        const nd = (this._value & 8) === 8;
        /* eslint-enable no-bitwise */

        if (by) {
            let license = 'by';
            let icons = '<i class="kf kf-cc"></i><i class="kf kf-cc-by"></i>';

            license += sa ? '-sa' : '';
            icons += sa ? '<i class="kf kf-cc-sa"></i>' : '';

            license += nc ? '-nc' : '';
            icons += nc ? '<i class="kf kf-cc-nc"></i>' : '';

            license += nd ? '-nd' : '';
            icons += nd ? '<i class="kf kf-cc-nd"></i>' : '';

            this.element.html(
                `<a rel="license" href="//creativecommons.org/licenses/${license}/4.0/" target="_blank">${icons}</i></a>`
            );
            /*
            <span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/InteractiveResource" property="dct:title" rel="dct:type">Les petits enfants</span>
            by <a xmlns:cc="http://creativecommons.org/ns#" href="https://www.flickr.com/jsmith" property="cc:attributionName" rel="cc:attributionURL">John Smith</a>
            is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>.<br />
            or
            is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.<br/>
            Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="https://www.flickr.com/lespetitsenfants" rel="dct:source">https://www.flickr.com/lespetitsenfants</a>.
             */
        } else {
            this.element.html(
                '<a rel="license" href="//creativecommons.org/publicdomain/zero/1.0/" target="_blank"><i class="kf kf-cc-zero"></i></a>'
            );
            /*
            <p xmlns:dct="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">
                To the extent possible under law, <a rel="dct:publisher" href="https://www.flickr.com/jsmith">
                <span property="dct:title">John Smith</span></a> has waived all copyright and related or neighboring rights to
                <span property="dct:title">Les petits enfants</span>.
                This work is published from: <span property="vcard:Country" datatype="dct:ISO3166" content="LU" about="https://www.flickr.com/jsmith"> Luxembourg</span>.
            </p>
             */
        }
    },

    /**
     * Destroy
     */
    destroy() {
        this.element.off(NS);
        Widget.fn.destroy.call(this);
    }
});

// Register License
plugin(License);
