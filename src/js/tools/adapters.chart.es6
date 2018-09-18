/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO consider a generic OpenDialogAdapter????

/**
 * Chart adapter
 */
adapters.ChartAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        // This is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function (container, settings) {
            $('<button/>')
            .text('...')
            .addClass('k-button')
            .css({ margin: 0, width: '100%' })
            .appendTo(container)
            .on(CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog: function (options/*, e*/) {
        var model = options.model;
        var columns = model.get('attributes.categories') + 1;
        var rows = model.get('attributes.values') + 1;
        var data = util.resizeSpreadsheetData(model.get('attributes.data'), rows, columns);
        // TODO wrap in import('./dialogs/kidoju.dialogs.spreadsheet.es6').then(function () {...});
        kidoju.dialogs.openSpreadsheet({
            title: options.title,
            data: Object.assign(data, {
                columns: columns,
                rows: rows,
                sheetsbar: false,
                toolbar: false
            })
        })
        .done(function (result) {
            if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                // TODO test result.data???
                options.model.set(options.field, result.data);
            }
        })
        .fail(function (err) {
            // TODO
        });

    }
});
