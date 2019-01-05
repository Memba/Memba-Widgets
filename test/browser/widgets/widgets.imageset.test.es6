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
import '../../../src/js/widgets/widgets.imageset.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    init,
    observable,
    ui: { ImageSet }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'imageset';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.imageset', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoImageSet).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element.kendoImageSet().data('kendoImageSet');
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-widget');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {
                imageset: 'script1', // TODO Review
                value: 'Todd'
            };
            const widget = element
                .kendoImageSet(options)
                .data('kendoImageSet');
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-widget');
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(FIXTURES);
            init(FIXTURES);
            const widget = element.data('kendoImageSet');
            expect(widget).to.be.an.instanceof(ImageSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-widget');
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoImageSet(options).data('kendoImageSet');
        });

        xit('value', done => {
            expect(widget).to.be.an.instanceof(ImageSet);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(ImageSet);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
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
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoImageSet(options).data('kendoImageSet');
            viewModel = observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', () => {});

        afterEach(() => {
            const fixtures = $(FIXTURES);
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
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoImageSet(options).data('kendoImageSet');
            event = sinon.spy();
        });

        xit('TODO', () => {});

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });
});
