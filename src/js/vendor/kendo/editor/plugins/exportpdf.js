/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../command.js";

(function($) {

    // Imports ================================================================
    var kendo = window.kendo,
        editorNS = kendo.ui.editor,
        Command = editorNS.Command,
        EditorUtils = editorNS.EditorUtils,
        registerTool = EditorUtils.registerTool,
        Tool = editorNS.Tool,
        extend = $.extend;

var ExportPdfCommand = Command.extend({
    init: function(options) {
        this.async = true;
        Command.fn.init.call(this, options);
    },

    exec: function() {
        var that = this;
        var range = that.lockRange(true);
        var editor = that.editor;

        editor._destroyResizings();

        editor.saveAsPDF().then(function() {
            that.releaseRange(range);
            editor._initializeColumnResizing();
            editor._initializeRowResizing();
            editor._initializeElementResizing();
        });
    }
});

extend(editorNS, {
    ExportPdfCommand: ExportPdfCommand
});

registerTool("pdf", new Tool({ command: ExportPdfCommand }));

})(window.kendo.jQuery);
