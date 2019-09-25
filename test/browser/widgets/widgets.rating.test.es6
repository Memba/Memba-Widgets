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
import '../../../src/js/widgets/widgets.rating.es6';
import fixKendoRoles from '../_misc/test.roles.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    observable,
    ui,
    ui: { Rating }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'rating';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.rating', () => {
    before(() => {
        if (window.__karma__) {
            if ($(`#${FIXTURES}`).length === 0) {
                $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
            }
            fixKendoRoles();
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn.kendoRating).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code with all options', () => {
            const value = 4;
            const min = 0;
            const max = 10;
            const step = 2;
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            expect(element).to.match('input');
            const widget = element
                .kendoRating({
                    value,
                    min,
                    max,
                    step
                })
                .data('kendoRating');
            expect(widget).to.be.an.instanceof(Rating);
            const { wrapper } = widget;
            expect(wrapper).to.be.an.instanceof($);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-rating');
            expect(wrapper.find('input'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(wrapper.find('span.kj-rating-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-rating-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });

        it('from code with minimal options', () => {
            const value = 2;
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            expect(element).to.match('input');
            const widget = element
                .kendoRating({
                    value
                })
                .data('kendoRating');
            const {
                options: { min, max, step },
                wrapper
            } = widget;
            expect(min).to.equal(0);
            expect(max).to.equal(5);
            expect(step).to.equal(1);
            expect(widget).to.be.an.instanceof(Rating);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-rating');
            expect(wrapper.children('input')).to.exist;
            expect(wrapper.find('span.kj-rating-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-rating-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });

        it('from markup', () => {
            const viewModel = observable({
                rating: undefined
            });
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attr('bind'), 'value: rating')
                .attr(attr('max'), 10)
                .appendTo(`#${FIXTURES}`);
            expect(element).to.match(CONSTANTS.INPUT);
            bind(`#${FIXTURES}`, viewModel);
            const widget = element.data('kendoRating');
            expect(widget).to.be.an.instanceof(Rating);
            const {
                options: { min, max, step },
                wrapper
            } = widget;
            const value = widget.value();
            expect(min).to.equal(0);
            expect(max).to.equal(10);
            expect(step).to.equal(1);
            expect(value).to.equal(0);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-rating');
            expect(wrapper.children('input')).to.exist;
            expect(wrapper.find('span.kj-rating-star'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round((max - min) / step));
            expect(wrapper.find('span.kj-rating-star.k-state-selected'))
                .to.be.an.instanceof($)
                .with.property('length', Math.round(value / step));
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const value1 = 1;
        const value2 = 2;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element
                .kendoRating({
                    value: value1
                })
                .data('kendoRating');
        });

        it('value (get)', () => {
            expect(widget).to.be.an.instanceof(Rating);
            expect(widget.value()).to.equal(value1);
            expect(parseFloat(widget.element.val())).to.equal(value1);
        });

        it('value (set)', () => {
            expect(widget).to.be.an.instanceof(Rating);
            widget.value(value2);
            expect(widget.value()).to.equal(value2);
            expect(parseFloat(widget.element.val())).to.equal(value2);
        });

        it('value (range error)', () => {
            const fn = function() {
                widget.value(100);
            };
            expect(widget).to.be.an.instanceof(Rating);
            expect(fn).to.throw(RangeError);
        });

        it('enable/readonly', () => {
            expect(widget).to.be.an.instanceof(Rating);
            const { wrapper } = widget;
            expect(wrapper)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            widget.enable(false);
            expect(wrapper).to.have.class(CONSTANTS.DISABLED_CLASS);
            widget.enable(true);
            expect(wrapper).not.to.have.class(CONSTANTS.DISABLED_CLASS);
        });

        // it('visible', function () {
        // expect(widget).to.be.an.instanceof(Rating);
        // expect(widget.wrapper).to.be.an.instanceof($).with.property('length', 1);
        // TODO
        // });

        // it('destroy', function () {
        // TODO
        // });
    });

    describe('MVVM', () => {
        let element;
        let widget;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
         viewModel = observable({
            rating: undefined
         });
         */

        beforeEach(() => {
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attr('bind'), 'value: rating')
                .attr(attr('max'), 10)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                rating: undefined
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoRating');
        });

        it('Changing the value in the viewModel changes the number of plain/selected stars', () => {
            expect(widget).to.be.an.instanceof(Rating);
            const {
                options: { min, max, step }
            } = widget;
            const count = Math.round((max - min) / step);
            const input = widget.wrapper.find('input');
            expect(input)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const stars = widget.wrapper.find('span.kj-rating-star');
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
                            CONSTANTS.DISABLED_CLASS
                        );
                    } else {
                        expect($(stars.get(i))).to.not.have.class(
                            CONSTANTS.DISABLED_CLASS
                        );
                    }
                }
            }
        });

        it('Clicking a star updates the value in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Rating);
            const {
                options: { min, max, step }
            } = widget;
            const count = Math.round((max - min) / step);
            const input = widget.wrapper.find('input');
            expect(input)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            const stars = widget.wrapper.find('span.kj-rating-star');
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
                            CONSTANTS.DISABLED_CLASS
                        );
                    } else {
                        expect($(stars.get(i))).to.not.have.class(
                            CONSTANTS.DISABLED_CLASS
                        );
                    }
                }
            }
        });
    });

    describe('UI Interactions', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoRating().data('kendoRating');
        });

        it('mouseover', () => {
            expect(widget).to.be.an.instanceof(Rating);
            const {
                options: { min, max, step }
            } = widget;
            const count = Math.round((max - min) / step);
            const stars = widget.wrapper.find('span.kj-rating-star');
            expect(stars)
                .to.be.an.instanceof($)
                .with.property('length', count);
            for (let pos = 0; pos < count; pos++) {
                $(stars.get(pos)).simulate(CONSTANTS.MOUSEOVER);
                for (let i = 0; i < count; i++) {
                    if (i <= pos) {
                        expect($(stars.get(i))).to.have.class(
                            CONSTANTS.HOVER_CLASS
                        );
                    } else {
                        expect($(stars.get(i))).to.not.have.class(
                            CONSTANTS.HOVER_CLASS
                        );
                    }
                }
            }
        });
    });

    describe('Events', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
        });

        it('change', () => {
            const change = sinon.spy();
            widget = element
                .kendoRating({
                    change(e) {
                        change(e.value);
                    }
                })
                .data('kendoRating');
            expect(widget).to.be.an.instanceof(Rating);
            const {
                options: { min, max, step }
            } = widget;
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
        fixtures.find('*').off();
        fixtures.empty();
    });
});
