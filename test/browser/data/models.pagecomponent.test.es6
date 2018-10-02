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
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/models.base.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';

// Load tools
import '../../../src/js/tools/tools.label.es6';

const { describe, it } = window;
const {
    data: { Model }
} = window.kendo;
const { expect } = chai;
chai.use(sinonChai);

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

describe('models.pagecomponent', () => {
    describe('PageComponent', () => {
        describe('Initialization', () => {
            it('It should initialize a PageComponent without options', () => {
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

        // TODO Validation: cannot change id and tool
        // TODO Validation style???

        describe('Clone', () => {
            it('It should clone a component', () => {
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


/*********************************************************************************************************
 * PageComponent
 *********************************************************************************************************/

describe('Test PageComponent', function () {

    describe('When initializing a PageComponent', function () {

        it('if initialized from an undefined, it should pass although tool is null', function () {
            // Unfortunately, initilization without parameter is a Kendo UI requirement
            var component = new PageComponent();
            // Test default values
            expect(component).to.have.property('attributes').that.is.null;
            expect(component).to.have.property('height', -1);
            expect(component).to.have.property('id').that.is.null;
            expect(component).to.have.property('left', 0);
            expect(component).to.have.property('properties').that.is.null;
            expect(component).to.have.property('rotate', 0);
            expect(component).to.have.property('tag').that.is.null;
            expect(component).to.have.property('tool').that.is.null;
            expect(component).to.have.property('top', 0);
            expect(component).to.have.property('width', -1);
        });

        it('if initialized from an object without tool, it should throw', function () {
            function testFn() {
                var component = new PageComponent({ dummy: true });
            }
            expect(testFn).to.throw(Error);
        });

        it('if initialized from an object with an invalid tool, it should throw', function () {
            function testFn() {
                var component = new PageComponent({ tool: 'dummy' });
            }
            expect(testFn).to.throw(Error);
        });

        it('if initialized from a valid object, it should pass', function () {
            var component = new PageComponent({ tool: 'label' });
            expect(component).to.be.an.instanceof(PageComponent);
        });

        it('if initialized from a complete label, it should pass', function () {
            var obj = {
                id: ObjectId(),
                tool : 'label',
                top: 250,
                left: 500,
                height: 100,
                width: 300,
                rotate: 90,
                attributes: {
                    style: 'font-family: Georgia, serif; color: #FF0000;',
                    text: 'World'
                }
            };

            function TestObjectProperty(obj, prop) {
                var component = new PageComponent(obj);
                if (prop === 'attributes' || prop === 'properties') {
                    for (var subprop in obj[prop]) {
                        if (obj[prop].hasOwnProperty(subprop)) {
                            expect(component[prop][subprop]).to.equal(obj[prop][subprop]);
                        }
                    }
                } else {
                    expect(component[prop]).to.equal(obj[prop]);
                }
            }

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    // Extraction of TestObjectProperty fixes jshint error: `Blocks are nested too deeply`
                    TestObjectProperty(obj, prop);
                }
            }

        });

        it('if initialized from a complete image, it shoud pass', function () {
            var obj = {
                id: ObjectId(),
                tool : 'image',
                top: 50,
                left: 100,
                height: 250,
                width: 250,
                rotate: 45,
                attributes: {
                    src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png',
                    alt: 'Google Logo'
                }
            };
            var component = new PageComponent(obj);

        });

        it('if initialized from a complete textbox, it shoud pass', function () {
            var component = new PageComponent({
                id: ObjectId(),
                tool : 'textbox',
                top: 20,
                left: 20,
                height: 100,
                width: 300,
                rotate: 0,
                attributes: '{}',
                properties: '{ "name": "textfield3" }'
            });

        });

        xit('if cloned, it should pass', function (done) {
            // TODO
        });

        // TODO Many other components!!!

    });

});
