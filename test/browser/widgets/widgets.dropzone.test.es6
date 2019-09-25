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
import '../../../src/js/widgets/widgets.dropzone.es6';
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
    ui: { DropZone }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'dropzone';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.dropzone', () => {
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
            expect($.fn.kendoDropZone).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoDropZone().data('kendoDropZone');
            expect(widget).to.be.an.instanceof(DropZone);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-dropzone');
            // TODO expect(widget).to.have.property('dataSource').that.is.an.instanceof(DataSource);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {};
            const widget = element.kendoDropZone().data('kendoDropZone');
            expect(widget).to.be.an.instanceof(DropZone);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-dropzone');
            // TODO expect(assetManager).to.have.property('dataSource').that.is.an.instanceof(DataSource);
        });

        it('from markup', () => {
            const element = $(ELEMENT).attr(attr('role'), ROLE).appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoDropZone');
            expect(widget).to.be.an.instanceof(DropZone);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-dropzone');
        });

        xit('from markup with attributes', () => {
            // TODO: AssetManager might be a bit complex to initialize with attributes...
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoDropZone(options).data('kendoDropZone');
        });

        xit('value', done => {
            expect(widget).to.be.an.instanceof(DropZone);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(DropZone);
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
            widget = element.kendoDropZone(options).data('kendoDropZone');
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
            widget = element.kendoDropZone(options).data('kendoDropZone');
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
