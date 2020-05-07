/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.core';
import chai from 'chai';
import res from '../../../src/js/cultures/tools.fr.es6';
import tools from '../../../src/js/tools/tools.es6';

const { describe, it } = window;
const { Observable } = window.kendo;
const { expect } = chai;

describe('tools.fr', () => {
    it('It should have i18n resources for each tool', () => {
        Object.keys(tools).forEach((tool) => {
            if (tools[tool] instanceof Observable) {
                expect(res).to.have.property(tool).that.is.an('object');
                expect(res)
                    .to.have.nested.property(`${tool}.description`)
                    .that.is.a('string');
                expect(res)
                    .to.have.nested.property(`${tool}.help`)
                    .that.is.a('string');
                expect(res)
                    .to.have.nested.property(`${tool}.icon`)
                    .that.is.a('string');
                expect(res)
                    .to.have.nested.property(`${tool}.name`)
                    .that.is.a('string');
            }
        });
    });
});
