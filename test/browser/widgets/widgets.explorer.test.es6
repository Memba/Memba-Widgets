/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.explorer.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { ObservableArray },
    destroy,
    format,
    guid,
    observable,
    ui: { Explorer }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'explorer';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const kidoju = window.kidoju;
const tools = kidoju.tools;
const Page = kidoju.data.Page;
const PageComponent = kidoju.data.PageComponent;
const PageComponentDataSource =
    kidoju.data.PageComponentDataSource;
const ICON_PATH = '../../src/styles/images/';
const EXPLORER3 = `<div data-role="explorer" data-bind="source: components, value: current" data-icon-path="${ICON_PATH}"></div>`;

const pageComponentCollectionArray = [
    {
        id: guid(),
        tool: 'image',
        top: 50,
        left: 100,
        height: 250,
        width: 250,
        rotate: 45,
        attributes: {
            src:
                'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png'
        }
    },
    {
        id: guid(),
        tool: 'image',
        top: 300,
        left: 300,
        height: 250,
        width: 250,
        rotate: 315,
        attributes: {
            src:
                'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg'
        }
    },
    {
        id: guid(),
        tool: 'label',
        top: 250,
        left: 500,
        height: 100,
        width: 300,
        rotate: 90,
        attributes: {
            style: 'font-family: Georgia, serif; color: #FF0000;',
            text: 'World'
        }
    },
    {
        id: guid(),
        tool: 'textbox',
        top: 20,
        left: 20,
        height: 100,
        width: 300,
        rotate: 0,
        attributes: {},
        properties: { name: 'textfield3' }
    }
];

