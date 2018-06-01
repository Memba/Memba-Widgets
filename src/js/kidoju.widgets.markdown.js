/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/markdown-it/markdown-it',
        './vendor/markdown-it/markdown-it-katex', // This loads katex
        './vendor/markdown-it/markdown-it-emoji',
        './vendor/highlight/highlight.pack',
        './vendor/markdown-it/twemoji.amd',
        // Keep the above at the top considering function parameters below
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder'
    ], f);
})(function (markdown, katex, emoji, highlight, twemo) {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var MarkdownIt = window.markdownit || markdown;
        var markdownItKatex = window.markdownItKatex || katex;
        var markdownitEmoji = window.markdownitEmoji || emoji;
        var hljs = window.hljs || highlight;
        var twemoji = window.twemoji || twemo;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.markdown');
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var EMPTY = '';
        var WIDGET_CLASS = 'kj-markdown'; // 'k-widget kj-markdown';
        var RX_YML = /^---\n([\s\S]*)\n---/;
        var RX_KEYVAL = /([^:\n]+):([^\n]+)/g;
        var KEY_BLACKLIST = /[-\s]/g;
        var SCRIPT_SELECTOR = 'script[type="text/plain"]';
        var SCRIPT_TAG = '<script type="text/plain"></script>';
        var WRAP_TAG = '<wrap></wrap>';

        /*********************************************************************************
         * Helpers
         * See https://github.com/Memba/Memba-Blog/blob/master/webapp/lib/markdown.js#L60
         *********************************************************************************/

        /**
         * Return the yml metadata in value
         * @param content
         */
        function head(content) {
            var yml = {};
            var ymlMatches = content.match(RX_YML);
            if ($.isArray(ymlMatches) && ymlMatches.length > 1) {
                var keyvalMatches = ymlMatches[1].match(RX_KEYVAL);
                if ($.isArray(keyvalMatches) && keyvalMatches.length) {
                    for (var i = 0; i < keyvalMatches.length; i++) {
                        var keyval = keyvalMatches[i];
                        var pos = keyval.indexOf(':');
                        var key = keyval.substr(0, pos).trim().replace(KEY_BLACKLIST, '_');
                        var val = keyval.substr(pos + 1).trim();
                        yml[key] = val;
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
            return content.replace(RX_YML, EMPTY).trim();
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Markdown
         * @class Markdown Widget (kendoMarkdown)
         */
        var Markdown = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._initMarkdownIt();
                that._layout();
                kendo.notify(that);
            },

            /**
             * Widget options
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
             * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING || $.type(value) === NULL) {
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                } else if ($.type(value) === UNDEFINED) {
                    if ($.type(that._value) === STRING || $.type(that._value) === NULL) {
                        return that._value;
                    } else {
                        return undefined;
                    }
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Initialize markdown-it
             * @private
             */
            _initMarkdownIt: function () {
                var that = this;

                // Initialize MarkdownIt
                that.md = new MarkdownIt({
                    html: false,
                    linkify: true,
                    typographer: true,
                    // See https://github.com/markdown-it/markdown-it#syntax-highlighting
                    highlight: function (code, lang) {
                        try {
                            return hljs.highlight(lang, code).value;
                        } catch (err) {
                            return hljs.highlightAuto(code).value;
                        }
                    }
                });

                // Initialize renderers
                that._initHljs();
                that._initLinkOpener();
                that._initImageRule();
                that._initKatex();
                that._initEmojis();
            },

            /**
             * Init Highligh.js
             * Adds hljs class to the pre tag
             * @see https://github.com/markdown-it/markdown-it/blob/88c6e0f8e6fd567c70ffabbc1e9ce7b980d2e3a9/support/demo_template/index.js#L94
             * @private
             */
            _initHljs: function () {
                var that = this;
                that.md.renderer.rules.fence = function (tokens, idx, options, env, self) {
                    var escapeHtml = that.md.utils.escapeHtml;
                    var unescapeAll = that.md.utils.unescapeAll;
                    var token = tokens[idx];
                    var info = token.info ? unescapeAll(token.info).trim() : '';
                    var langName = '';
                    var highlighted;
                    if (info) {
                        langName = info.split(/\s+/g)[0];
                        token.attrPush(['class', options.langPrefix + langName]);
                    }
                    if (options.highlight) {
                        highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
                    } else {
                        highlighted = escapeHtml(token.content);
                    }
                    return '<pre class="hljs"><code' + self.renderAttrs(token) + '>' + highlighted  + '</code></pre>\n';
                };
            },

            /**
             * Initialize link opener to open links in new window
             * @see https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
             * @private
             */
            _initLinkOpener: function () {
                var that = this;
                /* jscs: disable requireCamelCaseOrUpperCaseIdentifiers */
                var defaultRender = that.md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
                        return self.renderToken(tokens, idx, options);
                    };
                that.md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
                    // If you are sure other plugins can't add `target` - drop check below
                    var targetIndex = tokens[idx].attrIndex('target');
                    if (targetIndex < 0) {
                        // @see https://cordova.apache.org/docs/en/3.1.0/cordova/inappbrowser/window.open.html
                        tokens[idx].attrPush(['target', window.cordova ? '_system' : '_blank']); // add new attribute
                    } else {
                        tokens[idx].attrs[targetIndex][1] = window.cordova ? '_system' : '_blank'; // replace value of existing attr
                    }
                    // same with rel - see https://mathiasbynens.github.io/rel-noopener/
                    var relIndex = tokens[idx].attrIndex('rel');
                    if (relIndex < 0) {
                        tokens[idx].attrPush(['rel', 'noopener']); // add new attribute
                    } else {
                        tokens[idx].attrs[relIndex][1] = 'noopener'; // replace value of existing attr
                    }
                    // pass token to default renderer.
                    return defaultRender(tokens, idx, options, env, self);
                };
                /* jscs: enable requireCamelCaseOrUpperCaseIdentifiers */
            },

            /**
             * Init the image rule
             * Adds the .img-responsive class to all images
             * @see https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md
             * @private
             */
            _initImageRule: function () {
                var that = this;
                var defaultRender = that.md.renderer.rules.image || function (tokens, idx, options, env, self) {
                        return self.renderToken(tokens, idx, options);
                    };
                that.md.renderer.rules.image = function (tokens, idx, options, env, slf) {
                    // Replace schemes
                    var srcIndex = tokens[idx].attrIndex('src');
                    var src = tokens[idx].attrs[srcIndex][1];
                    var schemes = that.options.schemes;
                    for (var scheme in (schemes || {})) {
                        if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(src)) {
                            src = src.replace(scheme + '://', schemes[scheme]);
                            break;
                        }
                    }
                    tokens[idx].attrs[srcIndex][1] = src;

                    // Add img-responsive class
                    var classIndex = tokens[idx].attrIndex('class');
                    // If you are sure other plugins can't add `class` - drop check below
                    if (classIndex < 0) {
                        tokens[idx].attrPush(['class', 'img-responsive']); // add new attribute
                    } else {
                        tokens[idx].attrs[classIndex][1] = 'img-responsive'; // replace value of existing attr
                    }
                    // pass token to default renderer.
                    return defaultRender(tokens, idx, options, env, slf);
                };
            },

            /**
             * Init Katex
             * @private
             */
            _initKatex: function () {
                if (markdownItKatex) {
                    this.md.use(markdownItKatex);
                }
            },

            /**
             * Init Emojis
             * @private
             */
            _initEmojis: function () {
                if (markdownitEmoji) {
                    this.md.use(markdownitEmoji);
                }
                // use much nicer twemojis
                if (twemoji) {
                    this.md.renderer.rules.emoji = function (token, idx) {
                        return twemoji.parse(token[idx].content);
                    };
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var options = that.options;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                if ($.type(options.url) === STRING) {
                    that.url(options.url);
                } else if ($.type(options.value) === STRING) {
                    that.value(options.value);
                } else {
                    that.inline();
                }
            },

            /**
             * Reads the markdown text in an inline script
             * @method _inline
             * @private
             */
            inline: function () {
                var that = this;
                var element = that.element;
                var inline = element.find(SCRIPT_SELECTOR);
                if (inline.length) {
                    that.value(inline.text());
                }
            },

            /**
             * Reads the markdown text from a url
             * @param url
             */
            url: function (url) {
                var that = this;
                if ($.type(url) === NULL) {
                    return;
                } else if ($.type(url) === STRING) {
                    $.get(url)
                        .done(function (data) {
                            that.value(data);
                        })
                        .fail(function () {
                            that.value(null);
                        });
                } else {
                    throw new TypeError('`url` is expected to be a string');
                }
            },

            /**
             * Returns yml metadata
             */
            metadata: function () {
                return head((this.value() || '').trim());
            },

            /**
             * Html displayed
             * @method html
             * @returns {*}
             */
            html: function () {
                var markdown = body((this.value() || '').trim());
                return this.md.render(markdown);
            },

            /**
             * Refresh the display (especially after changing the value)
             */
            refresh: function () {
                var that = this;
                var element = that.element;
                var inline = element.find(SCRIPT_SELECTOR);
                var script = EMPTY;
                if (inline.length) {
                    script = $(SCRIPT_TAG).text(inline.text()).wrapAll(WRAP_TAG).parent().html();
                }
                element.html(script + that.html());
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                kendo.unbind(wrapper);
                // Clear references
                this.md = undefined;
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(Markdown);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
