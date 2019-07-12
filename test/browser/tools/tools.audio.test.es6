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
import 'kendo.binder';
import 'kendo.data';
import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { PageComponent } from '../../../src/js/data/data.pagecomponent.es6';
import tools from '../../../src/js/tools/tools.es6';
import { BaseTool } from '../../../src/js/tools/tools.base.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import chaiJquery from '../../vendor/chai-jquery';
import { getAudio } from '../_misc/test.components.es6';

const { before, describe, it } = window;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
const FIXTURES = '#fixtures';
const TOOL = 'audio';

describe('tools.audio', () => {
    before(done => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
        tools.load(TOOL).always(done);
    });

    describe('AudioTool', () => {
        let tool;
        let component;

        before(() => {
            tool = tools[TOOL];
            component = new PageComponent(getAudio());
        });

        it('It should have descriptors', () => {
            expect(tool).to.be.an.instanceof(BaseTool);
            expect(tool).to.have.property('cursor', CONSTANTS.CROSSHAIR_CURSOR);
            expect(tool).to.have.property('description', 'Pointer');
            expect(tool).to.have.property('height', 100);
            expect(tool).to.have.property('id', 'audio');
            expect(tool).to.have.property('icon', 'loudspeaker3');
            expect(tool).to.have.property('weight', 0);
            expect(tool).to.have.property('width', 400);
        });

        it('It should have attributes', () => {
            expect(tool.attributes).to.deep.equal({});
        });

        it('It should have properties', () => {
            expect(tool.properties).to.deep.equal({});
        });

        it('getHtmlContent', () => {
            function fn1() {
                return tool.getHtmlContent({});
            }
            function fn2() {
                return tool.getHtmlContent(component);
            }
            var tool = tools('audio');
            var component = new PageComponent({ tool: 'audio' });
            var html;

            // If we do not submit a page component
            expect(fn1).to.throw();

            // If we do not submit a mode
            expect(fn2).to.throw();

            // If we submit a valid page component in design mode
            html = tool.getHtmlContent(component, TOOLS.STAGE_MODES.DESIGN);
            expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);

            // If we submit a valid page component in play mode
            html = tool.getHtmlContent(component, TOOLS.STAGE_MODES.PLAY);
            expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);

            // If we submit a valid page component in review mode
            html = tool.getHtmlContent(component, TOOLS.STAGE_MODES.REVIEW);
            expect(html).to.match(/^<div data-role="mediaplayer" data-mode="audio"/);
        });

        it('onResize', () => {
            expect(tool.onResize).to.be.undefined;
        });
    });
});
