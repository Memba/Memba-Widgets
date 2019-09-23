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
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.imageset.es6';
import fixKendoRoles from '../_misc/test.roles.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    init,
    observable,
    ui,
    ui: { ImageSet }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}/>`;
const ROLE = 'imageset';
const VALUE = JSC.string()();
const ROOT = 'https://www.example.com/';
const DATA = [
    {
        text: VALUE,
        url: `${ROOT}${JSC.string(8, JSC.character('a', 'z'))()}.png`
    },
    {
        text: JSC.string()(),
        url: `${ROOT}${JSC.string(8, JSC.character('a', 'z'))()}.png`
    },
    {
        text: JSC.string()(),
        url: `${ROOT}${JSC.string(8, JSC.character('a', 'z'))()}.png`
    },
    {
        text: JSC.string()(),
        url: `${ROOT}${JSC.string(8, JSC.character('a', 'z'))()}.png`
    }
];

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.imageset', () => {
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
            expect($.fn.kendoImageSet).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoImageSet().data('kendoImageSet');
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class('kj-imageset');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);

            const options = {
                dataSource: DATA,
                value: VALUE
            };
            const widget = element.kendoImageSet(options).data('kendoImageSet');
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class('kj-imageset');
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoImageSet');
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class('kj-imageset');
        });

        afterEach(() => {
            const fixtures = $(`#${FIXTURES}`);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {
            dataSource: DATA,
            value: VALUE
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoImageSet(options).data('kendoImageSet');
        });

        it('value', () => {
            expect(widget).to.be.an.instanceof(ImageSet);
            DATA.forEach(data => {
                widget.value(data.text);
                expect(widget.wrapper).to.have.css(
                    'background-image',
                    `url("${data.url}")`
                );
                expect(widget.value()).to.equal(data.text);
            });
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(ImageSet);
            widget.destroy();
            expect(widget.element.data('kendoImageSet')).to.be.undefined;
        });

        afterEach(() => {
            const fixtures = $(`#${FIXTURES}`);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
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
            element = $(ELEMENT)
                .attr(attr('bind'), 'value: value, source: data')
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: DATA,
                value: VALUE
            });
            bind(`#${FIXTURES}`);
            change = sinon.spy();
            destroy = sinon.spy();
        });

        it('TODO', () => {
            DATA.forEach(data => {
                $(`.kj-${ROLE}`).simulate(CONSTANTS.CLICK);
            });
        });

        afterEach(() => {
            const fixtures = $(`#${FIXTURES}`);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoImageSet(options).data('kendoImageSet');
            event = sinon.spy();
        });

        xit('TODO', () => {});

        afterEach(() => {
            const fixtures = $(`#${FIXTURES}`);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });
});
