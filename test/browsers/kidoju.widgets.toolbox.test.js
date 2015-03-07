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
        ICON_PATH = '../../src/styles/images/',
        TOOLBOX1 = '<div id="toolbox1"></div>',
        TOOLBOX2 = '<div id="toolbox2" data-role="toolbox" data-size="48" data-icon-path="' + ICON_PATH + '"></div>';


    describe('kidoju.widgets.toolbox', function() {

        before(function() {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function() {

            it('requirements', function() {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect(kidoju).not.to.be.undefined;
                expect(kidoju.tools).not.to.be.undefined;
                expect($.fn.kendoToolbox).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function() {

            it('from code', function() {
                var element = $(TOOLBOX1).appendTo(FIXTURES),
                    toolbox = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-toolbox')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(32);
                expect(element.find('img.kj-tool').height()).to.equal(32);
            });

            it('from code with options', function() {
                var element = $(TOOLBOX1).appendTo(FIXTURES),
                    toolbox = element.kendoToolbox({ iconPath: ICON_PATH, size: 64 }).data('kendoToolbox');
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-toolbox')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(64);
                expect(element.find('img.kj-tool').height()).to.equal(64);
            });

            it('from markup', function() {
                var element = $(TOOLBOX2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var toolbox = element.data('kendoToolbox');
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-toolbox')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(48);
                expect(element.find('img.kj-tool').height()).to.equal(48);
            });

        });

        describe('Methods', function() {

            var element, toolbox;

            beforeEach(function() {
                element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
            });

            it('Set/Get the current tool with valid values', function() {
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                expect(toolbox.tool()).to.equal('pointer');
                toolbox.tool('label');
                expect(toolbox.tool()).to.equal('label');
                expect(kidoju.tools).to.have.property('active', 'label');
                toolbox.tool('button');
                expect(toolbox.tool()).to.equal('button');
                expect(kidoju.tools).to.have.property('active', 'button');
            });

            it('Set/Get the current tool with invalid values', function() {
                function fn1() {
                    toolbox.tool(0);
                }
                function fn2() {
                    toolbox.tool('dummy');
                }
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
            });

            it('Reset', function() {
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox.tool('label');
                expect(kidoju.tools).to.have.property('active', 'label');
                toolbox.reset();
                expect(kidoju.tools).to.have.property('active', 'pointer');
                toolbox.tool('button');
                expect(kidoju.tools).to.have.property('active', 'button');
                toolbox.reset();
                expect(kidoju.tools).to.have.property('active', 'pointer');
            });

        });

        describe('MVVM', function() {

            var element, toolbox;

            beforeEach(function() {
                element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
            });

            it('A change of tool raises a change in the toolbox', function() {
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                expect(toolbox.tool()).to.equal('pointer');
                kidoju.tools.set('active', 'label');
                expect(toolbox.tool()).to.equal('label');
                expect(element.find('img[data-selected]').attr('data-tool')).to.equal('label');
            });

        });

        describe('Events', function() {

            var element, toolbox;

            beforeEach(function() {
                element = $(TOOLBOX1).appendTo(FIXTURES);
                toolbox = element.kendoToolbox({ iconPath: ICON_PATH }).data('kendoToolbox');
            });

            it('Change event', function() {
                var change = sinon.spy();
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                toolbox.bind('change', function(e) {
                    change(e.value);
                });
                toolbox.tool('label');
                expect(change).to.have.been.calledWith('label');
            });

            it('Click event', function() {
                var click = sinon.spy();
                expect(toolbox).to.be.an.instanceof(kendo.ui.Toolbox);
                toolbox.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                toolbox.bind('click', function(e) {
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
