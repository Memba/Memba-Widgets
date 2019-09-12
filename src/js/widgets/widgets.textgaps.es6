/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    compareBasicArrays,
    getSelection,
    isAnyArray,
    setSelection
} from '../common/window.util.es6';

const {
    destroy,
    format,
    htmlEncode,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.textgaps');
const NS = '.kendoTextGaps';
const WIDGET_CLASS = 'kj-textgaps'; // 'k-widget kj-textgaps';
const INPUT_SELECTOR = '.kj-textgaps-input';
const INPUT_TEMPLATE = '<div class="{0}" style="{1}"></div>'; // we need a div to set a min-width

/**
 * TextGaps
 * @class TextGaps
 * @extends Widget
 */
const TextGaps = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.value(this.options.value);
        this.enable(this.options.enabled);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'TextGaps',
        value: [],
        text: '',
        input: '\\[\\]', // backslahes are required for regular expressions, but this should be read []
        inputStyle: '',
        enabled: true
    },

    /**
     * Events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value for MVVM binding
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if ($.type(value) === CONSTANTS.NULL || isAnyArray(value)) {
            if (!compareBasicArrays(this._value, value || [])) {
                this._value = value || [];
                this.refresh();
            }
        } else {
            throw new TypeError(
                '`value` is expected to be an array if not null or undefined'
            );
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        const input = format(
            INPUT_TEMPLATE,
            INPUT_SELECTOR.substr(1),
            options.inputStyle
        );
        const html = htmlEncode(options.text).replace(
            new RegExp(options.input, 'g'),
            input
        );
        this.element.html(html);
    },

    /**
     * enable function for bindings
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        this.element.children(INPUT_SELECTOR).prop('contenteditable', enabled);
        this.element.off(NS);
        if (enabled) {
            this.element
                .on(
                    `${CONSTANTS.PASTE}${NS}`,
                    INPUT_SELECTOR,
                    this._onPaste.bind(this)
                )
                .on(
                    `${CONSTANTS.INPUT}${NS}`,
                    INPUT_SELECTOR,
                    this._onInput.bind(this)
                );
        }
    },

    /**
     * Paste envent handler
     * Used to sanitize HTML pasted content
     * @see https://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718
     * @private
     */
    _onPaste(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            HTMLDivElement,
            e.target,
            assert.format(
                assert.messages.instanceof.default,
                'e.target',
                'HTMLDivElement'
            )
        );

        // Stop data actually being pasted into div
        e.stopPropagation();
        e.preventDefault();

        // Get pasted data via clipboard API
        const clipboardData =
            e.originalEvent.clipboardData || window.clipboardData;
        if (clipboardData && $.isFunction(clipboardData.getData)) {
            let paste = clipboardData.getData('Text');
            if ($.type(paste) === CONSTANTS.STRING) {
                paste = htmlEncode(paste);
                const selection = getSelection(e.target);
                const text = $(e.target).text();
                const start = text.substr(0, selection.start);
                const end = text.substr(selection.end);
                const pos = (start + paste).length;
                $(e.target).text(start + paste + end);
                setSelection(e.target, { start: pos, end: pos });
            }
        }
    },

    /**
     * Input event hander
     * @method _onInput
     * @param e
     * @private
     */
    _onInput(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            HTMLDivElement,
            e.target,
            assert.format(
                assert.messages.instanceof.default,
                'e.target',
                'HTMLDivElement'
            )
        );
        const input = $(e.target);
        const index = this.element.children(INPUT_SELECTOR).index(input);
        this._value[index] = input.text();
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        this.element.children(INPUT_SELECTOR).each((index, htmlElement) => {
            if ($(htmlElement).text() !== this._value[index]) {
                $(htmlElement).text(this._value[index]);
            }
        });
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.enable(false);
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(TextGaps);
