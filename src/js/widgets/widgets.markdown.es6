/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: use the scheme2http function ot ToolAssets

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import MarkdownIt from '../vendor/markdown-it/markdown-it';
import katex from '../vendor/markdown-it/markdown-it-katex'; // This loads katex
import emoji from '../vendor/markdown-it/markdown-it-emoji';
import hljs from '../vendor/highlight/highlight.pack';
import twemoji from '../vendor/markdown-it/twemoji.amd';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;

const logger = new Logger('widgets.markdown');
const WIDGET_CLASS = 'kj-markdown'; // 'k-widget kj-markdown';
const RX_YML = /^---\n([\s\S]*)\n---/;
const RX_KEYVAL = /([^:\n]+):([^\n]+)/g;
const KEY_BLACKLIST = /[-\s]/g;
const SCRIPT_SELECTOR = 'script[type="text/plain"]';
const SCRIPT_TAG = '<script type="text/plain"></script>';
const WRAP_TAG = '<wrap/>';

/**
 * Return the yml metadata in value
 * @param content
 */
function head(content) {
    assert.type(
        CONSTANTS.STRING,
        content,
        assert.format(assert.messages.type.default, 'content', CONSTANTS.STRING)
    );
    const yml = {};
    const ymlMatches = content.match(RX_YML);
    if ($.isArray(ymlMatches) && ymlMatches.length > 1) {
        const keyvalMatches = ymlMatches[1].match(RX_KEYVAL);
        if ($.isArray(keyvalMatches) && keyvalMatches.length) {
            for (let i = 0; i < keyvalMatches.length; i++) {
                const keyval = keyvalMatches[i];
                const pos = keyval.indexOf(':');
                const key = keyval
                    .substr(0, pos)
                    .trim()
                    .replace(KEY_BLACKLIST, '_');
                yml[key] = keyval.substr(pos + 1).trim();
            }
        }
    }
    return yml;
}

/**
 * Returns the markdown content in value
 * @param content
 */
function body(content) {
    assert.type(
        CONSTANTS.STRING,
        content,
        assert.format(assert.messages.type.default, 'content', CONSTANTS.STRING)
    );
    return content.replace(RX_YML, CONSTANTS.EMPTY).trim();
}

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * Markdown
 * @class Markdown Widget (kendoMarkdown)
 */
const Markdown = Widget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._initMarkdownIt();
        this._render();
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Markdown',
        url: null,
        value: null,
        schemes: {}
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
    _initMarkdownIt() {
        // Initialize MarkdownIt
        this.md = new MarkdownIt({
            html: false,
            linkify: true,
            typographer: true,
            // See https://github.com/markdown-it/markdown-it#syntax-highlighting
            highlight(code, lang) {
                try {
                    return hljs.highlight(lang, code).value;
                } catch (err) {
                    return hljs.highlightAuto(code).value;
                }
            }
        });

        // Initialize renderers
        this._initHljs();
        this._initLinkOpener();
        this._initImageRule();
        this._initKatex();
        this._initEmojis();
    },

    /**
     * Init Highligh.js
     * Adds hljs class to the pre tag
     * @see https://github.com/markdown-it/markdown-it/blob/88c6e0f8e6fd567c70ffabbc1e9ce7b980d2e3a9/support/demo_template/index.js#L94
     * @private
     */
    _initHljs() {
        const { md } = this;
        md.renderer.rules.fence = function(tokens, idx, options, env, self) {
            const { escapeHtml, unescapeAll } = md.utils;
            const token = tokens[idx];
            const info = token.info
                ? unescapeAll(token.info).trim()
                : CONSTANTS.EMPTY;
            let langName = CONSTANTS.EMPTY;
            let highlighted;
            if (info) {
                [langName] = info.split(/\s+/g);
                token.attrPush(['class', options.langPrefix + langName]);
            }
            if (options.highlight) {
                highlighted =
                    options.highlight(token.content, langName) ||
                    escapeHtml(token.content);
            } else {
                highlighted = escapeHtml(token.content);
            }
            return `<pre class="hljs"><code${self.renderAttrs(
                token
            )}>${highlighted}</code></pre>\n`;
        };
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
            function(tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };
        md.renderer.rules.link_open = function(
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
     * Init Katex
     * @private
     */
    _initKatex() {
        if (katex) {
            this.md.use(katex);
        }
    },

    /**
     * Init Emojis
     * @private
     */
    _initEmojis() {
        if (emoji) {
            this.md.use(emoji);
        }
        // use much nicer twemojis
        if (twemoji) {
            this.md.renderer.rules.emoji = (token, idx) =>
                twemoji.parse(token[idx].content);
        }
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        if ($.type(options.url) === CONSTANTS.STRING) {
            this.url(options.url);
        } else if ($.type(options.value) === CONSTANTS.STRING) {
            this.value(options.value);
        } else {
            this.inline();
        }
    },

    /**
     * Reads the markdown text in an inline script
     * @method _inline
     * @private
     */
    inline() {
        const { element } = this;
        const inline = element.find(SCRIPT_SELECTOR);
        if (inline.length) {
            this.value(inline.text());
        }
    },

    /**
     * Reads the markdown text from a url
     * @param url
     */
    url(url) {
        if ($.type(url) === CONSTANTS.NULL) {
            // TODO
        } else if ($.type(url) === CONSTANTS.STRING) {
            $.get(url)
                .then(data => {
                    this.value(data);
                })
                .catch(() => {
                    this.value(null);
                });
        } else {
            throw new TypeError('`url` is expected to be a string');
        }
    },

    /**
     * Returns yml metadata
     */
    metadata() {
        return head((this.value() || CONSTANTS.EMPTY).trim());
    },

    /**
     * Html displayed
     * @method html
     * @returns {*}
     */
    html() {
        const markdown = body((this.value() || CONSTANTS.EMPTY).trim());
        return this.md.render(markdown);
    },

    /**
     * Refresh
     */
    refresh() {
        const { element } = this;
        const inline = element.find(SCRIPT_SELECTOR);
        let script = CONSTANTS.EMPTY;
        if (inline.length) {
            script = $(SCRIPT_TAG)
                .text(inline.text())
                .wrapAll(WRAP_TAG)
                .parent()
                .html();
        }
        element.html(script + this.html());
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
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(Markdown);
