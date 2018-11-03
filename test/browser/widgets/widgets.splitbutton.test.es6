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
import '../../../src/js/widgets/widgets.splitbutton.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { SplitButton }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<input>';
const ROLE = 'buttonset';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

var SPLITBUTTON2 = '<div data-role="splitbutton"></div>';

describe('widgets.splitbutton', function () {

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
            expect($.fn.kendoSplitButton).to.be.a(CONSTANTS.FUNCTION);
        });

    });

    describe('Initialization', function () {

        it('from code', function () {
            var element = $(ELEMENT).appendTo(FIXTURES);
            var splitButton = element.kendoSplitButton().data('kendoSplitButton');
            expect(splitButton).to.be.an.instanceof(SplitButton);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class('kj-splitbutton');
            expect(splitButton.wrapper).to.have.class('kj-splitbutton');
        });

        it('from code with options', function () {
            var element = $(ELEMENT).appendTo(FIXTURES);
            var options = {
                command: 'align',
                icon: 'align-justify',
                text: 'Align',
                menuButtons: [
                    { command: 'left', icon: 'align-left', text: 'Align Left' },
                    { command: 'center', icon: 'align-center', text: 'Align Center' },
                    { command: 'right', icon: 'align-right', text: 'Align Right' }
                ]
            };
            var splitButton = element.kendoSplitButton(options).data('kendoSplitButton');
            expect(splitButton).to.be.an.instanceof(SplitButton);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class('kj-splitbutton');
            expect(splitButton.wrapper).to.have.class('kj-splitbutton');
        });

        it('from markup', function () {
            var element = $(SPLITBUTTON2).appendTo(FIXTURES);
            init(FIXTURES);
            var splitButton = element.data('kendoSplitButton');
            expect(splitButton).to.be.an.instanceof(SplitButton);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class('kj-splitbutton');
            expect(splitButton.wrapper).to.have.class('kj-splitbutton');
        });

        xit('from markup with attributes', function () {
            // TODO
        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('Methods', function () {

        var element;
        var splitButton;
        var options = {};

        beforeEach(function () {
            element = $(ELEMENT).appendTo(FIXTURES);
            splitButton = element.kendoSplitButton(options).data('kendoSplitButton');
        });

        xit('value', function (done) {
            expect(splitButton).to.be.an.instanceof(SplitButton);
        });

        xit('setOptions', function () {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', function () {
            expect(splitButton).to.be.an.instanceof(SplitButton);
            splitButton.destroy();
            expect(splitButton.element).to.be.empty;
        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('MVVM (and UI interactions)', function () {

        var element;
        var splitButton;
        var options = {};
        var viewModel;
        var change;
        var destroy;

        beforeEach(function () {
            element = $(ELEMENT).appendTo(FIXTURES);
            splitButton = element.kendoSplitButton(options).data('kendoSplitButton');
            viewModel = observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', function () {

        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('Events', function () {

        var element;
        var splitButton;
        var options = {};
        var event;

        beforeEach(function () {
            element = $(ELEMENT).appendTo(FIXTURES);
            splitButton = element.kendoSplitButton(options).data('kendoSplitButton');
            event = sinon.spy();
        });

        xit('TODO', function () {

        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });
});
