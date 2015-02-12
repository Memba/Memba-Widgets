/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, expr: true */
/* jshint browser: true, expr: true */
/* global describe, it, before, xdescribe, xit */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        kendo = window.kendo,
        kidoju = window.kidoju;

    var pageItemCollectionData = [
        { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, properties: '{ "src": "http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png" }' },
        { id: '75cecd51-dff0-4633-a421-dcdb5220fed5', tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, properties: '{ "src": "http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg" }' },
        { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, properties: '{ "font": "Georgia, serif", "color": "#FF0000", "text": "World" }' },
        { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, properties: '{}' }
    ];

    var pageCollectionData = [
        {
            id: '29c14ae2-496b-49f5-9551-e0d7e4aa6032',
            items: [
                { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, properties: '{ "src": "http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png" }' },
                { id: '75cecd51-dff0-4633-a421-dcdb5220fed5', tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, properties: '{ "src": "http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg" }' },
                { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, properties: '{ "font": "Georgia, serif", "color": "#FF0000", "text": "World" }' },
                { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, properties: '{}' }
            ]
        },
        {
            id: 'c0878ced-8e3f-4161-a83a-049caed02d53',
            items: [
                { id: 'c745e385-d409-40d0-a4d7-1b7c14abc2f6', tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, properties: '{ "font": "Georgia, serif", "color": "#FF0000", "text": "World" }' },
                { id: '25bd6088-dc9f-4c9c-a697-be32b8673ba9', tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, properties: '{}' }
            ]
        }
    ];

    describe('Test PageItem', function() {

        describe('When initializing a PageItem', function() {

            it('if initialized from an undefined, it should pass although tool is null', function() {
                //Unfortunately, this is a Kendo UI requirement
                var item = new kidoju.PageItem();
                expect(item.tool).to.be.null;
            });

            it('if initialized from an object without tool, it should throw', function() {
                function testFn() {
                    var item = new kidoju.PageItem({dummy: true});
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from an object with an invalid tool, it should throw', function() {
                function testFn() {
                    var item = new kidoju.PageItem({tool: 'dummy'});
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a valid object, it should pass', function() {
                var item = new kidoju.PageItem({tool: 'label'});
                expect(item).to.be.an.instanceof(kidoju.PageItem);
            });

            it('if initialized from a complete label, it should pass', function () {
                var obj = {
                        id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb',
                        tool : 'label',
                        top: 250,
                        left: 500,
                        height: 100,
                        width: 300,
                        rotate: 90,
                        attributes: {
                            style: 'font-family: Georgia, serif; color: #FF0000;',
                            text: 'World'
                        }
                    },
                    item = new kidoju.PageItem(obj);
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (prop === 'attributes' || prop === 'properties') {
                            for (var subprop in obj[prop]) {
                                if (obj[prop].hasOwnProperty(subprop)) {
                                    expect(item[prop][subprop]).to.equal(obj[prop][subprop]);
                                }
                            }
                        } else {
                            expect(item[prop]).to.equal(obj[prop]);
                        }
                    }
                }
            });

            it('if initialized from a complete image, it shoud pass', function () {
                var obj = {
                        id: 'be1935d0-ff0e-4818-a5a8-762127f3b506',
                        tool : 'image',
                        top: 50,
                        left: 100,
                        height: 250,
                        width: 250,
                        rotate: 45,
                        attributes: {
                            src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png',
                            alt: 'Google Logo'
                        }
                    },
                    item = new kidoju.PageItem(obj);

            });

            it('if initialized from a complete textbox, it shoud pass', function () {
                var item = new kidoju.PageItem({
                    id: 'c3d46312-07c3-44dc-a1c9-987654949927',
                    tool : 'textbox',
                    top: 20,
                    left: 20,
                    height: 100,
                    width: 300,
                    rotate: 0,
                    attributes: '{}',
                    properties: '{ "text": { "name": "textfield3" } }'
                });

            });

        });

    });

    describe('Test PageItemCollectionDataSource', function() {

        describe('When initializing a PageItemCollectionDataSource', function() {
            it('if initialized from an empty array, the count of items should match', function() {
                var pageItemCollectionDataSource1 = new kidoju.PageItemCollectionDataSource();
                var pageItemCollectionDataSource2 = new kidoju.PageItemCollectionDataSource({ data: [] });
                pageItemCollectionDataSource1.read();
                pageItemCollectionDataSource2.read();
                expect(pageItemCollectionDataSource1.total()).to.equal(0);
                expect(pageItemCollectionDataSource2.total()).to.equal(0);
            });
            it('if initialized from a stupid array (items have no valid tool), it should throw', function() {
                function testFn() {
                    var books = [
                        {title: 'Gone with the wind'},
                        {title: 'OK Coral'},
                        {title: 'The third man'},
                        {title: 'The guns of Navarone'}
                    ];
                    var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({data: books});
                    pageItemCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });
            it('if initialized from a proper array, the count of items should match', function() {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                pageItemCollectionDataSource.read();
                expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
            });
            it('if initialized from a kendo.data.DataSource, an exception should be raised', function () {
                var testFn = function() {
                    var dataSource = kidoju.PageItemCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
                };
                expect(testFn).to.throw(Error);
            });
            it('if initialized from a kidoju.PageItemCollectionDataSource, the number of items should match', function() {
                var pageItemCollectionDataSource1 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionData);
                var pageItemCollectionDataSource2 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionDataSource1);
                pageItemCollectionDataSource1.read();
                pageItemCollectionDataSource2.read();
                expect(pageItemCollectionDataSource1.total()).to.equal(pageItemCollectionData.length);
                expect(pageItemCollectionDataSource2.total()).to.equal(pageItemCollectionData.length);
            });
            it('if initialized from a transport, the number of items should match', function() {
                var pageItemCollectionDataSource1 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionData);
                var pageItemCollectionDataSource2 = new kidoju.PageItemCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageItemCollectionData);
                        }
                    }
                });
                pageItemCollectionDataSource1.read();
                pageItemCollectionDataSource2.read();
                expect(pageItemCollectionDataSource1.total()).to.equal(pageItemCollectionData.length);
                expect(pageItemCollectionDataSource2.total()).to.equal(pageItemCollectionData.length);
            });

        });

        describe('When removing a page item', function() {
            it('there should be one page item less', function () {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                pageItemCollectionDataSource.read();
                pageItemCollectionDataSource.remove(pageItemCollectionDataSource.at(0));
                expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length - 1);
            });
        });
    });

    describe('Test Page', function() {
        //TODO --------------------------------------------------------------------------------------------------
    });

    describe('When initializing a PageCollectionDataSource', function() {
        it('if initialized from an empty array, the count of items should match', function() {
            var pageCollectionDataSource1 = new kidoju.PageCollectionDataSource();
            var pageCollectionDataSource2 = new kidoju.PageCollectionDataSource({ data: [] });
            pageCollectionDataSource1.read();
            pageCollectionDataSource2.read();
            expect(pageCollectionDataSource1.total()).to.equal(0);
            expect(pageCollectionDataSource2.total()).to.equal(0);
        });
        it('if initialized from a stupid array, ...', function() {
            //TODO: Attention here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            var books = [
                { title: 'Gone with the wind' },
                { title: 'OK Coral' },
                { title: 'The third man' },
                { title: 'The guns of Navarone' }
            ];
            var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: books });
            pageCollectionDataSource.read();
            expect(pageCollectionDataSource.total()).to.equal(books.length);
        });
        it('if initialized from a proper array, the count of items should match', function() {
            var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
            pageCollectionDataSource.read();
            expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
        });
        it('if initialized from a kendo.data.DataSource, an exception should be raised', function () {
            var fn = function() {
                var dataSource = kidoju.PageCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
            };
            expect(fn).to.throw(Error);
        });
        it('if initialized from a kidoju.PageCollectionDataSource, the number of items should match', function() {
            var pageCollectionDataSource1 = kidoju.PageCollectionDataSource.create(pageCollectionData);
            var pageCollectionDataSource2 = kidoju.PageCollectionDataSource.create(pageCollectionDataSource1);
            pageCollectionDataSource1.read();
            pageCollectionDataSource2.read();
            expect(pageCollectionDataSource1.total()).to.equal(pageCollectionData.length);
            expect(pageCollectionDataSource2.total()).to.equal(pageCollectionData.length);
        });
        it('if initialized from a transport, the number of items should match', function() {
            var pageCollectionDataSource1 = kidoju.PageCollectionDataSource.create(pageCollectionData);
            var pageCollectionDataSource2 = new kidoju.PageCollectionDataSource({
                transport: {
                    read: function(options) {
                        options.success(pageCollectionData);
                    }
                }
            });
            pageCollectionDataSource1.read();
            pageCollectionDataSource2.read();
            expect(pageCollectionDataSource1.total()).to.equal(pageCollectionData.length);
            expect(pageCollectionDataSource2.total()).to.equal(pageCollectionData.length);
        });
        xit('if initialized from $.ajax, the number of items should match', function(done) {
            var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
                transport: {
                    read: {
                        url: '../data/pageCollection.json',
                        dataType: 'json'
                    }
                }
            });
            $.when(
                pageCollectionDataSource.read(),
                $.getJSON(pageCollectionDataSource.options.transport.read.url)
            ).done(function(response1, response2) {
                expect(response2).to.be.an.instanceof(Array);
                expect(pageCollectionDataSource.total()).to.equal(response2[2].length);
                var page = pageCollectionDataSource.at(0);
                expect(page).to.be.an.instanceof(kidoju.Page);
                page.load().done(function() {
                    //ok(page.items instanceof  kidoju.PageItemCollectionDataSource);
                    //equal(pageCollectionData[i].items.length, page.items.total());
                    done();
                });
            });
        });

    });


    /*
    test('Remove pages', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
        pageCollectionDataSource.read();
        expect(2);
        equal(pageCollectionData.length, pageCollectionDataSource.total());
        pageCollectionDataSource.remove(pageCollectionDataSource.at(0));
        equal(pageCollectionData.length-1, pageCollectionDataSource.total());
    });
    test('Add pages and page items to an empty datasource', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({}),
            pageGuid = kendo.guid(),
            itemGuid = kendo.guid();
        expect(10);
        equal(0, pageCollectionDataSource.total());
        pageCollectionDataSource.add(null);
        equal(0, pageCollectionDataSource.total());
        pageCollectionDataSource.add({ id: pageGuid });
        //pageCollectionDataSource.add({ id: pageGuid, items: [] }); TODO: this replaces items datasource by empty array --> check
        equal(1, pageCollectionDataSource.total());
        var page = pageCollectionDataSource.at(0);
        ok(page instanceof kidoju.Page);
        equal(pageGuid, page.id);
        ok(page.items instanceof kidoju.PageItemCollectionDataSource);
        equal(0, page.items.total());
        page.items.add(null);
        equal(0, page.items.total());
        page.items.add({ id: itemGuid });
        var pageItem = page.items.at(0);
        ok(pageItem instanceof kidoju.PageItem);
        equal(itemGuid, pageItem.id);
    });
    test('Parent', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
        pageCollectionDataSource.read();
        expect(3*pageCollectionDataSource.total());
        for(var i=0; i<pageCollectionDataSource.total(); i++) {
            var page = pageCollectionDataSource.at(0);
            ok(page instanceof kidoju.Page);
            ok(page.items instanceof kidoju.PageItemCollectionDataSource);
            equal(page, page.items.parent());
            page.items.read(); //load()
            for(var j=0; j<page.items.total(); j++) {
                var pageItem = page.items.at(j);
                //TODO
            }
        }
    });
    //TODO Group/Aggregate/Serialize
    */

}(this, jQuery));
