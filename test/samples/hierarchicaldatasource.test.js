/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true, expr: true */
/* jshint browser: true, jquery: true, expr: true */
/* global describe, it, before */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        kendo = window.kendo,
        kidoju = window.kidoju;

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

    describe('Test kendo.data.HierarchicalDataSource', function() {

        describe('When initializing a HierarchicalDataSource from an Array', function() {
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

        describe('When initializing a LibraryDataSource from an Array', function() {

            it('if initialized from a dummy array, the count of items should match', function(done) {
                var libraryDataSource = new LibraryDataSource({ data: categorizedMovies });
                libraryDataSource.read().always(function() {
                    expect(libraryDataSource.total()).to.equal(categorizedMovies.length);
                    libraryDataSource.at(0).load().done(function() {
                        //expect(libraryDataSource.at(0).children.total()).to.equal(categorizedMovies[0].items.length);
                        expect(libraryDataSource.at(0).children.data().length).to.equal(categorizedMovies[0].items.length);
                        done();
                    });
                });
            });

            it('if initialized from transport, the count of items should match', function(done) {
                var libraryDataSource = new LibraryDataSource({
                    transport: {
                        read: {
                            url: '../data/pageCollection.json',
                            dataType: "json"
                        }
                    }
                });
                libraryDataSource.read().always(function() {
                    //expect(libraryDataSource.total()).to.equal(categorizedMovies.length);
                    libraryDataSource.at(0).load().done(function() {
                        //expect(libraryDataSource.at(0).children.total()).to.equal(categorizedMovies[0].items.length);
                        //expect(libraryDataSource.at(0).children.data().length).to.equal(categorizedMovies[0].items.length);
                        done();
                    });
                });
            });


        });

    });


}(this, jQuery));
