/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Page from '../../../src/js/data/models.page.es6';
// import BaseModel from '../../../src/js/data/models.base.es6';
// import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

const { describe, it, kendo, xit } = window;
const { DataSource } = kendo.data;
const { expect } = chai;
chai.use(sinonChai);

describe('models.stream', () => {
    describe('Stream', () => {
        var stream;

        describe('When initializing a Stream', function () {

            it('if initialized from an undefined, it should pass', function (done) {
                // Unfortunately, this is a Kendo UI requirement
                stream = new Stream();
                // expect(stream).to.have.property('id');
                expect(stream.pages).to.respondTo('fetch');
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
                expect(stream.pages).to.respondTo('fetch');
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
                expect(stream.pages).to.respondTo('fetch');
                stream.pages.fetch().then(function () {
                    expect(stream.pages.total()).to.equal(2);
                    var page = stream.pages.at(0);
                    expect(page).to.be.an.instanceof(Page);
                    expect(stream.pages).to.respondTo('load');
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

        // TODO patch
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
    });
});
