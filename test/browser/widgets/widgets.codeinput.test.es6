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
import '../../../src/js/widgets/widgets.codeinput.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    roleSelector,
    ui: { CodeInput, DropDownList }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'codeinput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const CHANGE = 'change';
const CLICK = 'click';
const LIBRARY = [
    {
        name: 'custom',
        formula:
            'function validate(value, solution, all) {\n\t// Your code should return true when value is validated against solution.\n}'
    },
    {
        name: 'intEqual',
        formula:
            'function validate(value, solution) {\n\treturn parseInt(value, 10) === parseInt(solution, 10);\n}'
    },
    {
        name: 'floatEqual',
        formula:
            'function validate(value, solution) {\n\treturn parseFloat(value) === parseFloat(solution);\n}'
    },
    {
        name: 'round2DecimalsEqual',
        formula:
            'function validate(value, solution) {\n\treturn Math.round(parseFloat(value)*100)/100 === parseFloat(solution);\n}'
    },
    {
        name: 'greaterThan',
        formula:
            'function validate(value, solution) {\n\treturn parseFloat(value) > parseFloat(solution);\n}'
    },
    {
        name: 'greaterThanOrEqual',
        formula:
            'function validate(value, solution) {\n\treturn parseFloat(value) >= parseFloat(solution);\n}'
    },
    {
        name: 'lowerThan',
        formula:
            'function validate(value, solution) {\n\treturn parseFloat(value) < parseFloat(solution);\n}'
    },
    {
        name: 'lowerThanOrEqual',
        formula:
            'function validate(value, solution) {\n\treturn parseFloat(value) <= parseFloat(solution);\n}'
    },
    {
        name: 'withParam',
        formula:
            'function validate(value, solution) {\n\treturn /{0}/i.test(value);\n}',
        param: 'RegExp'
    }
];
const LIB_COMMENT = '// ';
const NAME = LIBRARY[4].name;
const FORMULA = LIBRARY[4].formula;
const SOLUTION = '0';

