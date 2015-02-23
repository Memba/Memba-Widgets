/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        sinon = window.sinon,
        kendo = window.kendo,
        kidoju = window.kidoju;

    var pageItemCollectionData = [
        { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: '//marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
        { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
        { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield1' } },
        { id: 'c745e385-d409-40d0-a4d7-1b7c14abc2f6', tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
        { id: '25bd6088-dc9f-4c9c-a697-be32b8673ba9', tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield2' } },
        { id: 'f6725a70-20b2-4adf-8b3a-a2d3f84da50d', tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
        { id: '3894e35b-b740-46c8-be24-21f4a3b9c24d', tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield3' } }
    ];

    var pageCollectionData = [
        {
            id: '29c14ae2-496b-49f5-9551-e0d7e4aa6032',
            items: [
                { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: '//marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
                { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
                { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield1' } }
            ]
        },
        {
            id: 'c0878ced-8e3f-4161-a83a-049caed02d53',
            items: [
                { id: 'c745e385-d409-40d0-a4d7-1b7c14abc2f6', tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
                { id: '25bd6088-dc9f-4c9c-a697-be32b8673ba9', tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield2' } }
            ]
        },
        {
            id: '9e3803f8-a91c-408e-bded-d1b86c68723c',
            items: [
                { id: 'f6725a70-20b2-4adf-8b3a-a2d3f84da50d', tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
                { id: '3894e35b-b740-46c8-be24-21f4a3b9c24d', tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield3' } }
            ]
        }
    ];

    var Book = kendo.data.Model.define({
        idField: 'id',
        fields: {
            id: {
                type: 'string'
            },
            title: {
                type: 'string'
            }
        }
    });

    var books = [
        {id: 'ad6f4594-41a5-4001-98e2-8fa6920fd304', title: 'Gone with the wind'},
        {id: '2042efeb-b8e6-4b98-8142-2a8c9c4ab7c8', title: 'OK Coral'},
        {id: '38414c4c-ddf1-4d9c-9c6b-b0b003353bae', title: 'The third man'},
        {id: 'b7a8cb70-b4e7-4b79-89dd-09225d05399c', title: 'The guns of Navarone'}
    ];

    function dataUrl(file) {
        if (window.__karma__) {
            return '/base/test/data/' + file;
        } else {
            return '../data/' + file;
        }
    }

    /*********************************************************************************************************
     * PageItem
     *********************************************************************************************************/

    describe('Test PageItem', function() {

        describe('When initializing a PageItem', function() {

            it('if initialized from an undefined, it should pass although tool is null', function() {
                //Unfortunately, this is a Kendo UI requirement
                var item = new kidoju.PageItem();
                expect(item).to.have.property('id');
                expect(item).to.have.property('tool').that.is.null;
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
                    properties: '{ "name": "textfield3" }'
                });

            });

        });

    });

    /*********************************************************************************************************
     * PageItemCollectionDataSource
     *********************************************************************************************************/

    describe('Test PageItemCollectionDataSource', function() {

        describe('When initializing a PageItemCollectionDataSource', function(done) {

            it('if initialized from an empty array, the count of items should match', function(done) {
                var pageItemCollectionDataSource1 = new kidoju.PageItemCollectionDataSource();
                var pageItemCollectionDataSource2 = new kidoju.PageItemCollectionDataSource({ data: [] });
                expect(pageItemCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageItemCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                expect(new pageItemCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                $.when(
                    pageItemCollectionDataSource1.read(),
                    pageItemCollectionDataSource2.read()
                )
                    .then(function() {
                        expect(pageItemCollectionDataSource1.total()).to.equal(0);
                        expect(pageItemCollectionDataSource2.total()).to.equal(0);
                        done();
                    });
            });

            it('if initialized from a stupid array (items have no valid tool), it should throw', function() {
                function testFn() {
                    var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({data: books});
                    pageItemCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            xit('if initialized with a new model, it should throw', function() {
                function testFn() {
                    var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({
                        data: books,
                        schema: {
                            model: Book
                        }
                    });
                    pageItemCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a proper array, the count of items should match and dirty === false', function(done) {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    for (var i = 0; i < pageItemCollectionData.length; i++) {
                        expect(pageItemCollectionDataSource.at(i).dirty).to.be.false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, attributes and properties should be instances of kendo.data.Model', function(done) {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    for (var i = 0; i < pageItemCollectionData.length; i++) {
                        expect(pageItemCollectionDataSource.at(i).attributes).to.be.an.instanceof(kendo.data.Model);
                        expect(pageItemCollectionDataSource.at(i).properties).to.be.an.instanceof(kendo.data.Model);
                    }
                    done();
                });
            });

            it('if initialized from a kendo.data.DataSource that is not a kendo.PageItemCollectionDataSource, it should throw', function () {
                var testFn = function() {
                    var dataSource = kidoju.PageItemCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
                };
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a kidoju.PageItemCollectionDataSource, the number of items should match', function(done) {
                var pageItemCollectionDataSource1 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionData);
                var pageItemCollectionDataSource2 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionDataSource1);
                expect(pageItemCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageItemCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                expect(new pageItemCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                $.when(
                    pageItemCollectionDataSource1.read(),
                    pageItemCollectionDataSource2.read()
                )
                    .then(function() {
                        expect(pageItemCollectionDataSource1.total()).to.equal(pageItemCollectionData.length);
                        expect(pageItemCollectionDataSource2.total()).to.equal(pageItemCollectionData.length);
                        done();
                    });
            });

            it('if initialized from a transport, the number of items should match', function(done) {
                var pageItemCollectionDataSource1 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionData);
                var pageItemCollectionDataSource2 = new kidoju.PageItemCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageItemCollectionData);
                        }
                    }
                });
                expect(pageItemCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageItemCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                expect(new pageItemCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                $.when(
                    pageItemCollectionDataSource1.read(),
                    pageItemCollectionDataSource2.read()
                )
                    .then(function() {
                        expect(pageItemCollectionDataSource1.total()).to.equal(pageItemCollectionData.length);
                        expect(pageItemCollectionDataSource2.total()).to.equal(pageItemCollectionData.length);
                        done();
                    });
            });

            it('if initialized from $.ajax, the number of items should match', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageItemCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                $.when(
                    pageItemCollectionDataSource.read(),
                    $.getJSON(pageItemCollectionDataSource.options.transport.read.url)
                ).done(function (response1, response2) {
                        expect(response2).to.be.an.instanceof(Array).that.has.property('length', 3);
                        expect(response2[0]).to.be.an.instanceof(Array);
                        expect(pageItemCollectionDataSource.total()).to.equal(response2[0].length);
                        var pageItem = pageItemCollectionDataSource.at(0);
                        expect(pageItem).to.be.an.instanceof(kidoju.PageItem);
                        done();
                    }
                );
            });

        });

        describe('When creating a page item', function() {

            it('If dataSource initialized from in-memory array, there should be one page item more', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.add(new kidoju.PageItem({ tool: 'label' }));
                    expect(pageItemCollectionDataSource.at(pageItemCollectionData.length).isNew()).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length + 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call create', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageItemCollectionData);
                        },
                        create: function(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.add(new kidoju.PageItem({tool: 'label'}));
                    expect(pageItemCollectionDataSource.at(pageItemCollectionData.length).isNew()).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length + 1);
                    pageItemCollectionDataSource.sync()
                        .always(function() {
                            expect(create).to.have.been.called;
                            expect(update).not.to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When updating a page item', function() {

            it('If dataSource initialized from in-memory array, there should be one updated page item', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    pageItemCollectionDataSource.at(0).set('top', 111);
                    expect(pageItemCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call update', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageItemCollectionData);
                        },
                        create: function(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    pageItemCollectionDataSource.at(0).set('top', 111);
                    expect(pageItemCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.sync()
                        .always(function() {
                            expect(create).not.to.have.been.called;
                            expect(update).to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When removing a page item', function() {

            it('If dataSource initialized from in-memory array, there should be one page item less', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.remove(pageItemCollectionDataSource.at(0));
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length - 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call destroy', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageItemCollectionData);
                        },
                        create: function(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageItem);
                pageItemCollectionDataSource.read().then(function() {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.remove(pageItemCollectionDataSource.at(0));
                    pageItemCollectionDataSource.sync().then(function() {
                        expect(create).not.to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).to.have.been.called;
                        done();
                    });
                });
            });

        });

        //TODO Filter, Query, Group, Aggregate, Serialize
    });

    /*********************************************************************************************************
     * Page
     *********************************************************************************************************/

    describe('Test Page', function() {

        //TODO: http://blog.falafel.com/dirty-children-and-kendo-ui/

        describe('When initializing a Page', function(done) {

            it('if initialized from an undefined, it should pass', function(done) {
                //Unfortunately, this is a Kendo UI requirement
                var page = new kidoju.Page();
                expect(page).to.have.property('id');
                expect(page.items.fetch).to.respond;
                page.items.fetch().then(function() {
                    expect(page.items.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object without items, it should pass', function(done) {
                var page = new kidoju.Page({dummy: true});
                expect(page).to.have.property('id');
                expect(page).to.have.property('dummy', true);             //<------------ TODO: any way to avoid unwanted properties?
                expect(page.items.fetch).to.respond;
                page.items.fetch().then(function() {
                    expect(page.items.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object with items, it should pass', function(done) {
                var page = new kidoju.Page({items: [{tool: 'label'}, {tool: 'image'}]});
                expect(page).to.have.property('id');
                expect(page.items.fetch).to.respond;
                page.items.fetch().then(function() {
                    expect(page.items.total()).to.equal(2);
                    done();
                });
            });

        });

    });

    /*********************************************************************************************************
     * PageCollectionDataSource
     *********************************************************************************************************/

    describe('Test PageCollectionDataSource', function() {

        describe('When initializing a PageCollectionDataSource', function() {

            it('if initialized from an empty array, the count of pages should match', function (done) {
                var pageCollectionDataSource1 = new kidoju.PageCollectionDataSource();
                var pageCollectionDataSource2 = new kidoju.PageCollectionDataSource({data: []});
                expect(pageCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                expect(new pageCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageCollectionDataSource1.total()).to.equal(0);
                        expect(pageCollectionDataSource2.total()).to.equal(0);
                        done();
                    });
            });

            xit('if initialized from a stupid array, ...', function (done) {
                var books = [
                    {title: 'Gone with the wind'},
                    {title: 'OK Coral'},
                    {title: 'The third man'},
                    {title: 'The guns of Navarone'}
                ];
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({data: books});
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {                                     // TODO: any way to throw??????
                    expect(pageCollectionDataSource.total()).to.equal(books.length);
                    done();
                });
            });

            xit('if initialized with a new model, it should throw', function () {
                function testFn() {
                    var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
                        data: books,
                        schema: {
                            model: Book
                        }
                    });
                    pageCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a proper array, the count of pages should match and dirty === false', function (done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({data: pageCollectionData});
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    for (var i = 0; i < pageCollectionData.length; i++) {
                        expect(pageCollectionDataSource.at(i).dirty).to.be.false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, there should be page items', function (done) {
                function test(page) {
                    var dfd = $.Deferred();
                    expect(page).to.be.an.instanceof(kidoju.Page);
                    expect(page.items).to.be.an.instanceof(kidoju.PageItemCollectionDataSource);
                    expect(page.items.parent()).to.equal(page);
                    expect(page.items.total()).to.equal(0);
                    page.load().then(function() {
                        expect(page.items.total()).to.be.gt(0);
                        dfd.resolve();
                    });
                    return dfd.promise();
                }
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({data: pageCollectionData});
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    var promises = [];
                    for (var i = 0; i < pageCollectionData.length; i++) {
                        promises.push(test(pageCollectionDataSource.at(i)));
                    }
                    $.when.apply($, promises).always(done);
                });
            });

            it('if initialized from a kendo.data.DataSource, an exception should be raised', function () {
                var fn = function () {
                    var dataSource = kidoju.PageCollectionDataSource.create(new kendo.data.DataSource({data: []}));
                };
                expect(fn).to.throw(Error);
            });

            it('if initialized from a kidoju.PageCollectionDataSource, the number of pages should match', function (done) {
                var pageCollectionDataSource1 = kidoju.PageCollectionDataSource.create(pageCollectionData);
                var pageCollectionDataSource2 = kidoju.PageCollectionDataSource.create(pageCollectionDataSource1);
                expect(pageCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                expect(new pageCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                )
                    .then(function() {
                        expect(pageCollectionDataSource1.total()).to.equal(pageCollectionData.length);
                        expect(pageCollectionDataSource2.total()).to.equal(pageCollectionData.length);
                        done();
                    });
            });

            it('if initialized from a transport, the number of pages should match', function (done) {
                var pageCollectionDataSource1 = kidoju.PageCollectionDataSource.create(pageCollectionData);
                var pageCollectionDataSource2 = new kidoju.PageCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageCollectionData);
                        }
                    }
                });
                expect(pageCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                expect(new pageCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                )
                    .then(function() {
                        expect(pageCollectionDataSource1.total()).to.equal(pageCollectionData.length);
                        expect(pageCollectionDataSource2.total()).to.equal(pageCollectionData.length);
                        done();
                    });
            });

            it('if initialized from $.ajax, the number of pages and items should match', function (done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                $.when(
                    pageCollectionDataSource.read(),
                    $.getJSON(pageCollectionDataSource.options.transport.read.url)
                ).done(function (response1, response2) {
                        expect(response2).to.be.an.instanceof(Array).that.has.property('length', 3);
                        expect(response2[0]).to.be.an.instanceof(Array);
                        var pageCollectionArray = response2[0];
                        expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                        var promises = [];
                        for (var i = 0; i <  pageCollectionDataSource.total(); i++) {
                            var page = pageCollectionDataSource.at(i);
                            expect(page).to.be.an.instanceof(kidoju.Page);
                            expect(page.items).to.be.an.instanceof(kidoju.PageItemCollectionDataSource);
                            expect(page.items.total()).to.equal(0);
                            /* jshint -W083 */
                            var promise = page.load().done(function () {
                                expect(page.items.total()).to.equal(pageCollectionArray[i].items.length);
                            });
                            /* jshint +W083 */
                            promises.push(promise);
                        }
                        $.when.apply($, promises).then(done);
                    });
            });

        });

        describe('When creating a page', function() {

            it('If dataSource initialized from in-memory array, there should be one page item more', function (done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.add(new kidoju.Page());
                    expect(pageCollectionDataSource.at(pageCollectionData.length).isNew()).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length + 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call create', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageCollectionData);
                        },
                        create: function(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.add(new kidoju.Page());
                    expect(pageCollectionDataSource.at(pageCollectionData.length).isNew()).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length + 1);
                    pageCollectionDataSource.sync()
                        .always(function() {
                            expect(create).to.have.been.called;
                            expect(update).not.to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When updating a page', function() {

            it('If dataSource initialized from in-memory array, there should be one updated page', function (done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    pageCollectionDataSource.at(0).set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call update', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageCollectionData);
                        },
                        create: function(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    pageCollectionDataSource.at(0).set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.sync()
                        .always(function() {
                            expect(create).not.to.have.been.called;
                            expect(update).to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When removing a page', function() {

            it('If dataSource initialized from in-memory array, there should be one page less', function(done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({data: pageCollectionData});
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.remove(pageCollectionDataSource.at(0));
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length - 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call destroy', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
                    transport: {
                        read: function(options) {
                            options.success(pageCollectionData);
                        },
                        create: function(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function() {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.remove(pageCollectionDataSource.at(0));
                    pageCollectionDataSource.sync().then(function() {
                        expect(create).not.to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).to.have.been.called;
                        done();
                    });
                });
            });

        });

        //TODO Group/Aggregate/Serialize

    });

    /*********************************************************************************************************
     * Stream
     *********************************************************************************************************/

    describe('Test Stream', function() {

        //TODO: http://blog.falafel.com/dirty-children-and-kendo-ui/

        describe('When initializing a Stream', function() {

            it('if initialized from an undefined, it should pass', function(done) {
                //Unfortunately, this is a Kendo UI requirement
                var stream = new kidoju.Stream();
                expect(stream).to.have.property('id');
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function() {
                    expect(stream.pages.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object without pages, it should pass', function(done) {
                var stream = new kidoju.Stream({dummy: true});
                expect(stream).to.have.property('id');
                expect(stream.pages).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(stream).to.have.property('dummy', true);             //<------------ TODO: any way to avoid unwanted properties?
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function() {
                    expect(stream.pages.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object with pages and items, it should pass', function(done) {
                var stream = new kidoju.Stream({pages: [
                    { items : [{tool: 'label'}, {tool: 'image'}] },
                    { items : [{tool: 'textbox'}, {tool: 'button'}] }
                ]});
                expect(stream).to.have.property('id');
                expect(stream.pages).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function() {
                    expect(stream.pages.total()).to.equal(2);
                    var page = stream.pages.at(0);
                    expect(page).to.be.an.instanceof(kidoju.Page);
                    expect(stream.pages.load).to.respond;
                    page.load().then(function() {
                        expect(page.items).to.be.an.instanceof(kidoju.PageItemCollectionDataSource);
                        expect(page.items.total()).to.equal(2);
                        done();
                    });
                });
            });

        });

    });

    /*********************************************************************************************************
     * Synchronization with sinonJS
     *
     * TODO: especially consider the position of pages and items in arrays, including changing positions
     * http://docs.mongodb.org/manual/reference/operator/update/position/
     *
     *********************************************************************************************************/

    describe('Test a complex schema with sinonJS', function() {

        //See http://docs.telerik.com/kendo-ui/framework/hierarchicaldatasource/overview#binding-a-hierarchicaldatasource-to-remote-data-with-multiple-service-end-points

        var stream, pages, items;

        before(function() {

            pages = {
                read: sinon.spy(),
                create: sinon.spy(),
                update: sinon.spy(),
                destroy: sinon.spy()
            };

            items = {
                read: sinon.spy(),
                create: sinon.spy(),
                update: sinon.spy(),
                destroy: sinon.spy()
            };

            var SuperStream = kidoju.Stream.define({
                pages: {
                    transport: {
                        read: function (options) {
                            pages.read(options);
                            window.console.log('reading pages...');
                            options.success([{id: kendo.guid()}]);
                        },
                        create: function (options) {
                            pages.create(options);
                            window.console.log('creating pages...');
                            options.success(options.data);
                        },
                        update: function (options) {
                            pages.update(options);
                            window.console.log('updating pages...');
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            pages.destroy(options);
                            window.console.log('deleting pages...');
                            options.success(options.data);
                        }
                    },
                    schema: {
                        model: {
                            items: {
                                transport: {
                                    read: function (options) {
                                        items.read(options);
                                        window.console.log('reading items...');
                                        options.success([{id: kendo.guid(), tool: 'label'}]);
                                    },
                                    create: function (options) {
                                        items.create(options);
                                        window.console.log('creating items...');
                                        options.success(options.data);
                                    },
                                    update: function (options) {
                                        items.update(options);
                                        window.console.log('updating items...');
                                        options.success(options.data);
                                    },
                                    destroy: function (options) {
                                        items.destroy(options);
                                        window.console.log('deleting items...');
                                        options.success(options.data);
                                    }
                                }
                            }
                        }
                    }
                }
            });

            stream =  new SuperStream();

        });

        it('Reading', function(done) {
            stream.load().always(function() {
                expect(pages.read).to.have.been.called;
                stream.pages.at(0).load().always(function() {
                    expect(items.read).to.have.been.called;
                    done();
                });
            });

        });

        it('Creating', function(done) {
            stream.pages.add({});
            stream.pages.at(0).items.add({tool: 'label'});
            stream.pages.sync().always(function() {
                expect(pages.create).to.have.been.called;
                stream.pages.at(0).items.sync().always(function() {
                    expect(items.create).to.have.been.called;
                    done();
                });
            });
        });

    });

    /*********************************************************************************************************
     * Synchronization localForage
     *********************************************************************************************************/

    xdescribe('Test synchronization with localForage', function() {

        it('TODO', function() {

        });

        //TODO: Test option batch: true

    });


}(this, jQuery));
