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
    roleSelector,
    ui: { Connector }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<input>';
const ROLE = 'connector';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const ELEMENT_DIV =
    '<div class="kj-stage" style="position:relative;height:300px;width:300px;transform:scale(0.75);">' +
    '<div data-role="stage" style="height:300px;width:300px;">' +
    '<div class="kj-element" style="position:absolute;top:50px;left:50px;height:50px;width:50px;">' +
    '</div></div></div>';
const STAGE = `${FIXTURES} div${roleSelector('stage')}`;
var ELEMENT = `${STAGE}>div.kj-element`;
const CONNECTOR2 = '<div id="connector2" data-role="connector"></div>';

describe('widgets.connector', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoConnector).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        beforeEach(() => {
            $(FIXTURES).append(ELEMENT_DIV);
        });

        it('from code', () => {
            const element = $(ELEMENT).appendTo(ELEMENT);
            const connector = element.kendoConnector().data('kendoConnector');
            expect(connector).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(connector)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(connector.value()).to.be.null;
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(ELEMENT);
            const connector = element
                .kendoConnector({ color: '#000000' })
                .data('kendoConnector');
            expect(connector).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(connector)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            // expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            // expect(connector.dataSource.total()).to.equal(LIBRARY.length);
            // expect(connector.dataSource.data()).to.deep.equal(LIBRARY);
            expect(connector.value()).to.be.null;
        });

        it('from markup', () => {
            const element = $(CONNECTOR2).appendTo(ELEMENT);
            kendo.init(FIXTURES);
            const connector = element.data('kendoConnector');
            expect(connector).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(connector)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            // expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            // expect(connector.dataSource.total()).to.equal(0);
            expect(connector.value()).to.be.null;
        });

        it('from markup with data attributes', () => {
            const attr = {
                'data-color': '#000000'
            };
            const element = $(CONNECTOR2)
                .attr(attr)
                .appendTo(ELEMENT);
            kendo.init(FIXTURES);
            const connector = element.data('kendoConnector');
            expect(connector).to.be.an.instanceof(Connector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-connector');
            expect(connector)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            // expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            // expect(connector.dataSource.total()).to.equal(LIBRARY.length);
            // expect(connector.dataSource.data()).to.deep.equal(LIBRARY);
            expect(connector.value()).to.be.null;
        });
    });

    xdescribe('Methods', () => {
        let element;
        let connector;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            connector = element
                .kendoConnector({
                    // TODO
                })
                .data('kendoConnector');
        });

        xit('value', () => {
            // TODO
        });

        xit('destroy', () => {
            // TODO
        });
    });

    xdescribe('MVVM (and UI interactions)', () => {
        let element;
        let connector;
        let change;
        const viewModel = kendo.observable({
            // TODO
        });

        beforeEach(() => {
            element = $(CONNECTOR2)
                .attr({
                    // 'data-bind': 'source: library, value: code',
                    // 'data-default': NAME
                })
                .appendTo(FIXTURES);
            kendo.bind(FIXTURES, viewModel);
            connector = element.data('kendoConnector');
            change = sinon.spy();
            // viewModel.bind(CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(connector).to.be.an.instanceof(Connector);
            // expect(connector.value()).to.equal(JS_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(connector.value());
            // Change the widget value
            // connector.value(JS_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            // expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(connector.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(connector).to.be.an.instanceof(Connector);
            // expect(connector.value()).to.equal(JS_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(connector.value());
            // Change in the view Model
            // viewModel.set('code', JS_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            // expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(connector.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(connector).to.be.an.instanceof(Connector);
            const clickable = element
                .find(kendo.roleSelector('dropdownlist'))
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
            // expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(connector.value());
        });

        afterEach(() => {
            // viewModel.unbind(CHANGE);
            viewModel.set('code', ''); // undefined would not work
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
    });

    xdescribe('Events', () => {
        let element;
        let connector;
        let change;
        const DUMMY = 'dummy';
        // var EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(FIXTURES);
            connector = element
                .kendoConnector({
                    // dataSource: LIBRARY,
                    // value: NAME,
                    // default: NAME,
                    // solution: SOLUTION
                })
                .data('kendoConnector');
        });

        it('Change event', () => {
            expect(connector).to.be.an.instanceof(Connector);
            // connector.bind(CHANGE, function (e) {
            //     change(e.value);
            // });
            // connector.value(JS_COMMENT + EQ_NAME);
            // expect(change).to.have.been.calledWith(JS_COMMENT + EQ_NAME);
            connector.value(FORMULA2);
            expect(change).to.have.been.calledWith(FORMULA2);
            connector.value(DUMMY);
            // expect(change).to.have.been.calledWith(JS_COMMENT + NAME);
        });
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
