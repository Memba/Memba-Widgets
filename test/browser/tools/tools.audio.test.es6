/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';
import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import tools from '../../../src/js/tools/tools.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';

const { describe, it, kendo, xit } = window;
const { expect } = chai;

describe('tools.audio', () => {
    describe('AudioTool', () => {
        const tool = tools.audio;

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', CONSTANTS.CROSSHAIR_CURSOR);
            expect(tool).to.have.property('description', 'Pointer');
            expect(tool).to.have.property('height', '0');
            expect(tool).to.have.property('id', 'pointer');
            expect(tool).to.have.property('icon', 'mouse_pointer');
            expect(tool).to.have.property('weight', '0');
            expect(tool).to.have.property('width', '0');
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

        it('onResize', () => {
            expect(tool.onResize).to.be.undefined;
        });
    });
});

describe('Audio', () => {
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
        html = tool.getHtmlContent(component, CONSTANTS.STAGE_MODES.DESIGN);
        expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);

        // If we submit a valid page component in play mode
        html = tool.getHtmlContent(component, CONSTANTS.STAGE_MODES.PLAY);
        expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);

        // If we submit a valid page component in review mode
        html = tool.getHtmlContent(component, CONSTANTS.STAGE_MODES.REVIEW);
        expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);
    });

});
