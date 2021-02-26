/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';
import Logger from './window.logger.es6';
import { dateReviver } from './window.util.es6';

const { cordova, localStorage } = window;
const logger = new Logger('window.secure');

/**
 * IMPORTANT: This is a wrapper for https://github.com/Crypho/cordova-plugin-secure-storage
 * We have discarded it for now because the limitations on Android and Windows compromise the experience
 */

/**
 * SecureStorage
 * @class SecureStorage
 */
class SecureStorage {
    /**
     * Constructor
     * @constructor constructor
     * @param options
     */
    constructor(options) {
        assert.type(
            CONSTANTS.OBJECT,
            options,
            assert.format(
                assert.messages.type.default,
                'options',
                CONSTANTS.OBJECT
            )
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
        if (cordova && cordova.plugins && cordova.plugins.SecureStorage) {
            this._initCordova(options);
        } else {
            this._initFallback(options);
        }
    }

    /**
     * _initCordova
     * @method _initCordova
     * @param options
     * @private
     */
    _initCordova(options) {
        const that = this;
        that._ss = new cordova.plugins.SecureStorage(
            () => {
                logger.debug({
                    message: 'SecureStorage successfully initialized',
                    method: 'SecureStorage._initCordova',
                });
            },
            () => {
                // See: https://github.com/Crypho/cordova-plugin-secure-storage#users-must-have-a-secure-screen-lock-set
                that._ss.secureDevice(
                    () => {
                        if ($.isFunction(options.success)) {
                            options.success();
                        }
                    },
                    () => {
                        if ($.isFunction(options.failure)) {
                            // Note iOS would not allow exiting an app programmatically
                            // and Android would still keep an unstable app in the recent apps
                            // window.navigator.app.exitApp();
                        }
                        that._ss = undefined;
                        that._initCordova(options);
                    }
                );
            },
            options.name
        );
    }

    /**
     * _initFallback
     * @method _initFallback
     * @param options
     * @private
     */
    _initFallback(options) {
        this._ss = {
            set(success, failure, key, value) {
                try {
                    localStorage.setItem(
                        `${options.name}${CONSTANTS.DOT}${key}`,
                        JSON.stringify(value)
                    );
                    success(key);
                } catch (err) {
                    failure(err);
                }
            },
            get(success, failure, key) {
                try {
                    const value = JSON.parse(
                        localStorage.getItem(
                            `${options.name}${CONSTANTS.DOT}${key}`
                        ),
                        dateReviver
                    );
                    success(value);
                } catch (err) {
                    failure(err);
                }
            },
            remove(success, failure, key) {
                try {
                    localStorage.removeItem(
                        `${options.name}${CONSTANTS.DOT}${key}`
                    );
                    success(key);
                } catch (err) {
                    failure(err);
                }
            },
        };
        logger.info({
            message: 'SecureStorage not available, using localStorage',
            method: 'SecureStorage._initFallback',
        });
    }

    /**
     * setItem
     * @method setItem
     * @param key
     * @param value
     * @returns {*}
     */
    setItem(key, value) {
        assert.type(
            CONSTANTS.OBJECT,
            this._ss,
            assert.format(
                assert.messages.type.default,
                'this._ss',
                CONSTANTS.OBJECT
            )
        );
        assert.type(
            CONSTANTS.STRING,
            key,
            assert.format(assert.messages.type.default, 'key', CONSTANTS.STRING)
        );
        const dfd = $.Deferred();
        this._ss.set(dfd.resolve, dfd.reject, key, value);
        return dfd.promise();
    }

    /**
     * getItem
     * @method getItem
     * @param key
     * @returns {*}
     */
    getItem(key) {
        assert.type(
            CONSTANTS.OBJECT,
            this._ss,
            assert.format(
                assert.messages.type.default,
                'this._ss',
                CONSTANTS.OBJECT
            )
        );
        assert.type(
            CONSTANTS.STRING,
            key,
            assert.format(assert.messages.type.default, 'key', CONSTANTS.STRING)
        );
        const dfd = $.Deferred();
        this._ss.get(dfd.resolve, dfd.reject, key);
        return dfd.promise();
    }

    /**
     * removeItem
     * @method removeItem
     * @param key
     * @returns {*}
     */
    removeItem(key) {
        assert.type(
            CONSTANTS.OBJECT,
            this._ss,
            assert.format(
                assert.messages.type.default,
                'this._ss',
                CONSTANTS.OBJECT
            )
        );
        assert.type(
            CONSTANTS.STRING,
            key,
            assert.format(assert.messages.type.default, 'key', CONSTANTS.STRING)
        );
        const dfd = $.Deferred();
        this._ss.remove(dfd.resolve, dfd.reject, key);
        return dfd.promise();
    }
}

/**
 * Default export
 */
export default SecureStorage;
