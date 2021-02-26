/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO H264 COdec as in https://github.com/muaz-khan/RecordRTC/issues/97
// https://www.webrtc-experiment.com/RecordRTC/simple-demos/isTypeSupported.html
// TODO: https://github.com/Kagami/ffmpeg.js/
// https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.drawing';
import 'kendo.dialog';
// import 'kendo.userevents'; // Required for getTouches
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    createAudioMeter,
    enumerateDevices,
    getUserMedia,
} from '../common/window.media.es6';

const {
    attr,
    destroy,
    drawing,
    format,
    geometry,
    ns,
    saveAs,
    ui: { plugin, Widget },
} = window.kendo;
const NS = '.kendoMediaRecorder';
const WIDGET_CLASS = 'k-widget kj-mediarecorder';

const logger = new Logger('widgets.mediarecorder');

const URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
const MediaStream = window.MediaStream || window.webkitMediaStream;
const WindowMediaRecorder = window.MediaRecorder; // OUr Widget is already MediaRecorder
const DISABLED_CLASS = 'k-state-disabled';
const ACTIVE_CLASS = 'k-state-active';

const ATTR_SELECTOR = '[{0}="{1}"]';
const TOOGLE_TMPL = `<a class="k-toggle-button k-button" data-${ns}command="{0}" title="{1}" tabindex="0"><span class="k-icon k-i-{2}"></span></a>`;
const BUTTON_TMPL = `<a class="k-button" data-${ns}command="{0}" title="{1}" tabindex="0"><span class="k-icon k-i-{2}"></span></a>`;

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

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
 * @extends Widget
 */
