/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import ObjectId from '../../../src/js/common/window.objectid.es6';
import { error2xhr } from '../../../src/js/data/data.util.es6';

/**
 * getSpyingTransport
 * @function getSpyingTransport
 * @param data
 * @param spies
 * @returns {*}
 */
export function getSpyingTransport(data, spies = {}) {
    return {
        create(options) {
            const resp = Object.assign(options.data, {
                id: new ObjectId().toString()
            });
            if (typeof spies.create === 'function') {
                spies.create(resp);
            }
            options.success(options.data);
        },
        destroy(options) {
            if (typeof spies.destroy === 'function') {
                spies.destroy(options.data);
            }
            options.success(options.data);
        },
        read(options) {
            const resp = { data, total: data.length };
            if (typeof spies.read === 'function') {
                spies.read(resp);
            }
            options.success(resp);
        },
        update(options) {
            if (typeof spies.update === 'function') {
                spies.update(options.data);
            }
            options.success(options.data);
        }
    };
}

/**
 * getErrorTransport
 * @function getErrorTransport
 * @param data
 * @returns {*}
 */
export function getErrorTransport() {
    return {
        create(options) {
            options.error(error2xhr(new Error('Create error')));
        },
        destroy(options) {
            options.error(error2xhr(new Error('Destroy error')));
        },
        read(options) {
            options.error(error2xhr(new Error('Read error')));
        },
        update(options) {
            options.error(error2xhr(new Error('Update error')));
        }
    };
}
