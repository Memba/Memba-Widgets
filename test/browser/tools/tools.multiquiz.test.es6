/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO getHtmlContent return html text, not a jQuery instance

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import __ from '../../../src/js/app/app.i18n.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import { PageComponent } from '../../../src/js/data/data.pagecomponent.es6';
import tools from '../../../src/js/tools/tools.es6';
import { BaseTool } from '../../../src/js/tools/tools.base.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';

// Component data
import { getMultiQuiz } from '../../../src/js/helpers/helpers.data.es6';

const { describe, it, xit } = window;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
const FIXTURES = 'fixtures';
const TOOL = 'multiquiz';

describe('tools.multiquiz', () => {
    before((done) => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
        // load tool
        tools.load(TOOL).always(done);
    });

    describe('MultiQuizTool', () => {
        let tool;
        let component;

        before(() => {
            tool = tools(TOOL);
            component = new PageComponent(getMultiQuiz());
        });

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', CONSTANTS.CROSSHAIR_CURSOR);
            expect(tool).to.have.property(
                'description',
                __('tools.multiquiz.description')
            );
            expect(tool).to.have.property('height', 150);
            expect(tool).to.have.property('help', __('tools.multiquiz.help'));
            expect(tool).to.have.property('id', TOOL);
            expect(tool).to.have.property('icon', __('tools.multiquiz.icon'));
            expect(tool).to.have.property('menu').that.eql([
                'attributes.data',
                'attributes.mode',
                '', // separator
                'properties.question',
                'properties.solution',
            ]);
            expect(tool).to.have.property('name', __('tools.multiquiz.name'));
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
            expect(Model.fields).to.have.property('mode');
            expect(Model.fields).to.have.property('shuffle');
            expect(Model.fields).to.have.property('groupStyle');
            expect(Model.fields).to.have.property('itemStyle');
            expect(Model.fields).to.have.property('selectedStyle');
            expect(Model.fields).to.have.property('data');
        });

        it('getAttributeRows', () => {
            const rows = tool.getAttributeRows(component);
            expect(rows).to.be.an(CONSTANTS.ARRAY).with.lengthOf(11);
            expect(rows[0]).to.have.property('field', 'top');
            expect(rows[1]).to.have.property('field', 'left');
            expect(rows[2]).to.have.property('field', 'height');
            expect(rows[3]).to.have.property('field', 'width');
            expect(rows[4]).to.have.property('field', 'rotate');
            expect(rows[5]).to.have.property('field', 'attributes.mode');
            expect(rows[6]).to.have.property('field', 'attributes.shuffle');
            expect(rows[7]).to.have.property('field', 'attributes.groupStyle');
            expect(rows[8]).to.have.property('field', 'attributes.itemStyle');
            expect(rows[9]).to.have.property(
                'field',
                'attributes.selectedStyle'
            );
            expect(rows[10]).to.have.property('field', 'attributes.data');
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
            expect(rows).to.be.an(CONSTANTS.ARRAY).with.lengthOf(7);
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
                .that.is.an(CONSTANTS.ARRAY)
                .with.lengthOf(0);
            expect(assets)
                .to.have.property('image')
                .that.is.an(CONSTANTS.ARRAY)
                .with.lengthOf(4);
            expect(assets.image[0]).to.equal(
                component.get('attributes.data').at(0).url
            );
            expect(assets)
                .to.have.property('video')
                .that.is.an(CONSTANTS.ARRAY)
                .with.lengthOf(0);
        });

        it('getDescription', () => {
            expect(Object.prototype.hasOwnProperty.call(tool, 'getDescription'))
                .to.be.false;
            expect(tool).to.respondTo('getDescription');
        });

        it('getHelp', () => {
            expect(Object.prototype.hasOwnProperty.call(tool, 'getHelp')).to.be
                .false;
            expect(tool).to.respondTo('getHelp');
        });

        it('getTestModelField', () => {
            expect(
                Object.prototype.hasOwnProperty.call(tool, 'getTestModelField')
            ).to.be.false;
            expect(tool).to.respondTo('getTestModelField');
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
            Object.values(TOOLS.STAGE_MODES).forEach((mode) => {
                const content = tool.getHtmlContent(component, mode);
                expect(content).to.be.an.instanceOf($);
                expect(content).to.match(CONSTANTS.DIV);
                expect(content).to.have.attr('data-role', 'multiquiz');
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
