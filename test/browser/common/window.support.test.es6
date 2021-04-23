/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import support from '../../../src/js/common/window.support.es6';

const { describe, it, Modernizr } = window;
const { expect } = chai;

describe('window.support', () => {
    it('It should load Modernizr', () => {
        expect(Modernizr).not.to.be.undefined;
        expect(support).to.eql(Modernizr);
        /*
        expect(support.atobbtoa).to.be.true;
        expect(!!support.audio).to.be.true;
        expect(support.blobconstructor).to.be.true;
        expect(support.bloburls).to.be.true;
        expect(support.canvas).to.be.true;
        expect(support.canvastext).to.be.true;
        expect(support.csstransforms).to.be.true;
        expect(support.filereader).to.be.true;
        expect(support.filesystem).to.be.true;
        expect(support.flexbox).to.be.true;
        expect(support.getusermedia).to.be.true;
        expect(support.hashchange).to.be.true;
        expect(support.history).to.be.true;
        expect(support.inlinesvg).to.be.true;
        expect(support.localstorage).to.be.true;
        expect(support.sessionstorage).to.be.true;
        expect(support.speechrecognition).to.be.true;
        expect(support.speechsynthesis).to.be.true;
        expect(support.svg).to.be.true;
        expect(support.svgasimg).to.be.true;
        expect(support.touchevents).to.be.true;
        expect(!!support.video).to.be.true;
        expect(support.webworkers).to.be.true;
        expect(support.xhr2).to.be.true;
         */
    });
});
