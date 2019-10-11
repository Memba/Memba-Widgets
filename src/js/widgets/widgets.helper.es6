/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: use the scheme2http function of ToolAssets

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import HelperIt from '../vendor/markdown-it/markdown-it';
// import katex from '../vendor/markdown-it/markdown-it-katex.es6'; // This is a katex loader (not katex)

// TODO markdown-it-mediaplayer
// TODO markdown-it-command

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;

const logger = new Logger('widgets.help');
const WIDGET_CLASS = 'kj-markdown'; // 'k-widget kj-markdown';

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * Helper
 * @class Helper Widget (kendoHelper)
 */
const Helper = Widget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._initHelperIt();
        this._render();
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Helper',
        value: null
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
                'value',
                CONSTANTS.STRING
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (value !== this._value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * Initialize markdown-it
     * @private
     */
    _initHelperIt() {
        // Initialize HelperIt
        this.md = new HelperIt({
            html: false,
            linkify: true,
            typographer: true
        });

        // Initialize renderers
        this._initLinkOpener();
        this._initImageRule();
    },

    /**
     * Initialize link opener to open links in new window
     * @see https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
     * @private
     */
    _initLinkOpener() {
        const { md } = this;
        const defaultRender =
            md.renderer.rules.link_open ||
            function defaultRender(tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };
        // eslint-disable-next-line camelcase
        md.renderer.rules.link_open = function link_open(
            tokens,
            idx,
            options,
            env,
            self
        ) {
            // If you are sure other plugins can't add `target` - drop check below
            const targetIndex = tokens[idx].attrIndex('target');
            if (targetIndex < 0) {
                // @see https://cordova.apache.org/docs/en/3.1.0/cordova/inappbrowser/window.open.html
                tokens[idx].attrPush([
                    'target',
                    window.cordova ? '_system' : '_blank'
                ]); // add new attribute
            } else {
                // eslint-disable-next-line no-param-reassign
                tokens[idx].attrs[targetIndex][1] = window.cordova
                    ? '_system'
                    : '_blank'; // replace value of existing attr
            }
            // same with rel - see https://mathiasbynens.github.io/rel-noopener/
            const relIndex = tokens[idx].attrIndex('rel');
            if (relIndex < 0) {
                tokens[idx].attrPush(['rel', 'noopener']); // add new attribute
            } else {
                // eslint-disable-next-line no-param-reassign
                tokens[idx].attrs[relIndex][1] = 'noopener'; // replace value of existing attr
            }
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        };
    },

    /**
     * Converts a url starting with a scheme into an http(s) url
     * @method _scheme2http
     * @param uri
     * @private
     */
    _scheme2http(uri) {
        const { schemes } = this.options;
        let ret = uri;
        if ($.type(uri) === CONSTANTS.STRING) {
            Object.keys(schemes).some(scheme => {
                let done = false;
                if (uri.indexOf(`${scheme}://`) === 0) {
                    const root = schemes[scheme];
                    ret =
                        root +
                        (root.charAt(root.length - 1) === '/' ? '' : '/') +
                        uri.substr(`${scheme}://`.length);
                    done = true;
                }
                return done;
            });
        }
        return ret;
    },

    /**
     * Init the image rule
     * Adds the .img-responsive class to all images
     * @see https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md
     * @private
     */
    _initImageRule() {
        const { md } = this;
        const defaultRender =
            md.renderer.rules.image ||
            ((tokens, idx, options, env, self) =>
                self.renderToken(tokens, idx, options));
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            // Replace schemes
            const srcIndex = tokens[idx].attrIndex('src');
            const src = tokens[idx].attrs[srcIndex][1];
            // eslint-disable-next-line no-param-reassign
            tokens[idx].attrs[srcIndex][1] = this._scheme2http(src);

            // Add img-responsive class
            const classIndex = tokens[idx].attrIndex('class');
            // If you are sure other plugins can't add `class` - drop check below
            if (classIndex < 0) {
                tokens[idx].attrPush(['class', 'img-responsive']); // add new attribute
            } else {
                // eslint-disable-next-line no-param-reassign
                tokens[idx].attrs[classIndex][1] = 'img-responsive'; // replace value of existing attr
            }
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        };
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        this.value(options.value);
    },

    /**
     * Refresh
     */
    refresh() {
        const { element } = this;
        element.html(this.md.render(this.value() || CONSTANTS.EMPTY));
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // Clear references
        this.md = undefined;
        // Destroy widget
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
        destroy(this.element);
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Helper')) {
    // Prevents loading several times in karma
    plugin(Helper);
}
