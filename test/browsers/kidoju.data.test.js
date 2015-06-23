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
        kidoju = window.kidoju,
        localStorage = window.localStorage;

    var pageItemCollectionData = [
        { id: kendo.guid(), tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
        { id: kendo.guid(), tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
        { id: kendo.guid(), tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield1' } },
        { id: kendo.guid(), tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
        { id: kendo.guid(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield2' } },
        { id: kendo.guid(), tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
        { id: kendo.guid(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
    ];

    var pageCollectionData = [
        {
            id: kendo.guid(),
            components: [
                { id: kendo.guid(), tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
                { id: kendo.guid(), tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
                { id: kendo.guid(), tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield1' } }
            ]
        },
        {
            id: kendo.guid(),
            components: [
                { id: kendo.guid(), tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
                { id: kendo.guid(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield2' } }
            ]
        },
        {
            id: kendo.guid(),
            components: [
                { id: kendo.guid(), tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
                { id: kendo.guid(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
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
        {id: kendo.guid(), title: 'Gone with the wind'},
        {id: kendo.guid(), title: 'OK Coral'},
        {id: kendo.guid(), title: 'The third man'},
        {id: kendo.guid(), title: 'The guns of Navarone'}
    ];

    function dataUrl(file) {
        if (window.__karma__) {
            return '/base/test/data/' + file;
        } else {
            return '../data/' + file;
        }
    }

    /*********************************************************************************************************
     * PageComponent
     *********************************************************************************************************/

    describe('Test PageComponent', function () {

        describe('When initializing a PageComponent', function () {

            it('if initialized from an undefined, it should pass although tool is null', function () {
                // Unfortunately, this is a Kendo UI requirement
                var component = new kidoju.PageComponent();
                expect(component).to.have.property('id');
                expect(component).to.have.property('tool').that.is.null;
            });

            it('if initialized from an object without tool, it should throw', function () {
                function testFn() {
                    var component = new kidoju.PageComponent({dummy: true});
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from an object with an invalid tool, it should throw', function () {
                function testFn() {
                    var component = new kidoju.PageComponent({tool: 'dummy'});
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a valid object, it should pass', function () {
                var component = new kidoju.PageComponent({tool: 'label'});
                expect(component).to.be.an.instanceof(kidoju.PageComponent);
            });

            it('if initialized from a complete label, it should pass', function () {
                var obj = {
                        id: kendo.guid(),
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
                    component = new kidoju.PageComponent(obj);
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (prop === 'attributes' || prop === 'properties') {
                            for (var subprop in obj[prop]) {
                                if (obj[prop].hasOwnProperty(subprop)) {
                                    expect(component[prop][subprop]).to.equal(obj[prop][subprop]);
                                }
                            }
                        } else {
                            expect(component[prop]).to.equal(obj[prop]);
                        }
                    }
                }
            });

            it('if initialized from a complete image, it shoud pass', function () {
                var obj = {
                        id: kendo.guid(),
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
                    component = new kidoju.PageComponent(obj);

            });

            it('if initialized from a complete textbox, it shoud pass', function () {
                var component = new kidoju.PageComponent({
                    id: kendo.guid(),
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
     * PageComponentCollectionDataSource
     *********************************************************************************************************/

    describe('Test PageComponentCollectionDataSource', function () {

        describe('When initializing a PageComponentCollectionDataSource', function (done) {

            it('if initialized from an empty array, the count of components should match', function (done) {
                var pageItemCollectionDataSource1 = new kidoju.PageComponentCollectionDataSource();
                var pageItemCollectionDataSource2 = new kidoju.PageComponentCollectionDataSource({ data: [] });
                expect(pageItemCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageItemCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                expect(new pageItemCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                $.when(
                    pageItemCollectionDataSource1.read(),
                    pageItemCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageItemCollectionDataSource1.total()).to.equal(0);
                        expect(pageItemCollectionDataSource2.total()).to.equal(0);
                        done();
                    });
            });

            it('if initialized from a stupid array (components have no valid tool), it should throw', function () {
                function testFn() {
                    var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({data: books});
                    pageItemCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            xit('if initialized with a new model, it should throw', function () {
                function testFn() {
                    var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({
                        data: books,
                        schema: {
                            model: Book
                        }
                    });
                    pageItemCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a proper array, the count of components should match and dirty === false', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    for (var i = 0; i < pageItemCollectionData.length; i++) {
                        expect(pageItemCollectionDataSource.at(i).dirty).to.be.false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, attributes and properties should be instances of kendo.data.Model', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    for (var i = 0; i < pageItemCollectionData.length; i++) {
                        expect(pageItemCollectionDataSource.at(i).attributes).to.be.an.instanceof(kendo.data.Model);
                        expect(pageItemCollectionDataSource.at(i).properties).to.be.an.instanceof(kendo.data.Model);
                    }
                    done();
                });
            });

            it('if initialized from a kendo.data.DataSource that is not a kendo.PageComponentCollectionDataSource, it should throw', function () {
                var testFn = function () {
                    var dataSource = kidoju.PageComponentCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
                };
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a kidoju.PageComponentCollectionDataSource, the number of components should match', function (done) {
                var pageItemCollectionDataSource1 = kidoju.PageComponentCollectionDataSource.create(pageItemCollectionData);
                var pageItemCollectionDataSource2 = kidoju.PageComponentCollectionDataSource.create(pageItemCollectionDataSource1);
                expect(pageItemCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageItemCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                expect(new pageItemCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                $.when(
                    pageItemCollectionDataSource1.read(),
                    pageItemCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageItemCollectionDataSource1.total()).to.equal(pageItemCollectionData.length);
                        expect(pageItemCollectionDataSource2.total()).to.equal(pageItemCollectionData.length);
                        done();
                    });
            });

            it('if initialized from a transport, the number of components should match', function (done) {
                var pageItemCollectionDataSource1 = kidoju.PageComponentCollectionDataSource.create(pageItemCollectionData);
                var pageItemCollectionDataSource2 = new kidoju.PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageItemCollectionData);
                        }
                    }
                });
                expect(pageItemCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageItemCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource1.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                expect(new pageItemCollectionDataSource2.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                $.when(
                    pageItemCollectionDataSource1.read(),
                    pageItemCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageItemCollectionDataSource1.total()).to.equal(pageItemCollectionData.length);
                        expect(pageItemCollectionDataSource2.total()).to.equal(pageItemCollectionData.length);
                        done();
                    });
            });

            it('if initialized from $.ajax, the number of components should match', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageComponentCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                $.when(
                    pageItemCollectionDataSource.read(),
                    $.getJSON(pageItemCollectionDataSource.options.transport.read.url)
                ).done(function (response1, response2) {
                        expect(response2).to.be.an.instanceof(Array).that.has.property('length', 3);
                        expect(response2[0]).to.be.an.instanceof(Array);
                        expect(pageItemCollectionDataSource.total()).to.equal(response2[0].length);
                        var pageItem = pageItemCollectionDataSource.at(0);
                        expect(pageItem).to.be.an.instanceof(kidoju.PageComponent);
                        done();
                    }
                );
            });

        });

        describe('When creating a page component', function () {

            it('If dataSource initialized from in-memory array, there should be one page component more', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.add(new kidoju.PageComponent({ tool: 'label' }));
                    expect(pageItemCollectionDataSource.at(pageItemCollectionData.length).isNew()).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length + 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call create', function (done) {
                var create = sinon.spy(),
                    update = sinon.spy(),
                    destroy = sinon.spy();
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageItemCollectionData);
                        },
                        create: function (options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function (options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.add(new kidoju.PageComponent({tool: 'label'}));
                    expect(pageItemCollectionDataSource.at(pageItemCollectionData.length).isNew()).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length + 1);
                    pageItemCollectionDataSource.sync()
                        .always(function () {
                            expect(create).to.have.been.called;
                            expect(update).not.to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When updating a page component', function () {

            it('If dataSource initialized from in-memory array, there should be one updated page component', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
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
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageItemCollectionData);
                        },
                        create: function (options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function (options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
                    pageItemCollectionDataSource.at(0).set('top', 111);
                    expect(pageItemCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.sync()
                        .always(function () {
                            expect(create).not.to.have.been.called;
                            expect(update).to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When removing a page component', function () {

            it('If dataSource initialized from in-memory array, there should be one page component less', function (done) {
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({ data: pageItemCollectionData });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
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
                var pageItemCollectionDataSource = new kidoju.PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageItemCollectionData);
                        },
                        create: function (options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function (options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageItemCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageItemCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.PageComponent);
                pageItemCollectionDataSource.read().then(function () {
                    expect(pageItemCollectionDataSource.total()).to.equal(pageItemCollectionData.length);
                    pageItemCollectionDataSource.remove(pageItemCollectionDataSource.at(0));
                    pageItemCollectionDataSource.sync().then(function () {
                        expect(create).not.to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).to.have.been.called;
                        done();
                    });
                });
            });

        });

        // TODO Filter, Query, Group, Aggregate, Serialize
    });

    /*********************************************************************************************************
     * Page
     *********************************************************************************************************/

    describe('Test Page', function () {

        // TODO: http://blog.falafel.com/dirty-children-and-kendo-ui/

        describe('When initializing a Page', function (done) {

            it('if initialized from an undefined, it should pass', function (done) {
                // Unfortunately, this is a Kendo UI requirement
                var page = new kidoju.Page();
                expect(page).to.have.property('id');
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object without components, it should pass', function (done) {
                var page = new kidoju.Page({dummy: true});
                expect(page).to.have.property('id');
                expect(page).to.have.property('dummy', true);             // <------------ TODO: any way to avoid unwanted properties?
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object with components, it should pass', function (done) {
                var page = new kidoju.Page({components: [{tool: 'label'}, {tool: 'image'}]});
                expect(page).to.have.property('id');
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(2);
                    done();
                });
            });

        });

    });

    /*********************************************************************************************************
     * PageCollectionDataSource
     *********************************************************************************************************/

    describe('Test PageCollectionDataSource', function () {

        describe('When initializing a PageCollectionDataSource', function () {

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
                pageCollectionDataSource.read().then(function () {                                     // TODO: any way to throw??????
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
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    for (var i = 0; i < pageCollectionData.length; i++) {
                        expect(pageCollectionDataSource.at(i).dirty).to.be.false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, there should be page components', function (done) {
                function test(page) {
                    var dfd = $.Deferred();
                    expect(page).to.be.an.instanceof(kidoju.Page);
                    expect(page.components).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                    expect(page.components.parent()).to.equal(page);
                    expect(page.components.total()).to.equal(0);
                    page.load().then(function () {
                        expect(page.components.total()).to.be.gt(0);
                        dfd.resolve();
                    });
                    return dfd.promise();
                }
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({data: pageCollectionData});
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
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
                    .then(function () {
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
                    .then(function () {
                        expect(pageCollectionDataSource1.total()).to.equal(pageCollectionData.length);
                        expect(pageCollectionDataSource2.total()).to.equal(pageCollectionData.length);
                        done();
                    });
            });

            it('if initialized from $.ajax, the number of pages and components should match', function (done) {
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
                            expect(page.components).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                            expect(page.components.total()).to.equal(0);
                            /* jshint -W083 */
                            var promise = page.load().done(function () {
                                expect(page.components.total()).to.equal(pageCollectionArray[i].components.length);
                            });
                            /* jshint +W083 */
                            promises.push(promise);
                        }
                        $.when.apply($, promises).then(done);
                    });
            });

        });

        describe('When creating a page', function () {

            it('If dataSource initialized from in-memory array, there should be one page component more', function (done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
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
                        read: function (options) {
                            options.success(pageCollectionData);
                        },
                        create: function (options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function (options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.add(new kidoju.Page());
                    expect(pageCollectionDataSource.at(pageCollectionData.length).isNew()).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length + 1);
                    pageCollectionDataSource.sync()
                        .always(function () {
                            expect(create).to.have.been.called;
                            expect(update).not.to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When updating a page', function () {

            it('If dataSource initialized from in-memory array, there should be one updated page', function (done) {
                var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
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
                        read: function (options) {
                            options.success(pageCollectionData);
                        },
                        create: function (options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function (options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
                    pageCollectionDataSource.at(0).set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.sync()
                        .always(function () {
                            expect(create).not.to.have.been.called;
                            expect(update).to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                });
            });

        });

        describe('When removing a page', function () {

            it('If dataSource initialized from in-memory array, there should be one page less', function (done) {
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
                        read: function (options) {
                            options.success(pageCollectionData);
                        },
                        create: function (options) {
                            create(options);
                            options.success(options.data);
                        },
                        update: function (options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy: function (options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(kidoju.Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionData.length);
                    pageCollectionDataSource.remove(pageCollectionDataSource.at(0));
                    pageCollectionDataSource.sync().then(function () {
                        expect(create).not.to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).to.have.been.called;
                        done();
                    });
                });
            });

        });

        // TODO Group/Aggregate/Serialize

    });

    /*********************************************************************************************************
     * Stream
     *********************************************************************************************************/

    describe('Test Stream', function () {

        // TODO: http://blog.falafel.com/dirty-children-and-kendo-ui/

        describe('When initializing a Stream', function () {

            it('if initialized from an undefined, it should pass', function (done) {
                // Unfortunately, this is a Kendo UI requirement
                var stream = new kidoju.Stream();
                expect(stream).to.have.property('id');
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object without pages, it should pass', function (done) {
                var stream = new kidoju.Stream({dummy: true});
                expect(stream).to.have.property('id');
                expect(stream.pages).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(stream).to.have.property('dummy', true);             // <------------ TODO: any way to avoid unwanted properties?
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object with pages and components, it should pass', function (done) {
                var stream = new kidoju.Stream({pages: [
                    { components : [{tool: 'label'}, {tool: 'image'}] },
                    { components : [{tool: 'textbox'}, {tool: 'button'}] }
                ]});
                expect(stream).to.have.property('id');
                expect(stream.pages).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(2);
                    var page = stream.pages.at(0);
                    expect(page).to.be.an.instanceof(kidoju.Page);
                    expect(stream.pages.load).to.respond;
                    page.load().then(function () {
                        expect(page.components).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                        expect(page.components.total()).to.equal(2);
                        done();
                    });
                });
            });

        });

    });

    /*********************************************************************************************************
     * Synchronization with sinonJS
     *
     * TODO: especially consider the position of pages and components in arrays, including changing positions
     * http://docs.mongodb.org/manual/reference/operator/update/position/
     *
     *********************************************************************************************************/

    describe('Test a complex schema with sinonJS', function () {

        // See http://docs.telerik.com/kendo-ui/framework/hierarchicaldatasource/overview#binding-a-hierarchicaldatasource-to-remote-data-with-multiple-service-end-points

        var stream, pages, components;

        describe('Syncing at various levels of the hierarchy', function () {

            before(function () {
                var SuperStream = kidoju.Stream.define({
                    pages: {
                        transport: {
                            read: function (options) {
                                pages.read(options);
                                // window.console.log('reading pages...');
                                options.success([{id: kendo.guid()}]);
                            },
                            create: function (options) {
                                pages.create(options);
                                // window.console.log('creating pages...');
                                options.data.id = kendo.guid(); // id set on server
                                options.success(options.data);
                            },
                            update: function (options) {
                                pages.update(options);
                                // window.console.log('updating pages...');
                                options.success(options.data);
                            },
                            destroy: function (options) {
                                pages.destroy(options);
                                // window.console.log('deleting pages...');
                                options.success(options.data);
                            }
                        },
                        schema: {
                            model: {
                                components: {
                                    transport: {
                                        read: function (options) {
                                            components.read(options);
                                            // window.console.log('reading components...');
                                            options.success([{id: kendo.guid(), tool: 'label'}]);
                                        },
                                        create: function (options) {
                                            components.create(options);
                                            // window.console.log('creating components...');
                                            options.data.id = kendo.guid(); // id set on server
                                            options.success(options.data);
                                        },
                                        update: function (options) {
                                            components.update(options);
                                            // window.console.log('updating components...');
                                            options.success(options.data);
                                        },
                                        destroy: function (options) {
                                            components.destroy(options);
                                            // window.console.log('deleting components...');
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

            beforeEach(function () {
                pages = {
                    read: sinon.spy(),
                    create: sinon.spy(),
                    update: sinon.spy(),
                    destroy: sinon.spy()
                };

                components = {
                    read: sinon.spy(),
                    create: sinon.spy(),
                    update: sinon.spy(),
                    destroy: sinon.spy()
                };
            });

            it('Reading', function (done) {
                stream.load().always(function () {
                    expect(pages.read).to.have.been.calledOnce;
                    expect(components.read).not.to.have.been.called;
                    expect(stream.pages.total()).to.equal(1);
                    stream.pages.at(0).load().always(function () {
                        expect(components.read).to.have.been.calledOnce;
                        expect(stream.pages.at(0).components.total()).to.equal(1);
                        done();
                    });
                });

            });

            it('Creating', function (done) {
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(2);
                stream.pages.at(1).components.add({tool: 'label'});
                stream.pages.at(1).components.add({tool: 'textbox'});
                expect(stream.pages.total()).to.equal(2);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                var promises = [
                    stream.pages.sync(),
                    stream.pages.at(1).components.sync()
                ];
                $.when.apply($, promises).always(function () {
                    expect(pages.create).to.have.been.calledOnce;
                    expect(components.create).to.have.been.calledTwice;
                    done();
                });
            });

            it('Updating', function (done) {
                stream.pages.at(1).set('style', 'background-color: #FF0000;');
                stream.pages.at(1).components.at(0).set('top', 50);
                stream.pages.at(1).components.at(0).set('left', 50);
                expect(stream.pages.total()).to.equal(2);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                var promises = [
                    stream.pages.sync(),
                    stream.pages.at(1).components.sync()
                ];
                $.when.apply($, promises).always(function () {
                    expect(pages.update).to.have.been.calledOnce;
                    expect(components.update).to.have.been.calledOnce;
                    done();
                });
            });

            it('Deleting', function (done) {
                expect(stream.pages.total()).to.equal(2);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages.at(0).components.remove(stream.pages.at(0).components.at(0));
                expect(stream.pages.at(0).components.total()).to.equal(0);
                stream.pages.remove(stream.pages.at(1));
                expect(stream.pages.total()).to.equal(1);
                var promises = [
                    stream.pages.at(0).components.sync(),
                    stream.pages.sync()
                ];
                $.when.apply($, promises).always(function () {
                    expect(pages.destroy).to.have.been.calledOnce;
                    expect(components.destroy).to.have.been.calledOnce;
                    done();
                });
            });
        });

        describe('Same with batch: true', function () {

            before(function () {
                var SuperStream = kidoju.Stream.define({
                    pages: {
                        transport: {
                            read: function (options) {
                                pages.read(options);
                                // window.console.log('reading pages...');
                                options.success([{id: kendo.guid()}]);
                            },
                            create: function (options) {
                                pages.create(options);
                                // window.console.log('creating pages...');
                                if ($.isArray(options.data.models)) {
                                    $.each(options.data.models, function (index, model) {
                                        model.id = kendo.guid(); // id set on server
                                    });
                                }
                                options.success(options.data.models);
                            },
                            update: function (options) {
                                pages.update(options);
                                // window.console.log('updating pages...');
                                options.success(options.data.models);
                            },
                            destroy: function (options) {
                                pages.destroy(options);
                                // window.console.log('deleting pages...');
                                options.success(options.data.models);
                            }
                        },
                        batch: true,
                        schema: {
                            model: {
                                components: {
                                    transport: {
                                        read: function (options) {
                                            components.read(options);
                                            // window.console.log('reading components...');
                                            options.success([{id: kendo.guid(), tool: 'label'}]);
                                        },
                                        create: function (options) {
                                            components.create(options);
                                            // window.console.log('creating components...');
                                            if ($.isArray(options.data.models)) {
                                                $.each(options.data.models, function (index, model) {
                                                    model.id = kendo.guid(); // id set on server
                                                });
                                            }
                                            options.success(options.data.models);
                                        },
                                        update: function (options) {
                                            components.update(options);
                                            // window.console.log('updating components...');
                                            options.success(options.data.models);
                                        },
                                        destroy: function (options) {
                                            components.destroy(options);
                                            // window.console.log('deleting components...');
                                            options.success(options.data.models);
                                        }
                                    },
                                    batch: true
                                }
                            }
                        }
                    }
                });
                stream =  new SuperStream();
            });

            beforeEach(function () {
                pages = {
                    read: sinon.spy(),
                    create: sinon.spy(),
                    update: sinon.spy(),
                    destroy: sinon.spy()
                };

                components = {
                    read: sinon.spy(),
                    create: sinon.spy(),
                    update: sinon.spy(),
                    destroy: sinon.spy()
                };
            });

            it('Reading', function (done) {
                stream.load().always(function () {
                    expect(pages.read).to.have.been.called;
                    expect(components.read).not.to.have.been.called;
                    expect(stream.pages.total()).to.equal(1);
                    stream.pages.at(0).load().always(function () {
                        expect(components.read).to.have.been.called;
                        expect(stream.pages.at(0).components.total()).to.equal(1);
                        done();
                    });
                });

            });

            it('Creating', function (done) {
                stream.pages.add({});
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(3);
                stream.pages.at(1).components.add({tool: 'label'});
                stream.pages.at(1).components.add({tool: 'textbox'});
                stream.pages.at(2).components.add({tool: 'label'});
                stream.pages.at(2).components.add({tool: 'textbox'});
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                var promises = [
                    stream.pages.sync(),
                    stream.pages.at(1).components.sync(),
                    stream.pages.at(2).components.sync()
                ];
                $.when.apply($, promises).always(function () {
                    expect(pages.create).to.have.been.calledOnce;
                    expect(components.create).to.have.been.calledTwice;
                    done();
                });
            });

            it('Updating', function (done) {
                stream.pages.at(1).set('style', 'background-color: #FF0000;');
                stream.pages.at(1).components.at(0).set('top', 50);
                stream.pages.at(1).components.at(0).set('left', 50);
                stream.pages.at(2).components.at(0).set('top', 50);
                stream.pages.at(2).components.at(0).set('left', 50);
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                var promises = [
                    stream.pages.sync(),
                    stream.pages.at(1).components.sync(),
                    stream.pages.at(2).components.sync()
                ];
                $.when.apply($, promises).always(function () {
                    expect(pages.update).to.have.been.calledOnce;
                    expect(components.update).to.have.been.calledTwice;
                    done();
                });
            });

            it('Deleting', function (done) {
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages.at(1).components.remove(stream.pages.at(1).components.at(1));
                stream.pages.at(2).components.remove(stream.pages.at(2).components.at(1));
                expect(stream.pages.at(1).components.total()).to.equal(1);
                expect(stream.pages.at(2).components.total()).to.equal(1);
                var promises = [
                    stream.pages.at(1).components.sync(),
                    stream.pages.at(2).components.sync(),
                    stream.pages.sync()
                ];
                $.when.apply($, promises).always(function () {
                    expect(pages.destroy).not.to.have.been.called;
                    expect(components.destroy).to.have.been.calledTwice;
                    done();
                });
            });

            it('Mixing operations and saving stream', function (done) {
                // window.console.log('--------------');
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(1);
                expect(stream.pages.at(2).components.total()).to.equal(1);
                // page 0
                stream.pages.at(0).set('style', 'border 1px #0000FF;');
                stream.pages.at(0).components.at(0).set('rotate', 45);
                stream.pages.at(0).components.add({tool: 'button'});
                stream.pages.at(0).components.at(1).set('top', 120);
                stream.pages.at(0).components.at(1).set('left', 120);
                // page 1
                stream.pages.remove(stream.pages.at(1));
                // page 2
                stream.pages.at(1).set('style', 'padding: 10px');
                stream.pages.at(1).components.remove(stream.pages.at(1).components.at(0));
                stream.pages.at(1).components.add({tool: 'textbox'});
                stream.pages.at(0).components.at(0).set('rotate', 45);
                stream.save().always(function () {
                    expect(pages.update).to.have.callCount(1);
                    expect(pages.destroy).to.have.callCount(1);
                    expect(components.create).to.have.callCount(2);
                    expect(components.update).to.have.callCount(1);
                    expect(components.destroy).to.have.callCount(1);
                    done();
                });
            });

        });
    });

    /*********************************************************************************************************
     * Test events
     *********************************************************************************************************/

    describe('Test events', function () {

        describe('change event', function () {

            xit('TODO', function (done) {
                done();
            });

        });

        describe('error event', function () {

            xit('TODO', function (done) {
                done();
            });

        });

    });

    /*********************************************************************************************************
     * Synchronization localStorage
     *********************************************************************************************************/

    describe('Test synchronization with localStorage', function () {

        var storageKey = 'stream',
            stream,
            original = {
                id: kendo.guid(),
                pages: [
                    {
                        id: kendo.guid(),
                        style: 'background-color: #' + Math.random().toString(16).substr(2,6) + ';',
                        components: [
                            { id: kendo.guid(), tool: 'label', attributes: { text: 'What is this logo?', style: 'font-family: Georgia, serif;' }, properties: {} },
                            { id: kendo.guid(), tool: 'image', attributes: { src: 'http://www.google.com/logo.png', alt: 'Google' }, properties: {} },
                            { id: kendo.guid(), tool: 'textbox', attributes: { style: 'border: solid 1px #AAAAAA;' }, properties: { name: 'text1', validation: 'return true;', success: 1, failure: 0, omit: 0 } }
                        ]
                    },
                    {
                        id: kendo.guid(),
                        style: 'background-color: #' + Math.random().toString(16).substr(2,6) + ';',
                        components: [
                            { id: kendo.guid(), tool: 'label', attributes: { text: 'What is this logo?', style: 'font-family: Georgia, serif;' }, properties: {} },
                            { id: kendo.guid(), tool: 'image', attributes: { src: 'http://www.apple.com/logo.png', alt: 'Apple' }, properties: {} },
                            { id: kendo.guid(), tool: 'textbox', attributes: { style: 'border: solid 1px #AAAAAA;' }, properties: { name: 'text2', validation: 'return true;', success: 1, failure: 0, omit: 0 } }
                        ]
                    }
                ]
            };

        describe('Load and save hierarchy as a whole', function () {

            before(function () {
                var SuperStream = kidoju.Stream.define({
                    load: function () {
                        var that = this,
                            dfd = $.Deferred(),
                            stream = localStorage.getItem(storageKey),
                            pages = [];
                        if($.type(stream) === 'string') {
                            try {
                                stream = $.parseJSON(stream);
                            } catch(e) {
                                stream = {};
                            }
                        }
                        if($.isArray(stream.pages)) {
                            pages = stream.pages.slice();
                        }
                        stream.pages = undefined;
                        that.accept(stream);
                        that.pages = new kidoju.PageCollectionDataSource({data: pages});
                        that.pages.fetch()
                            .done(function () {
                                var promises = [];
                                $.each(that.pages.data(), function (index, page) {
                                    promises.push(page.components.fetch());
                                });
                                $.when.apply($, promises)
                                    .done(dfd.resolve)
                                    .fail(dfd.reject);
                            })
                            .fail(dfd.reject);
                        return dfd.promise();
                    },
                    save: function () {
                        // TODO: check changes and avoid saving without changes
                        var that = this,
                            dfd = $.Deferred();
                        if (that.isNew()) {
                            that.accept({id: kendo.guid()});
                        }
                        var data = $.extend(that.toJSON(), { pages : [] });
                        $.each(that.pages.data(), function (pageIdx, page) {
                            if (page.isNew()) {
                                page.accept({id: kendo.guid()});
                            }
                            if (page.dirty) {
                                page.dirty = false;
                            }
                            data.pages.push($.extend(page.toJSON(), { components: [] }));
                            $.each(page.components.data(), function (componentIdx, component) {
                                if (component.isNew()) {
                                    component.accept({id: kendo.guid()});
                                }
                                if (component.dirty) {
                                    component.dirty = false;
                                }
                                data.pages[data.pages.length - 1].components.push(component.toJSON());
                            });
                        });
                        localStorage.setItem(storageKey, kendo.stringify(data));
                        return dfd.resolve().promise();
                    }
                });
                stream = new SuperStream();
                localStorage.removeItem(storageKey);
                localStorage.setItem(storageKey, kendo.stringify(original));
            });

            it('Reading', function (done) {
                stream.load().always(function () {
                    expect(stream.isNew()).to.be.false;
                    expect(stream.dirty).to.be.false;
                    expect(stream).to.have.property('id', original.id);
                    expect(stream).to.have.property('pages').that.is.an.instanceof(kidoju.PageCollectionDataSource);
                    expect(stream.pages.total()).to.equal(2);
                    for (var i = 0; i < stream.pages.total(); i++) {
                        var page = stream.pages.at(i);
                        expect(page.isNew()).to.be.false;
                        expect(page.dirty).to.be.false;
                        expect(page).to.have.property('id', original.pages[i].id);
                        expect(page).to.have.property('style', original.pages[i].style);
                        for (var j = 0; j < page.components.data(); j++) {
                            var component = page.components.at(j);
                            expect(component.isNew()).to.be.false;
                            expect(component.dirty).to.be.false;
                            expect(component).to.have.property('id', original.pages[i].components[j].id);
                            expect(component).to.have.property('tool', original.pages[i].components[j].tool);
                            // TODO: attributes and properties
                        }
                    }
                    done();
                });
            });

            it('Creating and fetching', function (done) {
                var index = stream.pages.total();
                stream.pages.add({});
                stream.pages.at(index).components.fetch().always(function () {
                    done();
                });
            });

            it('Creating', function (done) {
                var index = stream.pages.total();
                stream.pages.add({});
                stream.pages.at(index).components.add({tool: 'label'});
                stream.save().always(function () {
                    var update = $.parseJSON(localStorage.getItem(storageKey));
                    expect(update).to.have.property('id', stream.id);
                    expect(update).to.have.property('pages').that.is.an.instanceof(Array).with.property('length', index + 1);
                    expect(update.pages[index]).to.have.property('id', stream.pages.at(index).id);
                    expect(update.pages[index]).to.have.property('components').that.is.an.instanceof(Array).with.property('length', stream.pages.at(index).components.total());
                    // TODO: attributes and properties
                    done();
                });
            });

            it('Updating', function (done) {
                var index = stream.pages.total() - 1;
                stream.pages.at(index).set('style', 'background-color: #' +  Math.random().toString(16).substr(2,6) + ';');
                stream.pages.at(index).components.at(0).set('top', 100);
                stream.pages.at(index).components.at(0).set('left', 100);
                stream.pages.at(index).components.at(0).set('rotate', 45);
                stream.save().always(function () {
                    var update = $.parseJSON(localStorage.getItem(storageKey));
                    expect(update).to.have.property('id', stream.id);
                    expect(update).to.have.property('pages').that.is.an.instanceof(Array).with.property('length', index + 1);
                    expect(update.pages[index]).to.have.property('id', stream.pages.at(index).id);
                    expect(update.pages[index]).to.have.property('style', stream.pages.at(index).styles);
                    expect(update.pages[index].components[0]).to.have.property('top', stream.pages.at(index).components.at(0).top);
                    expect(update.pages[index].components[0]).to.have.property('left', stream.pages.at(index).components.at(0).left);
                    expect(update.pages[index].components[0]).to.have.property('rotate', stream.pages.at(index).components.at(0).rotate);
                    done();
                });
            });

            it('Deleting', function (done) {
                var index = stream.pages.total() - 1;
                stream.pages.remove(stream.pages.at(index));
                stream.save().always(function () {
                    var update = $.parseJSON(localStorage.getItem(storageKey));
                    expect(update).to.have.property('id', stream.id);
                    expect(update).to.have.property('pages').that.is.an.instanceof(Array).with.property('length', index);
                    done();
                });
            });


        });


        describe('atomized CRUD operations on pages and components', function () {

            xit('TODO', function (done) {
                done();
            });

        });

    });

    /*********************************************************************************************************
     * Miscellanesous to improve code coverage
     *********************************************************************************************************/

    describe('Miscellaneous to improve code coverage', function () {

        it('Stream.append & Page.append', function () {
            var stream = new kidoju.Stream({});
            expect(stream.pages.total()).to.equal(0);
            stream.append({});
            expect(stream.pages.total()).to.equal(1);
            stream.pages.at(0).append({tool: 'label'});
            expect(stream.pages.at(0).components.total()).to.equal(1);
        });

        it('PageComponentCollectionDataSource.insert & PageCollectionDataSource.insert', function () {
            var stream = new kidoju.Stream({});
            expect(stream.pages.total()).to.equal(0);
            stream.pages.insert(0);
            expect(stream.pages.total()).to.equal(0);
            stream.pages.insert(0, {});
            expect(stream.pages.total()).to.equal(1);
            expect(stream.pages.at(0).components.total()).to.equal(0);
            stream.pages.at(0).components.insert(0);
            expect(stream.pages.at(0).components.total()).to.equal(0);
            stream.pages.at(0).components.insert(0, {tool: 'label'});
            expect(stream.pages.at(0).components.total()).to.equal(1);
        });


        it('page.stream, component.page, pages.parent & components.parent', function (done) {
            var stream = new kidoju.Stream({
                id: kendo.guid(),
                pages: [
                    {
                        id: kendo.guid(),
                        style: 'background-color: #' + Math.random().toString(16).substr(2, 6) + ';',
                        components: [
                            {
                                id: kendo.guid(),
                                tool: 'label',
                                attributes: {text: 'What is this logo?', style: 'font-family: Georgia, serif;'},
                                properties: {}
                            }
                        ]
                    }
                ]
            });
            stream.pages.fetch().always(function () {
                expect(stream.pages.total()).to.equal(1);
                stream.pages.at(0).components.fetch().always(function () {
                    expect(stream.pages.at(0).components.total()).to.equal(1);
                    expect(stream.pages.parent()).to.equal(stream);
                    expect(stream.pages.at(0).parent()).to.equal(stream.pages.data());
                    expect(stream.pages.at(0).components.parent()).to.equal(stream.pages.at(0));
                    expect(stream.pages.at(0).components.at(0).parent()).to.equal(stream.pages.at(0).components.data());
                    expect(stream.pages.at(0).stream()).to.equal(stream);
                    expect(stream.pages.at(0).components.at(0).page()).to.equal(stream.pages.at(0));
                    done();
                });
            });
        });

        // TODO: Stream.loaded and Page.loaded?????


        // TODO: PageCollectionDataSource.getObjectFromProperties


        if (!window.__karma__) { // This tests breaks further tests in Karma
            it('Missing Kidoju tools', function () {

                delete kidoju.tools;
                var fn = function () {
                    var pageItem = new kidoju.PageComponent({});
                };
                expect(fn).to.throw(Error);
            });
        }

    });


}(this, jQuery));
