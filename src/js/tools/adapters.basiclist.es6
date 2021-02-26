/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getAttributeBinding } from '../data/data.util.es6';
import '../widgets/widgets.basiclist.es6';
import BaseAdapter from './adapters.base.es6';

const {
    ui: { BasicList },
} = window.kendo;

/**
 * BasicListAdapter
 * @class BasicListAdapter
 * @extends BaseAdapter
 */
const BasicListAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = undefined;
        this.defaultValue = this.defaultValue || [];
        // this.editor is the list editor where the insert image button triggers this.onImageClick
        this.editor = (container, settings) => {
            const element = $(`<${CONSTANTS.DIV}/>`)
                .attr({
                    name: settings.field,
                    ...settings.attributes,
                    ...getAttributeBinding(
                        CONSTANTS.BIND,
                        `value: ${settings.field}`
                    ),
                    ...attributes,
                })
                .appendTo(container);
            const widget = element.kendoBasicList().data('kendoBasicList');
            assert.instanceof(
                BasicList,
                widget,
                assert.format(
                    assert.messages.instanceof.default,
                    'widget',
                    'kendo.ui.BasicList'
                )
            );
            widget.listView.dataSource.bind('change', (e) => {
                // When the dataSource raises a change event on any of the quiz data items that is added, changed or removed
                // We need to trigger a change event on the model field to ensure the stage element (which is not databound) is redrawn
                if ($.type(e.action) === CONSTANTS.STRING) {
                    settings.model.trigger('change', { field: settings.field });
                }
            });
        };
    },
});

/**
 * Default export
 */
export default BasicListAdapter;
