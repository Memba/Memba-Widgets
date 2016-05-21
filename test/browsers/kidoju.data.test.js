/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

/* This function has too many statements. */
/* jshint -W071 */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var localStorage = window.localStorage;
    var kendo = window.kendo;
    var kidoju = window.kidoju;
    var Model = kidoju.data.Model;
    var WorkerPool = kidoju.data.WorkerPool;
    var PageComponent = kidoju.data.PageComponent;
    var Page = kidoju.data.Page;
    var Stream = kidoju.data.Stream;
    var DataSource = kidoju.data.DataSource;
    var PageComponentCollectionDataSource = kidoju.data.PageComponentCollectionDataSource;
    var PageCollectionDataSource = kidoju.data.PageCollectionDataSource;

    /**
     * MongoDB-like id generator
     */
    function ObjectId() {
        return 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, function () {
            /* jshint -W016 */
            return (Math.random() * 16|0).toString(16);
            /* jshint +W016 */
        });
    }

    var pageComponentCollectionArray = [
        { id: ObjectId(), tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
        { id: ObjectId(), tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
        { id: ObjectId(), tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield1' } },
        { id: ObjectId(), tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
        { id: ObjectId(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield2' } },
        { id: ObjectId(), tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
        { id: ObjectId(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
    ];

    var pageCollectionArray = [
        {
            id: ObjectId(),
            components: [
                { id: ObjectId(), tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
                { id: ObjectId(), tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
                { id: ObjectId(), tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield1' } }
            ]
        },
        {
            id: ObjectId(),
            components: [
                { id: ObjectId(), tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
                { id: ObjectId(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield2' } }
            ]
        },
        {
            id: ObjectId(),
            components: [
                { id: ObjectId(), tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
                { id: ObjectId(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
            ]
        }
    ];

    function dataUrl(file) {
        if (window.__karma__) {
            return '/base/test/data/' + file;
        } else {
            return '../data/' + file;
        }
    }

    /*********************************************************************************
     * Base Model and DataSource
     *********************************************************************************/

    describe('Problems we had to solve with kendo.data.Model which lead to creating kidoju.data.Model', function () {

        describe('When instantiating a kidoju.data.Model: init and accept', function () {

            var definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    date: {
                        type: 'date',
                        nullable: true,
                        editable: false
                    }
                }
            };
            var BadModel = kendo.data.Model.define(definition);
            var FixedModel = Model.define(definition);

            it('it should assign default values any time fields are not initialized', function () {

                // This test should allow us to detect fixes in future versions of Kendo UI
                // in view to remove our custom code to fix kendo.data.Model...

                var def = {
                        id: 'id',
                        fields: {
                            id: { type: 'string', nullable: true, editable: false },
                            title: { type: 'string', defaultValue: 'hey' },
                            dob: { type: 'date' },
                            age: { type: 'number', defaultValue: 10 }
                        }
                    };

                function TestBad() {
                    var Test = kendo.data.Model.define(def);
                    var t1 = new Test();
                    var t2 = new Test({});
                    var t3 = new Test({ id: '1' });

                    expect(t1.id).to.be.null;
                    expect(t1).to.have.property('title', 'hey');
                    expect(t1).to.have.property('dob').that.is.a('date');
                    expect(t1).to.have.property('age', 10);

                    expect(t2.id).to.be.null;
                    expect(t2).to.have.property('title', 'hey');
                    expect(t2).to.have.property('dob').that.is.a('date');
                    expect(t2).to.have.property('age', 10);

                    // undefined fields is the problem to fix
                    expect(t3).to.have.property('id', '1');
                    expect(t3.title).to.be.undefined;
                    expect(t3.dob).to.be.undefined;
                    expect(t3.age).to.be.undefined;
                }

                function TestFixed() {
                    var Test = Model.define(def);
                    var t1 = new Test();
                    var t2 = new Test({});
                    var t3 = new Test({ id: '1' });

                    expect(t1.id).to.be.null;
                    expect(t1).to.have.property('title', 'hey');
                    expect(t1).to.have.property('dob').that.is.a('date');
                    expect(t1).to.have.property('age', 10);

                    expect(t2.id).to.be.null;
                    expect(t2).to.have.property('title', 'hey');
                    expect(t2).to.have.property('dob').that.is.a('date');
                    expect(t2).to.have.property('age', 10);

                    // undefined fields have been fixed in kidoju.data.Model
                    expect(t3).to.have.property('id', '1');
                    expect(t3).to.have.property('title', 'hey');
                    expect(t3).to.have.property('dob').that.is.a('date');
                    expect(t3).to.have.property('age', 10);
                }

                // Division into TestBad & TestFixed fixes jshint error: `This function has too many statements.`
                TestBad();
                TestFixed();

            });

            it('We expect to parse values on init and accept', function () {

                var past = new Date(1966, 14, 2);
                var pastId = ObjectId();
                var now = new Date();
                var nowId = ObjectId();
                var initObj = {
                    id: pastId,
                    date: past.toISOString()
                };

                function TestBad() {
                    var badObject = new BadModel(initObj);
                    var badChange = false;

                    expect(badObject).to.have.property('id').that.is.equal(pastId);
                    // There lies the problem: the date property is supposed to be a Date and the string value has not been parsed/converted
                    expect(badObject).to.have.property('date').that.is.a('string');
                    expect(badObject.date).to.equal(past.toISOString());

                    badObject.bind('change', function (e) {
                        badChange = true;
                    });

                    badObject.accept({
                        id: nowId,
                        date: now.toISOString()
                    });

                    // Although fields are non-editable, they have been updated which is expected with accept
                    expect(badObject).to.have.property('id').that.is.equal(nowId);
                    // badObject is not dirty, which is expected since we have not called set
                    expect(badObject).to.have.property('dirty').that.is.false;
                    // accordingly the change event has not been raised
                    expect(badChange).to.be.false;

                    // There lies the problem: the date property is supposed to be a Date and the string value has not been parsed/converted
                    expect(badObject).to.have.property('date').that.is.a('string');
                    expect(badObject.date).to.equal(now.toISOString());
                }

                function TestFixed() {
                    var fixedObject = new FixedModel(initObj);
                    var fixedChange = false;

                    expect(fixedObject).to.have.property('id').that.is.equal(pastId);
                    // The fix in kidoju.data.Model is discussed and explained at http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
                    expect(fixedObject).to.have.property('date').that.is.an.instanceof(Date);
                    expect(fixedObject.date.getTime()).to.equal(past.getTime());

                    fixedObject.bind('change', function (e) {
                        fixedChange = true;
                    });

                    fixedObject.accept({
                        id: nowId,
                        date: now.toISOString()
                    });

                    expect(fixedObject).to.have.property('id').that.is.equal(nowId);
                    expect(fixedObject).to.have.property('dirty').that.is.false;
                    expect(fixedChange).to.be.false;

                    // We have fixed our date parsing issue
                    expect(fixedObject).to.have.property('date').that.is.an.instanceof(Date);
                    expect(fixedObject.date.getTime()).to.equal(now.getTime());
                }

                // Division into TestBad & TestFixed fixes jshint error: `This function has too many statements.`
                TestBad();
                TestFixed();

            });

            it('We expect to parse nested models', function () {
                var change = false;
                var Author = Model.define({
                        id: 'userId',
                        fields: {
                            userId: { type: 'string', nullable: true },
                            name: { type: 'string' }
                        }
                    });
                var Book = Model.define({
                        id: 'id',
                        fields: {
                            id: { type: 'string', nullable: true },
                            title: { type: 'string' },
                            author: {
                                defaultValue: null,
                                parse: function (value) {
                                    return value instanceof Author ? value : new Author(value);
                                }
                            }
                        }
                    });
                var book = new Book({
                        id: '1',
                        title: 'Les Misérables',
                        author: {
                            userId: 'a',
                            name: 'Victor Hugo'
                        }
                    });

                book.bind('change', function (e) {
                    change = !change;
                });

                expect(change).to.be.false;
                expect(book.author).to.be.an.instanceof(Author);

                book.accept({
                    id: '2',
                    title: 'La Peste',
                    author: {
                        id: 'b',
                        name: 'Albert Camus'
                    }
                });

                expect(change).to.be.false;
                expect(book.author).to.be.an.instanceof(Author);

                book.set('author', { id: 'c', name: 'Alexandre Dumas' });
                expect(change).to.be.true;
                expect(book.author).to.be.an.instanceof(Author);

            });

            xit('We expect to parse arrays of nested model', function () {

                // TODO

            });

            it('We expect to raise a change event on the parent ObservableObject on accept', function () {

                var past = new Date(1966, 14, 2);
                var pastId = ObjectId();
                var now = new Date();
                var nowId = ObjectId();
                var change = false;
                var viewModel = kendo.observable({
                        badObject: new BadModel({
                            id: pastId,
                            date: past
                        }),
                        fixedObject: new FixedModel({
                            id: pastId,
                            date: past
                        })
                    });

                viewModel.bind('change', function (e) {
                    change = true;
                });

                viewModel.badObject.accept({
                    id: nowId,
                    date: now
                });

                // BadModel inherited from kendo.data.Model does not trigger a change event
                // on the parent observable when changing values via accept method
                expect(change).to.be.false;

                viewModel.fixedObject.accept({
                    id: nowId,
                    date: now
                });

                // FixedModel inherited from our kidoju.data.Model does trigger a change event
                // on the parent observable when changing values via accept method
                expect(change).to.be.true;

            });

            xit('We expect to raise a change event on the parent ObservableArray on accept', function () {

                // TODO + check if good idea.....

            });

        });

        describe('toJSON', function () {

            it('it should serialize a basic object derived from a model and apply new serializable attribute', function () {

                var People = Model.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false
                        },
                        name: {
                            type: 'string'
                        },
                        dob: {
                            type: 'date'
                        },
                        male: {
                            type: 'boolean'
                        },
                        children: {
                            type: 'number'
                        },
                        check: {
                            type: 'string',
                            serializable: false,
                            defaultValue: 'abcd'
                        }
                    }
                });

                var p = { name: 'jack', dob: new Date(), male: true, children: 3, check: '1234', dummy: 'dummy' };
                var people = new People(p);
                var json = $.extend({}, p);

                // remove check which is not serializable
                delete json.check;
                // add missing id which is nullable by default
                json.id = null;

                // remove dummy which is not a defined as a field
                delete json.dummy;

                expect(people.toJSON()).to.deep.equal(json);

            });

            it('it should serialize a complex object derived from a model aggregating a submodel', function () {

                var Author = Model.define({
                    id: 'userId',
                    fields: {
                        userId: { type: 'string', nullable: true },
                        name: { type: 'string', serializable: false }
                    }
                });
                var Book = Model.define({
                    id: 'id',
                    fields: {
                        id: { type: 'string', nullable: true, editable: false },
                        title: { type: 'string' },
                        author: {
                            defaultValue: null,
                            parse: function (value) {
                                return value instanceof Author ? value : new Author(value);
                            }
                        }
                    }
                });
                var b = { id: '1', title: 'Les Misérables', author: { userId: 'a', name: 'Victor Hugo' }};


                var book = new Book(b);
                var json = $.extend({}, b);

                // remove author.name which is not serializable
                delete json.author.name;

                expect(book.toJSON()).to.deep.equal(json);

            });

            it('it should serialize a complex object derived from a model aggregating a dataSource of submodels', function () {

                var Book = Model.define({
                        id: 'id',
                        fields: {
                            id: { type: 'string', nullable: true, editable: false },
                            title: { type: 'string' }
                        }
                    });
                var Author = Model.define({
                        id: 'id',
                        fields: {
                            id: { type: 'string', nullable: true, editable: false },
                            name: { type: 'string' },
                            books: {
                                defaultValue: new DataSource({ data: [], schema: { model: Book } }),
                                parse: function (value) {
                                    return value instanceof DataSource ? value : new DataSource({ data: value, schema: { model: Book } });
                                }
                            }
                        }
                    });

                var a1 = { id: '1', name: 'Victo Hugo' };
                var b1 = { id: 'a', title: 'Les Misérables' };
                var b2 = { id: 'b', title: 'Le Comte de Monte-Cristo' };

                function TestAuthor1() {
                    var author1 = new Author(a1);

                    expect(author1).to.be.an.instanceof(Author);
                    expect(author1.books).to.be.an.instanceof(DataSource);
                    author1.books.read(); // IMPORTANT

                    expect(author1.toJSON()).to.deep.equal(a1);

                    author1.books.add(b1);
                    author1.books.add(new Book(b2));
                    expect(author1.books.at(0)).to.be.an.instanceof(Book);
                    expect(author1.books.at(1)).to.be.an.instanceof(Book);
                    expect(author1.toJSON()).to.deep.equal(a1);
                    expect(author1.toJSON(true)).to.deep.equal($.extend({}, a1, { books: [b1, b2] }));

                }

                function TestAuthor2() {
                    var author2 = new Author($.extend({}, a1, { books: [b1, b2] }));

                    expect(author2).to.be.an.instanceof(Author);
                    expect(author2.books).to.be.an.instanceof(DataSource);
                    author2.books.read(); // IMPORTANT

                    expect(author2.books.at(0)).to.be.an.instanceof(Book);
                    expect(author2.books.at(1)).to.be.an.instanceof(Book);

                    expect(author2.toJSON()).to.deep.equal(a1);
                    expect(author2.toJSON(true)).to.deep.equal($.extend({}, a1, { books: [b1, b2] }));
                }

                // Division into TestAuthor1 & TestAuthor2 fixes jshint error: `This function has too many statements.`
                TestAuthor1();
                TestAuthor2();

            });

        });

        describe('Events', function () {

            it('change event with submodel', function (done) {
                var Author = Model.define({
                        id: 'userId',
                        fields: {
                            userId: { type: 'string', nullable: true },
                            name: { type: 'string' }
                        }
                    });
                var Book = Model.define({
                        id: 'id',
                        fields: {
                            id: { type: 'string', nullable: true },
                            title: { type: 'string' },
                            author: {
                                defaultValue: null,
                                parse: function (value) {
                                    return value instanceof Author ? value : new Author(value);
                                }
                            }
                        }
                    });
                var viewModel = kendo.observable({
                        book: new Book({
                            id: '1',
                            title: 'Les Misérables',
                            author: {
                                userId: 'a',
                                name: 'Victor Hugo'
                            }
                        })
                    });
                viewModel.bind('change', function (e) {
                    expect(e).to.have.property('field', 'book.author.name');
                    done();
                });
                // viewModel.book.set('title', 'Germinal');
                viewModel.book.author.set('name', 'Emile Zola');
            });

            it('change event with subdatasource', function (done) {
                var Book = Model.define({
                    id: 'id',
                    fields: {
                        id: { type: 'string', nullable: true },
                        title: { type: 'string' }
                    }
                });
                var BookDataSource = DataSource.extend({
                    init: function (options) {
                        // Enforce the use of PageWithOptions items in the page collection data source
                        DataSource.fn.init.call(this, $.extend(true, {}, options, { schema: { modelBase: Book, model: Book } }));
                        // Let's use a slightly modified reader to leave data conversions to kidoju.data.Model._parseData
                        this.reader = new kidoju.data.ModelCollectionDataReader(this.reader);
                    }
                });
                var Author = Model.define({
                    id: 'id',
                    fields: {
                        id: { type: 'string', nullable: true },
                        name: { type: 'string' },
                        books: {
                            defaultValue: [],
                            parse: function (value) {
                                return value instanceof BookDataSource ? value : new BookDataSource(value);
                            }
                        }
                    }
                });
                var b = { title: 'Le Compte de Monte-Cristo' };
                var viewModel = kendo.observable({
                    author: new Author({
                        id: ObjectId(),
                        name: 'Victor Hugo',
                        books: [{ id: ObjectId(), title: 'Les Misérables' }]
                    })
                });
                viewModel.bind('change', function (e) {
                    expect(e).to.have.property('action', 'add');
                    expect(e).to.have.property('field', 'author.books');
                    expect(e).to.have.property('items').that.is.an.instanceof(Array).with.property('length', 1);
                    expect(e.items[0]).to.have.property('title', b.title);
                    done();
                });
                viewModel.author.books.add(b);
            });

            xit('error event', function (done) {
                done();
            });

        });

        describe('Data validation', function () {

            xit('validate', function (done) {
                done();
            });

        });


    });

    /*********************************************************************************************************
     * PageComponent
     *********************************************************************************************************/

    describe('Test PageComponent', function () {

        describe('When initializing a PageComponent', function () {

            it('if initialized from an undefined, it should pass although tool is null', function () {
                // Unfortunately, initilization without parameter is a Kendo UI requirement
                var component = new PageComponent();
                // Test default values
                expect(component).to.have.property('attributes').that.is.null;
                expect(component).to.have.property('height', -1);
                expect(component).to.have.property('id').that.is.null;
                expect(component).to.have.property('left', 0);
                expect(component).to.have.property('properties').that.is.null;
                expect(component).to.have.property('rotate', 0);
                expect(component).to.have.property('tag').that.is.null;
                expect(component).to.have.property('tool').that.is.null;
                expect(component).to.have.property('top', 0);
                expect(component).to.have.property('width', -1);
            });

            it('if initialized from an object without tool, it should throw', function () {
                function testFn() {
                    var component = new PageComponent({ dummy: true });
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from an object with an invalid tool, it should throw', function () {
                function testFn() {
                    var component = new PageComponent({ tool: 'dummy' });
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a valid object, it should pass', function () {
                var component = new PageComponent({ tool: 'label' });
                expect(component).to.be.an.instanceof(PageComponent);
            });

            it('if initialized from a complete label, it should pass', function () {
                var obj = {
                        id: ObjectId(),
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
                    };

                function TestObjectProperty(obj, prop) {
                    var component = new PageComponent(obj);
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

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        // Extraction of TestObjectProperty fixes jshint error: `Blocks are nested too deeply`
                        TestObjectProperty(obj, prop);
                    }
                }

            });

            it('if initialized from a complete image, it shoud pass', function () {
                var obj = {
                        id: ObjectId(),
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
                    };
                var component = new PageComponent(obj);

            });

            it('if initialized from a complete textbox, it shoud pass', function () {
                var component = new PageComponent({
                    id: ObjectId(),
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

            xit('if cloned, it should pass', function (done) {
                // TODO
            });

            // TODO Many other components!!!

        });

    });

    /*********************************************************************************************************
     * PageComponentCollectionDataSource
     *********************************************************************************************************/

    describe('Test PageComponentCollectionDataSource', function () {

        describe('When initializing a PageComponentCollectionDataSource', function (done) {

            it('if initialized from an empty array, the count of components should match', function (done) {
                var pageComponentCollectionDataSource1 = new PageComponentCollectionDataSource();
                var pageComponentCollectionDataSource2 = new PageComponentCollectionDataSource({ data: [] });
                expect(pageComponentCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageComponentCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource1.options.schema.model()).to.be.an.instanceof(PageComponent);
                expect(new pageComponentCollectionDataSource2.options.schema.model()).to.be.an.instanceof(PageComponent);
                $.when(
                    pageComponentCollectionDataSource1.read(),
                    pageComponentCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageComponentCollectionDataSource1.total()).to.equal(0);
                        expect(pageComponentCollectionDataSource2.total()).to.equal(0);
                        done();
                    });
            });

            it('if initialized from a stupid array (components have no valid tool), it should throw', function () {
                function testFn() {
                    var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: [{ a: 1, b: 2 }, { a: '1', b: '2' }] });
                    pageComponentCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized with a new model, it should throw', function () {
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
                    { id: ObjectId(), title: 'Gone with the wind' },
                    { id: ObjectId(), title: 'OK Coral' },
                    { id: ObjectId(), title: 'The third man' },
                    { id: ObjectId(), title: 'The guns of Navarone' }
                ];
                function testFn() {
                    var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({
                        data: books,
                        schema: {
                            model: Book
                        }
                    });
                    pageComponentCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a proper array, the count of components should match and dirty === false', function (done) {
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: pageComponentCollectionArray });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    for (var i = 0; i < pageComponentCollectionArray.length; i++) {
                        expect(pageComponentCollectionDataSource.at(i).dirty).to.be.false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, attributes and properties should be instances of kendo.data.Model', function (done) {
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: pageComponentCollectionArray });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    for (var i = 0; i < pageComponentCollectionArray.length; i++) {
                        expect(pageComponentCollectionDataSource.at(i).attributes).to.be.an.instanceof(kendo.data.Model);
                        expect(pageComponentCollectionDataSource.at(i).properties).to.be.an.instanceof(kendo.data.Model);
                    }
                    done();
                });
            });

            it('if initialized from a kendo.data.DataSource that is not a kendo.PageComponentCollectionDataSource, it should throw', function () {
                var testFn = function () {
                    var dataSource = PageComponentCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
                };
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a PageComponentCollectionDataSource, the number of components should match', function (done) {
                var pageComponentCollectionDataSource1 = PageComponentCollectionDataSource.create(pageComponentCollectionArray);
                var pageComponentCollectionDataSource2 = PageComponentCollectionDataSource.create(pageComponentCollectionDataSource1);
                expect(pageComponentCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageComponentCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource1.options.schema.model()).to.be.an.instanceof(PageComponent);
                expect(new pageComponentCollectionDataSource2.options.schema.model()).to.be.an.instanceof(PageComponent);
                $.when(
                    pageComponentCollectionDataSource1.read(),
                    pageComponentCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageComponentCollectionDataSource1.total()).to.equal(pageComponentCollectionArray.length);
                        expect(pageComponentCollectionDataSource2.total()).to.equal(pageComponentCollectionArray.length);
                        done();
                    });
            });

            it('if initialized from a transport, the number of components should match', function (done) {
                var pageComponentCollectionDataSource1 = PageComponentCollectionDataSource.create(pageComponentCollectionArray);
                var pageComponentCollectionDataSource2 = new PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageComponentCollectionArray);
                        }
                    }
                });
                expect(pageComponentCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageComponentCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource1.options.schema.model()).to.be.an.instanceof(PageComponent);
                expect(new pageComponentCollectionDataSource2.options.schema.model()).to.be.an.instanceof(PageComponent);
                $.when(
                    pageComponentCollectionDataSource1.read(),
                    pageComponentCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageComponentCollectionDataSource1.total()).to.equal(pageComponentCollectionArray.length);
                        expect(pageComponentCollectionDataSource2.total()).to.equal(pageComponentCollectionArray.length);
                        done();
                    });
            });

            it('if initialized from $.ajax, the number of components should match', function (done) {
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageComponentCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                $.when(
                    pageComponentCollectionDataSource.read(),
                    $.getJSON(pageComponentCollectionDataSource.options.transport.read.url)
                ).done(function (response1, response2) {
                        expect(response2).to.be.an.instanceof(Array).that.has.property('length', 3);
                        expect(response2[0]).to.be.an.instanceof(Array);
                        expect(pageComponentCollectionDataSource.total()).to.equal(response2[0].length);
                        var pageComponent = pageComponentCollectionDataSource.at(0);
                        expect(pageComponent).to.be.an.instanceof(PageComponent);
                        done();
                    }
                );
            });

        });

        describe('When creating a page component', function () {

            it('If dataSource initialized from in-memory array, there should be one page component more', function (done) {
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: pageComponentCollectionArray });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    pageComponentCollectionDataSource.add(new PageComponent({ tool: 'label' }));
                    expect(pageComponentCollectionDataSource.at(pageComponentCollectionArray.length).isNew()).to.be.true;
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length + 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call create', function (done) {
                var create = sinon.spy();
                var update = sinon.spy();
                var destroy = sinon.spy();
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageComponentCollectionArray);
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
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    pageComponentCollectionDataSource.add(new PageComponent({ tool: 'label' }));
                    expect(pageComponentCollectionDataSource.at(pageComponentCollectionArray.length).isNew()).to.be.true;
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length + 1);
                    pageComponentCollectionDataSource.sync()
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
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: pageComponentCollectionArray });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    pageComponentCollectionDataSource.at(0).set('top', 111);
                    expect(pageComponentCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call update', function (done) {
                var create = sinon.spy();
                var update = sinon.spy();
                var destroy = sinon.spy();
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageComponentCollectionArray);
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
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    pageComponentCollectionDataSource.at(0).set('top', 111);
                    expect(pageComponentCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    pageComponentCollectionDataSource.sync()
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
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: pageComponentCollectionArray });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    pageComponentCollectionDataSource.remove(pageComponentCollectionDataSource.at(0));
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length - 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call destroy', function (done) {
                var create = sinon.spy();
                var update = sinon.spy();
                var destroy = sinon.spy();
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageComponentCollectionArray);
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
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource.total()).to.equal(pageComponentCollectionArray.length);
                    pageComponentCollectionDataSource.remove(pageComponentCollectionDataSource.at(0));
                    pageComponentCollectionDataSource.sync().then(function () {
                        expect(create).not.to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).to.have.been.called;
                        done();
                    });
                });
            });

        });

        describe('toJSON', function () {

            it('it should implement toJSON', function (done) {
                var pageComponentCollectionDataSource = new PageComponentCollectionDataSource({ data: pageComponentCollectionArray });
                expect(pageComponentCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageComponentCollectionDataSource.options.schema.model()).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(function () {
                    expect(pageComponentCollectionDataSource).to.have.property('toJSON').that.is.a('function');
                    var pageComponentCollectionJSON = pageComponentCollectionDataSource.toJSON();
                    // Note: deep.equal of both arrays does not work
                    expect(pageComponentCollectionJSON).to.be.an.instanceof(Array).with.property('length', pageComponentCollectionArray.length);
                    for (var i = 0; i < pageComponentCollectionJSON.length; i++) {
                        expect(pageComponentCollectionJSON[i].attributes.alt).to.equal(pageComponentCollectionArray[i].attributes.alt);
                        // expect(pageComponentCollectionJSON[i].attributes.dirty).to.equal(pageComponentCollectionArray[i].attributes.dirty);
                        expect(pageComponentCollectionJSON[i].attributes.src).to.equal(pageComponentCollectionArray[i].attributes.src);
                        expect(pageComponentCollectionJSON[i].height).to.equal(pageComponentCollectionArray[i].height);
                        expect(pageComponentCollectionJSON[i].id).to.equal(pageComponentCollectionArray[i].id);
                        expect(pageComponentCollectionJSON[i].left).to.equal(pageComponentCollectionArray[i].left);
                        // expect(pageComponentCollectionJSON[i].properties.dirty).to.equal(pageComponentCollectionArray[i].properties.dirty);
                        expect(pageComponentCollectionJSON[i].rotate).to.equal(pageComponentCollectionArray[i].rotate);
                        // expect(pageComponentCollectionJSON[i].tag).to.equal(pageComponentCollectionArray[i].tag);
                        expect(pageComponentCollectionJSON[i].tool).to.equal(pageComponentCollectionArray[i].tool);
                        expect(pageComponentCollectionJSON[i].top).to.equal(pageComponentCollectionArray[i].top);
                        expect(pageComponentCollectionJSON[i].width).to.equal(pageComponentCollectionArray[i].width);
                    }
                    done();
                });
            });

        });

        // TODO Filter, Query, Group, Aggregate, Serialize
    });

    /*********************************************************************************************************
     * Page
     *********************************************************************************************************/

    describe('Test Page', function () {

        describe('When initializing a Page', function (done) {

            it('if initialized from an undefined, it should pass', function (done) {
                // Unfortunately, this is a Kendo UI requirement
                var page = new Page();
                expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('style', '');
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object without components, it should pass', function (done) {
                var page = new Page({ dummy: true });
                expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('style', '');
                expect(page.dummy).to.be.undefined;
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object with components, it should pass', function (done) {
                var page = new Page({ components: [{ tool: 'label' }, { tool: 'image' }] });
                expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('style', '');
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(2);
                    for (var i = 0; i < page.components.total(); i++) {
                        var component = page.components.at(i);
                        expect(component).to.have.property('attributes').that.is.an.instanceof(Model);
                        expect(component).to.have.property('height', -1);
                        expect(component).to.have.property('id').that.is.null;
                        expect(component).to.have.property('left', 0);
                        expect(component).to.have.property('properties').that.is.an.instanceof(Model);
                        expect(component).to.have.property('rotate', 0);
                        expect(component).to.have.property('tag').that.is.null;
                        expect(component).to.have.property('tool').that.is.a('string'); // label or image
                        expect(component).to.have.property('top', 0);
                        expect(component).to.have.property('width', -1);
                    }
                    done();
                });
            });

            it('if cloned from an object with components, it should pass', function (done) {
                var page = new Page({ components: [{ tool: 'label' }, { tool: 'image' }] });
                expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('style', '');
                expect(page.components.fetch).to.respond;
                page.components.fetch().then(function () {
                    expect(page.components.total()).to.equal(2);
                    var clone = page.clone();
                    // TODO
                    done();
                });
            });

        });
    });

    /*********************************************************************************************************
     * WorkerPool
     *********************************************************************************************************/

    xdescribe('Test WorkerPool', function () {

        if (window.PHANTOMJS) {
            // PhantomJS does not support web workers
            return;
        }

        it('large number of tasks', function (done) {
            var workerPool = new WorkerPool(8, 300);
            var length = 500;
            for (var i = 0; i < length; i++) {
                workerPool.add('name' + i, 'kidoju.data.test.workerlib.js', i);
            }
            workerPool.run()
                .done(function () {
                    expect(arguments).to.have.property('length', length);
                    expect(arguments[0]).to.have.property('name', 'name' + 0);
                    expect(arguments[0]).to.have.property('value', 0);
                    expect(arguments[1]).to.have.property('name', 'name' + 1);
                    expect(arguments[1]).to.have.property('value', 1);
                })
                .fail(function (err) {
                    expect(err).to.be.null; // This is not supposed to fail
                })
                .always(function () {
                    done();
                });
        });

        it('blacklisted unsafe functions', function (done) {
            var unsafe = [
                // deactivated
                'ActiveXObject',
                'clearInterval',
                'clearTimeout',
                'eval',
                'fetch',
                'Function',
                'importScripts',
                'indexedDB', 'mozIndexedDB', 'webkitIndexedDB', 'msIndexedDB',
                'requestFileSystem', 'webkitRequestFileSystem',
                'setInterval',
                'setTimeout',
                'XMLHttpRequest',
                'webkitRequestFileSystemSync',
                'webkitResolveLocalFileSystemURL',
                'webkitResolveLocalFileSystemSyncURL',
                'Worker',

                // not deactivated (because it should not exist)
                'localStorage',
                'openDatabase',
                'sessionStorage',
                'SharedWorker'
            ];
            var workerPool = new WorkerPool(2, 250);
            // var blob = new Blob(['onmessage = function (e) { postMessage(self[e.data] === undefined); close(); };']);
            // All paths except a full URL raise error: Uncaught [object DOMException]
            // var blob = new Blob(['importScripts("kidoju.data.workerlib.js"); onmessage = function (e) { postMessage(self[e.data] === undefined); close(); };']);
            // var blob = new Blob(['importScripts("../../src/js/kidoju.data.workerlib.js"); onmessage = function (e) { postMessage(self[e.data] === undefined); close(); };']);
            // var blob = new Blob(['importScripts("/Kidoju.Widgets/src/js/kidoju.data.workerlib.js"); onmessage = function (e) { postMessage(self[e.data] === undefined); close(); };']);
            var scriptUrl = location.protocol + '//' + location.host + (/^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : '') + '/src/js/kidoju.data.workerlib.js';
            var blob = new Blob(['importScripts("' + scriptUrl + '"); onmessage = function (e) { var msg; if ((/indexedDB/i).test(e.data)) { msg = (self[e.data] === undefined) || (self[e.data].open === undefined); } else { msg = (self[e.data] === undefined); console.log(e.data + ": " + typeof self[e.data]); } postMessage(msg); close(); };']);
            var blobURL = window.URL.createObjectURL(blob);
            var i = 0;
            for (i = 0; i < unsafe.length; i++) {
                workerPool.add(unsafe[i], blobURL, unsafe[i]);
            }
            workerPool.run()
                .done(function () {
                    expect(arguments.length).to.equal(unsafe.length);
                    for (i = 0; i < arguments.length; i++) {
                        expect(arguments[i]).to.have.property('name', unsafe[i]);
                        expect(arguments[i]).to.have.property('value', true);
                    }
                })
                .fail(function (err) {
                    expect(err).to.be.null; // This is not supposed to fail
                })
                .always(function () {
                    done();
                });

        });

        it('soundex', function (done) {
            var soundex = [
                { name: 'Soundex', value: 'S532' },
                { name: 'Example', value: 'E251' },
                { name: 'Sownteks', value: 'S532' },
                { name: 'Ekzampul', value: 'E251' },
                { name: 'Euler', value: 'E460' },
                { name: 'Gauss', value: 'G200' },
                { name: 'Hilbert', value: 'H416' },
                { name: 'Knuth', value: 'K530' },
                { name: 'Lloyd', value: 'L300' },
                { name: 'Lukasiewicz', value: 'L222' },
                { name: 'Ellery', value: 'E460' },
                { name: 'Ghosh', value: 'G200' },
                { name: 'Heilbronn', value: 'H416' },
                { name: 'Kant', value: 'K530' },
                { name: 'Ladd', value: 'L300' },
                { name: 'Lissajous', value: 'L222' },
                { name: 'Wheaton', value: 'W350' },
                { name: 'Ashcraft', value: 'A226' },
                { name: 'Burroughs', value: 'B622' },
                { name: 'Burrows', value: 'B620' },
                { name: 'O\'Hara', value: 'O600' }
            ];
            var workerPool = new WorkerPool(2, 250);
            var scriptUrl = location.protocol + '//' + location.host + (/^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : '') + '/src/js/kidoju.data.workerlib.js';
            var blob = new Blob(['importScripts("' + scriptUrl + '"); onmessage = function (e) { postMessage(soundex(JSON.parse(e.data))); close(); };']);
            var blobURL = window.URL.createObjectURL(blob);
            var i = 0;
            for (i = 0; i < soundex.length; i++) {
                workerPool.add(soundex[i].name, blobURL, soundex[i].name);
            }
            workerPool.run()
                .done(function () {
                    expect(arguments.length).to.equal(soundex.length);
                    for (i = 0; i < arguments.length; i++) {
                        expect(arguments[i]).to.have.property('name', soundex[i].name);
                        expect(arguments[i]).to.have.property('value', soundex[i].value);
                    }
                })
                .fail(function (err) {
                    expect(err).to.be.null; // This is not supposed to fail
                })
                .always(function () {
                    done();
                });

        });

        it('metaphone', function (done) {
            var metaphone = [
                { name: 'Gnu', value: 'N' },
                { name: 'bigger', value: 'BKR' },
                { name: 'accuracy', value: 'AKKRS' },
                { name: 'batch batcher', value: 'BXBXR' }
                // TODO we need more...
            ];
            var workerPool = new WorkerPool(2, 250);
            var scriptUrl = location.protocol + '//' + location.host + (/^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : '') + '/src/js/kidoju.data.workerlib.js';
            var blob = new Blob(['importScripts("' + scriptUrl + '"); onmessage = function (e) { postMessage(metaphone(JSON.parse(e.data))); close(); };']);
            var blobURL = window.URL.createObjectURL(blob);
            var i = 0;
            for (i = 0; i < metaphone.length; i++) {
                workerPool.add(metaphone[i].name, blobURL, metaphone[i].name);
            }
            workerPool.run()
                .done(function () {
                    expect(arguments.length).to.equal(metaphone.length);
                    for (i = 0; i < arguments.length; i++) {
                        expect(arguments[i]).to.have.property('name', metaphone[i].name);
                        expect(arguments[i]).to.have.property('value', metaphone[i].value);
                    }
                })
                .fail(function (err) {
                    expect(err).to.be.null; // This is not supposed to fail
                })
                .always(function () {
                    done();
                });

        });

        it('removeDiacritics', function (done) {
            var diacritics = [
                { name: 'La leçon est terminée', value: 'La lecon est terminee' },
                { name: 'Cómo está usted', value: 'Como esta usted' },
                { name: 'można zapoznać się', value: 'mozna zapoznac sie' },
                { name: 'Z przyjemnością prezentuje Państwu', value: 'Z przyjemnoscia prezentuje Panstwu' }
                // TODO we need more...
            ];
            var workerPool = new WorkerPool(2, 250);
            var scriptUrl = location.protocol + '//' + location.host + (/^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : '') + '/src/js/kidoju.data.workerlib.js';
            var blob = new Blob(['importScripts("' + scriptUrl + '"); onmessage = function (e) { postMessage(removeDiacritics(JSON.parse(e.data))); close(); };']);
            var blobURL = window.URL.createObjectURL(blob);
            var i = 0;
            for (i = 0; i < diacritics.length; i++) {
                workerPool.add(diacritics[i].name, blobURL, diacritics[i].name);
            }
            workerPool.run()
                .done(function () {
                    expect(arguments.length).to.equal(diacritics.length);
                    for (i = 0; i < arguments.length; i++) {
                        expect(arguments[i]).to.have.property('name', diacritics[i].name);
                        expect(arguments[i]).to.have.property('value', diacritics[i].value);
                    }
                })
                .fail(function (err) {
                    expect(err).to.be.null; // This is not supposed to fail
                })
                .always(function () {
                    done();
                });

        });

        // Note: we need error and timeout at the end otherwise FF fails, especially when executed before `blacklisted unsafe functions`

        it('error', function (done) {
            var workerPool = new WorkerPool(2);
            var length = 5;
            var i = 0;
            for (i = 0; i < length; i++) {
                workerPool.add('name' + i, 'kidoju.data.test.workerlib.js', i);
            }
            for (i = length; i < 2 * length; i++) {
                workerPool.add('name' + i, 'kidoju.data.test.workerlib.js', String(i));
            }
            workerPool.run()
                .done(function () {
                    expect(arguments).to.be.null; // This is not supposed to succeed
                })
                .fail(function (err) {
                    expect(err).to.be.an.instanceof(window.Error);
                    expect(err).to.have.property('taskname');
                    expect(err).to.have.property('filename');
                    expect(err).to.have.property('colno');
                    expect(err).to.have.property('lineno');
                    expect(err.timeout).to.be.undefined;
                })
                .always(function () {
                    done();
                });
        });

        it('timeout', function (done) {
            // var blob = new Blob(['onmessage = function (e) { postMessage("msg from worker"); }']);
            // var blobURL = window.URL.createObjectURL(blob);
            var workerPool = new WorkerPool(2, 1);
            var length = 100;
            var i = 0;
            for (i = 0; i < length; i++) {
                workerPool.add('name' + i, 'kidoju.data.test.workerlib.js', i);
            }
            workerPool.run()
                .done(function () {
                    expect(arguments).to.be.null; // This is not supposed to succeed
                })
                .fail(function (err) {
                    expect(err).to.be.an.instanceof(window.Error);
                    expect(err).to.have.property('taskname');
                    expect(err).to.have.property('filename');
                    expect(err.colno).to.be.undefined;
                    expect(err.lineno).to.be.undefined;
                    expect(err).to.have.property('timeout', true);
                })
                .always(function () {
                    done();
                });
        });

    });

    /*********************************************************************************************************
     * PageCollectionDataSource
     *********************************************************************************************************/

    describe('Test PageCollectionDataSource', function () {

        describe('When initializing a PageCollectionDataSource', function () {

            it('if initialized from an empty array, the count of pages should match', function (done) {
                var pageCollectionDataSource1 = new PageCollectionDataSource();
                var pageCollectionDataSource2 = new PageCollectionDataSource({ data: [] });
                expect(pageCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource1.options.schema.model()).to.be.an.instanceof(Page);
                expect(new pageCollectionDataSource2.options.schema.model()).to.be.an.instanceof(Page);
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
                    { title: 'Gone with the wind' },
                    { title: 'OK Coral' },
                    { title: 'The third man' },
                    { title: 'The guns of Navarone' }
                ];
                var pageCollectionDataSource = new PageCollectionDataSource({ data: books });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {                                     // TODO: any way to throw??????
                    expect(pageCollectionDataSource.total()).to.equal(books.length);
                    done();
                });
            });

            xit('if initialized with a new model, it should throw', function () {
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
                    { id: ObjectId(), title: 'Gone with the wind' },
                    { id: ObjectId(), title: 'OK Coral' },
                    { id: ObjectId(), title: 'The third man' },
                    { id: ObjectId(), title: 'The guns of Navarone' }
                ];
                function testFn() {
                    var pageCollectionDataSource = new PageCollectionDataSource({
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
                var pageCollectionDataSource = new PageCollectionDataSource({ data: pageCollectionArray });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                    for (var i = 0; i < pageCollectionArray.length; i++) {
                        expect(pageCollectionDataSource.at(i).dirty).to.be.false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, there should be page components', function (done) {
                function test(page) {
                    var dfd = $.Deferred();
                    expect(page).to.be.an.instanceof(Page);
                    expect(page.components).to.be.an.instanceof(PageComponentCollectionDataSource);
                    expect(page.components.parent()).to.equal(page);
                    expect(page.components.total()).to.equal(0);
                    page.load().then(function () {
                        expect(page.components.total()).to.be.gt(0);
                        dfd.resolve();
                    });
                    return dfd.promise();
                }
                var pageCollectionDataSource = new PageCollectionDataSource({ data: pageCollectionArray });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                    var promises = [];
                    for (var i = 0; i < pageCollectionArray.length; i++) {
                        promises.push(test(pageCollectionDataSource.at(i)));
                    }
                    $.when.apply($, promises).always(done);
                });
            });

            it('if initialized from a kendo.data.DataSource, an exception should be raised', function () {
                var fn = function () {
                    var dataSource = PageCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
                };
                expect(fn).to.throw(Error);
            });

            it('if initialized from a PageCollectionDataSource, the number of pages should match', function (done) {
                var pageCollectionDataSource1 = PageCollectionDataSource.create(pageCollectionArray);
                var pageCollectionDataSource2 = PageCollectionDataSource.create(pageCollectionDataSource1);
                expect(pageCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource1.options.schema.model()).to.be.an.instanceof(Page);
                expect(new pageCollectionDataSource2.options.schema.model()).to.be.an.instanceof(Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageCollectionDataSource1.total()).to.equal(pageCollectionArray.length);
                        expect(pageCollectionDataSource2.total()).to.equal(pageCollectionArray.length);
                        done();
                    });
            });

            it('if initialized from a transport, the number of pages should match', function (done) {
                var pageCollectionDataSource1 = PageCollectionDataSource.create(pageCollectionArray);
                var pageCollectionDataSource2 = new PageCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageCollectionArray);
                        }
                    }
                });
                expect(pageCollectionDataSource1).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(pageCollectionDataSource2).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource1.options.schema.model()).to.be.an.instanceof(Page);
                expect(new pageCollectionDataSource2.options.schema.model()).to.be.an.instanceof(Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                )
                    .then(function () {
                        expect(pageCollectionDataSource1.total()).to.equal(pageCollectionArray.length);
                        expect(pageCollectionDataSource2.total()).to.equal(pageCollectionArray.length);
                        done();
                    });
            });

            it('if initialized from $.ajax, the number of pages and components should match', function (done) {
                var pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
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
                            expect(page).to.be.an.instanceof(Page);
                            expect(page.components).to.be.an.instanceof(PageComponentCollectionDataSource);
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
                var pageCollectionDataSource = new PageCollectionDataSource({ data: pageCollectionArray });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                    pageCollectionDataSource.add(new Page());
                    expect(pageCollectionDataSource.at(pageCollectionArray.length).isNew()).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length + 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call create', function (done) {
                var create = sinon.spy();
                var update = sinon.spy();
                var destroy = sinon.spy();
                var pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageCollectionArray);
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
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                    pageCollectionDataSource.add(new Page());
                    expect(pageCollectionDataSource.at(pageCollectionArray.length).isNew()).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length + 1);
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
                var pageCollectionDataSource = new PageCollectionDataSource({ data: pageCollectionArray });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    pageCollectionDataSource.at(0).set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call update', function (done) {
                var create = sinon.spy();
                var update = sinon.spy();
                var destroy = sinon.spy();
                var pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageCollectionArray);
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
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    pageCollectionDataSource.at(0).set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
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
                var pageCollectionDataSource = new PageCollectionDataSource({ data: pageCollectionArray });
                expect(pageCollectionDataSource).to.have.deep.property('options.schema.model').that.is.a('function');
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
                    pageCollectionDataSource.remove(pageCollectionDataSource.at(0));
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length - 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call destroy', function (done) {
                var create = sinon.spy();
                var update = sinon.spy();
                var destroy = sinon.spy();
                var pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read: function (options) {
                            options.success(pageCollectionArray);
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
                expect(new pageCollectionDataSource.options.schema.model()).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(function () {
                    expect(pageCollectionDataSource.total()).to.equal(pageCollectionArray.length);
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

        var stream;

        describe('When initializing a Stream', function () {

            it('if initialized from an undefined, it should pass', function (done) {
                // Unfortunately, this is a Kendo UI requirement
                stream = new Stream();
                // expect(stream).to.have.property('id');
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object without pages, it should pass', function (done) {
                stream = new Stream({ dummy: true });
                // expect(stream).to.have.property('id');
                expect(stream.pages).to.be.an.instanceof(PageCollectionDataSource);
                expect(stream.dummay).to.be.undefined;
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(0);
                    done();
                });
            });

            it('if initialized from an object with pages and components, it should pass', function (done) {
                stream = new Stream({ pages: [
                    { components: [{ tool: 'label' }, { tool: 'image' }] },
                    { components: [{ tool: 'textbox' }, { tool: 'button' }] }
                ] });
                // expect(stream).to.have.property('id');
                expect(stream.pages).to.be.an.instanceof(PageCollectionDataSource);
                expect(stream.pages.fetch).to.respond;
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(2);
                    var page = stream.pages.at(0);
                    expect(page).to.be.an.instanceof(Page);
                    expect(stream.pages.load).to.respond;
                    page.load().then(function () {
                        expect(page.components).to.be.an.instanceof(PageComponentCollectionDataSource);
                        expect(page.components.total()).to.equal(2);
                        done();
                    });
                });
            });

        });


        describe('toJSON', function () {

            var stream;

            it('stream.toJSON should return all pages and components', function (done) {
                var s = {
                    pages: [
                        {
                            style: 'background-colour: lightblue;',
                            components: [
                                { tool: 'label', attributes: { style: 'color: red;', text: 'Label1' }, properties: { draggable: false, dropValue: '' } },
                                { tool: 'image', attributes: { alt: 'Label1', src: 'photo1.jpg', style: 'border: solid 1px blue;' }, properties: { draggable: false, dropValue: '' } }
                            ]
                        },
                        {
                            style: 'background-colour: lightgreen;',
                            components: [
                                { tool: 'label', attributes: { style: 'color: blue;', text: 'Label2' }, properties: { draggable: false, dropValue: '' } },
                                { tool: 'image', attributes: { alt: 'Label2', src: 'photo2.jpg', style: 'border: solid 1px red;' }, properties: { draggable: false, dropValue: '' } }
                            ]
                        }
                    ]
                };
                var pageDefaults = new Page().defaults;
                var componentDefaults = new PageComponent().defaults;
                var defaults = {
                    pages: [
                        $.extend(true, {}, pageDefaults, { id: null, components: [$.extend(true, {}, componentDefaults), $.extend({}, componentDefaults)] }),
                        $.extend(true, {}, pageDefaults, { id: null, components: [$.extend(true, {}, componentDefaults), $.extend({}, componentDefaults)] })
                    ]
                };
                var stream = new Stream(s);

                stream.pages.read();
                for (var i = 0; i < stream.pages.total(); i++) {
                    stream.pages.at(i).components.read();
                }

                var json = $.extend(true, {}, defaults, s);
                /*
                for (var j = 0; j < json.pages.length; j++) {
                    for (var k = 0; k < json.pages[j].components.length; k++) {
                        // By default properties === {}, which is discarded by toJSON
                        delete json.pages[j].components[k].properties;
                    }
                }
                */
                expect(stream.toJSON(true)).to.deep.equal(json);
                done();

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

        var stream;
        var pages;
        var components;

        describe('Syncing at various levels of the hierarchy', function () {

            before(function () {
                var SuperStream = Stream.define({
                    model: {
                        pages: {
                            transport: {
                                read: function (options) {
                                    pages.read(options);
                                    // window.console.log('reading pages...');
                                    options.success([{ id: ObjectId() }]);
                                },
                                create: function (options) {
                                    pages.create(options);
                                    // window.console.log('creating pages...');
                                    options.data.id = ObjectId(); // id set on server
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
                                                options.success([{ id: ObjectId(), tool: 'label' }]);
                                            },
                                            create: function (options) {
                                                components.create(options);
                                                // window.console.log('creating components...');
                                                options.data.id = ObjectId(); // id set on server
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
                expect(stream.pages.total()).to.equal(1);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(2);
                stream.pages.at(1).components.add({ tool: 'label' });
                stream.pages.at(1).components.add({ tool: 'textbox' });
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(3);
                stream.pages.at(2).components.add({ tool: 'label' });
                stream.pages.at(2).components.add({ tool: 'textbox' });
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages.sync()
                    .done(function () {
                        expect(pages.create).to.have.callCount(2);
                        expect(stream.pages.total()).to.equal(3);
                        expect(stream.pages.at(0).components.total()).to.equal(1);
                        expect(stream.pages.at(1).components.total()).to.equal(2);
                        expect(stream.pages.at(2).components.total()).to.equal(2);
                        var promises = [];
                        for (var i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when.apply($, promises)
                            .always(function () {
                                expect(components.create).to.callCount(4);
                                expect(stream.pages.total()).to.equal(3);
                                expect(stream.pages.at(0).components.total()).to.equal(1);
                                expect(stream.pages.at(1).components.total()).to.equal(2);
                                expect(stream.pages.at(2).components.total()).to.equal(2);
                                done();
                            });
                    })
                    .fail(done);
            });

            it('Updating', function (done) {
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages.at(1).set('style', 'background-color: #FF0000;');
                stream.pages.at(1).components.at(0).set('top', 50);
                stream.pages.at(1).components.at(0).set('left', 50);
                stream.pages.at(2).set('style', 'background-color: #FF0000;');
                stream.pages.at(2).components.at(0).set('top', 50);
                stream.pages.at(2).components.at(0).set('left', 50);
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages.sync()
                    .done(function () {
                        expect(pages.update).to.have.callCount(2);
                        expect(stream.pages.total()).to.equal(3);
                        expect(stream.pages.at(0).components.total()).to.equal(1);
                        expect(stream.pages.at(1).components.total()).to.equal(2);
                        expect(stream.pages.at(2).components.total()).to.equal(2);
                        var promises = [];
                        for (var i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when.apply($, promises)
                            .always(function () {
                                expect(components.update).to.callCount(2);
                                expect(stream.pages.total()).to.equal(3);
                                expect(stream.pages.at(0).components.total()).to.equal(1);
                                expect(stream.pages.at(1).components.total()).to.equal(2);
                                expect(stream.pages.at(2).components.total()).to.equal(2);
                                done();
                            });
                    })
                    .fail(done);
            });

            it('Deleting', function (done) {
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                // Destroying a page on the client might require server code to delete its components
                // because the framework does not call the destroy method on components of removed pages
                stream.pages.remove(stream.pages.at(0));
                stream.pages.at(0).components.remove(stream.pages.at(0).components.at(0)); // page 1 became page 0
                expect(stream.pages.total()).to.equal(2);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages.sync()
                    .done(function () {
                        expect(pages.destroy).to.have.been.calledOnce;
                        expect(stream.pages.total()).to.equal(2);
                        expect(stream.pages.at(0).components.total()).to.equal(1);
                        expect(stream.pages.at(1).components.total()).to.equal(2);
                        var promises = [];
                        for (var i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when.apply($, promises)
                            .always(function () {
                                expect(components.destroy).to.have.been.calledOnce;
                                expect(stream.pages.total()).to.equal(2);
                                expect(stream.pages.at(0).components.total()).to.equal(1);
                                expect(stream.pages.at(1).components.total()).to.equal(2);
                                done();
                            });
                    })
                    .fail(done);
            });
        });

        describe('Same with batch: true', function () {

            before(function () {
                var SuperStream = Stream.define({
                    model: {
                        pages: {
                            transport: {
                                read: function (options) {
                                    pages.read(options);
                                    // window.console.log('reading pages...');
                                    options.success([{ id: ObjectId() }]);
                                },
                                create: function (options) {
                                    pages.create(options);
                                    // window.console.log('creating pages...');
                                    if ($.isArray(options.data.models)) {
                                        $.each(options.data.models, function (index, model) {
                                            model.id = ObjectId(); // id set on server
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
                                                options.success([{ id: ObjectId(), tool: 'label' }]);
                                            },
                                            create: function (options) {
                                                components.create(options);
                                                // window.console.log('creating components...');
                                                if ($.isArray(options.data.models)) {
                                                    $.each(options.data.models, function (index, model) {
                                                        model.id = ObjectId(); // id set on server
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
                expect(stream.pages.total()).to.equal(1);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(2);
                stream.pages.at(1).components.add({ tool: 'label' });
                stream.pages.at(1).components.add({ tool: 'textbox' });
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(3);
                stream.pages.at(2).components.add({ tool: 'label' });
                stream.pages.at(2).components.add({ tool: 'textbox' });
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages.sync()
                    .done(function () {
                        expect(pages.create).to.have.been.calledOnce;
                        expect(stream.pages.total()).to.equal(3);
                        expect(stream.pages.at(0).components.total()).to.equal(1);
                        expect(stream.pages.at(1).components.total()).to.equal(2);
                        expect(stream.pages.at(2).components.total()).to.equal(2);
                        var promises = [];
                        for (var i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when.apply($, promises)
                            .always(function () {
                                expect(components.create).to.have.been.calledTwice;
                                expect(stream.pages.total()).to.equal(3);
                                expect(stream.pages.at(0).components.total()).to.equal(1);
                                expect(stream.pages.at(1).components.total()).to.equal(2);
                                expect(stream.pages.at(2).components.total()).to.equal(2);
                                done();
                            });
                    })
                    .fail(done);
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

        });

        describe('Same with batch: true and submit method', function () {

            xit('Mixing operations and saving stream', function (done) {
                // window.console.log('--------------');
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(1);
                expect(stream.pages.at(2).components.total()).to.equal(1);
                // page 0
                stream.pages.at(0).set('style', 'border 1px #0000FF;');
                stream.pages.at(0).components.at(0).set('rotate', 45);
                stream.pages.at(0).components.add({ tool: 'button' });
                stream.pages.at(0).components.at(1).set('top', 120);
                stream.pages.at(0).components.at(1).set('left', 120);
                // page 1
                stream.pages.remove(stream.pages.at(1));
                // page 2
                stream.pages.at(1).set('style', 'padding: 10px');
                stream.pages.at(1).components.remove(stream.pages.at(1).components.at(0));
                stream.pages.at(1).components.add({ tool: 'textbox' });
                stream.pages.at(0).components.at(0).set('rotate', 45);
                // TODO
            });

        });

    });

    /*********************************************************************************************************
     * Synchronization localStorage
     *********************************************************************************************************/

    describe('Test synchronization with localStorage', function () {

        var storageKey = 'stream';
        var stream;
        var original = {
            pages: [
                {
                    id: ObjectId(),
                    style: 'background-color: #' + Math.random().toString(16).substr(2, 6) + ';',
                    components: [
                        { id: ObjectId(), tool: 'label', attributes: { text: 'What is this logo?', style: 'font-family: Georgia, serif;' }, properties: {} },
                        { id: ObjectId(), tool: 'image', attributes: { src: 'http://www.google.com/logo.png', alt: 'Google' }, properties: {} },
                        { id: ObjectId(), tool: 'textbox', attributes: { style: 'border: solid 1px #AAAAAA;' }, properties: { name: 'text1', validation: 'return true;', success: 1, failure: 0, omit: 0 } }
                    ]
                },
                {
                    id: ObjectId(),
                    style: 'background-color: #' + Math.random().toString(16).substr(2, 6) + ';',
                    components: [
                        { id: ObjectId(), tool: 'label', attributes: { text: 'What is this logo?', style: 'font-family: Georgia, serif;' }, properties: {} },
                        { id: ObjectId(), tool: 'image', attributes: { src: 'http://www.apple.com/logo.png', alt: 'Apple' }, properties: {} },
                        { id: ObjectId(), tool: 'textbox', attributes: { style: 'border: solid 1px #AAAAAA;' }, properties: { name: 'text2', validation: 'return true;', success: 1, failure: 0, omit: 0 } }
                    ]
                }
            ]
        };

        describe('Load and save hierarchy as a whole', function () {

            before(function () {
                var SuperStream = Stream.define({
                    _fetchAll: function () {
                        var that = this;
                        var dfd = $.Deferred();
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
                    load: function () {
                        var that = this;
                        var stream = $.parseJSON(localStorage.getItem(storageKey)) || {};
                        that.accept(stream);
                        return that._fetchAll();
                    },
                    save: function () {
                        var that = this;
                        var data = that.toJSON(true);
                        $.each(data.pages, function (pageIdx, page) {
                            page.id = page.id || ObjectId();
                            $.each(page.components, function (componentIdx, component) {
                                component.id = component.id || ObjectId();
                            });
                        });
                        localStorage.setItem(storageKey, kendo.stringify(data));
                        that.accept(data);
                        return that._fetchAll();
                    }
                });
                stream = new SuperStream();
                localStorage.removeItem(storageKey);
                localStorage.setItem(storageKey, kendo.stringify(original));
            });

            it('Reading', function (done) {
                stream.load().always(function () {
                    // expect(stream.isNew()).to.be.false;
                    expect(stream.dirty).to.be.false;
                    // expect(stream).to.have.property('id', original.id);
                    expect(stream).to.have.property('pages').that.is.an.instanceof(PageCollectionDataSource);
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
                stream.pages.at(index).components.add({ tool: 'label' });
                stream.save().always(function () {
                    var update = $.parseJSON(localStorage.getItem(storageKey));
                    // expect(update).to.have.property('id', stream.id);
                    expect(update).to.have.property('pages').that.is.an.instanceof(Array).with.property('length', index + 1);
                    expect(update.pages[index]).to.have.property('id', stream.pages.at(index).id);
                    expect(update.pages[index]).to.have.property('components').that.is.an.instanceof(Array).with.property('length', stream.pages.at(index).components.total());
                    // TODO: attributes and properties
                    done();
                });
            });

            it('Updating', function (done) {
                var index = stream.pages.total() - 1;
                stream.pages.at(index).set('style', 'background-color: #' +  Math.random().toString(16).substr(2, 6) + ';');
                stream.pages.at(index).components.at(0).set('top', 100);
                stream.pages.at(index).components.at(0).set('left', 100);
                stream.pages.at(index).components.at(0).set('rotate', 45);
                stream.save().always(function () {
                    var update = $.parseJSON(localStorage.getItem(storageKey));
                    // expect(update).to.have.property('id', stream.id);
                    expect(update).to.have.property('pages').that.is.an.instanceof(Array).with.property('length', index + 1);
                    expect(update.pages[index]).to.have.property('id', stream.pages.at(index).id);
                    expect(update.pages[index]).to.have.property('style', stream.pages.at(index).style);
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
                    // expect(update).to.have.property('id', stream.id);
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
            var stream = new Stream({});
            expect(stream.pages.total()).to.equal(0);
            stream.append({});
            expect(stream.pages.total()).to.equal(1);
            stream.pages.at(0).append({ tool: 'label' });
            expect(stream.pages.at(0).components.total()).to.equal(1);
        });

        it('PageComponentCollectionDataSource.insert & PageCollectionDataSource.insert', function () {
            var stream = new Stream({});
            expect(stream.pages.total()).to.equal(0);
            stream.pages.insert(0);
            expect(stream.pages.total()).to.equal(0);
            stream.pages.insert(0, {});
            expect(stream.pages.total()).to.equal(1);
            expect(stream.pages.at(0).components.total()).to.equal(0);
            stream.pages.at(0).components.insert(0);
            expect(stream.pages.at(0).components.total()).to.equal(0);
            stream.pages.at(0).components.insert(0, { tool: 'label' });
            expect(stream.pages.at(0).components.total()).to.equal(1);
        });


        it('page.stream, component.page, pages.parent & components.parent', function (done) {

            var s = {
                pages: [
                    {
                        id: ObjectId(),
                        style: 'background-color: #' + Math.random().toString(16).substr(2, 6) + ';',
                        components: [
                            {
                                id: ObjectId(),
                                tool: 'label',
                                attributes: { text: 'What is this logo?', style: 'font-family: Georgia, serif;' },
                                properties: {}
                            }
                        ]
                    }
                ]
            };
            var stream = new Stream(s);
            // expect(stream).to.have.property('id', s.id);
            expect(stream).to.have.property('pages').that.is.an.instanceof(PageCollectionDataSource);
            stream.pages.fetch().always(function () {
                expect(stream.pages.total()).to.equal(1);
                expect(stream.pages.parent()).to.equal(stream);
                var page = stream.pages.at(0);
                expect(page).to.have.property('components').that.is.an.instanceof(PageComponentCollectionDataSource);
                expect(page).to.have.property('id', s.pages[0].id);
                expect(page).to.have.property('style', s.pages[0].style);
                expect(page.stream()).to.equal(stream);
                expect(page.parent()).to.equal(stream.pages.data());
                page.components.fetch().always(function () {
                    expect(page.components.total()).to.equal(1);
                    expect(page.components.parent()).to.equal(page);
                    var component = page.components.at(0);

                    expect(component.parent()).to.equal(page.components.data());
                    expect(component.page()).to.equal(stream.pages.at(0));
                    done();
                });
            });
        });

        // TODO: Stream.loaded and Page.loaded?????


        // TODO: PageCollectionDataSource.getObjectFromProperties


        if (!window.__karma__) { // This test breaks further tests in Karma
            it('Missing Kidoju tools', function () {

                delete kidoju.tools;
                var fn = function () {
                    var pageComponent = new PageComponent({});
                };
                expect(fn).to.throw(Error);
            });
        }

    });

}(this, jQuery));

/* jshint +W071 */
