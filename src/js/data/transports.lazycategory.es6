/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import Logger from '../common/window.logger.es6';

/**
 * IMPORTANT
 * DataSource.init calls Transport.create which does transportOptions = options.transport ? $.extend({}, options.transport)
 * if options.transport is designed as an ES6 class, $.extend does not copy members create, destroy, read and update
 * if options.transport is designed as a kendo.Class, it does
 */
const {
    app: { cache, i18n },
    kendo: { Class }
} = window;
const logger = new Logger('transports.lazycategory');

/**
 * LazyCategoryTransport
 */
const LazyCategoryTransport = Class.extend({
    /**
     * Read
     * @param options
     */
    read(options) {
        assert.crud(options);
        logger.debug({
            message: 'Transport read',
            method: 'read'
            // data: options
        });
        // TODO: Replace with Cache Strategy
        cache
            .getAllCategories(i18n.locale())
            .done(options.success)
            .fail(options.error);
    }
});

/**
 * Default export
 */
export default LazyCategoryTransport;