const MediaRecorder = Widget.extend({
    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        // logger.debug({ method: 'init', message: 'widget initialized' });
        this.wrapper = this.element;
        this._render();
        this.enable(this.options.enable);
        this.value(this.options.value);
        // kendo.notify(this); // TODO Review
    },

    /**
     * Events
     */
    events: [CONSTANTS.CHANGE, CONSTANTS.ERROR],

    /**
     * Options
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
            unsupported:
                'Media recording is only available on Chrome and Firefox',
        },
    },

    /**
     * Check MediaRecorder support
     * @returns {boolean}
     * @private
     */
    _isSupported() {
        const { location } = window;
        // getUserMedia() must be run from a secure origin: HTTPS or localhost.
        const isSecureOrigin =
            location.protocol === 'https:' || location.hostname === 'localhost';
        return isSecureOrigin && !!WindowMediaRecorder;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        if (!this._isSupported()) {
            this._unsupportedLayout();
        } else if (options.video) {
            this._videoLayout();
        } else if (options.audio) {
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
    value() {
        return this._chunks;
    },

    /**
     * Oops, your browser does not support our media recorder
     * @private
     */
    _unsupportedLayout() {
        // TODO: Maybe we could use flash in this case - https://github.com/addyosmani/getUserMedia.js
        this.preview = $('<div></div>')
            .text(this.options.messages.unsupported)
            .appendTo(this.element);
        // TODO this._updateToolbar();
    },

    /**
     * Builds the audio layout
     * @private
     */
    _audioLayout() {
        this._initToolbar();
        // TODO Add spectrogram
        // http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
        // https://github.com/miguelmota/spectrogram
        // https://github.com/borismus/spectrogram
        this.preview = $('<audio autoplay></audio>')
            .width('100%')
            .appendTo(this.element);
        this._updateToolbar();
    },

    /**
     * Builds the video layout
     * @private
     */
    _videoLayout() {
        this._initToolbar();
        this.preview = $('<video autoplay></video>')
            .width('100%')
            .appendTo(this.element);
        this._updateToolbar();
    },

    /**
     * Initialize a volume meter
     * @param stream
     * @private
     */
    _initVolumeMeter(stream) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const meter = createAudioMeter(context);
        source.connect(meter);
        this._drawVolumeMeter(meter);
    },

    /**
     * Draws an audio volume meter
     * @see http://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
     * @private
     */
    _drawVolumeMeter(meter) {
        const METER = {
            // TODO use options
            HEIGHT: 24,
            WIDTH: 100,
        };
        if (!this._meter) {
            const div = $('<div class="kj-mediarecorder-meter"></div>')
                .width(METER.WIDTH)
                .height(METER.HEIGHT)
                .appendTo(this.toolbar);
            const surface = drawing.Surface.create(div);
            const rect = new geometry.Rect([0, 0], [METER.WIDTH, METER.HEIGHT]);
            const frame = new drawing.Rect(rect).stroke('#c8c8c8', 1);
            surface.draw(frame);
            this._meter = new drawing.Rect(rect).stroke('#c8c8c8', 1);
            surface.draw(this._meter);
        }
        this._meter.fill(meter.checkClipping() ? 'red' : 'green', 1);
        this._meter.geometry(
            new geometry.Rect(
                [0, 0],
                [METER.WIDTH * meter.volume * 2, METER.HEIGHT]
            )
        );
        window.requestAnimationFrame(() => {
            this._drawVolumeMeter(meter);
        });
    },

    /**
     * Initialize toolbar
     * @private
     */
    _initToolbar() {
        const { messages } = this.options;

        // Build the toolbar
        this.toolbar = $(
            '<div class="k-toolbar k-widget kj-mediarecorder-toolbar"></div>'
        )
            .append(format(BUTTON_TMPL, 'save', messages.save, 'save'))
            .append(format(BUTTON_TMPL, 'record', messages.record, 'circle'))
            .append(
                format(
                    TOOGLE_TMPL,
                    'pauseResume',
                    messages.pauseResume,
                    'pause'
                )
            )
            .append(format(BUTTON_TMPL, 'stop', messages.stop, 'stop')) // TODO Add mute/unmute toggle button
            .appendTo(this.element)
            .on(
                CONSTANTS.CLICK + NS,
                'a.k-button',
                this._onButtonClick.bind(this)
            );

        if (this.options.devices) {
            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            // Display recording devices - see https://webrtc.github.io/samples/src/content/devices/input-output/
            enumerateDevices()
                .then(function (devices) {
                    const cameras = [];
                    const microphones = [];
                    const speakers = [];
                    for (let i = 0, { length } = devices; i < length; i++) {
                        const device = devices[i];
                        switch (device.kind) {
                            case 'audioinput':
                                microphones.push({
                                    id: device.deviceId,
                                    name:
                                        device.label ||
                                        `${messages.microphone} ${
                                            microphones.length + 1
                                        }`,
                                });
                                break;
                            case 'audiooutput':
                                speakers.push({
                                    id: device.deviceId,
                                    name:
                                        device.label ||
                                        `${messages.speaker} ${
                                            speakers.length + 1
                                        }`,
                                });
                                break;
                            case 'videoinput':
                                cameras.push({
                                    id: device.deviceId,
                                    name:
                                        device.label ||
                                        `${messages.camera} ${
                                            cameras.length + 1
                                        }`,
                                });
                                break;
                            default:
                        }
                    }
                    // TODO feed toolbar Dropdownlists
                    // Implement change event to setSinkId as in https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js#L58
                })
                .catch(this._onError);

            /* jshint +W074 */
        }
    },

    /**
     * Event handler for clicking toolbar buttons
     * @param e
     * @private
     */
    _onButtonClick(e) {
        const command = $(e.currentTarget).attr(attr('command'));
        this[command]();
    },

    /**
     * Update the toolbar based on MediaRecorder state
     * @private
     */
    _updateToolbar() {
        // see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/state
        const recorder = this._recorder;
        const state =
            recorder instanceof WindowMediaRecorder
                ? recorder.state
                : 'inactive';
        const isInactive = state === 'inactive';
        // const isRecording = state === 'recording';
        const isPaused = state === 'paused';
        const hasChunks = $.isArray(this._chunks) && this._chunks.length;
        this.toolbar
            .children(format(ATTR_SELECTOR, attr('command'), 'save'))
            .toggleClass(DISABLED_CLASS, !isInactive || !hasChunks);
        this.toolbar
            .children(format(ATTR_SELECTOR, attr('command'), 'record'))
            .toggleClass(DISABLED_CLASS, !isInactive);
        this.toolbar
            .children(format(ATTR_SELECTOR, attr('command'), 'pauseResume'))
            .toggleClass(DISABLED_CLASS, isInactive)
            .toggleClass(ACTIVE_CLASS, isPaused);
        this.toolbar
            .children(format(ATTR_SELECTOR, attr('command'), 'stop'))
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
    mimeType(withCodecs) {
        const MIME_TYPE = '{0};codecs={1}';
        const { options } = this;
        // We need to be explicit about mime types an codecs
        if (
            !options.mimeType ||
            !options.codecs ||
            !WindowMediaRecorder.isTypeSupported(
                format(MIME_TYPE, options.mimeType, options.codecs)
            )
        ) {
            if (
                options.video &&
                WindowMediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ) {
                // true on chrome, false on firefox
                options.mimeType = 'video/webm';
                options.codecs = 'vp9';
            } else if (
                options.video &&
                WindowMediaRecorder.isTypeSupported('video/webm;codecs=vp8')
            ) {
                // true on chrome, false on firefox
                options.mimeType = 'video/webm';
                options.codecs = 'vp8';
            } else if (
                options.audio &&
                WindowMediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ) {
                // true on chrome, false on firefox
                options.mimeType = 'audio/webm';
                options.codecs = 'opus';
            } else if (
                options.audio &&
                WindowMediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
            ) {
                // false on chrome, true on firefox
                options.mimeType = 'audio/ogg';
                options.codecs = 'opus';
            } else {
                throw new Error('Set widget options for audio or video');
            }
        }
        return withCodecs
            ? format(MIME_TYPE, options.mimeType, options.codecs)
            : options.mimeType;
    },

    /* jshint +W074 */

    /**
     * Save function
     * @see http://docs.telerik.com/kendo-ui/framework/save-files/introduction
     * @see http://docs.telerik.com/kendo-ui/api/javascript/kendo#methods-saveAs
     */
    save() {
        const blob = new Blob(this.value(), { type: this.mimeType() });
        saveAs({
            dataURI: blob,
            fileName: `test.${this.mimeType().replace(/^\w+\//, '')}`,
            proxyURL: this.options.proxy,
        });
    },

    /**
     * Start recording
     */
    record() {
        const that = this;
        const { options } = that;
        that._chunks = [];
        getUserMedia({ audio: options.audio, video: options.video })
            .then(function (stream) {
                that._preview(stream);
                that._initVolumeMeter(stream);
                const config = {
                    // audioBitsPerSecond : options.audioBitsPerSecond,
                    // videoBitsPerSecond : options.videoBitsPerSecond,
                    mimeType: that.mimeType(true),
                };
                // Create a media recorder - https://developers.google.com/web/updates/2016/01/mediarecorder
                // eslint-disable-next-line no-multi-assign
                const recorder = new WindowMediaRecorder(stream, config);
                that._recorder = recorder;
                recorder.onerror = that._onError.bind(that);
                recorder.onstart = that._onStart.bind(that);
                recorder.ondataavailable = that._onDataAvailable.bind(that);
                recorder.onpause = that._onPause.bind(that);
                recorder.onresume = that._onResume.bind(that);
                recorder.onstop = that._onStop.bind(that);
                recorder.start();
            })
            .catch(that._onError.bind(that));
    },

    /**
     * Pause/resume recording
     */
    pauseResume() {
        const recorder = this._recorder;
        if (recorder instanceof WindowMediaRecorder) {
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
    stop() {
        const recorder = this._recorder;
        if (
            recorder instanceof WindowMediaRecorder &&
            recorder.state !== 'inactive'
        ) {
            recorder.stop();
            recorder.stream
                .getTracks() // get all tracks from the MediaStream
                .forEach(function (track) {
                    track.stop();
                }); // stop each of them
        }
    },

    /**
     * Mute/unmute
     * @param muted
     */
    mute(muted) {
        const recorder = this._recorder;
        if (recorder instanceof WindowMediaRecorder) {
            muted = $.type(muted) === CONSTANTS.UNDEFINED ? true : !!muted;
            recorder.stream.getAudioTracks().forEach((track) => {
                track.enabled = !muted;
            });
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
    _onError(err) {
        logger.error({ method: '_onError', error: err });
        if (!this.trigger(CONSTANTS.ERROR, { originalError: err })) {
            if (err.name === 'TrackStartError') {
                // instanceof window.NavigatorUserMediaError) {
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
    _onStart(/* e */) {
        logger.debug({ method: '_onStart', message: 'Recording started' });
        this._updateToolbar();
    },

    /**
     * Data available event handler
     * @param e
     * @private
     */
    _onDataAvailable(e) {
        if (e && e.data && e.data.size > 0) {
            this._chunks.push(e.data);
        }
    },

    /**
     * Pause event handler
     * @param e
     * @private
     */
    _onPause(e) {
        logger.debug({ method: '_onPause', message: 'Recording paused' });
        this._updateToolbar();
    },

    /**
     * Resume event handler
     * @param e
     * @private
     */
    _onResume(e) {
        logger.debug({ method: '_onResume', message: 'Recording resumed' });
        this._updateToolbar();
    },

    /**
     * Stop event handler
     * @param e
     * @private
     */
    _onStop(e) {
        logger.debug({ method: '_onStop', message: 'Recording stopped' });
        this._updateToolbar();
        this._preview(this._chunks);
    },

    /**
     * Reset content preview
     * @param content
     * @private
     */
    _preview(content) {
        const preview = this.preview.get(0);
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
            let blob = content; // content might still be a MediaStream if srcObject is not supported
            if ($.isArray(content)) {
                blob = new Blob(content, { type: this.mimeType() });
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
    _resize(e) {
        // TODO to make video as big as possible and centered in widget, but is this the best option?
    },

    /**
     * Function called by the enabled/disabled bindings
     * @param enable
     */
    enable(enabled) {
        // TODO
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const { element } = that;
        // Unbind events
        that.enable(false);

        // Clear references
        that.preview = undefined;
        that.toolbar = undefined;
        that._recorder = undefined;
        that._chunks = undefined;
        // Destroy widget
        Widget.fn.destroy.call(this);
        destroy(element);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'MediaRecorder')) {
    // Prevents loading several times in karma
    plugin(MediaRecorder);
}
