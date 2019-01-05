/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import assets from '../../../src/js/app/app.assets.es6';
import ToolAssets from '../../../src/js/tools/util.assets.es6';

const { describe, it } = window;
const { expect } = chai;

describe('app.assets', () => {
    it('Initialization', () => {
        expect(assets.audio).to.be.an.instanceof(ToolAssets);
        expect(assets.image).to.be.an.instanceof(ToolAssets);
        expect(assets.video).to.be.an.instanceof(ToolAssets);
    });
});
