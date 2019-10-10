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
import '../../../src/js/widgets/widgets.propertygrid.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    attr,
    bind,
    data: { Model },
    destroy,
    guid,
    // init,
    observable,
    ui: { PropertyGrid, roles }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'propertygrid';
const WIDGET = 'kendoPropertyGrid';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const PROPERTYGRID2 =
    '<div data-role="propertygrid" data-bind="value: current"></div>';

function validateGridHtml(element, rowCount) {
    expect(element).to.have.class('k-widget');
    expect(element).to.have.class('k-grid');
    expect(element).to.have.class('kj-propertygrid');
    expect(
        element.find(
            'div.k-grid-header>div.k-grid-header-wrap>table>colgroup>col'
        )
    )
        .to.be.an.instanceof($)
        .with.property('length', 2);
    expect(
        element.find(
            'div.k-grid-header>div.k-grid-header-wrap>table>thead>tr>th'
        )
    )
        .to.be.an.instanceof($)
        .with.property('length', 2);
    expect(element.find('div.k-grid-content>table>colgroup>col'))
        .to.be.an.instanceof($)
        .with.property('length', 2);
    if (rowCount) {
        expect(element.find('div.k-grid-content>table>tbody>tr'))
            .to.be.an.instanceof($)
            .with.property('length', rowCount);
        expect(element.find('div.k-grid-content>table>tbody>tr>td'))
            .to.be.an.instanceof($)
            .with.property('length', 2 * rowCount);
    } else {
        expect(element.find('div.k-grid-content>table>tbody')).to.be.empty;
    }
}

