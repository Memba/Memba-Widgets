/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* ************************************************
 * IMPORTANT! Do not use this file in production
 ************************************************ */

import 'kendo.core';
import config from './app.config.jsx';

const { format } = window.kendo;

/**
 * Icon uri
 * @param icon
 * @returns {string}
 */
const iconUri = (icon) =>
    format(
        window.cordova ? config.uris.mobile.icons : config.uris.cdn.icons,
        icon
    );

/**
 * Export
 */
// eslint-disable-next-line import/prefer-default-export
export { iconUri };
