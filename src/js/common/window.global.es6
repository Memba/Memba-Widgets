/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * A global store to share across an application, especially for i18n
 * @type {{}}
 * @private
 */
const app = {
    i18n: {},
};

/**
 * Add to globals in cordova and development/debug mode
 */
if (window.cordova || window.DEBUG || window.location.protocol !== 'https:') {
    // TODO Consider using isMobileApp from data.util
    window.app = app;
}

/**
 * Default export
 */
export default app;
