/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.buttonset.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { MarkEditor }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<input>';
const ROLE = 'buttonset';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

var MARKEDITOR1 = '<div id="markeditor1"></div>';
var MARKEDITOR2 = '<div id="markeditor2" data-role="markeditor"></div>';

describe('widgets.markeditor', function () {

    before(function () {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', function () {

        it('requirements', function () {
            expect($).not.to.be.undefined;
            expect(kendo).not.to.be.undefined;
            expect(kendo.version).to.be.a('string');
            expect($.fn.kendoMarkEditor).to.be.a(CONSTANTS.FUNCTION);
        });

    });

    describe('Initialization', function () {

        it('from code', function () {
            var element = $(MARKEDITOR1).appendTo(FIXTURES);
            var markEditor = element.kendoMarkEditor().data('kendoMarkEditor');
            expect(markEditor).to.be.an.instanceof(MarkEditor);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-markeditor');
        });

        it('from code with options', function () {
            var element = $(MARKEDITOR1).appendTo(FIXTURES);
            var options = {

            };
            var markEditor = element.kendoMarkEditor().data('kendoMarkEditor');
            expect(markEditor).to.be.an.instanceof(MarkEditor);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-markeditor');
        });

        it('from markup', function () {
            var element = $(MARKEDITOR2).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            var markEditor = element.data('kendoMarkEditor');
            expect(markEditor).to.be.an.instanceof(MarkEditor);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-markeditor');
        });

        xit('from markup with attributes', function () {

        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('Methods', function () {

        var element;
        var markEditor;
        var options = {};

        beforeEach(function () {
            element = $(MARKEDITOR1).appendTo(FIXTURES);
            markEditor = element.kendoMarkEditor(options).data('kendoMarkEditor');
        });

        xit('value', function (done) {
            expect(markEditor).to.be.an.instanceof(MarkEditor);
        });

        xit('setOptions', function () {

        });

        xit('destroy', function () {
            expect(markEditor).to.be.an.instanceof(MarkEditor);
            markEditor.destroy();
            expect(markEditor.element).to.be.empty;
        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('MVVM (and UI interactions)', function () {

        var element;
        var markEditor;
        var options = {};
        var viewModel;
        var change;
        var destroy;

        beforeEach(function () {
            element = $(MARKEDITOR1).appendTo(FIXTURES);
            markEditor = element.kendoMarkEditor(options).data('kendoMarkEditor');
            viewModel = kendo.observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', function () {

        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('Events', function () {

        var element;
        var markEditor;
        var options = {};
        var event;

        beforeEach(function () {
            element = $(MARKEDITOR1).appendTo(FIXTURES);
            markEditor = element.kendoMarkEditor(options).data('kendoMarkEditor');
            event = sinon.spy();
        });

        xit('TODO', function () {

        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });
});
