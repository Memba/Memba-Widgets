/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Check why testing legacy code fails in karma (window.app.tts is undefined)
// TODO: Test and improve clearMarkdown with tables, LaTeX, ...

/* eslint-disable no-unused-expressions */

import chai from 'chai';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'modernizr';
import {
    cancelSpeak,
    clearMarkdown,
    doSpeak,
    getVoice,
    speechSynthesisPromise,
    useCordovaPlugIn,
    useWebSpeechSynthesis,
} from '../../../src/js/plugins/plugins.tts.es6';

const {
    cordova,
    describe,
    it,
    Modernizr,
    navigator: { userAgent },
} = window;
const { expect } = chai;

// SpeechSynthesis does not work with headless chrome
// https://github.com/Modernizr/Modernizr/issues/2374
const nogo =
    (!Modernizr.speechsynthesis && !cordova) ||
    userAgent.indexOf('HeadlessChrome') > -1;

(nogo ? xdescribe : describe)('window.tts', () => {
    (window.__karma__ ? xdescribe : describe)('Legacy export', () => {
        it('Check window.app.tts.*', () => {
            const tts = window.app && window.app.tts;
            expect(tts).not.to.be.undefined;
            expect(tts.cancelSpeak).to.equal(cancelSpeak);
            expect(tts._clearMarkdown).to.equal(clearMarkdown);
            expect(tts.doSpeak).to.equal(doSpeak);
            expect(tts._getVoice).to.equal(getVoice);
            expect(tts._speechSynthesisPromise).to.equal(
                speechSynthesisPromise
            );
            expect(tts._useCordovaPlugIn).to.equal(useCordovaPlugIn);
            expect(tts._useSpeechSynthesis).to.equal(useWebSpeechSynthesis);
        });
    });

    describe('useCordovaPlugIn', () => {
        it('useCordovaPlugIn should be false', () => {
            expect(useCordovaPlugIn()).to.be.false;
        });
    });

    describe('useWebSpeechSynthesis', () => {
        it('useSpeechSynthesis should be true in WebKit browsers', () => {
            expect(useWebSpeechSynthesis()).to.equal(Modernizr.speechsynthesis);
        });
    });

    describe('getVoice', () => {
        it('getVoice should return an english voice', () => {
            expect(getVoice('en-GB')).to.have.property('lang');
        });

        it('getVoice should return a french voice', () => {
            expect(getVoice('fr-FR')).to.have.property('lang');
        });
    });

    describe('clearMarkdown', () => {
        const DATA = [
            {
                MARKDOWN:
                    "# Heading\n>Quote\n## Heading 2\n\n**We** love ```js\nconsole.log('Hello')```",
                // Note: in this example, js should have been removed
                TEXT: " Heading\nQuote\n Heading 2\n\nWe love js\nconsole.log('Hello')",
            },
            {
                MARKDOWN:
                    '# List 1\n\n- Item\n- Item\n\n# List 2\n\n1. Item\n2. Item',
                TEXT: ' List 1\n\n- Item\n- Item\n\n List 2\n\n1. Item\n2. Item',
            },
            {
                MARKDOWN:
                    'A link:\n[Kidoju](https://www.kidoju.com)\nAn image:\n![Kidoju Logo](https://cdn.kidoju.com/kidoju/logo.png)',
                TEXT: 'A link:\nKidoju\nAn image:\nKidoju Logo',
            },
        ];

        it('clearMarkdown should clear markings', () => {
            expect(clearMarkdown(DATA[0].MARKDOWN)).to.equal(DATA[0].TEXT);
            expect(clearMarkdown(DATA[1].MARKDOWN)).to.equal(DATA[1].TEXT);
            expect(clearMarkdown(DATA[2].MARKDOWN)).to.equal(DATA[2].TEXT);
        });
    });

    describe('speachSynthesisPromise', () => {
        it('speachSynthesisPromise should return a promise', () => {
            const promise = speechSynthesisPromise('', 'en-US');
            expect(promise.then).to.be.a('function');
        });
    });

    describe('speechSynthesis.speak', () => {
        it('Simple hellow world test', () => {
            function test() {
                // throw new Error('Oops');
                window.speechSynthesis.speak(
                    new window.SpeechSynthesisUtterance('hello world!')
                );
            }

            expect(test).not.to.throw(Error);
        });
    });

    describe('doSpeak and cancelSpeak', () => {
        const DATA = {
            EN: "MLA format follows the author-page method of in-text citation. This means that the author's last name and the page number(s) from which the quotation or paraphrase is taken must appear in the text, and a complete reference should appear on your Works Cited page. The author's name may appear either in the sentence itself or in parentheses following the quotation or paraphrase, but the page number(s) should always appear in the parentheses, not in the text of your sentence.\nJoe waited for the train.\nThe train was late.\nMary and Samantha took the bus.",
            FR: 'Lulea, au nord de la Suède, près du cercle polaire, un jour de printemps glacial et neigeux. Le « data center » (centre de données) de Facebook, installé à la sortie de la ville, est peint en couleurs neutres et ne porte aucune enseigne. Mais il a du mal à passer inaperçu : il mesure 320 mètres de long, 100 de large et 30 de haut. Sa superficie équivaut à dix-sept patinoires de hockey sur glace, ont calculé les Suédois.',
        };

        it('doSpeak should speak english', (done) => {
            doSpeak(DATA.EN, 'en-GB', false)
                .then((evt) => {
                    expect(evt).to.be.an.instanceof(SpeechSynthesisEvent);
                    done();
                })
                .catch(done);
            setTimeout(() => {
                cancelSpeak();
            }, 3000);
        });

        it('doSpeak should speak french', (done) => {
            doSpeak(DATA.FR, 'fr', false)
                .then((evt) => {
                    expect(evt).to.be.an.instanceof(SpeechSynthesisEvent);
                    done();
                })
                .catch(done);
            setTimeout(() => {
                cancelSpeak();
            }, 3000);
        });
    });
});