describe('widgets.explorer', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoExplorer).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code without datasource', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoExplorer().data('kendoExplorer');
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(0);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.have.descendants('ul');
            expect(element.find('li'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
        });

        it('from code with datasource', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoExplorer({
                    dataSource: pageComponentCollectionArray,
                    iconPath: ICON_PATH
                })
                .data('kendoExplorer');
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', pageComponentCollectionArray.length);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.have.descendants('ul');
            expect(element.find('li'))
                .to.be.an.instanceof($)
                .with.property('length', pageComponentCollectionArray.length);
        });

        it('from markup', () => {
            const viewModel = observable({
                components: new PageComponentDataSource({
                    data: pageComponentCollectionArray
                }),
                current: undefined
            });
            const element = $(EXPLORER3).appendTo(`#${FIXTURES}`);
            bind(FIXTURES, viewModel);
            const widget = element.data('kendoExplorer');
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', pageComponentCollectionArray.length);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.have.descendants('ul');
            expect(element.find('li'))
                .to.be.an.instanceof($)
                .with.property('length', pageComponentCollectionArray.length);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element
                .kendoExplorer({
                    dataSource: pageComponentCollectionArray,
                    iconPath: ICON_PATH
                })
                .data('kendoExplorer');
        });

        it('length', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.length()).to.equal(
                pageComponentCollectionArray.length
            );
        });

        it('items', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            const items = widget.items();
            expect(items)
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', pageComponentCollectionArray.length);
            const check = sinon.spy();
            $.each(items, (index, item) => {
                check();
                expect($(item)).to.match('li');
                expect($(item)).to.have.class('k-item');
                expect($(item)).to.have.class('kj-item');
            });
            expect(check).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        it('value', () => {
            const fn = function() {
                widget.value(0);
            };
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(fn).to.throw(TypeError);
            for (
                let idx = 0;
                idx < pageComponentCollectionArray.length;
                idx++
            ) {
                const component = widget.dataSource.at(idx);
                widget.value(component);
                expect(widget.index()).to.equal(idx);
                expect(widget.id()).to.equal(component.id);
            }
        });

        it('index', () => {
            const fn1 = function() {
                widget.index('not a number');
            };
            const fn2 = function() {
                widget.index(300); // not in range
            };
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
            for (
                let idx = 0;
                idx < pageComponentCollectionArray.length;
                idx++
            ) {
                const component = widget.dataSource.at(idx);
                widget.index(idx);
                expect(widget.value()).to.equal(component);
                expect(widget.id()).to.equal(component.id);
            }
        });

        it('id', () => {
            const fn = function() {
                widget.id({});
            };
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(fn).to.throw(TypeError);
            for (
                let idx = 0;
                idx < pageComponentCollectionArray.length;
                idx++
            ) {
                const component = widget.dataSource.at(idx);
                widget.id(component.id);
                expect(widget.value()).to.equal(component);
                expect(widget.index()).to.equal(idx);
            }
        });

        xit('destroy', () => {
            // TODO
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
        viewModel = observable({
            components: new PageComponentDataSource({ data: pageComponentCollectionArray }),
            current: null
        });
        */

        beforeEach(() => {
            element = $(EXPLORER3).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                components: new PageComponentDataSource({
                    data: pageComponentCollectionArray
                }),
                current: null
            });
            bind(FIXTURES, viewModel);
            widget = element.data('kendoExplorer');
        });

        it('Adding a component to the viewModel adds the corresponding item to the widget', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', pageComponentCollectionArray.length);
            viewModel.components.add(
                new PageComponent({
                    id: guid(),
                    tool: 'label',
                    top: 250,
                    left: 500,
                    height: 100,
                    width: 300,
                    rotate: 90,
                    attributes: {
                        style: 'font-family: Georgia, serif; color: #FF0000;',
                        text: 'World'
                    }
                })
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property(
                    'length',
                    pageComponentCollectionArray.length + 1
                );
        });

        it('Removing a component from the viewModel removes the corresponding item from the widget', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', pageComponentCollectionArray.length);
            viewModel.components.remove(viewModel.components.at(0));
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property(
                    'length',
                    pageComponentCollectionArray.length - 1
                );
        });

        // Currently, there is no point testing a change of component data in the viewModel
        // because the information we display (tool icon + tool id) cannot be changed

        it('Changing the selected component in the viewModel changes the corresponding item in the widget', () => {
            // TODO: also test binding on id and index?
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', pageComponentCollectionArray.length);
            const check = sinon.spy();
            $.each(viewModel.components.data(), (index, component) => {
                check();
                viewModel.set('current', component);
                expect(
                    widget.element.find(
                        format(
                            '[{0}="{1}"]',
                            attr('uid'),
                            component.uid
                        )
                    )
                ).to.have.class('k-state-selected');
            });
            expect(check).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        it('Changing the selected item in the widget, changes the corresponding component in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            const check = sinon.spy();
            $.each(widget.element.find('li.kj-item'), (index, item) => {
                check();
                $(item).simulate('click');
                expect(viewModel.get('current')).to.have.property(
                    'uid',
                    $(item).attr(attr('uid'))
                );
            });
            expect(check).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });
    });

    describe('Events', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
        });

        it('dataBinding & dataBound', () => {
            const dataBinding = sinon.spy();
            const dataBound = sinon.spy();
            widget = element
                .kendoExplorer({
                    dataSource: pageComponentCollectionArray,
                    iconPath: ICON_PATH,
                    dataBinding(e) {
                        dataBinding(e.sender);
                    },
                    dataBound(e) {
                        dataBound(e.sender);
                    }
                })
                .data('kendoExplorer');
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(dataBinding).to.have.been.calledOnce;
            expect(dataBinding).to.have.been.calledWith(widget);
            expect(dataBound).to.have.been.calledOnce;
            expect(dataBound).to.have.been.calledWith(widget);
            expect(dataBinding).to.have.been.calledBefore(dataBound);
        });

        it('change', () => {
            const change = sinon.spy();
            widget = element
                .kendoExplorer({
                    dataSource: pageComponentCollectionArray,
                    iconPath: ICON_PATH,
                    change(e) {
                        change(e.value);
                    }
                })
                .data('kendoExplorer');
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', pageComponentCollectionArray.length);
            const component = widget.dataSource.at(1);
            expect(component).to.be.an.instanceof(PageComponent);
            widget.value(component);
            expect(change).to.have.been.calledTwice; // TODO: once!
            expect(change).to.have.been.calledWith(component);
        });

        xit('select', () => {
            $.noop();
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
