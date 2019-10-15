/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.combobox';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import { Page } from '../data/data.page.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import BaseAdapter from './adapters.base.es6';

const { attr, Observable } = window.kendo;

/**
 * ConnectorAdapter
 * @class ConnectorAdapter
 * @extends BaseAdapter
 */
const ConnectorAdapter = BaseAdapter.extend({
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
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = (container, settings) => {
            const input = $(`<${CONSTANTS.INPUT}>`)
                .css({ width: '100%' })
                .attr(
                    $.extend(
                        true,
                        { name: settings.field },
                        settings.attributes,
                        getValueBinding(settings.field),
                        attributes
                    )
                )
                .appendTo(container);
            input.kendoComboBox({
                autoWidth: true,
                // dataSource: { data: [''] }, // We need a non-empty dataSource otherwise open is not triggered
                /**
                 * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                 * @param e
                 */
                open(e) {
                    const solutions = [];
                    // find the design (mode) stage, avoiding navigation
                    const stage = $(
                        `[${attr('role')}="stage"][${attr('mode')}="design"]`
                    );
                    // find the handle box and the selected uid which should be a connector
                    const handleBox = stage.parent().children('.kj-handle-box');
                    const uid = handleBox.attr(attr('uid'));
                    // find all unselected connectors
                    assert.instanceof(
                        PageComponent,
                        settings.model,
                        assert.format(
                            assert.messages.instanceof.default,
                            'settings.model',
                            'PageComponet'
                        )
                    );
                    if (
                        settings.model.parent() instanceof Observable &&
                        settings.model.parent().selectedPage instanceof Page
                    ) {
                        const {
                            components
                        } = settings.model.parent().selectedPage;
                        $.each(components.data(), (index, component) => {
                            if (
                                component.tool === 'connector' &&
                                component.uid !== uid
                            ) {
                                const solution = component.get(settings.field);
                                if (
                                    $.type(solution) === CONSTANTS.STRING &&
                                    solution.length &&
                                    solutions.indexOf(solution) === -1
                                ) {
                                    solutions.push(solution);
                                }
                            }
                        });
                        solutions.sort();
                    }
                    e.sender.setDataSource(solutions);
                }
            });
        };
    }
});

/**
 * Default export
 */
export default ConnectorAdapter;
