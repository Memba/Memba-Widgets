/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import BaseModel from '../../../src/js/data/data.base.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';

const { describe, it } = window;
const { expect } = chai;

describe('tools.base', () => {
    describe('BaseTool', () => {
        const tool = new BaseTool();

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', null);
            expect(tool).to.have.property('description', null);
            expect(tool).to.have.property('height', 250);
            expect(tool).to.have.property('help', null);
            expect(tool).to.have.property('id', null);
            expect(tool).to.have.property('icon', null);
            expect(tool).to.have.property('weight', 0);
            expect(tool).to.have.property('width', 250);
        });

        it('It should have empty attributes and properties', () => {
            expect(tool)
                .to.have.property('attributes')
                .that.deep.equals({});
            expect(tool)
                .to.have.property('properties')
                .that.deep.equals({});
        });

        it('getAttributeModel', () => {
            const Model = tool.getAttributeModel();
            expect(
                Object.prototype.isPrototypeOf.call(
                    BaseModel.prototype,
                    Model.prototype
                )
            ).to.be.true;
            expect(Model.fields).to.deep.equal({});
        });

        it('getAttributeRows', () => {
            const rows = tool.getAttributeRows();
            expect(rows)
                .to.be.an('array')
                .with.lengthOf(5);
            expect(rows[0]).to.have.property('field', 'top');
            expect(rows[1]).to.have.property('field', 'left');
            expect(rows[2]).to.have.property('field', 'height');
            expect(rows[3]).to.have.property('field', 'width');
            expect(rows[4]).to.have.property('field', 'rotate');
        });

        it('getPropertyModel', () => {
            const Model = tool.getAttributeModel();
            expect(
                Object.prototype.isPrototypeOf.call(
                    BaseModel.prototype,
                    Model.prototype
                )
            ).to.be.true;
            expect(Model.fields).to.deep.equal({});
        });

        it('getPropertyRows', () => {
            const rows = tool.getPropertyRows();
            expect(rows)
                .to.be.an('array')
                .with.lengthOf(0);
        });

        it('getAssets', () => {
            const assets = tool.getAssets();
            expect(assets).to.deep.equal({
                audio: [],
                image: [],
                video: []
            });
        });

        it('getDescription', () => {
            const description = tool.getDescription();
            expect(description).to.be.null;
        });

        it('getHelp', () => {
            const help = tool.getHelp();
            expect(help).to.be.null;
        });

        it('getTestModelField', () => {
            // Note: see stream for tests
            expect(tool).to.respondTo('getTestModelField');

        });

        it('getHtmlContent', () => {
            expect(tool).to.respondTo('getHtmlContent');
        });

        it('getHtmlCheckMarks', () => {
            expect(tool).to.respondTo('getHtmlContent');
        });

        it('getHtmlValue', () => {
            expect(tool).to.respondTo('getHtmlValue');
        });

        it('getHtmlSolution', () => {
            expect(tool).to.respondTo('getHtmlSolution');
        });

        xit('onEnable', () => {
            expect(tool).to.respondTo('onEnable');
        });

        xit('onResize', () => {
            expect(tool).to.respondTo('onResize');
        });

        it('validate', () => {
            expect(tool).to.respondTo('validate');
        });
    });
});
