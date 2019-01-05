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
import '../../../src/js/widgets/widgets.widget.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource, ObservableArray },
    destroy,
    format,
    guid,
    init,
    observable,
    ui: { Stage }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'widget';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const kidoju = window.kidoju;
const tools = kidoju.tools;
const Tool = kidoju.Tool;
const Page = kidoju.data.Page;
const PageComponent = kidoju.data.PageComponent;
const PageDataSource = kidoju.data.PageDataSource;
const PageComponentDataSource =
    kidoju.data.PageComponentDataSource;
const STAGE2 =
    '<div data-role="stage" data-bind="source: components, value: current" data-mode="design"></div>';

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

function findCenter(elem) {
    const document = $(elem.get(0).ownerDocument);
    const offset = elem.offset();
    return {
        x: offset.left + elem.outerWidth() / 2 - document.scrollLeft(),
        y: offset.top + elem.outerHeight() / 2 - document.scrollTop()
    };
}

describe('widgets.widget', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoStage).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element.kendoStage().data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(0);
            expect(element.parent()).to.have.class('k-widget');
            expect(element.parent()).to.have.class(`kj-${ROLE}`);
            expect(widget.mode()).to.equal(Stage.fn.modes.play);
            // expect(widget.wrapper).to.equal(element.parent());
            expect(widget.wrapper[0]).to.equal(element.parent()[0]);
            expect(widget.wrapper).to.have.descendants(
                'div[data-role="stage"]'
            );
            expect(widget.wrapper).to.have.descendants('div.kj-nopage');
        });

        it('from code with dataSource in design mode', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element
                .kendoStage({
                    mode: Stage.fn.modes.design,
                    dataSource: new PageComponentDataSource({
                        data: pageComponentCollectionArray
                    })
                })
                .data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            expect(widget.mode()).to.equal(Stage.fn.modes.design);
            // expect(widget.wrapper).to.equal(element.parent());
            expect(widget.wrapper[0]).to.equal(element.parent()[0]);
            expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.descendants(
                'div[data-role="stage"]'
            );
            expect(widget.wrapper).not.to.have.descendants('div.kj-overlay'); // <------------------------- in design mode, there is no overlay
            expect(widget.wrapper).to.have.descendants('div.kj-handle-box'); // <------------------------- in design mode, there is a handle box (with handles)
            // expect(widget.wrapper).to.have.descendants('div.debug-bounds');
            // expect(widget.wrapper).to.have.descendants('div.debug.center');
            // expect(widget.wrapper).to.have.descendants('div.debug-mouse');
            expect($(document.body)).to.have.descendants('ul.kj-widget-menu'); // <------------------------- in design mode, there is a contextual menu
            expect(widget.menu).to.be.an.instanceof(kendo.ui.ContextMenu);
            const items = element.find('div.kj-element');
            expect(items)
                .to.be.an.instanceof($)
                .with.property('length', pageComponentCollectionArray.length);
            $.each(items, (index, item) => {
                const data = widget.dataSource.at(index);
                expect($(item).attr(attr('uid'))).to.equal(data.uid);
                expect($(item).attr(attr('tool'))).to.equal(data.tool);
                expect($(item).css('position')).to.equal('absolute');
                expect($(item).css('top')).to.equal(`${data.top}px`);
                expect($(item).css('left')).to.equal(`${data.left}px`);
                expect($(item).css('height')).to.equal(`${data.height}px`);
                expect($(item).css('width')).to.equal(`${data.width}px`);
                // TODO we would need a function to convert a 2D transform matrix into a rotation angle
                // expect($(item).css('transform')).to.equal(format('rotate({0})deg', data.rotate));
            });
        });

        it('from code with dataSource in play mode', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element
                .kendoStage({
                    mode: Stage.fn.modes.play,
                    dataSource: new PageComponentDataSource({
                        data: pageComponentCollectionArray
                    })
                })
                .data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            expect(widget.mode()).to.equal(Stage.fn.modes.play);
            // expect(widget.wrapper).to.equal(element.parent());
            expect(widget.wrapper[0]).to.equal(element.parent()[0]);
            expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.descendants(
                'div[data-role="stage"]'
            );
            expect(widget.wrapper).not.to.have.descendants('div.kj-overlay'); // <------------------------- in play mode, there is no overlay
            expect(widget.wrapper).not.to.have.descendants('div.kj-handle-box'); // <------------------------- in play mode, there is no handle box (with handles)
            // expect(widget.wrapper).not.to.have.descendants('div.debug-bounds');
            // expect(widget.wrapper).not.to.have.descendants('div.debug.center');
            // expect(widget.wrapper).not.to.have.descendants('div.debug-mouse');
            expect($(document.body)).not.to.have.descendants(
                'ul.kj-widget-menu'
            ); // <------------------------- in play mode, there is no contextual menu
            expect(widget.menu).to.be.undefined;
            const items = element.find('div.kj-element');
            expect(items)
                .to.be.an.instanceof($)
                .with.property('length', pageComponentCollectionArray.length);
            $.each(items, (index, item) => {
                const data = widget.dataSource.at(index);
                expect($(item).attr(attr('uid'))).to.equal(data.uid);
                expect($(item).attr(attr('tool'))).to.equal(data.tool);
                expect($(item).css('position')).to.equal('absolute');
                expect($(item).css('top')).to.equal(`${data.top}px`);
                expect($(item).css('left')).to.equal(`${data.left}px`);
                expect($(item).css('height')).to.equal(`${data.height}px`);
                expect($(item).css('width')).to.equal(`${data.width}px`);
                // TODO we would need a function to convert a 2D transform matrix into a rotation angle
                // expect($(item).css('transform')).to.equal(format('rotate({0})deg', data.rotate));
                // TODO check bindings
            });
        });

        it('from code with dataSource in review mode', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element
                .kendoStage({
                    mode: Stage.fn.modes.review,
                    dataSource: new PageComponentDataSource({
                        data: pageComponentCollectionArray
                    })
                })
                .data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            expect(widget.mode()).to.equal(Stage.fn.modes.review);
            // expect(widget.wrapper).to.equal(element.parent());
            expect(widget.wrapper[0]).to.equal(element.parent()[0]);
            expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.descendants(
                'div[data-role="stage"]'
            );
            expect(widget.wrapper).not.to.have.descendants('div.kj-overlay'); // <------------------------- in review mode, there is no overlay
            expect(widget.wrapper).not.to.have.descendants('div.kj-handle-box'); // <------------------------- in review mode, there is no handle box (with handles)
            // expect(widget.wrapper).not.to.have.descendants('div.debug-bounds');
            // expect(widget.wrapper).not.to.have.descendants('div.debug.center');
            // expect(widget.wrapper).not.to.have.descendants('div.debug-mouse');
            expect($(document.body)).not.to.have.descendants(
                'ul.kj-widget-menu'
            ); // <------------------------- in review mode, there is no contextual menu
            expect(widget.menu).to.be.undefined;
            const items = element.find('div.kj-element');
            expect(items)
                .to.be.an.instanceof($)
                .with.property('length', pageComponentCollectionArray.length);
            $.each(items, (index, item) => {
                const data = widget.dataSource.at(index);
                expect($(item).attr(attr('uid'))).to.equal(data.uid);
                expect($(item).attr(attr('tool'))).to.equal(data.tool);
                expect($(item).css('position')).to.equal('absolute');
                expect($(item).css('top')).to.equal(`${data.top}px`);
                expect($(item).css('left')).to.equal(`${data.left}px`);
                expect($(item).css('height')).to.equal(`${data.height}px`);
                expect($(item).css('width')).to.equal(`${data.width}px`);
                // TODO we would need a function to convert a 2D transform matrix into a rotation angle
                // expect($(item).css('transform')).to.equal(format('rotate({0})deg', data.rotate));
                // TODO check bindings
            });
        });

        it('from markup', () => {
            const viewModel = observable({
                components: new PageComponentDataSource({
                    data: pageComponentCollectionArray
                }),
                current: undefined
            });
            const element = $(STAGE2).appendTo(FIXTURES);
            bind(FIXTURES, viewModel);
            const widget = element.data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            expect(widget.mode()).to.equal(Stage.fn.modes.design);
            // expect(widget.wrapper).to.equal(element.parent());
            expect(widget.wrapper[0]).to.equal(element.parent()[0]);
            expect(widget.wrapper).to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.descendants(
                'div[data-role="stage"]'
            );
            expect(widget.wrapper).not.to.have.descendants('div.kj-overlay'); // <------------------------- in design mode, there is no overlay
            expect(widget.wrapper).to.have.descendants('div.kj-handle-box'); // <------------------------- in design mode, there is a handle box (with handles)
            // expect(widget.wrapper).not.to.have.descendants('div.debug-bounds');
            // expect(widget.wrapper).not.to.have.descendants('div.debug.center');
            // expect(widget.wrapper).not.to.have.descendants('div.debug-mouse');
            expect($(document.body)).to.have.descendants('ul.kj-widget-menu'); // <------------------------ in design mode, there is a contextual menu
            expect(widget.menu).to.be.an.instanceof(kendo.ui.ContextMenu);
            const items = element.find('div.kj-element');
            expect(items)
                .to.be.an.instanceof($)
                .with.property('length', pageComponentCollectionArray.length);
            $.each(items, (index, item) => {
                const component = widget.dataSource.at(index);
                expect($(item).attr(attr('uid'))).to.equal(component.uid);
                expect($(item).attr(attr('tool'))).to.equal(component.tool);
                expect($(item).css('position')).to.equal('absolute');
                expect($(item).css('top')).to.equal(`${component.top}px`);
                expect($(item).css('left')).to.equal(`${component.left}px`);
                expect($(item).css('height')).to.equal(`${component.height}px`);
                expect($(item).css('width')).to.equal(`${component.width}px`);
                // TODO we would need a function to convert a 2D transform matrix into a rotation angle
                // expect($(item).css('transform')).to.equal(format('rotate({0})deg', component.rotate));
                // TODO check bindings
            });
        });
    });

    describe('Methods', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoStage({
                    dataSource: pageComponentCollectionArray,
                    mode: Stage.fn.modes.design
                })
                .data('kendoStage');
        });

        it('length', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.length()).to.equal(
                pageComponentCollectionArray.length
            );
        });

        it('items', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            const items = widget.items();
            if (window.PHANTOMJS) {
                expect(items).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(items)
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const check = sinon.spy();
            $.each(items, (index, item) => {
                check();
                expect($(item)).to.match('div');
                expect($(item)).to.have.class('kj-element');
                expect($(item)).to.have.attr(attr('uid'));
            });
            expect(check).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        it('value', () => {
            const fn = function() {
                widget.value(0);
            };
            expect(widget).to.be.an.instanceof(Stage);
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
            expect(widget).to.be.an.instanceof(Stage);
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
            expect(widget).to.be.an.instanceof(Stage);
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

        it('mode', () => {
            const fn1 = function() {
                widget.mode({});
            };
            const fn2 = function() {
                widget.mode('dummay');
            };
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.mode()).to.equal(Stage.fn.modes.design);
            expect(widget.menu).to.be.an.instanceof(kendo.ui.ContextMenu);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        it('height', () => {
            const fn1 = function() {
                widget.height({});
            };
            const fn2 = function() {
                widget.height(-1);
            };
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.height()).to.equal(widget.options.height);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        it('width', () => {
            const fn1 = function() {
                widget.width({});
            };
            const fn2 = function() {
                widget.width(-1);
            };
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.width()).to.equal(widget.options.width);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        it('scale', () => {
            const fn1 = function() {
                widget.scale({});
            };
            const fn2 = function() {
                widget.scale(-1);
            };
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.scale()).to.equal(widget.options.scale);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        xit('properties', () => {
            // TODO
        });
    });

    describe('MVVM', () => {
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
            element = $(STAGE2).appendTo(FIXTURES);
            viewModel = observable({
                components: new PageComponentDataSource({
                    data: pageComponentCollectionArray
                }),
                current: null
            });
            bind(FIXTURES, viewModel);
            widget = element.data('kendoStage');
        });

        it('Adding a component to the viewModel adds the corresponding element to the widget', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
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
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length + 1
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length + 1
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length + 1
                    );
            }
        });

        it('Removing a component from the viewModel removes the corresponding element from the widget', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            viewModel.components.remove(viewModel.components.at(0));
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length - 1
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length - 1
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length - 1
                    );
            }
        });

        it('Changing the selected component in the viewModel changes the corresponding element in the widget', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const check = sinon.spy();
            $.each(viewModel.components.data(), (index, component) => {
                check();
                viewModel.set('current', component);
                const handleBox = widget.wrapper.find('div.kj-handle-box');
                expect(handleBox)
                    .to.be.an.instanceof($)
                    .with.property('length', 1);
                expect(handleBox).to.have.attr(attr('uid'), component.uid);
            });
            expect(check).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        it('Changing the selected element in the widget, changes the corresponding component in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const check = sinon.spy();
            $.each(widget.items(), (index, item) => {
                check();
                $(item).simulate('mousedown', { bubbles: true });
                const component = viewModel.get('current');
                expect(component).to.have.property(
                    'uid',
                    $(item).attr(attr('uid'))
                );
                const handleBox = widget.wrapper.find('div.kj-handle-box');
                expect(handleBox).to.have.attr(attr('uid'), component.uid);
                expect(handleBox).to.have.css('display', 'block');
                expect(handleBox).to.have.css('top', `${component.top}px`);
                expect(handleBox).to.have.css('left', `${component.left}px`);
                expect(handleBox).to.have.css(
                    'height',
                    `${component.height}px`
                );
                expect(handleBox).to.have.css('width', `${component.width}px`);
                // rotate?
            });
            expect(check).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        /* This function has too many statements. */
        /* jshint -W071 */

        it('Adding a new element to the widget, adds the corresponding component to the viewModel', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const total = pageComponentCollectionArray.length;
            const offset = element.offset();
            let count = 0;
            const check = sinon.spy();
            $.each(Object.keys(tools), (index, key) => {
                const tool = tools[key];
                if (tool instanceof Tool && tool.id !== tools.pointer.id) {
                    check();
                    count++;
                    tools.active = tool.id;
                    widget.element.simulate('mousedown', {
                        clientX: offset.left + 20 * count,
                        clientY: offset.top + 15 * count
                    });
                    expect(widget.dataSource.total()).to.equal(total + count);
                    const items = widget.items();
                    if (window.PHANTOMJS) {
                        expect(items).to.have.property('length', total + count);
                    } else {
                        expect(items)
                            .to.be.an.instanceof(window.HTMLCollection)
                            .with.property('length', total + count);
                    }
                    const component = widget.dataSource.at(total + count - 1);
                    const item = items[total + count - 1];
                    expect(component).to.have.property('id', null);
                    expect(component).to.have.property('tool', tool.id);
                    expect(component).to.have.property('top', 15 * count);
                    expect(component).to.have.property('left', 20 * count);
                    expect(component).to.have.property('height', tool.height);
                    expect(component).to.have.property('width', tool.width);
                    expect(component).to.have.property('rotate', 0);
                    expect($(item).attr(attr('uid'))).to.equal(component.uid);
                    expect($(item).attr(attr('tool'))).to.equal(component.tool);
                    expect($(item).css('position')).to.equal('absolute');
                    expect($(item).css('top')).to.equal(`${component.top}px`);
                    expect($(item).css('left')).to.equal(`${component.left}px`);
                    expect($(item).css('height')).to.equal(
                        `${component.height}px`
                    );
                    expect($(item).css('width')).to.equal(
                        `${component.width}px`
                    );
                    // TODO we would need a function to convert a 2D transform matrix into a rotation angle
                    // expect($(item).css('transform')).to.equal(format('rotate({0})deg', component.rotate));
                }
            });
            expect(check).to.have.callCount(count);
        });

        /* jshint +W071 */

        it('Moving an element on widget, updates top & left properties of the corresponding component in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const counter = sinon.spy();
            $.each(widget.items(), (index, item) => {
                counter();
                $(item).simulate('mousedown', { bubbles: true }); // display handles
                expect(viewModel.get('current')).to.have.property(
                    'uid',
                    $(item).attr(attr('uid'))
                ); // check selected item
                // record coordinates before dragging
                const top = viewModel.get('current.top');
                const left = viewModel.get('current.left');
                const height = viewModel.get('current.height');
                const width = viewModel.get('current.width');
                const rotate = viewModel.get('current.rotate');
                const handle = widget.wrapper.find(
                    'span.kj-handle[data-command="move"]'
                );
                // check move handle and calculate center
                expect(handle)
                    .to.be.an.instanceof($)
                    .with.property('length', 1);
                const center = findCenter(handle);
                let x = center.x;
                let y = center.y;
                const moves = 10;
                const dx = 100;
                const dy = 50;

                function drag() {
                    // initiate drag with mousedown event
                    handle.simulate('mousedown', {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    }); // initiate drag on move handle
                    // move item
                    for (let i = 0; i < moves; i++) {
                        x += dx / moves;
                        y += dy / moves;
                        $(item).simulate('mousemove', {
                            bubbles: true,
                            clientX: x,
                            clientY: y
                        });
                    }
                    // end drag with mouseup event
                    $(item).simulate('mouseup', {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    });
                }

                function check() {
                    if (kendo.support.browser.msie) {
                        // for whatever reason, on IE you get 99.999997 instead of 100
                        expect(viewModel.get('current.top')).to.be.closeTo(
                            top + dy,
                            0.001
                        );
                    } else {
                        expect(viewModel.get('current.top')).to.equal(top + dy);
                    }
                    expect(viewModel.get('current.left')).to.equal(left + dx);
                    expect(viewModel.get('current.height')).to.equal(height);
                    expect(viewModel.get('current.width')).to.equal(width);
                    expect(viewModel.get('current.rotate')).to.equal(rotate);
                }

                // Drag and check new coordinates
                // Note: making drag and check separate functions fixes jshint message `This function has too many statements.`
                drag();
                check();
            });
            expect(counter).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        it('Rotating an element on widget, updates the rotate property of the corresponding component in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const counter = sinon.spy();
            $.each(widget.items(), (index, item) => {
                counter();
                $(item).simulate('mousedown', { bubbles: true }); // display handles
                expect(viewModel.get('current')).to.have.property(
                    'uid',
                    $(item).attr(attr('uid'))
                ); // check selected item

                // record coordinates before dragging
                const top = viewModel.get('current.top');
                const left = viewModel.get('current.left');
                const height = viewModel.get('current.height');
                const width = viewModel.get('current.width');
                const rotate = viewModel.get('current.rotate');
                const handle = widget.wrapper.find(
                    'span.kj-handle[data-command="rotate"]'
                );
                // check move handle and calculate center
                expect(handle)
                    .to.be.an.instanceof($)
                    .with.property('length', 1);
                const center = findCenter(handle);
                const moves = 10;
                const dx = 50;
                const dy = 100;
                let x = center.x;
                let y = center.y;

                // Making Drag a separate function fixes jshint message `This function has too many statements.`
                function drag() {
                    // initiate drag with mousedown event
                    handle.simulate('mousedown', {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    }); // initiate drag on move handle
                    // move item
                    for (let i = 0; i < moves; i++) {
                        x += dx / moves;
                        y += dy / moves;
                        $(item).simulate('mousemove', {
                            bubbles: true,
                            clientX: x,
                            clientY: y
                        });
                    }
                    // end drag with mouseup event
                    $(item).simulate('mouseup', {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    });
                }

                function check() {
                    const c = findCenter($(item));
                    const p1 = center;
                    const p2 = { x, y };
                    const dr =
                        ((Math.atan2(p2.y - c.y, p2.x - c.x) -
                            Math.atan2(p1.y - c.y, p1.x - c.x)) *
                            180) /
                        Math.PI;
                    expect(viewModel.get('current.top')).to.equal(top);
                    expect(viewModel.get('current.left')).to.equal(left);
                    expect(viewModel.get('current.height')).to.equal(height);
                    expect(viewModel.get('current.width')).to.equal(width);
                    expect(viewModel.get('current.rotate')).not.to.equal(
                        rotate
                    );
                    // TODO: Better to recalculate the correct value instead of simply assessing change
                    // expect(viewModel.get('current.rotate')).to.equal((360 + rotate + dr) % 360);
                }

                // Drag and check new coordinates
                // Note: making drag and check separate functions fixes jshint message `This function has too many statements.`
                drag();
                check();
            });
            expect(counter).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });

        it('Resizing an element on widget, updates the top, left, height & width properties of the corresponding component in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.total()).to.equal(
                pageComponentCollectionArray.length
            );
            if (window.PHANTOMJS) {
                expect(widget.items()).to.have.property(
                    'length',
                    pageComponentCollectionArray.length
                );
            } else {
                expect(widget.items())
                    .to.be.an.instanceof(window.HTMLCollection)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
            }
            const counter = sinon.spy();
            $.each(widget.items(), (index, item) => {
                counter();
                $(item).simulate('mousedown', { bubbles: true }); // display handles
                expect(viewModel.get('current')).to.have.property(
                    'uid',
                    $(item).attr(attr('uid'))
                ); // check selected item
                // record coordinates before dragging
                const top = viewModel.get('current.top');
                const left = viewModel.get('current.left');
                const height = viewModel.get('current.height');
                const width = viewModel.get('current.width');
                const rotate = viewModel.get('current.rotate');
                const handle = widget.wrapper.find(
                    'span.kj-handle[data-command="resize"]'
                );
                // check move handle and calculate center
                expect(handle)
                    .to.be.an.instanceof($)
                    .with.property('length', 1);
                const center = findCenter(handle);
                const moves = 10;
                const dx = 80;
                const dy = 120;
                let x = center.x;
                let y = center.y;

                // Making Drag a separate function fixes jshint message `This function has too many statements.`
                function drag() {
                    // initiate drag with mousedown event
                    handle.simulate('mousedown', {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    }); // initiate drag on resize handle
                    // resize item
                    for (let i = 0; i < moves; i++) {
                        x += dx / moves;
                        y += dy / moves;
                        $(item).simulate('mousemove', {
                            bubbles: true,
                            clientX: x,
                            clientY: y
                        });
                    }
                    // end drag with mouseup event
                    $(item).simulate('mouseup', {
                        bubbles: true,
                        clientX: x,
                        clientY: y
                    });
                }

                function check() {
                    if (rotate) {
                        expect(viewModel.get('current.top')).not.to.equal(top);
                        expect(viewModel.get('current.left')).not.to.equal(
                            left
                        );
                    } else {
                        expect(viewModel.get('current.top')).to.equal(top);
                        expect(viewModel.get('current.left')).to.equal(left);
                    }
                    expect(viewModel.get('current.height')).not.to.equal(
                        height
                    );
                    expect(viewModel.get('current.width')).not.to.equal(width);
                    expect(viewModel.get('current.rotate')).to.equal(rotate);
                }

                // Drag and check new coordinates
                // Note: making drag and check separate functions fixes jshint message `This function has too many statements.`
                drag();
                check();
            });
            expect(counter).to.have.callCount(
                pageComponentCollectionArray.length
            );
        });
    });

    describe('Events', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
        });

        it('dataBinding & dataBound', () => {
            const dataBinding = sinon.spy();
            const dataBound = sinon.spy();
            widget = element
                .kendoStage({
                    dataSource: pageComponentCollectionArray,
                    dataBinding(e) {
                        dataBinding(e.sender);
                    },
                    dataBound(e) {
                        dataBound(e.sender);
                    }
                })
                .data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(dataBinding).to.have.been.calledOnce;
            expect(dataBinding).to.have.been.calledWith(widget);
            expect(dataBound).to.have.been.calledOnce;
            expect(dataBound).to.have.been.calledWith(widget);
            expect(dataBinding).to.have.been.calledBefore(dataBound);
        });

        it('propertyBinding & propertyBound', () => {
            const propertyBinding = sinon.spy();
            const propertyBound = sinon.spy();
            widget = element
                .kendoStage({
                    mode: Stage.fn.modes.play, // TODO only in play mode
                    dataSource: pageComponentCollectionArray,
                    propertyBinding(e) {
                        propertyBinding(e.sender);
                    },
                    propertyBound(e) {
                        propertyBound(e.sender);
                    }
                })
                .data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(propertyBinding).to.have.been.calledOnce;
            expect(propertyBinding).to.have.been.calledWith(widget);
            expect(propertyBound).to.have.been.calledOnce;
            expect(propertyBound).to.have.been.calledWith(widget);
            expect(propertyBinding).to.have.been.calledBefore(propertyBound);
        });

        it('change', () => {
            const change = sinon.spy();
            widget = element
                .kendoStage({
                    dataSource: pageComponentCollectionArray,
                    change(e) {
                        change(e.value);
                    }
                })
                .data('kendoStage');
            expect(widget).to.be.an.instanceof(Stage);
            expect(widget.dataSource).to.be.an.instanceof(
                PageComponentDataSource
            );
            expect(widget.dataSource.data())
                .to.be.an.instanceof(ObservableArray)
                .with.property('length', pageComponentCollectionArray.length);
            const component = widget.dataSource.at(1);
            expect(component).to.be.an.instanceof(PageComponent);
            widget.value(component);
            expect(change).to.have.been.calledOnce;
            expect(change).to.have.been.calledWith(component);
        });

        // TODO: select event
    });

    xdescribe('XSS', () => {
        // TODO: extremely important: test XSS, tool by tool
        xit('button', () => {
            // TODO text and style * 2
        });

        xit('label', () => {
            // TODO text and style
        });

        xit('image', () => {
            // TODO image and style
        });

        xit('textbox', () => {
            // TODO style
        });
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
