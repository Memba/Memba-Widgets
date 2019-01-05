/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Test 'localStorage' in window and private mode!
// TODO Test 'sessionStorage' in window and private mode!

import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';
import Logger from './window.logger.es6';
import { dateReviver } from './window.util.es6';
import md5 from '../vendor/blueimp/md5';
import LZString from '../vendor/pieroxy/lz-string';

const logger = new Logger('window.cache');
const DEFAULTS = {
    cache: !(window.app || {}).NOCACHE,
    silent: false,
    ttl: 24 * 60 * 60 // 1 day in seconds
};

/**
 * Cache in localStorage
 */
class LocalCache {
    /**
     * Constructor
     * @param options
     */
    constructor(options = {}) {
        this._cache = options.cache || DEFAULTS.cache;
        this._silent = options.silent || DEFAULTS.silent;
        this._storeName = 'localStorage';
        this._store = window[this._storeName];
        this._ttl = options.ttl || DEFAULTS.ttl;
        this._compress = typeof options.compress === 'boolean' || true;
    }

    /**
     * Get item from cache
     * @param key
     * @param raw - return the raw object with ts and ttl
     */
    getItem(key, raw = false) {
        assert.type(
            CONSTANTS.STRING,
            key,
            assert.format(assert.messages.type.default, 'key', CONSTANTS.STRING)
        );
        let value = null; // Key not found returns null
        try {
            if (this._cache) {
                let data = this._store.getItem(key);
                // eslint-disable-next-line valid-typeof
                if (typeof data === CONSTANTS.STRING) {
                    // Decompress data if needed
                    if (this._compress) {
                        data = LZString.decompressFromUTF16(data);
                    }
                    // dateReviver is used to convert ISO strings to dates
                    const item = JSON.parse(data, dateReviver);
                    const { sig } = item;
                    delete item.sig;
                    if (
                        Date.now() < item.ts + 1000 * item.ttl && // Not expired
                        md5(JSON.stringify(item)) === sig // Not tampered with
                    ) {
                        value = raw ? item : item.value;
                        logger.debug({
                            message: `value read from ${this._storeName} cache`,
                            method: 'getItem',
                            data: { key, value }
                        });
                    } else {
                        // No need to keep an expired or tampered value
                        this._store.removeItem(key);
                    }
                }
            }
        } catch (error) {
            logger.error({
                message: `Error getting value from ${this._storeName} cache`,
                method: 'getItem',
                error
            });
            if (!this._silent) {
                throw error;
            }
        }
        return value;
    }

    /**
     * Set item in cache
     * @param key
     * @param value
     * @param ttl
     * @param ts
     */
    setItem(key, value, ttl, ts) {
        assert.type(
            CONSTANTS.STRING,
            key,
            assert.format(assert.messages.type.default, 'key', CONSTANTS.STRING)
        );
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            ttl,
            assert.format(assert.messages.type.default, 'ttl', CONSTANTS.NUMBER)
        );
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            ts,
            assert.format(assert.messages.type.default, 'ts', CONSTANTS.NUMBER)
        );
        try {
            if (this._cache) {
                const item = {
                    ts: ts || Date.now(),
                    ttl: ttl || this._ttl,
                    value
                };
                item.sig = md5(JSON.stringify(item));
                let data = JSON.stringify(item);
                if (this._compress) {
                    data = LZString.compressToUTF16(data);
                }
                this._store.setItem(key, data);
                logger.debug({
                    message: `value added to ${this._storeName} cache`,
                    method: 'setItem',
                    data: { key, value }
                });
            }
        } catch (error) {
            logger.error({
                message: `Error setting value into ${this._storeName} cache`,
                method: 'setItem',
                error
            });
            if (!this._silent) {
                throw error;
            }
        }
    }

    /**
     * Remove items from cache
     * @param rx, a string or regular expression
     */
    removeItems(rx) {
        // eslint-disable-next-line valid-typeof
        if (typeof rx !== CONSTANTS.STRING && !(rx instanceof RegExp)) {
            throw new TypeError(
                assert.format(
                    assert.messages.type.default,
                    'rx',
                    'string or RegExp'
                )
            );
        }
        try {
            if (this._cache) {
                // eslint-disable-next-line valid-typeof
                if (typeof rx === CONSTANTS.STRING) {
                    this._store.removeItem(rx);
                } else if (rx instanceof RegExp) {
                    for (let i = 0, { length } = this._store; i < length; i++) {
                        const key = this._store.key(i);
                        if (rx.test(key)) {
                            this._store.removeItem(key);
                            logger.debug({
                                message: `value removed from ${
                                    this._storeName
                                } cache`,
                                method: 'setItem',
                                data: { key }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            logger.error({
                message: `Error removing value from ${this._storeName} cache`,
                method: 'removeItems',
                error
            });
            if (!this._silent) {
                throw error;
            }
        }
    }
}

/**
 * Cache in sessionStorage
 */
class SessionCache extends LocalCache {
    /**
     * Constructor
     * @param options
     */
    constructor(options = {}) {
        super(options);
        this._cache = options.cache || DEFAULTS.cache;
        this._silent = options.silent || DEFAULTS.silent;
        this._storeName = 'sessionStorage';
        this._store = window[this._storeName];
        this._ttl = options.ttl || DEFAULTS.ttl;
    }
}

/**
 * Exports
 * @type {LocalCache}
 */
export const localCache = new LocalCache();
export const sessionCache = new SessionCache();
