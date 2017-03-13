/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var CodeInput = ui.CodeInput;
    var CHANGE = 'change';
    var CLICK = 'click';
    var FIXTURES = '#fixtures';
    var CODEINPUT1 = '<div id="codeinput1"></div>';
    var CODEINPUT2 = '<div id="codeinput2" data-role="codeinput"></div>';
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
        },
        {
            name: 'withParam',
            formula: 'function validate(value, solution) {\n\treturn /{0}/i.test(value);\n}',
            param: 'RegExp'
        }
    ];
    var LIB_COMMENT = '// ';
    var NAME = LIBRARY[4].name;
    var FORMULA = LIBRARY[4].formula;
    var SOLUTION = '0';

    describe('kidoju.widgets.codeinput', function () {

        before(function () {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function () {

            it('requirements', function () {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect($.fn.kendoCodeInput).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(CODEINPUT1).appendTo(FIXTURES);
                var codeInput = element.kendoCodeInput().data('kendoCodeInput');
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-codeinput');
                expect(codeInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeInput).to.have.property('customInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('paramInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeInput.dataSource.total()).to.equal(0);
                expect(codeInput.value()).to.be.undefined;
                expect(codeInput.customInput.val()).to.equal(codeInput.options.custom);
            });

            it('from code with options', function () {
                var element = $(CODEINPUT1).appendTo(FIXTURES);
                var codeInput = element.kendoCodeInput({ dataSource: LIBRARY, value: LIB_COMMENT + NAME, solution: SOLUTION }).data('kendoCodeInput');
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-codeinput');
                expect(codeInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeInput).to.have.property('customInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('paramInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeInput.dataSource.total()).to.equal(LIBRARY.length);
                expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
                expect(codeInput.customInput.val()).to.equal(codeInput.options.custom);
            });

            it('from markup', function () {
                var element = $(CODEINPUT2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var codeInput = element.data('kendoCodeInput');
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-codeinput');
                expect(codeInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeInput).to.have.property('customInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('paramInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeInput.dataSource.total()).to.equal(0);
                expect(codeInput.value()).to.be.undefined;
                expect(codeInput.customInput.val()).to.equal(codeInput.options.custom);
            });

            it('from markup with data attributes', function () {
                var attr = {
                    'data-source': JSON.stringify(LIBRARY),
                    'data-default': 'floatEqual',
                    'data-value': 'function validate(value, solution) {\\n\\treturn true;\\n}'
                };
                var element = $(CODEINPUT2).attr(attr).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var codeInput = element.data('kendoCodeInput');
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-codeinput');
                expect(codeInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeInput).to.have.property('customInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('paramInput').that.is.an.instanceof(jQuery);
                expect(codeInput).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(codeInput.dataSource.total()).to.equal(LIBRARY.length);
                expect(codeInput.value()).to.equal(attr['data-value'].replace(/\\\\/g, '\\'));
                expect(codeInput.customInput.val()).to.equal(codeInput.options.custom);
            });

        });

        describe('Methods', function () {

            var element;
            var codeInput;
            var DUMMY = 'dummy';
            var EQ_NAME = LIBRARY[1].name;
            var EQ_FORMULA = LIBRARY[1].formula;
            var FORMULA1 = 'function test(a, b) { return a + b; }';
            var FORMULA2 = 'function validate(value, solution) {\n\treturn true;\n}';
            var FORMULA3 = 'function validate(value,solution,all){\nreturn true;\n}';

            beforeEach(function () {
                element = $(CODEINPUT1).appendTo(FIXTURES);
                codeInput = element.kendoCodeInput({
                    dataSource: LIBRARY,
                    default: LIB_COMMENT + NAME,
                    value: NAME
                }).data('kendoCodeInput');
            });

            it('_isCustom: private method to check custom formula', function () {
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

            it('_parseLibraryValue: private method to check library formula', function () {
                function fn() {
                    codeInput._parseLibraryValue(100);
                }
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(fn).to.throw(TypeError);
                expect(codeInput._parseLibraryValue(LIB_COMMENT).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(DUMMY).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(LIB_COMMENT + DUMMY).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(EQ_NAME).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(FORMULA1).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(FORMULA2).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(FORMULA3).item).to.be.undefined;
                expect(codeInput._parseLibraryValue(LIB_COMMENT + EQ_NAME).item).not.to.be.undefined;
                expect(codeInput._parseLibraryValue(LIB_COMMENT + EQ_NAME).item.name).to.equal(EQ_NAME);
                expect(codeInput._parseLibraryValue(LIB_COMMENT + EQ_NAME).item.formula).to.equal(EQ_FORMULA);
            });

            it('setDataSource', function () {
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(codeInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeInput.dropDownList).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput.dataSource).to.equal(codeInput.dropDownList.dataSource);
                expect(codeInput.dataSource.total()).to.equal(LIBRARY.length);
                expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
                codeInput.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
                expect(codeInput.value()).to.equal(LIB_COMMENT + NAME);
                expect(codeInput).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(codeInput.dropDownList).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(codeInput.dataSource).to.equal(codeInput.dropDownList.dataSource);
                expect(codeInput.dataSource.total()).to.equal(3);
            });

            /* This function has too many statements. */
            /* jshint -W071 */

            it('value', function () {
                // TODO: paramInput
                function fn1() {
                    codeInput.value(100);
                }
                function fn2() {
                    codeInput.value(null);
                }
                expect(codeInput).to.be.an.instanceof(CodeInput);
                expect(codeInput).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
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

            it('destroy', function () {
                expect(codeInput).to.be.an.instanceof(CodeInput);
                codeInput.destroy();
                expect(codeInput.dataSource).to.be.undefined;
                expect(codeInput.dropDownList).to.be.undefined;
                expect(codeInput.customInput).to.be.undefined;
                expect(codeInput.paramInput).to.be.undefined;
            });

        });

        describe('MVVM (and UI interactions)', function () {

            var element;
            var codeInput;
            var change;
            var EQ_NAME = LIBRARY[1].name;
            // var EQ_FORMULA = LIBRARY[1].formula;
            var viewModel = kendo.observable({
                library: LIBRARY,
                code: ''
            });

            beforeEach(function () {
                element = $(CODEINPUT2)
                    .attr({
                        'data-bind': 'source: library, value: code',
                        'data-default': LIB_COMMENT + NAME
                    })
                    .appendTo(FIXTURES);
                kendo.bind(FIXTURES, viewModel);
                codeInput = element.data('kendoCodeInput');
                change = sinon.spy();
                viewModel.bind(CHANGE, change);
            });

            it('A change of widget value raises a change in the viewModel', function () {
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

            it('A change in the viewModel raises a change of widget value', function () {
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

            it('A change of dropdownlist value raises a change of viewModel', function () {
                expect(change).not.to.have.been.called;
                expect(codeInput).to.be.an.instanceof(CodeInput);
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
                expect(codeInput.value()).to.equal(LIB_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(codeInput.value());
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
            var codeInput;
            var change;
            var DUMMY = 'dummy';
            var EQ_NAME = LIBRARY[1].name;
            // var EQ_FORMULA = LIBRARY[1].formula;
            var FORMULA2 = 'function validate(value, solution) {\n\treturn true;\n}';

            beforeEach(function () {
                change = sinon.spy();
                element = $(CODEINPUT1).appendTo(FIXTURES);
                codeInput = element.kendoCodeInput({
                    dataSource: LIBRARY,
                    value: LIB_COMMENT + NAME,
                    default: LIB_COMMENT + NAME,
                    solution: SOLUTION
                }).data('kendoCodeInput');
            });

            it('Change event', function () {
                expect(codeInput).to.be.an.instanceof(CodeInput);
                codeInput.bind(CHANGE, function (e) {
                    change(e.value);
                });
                codeInput.value(LIB_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledWith(LIB_COMMENT + EQ_NAME);
                codeInput.value(FORMULA2);
                expect(change).to.have.been.calledWith(FORMULA2);
                codeInput.value(DUMMY);
                expect(change).to.have.been.calledWith(LIB_COMMENT + NAME);
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
