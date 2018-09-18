/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


/**
 * Image List Adapter (combines image and text)
 */
adapters.ImageListBuilderAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        that.defaultValue = that.defaultValue || [];
        // that.editor is the list editor where the insert image button triggers this.showDialog
        that.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'source: ' + settings.field;
            var imageList = $('<div/>').attr(binding).appendTo(container);
            var imageListWidget = imageList.kendoImageList({
                schemes: assets.image.schemes,
                click: $.proxy(that.showDialog, that, settings)
            }).data('kendoImageList');
            assert.instanceof(kendo.ui.ImageList, imageListWidget, assert.format(assert.messages.instanceof.default, 'imageListWidget', 'kendo.ui.ImageList'));
            imageListWidget.dataSource.bind('change', function (e) {
                // When the dataSource raises a change event on any of the quiz data items that is added, changed or removed
                // We need to trigger a change event on the model field to ensure the stage element (which is not databound) is redrawn
                if ($.type(e.action) === STRING) {
                    settings.model.trigger('change', { field: settings.field });
                }
            });
        };
    },
    showDialog: function (options, e) {
        // Note should return a promise to be used with app.notification?
        if (e.action === 'image') {
            // TODO wrap in import('./dialogs/kidoju.dialogs.assetmanager.es6').then(function () {...});
            kidoju.dialogs.openAssetManager({
                title: options.title,
                data: {
                    value: e.item.get('image')
                },
                assets: assets.image
            })
            .done(function (result) {
                if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                    e.item.set('image', result.data.value);
                }
            })
            .fail(function (err) {
                // TODO
            });
        }
    }
});
