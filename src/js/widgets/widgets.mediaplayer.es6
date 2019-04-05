/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.slider';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    attr,
    data: { ObservableArray },
    destroy,
    format,
    ns,
    roleSelector,
    support,
    template,
    ui: { plugin, Slider, Widget },
    unbind
} = window.kendo;
const logger = new Logger('widgets.navigation');

const NS = '.kendoMediaPlayer';
const WIDGET_CLASS = 'k-widget kj-mediaplayer';

const ARRAY = 'array';
const INTERACTIVE_CLASS = 'kj-interactive';
const TOOLBAR_CLASS = 'k-widget k-toolbar kj-mediaplayer-toolbar';
const BUTTON_CLASS = 'k-button kj-mediaplayer-button';
const COMMAND = 'command';
const BUTTON_SELECTOR = `a.kj-mediaplayer-button[${kendo.attr(COMMAND)}="{0}"]`;
const SEEKER_CLASS = 'kj-mediaplayer-seeker';
const SEEKER_SELECTOR = `div.${SEEKER_CLASS}`;
const TIME_CLASS = 'kj-mediaplayer-time';
const TIME_SELECTOR = `span.${TIME_CLASS}`;
const VOLUME_CLASS = 'kj-mediaplayer-volume';
const VOLUME_SELECTOR = `div.${VOLUME_CLASS}`;
const DISABLE = 'k-state-disabled';
const CLICK = 'click';
const LOADEDMETADATA = 'loadedmetadata';
const PLAY = 'play';
const TIMEUPDATE = 'timeupdate';
const VOLUMECHANGE = 'volumechange';
const PAUSE = 'pause';
const ENDED = 'ended';
const ENTEREVENTS = `mouseenter${NS} touchstart${NS}`;
const LEAVEEVENTS = `mouseleave${NS} focusout${NS}`;
const EVENTDURATION = 300;
const MODES = {
    AUDIO: 'audio',
    VIDEO: 'video'
};
const COMMANDS = {
    PLAY: 'play',
    MUTE: 'mute',
    FULL: 'full' // full screen
};
const SVG = {
    FULL:
        '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<path id="curve3" fill="#000000" d="M6530 5627c460,457 923,911 1381,1369l0 -971c0,-66 38,-123 99,-148 61,-25 128,-12 174,35l589 598c123,125 187,276 187,452l0 1678c0,176 -144,320 -320,320l-1678 0c-176,0 -329,-62 -452,-187l-588 -598c-47,-47 -60,-114 -35,-175 25,-61 82,-98 148,-99l971 0c-457,-457 -917,-913 -1376,-1368l900 -906z"/>' +
        '<path id="curve2" fill="#000000" d="M4613 6530c-457,460 -911,923 -1369,1381l971 0c66,0 123,38 148,99 25,61 12,128 -35,174l-598 589c-125,123 -276,187 -452,187l-1678 0c-176,0 -320,-144 -320,-320l0 -1678c0,-176 62,-329 187,-452l598 -588c47,-47 114,-60 175,-35 61,25 98,82 99,148l0 971c457,-457 913,-917 1368,-1376l906 900z"/>' +
        '<path id="curve1" fill="#000000" d="M5627 3710c457,-460 911,-923 1369,-1381l-971 0c-66,0 -123,-38 -148,-99 -25,-61 -12,-128 35,-174l598 -589c125,-123 276,-187 452,-187l1678 0c176,0 320,144 320,320l0 1678c0,176 -62,329 -187,452l-598 588c-47,47 -114,60 -175,35 -61,-25 -98,-82 -99,-148l0 -971c-457,457 -913,917 -1368,1376l-906 -900z"/>' +
        '<path id="curve0" fill="#000000" d="M3710 4613c-460,-457 -923,-911 -1381,-1369l0 971c0,66 -38,123 -99,148 -61,25 -128,12 -174,-35l-589 -598c-123,-125 -187,-276 -187,-452l0 -1678c0,-176 144,-320 320,-320l1678 0c176,0 329,62 452,187l588 598c47,47 60,114 35,175 -25,61 -82,98 -148,99l-971 0c457,457 917,913 1376,1368l-900 906z"/>' +
        '</svg>',
    MUTE:
        '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<path id="curve3" fill="#000000" d="M6080 7660c1263,-157 2240,-1235 2240,-2540 0,-1305 -977,-2383 -2240,-2540l0 647c908,152 1600,942 1600,1893 0,951 -692,1741 -1600,1893l0 647z"/>' +
        '<path id="curve2" fill="#000000" d="M6080 6360c552,-142 960,-644 960,-1240 0,-596 -408,-1098 -960,-1240l0 686c191,110 320,317 320,554 0,237 -129,444 -320,554l0 686z"/>' +
        '<path id="curve1" fill="#000000" d="M960 3520l320 0 0 -320 1280 0 0 3840 -1280 0 0 -320 -320 0c-220,0 -320,-144 -320,-320l0 -2560c0,-176 100,-320 320,-320z"/>' +
        '<path id="curve0" fill="#000000" d="M5440 640l0 0c176,0 320,144 320,320l0 8320c0,176 -144,320 -320,320l0 0c-176,0 -320,-144 -320,-320l-2240 -2240 0 -3840 2240 -2240c0,-176 144,-320 320,-320z"/>' +
        '</svg>',
    PAUSE:
        '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<path id="curve1" fill="#000000" d="M6400 1280l1280 0c353,0 640,288 640,640l0 6400c0,352 -288,640 -640,640l-1280 0c-352,0 -640,-288 -640,-640l0 -6400c0,-353 287,-640 640,-640z"/>' +
        '<path id="curve0" fill="#000000" d="M2560 1280l1280 0c353,0 640,288 640,640l0 6400c0,352 -288,640 -640,640l-1280 0c-352,0 -640,-287 -640,-640l0 -6400c0,-353 287,-640 640,-640z"/>' +
        '</svg>',
    PLAY:
        '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<path id="curve0" fill="#000000" d="M2878 1364l5757 3209c207,115 325,314 325,547 0,233 -118,432 -325,547l-5757 3209c-204,113 -436,112 -639,-4 -203,-116 -319,-313 -319,-544l0 -6416c0,-231 116,-428 319,-544 203,-116 435,-117 639,-4z"/>' +
        '</svg>',
    SOUND:
        '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<path id="curve2" fill="#000000" d="M960 3520l320 0 0 -320 1280 0 0 3840 -1280 0 0 -320 -320 0c-220,0 -320,-144 -320,-320l0 -2560c0,-176 100,-320 320,-320z"/>' +
        '<path id="curve1" fill="#000000" d="M5440 640c176,0 320,144 320,320l0 8320c0,176 -144,320 -320,320 -176,0 -320,-144 -320,-320l-2240 -2240 0 -3840 2240 -2240c0,-176 144,-320 320,-320z"/>' +
        '<path id="curve0" fill="#000000" d="M8921 7266l-921 -921 -921 921c-125,125 -328,125 -453,0l-452 -452c-125,-125 -125,-328 0,-453l921 -921 -921 -921c-125,-125 -125,-328 0,-453l452 -452c125,-125 328,-125 453,0l921 921 921 -921c125,-125 328,-125 453,0l452 452c125,125 125,328 0,453l-921 921 921 921c125,125 125,328 0,453l-452 452c-125,125 -328,125 -453,0z"/>' +
        '</svg>'
};
const SVG_MARGIN = '2px 0 0 -2px';
const PX = 'px';

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
        return kendo.format('{0:00}:{1:00}', m, s);
    }
    return kendo.format('{0:00}:{1:00}:{2:00}', h, m, s);
}

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * MediaPlayer widget
 */
