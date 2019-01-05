/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSC from 'jscheck';
import ToolAssets from '../../../src/js/tools/util.assets.es6';

const { describe, it } = window;
const { expect } = chai;

describe('util.assets', () => {
    describe('ToolAssets', () => {
        describe('Initialization', () => {
            it('It should initialize without options', () => {
                const assets = new ToolAssets();
                expect(assets)
                    .to.have.property('collections')
                    .that.is.an('array')
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('extensions')
                    .that.is.an('array')
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('schemes')
                    .that.is.an('object');
            });

            xit('It should initialize with options', () => {
                const assets = new ToolAssets({
                    // TODO
                });
                expect(assets)
                    .to.have.property('collections')
                    .that.is.an('array')
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('extensions')
                    .that.is.an('array')
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('schemes')
                    .that.is.an('object');
            });
        });

        describe('scheme2http', () => {
            it('It should convert schemes', () => {
                const nameGenerator = JSC.string(
                    JSC.integer(3, 10),
                    JSC.character('a', 'z')
                );
                const valueGenerator = () =>
                    `http://www.${nameGenerator()}.com`;
                const schemes = JSC.object(
                    JSC.array(nameGenerator),
                    valueGenerator
                )();
                const scheme = nameGenerator();
                const value = valueGenerator();
                schemes[scheme] = value;
                const assets = new ToolAssets({ schemes });
                const uri = JSC.string()();
                const result = assets.scheme2http(`${scheme}://${uri}`);
                expect(result).to.equal(`${value}/${uri}`);
            });
        });
    });
});
