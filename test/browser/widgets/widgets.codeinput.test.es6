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
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { getValidationLibrary } from '../../../src/js/helpers/helpers.components.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import '../../../src/js/widgets/widgets.codeinput.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    roleSelector,
    ui: { CodeInput, DropDownList, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'codeinput';
const WIDGET = 'kendoCodeInput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const LIBRARY = getValidationLibrary();
const CUSTOM = LIBRARY[0];
const EQUAL = LIBRARY[1]; // TODO make it DEFAULT and use JSC.integer()
const ANY = LIBRARY[4]; // TODO use JSC.integer()
const SOLUTION = '0';

describe('widgets.codeinput', () => {
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
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(widget.customInput.val()).to.equal(CUSTOM.name);
            expect(widget)
                .to.have.property('paramsContainer')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]({
                dataSource: LIBRARY,
                value: `${TOOLS.LIB_COMMENT}${ANY.key}`,
                solution: SOLUTION,
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(widget.customInput.val()).to.equal(CUSTOM.name);
            expect(widget)
                .to.have.property('paramsContainer')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
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
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(widget.customInput.val()).to.equal(CUSTOM.name);
            expect(widget)
                .to.have.property('paramsContainer')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
        });

        it('from markup with data attributes', () => {
            const attributes = options2attributes({
                default: 'floatEqual',
                role: ROLE,
                source: JSON.stringify(LIBRARY),
                value:
                    'function validate(value, solution) {\\n\\treturn true;\\n}',
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(widget.customInput.val()).to.equal(CUSTOM.name);
            expect(widget)
                .to.have.property('paramsContainer')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.equal(
                attributes[attr('value')].replace(/\\\\/g, '\\')
            );
        });
    });

    describe('Methods', () => {
        const options = {
            dataSource: LIBRARY,
            default: TOOLS.LIB_COMMENT + ANY.key,
            value: TOOLS.LIB_COMMENT + ANY.key,
        };
        let element;
        let widget;
        const DUMMY = 'dummy';
        const FORMULA1 = 'function test(a, b) { return a + b; }';
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';
        const FORMULA3 =
            'function validate(value,solution,all){\nreturn true;\n}';

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('setDataSource', () => {
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget.dropDownList)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget.dataSource).to.equal(widget.dropDownList.dataSource);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
            widget.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget.dropDownList)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget.dataSource).to.equal(widget.dropDownList.dataSource);
            expect(widget.dataSource.total()).to.equal(3);
        });

        it('value', () => {
            function fn() {
                widget.value(
                    JSC.one_of([
                        JSC.boolean(),
                        JSC.number(),
                        // JSC.string(),
                        JSC.object(),
                        JSC.array(),
                    ])()
                );
            }
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(fn).to.throw(TypeError);
            widget.value(undefined);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
            expect(widget.dropDownList.text()).to.equal(ANY.name);
            expect(widget.dropDownList.wrapper).to.be.visible;
            expect(widget.customInput).not.to.be.visible;
            widget.value(TOOLS.LIB_COMMENT + ANY.key);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
            expect(widget.dropDownList.text()).to.equal(ANY.name);
            expect(widget.dropDownList.wrapper).to.be.visible;
            expect(widget.customInput).not.to.be.visible;
            widget.value(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(widget.dropDownList.text()).to.equal(EQUAL.name);
            expect(widget.dropDownList.wrapper).to.be.visible;
            expect(widget.customInput).not.to.be.visible;
            // If the value is stupid it uses widget.options.default
            widget.value(TOOLS.LIB_COMMENT + DUMMY);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + DUMMY); // TODO: is this reasonable?
            expect(widget.dropDownList.text()).to.equal(EQUAL.name);
            expect(widget.dropDownList.wrapper).to.be.visible;
            expect(widget.customInput).not.to.be.visible;
            // If the value is a formula
            widget.value(FORMULA2);
            expect(widget.value()).to.equal(FORMULA2);
            expect(widget.dropDownList.text()).to.equal(CUSTOM.name);
            expect(widget.dropDownList.wrapper).not.to.be.visible;
            expect(widget.customInput).to.be.visible;
            // If the value is another formula
            widget.value(FORMULA1);
            expect(widget.value()).to.equal(FORMULA1);
            expect(widget.dropDownList.text()).to.equal(CUSTOM.name);
            expect(widget.dropDownList.wrapper).not.to.be.visible;
            expect(widget.customInput).to.be.visible;
            widget.value(FORMULA3);
            expect(widget.value()).to.equal(FORMULA3);
            expect(widget.dropDownList.text()).to.equal(CUSTOM.name);
            expect(widget.dropDownList.wrapper).not.to.be.visible;
            expect(widget.customInput).to.be.visible;
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(CodeInput);
            widget.destroy();
            // TODO
            // expect(widget.dataSource).to.be.undefined;
            expect(widget.dropDownList).to.be.undefined;
            // expect(widget.customInput).to.be.undefined;
            // expect(widget.paramsContainer).to.be.undefined;
        });
    });

    xdescribe('MVVM (and UI interactions)', () => {
        const attributes = options2attributes({
            bind: 'source: library, value: code',
            default: TOOLS.LIB_COMMENT + ANY.key,
            role: ROLE,
        });
        let element;
        let widget;
        let change;
        const viewModel = observable({
            library: LIBRARY,
            code: '',
        });

        beforeEach(() => {
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            change = sinon.spy();
            viewModel.bind(CONSTANTS.CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change the widget value
            widget.value(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + ANY.key);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change in the view Model
            viewModel.set('code', TOOLS.LIB_COMMENT + EQUAL.key);
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeInput);
            const clickable = element
                .find(roleSelector('dropdownlist'))
                .parent();
            expect(clickable).to.match('span');
            clickable.simulate(CONSTANTS.CLICK);
            // a first click expands the list
            const list = $('div.k-list-container ul.k-list');
            expect(list).to.exist;
            const item = list.find(`li:contains("${EQUAL.key}")`);
            expect(item).to.exist;
            item.simulate(CONSTANTS.CLICK);
            // a second click closes the list and sets a new value
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        afterEach(() => {
            viewModel.unbind(CONSTANTS.CHANGE);
            viewModel.set('code', ''); // undefined would not work
        });
    });

    xdescribe('Events', () => {
        let element;
        let widget;
        let change;
        const DUMMY = 'dummy';
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET]({
                dataSource: LIBRARY,
                value: TOOLS.LIB_COMMENT + ANY.key,
                default: TOOLS.LIB_COMMENT + ANY.key,
                solution: SOLUTION,
            }).data(WIDGET);
        });

        xit('Change event', () => {
            expect(widget).to.be.an.instanceof(CodeInput);
            widget.bind(CONSTANTS.CHANGE, (e) => {
                change(e.value);
            });
            widget.value(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(change).to.have.been.calledWith(
                TOOLS.LIB_COMMENT + EQUAL.key
            );
            widget.value(FORMULA2);
            expect(change).to.have.been.calledWith(FORMULA2);
            widget.value(DUMMY);
            expect(change).to.have.been.calledWith(TOOLS.LIB_COMMENT + ANY.key);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
