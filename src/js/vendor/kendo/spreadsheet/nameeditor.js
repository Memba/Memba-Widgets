/**
 * Kendo UI v2023.2.829 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.icons.js";

(function(kendo) {

    var $ = kendo.jQuery;

    var CLASS_NAMES = {
        input: "k-spreadsheet-name-editor",
        list: "k-spreadsheet-name-list"
    };

    var NameEditor = kendo.ui.Widget.extend({
        init: function(element, options) {
            kendo.ui.Widget.call(this, element, options);
            element.addClass(CLASS_NAMES.input);

            var comboBoxTitle = options.messages.nameBox || "Name Box";
            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: function(options) {
                        var data = [];
                        this._workbook.forEachName(function(def){
                            if (!def.hidden && def.value instanceof kendo.spreadsheet.Ref) {
                                data.push({ name: def.name });
                            }
                        });
                        options.success(data);
                    }.bind(this),
                    cache: false
                }
            });

            var comboElement = $("<input />")
                .attr("title", comboBoxTitle)
                .attr("aria-label", comboBoxTitle);

            this.combo = comboElement.appendTo(element)
                .kendoComboBox({
                    clearButton: false,
                    dataTextField: "name",
                    dataValueField: "name",
                    template: "#:data.name#<a role='button' class='k-button-delete' href='\\#'>" + kendo.ui.icon("x") + "</a>",
                    dataSource: dataSource,
                    autoBind: false,
                    ignoreCase: true,
                    change: this._on_listChange.bind(this),
                    noDataTemplate: "<div></div>",
                    open: function() {
                        dataSource.read();
                    }
                }).getKendoComboBox();

            this.combo.input
                .on("keydown", this._on_keyDown.bind(this))
                .on("focus", this._on_focus.bind(this));

            this.combo.popup.element
                .addClass("k-spreadsheet-names-popup")

                .on("mousemove", function(ev){
                    // XXX: should remove this when we find a better
                    // solution for the popup closing as we hover the
                    // resize handles.
                    ev.stopPropagation();
                })

                .on("click", ".k-button-delete", function(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                    var item = $(ev.target).closest(".k-item");
                    item = this.combo.dataItem(item);
                    this._deleteItem(item.name);
                }.bind(this));
        },
        destroy: function() {
            if (this.combo) {
                this.combo.destroy();
            }

            kendo.ui.Widget.fn.destroy.call(this);
        },
        value: function(val) {
            if (val === undefined) {
                return this.combo.value();
            } else {
                this.combo.value(val);
            }
        },
        _deleteItem: function(name) {
            this.trigger("delete", { name: name });
        },
        _on_keyDown: function(ev) {
            switch (ev.keyCode) {
              case 27:
                this.combo.value(this._prevValue);
                this.trigger("cancel");
                break;
              case 13:
                this.trigger("enter");
                break;
            }
        },
        _on_focus: function() {
            this._prevValue = this.combo.value();
        },
        _on_listChange: function() {
            var name = this.combo.value();
            if (name) {
                this.trigger("select", { name: name });
            }
        }
    });

    kendo.spreadsheet.NameEditor = NameEditor;
})(window.kendo);
