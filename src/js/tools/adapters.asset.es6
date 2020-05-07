/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assets from '../app/app.assets.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getAttributeBinding } from '../data/data.util.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import openAssetManager from '../dialogs/dialogs.assetmanager.es6';
import '../dialogs/widgets.basedialog.es6';
import '../widgets/widgets.buttonbox.es6';
import BaseAdapter from './adapters.base.es6';
import ToolAssets from './util.assets.es6';

const {
    ui: { BaseDialog },
} = window.kendo;

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
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // this.editor is the inline editor with a [...] button which triggers this.showDialog
        this.editor = (container, settings) => {
            $(`<${CONSTANTS.INPUT}>`)
                .css({ width: '100%' }) // 'auto' seems to imply a min-width
                .prop({ readonly: true })
                .attr({
                    name: settings.field,
                    ...settings.attributes,
                    ...getAttributeBinding(
                        CONSTANTS.BIND,
                        `value: ${settings.field}`
                    ),
                    ...attributes,
                })
                .appendTo(container)
                .kendoButtonBox({
                    click: this.showDialog.bind(this, settings),
                });
        };
    },

    /**
     * Show dialog
     * @method showDialog
     * @param options
     */
    showDialog(options = {} /* , evt */) {
        assert.instanceof(
            PageComponent,
            options.model,
            assert.format(
                assert.messages.instanceof.default,
                'options.model',
                'PageComponent'
            )
        );
        assert.instanceof(
            ToolAssets,
            assets[options.model.tool],
            assert.format(
                assert.messages.instanceof.default,
                'assets[options.model.tool]',
                'ToolAssets'
            )
        );
        openAssetManager({
            title: options.title || this.title,
            data: {
                value: options.model.get(options.field),
            },
            assets: assets[options.model.tool],
        })
            .then((result) => {
                if (
                    result.action ===
                    BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    options.model.set(options.field, result.data.value);
                }
            })
            .catch($.noop); // TODO error management
    },
});

/**
 * Default export
 */
export default AssetAdapter;
