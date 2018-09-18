/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO consider a generic OpenDialogAdapter????

/**
 * CharGrid adapter
 */
adapters.CharGridAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        that.editor = function (container, settings) {
            $('<button/>')
            .text('...')
            .addClass('k-button')
            .css({ margin: 0, width: '100%' })
            .appendTo(container)
            .on(CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog: function (options, evt) {
        var that = this;
        var model = options.model;
        // Build data (resize array especially after changing rows and columns)
        var columns = model.get('attributes.columns');
        var rows = model.get('attributes.rows');
        var whitelist = model.get('attributes.whitelist');
        var layout = model.get('attributes.layout');
        var data = model.get(options.field);
        var value = kendo.ui.CharGrid._getCharGridArray(rows, columns, whitelist, layout, data);
        // TODO wrap in import('./dialogs/kidoju.dialogs.chargrid.es6').then(function () {...});
        kidoju.dialogs.openCharGrid({
            title: options.title,
            message: options.field === 'properties.solution' ?
                kendo.format(this.messages.solution, model.get('attributes.whitelist')) :
                kendo.format(this.messages.layout, model.get('attributes.blank')),
            charGrid: {
                container: '.kj-dialog',
                scaler: '.kj-dialog',
                height: model.get('height'),
                width: model.get('width'),
                columns: columns,
                rows: rows,
                blank: model.get('attributes.blank'),
                locked: options.field === 'properties.solution' ?
                    layout :
                    [],// Do not lock when designing layout, but lock when designing solution
                whitelist: options.field === 'properties.solution' ?
                    model.get('attributes.whitelist') :
                    '\\S',// Do not whitelist when designing layout, but whitelist when designing solution
                blankFill: model.get('attributes.blankFill'),
                gridFill: model.get('attributes.gridFill'),
                gridStroke: model.get('attributes.gridStroke'),
                lockedFill: model.get('attributes.lockedFill'),
                lockedColor: model.get('attributes.lockedColor'),
                selectedFill: model.get('attributes.selectedFill'),
                valueColor: model.get('attributes.valueColor')
            },
            data: {
                value: value
            }
        })
        .done(function (result) {
            if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action
            // $.type(result.data.url) === STRING
            ) {
                options.model.set(options.field, result.data.value);
            }
        })
        .fail(function (err) {
            // TODO
        });
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return value && typeof value.equals === "function" && value.equals(solution);')
        }
    ],
    libraryDefault: 'equal',
    messages: {
        layout: i18n.chargridadapter.messages.layout,
        solution: i18n.chargridadapter.messages.solution
    }
});
