/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.userevents';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    applyEventMap,
    destroy,
    format,
    getTouches,
    ui: { plugin, Widget },
    support,
    unbind,
    UserEvents
} = window.kendo;
const { navigator } = window;

const logger = new Logger('widgets.whiteboard');
const NS = '.kendoWhiteboard';
const WIDGET_CLASS = 'k-widget kj-whiteboard';
const CHANGE = 'change';
const ERROR = 'error';

const TYPES = ['video/webm', 'audio/webm', 'video/mpeg', 'video/mp4'];
const CODECS = [
    // https://cs.chromium.org/chromium/src/third_party/WebKit/LayoutTests/fast/mediarecorder/MediaRecorder-isTypeSupported.html
    '', // THis is the only option that works with
    '; codecs="vp8"', // these codecs only work with Chrome, not FF
    ';codecs=vp8',
    ';codecs=vp9',
    ';codecs=daala',
    ';codecs=h264',
    ';codecs=opus'
];

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

const URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

// TODO shimSourceObject from https://webrtc.github.io/adapter/adapter-latest.js

// TODO audio and video source selection
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices

/**
 * navigator.mediaDevices.getUserMedia converted to jQuery promises
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * @see https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/blob/master/mediaDevices-getUserMedia-polyfill.js
 */
function getUserMedia(constraints) {
    const dfd = $.Deferred();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // That's for the most recent browsers
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(dfd.resolve)
            .catch(dfd.reject);
    } else {
        // With older browsers, get ahold of the legacy getUserMedia, if present
        const getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        // If the browser is very old
        if (!getUserMedia) {
            // TODO: we might want to fallback to flash - see https://github.com/addyosmani/getUserMedia.js
            return dfd.reject(
                new Error('getUserMedia is not implemented in this browser')
            );
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
    context.arc(
        context.canvas.width / 2,
        context.canvas.height / 2,
        (context.canvas.height / 2 - 20) * Math.random(),
        0 * Math.PI,
        2 * Math.PI
    );
    context.stroke();
}

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

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
 * @extends Widget
 */
const Whiteboard = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        this.ns = NS;
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.enable(this.options.enabled);
    },

    /**
     * Events
     * @property events
     */
    events: [CHANGE, ERROR],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Whiteboard',
        enabled: true,
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
     * @method _render
     * @private
     */
    _render() {
        const { element } = this;
        this.wrapper = element.addClass(WIDGET_CLASS);
        this.canvas = $(
            format(
                '<canvas width="{0}" height="{1}"></canvas>',
                element.width(),
                element.height()
            )
        ).appendTo(element);
        this.context = this.canvas.get(0).getContext('2d');
        this.video = $('<video autoplay></video>')
            .hide()
            .appendTo(element);
    },

    /**
     * Check browser support
     */
    hasBrowserSupport() {
        // This has to be Firefox 47+ or Chrome 53+
        // Detect browser support (see Modernizr)
        // Or may we should add that to kendo.support so as to be able to check browser support before opening a window with the component
    },

    /**
     * Pause recording/playing
     */
    pause() {},

    /**
     * Play recorded video
     */
    play() {},

    /**
     * Start recording
     */
    record() {
        const that = this;
        const { options } = this;
        const canvas = that.canvas.get(0);
        const video = that.video.get(0);

        that._chunks = [];

        getUserMedia({ audio: options.audio, video: options.video })
            .then(videoStream => {
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
                const mediaStream = canvas.captureStream(options.fps);

                // Ad the audio track
                const audioTrack = videoStream
                    .getTracks()
                    .find(item => item.kind === 'audio');
                mediaStream.addTrack(audioTrack);

                // Create a media recorder - https://developers.google.com/web/updates/2016/01/mediarecorder
                that._mediaRecorder = new window.MediaRecorder(mediaStream, {
                    mimeType: options.mimeType + options.codec
                });

                // Add chunks
                that._mediaRecorder.ondataavailable = function(e) {
                    if (e && e.data && e.data.size > 0) {
                        that._chunks.push(e.data);
                    }
                };

                that._mediaRecorder.onstop = function(e) {
                    const video = document.createElement('video');
                    video.controls = true;
                    const blob = new Blob(that._chunks, {
                        type: options.mimeType
                    });
                    // video.srcObject = blob; won't work with a blog even with modern browsers
                    video.src = URL.createObjectURL(blob);
                    document.body.appendChild(video);
                    that._mediaRecorder = undefined;
                };

                that._mediaRecorder.start();
                that.interval = setInterval(
                    draw,
                    1000 / options.fps,
                    that.context,
                    that.video.get(0)
                );
            })
            .catch(error => {
                window.console.error(error);
            });
    },

    /**
     * Stop recording
     */
    stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = undefined;
        }
        if (this._mediaRecorder) {
            this._mediaRecorder.stop();
        }
    },

    /**
     * Error handler
     * @param err
     * @private
     */
    _errorHandler(err) {
        if (!this.trigger(ERROR)) {
            window.alert('Oops, there was an error'); // TODO
        }
    },

    /**
     * Function called by the enabled/disabled bindings
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !! enable;
        if (enabled) {
            $.noop(); // TODO
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // Unbind events
        this.enable(false);
        // Destroy widget
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(Whiteboard);
