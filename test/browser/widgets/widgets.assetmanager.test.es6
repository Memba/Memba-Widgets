/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
import '../../../src/js/widgets/widgets.assetmanager.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    observable,
    ui: { AssetManager }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<div/>';
const ROLE = 'assetmanager';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const ASSETMANAGER2 = '<div id="assetmanager2" data-role="assetmanager"></div>';
const O_COLLECTIONS = [
    {
        name: 'Dark Grey',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/dark_grey/index.json'
        }
    },
    {
        name: 'Office',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/office/index.json'
        }
    },
    {
        name: 'White',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/white/index.json'
        }
    }
];
const V_COLLECTIONS = [
    {
        name: '32x32',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/32x32/index.json'
        }
    },
    {
        name: '64x64',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/64x64/index.json'
        }
    },
    {
        name: '128x128',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/128x128/index.json'
        }
    },
    {
        name: '256x256',
        transport: {
            read:
                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/256x256/index.json'
        }
    }
];
const EXTENSIONS = ['.gif', '.jpg', '.png', '.svg'];
const SCHEMES = {
    cdn: 'https://cdn.kidoju.com/',
    data:
        'http://localhost:63342/Kidoju.Widgets/test/data/images/miscellaneous/'
};
const TTL = 500;

describe('widgets.assetmanager', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoAssetManager).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            var element = $(ELEMENT).appendTo(FIXTURES);
            var assetManager = element.kendoAssetManager().data('kendoAssetManager');
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-assetmanager');
            expect(assetManager).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            expect(assetManager).to.have.property('dropDownList').that.is.an.instanceof(kendo.ui.DropDownList);
            expect(assetManager).to.have.property('fileBrowser').that.is.an.instanceof(jQuery);
            expect(assetManager).to.have.property('listView').that.is.an.instanceof(kendo.ui.ListView);
            expect(assetManager).to.have.property('pager').that.is.an.instanceof(kendo.ui.Pager);
            expect(assetManager).to.have.property('searchInput').that.is.an.instanceof(jQuery);
            expect(assetManager).to.have.property('tabStrip').that.is.an.instanceof(kendo.ui.TabStrip);
            expect(assetManager).to.have.property('wrapper').that.is.an.instanceof(jQuery);
            expect(assetManager.tabStrip).to.have.property('contentElements').that.is.an.instanceof(jQuery).with.property('length', 1);
            expect(assetManager.tabStrip.tabGroup.children(':nth-child(1)').text()).to.equal(assetManager.options.messages.tabs.default);
        });

        it('from code with options: collections', () => {
            let element = $(ELEMENT).appendTo(FIXTURES);
            let options = {
                collections: O_COLLECTIONS
            };
            let assetManager = element
                .kendoAssetManager(options)
                .data('kendoAssetManager');
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-assetmanager');
            expect(assetManager)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(assetManager)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(assetManager)
                .to.have.property('fileBrowser')
                .that.is.an.instanceof(jQuery);
            expect(assetManager)
                .to.have.property('listView')
                .that.is.an.instanceof(kendo.ui.ListView);
            expect(assetManager)
                .to.have.property('pager')
                .that.is.an.instanceof(kendo.ui.Pager);
            expect(assetManager)
                .to.have.property('searchInput')
                .that.is.an.instanceof(jQuery);
            expect(assetManager)
                .to.have.property('tabStrip')
                .that.is.an.instanceof(kendo.ui.TabStrip);
            expect(assetManager)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(assetManager.tabStrip)
                .to.have.property('contentElements')
                .that.is.an.instanceof(jQuery)
                .with.property('length', 4);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(1)').text()
            ).to.equal(assetManager.options.messages.tabs.default);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(2)').text()
            ).to.equal(options.collections[0].name);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(3)').text()
            ).to.equal(options.collections[1].name);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(4)').text()
            ).to.equal(options.collections[2].name);
        });

        it('from code with options: sub-collections', () => {
            let element = $(ELEMENT).appendTo(FIXTURES);
            let options = {
                collections: [
                    {
                        name: 'Collection1',
                        collections: O_COLLECTIONS
                    },
                    {
                        name: 'Collection2',
                        collections: V_COLLECTIONS
                    }
                ],
                schemes: SCHEMES
            };
            let assetManager = element
                .kendoAssetManager(options)
                .data('kendoAssetManager');
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-assetmanager');
            expect(assetManager)
                .to.have.property('dataSource')
                .that.is.an.instanceof(kendo.data.DataSource);
            expect(assetManager)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(kendo.ui.DropDownList);
            expect(assetManager)
                .to.have.property('fileBrowser')
                .that.is.an.instanceof(jQuery);
            expect(assetManager)
                .to.have.property('listView')
                .that.is.an.instanceof(kendo.ui.ListView);
            expect(assetManager)
                .to.have.property('pager')
                .that.is.an.instanceof(kendo.ui.Pager);
            expect(assetManager)
                .to.have.property('searchInput')
                .that.is.an.instanceof(jQuery);
            expect(assetManager)
                .to.have.property('tabStrip')
                .that.is.an.instanceof(kendo.ui.TabStrip);
            expect(assetManager)
                .to.have.property('wrapper')
                .that.is.an.instanceof(jQuery);
            expect(assetManager.tabStrip)
                .to.have.property('contentElements')
                .that.is.an.instanceof(jQuery)
                .with.property('length', 3);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(1)').text()
            ).to.equal(assetManager.options.messages.tabs.default);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(2)').text()
            ).to.equal(options.collections[0].name);
            expect(
                assetManager.tabStrip.tabGroup.children(':nth-child(3)').text()
            ).to.equal(options.collections[1].name);
            // expect(assetManager.tabStrip.tabGroup.children(':nth-child(4)').text()).to.equal(options.collections[2].name);
        });

        it('from markup', () => {
            var element = $(ASSETMANAGER2).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            let assetManager = element.data('kendoAssetManager');
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-assetmanager');
        });

        xit('from markup with attributes', () => {
            // TODO: AssetManager might be a bit complex to initialize with attributes...
        });

        afterEach(() => {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let assetManager;
        let options = {
            collections: [
                {
                    name: 'Collection1',
                    collections: O_COLLECTIONS
                },
                {
                    name: 'Collection2',
                    collections: V_COLLECTIONS
                }
            ],
            schemes: SCHEMES,
            transport: null
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
        });

        it('value and select', done => {
            if (window.PHANTOMJS) {
                return done(); // TODO: Does not work on Travis-CI
            }
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
            expect(assetManager.value()).to.be.undefined;
            assetManager.listView.bind('dataBound', (e) => {
                    if (assetManager.tabStrip.select().index() === 1 && assetManager.dropDownList.text() === '32x32') {
                        setTimeout(function () {
                            assetManager.select(0);
                            expect(assetManager.value()).to.equal('cdn://images/v_collection/png/32x32/3d_glasses.png');
                            assetManager.select(1);
                            expect(assetManager.value()).to.equal('cdn://images/v_collection/png/32x32/about.png');
                            assetManager.select(2);
                            expect(assetManager.value()).to.equal('cdn://images/v_collection/png/32x32/add.png');
                            done();
                        }, 0);
                    }
                });
            // Yield some time for collections to load
            setTimeout(() => {
                    assetManager.tabStrip.select(1);
                }, TTL);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        // We could also consider a search method

        it('destroy', () => {
            expect(assetManager).to.be.an.instanceof(AssetManager);
            assetManager.destroy();
            expect(assetManager.tabStrip).to.be.undefined;
            expect(assetManager.dropDownList).to.be.undefined;
            expect(assetManager.progressBar).to.be.undefined;
            expect(assetManager.searchInput).to.be.undefined;
            expect(assetManager.toolbar).to.be.undefined;
            expect(assetManager.listView).to.be.undefined;
            expect(assetManager.pager).to.be.undefined;
            expect(assetManager.fileBrowser).to.be.undefined;
            expect(assetManager.dropZone).to.be.undefined;
            expect(assetManager.dataSource).to.be.undefined;
            expect(assetManager._errorHandler).to.be.undefined;
        });

        afterEach(() => {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let assetManager;
        let viewModel;
        let change;
        let destroy;
        let options = {
            change (e) {
                var url = e.sender.value();
                if (viewModel instanceof kendo.Observable) {
                    viewModel.set('url', url);
                }
                if ($.isFunction(change)) {
                    change(url);
                }
            },
            collections: [
                {
                    name: 'Collection1',
                    collections: O_COLLECTIONS
                },
                {
                    name: 'Collection2',
                    collections: V_COLLECTIONS
                }
            ],
            extensions: EXTENSIONS,
            schemes: SCHEMES,
            transport: {
                read (options) {
                    options.success({
                        total: 3,
                        data: [
                            { url: 'data://Elvis.jpg', size: 69057 },
                            { url: 'data://France-Fleuves-1.png', size: 35886 },
                            { url: 'data://self-portrait-1907.jpg', size: 292974 }
                        ]
                    });
                },
                create (options) {
                    // Note: if there is an error, this is the place where to display notifications...
                    // options.error(new Error('Oops'));
                    if (options.data && options.data.file instanceof window.File) {
                        // Make sure we are asynchronous to simulate a file upload...
                        setTimeout(() => {
                                options.data.file = null;
                                options.data.url = 'https://cdn.kidoju.com/images/o_collection/svg/office/add.svg';
                                // VERY IMPORTANT: it won't work without total + data which are both expected
                                options.success({ total: 1, data: [options.data] });
                            }, 2 * TTL);
                    }
                },
                destroy (options) {
                    // options.error(new Error('Oops'));
                    options.success({ total: 1, data: [options.data] });
                    destroy();
                }
            }
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            assetManager = element
                .kendoAssetManager(options)
                .data('kendoAssetManager');
            viewModel = kendo.observable({ url: undefined });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        it('Click tabs', done => {
            if (window.PHANTOMJS) {
                // TODO: Does not work on Travis-CI
                return done();
            }
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
            );
            expect(assetManager.value()).to.equal('data://Elvis.jpg');
            assetManager.listView.bind('dataBound', (e) => {
                    setTimeout(function () {
                        if (assetManager.tabStrip.select().index() === 1 && assetManager.dropDownList.text() === 'Dark Grey') {
                            expect(assetManager.dataSource.at(0).id).to.equal('cdn://images/o_collection/svg/dark_grey/3d_glasses.svg');
                            expect(assetManager.dataSource.at(1).id).to.equal('cdn://images/o_collection/svg/dark_grey/about.svg');
                            expect(assetManager.dataSource.at(2).id).to.equal('cdn://images/o_collection/svg/dark_grey/add.svg');
                            done();
                        }
                    }, 0);
                });
            // Clicking a collection tab needs to be delayed until collections are loaded
            setTimeout(() => {
                    var tab = assetManager.element.find('ul.k-tabstrip-items > li.k-item:nth-child(2)');
                    tab.simulate(CLICK);
                }, TTL);
        });

        it('Change collection in drop down list', done => {
            if (window.PHANTOMJS) {
                // TODO: Does not work on Travis-CI
                return done();
            }
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
            expect(assetManager.value()).to.equal('data://Elvis.jpg');
            assetManager.dropDownList.bind('dataBound', (e) => {
                    // 2) Second, select `White` in the subcollection drop down list
                    if (e.sender.dataSource.total() > 0 && e.sender.text() !== 'White') {
                        setTimeout(function () {
                            $(e.sender.element).simulate(CLICK);
                            var list = $('.k-list-container ul.k-list');
                            var item = list.find('li:contains("White")');
                            expect(item).to.be.an.instanceof($).with.property('length', 1);
                            expect(item).to.have.text('White');
                            item.simulate(CLICK);
                        }, 0);
                    }
                });
            assetManager.listView.bind('dataBound', (e) => {
                    // 3) Third, check list view once loaded
                    if (assetManager.tabStrip.select().index() === 1 && assetManager.dropDownList.text() === 'White') {
                        setTimeout(function () {
                            expect(assetManager.dataSource.at(0).id).to.equal('cdn://images/o_collection/svg/white/3d_glasses.svg');
                            expect(assetManager.dataSource.at(1).id).to.equal('cdn://images/o_collection/svg/white/about.svg');
                            expect(assetManager.dataSource.at(2).id).to.equal('cdn://images/o_collection/svg/white/add.svg');
                            done();
                        }, TTL);
                    }
                });
            // Clicking a collection tab needs to be delayed until collections are loaded
            setTimeout(() => {
                    // 1) First, click the `Collection 1` tab
                    var tab = assetManager.element.find('ul.k-tabstrip-items > li.k-item:nth-child(2)');
                    tab.simulate(CLICK);
                }, TTL);
        });

        it('Search input', done => {
            if (window.PHANTOMJS) {
                // TODO: Does not work on Travis-CI
                return done();
            }
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.searchInput).to.be.an.instanceof($);
            expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
            );
            expect(assetManager.value()).to.equal('data://Elvis.jpg');
            assetManager.listView.bind('dataBound', (e) => {
                    if (assetManager.tabStrip.select().index() === 1 && assetManager.dropDownList.text() === 'Dark Grey') {
                        if (assetManager.searchInput.val() === '') {
                            assetManager.searchInput.val('apple');
                            // assetManager.searchInput.simulate('keydown', { keyCode: 13 });
                            assetManager.searchInput.trigger('change');
                        } else {
                            setTimeout(function () {
                                expect(assetManager.searchInput.val()).to.equal('apple');
                                // We need to check the view() because we have applied a filter to data
                                expect(assetManager.dataSource.view()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', 3);
                                expect(assetManager.dataSource.view()[0].id).to.equal('cdn://images/o_collection/svg/dark_grey/apple.svg');
                                expect(assetManager.dataSource.view()[1].id).to.equal('cdn://images/o_collection/svg/dark_grey/apple_bite.svg');
                                expect(assetManager.dataSource.view()[2].id).to.equal('cdn://images/o_collection/svg/dark_grey/pineapple.svg');
                                // TODO: Search clear (X button within input)
                                done();
                            }, TTL);
                        }
                    }
                });
            // Clicking a collection tab needs to be delayed until collections are loaded
            setTimeout(() => {
                    var tab = assetManager.element.find('ul.k-tabstrip-items > li.k-item:nth-child(2)');
                    tab.simulate(CLICK);
                }, TTL);
        });

        xit('Paging', () => {
            // TODO
        });

        it('Select items', done => {
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.searchInput).to.be.an.instanceof($);
            expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
            expect(assetManager.value()).to.equal('data://Elvis.jpg');
            assetManager.listView.bind('dataBound', (e) => {
                    // setTimeout(function () {
                    var list = $('div.k-filebrowser ul.k-tiles');
                    for (var i = 0; i < assetManager.listView.dataSource.total(); i++) {
                        var item = list.children('li.k-tile:nth-child(' + (i + 1) + ')');
                        expect(item).to.be.an.instanceof($).with.property('length', 1);
                        if (kendo.support.click === CLICK) {
                            item.simulate(CLICK);
                            // TODO: item.simulate does not work with pointerdown and pointerup (IE11 and edge) - see https://github.com/jquery/jquery-simulate/issues/37
                            // item.simulate('mousedown');
                            // item.simulate('mouseup');
                            expect(assetManager.value()).to.equal(assetManager.listView.dataSource.at(i).id);
                            expect(change).to.have.been.calledWith(assetManager.value());
                            expect(viewModel.get('url')).to.equal(assetManager.value());
                        }
                    }
                    done();
                    // }, 0);
                });
            // Make sure we hit the dataBound handler
            assetManager.listView.refresh();
        });

        xit('Upload', () => {
            // TODO: This is a tough one. How can we script the OS explorer dialog in JS to either Open or Cancel? Might be something for Zombie instead of Mocha ...
        });

        it('Delete', done => {
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            );
            expect(assetManager.searchInput).to.be.an.instanceof($);
            expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
            var doneCalled = false;
            let count = assetManager.listView.dataSource.total();
            assetManager.listView.bind('dataBound', (e) => {
                    // Without this timeout the dataBound eveneyt handler is called before teh destroy transport
                    // and we then need two clicks two delete the last item causing a mismatch in count at the end
                    setTimeout(function () {
                        var list = $('div.k-filebrowser ul.k-tiles');
                        if (assetManager.listView.dataSource.total() > 0) {
                            var deleteButton = $('button.k-button span.k-i-close').parent();
                            // expect(deleteButton).to.be.hidden;
                            expect(deleteButton).to.be.visible;
                            var item = list.children('li.k-tile:first');
                            expect(item).to.be.an.instanceof($).with.property('length', 1);
                            var src = item.find('img').attr('src');
                            var url = assetManager.value();
                            var scheme = /^(\w+):\/\//.exec(url);
                            expect(url.replace(scheme[0], options.schemes[scheme[1]])).to.equal(src);
                            if (kendo.support.click === CLICK) {
                                item.simulate(CLICK);
                                // TODO: item.simulate does not work with pointerdown and pointerup (IE11 and edge) - see https://github.com/jquery/jquery-simulate/issues/37
                                // item.simulate('mousedown');
                                // item.simulate('mouseup');
                                expect(url).to.equal(assetManager.listView.dataSource.at(0).id);
                                expect(deleteButton).to.be.visible;
                                setTimeout(function () {
                                    deleteButton.simulate(CLICK);
                                }, 0);
                                // Deleting a dataSource item causes a refresh which triggers the dataBound event
                                // so we are deleting all items until dataSource.total() === 0
                                // but to avoid nesting delete events into delete events we need to call setTimout to trigger the next delete event on its own timer
                            } else {
                                done(); // This is for IE and edge
                            }
                        } else if (assetManager.listView.dataSource.total() === 0) {
                            // If not added to the timer queue, this is executed before the last delete and misses one count
                            setTimeout(function () {
                                expect(destroy).to.have.callCount(count);
                                if (!doneCalled) {
                                    done();
                                    doneCalled = true;
                                }
                            }, 0);
                        }
                    }, 0);
                });
            // Make sure we hit the dataBound handler
            assetManager.listView.refresh();
        });

        afterEach(() => {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Events', () => {
        let element;
        let assetManager;
        let change;
        let error;
        const OOPS = 'Oops!';
        let options = {
            change (e) {
                let url = e.sender.value();
                if ($.isFunction(change)) {
                    change(url);
                }
            },
            error (e) {
                error(e.xhr.message);
            },
            extensions: EXTENSIONS,
            schemes: SCHEMES,
            transport: {
                read (options) {
                    options.success({
                        total: 3,
                        data: [
                            { url: 'data://Elvis.jpg', size: 69057 },
                            { url: 'data://France-Fleuves-1.png', size: 35886 },
                            { url: 'data://self-portrait-1907.jpg', size: 292974 }
                        ]
                    });
                },
                create (options) {
                    // Note: if there is an error, this is the place where to display notifications...
                    // options.error(new Error('Oops'));
                    if (options.data && options.data.file instanceof window.File) {
                        // Make sure we are asynchronous to simulate a file upload...
                        setTimeout(() => {
                                options.data.file = null;
                                options.data.url = 'https://cdn.kidoju.com/images/o_collection/svg/office/add.svg';
                                // VERY IMPORTANT: it won't work without total + data which are both expected
                                options.success({ total: 1, data: [options.data] });
                            }, 2 * TTL);
                    }
                },
                destroy (options) {
                    options.error(new Error(OOPS));
                }
            }
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
            change = sinon.spy();
            error = sinon.spy();
        });

        it('Change event', done => {
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.value()).to.equal('data://Elvis.jpg');
            assetManager.listView.bind('dataBound', (e) => {
                    assetManager.select(0);
                    expect(assetManager.value()).to.equal(assetManager.dataSource.at(0).id);
                    expect(change).to.have.been.calledWith(assetManager.value());
                    done();
                });
            // Make sure we hit the dataBound handler
            assetManager.listView.refresh();
        });

        it('Error event', done => {
            expect(assetManager).to.be.an.instanceof(AssetManager);
            expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
            expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
            expect(assetManager.value()).to.equal('data://Elvis.jpg');
            assetManager.listView.bind('dataBound', (e) => {
                    if (error.callCount > 0) {
                        expect(error).to.have.been.calledWith(OOPS);
                        done();
                    }
                });
            assetManager.dataSource.remove(assetManager.dataSource.at(0));
            assetManager.dataSource.sync();
        });

        afterEach(() => {
            let fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });
});
