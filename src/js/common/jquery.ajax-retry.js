/*
 * jquery.ajax-retry
 * https://github.com/johnkpaul/jquery-ajax-retry
 *
 * Copyright (c) 2012 John Paul
 * Licensed under the MIT license.
 */

/* global define, jQuery */

// @see https://stackoverflow.com/questions/10024469/whats-the-best-way-to-retry-an-ajax-request-on-failure-using-jquery

(function umd(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        // eslint-disable-next-line global-require,import/no-extraneous-dependencies
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
})(($) => {
    // generates a fail pipe function that will retry `jqXHR` `times` more times
    function pipeFailRetry(jqXHR, opts) {
        const { times } = opts;
        let { timeout } = jqXHR;

        // takes failure data as input, returns a new deferred
        return function failRetry(input, status, msg) {
            const ajaxOptions = this;
            const output = new $.Deferred();
            const retryAfter = jqXHR.getResponseHeader('Retry-After');

            // whenever we do make this request, pipe its output to our deferred
            function nextRequest() {
                $.ajax(ajaxOptions)
                    .retry({
                        times: times - 1,
                        timeout: opts.timeout,
                        statusCodes: opts.statusCodes,
                    })
                    .pipe(output.resolve, output.reject);
            }

            if (
                times > 1 &&
                (!jqXHR.statusCodes ||
                    $.inArray(input.status, jqXHR.statusCodes) > -1)
            ) {
                // implement Retry-After rfc
                // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.37
                if (retryAfter) {
                    // it must be a date
                    if (Number.isNaN(retryAfter)) {
                        timeout = new Date(retryAfter).getTime() - $.now();
                        // its a number in seconds
                    } else {
                        timeout = parseInt(retryAfter, 10) * 1000;
                    }
                    // ensure timeout is a positive number
                    if (Number.isNaN(timeout) || timeout < 0) {
                        timeout = jqXHR.timeout;
                    }
                }

                if (timeout !== undefined) {
                    setTimeout(nextRequest, timeout);
                } else {
                    nextRequest();
                }
            } else {
                // no times left, reject our deferred with the current arguments
                // output.rejectWith(this, arguments);
                output.rejectWith(this, [input, status, msg]);
            }

            return output;
        };
    }

    // enhance all ajax requests with our retry API
    $.ajaxPrefilter((options, originalOptions, jqXHR) => {
        // eslint-disable-next-line no-param-reassign
        jqXHR.retry = function retry(opts) {
            if (opts.timeout) {
                this.timeout = opts.timeout;
            }
            if (opts.statusCodes) {
                this.statusCodes = opts.statusCodes;
            }
            return this.pipe(null, pipeFailRetry(this, opts));
        };
    });
});
