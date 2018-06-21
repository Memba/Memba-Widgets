/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from './window.assert.es6';
import Database from './pongodb.database.es6';

const VERSION_000 = '0.0.0';

/**
 * Migration
 * A migration progresses a database from one version to the next
 * by executing a series of scripts
 * IMPORTANT: Migrations need to be idempotent (can be executed any number of times)
 * @class
 */
export default class Migration {
    /**
     * Constructor
     * @constructor
     * @param options
     */
    constructor(options) {
        this._scripts = options.scripts || [];
        this._version = options.version || VERSION_000;
    }

    /**
     * Version getter
     * @returns {*|string}
     */
    get version() {
        return this._version;
    }

    /**
     * Execute
     * Note: version is not checked here
     */
    execute(db) {
        assert.instanceof(
            Database,
            db,
            assert.format(assert.messages.instanceof.default, 'db', 'Database')
        );
        const dfd = $.Deferred();
        const promises = [];
        this._scripts.forEach(script => {
            promises.push(script(db).progress(dfd.notify));
        });
        $.when(...promises)
            .done(dfd.resolve)
            .fail(dfd.reject);
        return dfd.promise();
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.pongodb = window.pongodb || {};
window.pongodb.Migration = Migration;
