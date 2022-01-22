/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSCheck from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { PageComponent } from '../../../src/js/data/data.pagecomponent.es6';
import {
    getTextBox,
    getValidationLibrary,
} from '../../../src/js/helpers/helpers.data.es6';
import tools from '../../../src/js/tools/tools.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import CodeMirror from '../../../src/js/vendor/codemirror/lib/codemirror';
import '../../../src/js/widgets/widgets.codeeditor.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    roleSelector,
    ui: { CodeEditor, DropDownList, roles },
} = window.kendo;
const { expect } = chai;
const jsc = JSCheck();

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'codeeditor';
const WIDGET = 'kendoCodeEditor';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const TOOL = 'textbox';
const LIBRARY = getValidationLibrary();
const EQUAL = LIBRARY[1];
// const KEY = LIBRARY[4].key;
// const FORMULA = LIBRARY[4].formula;
const SOLUTIONS = [jsc.string()(), jsc.string()(), jsc.string()()];
const FORMULAS = [
    'function test(a, b) { return a + b; }',
    'function validate(value, solution) {\n\treturn true;\n}',
    'function validate(value,solution,all){\nreturn true;\n}',
];

describe('widgets.codeeditor', () => {
    before((done) => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
        // Load tool
        tools.load(TOOL).always(done);
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
            expect(element).to.have.class(`kj-${ROLE}`);
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
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]({
                dataSource: LIBRARY,
                value: new PageComponent(getTextBox()),
                solution: SOLUTIONS[0],
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
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
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.be.an.instanceof(PageComponent);
            expect(widget.value().get('properties.validation')).to.equal(
                TOOLS.LIB_COMMENT + EQUAL.key
            );
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
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
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
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.value()).to.be.undefined;
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                role: ROLE,
                solution: SOLUTIONS[0],
                source: JSON.stringify(LIBRARY),
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
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
                .to.have.property('testButton')
                .that.is.an.instanceof($);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.dataSource.total()).to.equal(LIBRARY.length);
            expect(widget.value()).to.be.undefined;
        });
    });

    describe('Methods', () => {
        let options;
        let element;
        let widget;

        beforeEach(() => {
            // We need to initialize options here to ensure textbox is loaded
            options = {
                dataSource: LIBRARY,
                solution: SOLUTIONS[0],
                value: new PageComponent(getTextBox()),
            };
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
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
            expect(widget.value()).to.be.an.instanceof(PageComponent);
            expect(widget.value().get('properties.validation')).to.equal(
                TOOLS.LIB_COMMENT + EQUAL.key
            );
            widget.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[2]]);
            expect(widget.value().get('properties.validation')).to.equal(
                TOOLS.LIB_COMMENT + EQUAL.key
            );
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
                    jsc.wun_of([
                        jsc.boolean(),
                        jsc.number(),
                        jsc.string(),
                        jsc.object(),
                        jsc.array(),
                    ])()
                );
            }
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('codeMirror')
                .that.is.an.instanceof(CodeMirror);
            expect(fn).to.throw(TypeError);
            expect(widget.value()).to.be.an.instanceof(PageComponent);
            expect(widget.value().get('properties.validation')).to.equal(
                TOOLS.LIB_COMMENT + EQUAL.name
            );
            expect(widget.codeMirror.getDoc().getValue()).to.equal(
                EQUAL.formula
            );
            widget.value().set('properties.validation', FORMULAS[1]);
            // TODO Does not work properly !!!! Does not refresh UI and CodeMirror
            // expect(widget.value()).to.equal(FORMULAS[2]);
            // expect(widget.dropDownList.text()).to.equal(widget.options.custom);
            // expect(widget.codeMirror.getDoc().getValue()).to.equal(FORMULAS[2]);
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(CodeEditor);
            widget.destroy();
            // TODO
            // expect(widget.codeMirror).to.be.undefined;
            // expect(widget.dataSource).to.be.undefined;
            expect(widget.dropDownList).to.be.undefined;
            // expect(widget.paramsContainer).to.be.undefined;
            // expect(widget.solutionWrapper).to.be.undefined;
            // expect(widget.valueInput).to.be.undefined;
            // expect(widget.testButton).to.be.undefined;
            // expect(widget.messageWrapper).to.be.undefined;
        });
    });

    xdescribe('MVVM (and UI interactions)', () => {
        const attributes = options2attributes({
            bind: 'source: library, value: component',
            role: ROLE,
        });
        let element;
        let widget;
        let change;
        let viewModel;

        beforeEach(() => {
            // We need to initialize viewModel here to ensure textbox is loaded
            viewModel = observable({
                library: LIBRARY,
                component: new PageComponent(getTextBox()),
            });
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            change = sinon.spy();
            viewModel.bind(CONSTANTS.CHANGE, change);
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change the widget value
            widget.value(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeEditor);
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
            // Change in the view Model
            viewModel.set('code', TOOLS.LIB_COMMENT + EQUAL.key);
            expect(change).to.have.been.calledOnce;
            expect(widget.value()).to.equal(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(viewModel.get('code')).to.equal(widget.value());
        });

        it('A change of dropdownlist value raises a change of viewModel', () => {
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(CodeEditor);
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
            scroll.simulate(CONSTANTS.CLICK, {
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y,
            });
            // $('textarea').simulate('keypress', { charCode: 97, keyCode: 97 }); // a
            // $('textarea').simulate('keypress', { charCode: 98, keyCode: 98 }); // b
            // $('textarea').simulate('keypress', { charCode: 99, keyCode: 99 }); // c
            // TODO: This does not work: quite complex
        });

        afterEach(() => {
            viewModel.unbind(CONSTANTS.CHANGE);
            viewModel.set('code', ''); // undefined would not work
        });
    });

    xdescribe('Events', () => {
        let options;
        let element;
        let widget;
        let change;

        beforeEach(() => {
            // We need to initialize options here to ensure textbox is loaded
            options = {
                dataSource: LIBRARY,
                solution: SOLUTIONS[0],
                value: new PageComponent(getTextBox()),
            };
            change = sinon.spy();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('Change event', () => {
            expect(widget).to.be.an.instanceof(CodeEditor);
            widget.bind(CONSTANTS.CHANGE, (e) => {
                change(e.value);
            });
            widget.value(TOOLS.LIB_COMMENT + EQUAL.key);
            expect(change).to.have.been.calledWith(
                TOOLS.LIB_COMMENT + EQUAL.key
            );
            widget.value(FORMULAS[1]);
            expect(change).to.have.been.calledWith(FORMULAS[1]);
            widget.value(SOLUTIONS[1]);
            expect(change).to.have.been.calledWith(
                TOOLS.LIB_COMMENT + EQUAL.key
            );
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
