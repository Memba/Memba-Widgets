/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
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
        GenericCommand = editorNS.GenericCommand,
        EditorUtils = editorNS.EditorUtils,
        registerTool = EditorUtils.registerTool,
        Tool = editorNS.Tool,
        RestorePoint = editorNS.RestorePoint,
        extend = $.extend;

var InsertHtmlCommand = Command.extend({
    init: function(options) {
        Command.fn.init.call(this, options);

        this.managesUndoRedo = true;
    },

    exec: function() {
        var editor = this.editor;
        var options = this.options;
        var range = options.range;
        var body = editor.body;
        var startRestorePoint = new RestorePoint(range, body);
        var html = options.html || options.value || '';

        editor.selectRange(range);

        editor.clipboard.paste(html, options);

        if (options.postProcess) {
            options.postProcess(editor, editor.getRange());
        }

        var genericCommand = new GenericCommand(startRestorePoint, new RestorePoint(editor.getRange(), body));
        genericCommand.editor = editor;
        editor.undoRedoStack.push(genericCommand);

        editor.focus();
    }
});

var InsertHtmlTool = Tool.extend({
    initialize: function(ui, editor) {
        var options = this.options,
            dataSource = options.items ? options.items : editor.options.insertHtml,
            component = ui.getKendoDropDownList();

        if (!component) {
            return;
        }

        component.one("open", () => {
            var optionLabel = component.list.parent().find(".k-list-optionlabel");

            if (optionLabel.length) {
                optionLabel.remove();
            }
        });

        component.setOptions({
            dataSource: dataSource,
            optionLabel: editor.options.messages.insertHtml
        });
        component.bind("change", () => {
            Tool.exec(editor, 'insertHtml', component.value());
        });
    },

    command: function(commandArguments) {
        return new InsertHtmlCommand(commandArguments);
    },

    update: function(ui) {
        var component = ui.data("kendoDropDownList");
        component.close();
        component.value(null);
    }
});

extend(editorNS, {
    InsertHtmlCommand: InsertHtmlCommand,
    InsertHtmlTool: InsertHtmlTool
});

registerTool("insertHtml", new InsertHtmlTool({
    ui: {
        initialValue: "Insert HTML",
        type: "component",
        component: "DropDownList",
        componentOptions: {
            dataTextField: "text",
            dataValueField: "value",
            autoSize: true,
            highlightFirst: false
        },
        overflow: "never"
    }
}));

})(window.kendo.jQuery);
