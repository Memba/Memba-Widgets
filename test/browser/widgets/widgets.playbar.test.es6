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
import '../../../src/js/widgets/widgets.playbar.es6';
import fixKendoRoles from '../_misc/test.roles.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource, ObservableArray },
    destroy,
    guid,
    init,
    observable,
    ui,
    ui: { PlayBar }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'playbar';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const kidoju = window.kidoju;
const tools = kidoju.tools;
const Page = kidoju.data.Page;
const PageComponent = kidoju.data.PageComponent;
const PageDataSource = kidoju.data.PageDataSource;
const PLAYBAR2 =
    '<div data-role="playbar" data-bind="source: pages, value: current"></div>'; // TODO use getRoleBinding and getValueBinding

const pageCollectionData1 = [
    {
        id: guid(),
        components: [
            {
                id: guid(),
                tool: 'image',
                top: 50,
                left: 370,
                height: 250,
                width: 250,
                rotate: 0,
                attributes: {
                    src:
                        'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png'
                }
            },
            {
                id: guid(),
                tool: 'label',
                top: 300,
                left: 300,
                height: 100,
                width: 300,
                rotate: 0,
                attributes: {
                    style: 'font-family: Georgia, serif; color: #0000FF;',
                    text: 'Company?'
                }
            },
            {
                id: guid(),
                tool: 'textbox',
                top: 450,
                left: 350,
                height: 100,
                width: 300,
                rotate: 0,
                attributes: {},
                properties: { name: 'textfield1' }
            }
        ]
    },
    {
        id: guid(),
        components: [
            {
                id: guid(),
                tool: 'label',
                top: 150,
                left: 280,
                height: 100,
                width: 300,
                rotate: 0,
                attributes: {
                    style: 'font-family: Georgia, serif; color: #FF0000;',
                    text: 'Marignan?'
                }
            },
            {
                id: guid(),
                tool: 'textbox',
                top: 300,
                left: 330,
                height: 100,
                width: 300,
                rotate: 0,
                attributes: {},
                properties: { name: 'textfield2' }
            }
        ]
    },
    {
        id: guid(),
        components: [
            {
                id: guid(),
                tool: 'label',
                top: 120,
                left: 280,
                height: 150,
                width: 400,
                rotate: 0,
                attributes: {
                    style: 'font-family: Georgia, serif; color: #00FF00;',
                    text: "Couleur du cheval blanc d'Henri IV?"
                }
            },
            {
                id: guid(),
                tool: 'textbox',
                top: 300,
                left: 330,
                height: 100,
                width: 300,
                rotate: 0,
                attributes: {},
                properties: { name: 'textfield3' }
            }
        ]
    }
];

const pageCollectionData2 = [];
for (let i = 0; i < 30; i++) {
    pageCollectionData2.push({ id: guid(), components: [] });
}

