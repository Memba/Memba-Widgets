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
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import tools from '../../../src/js/tools/tools.es6';
import '../../../src/js/widgets/widgets.toolbox.es6';
import fixKendoRoles from '../_misc/test.roles.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    // bind,
    data: { ObservableObject },
    destroy,
    init,
    ui,
    ui: { ToolBox }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'toolbox';
const ICON_PATH = '../../src/styles/images/';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.toolbox', () => {
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
            expect($.fn.kendoToolBox).to.be.a(CONSTANTS.FUNCTION);
            expect(ui.roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = { iconPath: ICON_PATH };
            const widget = element.kendoToolBox(options).data('kendoToolBox');
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
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
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                iconPath: ICON_PATH,
                size: 64
            };
            const widget = element.kendoToolBox(options).data('kendoToolBox');
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.kj-tool'))
                .to.be.an.instanceof($)
                .with.property('length')
                .that.is.gte(1);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').width()) / 10
            ).to.equal(options.size);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').height()) / 10
            ).to.equal(options.size);
        });

        it('from markup with attributes', () => {
            const attributes = {
                'data-icon-path': ICON_PATH,
                'data-size': 48
            };
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoToolBox');
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            expect(element.find('a.kj-tool'))
                .to.be.an.instanceof($)
                .with.property('length')
                .that.is.gte(1);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').width()) / 10
            ).to.equal(attributes['data-size']);
            expect(
                Math.round(10 * element.find('a.kj-tool > img').height()) / 10
            ).to.equal(attributes['data-size']);
        });
    });

    describe('Methods', () => {
        let element;
        let options;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = { iconPath: ICON_PATH };
            widget = element.kendoToolBox(options).data('kendoToolBox');
        });

        it('Set/Get the current tool with valid values', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(widget.value()).to.equal('pointer');
            expect(tools).to.have.property('active', 'pointer');
            widget.value('label');
            expect(widget.value()).to.equal('label');
            expect(tools).to.have.property('active', 'label');
            widget.value('textbox');
            expect(widget.value()).to.equal('textbox');
            expect(tools).to.have.property('active', 'textbox');
        });

        it('Set/Get the current tool with invalid values', () => {
            function fn1() {
                widget.value(JSC.integer()());
            }
            function fn2() {
                widget.value(JSC.string()());
            }
            expect(widget).to.be.an.instanceof(ToolBox);
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(RangeError);
        });

        it('Reset', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.value('label');
            expect(tools).to.have.property('active', 'label');
            widget.reset();
            expect(tools).to.have.property('active', 'pointer');
            widget.value('textbox');
            expect(tools).to.have.property('active', 'textbox');
            widget.reset();
            expect(tools).to.have.property('active', 'pointer');
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let options;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = { iconPath: ICON_PATH };
            widget = element.kendoToolBox(options).data('kendoToolBox');
        });

        it('A change of tool updates the widget UI', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(tools())
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            expect(widget.value()).to.equal('pointer');
            tools.active = 'label';
            expect(widget.value()).to.equal('label');
            expect(
                element.find('a.k-state-selected').attr(attr('tool'))
            ).to.equal('label');
            // expect(change).to.have.been.calledOnce;
        });

        it('A selection in the widget updates the data', () => {
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(tools())
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            expect(widget.value()).to.equal('pointer');
            element.find('[data-tool="label"]').simulate(CONSTANTS.CLICK);
            expect(widget.value()).to.equal('label');
            expect(tools).to.have.property('active', 'label');
            expect(
                element.find('a.k-state-selected').attr(attr('tool'))
            ).to.equal('label');
        });
    });

    describe('Events', () => {
        let element;
        let options;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = { iconPath: ICON_PATH };
            widget = element.kendoToolBox(options).data('kendoToolBox');
        });

        it('Change event', () => {
            const change = sinon.spy();
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(tools())
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            tools().bind(CONSTANTS.CHANGE, e => {
                change(e.value);
            });
            element.find('a[data-tool=label]').simulate(CONSTANTS.CLICK);
            expect(change).to.have.been.calledOnce;
        });

        it('Click event', () => {
            const click = sinon.spy();
            expect(widget).to.be.an.instanceof(ToolBox);
            widget.reset();
            expect(tools())
                .to.be.an.instanceof(ObservableObject)
                .with.property('active', 'pointer');
            widget.bind(CONSTANTS.CLICK, e => {
                click(e.value);
            });
            element.find('a[data-tool=textbox]').simulate(CONSTANTS.CLICK);
            expect(click).to.have.been.calledWith('textbox');
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
