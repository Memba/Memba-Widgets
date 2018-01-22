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

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.whiteboard');
        var navigator = window.navigator;
        var NS = '.kendoWhiteboard';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var ERROR = 'error';
        var WIDGET_CLASS = 'k-widget kj-whiteboard';
        var TYPES = [
            'video/webm',
            'audio/webm',
            'video/mpeg',
            'video/mp4'
        ];
        var CODECS = [
            // https://cs.chromium.org/chromium/src/third_party/WebKit/LayoutTests/fast/mediarecorder/MediaRecorder-isTypeSupported.html
            '', // THis is the only option that works with
            '; codecs="vp8"', // these codecs only work with Chrome, not FF
            ';codecs=vp8',
            ';codecs=vp9',
            ';codecs=daala',
            ';codecs=h264',
            ';codecs=opus'
        ];

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        // TODO shimSourceObject from https://webrtc.github.io/adapter/adapter-latest.js

        // TODO audio and video source selection
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices

        /**
         * navigator.mediaDevices.getUserMedia converted to jQuery promises
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
         * @see https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/blob/master/mediaDevices-getUserMedia-polyfill.js
         */
        function getUserMedia (constraints) {
            var dfd = $.Deferred();

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

                // That's for the most recent browsers
                navigator.mediaDevices.getUserMedia(constraints)
                .then(dfd.resolve).catch(dfd.reject);

            } else {

                // With older browsers, get ahold of the legacy getUserMedia, if present
                var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

                // If the browser is very old
                if (!getUserMedia) {
                    // TODO: we might want to fallback to flash - see https://github.com/addyosmani/getUserMedia.js
                    return dfd.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                getUserMedia(constraints, dfd.resolve, dfd.reject);
            }

            return dfd.promise();
        }

        /**
         * Drawing function
         * @param context
         * @param video
         */
        function draw(context, video) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.fillStyle = 'white';
            context.strokeStyle = 'red';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.drawImage(video, 0, 0, $(video).width(), $(video).height());
            context.beginPath();
            context.arc(context.canvas.width / 2, context.canvas.height / 2, (context.canvas.height / 2 - 20) * Math.random(), 0 * Math.PI, 2 * Math.PI);
            context.stroke();
        }


        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Whiteboard (kendoWhiteboard)
         * @see https://developers.google.com/web/updates/2016/01/mediarecorder
         * @see https://addpipe.com/blog/mediarecorder-api/
         * @see https://webrtc.github.io/samples/
         * @see https://webrtc.github.io/samples/src/content/getusermedia/record/
         * @see https://quickblox.github.io/javascript-media-recorder/sample/
         * @see https://rawgit.com/Miguelao/demos/master/mediarecorder.html
         * @see https://github.com/mattdiamond/Recorderjs
         * @class Whiteboard
         * @extend Widget
         */
        var Whiteboard = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                that.ns = NS;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that.enable(that.options.enable);
                kendo.notify(that);
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE,
                ERROR
            ],

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Whiteboard',
                enable: true,
                fps: 24,
                audio: true,
                video: {
                    facingMode: 'user', // vs. 'environmnet'
                    frameRate: { ideal: 24 },
                    height: 96,
                    width: 128
                },
                mimeType: TYPES[0],
                codec: CODECS[0]
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                that.wrapper = element;
                element.addClass(WIDGET_CLASS);
                that.canvas = $(kendo.format('<canvas width="{0}" height="{1}"></canvas>', element.width(), element.height()))
                    .appendTo(element);
                that.context = that.canvas.get(0).getContext('2d');
                that.video = $('<video autoplay></video>')
                    .hide()
                    .appendTo(element);
            },

            /**
             * Check browser support
             */
            hasBrowserSupport: function () {
                // This has to be Firefox 47+ or Chrome 53+
                // Detect browser support (see Modernizr)
                // Or may we should add that to kendo.support so as to be able to check browser support before opening a window with the component
            },

            /**
             * Pause recording/playing
             */
            pause: function () {},

            /**
             * Play recorded video
             */
            play: function () {},

            /**
             * Start recording
             */
            record: function () {
                var that = this;
                var options = that.options;
                var canvas = that.canvas.get(0);
                var video = that.video.get(0);

                that._chunks = [];

                getUserMedia({ audio: options.audio, video: options.video })
                    .then (function (videoStream) {

                        // Play webcam in hidden video tag
                        if ('srcObject' in video) {
                            // Older browsers may not have srcObject
                            video.srcObject = videoStream;
                        } else {
                            // Avoid using this in new browsers, as it is going away.
                            video.src = URL.createObjectURL(videoStream);
                        }
                        /** not needed with autoplay
                        video.onloadedmetadata = function(e) {
                            video.play();
                        };
                        */

                        // Capture the canvas stream
                        var mediaStream = canvas.captureStream(options.fps);

                        // Ad the audio track
                        var audioTrack = videoStream.getTracks().find(function (item) {
                            return item.kind === 'audio';
                        });
                        mediaStream.addTrack(audioTrack);

                        // Create a media recorder - https://developers.google.com/web/updates/2016/01/mediarecorder
                        that._mediaRecorder = new window.MediaRecorder(mediaStream, { mimeType: options.mimeType + options.codec });

                        // Add chunks
                        that._mediaRecorder.ondataavailable = function (e) {
                            if (e && e.data && e.data.size > 0) {
                                that._chunks.push(e.data);
                            }
                        };

                        that._mediaRecorder.onstop = function (e) {
                            var video = document.createElement('video');
                            video.controls = true;
                            var blob = new Blob(that._chunks, { type : options.mimeType });
                            // video.srcObject = blob; won't work with a blog even with modern browsers
                            video.src = URL.createObjectURL(blob);
                            document.body.appendChild(video);
                            that._mediaRecorder = undefined;
                        };

                        that._mediaRecorder.start();
                        that.interval = setInterval(draw, 1000 / options.fps, that.context, that.video.get(0));
                    })
                    .catch(function (error) {
                        window.console.error(error);
                    });
            },

            /**
             * Stop recording
             */
            stop: function () {
                var that = this;
                if (that._interval) {
                    clearInterval(that._interval);
                    that._interval = undefined;
                }
                if (that._mediaRecorder) {
                    that._mediaRecorder.stop();
                }
            },

            /**
             * Error handler
             * @param err
             * @private
             */
            _errorHandler: function (err) {
                if (!this.trigger(ERROR)) {
                    window.alert('Oops, there was an error'); // TODO
                }
            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enable
             */
            enable: function (enabled) {

            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                that.enable(false);

                // Clear references

                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
            }
        });

        ui.plugin(Whiteboard);

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
