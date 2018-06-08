/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';
import Logger from './window.logger.es6';

const logger = new Logger('window.tts');
const CHUNK_SIZE = 175;
const RX_IOS = /i(phone|pad|pod)/i;
// const RX_IOS_11 = /i(phone|pad|pod) OS 11_/i;
let voices = [];

/* NOTES
On Android 5 (Nexus 7), I could not get the sound from W3C Speech APIs to work before changing some Android settings
in Settings > System > Accessibility > Text-to-speech output as explained at https://www.greenbot.com/article/2105862/android/how-to-get-started-with-google-text-to-speech.html

Considering W3C Speech APIs do not work well on Android, we use the Cordova TTS plugin
iOS UIWebView support the W3C Speech APIs, but the sound seems less metallic with  the Cordova TTS Plugin
On the long term, we should be able to remove the Cordova TTS Plugin and only rely on the W3C Speech APIs
*/

function loadVoices() {
    voices = window.speechSynthesis.getVoices() || [];
    if (voices._list) {
        // https://github.com/macdonst/SpeechSynthesisPlugin/issues/7
        // https://github.com/macdonst/SpeechSynthesisPlugin/blob/master/www/SpeechSynthesisVoiceList.js
        voices = voices._list;
    }
}

function onDeviceReady() {
    if (
        'speechSynthesis' in window &&
        $.isFunction(window.speechSynthesis.getVoices)
    ) {
        loadVoices();
        if ('onvoiceschanged' in window.speechSynthesis) {
            // Chrome loads voices asynchronously
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            // We need to attempt to load twice especially for https://github.com/macdonst/SpeechSynthesisPlugin
            // Because first time return 1 and second time return a SpeechSynthesisVoiceList
            setTimeout(loadVoices, 3000);
        }
    }
}

/**
 * Load voices
 */
if (window.cordova) {
    // This is for https://github.com/macdonst/SpeechRecognitionPlugin
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    // This is for using the W3C Speech API in any browser
    onDeviceReady();
}

/**
 * Test Cordova plugin
 * @see https://github.com/vilic/cordova-plugin-tts
 * @type {*}
 */
export function useCordovaPlugIn() {
    // This has to be a function because it needs to be evaluated once the TTS plugin is loaded
    // return !!(window.cordova && window.device && window.device.platform !== 'browser' && !RX_IOS_11.test(window.navigator.userAgent) && window.TTS && $.isFunction(window.TTS.speak));
    return !!(
        window.cordova &&
        window.device &&
        window.device.platform !== 'browser' &&
        window.TTS &&
        $.isFunction(window.TTS.speak)
    );
}

/**
 * Test HTML5 Web Speech API
 * @see https://codepen.io/matt-west/pen/wGzuJ
 */
export function useWebSpeechSynthesis() {
    // This does not have to be a function, but it is consistent with useCordovaPlugIn
    return !!(
        'speechSynthesis' in window &&
        $.isFunction(window.SpeechSynthesisUtterance) &&
        $.isFunction(window.speechSynthesis.speak)
    );
}

/**
 * Get voice
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice
 * Edge and Firefox only load the voices corresponding to browser language settings
 * Chrome and Safari load all voice languages
 * This can be tested at https://codepen.io/matt-west/pen/wGzuJ
 */
export function getVoice(language) {
    assert.type(
        CONSTANTS.STRING,
        language,
        assert.format(
            assert.messages.type.default,
            'language',
            CONSTANTS.STRING
        )
    );
    // voices might be undefined as with https://github.com/macdonst/SpeechSynthesisPlugin
    const natives = (voices || []).filter(voice =>
        voice.lang.toLowerCase().startsWith(language.toLowerCase())
    );
    const localDefaults = natives.filter(
        voice => voice.default && voice.localService
    );
    let voice;
    if (Array.isArray(localDefaults) && localDefaults.length) {
        [voice] = localDefaults;
    } else if (Array.isArray(natives) && natives.length) {
        [voice] = natives;
    }
    return voice;
}

/**
 * Clear markdown from markings that are irrelevant to speech
 * (Note it is also possible to convert to html and request the text())
 * @param markdown
 * @private
 */
export function clearMarkdown(markdown) {
    assert.type(
        CONSTANTS.STRING,
        markdown,
        assert.format(
            assert.messages.type.default,
            'markdown',
            CONSTANTS.STRING
        )
    );
    return markdown
        .replace(/[#`>_*]/g, '') // remove headings, code (backticks), emphasis
        .replace(/!?\[([^\]]+)]\([^)]+\)/g, '$1'); // remove web and image links
}

