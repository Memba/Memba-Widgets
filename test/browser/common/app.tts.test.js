/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, expr: true */
/* global describe, it, before */

;(function ($, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var tts = window.app.tts;
    var DATA = [
        {
            MARKDOWN: '# Heading\n>Quote\n## Heading 2\n\n**We** love ```js\nconsole.log(\'Hello\')```',
            // Note: in this example, js should have been removed
            TEXT: ' Heading\nQuote\n Heading 2\n\nWe love js\nconsole.log(\'Hello\')'
        },
        {
            MARKDOWN: '# List 1\n\n- Item\n- Item\n\n# List 2\n\n1. Item\n2. Item',
            TEXT: ' List 1\n\n- Item\n- Item\n\n List 2\n\n1. Item\n2. Item'
        },
        {
            MARKDOWN: 'A link:\n[Kidoju](https://www.kidoju.com)\nAn image:\n![Kidoju Logo](https://cdn.kidoju.com/kidoju/logo.png)',
            TEXT: 'A link:\nKidoju\nAn image:\nKidoju Logo'
        },
        // TODO: Also test tables, LaTeX, ...
        {
            TEXT: 'MLA format follows the author-page method of in-text citation. This means that the author\'s last name and the page number(s) from which the quotation or paraphrase is taken must appear in the text, and a complete reference should appear on your Works Cited page. The author\'s name may appear either in the sentence itself or in parentheses following the quotation or paraphrase, but the page number(s) should always appear in the parentheses, not in the text of your sentence.\nJoe waited for the train.\nThe train was late.\nMary and Samantha took the bus.'
        },
        {
            TEXT: 'Lulea, au nord de la Suède, près du cercle polaire, un jour de printemps glacial et neigeux. Le « data center » (centre de données) de Facebook, installé à la sortie de la ville, est peint en couleurs neutres et ne porte aucune enseigne. Mais il a du mal à passer inaperçu : il mesure 320 mètres de long, 100 de large et 30 de haut. Sa superficie équivaut à dix-sept patinoires de hockey sur glace, ont calculé les Suédois.'
        }
    ];

    describe('app.tts', function () {

        it('_useCordovaPlugIn should be false', function () {
            expect(tts._useCordovaPlugIn()).to.be.false;
        });

        it('_useSpeechSynthesis should be true in Chrome and Safari', function () {
            // Only Internet Explorer and PhantomJS do not support SpeechSynthesis at this stage
            // @see http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
            expect(tts._useSpeechSynthesis()).to.equal(!document.documentMode && !window.PHANTOMJS);
        });

        it('_getVoice should return an english voice', function () {
            if (tts._useSpeechSynthesis()) {
                expect(tts._getVoice('en-GB')).to.have.property('lang');
            }
        });

        it('_getVoice should return a french voice', function () {
            if (tts._useSpeechSynthesis()) {
                expect(tts._getVoice('fr-FR')).to.have.property('lang');
            }
        });

        it('_clearMarkdown should clear markings', function () {
            expect(tts._clearMarkdown(DATA[0].MARKDOWN)).to.equal(DATA[0].TEXT);
            expect(tts._clearMarkdown(DATA[1].MARKDOWN)).to.equal(DATA[1].TEXT);
            expect(tts._clearMarkdown(DATA[2].MARKDOWN)).to.equal(DATA[2].TEXT);
        });

        it('_speachSynthesisPromise should return a promise', function () {
            var promise = tts._speechSynthesisPromise('', 'en-US');
            expect(promise.then).to.be.a('function');
        });

        it('Simple speach symnthesis test', function () {
            function test () {
                if (tts._useSpeechSynthesis()) {
                    // throw new Error('Oops');
                    window.speechSynthesis.speak(new window.SpeechSynthesisUtterance('hello world!'));
                }
            }
            expect(test).to.not.throw(Error);
        });

        it('doSpeak should speak english', function (done) {
            tts.doSpeak(DATA[3].TEXT, 'en-US', false)
                .done(function () { done(); })
                .fail(done);
        });

        it('doSpeak should speak french', function (done) {
            tts.doSpeak(DATA[4].TEXT, 'fr', false)
                .done(function () { done(); })
                .fail(done);
        });

        it('cancelSpeak should cancel', function (done) {
            tts.doSpeak(DATA[3].TEXT, 'fr', false);
            setTimeout(function () {
                tts.cancelSpeak()
                    .always(done);
            }, 100);
        });

    });

}(window.jQuery));
