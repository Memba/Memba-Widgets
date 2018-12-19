/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO : Check whether mime field should be editable
// TODO localize sizeFormatter

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './data.base.es6';

const {
    data: { DataSource, ObservableArray }
} = window.kendo;

/**
 * Asset
 *
 * IMPORTANT!
 * It needs to be subsclssed first to define asset schemes as in
 * const ImageAsset = Asset.define({ schemes: {} })
 *
 * @class Asset
 * @extends BaseModel
 */
export const Asset = BaseModel.define({
    id: 'url',
    fields: {
        size: {
            type: CONSTANTS.NUMBER,
            editable: false
        },
        mime: {
            // Note: we need this otherwise Google images without extensions cannot be viewed
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        },
        url: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        }
    },
    // Note: replace schemes by defining a sub-model
    schemes: {},

    /**
     * @method mime$
     * @returns {*}
     */
    mime$() {
        const mime = this.get('mime');
        if (mime) {
            return mime;
        }
        const url = this.get('url');
        if (url) {
            return Asset.typeFormatter(url);
        }
        return 'application/octet-stream';
    },

    /**
     * @method mame$
     * @returns {*}
     */
    name$() {
        return Asset.nameFormatter(this.get('url'));
    },

    /**
     * @method size$
     * @returns {*}
     */
    size$() {
        return Asset.sizeFormatter(this.get('size'));
    },

    /**
     * @method url$
     * @returns {*}
     */
    url$() {
        return Asset.scheme2http(this.get('url'), this.schemes);
    }
});

/**
 * Extracts file name from url
 * @function nameFormatter
 * @param url
 * @returns {*}
 */
Asset.nameFormatter = url => {
    assert.type(
        CONSTANTS.STRING,
        url,
        assert.format(assert.messages.type.default, 'url', CONSTANTS.STRING)
    );
    return url
        .split('\\')
        .pop()
        .split('/')
        .pop();
};

/**
 * Returns a file size formatted with bytes, KB, MB, GB
 * @function sizeFormatter
 * @param size
 * @returns {*}
 */
Asset.sizeFormatter = size => {
    assert.type(
        CONSTANTS.NUMBER,
        size,
        assert.format(assert.messages.type.default, 'size', CONSTANTS.NUMBER)
    );
    if (!size) {
        return '';
    }
    let ret = size;
    let suffix = ' bytes';
    if (size >= 1073741824) {
        suffix = ' GB';
        ret /= 1073741824;
    } else if (size >= 1048576) {
        suffix = ' MB';
        ret /= 1048576;
    } else if (size >= 1024) {
        suffix = ' KB';
        ret /= 1024;
    }
    return Math.round(ret * 100) / 100 + suffix;
};

/**
 * Convert file extension to mime type
 * @see http://hul.harvard.edu/ois/systems/wax/wax-public-help/mimetypes.htm
 * @function typeFormatter
 * @param url
 * @returns {*}
 */
Asset.typeFormatter = url => {
    assert.type(
        CONSTANTS.STRING,
        url,
        assert.format(assert.messages.type.default, 'url', CONSTANTS.STRING)
    );
    const ext = url
        .split('.')
        .pop()
        .toLowerCase();
    switch (ext) {
        case 'gif':
            return 'image/gif';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'mp3':
            // @see http://tools.ietf.org/html/rfc3003
            // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#MP3
            return 'audio/mpeg';
        case 'mp4':
            // @see http://www.rfc-editor.org/rfc/rfc4337.txt
            return 'video/mp4';
        case 'ogg':
            return 'audio/ogg';
        case 'ogv':
            return 'video/ogg';
        case 'png':
            return 'image/png';
        case 'svg':
            return 'image/svg+xml';
        case 'wav':
            return 'audio/wav';
        case 'webm':
            return 'video/webm';
        default:
            return 'application/octet-stream';
    }
};

/**
 * Formats a uri for display
 * Assuming this.options.schemes = { cdn: 'https://s3.amazonaws.com/account/bucket/' }
 * Then this function return ret = https://s3.amazonaws.com/account/bucket/photo.jpg from uri = cdn://photo.jpg
 * This allows us to switch between sources especially for our web and mobile applications
 * @function scheme2http
 * @param uri
 * @param schemes
 */
Asset.scheme2http = (uri, schemes) => {
    assert.type(
        CONSTANTS.STRING,
        uri,
        assert.format(assert.messages.type.default, 'uri', CONSTANTS.STRING)
    );
    assert.type(
        CONSTANTS.OBJECT,
        schemes,
        assert.format(assert.messages.type.default, 'schemes', CONSTANTS.OBJECT)
    );
    let ret = uri;
    Object.keys(schemes).some(scheme => {
        let done = false;
        if (uri.indexOf(`${scheme}://`) === 0) {
            const root = schemes[scheme];
            ret =
                root +
                (root.charAt(root.length - 1) === '/' ? '' : '/') +
                uri.substr(`${scheme}://`.length);
            done = true;
        }
        return done;
    });
    return ret;
};

/**
 * AssetDataSource
 * @class AssetDataSource
 * @extends DataSource
 */
export const AssetDataSource = DataSource.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        const AssetWithSchemes =
            options && options.schemes
                ? Asset.define({ schemes: options.schemes })
                : Asset;
        DataSource.fn.init.call(
            this,
            $.extend(true, {}, options, {
                schema: {
                    modelBase: AssetWithSchemes,
                    model: AssetWithSchemes
                }
            })
        );
    }
});

/**
 * create
 * @method create
 * @param options
 */
AssetDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof AssetDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only AssetDataSource instances are supported'
        );
    }
    return dataSource instanceof AssetDataSource
        ? dataSource
        : new AssetDataSource(dataSource);
};
