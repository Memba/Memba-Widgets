/**
 * FingerprintJS v3.0.0 - Copyright (c) FingerprintJS, Inc, 2020 (https://fingerprintjs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 *
 * This software contains code from open-source projects:
 * MurmurHash3 by Karan Lyons (https://github.com/karanlyons/murmurHash3.js)
 */

var FingerprintJS = (function (exports) {
    'use strict';

    /*
     * Taken from https://github.com/karanlyons/murmurHash3.js/blob/a33d0723127e2e5415056c455f8aed2451ace208/murmurHash3.js
     */
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // added together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Add(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] + n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] + n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] + n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] + n[0];
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    }
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // multiplied together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Multiply(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] * n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] * n[3];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[2] += m[3] * n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] * n[3];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[2] * n[2];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[3] * n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    }
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) rotated left by that number of positions.
    //
    function x64Rotl(m, n) {
        n %= 64;
        if (n === 32) {
            return [m[1], m[0]];
        }
        else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
        }
        else {
            n -= 32;
            return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
        }
    }
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) shifted left by that number of positions.
    //
    function x64LeftShift(m, n) {
        n %= 64;
        if (n === 0) {
            return m;
        }
        else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
        }
        else {
            return [m[1] << (n - 32), 0];
        }
    }
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // xored together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Xor(m, n) {
        return [m[0] ^ n[0], m[1] ^ n[1]];
    }
    //
    // Given a block, returns murmurHash3's final x64 mix of that block.
    // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
    // only place where we need to right shift 64bit ints.)
    //
    function x64Fmix(h) {
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xff51afd7, 0xed558ccd]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
        h = x64Xor(h, [0, h[0] >>> 1]);
        return h;
    }
    //
    // Given a string and an optional seed as an int, returns a 128 bit
    // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
    //
    function x64hash128(key, seed) {
        key = key || '';
        seed = seed || 0;
        var remainder = key.length % 16;
        var bytes = key.length - remainder;
        var h1 = [0, seed];
        var h2 = [0, seed];
        var k1 = [0, 0];
        var k2 = [0, 0];
        var c1 = [0x87c37b91, 0x114253d5];
        var c2 = [0x4cf5ad43, 0x2745937f];
        for (var i = 0; i < bytes; i = i + 16) {
            k1 = [
                (key.charCodeAt(i + 4) & 0xff) |
                    ((key.charCodeAt(i + 5) & 0xff) << 8) |
                    ((key.charCodeAt(i + 6) & 0xff) << 16) |
                    ((key.charCodeAt(i + 7) & 0xff) << 24),
                (key.charCodeAt(i) & 0xff) |
                    ((key.charCodeAt(i + 1) & 0xff) << 8) |
                    ((key.charCodeAt(i + 2) & 0xff) << 16) |
                    ((key.charCodeAt(i + 3) & 0xff) << 24),
            ];
            k2 = [
                (key.charCodeAt(i + 12) & 0xff) |
                    ((key.charCodeAt(i + 13) & 0xff) << 8) |
                    ((key.charCodeAt(i + 14) & 0xff) << 16) |
                    ((key.charCodeAt(i + 15) & 0xff) << 24),
                (key.charCodeAt(i + 8) & 0xff) |
                    ((key.charCodeAt(i + 9) & 0xff) << 8) |
                    ((key.charCodeAt(i + 10) & 0xff) << 16) |
                    ((key.charCodeAt(i + 11) & 0xff) << 24),
            ];
            k1 = x64Multiply(k1, c1);
            k1 = x64Rotl(k1, 31);
            k1 = x64Multiply(k1, c2);
            h1 = x64Xor(h1, k1);
            h1 = x64Rotl(h1, 27);
            h1 = x64Add(h1, h2);
            h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
            k2 = x64Multiply(k2, c2);
            k2 = x64Rotl(k2, 33);
            k2 = x64Multiply(k2, c1);
            h2 = x64Xor(h2, k2);
            h2 = x64Rotl(h2, 31);
            h2 = x64Add(h2, h1);
            h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
        }
        k1 = [0, 0];
        k2 = [0, 0];
        switch (remainder) {
            case 15:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48));
            // fallthrough
            case 14:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40));
            // fallthrough
            case 13:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32));
            // fallthrough
            case 12:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24));
            // fallthrough
            case 11:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16));
            // fallthrough
            case 10:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8));
            // fallthrough
            case 9:
                k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)]);
                k2 = x64Multiply(k2, c2);
                k2 = x64Rotl(k2, 33);
                k2 = x64Multiply(k2, c1);
                h2 = x64Xor(h2, k2);
            // fallthrough
            case 8:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56));
            // fallthrough
            case 7:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48));
            // fallthrough
            case 6:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40));
            // fallthrough
            case 5:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32));
            // fallthrough
            case 4:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24));
            // fallthrough
            case 3:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16));
            // fallthrough
            case 2:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8));
            // fallthrough
            case 1:
                k1 = x64Xor(k1, [0, key.charCodeAt(i)]);
                k1 = x64Multiply(k1, c1);
                k1 = x64Rotl(k1, 31);
                k1 = x64Multiply(k1, c2);
                h1 = x64Xor(h1, k1);
            // fallthrough
        }
        h1 = x64Xor(h1, [0, key.length]);
        h2 = x64Xor(h2, [0, key.length]);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        h1 = x64Fmix(h1);
        h2 = x64Fmix(h2);
        h1 = x64Add(h1, h2);
        h2 = x64Add(h2, h1);
        return (('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8));
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var version = "3.0.0";

    function requestIdleCallbackIfAvailable(fallbackTimeout) {
        return new Promise((resolve) => {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => resolve());
            }
            else {
                setTimeout(resolve, fallbackTimeout);
            }
        });
    }

    /*
     * This file contains functions to work with pure data only (no browser features, DOM, side effects, etc).
     */
    /**
     * Does the same as Array.prototype.includes but has better typing
     */
    function includes(haystack, needle) {
        for (let i = 0, l = haystack.length; i < l; ++i) {
            if (haystack[i] === needle) {
                return true;
            }
        }
        return false;
    }
    /**
     * Like `!includes()` but with proper typing
     */
    function excludes(haystack, needle) {
        return !includes(haystack, needle);
    }
    /**
     * Be careful, NaN can return
     */
    function toInt(value) {
        if (typeof value === 'number') {
            return value | 0;
        }
        return parseInt(value);
    }
    function countTruthy(values) {
        return values.reduce((sum, value) => sum + (value ? 1 : 0), 0);
    }

    const n = navigator;
    const w = window;
    // Inspired by and based on https://github.com/cozylife/audio-fingerprint
    function getAudioFingerprint() {
        return __awaiter(this, void 0, void 0, function* () {
            // On iOS 11, audio context can only be used in response to user interaction.
            // We require users to explicitly enable audio fingerprinting on iOS 11.
            // See https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
            if (n.userAgent.match(/OS 11.+Version\/11.+Safari/)) {
                // See comment for excludeUserAgent and https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
                return -1;
            }
            const AudioContext = w.OfflineAudioContext || w.webkitOfflineAudioContext;
            if (!AudioContext) {
                return -2;
            }
            const context = new AudioContext(1, 44100, 44100);
            const oscillator = context.createOscillator();
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(10000, context.currentTime);
            const compressor = context.createDynamicsCompressor();
            for (const [param, value] of [
                ['threshold', -50],
                ['knee', 40],
                ['ratio', 12],
                ['reduction', -20],
                ['attack', 0],
                ['release', 0.25],
            ]) {
                if (typeof compressor[param].setValueAtTime === 'function') {
                    compressor[param].setValueAtTime(value, context.currentTime);
                }
            }
            oscillator.connect(compressor);
            compressor.connect(context.destination);
            oscillator.start(0);
            context.startRendering();
            return new Promise((resolve) => {
                const audioTimeoutId = setTimeout(() => {
                    context.oncomplete = () => { };
                    resolve(-3);
                }, 1000);
                context.oncomplete = (event) => {
                    let afp;
                    try {
                        clearTimeout(audioTimeoutId);
                        afp = event.renderedBuffer
                            .getChannelData(0)
                            .slice(4500, 5000)
                            .reduce((acc, val) => acc + Math.abs(val), 0);
                        oscillator.disconnect();
                        compressor.disconnect();
                    }
                    catch (error) {
                        resolve(-4);
                        return;
                    }
                    resolve(afp);
                };
            });
        });
    }

    const d = document;
    // a font will be compared against all the three default fonts.
    // and if it doesn't match all 3 then that font is not available.
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
        // this is android-specific font from "Roboto" family
        'sans-serif-thin',
        'ARNO PRO',
        'Agency FB',
        'Arabic Typesetting',
        'Arial Unicode MS',
        'AvantGarde Bk BT',
        'BankGothic Md BT',
        'Batang',
        'Bitstream Vera Sans Mono',
        'Calibri',
        'Century',
        'Century Gothic',
        'Clarendon',
        'EUROSTILE',
        'Franklin Gothic',
        'Futura Bk BT',
        'Futura Md BT',
        'GOTHAM',
        'Gill Sans',
        'HELV',
        'Haettenschweiler',
        'Helvetica Neue',
        'Humanst521 BT',
        'Leelawadee',
        'Letter Gothic',
        'Levenim MT',
        'Lucida Bright',
        'Lucida Sans',
        'Menlo',
        'MS Mincho',
        'MS Outlook',
        'MS Reference Specialty',
        'MS UI Gothic',
        'MT Extra',
        'MYRIAD PRO',
        'Marlett',
        'Meiryo UI',
        'Microsoft Uighur',
        'Minion Pro',
        'Monotype Corsiva',
        'PMingLiU',
        'Pristina',
        'SCRIPTINA',
        'Segoe UI Light',
        'Serifa',
        'SimHei',
        'Small Fonts',
        'Staccato222 BT',
        'TRAJAN PRO',
        'Univers CE 55 Medium',
        'Vrinda',
        'ZWAdobeF',
    ];
    const fontResetStyles = {
        fontStyle: 'normal',
        fontWeight: 'normal',
        letterSpacing: 'normal',
        lineBreak: 'auto',
        lineHeight: 'normal',
        textTransform: 'none',
        textAlign: 'left',
        textDecoration: 'none',
        textShadow: 'none',
        whiteSpace: 'normal',
        wordBreak: 'normal',
        wordSpacing: 'normal',
    };
    // we use m or w because these two characters take up the maximum width.
    // And we use a LLi so that the same matching fonts can get separated
    const testString = 'mmMwWLliI0O&1';
    // we test using 48px font size, we may use any size. I guess larger the better.
    const testSize = '48px';
    // kudos to http://www.lalit.org/lab/javascript-css-font-detect/
    function getFonts() {
        const h = d.body;
        // div to load spans for the base fonts
        const baseFontsDiv = d.createElement('div');
        // div to load spans for the fonts to detect
        const fontsDiv = d.createElement('div');
        const defaultWidth = {};
        const defaultHeight = {};
        // creates a span where the fonts will be loaded
        const createSpan = () => {
            const s = d.createElement('span');
            Object.assign(s.style, 
            // css font reset to reset external styles
            fontResetStyles, 
            /*
             * We need this css as in some weird browser this
             * span elements shows up for a microSec which creates a
             * bad user experience
             */
            {
                position: 'absolute',
                left: '-9999px',
                fontSize: testSize,
            });
            s.textContent = testString;
            return s;
        };
        // creates a span and load the font to detect and a base font for fallback
        const createSpanWithFonts = (fontToDetect, baseFont) => {
            const s = createSpan();
            s.style.fontFamily = `'${fontToDetect}',${baseFont}`;
            return s;
        };
        // creates spans for the base fonts and adds them to baseFontsDiv
        const initializeBaseFontsSpans = () => {
            return baseFonts.map((baseFont) => {
                const s = createSpan();
                s.style.fontFamily = baseFont;
                baseFontsDiv.appendChild(s);
                return s;
            });
        };
        // creates spans for the fonts to detect and adds them to fontsDiv
        const initializeFontsSpans = () => {
            // Stores {fontName : [spans for that font]}
            const spans = {};
            for (const font of fontList) {
                spans[font] = baseFonts.map((baseFont) => {
                    const s = createSpanWithFonts(font, baseFont);
                    fontsDiv.appendChild(s);
                    return s;
                });
            }
            return spans;
        };
        // checks if a font is available
        const isFontAvailable = (fontSpans) => {
            return baseFonts.some(((baseFont, baseFontIndex) => (fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] ||
                fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont])));
        };
        // create spans for base fonts
        const baseFontsSpans = initializeBaseFontsSpans();
        // add the spans to the DOM
        h.appendChild(baseFontsDiv);
        // get the default width for the three base fonts
        for (let index = 0, length = baseFonts.length; index < length; index++) {
            defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
            defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
        }
        // create spans for fonts to detect
        const fontsSpans = initializeFontsSpans();
        // add all the spans to the DOM
        h.appendChild(fontsDiv);
        // check available fonts
        const available = [];
        for (let i = 0, l = fontList.length; i < l; i++) {
            if (isFontAvailable(fontsSpans[fontList[i]])) {
                available.push(fontList[i]);
            }
        }
        // remove spans from DOM
        h.removeChild(fontsDiv);
        h.removeChild(baseFontsDiv);
        return available;
    }

    function getPlugins() {
        if (!navigator.plugins) {
            return undefined;
        }
        const plugins = [];
        // Safari 10 doesn't support iterating navigator.plugins with for...of
        for (let i = 0; i < navigator.plugins.length; ++i) {
            const plugin = navigator.plugins[i];
            if (!plugin) {
                continue;
            }
            const mimeTypes = [];
            for (const mimeType of plugin) {
                mimeTypes.push({
                    type: mimeType.type,
                    suffixes: mimeType.suffixes,
                });
            }
            plugins.push({
                name: plugin.name,
                description: plugin.description,
                mimeTypes,
            });
        }
        return plugins;
    }

    function makeCanvasContext() {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 140;
        canvas.style.display = 'inline';
        return [canvas, canvas.getContext('2d')];
    }
    function isSupported(canvas, context) {
        // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
        return !!(context && canvas.toDataURL);
    }
    function save(canvas) {
        // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
        return canvas.toDataURL();
    }
    // https://www.browserleaks.com/canvas#how-does-it-work
    function getCanvasFingerprint() {
        const [canvas, context] = makeCanvasContext();
        if (!isSupported(canvas, context)) {
            return { winding: false, data: '' };
        }
        // detect browser support of canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
        context.rect(0, 0, 10, 10);
        context.rect(2, 2, 6, 6);
        const winding = !context.isPointInPath(5, 5, 'evenodd');
        context.textBaseline = 'alphabetic';
        context.fillStyle = '#f60';
        context.fillRect(125, 1, 62, 20);
        context.fillStyle = '#069';
        // https://github.com/Valve/fingerprintjs2/issues/66
        // this can affect FP generation when applying different CSS on different websites
        context.font = '11pt no-real-font-123';
        // the choice of emojis has a gigantic impact on rendering performance (especially in FF)
        // some newer emojis cause it to slow down 50-200 times
        // context.fillText("Cw爨m fjordbank \ud83d\ude03 gly", 2, 15)
        const printedText = 'Cwm fjordbank \ud83d\ude03 gly';
        context.fillText(printedText, 2, 15);
        context.fillStyle = 'rgba(102, 204, 0, 0.2)';
        context.font = '18pt Arial';
        context.fillText(printedText, 4, 45);
        // canvas blending
        // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // http://jsfiddle.net/NDYV8/16/
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = 'rgb(255,0,255)';
        context.beginPath();
        context.arc(50, 50, 50, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        context.fillStyle = 'rgb(0,255,255)';
        context.beginPath();
        context.arc(100, 50, 50, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        context.fillStyle = 'rgb(255,255,0)';
        context.beginPath();
        context.arc(75, 100, 50, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        context.fillStyle = 'rgb(255,0,255)';
        // canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // http://jsfiddle.net/NDYV8/19/
        context.arc(75, 75, 75, 0, Math.PI * 2, true);
        context.arc(75, 75, 25, 0, Math.PI * 2, true);
        context.fill('evenodd');
        return {
            winding,
            data: save(canvas)
        };
    }

    const n$1 = navigator;
    const w$1 = window;
    /**
     * This is a crude and primitive touch screen detection. It's not possible to currently reliably detect the availability
     * of a touch screen with a JS, without actually subscribing to a touch event.
     *
     * @see http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
     * @see https://github.com/Modernizr/Modernizr/issues/548
     */
    function getTouchSupport() {
        let maxTouchPoints = 0;
        let touchEvent;
        if (n$1.maxTouchPoints !== undefined) {
            maxTouchPoints = toInt(n$1.maxTouchPoints);
        }
        else if (n$1.msMaxTouchPoints !== undefined) {
            maxTouchPoints = n$1.msMaxTouchPoints;
        }
        try {
            document.createEvent('TouchEvent');
            touchEvent = true;
        }
        catch (_) {
            touchEvent = false;
        }
        const touchStart = 'ontouchstart' in w$1;
        return {
            maxTouchPoints,
            touchEvent,
            touchStart,
        };
    }

    function getOsCpu() {
        return navigator.oscpu;
    }

    /*
     * Functions to help with browser features
     */
    const w$2 = window;
    const n$2 = navigator;
    const d$1 = document;
    /**
     * Checks whether the browser is Internet Explorer or pre-Chromium Edge without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isIEOrOldEdge() {
        // The properties are checked to be in IE 10, IE 11 and Edge 18 and not to be in other browsers
        return countTruthy([
            'msWriteProfilerMark' in w$2,
            'msLaunchUri' in n$2,
            'msSaveBlob' in n$2,
        ]) >= 2;
    }
    /**
     * Checks whether the browser is based on Chromium without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isChromium() {
        // Based on research in September 2020
        return countTruthy([
            'userActivation' in n$2,
            'mediaSession' in n$2,
            n$2.vendor.indexOf('Google') === 0,
            'BackgroundFetchManager' in w$2,
            'BatteryManager' in w$2,
            'webkitMediaStream' in w$2,
            'webkitSpeechGrammar' in w$2,
        ]) >= 5;
    }
    /**
     * Checks whether the WebKit browser is a desktop Safari.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isDesktopSafari() {
        return 'safari' in w$2;
    }
    /**
     * Checks whether the browser is based on Gecko (Firefox engine) without using user-agent.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function isGecko() {
        var _a;
        // Based on research in September 2020
        return countTruthy([
            'buildID' in n$2,
            ((_a = d$1.documentElement) === null || _a === void 0 ? void 0 : _a.style) && 'MozAppearance' in d$1.documentElement.style,
            'MediaRecorderErrorEvent' in w$2,
            'mozInnerScreenX' in w$2,
            'CSSMozDocumentRule' in w$2,
            'CanvasCaptureMediaStream' in w$2,
        ]) >= 4;
    }
    /**
     * Checks whether the browser is based on Chromium version ≥86 without using user-agent.
     * It doesn't check that the browser is based on Chromium, there is a separate function for this.
     */
    function isChromium86OrNewer() {
        // Checked in Chrome 85 vs Chrome 86 both on desktop and Android
        return countTruthy([
            !('MediaSettingsRange' in w$2),
            !('PhotoCapabilities' in w$2),
            'RTCEncodedAudioFrame' in w$2,
            ('' + w$2.Intl) === '[object Intl]',
        ]) >= 2;
    }

    const n$3 = navigator;
    function getLanguages() {
        const result = [];
        const language = n$3.language || n$3.userLanguage || n$3.browserLanguage || n$3.systemLanguage;
        if (language !== undefined) {
            result.push([language]);
        }
        if (Array.isArray(n$3.languages)) {
            // Starting from Chromium 86, there is only a single value in `navigator.language` in Incognito mode:
            // the value of `navigator.language`. Therefore the value is ignored in this browser.
            if (!(isChromium() && isChromium86OrNewer())) {
                result.push(n$3.languages);
            }
        }
        else if (typeof n$3.languages === 'string') {
            const languages = n$3.languages;
            if (languages) {
                result.push(languages.split(','));
            }
        }
        return result;
    }

    function getColorDepth() {
        return window.screen.colorDepth;
    }

    function getDeviceMemory() {
        return navigator.deviceMemory;
    }

    const w$3 = window;
    function getScreenResolution() {
        // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
        // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
        const dimensions = [toInt(w$3.screen.width), toInt(w$3.screen.height)];
        dimensions.sort().reverse();
        return dimensions;
    }

    const w$4 = window;
    function getAvailableScreenResolution() {
        if (w$4.screen.availWidth && w$4.screen.availHeight) {
            // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
            // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
            const dimensions = [toInt(w$4.screen.availWidth), toInt(w$4.screen.availHeight)];
            dimensions.sort().reverse();
            return dimensions;
        }
        return undefined;
    }

    function getHardwareConcurrency() {
        try {
            // sometimes hardware concurrency is a string
            const concurrency = toInt(navigator.hardwareConcurrency);
            return isNaN(concurrency) ? 1 : concurrency;
        }
        catch (e) {
            return 1;
        }
    }

    function getTimezoneOffset() {
        return new Date().getTimezoneOffset();
    }

    const w$5 = window;
    function getTimezone() {
        var _a;
        if ((_a = w$5.Intl) === null || _a === void 0 ? void 0 : _a.DateTimeFormat) {
            return new w$5.Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        return undefined;
    }

    function getSessionStorage() {
        try {
            return !!window.sessionStorage;
        }
        catch (error) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }

    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    function getLocalStorage() {
        try {
            return !!window.localStorage;
        }
        catch (e) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }

    function getIndexedDB() {
        // IE and Edge don't allow accessing indexedDB in private mode, therefore IE and Edge will have different
        // visitor identifier in normal and private modes.
        if (isIEOrOldEdge()) {
            return undefined;
        }
        try {
            return !!window.indexedDB;
        }
        catch (e) {
            /* SecurityError when referencing it means it exists */
            return true;
        }
    }

    function getOpenDatabase() {
        return !!window.openDatabase;
    }

    function getCpuClass() {
        return navigator.cpuClass;
    }

    function getPlatform() {
        return navigator.platform;
    }

    function getPluginsSupport() {
        return navigator.plugins !== undefined;
    }

    function getProductSub() {
        return navigator.productSub;
    }

    function getEmptyEvalLength() {
        return eval.toString().length;
    }

    function getErrorFF() {
        try {
            throw 'a';
        }
        catch (e) {
            try {
                e.toSource();
                return true;
            }
            catch (e2) {
                return false;
            }
        }
    }

    function getVendor() {
        return navigator.vendor;
    }

    function getChrome() {
        return window.chrome !== undefined;
    }

    const d$2 = document;
    /**
     * navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
     * cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past with
     * site-specific exceptions. Don't rely on it.
     *
     * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js Taken from here
     */
    function areCookiesEnabled() {
        // try..catch because some in situations `document.cookie` is exposed but throws a
        // SecurityError if you try to access it; e.g. documents created from data URIs
        // or in sandboxed iframes (depending on flags/context)
        try {
            // Create cookie
            d$2.cookie = 'cookietest=1';
            const result = d$2.cookie.indexOf('cookietest=') !== -1;
            // Delete cookie
            d$2.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            return result;
        }
        catch (e) {
            return false;
        }
    }

    /**
     * The list of entropy sources used to make visitor identifiers.
     *
     * This value isn't restricted by Semantic Versioning, i.e. it may be changed without bumping minor or major version of
     * this package.
     */
    const sources = {
        // Expected errors and default values must be handled inside the functions
        osCpu: getOsCpu,
        languages: getLanguages,
        colorDepth: getColorDepth,
        deviceMemory: getDeviceMemory,
        screenResolution: getScreenResolution,
        availableScreenResolution: getAvailableScreenResolution,
        hardwareConcurrency: getHardwareConcurrency,
        timezoneOffset: getTimezoneOffset,
        timezone: getTimezone,
        sessionStorage: getSessionStorage,
        localStorage: getLocalStorage,
        indexedDB: getIndexedDB,
        openDatabase: getOpenDatabase,
        cpuClass: getCpuClass,
        // Maybe it should be excluded: https://github.com/fingerprintjs/fingerprintjs/issues/514#issuecomment-688754892
        platform: getPlatform,
        plugins: getPlugins,
        canvas: getCanvasFingerprint,
        // adBlock: isAdblockUsed, // https://github.com/fingerprintjs/fingerprintjs/issues/405
        touchSupport: getTouchSupport,
        fonts: getFonts,
        audio: getAudioFingerprint,
        pluginsSupport: getPluginsSupport,
        productSub: getProductSub,
        emptyEvalLength: getEmptyEvalLength,
        errorFF: getErrorFF,
        vendor: getVendor,
        chrome: getChrome,
        cookiesEnabled: areCookiesEnabled,
    };
    /**
     * Gets a components list from the given list of entropy sources.
     *
     * Warning for package users:
     * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
     */
    function getComponents(sources, sourceOptions, excludeSources) {
        return __awaiter(this, void 0, void 0, function* () {
            let timestamp = Date.now();
            const components = {};
            for (const sourceKey of Object.keys(sources)) {
                if (!excludes(excludeSources, sourceKey)) {
                    continue;
                }
                let result;
                let nextTimestamp;
                try {
                    result = { value: yield sources[sourceKey](sourceOptions) };
                }
                catch (error) {
                    result = error && typeof error === 'object' && 'message' in error ? { error } : { error: { message: error } };
                }
                nextTimestamp = Date.now();
                components[sourceKey] = Object.assign(Object.assign({}, result), { duration: nextTimestamp - timestamp }); // TypeScript has beaten me here
                timestamp = nextTimestamp;
            }
            return components;
        });
    }
    /**
     * Collects entropy components from the built-in sources to make the visitor identifier.
     */
    function getBuiltinComponents() {
        return getComponents(sources, undefined, []);
    }

    function componentsToCanonicalString(components) {
        let result = '';
        for (const componentKey of Object.keys(components)) {
            const component = components[componentKey];
            const value = component.error ? 'error' : JSON.stringify(component.value);
            result += `${result ? '|' : ''}${componentKey.replace(/([:|\\])/g, '\\$1')}:${value}`;
        }
        return result;
    }
    function componentsToDebugString(components) {
        return JSON.stringify(components, (_key, value) => {
            var _a;
            if (value instanceof Error) {
                return Object.assign(Object.assign({}, value), { message: value.message, stack: (_a = value.stack) === null || _a === void 0 ? void 0 : _a.split('\n') });
            }
            return value;
        }, 2);
    }
    function hashComponents(components) {
        return x64hash128(componentsToCanonicalString(components));
    }
    /**
     * Makes a GetResult implementation that calculates the visitor id hash on demand.
     * Designed for optimisation.
     */
    function makeLazyGetResult(components) {
        let visitorIdCache;
        // A plain class isn't used because its getters and setters aren't enumerable.
        return {
            components,
            get visitorId() {
                if (visitorIdCache === undefined) {
                    visitorIdCache = hashComponents(this.components);
                }
                return visitorIdCache;
            },
            set visitorId(visitorId) {
                visitorIdCache = visitorId;
            },
        };
    }
    /**
     * The class isn't exported from the index file to not expose the constructor.
     * The hiding gives more freedom for future non-breaking updates.
     */
    class OpenAgent {
        /**
         * @inheritDoc
         */
        get(options = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                const components = yield getBuiltinComponents();
                const result = makeLazyGetResult(components);
                if (options.debug) {
                    console.log(`Copy the text below to get the debug data:

\`\`\`
version: ${version}
getOptions: ${JSON.stringify(options, undefined, 2)}
visitorId: ${result.visitorId}
components: ${componentsToDebugString(components)}
\`\`\``);
                }
                return result;
            });
        }
    }
    /**
     * Builds an instance of Agent and waits a delay required for a proper operation.
     */
    function load({ delayFallback = 50 } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // A delay is required to ensure consistent entropy components.
            // See https://github.com/fingerprintjs/fingerprintjs/issues/254
            // and https://github.com/fingerprintjs/fingerprintjs/issues/307
            yield requestIdleCallbackIfAvailable(delayFallback);
            return new OpenAgent();
        });
    }

    // The default export is a syntax sugar (`import * as FP from '...' → import FP from '...'`).
    // It should contain all the public exported values.
    var index = { load, hashComponents, componentsToDebugString };
    // The exports below are for private usage. They may change unexpectedly. Use them at your own risk.
    /** Not documented, out of Semantic Versioning, usage is at your own risk */
    const murmurX64Hash128 = x64hash128;

    exports.componentsToDebugString = componentsToDebugString;
    exports.default = index;
    exports.getComponents = getComponents;
    exports.hashComponents = hashComponents;
    exports.isChromium = isChromium;
    exports.isDesktopSafari = isDesktopSafari;
    exports.isGecko = isGecko;
    exports.isIEOrOldEdge = isIEOrOldEdge;
    exports.load = load;
    exports.murmurX64Hash128 = murmurX64Hash128;

    return exports;

}({}));
