/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import BaseModel from '../../../src/js/data/models.base.es6';
import Style from '../../../src/js/data/models.style.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { Model }
} = window.kendo;
chai.use(sinonChai);

const STYLE = {
    text: 'information',
    url: 'https://cdn.kidoju.com/styles/o_collection/svg/office/information.svg'
};

describe('models.style', () => {
    describe('Style', () => {
        it('It should initialize without options', () => {
            const style = new Style();
            expect(style).to.be.an.instanceof(Style);
            expect(style).to.be.an.instanceof(BaseModel);
            expect(style).to.be.an.instanceof(Model);
            // Test default values
            expect(style).to.have.property('text', '');
            expect(style).to.have.property('url', '');
        });

        it('It should initialize with options', () => {
            const style = new Style(STYLE);
            expect(style).to.be.an.instanceof(Style);
            expect(style).to.be.an.instanceof(BaseModel);
            expect(style).to.be.an.instanceof(Model);
            const json = style.toJSON();
            expect(json).to.deep.equal(STYLE);
        });
    });
});
