/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.combobox',
        './vendor/kendo/kendo.treeview'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ComboBox = kendo.ui.ComboBox;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.dropdowntreeview');

        // See http://kendoui-feedback.telerik.com/forums/127393-telerik-kendo-ui-feedback/suggestions/3767009-treeview-in-combobox
        var DropDownTreeView = ComboBox.extend({
            _treeview: null,
            init: function (element, options) {
                kendo.ui.ComboBox.fn.init.call(this, element, options);
                var self = this;
                self.popup.canClose = true;

                var id = $(this.element).attr('id') + '-treeview';
                self._treeview = $('<div id="' + id + '"></div>')
                    .kendoTreeView({
                        dataSource: [],
                        dataTextField: self.options.dataTextField,
                        dataValueField: self.options.dataValueField,
                        loadOnDemand: false,
                        autoBind: false,
                        select: function (e) {
                            var item = self._treeview.getKendoTreeView().dataItem(e.node);
                            self.value(item[self.options.dataValueField]);
                            self.trigger('change');
                            self.popup.canClose = true;
                            self.popup.close();
                        },
                        collapse: function () {
                            self.popup.canClose = false;
                        },
                        expand: function () {
                            self.popup.canClose = false;
                        }
                    });
                $('ul', self.list).replaceWith(self._treeview).remove();
                self.popup.bind('close', function (e) {
                    if (!self.popup.canClose) {
                        e.preventDefault();
                        self.popup.canClose = true;
                    }
                });
                self._closeHandler = function (e) {
                    self.popup.canClose = true;
                    kendo.ui.ComboBox.fn._closeHandler.call(this, e);
                };
                self.bind('open', function () {
                    if (self.value()) {
                        var treeview = self._treeview.getKendoTreeView();
                        var selectedNode = treeview.findByText(self.text());
                        treeview.expandTo(selectedNode);
                        treeview.select(selectedNode);
                    }
                });
                // self.refresh();
            },
            options: {
                name: 'DropDownTreeView',
                parentField: null
            },
            refresh: function () {
                ComboBox.fn.refresh.call(this);
                if (this._treeview.getKendoTreeView().dataSource.data().length === 0) {
                    this._treeview.getKendoTreeView().dataSource.data(
                        processTable(
                            this.dataSource._pristineData,
                            this.options.dataValueField,
                            this.options.parentField
                        )
                    );
                }
            }
        });
        kendo.ui.plugin(DropDownTreeView);

        function processTable(data, idField, foreignKey) {
            var hash = {};
            var root = null;
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var id = item[idField];
                var parentId = item[foreignKey];
                if (parentId === null) {
                    root = id;
                }

                hash[id] = hash[id] || [];
                hash[parentId] = hash[parentId] || [];

                item.items = hash[id];
                hash[parentId].push(item);
            }
            return hash[root];
        }


    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
