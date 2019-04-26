/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { Asset } from '../data/data.asset.es6';

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
    },

    /**
     * Convert Uri from data:// or cdn:// to http(s):// or a mobile device local path
     *
     * IMPORTANT! ToolAsset can be subsclassed and this function can ve overridden
     * for more complex scheme management including a different rule for different pages, e.g.
     *  - cdn:// could refer to our CDN in the player (except when played by the author)
     *  - cdn:// could refer to Amazon S3 in the designer, thus bypassing the CDN
     *
     * @param uri
     */
    scheme2http(uri) {
        let ret;
        if ($.type(uri) === CONSTANTS.STRING) {
            ret = Asset.scheme2http(uri, this.schemes);
        }
        return ret;
    }
});

/**
 * Default export
 */
export default ToolAssets;
