/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import notification from '../app/app.notification.es6';
import Logger from '../common/window.logger.es6';
import WorkerPool from '../common/window.workers.es6';

const logger = new Logger('data.workers');

// TODO IMPORTANT! use app.uris
/* eslint-disable prettier/prettier */
const base = window.__karma__
    ? 'base'
    : `${window.location.protocol}//${window.location.host}${
        /^\/Kidoju.Widgets\//.test(window.location.pathname) ? '/Kidoju.Widgets' : ''
    }`;
/* eslint-enable prettier/prettier */

/**
 * Shared WorkerPool to grade BaseTest
 * Note: we use default concurrency and ttl
 * @type {WorkerPool}
 */
const workerPool = new WorkerPool();

/**
 * Library loader
 */
const loader = $.Deferred();
workerPool
    .load([
        `${base}/src/js/vendor/jashkenas/underscore.js`,
        `${base}/src/js/vendor/khan/kas.js`,
        `${base}/src/js/workers/workers.lib.js`
    ])
    .then(() => {
        loader.resolve(workerPool);
    })
    .catch(error => {
        loader.reject(error);
        logger.error({
            module: 'loader',
            message: 'Cannot load code library for worker pool',
            error
        });
        notification.error('Cannot load code library for worker pool'); // TODO i18n message
    });

/**
 * Delegate code execution to worker pool
 * after libraries have been loaded
 * @function poolExec
 */
export default function poolExec(...args) {
    const dfd = $.Deferred();
    loader.then(pool => {
        pool.exec(...args)
            .then(dfd.resolve)
            .catch(dfd.reject);
    });
    return dfd.promise();
}
