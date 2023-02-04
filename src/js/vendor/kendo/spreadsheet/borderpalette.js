/**
 * Kendo UI v2023.1.117 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.colorpicker.js";
import "../kendo.popup.js";
import "../kendo.togglebutton.js";

    (function(kendo) {

        var $ = kendo.jQuery;
        var BORDER_TYPES = [
            "allBorders",
            "insideBorders",
            "insideHorizontalBorders",
            "insideVerticalBorders",
            "outsideBorders",
            "leftBorder",
            "topBorder",
            "rightBorder",
            "bottomBorder",
            "noBorders"
        ];

        var BORDER_PALETTE_MESSAGES = kendo.spreadsheet.messages.borderPalette = {
            allBorders: "All borders",
            insideBorders: "Inside borders",
            insideHorizontalBorders: "Inside horizontal borders",
            insideVerticalBorders: "Inside vertical borders",
            outsideBorders: "Outside borders",
            leftBorder: "Left border",
            topBorder: "Top border",
            rightBorder: "Right border",
            bottomBorder: "Bottom border",
            noBorders: "No border"
        };

        var colorPickerPalette = [ //metro palette
            "#ffffff", "#000000", "#d6ecff", "#4e5b6f", "#7fd13b", "#ea157a", "#feb80a", "#00addc", "#738ac8", "#1ab39f",
            "#f2f2f2", "#7f7f7f", "#a7d6ff", "#d9dde4", "#e5f5d7", "#fad0e4", "#fef0cd", "#c5f2ff", "#e2e7f4", "#c9f7f1",
            "#d8d8d8", "#595959", "#60b5ff", "#b3bcca", "#cbecb0", "#f6a1c9", "#fee29c", "#8be6ff", "#c7d0e9", "#94efe3",
            "#bfbfbf", "#3f3f3f", "#007dea", "#8d9baf", "#b2e389", "#f272af", "#fed46b", "#51d9ff", "#aab8de", "#5fe7d5",
            "#a5a5a5", "#262626", "#003e75", "#3a4453", "#5ea226", "#af0f5b", "#c58c00", "#0081a5", "#425ea9", "#138677",
            "#7f7f7f", "#0c0c0c", "#00192e", "#272d37", "#3f6c19", "#750a3d", "#835d00", "#00566e", "#2c3f71", "#0c594f"
        ];

        var BorderPalette = kendo.ui.Widget.extend({
            init: function(element, options) {
                kendo.ui.Widget.call(this, element, options);

                this.element = element;
                this.color = "#000";

                this.element.addClass("k-spreadsheet-popup");

                this._borderTypePalette();
                this._borderColorPalette();
            },

            options: {
                name: "BorderPalette"
            },

            events: [
                "change"
            ],

            destroy: function() {
                this.colorChooser.destroy();
                kendo.destroy(this.element.find(".k-spreadsheet-border-type-palette"));
            },

            value: function() {
                return { type: this.type, color: this.color };
            },

            _borderTypePalette: function() {
                var that = this;
                var messages = BORDER_PALETTE_MESSAGES;

                var element = $("<div />", {
                    "class": "k-spreadsheet-border-type-palette"
                });

                $('<span class="k-column-menu-group-header"><span class="k-column-menu-group-header-text">Border type</span></span>').appendTo(this.element);

                element.appendTo(this.element);

                BORDER_TYPES.map(function(type) {
                    $('<button title="' + messages[type] + '" aria-label="' + messages[type] + '" data-border-type="' + type + '">')
                        .appendTo(element)
                        .kendoToggleButton({
                            icon: kendo.toHyphens(type),
                            toggle: that._toggle.bind(that)
                        })
                });
            },

            _borderColorPalette: function() {
                var element = $("<div />", {
                    "class": "k-spreadsheet-border-color-palette"
                });

                $('<span class="k-column-menu-group-header"><span class="k-column-menu-group-header-text">Border color</span></span>').appendTo(this.element);
                element.appendTo(this.element);

                this.colorChooser = new kendo.ui.FlatColorPicker(element, {
                    buttons: !this.options.change,
                    color: this.color,
                    view: "palette",
                    palette: colorPickerPalette,
                    input: false,
                    change: this._change.bind(this)
                });

                this.colorChooser.wrapper.find(".k-coloreditor-apply").on("click", this._apply.bind(this));
                this.colorChooser.wrapper.find(".k-coloreditor-cancel").on("click", this._cancel.bind(this));
            },

            _change: function() {
                this.color = this.colorChooser.value();
            },

            _toggle: function(e) {
                var type = e.target.data("borderType"),
                    previous = e.target.siblings(".k-selected").data("kendoToggleButton");

                if (e.checked === true) {
                    if (previous) {
                        previous.toggle(false);
                    }

                    this.type = type;
                } else {
                    this.type = null;
                }
            },

            _apply: function() {
                this.trigger("change", { type: this.type, color: this.color });
            },

            _cancel: function() {
                this.trigger("change", { type: null, color: null });
            }
        });

        kendo.spreadsheet.BorderPalette = BorderPalette;

    })(window.kendo);
