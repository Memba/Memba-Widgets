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
import { /* assertBaseModel, */ tryCatch } from '../_misc/test.util.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import { Image, ImageDataSource } from '../../../src/js/data/data.image.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, Model, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

const DATA = [
    {
        text: 'error',
        url: 'https://cdn.kidoju.com/images/o_collection/svg/office/error.svg'
    },
    {
        text: 'success',
        url: 'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
    },
    {
        text: 'warning',
        url:
            'https://cdn.kidoju.com/images/o_collection/svg/office/sign_warning.svg'
    }
];
const IMAGE = {
    text: 'information',
    url: 'https://cdn.kidoju.com/images/o_collection/svg/office/information.svg'
};

describe('data.image', () => {
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

    describe('ImageDataSource', () => {
        it('It should init', () => {
            const dataSource = new ImageDataSource();
            expect(dataSource).to.be.an.instanceof(ImageDataSource);
            expect(dataSource).to.be.an.instanceof(DataSource);
        });

        it('It should add an image', () => {
            const dataSource = new ImageDataSource();
            dataSource.add(IMAGE);
            const total = dataSource.total();
            expect(total).to.equal(1);
            const data = dataSource.data();
            expect(data)
                .to.be.an.instanceof(ObservableArray)
                .with.lengthOf(1);
            expect(data[0]).to.be.an.instanceof(Image);
        });

        it('It should insert an image', done => {
            const dataSource = new ImageDataSource({ data: DATA });
            dataSource
                .read()
                .then(
                    tryCatch(done)(() => {
                        dataSource.insert(0, IMAGE);
                        const total = dataSource.total();
                        expect(total).to.equal(DATA.length + 1);
                        const data = dataSource.data();
                        expect(data)
                            .to.be.an.instanceof(ObservableArray)
                            .with.lengthOf(DATA.length + 1);
                        expect(data[0]).to.be.an.instanceof(Image);
                    })
                )
                .catch(done);
        });

        it('It should raise events', done => {
            const change = sinon.spy();
            const dataSource = new ImageDataSource({ data: DATA });
            dataSource.bind('change', change);
            dataSource
                .read()
                .then(
                    tryCatch(done)(() => {
                        const image = dataSource.at(0);
                        expect(image).to.be.an.instanceof(Image);
                        image.set('text', JSC.string()());
                        expect(change).to.have.been.calledTwice;
                    })
                )
                .catch(done);
        });

        xit('It should handle duplicate ids', () => {
            expect(true).to.be.false;
        });

        xit('It should handle errors', () => {
            expect(true).to.be.false;
        });
    });

    describe('create', () => {
        xit('It should create from an array', () => {
            expect(true).to.be.false;
        });
    });
});
