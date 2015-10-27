/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var MediaPlayer = ui.MediaPlayer;
    var CLICK = 'click';
    var FIXTURES = '#fixtures';
    var MEDIAPLAYER1 = '<div id="mediaplayer1"></div>';
    var MEDIAPLAYER2 = '<div id="mediaplayer2" data-role="mediaplayer"></div>';
    var AUDIO_FILES = ['../data/audio/audio.ogg', '../data/audio/audio.mp3'];
    var VIDEO_FILES = ['../data/video/video.mp4', '../data/video/video.webm'];
    var TTL = 250;

    describe('kidoju.widgets.mediaplayer', function () {

        before(function () {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function () {

            it('requirements', function () {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect($.fn.kendoMediaPlayer).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MEDIAPLAYER1).appendTo(FIXTURES);
                var mediaPlayer = element.kendoMediaPlayer().data('kendoMediaPlayer');
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-mediaplayer');
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('toolbar').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('seekerSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('volumeSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('wrapper').that.is.an.instanceof(jQuery);
            });

            it('from code with options: audio', function () {
                var element = $(MEDIAPLAYER1).appendTo(FIXTURES);
                var options = {
                    mode: 'audio',
                    files: AUDIO_FILES
                };
                var mediaPlayer = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-mediaplayer');
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('toolbar').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('seekerSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('volumeSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(mediaPlayer.media.get(0)).to.be.an.instanceof(window.HTMLAudioElement);
                expect(mediaPlayer.toolbar.find('a.k-button')).to.be.an.instanceof(jQuery).with.property('length', 2);
            });

            it('from code with options: video', function () {
                var element = $(MEDIAPLAYER1).appendTo(FIXTURES);
                var options = {
                    mode: 'video',
                    files: VIDEO_FILES
                };
                var mediaPlayer = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-mediaplayer');
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('toolbar').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('seekerSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('volumeSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(mediaPlayer.media.get(0)).to.be.an.instanceof(window.HTMLVideoElement);
                expect(mediaPlayer.toolbar.find('a.k-button')).to.be.an.instanceof(jQuery).with.property('length', 3);
            });

            it('from markup', function () {
                var element = $(MEDIAPLAYER2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var mediaPlayer = element.data('kendoMediaPlayer');
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-mediaplayer');
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('toolbar').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('seekerSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('volumeSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('wrapper').that.is.an.instanceof(jQuery);
            });

            it('from markup with attributes: audio', function () {
                var element = $(MEDIAPLAYER2).attr({ 'data-mode': 'audio', 'data-files': JSON.stringify(AUDIO_FILES) }).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var mediaPlayer = element.data('kendoMediaPlayer');
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-mediaplayer');
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('toolbar').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('seekerSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('volumeSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(mediaPlayer.media.get(0)).to.be.an.instanceof(window.HTMLAudioElement);
                expect(mediaPlayer.toolbar.find('a.k-button')).to.be.an.instanceof(jQuery).with.property('length', 2);
            });

            it('from markup with attributes: video', function () {
                var element = $(MEDIAPLAYER2).attr({ 'data-mode': 'video', 'data-files': JSON.stringify(VIDEO_FILES) }).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var mediaPlayer = element.data('kendoMediaPlayer');
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-mediaplayer');
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('toolbar').that.is.an.instanceof(jQuery);
                expect(mediaPlayer).to.have.property('seekerSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('volumeSlider').that.is.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(mediaPlayer.media.get(0)).to.be.an.instanceof(window.HTMLVideoElement);
                expect(mediaPlayer.toolbar.find('a.k-button')).to.be.an.instanceof(jQuery).with.property('length', 3);
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Methods', function () {

            var element;
            var mediaPlayer;
            var options = {
                mode: 'audio',
                files: AUDIO_FILES
            };

            beforeEach(function () {
                element = $(MEDIAPLAYER1).appendTo(FIXTURES);
                mediaPlayer = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
            });

            it('togglePlayPause', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                var mediaElement = mediaPlayer.media.get(0);
                expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
                // Yield some time for media files to load
                setTimeout(function () {
                    expect(mediaElement.readyState).to.be.gte(3);
                    expect(mediaElement.paused).to.be.true;
                    mediaPlayer.togglePlayPause();
                    expect(mediaElement.paused).to.be.false;
                    mediaPlayer.togglePlayPause();
                    expect(mediaElement.paused).to.be.true;
                    done();
                }, TTL);
            });

            it('toggleMute', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                var mediaElement = mediaPlayer.media.get(0);
                expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
                // Yield some time for media files to load
                setTimeout(function () {
                    expect(mediaElement.readyState).to.be.gte(3);
                    expect(mediaElement.muted).to.be.false;
                    mediaPlayer.toggleMute();
                    expect(mediaElement.muted).to.be.true;
                    mediaPlayer.toggleMute();
                    expect(mediaElement.muted).to.be.false;
                    done();
                }, TTL);
            });

            // Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture.
            xit('toggleFullScreen', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                var mediaElement = mediaPlayer.media.get(0);
                expect(mediaElement).to.be.an.instanceof(window.HTMLVideoElement);

                /* This function's cyclomatic complexity is too high */
                /* jshint -W074 */

                // Yield some time for media files to load
                setTimeout(function () {
                    expect(mediaElement.readyState).to.be.gte(3);
                    expect(!!document.fullScreen || !!document.webkitIsFullScreen|| !!document.msFullScreen || !!document.mozFullScreen).to.be.false;
                    mediaPlayer.toggleFullScreen();
                    expect(!!document.fullScreen || !!document.webkitIsFullScreen|| !!document.msFullScreen || !!document.mozFullScreen).to.be.true;
                    mediaPlayer.toggleFullScreen();
                    expect(!!document.fullScreen || !!document.webkitIsFullScreen|| !!document.msFullScreen || !!document.mozFullScreen).to.be.false;
                    done();
                }, TTL);

                /* jshint +W074 */

            });

            it('volume', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                var mediaElement = mediaPlayer.media.get(0);
                expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
                // Yield some time for media files to load
                setTimeout(function () {
                    expect(mediaElement.readyState).to.be.gte(3);
                    expect(mediaElement.volume).to.equal(1);
                    var volume = Math.round(100 * Math.random()) / 100;
                    mediaPlayer.volume(volume);
                    expect(mediaElement.volume).to.equal(volume);
                    done();
                }, TTL);
            });

            it('seek', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer).to.have.property('media').that.is.an.instanceof(jQuery);
                var mediaElement = mediaPlayer.media.get(0);
                expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
                if (kendo.support.browser.chrome) {
                    // This does not work in Chrome
                    return done();
                }
                // Yield some time for media files to load
                setTimeout(function () {
                    expect(mediaElement.readyState).to.be.gte(3);
                    expect(mediaElement).to.have.property('duration').that.is.gt(1);
                    expect(mediaElement.currentTime).to.equal(0);
                    var seek = Math.round(100 * mediaElement.duration * Math.random()) / 100;
                    mediaPlayer.seek(seek);
                    expect(mediaElement.currentTime).to.equal(seek);
                    done();
                }, TTL);
            });

            xit('resize', function () {
                // TODO
            });

            it('enable', function () {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer.toolbar).to.be.an.instanceof(jQuery);
                expect(mediaPlayer.seekerSlider).to.be.an.instanceof(kendo.ui.Slider);
                expect(mediaPlayer.volumeSlider).to.be.an.instanceof(kendo.ui.Slider);
                mediaPlayer.enable(false);
                expect(mediaPlayer.toolbar).to.have.class('k-state-disabled');
                expect(mediaPlayer.seekerSlider.wrapper).to.have.class('k-state-disabled');
                expect(mediaPlayer.volumeSlider.wrapper).to.have.class('k-state-disabled');
            });

            it('destroy', function () {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                mediaPlayer.destroy();
                expect(element).to.be.empty;
                expect(element).not.to.have.class('k-widget');
                expect(element).not.to.have.class('kj-mediaplayer');
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions)', function () {

            var element;
            var mediaPlayer;
            // var viewModel;
            var options = {
                mode: 'video',
                files: VIDEO_FILES
            };

            beforeEach(function () {
                element = $(MEDIAPLAYER1).appendTo(FIXTURES);
                mediaPlayer = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
                // viewModel = kendo.observable({ url: undefined });
            });

            it('togglePlayPause', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer.media).to.be.an.instanceof(jQuery);
                expect(mediaPlayer.toolbar).to.be.an.instanceof(jQuery);
                var playButton = mediaPlayer.toolbar.find('a.k-button[data-command="play"]');
                expect(playButton).to.be.an.instanceof(jQuery).with.property('length', 1);
                var play = sinon.spy();
                mediaPlayer.media.on('play', function () {
                    play();
                });
                var pause = sinon.spy();
                mediaPlayer.media.on('pause', function () {
                    pause();
                });
                // Yield some time for media files to load
                setTimeout(function () {
                    var mediaElement = mediaPlayer.media.get(0);
                    expect(mediaElement).to.be.an.instanceof(window.HTMLVideoElement);
                    expect(mediaElement.readyState).to.be.gte(3);
                    playButton.simulate(CLICK);
                    playButton.simulate(CLICK);
                    // Wait for events
                    setTimeout(function () {
                        expect(play).to.have.been.calledOnce;
                        expect(pause).to.have.been.calledOnce;
                        done();
                    }, 0);
                }, TTL);
            });

            it('toggleMute', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer.media).to.be.an.instanceof(jQuery);
                expect(mediaPlayer.toolbar).to.be.an.instanceof(jQuery);
                var muteButton = mediaPlayer.toolbar.find('a.k-button[data-command="mute"]');
                expect(muteButton).to.be.an.instanceof(jQuery).with.property('length', 1);
                var volume = sinon.spy();
                mediaPlayer.media.on('volumechange', function () {
                    volume();
                });
                // Yield some time for media files to load
                setTimeout(function () {
                    var mediaElement = mediaPlayer.media.get(0);
                    expect(mediaElement).to.be.an.instanceof(window.HTMLVideoElement);
                    expect(mediaElement.readyState).to.be.gte(3);
                    muteButton.simulate(CLICK);
                    muteButton.simulate(CLICK);
                    // Wait for events
                    setTimeout(function () {
                        expect(volume).to.have.been.calledTwice;
                        done();
                    }, 0);
                }, TTL);
            });

            // Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture.
            xit('toggleFullScreen', function (done) {
                expect(mediaPlayer).to.be.an.instanceof(MediaPlayer);
                expect(mediaPlayer.media).to.be.an.instanceof(jQuery);
                expect(mediaPlayer.toolbar).to.be.an.instanceof(jQuery);
                var fullScreenButton = mediaPlayer.toolbar.find('a.k-button[data-command="full"]');
                expect(fullScreenButton).to.be.an.instanceof(jQuery).with.property('length', 1);
                var fullScreen = sinon.spy();
                $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function () {
                    fullScreen();
                });
                // Yield some time for media files to load
                setTimeout(function () {
                    var mediaElement = mediaPlayer.media.get(0);
                    expect(mediaElement).to.be.an.instanceof(window.HTMLVideoElement);
                    expect(mediaElement.readyState).to.be.gte(3);
                    fullScreenButton.simulate(CLICK);
                    fullScreenButton.simulate(CLICK);
                    // Wait for events
                    setTimeout(function () {
                        expect(fullScreen).to.have.been.calledTwice;
                        done();
                    }, 0);
                }, TTL);
            });

            xit('volume', function (done) {
                // TODO
            });

            xit('seek', function (done) {
                // TODO
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        xdescribe('Events', function () {

            var element;
            var mediaPlayer;
            var options = {};

            beforeEach(function () {
                element = $(MEDIAPLAYER1).appendTo(FIXTURES);
                mediaPlayer = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
                // change = sinon.spy();
            });

            it('event', function (done) {
                // TODO: No event at this stage
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

    });

}(this, jQuery));
