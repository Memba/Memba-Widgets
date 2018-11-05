/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import BaseModel from '../../../src/js/data/models.base.es6';
import Asset from '../../../src/js/data/models.asset.es6';
import ASSETS from '../_misc/test.assets.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { Model }
} = window.kendo;

describe('models.asset', () => {
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
            { size: 5000000000, formatted: '4.66 GB' }
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
            { uri: `${JSC.string()()}.webm`, mime: 'video/webm' }
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
                converted: `${ASSETS.SCHEMES.cdn}${URI1}`
            },
            {
                uri: `data://${URI2}`,
                converted: `${ASSETS.SCHEMES.data}${URI2}`
            }
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
            expect(asset.url$()).to.equal(Asset.scheme2http(options.url, ASSETS.SCHEMES));
        });
    });
});
