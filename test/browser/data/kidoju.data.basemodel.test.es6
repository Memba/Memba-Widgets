/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import 'kendo.data';
import chai from 'chai';
import sinon from 'sinon';
import 'sinon-chai';
import 'jquery.mockjax';
import BaseModel from '../../../src/js/data/kidoju.data.basemodel.es6';
// Legacy code
import '../../../src/js/kidoju.util';

const { describe, it, kendo, kidoju, xit } = window;
const { Model } = kendo.data;
const { expect } = chai;
const { ObjectId } = window.kidoju.util;

describe('Legacy export', () => {
    it('Check kidoju.data.Model', () => {
        expect(kidoju.data.Model).to.equal(BaseModel);
    });
});

describe('Problems we had to solve with kendo.data.Model which lead to creating BaseModel', () => {
    describe('Assigning default values to fields that are not initialized', () => {
        const definition = {
            id: 'id',
            fields: {
                id: {
                    type: 'string',
                    nullable: true,
                    editable: false
                },
                title: {
                    type: 'string',
                    defaultValue: 'hey'
                },
                dob: {
                    type: 'date'
                },
                age: {
                    type: 'number',
                    defaultValue() {
                        return 10;
                    }
                }
            }
        };
        const d2 = { id: '1' };

        it('Check that kendo.data.Model still does not assign default values to fields that are not initialized', () => {
            // This test should allow us to detect fixes in future versions of Kendo UI
            // in view to remove our custom code to fix kendo.data.Model...
            const TestModel = Model.define(definition);
            const m1 = new TestModel();
            const m2 = new TestModel(d2);

            expect(m1.id).to.be.null;
            expect(m1).to.have.property(
                'title',
                definition.fields.title.defaultValue
            );
            expect(m1)
                .to.have.property('dob')
                .that.is.a('date');
            expect(m1).to.have.property('age', 10);

            // undefined fields is the problem to fix
            expect(m2).to.have.property('id', d2.id);
            expect(m2.title).to.be.undefined;
            expect(m2.dob).to.be.undefined;
            expect(m2.age).to.be.undefined;
        });

        it('Our BaseModel should assign default values to fields that are not initialized', () => {
            const TestModel = BaseModel.define(definition);
            const m1 = new TestModel();
            const m2 = new TestModel(d2);

            expect(m1.id).to.be.null;
            expect(m1).to.have.property(
                'title',
                definition.fields.title.defaultValue
            );
            expect(m1)
                .to.have.property('dob')
                .that.is.a('date');
            expect(m1).to.have.property(
                'age',
                definition.fields.age.defaultValue()
            );

            // undefined fields have been fixed in kidoju.data.BaseModel
            expect(m2).to.have.property('id', d2.id);
            expect(m2).to.have.property(
                'title',
                definition.fields.title.defaultValue
            );
            expect(m2)
                .to.have.property('dob')
                .that.is.a('date');
            expect(m2).to.have.property(
                'age',
                definition.fields.age.defaultValue()
            );
        });
    });

    describe('Parsing dates properly on init and accept', () => {
        const definition = {
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
        const past = new Date(1966, 14, 2);
        const d1 = {
            id: new ObjectId().toString(),
            date: past.toISOString()
        };
        const now = new Date();
        const d2 = {
            id: new ObjectId().toString(),
            date: now.toISOString()
        };

        it('Check that kendo.data.Model still does not parse dates on init and accept', () => {
            const TestModel = Model.define(definition);
            const m1 = new TestModel(d1);
            const change = sinon.spy();

            expect(m1)
                .to.have.property('id')
                .that.is.equal(d1.id);
            // There lies the problem: the date property is supposed to be a Date and the string value has not been parsed/converted
            expect(m1)
                .to.have.property('date')
                .that.is.a('string');
            expect(m1.date).to.equal(d1.date);

            m1.bind('change', change);
            m1.accept(d2);

            // Although fields are non-editable, they have been updated which is expected with accept
            expect(m1)
                .to.have.property('id')
                .that.is.equal(d2.id);
            // m1 is not dirty, which is expected since we have not called set
            expect(m1).to.have.property('dirty').that.is.false;
            // accordingly the change event has not been raised
            expect(change).not.to.have.been.called;

            // There lies the problem again: the date property is supposed to be a Date and the string value has not been parsed/converted
            expect(m1)
                .to.have.property('date')
                .that.is.a('string');
            expect(m1.date).to.equal(d2.date);
        });

        it('Our BaseModel should parse dates on init and accept', () => {
            const TestModel = BaseModel.define(definition);
            const m1 = new TestModel(d1);
            const change = sinon.spy();

            expect(m1)
                .to.have.property('id')
                .that.is.equal(d1.id);
            // The fix in BaseModel is discussed and explained at http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
            expect(m1)
                .to.have.property('date')
                .that.is.an.instanceof(Date);
            expect(m1.date.getTime()).to.equal(past.getTime());

            m1.bind('change', change);
            m1.accept({
                id: d2.id,
                date: now.toISOString()
            });

            expect(m1)
                .to.have.property('id')
                .that.is.equal(d2.id);
            expect(m1).to.have.property('dirty').that.is.false;
            expect(change).not.to.have.been.called;

            // We have fixed our date parsing issue
            expect(m1)
                .to.have.property('date')
                .that.is.an.instanceof(Date);
            expect(m1.date.getTime()).to.equal(now.getTime());
        });
    });

    describe('Parsing nested properties', () => {
        // Nested properties are a feature of kendo.data.Model
        // documented at https://docs.telerik.com/kendo-ui/controls/data-management/grid/how-to/binding/use-nested-model-properties
        // They are used to flatten a json object with nested properties to display in a grid
        // Out Lazy objects for grids should use nested properties when necessary
        const definition = {
            id: 'id',
            fields: {
                id: {
                    type: 'string',
                    nullable: true,
                    editable: false
                },
                firstName: {
                    from: 'author.firstName',
                    type: 'string',
                    nullable: true,
                    editable: false
                },
                lastName: {
                    from: 'author.lastName',
                    type: 'string',
                    nullable: true,
                    editable: false
                }
            }
        };
        const d1 = {
            id: '1',
            author: {
                firstName: 'Joe',
                lastName: 'Blogs'
            }
        };

        it('We expect to parse nested properties', () => {
            const TestModel = Model.define(definition);
            const m1 = new TestModel(d1);
            expect(true).to.be.false; // Unfinished
        });
    });

    describe('Parsing nested models (subdocuments)', () => {
        const authorDefinition = {
            id: 'userId',
            fields: {
                userId: {
                    type: 'string',
                    nullable: true
                },
                name: {
                    type: 'string'
                }
            }
        };
        const bookDefinition = {
            id: 'id',
            fields: {
                id: {
                    type: 'string',
                    nullable: true
                },
                title: {
                    type: 'string'
                },
                author: {
                    defaultValue: null
                    /*
                    parse(value) {
                        return value instanceof Author
                            ? value
                            : new Author(value);
                    }
                    */
                }
            }
        };
        const d1 = {
            id: '1',
            title: 'Les Misérables',
            author: {
                userId: 'a',
                name: 'Victor Hugo'
            }
        };
        const d2 = {
            id: '2',
            title: 'La Peste',
            author: {
                id: 'b',
                name: 'Albert Camus'
            }
        };
        const d3 = {
            id: '3',
            title: 'Les 3 Mousquetaires',
            author: {
                id: 'c',
                name: 'Alexandre Dumas'
            }
        };

        it('Check that kendo.data.Model still does not parse nested models', () => {
            const Author = Model.define(authorDefinition);
            bookDefinition.fields.author.parse = function(value) {
                return value instanceof Author ? value : new Author(value);
            };
            const Book = Model.define(bookDefinition);
            const m1 = new Book(d1);
            expect(m1.author).not.to.be.an.instanceof(Author);
        });

        it('Our BaseModel should parse nested models', () => {
            const Author = BaseModel.define(authorDefinition);
            bookDefinition.fields.author.parse = function(value) {
                return value instanceof Author ? value : new Author(value);
            };
            const Book = BaseModel.define(bookDefinition);

            const change = sinon.spy();
            const m1 = new Book(d1);
            m1.bind('change', change);
            expect(change).not.to.have.been.called;
            expect(m1.author).to.be.an.instanceof(Author);
            expect(m1.get('author.name')).to.equal(d1.author.name);

            m1.accept(d2);
            expect(change).not.to.have.been.called;
            expect(m1.author).to.be.an.instanceof(Author);
            expect(m1.get('author.name')).to.equal(d2.author.name);

            m1.set('author', d3.author);
            expect(change).to.have.been.calledOnce;
            expect(m1.author).to.be.an.instanceof(Author);
        });
    });

    describe('Parsing nested arrays of models (arrays of subdocuments)', () => {
        xit('We expect to parse nested arrays of models', () => {
            // TODO
        });
    });

    describe('toJSON and Patch', () => {

        xit('it should serialize a basic object derived from a model and apply new serializable attribute', () => {

            let People = BaseModel.define({
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

            let p = { name: 'jack', dob: new Date(), male: true, children: 3, check: '1234', dummy: 'dummy' };
            let people = new People(p);
            let json = $.extend({}, p);

            // remove check which is not serializable
            delete json.check;
            // add missing id which is nullable by default
            json.id = null;

            // remove dummy which is not a defined as a field
            delete json.dummy;

            expect(people.toJSON()).to.deep.equal(json);

        });

        xit('it should serialize a complex object derived from a model aggregating a submodel', () => {

            let Author = BaseModel.define({
                id: 'userId',
                fields: {
                    userId: { type: 'string', nullable: true },
                    name: { type: 'string', serializable: false }
                }
            });
            let Book = BaseModel.define({
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
            let b = { id: '1', title: 'Les Misérables', author: { userId: 'a', name: 'Victor Hugo' }};


            let book = new Book(b);
            let json = $.extend({}, b);

            // remove author.name which is not serializable
            delete json.author.name;

            expect(book.toJSON()).to.deep.equal(json);

        });

        xit('it should serialize a complex object derived from a model aggregating a dataSource of submodels', () => {

            let Book = BaseModel.define({
                id: 'id',
                fields: {
                    id: { type: 'string', nullable: true, editable: false },
                    title: { type: 'string' }
                }
            });
            let Author = BaseModel.define({
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

            let a1 = { id: '1', name: 'Victo Hugo' };
            let b1 = { id: 'a', title: 'Les Misérables' };
            let b2 = { id: 'b', title: 'Le Comte de Monte-Cristo' };

            function TestAuthor1() {
                let author1 = new Author(a1);

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
                let author2 = new Author($.extend({}, a1, { books: [b1, b2] }));

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

    describe('Change events', () => {

        // Review throoughly as I am not sure it is a good idea
        // Add breakpoint in all widgets and Kidoju-WebApp - player and editor

        xit('We expect to raise a change event on the parent ObservableObject on accept', () => {

            const past = new Date(1966, 14, 2);
            const d1 = {
                id: new ObjectId().toString(),
                date: past
            };
            const now = new Date();
            const d2 = {
                id: new ObjectId().toString(),
                date: now
            };
            let change = false;
            let viewModel = kendo.observable({
                badObject: new Model(d1),
                fixedObject: new BaseModel(d1)
            });

            viewModel.bind('change', e => {
                change = true;
            });

            viewModel.badObject.accept({
                id: d2.id,
                date: now
            });

            // BadModel inherited from kendo.data.Model does not trigger a change event
            // on the parent observable when changing values via accept method
            expect(change).to.be.false;

            viewModel.fixedObject.accept({
                id: d2.id,
                date: now
            });

            // FixedModel inherited from our kidoju.data.BaseModel does trigger a change event
            // on the parent observable when changing values via accept method
            expect(change).to.be.true;

        });

        xit('We expect to raise a change event on the parent ObservableArray on accept', () => {

            // TODO + check if good idea.....

        });

        xit('change event with submodel', done => {
            let Author = BaseModel.define({
                id: 'userId',
                fields: {
                    userId: { type: 'string', nullable: true },
                    name: { type: 'string' }
                }
            });
            let Book = BaseModel.define({
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
            let viewModel = kendo.observable({
                book: new Book({
                    id: '1',
                    title: 'Les Misérables',
                    author: {
                        userId: 'a',
                        name: 'Victor Hugo'
                    }
                })
            });
            viewModel.bind('change', e => {
                expect(e).to.have.property('field', 'book.author.name');
                done();
            });
            // viewModel.book.set('title', 'Germinal');
            viewModel.book.author.set('name', 'Emile Zola');
        });

        xit('change event with subdatasource', done => {
            let Book = BaseModel.define({
                id: 'id',
                fields: {
                    id: { type: 'string', nullable: true },
                    title: { type: 'string' }
                }
            });
            let BookDataSource = DataSource.extend({
                init: function (options) {
                    // Enforce the use of PageWithOptions items in the page collection data source
                    DataSource.fn.init.call(this, $.extend(true, {}, options, { schema: { modelBase: Book, model: Book } }));
                    // Let's use a slightly modified reader to leave data conversions to kidoju.data.BaseModel._parseData
                    this.reader = new kidoju.data.BaseModelCollectionDataReader(this.reader);
                }
            });
            let Author = BaseModel.define({
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
            let b = { title: 'Le Compte de Monte-Cristo' };
            let viewModel = kendo.observable({
                author: new Author({
                    id: ObjectId(),
                    name: 'Victor Hugo',
                    books: [{ id: ObjectId(), title: 'Les Misérables' }]
                })
            });
            viewModel.bind('change', e => {
                expect(e).to.have.property('action', 'add');
                expect(e).to.have.property('field', 'author.books');
                expect(e).to.have.property('items').that.is.an.instanceof(Array).with.property('length', 1);
                expect(e.items[0]).to.have.property('title', b.title);
                done();
            });
            viewModel.author.books.add(b);
        });

        xit('error event', done => {
            done();
        });

    });

    // TODO Aggregation in DataSource
});

describe('Enhancements of kendo.data.Model in BaseModel', () => {

    describe('Data validation', () => {
        xit('validate', done => {
            done();
        });
    });

    // TODO Consider Mixins rather than making these features availble by default

    // TODO Check MobileModel in Kidoju-Mobile

    // TODO Caching

    // TODO LocalForage

    // TODO RemoteStorage (RAPI) - Consider a RAPI queue

});
