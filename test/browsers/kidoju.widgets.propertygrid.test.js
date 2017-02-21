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
    var PropertyGrid = ui.PropertyGrid;
    // ObservableArray = kendo.data.ObservableArray,
    var kidoju = window.kidoju;
    var tools = kidoju.tools;
    var Page = kidoju.data.Page;
    var PageComponent = kidoju.data.PageComponent;
    var FIXTURES = '#fixtures';
    var PROPERTYGRID1 = '<div></div>';
    var PROPERTYGRID2 = '<div data-role="propertygrid" data-bind="value: current"></div>';

    function validateGridHtml(element, rowCount) {
        expect(element).to.have.class('k-widget');
        expect(element).to.have.class('k-grid');
        expect(element).to.have.class('kj-propertygrid');
        expect(element.find('div.k-grid-header>div.k-grid-header-wrap>table>colgroup>col')).to.be.an.instanceof($).with.property('length', 2);
        expect(element.find('div.k-grid-header>div.k-grid-header-wrap>table>thead>tr>th')).to.be.an.instanceof($).with.property('length', 2);
        expect(element.find('div.k-grid-content>table>colgroup>col')).to.be.an.instanceof($).with.property('length', 2);
        if (rowCount) {
            expect(element.find('div.k-grid-content>table>tbody>tr')).to.be.an.instanceof($).with.property('length', rowCount);
            expect(element.find('div.k-grid-content>table>tbody>tr>td')).to.be.an.instanceof($).with.property('length', 2 * rowCount);
        } else {
            expect(element.find('div.k-grid-content>table>tbody')).to.be.empty;
        }
    }

    describe('kidoju.widgets.propertygrid', function () {

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
                expect(kidoju).not.to.be.undefined;
                expect(tools).not.to.be.undefined;
                expect(Page).not.to.be.undefined;
                expect(PageComponent).not.to.be.undefined;
                expect($.fn.kendoPropertyGrid).to.be.an.instanceof(Function);
            });

        });

        describe('Basic Initialization', function () {

            it('from code without option', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid().data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 0);
            });

            it('from code with bad options', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid([]).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 0);
            });

        });

        describe('String Initialization', function () {

            it('string object value', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' }
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample);
                expect(input).to.have.attr('type', 'text');
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal('Sample');
            });

            it('string object value with basic rows options (title only)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        { field: 'sample', title: 'Another sample' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample);
                expect(input).to.have.attr('type', 'text');
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('string object value with textarea editor', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        { field: 'sample', title: 'Another sample', editor: 'textarea' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('textarea[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample);
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('string object value with span editor and attributes', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        { field: 'sample', title: 'Another sample', editor: 'span', attributes: { style: 'color: red;' } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var span = row.find('span[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(span).to.exist;
                expect(span.attr(kendo.attr('bind'))).to.match(new RegExp('^text:[\\s]*' + keys[0] + '$'));
                expect(span).to.have.text(value.sample);
                expect(span).to.have.css('color', 'rgb(255, 0, 0)');
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('string object value with kendo widget (color picker)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: '#ffffff' },
                    rows: [
                        { field: 'sample', editor: 'colorpicker' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample);
                expect(row.find('input[' + kendo.attr('role') + ']').attr(kendo.attr('role'))).to.equal('colorpicker');
                expect(title).to.equal('Sample');
            });

            it('string object value with custom widget', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'W1N 1AC' },
                    rows: [
                        { field: 'sample', editor: function (container, options) {
                            $('<input data-bind="value: ' + options.field + '"/>')
                                .appendTo(container)
                                .kendoMaskedTextBox({
                                    mask: 'L0L 0LL'
                                });
                        } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample);
                expect(row.find('[' + kendo.attr('role') + ']')).to.have.attr(kendo.attr('role'), 'maskedtextbox');
                expect(title).to.equal('Sample');
            });

            it('string object value with data model', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var Sample = kendo.data.Model.define({
                    id: 'sample',
                    fields: {
                        sample: {
                            type: 'string',
                            editable: false
                        }
                    }
                });
                var propertyGrid = element.kendoPropertyGrid({
                    value: new Sample({ sample: 'Sample' }),
                    rows: [{ field: 'sample' }]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var span = row.find('span[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                // Kendo UI v2015.3.930 data models now have _handlers
                expect(keys).to.be.an.instanceof(Array).with.property('length', 5 + (value.hasOwnProperty('_handlers') ? 1 : 0)); // including _events, _handlers, uid, dirty and id
                expect(row).to.exist;
                expect(input).not.to.exist;
                expect(span).to.exist;
                expect(span.attr(kendo.attr('bind'))).to.match(new RegExp('^text:[\\s]*' + keys[1 + (value.hasOwnProperty('_handlers') ? 1 : 0)] + '$'));
                expect(span).to.have.text(value.sample);
            });

            it('string object value with template', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [{ field: 'sample', template: '<div style="border: dashed 1px \\#000000;" data-bind="text: sample"></div>' }]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var div = row.find('div[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1); // including _events, uid, dirty and id
                expect(row).to.exist;
                expect(input).not.to.exist;
                expect(div).to.exist;
                expect(div.attr(kendo.attr('bind'))).to.match(new RegExp('^text:[\\s]*' + keys[0] + '$'));
                expect(div).to.have.text(value.sample);
            });

            xit('string object value with basic rows options (title only)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: { subvalue: 'Sample' } },
                    rows: [
                        { field: 'sample.subvalue', title: 'Another sample' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample.subvalue).to.be.a('string');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*sample\.subvalue$'));
                expect(input).to.have.value(value.sample.subvalue);
                expect(input).to.have.attr('type', 'text');
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

        });

        describe('Number Initialization', function () {

            it('number object value', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 3 }
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('number');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample.toString());
                expect(input).to.have.attr('type', 'text');
                expect(row.find('[' + kendo.attr('role') + ']')).to.have.attr(kendo.attr('role'), 'numerictextbox');
                expect(title).to.equal('Sample');
            });

            it('number object value with basic rows options (title only)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 5.41 },
                    rows: [
                        { field: 'sample', title: 'Another sample' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('number');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample.toString());
                expect(input).to.have.attr('type', 'text');
                expect(row.find('input[' + kendo.attr('role') + ']').attr(kendo.attr('role'))).to.equal('numerictextbox');
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('number object value with kendo editor (slider)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 5.41 },
                    rows: [
                        { field: 'sample', title: 'Slider', editor: 'slider' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('number');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample.toString());
                expect(input).to.have.attr('type', 'text');
                expect(row.find('input[' + kendo.attr('role') + ']').attr(kendo.attr('role'))).to.equal('slider');
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('number object value with custom widget', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 3 },
                    rows: [
                        { field: 'sample', title: 'Category', editor: function (container, options) {
                            $('<input data-bind="value: ' + options.field + '"/>')
                                .appendTo(container)
                                .kendoDropDownList({
                                    autoBind: false,
                                    dataTextField: 'CategoryName',
                                    dataValueField: 'CategoryID',
                                    valuePrimitive: false,
                                    dataSource: [
                                        { CategoryID: 1, CategoryName: 'Maths' },
                                        { CategoryID: 2, CategoryName: 'Physics' },
                                        { CategoryID: 3, CategoryName: 'English' },
                                        { CategoryID: 4, CategoryName: 'History' },
                                        { CategoryID: 5, CategoryName: 'Geography' }
                                    ]
                                });
                        } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('number');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample.toString());
                expect(row.find('[' + kendo.attr('role') + ']')).to.have.attr(kendo.attr('role'), 'dropdownlist');
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

        });

        describe('Date Initialization', function () {

            it('date object value', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) }
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('date');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(kendo.toString(value.sample, 'd'));
                expect(input).to.have.attr('type', 'text');
                expect(row.find('[' + kendo.attr('role') + ']')).to.have.attr(kendo.attr('role'), 'datepicker');
            });

            it('date object value with basic rows options (title only)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        { field: 'sample', title: 'Another sample' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('date');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(kendo.toString(value.sample, 'd'));
                expect(input).to.have.attr('type', 'text');
                expect(row.find('input[' + kendo.attr('role') + ']').attr(kendo.attr('role'))).to.equal('datepicker');
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('date object value with kendo editor (datetimepicker)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        { field: 'sample', title: 'Date & Time Picker', editor: 'datetimepicker' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('date');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(kendo.toString(value.sample, 'g'));
                expect(input).to.have.attr('type', 'text');
                expect(row.find('input[' + kendo.attr('role') + ']').attr(kendo.attr('role'))).to.equal('datetimepicker');
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

            it('date object value with custom widget', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        { field: 'sample', title: 'Birthday', editor: function (container, options) {
                            $('<span data-bind="text: ' + options.field + '"/>')
                                .appendTo(container);
                        } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var span = row.find('span[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('date');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(span).to.exist;
                expect(span.attr(kendo.attr('bind'))).to.match(new RegExp('^text:[\\s]*' + keys[0] + '$'));
                expect(span).to.have.text(value.sample.toString());
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

        });

        describe('Boolean Initialization', function () {

            it('boolean object value', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: true }
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('boolean');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample ? 'on' : 'off');
                expect(input).to.have.attr('type', 'checkbox');
                expect(row.find('[' + kendo.attr('role') + ']')).to.have.attr(kendo.attr('role'), 'switch');
            });

            it('boolean object value with basic rows options (title and attributes)', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: true },
                    rows: [
                        { field: 'sample', title: 'Another sample', attributes: { 'data-off-label': 'No', 'data-on-label': 'Yes' } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('boolean');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^value:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample ? 'on' : 'off');
                expect(input).to.have.attr('type', 'checkbox');
                expect(row.find('[' + kendo.attr('role') + ']')).to.have.attr(kendo.attr('role'), 'switch');
                expect(title).to.equal(propertyGrid.options.rows[0].title);
                expect(row.find('span.km-switch-label-on')).to.have.text('Yes');
                expect(row.find('span.km-switch-label-off')).to.have.text('No');
            });

            it('boolean object value with custom widget', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        { field: 'sample', title: 'Birthday', editor: function (container, options) {
                            $('<input type="checkbox" data-bind="checked: ' + options.field + '"/>')
                                .appendTo(container);
                        } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                var value = propertyGrid.value();
                var keys = Object.keys(value);
                var row = element.find('div.k-grid-content>table>tbody>tr');
                var input = row.find('input[' + kendo.attr('bind') + ']');
                var title = row.find('td:first-of-type').text();
                expect(value.sample).to.be.a('date');
                expect(keys).to.be.an.instanceof(Array).with.property('length', 1);
                expect(row).to.exist;
                expect(input).to.exist;
                expect(input.attr(kendo.attr('bind'))).to.match(new RegExp('^checked:[\\s]*' + keys[0] + '$'));
                expect(input).to.have.value(value.sample ? 'on' : 'off');
                expect(input).to.have.attr('type', 'checkbox');
                expect(row.find('[' + kendo.attr('role') + ']')).not.to.exist;
                expect(title).to.equal(propertyGrid.options.rows[0].title);
            });

        });

        describe('Composite Object Initialization', function () {

            it('from code with object value only', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: {
                        firstName: 'John',
                        lastName: 'Smith',
                        dateOfBirth: new Date(1966, 2, 14),
                        children: 3,
                        male: true
                    }
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, Object.keys(propertyGrid.value()).length);
            });

            it('from code with object value and rows options', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: {
                        title: 'Google',
                        description: 'A nice logo',
                        category: 'Companies',
                        image: 'http://www.kidoju.com/logo.png',
                        backgroundColor: '#FFFFFF',
                        created: new Date(),
                        scale: 1,
                        active: true
                    },
                    rows: [
                        { field: 'title', title: 'Title' },
                        { field: 'description', title: 'Description', editor: 'textarea' },
                        {
                            field: 'category',
                            title: 'Category',
                            editor: function (container, options) {
                                $('<input data-bind="value: ' + options.field + '"/>')
                                    .appendTo(container);
                            }
                        },
                        { field: 'image', title: 'Image', editor: 'url' },
                        { field: 'backgroundColor', title: 'Colour', editor: 'colorpicker' },
                        { field: 'created', title: 'Creation Date', editor:'datepicker', format: 'dd MMM yyyy' },
                        { field: 'scale', title: 'Scale', editor: 'slider' } // ,
                        // { field: 'active', title: 'Active' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                // One row has been commented out and should not be displayed
                validateGridHtml(element, Object.keys(propertyGrid.value()).length - 1);
            });

            it('from markup', function () {
                var element = $(PROPERTYGRID2).appendTo(FIXTURES);
                var viewModel = kendo.observable({

                });
                kendo.bind(FIXTURES, viewModel);
                var propertyGrid = element.data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
            });

            it('from markup and rows', function () {
                var element = $(PROPERTYGRID2).appendTo(FIXTURES);
                var viewModel = kendo.observable({

                });
                kendo.bind(FIXTURES, viewModel);
                var propertyGrid = element.data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
            });

        });

        describe('Validation', function () {

            it('required', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var Sample = kendo.data.Model.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            editable: false
                        },
                        sample: {
                            type: 'string',
                            validation: {
                                required: true
                            }
                        }
                    }
                });
                var propertyGrid = element.kendoPropertyGrid({
                    value: new Sample({ id: kendo.guid(), sample: null }),
                    rows: [
                        { field: 'sample' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                expect(propertyGrid.validate()).to.be.false;
            });

            it('regex pattern', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var Sample = kendo.data.Model.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            editable: false
                        },
                        sample: {
                            type: 'string',
                            validation: {
                                pattern: '^a'
                            }
                        }
                    }
                });
                var propertyGrid = element.kendoPropertyGrid({
                    value: new Sample({ id: kendo.guid(), sample: 'sample' }),
                    rows: [
                        { field: 'sample' }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                expect(propertyGrid.validate()).to.be.false;
                expect(propertyGrid.errors()).to.be.an.instanceof(Array).with.property('length', 1);
                expect(propertyGrid.errors()[0]).to.equal('sample is not valid');
            });

            it('min, max, step', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: -100 },
                    rows: [
                        { field: 'sample', editor: 'input', attributes: { type: 'number', min: 0, max: 10, step: 1 } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                expect(propertyGrid.validate()).to.be.false;
                expect(propertyGrid.errors()).to.be.an.instanceof(Array).with.property('length', 1);
                expect(propertyGrid.errors()[0]).to.equal('sample should be greater than or equal to 0');
            });

            it('url', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        { field: 'sample', attributes: { type: 'url' } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                expect(propertyGrid.validate()).to.be.false;
                expect(propertyGrid.errors()).to.be.an.instanceof(Array).with.property('length', 1);
                expect(propertyGrid.errors()[0]).to.equal('sample is not valid URL');
            });

            it('email', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        { field: 'sample', attributes: { type: 'email' } }
                    ]
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                expect(propertyGrid.validate()).to.be.false;
                expect(propertyGrid.errors()).to.be.an.instanceof(Array).with.property('length', 1);
                expect(propertyGrid.errors()[0]).to.equal('sample is not valid email');
            });

            it('custom validation rules', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    validation: {
                        messages: {
                            custom: 'Please enter a valid value for my custom rule'
                        },
                        rules: {
                            custom: function (input) {
                                if (input.is('[name="sample"]')) {
                                    return input.val() === 'Tom';
                                }
                                return true;
                            }
                        }
                    }
                }).data('kendoPropertyGrid');
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 1);
                expect(propertyGrid.validate()).to.be.false;
                expect(propertyGrid.errors()).to.be.an.instanceof(Array).with.property('length', 1);
                expect(propertyGrid.errors()[0]).to.equal('Please enter a valid value for my custom rule');
            });

        });

        describe('Methods', function () {

            it('Get/set value', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid().data('kendoPropertyGrid');
                var fn = function () {
                    propertyGrid.value(1);
                };
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 0);
                expect(fn).to.throw(TypeError);
                var v1 = { sample: 'Sample' };
                propertyGrid.value(v1);
                validateGridHtml(element, Object.keys(v1).length);
                expect(propertyGrid.value()).to.equal(v1);
                var v2 = { firstName: 'John', lastName: 'Smith', dateOfBirth: new Date(1966, 2, 14), married: true, children: 3 };
                propertyGrid.value(v2);
                validateGridHtml(element, Object.keys(v2).length);
                expect(propertyGrid.value()).to.equal(v2);
                propertyGrid.value(null);
                validateGridHtml(element, 0);
                expect(propertyGrid.value()).to.be.null;
            });

            it('Get/set rows', function () {
                var element = $(PROPERTYGRID1).appendTo(FIXTURES);
                var propertyGrid = element.kendoPropertyGrid({
                    value: { firstName: 'John', lastName: 'Smith', dateOfBirth: new Date(1966, 2, 14), married: true, children: 3 }
                }).data('kendoPropertyGrid');
                var fn = function () {
                    propertyGrid.rows(1);
                };
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                validateGridHtml(element, 5);
                expect(fn).to.throw(TypeError);
                var rows1 = [];
                propertyGrid.rows(rows1);
                validateGridHtml(element, rows1.length);
                expect(propertyGrid.rows()).to.equal(rows1);
                var rows2 = [
                    { field: 'firstName' },
                    { field: 'lastName' }
                ];
                propertyGrid.rows(rows2);
                validateGridHtml(element, rows2.length);
                expect(propertyGrid.rows()).to.equal(rows2);
            });

            // TODO: refresh and destroy

        });

        describe('MVVM', function () {

            var element;
            var propertyGrid;
            var viewModel;

            /*
             // For obscure reasons, setting the viewModel here does not work
             viewModel = kendo.observable({
             components: new kidoju.PageComponentCollectionDataSource({ data: pageComponentCollectionArray }),
             current: null
             });
             */

            beforeEach(function () {
                element = $(PROPERTYGRID2).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                propertyGrid = element.data('kendoPropertyGrid');
            });

            it('Instantiating the propertyGrid on a null bound value, displays no row', function () {
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                expect(propertyGrid.value()).to.equal(viewModel.get('current'));
                validateGridHtml(element, 0);
            });

            it('Setting the bound value to a non object, throws a type error', function () {
                var fn = function () {
                    viewModel.set('current', true);
                };
                expect(fn).to.throw(TypeError);
            });

            it('Setting the bound value to an object, display rows', function () {
                viewModel.set('current', {
                    firstName: 'John',
                    lastName: 'Smith',
                    dateOfBirth: new Date(1966, 2, 14),
                    married: true,
                    children: 3
                });
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                expect(propertyGrid.value()).to.equal(viewModel.get('current'));
                validateGridHtml(element, 6); // including uid
            });

            it('Adding rows options customizes the display', function () {
                viewModel.set('current', {
                    firstName: 'John',
                    lastName: 'Smith',
                    dateOfBirth: new Date(1966, 2, 14),
                    married: true,
                    children: 3
                });
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                expect(propertyGrid.value()).to.equal(viewModel.get('current'));
                propertyGrid.rows([
                    { field: 'firstName', title: 'First Name', attributes: { style: 'background-color: #FF0000;' } },
                    { field: 'lastName', title: 'Last Name', attributes: { style: 'background-color: #FF0000;' } },
                    { field: 'dateOfBirth', title: 'Date of Birth', attributes: { style: 'background-color: #FF0000;' } },
                    { field: 'married', title: 'Married', attributes: { style: 'background-color: #FF0000;' } },
                    { field: 'children', title: 'Children', attributes: { style: 'background-color: #FF0000;' } }
                ]);
                validateGridHtml(element, 5); // now excluding uid
            });

            it('Setting a value in the property grid updates the view model', function () {
                var change = sinon.spy();
                viewModel.set('current', {
                    firstName: 'John',
                    lastName: 'Smith',
                    dateOfBirth: new Date(1966, 2, 14),
                    married: true,
                    children: 3
                });
                viewModel.bind('change', function (e) {
                    change(e.field);
                });
                expect(propertyGrid).to.be.an.instanceof(PropertyGrid);
                expect(propertyGrid.value()).to.equal(viewModel.get('current'));
                var input = element.find('input[data-bind]').first();
                input.val('Paul');
                input.change(); // trigger change
                expect(viewModel.get('current.firstName')).to.equal('Paul');
                expect(change).to.have.been.calledWith('current.firstName');
            });

        });

        // There are currently no event implemented in the property grid
        // describe('Events', function () {
        // });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            // kendo.destroy(fixtures); // TODO: RangeError: Maximum call stack size exceeded
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
