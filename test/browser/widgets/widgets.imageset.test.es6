/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
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
import JSCheck from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.imageset.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    attr,
    bind,
    destroy,
    init,
    observable,
    ui: { ImageSet, roles },
} = window.kendo;
const { expect } = chai;
const jsc = JSCheck();

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}/>`;
const ROLE = 'imageset';
const WIDGET = 'kendoImageSet';

const VALUE = jsc.string()();
const ROOT = 'https://www.example.com/';
const DATA = [
    {
        text: VALUE,
        url: `${ROOT}${jsc.string(8, jsc.character('a', 'z'))()}.png`,
    },
    {
        text: jsc.string()(),
        url: `${ROOT}${jsc.string(8, jsc.character('a', 'z'))()}.png`,
    },
    {
        text: jsc.string()(),
        url: `${ROOT}${jsc.string(8, jsc.character('a', 'z'))()}.png`,
    },
    {
        text: jsc.string()(),
        url: `${ROOT}${jsc.string(8, jsc.character('a', 'z'))()}.png`,
    },
];

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.imageset', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
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
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class('kj-imageset');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);

            const options = {
                dataSource: DATA,
                value: VALUE,
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class('kj-imageset');
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class('kj-imageset');
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {
            dataSource: DATA,
            value: VALUE,
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('value', () => {
            expect(widget).to.be.an.instanceof(ImageSet);
            DATA.forEach((data) => {
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
            expect(widget.element.data(WIDGET)).to.be.undefined;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        let viewModel;
        let change;

        beforeEach(() => {
            element = $(ELEMENT)
                .attr(attr('bind'), 'value: value, source: data')
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: DATA,
                value: VALUE,
            });
            bind(`#${FIXTURES}`);
            change = sinon.spy();
        });

        it('TODO', () => {
            $.noop(element, widget, viewModel, change);
            /*
            DATA.forEach(data => {
                $(`.kj-${ROLE}`).simulate(CONSTANTS.CLICK);
            });
             */
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            event = sinon.spy();
        });

        xit('TODO', () => {
            $.noop(widget, event);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