/**
 * Chrome version < 56 does not speak text longer than approx. 300 characters,
 * so we need to chunk text into an array of smaller strings to play
 * @see http://stackoverflow.com/questions/21947730/chrome-speech-synthesis-with-longer-texts
 * @see https://github.com/unk1911/speech/blob/master/js/speech.js
 * @param text
 * @param size
 * @private
 */
export function splitChunks(text, size) {
    assert.type(
        CONSTANTS.STRING,
        text,
        assert.format(assert.messages.type.default, 'text', CONSTANTS.STRING)
    );
    assert.type(
        CONSTANTS.NUMBER,
        size,
        assert.format(assert.messages.type.default, 'size', CONSTANTS.NUMBER)
    );
    const ret = [];
    // Chromium is chrome or opera and window.StyleMedia excludes MS Edge
    // @see http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    if (
        'chrome' in window &&
        $.type(window.StyleMedia) === CONSTANTS.UNDEFINED
    ) {
        const matches = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        const version =
            Array.isArray(matches) &&
            matches.length === 3 &&
            parseInt(matches[2], 10);
        if ($.type(version) === CONSTANTS.NUMBER && version < 56) {
            // Note: This regular expression could be improved:
            // 1. to exclude native voices which do not fail at ~200-300 characters
            // 2. not to break up numbers like 10,000.00 - see https://github.com/unk1911/speech/blob/master/js/speech.js
            const rx = new RegExp(
                `^[\\s\\S]{${Math.floor(
                    size / 2
                )},${size}[.!?,]{1}|^[\\s\\S]{1,' + size + '}$|^[\\s\\S]{1,${size}} `
            );
            let txt = text;
            while (txt.length > 0) {
                const chunk = txt.match(rx)[0];
                ret.push(chunk.trim());
                txt = txt.substring(chunk.length);
            }
        } else {
            ret.push(text);
        }
    } else {
        ret.push(text);
    }
    return ret;
}

/**
 * Get a speach synthesis promise
 * @param text
 * @param language
 * @private
 */
export function speechSynthesisPromise(text, language) {
    assert.type(
        CONSTANTS.STRING,
        text,
        assert.format(assert.messages.type.default, 'text', CONSTANTS.STRING)
    );
    assert.type(
        CONSTANTS.STRING,
        language,
        assert.format(
            assert.messages.type.default,
            'language',
            CONSTANTS.STRING
        )
    );
    const dfd = $.Deferred();
    if (useWebSpeechSynthesis()) {
        const voice = getVoice(language);
        if (voice && voice.lang) {
            const utterance = new window.SpeechSynthesisUtterance();
            utterance.text = text; // https://github.com/macdonst/SpeechSynthesisPlugin/issues/6
            if ('voice' in utterance) {
                // Standard Web Speech API
                utterance.voice = voice; // This sets the language
                // Setting an unavailable language in Microsoft Edge breaks the speech,
                // but hopefully we got a SpeechSynthesisVoice
                // utterance.lang = language;
            } else {
                // For https://github.com/macdonst/SpeechSynthesisPlugin
                utterance.voiceURI = voice.voiceURI;
                utterance.lang = voice.lang;
            }
            utterance.rate = 1;
            utterance.onend = function onend(evt) {
                // Returns a SpeechSynthesisEvent
                if (evt.type === 'error') {
                    // This occurs on Edge when the language pack has not been installed
                    dfd.reject(new Error('Speech synthesis error.'));
                    logger.error({
                        method: 'tts.speechSynthesisPromise',
                        message: 'Speech synthesis error..'
                    });
                } else {
                    dfd.resolve(evt);
                }
            };
            utterance.onerror = dfd.reject;
            window.speechSynthesis.speak(utterance);
            if ('console' in window) {
                window.console.log(utterance); // a funny workaround to ensure the onend callback is called in Chrome
            }
        } else {
            dfd.reject(new Error('No voice available to speak text.'));
            logger.error({
                method: 'tts.speechSynthesisPromise',
                message: 'No voice available to speak text.'
            });
        }
    } else {
        dfd.resolve();
    }
    return dfd.promise();
}

/**
 * Use tts to speak text
 * @param text
 * @param language
 * @param clear
 */
