/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Page from '../../../src/js/data/models.page.es6';
// import BaseModel from '../../../src/js/data/models.base.es6';
// import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

const { describe, it, kendo, xit } = window;
const { DataSource } = kendo.data;
const { expect } = chai;
chai.use(sinonChai);

describe('models.page', () => {
    describe('Page', () => {
        it('TODO', () => {
            expect(true).to.be.false;
        });
    });
});

/*********************************************************************************************************
 * Page
 *********************************************************************************************************/

describe('Test Page', function () {

    describe('When initializing a Page', function (done) {

        it('if initialized from an undefined, it should pass', function (done) {
            // Unfortunately, this is a Kendo UI requirement
            var page = new Page();
            expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
            expect(page).to.have.property('id').that.is.null;
            expect(page).to.have.property('style', '');
            expect(page.components).to.respondTo('fetch');
            page.components.fetch().then(function () {
                expect(page.components.total()).to.equal(0);
                done();
            });
        });

        it('if initialized from an object without components, it should pass', function (done) {
            var page = new Page({ dummy: true });
            expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
            expect(page).to.have.property('id').that.is.null;
            expect(page).to.have.property('style', '');
            expect(page.dummy).to.be.undefined;
            expect(page.components).to.respondTo('fetch');
            page.components.fetch().then(function () {
                expect(page.components.total()).to.equal(0);
                done();
            });
        });

        it('if initialized from an object with components, it should pass', function (done) {
            var page = new Page({ components: [{ tool: 'label' }, { tool: 'image' }] });
            expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
            expect(page).to.have.property('id').that.is.null;
            expect(page).to.have.property('style', '');
            expect(page.components).to.respondTo('fetch');
            page.components.fetch().then(function () {
                expect(page.components.total()).to.equal(2);
                for (var i = 0; i < page.components.total(); i++) {
                    var component = page.components.at(i);
                    expect(component).to.have.property('attributes').that.is.an.instanceof(Model);
                    expect(component).to.have.property('height', -1);
                    expect(component).to.have.property('id').that.is.null;
                    expect(component).to.have.property('left', 0);
                    expect(component).to.have.property('properties').that.is.an.instanceof(Model);
                    expect(component).to.have.property('rotate', 0);
                    expect(component).to.have.property('tag').that.is.null;
                    expect(component).to.have.property('tool').that.is.a('string'); // label or image
                    expect(component).to.have.property('top', 0);
                    expect(component).to.have.property('width', -1);
                }
                done();
            });
        });

        it('if cloned from an object with components, it should pass', function (done) {
            var page = new Page({ components: [{ tool: 'label' }, { tool: 'image' }] });
            expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
            expect(page).to.have.property('id').that.is.null;
            expect(page).to.have.property('style', '');
            expect(page.components).to.respondTo('fetch');
            page.components.fetch().then(function () {
                expect(page.components.total()).to.equal(2);
                var clone = page.clone();
                // TODO
                done();
            });
        });

    });
});
