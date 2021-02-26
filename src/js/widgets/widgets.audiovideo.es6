/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Check http://blog.falafel.com/new-kendo-ui-media-player-widget-mvvm/ and consider improvements
// TODO Add seeker to top of toolbar
// TODO Add volume in popup
// TODO Add YouTube iframe

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.fx';
import 'kendo.slider';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    attr,
    destroy,
    format,
    fx,
    ns,
    ui: { plugin, Slider, Widget },
} = window.kendo;

const logger = new Logger('widgets.audiovideo');
const NS = '.kendoAudioVideo';
const WIDGET_CLASS = 'k-widget kj-audiovideo';
const TOOLBAR_CLASS = 'k-widget k-toolbar kj-audiovideo-toolbar';
const BUTTON_TMPL = `<a href="#" class="k-button k-button-icon" data-${ns}${CONSTANTS.ACTION}="{0}" tabindex="0" title="{1}"><span class="k-icon {2}"></span></a>`;
const BUTTON_SELECTOR = `a.k-button[${attr(CONSTANTS.ACTION)}="{0}"]`;
const ICON_SELECTOR = 'span.k-icon';
const SEEKER_CLASS = 'kj-audiovideo-seeker';
const SEEKER_SELECTOR = `div.${SEEKER_CLASS}`;
const TIME_CLASS = 'kj-audiovideo-time';
const TIME_SELECTOR = `span.${TIME_CLASS}`;
const VOLUME_CLASS = 'kj-audiovideo-volume';
const VOLUME_SELECTOR = `div.${VOLUME_CLASS}`;
const MEDIA_EVENTS = {
    LOADEDMETADATA: 'loadedmetadata',
    PLAY: 'play',
    TIMEUPDATE: 'timeupdate',
    VOLUMECHANGE: 'volumechange',
    PAUSE: 'pause',
    ENDED: 'ended',
};
const ACTIONS = {
    PLAY: 'play',
    VOLUME: 'volume',
    FULL_SCREEN: 'full', // full screen
};
const MODES = {
    AUDIO: 'audio',
    VIDEO: 'video',
};
const ICONS = {
    // @see https://docs.telerik.com/kendo-ui/styles-and-layout/icons-web
    FULL_SCREEN: 'k-i-full-screen',
    MUTE: 'k-i-volume-off',
    PAUSE: 'k-i-pause',
    PLAY: 'k-i-play',
    VOLUME_DOWN: 'k-i-volume-down',
    VOLUME_UP: 'k-i-volume-up',
};

/**
 * Docs about media playing
 * @see http://camendesign.com/code/video_for_everybody
 * @see http://blog.falafel.com/new-kendo-ui-media-player-widget-mvvm/
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
 */

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

/**
 * Convert file extension to mime type
 * @see http://hul.harvard.edu/ois/systems/wax/wax-public-help/mimetypes.htm
 * @param url
 * @returns {*}
 */
function typeFormatter(url) {
    assert.type(
        CONSTANTS.STRING,
        url,
        assert.format(assert.messages.type.default, 'url', CONSTANTS.STRING)
    );
    const ext = url.split('.').pop();
    switch (ext) {
        case 'mp3':
            // @see http://tools.ietf.org/html/rfc3003
            // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#MP3
            return 'audio/mpeg';
        case 'mp4':
            // @see http://www.rfc-editor.org/rfc/rfc4337.txt
            return 'video/mp4';
        case 'ogg':
            return 'audio/ogg';
        case 'ogv':
            return 'video/ogg';
        case 'wav':
            return 'audio/wav';
        case 'webm':
            return 'video/webm';
        default:
            return 'application/octet-stream';
    }
}

/**
 * Format duration as MM:SS
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
 * @param seconds
 */
function toHMS(seconds) {
    assert.type(
        CONSTANTS.NUMBER,
        seconds,
        assert.format(assert.messages.type.default, 'seconds', CONSTANTS.NUMBER)
    );
    assert.ok(
        seconds >= 0 && seconds < 24 * 60 * 60,
        'Cannot format negative numbers or days.'
    );
    let s = Math.round(seconds);
    let m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    s %= 60;
    m %= 60;
    if (h === 0) {
        return format('{0:00}:{1:00}', m, s);
    }
    return format('{0:00}:{1:00}:{2:00}', h, m, s);
}

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * AudioVideo widget
 */
