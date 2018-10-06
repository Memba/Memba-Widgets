/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Validation: cannot change id and tool
// TODO Add image and textbox especially for cloning
// TODO test cloning with more complexe objects (attribues or properties being objects or arrays)

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
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
                expect(component).to.have.property('attributes').that.is.null;
                expect(component).to.have.property('height', 0);
                expect(component).to.have.property('id').that.is.null;
                expect(component).to.have.property('left', 0);
                expect(component).to.have.property('properties').that.is.null;
                expect(component).to.have.property('rotate', 0);
                expect(component).to.have.property('tool').that.is.null;
                expect(component).to.have.property('top', 0);
                expect(component).to.have.property('width', 0);
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
                function testFn() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent({
                        tool: JSC.string()()
                    });
                }

                expect(testFn).to.throw(Error);
            });

            it('It should initialize a PageComponent with a LABEL tool', () => {
                const component = new PageComponent({ tool: 'label' });
                expect(component).to.be.an.instanceof(PageComponent);
                expect(component).to.be.an.instanceof(BaseModel);
                expect(component).to.be.an.instanceof(Model);
                // Test default values
                expect(component)
                    .to.have.property('attributes')
                    .that.is.an.instanceof(Model);
                expect(component).to.have.property('height', 0);
                expect(component).to.have.property('id').that.is.null;
                expect(component).to.have.property('left', 0);
                expect(component)
                    .to.have.property('properties')
                    .that.is.an.instanceof(Model);
                expect(component).to.have.property('rotate', 0);
                expect(component).to.have.property('tool', 'label');
                expect(component).to.have.property('top', 0);
                expect(component).to.have.property('width', 0);
            });

            it('It should initialize a PageComponent with a LABEL tool and more options', () => {
                const component = new PageComponent(LABEL);
                expect(component).to.be.an.instanceof(PageComponent);
                expect(component).to.be.an.instanceof(BaseModel);
                expect(component).to.be.an.instanceof(Model);
                const json = component.toJSON();
                expect(json).to.deep.equal(LABEL);
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
            xit('It should clone an image', () => {
                expect(true).to.be.false;
            });

            it('It should clone a label', () => {
                const component = new PageComponent(LABEL);
                const json = component.toJSON();
                const clone = component.clone();
                expect(clone).to.be.an.instanceof(PageComponent);
                expect(clone).to.be.an.instanceof(BaseModel);
                expect(clone).to.be.an.instanceof(Model);
                const result = clone.toJSON();
                delete json.id;
                expect(result).to.deep.equal(json);
            });

            xit('It should clone a textbox', () => {
                expect(true).to.be.false;
            });

            xit('It should clone a component with complex attributes or properties (objects or arrays', () => {
                expect(true).to.be.false;
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

