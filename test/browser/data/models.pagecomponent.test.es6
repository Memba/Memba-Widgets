/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Validation: cannot change id and tool
// TODO Add image and textbox
// TODO Add a more complex tool with array attribues or properties

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { assertBaseModel } from '../_misc/test.util.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/models.base.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';

// Load tools
// import '../../../src/js/tools/tools.image.es6';
import '../../../src/js/tools/tools.label.es6';
// import '../../../src/js/tools/tools.textbox.es6';

const { describe, it } = window;
const {
    data: { Model }
} = window.kendo;
const { expect } = chai;
chai.use(sinonChai);

/*
const IMAGE = {
    attributes: {
        src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png',
        alt: 'Google Logo'
    },
    height: 250,
    id: new ObjectId().toString(),
    left: 100,
    rotate: 45,
    tool : 'image',
    top: 50,
    width: 250
};
*/

const LABEL = {
    attributes: {
        style: 'font-family: Georgia, serif; color: #FF0000;',
        text: 'World'
    },
    height: 100,
    id: new ObjectId().toString(),
    left: 500,
    properties: {
        behavior: 'none',
        constant: ''
    },
    rotate: 90,
    tool: 'label',
    top: 250,
    width: 300
};

/*
const TEXTBOX = {
    attributes: {},
    height: 100,
    id: new ObjectId().toString(),
    left: 20,
    properties: {
        name: 'textfield3'
    },
    rotate: 0,
    tool : 'textbox',
    top: 20,
    width: 300
};
*/

const DATA = [
    // IMAGE,
    LABEL
    // TEXTBOX
];

describe('models.pagecomponent', () => {
    describe('PageComponent', () => {
        describe('Initialization', () => {
            it('It should initialize a PageComponent without options (although there is no tool)', () => {
                // Initialization without parameter is a Kendo UI requirement
                const component = new PageComponent();
                expect(component).to.be.an.instanceof(PageComponent);
                expect(component).to.be.an.instanceof(BaseModel);
                expect(component).to.be.an.instanceof(Model);
                // Test default values
                assertBaseModel(component, component.defaults);
            });

            it('It should fail to initialize a PageComponent with invalid options', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent(JSC.object()());
                }
                expect(test).to.throw(Error);
            });

            it('It should fail to initialize a PageComponent with a POINTER', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent({
                        tool: CONSTANTS.POINTER
                    });
                }
                expect(test).to.throw(Error);
            });

            it('It should fail to initialize a PageComponent with an unknown tool', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent({
                        tool: JSC.string()()
                    });
                }
                expect(test).to.throw(Error);
            });

            it('It should initialize a PageComponent with a bare tool', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component).to.be.an.instanceof(PageComponent);
                    expect(component).to.be.an.instanceof(BaseModel);
                    expect(component).to.be.an.instanceof(Model);
                    // Test default values
                    assertBaseModel(
                        component,
                        Object.assign(component.defaults, options, {
                            attributes: component.attributes.defaults,
                            properties: component.properties.defaults
                        })
                    );
                }
                DATA.map(item => ({ tool: item.tool })).forEach(test);
            });

            it('It should initialize a PageComponent with a LABEL tool', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component).to.be.an.instanceof(PageComponent);
                    expect(component).to.be.an.instanceof(BaseModel);
                    expect(component).to.be.an.instanceof(Model);
                    const json = component.toJSON();
                    expect(json).to.deep.equal(options);
                }
                DATA.forEach(test);
            });
        });

        describe('Update', () => {
            it('It should not modify id', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component.fields[component.idField].editable).to.be
                        .false;
                    component.set(component.idField, JSC.string()());
                    // Modification is simply discarded (no error is thrown)
                    expect(component).to.have.property(
                        component.idField,
                        options.id
                    );
                }
                DATA.forEach(test);
            });

            it('It should not modify tool', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component.fields.tool.editable).to.be.false;
                    component.set('tool', JSC.string()());
                    // Modification is simply discarded (no error is thrown)
                    expect(component).to.have.property('tool', options.tool);
                }
                DATA.forEach(test);
            });
        });

        describe('description$', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('help$', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('Clone', () => {
            it('It should clone components', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    const json = component.toJSON();
                    const clone = component.clone();
                    expect(clone).to.be.an.instanceof(PageComponent);
                    expect(clone).to.be.an.instanceof(BaseModel);
                    expect(clone).to.be.an.instanceof(Model);
                    const result = clone.toJSON();
                    delete json.id;
                    expect(result).to.deep.equal(json);
                }
                DATA.forEach(test);
            });
        });

        describe('Validation', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('Events', () => {
            it('It should propagate change events from attributes', () => {
                const change = sinon.spy();
                const component = new PageComponent(LABEL);
                component.bind('change', change);
                component.attributes.set('text', JSC.string()());
                expect(change).to.have.been.calledOnce;
            });

            it('It should propagate change events from properties', () => {
                const change = sinon.spy();
                const component = new PageComponent(LABEL);
                component.bind('change', change);
                component.properties.set('constant', JSC.string()());
                expect(change).to.have.been.calledOnce;
            });
        });
    });
});
