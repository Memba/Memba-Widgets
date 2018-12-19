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
import StyleDataSource from '../../../src/js/data/data.style.es6';
import Style from '../../../src/js/data/models.style.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

const DATA = [
    {
        name: 'border',
        value: 'solid 1px #000000'
    },
    {
        name: 'background-color',
        value: '#ffffff'
    },
    {
        name: 'color',
        value: '#ff0000'
    }
];
const STYLE = {
    text: 'font-size',
    url: '30px'
};

describe('datasources.style', () => {
    describe('StyleDataSource', () => {
        it('It should init', () => {
            const dataSource = new StyleDataSource();
            expect(dataSource).to.be.an.instanceof(StyleDataSource);
            expect(dataSource).to.be.an.instanceof(DataSource);
        });

        it('It should add an style', () => {
            const dataSource = new StyleDataSource();
            dataSource.add(STYLE);
            const total = dataSource.total();
            expect(total).to.equal(1);
            const data = dataSource.data();
            expect(data)
                .to.be.an.instanceof(ObservableArray)
                .with.lengthOf(1);
            expect(data[0]).to.be.an.instanceof(Style);
        });

        it('It should insert an style', done => {
            const dataSource = new StyleDataSource({ data: DATA });
            dataSource
                .read()
                .then(
                    tryCatch(done)(() => {
                        dataSource.insert(0, STYLE);
                        const total = dataSource.total();
                        expect(total).to.equal(DATA.length + 1);
                        const data = dataSource.data();
                        expect(data)
                            .to.be.an.instanceof(ObservableArray)
                            .with.lengthOf(DATA.length + 1);
                        expect(data[0]).to.be.an.instanceof(Style);
                    })
                )
                .catch(done);
        });

        it('It should raise events', done => {
            const change = sinon.spy();
            const dataSource = new StyleDataSource({ data: DATA });
            dataSource.bind('change', change);
            dataSource
                .read()
                .then(
                    tryCatch(done)(() => {
                        const style = dataSource.at(0);
                        expect(style).to.be.an.instanceof(Style);
                        style.set('text', JSC.string()());
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
    });
});
