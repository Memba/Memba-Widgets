/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import BaseTransport from '../../../src/js/data/transports.base.es6';

const { describe, it } = window;
const { expect } = chai;

function noop() {}

describe('transports.array', () => {
    describe('Legacy export', () => {
        it('Check app.models.BaseTransport', () => {
            expect(window.app.models.BaseTransport).to.equal(BaseTransport);
        });
    });

    describe('BaseTransport', () => {
        const OPTIONS = {
            collection: 'contacts', // Can be anything but undefined
            idField: 'no',
            partition: { language: 'fr' },
            projection: 'firstName,lastName',
            parameterMap(i) {
                return 2 * i;
            }
        };
        const PARTITION = { language: 'en' };
        const PROJECTION = 'firstName,lastName,picture';

        it('it should not instantiate BaseTransport from invalid values', () => {
            function fn1() {
                const transport = new BaseTransport();
                noop(transport); // To please eslint
            }
            expect(fn1).to.throw;
        });

        it('it should instantiate BaseTransport from valid values', () => {
            const transport = new BaseTransport(OPTIONS);
            expect(transport.collection).to.equal(OPTIONS.collection);
            expect(transport.idField).to.equal(OPTIONS.idField);
            expect(transport.partition).to.deep.equal(OPTIONS.partition);
            expect(transport.projection).to.deep.equal(OPTIONS.projection);
            expect(transport.parameterMap(10)).to.equal(20);
            expect(transport.create).to.throw;
            expect(transport.destroy).to.throw;
            expect(transport.get).to.throw;
            expect(transport.read).to.throw;
            expect(transport.update).to.throw;
        });

        it('it should have a partition setter', () => {
            const transport = new BaseTransport(OPTIONS);
            expect(transport.partition).to.deep.equal(OPTIONS.partition);
            transport.partition = PARTITION;
            expect(transport.partition).to.deep.equal(PARTITION);
        });

        it('it should have a projection setter', () => {
            const transport = new BaseTransport(OPTIONS);
            expect(transport.projection).to.deep.equal(OPTIONS.projection);
            transport.projection = PROJECTION;
            expect(transport.projection).to.deep.equal(PROJECTION);
        });
    });
});
