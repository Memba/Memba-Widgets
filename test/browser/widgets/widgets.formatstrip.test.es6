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
const FIXTURES = '#fixtures';
const ELEMENT = '<div/>';
const ROLE = 'formatstrip';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.formatstrip', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
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
            const element = $(ELEMENT).appendTo(FIXTURES);
            expect(element).to.match('div');
            const formatStrip = element
                .kendoFormatStrip({
                    // value: value,
                    // min: min,
                    // max: max,
                    // step: step
                })
                .data('kendoFormatStrip');
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const wrapper = formatStrip.wrapper;
            expect(wrapper).to.be.an.instanceof($);
            // expect(wrapper).not.to.have.class('k-widget');
            // expect(wrapper).to.have.class('kj-formatStrip');
            // expect(wrapper.find('input')).to.be.an.instanceof($).with.property('length', 1);
            // expect(wrapper.find('span.kj-formatStrip-star')).to.be.an.instanceof($).with.property('length', Math.round((max - min) / step));
            // expect(wrapper.find('span.kj-formatStrip-star.k-state-selected')).to.be.an.instanceof($).with.property('length', Math.round(value / step));
        });

        xit('from code with minimal options', () => {
            const value = 2;
            const element = $(ELEMENT).appendTo(FIXTURES);
            expect(element).to.match('input');
            const formatStrip = element
                .kendoFormatStrip({
                    value
                })
                .data('kendoFormatStrip');
            const min = formatStrip.options.min;
            const max = formatStrip.options.max;
            const step = formatStrip.options.step;
            expect(min).to.equal(0);
            expect(max).to.equal(5);
            expect(step).to.equal(1);
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const wrapper = formatStrip.wrapper;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-formatStrip');
            expect(wrapper.find('input'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(wrapper.find('span.kj-formatStrip-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-formatStrip-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });

        xit('from markup', () => {
            const viewModel = observable({
                formatStrip: undefined
            });
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(FIXTURES);
            expect(element).to.match('input');
            bind(FIXTURES, viewModel);
            const formatStrip = element.data('kendoFormatStrip');
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const min = formatStrip.options.min;
            const max = formatStrip.options.max;
            const step = formatStrip.options.step;
            const value = formatStrip.value();
            expect(min).to.equal(0);
            expect(max).to.equal(10);
            expect(step).to.equal(1);
            expect(value).to.equal(0);
            const wrapper = formatStrip.wrapper;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-formatStrip');
            expect(wrapper.find('input'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(wrapper.find('span.kj-formatStrip-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-formatStrip-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });
    });

    xdescribe('Methods', () => {
        let element;
        let formatStrip;
        const value1 = 1;
        const value2 = 2;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            formatStrip = element
                .kendoFormatStrip({
                    value: value1
                })
                .data('kendoFormatStrip');
        });

        it('value (get)', () => {
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            expect(formatStrip.value()).to.equal(value1);
            expect(parseFloat(formatStrip.element.val())).to.equal(value1);
        });

        it('value (set)', () => {
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            formatStrip.value(value2);
            expect(formatStrip.value()).to.equal(value2);
            expect(parseFloat(formatStrip.element.val())).to.equal(value2);
        });

        it('value (range error)', () => {
            const fn = function() {
                formatStrip.value(100);
            };
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            expect(fn).to.throw(RangeError);
        });

        it('enable/readonly', () => {
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            expect(formatStrip.wrapper)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            formatStrip.enable(false);
            expect(formatStrip.wrapper).to.have.class('k-state-disabled');
            formatStrip.enable(true);
            expect(formatStrip.wrapper).not.to.have.class('k-state-disabled');
        });

        // it('visible', function () {
        // expect(formatStrip).to.be.an.instanceof(FormatStrip);
        // expect(formatStrip.wrapper).to.be.an.instanceof($).with.property('length', 1);
        // TODO
        // });

        // it('destroy', function () {
        // TODO
        // });
    });

    xdescribe('MVVM', () => {
        let element;
        let formatStrip;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
         viewModel = observable({
         formatStrip: undefined
         });
         */

        beforeEach(() => {
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(FIXTURES);
            viewModel = observable({
                current: undefined
            });
            bind(FIXTURES, viewModel);
            formatStrip = element.data('kendoFormatStrip');
        });

        it('Changing the value in the viewModel changes the number of plain/selected stars', () => {
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const min = formatStrip.options.min;
            const max = formatStrip.options.max;
            const step = formatStrip.options.step;
            const count = Math.round((max - min) / step);
            const input = formatStrip.wrapper.find('input');
            expect(input)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const stars = formatStrip.wrapper.find('span.kj-formatStrip-star');
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
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const min = formatStrip.options.min;
            const max = formatStrip.options.max;
            const step = formatStrip.options.step;
            const count = Math.round((max - min) / step);
            const input = formatStrip.wrapper.find('input');
            expect(input)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const stars = formatStrip.wrapper.find('span.kj-formatStrip-star');
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
        let formatStrip;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            formatStrip = element.kendoFormatStrip().data('kendoFormatStrip');
        });

        it('mouseover', () => {
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const min = formatStrip.options.min;
            const max = formatStrip.options.max;
            const step = formatStrip.options.step;
            const count = Math.round((max - min) / step);
            const stars = formatStrip.wrapper.find('span.kj-formatStrip-star');
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
        let formatStrip;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
        });

        it('change', () => {
            const change = sinon.spy();
            formatStrip = element
                .kendoFormatStrip({
                    change(e) {
                        change(e.value);
                    }
                })
                .data('kendoFormatStrip');
            expect(formatStrip).to.be.an.instanceof(FormatStrip);
            const min = formatStrip.options.min;
            const max = formatStrip.options.max;
            const step = formatStrip.options.step;
            const value = formatStrip.value();
            expect(min).to.equal(0);
            expect(max).to.equal(5);
            expect(step).to.equal(1);
            for (let i = min; i <= max; i += step) {
                formatStrip.value(i);
                expect(change).to.have.callCount(i + 1);
                expect(change).to.have.been.calledWith(i);
            }
        });
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
