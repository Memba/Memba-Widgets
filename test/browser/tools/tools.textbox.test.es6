/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO help and menu

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import Page from '../../../src/js/data/models.page.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';
import tools from '../../../src/js/tools/tools.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';
import { tryCatch } from '../_misc/test.util.es6';

// Load tool
import '../../../src/js/tools/tools.textbox.es6';
// Load component
import { getTextBox } from '../_misc/test.components.es6';

const { describe, it } = window;
const { htmlEncode } = window.kendo;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
const FIXTURES = '#fixtures';

describe('tools.textbox', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('TextBoxTool', () => {
        const tool = tools.textbox;
        const component = new PageComponent(getTextBox());

        describe('Descriptors', () => {
            it('It should have descriptors', () => {
                expect(tool).to.be.an.instanceof(BaseTool);
                expect(tool).to.have.property(
                    'cursor',
                    CONSTANTS.CROSSHAIR_CURSOR
                );
                expect(tool).to.have.property('description', 'TextBox');
                expect(tool).to.have.property('height', 80);
                expect(tool).to.have.property('help', null); // TODO
                expect(tool).to.have.property('id', 'textbox');
                expect(tool).to.have.property('icon', 'text_field');
                expect(tool).to.have.property('weight', 1);
                expect(tool).to.have.property('width', 300);
            });
        });

        describe('getAttributeModel', () => {
            it('It should get an attribute model', () => {
                const Model = tool.getAttributeModel(component);
                expect(
                    Object.prototype.isPrototypeOf.call(
                        BaseModel.prototype,
                        Model.prototype
                    )
                ).to.be.true;
                expect(Model.fields).to.have.property('mask');
                expect(Model.fields).to.have.property('style');
            });
        });

        describe('getAttributeRows', () => {
            it('It should get attribute rows', () => {
                const rows = tool.getAttributeRows(component);
                expect(rows)
                    .to.be.an('array')
                    .with.lengthOf(7);
                expect(rows[0]).to.have.property('field', 'top');
                expect(rows[1]).to.have.property('field', 'left');
                expect(rows[2]).to.have.property('field', 'height');
                expect(rows[3]).to.have.property('field', 'width');
                expect(rows[4]).to.have.property('field', 'rotate');
                expect(rows[5]).to.have.property('field', 'attributes.mask');
                expect(rows[6]).to.have.property('field', 'attributes.style');
            });
        });

        describe('getPropertyModel', () => {
            it('It should get a property model', () => {
                const Model = tool.getPropertyModel(component);
                expect(
                    Object.prototype.isPrototypeOf.call(
                        BaseModel.prototype,
                        Model.prototype
                    )
                ).to.be.true;
                expect(Model.fields).to.have.property('failure');
                expect(Model.fields).to.have.property('name');
                expect(Model.fields).to.have.property('omit');
                expect(Model.fields).to.have.property('question');
                expect(Model.fields).to.have.property('solution');
                expect(Model.fields).to.have.property('success');
                expect(Model.fields).to.have.property('validation');
            });
        });

        describe('getPropertyRows', () => {
            it('It should get property rows', () => {
                const rows = tool.getPropertyRows(component);
                expect(rows)
                    .to.be.an('array')
                    .with.lengthOf(7);
                expect(rows[0]).to.have.property('field', 'properties.name');
                expect(rows[1]).to.have.property(
                    'field',
                    'properties.question'
                );
                expect(rows[2]).to.have.property(
                    'field',
                    'properties.solution'
                );
                expect(rows[3]).to.have.property(
                    'field',
                    'properties.validation'
                );
                expect(rows[4]).to.have.property('field', 'properties.success');
                expect(rows[5]).to.have.property('field', 'properties.failure');
                expect(rows[6]).to.have.property('field', 'properties.omit');
            });
        });

        describe('getAssets', () => {
            it('It should get assets', () => {
                const assets = tool.getAssets(component);
                expect(assets)
                    .to.have.property('audio')
                    .that.is.an('array')
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('image')
                    .that.is.an('array')
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('video')
                    .that.is.an('array')
                    .with.lengthOf(0);
            });
        });

        describe('getDescription', () => {
            it('It should return a description', () => {
                expect(
                    Object.prototype.hasOwnProperty.call(tool, 'getDescription')
                ).to.be.false;
                expect(tool).to.respondTo('getDescription');
            });
        });

        describe('getHelp', () => {
            it('It should return contextual help', () => {
                expect(Object.prototype.hasOwnProperty.call(tool, 'getHelp')).to
                    .be.be.false;
                expect(tool).to.respondTo('getHelp');
            });
        });

        describe('getTestModelField', () => {
            it('It should grade a test model field', done => {
                // Note: we would normally use stream.getTestModel
                const textBox = getTextBox();
                const page = new Page({
                    components: [textBox]
                });
                page.components.read();
                const c = page.components.at(0);
                const solution = c.get('properties.solution');
                const Field = tool.getTestModelField(c);
                const field = new Field();
                field.set('value', solution);
                // Check page, component and tool
                expect(field.page()).to.equal(page);
                expect(field.component()).to.equal(c);
                expect(field.tool()).to.equal(tool);
                // Check solution$ and value$
                expect(field.solution$()).to.equal(htmlEncode(solution));
                expect(field.value$()).to.equal(htmlEncode(solution));
                // Check data and validation
                // Note: there is no parent TestModel for all to return other page field values
                expect(field.data()).to.deep.equal({
                    value: field.get('value'),
                    solution,
                    all: {}
                });
                const validation = field.validation();
                expect(validation).to.have.string(
                    'function validate(value, solution'
                );
                // Grade
                field
                    .grade()
                    .then(
                        tryCatch(done)(() => {
                            expect(field.get('result')).to.be.true;
                        })
                    )
                    .catch(done);
            });
        });

        describe('getHtmlContent', () => {
            it('getHtmlContent', () => {
                // If we do not submit a page component
                function fn1() {
                    return tool.getHtmlContent({});
                }
                expect(fn1).to.throw;

                // If we do not submit a mode
                function fn2() {
                    return tool.getHtmlContent(component);
                }
                expect(fn2).to.throw;

                // Test all stage CONSTANTS.STAGE_MODES
                Object.values(CONSTANTS.STAGE_MODES).forEach(mode => {
                    const html = tool.getHtmlContent(component, mode);
                    expect(html).to.match(/^<input/);
                });
            });
        });

        describe('getHtmlCheckMarks', () => {
            it('getHtmlCheckMarks', () => {
                expect(
                    Object.prototype.hasOwnProperty.call(
                        tool,
                        'getHtmlCheckMarks'
                    )
                ).to.be.false;
                expect(tool).to.respondTo('getHtmlCheckMarks');
            });
        });

        describe('getHtmlValue', () => {
            it('getHtmlValue', () => {
                expect(
                    Object.prototype.hasOwnProperty.call(tool, 'getHtmlValue')
                ).to.be.false;
                expect(tool).to.respondTo('getHtmlValue');
            });
        });

        describe('getHtmlSolution', () => {
            it('getHtmlSolution', () => {
                expect(
                    Object.prototype.hasOwnProperty.call(
                        tool,
                        'getHtmlSolution'
                    )
                ).to.be.false;
                expect(tool).to.respondTo('getHtmlSolution');
            });
        });

        describe('onEnable', () => {
            xit('onEnable', () => {
                expect(tool).to.respondTo('onEnable');
            });
        });

        describe('onResize', () => {
            xit('onResize', () => {
                expect(tool).to.respondTo('onResize');
            });
        });

        describe('validate', () => {
            xit('validate', () => {
                expect(tool).to.respondTo('validate');
            });
        });
    });
});
