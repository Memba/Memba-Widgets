/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const { Class } = window.kendo;

/**
 * ToolAssets
 * @class ToolAssets
 * @extends Class
 */
const ToolAssets = Class.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        const collections = (options || {}).collections || [];
        const extensions = (options || {}).extensions || [];
        const schemes = (options || {}).schemes || {};
        assert.isArray(
            collections,
            assert.format(
                assert.messages.isArray.default,
                'options.collections'
            )
        );
        assert.isArray(
            extensions,
            assert.format(assert.messages.isArray.default, 'options.extensions')
        );
        assert.type(
            CONSTANTS.OBJECT,
            schemes,
            assert.format(
                assert.messages.type.default,
                'options.schemes',
                CONSTANTS.OBJECT
            )
        );
        this.collections = collections;
        this.extensions = extensions;
        this.schemes = schemes;
    }
});

/**
 * Default export
 */
export default ToolAssets;
