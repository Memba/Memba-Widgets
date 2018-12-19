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
import AssetDataSource from '../../../src/js/data/data.asset.es6';
import Asset from '../../../src/js/data/models.asset.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

const DATA = [
    {
        mime: 'error',
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

describe('datasources.asset', () => {
    describe('AssetDataSource', () => {
        it('It should init', () => {
            const dataSource = new AssetDataSource();
            expect(dataSource).to.be.an.instanceof(AssetDataSource);
            expect(dataSource).to.be.an.instanceof(DataSource);
        });

        it('It should add an image', () => {
            const dataSource = new AssetDataSource();
            dataSource.add(IMAGE);
            const total = dataSource.total();
            expect(total).to.equal(1);
            const data = dataSource.data();
            expect(data)
                .to.be.an.instanceof(ObservableArray)
                .with.lengthOf(1);
            expect(data[0]).to.be.an.instanceof(Asset);
        });

        it('It should insert an image', done => {
            const dataSource = new AssetDataSource({ data: DATA });
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
                        expect(data[0]).to.be.an.instanceof(Asset);
                    })
                )
                .catch(done);
        });

        it('It should raise events', done => {
            const change = sinon.spy();
            const dataSource = new AssetDataSource({ data: DATA });
            dataSource.bind('change', change);
            dataSource
                .read()
                .then(
                    tryCatch(done)(() => {
                        const image = dataSource.at(0);
                        expect(image).to.be.an.instanceof(Asset);
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

        xit('It should create from options with schemes', () => {
            expect(true).to.be.false;
        });
    });
});
