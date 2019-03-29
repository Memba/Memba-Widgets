/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* ************************************************
 * IMPORTANT! Do not use this file in production
 ************************************************ */

/**
 * application DEBUG mode
 */
window.DEBUG = true;

/* eslint-disable prettier/prettier */
const base = window.__karma__
    ? 'base'
    : `${window.location.protocol}//${window.location.host}${
        /^\/Kidoju.Widgets\//.test(window.location.pathname) ? '/Kidoju.Widgets' : ''
    }`;
/* eslint-enable prettier/prettier */

/**
 * The config object
 */
const config = {};

/**
 * URIs
 */
config.uris = {
    webapp: {
        workerlib: [
            `${base}/src/js/vendor/jashkenas/underscore.js`,
            `${base}/src/js/vendor/khan/kas.js`,
            `${base}/src/js/workers/workers.lib.js`
        ]
    }
};

/**
 * Default export
 */
export default config;
