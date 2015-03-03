/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        sinon = window.sinon,
        kendo = window.kendo,
        kidoju = window.kidoju,
        FIXTURES = '#fixtures',
        ICON_PATH = '../../src/styles/images/toolbox/',
        TOOLBOX1 = '<div id="toolbox1"></div>',
        TOOLBOX2 = '<div id="toolbox2" data-role="toolbox" data-size="48" data-icon-path="' + ICON_PATH + '"></div>';


    describe('kidoju.widgets.toolbox', function() {

        var toolbox1, toolbox2;

        describe('Initialization', function() {

            it('from code', function() {
                var element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox1 = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-toolbox')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(32);
                expect(element.find('img.kj-tool').height()).to.equal(32);
            });

            it('from code with options', function() {
                var element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox1 = element.kendoToolbox({ iconPath: ICON_PATH, size: 64 }).data('kendoToolbox');
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-toolbox')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(64);
                expect(element.find('img.kj-tool').height()).to.equal(64);
            });

            it('from markup', function() {
                var element = $(TOOLBOX2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                toolbox2 = element.data('kendoToolbox');
                expect(toolbox2).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-toolbox')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(48);
                expect(element.find('img.kj-tool').height()).to.equal(48);
            });

        });

        describe('Methods', function() {

            it('Set/Get the current tool with valid values', function() {
                var element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox1 = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                expect(toolbox1.tool()).to.equal('pointer');
                toolbox1.tool('label');
                expect(toolbox1.tool()).to.equal('label');
                expect(kidoju.tools).to.have.property('active', 'label');
                toolbox1.tool('button');
                expect(toolbox1.tool()).to.equal('button');
                expect(kidoju.tools).to.have.property('active', 'button');
            });

            it('Set/Get the current tool with invalid values', function() {
                function fn1() {
                    toolbox1.tool(0);
                }
                function fn2() {
                    toolbox1.tool('dummy');
                }
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
            });

            it('Reset', function() {
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox1.tool('label');
                expect(kidoju.tools).to.have.property('active', 'label');
                toolbox1.reset();
                expect(kidoju.tools).to.have.property('active', 'pointer');
                toolbox1.tool('button');
                expect(kidoju.tools).to.have.property('active', 'button');
                toolbox1.reset();
                expect(kidoju.tools).to.have.property('active', 'pointer');
            });

        });

        describe('MVVM', function() {

            it('A change of tool raises a change in the toolbox', function() {
                var element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox1 = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox1.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                expect(toolbox1.tool()).to.equal('pointer');
                kidoju.tools.set('active', 'label');
                expect(toolbox1.tool()).to.equal('label');
                expect(element.find('img[data-selected]').attr('data-tool')).to.equal('label');
            });

        });

        describe('Events', function() {

            it('Change event', function() {
                var change = sinon.spy(),
                    element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox1 = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
                expect(toolbox1).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox1.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                toolbox1.bind('change', function(e) {
                    change(e.value);
                });
                toolbox1.tool('label');
                expect(change).to.have.been.calledWith('label');
            });

            it('Click event', function() {
                var click = sinon.spy(),
                    element = $(TOOLBOX2).appendTo(FIXTURES);
                toolbox2 = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
                expect(toolbox2).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox2.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                toolbox2.bind('click', function(e) {
                    click(e.value);
                });
                element.find('img[data-tool=button]').simulate('click');
                expect(click).to.have.been.calledWith('button');
            });

        });

        afterEach(function() {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
