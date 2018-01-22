/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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

        describe('Attribute Adapters', function () {

            it('Validate AssetAdapter', function () {
                var adapter = new adapters.AssetAdapter();
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

            it('Validate CharGridAdapter', function () {
                var adapter = new adapters.CharGridAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field.type).to.be.undefined;
            });

            it('Validate ChartAdapter', function () {
                var adapter = new adapters.ChartAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field.type).to.be.undefined;
            });

            it('Validate ColorAdapter', function () {
                var adapter = new adapters.ColorAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate ConnectorAdapter', function () {
                var adapter = new adapters.ConnectorAdapter();
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

            it('Validate DisabledAdapter', function () {
                var adapter = new adapters.DisabledAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate EnumAdapter', function () {
                var adapter = new adapters.EnumAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate MultiQuizSolutionAdapter', function () {
                var adapter = new adapters.MultiQuizSolutionAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field.type).to.be.undefined;
            });

            it('Validate NameAdapter', function () {
                var adapter = new adapters.NameAdapter();
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

            it('Validate QuestionAdapter', function () {
                var adapter = new adapters.NumberAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate QuizDataAdapter', function () {
                var adapter = new adapters.QuizDataAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field.type).to.be.undefined;
            });

            it('Validate QuizSolutionAdapter', function () {
                var adapter = new adapters.QuizSolutionAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate ScoreAdapter', function () {
                var adapter = new adapters.ScoreAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate SelectorAdapter', function () {
                var adapter = new adapters.ScoreAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate StringAdapter', function () {
                var adapter = new adapters.StringAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate StringArrayAdapter', function () {
                var adapter = new adapters.StringArrayAdapter();
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

            it('Validate TextAdapter', function () {
                var adapter = new adapters.TextAdapter();
                var field = adapter.getField();
                var row = adapter.getRow('test');
                expect(field).to.have.property('type', adapter.type);
            });

            it('Validate ValidationAdapter', function () {
                var adapter = new adapters.ValidationAdapter();
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

        describe('Audio', function () {

            it('Validate properties', function () {
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

        describe('Chart', function () {

            it('Validate properties', function () {
                var tool = tools.chart;
                expect(tool.id).to.equal('chart');
                expect(tool.icon).to.equal('chart_area');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(400);
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
                var tool = tools.chart;
                var component = new PageComponent({ tool: 'chart' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="chart"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="chart"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="chart"/);
            });

        });

        describe('CharGrid', function () {

            it('Validate properties', function () {
                var tool = tools.chargrid;
                expect(tool.id).to.equal('chargrid');
                expect(tool.icon).to.equal('dot_matrix');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(400);
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
                var tool = tools.chargrid;
                var component = new PageComponent({ tool: 'chargrid' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="chargrid"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="chargrid"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="chargrid"/);
            });

        });

        describe('Connector', function () {

            it('Validate properties', function () {
                var tool = tools.connector;
                expect(tool.id).to.equal('connector');
                expect(tool.icon).to.equal('target');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(70);
                expect(tool.width).to.equal(70);
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
                var tool = tools.connector;
                var component = new PageComponent({ tool: 'connector' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="connector"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="connector"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="connector"/);
            });

        });

        describe('DropZone', function () {

            it('Validate properties', function () {
                var tool = tools.dropzone;
                expect(tool.id).to.equal('dropzone');
                expect(tool.icon).to.equal('elements_selection');
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
                var tool = tools.dropzone;
                var component = new PageComponent({ tool: 'dropzone' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div id="val_[\w]{6}" data-role="dropzone"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div id="val_[\w]{6}" data-role="dropzone"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div id="val_[\w]{6}" data-role="dropzone"/);
            });

        });

        describe('Image', function () {

            it('Validate properties', function () {
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

        describe('Label', function () {

            it('Validate properties', function () {
                var tool = tools.label;
                expect(tool.id).to.equal('label');
                expect(tool.icon).to.equal('font');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(80);
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

        describe('MathExpression', function () {

            it('Validate properties', function () {
                var tool = tools.mathexpression;
                expect(tool.id).to.equal('mathexpression');
                expect(tool.icon).to.equal('formula');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(180);
                expect(tool.width).to.equal(370);
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
                var tool = tools.mathexpression;
                var component = new PageComponent({ tool: 'mathexpression' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="mathexpression"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="mathexpression"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="mathexpression"/);
            });

        });

        describe('MultiQuiz', function () {

            it('Validate properties', function () {
                var tool = tools.multiquiz;
                expect(tool.id).to.equal('multiquiz');
                expect(tool.icon).to.equal('checkbox_group');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(150);
                expect(tool.width).to.equal(420);
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
                var tool = tools.multiquiz;
                var component = new PageComponent({ tool: 'multiquiz' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="multiquiz"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="multiquiz"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="multiquiz"/);
            });

        });

        describe('Quiz', function () {

            it('Validate properties', function () {
                var tool = tools.quiz;
                expect(tool.id).to.equal('quiz');
                expect(tool.icon).to.equal('radio_button_group');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(120);
                expect(tool.width).to.equal(490);
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

        describe('Selector', function () {

            it('Validate properties', function () {
                var tool = tools.selector;
                expect(tool.id).to.equal('selector');
                expect(tool.icon).to.equal('selector');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(150);
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
                var tool = tools.selector;
                var component = new PageComponent({ tool: 'selector' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="selector"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="selector"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="selector"/);
            });

        });

        describe('Table', function () {

            it('Validate properties', function () {
                var tool = tools.table;
                expect(tool.id).to.equal('table');
                expect(tool.icon).to.equal('table');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(350);
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
                var tool = tools.table;
                var component = new PageComponent({ tool: 'table' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<div data-role="table"/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<div data-role="table"/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<div data-role="table"/);
            });

        });

        describe('Textarea', function () {

            it('Validate properties', function () {
                var tool = tools.textarea;
                expect(tool.id).to.equal('textarea');
                expect(tool.icon).to.equal('document_orientation_landscape');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(300);
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
                var tool = tools.textarea;
                var component = new PageComponent({ tool: 'textarea' });
                var html;

                // If we do not submit a page component
                expect(fn1).to.throw;

                // If we do not submit a mode
                expect(fn2).to.throw;

                // If we submit a valid page component in design mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.design);
                expect(html).to.match(/^<textarea/);

                // If we submit a valid page component in play mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
                expect(html).to.match(/^<textarea/);

                // If we submit a valid page component in review mode
                html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.review);
                expect(html).to.match(/^<textarea/);
            });

        });

        describe('Textbox', function () {

            it('Validate properties', function () {
                var tool = tools.textbox;
                expect(tool.id).to.equal('textbox');
                expect(tool.icon).to.equal('text_field');
                expect(tool.cursor).to.equal('crosshair');
                expect(tool.height).to.equal(80);
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

        describe('Video', function () {

            it('Validate properties', function () {
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
