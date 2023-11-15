/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../main.js";
import "../../kendo.icons.js";

(function($, undefined) {

var kendo = window.kendo,
    extend = $.extend,
    Editor = kendo.ui.editor,
    EditorUtils = Editor.EditorUtils,
    Command = Editor.Command,
    Tool = Editor.Tool,
    registerTool = EditorUtils.registerTool,
    defaultExportAsItems = [
        { text: 'Docx', value: 'docx' },
        { text: 'Rtf', value: 'rtf' },
        { text: 'Pdf', value: 'pdf' },
        { text: 'Html', value: 'html' },
        { text: 'Plain Text', value: 'txt' }
    ];

var ExportAsCommand = Command.extend({
    init: function(options) {
        var cmd = this;
        cmd.options = options;
        Command.fn.init.call(cmd, options);
        cmd.attributes = null;
        cmd.exportType = options.exportType;
    },

    exec: function() {
        var cmd = this;
        var range = this.lockRange(true);
        cmd.postToProxy();
        cmd.releaseRange(range);
    },

    postToProxy: function() {
        this.generateForm().appendTo('body').submit().remove();
    },

    generateForm: function() {
        var cmd = this;
        var exportAsOptions = cmd.editor.options.exportAs;
        var form = $('<form>').attr({
            action: exportAsOptions && exportAsOptions.proxyURL || "",
            method: 'POST'
        });

        form.append([
            cmd.valueInput(),
            cmd.exportTypeInput(),
            cmd.fileNameInput(),
            cmd.antiForgeryInput()
        ]);

        return form;
    },

    valueInput: function() {
        var editor = this.editor;
        return $('<input>').attr({
            value: editor.encodedValue(),
            name: 'value',
            type: 'hidden'
        });
    },

    exportTypeInput: function() {
        var cmd = this;
        return $('<input>').attr({
            value: cmd.exportType,
            name: 'exportType',
            type: 'hidden'
        });

    },

    fileNameInput: function() {
        var editor = this.editor;
        var exportAsOptions = editor.options.exportAs;
        var fileName = exportAsOptions && exportAsOptions.fileName || editor.element.attr("id") || "editor";
        return $('<input>').attr({
            value: fileName,
            name: 'fileName',
            type: 'hidden'
        });
    },

    antiForgeryInput: function() {
        var csrf_param = $("meta[name=csrf-param],meta[name=_csrf_header]").attr("content");

        return $("input[name^='__RequestVerificationToken']").clone()
                    .add($("input[name^='" + csrf_param + "']").clone());
    }
});

var ExportAsTool = Tool.extend({
    init: function(options) {
        var tool = this;
        Tool.fn.init.call(tool, kendo.deepExtend({}, tool.options, options));
        tool.type = 'kendoDropDownList';
    },

    options: {
        items: defaultExportAsItems
    },

    command: function(args) {
        var value = args.value;
        return new Editor.ExportAsCommand({
            range: args.range,
            exportType: value.exportType
        });
    },

    initialize: function(ui, editor) {
        var tool = this,
            component = ui.getKendoDropDownList();

        tool.editor = editor;

        component.bind("change", this.changeHandler.bind(this));
    },

    changeHandler: function(e) {
        this._exec(e.sender.value());
        e.sender.value(null);
        e.sender.wrapper.find(".k-export-tool-text").text(kendo.htmlEncode(this.editor.options.messages.exportAs));
    },

    update: function(ui, editor) {
        var component = ui.data("kendoDropDownList");

        component.close();
        component.value(null);
        ui.closest(".k-dropdownlist").find(".k-export-tool-text").text(kendo.htmlEncode(this.editor.options.messages.exportAs));
    },

    _exec: function(value) {
        if (value) {
            Tool.exec(this.editor, this.options.name, { exportType: value } );
        }
    },

    destroy: function() {
        this._ancestor = null;
    }
});

extend(Editor, {
    ExportAsTool: ExportAsTool,
    ExportAsCommand: ExportAsCommand
});

registerTool('exportAs', new ExportAsTool({
    ui: {
        type: "component",
        overflow: "never",
        component: "DropDownList",
        componentOptions: {
            dataTextField: "text",
            dataValueField: "value",
            valuePrimitive: true,
            value: null,
            width: "140px",
            highlightFirst: false,
            autoWidth: true,
            itemTemplate: (data) => `<span class=\"k-link k-menu-link\" data-value=\"${data.value}\">${data.text}</strong></span>`,
            icon: "export",
            valueTemplate: () => `<span class="k-editor-export">${kendo.ui.icon({ icon: "export", iconClass: "k-button-icon" })}<span class="k-export-tool-text"></span></span>`
        }
    }
}));

}(window.kendo.jQuery));
