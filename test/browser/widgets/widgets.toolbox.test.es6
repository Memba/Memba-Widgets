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
import '../../../src/js/widgets/widgets.toolbox.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource, ObservableObject },
    destroy,
    init,
    observable,
    ui: { ToolBox }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'toolbox';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const kidoju = window.kidoju;
const CLICK = 'click';
const ICON_PATH = '../../src/styles/images/';
const TOOLBOX2 = `<div id="toolbox2" data-role="widget" data-size="48" data-icon-path="${ICON_PATH}"></div>`;

describe('widgets.toolbox', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoToolBox).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element
                .kendoToolBox({ iconPath: ICON_PATH })
                .data('kendoToolBox');
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(element.hasClass('k-widget')).to.be.true;
            expect(element.hasClass(`kj-${ROLE}`)).to.be.true;
            expect(element.find('a.kj-tool'))
                .to.be.an.instanceof($)
                .with.property('length')
                .that.is.gte(1);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').width()) / 10
            ).to.equal(32);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').height()) / 10
            ).to.equal(32);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element
                .kendoToolBox({ iconPath: ICON_PATH, size: 64 })
                .data('kendoToolBox');
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(element.hasClass('k-widget')).to.be.true;
            expect(element.hasClass(`kj-${ROLE}`)).to.be.true;
            expect(element.find('a.kj-tool'))
                .to.be.an.instanceof($)
                .with.property('length')
                .that.is.gte(1);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').width()) / 10
            ).to.equal(64);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').height()) / 10
            ).to.equal(64);
        });

        it('from markup', () => {
            const element = $(TOOLBOX2).appendTo(FIXTURES);
            init(FIXTURES);
            const widget = element.data('kendoToolBox');
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(element.hasClass('k-widget')).to.be.true;
            expect(element.hasClass(`kj-${ROLE}`)).to.be.true;
            expect(element.find('a.kj-tool'))
                .to.be.an.instanceof($)
                .with.property('length')
                .that.is.gte(1);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').width()) / 10
            ).to.equal(48);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').height()) / 10
            ).to.equal(48);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoToolBox({ iconPath: ICON_PATH })
                .data('kendoToolBox');
        });

        it('Set/Get the current tool with valid values', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(kidoju.tools)
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            expect(widget.tool()).to.equal('pointer');
            widget.tool('label');
            expect(widget.tool()).to.equal('label');
            expect(kidoju.tools).to.have.property('active', 'label');
            widget.tool('textbox');
            expect(widget.tool()).to.equal('textbox');
            expect(kidoju.tools).to.have.property('active', 'textbox');
        });

        it('Set/Get the current tool with invalid values', () => {
            function fn1() {
                widget.tool(0);
            }
            function fn2() {
                widget.tool('dummy');
            }
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        it('Reset', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.tool('label');
            expect(kidoju.tools).to.have.property('active', 'label');
            widget.reset();
            expect(kidoju.tools).to.have.property('active', 'pointer');
            widget.tool('textbox');
            expect(kidoju.tools).to.have.property('active', 'textbox');
            widget.reset();
            expect(kidoju.tools).to.have.property('active', 'pointer');
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoToolBox({ iconPath: ICON_PATH })
                .data('kendoToolBox');
        });

        it('A change of tool raises a change in the widget', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(kidoju.tools)
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            expect(widget.tool()).to.equal('pointer');
            kidoju.tools.set('active', 'label');
            expect(widget.tool()).to.equal('label');
            expect(
                element.find('a.k-state-selected').attr(attr('tool'))
            ).to.equal('label');
        });

        it('A selection in the widget raises a change of tool', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(kidoju.tools)
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            expect(widget.tool()).to.equal('pointer');
            element.find('[data-tool="label"]').simulate(CLICK);
            expect(kidoju.tools.get('active')).to.equal('label');
            expect(widget.tool()).to.equal('label');
            expect(
                element.find('a.k-state-selected').attr(attr('tool'))
            ).to.equal('label');
        });
    });

    describe('Events', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoToolBox({ iconPath: ICON_PATH })
                .data('kendoToolBox');
        });

        it('Change event', () => {
            const change = sinon.spy();
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(kidoju.tools)
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            widget.bind('change', e => {
                change(e.value);
            });
            widget.tool('label');
            expect(change).to.have.been.calledWith('label');
        });

        it('Click event', () => {
            const click = sinon.spy();
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(kidoju.tools)
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            widget.bind('click', e => {
                click(e.value);
            });
            element.find('a[data-tool=textbox]').simulate('click');
            expect(click).to.have.been.calledWith('textbox');
        });
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
