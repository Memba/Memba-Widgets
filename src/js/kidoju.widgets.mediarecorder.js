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
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.drawing',
        './vendor/kendo/kendo.dialog'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.mediarecorder');
        var navigator = window.navigator;
        var NS = '.kendoMediaRecorder';
        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        var MediaStream = window.MediaStream || window.webkitMediaStream;
        var WindowRecorder = window.MediaRecorder; // Our widget is MediaRecorder
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var ERROR = 'error';
        var WIDGET_CLASS = 'k-widget kj-mediarecorder';
        var DISABLED_CLASS = 'k-state-disabled';
        var ACTIVE_CLASS = 'k-state-active';
        var MIME_TYPE = '{0};codecs={1}';
        var ATTR_SELECTOR = '[{0}="{1}"]';
        var TOOGLE_TMPL = '<a class="k-toggle-button k-button" data-' + kendo.ns + 'command="{0}" title="{1}" tabindex="0"><span class="k-icon k-i-{2}"></span></a>';
        var BUTTON_TMPL = '<a class="k-button" data-' + kendo.ns + 'command="{0}" title="{1}" tabindex="0"><span class="k-icon k-i-{2}"></span></a>';
        var METER = {
            HEIGHT: 24,
            WIDTH: 100
        };

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * navigator.mediaDevices.enumerateDevices converted to jQuery promises
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
         * @see https://developers.google.com/web/updates/2015/10/media-devices
         * @see https://webrtc.github.io/samples/src/content/devices/input-output/
         */
        function enumerateDevices () {
            var dfd = $.Deferred();
            if (navigator.mediaDevices && $.isFunction(navigator.mediaDevices.enumerateDevices)) {
                navigator.mediaDevices.enumerateDevices()
                .then(dfd.resolve)
                .catch(dfd.reject);
            } else {
                dfd.resolve([]); // No device found
            }
            return dfd.promise();
        }

        /**
         * navigator.mediaDevices.getUserMedia converted to jQuery promises
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
         * @see https://webrtc.github.io/adapter/adapter-latest.js
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
         * Create an audio meter to display as progress bar
         * Source: https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
         * @see http://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
         * @param audioContext
         * @param clipLevel
         * @param averaging
         * @param clipLag
         * @returns {*}
         */
        function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
            var processor = audioContext.createScriptProcessor(512);
            processor.onaudioprocess = volumeAudioProcess;
            processor.clipping = false;
            processor.lastClip = 0;
            processor.volume = 0;
            processor.clipLevel = clipLevel || 0.98;
            processor.averaging = averaging || 0.95;
            processor.clipLag = clipLag || 750;

            // this will have no effect, since we don't copy the input to the output,
            // but works around a current Chrome bug.
            processor.connect(audioContext.destination);

            processor.checkClipping = function () {
                if (!this.clipping) {
                    return false;
                }
                if ((this.lastClip + this.clipLag) < window.performance.now()) {
                    this.clipping = false;
                }
                return this.clipping;
            };

            processor.shutdown = function () {
                this.disconnect();
                this.onaudioprocess = null;
            };

            return processor;
        }

        /**
         * Source: https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
         * @see http://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
         * @param event
         */
        function volumeAudioProcess(event) {

            /* If a strict mode function is executed using function invocation, its 'this' value will be undefined. */
            /* jshint -W040 */

            var buf = event.inputBuffer.getChannelData(0);
            var bufLength = buf.length;
            var sum = 0;
            var x;

            // Do a root-mean-square on the samples: sum up the squares...
            for (var i = 0; i < bufLength; i++) {
                x = buf[i];
                if (Math.abs(x) >= this.clipLevel) {
                    this.clipping = true;
                    this.lastClip = window.performance.now();
                }
                sum += x * x;
            }

            // ... then take the square root of the sum.
            var rms =  Math.sqrt(sum / bufLength);

            // Now smooth this out with the averaging factor applied
            // to the previous sample - take the max here because we
            // want "fast attack, slow release."
            this.volume = Math.max(rms, this.volume * this.averaging);

            /* jshint +W040 */

        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MediaRecorder (kendoMediaRecorder)
         * @see https://developers.google.com/web/updates/2016/01/mediarecorder
         * @see https://addpipe.com/blog/mediarecorder-api/
         * @see https://webrtc.github.io/samples/
         * @see https://webrtc.github.io/samples/src/content/getusermedia/record/
         * @see https://quickblox.github.io/javascript-media-recorder/sample/
         * @see https://rawgit.com/Miguelao/demos/master/mediarecorder.html
         * @see https://github.com/mattdiamond/Recorderjs
         * @see http://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/
         * @class MediaRecorder
         * @extend Widget
         */
        var MediaRecorder = Widget.extend({

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
             * Widget options
             * @property options
             */
            options: {
                name: 'MediaRecorder',
                enable: true,
                audio: true,
                video: true, // { mandatory: { minWidth: 640, minHeight: 360 }
                mimeType: '', // Let the widget decide
                // audioBitsPerSecond : 128000,
                // videoBitsPerSecond : 2500000,
                codecs: '',
                devices: false,
                proxyURL: '', // for kendo.saveAs
                messages: {
                    camera: 'Camera',
                    microphone: 'Microphone',
                    pauseResume: 'Pause/Resume',
                    record: 'Record',
                    speaker: 'Speaker',
                    stop: 'Stop',
                    unsupported: 'Media recording is only available on Chrome and Firefox'
                }
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
             * Check MediaRecorder support
             * @returns {boolean}
             * @private
             */
            _isSupported: function () {
                // getUserMedia() must be run from a secure origin: HTTPS or localhost.
                var isSecureOrigin = location.protocol === 'https:' || location.hostname === 'localhost';
                return isSecureOrigin && !!WindowRecorder;
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var element = this.element;
                var options = this.options;
                this.wrapper = element;
                element.addClass(WIDGET_CLASS);
                if (!this._isSupported()) {
                    this._unsupportedLayout();
                } else if (this.options.video) {
                    this._videoLayout();
                } else if (this.options.audio) {
                    this._audioLayout();
                } else {
                    throw new Error('Set widget options for audio or video');
                }
            },

            /**
             * Gets value (a setter does not make sense)
             *
             * Then you can do:
             * var blob = new Blob(widget.value(), { type : widget.mimeType() });
             * kendo.saveAs({
             *     dataURI: blob,
             *     fileName: "test.txt"
             * });
             */
            value: function () {
                return this._chunks;
            },

            /**
             * Oops, your browser does not support our media recorder
             * @private
             */
            _unsupportedLayout: function () {
                // TODO: Maybe we could use flash in this case - https://github.com/addyosmani/getUserMedia.js
                this.preview = $('<div></div>').text(this.options.messages.unsupported).appendTo(this.element);
            },

            /**
             * Builds the audio layout
             * @private
             */
            _audioLayout: function () {
                var element = this.element;
                var options = this.options;
                this._initToolbar();
                this.preview = $('<audio autoplay></audio>').width('100%').appendTo(element);
                this._updateToolbar();
            },

            /**
             * Builds the video layout
             * @private
             */
            _videoLayout: function () {
                var element = this.element;
                var options = this.options;
                this._initToolbar();
                this.preview = $('<video autoplay></video>').width('100%').appendTo(element);
                this._updateToolbar();
            },

            /**
             * Initialize a volume meter
             * @param stream
             * @private
             */
            _initVolumeMeter: function (stream) {
                var audioContext = new AudioContext();
                var streamSource = audioContext.createMediaStreamSource(stream);
                var meter = createAudioMeter(audioContext);
                streamSource.connect(meter);
                this._drawVolumeMeter(meter);
            },

            /**
             * Draws an audio volume meter
             * @see http://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
             * @private
             */
            _drawVolumeMeter: function (meter) {
                var that = this;
                if (!this._meter) {
                    var div = $('<div class="kj-mediarecorder-meter"></div>').width(METER.WIDTH).height(METER.HEIGHT).appendTo(this.toolbar);
                    var surface = drawing.Surface.create(div);
                    var rect = new geometry.Rect([0, 0], [METER.WIDTH, METER.HEIGHT]);
                    var frame = new drawing.Rect(rect).stroke('#c8c8c8', 1);
                    surface.draw(frame);
                    this._meter = new drawing.Rect(rect).stroke('#c8c8c8', 1);
                    surface.draw(this._meter);
                }
                this._meter.fill(meter.checkClipping() ? 'red' : 'green', 1);
                this._meter.geometry(new geometry.Rect([0, 0], [METER.WIDTH * meter.volume * 2, METER.HEIGHT]));
                window.requestAnimationFrame(function ()  { that._drawVolumeMeter(meter); });
            },

            /**
             * Initialize toolbar
             * @private
             */
            _initToolbar: function () {
                var messages = this.options.messages;

                // Build the toolbar
                this.toolbar = $('<div class="k-toolbar k-widget kj-mediarecorder-toolbar"></div>')
                    .append(kendo.format(BUTTON_TMPL, 'save', messages.save, 'save'))
                    .append(kendo.format(BUTTON_TMPL, 'record', messages.record, 'circle'))
                    .append(kendo.format(TOOGLE_TMPL, 'pauseResume', messages.pauseResume, 'pause'))
                    .append(kendo.format(BUTTON_TMPL, 'stop', messages.stop, 'stop')) // TODO Add mute/unmute toggle button
                    .appendTo(this.element)
                    .on(CLICK + NS, 'a.k-button', this._onButtonClick.bind(this));

                if (this.options.devices) {

                    /* This function's cyclomatic complexity is too high. */
                    /* jshint -W074 */

                    // Display recording devices - see https://webrtc.github.io/samples/src/content/devices/input-output/
                    enumerateDevices().done(function (devices) {
                        var cameras = [];
                        var microphones = [];
                        var speakers = [];
                        for (var i = 0, length = devices.length; i < length; i++) {
                            var device = devices[i];
                            switch (device.kind) {
                                case 'audioinput':
                                    microphones.push({
                                        id: device.deviceId,
                                        name: device.label || messages.microphone + ' ' + (microphones.length + 1)
                                    });
                                    break;
                                case 'audiooutput':
                                    speakers.push({
                                        id: device.deviceId,
                                        name: device.label || messages.speaker + ' ' + (speakers.length + 1)
                                    });
                                    break;
                                case 'videoinput':
                                    cameras.push({
                                        id: device.deviceId,
                                        name: device.label || messages.camera + ' ' + (cameras.length + 1)
                                    });
                                    break;
                            }
                        }
                        // TODO feed toolbar Dropdownlists
                        // Implement change event to setSinkId as in https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js#L58
                    }).fail(this._onError);

                    /* jshint +W074 */
                }
            },

            /**
             * Event handler for clicking toolbar buttons
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                var command = $(e.currentTarget).attr(kendo.attr('command'));
                this[command]();
            },

            /**
             * Update the toolbar based on MediaRecorder state
             * @private
             */
            _updateToolbar: function () {
                // see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/state
                var recorder = this._recorder;
                var state = recorder instanceof WindowRecorder ? recorder.state : 'inactive';
                var isInactive = state === 'inactive';
                var isRecording = state === 'recording';
                var isPaused =  state === 'paused';
                var hasChunks = $.isArray(this._chunks) && this._chunks.length;
                this.toolbar.children(kendo.format(ATTR_SELECTOR, kendo.attr('command'), 'save'))
                    .toggleClass(DISABLED_CLASS, !isInactive || !hasChunks);
                this.toolbar.children(kendo.format(ATTR_SELECTOR, kendo.attr('command'), 'record'))
                    .toggleClass(DISABLED_CLASS, !isInactive);
                this.toolbar.children(kendo.format(ATTR_SELECTOR, kendo.attr('command'), 'pauseResume'))
                    .toggleClass(DISABLED_CLASS, isInactive).toggleClass(ACTIVE_CLASS, isPaused);
                this.toolbar.children(kendo.format(ATTR_SELECTOR, kendo.attr('command'), 'stop'))
                    .toggleClass(DISABLED_CLASS, isInactive);
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Gets the mime type
             * @see https://cs.chromium.org/chromium/src/third_party/WebKit/LayoutTests/fast/mediarecorder/MediaRecorder-isTypeSupported.html
             * @see http://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/
             * @see https://developers.google.com/web/updates/2016/01/mediarecorder
             * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType
             * @see https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/record/js/main.js
             * @param withCodecs
             */
            mimeType: function (withCodecs) {
                var options = this.options;
                // We need to be explicit about mime types an codecs
                if (!options.mimeType || !options.codecs || !WindowRecorder.isTypeSupported(kendo.format(MIME_TYPE, options.mimeType, options.codecs))) {
                    if (options.video && WindowRecorder.isTypeSupported('video/webm;codecs=vp9')) {  // true on chrome, false on firefox
                        options.mimeType = 'video/webm';
                        options.codecs = 'vp9';
                    } else if (options.video && WindowRecorder.isTypeSupported('video/webm;codecs=vp8')) {  // true on chrome, false on firefox
                        options.mimeType = 'video/webm';
                        options.codecs = 'vp8';
                    } else if (options.audio && WindowRecorder.isTypeSupported('audio/webm;codecs=opus')) { // true on chrome, false on firefox
                        options.mimeType = 'audio/webm';
                        options.codecs = 'opus';
                    } else if (options.audio && WindowRecorder.isTypeSupported('audio/ogg;codecs=opus')) { // false on chrome, true on firefox
                        options.mimeType = 'audio/ogg';
                        options.codecs = 'opus';
                    } else {
                        throw new Error('Set widget options for audio or video');
                    }
                }
                return !!withCodecs ? kendo.format(MIME_TYPE, options.mimeType, options.codecs) : options.mimeType;
            },

            /* jshint +W074 */

            /**
             * Save function
             * @see http://docs.telerik.com/kendo-ui/framework/save-files/introduction
             * @see http://docs.telerik.com/kendo-ui/api/javascript/kendo#methods-saveAs
             */
            save: function () {
                var blob = new Blob(this.value(), { type : this.mimeType() });
                kendo.saveAs({
                    dataURI: blob,
                    fileName: 'test.' + this.mimeType().replace(/^\w+\//, ''),
                    proxyURL: this.options.proxy
                });
            },

            /**
             * Start recording
             */
            record: function () {
                var that = this;
                var options = that.options;
                that._chunks = [];
                getUserMedia({ audio: options.audio, video: options.video })
                    .done(function (stream) {
                        that._preview(stream);
                        that._initVolumeMeter(stream);
                        var config = {
                            // audioBitsPerSecond : options.audioBitsPerSecond,
                            // videoBitsPerSecond : options.videoBitsPerSecond,
                            mimeType : that.mimeType(true)
                        };
                        // Create a media recorder - https://developers.google.com/web/updates/2016/01/mediarecorder
                        var recorder = that._recorder = new WindowRecorder(stream, config);
                        recorder.onerror = that._onError.bind(that);
                        recorder.onstart = that._onStart.bind(that);
                        recorder.ondataavailable = that._onDataAvailable.bind(that);
                        recorder.onpause = that._onPause.bind(that);
                        recorder.onresume = that._onResume.bind(that);
                        recorder.onstop = that._onStop.bind(that);
                        recorder.start();
                    })
                    .fail(that._onError.bind(that));
            },

            /**
             * Pause/resume recording
             */
            pauseResume: function () {
                var recorder = this._recorder;
                if (recorder instanceof WindowRecorder) {
                    if (recorder.state === 'recording') {
                        this._recorder.pause();
                    } else if (recorder.state === 'paused') {
                        this._recorder.resume();
                    }
                }
            },

            /**
             * Stop recording
             */
            stop: function () {
                var recorder = this._recorder;
                if (recorder instanceof WindowRecorder && recorder.state !== 'inactive') {
                    recorder.stop();
                    recorder.stream.getTracks() // get all tracks from the MediaStream
                        .forEach(function (track) { track.stop(); }); // stop each of them
                }
            },

            /**
             * Mute/unmute
             * @param muted
             */
            mute: function (muted) {
                var recorder = this._recorder;
                if (recorder instanceof WindowRecorder) {
                    muted = $.type(muted) === UNDEFINED ? true : !!muted;
                    recorder.stream.getAudioTracks().
                        forEach(function (track) { track.enabled = !muted; });
                } else {
                    // TODO: Not yet implemented in the toolbar because we need to be able to set it both before (recorder is not yet available) and during recording
                    $.noop();
                }
            },

            /**
             * Error event handler
             * @param err
             * @private
             */
            _onError: function (err) {
                logger.error({ method: '_onError', error: err });
                if (!this.trigger(ERROR, { originalError: err })) {
                    if (err.name === 'TrackStartError') { // instanceof window.NavigatorUserMediaError) {
                        // TODO: Warn user that most probably another program has got hold of the webcam + microphone recording devices
                        $.noop();
                    }
                }
            },

            /**
             * Start event handler
             * @param e
             * @private
             */
            _onStart: function (e) {
                logger.debug({ method: '_onStart', message: 'Recording started' });
                this._updateToolbar();
            },

            /**
             * Data available event handler
             * @param e
             * @private
             */
            _onDataAvailable: function (e) {
                if (e && e.data && e.data.size > 0) {
                    this._chunks.push(e.data);
                }
            },

            /**
             * Pause event handler
             * @param e
             * @private
             */
            _onPause: function (e) {
                logger.debug({ method: '_onPause', message: 'Recording paused' });
                this._updateToolbar();
            },

            /**
             * Resume event handler
             * @param e
             * @private
             */
            _onResume: function (e) {
                logger.debug({ method: '_onResume', message: 'Recording resumed' });
                this._updateToolbar();
            },

            /**
             * Stop event handler
             * @param e
             * @private
             */
            _onStop: function (e) {
                logger.debug({ method: '_onStop', message: 'Recording stopped' });
                this._updateToolbar();
                this._preview(this._chunks);
            },

            /**
             * Reset content preview
             * @param content
             * @private
             */
            _preview: function (content) {
                var preview = this.preview.get(0);
                if (preview.src) {
                    // setTimeout() here is needed for Firefox.
                    // https://developers.google.com/web/updates/2016/01/mediarecorder
                    // setTimeout(function () { URL.revokeObjectURL(preview.src)); }, 100);
                    URL.revokeObjectURL(preview.src);
                }
                preview.srcObject = null;
                preview.src = '';
                preview.controls = false;
                if (content instanceof MediaStream && 'srcObject' in preview) {
                    // srcObject currently only supports MediaStream
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
                    preview.srcObject = content;
                } else {
                    var blob = content; // content might still be a MediaStream if srcObject is not supported
                    if ($.isArray(content)) {
                        blob = new Blob(content, { type : this.mimeType() });
                        preview.controls = true;
                    }
                    // Avoid using this in new browsers, as it is going away.
                    preview.src = URL.createObjectURL(blob);
                }
                // preview.onloadedmetadata = function (e) {
                //    preview.play(); // the audio/video tag has the autoplay attribute, so we don't really need that
                // };
            },

            /**
             * Function called by widget.resize and kendo.resize
             * @param e
             * @private
             */
            _resize: function (e) {
                // TODO to make video as big as possible and centered in widget, but is this the best option?
            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enable
             */
            enable: function (enabled) {
                // TODO
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
                that.preview = undefined;
                that.toolbar = undefined;
                that._recorder = undefined;
                that._chunks = undefined;
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
            }
        });

        ui.plugin(MediaRecorder);

    } (window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
