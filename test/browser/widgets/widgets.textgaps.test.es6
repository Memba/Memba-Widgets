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
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.textgaps.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // bind,
    destroy,
    init,
    // observable,
    ui: { roles, TextGaps }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'textgaps';
const WIDGET = 'kendoTextGaps';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

function getText(count = 2) {
    let ret = '';
    for (let i = 0; i < count; i++) {
        ret += `${JSC.string()()}[]`;
    }
    ret += JSC.string()();
    return ret;
}

function getValue(count = 2) {
    return Array(count).fill('');
}

describe('widgets.textgaps', () => {
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
            // const options = {};
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(TextGaps);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.be.empty;
        });

        it('from code with options', () => {
            const count = JSC.integer(1, 5)();
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                inputStyle: 'background-color: #ff0',
                text: getText(count),
                value: getValue(count)
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(TextGaps);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.children(`.kj-${ROLE}-input`)).to.have.lengthOf(
                count
            );
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(TextGaps);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.be.empty;
        });

        it('from markup with attributes', () => {
            const count = JSC.integer(1, 5)();
            const attributes = options2attributes({
                inputStyle: 'background-color: #ff0',
                role: ROLE,
                text: getText(count),
                value: JSON.stringify(getValue(count))
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(TextGaps);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.children(`.kj-${ROLE}-input`)).to.have.lengthOf(
                count
            );
        });
    });

    describe('Methods', () => {
        let count;
        let element;
        let options;
        let widget;

        beforeEach(() => {
            count = JSC.integer(1, 5)();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = {
                inputStyle: 'background-color: #ff0',
                text: getText(count),
                value: getValue(count)
            };
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('value', () => {
            expect(widget).to.be.an.instanceof(TextGaps);
            const value = widget.value();
            expect(value).to.deep.equal(options.value);
            let text = value[count - 1];
            expect(
                widget.element.children(`.kj-${ROLE}-input`).last()
            ).to.have.text(text);
            text = JSC.string()();
            value[count - 1] = text;
            widget.value(value);
            expect(
                widget.element.children(`.kj-${ROLE}-input`).last()
            ).to.have.text(text);
        });

        it('refresh', () => {
            expect(widget).to.be.an.instanceof(TextGaps);
            widget.refresh();
        });

        // TODO enable

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(TextGaps);
            widget.destroy();
        });
    });

    describe('MVVM (with UI interactions)', () => {
        let count;
        let element;
        let options;
        let widget;

        beforeEach(() => {
            count = JSC.integer(1, 5)();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = {
                inputStyle: 'background-color: #ff0',
                text: getText(count),
                value: getValue(count)
            };
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('It should update value when input', () => {
            expect(widget).to.be.an.instanceof(TextGaps);
            const value = getValue(count);
            widget.element
                .children(`.kj-${ROLE}-input`)
                .each((index, input) => {
                    $(input)
                        .text(value[index])
                        .trigger('input');
                });
            expect(widget.value()).to.deep.equal(value);
        });

        /*
        it('It should update value when pasted', () => {
            // It does not seem possible to simulate a paste event
            expect(widget).to.be.an.instanceof(TextGaps);
        });
         */
    });

    describe('Events', () => {
        let count;
        let element;
        let options;
        let widget;

        beforeEach(() => {
            count = JSC.integer(1, 5)();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = {
                inputStyle: 'background-color: #ff0',
                text: getText(count),
                value: getValue(count)
            };
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('change', () => {
            expect(widget).to.be.an.instanceof(TextGaps);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
