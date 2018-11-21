/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add selector for ignore case option
// TODO Add button to open www.regexr.com
// TODO Look at https://github.com/gskinner/regexr

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CodeMirror from '../vendor/codemirror/lib/codemirror';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { escapeRegExp } from '../common/window.util.es6';
import JSHINT from '../vendor/codemirror/addon/lint/jshint';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.regexp');
const NS = '.kendoRegExpInput';
const WIDGET_CLASS = 'kj-regexp'; // 'k-widget kj-regexp';
const INPUT_CLASS = 'k-textbox kj-regexp-input';

/**
 * RegExpInput
 * @class RegExpInput
 * @extends Widget
 */
const RegExpInput = Widget.extend({
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
        this.setOptions({
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            value: this.options.value
        });
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'RegExpInput',
        enabled: true,
        value: ''
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    setOptions(options) {
        this.enable(options.enabled);
        this.value(options.value);
    },

    /**
     * Value
     * Note: ES6 get/set won't work with MVVM
     * @method value
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this.element.val();
        } else if (this.element.val() !== value) {
            this.element = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * _render
     * @private
     */
    _render() {
        this.element.addClass(INPUT_CLASS).wrap(`<${CONSTANTS.DIV}/>`);
        this.wrapper = this.element.parent().addClass(WIDGET_CLASS);



        const that = this;
        const { element, options } = that;
        const div = $(`<${CONSTANTS.DIV}/>`)
        .addClass('kj-codeeditor-editor')
        .appendTo(element);

        // Initialize JSHINT
        window.JSHINT = window.JSHINT || JSHINT;

        // Initialize CodeMirror
        that.codeMirror = CodeMirror(div.get(0), {
            gutters: ['CodeMirror-lint-markers'],
            lineNumbers: true,
            lint: true,
            mode: 'javascript',
            value: ''
        });

        // Prevent from modifying first lines and last line
        that.codeMirror.on(BEFORECHANGE, (cm, change) => {
            if (change.origin === 'setValue') {
                return; // updated using this.value(value)
            }
            // if updated by typing into the code editor
            if (
                change.from.line === 0 || // prevent changing the first line
                change.from.line === cm.display.renderedView.length - 1 || // prevent changing the last line
                (change.origin === '+delete' &&
                    change.to.line === cm.display.renderedView.length - 1)
            ) {
                // prevent backspace on the last line or suppr on the previous line
                // cancel change
                change.cancel();
            }
        });

        // Synchronize drop down list with code editor to display `custom` upon any change
        that.codeMirror.on(CONSTANTS.CHANGE, this._onUserInputChange.bind(this));

        // Otherwise gutters and line numbers might be misaligned
        that.codeMirror.refresh();

    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        this.element.val(this._value);
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { element } = this;

        if (enabled) {

        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(RegExpInput);
