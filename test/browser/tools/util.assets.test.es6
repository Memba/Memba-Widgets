/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

import chai from 'chai';
import JSCheck from 'jscheck';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import ToolAssets from '../../../src/js/tools/util.assets.es6';

const { describe, it } = window;
const { expect } = chai;
const jsc = JSCheck();

describe('util.assets', () => {
    describe('ToolAssets', () => {
        describe('Initialization', () => {
            it('It should initialize without options', () => {
                const assets = new ToolAssets();
                expect(assets)
                    .to.have.property('collections')
                    .that.is.an(CONSTANTS.ARRAY)
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('extensions')
                    .that.is.an(CONSTANTS.ARRAY)
                    .with.lengthOf(0);
                expect(assets).to.have.property('schemes').that.is.an('object');
            });

            xit('It should initialize with options', () => {
                const assets = new ToolAssets({
                    // TODO
                });
                expect(assets)
                    .to.have.property('collections')
                    .that.is.an(CONSTANTS.ARRAY)
                    .with.lengthOf(0);
                expect(assets)
                    .to.have.property('extensions')
                    .that.is.an(CONSTANTS.ARRAY)
                    .with.lengthOf(0);
                expect(assets).to.have.property('schemes').that.is.an('object');
            });
        });

        describe('scheme2http', () => {
            it('It should convert schemes', () => {
                const nameGenerator = jsc.string(
                    jsc.integer(3, 10),
                    jsc.character('a', 'z')
                );
                const valueGenerator = () =>
                    `http://www.${nameGenerator()}.com`;
                const schemes = jsc.object(
                    jsc.array(nameGenerator),
                    valueGenerator
                )();
                const scheme = nameGenerator();
                const value = valueGenerator();
                schemes[scheme] = value;
                const assets = new ToolAssets({ schemes });
                const uri = jsc.string()();
                const result = assets.scheme2http(`${scheme}://${uri}`);
                expect(result).to.equal(`${value}/${uri}`);
            });
        });
    });
});
