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
import {
    BaseModel,
    BaseDataSource
} from '../../../src/js/data/kidoju.data.base.es6';
// Legacy code
import '../../../src/js/kidoju.util';

const { describe, it, kendo, kidoju, xdescribe, xit } = window;
const { Model } = kendo.data;
const { expect } = chai;
const { ObjectId } = window.kidoju.util;

describe('Legacy export', () => {
    it('Check kidoju.data.Model', () => {
        expect(kidoju.data.Model).to.equal(BaseModel);
    });
});

describe('Problems we had to solve with kendo.data.Model which lead to creating BaseModel and BaseDataSource', () => {
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
        const data2 = { id: '1' };

        it('Check that kendo.data.Model still does not assign default values to fields that are not initialized', () => {
            // This test should allow us to detect fixes in future versions of Kendo UI
            // in view to remove our custom code to fix kendo.data.Model...
            const TestModel = Model.define(definition);
            const model1 = new TestModel();
            const model2 = new TestModel(data2);

            expect(model1.id).to.be.null;
            expect(model1).to.have.property(
                'title',
                definition.fields.title.defaultValue
            );
            expect(model1)
                .to.have.property('dob')
                .that.is.a('date');
            expect(model1).to.have.property('age', 10);

            // undefined fields is the problem to fix
            expect(model2).to.have.property('id', data2.id);
            expect(model2.title).to.be.undefined;
            expect(model2.dob).to.be.undefined;
            expect(model2.age).to.be.undefined;
        });

        it('Our BaseModel should assign default values to fields that are not initialized', () => {
            const TestModel = BaseModel.define(definition);
            const model1 = new TestModel();
            const model2 = new TestModel(data2);

            expect(model1.id).to.be.null;
            expect(model1).to.have.property(
                'title',
                definition.fields.title.defaultValue
            );
            expect(model1)
                .to.have.property('dob')
                .that.is.a('date');
            expect(model1).to.have.property(
                'age',
                definition.fields.age.defaultValue()
            );

            // undefined fields have been fixed in kidoju.data.BaseModel
            expect(model2).to.have.property('id', data2.id);
            expect(model2).to.have.property(
                'title',
                definition.fields.title.defaultValue
            );
            expect(model2)
                .to.have.property('dob')
                .that.is.a('date');
            expect(model2).to.have.property(
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
        const data1 = {
            id: new ObjectId().toString(),
            date: past.toISOString()
        };
        const now = new Date();
        const data2 = {
            id: new ObjectId().toString(),
            date: now.toISOString()
        };

        it('Check that kendo.data.Model still does not parse dates on init and accept', () => {
            const TestModel = Model.define(definition);
            const model = new TestModel(data1);
            const change = sinon.spy();

            expect(model)
                .to.have.property('id')
                .that.is.equal(data1.id);
            // There lies the problem: the date property is supposed to be a Date and the string value has not been parsed/converted
            expect(model)
                .to.have.property('date')
                .that.is.a('string');
            expect(model.date).to.equal(data1.date);

            model.bind('change', change);
            model.accept(data2);

            // Although fields are non-editable, they have been updated which is expected with accept
            expect(model)
                .to.have.property('id')
                .that.is.equal(data2.id);
            // model is not dirty, which is expected since we have not called set
            expect(model).to.have.property('dirty').that.is.false;
            // accordingly the change event has not been raised
            expect(change).not.to.have.been.called;

            // There lies the problem again: the date property is supposed to be a Date and the string value has not been parsed/converted
            expect(model)
                .to.have.property('date')
                .that.is.a('string');
            expect(model.date).to.equal(data2.date);
        });

        it('Our BaseModel should parse dates on init and accept', () => {
            const TestModel = BaseModel.define(definition);
            const model = new TestModel(data1);
            const change = sinon.spy();

            expect(model)
                .to.have.property('id')
                .that.is.equal(data1.id);
            // The fix in BaseModel is discussed and explained at http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
            expect(model)
                .to.have.property('date')
                .that.is.an.instanceof(Date);
            expect(model.date.getTime()).to.equal(past.getTime());

            model.bind('change', change);
            model.accept({
                id: data2.id,
                date: now.toISOString()
            });

            expect(model)
                .to.have.property('id')
                .that.is.equal(data2.id);
            expect(model).to.have.property('dirty').that.is.false;
            expect(change).not.to.have.been.called;

            // We have fixed our date parsing issue
            expect(model)
                .to.have.property('date')
                .that.is.an.instanceof(Date);
            expect(model.date.getTime()).to.equal(now.getTime());
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
                comments: {
                    from: 'metrics.comments.count',
                    type: 'number'
                },
                firstName: {
                    from: 'author.firstName',
                    type: 'string'
                },
                lastName: {
                    from: 'author.lastName',
                    type: 'string'
                }
            }
        };
        const data = {
            id: '1',
            author: {
                firstName: 'Joe',
                lastName: 'Blogs'
            },
            metrics: {
                comments: {
                    count: 10
                }
            }
        };

        it('We expect to parse nested properties', () => {
            const TestModel = BaseModel.define(definition);
            const model = new TestModel(data);
            expect(model.comments).to.equal(data.metrics.comments.count);
            expect(model.firstName).to.equal(data.author.firstName);
            expect(model.lastName).to.equal(data.author.lastName);
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
        const data1 = {
            id: '1',
            title: 'Les Misérables',
            author: {
                userId: 'a',
                name: 'Victor Hugo'
            }
        };
        const data2 = {
            id: '2',
            title: 'La Peste',
            author: {
                id: 'b',
                name: 'Albert Camus'
            }
        };
        const data3 = {
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
            const model = new Book(data1);
            expect(model.author).not.to.be.an.instanceof(Author);
        });

        it('Our BaseModel should parse nested models', () => {
            const Author = BaseModel.define(authorDefinition);
            bookDefinition.fields.author.parse = function(value) {
                return value instanceof Author ? value : new Author(value);
            };
            const Book = BaseModel.define(bookDefinition);

            const change = sinon.spy();
            const model = new Book(data1);
            model.bind('change', change);
            expect(change).not.to.have.been.called;
            expect(model.author).to.be.an.instanceof(Author);
            expect(model.get('author.name')).to.equal(data1.author.name);

            model.accept(data2);
            expect(change).not.to.have.been.called;
            expect(model.author).to.be.an.instanceof(Author);
            expect(model.get('author.name')).to.equal(data2.author.name);

            model.set('author', data3.author);
            expect(change).to.have.been.calledOnce;
            expect(model.author).to.be.an.instanceof(Author);
        });
    });

    describe('Parsing nested data sources of models (arrays of subdocuments)', () => {
        it('Our BaseModel should parse nested data sources of models', () => {
            const Book = BaseModel.define({
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    title: {
                        type: 'string'
                    }
                }
            });
            const Author = BaseModel.define({
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
                    books: {
                        defaultValue: new BaseDataSource({
                            data: [],
                            schema: { model: Book }
                        }),
                        parse(value) {
                            return value instanceof BaseDataSource
                                ? value
                                : new BaseDataSource({ data: value, schema: { model: Book } }); // eslint-disable-line prettier/prettier
                        }
                    }
                }
            });
            const data = {
                id: '1',
                name: 'Victo Hugo',
                books: [
                    { id: 'a', title: 'Les Misérables' },
                    { id: 'b', title: 'Le Contemplations' },
                    { id: 'c', title: 'Les Châtiments' }
                ]
            };
            const model = new Author(data);
            expect(model.books).to.be.an.instanceof(BaseDataSource);
            // IMPORTANT! call read
            model.books.read();
            expect(model.books.total()).to.equal(data.books.length);
            let count = 0;
            model.books.data().forEach(book => {
                expect(book).to.be.an.instanceof(Book);
                count += 1;
            });
            expect(count).to.equal(data.books.length);
        });
    });

    describe('Propagating change events', () => {
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
            const viewModel = kendo.observable({
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
            const Author = BaseModel.define({
                id: 'userId',
                fields: {
                    userId: { type: 'string', nullable: true },
                    name: { type: 'string' }
                }
            });
            const Book = BaseModel.define({
                id: 'id',
                fields: {
                    id: { type: 'string', nullable: true },
                    title: { type: 'string' },
                    author: {
                        defaultValue: null,
                        parse(value) {
                            return value instanceof Author
                                ? value
                                : new Author(value);
                        }
                    }
                }
            });
            const viewModel = kendo.observable({
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
            const Book = BaseModel.define({
                id: 'id',
                fields: {
                    id: { type: 'string', nullable: true },
                    title: { type: 'string' }
                }
            });
            const BookDataSource = DataSource.extend({
                init(options) {
                    // Enforce the use of PageWithOptions items in the page collection data source
                    DataSource.fn.init.call(
                        this,
                        $.extend(true, {}, options, {
                            schema: { modelBase: Book, model: Book }
                        })
                    );
                    // Let's use a slightly modified reader to leave data conversions to kidoju.data.BaseModel._parseData
                    this.reader = new kidoju.data.BaseModelCollectionDataReader(
                        this.reader
                    );
                }
            });
            const Author = BaseModel.define({
                id: 'id',
                fields: {
                    id: { type: 'string', nullable: true },
                    name: { type: 'string' },
                    books: {
                        defaultValue: [],
                        parse(value) {
                            return value instanceof BookDataSource
                                ? value
                                : new BookDataSource(value);
                        }
                    }
                }
            });
            const b = { title: 'Le Compte de Monte-Cristo' };
            const viewModel = kendo.observable({
                author: new Author({
                    id: ObjectId(),
                    name: 'Victor Hugo',
                    books: [{ id: ObjectId(), title: 'Les Misérables' }]
                })
            });
            viewModel.bind('change', e => {
                expect(e).to.have.property('action', 'add');
                expect(e).to.have.property('field', 'author.books');
                expect(e)
                    .to.have.property('items')
                    .that.is.an.instanceof(Array)
                    .with.property('length', 1);
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
    describe('toJSON', () => {
        it('it should serialize primitive types', () => {
            const TestModel = BaseModel.define({
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    children: {
                        type: 'number'
                    },
                    dob: {
                        type: 'date'
                    },
                    male: {
                        type: 'boolean'
                    },
                    name: {
                        type: 'string'
                    }
                }
            });
            const data = {
                children: 3,
                dob: new Date(),
                male: true,
                name: 'jack'
            };
            const model = new TestModel(data);
            const json = model.toJSON();
            // id is null by default and discarded
            expect(json).to.deep.equal(data);
        });

        it('it should discard properties added without a field definition', () => {
            const TestModel = BaseModel.define({
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    name: {
                        type: 'string'
                    }
                },
                dummy1: 'dummy' // <---- one here
            });
            const data = {
                name: 'Jack',
                dummy2: 'dummy' // <---- another one here
            };
            const model = new TestModel(data);
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
                        editable: false
                    },
                    comments: {
                        from: 'metrics.comments.count',
                        type: 'number'
                    },
                    firstName: {
                        from: 'author.firstName',
                        type: 'string'
                    },
                    lastName: {
                        from: 'author.lastName',
                        type: 'string'
                    },
                    // For an explanation of the following properties
                    // See https://docs.telerik.com/kendo-ui/controls/data-management/grid/how-to/binding/use-nested-model-properties
                    // They are not required here
                    author: {
                        defaultValue: {}
                    },
                    metrics: {
                        defaultValue: {
                            comments: {}
                        }
                    }
                }
            };
            const data = {
                id: '1',
                author: {
                    firstName: 'Joe',
                    lastName: 'Blogs'
                },
                metrics: {
                    comments: {
                        count: 10
                    }
                }
            };
            const TestModel = BaseModel.define(definition);
            const model = new TestModel(data);
            const json = model.toJSON();
            expect(json).to.deep.equal(data);
        });

        it('it should discard properties marked as not serializable (NEW!)', () => {
            const TestModel = BaseModel.define({
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    firstName: {
                        type: 'string',
                        serializable: false // <---- here
                    },
                    lastName: {
                        type: 'string'
                    }
                }
            });
            const data = {
                id: '1',
                firstName: 'Joe',
                lastName: 'Bloggs'
            };
            const model = new TestModel(data);
            const json = model.toJSON();
            // remove firstName which is not serializable
            delete data.firstName;
            expect(json).to.deep.equal(data);
        });

        // TODO It should discard empty objects and empty arrays

        it('it should serialize a complex object derived from a model nesting a submodel', () => {
            const Author = BaseModel.define({
                id: 'userId',
                fields: {
                    userId: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    name: {
                        type: 'string'
                    }
                }
            });
            const Book = BaseModel.define({
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    title: {
                        type: 'string'
                    },
                    author: {
                        defaultValue: null,
                        parse(value) {
                            return value instanceof Author
                                ? value
                                : new Author(value);
                        }
                    }
                }
            });
            const data = {
                id: '1',
                title: 'Les Misérables',
                author: {
                    userId: 'a',
                    name: 'Victor Hugo'
                }
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
                        editable: false
                    },
                    title: {
                        type: 'string'
                    }
                }
            });
            const Author = BaseModel.define({
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
                    books: {
                        defaultValue: new BaseDataSource({
                            data: [],
                            schema: { model: Book }
                        }),
                        parse(value) {
                            return value instanceof BaseDataSource
                                ? value
                                : new BaseDataSource({ data: value, schema: { model: Book } }); // eslint-disable-line prettier/prettier
                        }
                    }
                }
            });
            const data = {
                id: '1',
                name: 'Victo Hugo',
                books: [
                    { id: 'a', title: 'Les Misérables' },
                    { id: 'b', title: 'Le Contemplations' },
                    { id: 'c', title: 'Les Châtiments' }
                ]
            };
            const model = new Author(data);
            // IMPORTANT! call read
            model.books.read();
            const json = model.toJSON();
            expect(json).to.deep.equal(data);
        });
    });

    describe('Diff and Patch', () => {
        // TODO
    });

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
