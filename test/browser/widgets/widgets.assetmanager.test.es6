/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
import '../../../src/js/widgets/widgets.assetmanager.es6';
import ASSETS from '../../../src/js/helpers/helpers.assets.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // attr,
    // bind,
    data: { DataSource, ObservableArray },
    destroy,
    // init,
    observable,
    Observable, // TODO CHeck
    support,
    ui: { AssetManager, DropDownList, ListView, Pager, roles, TabStrip },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'assetmanager';
const WIDGET = 'kendoAssetManager';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const TTL = 500;

describe('widgets.assetmanager', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
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
            function fn() {
                const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
                element[WIDGET]();
            }
            expect(fn).to.throw();
        });

        it('from code with options: simple collection', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                collections: [ASSETS.O_COLLECTION],
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            /*
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            */
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('fileBrowser')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('listView')
                .that.is.an.instanceof(ListView);
            expect(widget)
                .to.have.property('pager')
                .that.is.an.instanceof(Pager);
            expect(widget)
                .to.have.property('searchInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('tabStrip')
                .that.is.an.instanceof(TabStrip);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.tabStrip)
                .to.have.property('contentElements')
                .that.is.an.instanceof($)
                .with.property('length', 1);
            expect(
                widget.tabStrip.tabGroup.children(':nth-child(1)').text()
            ).to.equal(options.collections[0].name);
        });

        it('from code with options: sub-collections', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                collections: [ASSETS.O_COLLECTION, ASSETS.V_COLLECTION],
                schemes: ASSETS.SCHEMES,
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
            /*
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            */
            expect(widget)
                .to.have.property('dropDownList')
                .that.is.an.instanceof(DropDownList);
            expect(widget)
                .to.have.property('fileBrowser')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('listView')
                .that.is.an.instanceof(ListView);
            expect(widget)
                .to.have.property('pager')
                .that.is.an.instanceof(Pager);
            expect(widget)
                .to.have.property('searchInput')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('tabStrip')
                .that.is.an.instanceof(TabStrip);
            expect(widget).to.have.property('wrapper').that.is.an.instanceof($);
            expect(widget.tabStrip)
                .to.have.property('contentElements')
                .that.is.an.instanceof($)
                .with.property('length', 2);
            expect(
                widget.tabStrip.tabGroup.children(':nth-child(1)').text()
            ).to.equal(options.collections[0].name);
            expect(
                widget.tabStrip.tabGroup.children(':nth-child(2)').text()
            ).to.equal(options.collections[1].name);
            // TODO Check combobox with sub-collections
        });

        xit('from code with options: summary files', $.noop);

        // it('from markup', $.noop);
    });

    xdescribe('Methods', () => {
        let element;
        let widget;
        const options = {
            collections: [ASSETS.O_COLLECTION, ASSETS.V_COLLECTION],
            schemes: ASSETS.SCHEMES,
            transport: null,
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('value and select', (done) => {
            // if (window.PHANTOMJS) {
            //    return done(); // TODO: Does not work on Travis-CI
            // }
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.tabStrip).to.be.an.instanceof(TabStrip);
            expect(widget.value()).to.be.undefined;
            widget.listView.bind('dataBound', () => {
                if (
                    widget.tabStrip.select().index() === 1 &&
                    widget.dropDownList.text() === '32x32'
                ) {
                    setTimeout(() => {
                        widget.select(0);
                        expect(widget.value()).to.equal(
                            'cdn://images/v_collection/png/32x32/3d_glasses.png'
                        );
                        widget.select(1);
                        expect(widget.value()).to.equal(
                            'cdn://images/v_collection/png/32x32/about.png'
                        );
                        widget.select(2);
                        expect(widget.value()).to.equal(
                            'cdn://images/v_collection/png/32x32/add.png'
                        );
                        done();
                    }, 0);
                }
            });
            // Yield some time for collections to load
            setTimeout(() => {
                widget.tabStrip.select(1);
            }, TTL);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        // We could also consider a search method

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(AssetManager);
            widget.destroy();
            expect(widget.tabStrip).to.be.undefined;
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.progressBar).to.be.undefined;
            expect(widget.searchInput).to.be.undefined;
            expect(widget.toolbar).to.be.undefined;
            expect(widget.listView).to.be.undefined;
            expect(widget.pager).to.be.undefined;
            expect(widget.fileBrowser).to.be.undefined;
            expect(widget.dropZone).to.be.undefined;
            expect(widget.dataSource).to.be.undefined;
            expect(widget._errorHandler).to.be.undefined;
        });
    });

    xdescribe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        let viewModel;
        let change;
        const options = {
            change(e) {
                const url = e.sender.value();
                if (viewModel instanceof Observable) {
                    viewModel.set('url', url);
                }
                if ($.isFunction(change)) {
                    change(url);
                }
            },
            collections: [ASSETS.O_COLLECTION, ASSETS.V_COLLECTION],
            extensions: ASSETS.IMAGE_EXT,
            schemes: ASSETS.SCHEMES,
            transport: {
                read(opts) {
                    opts.success({
                        total: 3,
                        data: [
                            { url: 'data://Elvis.jpg', size: 69057 },
                            { url: 'data://France-Fleuves-1.png', size: 35886 },
                            {
                                url: 'data://self-portrait-1907.jpg',
                                size: 292974,
                            },
                        ],
                    });
                },
                create(opts) {
                    // Note: if there is an error, this is the place where to display notifications...
                    // options.error(new Error('Oops'));
                    if (opts.data && opts.data.file instanceof window.File) {
                        // Make sure we are asynchronous to simulate a file upload...
                        setTimeout(() => {
                            // eslint-disable-next-line no-param-reassign
                            opts.data.file = null;
                            // eslint-disable-next-line no-param-reassign
                            opts.data.url =
                                'https://cdn.kidoju.com/images/o_collection/svg/office/add.svg';
                            // VERY IMPORTANT: it won't work without total + data which are both expected
                            opts.success({ total: 1, data: [opts.data] });
                        }, 2 * TTL);
                    }
                },
                destroy(opts) {
                    // options.error(new Error('Oops'));
                    opts.success({ total: 1, data: [opts.data] });
                    destroy();
                },
            },
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            viewModel = observable({ url: undefined });
            change = sinon.spy();
        });

        it('Click tabs', (done) => {
            // if (window.PHANTOMJS) {
            //    TODO: Does not work on Travis-CI
            //    return done();
            // }
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.tabStrip).to.be.an.instanceof(TabStrip);
            expect(widget.value()).to.equal('data://Elvis.jpg');
            widget.listView.bind('dataBound', () => {
                setTimeout(() => {
                    if (
                        widget.tabStrip.select().index() === 1 &&
                        widget.dropDownList.text() === 'Dark Grey'
                    ) {
                        expect(widget.dataSource.at(0).id).to.equal(
                            'cdn://images/o_collection/svg/dark_grey/3d_glasses.svg'
                        );
                        expect(widget.dataSource.at(1).id).to.equal(
                            'cdn://images/o_collection/svg/dark_grey/about.svg'
                        );
                        expect(widget.dataSource.at(2).id).to.equal(
                            'cdn://images/o_collection/svg/dark_grey/add.svg'
                        );
                        done();
                    }
                }, 0);
            });
            // Clicking a collection tab needs to be delayed until collections are loaded
            setTimeout(() => {
                const tab = widget.element.find(
                    'ul.k-tabstrip-items > li.k-item:nth-child(2)'
                );
                tab.simulate(CONSTANTS.CLICK);
            }, TTL);
        });

        it('Change collection in drop down list', (done) => {
            // if (window.PHANTOMJS) {
            // TODO: Does not work on Travis-CI
            //    return done();
            // }
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.tabStrip).to.be.an.instanceof(TabStrip);
            expect(widget.value()).to.equal('data://Elvis.jpg');
            widget.dropDownList.bind('dataBound', (e) => {
                // 2) Second, select `White` in the subcollection drop down list
                if (
                    e.sender.dataSource.total() > 0 &&
                    e.sender.text() !== 'White'
                ) {
                    setTimeout(() => {
                        $(e.sender.element).simulate(CONSTANTS.CLICK);
                        const list = $('.k-list-container ul.k-list');
                        const item = list.find('li:contains("White")');
                        expect(item)
                            .to.be.an.instanceof($)
                            .with.property('length', 1);
                        expect(item).to.have.text('White');
                        item.simulate(CONSTANTS.CLICK);
                    }, 0);
                }
            });
            widget.listView.bind('dataBound', () => {
                // 3) Third, check list view once loaded
                if (
                    widget.tabStrip.select().index() === 1 &&
                    widget.dropDownList.text() === 'White'
                ) {
                    setTimeout(() => {
                        expect(widget.dataSource.at(0).id).to.equal(
                            'cdn://images/o_collection/svg/white/3d_glasses.svg'
                        );
                        expect(widget.dataSource.at(1).id).to.equal(
                            'cdn://images/o_collection/svg/white/about.svg'
                        );
                        expect(widget.dataSource.at(2).id).to.equal(
                            'cdn://images/o_collection/svg/white/add.svg'
                        );
                        done();
                    }, TTL);
                }
            });
            // Clicking a collection tab needs to be delayed until collections are loaded
            setTimeout(() => {
                // 1) First, click the `Collection 1` tab
                const tab = widget.element.find(
                    'ul.k-tabstrip-items > li.k-item:nth-child(2)'
                );
                tab.simulate(CONSTANTS.CLICK);
            }, TTL);
        });

        it('Search input', (done) => {
            // if (window.PHANTOMJS) {
            //    TODO: Does not work on Travis-CI
            //    return done();
            // }
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.searchInput).to.be.an.instanceof($);
            expect(widget.tabStrip).to.be.an.instanceof(TabStrip);
            expect(widget.value()).to.equal('data://Elvis.jpg');
            widget.listView.bind('dataBound', () => {
                if (
                    widget.tabStrip.select().index() === 1 &&
                    widget.dropDownList.text() === 'Dark Grey'
                ) {
                    if (widget.searchInput.val() === '') {
                        widget.searchInput.val('apple');
                        // widget.searchInput.simulate('keydown', { keyCode: 13 });
                        widget.searchInput.trigger('change');
                    } else {
                        setTimeout(() => {
                            expect(widget.searchInput.val()).to.equal('apple');
                            // We need to check the view() because we have applied a filter to data
                            expect(widget.dataSource.view())
                                .to.be.an.instanceof(ObservableArray)
                                .with.property('length', 3);
                            expect(widget.dataSource.view()[0].id).to.equal(
                                'cdn://images/o_collection/svg/dark_grey/apple.svg'
                            );
                            expect(widget.dataSource.view()[1].id).to.equal(
                                'cdn://images/o_collection/svg/dark_grey/apple_bite.svg'
                            );
                            expect(widget.dataSource.view()[2].id).to.equal(
                                'cdn://images/o_collection/svg/dark_grey/pineapple.svg'
                            );
                            // TODO: Search clear (X button within input)
                            done();
                        }, TTL);
                    }
                }
            });
            // Clicking a collection tab needs to be delayed until collections are loaded
            setTimeout(() => {
                const tab = widget.element.find(
                    'ul.k-tabstrip-items > li.k-item:nth-child(2)'
                );
                tab.simulate(CONSTANTS.CLICK);
            }, TTL);
        });

        xit('Paging', () => {
            // TODO
        });

        it('Select items', (done) => {
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.searchInput).to.be.an.instanceof($);
            expect(widget.tabStrip).to.be.an.instanceof(TabStrip);
            expect(widget.value()).to.equal('data://Elvis.jpg');
            widget.listView.bind('dataBound', () => {
                // setTimeout(function () {
                const list = $('div.k-filebrowser ul.k-tiles');
                for (let i = 0; i < widget.listView.dataSource.total(); i++) {
                    const item = list.children(`li.k-tile:nth-child(${i + 1})`);
                    expect(item)
                        .to.be.an.instanceof($)
                        .with.property('length', 1);
                    if (support.click === CONSTANTS.CLICK) {
                        item.simulate(CONSTANTS.CLICK);
                        // TODO: item.simulate does not work with pointerdown and pointerup (IE11 and edge) - see https://github.com/jquery/jquery-simulate/issues/37
                        // item.simulate('mousedown');
                        // item.simulate('mouseup');
                        expect(widget.value()).to.equal(
                            widget.listView.dataSource.at(i).id
                        );
                        expect(change).to.have.been.calledWith(widget.value());
                        expect(viewModel.get('url')).to.equal(widget.value());
                    }
                }
                done();
                // }, 0);
            });
            // Make sure we hit the dataBound handler
            widget.listView.refresh();
        });

        xit('Upload', () => {
            // TODO: This is a tough one. How can we script the OS explorer dialog in JS to either Open or Cancel? Might be something for Zombie instead of Mocha ...
        });

        it('Delete', (done) => {
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.searchInput).to.be.an.instanceof($);
            expect(widget.tabStrip).to.be.an.instanceof(TabStrip);
            let doneCalled = false;
            const count = widget.listView.dataSource.total();
            widget.listView.bind('dataBound', () => {
                // Without this timeout the dataBound eveneyt handler is called before teh destroy transport
                // and we then need two clicks two delete the last item causing a mismatch in count at the end
                setTimeout(() => {
                    const list = $('div.k-filebrowser ul.k-tiles');
                    if (widget.listView.dataSource.total() > 0) {
                        const deleteButton = $(
                            'button.k-button span.k-i-close'
                        ).parent();
                        // expect(deleteButton).to.be.hidden;
                        expect(deleteButton).to.be.visible;
                        const item = list.children('li.k-tile:first');
                        expect(item)
                            .to.be.an.instanceof($)
                            .with.property('length', 1);
                        const src = item.find('img').attr('src');
                        const url = widget.value();
                        const scheme = /^(\w+):\/\//.exec(url);
                        expect(
                            url.replace(scheme[0], options.schemes[scheme[1]])
                        ).to.equal(src);
                        if (support.click === CONSTANTS.CLICK) {
                            item.simulate(CONSTANTS.CLICK);
                            // TODO: item.simulate does not work with pointerdown and pointerup (IE11 and edge) - see https://github.com/jquery/jquery-simulate/issues/37
                            // item.simulate('mousedown');
                            // item.simulate('mouseup');
                            expect(url).to.equal(
                                widget.listView.dataSource.at(0).id
                            );
                            expect(deleteButton).to.be.visible;
                            setTimeout(() => {
                                deleteButton.simulate(CONSTANTS.CLICK);
                            }, 0);
                            // Deleting a dataSource item causes a refresh which triggers the dataBound event
                            // so we are deleting all items until dataSource.total() === 0
                            // but to avoid nesting delete events into delete events we need to call setTimout to trigger the next delete event on its own timer
                        } else {
                            done(); // This is for IE and edge
                        }
                    } else if (widget.listView.dataSource.total() === 0) {
                        // If not added to the timer queue, this is executed before the last delete and misses one count
                        setTimeout(() => {
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
            widget.listView.refresh();
        });
    });

    xdescribe('Events', () => {
        let element;
        let widget;
        let change;
        let error;
        const OOPS = 'Oops!';
        const options = {
            change(e) {
                const url = e.sender.value();
                if ($.isFunction(change)) {
                    change(url);
                }
            },
            error(e) {
                error(e.xhr.message);
            },
            extensions: ASSETS.IMAGE_EXT,
            schemes: ASSETS.SCHEMES,
            transport: {
                read(opts) {
                    opts.success({
                        total: 3,
                        data: [
                            { url: 'data://Elvis.jpg', size: 69057 },
                            { url: 'data://France-Fleuves-1.png', size: 35886 },
                            {
                                url: 'data://self-portrait-1907.jpg',
                                size: 292974,
                            },
                        ],
                    });
                },
                create(opts) {
                    // Note: if there is an error, this is the place where to display notifications...
                    // opts.error(new Error('Oops'));
                    if (opts.data && opts.data.file instanceof window.File) {
                        // Make sure we are asynchronous to simulate a file upload...
                        setTimeout(() => {
                            // eslint-disable-next-line no-param-reassign
                            opts.data.file = null;
                            // eslint-disable-next-line no-param-reassign
                            opts.data.url =
                                'https://cdn.kidoju.com/images/o_collection/svg/office/add.svg';
                            // VERY IMPORTANT: it won't work without total + data which are both expected
                            opts.success({ total: 1, data: [opts.data] });
                        }, 2 * TTL);
                    }
                },
                destroy(opts) {
                    opts.error(new Error(OOPS));
                },
            },
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            change = sinon.spy();
            error = sinon.spy();
        });

        it('Change event', (done) => {
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.value()).to.equal('data://Elvis.jpg');
            widget.listView.bind('dataBound', () => {
                widget.select(0);
                expect(widget.value()).to.equal(widget.dataSource.at(0).id);
                expect(change).to.have.been.calledWith(widget.value());
                done();
            });
            // Make sure we hit the dataBound handler
            widget.listView.refresh();
        });

        it('Error event', (done) => {
            expect(widget).to.be.an.instanceof(AssetManager);
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.listView).to.be.an.instanceof(ListView);
            expect(widget.value()).to.equal('data://Elvis.jpg');
            widget.listView.bind('dataBound', () => {
                if (error.callCount > 0) {
                    expect(error).to.have.been.calledWith(OOPS);
                    done();
                }
            });
            widget.dataSource.remove(widget.dataSource.at(0));
            widget.dataSource.sync();
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
