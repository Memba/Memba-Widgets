/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import tools from '../../../src/js/tools/tools.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';
import '../../../src/js/app/app.tools.es6';
import '../../../src/js/cultures/tools.en.es6';

const { describe, it, xit } = window;
const { expect } = chai;

describe('tools.en', () => {
    (tools.audio instanceof BaseTool ? it : xit)('tools.audio', () => {
        expect(true).to.be.false;
    });

    (tools.chargrid instanceof BaseTool ? it : xit)('tools.chargrid', () => {
        expect(true).to.be.false;
    });

    (tools.chart instanceof BaseTool ? it : xit)('tools.chart', () => {
        expect(true).to.be.false;
    });

    (tools.connector instanceof BaseTool ? it : xit)('tools.connector', () => {
        expect(true).to.be.false;
    });

    (tools.dropzone instanceof BaseTool ? it : xit)('tools.dropzone', () => {
        expect(true).to.be.false;
    });

    (tools.highlighter instanceof BaseTool ? it : xit)(
        'tools.highlighter',
        () => {
            expect(true).to.be.false;
        }
    );

    (tools.image instanceof BaseTool ? it : xit)('tools.image', () => {
        expect(tools.image.attributes.alt.title).to.equal('Text');
    });

    (tools.imageset instanceof BaseTool ? it : xit)('tools.imageset', () => {
        expect(true).to.be.false;
    });

    (tools.label instanceof BaseTool ? it : xit)('tools.label', () => {
        expect(tools.label.attributes.text.title).to.equal('Text');
    });

    (tools.mathexpression instanceof BaseTool ? it : xit)(
        'tools.mathexpression',
        () => {
            expect(true).to.be.false;
        }
    );

    (tools.mathinput instanceof BaseTool ? it : xit)('tools.mathinput', () => {
        expect(true).to.be.false;
    });

    (tools.multiquiz instanceof BaseTool ? it : xit)('tools.multiquiz', () => {
        expect(true).to.be.false;
    });

    (tools.numericbox instanceof BaseTool ? it : xit)(
        'tools.numericbox',
        () => {
            expect(true).to.be.false;
        }
    );

    (tools.quiz instanceof BaseTool ? it : xit)('tools.quiz', () => {
        expect(true).to.be.false;
    });

    (tools.random instanceof BaseTool ? it : xit)('tools.random', () => {
        expect(true).to.be.false;
    });

    (tools.selector instanceof BaseTool ? it : xit)('tools.selector', () => {
        expect(true).to.be.false;
    });

    (tools.table instanceof BaseTool ? it : xit)('tools.table', () => {
        expect(true).to.be.false;
    });

    (tools.textarea instanceof BaseTool ? it : xit)('tools.textarea', () => {
        expect(true).to.be.false;
    });

    (tools.textbox instanceof BaseTool ? it : xit)('tools.textbox', () => {
        expect(tools.textbox.attributes.mask.title).to.equal('Mask');
    });

    (tools.textgaps instanceof BaseTool ? it : xit)('tools.textgaps', () => {
        expect(true).to.be.false;
    });

    (tools.textgaps instanceof BaseTool ? it : xit)('tools.textgaps', () => {
        expect(true).to.be.false;
    });

    (tools.video instanceof BaseTool ? it : xit)('tools.video', () => {
        expect(true).to.be.false;
    });
});
