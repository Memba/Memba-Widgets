/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSC from 'jscheck';
import { base, tryCatch } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
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
const FIXTURES = '#fixtures';

// --------------
// urls
// --------------
const JPG_URL = `${base}/test/data/images/miscellaneous/Elvis.jpg`;
const PNG_URL = `${base}/test/data/images/miscellaneous/rainbow.png`;
const SVG_URL = `${base}/test/data/images/miscellaneous/logo.svg`;
const UNRESOLVED_URL = [
    `${base}/test/data/z.bin`, // 404
    'https://xxx.yz.com/favicon.jpg' // unresolved dns
];

// --------------
// dataUris
// ---------------
const TEXT_DATAURI = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
const PNG_DATAURI =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABAlBMVEX////VqgDpxjjty0L/43PxwQH1xw77zhz/1CjsvQH5zybzxhL/1jTuvwHvwATzxQ71yBX4zR370CP/1S7/1S/wwAP0xQ37zyH/1CzsvQHuwAbxww32yhz70Sr+1TH/1jTtvwfwww770i3+1jVKSkpVUkVVU0tVVE13azd3cFSDczONei6OhFmZjVmkiyWliyWll1+wkyHetA7ex2vovAnpwBvp0G7tvwruvwTuwQzwwxH0xAP0xAX0xxT2yhj4xwP5yhD5ziL6yQj6zBP71Tv81DH9zQ/91TT+ywH+zAj/zAD/zAP/zQP/0BT/0iD/1jL/1zn/2Dr/2kj/3Vb/4mz/43OnfdmgAAAAJHRSTlMACAgICC0tLi40NDU1r6+vr6+vr6+6urq64+Pj4+Pj4+Tk5ORT5kSuAAAAu0lEQVQYV02PxRbCUAxEg7u720OKu7szWKHw/79CX0/hcDeTm2wyRDJmX/KwS3hNpOK/Xy/Aeb/yKKpP3aCyiWv5/efA0k1kv+OPmY3CV9RZnQuPdZByFzDGHvKCxzFDB6DBmm+oMaKdPIpvEWoMKHsGpl3u3SlwTFNoD5RZpdWq5MvAIkDWFVBiCsITQwuRZ4N2gXuxI00c8qe6+BK9miBU+695RKO0cc/WJ1GStmPHt67RFRsNok4Dnz975S/7pV7KJgAAAABJRU5ErkJggg==';
const JPG_DATAURI =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFBv/EACIQAAEEAQUBAAMAAAAAAAAAAAECAwQFEQAGEiExExQiQf/EABUBAQEAAAAAAAAAAAAAAAAAAAUH/8QAHxEAAQMDBQAAAAAAAAAAAAAAAQQRIQADEjFBQlFh/9oADAMBAAIRAxEAPwDSqgWMejuLOseZuN7PHDsh5aVfN4kZaTk4QhCVdI68GfdCa613DLsjaRUV82rkNmnsWQQ5ySkErzntBV0U+EEj0Z1Glq3FtXdclf4kQ2coJE2DIfEdqaUDimVFdV+uSnAUg9g+j+6XkWW5dyborYjMaNHlsq+kasiTBIP1xgSJLiBxQy3nlx9UesHOp2Ua4qTIzM5cgYgB9IYQzGmhcs4edbV//9k=';
const SVG_DATAURI =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';
const INVALID_DATAURIS = [
    JSC.boolean()(),
    JSC.number()(),
    JSC.object()(),
    JSC.string()(),
    'data:,Hello%2C%20World!',
    'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E',
    'data:text/html,<script>alert("hi");</script>'
];