describe('widgets.codeinput', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoCodeInput).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element.kendoCodeInput().data('kendoCodeInput');
            expect(widget).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-codeinput');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
            expect(widget.customInput.val()).to.equal(widget.options.custom);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const codeInput = element
                .kendoCodeInput({
                    dataSource: LIBRARY,
                    value: LIB_COMMENT + NAME,
                    solution: SOLUTION
                })
                .data('kendoCodeInput');
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-codeinput');
            expect(codeInput)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(codeInput)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(codeInput)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(codeInput)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(codeInput.dataSource.total()).to.equal(LIBRARY.length);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeInput.customInput.val()).to.equal(
                codeInput.options.custom
            );
        });

        it('from markup', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(FIXTURES);
            init(FIXTURES);
            const codeInput = element.data('kendoCodeInput');
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-codeinput');
            expect(codeInput)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(codeInput)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(codeInput)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(codeInput)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(codeInput.dataSource.total()).to.equal(0);
            expect(codeInput.value()).to.be.undefined;
            expect(codeInput.customInput.val()).to.equal(
                codeInput.options.custom
            );
        });

        it('from markup with data attributes', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            attributes[attr('source')] = JSON.stringify(LIBRARY);
            attributes[attr('default')] = 'floatEqual';
            attributes[attr('value')] =
                'function validate(value, solution) {\\n\\treturn true;\\n}';
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(FIXTURES);
            init(FIXTURES);
            const codeInput = element.data('kendoCodeInput');
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-codeinput');
            expect(codeInput)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(codeInput)
                .to.have.property('customInput')
                .that.is.an.instanceof($);
            expect(codeInput)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(codeInput)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(codeInput.dataSource.total()).to.equal(LIBRARY.length);
            expect(codeInput.value()).to.equal(
                attr['data-value'].replace(/\\\\/g, '\\')
            );
            expect(codeInput.customInput.val()).to.equal(
                codeInput.options.custom
            );
        });
    });

    describe('Methods', () => {
        let element;
        let codeInput;
        const DUMMY = 'dummy';
        const EQ_NAME = LIBRARY[1].name;
        const EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA1 = 'function test(a, b) { return a + b; }';
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';
        const FORMULA3 =
            'function validate(value,solution,all){\nreturn true;\n}';

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            codeInput = element
                .kendoCodeInput({
                    dataSource: LIBRARY,
                    default: LIB_COMMENT + NAME,
                    value: NAME
                })
                .data('kendoCodeInput');
        });

        it('_isCustom: private method to check custom formula', () => {
            function fn() {
                codeInput._isCustom(100);
            }
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(fn).to.throw(TypeError);
            expect(codeInput._isCustom(LIB_COMMENT)).to.be.undefined;
            expect(codeInput._isCustom(EQ_NAME)).to.be.undefined;
            expect(codeInput._isCustom(LIB_COMMENT + EQ_NAME)).to.be.undefined;
            expect(codeInput._isCustom(FORMULA1)).to.be.undefined;
            expect(codeInput._isCustom(FORMULA2)).to.equal(FORMULA2);
            expect(codeInput._isCustom(FORMULA3)).to.equal(FORMULA3);
        });

        it('_parseLibraryValue: private method to check library formula', () => {
            function fn() {
                codeInput._parseLibraryValue(100);
            }
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(fn).to.throw(TypeError);
            expect(codeInput._parseLibraryValue(LIB_COMMENT).item).to.be
                .undefined;
            expect(codeInput._parseLibraryValue(DUMMY).item).to.be.undefined;
            expect(codeInput._parseLibraryValue(LIB_COMMENT + DUMMY).item).to.be
                .undefined;
            expect(codeInput._parseLibraryValue(EQ_NAME).item).to.be.undefined;
            expect(codeInput._parseLibraryValue(FORMULA1).item).to.be.undefined;
            expect(codeInput._parseLibraryValue(FORMULA2).item).to.be.undefined;
            expect(codeInput._parseLibraryValue(FORMULA3).item).to.be.undefined;
            expect(codeInput._parseLibraryValue(LIB_COMMENT + EQ_NAME).item).not
                .to.be.undefined;
            expect(
                codeInput._parseLibraryValue(LIB_COMMENT + EQ_NAME).item.name
            ).to.equal(EQ_NAME);
            expect(
                codeInput._parseLibraryValue(LIB_COMMENT + EQ_NAME).item.formula
            ).to.equal(EQ_FORMULA);
        });

        it('setDataSource', () => {
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(codeInput)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(codeInput.dropDownList)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput.dataSource).to.equal(
                codeInput.dropDownList.dataSource
            );
            expect(codeInput.dataSource.total()).to.equal(LIBRARY.length);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            codeInput.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeInput)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(codeInput.dropDownList)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(codeInput.dataSource).to.equal(
                codeInput.dropDownList.dataSource
            );
            expect(codeInput.dataSource.total()).to.equal(3);
        });

        /* This function has too many statements. */
        /* jshint -W071 */

        it('value', () => {
            // TODO: paramInput
            function fn1() {
                codeInput.value(100);
            }
            function fn2() {
                codeInput.value(null);
            }
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(codeInput)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(TypeError);
            codeInput.value(undefined);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeInput.dropDownList.text()).to.equal(NAME);
            expect(codeInput.dropDownList.wrapper).to.be.visible;
            expect(codeInput.customInput).not.to.be.visible;
            codeInput.value(LIB_COMMENT);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeInput.dropDownList.text()).to.equal(NAME);
            expect(codeInput.dropDownList.wrapper).to.be.visible;
            expect(codeInput.customInput).not.to.be.visible;
            codeInput.value(LIB_COMMENT + EQ_NAME);
            expect(codeInput.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(codeInput.dropDownList.text()).to.equal(EQ_NAME);
            expect(codeInput.dropDownList.wrapper).to.be.visible;
            expect(codeInput.customInput).not.to.be.visible;
            // If the value is stupid it uses codeInput.options.default
            codeInput.value(LIB_COMMENT + DUMMY);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeInput.dropDownList.text()).to.equal(NAME);
            expect(codeInput.dropDownList.wrapper).to.be.visible;
            expect(codeInput.customInput).not.to.be.visible;
            codeInput.value(FORMULA2);
            expect(codeInput.value()).to.equal(FORMULA2);
            expect(codeInput.dropDownList.wrapper).not.to.be.visible;
            expect(codeInput.customInput).to.be.visible;
            // If the value is stupid it uses codeInput.options.default
            codeInput.value(FORMULA1);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeInput.dropDownList.text()).to.equal(NAME);
            expect(codeInput.dropDownList.wrapper).to.be.visible;
            expect(codeInput.customInput).not.to.be.visible;
            codeInput.value(FORMULA3);
            expect(codeInput.value()).to.equal(FORMULA3);
            expect(codeInput.dropDownList.wrapper).not.to.be.visible;
            expect(codeInput.customInput).to.be.visible;
        });

        /* jshint +W071 */

        it('destroy', () => {
            expect(codeInput).to.be.an.instanceof(CodeInput);
            codeInput.destroy();
            expect(codeInput.dataSource).to.be.undefined;
            expect(codeInput.dropDownList).to.be.undefined;
            expect(codeInput.customInput).to.be.undefined;
            expect(codeInput.paramInput).to.be.undefined;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let codeInput;
        let change;
        const EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const viewModel = observable({
            library: LIBRARY,
            code: ''
        });

        beforeEach(() => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            attributes[attr('bind')] = 'source: library, value: code';
            attributes[attr('default')] = IB_COMMENT + NAME;
            element = $(ELEMENT)
                .attr(attributes)
                .appendTo(FIXTURES);
            bind(FIXTURES, viewModel);
            codeInput = element.data('kendoCodeInput');
            change = sinon.spy();
            viewModel.bind(CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(codeInput.value());
            // Change the widget value
            codeInput.value(LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            expect(codeInput.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(codeInput.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(codeInput).to.be.an.instanceof(CodeInput);
            expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(codeInput.value());
            // Change in the view Model
            viewModel.set('code', LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            expect(codeInput.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(codeInput.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(codeInput).to.be.an.instanceof(CodeInput);
            const clickable = element
                .find(roleSelector('dropdownlist'))
                .parent();
            expect(clickable).to.match('span');
            clickable.simulate(CLICK);
            // a first click expands the list
            const list = $('div.k-list-container ul.k-list');
            expect(list).to.exist;
            const item = list.find(`li:contains("${EQ_NAME}")`);
            expect(item).to.exist;
            item.simulate(CLICK);
            // a second click closes the list and sets a new value
            expect(change).to.have.been.calledOnce;
            expect(codeInput.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(codeInput.value());
        });

        afterEach(() => {
            viewModel.unbind(CHANGE);
            viewModel.set('code', ''); // undefined would not work
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Events', () => {
        let element;
        let codeInput;
        let change;
        const DUMMY = 'dummy';
        const EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(FIXTURES);
            codeInput = element
                .kendoCodeInput({
                    dataSource: LIBRARY,
                    value: LIB_COMMENT + NAME,
                    default: LIB_COMMENT + NAME,
                    solution: SOLUTION
                })
                .data('kendoCodeInput');
        });

        it('Change event', () => {
            expect(codeInput).to.be.an.instanceof(CodeInput);
            codeInput.bind(CHANGE, e => {
                change(e.value);
            });
            codeInput.value(LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledWith(LIB_COMMENT + EQ_NAME);
            codeInput.value(FORMULA2);
            expect(change).to.have.been.calledWith(FORMULA2);
            codeInput.value(DUMMY);
            expect(change).to.have.been.calledWith(LIB_COMMENT + NAME);
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
    });
});
