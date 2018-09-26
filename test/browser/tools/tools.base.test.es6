/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// import $ from 'jquery';
import chai from 'chai';
// import sinon from 'sinon';
// import 'sinon-chai';
// import 'jquery.mockjax';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';

const { describe, it } = window;
const { expect } = chai;

describe('tools.base', () => {
    describe('Test', () => {
        const tool = new BaseTool();

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', null);
            expect(tool).to.have.property('description', null);
            expect(tool).to.have.property('height', 250);
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

        it('getHtmlContent', () => {
            expect(tool.getHtmlContent).to.respondTo();
        });

        it('onResize', () => {
            expect(tool.onResize).to.respond;
        });
    });
});
