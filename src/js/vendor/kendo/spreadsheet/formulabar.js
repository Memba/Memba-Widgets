/**
 * Kendo UI v2023.2.718 (http://www.telerik.com/kendo-ui)
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

    var classNames = {
        wrapper: "k-spreadsheet-formula-bar"
    };

    var FormulaBar = kendo.ui.Widget.extend({
        init: function(element, options) {
            kendo.ui.Widget.call(this, element, options);

            element = this.element.addClass(FormulaBar.classNames.wrapper);

            $(kendo.ui.icon("formula-fx")).prependTo(element);

            var formulaBarWidth = element.width();

            this.formulaInput = new kendo.spreadsheet.FormulaInput($("<div/>")
                .appendTo(element), { formulaBarWidth: formulaBarWidth });
        },

        destroy: function() {
            if (this.formulaInput) {
                this.formulaInput.destroy();
            }
            this.formulaInput = null;
        }
    });

    kendo.spreadsheet.FormulaBar = FormulaBar;
    $.extend(true, FormulaBar, { classNames: classNames });
})(window.kendo);
