/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./serializer.js";

(function($, undefined) {

var kendo = window.kendo,
    DropDownList = kendo.ui.DropDownList,
    dom = kendo.ui.editor.Dom;

var SelectBox = DropDownList.extend({
    init: function(element, options) {
        var that = this;

        DropDownList.fn.init.call(that, element, options);

        // overlay drop-down with popout for snappier interaction
        if (kendo.support.mobileOS.ios) {
            this._initSelectOverlay();
            this.bind("dataBound", this._initSelectOverlay.bind(this));
        }

        that.text(that.options.title);

        that.element.attr("title", that.options.title);
        that.wrapper.attr("title", that.options.title);

        that.bind("open", function() {
            if (that.options.autoSize) {
                var list = that.list,
                    listWidth;

                list.css({
                        whiteSpace: "nowrap",
                        width: "auto"
                    });

                listWidth = list.width();

                if (listWidth > 0) {
                    listWidth += 20;
                } else {
                    listWidth = that._listWidth;
                }

                list.css("width", listWidth + kendo.support.scrollbar());

                that._listWidth = listWidth;
            }
        });
    },
    options: {
        name: "SelectBox",
        index: -1,
        size: "medium",
        fillMode: "solid",
        rounded: "medium"
    },

    _initSelectOverlay: function() {
        var selectBox = this;
        var value = selectBox.value();
        var view = this.dataSource.view();
        var item;
        var html = "";
        var encode = kendo.htmlEncode;

        for (var i = 0; i < view.length; i++) {
            item = view[i];

            html += "<option value='" + encode(item.value) + "'";

            if (item.value == value) {
                html += " selected";
            }

            html += ">" + encode(item.text) + "</option>";
        }

        var select = $("<select class='k-select-overlay'>" + html + "</select>");
        var wrapper = $(this.element).closest(".k-dropdownlist");

        wrapper.next(".k-select-overlay").remove();

        select.insertAfter(wrapper);

        select.on("change", function() {
            selectBox.value(this.value);
            selectBox.trigger("change");
        });
    },

    value: function(value) {
        var that = this,
            result = DropDownList.fn.value.call(that, value);

        if (value === undefined) {
            return result;
        }

        if (!DropDownList.fn.value.call(that)) {
           that.text(that.options.title);
        }
    },

    decorate: function(body) {
        var that = this,
            dataSource = that.dataSource,
            items = dataSource.data(),
            i, tag, className, style;

        if (body) {
            that.list.css("background-color", dom.getEffectiveBackground($(body)));
        }

        for (i = 0; i < items.length; i++) {
            tag = items[i].tag || "span";
            className = items[i].className;

            style = dom.inlineStyle(body, tag, { className: className });

            style = style.replace(/"/g, "'");

            items[i].style = style + ";display:inline-block";
        }

        dataSource.trigger("change");
    }
});


kendo.ui.plugin(SelectBox);
kendo.ui.editor.SelectBox = SelectBox;

kendo.cssProperties.registerPrefix("SelectBox", "k-picker-");

kendo.cssProperties.registerValues("SelectBox", [{
    prop: "rounded",
    values: kendo.cssProperties.roundedValues.concat([['full', 'full']])
}]);

})(window.kendo.jQuery);
