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
import TOOLS from '../../../src/js/tools/util.constants.es6';
import '../../../src/js/widgets/widgets.codeeditor.es6';

const { afterEach, before, beforeEach, CodeMirror, describe, it } = window;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    roleSelector,
    ui: { CodeEditor, DropDownList, roles }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'codeeditor';
const WIDGET = 'kendoCodeEditor';

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
        name: 'equal',
        formula:
            'function validate(value, solution) {\n\treturn String(value).trim() === String(solution).trim();\n}'
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
const NAME = LIBRARY[4].name;
const FORMULA = LIBRARY[4].formula;
const SOLUTION = '0';

describe('widgets.codeeditor', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(CodeMirror).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn[WIDGET]).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(widget)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('solutionInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('valueInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('messageWrap')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
            // expect(widget.paramInput.attr('placeholder')).to.equal(CodeEditor.fn.options.messages.notApplicable);
            expect(widget.paramInput.val()).to.equal('');
            expect(widget.solutionInput.val()).to.equal('');
            expect(widget.valueInput.val()).to.equal('');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]({
                dataSource: LIBRARY,
                value: TOOLS.LIB_COMMENT + NAME,
                solution: SOLUTION
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(widget)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('solutionInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('valueInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('messageWrap')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(widget.paramInput.attr('placeholder')).to.equal(
                CodeEditor.fn.options.messages.notApplicable
            );
            expect(widget.paramInput.val()).to.equal('');
            expect(widget.solutionInput.val()).to.equal(SOLUTION);
            expect(widget.valueInput.val()).to.equal('');
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(widget)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('solutionInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('valueInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('messageWrap')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
            // expect(widget.paramInput.attr('placeholder')).to.equal(CodeEditor.fn.options.messages.notApplicable);
            expect(widget.paramInput.val()).to.equal('');
            expect(widget.solutionInput.val()).to.equal('');
            expect(widget.valueInput.val()).to.equal('');
        });

        it('from markup with attributes', () => {
            const attributes = {
                'data-source': JSON.stringify(LIBRARY),
                'data-default': '// floatEqual',
                'data-solution': '1.5555',
                'data-value':
                    'function validate(value, solution) {\\n\\treturn true;\\n}'
            };
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(widget)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('paramInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('solutionInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('valueInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('messageWrap')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.equal(
                attr['data-value'].replace(/\\\\/g, '\\')
            );
            expect(widget.paramInput.attr('placeholder')).to.equal(
                CodeEditor.fn.options.messages.notApplicable
            );
            expect(widget.paramInput.val()).to.equal('');
            expect(widget.solutionInput.val()).to.equal(attr['data-solution']);
            expect(widget.valueInput.val()).to.equal('');
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const DUMMY = 'dummy';
        const EQ_NAME = LIBRARY[1].name;
        const EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA1 = 'function test(a, b) { return a + b; }';
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';
        const FORMULA3 =
            'function validate(value,solution,all){\nreturn true;\n}';

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET]({
                dataSource: LIBRARY,
                default: TOOLS.LIB_COMMENT + NAME,
                solution: SOLUTION,
                value: NAME
            }).data(WIDGET);
        });

        it('_isCustom: private method to check custom formula', () => {
            function fn() {
                widget._isCustom(100);
            }
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(fn).to.throw(TypeError);
            expect(widget._isCustom(TOOLS.LIB_COMMENT)).to.be.undefined;
            expect(widget._isCustom(EQ_NAME)).to.be.undefined;
            expect(widget._isCustom(TOOLS.LIB_COMMENT + EQ_NAME)).to.be
                .undefined;
            expect(widget._isCustom(FORMULA1)).to.be.undefined;
            expect(widget._isCustom(FORMULA2)).to.equal(FORMULA2);
            expect(widget._isCustom(FORMULA3)).to.equal(FORMULA3);
        });

        it('_parseLibraryValue: private method to check library formula', () => {
            function fn() {
                widget._parseLibraryValue(100);
            }
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(fn).to.throw(TypeError);
            expect(widget._parseLibraryValue(TOOLS.LIB_COMMENT).item).to.be
                .undefined;
            expect(widget._parseLibraryValue(DUMMY).item).to.be.undefined;
            expect(widget._parseLibraryValue(TOOLS.LIB_COMMENT + DUMMY).item).to
                .be.undefined;
            expect(widget._parseLibraryValue(EQ_NAME).item).to.be.undefined;
            expect(widget._parseLibraryValue(FORMULA1).item).to.be.undefined;
            expect(widget._parseLibraryValue(FORMULA2).item).to.be.undefined;
            expect(widget._parseLibraryValue(FORMULA3).item).to.be.undefined;
            expect(widget._parseLibraryValue(TOOLS.LIB_COMMENT + EQ_NAME).item)
                .not.to.be.undefined;
            expect(
                widget._parseLibraryValue(TOOLS.LIB_COMMENT + EQ_NAME).item.name
            ).to.equal(EQ_NAME);
            expect(
                widget._parseLibraryValue(TOOLS.LIB_COMMENT + EQ_NAME).item
                    .formula
            ).to.equal(EQ_FORMULA);
        });

        it('setDataSource', () => {
            expect(widget).to.be.an.instanceof(CodeEditor);
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
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            widget.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
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

        /* This function has too many statements. */
        /* jshint -W071 */

        it('value', () => {
            // TODO: paramInput
            function fn1() {
                widget.value(100);
            }
            function fn2() {
                widget.value(null);
            }
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(TypeError);
            widget.value(undefined);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(widget.dropDownList.text()).to.equal(NAME);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            widget.value(TOOLS.LIB_COMMENT);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(widget.dropDownList.text()).to.equal(NAME);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            widget.value(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(widget.dropDownList.text()).to.equal(EQ_NAME);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(EQ_FORMULA);
            // If the value is stupid it uses widget.options.default
            widget.value(TOOLS.LIB_COMMENT + DUMMY);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(widget.dropDownList.text()).to.equal(NAME);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            widget.value(FORMULA2);
            expect(widget.value()).to.equal(FORMULA2);
            expect(widget.dropDownList.text()).to.equal(widget.options.custom);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULA2);
            // If the value is stupid it uses widget.options.default
            widget.value(FORMULA1);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(widget.dropDownList.text()).to.equal(NAME);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            widget.value(FORMULA3);
            expect(widget.value()).to.equal(FORMULA3);
            expect(widget.dropDownList.text()).to.equal(widget.options.custom);
            expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULA3);
        });

        /* jshint +W071 */

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(CodeEditor);
            widget.destroy();
            expect(widget.codeMirror).to.be.undefined;
            expect(widget.dataSource).to.be.undefined;
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.paramInput).to.be.undefined;
            expect(widget.solutionInput).to.be.undefined;
            expect(widget.valueInput).to.be.undefined;
            expect(widget.testButton).to.be.undefined;
            expect(widget.messageWrap).to.be.undefined;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        let change;
        const EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const viewModel = observable({
            library: LIBRARY,
            code: ''
        });

        beforeEach(() => {
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr({
                    'data-bind': 'source: library, value: code',
                    'data-default': TOOLS.LIB_COMMENT + NAME
                })
                .appendTo(`#${FIXTURES}`);
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            change = sinon.spy();
            viewModel.bind(CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change the widget value
            widget.value(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change in the view Model
            viewModel.set('code', TOOLS.LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeEditor);
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
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        xit('A change of codemirror value raises a change of viewModel', () => {
            /*
             document.onmousemove = function(e){
             console.dir({
             clientX: e.clientX,
             clientY: e.clientY,
             pageX: e.pageX,
             pageY: e.pageY,
             screenX: e.screenX,
             screenY: e.screenY
             });
             };
             document.onkeypress = function(e){
             console.dir({
             keyCode: e.keyCode,
             charCode: e.charCode
             });
             };
             */
            expect(widget).to.be.an.instanceof(CodeEditor);
            const scroll = $('div.CodeMirror div.CodeMirror-scroll');
            expect(scroll).to.exist;
            const lines = scroll.find('pre.CodeMirror-line');
            expect(lines).to.exist;
            expect(lines).to.have.property('length', 3);
            const line = $(lines.get(1)); // second line
            expect(line).to.exist;
            const x = 304; // line.offset().left + line.width() / 2; // 300
            const y = 617; // line.offset().top + line.height() / 2; // 620
            scroll.simulate(CLICK, {
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y
            });
            // $('textarea').simulate('keypress', { charCode: 97, keyCode: 97 }); // a
            // $('textarea').simulate('keypress', { charCode: 98, keyCode: 98 }); // b
            // $('textarea').simulate('keypress', { charCode: 99, keyCode: 99 }); // c
            // TODO: This does not work: quite complex
        });

        afterEach(() => {
            viewModel.unbind(CHANGE);
            viewModel.set('code', ''); // undefined would not work
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        let change;
        const DUMMY = 'dummy';
        const EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET]({
                dataSource: LIBRARY,
                value: TOOLS.LIB_COMMENT + NAME,
                default: TOOLS.LIB_COMMENT + NAME,
                solution: SOLUTION
            }).data(WIDGET);
        });

        it('Change event', () => {
            expect(widget).to.be.an.instanceof(CodeEditor);
            widget.bind(CHANGE, e => {
                change(e.value);
            });
            widget.value(TOOLS.LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledWith(TOOLS.LIB_COMMENT + EQ_NAME);
            widget.value(FORMULA2);
            expect(change).to.have.been.calledWith(FORMULA2);
            widget.value(DUMMY);
            expect(change).to.have.been.calledWith(TOOLS.LIB_COMMENT + NAME);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