describe('widgets.propertygrid', () => {
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

    describe('Basic Initialization', () => {
        it('from code without option', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoPropertyGrid().data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 0);
        });

        it('from code with bad options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoPropertyGrid([]).data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 0);
        });
    });

    describe('String Initialization', () => {
        it('string object value', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' }
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample);
            expect(input).to.have.attr('type', 'text');
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal('Sample');
        });

        it('string object value with basic rows options (title only)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [{ field: 'sample', title: 'Another sample' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample);
            expect(input).to.have.attr('type', 'text');
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('string object value with textarea editor', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Another sample',
                            editor: 'textarea'
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`textarea[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample);
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('string object value with span editor and attributes', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Another sample',
                            editor: 'span',
                            attributes: { style: 'color: red;' }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const span = row.find(`span[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(span).to.exist;
            expect(span.attr(attr('bind'))).to.match(
                new RegExp(`^text:[\\s]*${keys[0]}$`)
            );
            expect(span).to.have.text(value.sample);
            expect(span).to.have.css('color', 'rgb(255, 0, 0)');
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('string object value with kendo widget (color picker)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: '#ffffff' },
                    rows: [{ field: 'sample', editor: 'colorpicker' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample);
            expect(
                row.find(`input[${attr('role')}]`).attr(attr('role'))
            ).to.equal('colorpicker');
            expect(title).to.equal('Sample');
        });

        it('string object value with custom widget', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'W1N 1AC' },
                    rows: [
                        {
                            field: 'sample',
                            editor(container, options) {
                                $(
                                    `<input data-bind="value: ${options.field}"/>`
                                )
                                    .appendTo(container)
                                    .kendoMaskedTextBox({
                                        mask: 'L0L 0LL'
                                    });
                            }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample);
            expect(row.find(`[${attr('role')}]`)).to.have.attr(
                attr('role'),
                'maskedtextbox'
            );
            expect(title).to.equal('Sample');
        });

        it('string object value with data model', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const Sample = Model.define({
                id: 'sample',
                fields: {
                    sample: {
                        type: 'string',
                        editable: false
                    }
                }
            });
            const widget = element
                .kendoPropertyGrid({
                    value: new Sample({ sample: 'Sample' }),
                    rows: [{ field: 'sample' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const span = row.find(`span[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            // Kendo UI v2015.3.930 data models now have _handlers
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property(
                    'length',
                    5 + (value.hasOwnProperty('_handlers') ? 1 : 0)
                ); // including _events, _handlers, uid, dirty and id
            expect(row).to.exist;
            expect(input).not.to.exist;
            expect(span).to.exist;
            expect(span.attr(attr('bind'))).to.match(
                new RegExp(
                    `^text:[\\s]*${
                        keys[1 + (value.hasOwnProperty('_handlers') ? 1 : 0)]
                    }$`
                )
            );
            expect(span).to.have.text(value.sample);
        });

        it('string object value with template', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [
                        {
                            field: 'sample',
                            template:
                                '<div style="border: dashed 1px \\#000000;" data-bind="text: sample"></div>'
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const div = row.find(`div[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1); // including _events, uid, dirty and id
            expect(row).to.exist;
            expect(input).not.to.exist;
            expect(div).to.exist;
            expect(div.attr(attr('bind'))).to.match(
                new RegExp(`^text:[\\s]*${keys[0]}$`)
            );
            expect(div).to.have.text(value.sample);
        });

        xit('string object value with basic rows options (title only)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: { subvalue: 'Sample' } },
                    rows: [
                        { field: 'sample.subvalue', title: 'Another sample' }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample.subvalue).to.be.a('string');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp('^value:[\\s]*sample.subvalue$')
            );
            expect(input).to.have.value(value.sample.subvalue);
            expect(input).to.have.attr('type', 'text');
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal(widget.options.rows[0].title);
        });
    });

    describe('Number Initialization', () => {
        it('number object value', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 3 }
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('number');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample.toString());
            expect(input).to.have.attr('type', 'text');
            expect(row.find(`[${attr('role')}]`)).to.have.attr(
                attr('role'),
                'numerictextbox'
            );
            expect(title).to.equal('Sample');
        });

        it('number object value with basic rows options (title only)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 5.41 },
                    rows: [{ field: 'sample', title: 'Another sample' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('number');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample.toString());
            expect(input).to.have.attr('type', 'text');
            expect(
                row.find(`input[${attr('role')}]`).attr(attr('role'))
            ).to.equal('numerictextbox');
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('number object value with kendo editor (slider)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 5.41 },
                    rows: [
                        { field: 'sample', title: 'Slider', editor: 'slider' }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('number');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample.toString());
            expect(input).to.have.attr('type', 'text');
            expect(
                row.find(`input[${attr('role')}]`).attr(attr('role'))
            ).to.equal('slider');
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('number object value with custom widget', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 3 },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Category',
                            editor(container, options) {
                                $(
                                    `<input data-bind="value: ${options.field}"/>`
                                )
                                    .appendTo(container)
                                    .kendoDropDownList({
                                        autoBind: false,
                                        dataTextField: 'CategoryName',
                                        dataValueField: 'CategoryID',
                                        valuePrimitive: false,
                                        dataSource: [
                                            {
                                                CategoryID: 1,
                                                CategoryName: 'Maths'
                                            },
                                            {
                                                CategoryID: 2,
                                                CategoryName: 'Physics'
                                            },
                                            {
                                                CategoryID: 3,
                                                CategoryName: 'English'
                                            },
                                            {
                                                CategoryID: 4,
                                                CategoryName: 'History'
                                            },
                                            {
                                                CategoryID: 5,
                                                CategoryName: 'Geography'
                                            }
                                        ]
                                    });
                            }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('number');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample.toString());
            expect(row.find(`[${attr('role')}]`)).to.have.attr(
                attr('role'),
                'dropdownlist'
            );
            expect(title).to.equal(widget.options.rows[0].title);
        });
    });

    describe('Date Initialization', () => {
        it('date object value', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) }
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('date');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(kendo.toString(value.sample, 'd'));
            expect(input).to.have.attr('type', 'text');
            expect(row.find(`[${attr('role')}]`)).to.have.attr(
                attr('role'),
                'datepicker'
            );
        });

        it('date object value with basic rows options (title only)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [{ field: 'sample', title: 'Another sample' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('date');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(kendo.toString(value.sample, 'd'));
            expect(input).to.have.attr('type', 'text');
            expect(
                row.find(`input[${attr('role')}]`).attr(attr('role'))
            ).to.equal('datepicker');
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('date object value with kendo editor (datetimepicker)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Date & Time Picker',
                            editor: 'datetimepicker'
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('date');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(kendo.toString(value.sample, 'g'));
            expect(input).to.have.attr('type', 'text');
            expect(
                row.find(`input[${attr('role')}]`).attr(attr('role'))
            ).to.equal('datetimepicker');
            expect(title).to.equal(widget.options.rows[0].title);
        });

        it('date object value with custom widget', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Birthday',
                            editor(container, options) {
                                $(
                                    `<span data-bind="text: ${options.field}"/>`
                                ).appendTo(container);
                            }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const span = row.find(`span[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('date');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(span).to.exist;
            expect(span.attr(attr('bind'))).to.match(
                new RegExp(`^text:[\\s]*${keys[0]}$`)
            );
            expect(span).to.have.text(value.sample.toString());
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal(widget.options.rows[0].title);
        });
    });

    describe('Boolean Initialization', () => {
        it('boolean object value', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: true }
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('boolean');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample ? 'on' : 'off');
            expect(input).to.have.attr('type', 'checkbox');
            expect(row.find(`[${attr('role')}]`)).to.have.attr(
                attr('role'),
                'switch'
            );
        });

        it('boolean object value with basic rows options (title and attributes)', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: true },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Another sample',
                            attributes: {
                                'data-off-label': 'No',
                                'data-on-label': 'Yes'
                            }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('boolean');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^value:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample ? 'on' : 'off');
            expect(input).to.have.attr('type', 'checkbox');
            expect(row.find(`[${attr('role')}]`)).to.have.attr(
                attr('role'),
                'switch'
            );
            expect(title).to.equal(widget.options.rows[0].title);
            expect(row.find('span.km-switch-label-on')).to.have.text('Yes');
            expect(row.find('span.km-switch-label-off')).to.have.text('No');
        });

        it('boolean object value with custom widget', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: new Date(1966, 2, 14) },
                    rows: [
                        {
                            field: 'sample',
                            title: 'Birthday',
                            editor(container, options) {
                                $(
                                    `<input type="checkbox" data-bind="checked: ${options.field}"/>`
                                ).appendTo(container);
                            }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            const value = widget.value();
            const keys = Object.keys(value);
            const row = element.find('div.k-grid-content>table>tbody>tr');
            const input = row.find(`input[${attr('bind')}]`);
            const title = row.find('td:first-of-type').text();
            expect(value.sample).to.be.a('date');
            expect(keys)
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(row).to.exist;
            expect(input).to.exist;
            expect(input.attr(attr('bind'))).to.match(
                new RegExp(`^checked:[\\s]*${keys[0]}$`)
            );
            expect(input).to.have.value(value.sample ? 'on' : 'off');
            expect(input).to.have.attr('type', 'checkbox');
            expect(row.find(`[${attr('role')}]`)).not.to.exist;
            expect(title).to.equal(widget.options.rows[0].title);
        });
    });

    describe('Composite Object Initialization', () => {
        it('from code with object value only', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: {
                        firstName: 'John',
                        lastName: 'Smith',
                        dateOfBirth: new Date(1966, 2, 14),
                        children: 3,
                        male: true
                    }
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, Object.keys(widget.value()).length);
        });

        it('from code with object value and rows options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
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
                        {
                            field: 'description',
                            title: 'Description',
                            editor: 'textarea'
                        },
                        {
                            field: 'category',
                            title: 'Category',
                            editor(container, options) {
                                $(
                                    `<input data-bind="value: ${options.field}"/>`
                                ).appendTo(container);
                            }
                        },
                        { field: 'image', title: 'Image', editor: 'url' },
                        {
                            field: 'backgroundColor',
                            title: 'Colour',
                            editor: 'colorpicker'
                        },
                        {
                            field: 'created',
                            title: 'Creation Date',
                            editor: 'datepicker',
                            format: 'dd MMM yyyy'
                        },
                        { field: 'scale', title: 'Scale', editor: 'slider' } // ,
                        // { field: 'active', title: 'Active' }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            // One row has been commented out and should not be displayed
            validateGridHtml(element, Object.keys(widget.value()).length - 1);
        });

        it('from markup', () => {
            const element = $(PROPERTYGRID2).appendTo(`#${FIXTURES}`);
            const viewModel = observable({});
            bind(`#${FIXTURES}`, viewModel);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
        });

        it('from markup and rows', () => {
            const element = $(PROPERTYGRID2).appendTo(`#${FIXTURES}`);
            const viewModel = observable({});
            bind(`#${FIXTURES}`, viewModel);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
        });
    });

    describe('Validation', () => {
        it('required', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const Sample = Model.define({
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
            const widget = element
                .kendoPropertyGrid({
                    value: new Sample({ id: guid(), sample: null }),
                    rows: [{ field: 'sample' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            expect(widget.validate()).to.be.false;
        });

        it('regex pattern', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const Sample = Model.define({
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
            const widget = element
                .kendoPropertyGrid({
                    value: new Sample({ id: guid(), sample: 'sample' }),
                    rows: [{ field: 'sample' }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            expect(widget.validate()).to.be.false;
            expect(widget.errors())
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(widget.errors()[0]).to.equal('sample is not valid');
        });

        it('min, max, step', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: -100 },
                    rows: [
                        {
                            field: 'sample',
                            editor: 'input',
                            attributes: {
                                type: 'number',
                                min: 0,
                                max: 10,
                                step: 1
                            }
                        }
                    ]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            expect(widget.validate()).to.be.false;
            expect(widget.errors())
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(widget.errors()[0]).to.equal(
                'sample should be greater than or equal to 0'
            );
        });

        it('url', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [{ field: 'sample', attributes: { type: 'url' } }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            expect(widget.validate()).to.be.false;
            expect(widget.errors())
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(widget.errors()[0]).to.equal('sample is not valid URL');
        });

        it('email', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    rows: [{ field: 'sample', attributes: { type: 'email' } }]
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            expect(widget.validate()).to.be.false;
            expect(widget.errors())
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(widget.errors()[0]).to.equal('sample is not valid email');
        });

        it('custom validation rules', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: { sample: 'Sample' },
                    validation: {
                        messages: {
                            custom:
                                'Please enter a valid value for my custom rule'
                        },
                        rules: {
                            custom(input) {
                                if (input.is('[name="sample"]')) {
                                    return input.val() === 'Tom';
                                }
                                return true;
                            }
                        }
                    }
                })
                .data(WIDGET);
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 1);
            expect(widget.validate()).to.be.false;
            expect(widget.errors())
                .to.be.an.instanceof(Array)
                .with.property('length', 1);
            expect(widget.errors()[0]).to.equal(
                'Please enter a valid value for my custom rule'
            );
        });
    });

    describe('Methods', () => {
        it('Get/set value', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoPropertyGrid().data(WIDGET);
            function fn() {
                widget.value(1);
            }
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 0);
            expect(fn).to.throw(TypeError);
            const v1 = { sample: 'Sample' };
            widget.value(v1);
            validateGridHtml(element, Object.keys(v1).length);
            expect(widget.value()).to.equal(v1);
            const v2 = {
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: new Date(1966, 2, 14),
                married: true,
                children: 3
            };
            widget.value(v2);
            validateGridHtml(element, Object.keys(v2).length);
            expect(widget.value()).to.equal(v2);
            widget.value(null);
            validateGridHtml(element, 0);
            expect(widget.value()).to.be.null;
        });

        it('Get/set rows', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: {
                        firstName: 'John',
                        lastName: 'Smith',
                        dateOfBirth: new Date(1966, 2, 14),
                        married: true,
                        children: 3
                    }
                })
                .data(WIDGET);
            function fn() {
                widget.rows(1);
            }
            expect(widget).to.be.an.instanceof(PropertyGrid);
            validateGridHtml(element, 5);
            expect(fn).to.throw(TypeError);
            const rows1 = [];
            widget.rows(rows1);
            widget.refresh();
            validateGridHtml(element, rows1.length);
            expect(widget.rows()).to.equal(rows1);
            const rows2 = [{ field: 'firstName' }, { field: 'lastName' }];
            widget.rows(rows2);
            widget.refresh();
            validateGridHtml(element, rows2.length);
            expect(widget.rows()).to.equal(rows2);
        });

        // TODO: refresh

        it('Destroy', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPropertyGrid({
                    value: {
                        firstName: 'John',
                        lastName: 'Smith',
                        dateOfBirth: new Date(1966, 2, 14),
                        married: true,
                        children: 3
                    }
                })
                .data(WIDGET);
            widget.destroy();
        });
    });

    describe('MVVM', () => {
        let element;
        let widget;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
         viewModel = observable({
         components: new kidoju.PageComponentDataSource({ data: pageComponentCollectionArray }),
         current: null
         });
         */

        beforeEach(() => {
            element = $(PROPERTYGRID2).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                current: null
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
        });

        it('Instantiating the widget on a null bound value, displays no row', () => {
            expect(widget).to.be.an.instanceof(PropertyGrid);
            expect(widget.value()).to.equal(viewModel.get('current'));
            validateGridHtml(element, 0);
        });

        it('Setting the bound value to a non object, throws a type error', () => {
            function fn() {
                viewModel.set('current', true);
            }
            expect(fn).to.throw(TypeError);
        });

        it('Setting the bound value to an object, display rows', () => {
            viewModel.set('current', {
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: new Date(1966, 2, 14),
                married: true,
                children: 3
            });
            expect(widget).to.be.an.instanceof(PropertyGrid);
            expect(widget.value()).to.equal(viewModel.get('current'));
            validateGridHtml(element, 6); // including uid
        });

        it('Adding rows options customizes the display', () => {
            viewModel.set('current', {
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: new Date(1966, 2, 14),
                married: true,
                children: 3
            });
            expect(widget).to.be.an.instanceof(PropertyGrid);
            expect(widget.value()).to.equal(viewModel.get('current'));
            widget.rows([
                {
                    field: 'firstName',
                    title: 'First Name',
                    attributes: { style: 'background-color: #FF0000;' }
                },
                {
                    field: 'lastName',
                    title: 'Last Name',
                    attributes: { style: 'background-color: #FF0000;' }
                },
                {
                    field: 'dateOfBirth',
                    title: 'Date of Birth',
                    attributes: { style: 'background-color: #FF0000;' }
                },
                {
                    field: 'married',
                    title: 'Married',
                    attributes: { style: 'background-color: #FF0000;' }
                },
                {
                    field: 'children',
                    title: 'Children',
                    attributes: { style: 'background-color: #FF0000;' }
                }
            ]);
            widget.refresh();
            validateGridHtml(element, 5); // now excluding uid
        });

        it('Setting a value in the property grid updates the view model', () => {
            const change = sinon.spy();
            viewModel.set('current', {
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: new Date(1966, 2, 14),
                married: true,
                children: 3
            });
            viewModel.bind('change', e => {
                change(e.field);
            });
            expect(widget).to.be.an.instanceof(PropertyGrid);
            expect(widget.value()).to.equal(viewModel.get('current'));
            const input = element.find('input[data-bind]').first();
            input.val('Paul');
            input.change(); // trigger change
            expect(viewModel.get('current.firstName')).to.equal('Paul');
            expect(change).to.have.been.calledWith('current.firstName');
        });
    });

    // There are currently no event implemented in the property grid
    // describe('Events', function () {
    // });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