export function doSpeak(text, language, clear) {
    assert.type(
        CONSTANTS.STRING,
        text,
        assert.format(assert.messages.type.default, 'text', CONSTANTS.STRING)
    );
    assert.type(
        CONSTANTS.STRING,
        language,
        assert.format(
            assert.messages.type.default,
            'language',
            CONSTANTS.STRING
        )
    );
    assert.type(
        CONSTANTS.BOOLEAN,
        clear,
        assert.format(assert.messages.type.default, 'clear', CONSTANTS.BOOLEAN)
    );
    const dfd = $.Deferred();
    let txt = text;
    if (clear) {
        txt = clearMarkdown(text);
    }
    if (useCordovaPlugIn()) {
        // For iOS and Android via TTS plugin
        // Note: iOS UIWebView supports speechSynthesis but not Chrome 61 on Android 5.1.1 (Nexus 7)
        // window.alert('TTS Plugin');
        // navigator.notification.prompt(
        //     'Enter a rate ' + (RX_IOS.test(window.navigator.userAgent) && !window.MSStream ? '(iOS):' : '(Not iOS):'),
        //     function (result) {
        window.TTS.speak(
            {
                txt,
                locale: language === 'fr' ? 'fr-FR' : 'en-GB',
                // https://docs.telerik.com/kendo-ui/api/javascript/kendo#fields-support.mobileOS
                // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
                // The higher the rate the quicker

                // With https://github.com/vilic/cordova-plugin-tts#0.2.3
                // rate: RX_IOS.test(window.navigator.userAgent) && !window.MSStream ? 1.5 : 1 // but too slow for iOS 11

                // With https://github.com/vilic/cordova-plugin-tts#deecc11
                // rate: RX_IOS.test(window.navigator.userAgent) && !window.MSStream ? 1.1 : 1.2 // Not tested on iOS 10 and below

                // With https://github.com/vilic/cordova-plugin-tts#b25e7ac (more recent than #deecc11)
                rate:
                    RX_IOS.test(window.navigator.userAgent) && !window.MSStream
                        ? 0.7
                        : 2 // Not tested on iOS 10 and below

                // When using a confirm cordova dialog
                // rate: parseFloat(result.input1) || undefined
            },
            dfd.resolve,
            dfd.reject
        );
        logger.debug({
            method: 'tts.doSpeak',
            message: 'Text spoken with Cordova TTS Plugin'
        });
        //     },
        //     'TTS Plugin',
        //     ['OK'],
        //     '1'
        // );
    } else if (useWebSpeechSynthesis()) {
        // In the browser - https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
        // window.alert('W3C Speech API');
        const chunks = splitChunks(txt, CHUNK_SIZE);
        const promises = [];
        chunks.forEach(chunk => {
            promises.push(speechSynthesisPromise(chunk, language));
        });
        $.when(...promises)
            .done(dfd.resolve)
            .fail(dfd.reject);
        logger.debug({
            method: 'tts.doSpeak',
            message: 'Text spoken with W3C Speech API'
        });
    } else {
        dfd.resolve();
    }
    return dfd.promise();
}

/**
 * Use tts to cancel speak
 */
export function cancelSpeak() {
    const dfd = $.Deferred();
    if (useCordovaPlugIn()) {
        // For iOS and Android via TTS plugin
        // @see http://ourcodeworld.com/articles/read/370/how-to-convert-text-to-speech-speech-synthesis-in-cordova
        window.TTS.speak('', dfd.resolve, dfd.reject);
        logger.debug({
            method: 'tts.cancelSpeak',
            message: 'Text canceled with Cordova TTS Plugin'
        });
    } else if (useWebSpeechSynthesis()) {
        // In the browser - https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel
        window.speechSynthesis.cancel();
        dfd.resolve();
        logger.debug({
            method: 'tts.cancelSpeak',
            message: 'Text canceled with W3C Speech API'
        });
    } else {
        dfd.resolve();
    }
    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 * @type {assert}
 */
window.app = window.app || {};
window.app.tts = window.app.tts || {};
window.app.tts._useCordovaPlugIn = useCordovaPlugIn;
window.app.tts._useSpeechSynthesis = useWebSpeechSynthesis;
window.app.tts._getVoice = getVoice;
window.app.tts._clearMarkdown = clearMarkdown;
window.app.tts._chunk = splitChunks;
window.app.tts._speechSynthesisPromise = speechSynthesisPromise;
window.app.tts.doSpeak = doSpeak;
window.app.tts.cancelSpeak = cancelSpeak;
