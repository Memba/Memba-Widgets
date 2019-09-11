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

// Component  data
import { getVideo } from '../_misc/test.components.es6';

const { describe, it, xit } = window;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
const FIXTURES = 'fixtures';
const TOOL = 'video';

describe('tools.video', () => {
    before(done => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
        // load tool
        tools.load(TOOL).always(done);
    });

    describe('VideoTool', () => {
        let tool;
        let component;

        before(() => {
            tool = tools(TOOL);
            component = new PageComponent(getVideo());
        });

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', CONSTANTS.CROSSHAIR_CURSOR);
            expect(tool).to.have.property(
                'description',
                __('tools.video.description')
            );
            expect(tool).to.have.property('height', 300);
            expect(tool).to.have.property('help', __('tools.video.help'));
            expect(tool).to.have.property('id', TOOL);
            expect(tool).to.have.property('icon', __('tools.video.icon'));
            expect(tool)
                .to.have.property('menu')
                .that.eql(['attributes.mp4']);
            expect(tool).to.have.property('name', __('tools.video.name'));
            expect(tool).to.have.property('weight', 0);
            expect(tool).to.have.property('width', 600);
        });

        it('getAttributeModel', () => {
            const Model = tool.getAttributeModel(component);
            expect(
                Object.prototype.isPrototypeOf.call(
                    BaseModel.prototype,
                    Model.prototype
                )
            ).to.be.true;
            expect(Model.fields).to.have.property('autoplay');
            expect(Model.fields).to.have.property('toolbarHeight');
            expect(Model.fields).to.have.property('mp4');
            expect(Model.fields).to.have.property('ogv');
            expect(Model.fields).to.have.property('wbem');
        });

        it('getAttributeRows', () => {
            const rows = tool.getAttributeRows(component);
            expect(rows)
                .to.be.an('array')
                .with.lengthOf(10);
            expect(rows[0]).to.have.property('field', 'top');
            expect(rows[1]).to.have.property('field', 'left');
            expect(rows[2]).to.have.property('field', 'height');
            expect(rows[3]).to.have.property('field', 'width');
            expect(rows[4]).to.have.property('field', 'rotate');
            expect(rows[5]).to.have.property('field', 'attributes.autoplay');
            expect(rows[6]).to.have.property(
                'field',
                'attributes.toolbarHeight'
            );
            expect(rows[7]).to.have.property('field', 'attributes.mp4');
            expect(rows[8]).to.have.property('field', 'attributes.ogv');
            expect(rows[9]).to.have.property('field', 'attributes.wbem');
        });

        it('getPropertyModel', () => {
            const Model = tool.getPropertyModel(component);
            expect(
                Object.prototype.isPrototypeOf.call(
                    BaseModel.prototype,
                    Model.prototype
                )
            ).to.be.true;
            expect(Model.fields).to.deep.equal({});
        });

        it('getPropertyRows', () => {
            const rows = tool.getPropertyRows(component);
            expect(rows)
                .to.be.an('array')
                .with.lengthOf(0);
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
                .with.lengthOf(3);
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
                expect(content).to.be.an.instanceOf($);
                expect(content).to.match('div');
                expect(content).to.have.attr('data-role', 'mediaplayer');
                expect(content).to.have.attr('data-mode', 'video');
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