const MediaPlayer = Widget.extend({
    // TODO: Check http://blog.falafel.com/new-kendo-ui-media-player-widget-mvvm/ and consider improvements

    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        that._layout();
    },

    options: {
        name: 'MediaPlayer',
        mode: MODES.AUDIO,
        autoPlay: false, // loop?
        files: [],
        enable: true,
        toolbarHeight: 48,
        messages: {
            play: 'Play/Pause',
            mute: 'Mute/Unmute',
            full: 'Full Screen',
            notSupported: 'Media not supported'
        }
    },

    /*
            events: [
            ],
            */

    modes: {
        audio: MODES.AUDIO,
        video: MODES.VIDEO
        // TODO: youtube, vimeo, dailymotion and others modes.
    },

    /**
     * Layout the widget
     * @private
     */
    _layout() {
        const that = this;
        that.wrapper = that.element;
        // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
        that.element
            .addClass(WIDGET_CLASS)
            .addClass(INTERACTIVE_CLASS)
            .css({ position: 'relative' });
        that._media();
        that._toolbar();
        that.enable(that.options.enable);
    },

    /**
     * Add HTML 5 audio/video tag
     * @private
     */
    _media() {
        const that = this;
        // Create audio or video tag
        if (that.options.mode === MODES.AUDIO) {
            that.media = $('<audio></audio>');
        } else {
            that.media = $('<video></video>');
        }
        that.media
            .attr('preload', 'auto')
            .prop('autoplay', that.options.autoPlay)
            .css({ width: '100%' });
        // .css({ height: '100%', width: '100%' });
        // Add source files
        const files =
            $.type(that.options.files) === CONSTANTS.STRING
                ? [that.options.files]
                : that.options.files;
        assert.type(
            ARRAY,
            files,
            assert.format(assert.messages.type.default, 'options.files', ARRAY)
        );
        $.each(files, (index, url) => {
            if ($.type(url) === CONSTANTS.STRING && url.length) {
                $('<source>')
                    .attr({ src: url, type: typeFormatter(url) })
                    .appendTo(that.media);
            }
        });

        // Initialize media element
        // Note: These event handlers are required because the toolbar needs to be updated
        // when commands are executed in full screen mode, e.g. a PAUSE in full screen should update the toolbar icon
        that.media
            .append(that.options.messages.notSupported)
            .on(LOADEDMETADATA, that._onLoadedMetadata.bind(that))
            .on(PLAY, that._onPlaybind(that))
            .on(TIMEUPDATE, that._onTimeUpdatebind(that))
            .on(PAUSE, that._onPausebind(that))
            .on(ENDED, that._onEnded.bind(that))
            .on(VOLUMECHANGE, that._onVolumeChangebind(that));

        // Append media element to widget
        that.element.append(that.media);
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
            const oldSVG = this.toolbar
                .find(kendo.format(BUTTON_SELECTOR, COMMANDS.PLAY))
                .children('svg');
            // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
            const newSVG = $(SVG.PAUSE)
                .attr({
                    height: oldSVG.attr('height'),
                    width: oldSVG.attr('width')
                })
                .css({ margin: SVG_MARGIN });
            oldSVG.replaceWith(newSVG);
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
            const oldSVG = this.toolbar
                .find(kendo.format(BUTTON_SELECTOR, COMMANDS.PLAY))
                .children('svg');
            // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
            const newSVG = $(SVG.PLAY)
                .attr({
                    height: oldSVG.attr('height'),
                    width: oldSVG.attr('width')
                })
                .css({ margin: SVG_MARGIN });
            oldSVG.replaceWith(newSVG);
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
            const oldSVG = this.toolbar
                .find(kendo.format(BUTTON_SELECTOR, COMMANDS.PLAY))
                .children('svg');
            // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
            const newSVG = $(SVG.PLAY)
                .attr({
                    height: oldSVG.attr('height'),
                    width: oldSVG.attr('width')
                })
                .css({ margin: SVG_MARGIN });
            oldSVG.replaceWith(newSVG);
        }
    },

    /**
     * Event handler trigger when volume changes (including muting)
     * @param e
     * @private
     */
    _onVolumeChange(e) {
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
            const oldSVG = this.toolbar
                .find(kendo.format(BUTTON_SELECTOR, COMMANDS.MUTE))
                .children('svg');
            let newSVG;
            if (mediaElement.muted) {
                this.volumeSlider.value(0);
                // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
                newSVG = $(SVG.SOUND)
                    .attr({
                        height: oldSVG.attr('height'),
                        width: oldSVG.attr('width')
                    })
                    .css({ margin: SVG_MARGIN });
            } else {
                this.volumeSlider.value(mediaElement.volume);
                // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attributebute
                newSVG = $(SVG.MUTE)
                    .attr({
                        height: oldSVG.attr('height'),
                        width: oldSVG.attr('width')
                    })
                    .css({ margin: SVG_MARGIN });
            }
            oldSVG.replaceWith(newSVG);
        }
    },

    /* Script URL */
    /* jshint -W107 */

    /**
     * Add toolbar (play/pause, seeker, time, mute/unmute, volume, full screen)
     * @private
     */
    _toolbar() {
        const that = this;
        that.toolbar = $(`<${CONSTANTS.DIV}/>`)
            .addClass(TOOLBAR_CLASS)
            .css({
                position: 'absolute',
                boxSizing: 'border-box',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 99,
                // We hide the toolbar until we get loadedmetadata to resize it properly.
                // We cannot use display:none which yields incorrect measurements
                visibility: 'hidden'
            })
            .appendTo(that.element);

        // Play button
        $('<a/>')
            .attr({
                href: 'javascript:void(0);',
                title: that.options.messages.play
            })
            .attr(kendo.attr(COMMAND), COMMANDS.PLAY)
            .addClass(BUTTON_CLASS)
            .css({ overflow: 'hidden', display: 'inline-block' })
            .append(SVG.PLAY)
            .appendTo(that.toolbar);

        // Seeker slider
        const seekerDiv = $(`<${CONSTANTS.DIV}/>`)
            .addClass(SEEKER_CLASS)
            .css({ display: 'inline-block' })
            .appendTo(that.toolbar);
        that._setSeekerSlider(1);

        // Remaining time span
        $(`<${CONSTANTS.SPAN}/>`)
            .addClass(TIME_CLASS)
            .appendTo(that.toolbar);

        // Mute/Unmute button
        $('<a/>')
            .attr({
                href: 'javascript:void(0);',
                title: that.options.messages.mute
            })
            .attr(kendo.attr(COMMAND), COMMANDS.MUTE)
            .addClass(BUTTON_CLASS)
            .css({ overflow: 'hidden', display: 'inline-block' })
            .append(SVG.MUTE)
            .appendTo(that.toolbar);

        // Volume slider
        const volumeDiv = $(`<${CONSTANTS.DIV}/>`)
            .addClass(VOLUME_CLASS)
            .css({ display: 'inline-block' })
            .appendTo(that.toolbar);
        that._setVolumeSlider();

        // Full screen button (video only)
        if (that.options.mode === MODES.VIDEO) {
            $('<a/>')
                .attr({
                    href: 'javascript:void(0);',
                    title: that.options.messages.full
                })
                .attr(kendo.attr(COMMAND), COMMANDS.FULL)
                .css({ overflow: 'hidden', display: 'inline-block' })
                .addClass(BUTTON_CLASS)
                .append(SVG.FULL)
                .appendTo(that.toolbar);
        }
    },

    /* jshint +W107 */

    /**
     * Set the sleeker slider with new max
     * @see http://www.telerik.com/forums/how-do-i-update-the-slider-max-option-after-creation
     * @param max
     * @private
     */
    _setSeekerSlider(max) {
        const that = this;
        const seekerDiv = that.element.find(SEEKER_SELECTOR);
        const seekerSlider = seekerDiv.find('input').data('kendoSlider');
        if (seekerSlider instanceof Slider) {
            seekerSlider.destroy();
            seekerDiv.empty();
        }
        that.seekerSlider = $(`<${CONSTANTS.INPUT}>`)
            .appendTo(seekerDiv)
            .kendoSlider({
                max,
                min: 0,
                smallStep: 0.1,
                largeStep: 1,
                showButtons: false,
                tickPlacement: 'none',
                tooltip: { format: '{0} s.' },
                change: that._onSeekerSliderChange.bind(that)
            })
            .data('kendoSlider');
    },

    /**
     * Set the volume slider
     * Note: the max is always 1
     * @private
     */
    _setVolumeSlider() {
        const that = this;
        const volumeDiv = that.element.find(VOLUME_SELECTOR);
        const volumeSlider = volumeDiv.find('input').data('kendoSlider');
        if (volumeSlider instanceof Slider) {
            volumeSlider.destroy();
            volumeDiv.empty();
        }
        that.volumeSlider = $(`<${CONSTANTS.INPUT}>`)
            .appendTo(volumeDiv)
            .kendoSlider({
                max: 1, // max volume is always 1
                min: 0,
                smallStep: 0.05,
                largeStep: 0.25,
                showButtons: false,
                tickPlacement: 'none',
                tooltip: { format: '{0:p0}' },
                change: that._onVolumeSliderChange.bind(that)
            })
            .data('kendoSlider');
    },

    /**
     * Event handler triggered when clicking a media player toolbar button
     * @param e
     * @private
     */
    _onButtonClick(e) {
        const command = $(e.currentTarget).attr(kendo.attr(COMMAND));
        switch (command) {
            case COMMANDS.PLAY:
                this.togglePlayPause();
                break;
            case COMMANDS.MUTE:
                this.toggleMute();
                break;
            case COMMANDS.FULL:
                this.toggleFullScreen();
                break;
        }
    },

    /**
     * Toggle play pause
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
        if (mediaElement.paused && mediaElement.readyState >= 1) {
            // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
            mediaElement.play();
        } else {
            mediaElement.pause();
        }
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

    /* This function's cyclomatic complexity is too high */
    /* jshint -W074 */

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

    /* jshint +W074 */

    /**
     * Event handler for changing the value of the volume slider
     * @param e
     * @private
     */
    _onVolumeSliderChange(e) {
        this.volume(e.value);
    },

    /**
     * API to get/set the volume
     * @param value
     * @returns {*|number}
     */
    volume(value) {
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
            return mediaElement.volume;
        }
        assert.type(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.type.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        mediaElement.volume = value;
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
            return mediaElement.currentTime;
        }
        assert.type(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.type.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        if (value < 0) {
            value = 0;
        } else if (value > mediaElement.duration) {
            value = mediaElement.duration;
        }
        const paused = mediaElement.paused;
        mediaElement.pause();
        if (
            value >= mediaElement.seekable.start(0) &&
            value <= mediaElement.seekable.end(0)
        ) {
            mediaElement.currentTime = value;
        } else {
            mediaElement.currentTime = 0;
        }
        if (!paused) {
            mediaElement.play();
        }
    },

    /**
     * Resizes the widget
     * @see especially http://docs.telerik.com/kendo-ui/api/javascript/ui/slider#methods-resize
     */
    resize() {
        const that = this;
        if (
            that.media instanceof $ &&
            that.toolbar instanceof $ &&
            that.seekerSlider instanceof Slider &&
            that.volumeSlider instanceof Slider
        ) {
            // Note: height and width calculations do not work if display: none
            that.toolbar.css({ visibility: 'hidden' }).show();
            const buttons = that.toolbar.find('a.k-button').show();
            const seekerDiv = that.toolbar.find(SEEKER_SELECTOR).show();
            const timeDiv = that.toolbar.find(TIME_SELECTOR).show();
            const volumeDiv = that.toolbar.find(VOLUME_SELECTOR).show();
            const isVideo = that.options.mode === MODES.VIDEO;
            const height = isVideo
                ? that.options.toolbarHeight
                : that.element.height();
            const width = that.element.width();
            const ratio = height / 100;
            const fontRatio = 0.8;
            const margin = 4 * ratio;
            const radius = height - 2 * margin;
            const minSeekerSize = 1.5 * radius;
            // Resize element
            if (isVideo) {
                that.element.height(that.media.height());
            }
            // Resize toolbar
            that.toolbar.height(height);
            // Resize buttons
            buttons.css({
                height: radius + PX,
                width: radius + PX,
                margin: margin + PX
            });
            buttons
                .children('svg')
                .attr({
                    height: Math.max(radius - 10, 0) + PX,
                    width: Math.max(radius - 10, 0) + PX
                })
                .css({ margin: SVG_MARGIN });
            const buttonSize = radius + 2 * margin;
            // Resize timer
            timeDiv.css({
                fontSize: fontRatio * radius + PX,
                margin: `0 ${margin}${PX}`,
                lineHeight: '1em'
            });
            // timeDiv.width(timeDiv.width()); // we do not want the width to change when the number of digits drops
            const timeSize = timeDiv.width() + 2 * margin;
            // Resize volume slider
            volumeDiv.css({ margin: 3 * margin + PX });
            that.volumeSlider.wrapper.width(radius);
            that.volumeSlider.resize();
            const volumeSize = volumeDiv.width() + 6 * margin;
            // Resize seeker slider
            const seekerSize =
                that.toolbar.width() -
                (buttons.length * buttonSize + timeSize + volumeSize);
            seekerDiv.css({ margin: 3 * margin + PX });
            that.seekerSlider.wrapper.width(
                Math.max(seekerSize - 6 * margin - 24 * ratio, 0)
            ); // 24 * ratio is empirical
            that.seekerSlider.resize();
            // Update slider dimensions
            if (ratio > 0.5) {
                const tracks = that.toolbar.find('.k-slider-track');
                const hT = 8; // parseInt(tracks.css('height'), 10);
                const mT = -4; // parseInt(tracks.css('margin-top'), 10);
                tracks.css({
                    height: 2 * ratio * hT + PX,
                    marginTop: 2 * ratio * mT + PX
                });
                const selections = that.toolbar.find('.k-slider-selection');
                selections.css({
                    height: 2 * ratio * hT + PX,
                    marginTop: 2 * ratio * mT + PX
                });
                const handles = that.toolbar.find('.k-draghandle');
                // var tH = -4; // parseInt(handles.css('top'), 10);
                // var hH = 14; // parseInt(handles.css('height'), 10);
                // var wH = 13; // parseInt(handles.css('width'), 10);
                // var rH = 7;  // parseInt(handles.css('borderRadius'), 10);
                handles.css({
                    top: 2 * ratio * mT + PX,
                    height: 4 * ratio * hT + PX,
                    width: 4 * ratio * hT + PX,
                    borderRadius: 2 * ratio * hT + PX
                });
                // Reset the position of the seeker handle
                handles.first().css({ left: -2 * ratio * hT + PX });
            }
            // Display/hide elements
            // Play button is always visible
            buttons
                .find(kendo.format(BUTTON_SELECTOR, COMMANDS.MUTE))
                .toggle(width >= buttons.length * buttonSize);
            buttons
                .find(kendo.format(BUTTON_SELECTOR, COMMANDS.FULL))
                .toggle(width >= (buttons.length - 1) * buttonSize);
            timeDiv.toggle(width >= buttons.length * buttonSize + timeSize);
            volumeDiv.toggle(
                width >= buttons.length * buttonSize + timeSize + volumeSize
            );
            seekerDiv.toggle(seekerDiv.width() >= minSeekerSize);
            that.toolbar
                .toggle(!isVideo || !that._enable)
                .css({ visibility: 'visible' });
        }
    },

    /**
     * Enabled/disables the widget
     * @param enable
     */
    enable(enable) {
        const that = this;
        if (
            that.toolbar instanceof $ &&
            that.seekerSlider instanceof Slider &&
            that.volumeSlider instanceof Slider
        ) {
            if (typeof enable === CONSTANTS.UNDEFINED) {
                enable = true;
            }
            that.element.off(NS);
            that.toolbar.off(NS);
            if (enable) {
                if (that.options.mode === MODES.VIDEO) {
                    that.element
                        .on(ENTEREVENTS, () => {
                            that.toolbar.show(EVENTDURATION);
                        })
                        .on(LEAVEEVENTS, () => {
                            that.toolbar.hide(EVENTDURATION);
                        });
                }
                that.toolbar
                    .removeClass(DISABLE)
                    .on(
                        CLICK + NS,
                        'a.k-button',
                        that._onButtonClick.bind(that)
                    );
            } else {
                that.toolbar.addClass(DISABLE).show();
            }
            that.seekerSlider.enable(enable);
            that.volumeSlider.enable(enable);
            that._enable = enable;
        }
    },

    /**
     * Clear widget and restore DOM
     * @private
     */
    _clear() {
        const that = this;
        // unbind kendo
        kendo.unbind(that.element);
        // unbind all other events
        that.element.find('*').off();
        that.element.off();
        // remove descendants
        that.element.empty();
        // remove element classes
        that.element.removeClass(WIDGET_CLASS);
    },

    /**
     * Destroy widget
     */
    destroy() {
        const that = this;
        Widget.fn.destroy.call(that);
        that._clear();
        kendo.destroy(that.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(MediaPlayer);
