/**
 * Copyright (c) 2013-2014 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba/Kidoju-Platform
 */

/* jslint browser: true, expr: true */
/* jshint browser: true, expr: true */
/* global describe, it, before */

;(function () {

    'use strict';

    var Browser = require('zombie');
    var expect = require('chai').expect;

    describe('Test kidoju.widgets.toolbox.js', function() {

        before(function(done) {
            require('../../nodejs/http.server.js');
            this.browser = new Browser();
            this.browser.visit('http://localhost:8080/src/kidoju.widgets.toolbox.html', done);
        });

        describe('When page is loaded', function() {
            it('It should have toolbox1 and toolbox2', function() {
                expect(this.browser.query("#toolbox1")).to.be.ok;
                //assert.lengthOf(browser.body.queryAll(".hand"), 2);
            });
        });

        //after(function(done) {
            //this.server.close(done);
        //});

    });

}());



