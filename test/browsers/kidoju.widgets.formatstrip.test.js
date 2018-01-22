/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var FormatStrip = ui.FormatStrip;
    var FIXTURES = '#fixtures';
    var FORMATSTRIP1 = '<div id="formatstrip1"></div>';
    var FORMATSTRIP2 = '<div id="formatstrip2" data-role="formatstrip"></div>';

    describe('kidoju.widgets.formatstrip', function () {

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
                expect($.fn.kendoFormatStrip).to.be.an.instanceof(Function);
            });

        });

        describe('Style', function () {

            var Style = window.Style;

            xit ('Style', function () {
                var css = 'color: blue; font-family: verdana; font-size: 300%; border: solid 2px #000';
                var style = new Style(css);
                expect(style.toString()).to.equal(css.replace(/\s/g, ''));
            });

        });

        describe('Initialization', function () {

            it('from code with all options', function () {
                var element = $(FORMATSTRIP1).appendTo(FIXTURES);
                expect(element).to.match('div');
                var formatStrip = element.kendoFormatStrip({
                    // value: value,
                    // min: min,
                    // max: max,
                    // step: step
                }).data('kendoFormatStrip');
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var wrapper = formatStrip.wrapper;
                expect(wrapper).to.be.an.instanceof($);
                // expect(wrapper).not.to.have.class('k-widget');
                // expect(wrapper).to.have.class('kj-formatStrip');
                // expect(wrapper.find('input')).to.be.an.instanceof($).with.property('length', 1);
                // expect(wrapper.find('span.kj-formatStrip-star')).to.be.an.instanceof($).with.property('length', Math.round((max - min) / step));
                // expect(wrapper.find('span.kj-formatStrip-star.k-state-selected')).to.be.an.instanceof($).with.property('length', Math.round(value / step));
            });

            xit('from code with minimal options', function () {
                var value = 2;
                var element = $(FORMATSTRIP1).appendTo(FIXTURES);
                expect(element).to.match('input');
                var formatStrip = element.kendoFormatStrip({
                    value: value
                }).data('kendoFormatStrip');
                var min = formatStrip.options.min;
                var max = formatStrip.options.max;
                var step = formatStrip.options.step;
                expect(min).to.equal(0);
                expect(max).to.equal(5);
                expect(step).to.equal(1);
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var wrapper = formatStrip.wrapper;
                expect(wrapper).not.to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-formatStrip');
                expect(wrapper.find('input')).to.be.an.instanceof($).with.property('length', 1);
                expect(wrapper.find('span.kj-formatStrip-star')).to.be.an.instanceof($).with.property('length', Math.round((max - min) / step));
                expect(wrapper.find('span.kj-formatStrip-star.k-state-selected')).to.be.an.instanceof($).with.property('length', Math.round(value / step));
            });

            xit('from markup', function () {
                var viewModel = kendo.observable({
                    formatStrip: undefined
                });
                var element =  $(FORMATSTRIP2).appendTo(FIXTURES);
                expect(element).to.match('input');
                kendo.bind(FIXTURES, viewModel);
                var formatStrip = element.data('kendoFormatStrip');
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var min = formatStrip.options.min;
                var max = formatStrip.options.max;
                var step = formatStrip.options.step;
                var value = formatStrip.value();
                expect(min).to.equal(0);
                expect(max).to.equal(10);
                expect(step).to.equal(1);
                expect(value).to.equal(0);
                var wrapper = formatStrip.wrapper;
                expect(wrapper).not.to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-formatStrip');
                expect(wrapper.find('input')).to.be.an.instanceof($).with.property('length', 1);
                expect(wrapper.find('span.kj-formatStrip-star')).to.be.an.instanceof($).with.property('length', Math.round((max - min) / step));
                expect(wrapper.find('span.kj-formatStrip-star.k-state-selected')).to.be.an.instanceof($).with.property('length', Math.round(value / step));
            });
        });

        xdescribe('Methods', function () {

            var element;
            var formatStrip;
            var value1 = 1;
            var value2 = 2;

            beforeEach(function () {
                element = $(FORMATSTRIP1).appendTo(FIXTURES);
                formatStrip = element.kendoFormatStrip({
                    value: value1
                }).data('kendoFormatStrip');
            });

            it('value (get)', function () {
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                expect(formatStrip.value()).to.equal(value1);
                expect(parseFloat(formatStrip.element.val())).to.equal(value1);
            });

            it('value (set)', function () {
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                formatStrip.value(value2);
                expect(formatStrip.value()).to.equal(value2);
                expect(parseFloat(formatStrip.element.val())).to.equal(value2);
            });

            it('value (range error)', function () {
                var fn = function () {
                    formatStrip.value(100);
                };
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                expect(fn).to.throw(RangeError);
            });

            it('enable/readonly', function () {
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                expect(formatStrip.wrapper).to.be.an.instanceof($).with.property('length', 1);
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

        xdescribe('MVVM', function () {

            var element;
            var formatStrip;
            var viewModel;

            /*
             // For obscure reasons, setting the viewModel here does not work
             viewModel = kendo.observable({
             formatStrip: undefined
             });
             */

            beforeEach(function () {
                element = $(FORMATSTRIP2).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    current: undefined
                });
                kendo.bind(FIXTURES, viewModel);
                formatStrip = element.data('kendoFormatStrip');
            });

            it('Changing the value in the viewModel changes the number of plain/selected stars', function () {
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var min = formatStrip.options.min;
                var max = formatStrip.options.max;
                var step = formatStrip.options.step;
                var count = Math.round((max - min) / step);
                var input = formatStrip.wrapper.find('input');
                expect(input).to.be.an.instanceof($).with.property('length', 1);
                var stars = formatStrip.wrapper.find('span.kj-formatStrip-star');
                expect(stars).to.be.an.instanceof($).with.property('length', count);
                for (var value = min; value <= max; value += step) {
                    viewModel.set('current', value);
                    expect(parseFloat(input.val())).to.equal(value);
                    var pos = Math.round((value - min) / step) - 1;
                    for (var i = 0; i < count; i++) {
                        if (i <= pos) {
                            expect($(stars.get(i))).to.have.class('k-state-selected');
                        } else {
                            expect($(stars.get(i))).to.not.have.class('k-state-selected');
                        }
                    }
                }
            });

            it('Clicking a star updates the value in the viewModel', function () {
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var min = formatStrip.options.min;
                var max = formatStrip.options.max;
                var step = formatStrip.options.step;
                var count = Math.round((max - min) / step);
                var input = formatStrip.wrapper.find('input');
                expect(input).to.be.an.instanceof($).with.property('length', 1);
                var stars = formatStrip.wrapper.find('span.kj-formatStrip-star');
                expect(stars).to.be.an.instanceof($).with.property('length', count);
                for (var pos = 0; pos < count; pos++) {
                    $(stars.get(pos)).simulate('click');
                    expect(parseFloat(input.val())).to.equal(min + (pos + 1) * step);
                    for (var i = 0; i < count; i++) {
                        if (i <= pos) {
                            expect($(stars.get(i))).to.have.class('k-state-selected');
                        } else {
                            expect($(stars.get(i))).to.not.have.class('k-state-selected');
                        }
                    }
                }
            });

        });

        xdescribe('UI Interactions', function () {

            var element;
            var formatStrip;

            beforeEach(function () {
                element = $(FORMATSTRIP1).appendTo(FIXTURES);
                formatStrip = element.kendoFormatStrip().data('kendoFormatStrip');
            });

            it('mouseover', function () {
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var min = formatStrip.options.min;
                var max = formatStrip.options.max;
                var step = formatStrip.options.step;
                var count = Math.round((max - min) / step);
                var stars = formatStrip.wrapper.find('span.kj-formatStrip-star');
                expect(stars).to.be.an.instanceof($).with.property('length', count);
                for (var pos = 0; pos < count; pos++) {
                    $(stars.get(pos)).simulate('mouseover');
                    for (var i = 0; i < count; i++) {
                        if (i <= pos) {
                            expect($(stars.get(i))).to.have.class('k-state-hover');
                        } else {
                            expect($(stars.get(i))).to.not.have.class('k-state-hover');
                        }
                    }
                }
            });

        });

        xdescribe('Events', function () {

            var element;
            var formatStrip;

            beforeEach(function () {
                element = $(FORMATSTRIP1).appendTo(FIXTURES);
            });

            it('change', function () {
                var change = sinon.spy();
                formatStrip = element.kendoFormatStrip({
                    change: function (e) {
                        change(e.value);
                    }
                }).data('kendoFormatStrip');
                expect(formatStrip).to.be.an.instanceof(FormatStrip);
                var min = formatStrip.options.min;
                var max = formatStrip.options.max;
                var step = formatStrip.options.step;
                var value = formatStrip.value();
                expect(min).to.equal(0);
                expect(max).to.equal(5);
                expect(step).to.equal(1);
                for (var i = min; i <= max; i += step) {
                    formatStrip.value(i);
                    expect(change).to.have.callCount(i + 1);
                    expect(change).to.have.been.calledWith(i);
                }
            });
        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.unbind(fixtures);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
