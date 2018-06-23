/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import CONSTANTS from '../common/window.constants.es6';
// import assert from '../common/window.assert.es6';
import BaseModel from './models.base.es6';

const {
    app: { uris },
    cordova,
    kendo: { format }
} = window;

/**
 * LazyCategory
 */
const LazyCategory = BaseModel.define({
    id: 'id', // the identifier of the model, which is required for isNew() to work
    fields: {
        id: {
            type: CONSTANTS.STRING,
            editable: false
        },
        ageGroup: {
            type: CONSTANTS.NUMBER,
            editable: false,
            parse(value) {
                // defaultValue: 0 does not work as we get null
                // default parse function is return kendo.parseFloat(value);
                return parseInt(value, 10) || 255;
            }
        },
        count: {
            type: CONSTANTS.NUMBER,
            editable: false,
            parse(value) {
                // defaultValue: 0 does not work as we get null
                // default parse function is return kendo.parseFloat(value);
                return parseInt(value, 10) || 0;
            }
        },
        /*
        description: {
            type: CONSTANTS.STRING,
            editable: false
        },
        */
        icon: {
            type: CONSTANTS.STRING,
            editable: false
        },
        language: {
            type: CONSTANTS.STRING,
            editable: false
        },
        name: {
            type: CONSTANTS.STRING,
            editable: false
        },
        path: {
            defaultValue: [],
            editable: false
        }
    },
    /**
     * The depth used to add a margin to simulate a tree in mobile app list views
     * Top categories get a depth$ of zero
     * We use `depth` because `level` is used in kendo.ui.TreeView
     */
    depth$() {
        // return (this.get(this.idField).replace(RX_TRIM_LEVEL, '').length - TOP_LEVEL_CHARS) / LEVEL_CHARS;
        return (this.get('path') || []).length;
    },
    /**
     * The icon representing the category
     */
    icon$() {
        return format(
            cordova ? uris.mobile.icons : uris.cdn.icons,
            this.get('icon')
        );
    },
    /**
     * The id of the parent category
     * @returns {string}
     */
    parentId$() {
        // Top categories have a parentId$ which is undefined
        // var trimmedId = this.get(this.idField).replace(RX_TRIM_LEVEL, '');
        // if (trimmedId.length >= TOP_LEVEL_CHARS + LEVEL_CHARS) {
        //     return (trimmedId.substr(0, trimmedId.length - LEVEL_CHARS) + '0000000000000000').substr(0, 24);
        // }
        const path = this.get('path') || [];
        let ret;
        if (path.length) {
            ret = path[path.length - 1].id;
        }
        return ret;
    },
    /**
     * The filter to list all summaries belonging to a category
     * @returns {XML|void|string|*|{REPLACE, REPLACE_NEGATIVE}}
     */
    filter$() {
        return $.param({
            filter: {
                logic: 'and',
                filters: [
                    {
                        field: 'categoryId',
                        operator: 'gte',
                        value: this.get('id')
                    },
                    {
                        field: 'categoryId',
                        operator: 'lte',
                        value: this.get('id').replace(/0000/g, 'ffff')
                    }
                ]
            }
        });
    }
});

/**
 * Default export
 */
export default LazyCategory;

/**
 * Maintain compatibility with legacy code
 * @type {assert}
 */
window.app = window.app || {};
window.app.models = window.app.models || {};
window.app.models.LazyCategory = LazyCategory;
