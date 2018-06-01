/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.slider'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var Slider = ui.Slider;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.mediaplayer');
        var NS = '.kendoMediaPlayer';
        var ARRAY = 'array';
        var STRING = 'string';
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var WIDGET_CLASS = 'kj-mediaplayer';
        var INTERACTIVE_CLASS = 'kj-interactive';
        var TOOLBAR_CLASS = 'k-widget k-toolbar kj-mediaplayer-toolbar';
        var BUTTON_CLASS = 'k-button kj-mediaplayer-button';
        var COMMAND = 'command';
        var BUTTON_SELECTOR = 'a.kj-mediaplayer-button[' + kendo.attr(COMMAND) + '="{0}"]';
        var SEEKER_CLASS = 'kj-mediaplayer-seeker';
        var SEEKER_SELECTOR = 'div.' + SEEKER_CLASS;
        var TIME_CLASS = 'kj-mediaplayer-time';
        var TIME_SELECTOR = 'span.' + TIME_CLASS;
        var VOLUME_CLASS = 'kj-mediaplayer-volume';
        var VOLUME_SELECTOR = 'div.' + VOLUME_CLASS;
        var DISABLE = 'k-state-disabled';
        var CLICK = 'click';
        var LOADEDMETADATA = 'loadedmetadata';
        var PLAY = 'play';
        var TIMEUPDATE = 'timeupdate';
        var VOLUMECHANGE = 'volumechange';
        var PAUSE = 'pause';
        var ENDED = 'ended';
        var ENTEREVENTS = 'mouseenter' + NS + ' touchstart' + NS;
        var LEAVEEVENTS = 'mouseleave' + NS + ' focusout' + NS;
        var EVENTDURATION = 300;
        var MODES = {
            AUDIO: 'audio',
            VIDEO: 'video'
        };
        var COMMANDS = {
            PLAY: 'play',
            MUTE: 'mute',
            FULL: 'full' // full screen
        };
        var SVG = {
            FULL: '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path id="curve3" fill="#000000" d="M6530 5627c460,457 923,911 1381,1369l0 -971c0,-66 38,-123 99,-148 61,-25 128,-12 174,35l589 598c123,125 187,276 187,452l0 1678c0,176 -144,320 -320,320l-1678 0c-176,0 -329,-62 -452,-187l-588 -598c-47,-47 -60,-114 -35,-175 25,-61 82,-98 148,-99l971 0c-457,-457 -917,-913 -1376,-1368l900 -906z"/>' +
            '<path id="curve2" fill="#000000" d="M4613 6530c-457,460 -911,923 -1369,1381l971 0c66,0 123,38 148,99 25,61 12,128 -35,174l-598 589c-125,123 -276,187 -452,187l-1678 0c-176,0 -320,-144 -320,-320l0 -1678c0,-176 62,-329 187,-452l598 -588c47,-47 114,-60 175,-35 61,25 98,82 99,148l0 971c457,-457 913,-917 1368,-1376l906 900z"/>' +
            '<path id="curve1" fill="#000000" d="M5627 3710c457,-460 911,-923 1369,-1381l-971 0c-66,0 -123,-38 -148,-99 -25,-61 -12,-128 35,-174l598 -589c125,-123 276,-187 452,-187l1678 0c176,0 320,144 320,320l0 1678c0,176 -62,329 -187,452l-598 588c-47,47 -114,60 -175,35 -61,-25 -98,-82 -99,-148l0 -971c-457,457 -913,917 -1368,1376l-906 -900z"/>' +
            '<path id="curve0" fill="#000000" d="M3710 4613c-460,-457 -923,-911 -1381,-1369l0 971c0,66 -38,123 -99,148 -61,25 -128,12 -174,-35l-589 -598c-123,-125 -187,-276 -187,-452l0 -1678c0,-176 144,-320 320,-320l1678 0c176,0 329,62 452,187l588 598c47,47 60,114 35,175 -25,61 -82,98 -148,99l-971 0c457,457 917,913 1376,1368l-900 906z"/>' +
            '</svg>',
            MUTE: '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path id="curve3" fill="#000000" d="M6080 7660c1263,-157 2240,-1235 2240,-2540 0,-1305 -977,-2383 -2240,-2540l0 647c908,152 1600,942 1600,1893 0,951 -692,1741 -1600,1893l0 647z"/>' +
            '<path id="curve2" fill="#000000" d="M6080 6360c552,-142 960,-644 960,-1240 0,-596 -408,-1098 -960,-1240l0 686c191,110 320,317 320,554 0,237 -129,444 -320,554l0 686z"/>' +
            '<path id="curve1" fill="#000000" d="M960 3520l320 0 0 -320 1280 0 0 3840 -1280 0 0 -320 -320 0c-220,0 -320,-144 -320,-320l0 -2560c0,-176 100,-320 320,-320z"/>' +
            '<path id="curve0" fill="#000000" d="M5440 640l0 0c176,0 320,144 320,320l0 8320c0,176 -144,320 -320,320l0 0c-176,0 -320,-144 -320,-320l-2240 -2240 0 -3840 2240 -2240c0,-176 144,-320 320,-320z"/>' +
            '</svg>',
            PAUSE: '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path id="curve1" fill="#000000" d="M6400 1280l1280 0c353,0 640,288 640,640l0 6400c0,352 -288,640 -640,640l-1280 0c-352,0 -640,-288 -640,-640l0 -6400c0,-353 287,-640 640,-640z"/>' +
            '<path id="curve0" fill="#000000" d="M2560 1280l1280 0c353,0 640,288 640,640l0 6400c0,352 -288,640 -640,640l-1280 0c-352,0 -640,-287 -640,-640l0 -6400c0,-353 287,-640 640,-640z"/>' +
            '</svg>',
            PLAY: '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path id="curve0" fill="#000000" d="M2878 1364l5757 3209c207,115 325,314 325,547 0,233 -118,432 -325,547l-5757 3209c-204,113 -436,112 -639,-4 -203,-116 -319,-313 -319,-544l0 -6416c0,-231 116,-428 319,-544 203,-116 435,-117 639,-4z"/>' +
            '</svg>',
            SOUND: '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path id="curve2" fill="#000000" d="M960 3520l320 0 0 -320 1280 0 0 3840 -1280 0 0 -320 -320 0c-220,0 -320,-144 -320,-320l0 -2560c0,-176 100,-320 320,-320z"/>' +
            '<path id="curve1" fill="#000000" d="M5440 640c176,0 320,144 320,320l0 8320c0,176 -144,320 -320,320 -176,0 -320,-144 -320,-320l-2240 -2240 0 -3840 2240 -2240c0,-176 144,-320 320,-320z"/>' +
            '<path id="curve0" fill="#000000" d="M8921 7266l-921 -921 -921 921c-125,125 -328,125 -453,0l-452 -452c-125,-125 -125,-328 0,-453l921 -921 -921 -921c-125,-125 -125,-328 0,-453l452 -452c125,-125 328,-125 453,0l921 921 921 -921c125,-125 328,-125 453,0l452 452c125,125 125,328 0,453l-921 921 921 921c125,125 125,328 0,453l-452 452c-125,125 -328,125 -453,0z"/>' +
            '</svg>'
        };
        var SVG_MARGIN = '2px 0 0 -2px';
        var PX = 'px';

        /**
         * Docs about media playing
         * @see http://camendesign.com/code/video_for_everybody
         * @see http://blog.falafel.com/new-kendo-ui-media-player-widget-mvvm/
         * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
         */

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Convert file extension to mime type
         * @see http://hul.harvard.edu/ois/systems/wax/wax-public-help/mimetypes.htm
         * @param url
         * @returns {*}
         */
        function typeFormatter(url) {
            assert.type(STRING, url, kendo.format(assert.messages.type.default, 'url', STRING));
            var ext = url.split('.').pop();
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
            assert.type(NUMBER, seconds, kendo.format(assert.messages.type.default, 'seconds', NUMBER));
            assert.ok(seconds >= 0 && seconds < 24 * 60 * 60, 'Cannot format negative numbers or days.');
            var s = Math.round(seconds);
            var m = Math.floor (s / 60);
            var h = Math.floor (m / 60);
            s = s % 60;
            m = m % 60;
            if (h === 0) {
                return kendo.format('{0:00}:{1:00}', m, s);
            } else {
                return kendo.format('{0:00}:{1:00}:{2:00}', h, m, s);
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MediaPlayer widget
         */
        var MediaPlayer = Widget.extend({

            // TODO: Check http://blog.falafel.com/new-kendo-ui-media-player-widget-mvvm/ and consider improvements

            /**
             * Constructor
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
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
            _layout: function () {
                var that = this;
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
            _media: function () {
                var that = this;
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
                var files = $.type(that.options.files) === STRING ? [that.options.files] : that.options.files;
                assert.type(ARRAY, files, kendo.format(assert.messages.type.default, 'options.files', ARRAY));
                $.each(files, function (index, url) {
                    if ($.type(url) === STRING && url.length) {
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
                    .on(LOADEDMETADATA, $.proxy(that._onLoadedMetadata, that))
                    .on(PLAY, $.proxy(that._onPlay, that))
                    .on(TIMEUPDATE, $.proxy(that._onTimeUpdate, that))
                    .on(PAUSE, $.proxy(that._onPause, that))
                    .on(ENDED, $.proxy(that._onEnded, that))
                    .on(VOLUMECHANGE, $.proxy(that._onVolumeChange, that));

                // Append media element to widget
                that.element.append(that.media);
            },

            /**
             * Event handler called when media metadata is loaded
             * @param e
             * @private
             */
            _onLoadedMetadata: function (e) {
                // This is where we initially set our toolbar values
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                if (this.toolbar instanceof $ && this.seekerSlider instanceof Slider && this.volumeSlider instanceof Slider) {
                    var mediaElement = e.target;
                    assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
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
            _onPlay: function (e) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                if (this.toolbar instanceof $) {
                    var oldSVG = this.toolbar.find(kendo.format(BUTTON_SELECTOR, COMMANDS.PLAY)).children('svg');
                    // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
                    var newSVG = $(SVG.PAUSE)
                        .attr({ height: oldSVG.attr('height'), width: oldSVG.attr('width') })
                        .css({ margin: SVG_MARGIN });
                    oldSVG.replaceWith(newSVG);
                }
            },

            /**
             * Event hander periodically triggered as playback progresses
             * @param e
             * @private
             */
            _onTimeUpdate: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                if (this.toolbar instanceof $) {
                    var mediaElement = e.target;
                    assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                    this.toolbar.find(TIME_SELECTOR).text(toHMS(mediaElement.duration - mediaElement.currentTime));
                    this.seekerSlider.value(mediaElement.currentTime);
                }
            },

            /**
             * Event handler triggered when playback is paused
             * @param e
             * @private
             */
            _onPause: function (e) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                if (this.toolbar instanceof $) {
                    var oldSVG = this.toolbar.find(kendo.format(BUTTON_SELECTOR, COMMANDS.PLAY)).children('svg');
                    // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
                    var newSVG = $(SVG.PLAY)
                        .attr({ height: oldSVG.attr('height'), width: oldSVG.attr('width') })
                        .css({ margin: SVG_MARGIN });
                    oldSVG.replaceWith(newSVG);
                }
            },

            /**
             * Event handler triggered when playback ends
             * @param e
             * @private
             */
            _onEnded: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                if (this.toolbar instanceof $ && this.seekerSlider instanceof Slider) {
                    var mediaElement = e.target;
                    assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                    mediaElement.currentTime = 0;
                    this.seekerSlider.value(mediaElement.currentTime);
                    var oldSVG = this.toolbar.find(kendo.format(BUTTON_SELECTOR, COMMANDS.PLAY)).children('svg');
                    // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
                    var newSVG = $(SVG.PLAY)
                        .attr({ height: oldSVG.attr('height'), width: oldSVG.attr('width') })
                        .css({ margin: SVG_MARGIN });
                    oldSVG.replaceWith(newSVG);
                }
            },

            /**
             * Event handler trigger when volume changes (including muting)
             * @param e
             * @private
             */
            _onVolumeChange: function (e) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                if (this.toolbar instanceof $ && this.volumeSlider instanceof Slider) {
                    var oldSVG = this.toolbar.find(kendo.format(BUTTON_SELECTOR, COMMANDS.MUTE)).children('svg');
                    var newSVG;
                    if (mediaElement.muted) {
                        this.volumeSlider.value(0);
                        // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attribute
                        newSVG = $(SVG.SOUND)
                            .attr({ height: oldSVG.attr('height'), width: oldSVG.attr('width') })
                            .css({ margin: SVG_MARGIN });
                    } else {
                        this.volumeSlider.value(mediaElement.volume);
                        // Note: we need the actual HEIGHT and WIDTH attributes because the $.height and $.width methods update the STYLE attributebute
                        newSVG = $(SVG.MUTE)
                            .attr({ height: oldSVG.attr('height'), width: oldSVG.attr('width') })
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
            _toolbar: function () {
                var that = this;
                that.toolbar = $('<div/>')
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
                    .attr({ href: 'javascript:void(0);', title: that.options.messages.play })
                    .attr(kendo.attr(COMMAND), COMMANDS.PLAY)
                    .addClass(BUTTON_CLASS)
                    .css({ overflow: 'hidden', display: 'inline-block' })
                    .append(SVG.PLAY)
                    .appendTo(that.toolbar);

                // Seeker slider
                var seekerDiv = $('<div/>')
                    .addClass(SEEKER_CLASS)
                    .css({ display: 'inline-block' })
                    .appendTo(that.toolbar);
                that._setSeekerSlider(1);

                // Remaining time span
                $('<span/>')
                    .addClass(TIME_CLASS)
                    .appendTo(that.toolbar);

                // Mute/Unmute button
                $('<a/>')
                    .attr({ href: 'javascript:void(0);', title: that.options.messages.mute })
                    .attr(kendo.attr(COMMAND), COMMANDS.MUTE)
                    .addClass(BUTTON_CLASS)
                    .css({ overflow: 'hidden', display: 'inline-block' })
                    .append(SVG.MUTE)
                    .appendTo(that.toolbar);

                // Volume slider
                var volumeDiv = $('<div/>')
                    .addClass(VOLUME_CLASS)
                    .css({ display: 'inline-block' })
                    .appendTo(that.toolbar);
                that._setVolumeSlider();

                // Full screen button (video only)
                if (that.options.mode === MODES.VIDEO) {
                    $('<a/>')
                        .attr({ href: 'javascript:void(0);', title: that.options.messages.full })
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
            _setSeekerSlider: function (max) {
                var that = this;
                var seekerDiv = that.element.find(SEEKER_SELECTOR);
                var seekerSlider = seekerDiv.find('input').data('kendoSlider');
                if (seekerSlider instanceof Slider) {
                    seekerSlider.destroy();
                    seekerDiv.empty();
                }
                that.seekerSlider = $('<input>')
                    .appendTo(seekerDiv)
                    .kendoSlider({
                        max: max,
                        min: 0,
                        smallStep: 0.1,
                        largeStep: 1,
                        showButtons: false,
                        tickPlacement: 'none',
                        tooltip: { format: '{0} s.' },
                        change: $.proxy(that._onSeekerSliderChange, that)
                    }).data('kendoSlider');
            },

            /**
             * Set the volume slider
             * Note: the max is always 1
             * @private
             */
            _setVolumeSlider: function () {
                var that = this;
                var volumeDiv = that.element.find(VOLUME_SELECTOR);
                var volumeSlider = volumeDiv.find('input').data('kendoSlider');
                if (volumeSlider instanceof Slider) {
                    volumeSlider.destroy();
                    volumeDiv.empty();
                }
                that.volumeSlider = $('<input>')
                    .appendTo(volumeDiv)
                    .kendoSlider({
                        max: 1, // max volume is always 1
                        min: 0,
                        smallStep: 0.05,
                        largeStep: 0.25,
                        showButtons: false,
                        tickPlacement: 'none',
                        tooltip: { format: '{0:p0}' },
                        change: $.proxy(that._onVolumeSliderChange, that)
                    }).data('kendoSlider');
            },

            /**
             * Event handler triggered when clicking a media player toolbar button
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                var command = $(e.currentTarget).attr(kendo.attr(COMMAND));
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
            togglePlayPause: function () {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                if (mediaElement.paused && mediaElement.readyState >= 1) { // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
                    mediaElement.play();
                } else {
                    mediaElement.pause();
                }
            },

            /**
             * Toggle muted sound
             */
            toggleMute: function () {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                mediaElement.muted = !mediaElement.muted;
            },

            /* This function's cyclomatic complexity is too high */
            /* jshint -W074 */

            /**
             * set full screen mode
             * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
             * @see http://www.sitepoint.com/use-html5-full-screen-api/
             */
            toggleFullScreen: function () {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLVideoElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLVideoElement'));
                if (document.fullscreenElement === mediaElement ||
                    document.webkitFullscreenElement === mediaElement ||
                    document.msFullscreenElement === mediaElement ||
                    document.mozFullScreenElement === mediaElement) {
                    if ($.isFunction (document.exitFullscreen)) {
                        document.exitFullscreen();
                    } else if ($.isFunction (document.webkitExitFullscreen)) {
                        document.webkitExitFullscreen();
                    } else if ($.isFunction (document.msExitFullscreen)) {
                        document.msExitFullscreen();
                    } else if ($.isFunction (document.mozCancelFullScreen)) {
                        document.mozCancelFullScreen();
                    }
                } else {
                    if (document.fullscreenEnabled && $.isFunction (mediaElement.requestFullscreen)) {
                        mediaElement.requestFullscreen();
                    } else if (document.webkitFullscreenEnabled && $.isFunction (mediaElement.webkitRequestFullscreen)) {
                        mediaElement.webkitRequestFullscreen(window.Element.ALLOW_KEYBOARD_INPUT);
                    } else if (document.msFullscreenEnabled && $.isFunction (mediaElement.msRequestFullscreen)) {
                        mediaElement.msRequestFullscreen();
                    } else if (document.mozFullScreenEnabled && $.isFunction (mediaElement.mozRequestFullScreen)) {
                        mediaElement.mozRequestFullScreen();
                    }
                }
            },

            /* jshint +W074 */

            /**
             * Event handler for changing the value of the volume slider
             * @param e
             * @private
             */
            _onVolumeSliderChange: function (e) {
                this.volume(e.value);
            },

            /**
             * API to get/set the volume
             * @param value
             * @returns {*|number}
             */
            volume: function (value) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                if ($.type(value) === UNDEFINED) {
                    return mediaElement.volume;
                } else {
                    assert.type(NUMBER, value, kendo.format(assert.messages.type.default, 'value', NUMBER));
                    if (value < 0) {
                        value = 0;
                    } else if (value > 1) {
                        value = 1;
                    }
                    mediaElement.volume = value;
                }
            },

            /**
             * Event handler for changing the value of teh seeker slider
             * ATTENTION: videos are not seekable (or loopable) in Chrome if the server is not configured to allow partial content requests (incl. range)
             * @see http://stackoverflow.com/questions/8088364/html5-video-will-not-loop
             * @param e
             * @private
             */
            _onSeekerSliderChange: function (e) {
                this.seek(e.value);
            },

            /**
             * API to get/set the seeked currentTime
             * @param value
             */
            seek: function (value) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'HTMLMediaElement'));
                if ($.type(value) === UNDEFINED) {
                    return mediaElement.currentTime;
                } else {
                    assert.type(NUMBER, value, kendo.format(assert.messages.type.default, 'value', NUMBER));
                    if (value < 0) {
                        value = 0;
                    } else if (value > mediaElement.duration) {
                        value = mediaElement.duration;
                    }
                    var paused = mediaElement.paused;
                    mediaElement.pause();
                    if (value >= mediaElement.seekable.start(0) && value <= mediaElement.seekable.end(0)) {
                        mediaElement.currentTime = value;
                    } else {
                        mediaElement.currentTime = 0;
                    }
                    if (!paused) {
                        mediaElement.play();
                    }
                }
            },

            /**
             * Resizes the widget
             * @see especially http://docs.telerik.com/kendo-ui/api/javascript/ui/slider#methods-resize
             */
            resize: function () {
                var that = this;
                if (that.media instanceof $ && that.toolbar instanceof $ && that.seekerSlider instanceof Slider && that.volumeSlider instanceof Slider) {
                    // Note: height and width calculations do not work if display: none
                    that.toolbar.css({ visibility: 'hidden' }).show();
                    var buttons = that.toolbar.find('a.k-button').show();
                    var seekerDiv = that.toolbar.find(SEEKER_SELECTOR).show();
                    var timeDiv = that.toolbar.find(TIME_SELECTOR).show();
                    var volumeDiv = that.toolbar.find(VOLUME_SELECTOR).show();
                    var isVideo = that.options.mode === MODES.VIDEO;
                    var height = isVideo ? that.options.toolbarHeight : that.element.height();
                    var width = that.element.width();
                    var ratio = height / 100;
                    var fontRatio = 0.8;
                    var margin = 4 * ratio;
                    var radius = height - 2 * margin;
                    var minSeekerSize = 1.5 * radius;
                    // Resize element
                    if (isVideo) {
                        that.element.height(that.media.height());
                    }
                    // Resize toolbar
                    that.toolbar.height(height);
                    // Resize buttons
                    buttons.css({ height: radius + PX, width: radius + PX, margin: margin + PX });
                    buttons.children('svg')
                        .attr({ height: Math.max(radius - 10, 0) + PX, width: Math.max(radius - 10, 0) + PX })
                        .css({ margin: SVG_MARGIN });
                    var buttonSize = radius + 2 * margin;
                    // Resize timer
                    timeDiv.css({ fontSize: (fontRatio * radius) + PX, margin: '0 ' + margin + PX, lineHeight: '1em' });
                    // timeDiv.width(timeDiv.width()); // we do not want the width to change when the number of digits drops
                    var timeSize = timeDiv.width() + 2 * margin;
                    // Resize volume slider
                    volumeDiv.css({ margin: 3 * margin + PX });
                    that.volumeSlider.wrapper.width(radius);
                    that.volumeSlider.resize();
                    var volumeSize = volumeDiv.width() + 6 * margin;
                    // Resize seeker slider
                    var seekerSize = that.toolbar.width() - (buttons.length * buttonSize + timeSize + volumeSize);
                    seekerDiv.css({ margin: 3 * margin + PX });
                    that.seekerSlider.wrapper.width(Math.max(seekerSize - 6 * margin - 24 * ratio, 0)); // 24 * ratio is empirical
                    that.seekerSlider.resize();
                    // Update slider dimensions
                    if (ratio > 0.5) {
                        var tracks = that.toolbar.find('.k-slider-track');
                        var hT =  8; // parseInt(tracks.css('height'), 10);
                        var mT = -4; // parseInt(tracks.css('margin-top'), 10);
                        tracks.css({ height: 2 * ratio * hT + PX, marginTop: 2 * ratio * mT + PX });
                        var selections = that.toolbar.find('.k-slider-selection');
                        selections.css({ height: 2 * ratio * hT + PX, marginTop: 2 * ratio * mT + PX });
                        var handles = that.toolbar.find('.k-draghandle');
                        // var tH = -4; // parseInt(handles.css('top'), 10);
                        // var hH = 14; // parseInt(handles.css('height'), 10);
                        // var wH = 13; // parseInt(handles.css('width'), 10);
                        // var rH = 7;  // parseInt(handles.css('borderRadius'), 10);
                        handles.css({ top: 2 * ratio * mT + PX, height: 4 * ratio * hT + PX, width: 4 * ratio * hT + PX, borderRadius: 2 * ratio * hT + PX });
                        // Reset the position of the seeker handle
                        handles.first().css({ left: -2 * ratio * hT + PX });
                    }
                    // Display/hide elements
                    // Play button is always visible
                    buttons.find(kendo.format(BUTTON_SELECTOR, COMMANDS.MUTE)).toggle(width >= buttons.length * buttonSize);
                    buttons.find(kendo.format(BUTTON_SELECTOR, COMMANDS.FULL)).toggle(width >= (buttons.length - 1) * buttonSize);
                    timeDiv.toggle(width >= buttons.length * buttonSize + timeSize);
                    volumeDiv.toggle(width >= buttons.length * buttonSize + timeSize + volumeSize);
                    seekerDiv.toggle(seekerDiv.width() >= minSeekerSize);
                    that.toolbar.toggle(!isVideo || !that._enable).css({ visibility: 'visible' });
                }
            },

            /**
             * Enabled/disables the widget
             * @param enable
             */
            enable: function (enable) {
                var that = this;
                if (that.toolbar instanceof $ && that.seekerSlider instanceof Slider && that.volumeSlider instanceof Slider) {
                    if (typeof enable === UNDEFINED) {
                        enable = true;
                    }
                    that.element.off(NS);
                    that.toolbar.off(NS);
                    if (enable) {
                        if (that.options.mode === MODES.VIDEO) {
                            that.element
                                .on(ENTEREVENTS, function () { that.toolbar.show(EVENTDURATION); })
                                .on(LEAVEEVENTS, function () { that.toolbar.hide(EVENTDURATION); });
                        }
                        that.toolbar
                            .removeClass(DISABLE)
                            .on(CLICK + NS, 'a.k-button', $.proxy(that._onButtonClick, that));
                    } else {
                        that.toolbar
                            .addClass(DISABLE)
                            .show();
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
            _clear: function () {
                var that = this;
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
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        ui.plugin(MediaPlayer);

    })(window.jQuery);

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
