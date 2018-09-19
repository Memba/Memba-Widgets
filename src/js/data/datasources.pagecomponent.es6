/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import BaseDataSource from './datasources.base.es6';
import PageComponent from './models.pagecomponent.es6';

/**
 * PageComponentCollectionDataSource
 */
const PageComponentCollectionDataSource = BaseDataSource.extend({
    init(options) {
        BaseDataSource.fn.init.call(
            this,
            $.extend(true, options, {
                schema: {
                    model: PageComponent
                }
            })
        );
    }
});

/**
 * Default export
 */
export default PageComponentCollectionDataSource;

/**
 * Legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.data = window.kidoju.data || {};
window.kidoju.data.PageComponentCollectionDataSource = PageComponentCollectionDataSource;
