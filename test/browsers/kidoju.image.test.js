/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

/* This function has too many statements. */
/* jshint -W071 */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kidoju = window.kidoju;
    var FIXTURES = '#fixtures';

    /*********************************************************************************
     * TODO
     *********************************************************************************/

    describe('Image Utilities', function () {

        xit('We expect to inflate/compress data', function () {
            // TODO

        });

    });

    describe('JPEG Encoding', function () {

        var fixtures = $(FIXTURES);

        it('We expect to encode canvas drawings as JPEG', function () {
            fixtures.append('<canvas id="" height="200px" width="200px"></canvas>');
            var c = fixtures.children('canvas').get(0);
            var ctx = c.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 50, 50);
            var imgData = ctx.getImageData(0,0,c.width,c.height);
            var jpeg = kidoju.image.jpegEncode(imgData, 5);
            var img = $('<img/>');
            img.attr({
                src: jpeg,
                height: c.height,
                width: c.width
            });
            fixtures.append(img);
        });

        it('We expect to encode an image as JPEG', function (done) {
            $('<img/>')
                .on('load', function (e) {
                    var imgData = kidoju.image.getImageData(e.target);
                    var jpeg = kidoju.image.jpegEncode(imgData, 50);
                    var img = $('<img/>');
                    img.attr({
                        src: jpeg,
                        height: imgData.height,
                        width: imgData.width
                    });
                    fixtures.append(img);
                    done();
                })
                .attr('src', '../data/images/miscellaneous/rainbow.png')
                // .attr('src', '../data/images/miscellaneous/Elvis.jpg')
                .appendTo(fixtures);
        });

        afterEach(function () {
            fixtures.empty();
        });

    });

    describe('PNG Encoding', function () {

        var fixtures = $(FIXTURES);

        it('We expect to encode canvas drawings as PNG', function () {
            fixtures.append('<canvas id="" height="200px" width="200px"></canvas>');
            var c = fixtures.children('canvas').get(0);
            var ctx = c.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 50, 50);
            var imgData = ctx.getImageData(0,0,c.width,c.height);
            var png = kidoju.image.pngEncode(imgData);
            var img = $('<img/>');
            img.attr({
                src: png,
                height: c.height,
                width: c.width
            });
            fixtures.append(img);

        });

        it('We expect to encode an image as PNG', function (done) {
            $('<img/>')
            .on('load', function (e) {
                var imgData = kidoju.image.getImageData(e.target);
                var png = kidoju.image.pngEncode(imgData);
                var img = $('<img/>');
                img.attr({
                    src: png,
                    height: imgData.height,
                    width: imgData.width
                });
                fixtures.append(img);
                done();
            })
            .attr('src', '../data/images/miscellaneous/rainbow.png')
            // .attr('src', '../data/images/miscellaneous/Elvis.jpg')
                .appendTo(fixtures);
        });

        afterEach(function () {
            fixtures.empty();
        });

    });

}(this, jQuery));

/* jshint +W071 */
