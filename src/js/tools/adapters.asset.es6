/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider a generic opendialog adapter with/without value
// TODO finish catch

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assets from '../app/app.assets.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import PageComponent from '../data/models.pagecomponent.es6';
// TODO import openAssetManager from '../dialogs/dialogs.assetmanager.es6';
import '../dialogs/widgets.basedialog.es6';
import BaseAdapter from './adapters.base.es6';
import ToolAssets from './util.assets.es6';

const {
    ui: { BaseDialog }
} = window.kendo;

const openAssetManager = () =>
    $.Deferred()
        .resolve({ action: 'cancel' })
        .promise();

/**
 * AssetAdapter
 * @class AssetAdapter
 * @extends BaseAdapter
 */
const AssetAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options /* , attributes */) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = CONSTANTS.STRING;
        that.defaultValue = that.defaultValue || (that.nullable ? null : '');
        // that.editor is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function(container, settings) {
            // We need a wrapper because container has { display: table-cell; }
            const wrapper = $('<div/>')
                .css({ display: 'flex' })
                .appendTo(container);
            $('<input/>')
                .addClass('k-textbox')
                .css({
                    flex: 'auto',
                    width: '100%' // 'auto' seems to imply a min-width
                })
                .prop({ readonly: true })
                .attr(
                    $.extend(
                        {},
                        settings.attributes,
                        getValueBinding(settings.field)
                    )
                )
                .appendTo(wrapper);
            $('<button/>')
                .text('...')
                .addClass('k-button')
                .css({
                    flex: 'none',
                    marginRight: 0
                })
                .appendTo(wrapper)
                .on(CONSTANTS.CLICK, that.showDialog.bind(that, settings));
        };
    },

    /**
     * Show dialog
     * @method showDialog
     * @param options
     */
    showDialog(options /* , e */) {
        assert.instanceof(
            PageComponent,
            options.model,
            assert.format(
                assert.messages.instanceof.default,
                'options.model',
                'kidoju.data.PageComponent'
            )
        );
        assert.instanceof(
            ToolAssets,
            assets[options.model.tool],
            assert.format(
                assert.messages.instanceof.default,
                'assets[options.model.tool]',
                'kidoju.ToolAssets'
            )
        );
        openAssetManager({
            title: options.title,
            data: {
                value: options.model.get(options.field)
            },
            assets: assets[options.model.tool]
        })
            .then(result => {
                if (
                    result.action ===
                    BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    options.model.set(options.field, result.data.value);
                }
            })
            .catch(err => {
                // TODO
            });
    }
});

/**
 * Default export
 */
export default AssetAdapter;
