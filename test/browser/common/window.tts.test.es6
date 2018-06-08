/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import {
    cancelSpeak,
    clearMarkdown,
    doSpeak,
    getVoice,
    speechSynthesisPromise,
    useCordovaPlugIn,
    useWebSpeechSynthesis
} from '../../../src/js/common/window.tts.es6';

const { describe, it } = window;
const { expect } = chai;

describe('window.tts', () => {
    describe('Legacy export', () => {
        it('Check window.app.tts.*', () => {
            expect(window.app.tts.cancelSpeak).to.equal(cancelSpeak);
            expect(window.app.tts._clearMarkdown).to.equal(clearMarkdown);
            expect(window.app.tts.doSpeak).to.equal(doSpeak);
            expect(window.app.tts._getVoice).to.equal(getVoice);
            expect(window.app.tts._speechSynthesisPromise).to.equal(
                speechSynthesisPromise
            );
            expect(window.app.tts._useCordovaPlugIn).to.equal(useCordovaPlugIn);
            expect(window.app.tts._useSpeechSynthesis).to.equal(
                useWebSpeechSynthesis
            );
        });
    });

    describe('useCordovaPlugIn', () => {
        it('useCordovaPlugIn should be false', () => {
            expect(useCordovaPlugIn()).to.be.false;
        });
    });

    describe('useWebSpeechSynthesis', () => {
        it('useSpeechSynthesis should be true in Chrome and Safari', () => {
            // Only Internet Explorer and PhantomJS do not support SpeechSynthesis at this stage
            // @see http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
            expect(useWebSpeechSynthesis()).to.equal(
                !document.documentMode && !window.PHANTOMJS
            );
        });
    });

    describe('getVoice', () => {
        it('getVoice should return an english voice', () => {
            if (useWebSpeechSynthesis()) {
                expect(getVoice('en-GB')).to.have.property('lang');
            }
        });

        it('getVoice should return a french voice', () => {
            if (useWebSpeechSynthesis()) {
                expect(getVoice('fr-FR')).to.have.property('lang');
            }
        });
    });

    describe('clearMarkdown', () => {
        const DATA = [
            {
                MARKDOWN:
                    "# Heading\n>Quote\n## Heading 2\n\n**We** love ```js\nconsole.log('Hello')```",
                // Note: in this example, js should have been removed
                TEXT:
                    " Heading\nQuote\n Heading 2\n\nWe love js\nconsole.log('Hello')"
            },
            {
                MARKDOWN:
                    '# List 1\n\n- Item\n- Item\n\n# List 2\n\n1. Item\n2. Item',
                TEXT: ' List 1\n\n- Item\n- Item\n\n List 2\n\n1. Item\n2. Item'
            },
            {
                MARKDOWN:
                    'A link:\n[Kidoju](https://www.kidoju.com)\nAn image:\n![Kidoju Logo](https://cdn.kidoju.com/kidoju/logo.png)',
                TEXT: 'A link:\nKidoju\nAn image:\nKidoju Logo'
            }
        ];
        // TODO: Also test tables, LaTeX, ...

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
                if (useWebSpeechSynthesis()) {
                    // throw new Error('Oops');
                    window.speechSynthesis.speak(
                        new window.SpeechSynthesisUtterance('hello world!')
                    );
                }
            }
            expect(test).not.to.throw(Error);
        });
    });

    describe('doSpeak and cancelSpeak', () => {
        const DATA = {
            EN:
                "MLA format follows the author-page method of in-text citation. This means that the author's last name and the page number(s) from which the quotation or paraphrase is taken must appear in the text, and a complete reference should appear on your Works Cited page. The author's name may appear either in the sentence itself or in parentheses following the quotation or paraphrase, but the page number(s) should always appear in the parentheses, not in the text of your sentence.\nJoe waited for the train.\nThe train was late.\nMary and Samantha took the bus.",
            FR:
                'Lulea, au nord de la Suède, près du cercle polaire, un jour de printemps glacial et neigeux. Le « data center » (centre de données) de Facebook, installé à la sortie de la ville, est peint en couleurs neutres et ne porte aucune enseigne. Mais il a du mal à passer inaperçu : il mesure 320 mètres de long, 100 de large et 30 de haut. Sa superficie équivaut à dix-sept patinoires de hockey sur glace, ont calculé les Suédois.'
        };

        it('doSpeak should speak english', done => {
            doSpeak(DATA.EN, 'en-GB', false)
                .done(evt => {
                    expect(evt).to.be.an.instanceof(SpeechSynthesisEvent);
                    done();
                })
                .fail(done);
            setTimeout(() => {
                cancelSpeak();
            }, 3000);
        });

        it('doSpeak should speak french', done => {
            doSpeak(DATA.FR, 'fr', false)
                .done(evt => {
                    expect(evt).to.be.an.instanceof(SpeechSynthesisEvent);
                    done();
                })
                .fail(done);
            setTimeout(() => {
                cancelSpeak();
            }, 3000);
        });
    });
});
