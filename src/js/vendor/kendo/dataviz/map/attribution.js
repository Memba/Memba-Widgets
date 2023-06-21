/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.drawing.js";

(function() {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        template = kendo.template,

        util = kendo.drawing.util,
        valueOrDefault = util.valueOrDefault,
        defined = util.defined;

    var Attribution = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);
            this._initOptions(options);
            this.items = [];
            this.element.addClass("k-widget k-attribution");
        },

        options: {
            name: "Attribution",
            separator: "&nbsp;|&nbsp;",
            itemTemplate: ({ text }) => text
        },

        filter: function(extent, zoom) {
            this._extent = extent;
            this._zoom = zoom;
            this._render();
        },

        add: function(item) {
            if (defined(item)) {
                if (typeof item === "string") {
                    item = { text: item };
                }

                this.items.push(item);
                this._render();
            }
        },

        remove: function(text) {
            var result = [];
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.text !== text) {
                    result.push(item);
                }
            }

            this.items = result;

            this._render();
        },

        clear: function() {
            this.items = [];
            this.element.empty();
        },

        _render: function() {
            var result = [];
            var itemTemplate = template(this.options.itemTemplate);

            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                var text = this._itemText(item);
                if (text !== "") {
                    result.push(itemTemplate({
                        text: text
                    }));
                }
            }

            if (result.length > 0) {
                this.element.empty()
                    .append(result.join(this.options.separator))
                    .show();
            } else {
                this.element.hide();
            }
        },

        _itemText: function(item) {
            var text = "";
            var inZoomLevel = this._inZoomLevel(item.minZoom, item.maxZoom);
            var inArea = this._inArea(item.extent);

            if (inZoomLevel && inArea) {
                text += item.text;
            }

            return text;
        },

        _inZoomLevel: function(min, max) {
            var result = true;
            min = valueOrDefault(min, -Number.MAX_VALUE);
            max = valueOrDefault(max, Number.MAX_VALUE);

            result = this._zoom > min && this._zoom < max;

            return result;
        },

        _inArea: function(area) {
            var result = true;

            if (area) {
                result = area.contains(this._extent);
            }

            return result;
        }
    });

    kendo.dataviz.ui.plugin(Attribution);
})(window.kendo.jQuery);
