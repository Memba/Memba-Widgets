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
 * Locales for app.i18n
 * @type {string[]}
 */
config.locales = ['en', 'fr'];

/**
 * URIs
 */
config.uris = {
    cdn: {
        icons: `${base}/src/styles/images/o_collection/svg/office/{0}.svg`
    },
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
