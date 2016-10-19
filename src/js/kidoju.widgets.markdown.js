/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/markdown-it/markdown-it.js',
        './vendor/highlight/highlight.pack.js'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function (a, b, c, markdownit, highlight) {

    'use strict';

    // Load MathJax 2.7 dynamically - see https://docs.mathjax.org/en/v2.7-latest/advanced/dynamic.html
    // SSee configuration options - see http://mathjax.readthedocs.org/en/latest/configuration.html
    // And combined configuration options - see http://mathjax.readthedocs.org/en/latest/config-files.html
    (function () {
        var TYPE = 'text/x-mathjax-config';
        var head = document.getElementsByTagName('head')[0];
        var scripts = head.getElementsByTagName('script');
        var found = false;
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].type === TYPE) {
                found = true;
                break;
            }
        }
        if (!found) {
            var script = document.createElement('script');
            script.type = TYPE;
            // TODO OPTIMIZE without MathML input
            script[(window.opera ? 'innerHTML' : 'text')] =
                'MathJax.Hub.Config({\n' +
                '  showMathMenu: false,\n' + // Hide contextual menu
                '  asciimath2jax: { delimiters: [["#","#"], ["`","`"]] }\n' +
                '});';
            head.appendChild(script);
            script = document.createElement('script');
            script.type = 'text/javascript';
            // script.src  = 'https://cdn.mathjax.org/mathjax/2.7-latest/unpacked/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
            script.src = 'https://cdn.mathjax.org/mathjax/2.7-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML';
            script.crossorigin = 'anonymous';
            head.appendChild(script);
        }
    })();

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var MarkdownIt = window.markdownit || markdownit;
        var hljs = window.hljs || highlight;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.markdown');
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var EMPTY = '';
        // var CHANGE = 'change';
        // var NS = '.kendoMarkdown';
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
                logger.debug('widget initialized');
                that._initMarkdownIt();
                that._layout();
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Markdown',
                url: null,
                value: null
            },

            /**
             * Widget events
             * @property events
             */
            /*
            events: [
                CHANGE
            ],
            */

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
                        // that.trigger(CHANGE, { value: that._value });
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
                that.md = new MarkdownIt({
                    html: false,
                    linkify: true,
                    typographer: true,
                    // See https://github.com/markdown-it/markdown-it#syntax-highlighting
                    highlight: function (code, lang) {
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                return '<pre class="hljs"><code>' +
                                    hljs.highlight(lang, code, true).value +
                                    '</code></pre>';
                            } catch (ex) {}
                        }
                        return '<pre class="hljs"><code>' + that.md.utils.escapeHtml(code) + '</code></pre>';
                    }
                });
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
                // If MathJax is not yet loaded it will parse the page anyway
                var MathJax = window.MathJax;
                if (MathJax) {
                    // See http://mathjax.readthedocs.org/en/latest/advanced/typeset.html
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, element[0]]);
                }
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                // remove descendants
                $(that.element).empty();
                // remove element classes
                // $(that.element).removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(Markdown);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
