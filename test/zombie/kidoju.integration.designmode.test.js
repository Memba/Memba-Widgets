/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint node: true, mocha: true, expr: true */

// http://redotheweb.com/2013/01/15/functional-testing-for-nodejs-using-mocha-and-zombie-js.html

'use strict';

var httpServer = require('../../nodejs/http.server.js');
var Zombie = require('zombie');
var browser = new Zombie({ site: 'http://localhost:8080', waitDuration: '10s' });
// var browser = new Zombie({ site: 'http://poc.kidoju.com'/*, waitDuration: '10s'*/ });

describe('kidoju.integration.designmode.test.js', function () {

    before(function (done) {
        // Increase max listeners in case of timeout
        browser.setMaxListeners(30);
        browser.visit('/src/kidoju.integration.designmode.html', function (a, b) {
            done();
        });
    });

    describe('When page is loaded', function () {
        it('It should have navigation and stages', function () {
            console.log('ok');
            browser.assert.success();
            // browser.assert.url(webapp.index);
            // browser.assert.attribute('html', 'lang', 'en');
            // browser.assert.element('div.uk.flag');
            // browser.assert.text('div.page-header span', 'Support');
        });
    });

    after(function () {
        browser.destroy();
    });

});




