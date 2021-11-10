/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';

const { data: { DataSource } } = window.kendo;

const dataSource = new DataSource({
    data: [
        {
            q: 'Question 1',
            a: 'Answer 1'
        },
        {
            q: 'Question 2',
            a: 'Answer 2'
        },
        {
            q: 'Question 3',
            a: 'Answer 3'
        }
    ]
});

const stream = {
    pages: dataSource
}

/**
 * Default export
 */
export default stream;
