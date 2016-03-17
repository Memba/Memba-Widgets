/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var AssetManager = ui.AssetManager;
    var CLICK = 'click';
    var FIXTURES = '#fixtures';
    var ASSETMANAGER1 = '<div id="assetmanager1"></div>';
    var ASSETMANAGER2 = '<div id="assetmanager2" data-role="assetmanager"></div>';
    var O_COLLECTIONS = [
        {
            name: 'Dark Grey',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/dark_grey/index.json'
            }
        },
        {
            name: 'Office',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/office/index.json'
            }
        },
        {
            name: 'White',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/white/index.json'
            }
        }
    ];
    var V_COLLECTIONS = [
        {
            name: '32x32',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/32x32/index.json'
            }
        },
        {
            name: '64x64',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/64x64/index.json'
            }
        },
        {
            name: '128x128',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/128x128/index.json'
            }
        },
        {
            name: '256x256',
            transport: {
                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/256x256/index.json'
            }
        }
    ];
    var EXTENSIONS = ['.gif', '.jpg', '.png', '.svg'];
    var SCHEMES = {
        cdn: 'https://cdn.kidoju.com/',
        data: 'http://localhost:63342/Kidoju.Widgets/test/data/images/miscellaneous/'
    };
    var TTL = 500;

    describe('kidoju.widgets.assetmanager', function () {

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
                expect($.fn.kendoAssetManager).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(ASSETMANAGER1).appendTo(FIXTURES);
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

            it('from code with options: collections', function () {
                var element = $(ASSETMANAGER1).appendTo(FIXTURES);
                var options = {
                    collections: O_COLLECTIONS
                };
                var assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
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
                expect(assetManager.tabStrip).to.have.property('contentElements').that.is.an.instanceof(jQuery).with.property('length', 4);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(1)').text()).to.equal(assetManager.options.messages.tabs.default);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(2)').text()).to.equal(options.collections[0].name);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(3)').text()).to.equal(options.collections[1].name);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(4)').text()).to.equal(options.collections[2].name);
            });

            it('from code with options: sub-collections', function () {
                var element = $(ASSETMANAGER1).appendTo(FIXTURES);
                var options = {
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
                var assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
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
                expect(assetManager.tabStrip).to.have.property('contentElements').that.is.an.instanceof(jQuery).with.property('length', 3);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(1)').text()).to.equal(assetManager.options.messages.tabs.default);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(2)').text()).to.equal(options.collections[0].name);
                expect(assetManager.tabStrip.tabGroup.children(':nth-child(3)').text()).to.equal(options.collections[1].name);
                // expect(assetManager.tabStrip.tabGroup.children(':nth-child(4)').text()).to.equal(options.collections[2].name);
            });

            it('from markup', function () {
                var element = $(ASSETMANAGER2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var assetManager = element.data('kendoAssetManager');
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-assetmanager');
            });

            xit('from markup with attributes', function () {
                // TODO: AssetManager might be a bit complex to initialize with attributes...
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Methods', function () {

            var element;
            var assetManager;
            var options = {
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

            beforeEach(function () {
                element = $(ASSETMANAGER1).appendTo(FIXTURES);
                assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
            });

            it('value and select', function (done) {
                if (window.PHANTOMJS) {
                    // TODO: Does not work on Travis-CI
                    return done();
                }
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
                expect(assetManager.value()).to.be.undefined;
                assetManager.listView.bind('dataBound', function (e) {
                    if (assetManager.dropDownList.text() === 'Dark Grey') {
                        setTimeout(function () {
                            assetManager.select(0);
                            expect(assetManager.value()).to.equal('cdn://images/o_collection/svg/dark_grey/3d_glasses.svg');
                            assetManager.select(1);
                            expect(assetManager.value()).to.equal('cdn://images/o_collection/svg/dark_grey/about.svg');
                            assetManager.select(2);
                            expect(assetManager.value()).to.equal('cdn://images/o_collection/svg/dark_grey/add.svg');
                            done();
                        }, TTL);
                    }
                });
                // Yield some time for collections to load
                setTimeout(function () {
                    assetManager.tabStrip.select(1);
                }, TTL);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            // We could also consider a search method

            it('destroy', function () {
                expect(assetManager).to.be.an.instanceof(AssetManager);
                assetManager.destroy();
                expect(assetManager.element).to.be.empty;
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions)', function () {

            var element;
            var assetManager;
            var viewModel;
            var change;
            var destroy;
            var options = {
                change: function (e) {
                    var url = e.sender.value();
                    viewModel.set('url', url);
                    change(url);
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
                    read: function (options) {
                        options.success({
                            total: 3,
                            data: [
                                { url: 'data://Elvis.jpg', size: 69057 },
                                { url: 'data://France-Fleuves-1.png', size: 35886 },
                                { url: 'data://self-portrait-1907.jpg', size: 292974 }
                            ]
                        });
                    },
                    create: function (options) {
                        // Note: if there is an error, this is the place where to display notifications...
                        // options.error(new Error('Oops'));
                        if (options.data && options.data.file instanceof window.File) {
                            // Make sure we are asynchronous to simulate a file upload...
                            setTimeout(function () {
                                options.data.file = null;
                                options.data.url = 'https://cdn.kidoju.com/images/o_collection/svg/office/add.svg';
                                // VERY IMPORTANT: it won't work without total + data which are both expected
                                options.success({ total: 1, data: [options.data] });
                            }, 2 * TTL);
                        }
                    },
                    destroy: function (options) {
                        // options.error(new Error('Oops'));
                        options.success({ total: 1, data: [options.data] });
                        destroy();
                    }
                }
            };

            beforeEach(function () {
                element = $(ASSETMANAGER1).appendTo(FIXTURES);
                assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
                viewModel = kendo.observable({ url: undefined });
                change = sinon.spy();
                destroy = sinon.spy();
            });

            it('Click tabs', function (done) {
                if (window.PHANTOMJS) {
                    // TODO: Does not work on Travis-CI
                    return done();
                }
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
                expect(assetManager.value()).to.be.undefined;
                assetManager.listView.bind('dataBound', function (e) {
                    setTimeout(function () {
                        if (assetManager.dropDownList.text() === 'Dark Grey') {
                            expect(assetManager.dataSource.at(0).id).to.equal('cdn://images/o_collection/svg/dark_grey/3d_glasses.svg');
                            expect(assetManager.dataSource.at(1).id).to.equal('cdn://images/o_collection/svg/dark_grey/about.svg');
                            expect(assetManager.dataSource.at(2).id).to.equal('cdn://images/o_collection/svg/dark_grey/add.svg');
                            done();
                        }
                    }, 0);
                });
                // Clicking a collection tab needs to be delayed until collections are loaded
                setTimeout(function () {
                    var tab = assetManager.element.find('ul.k-tabstrip-items > li.k-item:nth-child(2)');
                    tab.simulate(CLICK);
                }, TTL);
            });

            it('Change collection in drop down list', function (done) {
                if (window.PHANTOMJS) {
                    // TODO: Does not work on Travis-CI
                    return done();
                }
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
                expect(assetManager.value()).to.be.undefined;
                assetManager.dropDownList.bind('dataBound', function (e) {
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
                assetManager.listView.bind('dataBound', function (e) {
                    // 3) Third, check list view once loaded
                    if (assetManager.dropDownList.text() === 'White') {
                        setTimeout(function () {
                            expect(assetManager.dataSource.at(0).id).to.equal('cdn://images/o_collection/svg/white/3d_glasses.svg');
                            expect(assetManager.dataSource.at(1).id).to.equal('cdn://images/o_collection/svg/white/about.svg');
                            expect(assetManager.dataSource.at(2).id).to.equal('cdn://images/o_collection/svg/white/add.svg');
                            done();
                        }, TTL);
                    }
                });
                // Clicking a collection tab needs to be delayed until collections are loaded
                setTimeout(function () {
                    // 1) First, click the `Collection 1` tab
                    var tab = assetManager.element.find('ul.k-tabstrip-items > li.k-item:nth-child(2)');
                    tab.simulate(CLICK);
                }, TTL);
            });

            it('Search input', function (done) {
                if (window.PHANTOMJS) {
                    // TODO: Does not work on Travis-CI
                    return done();
                }
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.searchInput).to.be.an.instanceof($);
                expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
                expect(assetManager.value()).to.be.undefined;
                assetManager.listView.bind('dataBound', function (e) {
                    if (assetManager.dropDownList.text() === 'Dark Grey') {
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
                setTimeout(function () {
                    var tab = assetManager.element.find('ul.k-tabstrip-items > li.k-item:nth-child(2)');
                    tab.simulate(CLICK);
                }, TTL);
            });

            xit('Paging', function () {
                // TODO
            });

            it('Select items', function (done) {
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.searchInput).to.be.an.instanceof($);
                expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
                expect(assetManager.value()).to.be.undefined;
                assetManager.listView.bind('dataBound', function (e) {
                    // setTimeout(function () {
                    var list = $('div.k-filebrowser ul.k-tiles');
                    for (var i = 0; i < assetManager.listView.dataSource.total(); i++) {
                        var item = list.children('li.k-tile:nth-child(' + (i + 1) + ')');
                        expect(item).to.be.an.instanceof($).with.property('length', 1);
                        if (kendo.support.click === 'click') {
                            item.simulate('click');
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

            xit('Upload', function () {
                // TODO: This is a tough one. How can we script the OS explorer dialog in JS to either Open or Cancel? Might be something for Zombie instead of Mocha ...
            });

            it('Delete', function (done) {
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.searchInput).to.be.an.instanceof($);
                expect(assetManager.tabStrip).to.be.an.instanceof(kendo.ui.TabStrip);
                var doneCalled = false;
                var count = assetManager.listView.dataSource.total();
                assetManager.listView.bind('dataBound', function (e) {
                    var list = $('div.k-filebrowser ul.k-tiles');
                    if (assetManager.listView.dataSource.total() > 0) {
                        var deleteButton = $('button.k-button span.k-delete').parent();
                        expect(deleteButton).to.be.hidden;
                        var item = list.children('li.k-tile:first');
                        expect(item).to.be.an.instanceof($).with.property('length', 1);
                        expect(assetManager.value()).to.be.undefined;
                        if (kendo.support.click === 'click') {
                            item.simulate('click');
                            // TODO: item.simulate does not work with pointerdown and pointerup (IE11 and edge) - see https://github.com/jquery/jquery-simulate/issues/37
                            // item.simulate('mousedown');
                            // item.simulate('mouseup');
                            expect(assetManager.value()).to.equal(assetManager.listView.dataSource.at(0).id);
                            expect(deleteButton).to.be.visible;
                            setTimeout(function () { deleteButton.simulate(CLICK); }, 0);
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
                });
                // Make sure we hit the dataBound handler
                assetManager.listView.refresh();
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Events', function () {

            var element;
            var assetManager;
            var change;
            var error;
            var OOPS = 'Oops!';
            var options = {
                change: function (e) {
                    var url = e.sender.value();
                    change(url);
                },
                error: function (e) {
                    error(e.xhr.message);
                },
                extensions: EXTENSIONS,
                schemes: SCHEMES,
                transport: {
                    read: function (options) {
                        options.success({
                            total: 3,
                            data: [
                                { url: 'data://Elvis.jpg', size: 69057 },
                                { url: 'data://France-Fleuves-1.png', size: 35886 },
                                { url: 'data://self-portrait-1907.jpg', size: 292974 }
                            ]
                        });
                    },
                    create: function (options) {
                        // Note: if there is an error, this is the place where to display notifications...
                        // options.error(new Error('Oops'));
                        if (options.data && options.data.file instanceof window.File) {
                            // Make sure we are asynchronous to simulate a file upload...
                            setTimeout(function () {
                                options.data.file = null;
                                options.data.url = 'https://cdn.kidoju.com/images/o_collection/svg/office/add.svg';
                                // VERY IMPORTANT: it won't work without total + data which are both expected
                                options.success({ total: 1, data: [options.data] });
                            }, 2 * TTL);
                        }
                    },
                    destroy: function (options) {
                        options.error(new Error(OOPS));
                    }
                }
            };

            beforeEach(function () {
                element = $(ASSETMANAGER1).appendTo(FIXTURES);
                assetManager = element.kendoAssetManager(options).data('kendoAssetManager');
                change = sinon.spy();
                error = sinon.spy();
            });

            it('Change event', function (done) {
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.value()).to.be.undefined;
                assetManager.listView.bind('dataBound', function (e) {
                    assetManager.select(0);
                    expect(assetManager.value()).to.equal(assetManager.dataSource.at(0).id);
                    expect(change).to.have.been.calledWith(assetManager.value());
                    done();
                });
                // Make sure we hit the dataBound handler
                assetManager.listView.refresh();
            });

            it('Error event', function (done) {
                expect(assetManager).to.be.an.instanceof(AssetManager);
                expect(assetManager.dataSource).to.be.an.instanceof(kendo.data.DataSource);
                expect(assetManager.listView).to.be.an.instanceof(kendo.ui.ListView);
                expect(assetManager.value()).to.be.undefined;
                assetManager.listView.bind('dataBound', function (e) {
                    if (error.callCount > 0) {
                        expect(error).to.have.been.calledWith(OOPS);
                        done();
                    }
                });
                assetManager.dataSource.remove(assetManager.dataSource.at(0));
                assetManager.dataSource.sync();
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

    });

}(this, jQuery));
