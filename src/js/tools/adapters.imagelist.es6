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
import { getValueBinding } from '../data/data.util.es6';
import openAssetManager from '../dialogs/dialogs.assetmanager.es6';
import '../dialogs/widgets.basedialog.es6';
import '../widgets/widgets.imagelist.es6';
import BaseAdapter from './adapters.base.es6';

// TODO Review with imageset

const {
    ui: { BaseDialog, ImageList }
} = window.kendo;

/**
 * ImageListAdapter
 * @class ImageListAdapter
 * @extends BaseAdapter
 */
const ImageListAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        that.defaultValue = that.defaultValue || [];
        // that.editor is the list editor where the insert image button triggers this.showDialog
        that.editor = (container, settings) => {
            const element = $(`<${CONSTANTS.DIV}/>`)
                .attr(
                    $.extend(
                        true,
                        {},
                        settings.attributes,
                        getValueBinding(undefined, settings.field),
                        attributes
                    )
                )
                .appendTo(container);
            const widget = element
                .kendoImageList({
                    schemes: assets.image.schemes,
                    click: that.showDialog.bind(that, settings)
                })
                .data('kendoImageList');
            assert.instanceof(
                ImageList,
                widget,
                assert.format(
                    assert.messages.instanceof.default,
                    'widget',
                    'kendo.ui.ImageList'
                )
            );
            widget.dataSource.bind('change', e => {
                // When the dataSource raises a change event on any of the quiz data items that is added, changed or removed
                // We need to trigger a change event on the model field to ensure the stage element (which is not databound) is redrawn
                if ($.type(e.action) === CONSTANTS.STRING) {
                    settings.model.trigger('change', { field: settings.field });
                }
            });
        };
    },
    /**
     * Open asset manager
     * @param options
     * @param e
     */
    showDialog(options, e) {
        // Note should return a promise to be used with app.notification?
        if (e.action === 'image') {
            // TODO wrap in import('./dialogs/dialogs.assetmanager.es6').then(function () {...});
            openAssetManager({
                title: options.title,
                data: {
                    value: e.item.get('url')
                },
                assets: assets.image
            })
                .then(result => {
                    if (
                        result.action ===
                        BaseDialog.fn.options.messages.actions.ok.action
                    ) {
                        e.item.set('url', result.data.value);
                    }
                })
                .catch(err => {
                    $.noop(err);
                });
        }
    }
});

/**
 * Default export
 */
export default ImageListAdapter;