const AudioVideo = Widget.extend({
    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
    },

    /**
     * Options
     */
    options: {
        name: 'AudioVideo',
        autoPlay: false, // loop
        enabled: true,
        files: [],
        messages: {
            play: 'Play/Pause',
            mute: 'Mute/Unmute',
            fullScreen: 'Full Screen',
            notSupported: 'Media not supported',
        },
        mode: MODES.AUDIO,
        toolbarHeight: 48, // For video only
    },

    /*
    events: [],
    */

    /**
     * Modes
     */
    modes: {
        audio: MODES.AUDIO,
        video: MODES.VIDEO,
    },

    /**
     * Render the widget
     * @private
     */
    _render() {
        const { element, options } = this;
        // CONSTANTS.INTERACTIVE_CLASS (which might be shared with other widgets)
        // is used to position any drawing surface underneath interactive widgets
        this.wrapper = element
            .addClass(WIDGET_CLASS)
            .addClass(CONSTANTS.INTERACTIVE_CLASS)
            .css({ position: 'relative' }); // For an absolute positioned toolbar
        this._media();
        this._toolbar();
        this.enable(options.enabled);
    },

    /**
     * Add HTML 5 audio/video tag
     * @private
     */
    _media() {
        const { element, options } = this;
        // Create audio or video tag
        if (options.mode === MODES.AUDIO) {
            this.media = $('<audio/>');
        } else {
            this.media = $('<video/>');
        }
        this.media
            .attr('preload', 'auto')
            .prop('autoplay', options.autoPlay)
            .css({ width: '100%' });
        // .css({ height: '100%', width: '100%' });
        // Add source files
        const files =
            $.type(options.files) === CONSTANTS.STRING
                ? [options.files]
                : options.files;
        assert.isArray(
            files,
            assert.format(assert.messages.isArray.default, 'options.files')
        );
        files.forEach((url) => {
            if ($.type(url) === CONSTANTS.STRING && url.length) {
                $('<source/>')
                    .attr({ src: url, type: typeFormatter(url) })
                    .appendTo(this.media);
            }
        });

        // Initialize media element
        // Note: These event handlers are required because the toolbar needs to be updated
        // when commands are executed in full screen mode, e.g. a PAUSE in full screen should update the toolbar icon
        this.media
            .append(options.messages.notSupported)
            .on(MEDIA_EVENTS.LOADEDMETADATA, this._onLoadedMetadata.bind(this))
            .on(MEDIA_EVENTS.PLAY, this._onPlay.bind(this))
            .on(MEDIA_EVENTS.TIMEUPDATE, this._onTimeUpdate.bind(this))
            .on(MEDIA_EVENTS.PAUSE, this._onPause.bind(this))
            .on(MEDIA_EVENTS.ENDED, this._onEnded.bind(this))
            .on(MEDIA_EVENTS.VOLUMECHANGE, this._onVolumeChange.bind(this));

        // Append media element to widget
        element.append(this.media);
    },

    /**
     * Event handler called when media metadata is loaded
     * @param e
     * @private
     */
    _onLoadedMetadata(e) {
        // This is where we initially set our toolbar values
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        if (
            this.toolbar instanceof $ &&
            this.seekerSlider instanceof Slider &&
            this.volumeSlider instanceof Slider
        ) {
            const mediaElement = e.target;
            assert.instanceof(
                window.HTMLMediaElement,
                mediaElement,
                assert.format(
                    assert.messages.instanceof.default,
                    'this.media.get(0)',
                    'HTMLMediaElement'
                )
            );
            this._setSeekerSlider(mediaElement.duration);
            this.seekerSlider.value(0);
            this.toolbar.find(TIME_SELECTOR).text(toHMS(mediaElement.duration));
            this.volumeSlider.value(mediaElement.volume);
            // we now need to resize our toolbar properly
            this.resize();
        }
    },

    /**
     * Event handler triggered when media is played
     * @param e
     * @private
     */
    _onPlay(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        if (this.toolbar instanceof $) {
            this.toolbar
                .find(format(BUTTON_SELECTOR, ACTIONS.PLAY))
                .children(ICON_SELECTOR)
                .removeClass(ICONS.PLAY)
                .addClass(ICONS.PAUSE);
        }
    },

    /**
     * Event hander periodically triggered as playback progresses
     * @param e
     * @private
     */
    _onTimeUpdate(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        if (this.toolbar instanceof $) {
            const mediaElement = e.target;
            assert.instanceof(
                window.HTMLMediaElement,
                mediaElement,
                assert.format(
                    assert.messages.instanceof.default,
                    'this.media.get(0)',
                    'HTMLMediaElement'
                )
            );
            this.toolbar
                .find(TIME_SELECTOR)
                .text(toHMS(mediaElement.duration - mediaElement.currentTime));
            this.seekerSlider.value(mediaElement.currentTime);
        }
    },

    /**
     * Event handler triggered when playback is paused
     * @param e
     * @private
     */
    _onPause(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        if (this.toolbar instanceof $) {
            this.toolbar
                .find(format(BUTTON_SELECTOR, ACTIONS.PLAY))
                .children(ICON_SELECTOR)
                .removeClass(ICONS.PAUSE)
                .addClass(ICONS.PLAY);
        }
    },

    /**
     * Event handler triggered when playback ends
     * @param e
     * @private
     */
    _onEnded(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        if (this.toolbar instanceof $ && this.seekerSlider instanceof Slider) {
            const mediaElement = e.target;
            assert.instanceof(
                window.HTMLMediaElement,
                mediaElement,
                assert.format(
                    assert.messages.instanceof.default,
                    'this.media.get(0)',
                    'HTMLMediaElement'
                )
            );
            mediaElement.currentTime = 0;
            this.seekerSlider.value(mediaElement.currentTime);
            this.toolbar
                .find(format(BUTTON_SELECTOR, ACTIONS.PLAY))
                .children(ICON_SELECTOR)
                .removeClass(ICONS.PAUSE)
                .addClass(ICONS.PLAY);
        }
    },

    /**
     * Event handler trigger when volume changes (including muting)
     * @param e
     * @private
     */
    _onVolumeChange(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        if (this.toolbar instanceof $ && this.volumeSlider instanceof Slider) {
            if (mediaElement.muted) {
                this.volumeSlider.value(0);
                this.toolbar
                    .find(format(BUTTON_SELECTOR, ACTIONS.VOLUME))
                    .children(ICON_SELECTOR)
                    .removeClass(ICONS.MUTE)
                    .addClass(ICONS.VOLUME_UP);
            } else {
                this.volumeSlider.value(mediaElement.volume);
                this.toolbar
                    .find(format(BUTTON_SELECTOR, ACTIONS.VOLUME))
                    .children(ICON_SELECTOR)
                    .removeClass(ICONS.VOLUME_UP)
                    .addClass(ICONS.MUTE);
            }
        }
    },

    /**
     * Add toolbar (play/pause, seeker, time, mute/unmute, volume, full screen)
     * @private
     */
    _toolbar() {
        const { element, options } = this;
        const css = {
            boxSizing: 'border-box',
            width: '100%',
        };
        if (options.mode === MODES.VIDEO) {
            $.extend(css, {
                bottom: 0,
                left: 0,
                position: 'absolute',
                // We hide the toolbar until we get loadedmetadata to resize it properly.
                // We cannot use display:none which yields incorrect measurements
                visibility: 'hidden',
                zIndex: 99,
            });
        }
        this.toolbar = $(`<${CONSTANTS.DIV}/>`)
            .addClass(TOOLBAR_CLASS)
            .css(css)
            .appendTo(element);

        // Play button
        $(
            format(BUTTON_TMPL, ACTIONS.PLAY, options.messages.play, ICONS.PLAY)
        ).appendTo(this.toolbar);

        // Seeker slider
        this._setSeekerSlider(1);

        // Remaining time span
        $(`<${CONSTANTS.SPAN}/>`).addClass(TIME_CLASS).appendTo(this.toolbar);

        // Mute/Unmute button
        $(
            format(
                BUTTON_TMPL,
                ACTIONS.VOLUME,
                options.messages.mute,
                ICONS.MUTE
            )
        ).appendTo(this.toolbar);

        // Volume slider
        this._setVolumeSlider();

        // Full screen button (for video only)
        if (options.mode === MODES.VIDEO) {
            $(
                format(
                    BUTTON_TMPL,
                    ACTIONS.FULL_SCREEN,
                    options.messages.fullScreen,
                    ICONS.FULL_SCREEN
                )
            ).appendTo(this.toolbar);
        }
    },

    /**
     * Set the sleeker slider with new max
     * @see http://www.telerik.com/forums/how-do-i-update-the-slider-max-option-after-creation
     * @param max
     * @private
     */
    _setSeekerSlider(max) {
        const { toolbar } = this;
        let $div = toolbar.find(SEEKER_SELECTOR);
        if ($div && $div.length === 0) {
            $div = $(`<${CONSTANTS.DIV}/>`)
                .addClass(SEEKER_CLASS)
                .appendTo(toolbar);
        }
        const slider = $div.find('input').data('kendoSlider');
        if (slider instanceof Slider) {
            slider.destroy();
            $div.empty();
        }
        this.seekerSlider = $(`<${CONSTANTS.INPUT}>`)
            .appendTo($div)
            .kendoSlider({
                max,
                min: 0,
                smallStep: 0.1,
                largeStep: 1,
                showButtons: false,
                tickPlacement: 'none',
                tooltip: {
                    template: (data) => toHMS(data.value),
                },
                change: this._onSeekerSliderChange.bind(this),
            })
            .data('kendoSlider');
    },

    /**
     * Set the volume slider
     * Note: the max is always 1
     * @private
     */
    _setVolumeSlider() {
        const { toolbar } = this;
        let $div = toolbar.find(VOLUME_SELECTOR);
        if ($div && $div.length === 0) {
            $div = $(`<${CONSTANTS.DIV}/>`)
                .addClass(VOLUME_CLASS)
                .appendTo(toolbar);
        }
        const slider = $div.find('input').data('kendoSlider');
        if (slider instanceof Slider) {
            slider.destroy();
            $div.empty();
        }
        this.volumeSlider = $(`<${CONSTANTS.INPUT}>`)
            .appendTo($div)
            .kendoSlider({
                max: 1, // max volume is always 1
                min: 0,
                smallStep: 0.05,
                largeStep: 0.25,
                showButtons: false,
                tickPlacement: 'none',
                tooltip: { format: '{0:p0}' },
                change: this._onVolumeSliderChange.bind(this),
            })
            .data('kendoSlider');
    },

    /**
     * Event handler triggered when clicking a media player toolbar button
     * @param e
     * @private
     */
    _onButtonClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const action = $(e.currentTarget).attr(attr(CONSTANTS.ACTION));
        switch (action) {
            case ACTIONS.PLAY:
            default:
                this.togglePlayPause();
                break;
            case ACTIONS.VOLUME:
                this.toggleMute();
                break;
            case ACTIONS.FULL_SCREEN:
                this.toggleFullScreen();
                break;
        }
    },

    /**
     * Toggle play pause
     * @returns {*}
     */
    togglePlayPause() {
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        const dfd = $.Deferred();
        let promise;
        try {
            // @see https://developers.google.com/web/updates/2016/03/play-returns-promise
            // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
            promise =
                mediaElement.paused && mediaElement.readyState >= 1
                    ? mediaElement.play()
                    : mediaElement.pause();
            if (promise instanceof Promise) {
                promise.then(dfd.resolve).catch(dfd.reject);
            } else {
                dfd.resolve();
            }
        } catch (ex) {
            dfd.reject(ex);
        }
        return dfd.promise();
    },

    /**
     * Toggle muted sound
     */
    toggleMute() {
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        mediaElement.muted = !mediaElement.muted;
    },

    /**
     * set full screen mode
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
     * @see http://www.sitepoint.com/use-html5-full-screen-api/
     */
    toggleFullScreen() {
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLVideoElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLVideoElement'
            )
        );
        if (
            document.fullscreenElement === mediaElement ||
            document.webkitFullscreenElement === mediaElement ||
            document.msFullscreenElement === mediaElement ||
            document.mozFullScreenElement === mediaElement
        ) {
            if ($.isFunction(document.exitFullscreen)) {
                document.exitFullscreen();
            } else if ($.isFunction(document.webkitExitFullscreen)) {
                document.webkitExitFullscreen();
            } else if ($.isFunction(document.msExitFullscreen)) {
                document.msExitFullscreen();
            } else if ($.isFunction(document.mozCancelFullScreen)) {
                document.mozCancelFullScreen();
            }
        } else if (
            document.fullscreenEnabled &&
            $.isFunction(mediaElement.requestFullscreen)
        ) {
            mediaElement.requestFullscreen();
        } else if (
            document.webkitFullscreenEnabled &&
            $.isFunction(mediaElement.webkitRequestFullscreen)
        ) {
            mediaElement.webkitRequestFullscreen(
                window.Element.ALLOW_KEYBOARD_INPUT
            );
        } else if (
            document.msFullscreenEnabled &&
            $.isFunction(mediaElement.msRequestFullscreen)
        ) {
            mediaElement.msRequestFullscreen();
        } else if (
            document.mozFullScreenEnabled &&
            $.isFunction(mediaElement.mozRequestFullScreen)
        ) {
            mediaElement.mozRequestFullScreen();
        }
    },

    /**
     * Event handler for changing the value of the volume slider
     * @param e
     * @private
     */
    _onVolumeSliderChange(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'e',
                'jQuery.Event'
            )
        );
        this.volume(e.value);
    },

    /**
     * API to get/set the volume
     * @param value
     * @returns {*|number}
     */
    volume(value) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = mediaElement.volume;
        } else if (value < 0) {
            mediaElement.volume = 0;
        } else if (value > 1) {
            mediaElement.volume = 1;
        } else {
            mediaElement.volume = value;
        }
        return ret;
    },

    /**
     * Event handler for changing the value of teh seeker slider
     * ATTENTION: videos are not seekable (or loopable) in Chrome if the server is not configured to allow partial content requests (incl. range)
     * @see http://stackoverflow.com/questions/8088364/html5-video-will-not-loop
     * @param e
     * @private
     */
    _onSeekerSliderChange(e) {
        this.seek(e.value);
    },

    /**
     * API to get/set the seeked currentTime
     * @param value
     */
    seek(value) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        const mediaElement = this.media.get(0);
        assert.instanceof(
            window.HTMLMediaElement,
            mediaElement,
            assert.format(
                assert.messages.instanceof.default,
                'this.media.get(0)',
                'HTMLMediaElement'
            )
        );
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = mediaElement.currentTime;
        } else {
            const currentTime = Math.min(
                Math.max(value, 0),
                mediaElement.duration
            );
            mediaElement.pause();
            if (
                currentTime >= mediaElement.seekable.start(0) &&
                currentTime <= mediaElement.seekable.end(0)
            ) {
                mediaElement.currentTime = currentTime;
            } else {
                mediaElement.currentTime = 0;
            }
            if (!mediaElement.paused) {
                mediaElement.play();
            }
        }
        return ret;
    },

    /**
     * Resizes the widget
     * @see especially http://docs.telerik.com/kendo-ui/api/javascript/ui/slider#methods-resize
     */
    resize() {
        const {
            element,
            media,
            options,
            seekerSlider,
            toolbar,
            volumeSlider,
        } = this;
        if (
            media instanceof $ &&
            toolbar instanceof $ &&
            seekerSlider instanceof Slider &&
            volumeSlider instanceof Slider
        ) {
            // Note: height and width calculations do not work if display: none
            toolbar.css({ visibility: 'hidden' }).show();
            const buttons = toolbar.find('a.k-button').show();
            const seekerDiv = toolbar.find(SEEKER_SELECTOR).show();
            const timeDiv = toolbar.find(TIME_SELECTOR).show();
            const volumeDiv = toolbar.find(VOLUME_SELECTOR).show();
            const isVideo = options.mode === MODES.VIDEO;
            const height = isVideo ? options.toolbarHeight : element.height();
            const width = element.width();
            const ratio = height / 100;
            const fontRatio = 0.8;
            const margin = 4 * ratio;
            const radius = height - 2 * margin;
            const minSeekerSize = 1.5 * radius;
            // Resize element
            if (isVideo) {
                element.height(media.height());
            }
            // Resize toolbar
            toolbar.height(height);
            // Resize buttons
            buttons.css({
                fontSize: 0.7 * fontRatio * radius,
                height: radius,
                width: radius,
                margin,
            });
            buttons.children('svg').attr({
                height: Math.max(radius - 10, 0),
                width: Math.max(radius - 10, 0),
            });
            const buttonSize = radius + 2 * margin;
            // Resize timer
            timeDiv.css({
                fontSize: fontRatio * radius,
                margin: `0 ${margin}`,
                lineHeight: '1em',
            });
            // timeDiv.width(timeDiv.width()); // we do not want the width to change when the number of digits drops
            const timeSize = timeDiv.width() + 2 * margin;
            // Resize volume slider
            volumeDiv.css({ margin: 3 * margin });
            volumeSlider.wrapper.width(radius);
            volumeSlider.resize();
            const volumeSize = volumeDiv.width() + 6 * margin;
            // Resize seeker slider
            const seekerSize =
                toolbar.width() -
                (buttons.length * buttonSize + timeSize + volumeSize);
            seekerDiv.css({ margin: 3 * margin });
            seekerSlider.wrapper.width(
                Math.max(seekerSize - 6 * margin - 24 * ratio, 0)
            ); // 24 * ratio is empirical
            seekerSlider.resize();
            // Update slider dimensions
            if (ratio > 0.5) {
                const tracks = toolbar.find('.k-slider-track');
                const hT = 8; // parseInt(tracks.css('height'), 10);
                const mT = -4; // parseInt(tracks.css('margin-top'), 10);
                tracks.css({
                    height: 2 * ratio * hT,
                    marginTop: 2 * ratio * mT,
                });
                const selections = toolbar.find('.k-slider-selection');
                selections.css({
                    height: 2 * ratio * hT,
                    marginTop: 2 * ratio * mT,
                });
                const handles = toolbar.find('.k-draghandle');
                // var tH = -4; // parseInt(handles.css('top'), 10);
                // var hH = 14; // parseInt(handles.css('height'), 10);
                // var wH = 13; // parseInt(handles.css('width'), 10);
                // var rH = 7;  // parseInt(handles.css('borderRadius'), 10);
                handles.css({
                    // top: 2 * ratio * mT,
                    height: 4 * ratio * hT,
                    width: 4 * ratio * hT,
                    borderRadius: 2 * ratio * hT,
                });
                // Reset the position of the seeker handle
                handles.first().css({ left: -2 * ratio * hT });
            }
            // Display/hide elements
            // Play button is always visible
            buttons
                .find(format(BUTTON_SELECTOR, ACTIONS.VOLUME))
                .toggle(width >= buttons.length * buttonSize);
            buttons
                .find(format(BUTTON_SELECTOR, ACTIONS.FULL_SCREEN))
                .toggle(width >= (buttons.length - 1) * buttonSize);
            timeDiv.toggle(width >= buttons.length * buttonSize + timeSize);
            volumeDiv.toggle(
                width >= buttons.length * buttonSize + timeSize + volumeSize
            );
            seekerDiv.toggle(seekerDiv.width() >= minSeekerSize);
            toolbar
                .toggle(!isVideo || !this._enabled)
                .css({ visibility: 'visible' });
        }
    },

    /**
     * Enables/disables the widget
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { element, options, seekerSlider, toolbar, volumeSlider } = this;
        if (
            toolbar instanceof $ &&
            seekerSlider instanceof Slider &&
            volumeSlider instanceof Slider
        ) {
            element.off(NS);
            toolbar.off(NS);
            if (enabled) {
                element.on(`${CONSTANTS.RESIZE}${NS}`, this.resize.bind(this));
                if (options.mode === MODES.VIDEO) {
                    element
                        .on(
                            `${CONSTANTS.MOUSEENTER}${NS} ${CONSTANTS.TOUCHSTART}${NS}`,
                            () => {
                                // toolbar.show(TDURATION);
                                fx(toolbar).expand('vertical').stop().play();
                            }
                        )
                        .on(
                            `${CONSTANTS.MOUSELEAVE}${NS} ${CONSTANTS.FOCUSOUT}${NS}`,
                            () => {
                                // toolbar.hide(DURATION);
                                fx(toolbar).expand('vertical').stop().reverse();
                            }
                        );
                }
                toolbar
                    .removeClass(CONSTANTS.DISABLED_CLASS)
                    .on(
                        `${CONSTANTS.CLICK}${NS}`,
                        'a.k-button',
                        this._onButtonClick.bind(this)
                    );
            } else {
                toolbar.addClass(CONSTANTS.DISABLED_CLASS).show();
            }
            seekerSlider.enable(enabled);
            volumeSlider.enable(enabled);
            this._enabled = enabled;
        }
    },

    /**
     * Destroy widget
     */
    destroy() {
        const { element } = this;
        Widget.fn.destroy.call(this);
        // unbind all other events
        element.find('*').off();
        element.off();
        // remove descendants
        element.empty();
        // remove element classes
        element.removeClass(WIDGET_CLASS);
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'AudioVideo')) {
    // Prevents loading several times in karma
    plugin(AudioVideo);
}
