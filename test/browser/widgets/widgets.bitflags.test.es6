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
import '../../../src/js/widgets/widgets.bitflags.es6';
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
    ui: { BitFlags }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'bitflags';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.bitflags', () => {
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
            expect($.fn.kendoBitFlags).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoBitFlags().data('kendoBitFlags');
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-bitflags');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                bitflags: 'script1',
                value: 'Todd'
            };
            const widget = element.kendoBitFlags(options).data('kendoBitFlags');
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-bitflags');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from code with options and dataSource', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                bitflags: 'script2',
                value: 2,
                valueField: 'id',
                dataSource: [
                    { id: 1, name: 'London' },
                    { id: 2, name: 'New York' },
                    { id: 3, name: 'Paris' }
                ]
            };
            const widget = element.kendoBitFlags(options).data('kendoBitFlags');
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-bitflags');
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.options.bitflags).to.equal(options.bitflags);
            expect(widget.options.value).to.equal(options.value);
            expect(widget.options.valueField).to.equal(options.valueField);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(element.text()).to.include(
                widget.dataSource.get(options.value).name
            );
        });

        it('from markup', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoBitFlags');
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-bitflags');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from markup with attributes', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            // TODO more attributes
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoBitFlags');
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-bitflags');
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.options.bitflags).to.be.a('function');
            expect(widget.options.value).to.equal(attributes['data-value']);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(element.text()).to.include(attributes['data-value']);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoBitFlags(options).data('kendoBitFlags');
        });

        xit('value', () => {
            expect(widget).to.be.an.instanceof(BitFlags);
        });

        xit('refresh', () => {
            expect(widget).to.be.an.instanceof(BitFlags);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(BitFlags);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        const options = {};
        let viewModel;
        let change;
        let destroy;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoBitFlags(options).data('kendoBitFlags');
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
        let widget;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoBitFlags(options).data('kendoBitFlags');
            event = sinon.spy();
        });

        xit('TODO', () => {});
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.empty();
    });
});
