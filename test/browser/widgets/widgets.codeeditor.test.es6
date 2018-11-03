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
import '../../../src/js/widgets/widgets.chargrid.es6';

const { afterEach, before, beforeEach, CodeMirror, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { CodeEditor }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<div/>';
const ROLE = 'chargrid';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const CHANGE = 'change';
const CLICK = 'click';
const CODEEDITOR1 = '<div id="codeeditor1"></div>';
const CODEEDITOR2 = '<div id="codeeditor2" data-role="codeeditor"></div>';
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
const LIB_COMMENT = '// ';
const NAME = LIBRARY[4].name;
const FORMULA = LIBRARY[4].formula;
const SOLUTION = '0';

describe('widgets.codeeditor', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect(CodeMirror).not.to.be.undefined;
            expect($.fn.kendoCodeEditor).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(CODEEDITOR1).appendTo(FIXTURES);
            const codeEditor = element
                .kendoCodeEditor()
                .data('kendoCodeEditor');
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(codeEditor)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(codeEditor)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor)
                .to.have.property('paramInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('solutionInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('valueInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('testButton')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('messageWrap')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor.dataSource.total()).to.equal(0);
            expect(codeEditor.value()).to.be.undefined;
            // expect(codeEditor.paramInput.attr('placeholder')).to.equal(CodeEditor.fn.options.messages.notApplicable);
            expect(codeEditor.paramInput.val()).to.equal('');
            expect(codeEditor.solutionInput.val()).to.equal('');
            expect(codeEditor.valueInput.val()).to.equal('');
        });

        it('from code with options', () => {
            const element = $(CODEEDITOR1).appendTo(FIXTURES);
            const codeEditor = element
                .kendoCodeEditor({
                    dataSource: LIBRARY,
                    value: LIB_COMMENT + NAME,
                    solution: SOLUTION
                })
                .data('kendoCodeEditor');
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(codeEditor)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(codeEditor)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor)
                .to.have.property('paramInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('solutionInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('valueInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('testButton')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('messageWrap')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor.dataSource.total()).to.equal(LIBRARY.length);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeEditor.paramInput.attr('placeholder')).to.equal(
                CodeEditor.fn.options.messages.notApplicable
            );
            expect(codeEditor.paramInput.val()).to.equal('');
            expect(codeEditor.solutionInput.val()).to.equal(SOLUTION);
            expect(codeEditor.valueInput.val()).to.equal('');
        });

        it('from markup', () => {
            const element = $(CODEEDITOR2).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            const codeEditor = element.data('kendoCodeEditor');
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(codeEditor)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(codeEditor)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor)
                .to.have.property('paramInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('solutionInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('valueInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('testButton')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('messageWrap')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor.dataSource.total()).to.equal(0);
            expect(codeEditor.value()).to.be.undefined;
            // expect(codeEditor.paramInput.attr('placeholder')).to.equal(CodeEditor.fn.options.messages.notApplicable);
            expect(codeEditor.paramInput.val()).to.equal('');
            expect(codeEditor.solutionInput.val()).to.equal('');
            expect(codeEditor.valueInput.val()).to.equal('');
        });

        it('from markup with attributes', () => {
            const attr = {
                'data-source': JSON.stringify(LIBRARY),
                'data-default': '// floatEqual',
                'data-solution': '1.5555',
                'data-value':
                    'function validate(value, solution) {\\n\\treturn true;\\n}'
            };
            const element = $(CODEEDITOR2)
                .attr(attr)
                .appendTo(FIXTURES);
            kendo.init(FIXTURES);
            const codeEditor = element.data('kendoCodeEditor');
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-codeeditor');
            expect(codeEditor)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(codeEditor)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor)
                .to.have.property('paramInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('solutionInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('valueInput')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('testButton')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('messageWrap')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(codeEditor.dataSource.total()).to.equal(LIBRARY.length);
            expect(codeEditor.value()).to.equal(
                attr['data-value'].replace(/\\\\/g, '\\')
            );
            expect(codeEditor.paramInput.attr('placeholder')).to.equal(
                CodeEditor.fn.options.messages.notApplicable
            );
            expect(codeEditor.paramInput.val()).to.equal('');
            expect(codeEditor.solutionInput.val()).to.equal(
                attr['data-solution']
            );
            expect(codeEditor.valueInput.val()).to.equal('');
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let codeEditor;
        const DUMMY = 'dummy';
        const EQ_NAME = LIBRARY[1].name;
        const EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA1 = 'function test(a, b) { return a + b; }';
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';
        const FORMULA3 =
            'function validate(value,solution,all){\nreturn true;\n}';

        beforeEach(() => {
            element = $(CODEEDITOR1).appendTo(FIXTURES);
            codeEditor = element
                .kendoCodeEditor({
                    dataSource: LIBRARY,
                    default: LIB_COMMENT + NAME,
                    solution: SOLUTION,
                    value: NAME
                })
                .data('kendoCodeEditor');
        });

        it('_isCustom: private method to check custom formula', () => {
            function fn() {
                codeEditor._isCustom(100);
            }
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(fn).to.throw(TypeError);
            expect(codeEditor._isCustom(LIB_COMMENT)).to.be.undefined;
            expect(codeEditor._isCustom(EQ_NAME)).to.be.undefined;
            expect(codeEditor._isCustom(LIB_COMMENT + EQ_NAME)).to.be.undefined;
            expect(codeEditor._isCustom(FORMULA1)).to.be.undefined;
            expect(codeEditor._isCustom(FORMULA2)).to.equal(FORMULA2);
            expect(codeEditor._isCustom(FORMULA3)).to.equal(FORMULA3);
        });

        it('_parseLibraryValue: private method to check library formula', () => {
            function fn() {
                codeEditor._parseLibraryValue(100);
            }
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(fn).to.throw(TypeError);
            expect(codeEditor._parseLibraryValue(LIB_COMMENT).item).to.be
                .undefined;
            expect(codeEditor._parseLibraryValue(DUMMY).item).to.be.undefined;
            expect(codeEditor._parseLibraryValue(LIB_COMMENT + DUMMY).item).to
                .be.undefined;
            expect(codeEditor._parseLibraryValue(EQ_NAME).item).to.be.undefined;
            expect(codeEditor._parseLibraryValue(FORMULA1).item).to.be
                .undefined;
            expect(codeEditor._parseLibraryValue(FORMULA2).item).to.be
                .undefined;
            expect(codeEditor._parseLibraryValue(FORMULA3).item).to.be
                .undefined;
            expect(codeEditor._parseLibraryValue(LIB_COMMENT + EQ_NAME).item)
                .not.to.be.undefined;
            expect(
                codeEditor._parseLibraryValue(LIB_COMMENT + EQ_NAME).item.name
            ).to.equal(EQ_NAME);
            expect(
                codeEditor._parseLibraryValue(LIB_COMMENT + EQ_NAME).item
                    .formula
            ).to.equal(EQ_FORMULA);
        });

        it('setDataSource', () => {
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(codeEditor)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor.dropDownList)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor.dataSource).to.equal(
                codeEditor.dropDownList.dataSource
            );
            expect(codeEditor.dataSource.total()).to.equal(LIBRARY.length);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            codeEditor.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeEditor)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor.dropDownList)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(codeEditor.dataSource).to.equal(
                codeEditor.dropDownList.dataSource
            );
            expect(codeEditor.dataSource.total()).to.equal(3);
        });

        /* This function has too many statements. */
        /* jshint -W071 */

        it('value', () => {
            // TODO: paramInput
            function fn1() {
                codeEditor.value(100);
            }
            function fn2() {
                codeEditor.value(null);
            }
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(codeEditor)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(codeEditor)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(TypeError);
            codeEditor.value(undefined);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeEditor.dropDownList.text()).to.equal(NAME);
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            codeEditor.value(LIB_COMMENT);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeEditor.dropDownList.text()).to.equal(NAME);
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            codeEditor.value(LIB_COMMENT + EQ_NAME);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(codeEditor.dropDownList.text()).to.equal(EQ_NAME);
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(
                EQ_FORMULA
            );
            // If the value is stupid it uses codeEditor.options.default
            codeEditor.value(LIB_COMMENT + DUMMY);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeEditor.dropDownList.text()).to.equal(NAME);
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            codeEditor.value(FORMULA2);
            expect(codeEditor.value()).to.equal(FORMULA2);
            expect(codeEditor.dropDownList.text()).to.equal(
                codeEditor.options.custom
            );
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(
                FORMULA2
            );
            // If the value is stupid it uses codeEditor.options.default
            codeEditor.value(FORMULA1);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(codeEditor.dropDownList.text()).to.equal(NAME);
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
            codeEditor.value(FORMULA3);
            expect(codeEditor.value()).to.equal(FORMULA3);
            expect(codeEditor.dropDownList.text()).to.equal(
                codeEditor.options.custom
            );
            expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(
                FORMULA3
            );
        });

        /* jshint +W071 */

        it('destroy', () => {
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            codeEditor.destroy();
            expect(codeEditor.codeMirror).to.be.undefined;
            expect(codeEditor.dataSource).to.be.undefined;
            expect(codeEditor.dropDownList).to.be.undefined;
            expect(codeEditor.paramInput).to.be.undefined;
            expect(codeEditor.solutionInput).to.be.undefined;
            expect(codeEditor.valueInput).to.be.undefined;
            expect(codeEditor.testButton).to.be.undefined;
            expect(codeEditor.messageWrap).to.be.undefined;
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let codeEditor;
        let change;
        const EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const viewModel = kendo.observable({
            library: LIBRARY,
            code: ''
        });

        beforeEach(() => {
            element = $(CODEEDITOR2)
                .attr({
                    'data-bind': 'source: library, value: code',
                    'data-default': LIB_COMMENT + NAME
                })
                .appendTo(FIXTURES);
            kendo.bind(FIXTURES, viewModel);
            codeEditor = element.data('kendoCodeEditor');
            change = sinon.spy();
            viewModel.bind(CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(codeEditor.value());
            // Change the widget value
            codeEditor.value(LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            expect(codeEditor.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(codeEditor.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            expect(codeEditor.value()).to.equal(LIB_COMMENT + NAME);
            expect(viewModel.get('code')).to.equal(codeEditor.value());
            // Change in the view Model
            viewModel.set('code', LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledOnce;
            expect(codeEditor.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(codeEditor.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            const clickable = element
                .find(kendo.roleSelector('dropdownlist'))
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
            expect(codeEditor.value()).to.equal(LIB_COMMENT + EQ_NAME);
            expect(viewModel.get('code')).to.equal(codeEditor.value());
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
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
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
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Events', () => {
        let element;
        let codeEditor;
        let change;
        const DUMMY = 'dummy';
        const EQ_NAME = LIBRARY[1].name;
        // var EQ_FORMULA = LIBRARY[1].formula;
        const FORMULA2 =
            'function validate(value, solution) {\n\treturn true;\n}';

        beforeEach(() => {
            change = sinon.spy();
            element = $(CODEEDITOR1).appendTo(FIXTURES);
            codeEditor = element
                .kendoCodeEditor({
                    dataSource: LIBRARY,
                    value: LIB_COMMENT + NAME,
                    default: LIB_COMMENT + NAME,
                    solution: SOLUTION
                })
                .data('kendoCodeEditor');
        });

        it('Change event', () => {
            expect(codeEditor).to.be.an.instanceof(CodeEditor);
            codeEditor.bind(CHANGE, e => {
                change(e.value);
            });
            codeEditor.value(LIB_COMMENT + EQ_NAME);
            expect(change).to.have.been.calledWith(LIB_COMMENT + EQ_NAME);
            codeEditor.value(FORMULA2);
            expect(change).to.have.been.calledWith(FORMULA2);
            codeEditor.value(DUMMY);
            expect(change).to.have.been.calledWith(LIB_COMMENT + NAME);
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
    });
});
