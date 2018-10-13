/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import 'jquery.mockjax';
import tools from '../../../src/js/tools/tools.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';


const { describe, it, kendo, xit } = window;
const { expect } = chai;
const { data: ObservableObject } = kendo;

describe('tools', function() {
    describe('Loading', function() {
        it('it should find tools', function() {
            expect(tools).to.be.an.instanceof(ObservableObject);
            expect(tools).to.have.property('active');
            expect(tools).to.respondTo('register');
        });

        it('it should have a pointer, a label and an image tool', () => {
                expect(tools).to.have.property('pointer').that.is.an.instanceof(Tool);
                expect(tools).to.have.property('label').that.is.an.instanceof(Tool);
                expect(tools).to.have.property('image').that.is.an.instanceof(Tool);
                expect(tools).to.have.property('active', 'pointer');
            });
    });

    describe('Registering a new tool', () => {
        it('it should throw when registering a tool that is not a class', function () {
            function fn() {
                var obj = { id:'dummy' };
                tools.register(obj);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool that is not inherited from Tool', function () {
            function DummyTool(options) {
                this.id = 'dummy';
                this.options = options;
            }
            function fn() {
                tools.register(DummyTool);
            }
            expect(fn).to.throw;
        });

        it('it should throw if tool has no id', function () {
            function fn() {
                var ToolWithoutId = Tool.extend({});
                tools.register(ToolWithoutId);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool named `active`', function () {
            function fn() {
                var Active = Tool.extend({ id: 'active' });
                tools.register(Active);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool named `register`', function () {
            function fn() {
                var Register = Tool.extend({ id: 'register' });
                tools.register(Register);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool with an existing id', function () {
            function fn () {
                var ExistingTool = Tool.extend({
                    id: 'image', add: function (a, b) {
                        return a + b;
                    }
                });
                tools.register(ExistingTool);
            }
            expect(fn).to.throw;
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
});
