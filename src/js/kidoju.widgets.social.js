/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder'
    ], f);
})(function () {

    'use strict';

    /*
     * Load Google Classroom scripts
     * @see https://developers.google.com/classroom/guides/sharebutton
     */
    (function () {
        var GC_ID = '___gcfg';
        var head = document.getElementsByTagName('head')[0];
        var scripts = head.getElementsByTagName('script');
        var found = false;
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].id === GC_ID) {
                found = true;
                break;
            }
        }
        if (!found) {
            var script = document.createElement('script');
            script.id = GC_ID;
            script[(window.opera ? 'innerHTML' : 'text')] =
                '\nwindow.___gcfg = {\n' +
                '  parsetags: "explicit"\n' +
                '};\n';
            head.appendChild(script);
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://apis.google.com/js/platform.js';
            script.crossorigin = 'anonymous';
            head.appendChild(script);
        }
    })();


    (function ($, undefined) {

        // shorten references to variables for uglification
        // var fn = Function;
        // var global = fn('return this')();
        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var NS = '.kendoSocial';
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.sharing');
        var NUMBER = 'number';
        var STRING = 'string';
        var CONTENT = 'content';
        var CLICK = 'click' + NS;
        // var MOUSEENTER = 'mouseenter';
        // var MOUSELEAVE = 'mouseleave';
        // var HOVEREVENTS = MOUSEENTER + NS + ' ' + MOUSELEAVE + NS;
        var GC_ID = '___gcfg';
        var WIDGET_CLASS = 'kj-social';
        var STATE_DISABLED = 'k-state-disabled';
        var TEMPLATE = '<a role="button" href="#" data-command="{0}" title="{1}"></a>';
        var BUTTON_SELECTOR = 'a[role="button"]'; // :has(svg)';
        var COMMAND = {
            CLASSROOM: 'classroom',
            FACEBOOK: 'facebook',
            GOOGLE: 'google',
            LINKEDIN: 'linkedin',
            PINTEREST: 'pinterest',
            TWITTER: 'twitter'
        };
        var IMAGES = {
            CLASSROOM: '<div class="g-sharetoclassroom" style="height:0;width:0;display:inline-block"></div>',
            FACEBOOK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>facebook</title><rect width="1024" height="1024" style="fill:#3b5999"/><path d="M893.05,613l20.21-156.74H758.05V356.17c0-45.38,12.65-76.31,77.72-76.31l82.93,0V139.64c-14.32-1.91-63.55-6.18-120.92-6.18-119.68,0-201.56,73.06-201.56,207.21V456.25H460.87V613H596.23v402.17H758.05V613h135Z" style="fill:#fff"/></svg>',
            GOOGLE: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>google</title><rect width="1024" height="1024" style="fill:#dc4f42"/><path d="M231.54,511.56c-3.49-92,77.13-177,169.25-178.15,47-4,92.64,14.23,128.17,44-14.57,16-29.4,31.86-45.25,46.69-31.28-19-68.94-33.48-105.5-20.62-59,16.78-94.68,86.39-72.86,144.07,18.07,60.23,91.36,93.29,148.8,68,29.74-10.65,49.34-38.08,58-67.56-34.09-.68-68.18-0.26-102.27-1.19-0.09-20.28-.17-40.47-0.09-60.75,56.84-.09,113.77-0.26,170.7.26,3.49,49.67-3.83,102.83-36.13,142.7-44.23,56.91-126,73.61-192.43,51.29C281.31,657.07,230,586,231.54,511.56Z" transform="translate(0 0)" style="fill:#fff"/><path d="M691.22,434.88h50.71c0.09,17,.26,34,0.34,50.95,17,0.17,34,.26,51,0.34v50.78l-51,.26c-0.17,17-.26,34-0.34,51-17-.09-33.92,0-50.79,0-0.17-17-.17-34-0.34-50.95-17-.17-34-0.26-51-0.34V486.17q25.44-.13,51-0.34C690.88,468.87,691,451.83,691.22,434.88Z" transform="translate(0 0)" style="fill:#fff"/></svg>',
            LINKEDIN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>linkedin</title><rect width="1024" height="1024" style="fill:#017bb6"/><path d="M175.22,395.31H319.69V859.46H175.22V395.31ZM247.5,164.57a83.65,83.65,0,1,1-83.74,83.63,83.68,83.68,0,0,1,83.74-83.63" transform="translate(0 0)" style="fill:#fff"/><path d="M410.27,395.31H548.63v63.44h2c19.24-36.52,66.36-75,136.58-75,146,0,173.07,96.09,173.07,221.09V859.46H716V633.79c0-53.87-1.06-123.12-75-123.12-75.13,0-86.57,58.63-86.57,119.14V859.46H410.27V395.31Z" transform="translate(0 0)" style="fill:#fff"/></svg>',
            PINTEREST: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>pinterest</title><rect width="1024" height="1024" style="fill:#ca2128"/><path d="M511.51,142c-204.72,0-370.73,166-370.73,370.74,0,151.8,91.27,282.22,221.93,339.55-1-25.93-.19-57,6.43-85.12,7.15-30.14,47.72-202.06,47.72-202.06S405,541.51,405,506.52c0-54.9,31.89-95.94,71.54-95.94,33.7,0,50,25.3,50,55.63,0,33.89-21.63,84.6-32.73,131.55-9.3,39.33,19.73,71.39,58.45,71.39,70.26,0,117.56-90.17,117.56-197.09,0-81.22-54.71-142-154.24-142-112.44,0-182.51,83.84-182.51,177.5,0,32.32,9.54,55.1,24.45,72.73,6.87,8.11,7.82,11.34,5.29,20.64-1.71,6.87-5.81,23.25-7.53,29.75-2.48,9.44-10.06,12.77-18.54,9.3-51.81-21.12-75.93-77.85-75.93-141.61,0-105.29,88.79-231.6,265-231.6,141.51,0,234.71,102.43,234.71,212.39,0,145.43-80.9,254.06-200.07,254.06-40,0-77.69-21.65-90.55-46.19,0,0-21.55,85.41-26.07,101.91-7.87,28.54-23.26,57.15-37.33,79.41a371.11,371.11,0,0,0,105,15.15c204.72,0,370.7-166,370.7-370.73S716.24,142,511.51,142Z" transform="translate(0 -0.01)" style="fill:#fff"/></svg>',
            TWITTER: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>twitter</title><rect width="1024" height="1024" style="fill:#2aa8e0"/><path d="M853.31,300.28a279.66,279.66,0,0,1-80.44,22.05,140.33,140.33,0,0,0,61.58-77.48,280,280,0,0,1-88.91,34,140.21,140.21,0,0,0-238.7,127.72C390.47,400.76,287.28,345,218.18,260.24a140.27,140.27,0,0,0,43.33,187,139.47,139.47,0,0,1-63.42-17.52v1.76A140.17,140.17,0,0,0,310.43,568.81a141,141,0,0,1-36.9,4.94,139.08,139.08,0,0,1-26.34-2.55A140.23,140.23,0,0,0,378,668.49a280.94,280.94,0,0,1-173.95,60,289,289,0,0,1-33.38-2,396.7,396.7,0,0,0,214.72,62.9C643,789.37,783.85,576,783.85,390.91c0-6.05-.16-12.09-0.38-18.15A285.25,285.25,0,0,0,853.31,300.28Z" style="fill:#fff"/></svg>'
        };

        /**
         * Social (kendoSocial)
         * @class Social
         * @extend Widget
         */
        var Social = Widget.extend({

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                that.ns = NS;
                that._window = null;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that.options = $.extend({
                    language: $('html').attr('lang') || 'en',
                    facebookAppId: $('meta[property="fb:app_id"]').attr(CONTENT),
                    twitterAccount: $('meta[property="twitter:site"]').attr(CONTENT),
                    url: $('meta[property="og:url"]').attr(CONTENT) || window.location.href,
                    title: $('meta[property="og:title"]').attr(CONTENT) || $('meta[property="twitter:title"]').attr(CONTENT) || $('head>title').text(),
                    description: $('meta[property="og:description"]').attr(CONTENT) ||$('meta[property="twitter:description"]').attr(CONTENT) || $('meta[property="description"]').attr(CONTENT),
                    image: $('meta[property="og:image"]').attr(CONTENT) || $('meta[property="twitter:image"]').attr(CONTENT),
                    source: $('meta[property="og:site_name"]').attr(CONTENT)
                }, that.options);
                that._layout();
                // kendo.notify(that);
            },

            /* jshint +W074 */

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Social',
                size: 32,
                disabled: false,
                language: undefined,
                facebookAppId: undefined,
                twitterAccount: undefined,
                url: undefined,
                title: undefined,
                description: undefined,
                image: undefined,
                source: undefined,
                messages: {
                    classroom: 'Share to Google Classroom',
                    facebook: 'Share to Facebook',
                    google: 'Share to Google+',
                    linkedin: 'Share to LinkedIn',
                    pinterest: 'Share to Pinterest',
                    twitter: 'Share to Twitter'
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                var wrapper = that.wrapper = that.element;
                assert.instanceof($, wrapper, kendo.format(assert.messages.instanceof.default, 'wrapper', 'jQuery'));
                wrapper.addClass(WIDGET_CLASS);
                var options = that.options;
                assert.type(NUMBER, options.size, kendo.format(assert.messages.type.default, 'options.size', NUMBER));
                for (var network in COMMAND) {
                    if (COMMAND.hasOwnProperty(network) && IMAGES.hasOwnProperty(network)) {
                        $(kendo.format(TEMPLATE, COMMAND[network], options.messages[network.toLowerCase()]))
                            .append($(IMAGES[network]).height(options.size).width(options.size))
                            .appendTo(wrapper);
                    }
                }
                // Treat google classroom specifically
                that._waitForGapi().done(function () {
                    var shareToClassroom = wrapper.find('div.g-sharetoclassroom');
                    if (shareToClassroom.length > 0 && shareToClassroom[0] instanceof window.HTMLElement) {
                        window.gapi.sharetoclassroom.render(
                            shareToClassroom[0],
                            {
                                // @see https://developers.google.com/classroom/guides/sharebutton
                                body: options.description,
                                locale: options.language,
                                // onsharestart
                                // onsharecomplete
                                size: options.size,
                                // theme
                                title: options.title,
                                url: options.url
                            }
                        );
                    }
                });

                // Make (non)editable
                that._editable(options);
            },

            /**
             * Wait for Google Classroom API to load and return a promise
             * @returns {*}
             * @private
             */
            _waitForGapi: function () {
                var dfd = $.Deferred();
                var count = 0;
                var wait = setInterval(function () {
                    if (window.gapi && window.gapi.sharetoclassroom) {
                        dfd.resolve();
                        clearInterval(wait);
                    }
                    if (count > 9) {
                        dfd.reject(new Error('Loading Google Classroom takes too long.'));
                        clearInterval(wait);
                    }
                    count++;
                }, 50);
                return dfd.promise();
            },

            /**
             * Toggles between enabled and readonly modes
             * @private
             */
            _editable: function (options) {
                var that = this;
                var wrapper = that.wrapper;
                var disabled = options.disabled;
                wrapper.off(NS);
                // TODO this is not sufficient for the Google Classrom button which is located in an iFrame. Maybe we should add/remove an overlay
                if (disabled) {
                    wrapper.addClass(STATE_DISABLED);
                } else {
                    wrapper.removeClass(STATE_DISABLED);
                    wrapper
                        .on(CLICK, BUTTON_SELECTOR, $.proxy(that._onButtonClick, that));
                    // .on(HOVEREVENTS, BUTTON_SELECTOR, $.proxy(that._toggleHover, that))
                }
            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enable
             */
            enable: function (enable) {
                this._editable({
                    disabled: !(enable = enable === undefined ? true : enable)
                });
            },

            /* This function has too many statements. */
            /* jshint -W071 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Event handler for clicking/tapping a star
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                var that = this;
                var options = that.options;
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', '$.Event'));
                assert.instanceof(window.HTMLAnchorElement, e.currentTarget, kendo.format(assert.messages.instanceof.default, 'e.currentTarget', 'HTMLAnchorElement'));
                e.preventDefault();

                // Read open graph metadata
                assert.type(STRING, options.facebookAppId, kendo.format(assert.messages.type.default, 'options.facebookAppId', STRING));
                var facebookAppId = window.encodeURIComponent(options.facebookAppId);
                assert.type(STRING, options.twitterAccount, kendo.format(assert.messages.type.default, 'options.twitterAccount', STRING));
                var twitterAccount = window.encodeURIComponent(options.twitterAccount);
                assert.type(STRING, options.url, kendo.format(assert.messages.type.default, 'options.url', STRING));
                var url = window.encodeURIComponent(options.url);
                assert.type(STRING, options.source, kendo.format(assert.messages.type.default, 'options.source', STRING));
                var source = window.encodeURIComponent(options.source);
                assert.type(STRING, options.title, kendo.format(assert.messages.type.default, 'options.title', STRING));
                var title = window.encodeURIComponent(options.title);
                assert.type(STRING, options.description, kendo.format(assert.messages.type.default, 'options.description', STRING));
                var description = window.encodeURIComponent(options.description);
                assert.type(STRING, options.image, kendo.format(assert.messages.type.default, 'options.image', STRING));
                var image = window.encodeURIComponent(options.image);

                // Read command
                var command = $(e.currentTarget).attr(kendo.attr('command'));
                if (command === COMMAND.CLASSROOM) {
                    return;
                }

                // If not Google Classroom, build url and open in new window
                var openUrl;
                switch (command) {
                    case COMMAND.FACEBOOK:
                        // Facebook feed dialog (the share dialog uses open graph metadata)
                        // @ see https://developers.facebook.com/docs/sharing/web
                        // @ see https://developers.facebook.com/docs/sharing/reference/feed-dialog
                        // @ see https://developers.facebook.com/docs/sharing/best-practices
                        // @see https://developers.facebook.com/tools/debug/ <---------------- DEBUG
                        openUrl = 'https://www.facebook.com/dialog/feed' +
                            '?display=popup' +
                            '&app_id=' + facebookAppId +
                            '&link=' + url +
                            '&picture=' + image +
                            '&name=' + title +
                            '&caption=' + title +
                            '&description=' + description;
                        // '&redirect_uri=' + url;
                        // TODO: ref
                        break;
                    case COMMAND.GOOGLE:
                        // @see https://developers.google.com/+/web/share/
                        openUrl = 'https://plus.google.com/share' +
                            '?url=' + url +
                            '&hl=' + options.language;
                        break;
                    case COMMAND.LINKEDIN:
                        // @see https://developer.linkedin.com/docs/share-on-linkedin
                        // @see also http://stackoverflow.com/questions/3758525/linkedin-sharearticle-thumbnail
                        // Note Linkedin uses open graph meta tags
                        openUrl = 'https://www.linkedin.com/shareArticle' +
                            '?mini=true' +
                            '&source=' + source +
                            '&summary=' + description +
                            '&title=' + title +
                            '&url=' + url;

                        break;
                    case COMMAND.PINTEREST:
                        // @see https://developers.pinterest.com/docs/widgets/pin-it/
                        openUrl = 'https://pinterest.com/pin/create/button/' +
                            '?url=' + url +
                            '&media=' + image +
                            '&description=' + description;
                        break;
                    case COMMAND.TWITTER:
                        // Twitter web intent
                        // @ see https://dev.twitter.com/web/tweet-button/web-intent
                        openUrl = 'https://twitter.com/intent/tweet' +
                            '?text=' + title +
                            '&url=' + url +
                            '&via=' + twitterAccount;
                        // TODO: hashtags (message size limit)?
                        break;
                    // TODO Add email
                    // case COMMAND.EMAIL:
                    //     openUrl = 'mailto:fastlec@memba.org?&subject=Shared Link&body=Hey%20loojk%20at%20that';
                    //     break;
                }
                if (that._window === null || that._window.closed || that._url !== openUrl) {
                    // Most social share dialogs resize themselves from a smaller window (not from a larger one)
                    // TODO: We might want to improve the (top, left) position
                    that._window = window.open(openUrl, 'social', 'location=0,menubar=0,status=0,toolbar=0,height=450,width=600');
                }
                that._url = openUrl;
                if (that._window && $.isFunction(that._window.focus)) {
                    // Note: that._window.focus is not available when the social link triggers the mobile app on iPhones and iPads
                    // See https://github.com/kidoju/Kidoju-Widgets/issues/131
                    that._window.focus();
                }
            },

            /* jshint +W074 */
            /* jshint +W071 */

            /**
             * Clears the DOM from modifications made by the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                var wrapper = that.wrapper;
                wrapper.off(NS).empty();
                wrapper.removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                that._clear();
                Widget.fn.destroy.call(this);
            }
        });

        ui.plugin(Social);

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
