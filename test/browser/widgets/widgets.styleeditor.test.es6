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
import '../../../src/js/widgets/widgets.styleeditor.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { ComboBox, Grid, roles, StyleEditor }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'styleeditor';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.styleeditor', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn.kendoComboBox).to.be.a(CONSTANTS.FUNCTION);
            expect($.fn.kendoGrid).to.be.a(CONSTANTS.FUNCTION);
            expect($.fn.kendoStyleEditor).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoStyleEditor().data('kendoStyleEditor');
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal('');
            expect(widget.grid).to.be.an.instanceof(Grid);
            expect(widget.grid.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.grid.dataSource.total()).to.equal(0);
            expect(widget.grid.columns)
                .to.be.an.instanceof(Array)
                .with.property('length', 2);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('k-grid');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper.height()).to.equal(widget.options.height);
            expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add'))
                .to.exist;
            expect(
                element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')
            ).to.exist;
        });

        it('from code with options', () => {
            const options = {
                value: 'color:#FF0000;border:1px solid rgb(255, 0, 0);',
                height: 500
            };
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoStyleEditor(options)
                .data('kendoStyleEditor');
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal(options.value);
            expect(widget.grid).to.be.an.instanceof(Grid);
            expect(widget.grid.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.grid.dataSource.total()).to.equal(2);
            expect(widget.grid.columns)
                .to.be.an.instanceof(Array)
                .with.property('length', 2);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('k-grid');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper.height()).to.equal(options.height);
            expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add'))
                .to.exist;
            expect(
                element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')
            ).to.exist;
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoStyleEditor');
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal('');
            expect(widget.grid).to.be.an.instanceof(Grid);
            expect(widget.grid.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.grid.dataSource.total()).to.equal(0);
            expect(widget.grid.columns)
                .to.be.an.instanceof(Array)
                .with.property('length', 2);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('k-grid');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper.height()).to.equal(widget.options.height);
            expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add'))
                .to.exist;
            expect(
                element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')
            ).to.exist;
        });

        it('from markup with attributes', () => {
            const attributes = {
                'data-value': 'color:#FF0000;border:1px solid rgb(255, 0, 0);',
                'data-height': 500
            };
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoStyleEditor');
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal(attributes['data-value']);
            expect(widget.grid).to.be.an.instanceof(Grid);
            expect(widget.grid.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.grid.dataSource.total()).to.equal(2);
            expect(widget.grid.columns)
                .to.be.an.instanceof(Array)
                .with.property('length', 2);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('k-grid');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper.height()).to.equal(widget.options.height);
            expect(element.find('div.k-grid-toolbar > a.k-button.k-grid-add'))
                .to.exist;
            expect(
                element.find('div.k-grid-toolbar > a.k-button.k-grid-delete')
            ).to.exist;
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {
            value: 'color:#FF0000;border:1px solid rgb(255, 0, 0);'
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoStyleEditor(options).data('kendoStyleEditor');
        });

        it('value', () => {
            function fn1() {
                widget.value(0);
            }
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal(options.value);
            expect(widget.grid.dataSource.total()).to.equal(2);
            expect(fn1).to.throw(TypeError);
            widget.value('dummy');
            expect(widget.value()).to.equal('');
            expect(widget.grid.dataSource.total()).to.equal(0);
            const value =
                'background-color:#0000FF;opacity:0.5;font-size:normal;';
            widget.value(value);
            expect(widget.value()).to.equal(value);
            expect(widget.grid.dataSource.total()).to.equal(3);
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(StyleEditor);
            widget.destroy();
            expect(element).not.to.have.class(`kj-${ROLE}`);
            expect(element.data('kendoStyleEditor')).to.be.undefined;
        });
    });

    describe('MVVM (and UI Interactions)', () => {
        let element;
        let widget;
        let viewModel;
        let change;
        const attributes = {
            'data-bind': 'value: style',
            'data-height': 500
        };

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                style: 'color:#FF0000;border:1px solid rgb(255, 0, 0);'
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoStyleEditor');
            viewModel.bind('change', () => {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal(viewModel.get('style'));
            expect(widget.grid.dataSource.total()).to.equal(2);
            expect(change).to.have.not.been.called;
            const value =
                'background-color:#0000FF;opacity:0.5;font-size:normal;';
            viewModel.set('style', value);
            expect(viewModel.get('style')).to.equal(value);
            expect(widget.value()).to.equal(value);
            expect(widget.grid.dataSource.total()).to.equal(3);
            expect(change).to.have.been.calledOnce;
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(widget.value()).to.equal(viewModel.get('style'));
            expect(widget.grid.dataSource.total()).to.equal(2);
            expect(change).to.have.not.been.called;
            const value =
                'background-color:#0000FF;opacity:0.5;font-size:normal;';
            widget.value(value);
            expect(viewModel.get('style')).to.equal(value);
            expect(widget.value()).to.equal(value);
            expect(widget.grid.dataSource.total()).to.equal(3);
            expect(change).to.have.been.calledOnce;
        });

        it('New style', done => {
            const oldStyle = viewModel.get('style');
            const newStyle = { name: 'opacity', value: '0.5' };
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(change).not.to.have.been.called;
            const rows = widget.grid.tbody.find('tr[role="row"]').length;
            // Click add button
            element
                .find('div.k-grid-toolbar > a.k-button.k-grid-add')
                .simulate('click');
            // Wait for the click to process (since jQuery 3.2.1)
            setTimeout(() => {
                // Fill name cell in new row
                const nameCell = widget.grid.tbody.find(
                    'td[role="gridcell"]:eq(0)'
                );
                nameCell.simulate('click');
                const nameInput = nameCell.find('input[role="combobox"]');
                nameInput.focus();
                nameInput.val(newStyle.name);
                nameInput.simulate('keydown', { keyCode: 13 });
                // Fill second cell in new row
                const valueCell = widget.grid.tbody.find(
                    'td[role="gridcell"]:eq(1)'
                );
                valueCell.simulate('click');
                const valueInput = valueCell.find('input');
                valueInput.val(newStyle.value);
                valueInput.simulate('keydown', { keyCode: 13 });
                // None of the following triggers a change event on the grid, and therefore on the widget to update value bindings
                // valueInput.blur();
                // valueInput.focusout();
                // So we need to force the change event
                valueInput.trigger('change');
                setTimeout(() => {
                    // Check value
                    const expectedStyle = `${newStyle.name}:${newStyle.value};${oldStyle}`;
                    expect(widget.value()).to.equal(expectedStyle);
                    // Check data
                    expect(widget._dataSource.total()).to.equal(rows + 1);
                    const data = widget._dataSource.data();
                    expect(data[0].name).to.equal(newStyle.name);
                    expect(data[0].value).to.equal(newStyle.value);
                    // Check viewModel
                    expect(viewModel.get('style')).to.equal(expectedStyle);
                    expect(change).to.have.been.calledOnce;
                    done();
                });
            }, 0);
        });

        it('Delete', done => {
            const count = widget.grid.dataSource.total();
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(change).not.to.have.been.called;
            var remove = function() {
                // Since jQuery 3.2.1 we need setTimout to allow time for processing clicks
                setTimeout(() => {
                    if (widget.grid.dataSource.total() > 0) {
                        // Click row
                        widget.grid.tbody
                            .find('td[role="gridcell"]')
                            .first()
                            .simulate('click');
                        // Click delete button
                        element
                            .find(
                                'div.k-grid-toolbar > a.k-button.k-grid-delete'
                            )
                            .simulate('click');
                        // remove next row
                        remove();
                    } else {
                        expect(change).to.have.callCount(count);
                        done();
                    }
                }, 0);
            };
            remove();
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        let options;
        let change;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoStyleEditor(options).data('kendoStyleEditor');
        });

        it('Change', () => {
            expect(widget).to.be.an.instanceof(StyleEditor);
            expect(change).not.to.have.been.called;
            widget.bind('change', () => {
                change();
            });
            widget.value('background-color:#0000FF;');
            expect(change).to.have.been.calledOnce;
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
