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
    ui: { MathInput }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<div/>';
const ROLE = 'mathinput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

var TOOLBAR = '<div id="toolbar"></div>';
var MATHINPUT1 = '<div id="mathinput1"></div>';
var MATHINPUT2 = '<div id="mathinput2" data-role="mathinput"></div>';

describe('widgets.mathinput', function () {

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
            expect($.fn.kendoMathInput).to.be.a(CONSTANTS.FUNCTION);
            expect($.fn.kendoMathInputToolBar).to.be.a(CONSTANTS.FUNCTION);
        });

    });

    describe('Initialization', function () {

        it('from code', function () {
            var element = $(MATHINPUT1).appendTo(FIXTURES);
            var mathInput = element.kendoMathInput().data('kendoMathInput');
            expect(mathInput).to.be.an.instanceof(MathInput);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-mathinput');
            // TODO expect(mathInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
        });

        it('from code with options', function () {
            var toolbar = $(TOOLBAR).appendTo(FIXTURES);
            var element = $(MATHINPUT1).appendTo(FIXTURES);
            var options = {};
            var mathInput = element.kendoMathInput(options).data('kendoMathInput');
            expect(mathInput).to.be.an.instanceof(MathInput);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-mathinput');
        });

        it('from markup', function () {
            var element = $(MATHINPUT2).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            var mathInput = element.data('kendoMathInput');
            expect(mathInput).to.be.an.instanceof(MathInput);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-mathinput');
        });

        xit('from markup with attributes', function () {
            // TODO: AssetManager might be a bit complex to initialize with attributes...
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
        var mathInput;
        var options = {};

        beforeEach(function () {
            element = $(MATHINPUT1).appendTo(FIXTURES);
            mathInput = element.kendoMathInput(options).data('kendoMathInput');
        });

        xit('value', function (done) {
            expect(mathInput).to.be.an.instanceof(MathInput);
        });

        xit('setOptions', function () {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', function () {
            expect(mathInput).to.be.an.instanceof(MathInput);
            mathInput.destroy();
            expect(mathInput.element).to.be.empty;
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
        var mathInput;
        var options = {};
        var viewModel;
        var change;
        var destroy;

        beforeEach(function () {
            element = $(MATHINPUT1).appendTo(FIXTURES);
            mathInput = element.kendoMathInput(options).data('kendoMathInput');
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
        var mathInput;
        var options = {};
        var event;

        beforeEach(function () {
            element = $(MATHINPUT1).appendTo(FIXTURES);
            mathInput = element.kendoMathInput(options).data('kendoMathInput');
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
