/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { options2attributes } from '../_misc/test.util.es6';
import {
    PageComponent,
    PageComponentDataSource,
} from '../../../src/js/data/data.pagecomponent.es6';
import tools from '../../../src/js/tools/tools.es6';
import '../../../src/js/widgets/widgets.explorer.es6';
import {
    componentGenerator,
    getComponentArray,
} from '../../../src/js/helpers/helpers.data.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    attr,
    bind,
    data: { ObservableArray },
    destroy,
    format,
    guid,
    init,
    observable,
    ui: { Explorer, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'explorer';
const WIDGET = 'kendoExplorer';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const ICON_PATH = '../../src/styles/images/';
const EXPLORER3 = `<div data-role="explorer" data-bind="source: components, value: current" data-icon-path="${ICON_PATH}"></div>`;

describe('widgets.explorer', () => {
    before((done) => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
        const promises = Object.keys(componentGenerator).map((tool) =>
            tools.load(tool)
        );
        $.when(...promises)
            .then(done)
            .catch(done);
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn[WIDGET]).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
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

        it('from code with options', () => {
            const data = getComponentArray();
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                dataSource: data,
                iconPath: ICON_PATH,
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', data.length);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.have.descendants('ul');
            expect(element.find('li'))
                .to.be.an.instanceof($)
                .with.property('length', data.length);
        });

        it('from markup', () => {
            const attributes = options2attributes({
                iconPath: ICON_PATH,
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', 0);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.have.descendants('ul');
            expect(element.find('li'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                bind: 'source: components, value: current',
                iconPath: ICON_PATH,
                role: ROLE,
            });
            const data = getComponentArray();
            const viewModel = observable({
                components: new PageComponentDataSource({ data }),
                current: undefined,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            bind(`#${FIXTURES}`, viewModel);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', data.length);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.have.descendants('ul');
            expect(element.find('li'))
                .to.be.an.instanceof($)
                .with.property('length', data.length);
        });
    });

    describe('Methods', () => {
        let data;
        let element;
        let options;
        let widget;

        beforeEach(() => {
            data = getComponentArray();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = {
                dataSource: data,
                iconPath: ICON_PATH,
            };
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('length', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.length()).to.equal(data.length);
        });

        it('items', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            const items = widget.items();
            expect(items)
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
            const check = sinon.spy();
            $.each(items, (index, item) => {
                check();
                expect($(item)).to.match('li');
                expect($(item)).to.have.class('k-item');
                expect($(item)).to.have.class(`kj-${ROLE}-item`);
            });
            expect(check).to.have.callCount(data.length);
        });

        it('value', () => {
            function fn() {
                widget.value(0);
            }
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(fn).to.throw(TypeError);
            for (let idx = 0; idx < data.length; idx++) {
                const component = widget.dataSource.at(idx);
                widget.value(component);
                expect(widget.index()).to.equal(idx);
                expect(widget.id()).to.equal(component.id);
            }
        });

        it('index', () => {
            function fn1() {
                widget.index('not a number');
            }
            function fn2() {
                widget.index(300); // not in range
            }
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
            for (let idx = 0; idx < data.length; idx++) {
                const component = widget.dataSource.at(idx);
                widget.index(idx);
                expect(widget.value()).to.equal(component);
                expect(widget.id()).to.equal(component.id);
            }
        });

        it('id', () => {
            function fn() {
                widget.id({});
            }
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(fn).to.throw(TypeError);
            for (let idx = 0; idx < data.length; idx++) {
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
        let data;
        let element;
        let widget;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
        viewModel = observable({
            components: new PageComponentDataSource({ data: getComponentArray() }),
            current: null
        });
        */

        beforeEach(() => {
            data = getComponentArray();
            element = $(EXPLORER3).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                components: new PageComponentDataSource({ data }),
                current: null,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
        });

        it('Adding a component to the viewModel adds the corresponding item to the widget', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
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
                        text: 'World',
                    },
                })
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length + 1);
        });

        it('Removing a component from the viewModel removes the corresponding item from the widget', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
            viewModel.components.remove(viewModel.components.at(0));
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length - 1);
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
                .with.property('length', data.length);
            const check = sinon.spy();
            $.each(viewModel.components.data(), (index, component) => {
                check();
                viewModel.set('current', component);
                expect(
                    widget.element.find(
                        format('[{0}="{1}"]', attr('uid'), component.uid)
                    )
                ).to.have.class('k-state-selected');
            });
            expect(check).to.have.callCount(data.length);
        });

        it('Changing the selected item in the widget, changes the corresponding component in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            const check = sinon.spy();
            $.each(widget.element.find(`li.kj-${ROLE}-item`), (index, item) => {
                check();
                $(item).simulate('click');
                expect(viewModel.get('current')).to.have.property(
                    'uid',
                    $(item).attr(attr('uid'))
                );
            });
            expect(check).to.have.callCount(data.length);
        });
    });

    describe('Events', () => {
        let data;
        let element;
        let widget;

        beforeEach(() => {
            data = getComponentArray();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
        });

        it('dataBinding & dataBound', () => {
            const dataBinding = sinon.spy();
            const dataBound = sinon.spy();
            widget = element[WIDGET]({
                dataSource: data,
                iconPath: ICON_PATH,
                dataBinding(e) {
                    dataBinding(e.sender);
                },
                dataBound(e) {
                    dataBound(e.sender);
                },
            }).data(WIDGET);
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
            widget = element[WIDGET]({
                dataSource: data,
                iconPath: ICON_PATH,
                change(e) {
                    change(e.value);
                },
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(Explorer);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', data.length);
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
