/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var Social = ui.Social;
    var COMMAND = {
        CLASSROOM: 'classroom',
        FACEBOOK: 'facebook',
        GOOGLE: 'google',
        LINKEDIN: 'linkedin',
        PINTEREST: 'pinterest',
        TWITTER: 'twitter'
    };
    var LENGTH = Object.keys(COMMAND).length;
    var META_TAG = '<meta property="{0}" content="{1}" />';
    var FIXTURES = '#fixtures';
    var SOCIAL1 = '<div></div>';
    var SOCIAL2 = '<div data-role="social">';
    var SIZE = 64;
    var LANGUAGE = 'fr';
    var TITLE = 'A sample title';
    var DESCRIPTION = 'A sample description';
    var URL = 'http://www.example.com';
    var IMAGE = 'https://avatars0.githubusercontent.com/u/12049626?v=3&s=400';
    var SOURCE = 'example';
    var FACEBOOK_APPID = '9876543210';
    var TWITTER_ACCOUNT = 'example';

    describe('kidoju.widgets.social', function () {

        before(function () {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function () {

            it('requirements', function () {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect($.fn.kendoSocial).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code with all options', function () {
                var element = $(SOCIAL1).appendTo(FIXTURES);
                expect(element).to.match('div');
                var social = element.kendoSocial({
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
                }).data('kendoSocial');
                expect(social).to.be.an.instanceof(Social);
                var wrapper = social.wrapper;
                expect(wrapper).to.be.an.instanceof($);
                expect(wrapper).not.to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-social');
                expect(wrapper.find('a[role="button"]')).to.be.an.instanceof($).with.property('length', LENGTH);
                expect(wrapper.find('svg')).to.be.an.instanceof($).with.property('length', LENGTH - 1);
                var options = social.options;
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

            it('from code with minimal options', function () {
                var element =  $(SOCIAL1).appendTo(FIXTURES);
                expect(element).to.match('div');
                var social = element.kendoSocial({
                }).data('kendoSocial');
                expect(social).to.be.an.instanceof(Social);
                var wrapper = social.wrapper;
                expect(wrapper).to.be.an.instanceof($);
                expect(wrapper).not.to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-social');
                expect(wrapper.find('a[role="button"]')).to.be.an.instanceof($).with.property('length', LENGTH);
                expect(wrapper.find('svg')).to.be.an.instanceof($).with.property('length', LENGTH - 1);
                var options = social.options;
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

            it('from markup with meta properties', function () {
                // Set metatags
                $('html').attr('lang', LANGUAGE);
                $('head')
                    .append(kendo.format(META_TAG, 'fb:app_id', FACEBOOK_APPID))
                    .append(kendo.format(META_TAG, 'og:description', DESCRIPTION))
                    .append(kendo.format(META_TAG, 'og:image', IMAGE))
                    .append(kendo.format(META_TAG, 'og:site_name', SOURCE))
                    .append(kendo.format(META_TAG, 'og:title', TITLE))
                    .append(kendo.format(META_TAG, 'og:url', URL))
                    .append(kendo.format(META_TAG, 'twitter:site', TWITTER_ACCOUNT));
                // Init and test widget
                var element = $(SOCIAL2).attr(kendo.attr('size'), SIZE).appendTo(FIXTURES);
                expect(element).to.match('div');
                kendo.init(FIXTURES);
                var social = element.data('kendoSocial');
                expect(social).to.be.an.instanceof(Social);
                var wrapper = social.wrapper;
                expect(wrapper).to.be.an.instanceof($);
                expect(wrapper).not.to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-social');
                expect(wrapper.find('a[role="button"]')).to.be.an.instanceof($).with.property('length', LENGTH);
                expect(wrapper.find('svg')).to.be.an.instanceof($).with.property('length', LENGTH - 1);
                var options = social.options;
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

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.unbind(fixtures);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Methods', function () {

            var element;
            var social;

            beforeEach(function () {
                element = $(SOCIAL1).appendTo(FIXTURES);
                social = element.kendoSocial().data('kendoSocial');
            });

            it('enable/readonly', function () {
                expect(social).to.be.an.instanceof(Social);
                expect(social.wrapper).to.be.an.instanceof($).with.property('length', 1);
                social.enable(false);
                expect(social.wrapper).to.have.class('k-state-disabled');
                social.enable(true);
                expect(social.wrapper).not.to.have.class('k-state-disabled');
            });

            // it('visible', function () {
            // expect(social).to.be.an.instanceof(Social);
            // expect(social.wrapper).to.be.an.instanceof($).with.property('length', 1);
            // TODO
            // });

            // it('destroy', function () {
            // TODO
            // });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.unbind(fixtures);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        // describe('MVVM', function () {
        // });

        describe('UI Interactions', function () {

            var element;
            var social;

            function test(command) {
                expect(social).to.be.an.instanceof(Social);
                var wrapper = social.wrapper;
                expect(wrapper).to.be.an.instanceof($);
                var button = social.wrapper.find('a[role="button"][data-command="' + command + '"]');
                expect(button).to.be.an.instanceof($).with.property('length', 1);
                expect(social._window).to.be.null;
                button.simulate('click');
                // expect(social._window).to.be.an.instanceof(Window); // <-- does not work in Chrome
                // expect(social._window.constructor.name).to.equal('Window'); // <-- does not work in PhantomJS
                // expect(social._window).to.be.an('object'); // <-- does not work in Chrome
                expect(social._window).not.to.be.null;
                expect(social._window).not.to.be.undefined;
                expect(social._window.close).to.be.a('function');
                var rx = new RegExp('^https://(www.|plus.|)' + command + '.com/');
                expect(social._url).to.match(rx);
                // TODO: there is more we could to to test the url
            }

            beforeEach(function () {
                element = $(SOCIAL1).appendTo(FIXTURES);
                social = element.kendoSocial().data('kendoSocial');
            });

            it('click facebook', function () {
                test(COMMAND.FACEBOOK);
            });

            it('click google', function () {
                test(COMMAND.GOOGLE);
            });

            it('click linkedin', function () {
                test(COMMAND.LINKEDIN);
            });

            it('click pinterest', function () {
                test(COMMAND.PINTEREST);
            });

            it('click twitter', function () {
                test(COMMAND.TWITTER);
            });

            afterEach(function () {
                if (social && social._window && $.isFunction(social._window.close)) {
                    social._window.close();
                }
                var fixtures = $(FIXTURES);
                kendo.unbind(fixtures);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        // describe('Events', function () {
        // });

    });

}(this, jQuery));
