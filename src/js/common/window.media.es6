/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

const { navigator } = window;

/**
 * navigator.mediaDevices.enumerateDevices converted to jQuery promises
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
 * @see https://developers.google.com/web/updates/2015/10/media-devices
 * @see https://webrtc.github.io/samples/src/content/devices/input-output/
 */
export function enumerateDevices() {
    const dfd = $.Deferred();
    if (
        navigator.mediaDevices &&
        $.type(navigator.mediaDevices.enumerateDevices) === CONSTANTS.FUNCTION
    ) {
        navigator.mediaDevices
            .enumerateDevices()
            .then(dfd.resolve)
            .catch(dfd.reject);
    } else {
        dfd.resolve([]); // No device found
    }
    return dfd.promise();
}

/**
 * navigator.mediaDevices.getUserMedia converted to jQuery promises
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * @see https://webrtc.github.io/adapter/adapter-latest.js
 */
export function getUserMedia(constraints = { audio: true, video: true }) {
    assert.type(
        CONSTANTS.OBJECT,
        constraints,
        assert.format(
            assert.messages.type.default,
            constraints,
            CONSTANTS.OBJECT
        )
    );
    const dfd = $.Deferred();
    if (
        navigator.mediaDevices &&
        $.type(navigator.mediaDevices.getUserMedia) === CONSTANTS.FUNCTION
    ) {
        // That's for the most recent browsers
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(dfd.resolve)
            .catch(dfd.reject);
    } else {
        // With older browsers, get ahold of the legacy getUserMedia, if present
        const getOldUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        // If the browser is very old
        if ($.type(getOldUserMedia) === CONSTANTS.FUNCTION) {
            // Wrap the call to the old navigator.getUserMedia with a Promise
            getOldUserMedia(constraints, dfd.resolve, dfd.reject);
        } else {
            // Note: Consider falling back to flash - see https://github.com/addyosmani/getUserMedia.js
            return dfd.reject(
                new Error('`getUserMedia` is not implemented in this browser')
            );
        }
    }
    return dfd.promise();
}

/**
 * Create an audio volume meter to display in a progress bar
 * Source: https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
 * @see http://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
 * @param audioContext
 * @param clipLevel
 * @param averaging
 * @param clipLag
 * @returns {*}
 */
export function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    assert.instanceof(
        window.AudioContext || window.webkitAudioContext,
        audioContext,
        assert.format(
            assert.messages.instanceof.default,
            'audioContext',
            ' window.AudioContext || window.webkitAudioContext'
        )
    );

    const processor = audioContext.createScriptProcessor(512);
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = parseFloat(clipLevel) || 0.98;
    processor.averaging = parseFloat(averaging) || 0.95;
    processor.clipLag = parseInt(clipLag, 10) || 750;

    processor.onaudioprocess = function onaudioprocess(e) {
        const buf = e.inputBuffer.getChannelData(0);
        const bufLength = buf.length;
        let sum = 0;
        let x;
        // Do a root-mean-square on the samples: sum up the squares...
        for (let i = 0; i < bufLength; i++) {
            x = buf[i];
            if (Math.abs(x) >= this.clipLevel) {
                this.clipping = true;
                this.lastClip = window.performance.now();
            }
            sum += x * x;
        }
        // ... then take the square root of the sum.
        const rms = Math.sqrt(sum / bufLength);
        // Now smooth this out with the averaging factor applied
        // to the previous sample - take the max here because we
        // want "fast attack, slow release."
        this.volume = Math.max(rms, this.volume * this.averaging);
    };

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.checkClipping = function checkClipping() {
        if (!this.clipping) {
            return false;
        }
        if (this.lastClip + this.clipLag < window.performance.now()) {
            this.clipping = false;
        }
        return this.clipping;
    };

    processor.shutdown = function shutdown() {
        this.disconnect();
        this.onaudioprocess = null;
    };

    return processor;
}
