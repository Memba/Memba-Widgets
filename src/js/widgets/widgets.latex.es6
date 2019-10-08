/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import katex from '../vendor/khan/katex.mjs';
import '../vendor/khan/contrib/mhchem.mjs';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    htmlEncode,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.latex');
const WIDGET_CLASS = /* 'k-widget */ 'kj-latex';

/**
 * Latex
 * @class Latex
 * @extends Widget
 */
const Latex = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.value(this.options.value);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Latex',
        value: null,
        errorColor: '#cc0000',
        inline: false
    },

    /**
     * Value for MVVM binding
     * @method value
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                value,
                CONSTANTS.STRING
            )
        );
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
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        assert.isFunction(
            katex && katex.render,
            assert.format(assert.messages.isFunction.default, 'katex.render')
        );
        const { element, options } = this;
        // KaTeX option { throwOnError: false } is not equivalent to the following which is required to display an error
        try {
            katex.render(this.value() || '', element[0], {
                displayMode: !options.inline
            });
        } catch (ex) {
            element.html(
                `<span style="color:${options.errorColor}">${htmlEncode(
                    ex.message
                )}</span>`
            );
        }
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Latex')) {
    // Prevents loading several times in karma
    plugin(Latex);
}
