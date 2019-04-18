/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.combobox';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import BaseAdapter from './adapters.base.es6';

// TODO make it a generic combobox adapter with a generic fill callback/open event  handler
const { attr } = window.kendo;

/**
 * QuestionAdapter
 * @class QuestionAdapter
 * @extends BaseAdapter
 */
const QuestionAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = (container, settings) => {
            const input = $(`<${CONSTANTS.INPUT}>`)
                .css({ width: '100%' })
                .attr(
                    $.extend(
                        true,
                        {},
                        settings.attributes,
                        getValueBinding(settings.field),
                        attributes
                    )
                )
                .appendTo(container);
            input.kendoComboBox({
                autoWidth: true,
                // dataSource: { data: [] }, // We need a non-empty dataSource otherwise open is not triggered
                /**
                 * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                 * @param e
                 */
                open(e) {
                    const data = [];
                    // find the design (mode) stage, avoiding navigation
                    const stage = $(
                        `[${attr('role')}="stage"][${attr('mode')}="design"]`
                    );
                    // find all labels
                    const labels = stage.find(
                        `.${CONSTANTS.ELEMENT_CLASS}[${attr(
                            'tool'
                        )}="label"]>div`
                    );
                    labels.each((index, label) => {
                        const text = $(label)
                            .html()
                            .replace(/<br\/?>/g, ' ');
                        if ($.type(text) === CONSTANTS.STRING && text.length) {
                            data.push(text);
                        }
                    });
                    data.sort();
                    e.sender.setDataSource(data);
                }
            });
        };
    }
});

/**
 * Default export
 */
export default QuestionAdapter;
