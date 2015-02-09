/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true, expr: true */
/* jshint browser: true, jquery: true, expr: true */
/* global describe, it, before, xdescribe, xit */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        kendo = window.kendo,
        kidoju = window.kidoju;

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
            categoryName: "SciFi",
            items: [
                { title: "Star Wars: A New Hope", year: 1977 },
                { title: "Star Wars: The Empire Strikes Back", year: 1980 },
                { title: "Star Wars: Return of the Jedi", year: 1983 }
            ]
        }, {
            categoryName: "Drama",
            items: [
                { title: "The Shawshenk Redemption", year: 1994 },
                { title: "Fight Club", year: 1999 },
                { title: "The Usual Suspects", year: 1995 }
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


    describe('Test complex models', function() {

        it('Test composition', function() {
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


        //See: http://www.telerik.com/forums/best-way-to-check-that-properties-of-an-observable-are-observable

        it('Test submodels', function() {
            var attributes = new Attributes({alt: 'Google', src: 'http://www.google.com/logo.jpg', style: 'height: 100px; width: 100px;'}),
                item = new Item({title:'sample image', attributes: attributes}),
                viewModel = kendo.observable({ item: item });
            expect(viewModel.item).to.be.an.instanceof(Item);
            expect(viewModel.item).to.be.an.instanceof(kendo.data.Model);
            expect(viewModel.item).to.be.an.instanceof(kendo.Observable);
            expect(viewModel.item.attributes).to.be.an.instanceof(Attributes);
            expect(viewModel.item.attributes).to.be.an.instanceof(kendo.data.Model);
            expect(viewModel.item.attributes).to.be.an.instanceof(kendo.Observable);

        });

    });

    describe('Test kendo.data.HierarchicalDataSource', function() {

        describe('When initializing a HierarchicalDataSource', function() {

            it('if initialized from an empty array, the count of items should match', function(done) {
                var hierarchicalDataSource = new kendo.data.HierarchicalDataSource({ data: categorizedMovies });
                hierarchicalDataSource.read().always(function() {
                    expect(hierarchicalDataSource.total()).to.equal(categorizedMovies.length);
                    hierarchicalDataSource.at(0).load().done(function() {
                        //expect(hierarchicalDataSource.at(0).children.total()).to.equal(categorizedMovies[0].items.length);
                        expect(hierarchicalDataSource.at(0).children.data().length).to.equal(categorizedMovies[0].items.length);
                        done();
                    });
                });
            });

        });

        describe('When initializing a LibraryDataSource', function() {

            //See http://www.telerik.com/forums/subclassing-kendo-data-node-and-kendo-data-hierarchicaldatasource

            it('if initialized from a dummy array, items should match', function(done) {
                var libraryDataSource = new LibraryDataSource({ data: categorizedMovies });
                libraryDataSource.read().always(function() {
                    expect(libraryDataSource.total()).to.equal(categorizedMovies.length);
                    //expect (libraryDataSource.at(0)).to.be.an.instanceof(Author); <-------------------------------------------------------- Does not work
                    libraryDataSource.at(0).load().done(function() {
                        //expect(libraryDataSource.at(0).children.total()).to.equal(categorizedMovies[0].items.length); //<------------------ Does not work
                        expect(libraryDataSource.at(0).children.data().length).to.equal(categorizedMovies[0].items.length); //<-------------- Works
                        //expect(libraryDataSource.at(0).children.at(0)).to.be.an.instanceof(Book); <---------------------------------------- Does not work
                        done();
                    });
                });
            });

            it('if initialized from transport, items should match', function(done) {
                var libraryDataSource = new LibraryDataSource({
                    transport: {
                        read: {
                            url: '../data/pageCollection.json',
                            dataType: "json"
                        }
                    }
                });
                $.when(
                    libraryDataSource.read(),
                    $.getJSON(libraryDataSource.options.transport.read.url)
                ).done(function(response1, response2) {
                        expect(response2).to.be.an.instanceof(Array);
                        //expect(libraryDataSource.at(0)).to.be.an.instanceof(Author); //<------------------------------------------------ Does not work
                        expect(libraryDataSource.total()).to.equal(response2[0].length);
                        libraryDataSource.at(0).load().done(function() {
                            //expect(libraryDataSource.at(0).children.total()).to.equal(response2[0][0].items.length);   //<-------------- Does not work
                            done();
                        });
                });
            });

        });

    });


}(this, jQuery));
