/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';
import Logger from './window.logger.es6';

const logger = new Logger('window.workers');
const { Blob, console, cordova, navigator, URL, Worker } = window;

/**
 * Check whether chrome devtools is opened
 * @see https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open
 */
const devtools = /./;
devtools.toString = function toString() {
    this.opened =
        'chrome' in window && $.type(window.StyleMedia) === CONSTANTS.UNDEFINED;
};

/**
 * Define our ideal worker timeout from CPU capacity
 * @returns {number}
 */
function workerTimeout() {
    if (console) {
        // devtools.opened will become true if/when the console is opened
        console.log('%c', devtools);
    }
    const start = Date.now();
    for (let i = 0; i < 1000000; i++) {
        // This would take about 10 ms on an iPad Pro
        // This would take about 100 ms on a Nexus 7 2012
        Math.floor(100 * Math.random());
    }
    const end = Date.now();
    const k = devtools.opened ? 4 : 1;
    // A minimum of 250ms is required in browsers and 400ms in Phonegap
    const timeout = k * Math.max(cordova ? 400 : 250, 10 * (end - start));
    logger.info({
        method: 'workerTimeout',
        message: `Worker default timeout set to ${timeout} ms`
    });
    return timeout;
}
const CONCURRENCY = Math.max(1, (navigator.hardwareConcurrency || 4) - 1);
const TTL = workerTimeout();

/**
 * Concat multiple $.ajax responses
 * @param responses
 * @returns {*}
 */
function concat(responses) {
    let ret;
    if (Array.isArray(responses) && Array.isArray(responses[0])) {
        ret = responses.map(r => r[0]).join('\n\n');
    } else if (
        Array.isArray(responses) &&
        $.type(responses[0]) === CONSTANTS.STRING
    ) {
        [ret] = responses;
    }
    assert.type(
        CONSTANTS.STRING,
        ret,
        assert.format(assert.messages.type.default, 'ret', CONSTANTS.STRING)
    );
    return ret;
}

/**
 * WorkerPool
 * @class WorkerPool
 */
export default class WorkerPool {
    /**
     * Constructor
     * @constructor
     * @param concurrency
     * @param ttl
     */
    constructor(concurrency = CONCURRENCY, ttl = TTL) {
        assert.type(
            CONSTANTS.NUMBER,
            ttl,
            assert.format(assert.messages.type.default, ttl, CONSTANTS.NUMBER)
        );
        assert.type(
            CONSTANTS.NUMBER,
            concurrency,
            assert.format(
                assert.messages.type.default,
                concurrency,
                CONSTANTS.NUMBER
            )
        );
        // ttl
        this.ttl = ttl;
        // Array of concurrent working threads
        this.workers = new Array(concurrency);
        // Queue of tasks and promises
        this.tasks = [];
    }

    /**
     * Load a library or an array of libraries
     */
    load(url) {
        let libraries = url;
        if ($.type(libraries) === CONSTANTS.STRING) {
            libraries = [url];
        }
        assert.isArray(
            libraries,
            assert.format(assert.messages.isArray.default, 'url')
        );
        const promises = libraries.map(library =>
            $.ajax({ url: library, cache: true, dataType: 'text' })
        );
        /**
         * IMPORTANT:
         * There is no significant performance difference between merging the library and using importScripts.
         * We have implemented the later because it makes one common blob with the library and all other blobs are very small which makes a smaller memory footprint.
         * If the library were merged, each worker blob would contain the library, potentially making a much larger memory footprint.
         */
        return $.when(...promises).done((...responses) => {
            // Here library is loaded so as to be merged with script (see exec)
            // this._library = concat(responses);

            // Here library is loaded as a common blob to be imported via importScripts
            if (this._library) {
                // Note: Considering URL.revokeObjectURL(this._library) won't be called in th eend
                // let's make sure we call it on any existing library before setting a new one
                URL.revokeObjectURL(this._library);
            }
            const blob = new Blob([concat(responses)], {
                type: 'application/javascript'
            });
            this._library = URL.createObjectURL(blob);
        });
    }

