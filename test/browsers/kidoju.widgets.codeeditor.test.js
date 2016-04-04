/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var CodeMirror = window.CodeMirror;
    var CodeEditor = ui.CodeEditor;
    var CHANGE = 'change';
    var CLICK = 'click';
    var FIXTURES = '#fixtures';
    var CODEEDITOR1 = '<div id="codeeditor1"></div>';
    var CODEEDITOR2 = '<div id="codeeditor2" data-role="codeeditor"></div>';
    var LIBRARY = [
        {
            name: 'custom',
            formula: 'function validate(value, solution, all) {\n\t// Your code should return true when value is validated against solution.\n}'
        },
        {
            name: 'intEqual',
            formula: 'function validate(value, solution) {\n\treturn parseInt(value, 10) === parseInt(solution, 10);\n}'
        },
        {
            name: 'floatEqual',
            formula: 'function validate(value, solution) {\n\treturn parseFloat(value) === parseFloat(solution);\n}'
        },
        {
            name: 'round2DecimalsEqual',
            formula: 'function validate(value, solution) {\n\treturn Math.round(parseFloat(value)*100)/100 === parseFloat(solution);\n}'
        },
        {
            name: 'greaterThan',
            formula: 'function validate(value, solution) {\n\treturn parseFloat(value) > parseFloat(solution);\n}'
        },
        {
            name: 'greaterThanOrEqual',
            formula: 'function validate(value, solution) {\n\treturn parseFloat(value) >= parseFloat(solution);\n}'
        },
        {
            name: 'lowerThan',
            formula: 'function validate(value, solution) {\n\treturn parseFloat(value) < parseFloat(solution);\n}'
        },
        {
            name: 'lowerThanOrEqual',
            formula: 'function validate(value, solution) {\n\treturn parseFloat(value) <= parseFloat(solution);\n}'
        }
    ];
    var JS_COMMENT = '// ';
    var NAME = LIBRARY[4].name;
    var FORMULA = LIBRARY[4].formula;
    var SOLUTION = '0';

    describe('kidoju.widgets.codeeditor', function () {

        before(function () {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function () {

            it('requirements', function () {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(CodeMirror).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect($.fn.kendoCodeEditor).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(CODEEDITOR1).appendTo(FIXTURES);
                var codeEditor = element.kendoCodeEditor().data('kendoCodeEditor');
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-codeeditor');
                expect(codeEditor).to.have.property('codeMirror').that.is.an.instanceof(CodeMirror);
                expect(codeEditor).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor).to.have.property('input').that.is.an.instanceof(jQuery);
                expect(codeEditor).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeEditor.dataSource.total()).to.equal(0);
                expect(codeEditor.value()).to.be.undefined;
                expect(codeEditor.input.val()).to.equal('');
            });

            it('from code with options', function () {
                var element = $(CODEEDITOR1).appendTo(FIXTURES);
                var codeEditor = element.kendoCodeEditor({ dataSource: LIBRARY, value: JS_COMMENT + NAME, solution: SOLUTION }).data('kendoCodeEditor');
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-codeeditor');
                expect(codeEditor).to.have.property('codeMirror').that.is.an.instanceof(CodeMirror);
                expect(codeEditor).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor).to.have.property('input').that.is.an.instanceof(jQuery);
                expect(codeEditor).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeEditor.dataSource.total()).to.equal(LIBRARY.length);
                // expect(codeEditor.dataSource.data()).to.deep.equal(LIBRARY);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(codeEditor.input.val()).to.equal(SOLUTION);
            });

            it('from markup', function () {
                var element = $(CODEEDITOR2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var codeEditor = element.data('kendoCodeEditor');
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-codeeditor');
                expect(codeEditor).to.have.property('codeMirror').that.is.an.instanceof(CodeMirror);
                expect(codeEditor).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor).to.have.property('input').that.is.an.instanceof(jQuery);
                expect(codeEditor).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeEditor.dataSource.total()).to.equal(0);
                expect(codeEditor.value()).to.be.undefined;
                expect(codeEditor.input.val()).to.equal('');
            });

            it('from markup with attributes', function () {
                var attr = {
                    'data-source': JSON.stringify(LIBRARY),
                    'data-default': 'floatEqual',
                    'data-solution': '1.5555',
                    'data-value': 'function validate(value, solution) {\\n\\treturn true;\\n}'
                };
                var element = $(CODEEDITOR2).attr(attr).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var codeEditor = element.data('kendoCodeEditor');
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-codeeditor');
                expect(codeEditor).to.have.property('codeMirror').that.is.an.instanceof(CodeMirror);
                expect(codeEditor).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor).to.have.property('input').that.is.an.instanceof(jQuery);
                expect(codeEditor).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeEditor.dataSource.total()).to.equal(LIBRARY.length);
                // expect(codeEditor.dataSource.data()).to.deep.equal(LIBRARY);
                expect(codeEditor.value()).to.equal(attr['data-value'].replace(/\\\\/g, '\\'));
                expect(codeEditor.input.val()).to.equal(attr['data-solution']);
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Methods', function () {

            var element;
            var codeEditor;
            var DUMMY = 'dummy';
            var EQ_NAME = LIBRARY[1].name;
            var EQ_FORMULA = LIBRARY[1].formula;
            var FORMULA1 = 'function test(a, b) { return a + b; }';
            var FORMULA2 = 'function validate(value, solution) {\n\treturn true;\n}';
            var FORMULA3 = 'function validate(value,solution,all){\nreturn true;\n}';

            beforeEach(function () {
                element = $(CODEEDITOR1).appendTo(FIXTURES);
                codeEditor = element.kendoCodeEditor({
                    dataSource: LIBRARY,
                    default: NAME,
                    solution: SOLUTION,
                    value: NAME
                }).data('kendoCodeEditor');
            });

            it('_isCustom: private method to check custom formula', function () {
                function fn() {
                    codeEditor._isCustom(100);
                }
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(fn).to.throw(TypeError);
                expect(codeEditor._isCustom(JS_COMMENT)).to.be.undefined;
                expect(codeEditor._isCustom(EQ_NAME)).to.be.undefined;
                expect(codeEditor._isCustom(JS_COMMENT + EQ_NAME)).to.be.undefined;
                expect(codeEditor._isCustom(FORMULA1)).to.be.undefined;
                expect(codeEditor._isCustom(FORMULA2)).to.equal(FORMULA2);
                expect(codeEditor._isCustom(FORMULA3)).to.equal(FORMULA3);
            });

            it('_isInLibrary: private method to check library formula', function () {
                function fn() {
                    codeEditor._isInLibrary(100);
                }
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(fn).to.throw(TypeError);
                expect(codeEditor._isInLibrary(JS_COMMENT)).to.be.undefined;
                expect(codeEditor._isInLibrary(DUMMY)).to.be.undefined;
                expect(codeEditor._isInLibrary(JS_COMMENT + DUMMY)).to.be.undefined;
                expect(codeEditor._isInLibrary(EQ_NAME)).to.be.undefined;
                expect(codeEditor._isInLibrary(FORMULA1)).to.be.undefined;
                expect(codeEditor._isInLibrary(FORMULA2)).to.be.undefined;
                expect(codeEditor._isInLibrary(FORMULA3)).to.be.undefined;
                expect(codeEditor._isInLibrary(JS_COMMENT + EQ_NAME)).to.equal(EQ_NAME);
            });

            it('setDataSource', function () {
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(codeEditor).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor.dropDownList).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor.dataSource).to.equal(codeEditor.dropDownList.dataSource);
                expect(codeEditor.dataSource.total()).to.equal(LIBRARY.length);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                codeEditor.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(codeEditor).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor.dropDownList).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeEditor.dataSource).to.equal(codeEditor.dropDownList.dataSource);
                expect(codeEditor.dataSource.total()).to.equal(3);
            });

            /* This function has too many statements. */
            /* jshint -W071 */
            it('value', function () {
                function fn1() {
                    codeEditor.value(100);
                }
                function fn2() {
                    codeEditor.value(null);
                }
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(codeEditor).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeEditor).to.have.property('codeMirror').that.is.an.instanceof(CodeMirror);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(TypeError);
                codeEditor.value(undefined);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(codeEditor.dropDownList.text()).to.equal(NAME);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
                codeEditor.value(JS_COMMENT);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(codeEditor.dropDownList.text()).to.equal(NAME);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
                codeEditor.value(JS_COMMENT + EQ_NAME);
                expect(codeEditor.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(codeEditor.dropDownList.text()).to.equal(EQ_NAME);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(EQ_FORMULA);
                // If the value is stupid it uses codeEditor.options.default
                codeEditor.value(JS_COMMENT + DUMMY);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(codeEditor.dropDownList.text()).to.equal(NAME);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
                codeEditor.value(FORMULA2);
                expect(codeEditor.value()).to.equal(FORMULA2);
                expect(codeEditor.dropDownList.text()).to.equal(codeEditor.options.custom);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA2);
                // If the value is stupid it uses codeEditor.options.default
                codeEditor.value(FORMULA1);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(codeEditor.dropDownList.text()).to.equal(NAME);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA);
                codeEditor.value(FORMULA3);
                expect(codeEditor.value()).to.equal(FORMULA3);
                expect(codeEditor.dropDownList.text()).to.equal(codeEditor.options.custom);
                expect(codeEditor.codeMirror.getDoc().getValue()).to.equal(FORMULA3);
            });
            /* jshint +W071 */

            xit('destroy', function () {
                // TODO
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions)', function () {

            var element;
            var codeEditor;
            var change;
            var EQ_NAME = LIBRARY[1].name;
            // var EQ_FORMULA = LIBRARY[1].formula;
            var viewModel = kendo.observable({
                library: LIBRARY,
                code: ''
            });

            beforeEach(function () {
                element = $(CODEEDITOR2)
                    .attr({
                        'data-bind': 'source: library, value: code',
                        'data-default': NAME
                    })
                    .appendTo(FIXTURES);
                kendo.bind(FIXTURES, viewModel);
                codeEditor = element.data('kendoCodeEditor');
                change = sinon.spy();
                viewModel.bind(CHANGE, change);
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(change).not.to.have.been.called;
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(viewModel.get('code')).to.equal(codeEditor.value());
                // Change the widget value
                codeEditor.value(JS_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledOnce;
                expect(codeEditor.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(codeEditor.value());
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(change).not.to.have.been.called;
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                expect(codeEditor.value()).to.equal(JS_COMMENT + NAME);
                expect(viewModel.get('code')).to.equal(codeEditor.value());
                // Change in the view Model
                viewModel.set('code', JS_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledOnce;
                expect(codeEditor.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(codeEditor.value());
            });

            it('A change of dropdownlist value raises a change of viewModel', function () {
                expect(change).not.to.have.been.called;
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                var clickable = element.find(kendo.roleSelector('dropdownlist')).parent();
                expect(clickable).to.match('span');
                clickable.simulate(CLICK);
                // a first click expands the list
                var list = $('div.k-list-container ul.k-list');
                expect(list).to.exist;
                var item = list.find('li:contains("' + EQ_NAME + '")');
                expect(item).to.exist;
                item.simulate(CLICK);
                // a second click closes the list and sets a new value
                expect(change).to.have.been.calledOnce;
                expect(codeEditor.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(codeEditor.value());
            });

            xit('A change of codemirror value raises a change of viewModel', function () {
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
                var scroll = $('div.CodeMirror div.CodeMirror-scroll');
                expect(scroll).to.exist;
                var lines = scroll.find('pre.CodeMirror-line');
                expect(lines).to.exist;
                expect(lines).to.have.property('length', 3);
                var line = $(lines.get(1)); // second line
                expect(line).to.exist;
                var x = 304; // line.offset().left + line.width() / 2; // 300
                var y = 617; // line.offset().top + line.height() / 2; // 620
                scroll.simulate(CLICK, { clientX: x, clientY: y, pageX: x, pageY: y });
                // $('textarea').simulate('keypress', { charCode: 97, keyCode: 97 }); // a
                // $('textarea').simulate('keypress', { charCode: 98, keyCode: 98 }); // b
                // $('textarea').simulate('keypress', { charCode: 99, keyCode: 99 }); // c
                // TODO: This does not work: quite complex
            });

            afterEach(function () {
                viewModel.unbind(CHANGE);
                viewModel.set('code', ''); // undefined would not work
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Events', function () {

            var element;
            var codeEditor;
            var change;
            var DUMMY = 'dummy';
            var EQ_NAME = LIBRARY[1].name;
            // var EQ_FORMULA = LIBRARY[1].formula;
            var FORMULA2 = 'function validate(value, solution) {\n\treturn true;\n}';

            beforeEach(function () {
                change = sinon.spy();
                element = $(CODEEDITOR1).appendTo(FIXTURES);
                codeEditor = element.kendoCodeEditor({
                    dataSource: LIBRARY,
                    value: NAME,
                    default: NAME,
                    solution: SOLUTION
                }).data('kendoCodeEditor');
            });

            it('Change event', function () {
                expect(codeEditor).to.be.an.instanceof(CodeEditor);
                codeEditor.bind(CHANGE, function (e) {
                    change(e.value);
                });
                codeEditor.value(JS_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledWith(JS_COMMENT + EQ_NAME);
                codeEditor.value(FORMULA2);
                expect(change).to.have.been.calledWith(FORMULA2);
                codeEditor.value(DUMMY);
                expect(change).to.have.been.calledWith(JS_COMMENT + NAME);
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

    });

}(this, jQuery));
