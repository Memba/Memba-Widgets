/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO See https://github.com/Khan/math-input
// TODO See also https://mathlive.io

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    caret,
    destroy,
    format,
    ui: { plugin, Widget }
} = window.kendo;

const logger = new Logger('widgets.keypad');
const NS = '.kendoKeyPad';

/**
 * KeyPad
 * @class KeyPad
 * @extends Widget
 */
const KeyPad = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.enable(this.options.enabled);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'KeyPad',
        enabled: true
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a KeyPad widget.'
        );
    },

    /**
     * enable/disable
     * @method enable
     * @param enable
     * @private
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;

        if (enabled) {
            $.noop();
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.enable(false);
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(KeyPad);
