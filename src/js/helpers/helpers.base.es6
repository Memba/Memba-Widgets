/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

const { __karma__, location } = window;

/**
 * Base directory for Karma path
 * @type {string}
 */
/* eslint-disable prettier/prettier */
const base = __karma__
    ? 'base'
    : `${location.protocol}//${location.host}${
        /^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : ''
    }`;
/* eslint-enable prettier/prettier */

/**
 * Return base url
 * @param path
 */
function baseUrl(path) {
    // Remove / at beginning of path
    const p = (path || '').replace(/^\/(\S+)/, '$1');
    return `${base}/${p}`;
}

/**
 * Default export
 */
export default baseUrl;