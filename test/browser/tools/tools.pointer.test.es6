/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
import 'kendo.core';
import chai from 'chai';
import __ from '../../../src/js/app/app.i18n.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import tools from '../../../src/js/tools/tools.es6';
import { BaseTool } from '../../../src/js/tools/tools.base.es6';
// import TOOLS from '../../../src/js/tools/util.constants.es6';

const { describe, it } = window;
const { expect } = chai;

describe('tools.pointer', () => {
    describe('PointerTool', () => {
        const tool = tools().pointer;

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', CONSTANTS.DEFAULT_CURSOR);
            expect(tool).to.have.property(
                'description',
                __('tools.pointer.description')
            );
            expect(tool).to.have.property('height', 0);
            expect(tool).to.have.property('name', __('tools.pointer.name'));
            expect(tool).to.have.property('id', 'pointer');
            expect(tool).to.have.property('icon', __('tools.pointer.icon'));
            expect(tool.menu).to.be.undefined;
            expect(tool).to.have.property('name', __('tools.pointer.name'));
            expect(tool).to.have.property('weight', 0);
            expect(tool).to.have.property('width', 0);
        });

        it('It should have attributes', () => {
            expect(tool.attributes).to.deep.equal({});
        });

        it('It should have properties', () => {
            expect(tool.properties).to.deep.equal({});
        });

        it('getHtmlContent', () => {
            expect(tool.getHtmlContent).to.be.undefined;
        });

        it('onEnable', () => {
            expect(tool.onEnable).to.be.undefined;
        });

        it('onResize', () => {
            expect(tool.onResize).to.be.undefined;
        });

        it('onRotate', () => {
            expect(tool.onRotate).to.be.undefined;
        });
    });
});
