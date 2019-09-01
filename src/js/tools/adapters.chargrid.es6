/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
import CONSTANTS from '../common/window.constants.es6';
import openCharGrid from '../dialogs/dialogs.chargrid.es6';
import BaseAdapter from './adapters.base.es6';

const {
    format,
    ui: { BaseDialog, CharGrid }
} = window.kendo;

/**
 * CharGridAdapter
 * @class CharGridAdapter
 * @extends BaseAdapter
 */
const CharGridAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options /* , attributes */) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        that.editor = (container, settings) => {
            $(`<${CONSTANTS.BUTTON}/>`)
                .text(CONSTANTS.ELLIPSIS)
                .addClass('k-button')
                .css({ margin: 0, width: '100%' })
                .appendTo(container)
                .on(CONSTANTS.CLICK, that.showDialog.bind(that, settings));
        };
    },

    /**
     * showDialog
     * @param options
     */
    showDialog(options /* , evt */) {
        const { model } = options;
        // Build data (resize array especially after changing rows and columns)
        const columns = model.get('attributes.columns');
        const rows = model.get('attributes.rows');
        const whitelist = model.get('attributes.whitelist');
        const layout = model.get('attributes.layout');
        const data = model.get(options.field);
        const value = CharGrid._getCharGridArray(
            rows,
            columns,
            whitelist,
            layout,
            data
        );
        // TODO wrap in import('./dialogs/dialogs.chargrid.es6').then(function () {...});
        openCharGrid({
            title: options.title || this.title,
            /* eslint-disable prettier/prettier */
            message:
                options.field === 'properties.solution'
                    ? format(
                        __('dialogs.chargrid.solution'),
                        model.get('attributes.whitelist')
                    )
                    : format(
                        __('dialogs.chargrid.layout'),
                        model.get('attributes.blank')
                    ),
            /* eslint-enable prettier/prettier */
            charGrid: {
                container: '.kj-dialog',
                scaler: '.kj-dialog',
                height: model.get('height'),
                width: model.get('width'),
                columns,
                rows,
                blank: model.get('attributes.blank'),
                locked: options.field === 'properties.solution' ? layout : [], // Do not lock when designing layout, but lock when designing solution
                whitelist:
                    options.field === 'properties.solution'
                        ? model.get('attributes.whitelist')
                        : '\\S', // Do not whitelist when designing layout, but whitelist when designing solution
                blankFill: model.get('attributes.blankFill'),
                gridFill: model.get('attributes.gridFill'),
                gridStroke: model.get('attributes.gridStroke'),
                lockedFill: model.get('attributes.lockedFill'),
                lockedColor: model.get('attributes.lockedColor'),
                selectedFill: model.get('attributes.selectedFill'),
                valueColor: model.get('attributes.valueColor')
            },
            data: {
                value
            }
        })
            .then(result => {
                if (
                    result.action ===
                    BaseDialog.fn.options.messages.actions.ok.action
                    // $.type(result.data.url) === CONSTANTS.STRING
                ) {
                    options.model.set(options.field, result.data.value);
                }
            })
            .catch($.noop); // TODO error management
    }
});

/**
 * Default export
 */
export default CharGridAdapter;
