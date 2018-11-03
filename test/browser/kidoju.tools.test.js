/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
import '../../../src/js/widgets/widgets.buttonset.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { ButtonSet }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<input>';
const ROLE = 'buttonset';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

var expect = window.chai.expect;
const kendo = window.kendo;
const kidoju = window.kidoju;
const PageComponent = kidoju.data.PageComponent;
const Tool = kidoju.Tool;
const tools = kidoju.tools;
const adapters = kidoju.adapters;

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

describe('tools', () => {
    describe('Loading', () => {
        it('it should find tools', () => {
            expect(tools).to.be.an.instanceof(kendo.data.ObservableObject);
            expect(tools).to.have.property('active');
            expect(tools).to.respondTo('register');
        });

        it('it should have a pointer, a label and an image tool', () => {
            expect(tools)
                .to.have.property('pointer')
                .that.is.an.instanceof(Tool);
            expect(tools)
                .to.have.property('label')
                .that.is.an.instanceof(Tool);
            expect(tools)
                .to.have.property('image')
                .that.is.an.instanceof(Tool);
            expect(tools).to.have.property('active', 'pointer');
        });
    });

    describe('Registering a new tool', () => {
        it('it should throw when registering a tool that is not a class', () => {
            function fn() {
                const obj = { id: 'dummy' };
                tools.register(obj);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool that is not inherited from Tool', () => {
            function DummyTool(options) {
                this.id = 'dummy';
                this.options = options;
            }
            function fn() {
                tools.register(DummyTool);
            }
            expect(fn).to.throw;
        });

        it('it should throw if tool has no id', () => {
            function fn() {
                const ToolWithoutId = Tool.extend({});
                tools.register(ToolWithoutId);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool named `active`', () => {
            function fn() {
                const Active = Tool.extend({ id: 'active' });
                tools.register(Active);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool named `register`', () => {
            function fn() {
                const Register = Tool.extend({ id: 'register' });
                tools.register(Register);
            }
            expect(fn).to.throw;
        });

        it('it should throw when registering a tool with an existing id', () => {
            function fn() {
                const ExistingTool = Tool.extend({
                    id: 'image',
                    add(a, b) {
                        return a + b;
                    }
                });
                tools.register(ExistingTool);
            }
            expect(fn).to.throw;
            expect(tools)
                .to.have.property('image')
                .that.is.an.instanceof(Tool);
            expect(tools.image.add).to.be.undefined;
        });

        it('it should accept a tool with a new id', () => {
            const CalculatorTool = Tool.extend({
                id: 'calculator',
                add(a, b) {
                    return a + b;
                }
            });
            const keys = Object.keys(tools);
            tools.register(CalculatorTool);
            expect(Object.keys(tools)).to.not.eql(keys);
            expect(tools)
                .to.have.property('calculator')
                .that.is.an.instanceof(CalculatorTool);
            expect(tools.calculator.add(1, 2)).to.equal(3);
            // clean
            delete tools.calculator;
        });
    });

    describe('Attribute Adapters', () => {
        it('Validate AssetAdapter', () => {
            const adapter = new adapters.AssetAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate BooleanAdapter', () => {
            const adapter = new adapters.BooleanAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate CharGridAdapter', () => {
            const adapter = new adapters.CharGridAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field.type).to.be.undefined;
        });

        it('Validate ChartAdapter', () => {
            const adapter = new adapters.ChartAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field.type).to.be.undefined;
        });

        it('Validate ColorAdapter', () => {
            const adapter = new adapters.ColorAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate ConnectorAdapter', () => {
            const adapter = new adapters.ConnectorAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate DateAdapter', () => {
            const adapter = new adapters.DateAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate DisabledAdapter', () => {
            const adapter = new adapters.DisabledAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate EnumAdapter', () => {
            const adapter = new adapters.EnumAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate MultiQuizSolutionAdapter', () => {
            const adapter = new adapters.MultiQuizSolutionAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field.type).to.be.undefined;
        });

        it('Validate NameAdapter', () => {
            const adapter = new adapters.NameAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate NumberAdapter', () => {
            const adapter = new adapters.NumberAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate QuestionAdapter', () => {
            const adapter = new adapters.NumberAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate QuizDataAdapter', () => {
            const adapter = new adapters.QuizDataAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field.type).to.be.undefined;
        });

        it('Validate QuizSolutionAdapter', () => {
            const adapter = new adapters.QuizSolutionAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate ScoreAdapter', () => {
            const adapter = new adapters.ScoreAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate SelectorAdapter', () => {
            const adapter = new adapters.ScoreAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate StringAdapter', () => {
            const adapter = new adapters.StringAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate StringArrayAdapter', () => {
            const adapter = new adapters.StringArrayAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate StyleAdapter', () => {
            const adapter = new adapters.StyleAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate TextAdapter', () => {
            const adapter = new adapters.TextAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('Validate ValidationAdapter', () => {
            const adapter = new adapters.ValidationAdapter();
            const field = adapter.getField();
            const row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });
    });

    describe('Pointer', () => {
        it('Validate pointer properties', () => {
            const tool = tools.pointer;
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

    describe('Audio', () => {
        it('Validate properties', () => {
            const tool = tools.audio;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.audio;
            var component = new PageComponent({ tool: 'audio' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(
                /^<div data-role="mediaplayer" data-mode="audio"/
            );

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(
                /^<div data-role="mediaplayer" data-mode="audio"/
            );

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(
                /^<div data-role="mediaplayer" data-mode="audio"/
            );
        });
    });

    describe('Chart', () => {
        it('Validate properties', () => {
            const tool = tools.chart;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.chart;
            var component = new PageComponent({ tool: 'chart' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="chart"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="chart"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="chart"/);
        });
    });

    describe('CharGrid', () => {
        it('Validate properties', () => {
            const tool = tools.chargrid;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.chargrid;
            var component = new PageComponent({ tool: 'chargrid' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="chargrid"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="chargrid"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="chargrid"/);
        });
    });

    describe('Connector', () => {
        it('Validate properties', () => {
            const tool = tools.connector;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.connector;
            var component = new PageComponent({ tool: 'connector' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="connector"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="connector"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="connector"/);
        });
    });

    describe('DropZone', () => {
        it('Validate properties', () => {
            const tool = tools.dropzone;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.dropzone;
            var component = new PageComponent({ tool: 'dropzone' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(
                /^<div id="val_[\w]{6}" data-role="dropzone"/
            );

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(
                /^<div id="val_[\w]{6}" data-role="dropzone"/
            );

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(
                /^<div id="val_[\w]{6}" data-role="dropzone"/
            );
        });
    });

    describe('Image', () => {
        it('Validate properties', () => {
            const tool = tools.image;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.image;
            var component = new PageComponent({ tool: 'image' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<img/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<img/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<img/);
        });
    });

    describe('Label', () => {
        it('Validate properties', () => {
            const tool = tools.label;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.label;
            var component = new PageComponent({ tool: 'label' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div/);
        });
    });

    describe('MathExpression', () => {
        it('Validate properties', () => {
            const tool = tools.mathexpression;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.mathexpression;
            var component = new PageComponent({ tool: 'mathexpression' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="mathexpression"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="mathexpression"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="mathexpression"/);
        });
    });

    describe('MultiQuiz', () => {
        it('Validate properties', () => {
            const tool = tools.multiquiz;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.multiquiz;
            var component = new PageComponent({ tool: 'multiquiz' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="multiquiz"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="multiquiz"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="multiquiz"/);
        });
    });

    describe('Quiz', () => {
        it('Validate properties', () => {
            const tool = tools.quiz;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.quiz;
            var component = new PageComponent({ tool: 'quiz' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="quiz"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="quiz"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="quiz"/);
        });
    });

    describe('Selector', () => {
        it('Validate properties', () => {
            const tool = tools.selector;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.selector;
            var component = new PageComponent({ tool: 'selector' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="selector"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="selector"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="selector"/);
        });
    });

    describe('Table', () => {
        it('Validate properties', () => {
            const tool = tools.table;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.table;
            var component = new PageComponent({ tool: 'table' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<div data-role="table"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<div data-role="table"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<div data-role="table"/);
        });
    });

    describe('Textarea', () => {
        it('Validate properties', () => {
            const tool = tools.textarea;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.textarea;
            var component = new PageComponent({ tool: 'textarea' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<textarea/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<textarea/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<textarea/);
        });
    });

    describe('Textbox', () => {
        it('Validate properties', () => {
            const tool = tools.textbox;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.textbox;
            var component = new PageComponent({ tool: 'textbox' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(/^<input/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(/^<input/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(/^<input/);
        });
    });

    describe('Video', () => {
        it('Validate properties', () => {
            const tool = tools.video;
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

        it('Check getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools.video;
            var component = new PageComponent({ tool: 'video' });
            let html;

            // If we do not submit a page component
            expect(fn1).to.throw;

            // If we do not submit a mode
            expect(fn2).to.throw;

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.design
            );
            expect(html).to.match(
                /^<div data-role="mediaplayer" data-mode="video"/
            );

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, kendo.ui.Stage.fn.modes.play);
            expect(html).to.match(
                /^<div data-role="mediaplayer" data-mode="video"/
            );

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(
                component,
                kendo.ui.Stage.fn.modes.review
            );
            expect(html).to.match(
                /^<div data-role="mediaplayer" data-mode="video"/
            );
        });
    });
});
