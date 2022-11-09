/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../command.js";

(function($, undefined) {

var kendo = window.kendo,
    extend = $.extend,
    Editor = kendo.ui.editor,
    EditorUtils = Editor.EditorUtils,
    Command = Editor.Command,
    Tool = Editor.Tool,
    ToolTemplate = Editor.ToolTemplate,
    dom = Editor.Dom;

var ViewHtmlCommand = Command.extend({
    init: function(options) {
        var cmd = this;
        cmd.options = options;
        Command.fn.init.call(cmd, options);
        cmd.attributes = null;
        cmd.async = true;
    },

    exec: function() {
        var that = this,
            editor = that.editor,
            options = editor.options,
            messages = editor.options.messages,
            dialog = $(kendo.template(ViewHtmlCommand.template)(messages)).appendTo(document.body),
            textarea = ".k-editor-textarea > textarea",
            content, comments;

        options.serialization.immutables = editor.immutables;

        comments = dom.getAllComments(editor.body);

        content = EditorUtils.cacheComments(editor.value(), comments);
        content = ViewHtmlCommand.indent(content);
        content = EditorUtils.retrieveComments(content, comments);

        options.serialization.immutables = undefined;

        function apply(e) {
            options.deserialization.immutables = editor.immutables;
            editor.value(dialog.find(textarea).val());
            options.deserialization.immutables = undefined;

            close(e);

            if (that.change) {
                that.change();
            }

            editor.trigger("change");
        }

        function close(e) {
            e.preventDefault();

            dialog.data("kendoWindow").destroy();

            if (editor.immutables) {
                editor.immutables.serializedImmutables = {};
            }

            editor.focus();
        }

        this.createDialog(dialog, {
            title: messages.viewHtml,
            width: 600,
            height: 400,
            resizable: true,
            close: close,
            visible: false
        })
            .find(textarea).val(content).end()
            .find(".k-dialog-update").on("click", apply).end()
            .find(".k-dialog-close").on("click", close).end()
            .data("kendoWindow").center().open();

        dialog.find(textarea).trigger("focus");
    }
});

extend(ViewHtmlCommand, {
    template: "" +
    "<div class='k-editor-dialog k-popup-edit-form k-viewhtml-dialog'>" +
        "<span class='k-input k-textarea k-input-solid k-input-md k-rounded-md k-editor-textarea'><textarea class='k-input-inner !k-overflow-auto !k-resize-none'></textarea></span>" +
        "<div class='k-edit-buttons'>" +
            "<button class='k-dialog-update k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary'><span class='k-button-text'>#: dialogUpdate #</span></button>" +
            "<button class='k-dialog-close k-button k-button-md k-rounded-md k-button-solid k-button-solid-base'><span class='k-button-text'>#: dialogCancel #</span></button>" +
        "</div>" +
    "</div>",
    indent: function(content) {
        return content.replace(/<\/(p|li|ul|ol|h[1-6]|table|tr|td|th)>/ig, "</$1>\n")
                      .replace(/<(ul|ol)([^>]*)><li/ig, "<$1$2>\n<li")
                      .replace(/<br \/>/ig, "<br />\n")
                      .replace(/\n$/, "");
    }
});

kendo.ui.editor.ViewHtmlCommand = ViewHtmlCommand;

Editor.EditorUtils.registerTool("viewHtml", new Tool({ command: ViewHtmlCommand, template: new ToolTemplate({ template: EditorUtils.buttonTemplate, title: "View HTML" }) }));

})(window.kendo.jQuery);
