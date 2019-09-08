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
import '../../../src/js/widgets/widgets.formatstrip.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    observable,
    ui: { FormatStrip }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'formatstrip';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.formatstrip', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn.kendoFormatStrip).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Style', () => {
        const Style = window.Style;

        xit('Style', () => {
            const css =
                'color: blue; font-family: verdana; font-size: 300%; border: solid 2px #000';
            const style = new Style(css);
            expect(style.toString()).to.equal(css.replace(/\s/g, ''));
        });
    });

    describe('Initialization', () => {
        it('from code with all options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            expect(element).to.match('div');
            const widget = element
                .kendoFormatStrip({
                    // value: value,
                    // min: min,
                    // max: max,
                    // step: step
                })
                .data('kendoFormatStrip');
            expect(widget).to.be.an.instanceof(FormatStrip);
            const wrapper = widget.wrapper;
            expect(wrapper).to.be.an.instanceof($);
            // expect(wrapper).not.to.have.class('k-widget');
            // expect(wrapper).to.have.class(`kj-${ROLE}`);
        });

        xit('from code with minimal options', () => {
            const value = 2;
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            expect(element).to.match('input');
            const widget = element
                .kendoFormatStrip({
                    value
                })
                .data('kendoFormatStrip');
            const min = widget.options.min;
            const max = widget.options.max;
            const step = widget.options.step;
            expect(min).to.equal(0);
            expect(max).to.equal(5);
            expect(step).to.equal(1);
            expect(widget).to.be.an.instanceof(FormatStrip);
            const wrapper = widget.wrapper;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
            expect(wrapper.find('input'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(wrapper.find('span.kj-widget-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-widget-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });

        xit('from markup', () => {
            const viewModel = observable({
                widget: undefined
            });
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            expect(element).to.match('input');
            bind(FIXTURES, viewModel);
            const widget = element.data('kendoFormatStrip');
            expect(widget).to.be.an.instanceof(FormatStrip);
            const min = widget.options.min;
            const max = widget.options.max;
            const step = widget.options.step;
            const value = widget.value();
            expect(min).to.equal(0);
            expect(max).to.equal(10);
            expect(step).to.equal(1);
            expect(value).to.equal(0);
            const wrapper = widget.wrapper;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
            expect(wrapper.find('input'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(wrapper.find('span.kj-widget-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-widget-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });
    });

    xdescribe('Methods', () => {
        let element;
        let widget;
        const value1 = 1;
        const value2 = 2;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element
                .kendoFormatStrip({
                    value: value1
                })
                .data('kendoFormatStrip');
        });

        it('value (get)', () => {
            expect(widget).to.be.an.instanceof(FormatStrip);
            expect(widget.value()).to.equal(value1);
            expect(parseFloat(widget.element.val())).to.equal(value1);
        });

        it('value (set)', () => {
            expect(widget).to.be.an.instanceof(FormatStrip);
            widget.value(value2);
            expect(widget.value()).to.equal(value2);
            expect(parseFloat(widget.element.val())).to.equal(value2);
        });

        it('value (range error)', () => {
            const fn = function() {
                widget.value(100);
            };
            expect(widget).to.be.an.instanceof(FormatStrip);
            expect(fn).to.throw(RangeError);
        });

        it('enable/readonly', () => {
            expect(widget).to.be.an.instanceof(FormatStrip);
            expect(widget.wrapper)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            widget.enable(false);
            expect(widget.wrapper).to.have.class('k-state-disabled');
            widget.enable(true);
            expect(widget.wrapper).not.to.have.class('k-state-disabled');
        });

        // it('visible', function () {
        // expect(widget).to.be.an.instanceof(FormatStrip);
        // expect(widget.wrapper).to.be.an.instanceof($).with.property('length', 1);
        // TODO
        // });

        // it('destroy', function () {
        // TODO
        // });
    });

    xdescribe('MVVM', () => {
        let element;
        let widget;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
         viewModel = observable({
         widget: undefined
         });
         */

        beforeEach(() => {
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                current: undefined
            });
            bind(FIXTURES, viewModel);
            widget = element.data('kendoFormatStrip');
        });

        it('Changing the value in the viewModel changes the number of plain/selected stars', () => {
            expect(widget).to.be.an.instanceof(FormatStrip);
            const min = widget.options.min;
            const max = widget.options.max;
            const step = widget.options.step;
            const count = Math.round((max - min) / step);
            const input = widget.wrapper.find('input');
            expect(input)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const stars = widget.wrapper.find('span.kj-widget-star');
            expect(stars)
                .to.be.an.instanceof($)
                .with.property('length', count);
            for (let value = min; value <= max; value += step) {
                viewModel.set('current', value);
                expect(parseFloat(input.val())).to.equal(value);
                const pos = Math.round((value - min) / step) - 1;
                for (let i = 0; i < count; i++) {
                    if (i <= pos) {
                        expect($(stars.get(i))).to.have.class(
                            'k-state-selected'
                        );
                    } else {
                        expect($(stars.get(i))).to.not.have.class(
                            'k-state-selected'
                        );
                    }
                }
            }
        });

        it('Clicking a star updates the value in the viewModel', () => {
            expect(widget).to.be.an.instanceof(FormatStrip);
            const min = widget.options.min;
            const max = widget.options.max;
            const step = widget.options.step;
            const count = Math.round((max - min) / step);
            const input = widget.wrapper.find('input');
            expect(input)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const stars = widget.wrapper.find('span.kj-widget-star');
            expect(stars)
                .to.be.an.instanceof($)
                .with.property('length', count);
            for (let pos = 0; pos < count; pos++) {
                $(stars.get(pos)).simulate('click');
                expect(parseFloat(input.val())).to.equal(
                    min + (pos + 1) * step
                );
                for (let i = 0; i < count; i++) {
                    if (i <= pos) {
                        expect($(stars.get(i))).to.have.class(
                            'k-state-selected'
                        );
                    } else {
                        expect($(stars.get(i))).to.not.have.class(
                            'k-state-selected'
                        );
                    }
                }
            }
        });
    });

    xdescribe('UI Interactions', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoFormatStrip().data('kendoFormatStrip');
        });

        it('mouseover', () => {
            expect(widget).to.be.an.instanceof(FormatStrip);
            const min = widget.options.min;
            const max = widget.options.max;
            const step = widget.options.step;
            const count = Math.round((max - min) / step);
            const stars = widget.wrapper.find('span.kj-widget-star');
            expect(stars)
                .to.be.an.instanceof($)
                .with.property('length', count);
            for (let pos = 0; pos < count; pos++) {
                $(stars.get(pos)).simulate('mouseover');
                for (let i = 0; i < count; i++) {
                    if (i <= pos) {
                        expect($(stars.get(i))).to.have.class('k-state-hover');
                    } else {
                        expect($(stars.get(i))).to.not.have.class(
                            'k-state-hover'
                        );
                    }
                }
            }
        });
    });

    xdescribe('Events', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
        });

        it('change', () => {
            const change = sinon.spy();
            widget = element
                .kendoFormatStrip({
                    change(e) {
                        change(e.value);
                    }
                })
                .data('kendoFormatStrip');
            expect(widget).to.be.an.instanceof(FormatStrip);
            const min = widget.options.min;
            const max = widget.options.max;
            const step = widget.options.step;
            const value = widget.value();
            expect(min).to.equal(0);
            expect(max).to.equal(5);
            expect(step).to.equal(1);
            for (let i = min; i <= max; i += step) {
                widget.value(i);
                expect(change).to.have.callCount(i + 1);
                expect(change).to.have.been.calledWith(i);
            }
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.empty();
    });
});
