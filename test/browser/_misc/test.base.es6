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
 * Default export
 */
export default base;
