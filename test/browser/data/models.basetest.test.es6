/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { assertBaseModel, tryCatch } from '../_misc/test.util.es6';
import { getComponentArray } from '../_misc/test.components.es6';
import { getSpyingTransport } from '../_misc/test.transports.es6';
import ObjectId from '../../../src/js/common/window.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { normalizeSchema } from '../../../src/js/data/data.util.es6';
import PageComponentDataSource from '../../../src/js/data/datasources.pagecomponent.es6';
import BaseModel from '../../../src/js/data/models.base.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';
import '../../../src/js/app/app.tools.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

describe('models.basetest', () => {
    describe('BaseTest', () => {
        // TODO
    });
});
