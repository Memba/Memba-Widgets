/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'jquery.simulate';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
// import 'jquery.mockjax';
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/dialogs/widgets.basedialog.es6';

const { afterEach, describe, it } = window;
const {
    destroy,
    ui: { BaseDialog, roles },
} = window.kendo;
const { expect } = chai;

const ELEMENT = `<${CONSTANTS.DIV}/>`;
const FIXTURES = 'fixtures';
const ROLE = 'basedialog';
const WIDGET = 'kendoBaseDialog';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.basedialog', () => {
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
            expect(widget).to.be.an.instanceof(BaseDialog);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
        });
    });

    xdescribe('Methods', () => {});

    xdescribe('MVVM (and UI interactions)', () => {});

    xdescribe('Events', () => {});

    afterEach(() => {
        // This is the dialog wrapper
        const dialog = $('.k-dialog');
        destroy(dialog);
        dialog.remove();
        $('body > .k-overlay').remove();
        $('body > .k-popup').remove();
    });
});
