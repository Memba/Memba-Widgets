/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import FileSystem from '../../../src/js/common/window.fs.es6';

const { before, describe, it, xdescribe, xit } = window;
const { expect } = chai;

chai.use(sinonChai);

const JPG_IMAGE = '';
const PNG_IMAGE = '';
const SVG_IMAGE = 'https://cdn.kidoju.com/images/o_collection/svg/office/sign_warning.svg';

const ERROR_404 = '';
const ERROR_400 = '';
const ERROR_ = '';

describe('window.image', () => {
    describe('preload', () => {
        it('It should preload an existing image url', () => {
            test()
        });
    });
});
