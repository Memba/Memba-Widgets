/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import 'kendo.slider';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import baseUrl from '../../../src/js/helpers/helpers.base.es6';
import '../../../src/js/widgets/widgets.audiovideo.es6';

const { afterEach, before, beforeEach, describe, it, xit } = window;
const {
    destroy,
    init,
    ui: { AudioVideo, roles, Slider },
} = window.kendo;
const { platform, webdriver } = window.navigator;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'audiovideo';
const WIDGET = 'kendoAudioVideo';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const AUDIO_FILES = [
    baseUrl('/test/data/audio/audio.ogg'),
    baseUrl('/test/data/audio/audio.mp3'),
];
const VIDEO_FILES = [
    baseUrl('/test/data/video/video.mp4'),
    baseUrl('/test/data/video/video.webm'),
];
const TTL = 250;

/**
 * HTMLMediaElement is not supported in PhantomJS
 * @see https://github.com/ariya/phantomjs/issues/10839
 */
/*
if (window.PHANTOMJS) {
    // TODO use Modernizr
    return;
}
*/

describe('widgets.audiovideo', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn[WIDGET]).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`m-${ROLE}`);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            expect(widget).to.have.property('toolbar').that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
        });

        it('from code with options: audio', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                mode: 'audio',
                files: AUDIO_FILES,
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`m-${ROLE}`);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            expect(widget).to.have.property('toolbar').that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLAudioElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 2);
        });

        it('from code with options: video', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                mode: 'video',
                files: VIDEO_FILES,
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`m-${ROLE}`);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            expect(widget).to.have.property('toolbar').that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLVideoElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 3);
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`m-${ROLE}`);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            expect(widget).to.have.property('toolbar').that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
        });

        it('from markup with attributes: audio', () => {
            const attributes = options2attributes({
                files: JSON.stringify(AUDIO_FILES),
                mode: 'audio',
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`m-${ROLE}`);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            expect(widget).to.have.property('toolbar').that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLAudioElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 2);
        });

        it('from markup with attributes: video', () => {
            const attributes = options2attributes({
                files: JSON.stringify(VIDEO_FILES),
                mode: 'video',
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`m-${ROLE}`);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            expect(widget).to.have.property('toolbar').that.is.an.instanceof($);
            expect(widget)
                .to.have.property('seekerSlider')
                .that.is.an.instanceof(Slider);
            expect(widget)
                .to.have.property('volumeSlider')
                .that.is.an.instanceof(Slider);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.media.get(0)).to.be.an.instanceof(
                window.HTMLVideoElement
            );
            expect(widget.toolbar.find('a.k-button'))
                .to.be.an.instanceof($)
                .with.property('length', 3);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {
            mode: 'audio',
            files: AUDIO_FILES,
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        (webdriver ? xit : it)('togglePlayPause', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
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

        // Note: Fails on Github
        (/^Win/i.test(platform) ? it : xit)('toggleMute', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
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
        xit('toggleFullScreen', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLVideoElement);

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
        });

        (/^Win/i.test(platform) ? it : xit)('volume', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
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

        (/^Win/i.test(platform) ? it : xit)('seek', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget).to.have.property('media').that.is.an.instanceof($);
            const mediaElement = widget.media.get(0);
            expect(mediaElement).to.be.an.instanceof(window.HTMLAudioElement);
            // Yield some time for media files to load
            setTimeout(() => {
                expect(mediaElement.readyState).to.be.gte(3);
                expect(mediaElement).to.have.property('duration').that.is.gt(1);
                expect(mediaElement.currentTime).to.equal(0);
                const seek =
                    Math.round(100 * mediaElement.duration * Math.random()) /
                    100;
                widget.seek(seek);
                expect(
                    // Avoid Uncaught AssertionError: expected 4.139999 to equal 4.14
                    Math.round(100 * mediaElement.currentTime) / 100
                ).to.equal(seek);
                done();
            }, TTL);
        });

        xit('resize', () => {
            // TODO
        });

        it('enable', () => {
            expect(widget).to.be.an.instanceof(AudioVideo);
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
            expect(widget).to.be.an.instanceof(AudioVideo);
            widget.destroy();
            expect(element.parent()).to.match(`#${FIXTURES}`);
            expect(element.data(WIDGET)).to.be.undefined;
            expect(element).to.be.empty;
            expect(element).not.to.have.class('k-widget');
            expect(element).not.to.have.class(`m-${ROLE}`);
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        // var viewModel;
        const options = {
            mode: 'video',
            files: VIDEO_FILES,
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            // viewModel = observable({ url: undefined });
        });

        (webdriver ? xit : it)('togglePlayPause', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget.media).to.be.an.instanceof($);
            expect(widget.toolbar).to.be.an.instanceof($);
            const playButton = widget.toolbar.find(
                'a.k-button[data-action="play"]'
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
                playButton.simulate(CONSTANTS.CLICK);
                playButton.simulate(CONSTANTS.CLICK);
                // Wait for events
                setTimeout(() => {
                    expect(play).to.have.been.calledOnce;
                    expect(pause).to.have.been.calledOnce;
                    done();
                }, 0);
            }, TTL);
        });

        (/^Win/i.test(platform) ? it : xit)('toggleMute', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
            expect(widget.media).to.be.an.instanceof($);
            expect(widget.toolbar).to.be.an.instanceof($);
            const muteButton = widget.toolbar.find(
                'a.k-button[data-action="volume"]'
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
                muteButton.simulate(CONSTANTS.CLICK);
                muteButton.simulate(CONSTANTS.CLICK);
                // Wait for events
                setTimeout(() => {
                    expect(volume).to.have.been.calledTwice;
                    done();
                }, 0);
            }, TTL);
        });

        // Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture.
        xit('toggleFullScreen', (done) => {
            expect(widget).to.be.an.instanceof(AudioVideo);
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
                fullScreenButton.simulate(CONSTANTS.CLICK);
                fullScreenButton.simulate(CONSTANTS.CLICK);
                // Wait for events
                setTimeout(() => {
                    expect(fullScreen).to.have.been.calledTwice;
                    done();
                }, 0);
            }, TTL);
        });

        // xit('volume', () => {});

        // xit('seek', () => {});
    });

    xdescribe('Events', () => {
        let element;
        let options;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = {};
            widget = element[WIDGET](options).data(WIDGET);
            // change = sinon.spy();
        });

        xit('event', () => {
            $.noop(widget);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
