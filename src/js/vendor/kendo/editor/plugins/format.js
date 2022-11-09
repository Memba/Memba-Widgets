/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../command.js";

(function($) {

var kendo = window.kendo,
    extend = $.extend,
    Editor = kendo.ui.editor,
    Tool = Editor.Tool,
    Command = Editor.Command,
    EditorUtils = Editor.EditorUtils;

var FormatCommand = Command.extend({
    init: function(options) {
        options.formatter = options.formatter();
        var finder = options.formatter.finder;
        if (finder && EditorUtils.formatByName("immutable", finder.format)) {
            finder._initOptions({ immutables: options.immutables });
        }
        Command.fn.init.call(this, options);
    }
});

var FormatTool = Tool.extend({
    init: function(options) {
        Tool.fn.init.call(this, options);
    },

    command: function(commandArguments) {
        var that = this;
        return new FormatCommand(extend(commandArguments, {
                formatter: that.options.formatter
            }));
    },

    update: function(ui, nodes) {
        var isFormatted = this.options.finder.isFormatted(nodes);

        ui.toggleClass("k-selected", isFormatted);
        ui.attr("aria-pressed", isFormatted);
    }
});

$.extend(Editor, {
    FormatCommand: FormatCommand,
    FormatTool: FormatTool
});

})(window.kendo.jQuery);
