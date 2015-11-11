/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var kendo = window.kendo;
    var kidoju = window.kidoju;
    var PageComponent = kidoju.data.PageComponent;
    var Tool = kidoju.Tool;
    var tools = kidoju.tools;
    var adapters = kidoju.adapters;

    // No need to load kendo.widgets.stage.js
    kendo.ui.Stage = {
        fn: {
            modes: {
                design: 'design',
                play: 'play',
                review: 'review'
            }
        }
    };


    describe('tools', function () {

        describe('Loading', function () {

            it('it should find tools', function () {
                expect(tools).to.be.an.instanceof(kendo.data.ObservableObject);
                expect(tools).to.have.property('active');
                expect(tools).to.respondTo('register');
            });

            it('it should have a pointer, a label and an image tool', function () {
                expect(tools).to.have.property('pointer').that.is.an.instanceof(Tool);
                expect(tools).to.have.property('label').that.is.an.instanceof(Tool);
                expect(tools).to.have.property('image').that.is.an.instanceof(Tool);
                expect(tools).to.have.property('active', 'pointer');
            });

        });

        describe('Registering a new tool', function () {

            it('it should discard a tool that is not a class', function () {
                var keys = Object.keys(tools);
                var obj = { id:'dummy' };
                tools.register(obj);
                expect(Object.keys(tools)).to.eql(keys);
            });

            it('it should discard a tool that is a class which is not inherited from Tool', function () {
                function DummyTool(options) {
                    this.id = 'dummy';
                    this.options = options;
                }
                var keys = Object.keys(tools);
                tools.register(DummyTool);
                expect(Object.keys(tools)).to.eql(keys);
            });

            it('it should discard a tool without id', function () {
                var ToolWithoutId = Tool.extend({});
                var keys = Object.keys(tools);
                tools.register(ToolWithoutId);
                expect(Object.keys(tools)).to.eql(keys);
            });

            it('it should raise an error when registering a tool named `active`', function () {
                var fn = function () {
                    var Active = Tool.extend({ id: 'active' });
                    tools.register(Active);
                };
                expect(fn).to.throw(Error);
            });

            it('it should raise an error when registering a tool named `register`', function () {
                var fn = function () {
                    var Register = Tool.extend({ id: 'register' });
                    tools.register(Register);
                };
                expect(fn).to.throw(Error);
            });

            it('it should discard a tool with an existing id', function () {
                var ExistingTool = Tool.extend({ id: 'image', add: function (a, b) { return a + b; }});
                var keys = Object.keys(tools);
                tools.register(ExistingTool);
                expect(Object.keys(tools)).to.eql(keys);
                expect(tools).to.have.property('image').that.is.an.instanceof(Tool);
                expect(tools.image.add).to.be.undefined;
            });

            it('it should accept a tool with a new id', function () {
                var CalculatorTool = Tool.extend({ id: 'calculator', add: function (a, b) { return a + b; }});
                var keys = Object.keys(tools);
                tools.register(CalculatorTool);
                expect(Object.keys(tools)).to.not.eql(keys);
                expect(tools).to.have.property('calculator').that.is.an.instanceof(CalculatorTool);
                expect(tools.calculator.add(1, 2)).to.equal(3);
                // clean
                delete tools.calculator;
            });

        });

        describe('Attribute Adapters', function () {

            it('Validate StringAdapter', function () {
                var adapter = new adapters.StringAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate NumberAdapter', function () {
                var adapter = new adapters.NumberAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate BooleanAdapter', function () {
                var adapter = new adapters.BooleanAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate DateAdapter', function () {
                var adapter = new adapters.DateAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate StyleAdapter', function () {
                var adapter = new adapters.StyleAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

        });

        describe('Pointer', function () {

            it('Validate pointer properties', function () {
                var tool = tools.pointer;
                expect(tool.id).to.equal('pointer');
                expect(tool.icon).to.equal('mouse_pointer');
                expect(tool.cursor).to.equal('default');
                expect(tool.height).to.equal(0);
                expect(tool.width).to.equal(0);
                expect(tool.getHtmlContent).to.be.undefined;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.be.undefined;
                expect(tool.onRotate).to.be.undefined;
            });

        });

        describe('Label', function () {

            it('Validate label properties', function () {
                var tool = tools.label;
                expect(tool.id).to.equal('label');
                expect(tool.icon).to.equal('document_orientation_landscape');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(100);
                expect(tool.width).to.equal(300);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.label;
                var component = new PageComponent({ tool: 'label' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div/);
            });

        });

        describe('Image', function () {

            it('Validate image properties', function () {
                var tool = tools.image;
                expect(tool.id).to.equal('image');
                expect(tool.icon).to.equal('painting_landscape');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(250);
                expect(tool.width).to.equal(250);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.image;
                var component = new PageComponent({ tool: 'image' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<img/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<img/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<img/);
            });

        });

        describe('Textbox', function () {

            it('Validate textbox properties', function () {
                var tool = tools.textbox;
                expect(tool.id).to.equal('textbox');
                expect(tool.icon).to.equal('text_field');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(100);
                expect(tool.width).to.equal(300);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.textbox;
                var component = new PageComponent({ tool: 'textbox' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<input/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<input/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<input/);
            });

        });

        describe('Checkbox', function () {

            it('Validate checkbox properties', function () {
                var tool = tools.checkbox;
                expect(tool.id).to.equal('checkbox');
                expect(tool.icon).to.equal('checkbox');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(60);
                expect(tool.width).to.equal(500);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.checkbox;
                var component = new PageComponent({ tool: 'checkbox' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div><input/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div><input/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div><input/);
            });

        });

        describe('Quiz', function () {

            it('Validate quiz properties', function () {
                var tool = tools.quiz;
                expect(tool.id).to.equal('quiz');
                expect(tool.icon).to.equal('radio_button_group');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(100);
                expect(tool.width).to.equal(300);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.quiz;
                var component = new PageComponent({ tool: 'quiz' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="quiz"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="quiz"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="quiz"/);
            });

        });

        describe('Audio', function () {

            it('Validate audio properties', function () {
                var tool = tools.audio;
                expect(tool.id).to.equal('audio');
                expect(tool.icon).to.equal('loudspeaker3');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(100);
                expect(tool.width).to.equal(400);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.audio;
                var component = new PageComponent({ tool: 'audio' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);
            });

        });

        describe('Video', function () {

            it('Validate audio properties', function () {
                var tool = tools.video;
                expect(tool.id).to.equal('video');
                expect(tool.icon).to.equal('movie');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(300);
                expect(tool.width).to.equal(600);
                expect(tool.getHtmlContent).to.respond;
                expect(tool.onMove).to.be.undefined;
                expect(tool.onResize).to.respond;
                expect(tool.onRotate).to.be.undefined;
            });

            it('Check getHtmlContent', function () {
                function fn1() {
                    return tool.getHtmlContent({});
                }
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                var tool = tools.video;
                var component = new PageComponent({ tool: 'video' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="mediaplayer" data-mode="video"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="mediaplayer" data-mode="video"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="mediaplayer" data-mode="video"/);
            });

        });

    });

}(this));
