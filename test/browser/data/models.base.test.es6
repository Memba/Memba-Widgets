/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import BaseModel from '../../../src/js/data/models.base.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

const { describe, it, xit } = window;
const {
    data: { DataSource, Model, ObservableArray },
    observable
} = window.kendo;
const { expect } = chai;

chai.use(sinonChai);

describe('models.base', () => {
    describe('BaseModel', () => {
        describe('Default values', () => {
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
            const data = { id: '1' };

            it('kendo.data.Model does not assign default values', () => {
                // This test should allow us to detect fixes in future versions of Kendo UI
                // in view to remove our custom code to fix kendo.data.Model...
                const DataModel = Model.define(definition);
                const model1 = new DataModel();
                const model2 = new DataModel(data);

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
                expect(model2).to.have.property('id', data.id);
                expect(model2.title).to.be.undefined;
                expect(model2.dob).to.be.undefined;
                expect(model2.age).to.be.undefined;
            });

            it('BaseModel should assign default values', () => {
                const DataModel = BaseModel.define(definition);
                const model1 = new DataModel();
                const model2 = new DataModel(data);

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

                // undefined fields have been fixed in BaseModel
                expect(model2).to.have.property('id', data.id);
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

        describe('Parsing dates', () => {
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

            it('kendo.data.Model does not parse dates', () => {
                const DataModel = Model.define(definition);
                const model = new DataModel(data1);
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

            it('BaseModel should parse dates', () => {
                const DataModel = BaseModel.define(definition);
                const model = new DataModel(data1);
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
            // Our lazy objects for grids should use nested properties when necessary
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

            it('kendo.data.Model does not parse nested properties', () => {
                const DataModel = Model.define(definition);
                const model = new DataModel(data);
                expect(model.comments).to.be.undefined;
                expect(model.firstName).to.be.undefined;
                expect(model.lastName).to.be.undefined;
            });

            it('BaseModel should parse nested properties', () => {
                const DataModel = BaseModel.define(definition);
                const model = new DataModel(data);
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
                        type: 'object',
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

            it('kendo.data.Model does not parse nested models', () => {
                const Author = Model.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
                    return value instanceof Author ? value : new Author(value);
                };
                const Book = Model.define(bookDefinition);
                const model = new Book(data1);
                expect(model.author).not.to.be.an.instanceof(Author);
            });

            it('BaseModel should parse nested models', () => {
                const Author = BaseModel.define(authorDefinition);
                bookDefinition.fields.author.parse = function parse(value) {
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
            const bookDefinition = {
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
            };
            const authorDefinition = {
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
                        type: 'object',
                        defaultValue: [],
                        parse(value) {
                            return value instanceof DataSource
                                ? value
                                : new DataSource({ data: value, schema: { model: Book } }); // eslint-disable-line prettier/prettier
                        }
                    }
                }
            };
            const data = {
                id: '1',
                name: 'Victo Hugo',
                books: [
                    { id: 'a', title: 'Les Misérables' },
                    { id: 'b', title: 'Le Contemplations' },
                    { id: 'c', title: 'Les Châtiments' }
                ]
            };

            it('kendo.data.Model does not parse nested data sources of models', () => {
                const Book = Model.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource
                        ? value
                        : new DataSource({ data: value, schema: { model: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = Model.define(authorDefinition);
                const model = new Author(data);
                expect(model.books).to.be.an.instanceof(ObservableArray); // Not a DataSource
            });

            it('BaseModel should parse nested data sources of models', done => {
                const Book = BaseModel.define(bookDefinition);
                authorDefinition.fields.books.parse = function parse(value) {
                    return value instanceof DataSource
                        ? value
                        : new DataSource({ data: value, schema: { model: Book } }); // eslint-disable-line prettier/prettier
                };
                const Author = BaseModel.define(authorDefinition);
                const model = new Author(data);
                expect(model.books).to.be.an.instanceof(DataSource);
                model.books
                    .read()
                    .then(() => {
                        expect(model.books.total()).to.equal(data.books.length);
                        let count = 0;
                        model.books.data().forEach(book => {
                            expect(book).to.be.an.instanceof(Book);
                            count += 1;
                        });
                        expect(count).to.equal(data.books.length);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('Propagating change events', () => {
            // Review thoroughly as I am not sure it is a good idea
            // Add breakpoint in all widgets and Kidoju-WebApp - player and editor

            it('We expect to raise a change event on the parent ObservableObject on accept', () => {
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
                const BadModel = Model.define(definition);
                const FixedModel = BaseModel.define(definition);

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
                const viewModel = observable({
                    badObject: new BadModel(d1),
                    fixedObject: new FixedModel(d1)
                });

                const change = sinon.spy();
                viewModel.bind('change', change);

                viewModel.badObject.accept(d2);

                // BadModel inherited from kendo.data.Model does not trigger a change event
                // on the parent observable when changing values via accept method
                expect(change).not.to.have.been.called;

                viewModel.fixedObject.accept(d2);

                // FixedModel inherited from our BaseModel does trigger a change event
                // on the parent observable when changing values via accept method
                expect(change).to.have.been.calledOnce;
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
                        this.reader = new window.kidoju.data.BaseModelCollectionDataReader(
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

        describe('Enhancements of kendo.data.Model in BaseModel', () => {
            describe('toJSON', () => {
                it('it should serialize primitive types and dates', () => {
                    const DataModel = BaseModel.define({
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
                                defaultValue: new DataSource({
                                    data: [],
                                    schema: { model: Book }
                                }),
                                parse(value) {
                                    return value instanceof DataSource
                                        ? value
                                        : new DataSource({data: value, schema: {model: Book}}); // eslint-disable-line prettier/prettier
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

                it('it should serialize an inherited model', () => {
                    const DataModel = BaseModel.define({
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
                    const Inherited = DataModel.define({
                        fields: {
                            country: {
                                type: 'string'
                            }
                        }
                    });
                    const data = {
                        children: 3,
                        dob: new Date(),
                        male: true,
                        name: 'jack',
                        country: 'FR'
                    };
                    const model = new Inherited(data);
                    const json = model.toJSON();
                    // id is null by default and discarded
                    expect(json).to.deep.equal(data);
                });
            });
        });
    });
});
