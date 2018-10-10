/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
// import JSC from 'jscheck';
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai';
import BaseModel from '../../../src/js/data/models.base.es6';
import Image from '../../../src/js/data/models.image.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { Model }
} = window.kendo;
// chai.use(sinonChai);

const IMAGE = {
    text: 'information',
    url: 'https://cdn.kidoju.com/images/o_collection/svg/office/information.svg'
};

describe('models.image', () => {
    describe('Image', () => {
        it('It should initialize without options', () => {
            const image = new Image();
            expect(image).to.be.an.instanceof(Image);
            expect(image).to.be.an.instanceof(BaseModel);
            expect(image).to.be.an.instanceof(Model);
            // Test default values
            expect(image).to.have.property('text', '');
            expect(image).to.have.property('url', '');
        });

        it('It should initialize with options', () => {
            const image = new Image(IMAGE);
            expect(image).to.be.an.instanceof(Image);
            expect(image).to.be.an.instanceof(BaseModel);
            expect(image).to.be.an.instanceof(Model);
            const json = image.toJSON();
            expect(json).to.deep.equal(IMAGE);
        });
    });
});
