/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint node: true, mocha: true, expr: true */

//http://redotheweb.com/2013/01/15/functional-testing-for-nodejs-using-mocha-and-zombie-js.html

'use strict';

var Browser = require('zombie'),
    expect = require('chai').expect;

var httpServer, browser;

describe('kidoju.integration.playmode.test.js', function() {

    before(function(done) {
        console.log('Start http server');
        httpServer = require('../../nodejs/http.server.js');
        console.log('Initialize browser');
        browser = new Browser();
        console.log('Visit url');
        browser.visit('http://localhost:8080/src/kidoju.integration.playmode.html', done);
    });

    describe('When page is loaded', function() {
        it('It should have a stage and a playbar', function() {
            expect(browser.query('[data-role="stage"]')).to.be.ok;
            expect(browser.query('[data-role="playbar"]')).to.be.ok;
        });
    });

    after(function(done) {
        browser.close();
        //httpServer.close(done);
        done();
    });

});