    /**
     * Execute script and message
     * @param script, e.g. `self.postMessage(soundex(JSON.parse(e.data)));`
     * @param message, we do not force but we recommend a JSON.stringified message to avoid a DataCloneError with complex values
     * @param name, optional but makes it easier to read logs
     */
    exec(script, message, name) {
        assert.type(
            CONSTANTS.STRING,
            script,
            assert.format(
                assert.messages.type.default,
                'script',
                CONSTANTS.STRING
            )
        );
        // task.message needs to be JSON.stringified because of a DataCloneError with complex values
        /*
        assert.type(
            CONSTANTS.STRING,
            message,
            assert.format(
                assert.messages.type.default,
                'message',
                CONSTANTS.STRING
            )
        );
        */
        assert.type(
            CONSTANTS.STRING,
            name,
            assert.format(
                assert.messages.type.default,
                'name',
                CONSTANTS.STRING
            )
        );
        const deferred = $.Deferred();
        /*
        // Here library is merged with script
        const blob = new Blob(
            [
                `${
                    this._library
                };self.onmessage = function (e) { ${script}; self.close(); };`
            ],
            { type: 'application/javascript' }
        );
        */
        // Here library is a common blob imported via importScripts
        const blob = new Blob(
            [
                `${
                    this._library
                        ? `self.importScripts('${this._library}'); `
                        : ''
                }self.onmessage = function (e) { ${script}; self.close(); };`
            ],
            { type: 'application/javascript' }
        );
        const blobURL = URL.createObjectURL(blob);
        this.tasks.push({
            deferred,
            message,
            name, // Essentially to display a function name in logs
            blobURL
        });
        this._next();
        return deferred.promise();
    }

    /**
     * Return next idle worker
     * @private
     */
    _idle() {
        let thread;
        for (let i = 0, { length } = this.workers; i < length; i++) {
            if ($.type(this.workers[i]) === CONSTANTS.UNDEFINED) {
                thread = i;
                break;
            }
        }
        return thread;
    }

    /**
     * Runs next task
     */
    _next() {
        const { tasks, ttl, workers } = this;
        const _next = this._next.bind(this);
        function terminate(thread, task) {
            if (workers[thread] instanceof Worker) {
                // Unterminated errored workers make further workers unstable in FF
                workers[thread].terminate();
            }
            workers[thread] = undefined;
            URL.revokeObjectURL(task.blobURL);
        }
        // Check pending tasks
        if (tasks.length > 0) {
            // Check available workers
            const thread = this._idle();
            if ($.type(thread) === CONSTANTS.UNDEFINED) {
                // Without available worker, try again later
                setTimeout(_next, ttl / (workers.length || 1));
                logger.debug({
                    method: '_next',
                    message: 'Waiting for an idle worker'
                });
            } else {
                // Run the task on the available worker
                const task = tasks.shift();
                const name = task.name || 'a worker';
                logger.debug({
                    method: '_next',
                    message: `Executing ${name} on thread ${thread}`
                });
                workers[thread] = new Worker(task.blobURL);
                // onmessage event handler
                workers[thread].onmessage = function onmessage(e) {
                    task.deferred.resolve({ name: task.name, value: e.data });
                    terminate(thread, task);
                    logger.debug({
                        method: '_next',
                        message: `Completing ${name} on thread ${thread}`
                    });
                    _next();
                };
                // onerror event handler
                workers[thread].onerror = function onerror(e) {
                    // e is an ErrorEvent and e.error is null
                    const error = new Error(
                        `${name} on thread ${thread} has an error: ${e.message}`
                    );
                    error.filename = e.filename;
                    error.colno = e.colno;
                    error.lineno = e.lineno;
                    task.deferred.reject(error);
                    terminate(thread, task);
                    logger.error({
                        method: '_next',
                        error
                    });
                    _next();
                };
                // Trigger execution
                workers[thread].postMessage(task.message);
                // Terminate if execution reaches ttl
                setTimeout(() => {
                    if (task.deferred.state() === 'pending') {
                        const error = new Error(
                            `${name} on thread ${thread} has timed out`
                        );
                        error.timeout = true; // So that we know it is a timeout
                        task.deferred.reject(error);
                        terminate(thread, task);
                        logger.error({
                            method: '_next',
                            error
                        });
                        _next();
                    }
                }, ttl);
            }
        }
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.models = window.kidoju.models || {};
window.kidoju.models.WorkerPool = WorkerPool;
