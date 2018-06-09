/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions
import $ from 'jquery';
import assert from './window.assert.es6';
import Logger from './window.logger.es6';
import CONSTANTS from './window.constants.es6';
import { compareVersions } from './pongodb.util.es6';
import Collection from './pongodb.collection.es6';
import Migration from './pongodb.migration.es6';
import localForage from '../vendor/localforage/localforage.nopromises';

const logger = new Logger('pongodb.database');
const META = '__meta__';
const VERSION = 'version';
const VERSION_000 = '0.0.0';
const TRIGGERS = Object.values(Collection.triggers);

/**
 * Database
 * @param options
 * @constructor
 */
export default class Database {
    /**
     *
     * @param options
     */
    constructor(options) {
        assert.isPlainObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
        );
        assert.type(
            CONSTANTS.STRING,
            options.name,
            assert.format(
                assert.messages.type.default,
                'options.name',
                CONSTANTS.STRING
            )
        );
        assert.hasLength(
            options.name,
            assert.format(assert.messages.hasLength.default, 'options.name')
        );
        // eslint-disable-next-line no-param-reassign
        options.collections = options.collections || [];
        assert.isArray(
            options.collections,
            assert.format(
                assert.messages.isArray.default,
                'db',
                'options.collections'
            )
        );

        this._idField = options.idField || 'id';
        this._name = options.name || 'pongodb';

        // Configure localForage default store name
        // eslint-disable-next-line no-param-reassign
        options.storeName = META;

        // Force the use of WEBSQL in iOS WKWebView because indexedDB does not work properly
        // if (!window.chrome && window.webkit && window.indexedDB) {
        //     options.driver = localForage.WEBSQL;
        // }

        localForage.config(options);
        /*
        localForage.config({
            driver      : localForage.WEBSQL, // Force WebSQL; same as using setDriver()
            name        : name,
            version     : version,
            size        : 4980736 // Size of database, in bytes. WebSQL-only for now.
            storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
            description : 'some description'
        });
        */

        // Add collections
        options.collections.forEach(collection => {
            this[collection] = new Collection({
                db: this,
                name: collection
            });
        });

        // We cannot set the database version in the initialization code
        // We need to run an upgrade to set the version number unless Database.prototype.version is called explicitly
        // This upgrade requires migrations scripts
        this._migrations = [];
    }

    /**
     * Database name
     * @returns {*|string}
     */
    get name() {
        return this._name;
    }

    /**
     * Database version
     * @param value
     */
    // eslint-disable-next-line class-methods-use-this
    version(value) {
        const dfd = $.Deferred();
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            localForage.getItem(VERSION, (err, item) => {
                if (err) {
                    dfd.reject(err);
                } else if ($.type(item) === CONSTANTS.STRING) {
                    dfd.resolve(item);
                } else {
                    // If the value of version is not found, we return 0.0.0 to ensure upgrade migrations run
                    dfd.resolve(VERSION_000);
                }
            });
        } else {
            localForage.setItem(VERSION, value, (err, item) => {
                if (err) {
                    dfd.reject(err);
                } else {
                    dfd.resolve(item);
                }
            });
        }
        return dfd.promise();
    }

    /**
     * Create a collection
     * @see https://docs.mongodb.com/manual/reference/method/db.createCollection/
     * @param name
     * @param options
     */
    // eslint-disable-next-line class-methods-use-this
    createCollection() {
        // Note: for a future version, we could keep track of collections in the META table
        // therefore, we could open the database without listing the collections that would be read from the META table
        // and in this case, createCollection would make sense.
        throw new Error(
            'Instantiate a new Database object and pass an array of collection names to the constructor.'
        );
    }

    /**
     * Add full text index
     * Simply list the fields to be searched using window.pongodb.util.search
     * @param collection
     * @param textFields
     */
    // eslint-disable-next-line class-methods-use-this
    addFullTextIndex(collection, textFields) {
        assert.type(
            CONSTANTS.STRING,
            collection,
            assert.format(
                assert.messages.type.default,
                'collection',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            Collection,
            this[collection],
            assert.format(
                assert.messages.instanceof.default,
                'this[collection]',
                'Collection'
            )
        );
        assert.isArray(
            textFields,
            assert.format(assert.messages.isArray.default, 'textFields')
        );
        this[collection]._textFields = textFields;
    }

    /**
     * Create trigger
     * @param collection
     * @param events, a string or an array of strings
     * @param callback
     */
    createTrigger(collection, events, callback) {
        if ($.type(events) === CONSTANTS.STRING) {
            events = [events]; // eslint-disable-line no-param-reassign
        }
        assert.type(
            CONSTANTS.STRING,
            collection,
            assert.format(
                assert.messages.type.default,
                'collection',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            Collection,
            this[collection],
            assert.format(
                assert.messages.instanceof.default,
                'this[collection]',
                'Collection'
            )
        );
        assert.isArray(
            events,
            assert.format(assert.messages.isArray.default, 'events')
        );
        assert.isFunction(
            callback,
            assert.format(assert.messages.isFunction.default, 'callback')
        );
        events.forEach(evt => {
            const event = evt.toLowerCase();
            if (TRIGGERS.indexOf(event) > -1) {
                this[collection]._triggers[event].push(callback);
            }
        });
    }

    /**
     * Add a migration
     * @param migration
     */
    addMigration(migration) {
        assert.instanceof(
            Migration,
            migration,
            assert.format(
                assert.messages.instanceof.default,
                'migration',
                'Migration'
            )
        );
        this._migrations.push(migration);
    }

    /**
     * Upgrade database
     * @returns {*}
     */
    upgrade() {
        const db = this;
        const dfd = $.Deferred();
        db.version() // Read from storage
            .done(dbVersion => {
                // Sort migrations by version number
                const migrations = db._migrations.sort(compareVersions);
                // Find the next migration
                let found = false;
                migrations.some(migration => {
                    if (compareVersions(dbVersion, migration._version) < 0) {
                        found = true;
                        logger.info({
                            method: 'upgrade',
                            message: 'Starting migration',
                            data: { version: migration._version }
                        });
                        migration
                            .execute(db)
                            .progress(dfd.notify)
                            .done(() => {
                                // Bump version number
                                db.version(migration._version)
                                    .done(() => {
                                        logger.info({
                                            method: 'upgrade',
                                            message: 'Completed migration',
                                            data: {
                                                version: migration._version
                                            }
                                        });
                                        // Use recursion to execute the following migration
                                        db.upgrade()
                                            .progress(dfd.notify)
                                            .done(dfd.resolve)
                                            .fail(dfd.reject);
                                    })
                                    // Note: migrations need to be idempotent
                                    // otherwise failing to bump the version could be a problem
                                    .fail(dfd.reject);
                            })
                            .fail(dfd.reject);
                    }
                    // Returning true stops iterating through migrations
                    return found;
                });
                // Without migration to execute, we are done
                if (!found) {
                    dfd.resolve();
                }
            })
            .fail(dfd.reject);
        return dfd.promise();
    }

    /**
     * Drop a database
     * @see https://docs.mongodb.com/manual/reference/method/db.dropDatabase/
     */
    dropDatabase() {
        const dfd = $.Deferred();
        localForage.dropInstance({ name: this._name }, err => {
            if (err) {
                dfd.reject(err);
            } else {
                Object.keys(this).forEach(key => {
                    if (this[key] instanceof Collection) {
                        delete this[key];
                    }
                });
                dfd.resolve();
            }
        });
        return dfd.promise();
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.pongodb = window.pongodb || {};
window.pongodb.Database = Database;
