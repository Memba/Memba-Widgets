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
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { Page, PageDataSource } from '../../../src/js/data/data.page.es6';
import tools from '../../../src/js/tools/tools.es6';
import '../../../src/js/widgets/widgets.navigation.es6';

import {
    componentGenerator,
    getPageArray
} from '../../../src/js/helpers/helpers.components.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    attr,
    bind,
    data: { /* DataSource */ ObservableArray },
    destroy,
    format,
    guid,
    // init,
    observable,
    ui: { Navigation, roles }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'navigation';
const WIDGET = 'kendoNavigation';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.navigation', () => {
    before(done => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
        const promises = Object.keys(componentGenerator).map(tool =>
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
            expect($.fn.kendoStage).to.be.a(CONSTANTS.FUNCTION);
            expect($.fn[WIDGET]).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.dataSource.total()).to.equal(0);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element).to.be.empty;
        });

        it('from code with dataSource', () => {
            const data = getPageArray();
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]({
                dataSource: data
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', data.length);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find(`div.kj-${ROLE}-item>div.kj-stage`))
                .to.be.an.instanceof($)
                .with.property('length', data.length);
        });

        it('from markup', () => {
            const attributes = options2attributes({
                bind: 'source: pages, value: current',
                role: ROLE
            });
            const data = getPageArray();
            const viewModel = observable({
                pages: new PageDataSource({
                    data
                }),
                current: undefined
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            bind(`#${FIXTURES}`, viewModel);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', data.length);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find(`div.kj-${ROLE}-item>div.kj-stage`))
                .to.be.an.instanceof($)
                .with.property('length', data.length);
        });
    });

    describe('Methods', () => {
        let data;
        let element;
        let widget;

        beforeEach(() => {
            data = getPageArray();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET]({
                dataSource: data
            }).data(WIDGET);
        });

        it('length', () => {
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.length()).to.equal(data.length);
        });

        it('items', () => {
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            const items = widget.items();
            expect(items)
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
            const check = sinon.spy();
            $.each(items, (index, item) => {
                check();
                expect($(item)).to.match('div');
                expect($(item)).to.have.class(`kj-${ROLE}-item`);
            });
            expect(check).to.have.callCount(data.length);
        });

        it('value', () => {
            function fn() {
                widget.value(0);
            }
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(fn).to.throw(TypeError);
            for (let idx = 0; idx < data.length; idx++) {
                const page = widget.dataSource.at(idx);
                widget.value(page);
                expect(widget.index()).to.equal(idx);
                expect(widget.id()).to.equal(page.id);
            }
        });

        it('index', () => {
            function fn1() {
                widget.index('not a number');
            }
            /*
            function fn2() {
                widget.index(300); // not in range
            }
             */
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(fn1).to.throw(TypeError);
            // expect(fn2).to.throw(RangeError); // <-- error not raised
            for (let idx = 0; idx < data.length; idx++) {
                const page = widget.dataSource.at(idx);
                widget.index(idx);
                expect(widget.value()).to.equal(page);
                expect(widget.id()).to.equal(page.id);
            }
        });

        it('id', () => {
            function fn() {
                widget.id({});
            }
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(fn).to.throw(TypeError);
            for (let idx = 0; idx < data.length; idx++) {
                const page = widget.dataSource.at(idx);
                widget.id(page.id);
                expect(widget.value()).to.equal(page);
                expect(widget.index()).to.equal(idx);
            }
        });

        // TODO height
        // TODO width
        // TODO refresh
        // TODO: sorting.....................
    });

    describe('MVVM', () => {
        const attributes = options2attributes({
            bind: 'source: pages, value: current',
            role: ROLE
        });
        let data;
        let element;
        let widget;
        let viewModel;

        /*
        // For obscure reasons, setting the viewModel here does not work
        viewModel = observable({
            pages: new PageDataSource({ data }),
            current: undefined
        });
        */

        beforeEach(() => {
            data = getPageArray();
            element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                pages: new PageDataSource({ data }),
                current: undefined
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
        });

        it('Adding a page to the viewModel adds the corresponding item to the widget', () => {
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
            viewModel.pages.add(
                new Page({
                    id: guid(),
                    style: 'font-family: Georgia, serif; color: #FF0000;'
                })
            );
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length + 1);
        });

        it('Removing a page from the viewModel removes the corresponding item from the widget', () => {
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
            viewModel.pages.remove(viewModel.pages.at(0));
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length - 1);
        });

        // Note: Since Navigation is a collection of kendo.ui.Stage, we are assuming that
        // if kendo.ui.Stage properly handles a change of page content, Navigation also properly handles a change of page content

        it('Changing the selected page in the viewModel changes the corresponding item in the widget', () => {
            // TODO: also test binding on id and index?
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', data.length);
            const check = sinon.spy();
            $.each(viewModel.pages.data(), (index, page) => {
                check();
                viewModel.set('current', page);
                expect(
                    widget.element.find(
                        format('[{0}="{1}"]', attr('uid'), page.uid)
                    )
                ).to.have.class('k-state-selected');
            });
            expect(check).to.have.callCount(data.length);
        });

        it('Changing the selected page in the widget, changes the corresponding page in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            const check = sinon.spy();
            widget.element.find(`div.kj-${ROLE}-item`).each((index, item) => {
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
            data = getPageArray();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
        });

        it('dataBinding & dataBound', () => {
            const dataBinding = sinon.spy();
            const dataBound = sinon.spy();
            widget = element[WIDGET]({
                dataSource: data,
                dataBinding(e) {
                    dataBinding(e.sender);
                },
                dataBound(e) {
                    dataBound(e.sender);
                }
            }).data(WIDGET);
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
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
                change(e) {
                    change(e.value);
                }
            }).data(WIDGET);
            expect(change).not.to.have.been.called;
            expect(widget).to.be.an.instanceof(Navigation);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', data.length);
            const page = widget.dataSource.at(1);
            expect(page).to.be.an.instanceof(Page);
            widget.value(page);
            expect(change).to.have.been.calledOnce;
            expect(change).to.have.been.calledWith(page);
        });

        // TODO: select event
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
