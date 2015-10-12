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
                var pointer = tools.pointer;
                expect(pointer.id).to.equal('pointer');
                expect(pointer.icon).to.equal('mouse_pointer');
                expect(pointer.cursor).to.equal('default');
                expect(pointer.height).to.equal(0);
                expect(pointer.width).to.equal(0);
                expect(pointer.getHtml).to.be.undefined;
                expect(pointer.onMove).to.be.undefined;
                expect(pointer.onResize).to.be.undefined;
                expect(pointer.onRotate).to.be.undefined;
            });

        });

        describe('Label', function () {

            it('Validate label properties', function () {
                var label = tools.label;
                expect(label.id).to.equal('label');
                expect(label.icon).to.equal('document_orientation_landscape');
                expect(label.cursor).to.equal('crosshair');
                expect(label.height).to.equal(100);
                expect(label.width).to.equal(300);
                expect(label.getHtml).to.respond;
                expect(label.onMove).to.be.undefined;
                expect(label.onResize).to.respond;
                expect(label.onRotate).to.be.undefined;
            });

            it('Check getHtml', function () {
                var label = tools.label;
                var component = new PageComponent({ tool: 'label' });
                var html;

                // If we do not submit a page component
                html = label.getHtml({});
                expect(html).to.be.undefined;

                // If we submit a valid page component
                html = label.getHtml(component);
                expect(html).to.match(/^<div/);

            });

        });

        describe('Image', function () {

            it('Validate image properties', function () {
                var image = tools.image;
                expect(image.id).to.equal('image');
                expect(image.icon).to.equal('painting_landscape');
                expect(image.cursor).to.equal('crosshair');
                expect(image.height).to.equal(250);
                expect(image.width).to.equal(250);
                expect(image.getHtml).to.respond;
                expect(image.onMove).to.be.undefined;
                expect(image.onResize).to.respond;
                expect(image.onRotate).to.be.undefined;
            });

            it('Check getHtml', function () {
                var image = tools.image;
                var component = new PageComponent({ tool: 'image' });
                var html;

                // If we do not submit a page component
                html = image.getHtml({});
                expect(html).to.be.undefined;

                // If we submit a valid page component
                html = image.getHtml(component);
                expect(html).to.match(/^<img/);
            });

        });

        describe('Textbox', function () {

            it('Validate textbox properties', function () {
                var textbox = tools.textbox;
                expect(textbox.id).to.equal('textbox');
                expect(textbox.icon).to.equal('text_field');
                expect(textbox.cursor).to.equal('crosshair');
                expect(textbox.height).to.equal(100);
                expect(textbox.width).to.equal(300);
                expect(textbox.getHtml).to.respond;
                expect(textbox.onMove).to.be.undefined;
                expect(textbox.onResize).to.respond;
                expect(textbox.onRotate).to.be.undefined;
            });

            it('Check getHtml', function () {
                var textbox = tools.textbox;
                var component = new PageComponent({ tool: 'textbox' });
                var html;

                // If we do not submit a page component
                html = textbox.getHtml({});
                expect(html).to.be.undefined;

                // If we submit a valid page component
                html = textbox.getHtml(component);
                expect(html).to.match(/^<input/);
            });

        });

        xdescribe('Button', function () {

            it('Validate button properties', function () {
                var button = tools.button;
                expect(button.id).to.equal('button');
                expect(button.icon).to.equal('button');
                expect(button.cursor).to.equal('crosshair');
                expect(button.height).to.equal(100);
                expect(button.width).to.equal(300);
                expect(button.getHtml).to.respond;
                expect(button.onMove).to.be.undefined;
                expect(button.onResize).to.respond;
                expect(button.onRotate).to.be.undefined;
            });

            it('Check getHtml', function () {
                var button = tools.button;
                var component = new PageComponent({ tool: 'button' });
                var html;

                // If we do not submit a page component
                html = button.getHtml({});
                expect(html).to.be.undefined;

                // If we submit a valid page component
                html = button.getHtml(component);
                expect(html).to.match(/^<a/);
            });

        });

        describe('Checkbox', function () {

            it('Validate checkbox properties', function () {
                var checkbox = tools.checkbox;
                expect(checkbox.id).to.equal('checkbox');
                expect(checkbox.icon).to.equal('checkbox');
                expect(checkbox.cursor).to.equal('crosshair');
                expect(checkbox.height).to.equal(60);
                expect(checkbox.width).to.equal(500);
                expect(checkbox.getHtml).to.respond;
                expect(checkbox.onMove).to.be.undefined;
                expect(checkbox.onResize).to.respond;
                expect(checkbox.onRotate).to.be.undefined;
            });

            it('Check getHtml', function () {
                var checkbox = tools.checkbox;
                var component = new PageComponent({ tool: 'checkbox' });
                var html;

                // If we do not submit a page component
                html = checkbox.getHtml({});
                expect(html).to.be.undefined;

                // If we submit a valid page component
                html = checkbox.getHtml(component);
                expect(html).to.match(/^<div><input/);

                // TODO: use jQuery for refined tests
            });

        });

        describe('Quiz', function () {

            it('Validate quiz properties', function () {
                var quiz = tools.quiz;
                expect(quiz.id).to.equal('quiz');
                expect(quiz.icon).to.equal('radio_button_group');
                expect(quiz.cursor).to.equal('crosshair');
                expect(quiz.height).to.equal(300);
                expect(quiz.width).to.equal(500);
                expect(quiz.getHtml).to.respond;
                expect(quiz.onMove).to.be.undefined;
                expect(quiz.onResize).to.respond;
                expect(quiz.onRotate).to.be.undefined;
            });

            it('Check getHtml', function () {
                var quiz = tools.quiz;
                var component = new PageComponent({ tool: 'quiz' });
                var html;

                // If we do not submit a page component
                html = quiz.getHtml({});
                expect(html).to.be.undefined;

                // If we submit a valid page component
                html = quiz.getHtml(component);
                expect(html).to.match(/^<div/);

                // TODO: use jQuery for refined tests
            });

        });

    });

}(this));
