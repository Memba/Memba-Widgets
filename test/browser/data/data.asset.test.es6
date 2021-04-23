/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { /* assertBaseModel, */ tryCatch } from '../_misc/test.util.es6';
import { Asset, AssetDataSource } from '../../../src/js/data/data.asset.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import ASSETS from '../../../src/js/helpers/helpers.assets.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, Model, ObservableArray },
} = window.kendo;
chai.use(sinonChai);

const DATA = [
    {
        mime: 'error',
        url: 'https://cdn.kidoju.com/images/o_collection/svg/office/error.svg',
    },
    {
        text: 'success',
        url: 'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
    },
    {
        text: 'warning',
        url:
            'https://cdn.kidoju.com/images/o_collection/svg/office/sign_warning.svg',
    },
];
const IMAGE = {
    text: 'information',
    url:
        'https://cdn.kidoju.com/images/o_collection/svg/office/information.svg',
};

describe('data.asset', () => {
    describe('Asset', () => {
        it('It should initialize without options', () => {
            const asset = new Asset();
            expect(asset).to.be.an.instanceof(Asset);
            expect(asset).to.be.an.instanceof(BaseModel);
            expect(asset).to.be.an.instanceof(Model);
            // Test default values
            expect(asset).to.have.property('mime', null);
            expect(asset).to.have.property('size', 0);
            expect(asset).to.have.property('url', null);
        });

        it('It should initialize with options', () => {
            const asset = new Asset(ASSETS.IMAGE);
            expect(asset).to.be.an.instanceof(Asset);
            expect(asset).to.be.an.instanceof(BaseModel);
            expect(asset).to.be.an.instanceof(Model);
            const json = asset.toJSON();
            expect(json).to.deep.equal(ASSETS.IMAGE);
        });
    });

    describe('Asset.nameFormatter', () => {
        const NAMES = [{ url: ASSETS.IMAGE.url, name: 'information.svg' }];
        it('It should format a name', () => {
            function test(data) {
                expect(Asset.nameFormatter(data.url)).to.equal(data.name);
            }
            NAMES.forEach(test);
        });
    });

    describe('Asset.sizeFormatter', () => {
        const SIZES = [
            { size: 100, formatted: '100 bytes' },
            { size: 10000, formatted: '9.77 KB' },
            { size: 18500000, formatted: '17.64 MB' },
            { size: 5000000000, formatted: '4.66 GB' },
        ];

        it('It should format a size', () => {
            function test(data) {
                expect(Asset.sizeFormatter(data.size)).to.equal(data.formatted);
            }
            SIZES.forEach(test);
        });
    });

    describe('Asset.typeFormatter', () => {
        const TYPES = [
            { uri: `${JSC.string()()}.bin`, mime: 'application/octet-stream' },
            { uri: `${JSC.string()()}.BAK`, mime: 'application/octet-stream' },
            { uri: 'GIF', mime: 'image/gif' },
            { uri: `${JSC.string()()}.jpg`, mime: 'image/jpeg' },
            { uri: `${JSC.string()()}.JPEG`, mime: 'image/jpeg' },
            { uri: `${JSC.string()()}.mp3`, mime: 'audio/mpeg' },
            { uri: `${JSC.string()()}.MP4`, mime: 'video/mp4' },
            { uri: `${JSC.string()()}.ogg`, mime: 'audio/ogg' },
            { uri: `${JSC.string()()}.oGv`, mime: 'video/ogg' },
            { uri: `${JSC.string()()}.PnG`, mime: 'image/png' },
            { uri: `${JSC.string()()}.svg`, mime: 'image/svg+xml' },
            { uri: `${JSC.string()()}.Wav`, mime: 'audio/wav' },
            { uri: `${JSC.string()()}.webm`, mime: 'video/webm' },
        ];

        it('It should format a type', () => {
            function test(data) {
                expect(Asset.typeFormatter(data.uri)).to.equal(data.mime);
            }
            TYPES.forEach(test);
        });
    });

    describe('Asset.scheme2http', () => {
        const URI1 = JSC.string()();
        const URI2 = JSC.string()();
        const URIS = [
            {
                uri: `cdn://${URI1}`,
                converted: `${ASSETS.SCHEMES.cdn}${URI1}`,
            },
            {
                uri: `data://${URI2}`,
                converted: `${ASSETS.SCHEMES.data}${URI2}`,
            },
        ];

        it('It should convert schemes', () => {
            function test(data) {
                expect(Asset.scheme2http(data.uri, ASSETS.SCHEMES)).to.equal(
                    data.converted
                );
            }
            URIS.forEach(test);
        });
    });

    describe('ImageAsset', () => {
        const ImageAsset = Asset.define({ schemes: ASSETS.SCHEMES });
        const options = ASSETS.IMAGE;
        const asset = new ImageAsset(options);

        it('It should compute mime$', () => {
            expect(asset.mime$()).to.equal(Asset.typeFormatter(options.url));
        });

        it('It should compute name$', () => {
            expect(asset.name$()).to.equal(Asset.nameFormatter(options.url));
        });

        it('It should compute size$', () => {
            expect(asset.size$()).to.equal(Asset.sizeFormatter(options.size));
        });

        it('It should compute url$', () => {
            expect(asset.url$()).to.equal(
                Asset.scheme2http(options.url, ASSETS.SCHEMES)
            );
        });
    });

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
            expect(data).to.be.an.instanceof(ObservableArray).with.lengthOf(1);
            expect(data[0]).to.be.an.instanceof(Asset);
        });

        it('It should insert an image', (done) => {
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

        it('It should raise events', (done) => {
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