describe('widgets.playbar', () => {
    before(() => {
        if (window.__karma__) {
            if ($(`#${FIXTURES}`).length === 0) {
                $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
            }
            fixKendoRoles();
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn.kendoPlayBar).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code with all options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPlayBar({
                    input: true
                })
                .data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.dataSource.total()).to.equal(0);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.k-pager-nav'))
                .to.be.an.instanceof($)
                .with.property('length', 4);
            expect(element.find('ul>li'))
                .to.be.an.instanceof($)
                .with.property('length', 2);
            expect(element.find('span.k-pager-input>input'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(element.find('a.k-pager-refresh'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(element.find('span.k-pager-info'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
        });

        it('from code with minimal options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPlayBar({
                    numeric: false,
                    info: false,
                    input: false,
                    previousNext: false,
                    tick: false,
                    refresh: false
                })
                .data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.dataSource.total()).to.equal(0);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.k-pager-nav'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('ul>li'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('span.k-pager-input>input'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('a.k-pager-refresh'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('span.k-pager-info'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element).to.be.empty;
        });

        it('from code with dataSource', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPlayBar({
                    dataSource: pageCollectionData1
                })
                .data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageCollectionData1.length
            );
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.k-pager-nav'))
                .to.be.an.instanceof($)
                .with.property('length', 4);
            expect(element.find('ul>li'))
                .to.be.an.instanceof($)
                .with.property('length', pageCollectionData1.length + 1);
            expect(element.find('span.k-pager-input>input'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('a.k-pager-refresh'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(element.find('span.k-pager-info'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
        });

        it('from code with large dataSource and options.buttonCount', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element
                .kendoPlayBar({
                    dataSource: pageCollectionData2
                })
                .data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageCollectionData2.length
            );
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.k-pager-nav'))
                .to.be.an.instanceof($)
                .with.property('length', 4);
            expect(element.find('ul>li'))
                .to.be.an.instanceof($)
                .with.property('length', widget.options.buttonCount + 2);
            expect(element.find('span.k-pager-input>input'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('a.k-pager-refresh'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(element.find('span.k-pager-info'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
        });

        it('from markup', () => {
            const viewModel = observable({
                pages: new PageDataSource({
                    data: pageCollectionData1
                }),
                current: undefined
            });
            const element = $(PLAYBAR2).appendTo(`#${FIXTURES}`);
            bind(`#${FIXTURES}`, viewModel);
            const widget = element.data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageCollectionData1.length
            );
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.k-pager-nav'))
                .to.be.an.instanceof($)
                .with.property('length', 4);
            expect(element.find('ul>li'))
                .to.be.an.instanceof($)
                .with.property('length', pageCollectionData1.length + 1);
            expect(element.find('span.k-pager-input>input'))
                .to.be.an.instanceof($)
                .with.property('length', 0);
            expect(element.find('a.k-pager-refresh'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(element.find('span.k-pager-info'))
                .to.be.an.instanceof($)
                .with.property('length', 1);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element
                .kendoPlayBar({
                    dataSource: pageCollectionData1
                })
                .data('kendoPlayBar');
        });

        it('length', () => {
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.length()).to.equal(pageCollectionData1.length);
        });

        /*
        it('items', function () {
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(PageDataSource);
            var items = widget.items();
            expect(items).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length);
            var check = sinon.spy();
            $.each(items, function (index, item) {
                check();
                expect($(item)).to.match('div');
                expect($(item)).to.have.class('kj-item');
            });
            expect(check).to.have.callCount(pageCollectionData1.length);
        });
        */

        it('value', () => {
            const fn = function() {
                widget.value(0);
            };
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(fn).to.throw(TypeError);
            for (let idx = 0; idx < pageCollectionData1.length; idx++) {
                const page = widget.dataSource.at(idx);
                widget.value(page);
                expect(widget.index()).to.equal(idx);
                expect(widget.id()).to.equal(page.id);
            }
        });

        it('index', () => {
            const fn1 = function() {
                widget.index('not a number');
            };
            const fn2 = function() {
                widget.index(300); // not in range
            };
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
            for (let idx = 0; idx < pageCollectionData1.length; idx++) {
                const page = widget.dataSource.at(idx);
                widget.index(idx);
                expect(widget.value()).to.equal(page);
                expect(widget.id()).to.equal(page.id);
            }
        });

        it('id', () => {
            const fn = function() {
                widget.id({});
            };
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(fn).to.throw(TypeError);
            for (let idx = 0; idx < pageCollectionData1.length; idx++) {
                const page = widget.dataSource.at(idx);
                widget.id(page.id);
                expect(widget.value()).to.equal(page);
                expect(widget.index()).to.equal(idx);
            }
        });

        // TODO refresh
        // TODO: sorting.....................
    });

    describe('MVVM', () => {
        let element;
        let widget;
        let viewModel;

        /*
         // For obscure reasons, setting the viewModel here does not work
         viewModel = observable({
         pages: new PageDataSource({ data: pageCollectionArray }),
         current: undefined
         });
         */

        beforeEach(() => {
            element = $(PLAYBAR2).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                pages: new PageDataSource({
                    data: pageCollectionData1
                }),
                current: undefined
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoPlayBar');
        });

        it('Adding a page to the viewModel adds the corresponding item to the widget', () => {
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(Array)
                .with.property('length', pageCollectionData1.length);
            viewModel.pages.add(
                new Page({
                    id: guid(),
                    style: 'font-family: Georgia, serif; color: #FF0000;'
                })
            );
            expect(widget.items())
                .to.be.an.instanceof(Array)
                .with.property('length', pageCollectionData1.length + 1);
        });

        it('Removing a page from the viewModel removes the corresponding item from the widget', () => {
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(Array)
                .with.property('length', pageCollectionData1.length);
            viewModel.pages.remove(viewModel.pages.at(0));
            expect(widget.items())
                .to.be.an.instanceof(Array)
                .with.property('length', pageCollectionData1.length - 1);
        });

        // Note: Since PlayBar is a collection of kendo.ui.Stage, we are assuming that
        // if kendo.ui.Stage properly handles a change of page content, PlayBar also properly handles a change of page content

        it('Changing the selected page in the viewModel changes the corresponding item in the widget', () => {
            // TODO: also test binding on id and index?
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.items())
                .to.be.an.instanceof(Array)
                .with.property('length', pageCollectionData1.length);
            const check = sinon.spy();
            $.each(viewModel.pages.data(), (index, page) => {
                check();
                viewModel.set('current', page);
                expect($(widget.items()[index]).find('span')).to.have.class(
                    'k-state-selected'
                );
            });
            expect(check).to.have.callCount(pageCollectionData1.length);
        });

        it('Changing the selected page by clicking a number in the widget, changes the corresponding page in the viewModel', () => {
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            const check = sinon.spy();
            /*
            // For whatever reason , second click does not work
            $.each(element.find('ul.k-pager-numbers>li>a.k-link'), function (index, item) {
                check();
                $(item).simulate('click');
                expect(widget.dataSource.indexOf(viewModel.get('current'))).to.equal(parseInt($(item).attr(attr('index')), 10));
            });
            expect(check).to.have.callCount(pageCollectionData1.length - 1);
            */
            const items = element.find('ul.k-pager-numbers>li>a.k-link');
            // $(items[0]).simulate('click');
            $(items[1]).simulate('click');
            expect(
                widget.dataSource.indexOf(viewModel.get('current'))
            ).to.equal(parseInt($(items[1]).attr(attr('index')), 10));
        });

        // TODO: first
        // TODO: previous
        // TODO: more...
        // TODO: next
        // TODO: last
        // TODO: input
        // TODO: refresh button
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
                .kendoPlayBar({
                    dataSource: pageCollectionData2,
                    dataBinding(e) {
                        dataBinding(e.sender);
                    },
                    dataBound(e) {
                        dataBound(e.sender);
                    }
                })
                .data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
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
                .kendoPlayBar({
                    dataSource: pageCollectionData1,
                    change(e) {
                        change(e.value);
                    }
                })
                .data('kendoPlayBar');
            expect(widget).to.be.an.instanceof(PlayBar);
            expect(widget.dataSource).to.be.an.instanceof(
                PageDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', pageCollectionData1.length);
            const page = widget.dataSource.at(1);
            expect(page).to.be.an.instanceof(Page);
            widget.value(page);
            expect(change).to.have.been.calledOnce;
            expect(change).to.have.been.calledWith(page);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
