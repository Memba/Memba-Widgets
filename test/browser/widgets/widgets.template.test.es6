/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
import '../../../src/js/widgets/widgets.template.es6';
import fixKendoRoles from '../_misc/test.roles.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui,
    ui: { Template }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'template';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const SCRIPT1 =
    '<script id="script1" type="text/x-kendo-template"><div style="color: red;">#: data #</div></script>';
const SCRIPT2 =
    '<script id="script2" type="text/x-kendo-template"><div style="color: blue;">#: data.name #</div></script>';

describe('widgets.template', () => {
    before(() => {
        if (window.__karma__) {
            if ($(`#${FIXTURES}`).length === 0) {
                $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
            }
            fixKendoRoles();
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn.kendoTemplate).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoTemplate().data('kendoTemplate');
            expect(widget).to.be.an.instanceof(Template);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-template');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from code with options', () => {
            $(SCRIPT1).appendTo(`#${FIXTURES}`);
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                template: 'script1',
                value: 'Todd'
            };
            const template = element
                .kendoTemplate(options)
                .data('kendoTemplate');
            expect(template).to.be.an.instanceof(Template);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-template');
            expect(template)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from code with options and dataSource', () => {
            $(SCRIPT2).appendTo(`#${FIXTURES}`);
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                template: 'script2',
                value: 2,
                valueField: 'id',
                dataSource: [
                    { id: 1, name: 'London' },
                    { id: 2, name: 'New York' },
                    { id: 3, name: 'Paris' }
                ]
            };
            const template = element
                .kendoTemplate(options)
                .data('kendoTemplate');
            expect(template).to.be.an.instanceof(Template);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-template');
            expect(template.element).to.be.an.instanceof($);
            expect(template.wrapper).to.be.an.instanceof($);
            expect(template.options.template).to.equal(options.template);
            expect(template.options.value).to.equal(options.value);
            expect(template.options.valueField).to.equal(options.valueField);
            expect(template)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(element.text()).to.include(
                template.dataSource.get(options.value).name
            );
        });

        it('from markup', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const template = element.data('kendoTemplate');
            expect(template).to.be.an.instanceof(Template);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-template');
            expect(template)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from markup with attributes', () => {
            $(SCRIPT1).appendTo(`#${FIXTURES}`);
            const attributes = {};
            attributes[attr('role')] = ROLE;
            attributes[attr('template')] = 'script1';
            attributes[attr('value')] = 'Todd';
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const template = element.data('kendoTemplate');
            expect(template).to.be.an.instanceof(Template);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-template');
            expect(template.element).to.be.an.instanceof($);
            expect(template.wrapper).to.be.an.instanceof($);
            expect(template.options.template).to.be.a('function');
            expect(template.options.value).to.equal(attributes['data-value']);
            expect(template)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(element.text()).to.include(attributes['data-value']);
        });
    });

    describe('Methods', () => {
        let element;
        let template;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            template = element.kendoTemplate(options).data('kendoTemplate');
        });

        xit('value', done => {
            expect(template).to.be.an.instanceof(Template);
            done();
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(template).to.be.an.instanceof(Template);
            template.destroy();
            expect(template.element).to.be.empty;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let template;
        const options = {};
        let viewModel;
        let change;
        let destroy;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            template = element.kendoTemplate(options).data('kendoTemplate');
            viewModel = observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', () => {});
    });

    describe('Events', () => {
        let element;
        let template;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            template = element.kendoTemplate(options).data('kendoTemplate');
            event = sinon.spy();
        });

        xit('TODO', () => {});
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
