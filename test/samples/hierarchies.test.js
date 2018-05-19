/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true, expr: true */
/* jshint browser: true, jquery: true, expr: true */
/* global describe, it, before, xdescribe, xit */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var kendo = window.kendo;
    var kidoju = window.kidoju;

    var Item = kendo.data.Model.define({
        fields: {
            title: {
                type: 'string'
            },
            attributes: {
                defaultValue: {}
            }
        }
    });

    var Attributes = kendo.data.Model.define({
        fields: {
            src: {
                type: 'string'
            },
            alt: {
                type: 'string'
            },
            style: {
                type: 'string'
            }
        }
    });

    var categorizedMovies = [
        {
            categoryName: 'SciFi',
            items: [
                { title: 'Star Wars: A New Hope', year: 1977 },
                { title: 'Star Wars: The Empire Strikes Back', year: 1980 },
                { title: 'Star Wars: Return of the Jedi', year: 1983 }
            ]
        }, {
            categoryName: 'Drama',
            items: [
                { title: 'The Shawshenk Redemption', year: 1994 },
                { title: 'Fight Club', year: 1999 },
                { title: 'The Usual Suspects', year: 1995 }
            ]
        }
    ];

    var Author = kendo.data.Node.define({
        fields: {
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            }
        },
        schema: {
            model: {
                hasChildren: true
            }
        }
    });

    var Book = kendo.data.Node.define({
        fields: {
            title: {
                type: 'string'
            },
            price: {
                type: 'number'
            }
        }
    });

    var LibraryDataSource = kendo.data.HierarchicalDataSource.extend({
        schema: {
            model: Author,
            children: {
                schema: {
                    model: Book
                }
            }
        }
    });


    describe('Test complex models', function () {

        it('Test observable composition', function () {
            var viewModel = kendo.observable({
                obj1: {
                    obj2: {
                        prop: 'test'
                    }
                }
            });
            expect(viewModel).to.be.an.instanceof(kendo.Observable);
            expect(viewModel.obj1).to.be.an.instanceof(kendo.Observable);
            expect(viewModel.obj1.obj2).to.be.an.instanceof(kendo.Observable);
        });


        // See: http://www.telerik.com/forums/best-way-to-check-that-properties-of-an-observable-are-observable

        it('Test model composition', function () {
            var attributes = new Attributes({ alt: 'Google', src: 'http://www.google.com/logo.jpg', style: 'height: 100px; width: 100px;' });
            var item = new Item({ title:'sample image', attributes: attributes });
            var viewModel = kendo.observable({ item: item });
            expect(viewModel.item).to.be.an.instanceof(Item);
            expect(viewModel.item).to.be.an.instanceof(kendo.data.Model);
            expect(viewModel.item).to.be.an.instanceof(kendo.Observable);
            expect(viewModel.item.attributes).to.be.an.instanceof(Attributes);
            expect(viewModel.item.attributes).to.be.an.instanceof(kendo.data.Model);
            expect(viewModel.item.attributes).to.be.an.instanceof(kendo.Observable);
        });


        it('Test submodel definition', function () {
            var SubItem = Item.define({ parts: new kendo.data.ObservableArray([]) });
            var subItem = new SubItem({ title:'sample image' });
            expect(subItem).to.be.an.instanceof(SubItem);
            expect(subItem).to.be.an.instanceof(Item);
            expect(subItem).to.be.an.instanceof(kendo.data.Model);
            expect(subItem).to.be.an.instanceof(kendo.Observable);
        });

        it('Test node initialization', function () {
            var author = new Author({ dummy: true });
            $.noop();

        });

        it('Fetch current', function (done) {
            var viewModel = kendo.observable({
                data: new kendo.data.DataSource({ data: categorizedMovies[0].items }),
                current: null
            });
            viewModel.data.fetch().done(function () {
                var title  = 'Another title';
                viewModel.set('current', viewModel.data.at(0));
                viewModel.set('current.title', title);
                expect(viewModel.current.get('title')).to.equal(title);
                expect(viewModel.data.at(0).get('title')).to.equal(title);
                done();
            });
        });

    });

    describe('Test kendo.data.HierarchicalDataSource', function () {

        describe('When initializing a HierarchicalDataSource', function () {

            it('if initialized from an empty array, the count of items should match', function (done) {
                var hierarchicalDataSource = new kendo.data.HierarchicalDataSource({ data: categorizedMovies });
                hierarchicalDataSource.read().always(function () {
                    expect(hierarchicalDataSource.total()).to.equal(categorizedMovies.length);
                    hierarchicalDataSource.at(0).load().done(function () {
                        // expect(hierarchicalDataSource.at(0).children.total()).to.equal(categorizedMovies[0].items.length);
                        expect(hierarchicalDataSource.at(0).children.data().length).to.equal(categorizedMovies[0].items.length);
                        done();
                    });
                });
            });

            xit('if initialized from multiple service points', function () {

                // http://docs.telerik.com/kendo-ui/framework/hierarchicaldatasource/overview#binding-a-hierarchicaldatasource-to-remote-data-with-multiple-service-end-points

                var categories = new kendo.data.HierarchicalDataSource({
                    transport: {
                        read: {
                            url: 'http://demos.telerik.com/kendo-ui/service/Categories',
                            dataType: 'json'
                        }
                    },
                    schema: {
                        data: 'categories',
                        model: {
                            id: 'categoryId',

                            // categories will always have children
                            hasChildren: true,

                            // children will be fetched from the Products end-point
                            children: {
                                transport: {
                                    read: {
                                        url: 'http://demos.telerik.com/kendo-ui/service/Products',
                                        dataType: 'json'
                                    }
                                },
                                schema: {
                                    data: 'products',
                                    model: {
                                        // products will never have children
                                        hasChildren: false
                                    }
                                }
                            }
                        }
                    }
                });

                categories.read.always(function () {
                    $.noop();
                });

            });

            xit('if initialized from multiple service points', function (done) {

                // http://docs.telerik.com/kendo-ui/framework/hierarchicaldatasource/overview#binding-a-hierarchicaldatasource-to-remote-data-with-multiple-service-end-points
                var guid = kendo.guid();

                var categories = new kendo.data.HierarchicalDataSource({
                    transport: {
                        read: function (options) {
                            window.console.log('read categories');
                            options.success([{ categoryId: guid, name: 'Miscellaneous' }]);
                        }
                    },
                    schema: {
                        // data: 'categories',
                        model: {
                            id: 'categoryId',

                            // categories will always have children
                            hasChildren: true,

                            // children will be fetched from the Products end-point
                            children: {
                                transport: {
                                    read: {
                                        url: 'http://demos.telerik.com/kendo-ui/service/Products',
                                        dataType: 'json'
                                    }
                                },
                                schema: {
                                    // data: 'products',
                                    model: {
                                        // products will never have children
                                        hasChildren: false
                                    }
                                }
                            }
                        }
                    }
                });

                categories.read().always(function () {
                    categories.at(0).load().always(function () {
                        var t = categories.children.total();
                        done();
                    });
                });

            });

        });

        describe('When initializing a LibraryDataSource', function () {

            // See http://www.telerik.com/forums/subclassing-kendo-data-node-and-kendo-data-hierarchicaldatasource

            it('if initialized from a dummy array, items should match', function (done) {
                var libraryDataSource = new LibraryDataSource({ data: categorizedMovies });
                libraryDataSource.read().always(function () {
                    expect(libraryDataSource.total()).to.equal(categorizedMovies.length);
                    // expect (libraryDataSource.at(0)).to.be.an.instanceof(Author); <-------------------------------------------------------- Does not work
                    libraryDataSource.at(0).load().done(function () {
                        // expect(libraryDataSource.at(0).children.total()).to.equal(categorizedMovies[0].items.length); <------------------ Does not work
                        expect(libraryDataSource.at(0).children.data().length).to.equal(categorizedMovies[0].items.length); // <-------------- Works
                        // expect(libraryDataSource.at(0).children.at(0)).to.be.an.instanceof(Book); <---------------------------------------- Does not work
                        done();
                    });
                });
            });

            it('if initialized from transport, items should match', function (done) {
                var libraryDataSource = new LibraryDataSource({
                    transport: {
                        read: {
                            url: '../data/pageCollection.json',
                            dataType: 'json'
                        }
                    }
                });
                $.when(
                    libraryDataSource.read(),
                    $.getJSON(libraryDataSource.options.transport.read.url)
                )
                    .done(function (response1, response2) {
                        expect(response2).to.be.an.instanceof(Array);
                        // expect(libraryDataSource.at(0)).to.be.an.instanceof(Author); //<------------------------------------------------ Does not work
                        expect(libraryDataSource.total()).to.equal(response2[0].length);
                        libraryDataSource.at(0).load().done(function () {
                            // expect(libraryDataSource.at(0).children.total()).to.equal(response2[0][0].items.length);   //<-------------- Does not work
                            done();
                        });
                    });
            });

        });

    });


}(this, jQuery));
