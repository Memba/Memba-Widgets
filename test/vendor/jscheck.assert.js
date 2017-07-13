/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


(function (undefined) {

    'use strict';

    var JSC = window.JSC;

    /**
     * JSC assertion rewritten with a callback
     * @param name, the name of the test
     * @param predicate, a function similar to
     *      function (verdict, a, b) {
     *          if (a < b) { // This is the condition to be checked
     *              verdict(true);
     *          } else {
     *              verdict(false);
     *          }
     *      }
     * @param signature, an array similar to
     *      [JSC.integer(10),JSC.integer(20)]
     *      which defines a as an integer bewten 0 and 10 and b as an integer between 0 and 20
     * @param classifier, a function similar to
     *      function (a, b) {
     *          return a < b ? 'ok' : false;
     *      }
     *      which acts as a filter to discard tests that might not validate the predicate (tests included are the ones which return a string)
     * @param callback
     */
    JSC.assert = function (name, predicate, signature, classifier, callback) {
        if (typeof name !== 'string') {
            throw new Error ('`name` should be a string');
        }
        if (typeof predicate !== 'function') {
            throw new Error ('`predicate` should be a function');
        }
        if (!Array.isArray(signature)) {
            throw new Error ('`signature` should be an array');
        }
        if (typeof classifier !== 'function') {
            throw new Error ('`classifier` should be a function');
        }
        if (typeof callback !== 'function') {
            throw new Error ('`callback` should be a function');
        }
        JSC.clear();
        JSC.on_result(function (result) {
            if (result.ok) {
                callback();
            } else {
                var err = new Error(result.fail + ' tests failed and ' + result.lost + ' tests lost of ' + result.total);
                err.result = result;
                callback(err)
            }
        });
        JSC.test(name, predicate, signature, classifier);
    };

}());