describe('window.image', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('dataUri2Blob', () => {
        it('It should convert base64 encoded data uris', () => {
            function test(dataUri) {
                expect(dataUri2Blob(dataUri)).to.be.an.instanceof(window.Blob);
            }
            [TEXT_DATAURI, JPG_DATAURI, PNG_DATAURI, SVG_DATAURI].forEach(test);
        });

        it('it should throw on non-base64 data uris', () => {
            function test(dataUri) {
                const fn = () => dataUri2Blob(dataUri);
                expect(fn).to.throw(
                    $.type(dataUri) === CONSTANTS.STRING
                        ? window.DOMException
                        : TypeError
                );
            }
            INVALID_DATAURIS.forEach(test);
        });
    });

    describe('getDataUriAndSize', () => {
        it('it should get size from valid data uris', done => {
            function test(dataUri) {
                const dfd = $.Deferred();
                getDataUriAndSize(dataUri)
                    .then(
                        tryCatch(dfd)(resp => {
                            // Note dataUri is always converted to PNG
                            expect(resp)
                                .to.have.property('dataUri')
                                .that.match(/^data:image\/png;base64,/);
                            expect(resp)
                                .to.have.property('height')
                                .that.is.gte(16); // SVG_DATAURI is 1024
                            expect(resp)
                                .to.have.property('width')
                                .that.is.gte(16);
                        })
                    )
                    .catch(dfd.reject);
                return dfd.promise();
            }
            const promises = [JPG_DATAURI, PNG_DATAURI, SVG_DATAURI].map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('it should get size from valid urls', done => {
            function test(dataUri) {
                const dfd = $.Deferred();
                getDataUriAndSize(dataUri)
                    .then(
                        tryCatch(dfd)(resp => {
                            // Note dataUri is always converted to PNG
                            expect(resp)
                                .to.have.property('dataUri')
                                .that.match(/^data:image\/png;base64,/);
                            expect(resp)
                                .to.have.property('height')
                                .that.is.gte(16); // SVG_DATAURI is 1024
                            expect(resp)
                                .to.have.property('width')
                                .that.is.gte(16);
                        })
                    )
                    .catch(dfd.reject);
                return dfd.promise();
            }
            const promises = [JPG_URL, PNG_URL, SVG_URL].map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });

    describe('getImageData', () => {
        it('it should get image data for valid urls', done => {
            function test(url) {
                const dfd = $.Deferred();
                getImageData(url)
                    .then(
                        tryCatch(dfd)(imgData => {
                            expect(imgData).to.be.an.instanceof(
                                window.ImageData
                            );
                            expect(imgData)
                                .to.have.property('height')
                                .that.is.gt(0);
                            expect(imgData)
                                .to.have.property('width')
                                .that.is.gt(0);
                        })
                    )
                    .catch(dfd.reject);
                return dfd;
            }
            const promises = [JPG_URL, PNG_URL, SVG_URL].map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('it should reject invalid urls', done => {
            function test(url) {
                const dfd = $.Deferred();
                getImageData(url)
                    .then(() => {
                        dfd.reject(new Error(`\`${url}\` should be invalid`));
                    })
                    .catch(
                        tryCatch(dfd)(err => {
                            expect(err).to.be.an.instanceof(Error);
                            expect(err.event)
                                .be.an.instanceof($.Event)
                                .with.property('type', 'error');
                            expect(err.image).to.equal(url);
                        })
                    );
                return dfd;
            }
            const promises = UNRESOLVED_URL.map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });

    describe('JPEG Encoding', () => {
        // This does not work in Karma
        // const fixtured = $(FIXTURES);

        it('We expect to encode canvas drawings as JPEG', () => {
            const fixtures = $(FIXTURES);
            const canvas = $(
                '<canvas id="c" height="200px" width="200px"></canvas>'
            ).appendTo(fixtures);
            expect(canvas).to.exist;
            const c = canvas.get(0);
            const ctx = c.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 50, 50);
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const jpeg = jpegEncode(imgData, 10);
            const img = $(`<${CONSTANTS.IMG}>`);
            img.attr({
                src: jpeg,
                height: c.height,
                width: c.width
            });
            fixtures.append(img);
        });
    });

    describe('PNG Encoding', () => {
        it('We expect to encode canvas drawings as PNG', () => {
            const fixtures = $(FIXTURES);
            const canvas = $(
                '<canvas id="c" height="200px" width="200px"></canvas>'
            ).appendTo(fixtures);
            expect(canvas).to.exist;
            const c = canvas.get(0);
            const ctx = c.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 50, 50);
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const png = pngEncode(imgData);
            const img = $(`<${CONSTANTS.IMG}>`);
            img.attr({
                src: png,
                height: c.height,
                width: c.width
            });
            fixtures.append(img);
        });
    });

    describe('preload', () => {
        it('It should preload an existing image url', done => {
            function test(url) {
                const dfd = $.Deferred();
                preload(url)
                    .then(
                        tryCatch(dfd)(e => {
                            expect(e)
                                .to.be.an.instanceof($.Event)
                                .with.property('type', 'load');
                        })
                    )
                    .catch(dfd.reject);
                return dfd.promise();
            }
            const promises = [JPG_URL, PNG_URL, SVG_URL].map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('It should gracefully fail on unresolved image url', done => {
            function test(url) {
                const dfd = $.Deferred();
                preload(url)
                    .then(() => {
                        dfd.reject(new Error(`\`${url}\` should be invalid`));
                    })
                    .catch(
                        tryCatch(dfd)(err => {
                            expect(err).to.be.an.instanceof(Error);
                            expect(err.event)
                                .be.an.instanceof($.Event)
                                .with.property('type', 'error');
                            expect(err.image).to.equal(url);
                        })
                    );
                return dfd.promise();
            }
            const promises = UNRESOLVED_URL.map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });

    describe('Visual confirmation', () => {
        let container;

        before(() => {
            container = $(`<${CONSTANTS.DIV}/>`).appendTo(CONSTANTS.BODY);
            $(`<${CONSTANTS.H1}/>`)
                .text('Visuals')
                .appendTo(container);
        });

        it('We expect to resize and encode an image as JPEG', done => {
            $(`<${CONSTANTS.IMG}>`)
                .attr('crossOrigin', 'Anonymous')
                .on('load', e => {
                    getImageData(e.target.src, { height: 100, width: 100 })
                        .then(imgData => {
                            const jpeg = jpegEncode(imgData, 50);
                            $(`<${CONSTANTS.IMG}>`)
                                .attr({
                                    src: jpeg,
                                    height: imgData.height,
                                    width: imgData.width
                                })
                                .appendTo(container);
                            done();
                        })
                        .catch(done);
                })
                .on('error', done)
                .attr('src', PNG_URL)
                .appendTo(container);
        });

        it('We expect to resize and encode an image as PNG', done => {
            $(`<${CONSTANTS.IMG}>`)
                .attr('crossOrigin', 'Anonymous')
                .on('load', e => {
                    getImageData(e.target.src, { height: 100, width: 100 })
                        .then(imgData => {
                            const jpeg = pngEncode(imgData /* , options */);
                            $(`<${CONSTANTS.IMG}>`)
                                .attr({
                                    src: jpeg,
                                    height: imgData.height,
                                    width: imgData.width
                                })
                                .appendTo(container);
                            done();
                        })
                        .catch(done);
                })
                .on('error', done)
                .attr('src', PNG_URL)
                .appendTo(container);
        });
    });

    afterEach(() => {
        $(FIXTURES).empty();
    });
});
