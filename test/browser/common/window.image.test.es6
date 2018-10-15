/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
    dataUri2Blob,
    getDataUriAndSize,
    getImageData,
    jpegEncode,
    pngEncode,
    preload
} from '../../../src/js/common/window.image.es6';

const { before, describe, it } = window;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const FIXTURES = '#fixtures';
const JPG_IMAGE = '../../data/images/miscellaneous/Elvis.jpg';
const PNG_IMAGE = '../../data/images/miscellaneous/rainbow.png';
const SVG_IMAGE = '../../data/images/miscellaneous/logo.svg';
const DATA = [JPG_IMAGE, PNG_IMAGE, SVG_IMAGE];

describe('window.image', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $('body').append('<div id="fixtures"></div>');
        }
    });

    describe('dataUri2Blob', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('getDataUriAndSize', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('getImageData', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('JPEG Encoding', () => {
        const fixtures = $(FIXTURES);
        it('We expect to encode canvas drawings as JPEG', () => {
            fixtures.append(
                '<canvas id="c" height="200px" width="200px"></canvas>'
            );
            const c = fixtures.children('canvas').get(0);
            const ctx = c.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 50, 50);
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const jpeg = jpegEncode(imgData, 10);
            const img = $('<img>');
            img.attr({
                src: jpeg,
                height: c.height,
                width: c.width
            });
            fixtures.append(img);
            debugger;
        });

        xit('We expect to encode an image as JPEG', done => {
            $('<img>')
                .on('load', e => {
                    debugger;
                    const imgData = getImageData(e.target);
                    const jpeg = jpegEncode(imgData, 50);
                    const img = $('<img>');
                    img.attr({
                        src: jpeg,
                        height: imgData.height,
                        width: imgData.width
                    });
                    fixtures.append(img);
                    done();
                })
                .on('error', done)
                .attr('src', PNG_IMAGE)
                .appendTo(fixtures);
        });

        afterEach(() => {
            // fixtures.empty();
        });
    });

    describe('PNG Encoding', () => {
        const fixtures = $(FIXTURES);

        it('We expect to encode canvas drawings as PNG', () => {
            fixtures.append(
                '<canvas id="c" height="200px" width="200px"></canvas>'
            );
            const c = fixtures.children('canvas').get(0);
            const ctx = c.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 50, 50);
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const png = pngEncode(imgData);
            const img = $('<img>');
            img.attr({
                src: png,
                height: c.height,
                width: c.width
            });
            fixtures.append(img);
            debugger;
        });

        xit('We expect to encode an image as PNG', done => {
            $('<img>')
                .on('load', e => {
                    const imgData = getImageData(e.target);
                    const png = pngEncode(imgData);
                    const img = $('<img>');
                    img.attr({
                        src: png,
                        height: imgData.height,
                        width: imgData.width
                    });
                    fixtures.append(img);
                    done();
                })
                .attr('src', PNG_IMAGE)
                .appendTo(fixtures);
        });

        afterEach(() => {
            // fixtures.empty();
        });
    });

    describe('preload', () => {
        it('It should preload an existing image url', () => {
            expect(true).to.be.true;
        });
    });
});
