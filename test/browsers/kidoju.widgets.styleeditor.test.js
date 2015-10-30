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
    var StyleEditor = ui.StyleEditor;
    var FIXTURES = '#fixtures';
    var STYLEEDITOR1 = '<div id="styleeditor1"></div>';
    var STYLEEDITOR2 = '<div id="styleeditor2" data-role="styleeditor"></div>';

    describe('kidoju.widgets.styleeditor', function () {

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
                expect($.fn.kendoComboBox).to.be.an.instanceof(Function);
                expect($.fn.kendoGrid).to.be.an.instanceof(Function);
                expect($.fn.kendoStyleEditor).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(STYLEEDITOR1).appendTo(FIXTURES);
                var styleEditor = element.kendoStyleEditor().data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal('');
                expect(styleEditor.grid).to.be.an.instanceof(kendo.ui.Grid);
                expect(styleEditor.grid.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(styleEditor.grid.dataSource.total()).to.equal(0);
                expect(styleEditor.grid.columns).to.be.an.instanceof(Array).with.property('length', 2);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('k-grid');
                expect(element).to.have.class('kj-styleeditor');
                expect(styleEditor.wrapper.height()).to.equal(styleEditor.options.height);
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add')).to.exist;
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')).to.exist;
            });

            it('from code with options', function () {
                var options = {
                    value: 'color:#FF0000;border:1px solid rgb(255, 0, 0);',
                    height: 500
                };
                var element = $(STYLEEDITOR1).appendTo(FIXTURES);
                var styleEditor = element.kendoStyleEditor(options).data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal(options.value);
                expect(styleEditor.grid).to.be.an.instanceof(kendo.ui.Grid);
                expect(styleEditor.grid.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(styleEditor.grid.dataSource.total()).to.equal(2);
                expect(styleEditor.grid.columns).to.be.an.instanceof(Array).with.property('length', 2);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('k-grid');
                expect(element).to.have.class('kj-styleeditor');
                expect(styleEditor.wrapper.height()).to.equal(options.height);
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add')).to.exist;
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')).to.exist;
            });

            it('from markup', function () {
                var element = $(STYLEEDITOR2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var styleEditor = element.data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal('');
                expect(styleEditor.grid).to.be.an.instanceof(kendo.ui.Grid);
                expect(styleEditor.grid.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(styleEditor.grid.dataSource.total()).to.equal(0);
                expect(styleEditor.grid.columns).to.be.an.instanceof(Array).with.property('length', 2);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('k-grid');
                expect(element).to.have.class('kj-styleeditor');
                expect(styleEditor.wrapper.height()).to.equal(styleEditor.options.height);
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add')).to.exist;
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')).to.exist;
            });

            it('from markup with attributes', function () {
                var attributes = {
                    'data-value': 'color:#FF0000;border:1px solid rgb(255, 0, 0);',
                    'data-height': 500
                };
                var element = $(STYLEEDITOR2).attr(attributes).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var styleEditor = element.data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal(attributes['data-value']);
                expect(styleEditor.grid).to.be.an.instanceof(kendo.ui.Grid);
                expect(styleEditor.grid.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(styleEditor.grid.dataSource.total()).to.equal(2);
                expect(styleEditor.grid.columns).to.be.an.instanceof(Array).with.property('length', 2);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('k-grid');
                expect(element).to.have.class('kj-styleeditor');
                expect(styleEditor.wrapper.height()).to.equal(styleEditor.options.height);
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add')).to.exist;
                expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')).to.exist;
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
            var styleEditor;
            var options = {
                value: 'color:#FF0000;border:1px solid rgb(255, 0, 0);'
            };

            beforeEach(function () {
                element = $(STYLEEDITOR1).appendTo(FIXTURES);
                styleEditor = element.kendoStyleEditor(options).data('kendoStyleEditor');
            });

            it('value', function () {
                function fn1() {
                    styleEditor.value(0);
                }
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal(options.value);
                expect(styleEditor.grid.dataSource.total()).to.equal(2);
                expect(fn1).to.throw(TypeError);
                styleEditor.value('dummy');
                expect(styleEditor.value()).to.equal('');
                expect(styleEditor.grid.dataSource.total()).to.equal(0);
                var value = 'background-color:#0000FF;opacity:0.5;font-size:normal;';
                styleEditor.value(value);
                expect(styleEditor.value()).to.equal(value);
                expect(styleEditor.grid.dataSource.total()).to.equal(3);
            });

            it('destroy', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                styleEditor.destroy();
                expect(element).to.be.empty;
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI Interactions)', function () {

            var element;
            var styleEditor;
            var viewModel;
            var change;
            var attributes = {
                'data-bind': 'value: style',
                'data-height': 500
            };

            beforeEach(function () {
                change = sinon.spy();
                element = $(STYLEEDITOR2).attr(attributes).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    style: 'color:#FF0000;border:1px solid rgb(255, 0, 0);'
                });
                kendo.bind(FIXTURES, viewModel);
                styleEditor = element.data('kendoStyleEditor');
                viewModel.bind('change', function () {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal(viewModel.get('style'));
                expect(styleEditor.grid.dataSource.total()).to.equal(2);
                expect(change).to.have.not.been.called;
                var value = 'background-color:#0000FF;opacity:0.5;font-size:normal;';
                viewModel.set('style', value);
                expect(viewModel.get('style')).to.equal(value);
                expect(styleEditor.value()).to.equal(value);
                expect(styleEditor.grid.dataSource.total()).to.equal(3);
                expect(change).to.have.been.calledOnce;
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(styleEditor.value()).to.equal(viewModel.get('style'));
                expect(styleEditor.grid.dataSource.total()).to.equal(2);
                expect(change).to.have.not.been.called;
                var value = 'background-color:#0000FF;opacity:0.5;font-size:normal;';
                styleEditor.value(value);
                expect(viewModel.get('style')).to.equal(value);
                expect(styleEditor.value()).to.equal(value);
                expect(styleEditor.grid.dataSource.total()).to.equal(3);
                expect(change).to.have.been.calledOnce;
            });

            it('New style', function () {
                var oldStyle = viewModel.get('style');
                var newStyle = { name: 'opacity', value: '0.5' };
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(change).not.to.have.been.called;
                var rows = styleEditor.grid.tbody.find('tr[role="row"]').length;
                // Click add button
                element.find('div.k-grid-toolbar > a.k-button.k-grid-add').simulate('click');
                // Fill name cell in new row
                var nameCell = styleEditor.grid.tbody.find('td[role="gridcell"]:eq(0)');
                nameCell.simulate('click');
                var nameInput = nameCell.find('input[role="combobox"]');
                nameInput.focus();
                nameInput.val(newStyle.name);
                nameInput.simulate('keydown', { keyCode: 13 });
                nameInput.focusout();
                // Fill second cell in new row
                var valueCell = styleEditor.grid.tbody.find('td[role="gridcell"]:eq(1)');
                valueCell.simulate('click');
                valueCell.find('input').val(newStyle.value).trigger('change');
                // Check data
                expect(viewModel.get('style')).to.equal(newStyle.name + ':' + newStyle.value + ';' + oldStyle);
                expect(styleEditor._dataSource.total()).to.equal(rows + 1);
                var data = styleEditor._dataSource.data();
                expect(data[0].name).to.equal(newStyle.name);
                expect(data[0].value).to.equal(newStyle.value);
                expect(change).to.have.been.calledOnce;
            });

            it('Delete', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(change).not.to.have.been.called;
                var count = 0;
                while (styleEditor.grid.dataSource.total() > 0) {
                    // Click row
                    styleEditor.grid.tbody.find('td[role="gridcell"]').first().simulate('click');
                    // Click delete button
                    element.find('div.k-grid-toolbar > a.k-button.k-grid-delete').simulate('click');
                    count++;
                }
                expect(change).to.have.callCount(count);
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Events', function () {

            var element;
            var styleEditor;
            var options;
            var change;

            beforeEach(function () {
                change = sinon.spy();
                element = $(STYLEEDITOR1).appendTo(FIXTURES);
                styleEditor = element.kendoStyleEditor(options).data('kendoStyleEditor');
            });

            it('Change', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(change).not.to.have.been.called;
                styleEditor.bind('change', function () {
                    change();
                });
                styleEditor.value('background-color:#0000FF;');
                expect(change).to.have.been.calledOnce;
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
