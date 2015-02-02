/**
 * Copyright (c) 2013-2014 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba/Kidoju-Platform
 */

/* jslint node: true, expr: true */
/* jshint node: true, expr: true */
/* global before, describe, it */

//http://redotheweb.com/2013/01/15/functional-testing-for-nodejs-using-mocha-and-zombie-js.html

'use strict';

var Browser = require('zombie');
var expect = require('chai').expect;

describe('Test kidoju.widgets.toolbox.js', function() {

    before(function(done) {
        console.log('require');
        require('../../nodejs/http.server.js');
        console.log('browser');
        this.browser = new Browser();
        console.log('visit');
        this.browser.visit('http://localhost:8080/src/kidoju.widgets.toolbox.html', done);
    });

    describe('When page is loaded', function() {
        it('It should have toolbox1 and toolbox2', function() {
            expect(this.browser.query('#toolbox1')).to.be.ok;
            //assert.lengthOf(browser.body.queryAll(".hand"), 2);
        });
    });

    //after(function(done) {
        //this.server.close(done);
    //});

});




