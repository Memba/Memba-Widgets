/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/kendo/kendo.core',
        './window.assert',
        './window.log'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Log('kidoju.widgets.mediaplayer');
        var ARRAY = 'array';
        var STRING = 'string';
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var WIDGET_CLASS = 'kj-mediaplayer';
        var TOOLBAR_CLASS = 'k-widget k-toolbar kj-mediaplayer-toolbar';
        var BUTTON_CLASS = 'k-button kj-mediaplayer-button';
        var SEEKER_CLASS = 'kj-mediaplayer-seeker';
        var TIME_CLASS = 'kj-mediaplayer-time';
        var VOLUME_CLASS = 'kj-mediaplayer-volume';
        var ACTIVE = 'k-state-active';
        var DISABLE = 'k-state-disabled';
        var SELECT = 'select';
        var MODES = {
                AUDIO: 'audio',
                VIDEO: 'video'
            };
        var COMMAND = 'command';
        var COMMANDS = {
                PLAY: 'play',
                MUTE: 'mute',
                FULL: 'full' // full screen
            };

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

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MediaPlayer widget
         */
        var MediaPLayer = Widget.extend({

            /**
             * Constructor
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug('widget initialized');
                that._layout();

                /*
                that._enable = true;
                if (!that.options.enable) {
                    that._enable = false;
                    that.wrapper.addClass(DISABLE);
                }
                */
            },

            options: {
                name: 'MediaPLayer',
                mode: MODES.VIDEO,
                // TODO Consider options like loop. mute, ...
                // TODO autoplay
                files: [],
                enable: true,
                messages: {
                    play: 'Play/Pause',
                    mute: 'Mute/Unmute',
                    full: 'Full Screen',
                    notSupported: 'Media not supported'
                }
            },

            events: [
                SELECT
            ],

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
                that.element.addClass(WIDGET_CLASS);
                that._media();
                that._toolbar();
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
                // TODO consider adding height and width
                // Add source files
                var files = $.type(that.options.files) === STRING ? [that.options.files] : that.options.files;
                assert.type(ARRAY, files, kendo.format(assert.messages.type.default, 'options.files', ARRAY));
                $.each(files, function (index, url) {
                    $('<source>')
                        .attr({ src: url, type: typeFormatter(url) })
                        .appendTo(that.media);
                });
                // Initialize media element
                that.media
                    .append(that.options.messages.notSupported)
                    .on('loadedmetadata', $.proxy(that._onLoadedMetadata, that))
                    .on('timeupdate', $.proxy(that._onTimeUpdate, that));
                // Append media element to widget
                that.element.append(that.media);
            },

            /**
             * Event handler called when media metadata is loaded
             * @param e
             * @private
             */
            _onLoadedMetadata: function(e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                // TODO set seeker, time and volume
                var that = this;
                if (that.toolbar instanceof $ && that.seekerSlider instanceof kendo.ui.Slider && that.volumeSlider instanceof kendo.ui.Slider) {
                    var mediaElement = e.target;
                    assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLMediaElement'));
                    that._setSeekerSlider(mediaElement.duration);
                    that.seekerSlider.value(0);
                    that.toolbar.find('span.kj-mediaplayer-time').text(kendo.toString(mediaElement.duration, 'n'));
                    that.volumeSlider.value(mediaElement.volume);
                }
            },

            /**
             * Event hander raised to update seeker and time
             * @param e
             * @private
             */
            _onTimeUpdate: function(e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                if (that.toolbar instanceof $) {
                    var mediaElement = e.target;
                    assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLMediaElement'));
                    that.toolbar.find('span.kj-mediaplayer-time').text(kendo.toString(mediaElement.duration - mediaElement.currentTime, 'n'));
                    that.seekerSlider.value(mediaElement.currentTime);
                }
            },

            /**
             * Add toolbar (play/pause, progress, volume, full screen)
             * @private
             */
            _toolbar: function () {
                var that = this;
                that.toolbar = $('<div/>')
                    .addClass(TOOLBAR_CLASS)
                    .on('click', 'a.k-button', $.proxy(that._buttonClick, that))
                    .appendTo(that.element);

                // Play button
                $('<a/>')
                    .attr({ href: '#', title: that.options.messages.play })
                    .addClass(BUTTON_CLASS)
                    .attr(kendo.attr(COMMAND), COMMANDS.PLAY)
                    .append('<span class="k-sprite k-tool-icon k-justifyLeft"></span>')
                    .appendTo(that.toolbar);

                // Seeker slider
                var seekerDiv = $('<div/>')
                    .addClass(SEEKER_CLASS)
                    .appendTo(that.toolbar);
                that._setSeekerSlider(1);

                // Remaining time span
                $('<span/>')
                    .addClass(TIME_CLASS)
                    .appendTo(that.toolbar);

                // Mute/Unmute button
                $('<a/>')
                    .attr({ href: '#', title: that.options.messages.mute })
                    .addClass(BUTTON_CLASS)
                    .attr(kendo.attr(COMMAND), COMMANDS.MUTE)
                    .append('<span class="k-icon k-i-arrow-e">' + that.options.messages.mute + '</span>')
                    .appendTo(that.toolbar);

                // Volume slider
                var volumeDiv = $('<div/>')
                    .addClass(VOLUME_CLASS)
                    .appendTo(that.toolbar);
                that._setVolumeSlider();

                // Full screen button (video only)
                if (that.options.mode === MODES.VIDEO) {
                    $('<a/>')
                        .attr({ href: '#', title: that.options.messages.full })
                        .addClass(BUTTON_CLASS)
                        .attr(kendo.attr(COMMAND), COMMANDS.FULL)
                        .append('<span class="k-icon k-i-arrow-e">' + that.options.messages.full + '</span>')
                        .appendTo(that.toolbar);
                }
            },

            /**
             * Set the sleeker slider with new max
             * @see http://www.telerik.com/forums/how-do-i-update-the-slider-max-option-after-creation
             * @param max
             * @private
             */
            _setSeekerSlider: function(max) {
                var that = this;
                var seekerDiv = that.element.find('div.' + SEEKER_CLASS);
                var seekerSlider = seekerDiv.find('input').data('kendoSlider');
                if (seekerSlider instanceof kendo.ui.Slider) {
                    seekerSlider.destroy();
                    seekerDiv.empty();
                }
                that.seekerSlider = $('<input>')
                    .appendTo(seekerDiv)
                    .kendoSlider({
                        max: max,
                        min: 0,
                        smallStep: 0.1,
                        showButtons: false,
                        tickPlacement: 'none',
                        change: $.proxy(that._onSeekerChange, that)
                    }).data('kendoSlider');
            },

            /**
             * Set the volume slider
             * Note: the max is always 1
             * @private
             */
            _setVolumeSlider: function(max) {
                var that = this;
                var volumeDiv = that.element.find('div.' + VOLUME_CLASS);
                var volumeSlider = volumeDiv.find('input').data('kendoSlider');
                if (volumeSlider instanceof kendo.ui.Slider) {
                    volumeSlider.destroy();
                    volumeDiv.empty();
                }
                that.volumeSlider = $('<input>')
                    .appendTo(volumeDiv)
                    .kendoSlider({
                        max: 1,
                        min: 0,
                        smallStep: 0.1,
                        showButtons: false,
                        tickPlacement: 'none',
                        change: $.proxy(that._onVolumeChange, that)
                    }).data('kendoSlider');
            },

            /**
             * Event handler triggered when clicking a media player toolbar button
             * @param e
             * @private
             */
            _buttonClick: function (e) {
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
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLMediaElement'));
                if (mediaElement.paused && mediaElement.readyState === 4) {
                    mediaElement.play();
                    // TODO chamge icon/tooltip
                } else {
                    mediaElement.pause();
                }
            },

            /**
             * Toggle muted sound
             */
            toggleMute: function () {
                var that = this;
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLMediaElement'));
                mediaElement.muted = !mediaElement.muted;
                that.volumeSlider.value(mediaElement.muted ? 0 : mediaElement.volume);
                // TODO change icon/tooltip
            },

            /**
             * Toggle full screen mode
             * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
             */
            toggleFullScreen: function () {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLVideoElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLVideoElement'));
                if (mediaElement.requestFullscreen) {
                    mediaElement.requestFullscreen();
                } else if (mediaElement.msRequestFullscreen) {
                    mediaElement.msRequestFullscreen();
                } else if (mediaElement.mozRequestFullScreen) {
                    mediaElement.mozRequestFullScreen();
                } else if (mediaElement.webkitRequestFullscreen) {
                    mediaElement.webkitRequestFullscreen();
                }
            },

            /**
             * Event handler for changing the value of the volume slider
             * @param e
             * @private
             */
            _onVolumeChange: function (e) {
                this.volume(e.value);
            },

            /**
             * API to get/set the volume
             * @param value
             * @returns {*|number}
             */
            volume: function (value) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLMediaElement'));
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
             * @param e
             * @private
             */
            _onSeekerChange: function(e) {
                this.seek(e.value);
            },

            /**
             * API to get/set the seeked currentTime
             * @param value
             */
            seek: function(value) {
                var mediaElement = this.media.get(0);
                assert.instanceof(window.HTMLMediaElement, mediaElement, kendo.format(assert.messages.instanceof.default, 'this.media.get(0)', 'window.HTMLMediaElement'));
                if ($.type(value) === UNDEFINED) {
                    return mediaElement.currentTime;
                } else {
                    assert.type(NUMBER, value, kendo.format(assert.messages.type.default, 'value', NUMBER));
                    if (value < 0) {
                        value = 0;
                    } else if (value > mediaElement.duration) {
                        value = mediaElement.duration;
                    }
                    // mediaElement.pause();
                    mediaElement.currentTime = value;
                    // mediaElement.play();
                }
            },

            /**
             * Resizes the widget
             * @see especially http://docs.telerik.com/kendo-ui/api/javascript/ui/slider#methods-resize
             */
            resize: function() {
                var that = this;
                // TODO
                that.seekerSlider.resize();
            },

            /**
             * Enabled/disables the widget
             * @param enable
             */
            enable: function (enable) {
                var wrapper = this.wrapper;

                if (typeof enable === UNDEFINED) {
                    enable = true;
                }

                if (enable) {
                    wrapper.removeClass(DISABLE);
                } else {
                    wrapper.addClass(DISABLE);
                }

                this._enable = this.options.enable = enable;
            }

        });

        ui.plugin(MediaPLayer);

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
