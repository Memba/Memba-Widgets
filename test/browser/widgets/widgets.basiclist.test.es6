/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.basiclist.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    bind,
    destroy,
    init,
    observable,
    ui: { BasicList, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'basiclist';
const WIDGET = 'kendoBasicList';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.basiclist', () => {
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

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(BasicList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                // value: getValue()
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(BasicList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(BasicList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                role: ROLE,
                // value: getValue()
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(BasicList);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });
    });

    xdescribe('Methods', () => {
        let options;
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = {
                // value: getValue()
            };
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('value (get)', () => {
            expect(widget).to.be.an.instanceof(BasicList);
            expect(widget.value()).to.equal(options.value);
        });

        it('value (set)', () => {
            const value = undefined; // = getValue();
            expect(widget).to.be.an.instanceof(BasicList);
            widget.value(value);
            expect(widget.value()).to.equal(value);
        });

        it('value (error)', () => {
            function fn1() {
                widget.value(JSC.string()());
            }
            function fn2() {
                widget.value(JSC.integer(100)());
            }
            expect(widget).to.be.an.instanceof(BasicList);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        it('enable/readonly', () => {
            expect(widget).to.be.an.instanceof(BasicList);
            const { wrapper } = widget;
            expect(wrapper).to.be.an.instanceof($).with.property('length', 1);
            widget.enable(false);
            expect(wrapper).to.have.class(CONSTANTS.DISABLED_CLASS);
            widget.enable(true);
            expect(wrapper).not.to.have.class(CONSTANTS.DISABLED_CLASS);
        });

        // it('visible', function () {
        //     expect(widget).to.be.an.instanceof(BasicList);
        //     expect(widget.wrapper).to.be.an.instanceof($).with.property('length', 1);
        //     TODO
        // });

        // it('destroy', function () {
        // TODO
        // });
    });

    xdescribe('MVVM', () => {
        const attributes = options2attributes({
            bind: 'value: rating',
            max: 10,
            role: ROLE,
        });
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
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                rating: undefined,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
        });

        it('Changing the value in the viewModel changes the number of plain/selected stars', () => {
            expect(widget).to.be.an.instanceof(BasicList);
            const {
                options: { min, max, step },
            } = widget;
            const count = Math.round((max - min) / step);
            const input = widget.wrapper.find('input');
            expect(input).to.be.an.instanceof($).with.property('length', 1);
            const stars = widget.wrapper.find('span.kj-rating-star');
            expect(stars).to.be.an.instanceof($).with.property('length', count);
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
            expect(widget).to.be.an.instanceof(BasicList);
            const {
                options: { min, max, step },
            } = widget;
            const count = Math.round((max - min) / step);
            const input = widget.wrapper.find('input');
            expect(input).to.be.an.instanceof($).with.property('length', 1);
            const stars = widget.wrapper.find('span.kj-rating-star');
            expect(stars).to.be.an.instanceof($).with.property('length', count);
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

    xdescribe('UI Interactions', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET]().data(WIDGET);
        });

        it('mouseover', () => {
            expect(widget).to.be.an.instanceof(BasicList);
            const {
                options: { min, max, step },
            } = widget;
            const count = Math.round((max - min) / step);
            const stars = widget.wrapper.find('span.kj-rating-star');
            expect(stars).to.be.an.instanceof($).with.property('length', count);
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

    xdescribe('Events', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
        });

        it('change', () => {
            const change = sinon.spy();
            widget = element[WIDGET]({
                change(e) {
                    change(e.value);
                },
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(BasicList);
            const {
                options: { min, max, step },
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
