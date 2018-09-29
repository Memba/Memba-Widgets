/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import {
    enumerateDevices,
    getUserMedia,
    createAudioMeter
} from '../../../src/js/common/window.media.es6';

const {
    AudioContext,
    describe,
    it,
    MediaDeviceInfo,
    MediaStream,
    ScriptProcessorNode
} = window;
const { expect } = chai;

describe('window.media', () => {
    describe('enumerateDevices', () => {
        it('It should enumerate devices', done => {
            enumerateDevices()
                .then(devices => {
                    try {
                        expect(devices)
                            .to.be.an('array')
                            .with.property('length')
                            .gt(0);
                        for (let i = 0, { length } = devices; i < length; i++) {
                            expect(devices[i]).to.be.an.instanceof(
                                MediaDeviceInfo
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });
    });

    describe('getUserMedia', () => {
        it('It should get user media', done => {
            getUserMedia()
                .then(stream => {
                    try {
                        expect(stream).to.be.an.instanceof(MediaStream);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });
    });

    describe('createAudioMeter', () => {
        it('It should create an audio meter', () => {
            const context = new AudioContext();
            const processor = createAudioMeter(context);
            expect(processor).to.be.an.instanceof(ScriptProcessorNode);
        });
    });
});
