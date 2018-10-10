/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import BaseModel from '../../../src/js/data/models.base.es6';
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

        it('It should have attributes', () => {
            expect(tool)
                .to.have.property('attributes')
                .that.deep.equals({});
        });

        it('It should have properties', () => {
            expect(tool)
                .to.have.property('properties')
                .that.deep.equals({});
        });

        it('getAttributeModel', () => {
            expect(
                tool.getAttributeModel().constructor === BaseModel.constructor
            ).to.be.true;
        });

        it('getAttributeRows', () => {
            expect(tool.getAttributeRows())
                .to.be.an('array')
                .with.lengthOf(5);
        });

        it('getPropertyModel', () => {
            expect(
                tool.getPropertyModel().constructor === BaseModel.constructor
            ).to.be.true;
        });

        it('getPropertyRows', () => {
            expect(tool.getPropertyRows()).to.deep.equal([]);
        });

        it('getAssets', () => {
            expect(tool.getAssets()).to.deep.equal({
                audio: [],
                image: [],
                video: []
            });
        });

        it('getDefaultValue', () => {
            expect(tool.getDefaultValue()).to.be.undefined;
        });

        it('getDescription', () => {
            expect(tool.getDescription()).to.be.null;
        });

        it('getHelp', () => {
            expect(tool.getHelp()).to.be.null;
        });

        it('getHtmlContent', () => {
            expect(tool).to.respondTo('getHtmlContent');
        });

        xit('onResize', () => {
            expect(tool).to.respondTo('onResize');
        });

        it('validate', () => {
            expect(tool).to.respondTo('validate');
        });
    });
});
