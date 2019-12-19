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
    i18n: {}
};

/**
 * Add to globals in cordova and debug mode
 */
if (window.cordova || window.DEBUG) {
    window.app = app;
}

/**
 * Default export
 */
export default app;
