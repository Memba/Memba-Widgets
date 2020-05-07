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
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.imagelist.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // bind,
    // data: { DataSource },
    destroy,
    init,
    ui: { ImageList, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'imagelist';
const WIDGET = 'kendoImageList';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.imagelist', () => {
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
            expect(widget).to.be.an.instanceof(ImageList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const options = {
                // TODO
            };
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(ImageList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
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
            expect(widget).to.be.an.instanceof(ImageList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                role: ROLE,
                // TODO more
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(ImageList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });
    });

    xdescribe('Methods', () => {
        beforeEach(() => {});

        it('value', () => {
            expect(true).to.be.false;
        });

        it('refresh', () => {
            expect(true).to.be.false;
        });

        it('destroy', () => {
            expect(true).to.be.false;
        });
    });

    xdescribe('MVVM (with UI interactions)', () => {
        beforeEach(() => {});

        it('It should...', () => {
            expect(true).to.be.false;
        });
    });

    xdescribe('Events', () => {
        beforeEach(() => {});

        it('change', () => {
            expect(true).to.be.false;
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
