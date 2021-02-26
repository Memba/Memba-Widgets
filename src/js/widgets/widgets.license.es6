/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.license');
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
 * @class License
 * @extends Widget
 */
const License = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
        this.value(this.options.value);
        this.enable(this.options.enabled);
    },

    /**
     * Events
     * @field
     */
    events: [CONSTANTS.CLICK],

    /**
     * Options
     * @field
     */
    options: {
        name: 'License',
        value: 0,
        enabled: true,
    },

    /**
     * Value
     * Note: get/set won't work
     * @method
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (LICENSES.indexOf(value) > -1) {
            this._value = value;
            this.refresh();
        } else {
            throw new RangeError('`value` is expected to be 0, 1 or 13');
        }
        return ret;
    },

    /**
     * Enable/disable the widget
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        if (enabled) {
            this.element.removeClass(CONSTANTS.DISABLED_CLASS);
            this.element.off(`${CONSTANTS.CLICK}${NS}`);
        } else {
            this.element.addClass(CONSTANTS.DISABLED_CLASS);
            this.element.on(`${CONSTANTS.CLICK}${NS}`, 'a', (e) => {
                e.preventDefault();
                this.trigger(CONSTANTS.CLICK);
            });
        }
    },

    /**
     * Refresh
     * @method refresh
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
                '<a rel="license" href="//creativecommons.org/publicdomain/zero/1.0/" target="_blank"><i class="kf kf-cc-zero"/></a>'
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
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.enable(false);
        Widget.fn.destroy.call(this);
        logger.debug({ destroy: 'init', message: 'widget destroyed' });
        destroy(this.element);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'License')) {
    // Prevents loading several times in karma
    plugin(License);
}
