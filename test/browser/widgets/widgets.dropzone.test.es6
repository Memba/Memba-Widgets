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
    ui: { DropZone }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<div/>';
const ROLE = 'dropzone';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const DROPZONE2 = '<div id="dropzone2" data-role="dropzone"></div>';

describe('widgets.dropzone', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoDropZone).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const dropZone = element.kendoDropZone().data('kendoDropZone');
            expect(dropZone).to.be.an.instanceof(DropZone);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-dropzone');
            // TODO expect(dropZone).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {};
            const dropZone = element.kendoDropZone().data('kendoDropZone');
            expect(dropZone).to.be.an.instanceof(DropZone);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-dropzone');
            // TODO expect(assetManager).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
        });

        it('from markup', () => {
            const element = $(DROPZONE2).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            const dropZone = element.data('kendoDropZone');
            expect(dropZone).to.be.an.instanceof(DropZone);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-dropzone');
        });

        xit('from markup with attributes', () => {
            // TODO: AssetManager might be a bit complex to initialize with attributes...
        });
    });

    describe('Methods', () => {
        let element;
        let dropZone;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            dropZone = element.kendoDropZone(options).data('kendoDropZone');
        });

        xit('value', done => {
            expect(dropZone).to.be.an.instanceof(DropZone);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(dropZone).to.be.an.instanceof(DropZone);
            dropZone.destroy();
            expect(dropZone.element).to.be.empty;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let dropZone;
        const options = {};
        let viewModel;
        let change;
        let destroy;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            dropZone = element.kendoDropZone(options).data('kendoDropZone');
            viewModel = kendo.observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', () => {});
    });

    describe('Events', () => {
        let element;
        let dropZone;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            dropZone = element.kendoDropZone(options).data('kendoDropZone');
            event = sinon.spy();
        });

        xit('TODO', () => {});
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
