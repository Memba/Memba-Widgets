/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO COnside genric opendialog adapter with/without value

/**
 * Asset Adapter
 */
adapters.AssetAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = STRING;
        that.defaultValue = that.defaultValue || (that.nullable ? null : '');
        // that.editor is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            // We need a wrapper because container has { display: table-cell; }
            var wrapper = $('<div/>')
            .css({ display: 'flex' })
            .appendTo(container);
            var input = $('<input/>')
            .addClass('k-textbox')
            .css({
                flex: 'auto',
                width: '100%' // 'auto' seems to imply a min-width
            })
            .prop({ readonly: true })
            .attr($.extend({}, settings.attributes, binding))
            .appendTo(wrapper);
            $('<button/>')
            .text('...')
            .addClass('k-button')
            .css({
                flex: 'none',
                marginRight: 0
            })
            .appendTo(wrapper)
            .on(CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog: function (options/*, e*/) {
        assert.instanceof(PageComponent, options.model, assert.format(assert.messages.instanceof.default, 'options.model', 'kidoju.data.PageComponent'));
        assert.instanceof(ToolAssets, assets[options.model.tool], assert.format(assert.messages.instanceof.default, 'assets[options.model.tool]', 'kidoju.ToolAssets'));
        // TODO wrap in import('./dialogs/kidoju.dialogs.assetmanager.es6').then(function () {...});
        kidoju.dialogs.openAssetManager({
            title: options.title,
            data: {
                value: options.model.get(options.field)
            },
            assets: assets[options.model.tool]
        })
        .done(function (result) {
            if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                options.model.set(options.field, result.data.value);
            }
        })
        .fail(function (err) {
            // TODO
        });
    }
});
