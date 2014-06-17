/**
 * Copyright (c) 2013-2014 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba/Kidoju-Platform
 */

/* jslint browser: true */
/* jshint browser: true */
/* global describe, it, before, expect, kidoju */

;(function () {

    'use strict';

    describe('kidoju.tools', function() {

        describe('Loading', function() {
            it('should find kidoju.tools', function() {
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject);
                expect(kidoju.tools).to.have.property('active');
                expect(kidoju.tools).to.respondTo('register');
            });
        });

    });

}());