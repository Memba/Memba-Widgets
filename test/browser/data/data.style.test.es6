/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSCheck from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { /* assertBaseModel, */ tryCatch } from '../_misc/test.util.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import {
    StyleProperty,
    StyleDataSource,
} from '../../../src/js/data/data.style.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, Model, ObservableArray },
} = window.kendo;
const jsc = JSCheck();
chai.use(sinonChai);

const DATA = [
    {
        name: 'border',
        value: 'solid 1px #000000',
    },
    {
        name: 'background-color',
        value: '#ffffff',
    },
    {
        name: 'color',
        value: '#ff0000',
    },
];
const STYLE = {
    name: 'font-size',
    value: '30px',
};

describe('data.style', () => {
    describe('StyleProperty', () => {
        it('It should initialize without options', () => {
            const style = new StyleProperty();
            expect(style).to.be.an.instanceof(StyleProperty);
            expect(style).to.be.an.instanceof(BaseModel);
            expect(style).to.be.an.instanceof(Model);
            // Test default values
            expect(style).to.have.property('name', '');
            expect(style).to.have.property('value', '');
        });

        it('It should initialize with options', () => {
            const style = new StyleProperty(STYLE);
            expect(style).to.be.an.instanceof(StyleProperty);
            expect(style).to.be.an.instanceof(BaseModel);
            expect(style).to.be.an.instanceof(Model);
            const json = style.toJSON();
            expect(json).to.deep.equal(STYLE);
        });
    });

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
            expect(data).to.be.an.instanceof(ObservableArray).with.lengthOf(1);
            expect(data[0]).to.be.an.instanceof(StyleProperty);
        });

        it('It should insert an style', (done) => {
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
                        expect(data[0]).to.be.an.instanceof(StyleProperty);
                    })
                )
                .catch(done);
        });

        it('It should raise events', (done) => {
            const change = sinon.spy();
            const dataSource = new StyleDataSource({ data: DATA });
            dataSource.bind('change', change);
            dataSource
                .read()
                .then(
                    tryCatch(done)(() => {
                        const style = dataSource.at(0);
                        expect(style).to.be.an.instanceof(StyleProperty);
                        style.set('text', jsc.string()());
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
