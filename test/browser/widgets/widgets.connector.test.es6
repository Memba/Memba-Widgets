/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getStageElement, options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.connector.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    bind,
    // data: { DataSource },
    destroy,
    init,
    observable,
    roleSelector,
    ui: { Connector, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'connector';
const WIDGET = 'kendoConnector';
const STAGE_ELEMENT = 'div.kj-element';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.connector', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    beforeEach(() => {
        $(`#${FIXTURES}`).append(getStageElement());
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn[WIDGET]).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(STAGE_ELEMENT);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.value()).to.be.empty;
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(STAGE_ELEMENT);
            const options = { color: '#000000' };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            // expect(widget).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            // expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            // expect(widget.dataSource.data()).to.deep.equal(LIBRARY);
            expect(widget.value()).to.be.empty;
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE,
            });
            const element = $(ELEMENT).attr(attributes).appendTo(STAGE_ELEMENT);
            // We should not init FIXTURES, because this inits a new stage and the element is removed
            // init(`#${FIXTURES}`);
            init(STAGE_ELEMENT);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            // expect(widget).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            // expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.empty;
        });

        it('from markup with data attributes', () => {
            const attributes = options2attributes({
                color: '#000000',
                role: ROLE,
            });
            const element = $(ELEMENT).attr(attributes).appendTo(STAGE_ELEMENT);
            // We should not init FIXTURES, because this inits a new stage and the element is removed
            // init(`#${FIXTURES}`);
            init(STAGE_ELEMENT);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            // expect(widget).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            // expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            // expect(widget.dataSource.data()).to.deep.equal(LIBRARY);
            expect(widget.value()).to.be.empty;
        });
    });

    xdescribe('Methods', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(STAGE_ELEMENT);
            widget = element[WIDGET]({
                // TODO
            }).data(WIDGET);
        });

        xit('value', () => {
            $.noop(widget);
        });

        xit('destroy', () => {
            // TODO
        });
    });

    xdescribe('MVVM (and UI interactions)', () => {
        const attributes = options2attributes({
            // bind: 'source: library, value: code',
            // default: NAME
            role: ROLE,
        });
        let element;
        let widget;
        let change;
        const viewModel = observable({
            // TODO
        });

        beforeEach(() => {
            element = $(ELEMENT).attr(attributes).appendTo(STAGE_ELEMENT);
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            change = sinon.spy();
            // viewModel.bind(CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(Connector);
            // expect(widget.value()).to.equal(JS_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change the widget value
            // widget.value(JS_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            // expect(widget.value()).to.equal(JS_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(Connector);
            // expect(widget.value()).to.equal(JS_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change in the view Model
            // viewModel.set('code', JS_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            // expect(widget.value()).to.equal(JS_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(Connector);
            const clickable = element
                .find(roleSelector('dropdownlist'))
                .parent();
            expect(clickable).to.match('span');
            // clickable.simulate(CLICK);
            // a first click expands the list
            const list = $('div.k-list-container ul.k-list');
            expect(list).to.exist;
            // var item = list.find('li:contains("' + EQ_NAME + '")');
            // expect(item).to.exist;
            // item.simulate(CLICK);
            // a second click closes the list and sets a new value
            expect(change).to.have.been.calledOnce;
            // expect(widget.value()).to.equal(JS_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        afterEach(() => {
            // viewModel.unbind(CHANGE);
            viewModel.set('code', ''); // undefined would not work
        });
    });

    xdescribe('Events', () => {
        let element;
        let widget;
        let change;
        const DUMMY = 'dummy';
        // var EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(STAGE_ELEMENT);
            widget = element[WIDGET]({
                // dataSource: LIBRARY,
                // value: NAME,
                // default: NAME,
                // solution: SOLUTION
            }).data(WIDGET);
        });

        it('Change event', () => {
            expect(widget).to.be.an.instanceof(Connector);
            // widget.bind(CHANGE, function (e) {
            //     change(e.value);
            // });
            // widget.value(JS_COMMENT + EQ_NAME);
            // expect(change).to.have.been.calledWith(JS_COMMENT + EQ_NAME);
            widget.value(FORMULA2);
            expect(change).to.have.been.calledWith(FORMULA2);
            widget.value(DUMMY);
            // expect(change).to.have.been.calledWith(JS_COMMENT + NAME);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
