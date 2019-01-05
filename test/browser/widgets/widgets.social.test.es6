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
import '../../../src/js/widgets/widgets.social.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource, ObservableArray },
    destroy,
    format,
    init,
    observable,
    ui: { Social }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'social';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const ACTION = {
    CLASSROOM: 'classroom',
    FACEBOOK: 'facebook',
    GOOGLE: 'google',
    LINKEDIN: 'linkedin',
    PINTEREST: 'pinterest',
    TWITTER: 'twitter'
};
const LENGTH = Object.keys(ACTION).length;
const META_TAG = '<meta property="{0}" content="{1}" />';
const SIZE = 64;
const LANGUAGE = 'fr';
const TITLE = 'A sample title';
const DESCRIPTION = 'A sample description';
const URL = 'http://www.example.com';
const IMAGE = 'https://avatars0.githubusercontent.com/u/12049626?v=3&s=400';
const SOURCE = 'example';
const FACEBOOK_APPID = '9876543210';
const TWITTER_ACCOUNT = 'example';

describe('widgets.social', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoSocial).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code with all options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            expect(element).to.match('div');
            const widget = element
                .kendoSocial({
                    description: DESCRIPTION,
                    disabled: false,
                    facebookAppId: FACEBOOK_APPID,
                    image: IMAGE,
                    language: LANGUAGE,
                    size: SIZE,
                    source: SOURCE,
                    title: TITLE,
                    twitterAccount: TWITTER_ACCOUNT,
                    url: URL
                })
                .data('kendoSocial');
            expect(widget).to.be.an.instanceof(Social);
            const wrapper = widget.wrapper;
            expect(wrapper).to.be.an.instanceof($);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
            expect(wrapper.find('a[role="button"]'))
                .to.be.an.instanceof($)
                .with.property('length', LENGTH);
            expect(wrapper.find('svg'))
                .to.be.an.instanceof($)
                .with.property('length', LENGTH - 1);
            const options = widget.options;
            expect(options.description).to.equal(DESCRIPTION);
            expect(options.disabled).to.be.false;
            expect(options.facebookAppId).to.equal(FACEBOOK_APPID);
            expect(options.image).to.equal(IMAGE);
            expect(options.language).to.equal(LANGUAGE);
            expect(options.size).to.equal(SIZE);
            expect(options.source).to.equal(SOURCE);
            expect(options.title).to.equal(TITLE);
            expect(options.twitterAccount).to.equal(TWITTER_ACCOUNT);
            expect(options.url).to.equal(URL);
        });

        it('from code with minimal options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            expect(element).to.match('div');
            const widget = element.kendoSocial({}).data('kendoSocial');
            expect(widget).to.be.an.instanceof(Social);
            const wrapper = widget.wrapper;
            expect(wrapper).to.be.an.instanceof($);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
            expect(wrapper.find('a[role="button"]'))
                .to.be.an.instanceof($)
                .with.property('length', LENGTH);
            expect(wrapper.find('svg'))
                .to.be.an.instanceof($)
                .with.property('length', LENGTH - 1);
            const options = widget.options;
            expect(options.description).to.be.undefined;
            expect(options.disabled).to.be.false;
            expect(options.facebookAppId).to.be.undefined;
            expect(options.image).to.be.undefined;
            expect(options.language).to.equal('en');
            expect(options.size).to.equal(32);
            expect(options.source).to.be.undefined;
            expect(options.title).to.equal($('head>title').text());
            expect(options.twitterAccount).to.be.undefined;
            expect(options.url).to.equal(window.location.href);
        });

        it('from markup with meta properties', () => {
            // Set metatags
            $('html').attr('lang', LANGUAGE);
            $('head')
                .append(format(META_TAG, 'fb:app_id', FACEBOOK_APPID))
                .append(format(META_TAG, 'og:description', DESCRIPTION))
                .append(format(META_TAG, 'og:image', IMAGE))
                .append(format(META_TAG, 'og:site_name', SOURCE))
                .append(format(META_TAG, 'og:title', TITLE))
                .append(format(META_TAG, 'og:url', URL))
                .append(
                    format(META_TAG, 'twitter:site', TWITTER_ACCOUNT)
                );
            // Init and test widget
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attr('size'), SIZE)
                .appendTo(FIXTURES);
            expect(element).to.match('div');
            init(FIXTURES);
            const widget = element.data('kendoSocial');
            expect(widget).to.be.an.instanceof(Social);
            const wrapper = widget.wrapper;
            expect(wrapper).to.be.an.instanceof($);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
            expect(wrapper.find('a[role="button"]'))
                .to.be.an.instanceof($)
                .with.property('length', LENGTH);
            expect(wrapper.find('svg'))
                .to.be.an.instanceof($)
                .with.property('length', LENGTH - 1);
            const options = widget.options;
            expect(options.description).to.equal(DESCRIPTION);
            expect(options.disabled).to.be.false;
            expect(options.facebookAppId).to.equal(FACEBOOK_APPID);
            expect(options.image).to.equal(IMAGE);
            expect(options.language).to.equal(LANGUAGE);
            expect(options.size).to.equal(SIZE);
            expect(options.source).to.equal(SOURCE);
            expect(options.title).to.equal(TITLE);
            expect(options.twitterAccount).to.equal(TWITTER_ACCOUNT);
            expect(options.url).to.equal(URL);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoSocial().data('kendoSocial');
        });

        it('enable/readonly', () => {
            expect(widget).to.be.an.instanceof(Social);
            expect(widget.wrapper)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            widget.enable(false);
            expect(widget.wrapper).to.have.class('k-state-disabled');
            widget.enable(true);
            expect(widget.wrapper).not.to.have.class('k-state-disabled');
        });

        // it('visible', function () {
        // expect(widget).to.be.an.instanceof(Social);
        // expect(widget.wrapper).to.be.an.instanceof($).with.property('length', 1);
        // TODO
        // });

        // it('destroy', function () {
        // TODO
        // });
    });

    // describe('MVVM', function () {
    // });

    describe('UI Interactions', () => {
        let element;
        let widget;

        function test(command) {
            expect(widget).to.be.an.instanceof(Social);
            const wrapper = widget.wrapper;
            expect(wrapper).to.be.an.instanceof($);
            const button = widget.wrapper.find(
                `a[role="button"][data-command="${command}"]`
            );
            expect(button)
                .to.be.an.instanceof($)
                .with.property('length', 1);
            expect(widget._window).to.be.null;
            button.simulate('click');
            // expect(widget._window).to.be.an.instanceof(Window); // <-- does not work in Chrome
            // expect(widget._window.constructor.name).to.equal('Window'); // <-- does not work in PhantomJS
            // expect(widget._window).to.be.an('object'); // <-- does not work in Chrome
            expect(widget._window).not.to.be.null;
            expect(widget._window).not.to.be.undefined;
            expect(widget._window.close).to.be.a('function');
            const rx = new RegExp(`^https://(www.|plus.|)${command}.com/`);
            expect(widget._url).to.match(rx);
            // TODO: there is more we could to to test the url
        }

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoSocial().data('kendoSocial');
        });

        it('click facebook', () => {
            test(ACTION.FACEBOOK);
        });

        it('click google', () => {
            test(ACTION.GOOGLE);
        });

        it('click linkedin', () => {
            test(ACTION.LINKEDIN);
        });

        it('click pinterest', () => {
            test(ACTION.PINTEREST);
        });

        it('click twitter', () => {
            test(ACTION.TWITTER);
        });

        afterEach(() => {
            if (
                widget &&
                widget._window &&
                $.isFunction(widget._window.close)
            ) {
                widget._window.close();
            }
        });
    });

    // describe('Events', function () {
    // });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        // unbind(fixtures);
        destroy(fixtures);
        // fixtures.find('*').off();
        fixtures.empty();
    });
});
