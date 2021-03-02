/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
import 'kendo.binder';
import chai from 'chai';
// import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { error2xhr } from '../../../src/js/data/data.util.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import ObjectId from '../../../src/js/common/window.objectid.es6';
import { jsonClone } from '../../../src/js/common/window.util.es6';
import { /* assertBaseModel, */ tryCatch } from '../_misc/test.util.es6';

const { describe, it, xit } = window;
const {
    Class,
    data: { DataSource, Model, ObservableArray, ObservableObject },
    observable,
} = window.kendo;
const { expect } = chai;

chai.use(sinonChai);

describe('data.base', () => {
    describe('BaseModel', () => {
        describe('Default values', () => {
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    age: {
                        type: 'number',
                        defaultValue() {
                            return 10;
                        },
                    },
                    dob: {
                        type: 'date',
                    },
                    male: {
                        type: 'boolean',
                    },
                    title: {
                        type: 'string',
                        defaultValue: 'hey',
                    },
                },
            };
            const data = { id: new ObjectId().toString() };

            it('kendo.data.Model does not assign default values', () => {
                // This test should allow us to detect fixes in future versions of Kendo UI
                // in view to remove our custom code to fix kendo.data.Model...
                const DataModel = Model.define(definition);
                const item1 = new DataModel();
                const item2 = new DataModel(jsonClone(data));

                // Default values are assigned when model is initialized without data
                expect(item1).to.have.property(
                    'age',
                    DataModel.fn.defaults.age()
                );
                expect(item1).to.have.property(
                    'dob',
                    DataModel.fn.defaults.dob
                );
                expect(item1).to.have.property('id', DataModel.fn.defaults.id);
                expect(item1).to.have.property(
                    'male',
                    DataModel.fn.defaults.male
                );
                expect(item1).to.have.property(
                    'title',
                    DataModel.fn.defaults.title
                );

                // Default values are not assigned when model is initialized with partial data
                // undefined fields is the problem to fix
                expect(item2).not.to.have.property('age');
                expect(item2).not.to.have.property('dob');
                expect(item2).to.have.property('id', data.id);
                expect(item2).not.to.have.property('male');
                expect(item2).not.to.have.property('title');
            });

            it('kendo.data.Model does not assign default values (via kendo.data.DataSource)', (done) => {
                const DataModel = Model.define(definition);
                const dataSource = new DataSource({
                    data: [jsonClone(data)],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const item = dataSource.at(0);
                            expect(item).to.have.property('age').that.is.null; // Because kendo.parseFloat(undefined) === null
                            expect(item).to.have.property('dob').that.is.null; // Because kendo.parseDate(undefined) === null
                            expect(item).to.have.property('id', data.id);
                            expect(item).to.have.property('male').that.is
                                .undefined;
                            expect(item).to.have.property('title').that.is
                                .undefined;
                        })
                    )
                    .catch(done);
            });

            it('BaseModel should assign default values', () => {
                const DataModel = BaseModel.define(definition);
                const item1 = new DataModel();
                const item2 = new DataModel(jsonClone(data));

                // Default values are assigned when model is initialized without data
                expect(item1).to.have.property(
                    'age',
                    DataModel.fn.defaults.age()
                );
                expect(item1).to.have.property(
                    'dob',
                    DataModel.fn.defaults.dob
                );
                expect(item1).to.have.property('id', DataModel.fn.defaults.id);
                expect(item1).to.have.property(
                    'male',
                    DataModel.fn.defaults.male
                );
                expect(item1).to.have.property(
                    'title',
                    DataModel.fn.defaults.title
                );

                // Default values are now assigned when model is initialized with partial data
                // undefined fields have been fixed in BaseModel
                expect(item2).to.have.property(
                    'age',
                    DataModel.fn.defaults.age()
                );
                expect(item1).to.have.property(
                    'dob',
                    DataModel.fn.defaults.dob
                );
                expect(item2).to.have.property(
                    'male',
                    DataModel.fn.defaults.male
                );
                expect(item2).to.have.property(
                    'title',
                    DataModel.fn.defaults.title
                );
            });

            it('BaseModel should assign default values (via kendo.data.DataSource)', (done) => {
                const DataModel = BaseModel.define(definition);
                const dataSource = new DataSource({
                    data: [jsonClone(data)],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const item = dataSource.at(0);
                            expect(item).to.have.property(
                                'age',
                                DataModel.fn.defaults.age()
                            );
                            expect(item).to.have.property(
                                'dob',
                                DataModel.fn.defaults.dob
                            );
                            expect(item).to.have.property('id', data.id);
                            expect(item).to.have.property(
                                'male',
                                DataModel.fn.defaults.male
                            );
                            expect(item).to.have.property(
                                'title',
                                DataModel.fn.defaults.title
                            );
                        })
                    )
                    .catch(done);
            });
        });

        describe('Parsing dates', () => {
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    date: {
                        type: 'date',
                        nullable: true,
                        editable: false,
                    },
                },
            };
            const past = new Date(1966, 14, 2);
            const data1 = {
                id: new ObjectId().toString(),
                date: past.toISOString(),
            };
            const now = new Date();
            const data2 = {
                id: new ObjectId().toString(),
                date: now.toISOString(),
            };

            it('kendo.data.Model does not parse dates', () => {
                const DataModel = Model.define(definition);
                // const item = new DataModel(jsonClone(data1));
                const item = new DataModel(JSON.parse(JSON.stringify(data1))); // Keeps date strings
                const change = sinon.spy();

                expect(item).to.have.property('id', data1.id);
                // There lies the problem: the date property is supposed to be a Date and the string value has not been parsed/converted
                expect(item).to.have.property('date').that.is.a('string');
                expect(item.date).to.equal(data1.date);

                item.bind('change', change);
                item.accept(data2);

                // Although fields are non-editable, they have been updated which is expected with accept
                expect(item).to.have.property('id', data2.id);
                // model is not dirty, which is expected since we have not called set
                expect(item).to.have.property('dirty').that.is.false;
                // accordingly the change event has not been raised
                expect(change).not.to.have.been.called;

                // There lies the problem again: the date property is supposed to be a Date and the string value has not been parsed/converted
                expect(item).to.have.property('date').that.is.a('string');
                expect(item.date).to.equal(data2.date);
            });

            it('BaseModel should parse dates', () => {
                const DataModel = BaseModel.define(definition);
                // const item = new DataModel(jsonClone(data1));
                const item = new DataModel(JSON.parse(JSON.stringify(data1))); // Keeps date strings
                const change = sinon.spy();

                expect(item).to.have.property('id').that.is.equal(data1.id);
                // The fix in BaseModel is discussed and explained at http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
                expect(item)
                    .to.have.property('date')
                    .that.is.an.instanceof(Date);
                expect(item.date.getTime()).to.equal(past.getTime());

                item.bind('change', change);
                item.accept({
                    id: data2.id,
                    date: now.toISOString(),
                });

                expect(item).to.have.property('id', data2.id);
                expect(item).to.have.property('dirty').that.is.false;
                expect(change).not.to.have.been.called;

                // We have fixed our date parsing issue
                expect(item)
                    .to.have.property('date')
                    .that.is.an.instanceof(Date);
                expect(item.date.getTime()).to.equal(now.getTime());
            });

            it('BEWARE! kendo.data.Model parses dates (via kendo.data.DataSource)', (done) => {
                const DataModel = Model.define(definition);
                const dataSource = new DataSource({
                    data: [JSON.parse(JSON.stringify(data1))],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const item = dataSource.at(0);
                            expect(item).to.have.property('id', data1.id);
                            expect(item)
                                .to.have.property('date')
                                .that.is.a('date');
                        })
                    )
                    .catch(done);
            });

            it('BaseModel should parse dates (via kendo.data.DataSource)', (done) => {
                const DataModel = BaseModel.define(definition);
                const dataSource = new DataSource({
                    data: [JSON.parse(JSON.stringify(data1))],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const item = dataSource.at(0);
                            expect(item).to.have.property('id', data1.id);
                            expect(item)
                                .to.have.property('date')
                                .that.is.a('date');
                        })
                    )
                    .catch(done);
            });
        });

        describe('Parsing nested properties', () => {
            // Nested properties are a feature of kendo.data.Model
            // documented at https://docs.telerik.com/kendo-ui/controls/data-management/grid/how-to/binding/use-nested-model-properties
            // They are used to flatten a json object with nested properties to display in a grid
            // Our lazy objects for grids should use nested properties when necessary
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    comments: {
                        from: 'metrics.comments.count',
                        type: 'number',
                    },
                    firstName: {
                        from: 'author.firstName',
                        type: 'string',
                    },
                    lastName: {
                        from: 'author.lastName',
                        type: 'string',
                    },
                },
            };
            const data = {
                id: new ObjectId().toString(),
                author: {
                    firstName: 'Joe',
                    lastName: 'Blogs',
                },
                metrics: {
                    comments: {
                        count: 10,
                    },
                },
            };

            it('kendo.data.Model does not parse nested properties', () => {
                const DataModel = Model.define(definition);
                const item = new DataModel(jsonClone(data));
                expect(item).to.have.property('id', data.id);
                expect(item).not.to.have.property('comments');
                expect(item).not.to.have.property('firstName');
                expect(item).not.to.have.property('lastName');
                // But it has original properties
                expect(item).to.have.property('author');
                expect(item).to.have.property('metrics');
            });

            it('BaseModel should parse nested properties', () => {
                const DataModel = BaseModel.define(definition);
                const item = new DataModel(jsonClone(data));
                expect(item).to.have.property('id', data.id);
                expect(item).to.have.property(
                    'comments',
                    data.metrics.comments.count
                );
                expect(item).to.have.property(
                    'firstName',
                    data.author.firstName
                );
                expect(item).to.have.property('lastName', data.author.lastName);
                // And it is clean of original properties
                expect(item).not.to.have.property('author');
                expect(item).not.to.have.property('metrics');
            });

            it('BEWARE! kendo.data.Model parses nested properties (with kendo.data.DataSource)', (done) => {
                const DataModel = Model.define(definition);
                const dataSource = new DataSource({
                    data: [jsonClone(data)],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const item = dataSource.at(0);
                            expect(item).to.have.property('id', data.id);
                            expect(item).to.have.property(
                                'comments',
                                data.metrics.comments.count
                            );
                            expect(item).to.have.property(
                                'firstName',
                                data.author.firstName
                            );
                            expect(item).to.have.property(
                                'lastName',
                                data.author.lastName
                            );
                            // But it also has original properties
                            // So it is a bit of a mess
                            expect(item).to.have.property('author');
                            expect(item).to.have.property('metrics');
                        })
                    )
                    .catch(done);
            });

            it('BaseModel should parse nested properties (with kendo.data.DataSource)', (done) => {
                const DataModel = BaseModel.define(definition);
                const dataSource = new DataSource({
                    data: [jsonClone(data)],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const item = dataSource.at(0);
                            expect(item).to.have.property('id', data.id);
                            expect(item).to.have.property(
                                'comments',
                                data.metrics.comments.count
                            );
                            expect(item).to.have.property(
                                'firstName',
                                data.author.firstName
                            );
                            expect(item).to.have.property(
                                'lastName',
                                data.author.lastName
                            );
                            // And it is clean of original properties
                            expect(item).not.to.have.property('author');
                            expect(item).not.to.have.property('metrics');
                        })
                    )
                    .catch(done);
            });
        });

        describe('Parsing nested models (subdocuments)', () => {
            const authorDefinition = {
                id: 'userId',
                fields: {
                    userId: {
                        type: 'string',
                        nullable: true,
                    },
                    name: {
                        type: 'string',
                    },
                },
            };
            const bookDefinition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                    },
                    title: {
                        type: 'string',
                    },
                    author: {
                        type: 'object',
                        defaultValue: null,
                        /*
                        parse(value) {
                            return value instanceof Author
                                ? value
                                : new Author(value);
                        }
                        */
                    },
                },
            };
            const data1 = {
                id: new ObjectId().toString(),
                title: 'Les Misérables',
                author: {
                    userId: new ObjectId().toString(),
                    name: 'Victor Hugo',
                },
            };
            const data2 = {
                id: new ObjectId().toString(),
                title: 'La Peste',
                author: {
                    id: new ObjectId().toString(),
                    name: 'Albert Camus',
                },
            };
            const data3 = {
                id: new ObjectId().toString(),
                title: 'Les Trois Mousquetaires',
                author: {
                    id: new ObjectId().toString(),
                    name: 'Alexandre Dumas',
                },
            };

            it('kendo.data.Model does not parse nested models', () => {
                const Author = Model.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = Model.define(bookDefinition);
                const item = new Book(data1);
                expect(item.author).not.to.be.an.instanceof(Author);
                expect(item.author).to.be.an.instanceof(ObservableObject);
            });

            it('BaseModel should parse nested models', () => {
                const Author = BaseModel.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = BaseModel.define(bookDefinition);

                const change = sinon.spy();
                const item = new Book(data1);
                item.bind('change', change);
                expect(change).not.to.have.been.called;
                expect(item.author).to.be.an.instanceof(Author);
                expect(item.get('author.name')).to.equal(data1.author.name);

                item.accept(data2);
                expect(change).not.to.have.been.called;
                expect(item.author).to.be.an.instanceof(Author);
                expect(item.get('author.name')).to.equal(data2.author.name);

                item.set('author', data3.author);
                expect(change).to.have.been.calledOnce;
                expect(item.author).to.be.an.instanceof(Author);
            });

            it('kendo.data.Model does not parse nested models (via kendo.data.DataSource)', (done) => {
                const Author = Model.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = Model.define(bookDefinition);
                const dataSource = new DataSource({
                    data: [jsonClone(data1)],
                    schema: {
                        model: Book,
                        modelBase: Book,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            let item;
                            item = dataSource.at(0);
                            expect(item.author).to.be.an.instanceof(Author); // This is unexpected!
                            // Add
                            dataSource.add(jsonClone(data2));
                            item = dataSource.at(1);
                            expect(item.author).not.to.be.an.instanceof(Author); // Obviously!
                            expect(item.author).to.be.an.instanceof(
                                ObservableObject
                            );
                            // Insert
                            dataSource.insert(0, jsonClone(data3));
                            item = dataSource.at(0);
                            expect(item.author).not.to.be.an.instanceof(Author); // Obviously!
                            expect(item.author).to.be.an.instanceof(
                                ObservableObject
                            );
                        })
                    )
                    .catch(done);
            });

            it('BaseModel should parse nested models (via kendo.data.DataSource)', (done) => {
                const Author = BaseModel.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = BaseModel.define(bookDefinition);
                const dataSource = new DataSource({
                    data: [jsonClone(data1)],
                    schema: {
                        model: Book,
                        modelBase: Book,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            let item = dataSource.at(0);
                            expect(item.author).to.be.an.instanceof(Author);
                            dataSource.add(jsonClone(data2));
                            item = dataSource.at(1);
                            expect(item.author).to.be.an.instanceof(Author);
                            dataSource.insert(0, jsonClone(data3));
                            item = dataSource.at(0);
                            expect(item.author).to.be.an.instanceof(Author);
                        })
                    )
                    .catch(done);
            });

            it('kendo.data.Model raises a change event when setting a submodel property', (done) => {
                const Author = Model.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = Model.define(bookDefinition);
                const viewModel = observable({
                    book: new Book(jsonClone(data1)),
                });
                viewModel.bind('change', (e) => {
                    expect(e).to.have.property('field', 'book.author.name');
                    done();
                });
                // viewModel.book.set('title', 'Germinal');
                viewModel.book.author.set('name', 'Emile Zola');
            });

            it('BaseModel should raise a change event when setting a submodel property', (done) => {
                const Author = BaseModel.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = BaseModel.define(bookDefinition);
                const viewModel = observable({
                    book: new Book(jsonClone(data1)),
                });
                viewModel.bind('change', (e) => {
                    expect(e).to.have.property('field', 'book.author.name');
                    done();
                });
                // viewModel.book.set('title', 'Germinal');
                viewModel.book.author.set('name', 'Emile Zola');
            });
        });

        describe('Parsing nested data sources of models (arrays of subdocuments)', () => {
            const bookDefinition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    title: {
                        type: 'string',
                    },
                },
            };
            const authorDefinition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    name: {
                        type: 'string',
                    },
                    books: {
                        // type: 'object',
                        defaultValue: [],
                        /*
                        parse(value) {
                            return value instanceof DataSource &&
                                value.reader.model === Book
                                ? value
                                : new DataSource({ data: value, schema: { model: Book } });
                        }
                        */
                    },
                },
            };
            const data1 = {
                id: new ObjectId().toString(),
                name: 'Victo Hugo',
                books: [
                    {
                        id: new ObjectId().toString(),
                        title: 'Les Misérables',
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'Le Contemplations',
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'Les Châtiments',
                    },
                ],
            };
            const data2 = {
                id: new ObjectId().toString(),
                name: 'Alexandre Dumas',
                books: [
                    {
                        id: new ObjectId().toString(),
                        title: 'Les Trois Mousquetaires',
                    },
                    {
                        id: new ObjectId().toString(),
                        title: '20 Ans Après',
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'Le Conte de Monté-Christo',
                    },
                ],
            };
            const data3 = {
                id: new ObjectId().toString(),
                name: 'Stendhal',
                books: [
                    {
                        id: new ObjectId().toString(),
                        title: 'Le Rouge et le Noir',
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'La Chartreuse de Parme',
                    },
                ],
            };

            it('kendo.data.Model does not parse nested data sources of models', () => {
                const Book = Model.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource &&
                        value.reader.model === Book
                        ? value
                        : new DataSource({ data: value, schema: { model: Book, modelBase: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = Model.define(authorDefinition);
                const item = new Author(data1);
                expect(item.books).not.to.be.an.instanceof(DataSource);
                expect(item.books).to.be.an.instanceof(ObservableArray);
            });

            it('BaseModel should parse nested data sources of models', (done) => {
                const Book = BaseModel.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource &&
                        value.reader.model === Book
                        ? value
                        : new DataSource({ data: value, schema: { model: Book, modelBase: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = BaseModel.define(authorDefinition);
                const item = new Author(data1);
                expect(item.books).to.be.an.instanceof(DataSource);
                item.books
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            expect(item.books.total()).to.equal(
                                data1.books.length
                            );
                            let count = 0;
                            item.books.data().forEach((book) => {
                                expect(book).to.be.an.instanceof(Book);
                                count += 1;
                            });
                            expect(count).to.equal(data1.books.length);
                        })
                    )
                    .catch(done);
            });

            it('kendo.data.Model does not parse nested data sources of models (via kendo.data.DataSource)', (done) => {
                const Book = Model.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource &&
                        value.reader.model === Book
                        ? value
                        : new DataSource({ data: value, schema: { model: Book, modelBase: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = Model.define(authorDefinition);
                const dataSource = new DataSource({
                    data: [jsonClone(data1)],
                    schema: {
                        model: Author,
                        modelBase: Author,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            let item;
                            item = dataSource.at(0);
                            expect(item).to.be.an.instanceof(Author);
                            expect(item.books).to.be.an.instanceof(DataSource); // This is unexpected!
                            // Add
                            dataSource.add(jsonClone(data2));
                            item = dataSource.at(1);
                            expect(item).to.be.an.instanceof(Author);
                            expect(item.books).not.to.be.an.instanceof(
                                DataSource
                            ); // Obviously!
                            expect(item.books).to.be.an.instanceof(
                                ObservableArray
                            );
                            // Insert
                            dataSource.insert(0, jsonClone(data3));
                            item = dataSource.at(0);
                            expect(item).to.be.an.instanceof(Author);
                            expect(item.books).not.to.be.an.instanceof(
                                DataSource
                            ); // Obviously!
                            expect(item.books).to.be.an.instanceof(
                                ObservableArray
                            );
                        })
                    )
                    .catch(done);
            });

            it('BaseModel should parse nested data sources of models (via kendo.data.DataSource)', (done) => {
                const Book = BaseModel.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource &&
                        value.reader.model === Book
                        ? value
                        : new DataSource({ data: value, schema: { model: Book, modelBase: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = BaseModel.define(authorDefinition);
                const dataSource = new DataSource({
                    data: [jsonClone(data1)],
                    schema: {
                        model: Author,
                        modelBase: Author,
                    },
                });
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            let item;
                            item = dataSource.at(0);
                            expect(item).to.be.an.instanceof(Author);
                            expect(item.books).to.be.an.instanceof(DataSource);
                            // Add
                            dataSource.add(jsonClone(data2));
                            item = dataSource.at(1);
                            expect(item).to.be.an.instanceof(Author);
                            expect(item.books).to.be.an.instanceof(DataSource);
                            // Insert
                            dataSource.insert(0, jsonClone(data3));
                            item = dataSource.at(0);
                            expect(item).to.be.an.instanceof(Author);
                            expect(item.books).to.be.an.instanceof(DataSource);
                        })
                    )
                    .catch(done);
            });

            it('kendo.data.Model does not raise a change event when adding an item to a nested data source', () => {
                const Book = Model.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource &&
                        value.reader.model === Book
                        ? value
                        : new DataSource({ data: value, schema: { model: Book, modelBase: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = Model.define(authorDefinition);
                const viewModel = observable({
                    author: new Author(data1),
                });
                const change = sinon.spy();
                viewModel.bind('change', change);
                expect(viewModel.author.books).not.to.be.an.instanceof(
                    DataSource
                );
                expect(viewModel.author.books).to.be.an.instanceof(
                    ObservableArray
                );
                const b = {
                    id: new ObjectId().toString(),
                    title: 'Notre Dame de Paris',
                };
                viewModel.author.books.push(b); // push instead of add
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(
                    sinon.match(
                        (e) =>
                            e.action === 'add' &&
                            e.field === 'author.books' &&
                            Array.isArray(e.items) &&
                            e.items.length === 1 &&
                            e.items[0].title === b.title
                    )
                );
            });

            it('BaseModel should raise a change event when adding an item to a nested data source', () => {
                const Book = BaseModel.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource &&
                        value.reader.model === Book
                        ? value
                        : new DataSource({ data: value, schema: { model: Book, modelBase: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = BaseModel.define(authorDefinition);
                const viewModel = observable({
                    author: new Author(data1),
                });
                const change = sinon.spy();
                viewModel.bind('change', change);
                expect(viewModel.author.books).to.be.an.instanceof(DataSource);
                const b = {
                    id: new ObjectId().toString(),
                    title: 'Notre Dame de Paris',
                };
                viewModel.author.books.add(b);
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(
                    sinon.match(
                        (e) =>
                            e.action === 'add' &&
                            e.field === 'author.books' &&
                            Array.isArray(e.items) &&
                            e.items.length === 1 &&
                            e.items[0].title === b.title
                    )
                );
            });
        });

        describe('Aggregating and grouping', () => {
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    name: {
                        type: 'string',
                    },
                    age: {
                        type: 'number',
                    },
                },
            };
            const data1 = {
                id: new ObjectId().toString(),
                name: 'Joe Bloggs',
                age: 10,
            };
            const data2 = {
                id: new ObjectId().toString(),
                name: 'Jim Smith',
                age: 20,
            };
            const data3 = {
                id: new ObjectId().toString(),
                name: 'Mary Jones',
                age: 20,
            };

            it('BaseModel should support kendo.data.DataSource aggregating', (done) => {
                const DataModel = BaseModel.define(definition);
                const dataSource = new DataSource({
                    data: [
                        jsonClone(data1),
                        jsonClone(data2),
                        jsonClone(data3),
                    ],
                    aggregate: [
                        { field: 'age', aggregate: 'sum' },
                        { field: 'age', aggregate: 'min' },
                        { field: 'age', aggregate: 'max' },
                    ],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            const results = dataSource.aggregates().age;
                            expect(results).to.have.property('max', 20);
                            expect(results).to.have.property('min', 10);
                            expect(results).to.have.property('sum', 50);
                        })
                    )
                    .catch(done);
            });

            it('BaseModel should support kendo.data.DataSource grouping', (done) => {
                const DataModel = BaseModel.define(definition);
                const dataSource = new DataSource({
                    data: [
                        jsonClone(data1),
                        jsonClone(data2),
                        jsonClone(data3),
                    ],
                    group: { field: 'age' },
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                    },
                });
                dataSource
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            const view = dataSource.view();
                            expect(view[0]).to.have.property('field', 'age');
                            expect(view[0]).to.have.property('value', 10);
                            expect(view[0])
                                .to.have.property('items')
                                .that.is.an(CONSTANTS.ARRAY)
                                .with.lengthOf(1);
                            expect(view[1]).to.have.property('field', 'age');
                            expect(view[1]).to.have.property('value', 20);
                            expect(view[1])
                                .to.have.property('items')
                                .that.is.an(CONSTANTS.ARRAY)
                                .with.lengthOf(2);
                        })
                    )
                    .catch(done);
            });
        });

        xdescribe('Raising change event on viewModel on accept', () => {
            // TODO Review thoroughly as I am not sure it is a good idea
            // Add breakpoint in all widgets and Kidoju-WebApp - player and editor

            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    name: {
                        type: 'string',
                    },
                    age: {
                        type: 'number',
                    },
                },
            };
            const data1 = {
                id: new ObjectId().toString(),
                name: 'Joe Bloggs',
                age: 10,
            };
            const data2 = {
                id: new ObjectId().toString(),
                name: 'Jim Smith',
                age: 20,
            };
            /*
            const data3 = {
                id: new ObjectId().toString(),
                name: 'Jim Smith',
                age: 20
            };
            */

            xit('kendo.data.Model does not raise a change event on accept (ObservableObject)', () => {
                const DataModel = Model.define(definition);
                const viewModel = observable({
                    item: new DataModel(data1),
                });
                const change = sinon.spy();
                viewModel.bind('change', change);
                viewModel.item.accept(data2);
                expect(change).not.to.have.been.called;
            });

            xit('BaseModel should raise a change event on accept (ObservableObject)', () => {
                const DataModel = BaseModel.define(definition);
                const viewModel = observable({
                    item: new DataModel(data1),
                });
                const change = sinon.spy();
                viewModel.bind('change', change);
                viewModel.item.accept(data2);
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(
                    sinon.match((e) => e.field === 'item')
                );
            });

            xit('kendo.data.Model does not raise a change event on accept (ObservableArray)', () => {
                const DataModel = Model.define(definition);
                const viewModel = observable({
                    items: [new DataModel(data1)],
                });
                const change = sinon.spy();
                viewModel.bind('change', change);
                viewModel.items[0].accept(data2);
                expect(change).not.to.have.been.called;
            });

            it('BaseModel should raise a change event on accept (ObservableArray)', () => {
                const DataModel = BaseModel.define(definition);
                const viewModel = observable({
                    items: [new DataModel(data1)],
                });
                const change = sinon.spy();
                viewModel.bind('change', change);
                viewModel.items[0].accept(data2);
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(
                    sinon.match(
                        (e) =>
                            e.action === 'itemchange' &&
                            e.field === 'items' &&
                            e.index === 0 &&
                            Array.isArray(e.items) &&
                            e.items.length === 1
                    )
                );
            });
        });

        describe('Handling errors', () => {
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false,
                    },
                    name: {
                        type: 'string',
                    },
                    age: {
                        type: 'number',
                    },
                },
            };
            const data1 = {
                id: new ObjectId().toString(),
                name: 'Joe Bloggs',
                age: 10,
            };
            /*
            const data2 = {
                id: new ObjectId().toString(),
                name: 'Jim Smith',
                age: 20
            };
            const data3 = {
                id: new ObjectId().toString(),
                name: 'Mary Jones',
                age: 20
            };
            */

            const DataModel = BaseModel.define(definition);
            const error404 = new Error('Not found');
            error404.status = 404;
            const Transport404 = Class.extend({
                create(options) {
                    // Note: calling options.success with an error wont work
                    // The data source will try to read the data
                    options.error(error2xhr(error404));
                },
                destroy(options) {
                    options.error(error2xhr(error404));
                },
                read(options) {
                    options.error(error2xhr(error404));
                },
                update(options) {
                    options.error(error2xhr(error404));
                },
            });

            it('Read error', (done) => {
                const errorHandler = sinon.spy();
                const dataSource = new DataSource({
                    data: [jsonClone(data1)],
                    schema: {
                        model: DataModel,
                        modelBase: DataModel,
                        errors: 'error',
                        data: 'data',
                        total: 'total',
                    },
                    transport: new Transport404(),
                    error: errorHandler,
                });
                dataSource
                    .read()
                    .then(() => {
                        done(new Error('UNexpected error')); // TODO
                    })
                    .catch((res) => {
                        expect(errorHandler).to.have.been.calledOnce;
                        expect(res[1]).to.equal('error');
                        expect(res[2]).to.equal('Ajax error');
                        done();
                    });
            });
        });

        describe('toJSON', () => {
            it('it should serialize primitive types and dates', () => {
                const DataModel = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        children: {
                            type: 'number',
                        },
                        dob: {
                            type: 'date',
                        },
                        male: {
                            type: 'boolean',
                        },
                        name: {
                            type: 'string',
                        },
                    },
                });
                const data = {
                    children: 3,
                    dob: new Date(),
                    male: true,
                    name: 'jack',
                };
                const model = new DataModel(data);
                const json = model.toJSON();
                // id is null by default and discarded
                expect(json).to.deep.equal(data);
            });

            it('it should discard properties added without a field definition', () => {
                const DataModel = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        name: {
                            type: 'string',
                        },
                    },
                    dummy1: 'dummy', // <---- one here
                });
                const data = {
                    name: 'Jack',
                    dummy2: 'dummy', // <---- another one here
                };
                const model = new DataModel(data);
                const json = model.toJSON();
                delete data.dummy2;
                expect(json).to.deep.equal(data);
            });

            it('it should use from fields to serialize nested properties', () => {
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
                            editable: false,
                        },
                        comments: {
                            from: 'metrics.comments.count',
                            type: 'number',
                        },
                        firstName: {
                            from: 'author.firstName',
                            type: 'string',
                        },
                        lastName: {
                            from: 'author.lastName',
                            type: 'string',
                        },
                        // For an explanation of the following properties
                        // See https://docs.telerik.com/kendo-ui/controls/data-management/grid/how-to/binding/use-nested-model-properties
                        // They are not required here
                        author: {
                            defaultValue: {},
                        },
                        metrics: {
                            defaultValue: {
                                comments: {},
                            },
                        },
                    },
                };
                const data = {
                    id: '1',
                    author: {
                        firstName: 'Joe',
                        lastName: 'Blogs',
                    },
                    metrics: {
                        comments: {
                            count: 10,
                        },
                    },
                };
                const DataModel = BaseModel.define(definition);
                const model = new DataModel(data);
                const json = model.toJSON();
                expect(json).to.deep.equal(data);
            });

            it('it should discard properties marked as not serializable (NEW!)', () => {
                const DataModel = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        firstName: {
                            type: 'string',
                            serializable: false, // <---- here
                        },
                        lastName: {
                            type: 'string',
                        },
                    },
                });
                const data = {
                    id: '1',
                    firstName: 'Joe',
                    lastName: 'Bloggs',
                };
                const model = new DataModel(data);
                const json = model.toJSON();
                // remove firstName which is not serializable
                delete data.firstName;
                expect(json).to.deep.equal(data);
            });

            // TODO It should discard empty objects and empty arrays

            // TODO It should discard nullable fields with null value

            it('it should serialize a complex object derived from a model nesting a submodel', () => {
                const Author = BaseModel.define({
                    id: 'userId',
                    fields: {
                        userId: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        name: {
                            type: 'string',
                        },
                    },
                });
                const Book = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        title: {
                            type: 'string',
                        },
                        author: {
                            defaultValue: null,
                            parse(value) {
                                return value instanceof Author
                                    ? value
                                    : new Author(value);
                            },
                        },
                    },
                });
                const data = {
                    id: new ObjectId().toString(),
                    title: 'Les Misérables',
                    author: {
                        userId: new ObjectId().toString(),
                        name: 'Victor Hugo',
                    },
                };
                const model = new Book(data);
                const json = model.toJSON();
                expect(json).to.deep.equal(data);
            });

            it('it should serialize a complex object derived from a model nesting a dataSource of submodels', () => {
                const Book = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        title: {
                            type: 'string',
                        },
                    },
                });
                const Author = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        name: {
                            type: 'string',
                        },
                        books: {
                            defaultValue: [],
                            parse(value) {
                                return value instanceof DataSource &&
                                    value.reader.model === Book
                                    ? value
                                    : new DataSource({data: value, schema: { model: Book, modelBase: Book }}); // eslint-disable-line prettier/prettier
                            },
                        },
                    },
                });
                const data = {
                    id: new ObjectId().toString(),
                    name: 'Victo Hugo',
                    books: [
                        {
                            id: new ObjectId().toString(),
                            title: 'Les Misérables',
                        },
                        {
                            id: new ObjectId().toString(),
                            title: 'Le Contemplations',
                        },
                        {
                            id: new ObjectId().toString(),
                            title: 'Les Châtiments',
                        },
                    ],
                };
                const model = new Author(data);
                // IMPORTANT! call read
                model.books.read();
                const json = model.toJSON();
                expect(json).to.deep.equal(data);
            });

            it('it should serialize an inherited model', () => {
                const DataModel = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            nullable: true,
                            editable: false,
                        },
                        children: {
                            type: 'number',
                        },
                        dob: {
                            type: 'date',
                        },
                        male: {
                            type: 'boolean',
                        },
                        name: {
                            type: 'string',
                        },
                    },
                });
                const Inherited = DataModel.define({
                    fields: {
                        country: {
                            type: 'string',
                        },
                    },
                });
                const data = {
                    children: 3,
                    dob: new Date(),
                    male: true,
                    name: 'jack',
                    country: 'FR',
                };
                const model = new Inherited(data);
                const json = model.toJSON();
                // id is null by default and discarded
                expect(json).to.deep.equal(data);
            });
        });

        xdescribe('BaseModel.projection', () => {
            xit('TODO', (done) => {
                done();
            });
        });

        xdescribe('validation', () => {
            xit('TODO', (done) => {
                done();
            });
        });
    });
});
