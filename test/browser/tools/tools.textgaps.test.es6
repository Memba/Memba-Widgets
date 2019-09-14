/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import __ from '../../../src/js/app/app.i18n.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import { PageComponent } from '../../../src/js/data/data.pagecomponent.es6';
import tools from '../../../src/js/tools/tools.es6';
import { BaseTool } from '../../../src/js/tools/tools.base.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
// import { tryCatch } from '../_misc/test.util.es6';

// Component data
import { getTextGaps } from '../_misc/test.components.es6';

const { describe, it, xit } = window;
// const { htmlEncode } = window.kendo;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
const FIXTURES = 'fixtures';
const TOOL = 'textgaps';

describe('tools.textgaps', () => {
    before(done => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
        // Load tool
        tools.load(TOOL).always(done);
    });

    describe('TextGapsTool', () => {
        let tool;
        let component;

        before(() => {
            tool = tools(TOOL);
            component = new PageComponent(getTextGaps());
        });

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', CONSTANTS.CROSSHAIR_CURSOR);
            expect(tool).to.have.property(
                'description',
                __('tools.textgaps.description')
            );
            expect(tool).to.have.property('height', 150);
            expect(tool).to.have.property('help', __('tools.textgaps.help'));
            expect(tool).to.have.property('id', TOOL);
            expect(tool).to.have.property('icon', __('tools.textgaps.icon'));
            expect(tool)
                .to.have.property('menu')
                .that.eql(['properties.question', 'properties.solution']);
            expect(tool).to.have.property('name', __('tools.textgaps.name'));
            expect(tool).to.have.property('weight', 1);
            expect(tool).to.have.property('width', 420);
        });

        it('getAttributeModel', () => {
            const Model = tool.getAttributeModel(component);
            expect(
                Object.prototype.isPrototypeOf.call(
                    BaseModel.prototype,
                    Model.prototype
                )
            ).to.be.true;
            expect(Model.fields).to.have.property('inputStyle');
            expect(Model.fields).to.have.property('style');
            expect(Model.fields).to.have.property('text');
        });

        it('getAttributeRows', () => {
            const rows = tool.getAttributeRows(component);
            expect(rows)
                .to.be.an('array')
                .with.lengthOf(8);
            expect(rows[0]).to.have.property('field', 'top');
            expect(rows[1]).to.have.property('field', 'left');
            expect(rows[2]).to.have.property('field', 'height');
            expect(rows[3]).to.have.property('field', 'width');
            expect(rows[4]).to.have.property('field', 'rotate');
            expect(rows[5]).to.have.property('field', 'attributes.inputStyle');
            expect(rows[6]).to.have.property('field', 'attributes.style');
            expect(rows[7]).to.have.property('field', 'attributes.text');
        });
        it('getPropertyModel', () => {
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

        it('getPropertyRows', () => {
            const rows = tool.getPropertyRows(component);
            expect(rows)
                .to.be.an('array')
                .with.lengthOf(7);
            expect(rows[0]).to.have.property('field', 'properties.name');
            expect(rows[1]).to.have.property('field', 'properties.question');
            expect(rows[2]).to.have.property('field', 'properties.solution');
            expect(rows[3]).to.have.property('field', 'properties.validation');
            expect(rows[4]).to.have.property('field', 'properties.success');
            expect(rows[5]).to.have.property('field', 'properties.failure');
            expect(rows[6]).to.have.property('field', 'properties.omit');
        });

        it('getAssets', () => {
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

        it('getDescription', () => {
            expect(Object.prototype.hasOwnProperty.call(tool, 'getDescription'))
                .to.be.false;
            expect(tool).to.respondTo('getDescription');
        });

        it('getHelp', () => {
            expect(Object.prototype.hasOwnProperty.call(tool, 'getHelp')).to.be
                .be.false;
            expect(tool).to.respondTo('getHelp');
        });

        it('getTestModelField', () => {
            expect(
                Object.prototype.hasOwnProperty.call(tool, 'getTestModelField')
            ).to.be.false;
            expect(tool).to.respondTo('getTestModelField');
            /*
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
                */
        });

        it('getHtmlContent', () => {
            // If we do not submit a page component
            function fn1() {
                return tool.getHtmlContent({});
            }
            expect(fn1).to.throw();

            // If we do not submit a mode
            function fn2() {
                return tool.getHtmlContent(component);
            }
            expect(fn2).to.throw();

            // Test all stage TOOLS.STAGE_MODES
            Object.values(TOOLS.STAGE_MODES).forEach(mode => {
                const content = tool.getHtmlContent(component, mode);
                expect(content).to.be.an.instanceof($);
                expect(content).to.match('div');
                expect(content).to.have.attr('data-role', 'textgaps');
            });
        });

        it('getHtmlCheckMarks', () => {
            expect(
                Object.prototype.hasOwnProperty.call(tool, 'getHtmlCheckMarks')
            ).to.be.false;
            expect(tool).to.respondTo('getHtmlCheckMarks');
        });

        it('getHtmlValue', () => {
            expect(Object.prototype.hasOwnProperty.call(tool, 'getHtmlValue'))
                .to.be.false;
            expect(tool).to.respondTo('getHtmlValue');
        });

        it('getHtmlSolution', () => {
            expect(
                Object.prototype.hasOwnProperty.call(tool, 'getHtmlSolution')
            ).to.be.false;
            expect(tool).to.respondTo('getHtmlSolution');
        });

        xit('onEnable', () => {
            expect(tool).to.respondTo('onEnable');
        });

        xit('onResize', () => {
            expect(tool).to.respondTo('onResize');
        });

        xit('validate', () => {
            expect(tool).to.respondTo('validate');
        });
    });
});
