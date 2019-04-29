/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add flags including case insensitive
// TODO Add button to open https://regexr.com?expression=([A-B]*[0-9])\w+
// Add safe-regex to test regex

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CodeMirror from '../vendor/codemirror/lib/codemirror';
import '../vendor/codemirror/mode/regex/regex.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { escapeRegExp } from '../common/window.util.es6';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.regex');
const NS = '.kendoRegEx';
const WIDGET_CLASS = 'kj-regex k-input k-textbox'; // 'k-widget kj-regex';

/**
 * RegEx
 * @class RegEx
 * @extends Widget
 */
const RegEx = Widget.extend({
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
        name: 'RegEx',
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
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this.codeMirror.getDoc().getValue();
        } else if (this.codeMirror.getDoc().getValue() !== value) {
            // TODO Handle null
            this.codeMirror.getDoc().setValue(value);
            this.refresh();
        }
        return ret;
    },

    /**
     * _render
     * @private
     */
    _render() {
        assert.ok(
            this.element.is(CONSTANTS.DIV),
            'Please instantiate this widget with a <div/>'
        );
        const { element, options } = this;
        this.wrapper = element.addClass(WIDGET_CLASS);
        $(`<${CONSTANTS.DIV}/>`).append(CONSTANTS.SLASH).appendTo(element);
        const editorDiv = $(`<${CONSTANTS.DIV}/>`).appendTo(element);

        // TODO See correct options at
        // https://stackoverflow.com/questions/13026285/codemirror-for-just-one-line-textfield
        // https://github.com/gskinner/regexr/blob/master/dev/src/utils/CMUtils.js

        // Initialize CodeMirror
        this.codeMirror = CodeMirror(editorDiv.get(0), {
            lineNumbers: false,
            mode: 'regex',
            scrollbarStyle: null
            /*
            tabSize: 3,
            indentWithTabs: true
            extraKeys: {},
            specialChars: /[ \u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/,
            specialCharPlaceholder: ch =>
                $.create('span', ch === ' ' ? 'cm-space' : 'cm-special', ' ') // needs to be a space so wrapping works
            */
        });

        // Enfore single line
        this.codeMirror.on(CONSTANTS.BEFORECHANGE, (cm, change) => {
            if (change.update) {
                const str = change.text.join('').replace(/(\n|\r)/g, '');
                change.update(change.from, change.to, [str]);
            }
            return true;
        });

        // TODO
        this.codeMirror.on(
            CONSTANTS.CHANGE,
            this._onUserInputChange.bind(this)
        );

        // TODO
        this.codeMirror.setSize('100%', '100%');
        this.codeMirror.refresh();
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
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
     * Event handler triggered when changing the content
     * @method _onUserInputChange
     * @param cm
     * @param change
     * @private
     */
    _onUserInputChange(/* cm, change */) {
        this.trigger(CONSTANTS.CHANGE);
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
plugin(RegEx);
