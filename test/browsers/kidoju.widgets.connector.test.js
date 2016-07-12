/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var Connector = ui.Connector;
    var FIXTURES = '#fixtures';
    var ELEMENT_DIV = '<div class="kj-stage" style="position:relative;height:300px;width:300px;transform:scale(0.75);">' +
                    '<div data-role="stage" style="height:300px;width:300px;">' +
                    '<div class="kj-element" style="position:absolute;top:50px;left:50px;height:50px;width:50px;">' +
                    '</div></div></div>';
    var STAGE = FIXTURES + ' div' + kendo.roleSelector('stage');
    var ELEMENT = STAGE + '>div.kj-element';
    var CONNECTOR1 = '<div id="connector1"></div>';
    var CONNECTOR2 = '<div id="connector2" data-role="connector"></div>';

    describe('kidoju.widgets.connector', function () {

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
                expect($.fn.kendoConnector).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            beforeEach(function () {
                $(FIXTURES).append(ELEMENT_DIV);
            });

            it('from code', function () {
                var element = $(CONNECTOR1).appendTo(ELEMENT);
                var connector = element.kendoConnector().data('kendoConnector');
                expect(connector).to.be.an.instanceof(Connector);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-connector');
                expect(connector).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                expect(connector.value()).to.be.null;
            });

            it('from code with options', function () {
                var element = $(CONNECTOR1).appendTo(ELEMENT);
                var connector = element.kendoConnector({ color: '#000000' }).data('kendoConnector');
                expect(connector).to.be.an.instanceof(Connector);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-connector');
                expect(connector).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                // expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                // expect(connector.dataSource.total()).to.equal(LIBRARY.length);
                // expect(connector.dataSource.data()).to.deep.equal(LIBRARY);
                expect(connector.value()).to.be.null;
            });

            it('from markup', function () {
                var element = $(CONNECTOR2).appendTo(ELEMENT);
                kendo.init(FIXTURES);
                var connector = element.data('kendoConnector');
                expect(connector).to.be.an.instanceof(Connector);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-connector');
                expect(connector).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                // expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                // expect(connector.dataSource.total()).to.equal(0);
                expect(connector.value()).to.be.null;
            });

            it('from markup with data attributes', function () {
                var attr = {
                    'data-color': '#000000'
                };
                var element = $(CONNECTOR2).attr(attr).appendTo(ELEMENT);
                kendo.init(FIXTURES);
                var connector = element.data('kendoConnector');
                expect(connector).to.be.an.instanceof(Connector);
                expect(element).not.to.have.class('k-widget');
                expect(element).to.have.class('kj-connector');
                expect(connector).to.have.property('wrapper').that.is.an.instanceof(jQuery);
                // expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                // expect(connector.dataSource.total()).to.equal(LIBRARY.length);
                // expect(connector.dataSource.data()).to.deep.equal(LIBRARY);
                expect(connector.value()).to.be.null;
            });

            afterEach(function () {
                $(FIXTURES).empty();
            });

        });

        xdescribe('Methods', function () {

            var element;
            var connector;
            var DUMMY = 'dummy';
            var EQ_NAME = LIBRARY[1].name;
            var EQ_FORMULA = LIBRARY[1].formula;
            var FORMULA1 = 'function test(a, b) { return a + b; }';
            var FORMULA2 = 'function validate(value, solution) {\n\treturn true;\n}';
            var FORMULA3 = 'function validate(value,solution,all){\nreturn true;\n}';

            beforeEach(function () {
                element = $(CONNECTOR1).appendTo(FIXTURES);
                connector = element.kendoConnector({
                    dataSource: LIBRARY,
                    default: NAME,
                    value: NAME
                }).data('kendoConnector');
            });

            it('_isCustom: private method to check custom formula', function () {
                function fn() {
                    connector._isCustom(100);
                }
                expect(connector).to.be.an.instanceof(Connector);
                expect(fn).to.throw(TypeError);
                expect(connector._isCustom(JS_COMMENT)).to.be.undefined;
                expect(connector._isCustom(EQ_NAME)).to.be.undefined;
                expect(connector._isCustom(JS_COMMENT + EQ_NAME)).to.be.undefined;
                expect(connector._isCustom(FORMULA1)).to.be.undefined;
                expect(connector._isCustom(FORMULA2)).to.equal(FORMULA2);
                expect(connector._isCustom(FORMULA3)).to.equal(FORMULA3);
            });

            it('_isInLibrary: private method to check library formula', function () {
                function fn() {
                    connector._isInLibrary(100);
                }
                expect(connector).to.be.an.instanceof(Connector);
                expect(fn).to.throw(TypeError);
                expect(connector._isInLibrary(JS_COMMENT)).to.be.undefined;
                expect(connector._isInLibrary(DUMMY)).to.be.undefined;
                expect(connector._isInLibrary(JS_COMMENT + DUMMY)).to.be.undefined;
                expect(connector._isInLibrary(EQ_NAME)).to.be.undefined;
                expect(connector._isInLibrary(FORMULA1)).to.be.undefined;
                expect(connector._isInLibrary(FORMULA2)).to.be.undefined;
                expect(connector._isInLibrary(FORMULA3)).to.be.undefined;
                expect(connector._isInLibrary(JS_COMMENT + EQ_NAME)).to.equal(EQ_NAME);
            });

            it('setDataSource', function () {
                expect(connector).to.be.an.instanceof(Connector);
                expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(connector).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(connector.dropDownList).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(connector.dataSource).to.equal(connector.dropDownList.dataSource);
                expect(connector.dataSource.total()).to.equal(LIBRARY.length);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                connector.setDataSource([LIBRARY[0], LIBRARY[1], LIBRARY[4]]);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(connector).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(connector).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(connector.dropDownList).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
                expect(connector.dataSource).to.equal(connector.dropDownList.dataSource);
                expect(connector.dataSource.total()).to.equal(3);
            });

            /* This function has too many statements. */
            /* jshint -W071 */
            it('value', function () {
                function fn1() {
                    connector.value(100);
                }
                function fn2() {
                    connector.value(null);
                }
                expect(connector).to.be.an.instanceof(Connector);
                expect(connector).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(TypeError);
                connector.value(undefined);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(connector.dropDownList.text()).to.equal(NAME);
                expect(connector.dropDownList.wrapper).to.be.visible;
                expect(connector.input).not.to.be.visible;
                connector.value(JS_COMMENT);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(connector.dropDownList.text()).to.equal(NAME);
                expect(connector.dropDownList.wrapper).to.be.visible;
                expect(connector.input).not.to.be.visible;
                connector.value(JS_COMMENT + EQ_NAME);
                expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(connector.dropDownList.text()).to.equal(EQ_NAME);
                expect(connector.dropDownList.wrapper).to.be.visible;
                expect(connector.input).not.to.be.visible;
                // If the value is stupid it uses connector.options.default
                connector.value(JS_COMMENT + DUMMY);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(connector.dropDownList.text()).to.equal(NAME);
                expect(connector.dropDownList.wrapper).to.be.visible;
                expect(connector.input).not.to.be.visible;
                connector.value(FORMULA2);
                expect(connector.value()).to.equal(FORMULA2);
                expect(connector.dropDownList.wrapper).not.to.be.visible;
                expect(connector.input).to.be.visible;
                // If the value is stupid it uses connector.options.default
                connector.value(FORMULA1);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(connector.dropDownList.text()).to.equal(NAME);
                expect(connector.dropDownList.wrapper).to.be.visible;
                expect(connector.input).not.to.be.visible;
                connector.value(FORMULA3);
                expect(connector.value()).to.equal(FORMULA3);
                expect(connector.dropDownList.wrapper).not.to.be.visible;
                expect(connector.input).to.be.visible;
            });
            /* jshint +W071 */

            xit('destroy', function () {
                // TODO
            });

        });

        xdescribe('MVVM (and UI interactions)', function () {

            var element;
            var connector;
            var change;
            var EQ_NAME = LIBRARY[1].name;
            // var EQ_FORMULA = LIBRARY[1].formula;
            var viewModel = kendo.observable({
                library: LIBRARY,
                code: ''
            });

            beforeEach(function () {
                element = $(CONNECTOR2)
                    .attr({
                        'data-bind': 'source: library, value: code',
                        'data-default': NAME
                    })
                    .appendTo(FIXTURES);
                kendo.bind(FIXTURES, viewModel);
                connector = element.data('kendoConnector');
                change = sinon.spy();
                viewModel.bind(CHANGE, change);
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(change).not.to.have.been.called;
                expect(connector).to.be.an.instanceof(Connector);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(viewModel.get('code')).to.equal(connector.value());
                // Change the widget value
                connector.value(JS_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledOnce;
                expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(connector.value());
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(change).not.to.have.been.called;
                expect(connector).to.be.an.instanceof(Connector);
                expect(connector.value()).to.equal(JS_COMMENT + NAME);
                expect(viewModel.get('code')).to.equal(connector.value());
                // Change in the view Model
                viewModel.set('code', JS_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledOnce;
                expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(connector.value());
            });

            it('A change of dropdownlist value raises a change of viewModel', function () {
                expect(change).not.to.have.been.called;
                expect(connector).to.be.an.instanceof(Connector);
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
                expect(connector.value()).to.equal(JS_COMMENT + EQ_NAME);
                expect(viewModel.get('code')).to.equal(connector.value());
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

        xdescribe('Events', function () {

            var element;
            var connector;
            var change;
            var DUMMY = 'dummy';
            var EQ_NAME = LIBRARY[1].name;
            // var EQ_FORMULA = LIBRARY[1].formula;
            var FORMULA2 = 'function validate(value, solution) {\n\treturn true;\n}';

            beforeEach(function () {
                change = sinon.spy();
                element = $(CONNECTOR1).appendTo(FIXTURES);
                connector = element.kendoConnector({
                    dataSource: LIBRARY,
                    value: NAME,
                    default: NAME,
                    solution: SOLUTION
                }).data('kendoConnector');
            });

            it('Change event', function () {
                expect(connector).to.be.an.instanceof(Connector);
                connector.bind(CHANGE, function (e) {
                    change(e.value);
                });
                connector.value(JS_COMMENT + EQ_NAME);
                expect(change).to.have.been.calledWith(JS_COMMENT + EQ_NAME);
                connector.value(FORMULA2);
                expect(change).to.have.been.calledWith(FORMULA2);
                connector.value(DUMMY);
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
