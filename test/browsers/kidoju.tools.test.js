/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, expr: true */
/* jshint browser: true, expr: true */
/* global describe, it, before, expect, kidoju */

;(function (window, undefined) {

    'use strict';

    var expect = window.chai.expect;

    describe('kidoju.tools', function() {

        describe('Loading', function() {
            it('should find kidoju.tools', function() {
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject);
                expect(kidoju.tools).to.have.property('active');
                expect(kidoju.tools).to.respondTo('register');
            });
        });

    });

}(this));
