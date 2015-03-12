/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, undefined) {

    'use strict';

    var expect = window.chai.expect,
        kendo = window.kendo,
        kidoju = window.kidoju;


    describe('kidoju.tools', function() {

        describe('Loading', function() {

            it('it should find kidoju.tools', function() {
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject);
                expect(kidoju.tools).to.have.property('active');
                expect(kidoju.tools).to.respondTo('register');
            });

            it('it should have a pointer, a label and an image tool', function() {
                expect(kidoju.tools).to.have.property('pointer').that.is.an.instanceof(kidoju.Tool);
                expect(kidoju.tools).to.have.property('label').that.is.an.instanceof(kidoju.Tool);
                expect(kidoju.tools).to.have.property('image').that.is.an.instanceof(kidoju.Tool);
                expect(kidoju.tools).to.have.property('active', 'pointer');
            });

        });

        describe('Registering a new tool', function() {

            it('it should discard a tool that is not a class', function() {
                var keys = Object.keys(kidoju.tools),
                    obj = {id:'dummy'};
                kidoju.tools.register(obj);
                expect(Object.keys(kidoju.tools)).to.eql(keys);
            });

            it('it should discard a tool that is a class which is not inherited from kidoju.Tool', function() {
                function Tool(options) {
                    this.id = 'dummy';
                    this.options = options;
                }
                var keys = Object.keys(kidoju.tools);
                kidoju.tools.register(Tool);
                expect(Object.keys(kidoju.tools)).to.eql(keys);
            });

            it('it should discard a tool without id', function() {
                var Tool = kidoju.Tool.extend({}),
                    keys = Object.keys(kidoju.tools);
                kidoju.tools.register(Tool);
                expect(Object.keys(kidoju.tools)).to.eql(keys);
            });

            it('it should raise an error when registering a tool named `active`', function() {
                var fn = function() {
                    var Active = kidoju.Tool.extend({id: 'active'});
                    kidoju.tools.register(Active);
                };
                expect(fn).to.throw(Error);
            });

            it('it should raise an error when registering a tool named `register`', function() {
                var fn = function() {
                    var Register = kidoju.Tool.extend({id: 'register'});
                    kidoju.tools.register(Register);
                };
                expect(fn).to.throw(Error);
            });

            it('it should discard a tool with an existing id', function() {
                var Tool = kidoju.Tool.extend({id: 'image', add: function(a, b) { return a + b; }}),
                    keys = Object.keys(kidoju.tools);
                kidoju.tools.register(Tool);
                expect(Object.keys(kidoju.tools)).to.eql(keys);
                expect(kidoju.tools).to.have.property('image').that.is.an.instanceof(kidoju.Tool);
                expect(kidoju.tools.image.add).to.be.undefined;
            });

            it('it should accept a tool with a new id', function() {
                var Calculator = kidoju.Tool.extend({id: 'calculator', add: function(a, b) { return a + b; }}),
                    keys = Object.keys(kidoju.tools);
                kidoju.tools.register(Calculator);
                expect(Object.keys(kidoju.tools)).to.not.eql(keys);
                expect(kidoju.tools).to.have.property('calculator').that.is.an.instanceof(Calculator);
                expect(kidoju.tools.calculator.add(1, 2)).to.equal(3);
                //clean
                delete kidoju.tools.calculator;
            });

        });

        describe('Attribute Adapters', function () {

            it('Validate StringAdapter', function() {
                var adapter = new kidoju.adapters.StringAdapter(),
                    field = adapter.getField(),
                    row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate NumberAdapter', function() {
                var adapter = new kidoju.adapters.NumberAdapter(),
                    field = adapter.getField(),
                    row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);

            });

            it('Validate BooleanAdapter', function() {
                var adapter = new kidoju.adapters.BooleanAdapter(),
                    field = adapter.getField(),
                    row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);

            });

            it('Validate DateAdapter', function() {
                var adapter = new kidoju.adapters.DateAdapter(),
                    field = adapter.getField(),
                    row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);

            });

            it('Validate StyleAdapter', function() {
                var adapter = new kidoju.adapters.StyleAdapter(),
                    field = adapter.getField(),
                    row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

        });

        describe('Pointer', function() {

            it('Validate pointer properties', function() {
                var pointer = kidoju.tools.pointer;
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

        describe('Label', function() {

            it('Validate label properties', function() {
                var label = kidoju.tools.label;
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

            it('Check getHtml', function() {
                var label = kidoju.tools.label,
                    component = new kidoju.PageComponent({tool: 'label'}),
                    html;

                //If we do not submit a page component
                html = label.getHtml({});
                expect(html).to.be.undefined;

                //If we submit a valid page component
                html = label.getHtml(component);
                expect(html).to.match(/^<span/);

            });

        });

        describe('Image', function() {

            it('Validate image properties', function() {
                var image = kidoju.tools.image;
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

            it('Check getHtml', function() {
                var image = kidoju.tools.image,
                    component = new kidoju.PageComponent({tool: 'image'}),
                    html;

                //If we do not submit a page component
                html = image.getHtml({});
                expect(html).to.be.undefined;

                //If we submit a valid page component
                html = image.getHtml(component);
                expect(html).to.match(/^<img/);
            });
        });

        describe('Textbox', function() {

            it('Validate textbox properties', function() {
                var textbox = kidoju.tools.textbox;
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

            it('Check getHtml', function() {
                var textbox = kidoju.tools.textbox;
                var component = new kidoju.PageComponent({tool: 'textbox'});
                var html;

                //If we do not submit a page component
                html = textbox.getHtml({});
                expect(html).to.be.undefined;

                //If we submit a valid page component
                html = textbox.getHtml(component);
                expect(html).to.match(/^<input/);
            });
        });

        describe('Button', function() {

            it('Validate button properties', function() {
                var button = kidoju.tools.button;
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

            it('Check getHtml', function() {
                var button = kidoju.tools.button,
                    component = new kidoju.PageComponent({tool: 'button'}),
                    html;

                //If we do not submit a page component
                html = button.getHtml({});
                expect(html).to.be.undefined;

                //If we submit a valid page component
                html = button.getHtml(component);
                expect(html).to.match(/^<a/);
            });
        });

    });

}(this));
