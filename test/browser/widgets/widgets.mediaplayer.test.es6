/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.mediaplayer.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { MediaPlayer, Slider }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'mediaplayer';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const CLICK = 'click';
const AUDIO_FILES = ['../data/audio/audio.ogg', '../data/audio/audio.mp3'];
const VIDEO_FILES = ['../data/video/video.mp4', '../data/video/video.webm'];
const TTL = 250;

/**
 * HTMLMediaElement is not supported in PhantomJS
 * @see https://github.com/ariya/phantomjs/issues/10839
 */
if (window.PHANTOMJS) {
    // TODO user Modernizr
    return;
}

describe('widgets.mediaplayer', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(kendo).not.to.be.undefined;
            expect(kendo.version).to.be.a('string');
            expect($.fn.kendoMediaPlayer).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element.kendoMediaPlayer().data('kendoMediaPlayer');
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-mediaplayer');
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('toolbar')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
        });

        it('from code with options: audio', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {
                mode: 'audio',
                files: AUDIO_FILES
            };
            const widget = element
                .kendoMediaPlayer(options)
                .data('kendoMediaPlayer');
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-mediaplayer');
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('toolbar')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLAudioElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 2);
        });

        it('from code with options: video', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {
                mode: 'video',
                files: VIDEO_FILES
            };
            const widget = element
                .kendoMediaPlayer(options)
                .data('kendoMediaPlayer');
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-mediaplayer');
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('toolbar')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLVideoElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 3);
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(FIXTURES);
            init(FIXTURES);
            const widget = element.data('kendoMediaPlayer');
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-mediaplayer');
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('toolbar')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
        });

        it('from markup with attributes: audio', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr({
                    'data-mode': 'audio',
                    'data-files': JSON.stringify(AUDIO_FILES)
                })
                .appendTo(FIXTURES);
            init(FIXTURES);
            const widget = element.data('kendoMediaPlayer');
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-mediaplayer');
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('toolbar')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLAudioElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 2);
        });

        it('from markup with attributes: video', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr({
                    'data-mode': 'video',
                    'data-files': JSON.stringify(VIDEO_FILES)
                })
                .appendTo(FIXTURES);
            init(FIXTURES);
            const widget = element.data('kendoMediaPlayer');
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-mediaplayer');
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('toolbar')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLVideoElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 3);
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {
            mode: 'audio',
            files: AUDIO_FILES
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
        });

        it('togglePlayPause', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
            // Yield some time for media files to load
            setTimeout(() => {
                expect(mediaElement.readyState).to.be.gte(3);
                expect(mediaElement.paused).to.be.true;
                widget.togglePlayPause();
                expect(mediaElement.paused).to.be.false;
                widget.togglePlayPause();
                expect(mediaElement.paused).to.be.true;
                done();
            }, TTL);
        });

        it('toggleMute', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
            // Yield some time for media files to load
            setTimeout(() => {
                expect(mediaElement.readyState).to.be.gte(3);
                expect(mediaElement.muted).to.be.false;
                widget.toggleMute();
                expect(mediaElement.muted).to.be.true;
                widget.toggleMute();
                expect(mediaElement.muted).to.be.false;
                done();
            }, TTL);
        });

        // Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture.
        xit('toggleFullScreen', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLVideoElement);

            /* This function's cyclomatic complexity is too high */
            /* jshint -W074 */

            // Yield some time for media files to load
            setTimeout(() => {
                expect(mediaElement.readyState).to.be.gte(3);
                expect(
                    !!document.fullScreen ||
                        !!document.webkitIsFullScreen ||
                        !!document.msFullScreen ||
                        !!document.mozFullScreen
                ).to.be.false;
                widget.toggleFullScreen();
                expect(
                    !!document.fullScreen ||
                        !!document.webkitIsFullScreen ||
                        !!document.msFullScreen ||
                        !!document.mozFullScreen
                ).to.be.true;
                widget.toggleFullScreen();
                expect(
                    !!document.fullScreen ||
                        !!document.webkitIsFullScreen ||
                        !!document.msFullScreen ||
                        !!document.mozFullScreen
                ).to.be.false;
                done();
            }, TTL);

            /* jshint +W074 */
        });

        it('volume', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
            // Yield some time for media files to load
            setTimeout(() => {
                expect(mediaElement.readyState).to.be.gte(3);
                expect(mediaElement.volume).to.equal(1);
                const volume = Math.round(100 * Math.random()) / 100;
                widget.volume(volume);
                expect(mediaElement.volume).to.equal(volume);
                done();
            }, TTL);
        });

        it('seek', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget)
                .to.have.property('media')
                .that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
            if (kendo.support.browser.chrome) {
                // This does not work in Chrome
                return done();
            }
            // Yield some time for media files to load
            setTimeout(() => {
                expect(mediaElement.readyState).to.be.gte(3);
                expect(mediaElement)
                    .to.have.property('duration')
                    .that.is.gt(1);
                expect(mediaElement.currentTime).to.equal(0);
                const seek =
                    Math.round(100 * mediaElement.duration * Math.random()) /
                    100;
                widget.seek(seek);
                expect(mediaElement.currentTime).to.equal(seek);
                done();
            }, TTL);
        });

        xit('resize', () => {
            // TODO
        });

        it('enable', () => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget.toolbar).to.be.an.instanceof($);
            expect(widget.seekerSlider).to.be.an.instanceof(Slider);
            expect(widget.volumeSlider).to.be.an.instanceof(Slider);
            widget.enable(false);
            expect(widget.toolbar).to.have.class('k-state-disabled');
            expect(widget.seekerSlider.wrapper).to.have.class(
                'k-state-disabled'
            );
            expect(widget.volumeSlider.wrapper).to.have.class(
                'k-state-disabled'
            );
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            widget.destroy();
            expect(element.parent()).to.match(FIXTURES);
            expect(element.data('kendoMediaPlayer')).to.be.undefined;
            expect(element).to.be.empty;
            expect(element).not.to.have.class('k-widget');
            expect(element).not.to.have.class('kj-mediaplayer');
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        // var viewModel;
        const options = {
            mode: 'video',
            files: VIDEO_FILES
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
            // viewModel = observable({ url: undefined });
        });

        it('togglePlayPause', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget.media).to.be.an.instanceof($);
            expect(widget.toolbar).to.be.an.instanceof($);
            const playButton = widget.toolbar.find(
                'a.k-button[data-command="play"]'
            );
            expect(playButton)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const play = sinon.spy();
            widget.media.on('play', () => {
                play();
            });
            const pause = sinon.spy();
            widget.media.on('pause', () => {
                pause();
            });
            // Yield some time for media files to load
            setTimeout(() => {
                const mediaElement = widget.media.get(0);
                expect(mediaElement).to.be.an.instanceof(
                    window.HTMLVideoElement
                );
                expect(mediaElement.readyState).to.be.gte(3);
                playButton.simulate(CLICK);
                playButton.simulate(CLICK);
                // Wait for events
                setTimeout(() => {
                    expect(play).to.have.been.calledOnce;
                    expect(pause).to.have.been.calledOnce;
                    done();
                }, 0);
            }, TTL);
        });

        it('toggleMute', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget.media).to.be.an.instanceof($);
            expect(widget.toolbar).to.be.an.instanceof($);
            const muteButton = widget.toolbar.find(
                'a.k-button[data-command="mute"]'
            );
            expect(muteButton)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const volume = sinon.spy();
            widget.media.on('volumechange', () => {
                volume();
            });
            // Yield some time for media files to load
            setTimeout(() => {
                const mediaElement = widget.media.get(0);
                expect(mediaElement).to.be.an.instanceof(
                    window.HTMLVideoElement
                );
                expect(mediaElement.readyState).to.be.gte(3);
                muteButton.simulate(CLICK);
                muteButton.simulate(CLICK);
                // Wait for events
                setTimeout(() => {
                    expect(volume).to.have.been.calledTwice;
                    done();
                }, 0);
            }, TTL);
        });

        // Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture.
        xit('toggleFullScreen', done => {
            expect(widget).to.be.an.instanceof(MediaPlayer);
            expect(widget.media).to.be.an.instanceof($);
            expect(widget.toolbar).to.be.an.instanceof($);
            const fullScreenButton = widget.toolbar.find(
                'a.k-button[data-command="full"]'
            );
            expect(fullScreenButton)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const fullScreen = sinon.spy();
            $(document).on(
                'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',
                () => {
                    fullScreen();
                }
            );
            // Yield some time for media files to load
            setTimeout(() => {
                const mediaElement = widget.media.get(0);
                expect(mediaElement).to.be.an.instanceof(
                    window.HTMLVideoElement
                );
                expect(mediaElement.readyState).to.be.gte(3);
                fullScreenButton.simulate(CLICK);
                fullScreenButton.simulate(CLICK);
                // Wait for events
                setTimeout(() => {
                    expect(fullScreen).to.have.been.calledTwice;
                    done();
                }, 0);
            }, TTL);
        });

        xit('volume', () => {
            // TODO
        });

        xit('seek', () => {
            // TODO
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    xdescribe('Events', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoMediaPlayer(options).data('kendoMediaPlayer');
            // change = sinon.spy();
        });

        it('event', done => {
            // TODO: No event at this stage
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });
});
