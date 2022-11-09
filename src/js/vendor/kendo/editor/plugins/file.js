/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.filebrowser.js";
import "./link.js";

(function($, undefined) {

var kendo = window.kendo,
    extend = $.extend,
    Editor = kendo.ui.editor,
    EditorUtils = Editor.EditorUtils,
    dom = Editor.Dom,
    registerTool = EditorUtils.registerTool,
    ToolTemplate = Editor.ToolTemplate,
    RangeUtils = Editor.RangeUtils,
    Command = Editor.Command,
    LinkFormatter = Editor.LinkFormatter,
    textNodes = RangeUtils.textNodes,
    keys = kendo.keys,
    KEDITORFILEURL = "#k-editor-file-url",
    KEDITORFILETEXT = "#k-editor-file-text",
    KEDITORFILETITLE = "#k-editor-file-title";

var FileCommand = Command.extend({
    init: function(options) {
        var that = this;
        Command.fn.init.call(that, options);

        that.formatter = new LinkFormatter();

        that.async = true;
        that.attributes = {};
    },

    insertFile: function(file, range) {
        var attributes = this.attributes;
        var doc = RangeUtils.documentFromRange(range);

        if (attributes.href && attributes.href != "http://") {

            if (!file) {
                file = dom.create(doc, "a", { href: attributes.href });
                file.innerHTML = attributes.innerHTML;
                file.title = attributes.title;

                range.deleteContents();
                range.insertNode(file);

                if (!file.nextSibling) {
                    dom.insertAfter(doc.createTextNode("\ufeff"), file);
                }

                range.setStartAfter(file);
                range.setEndAfter(file);
                RangeUtils.selectRange(range);
                return true;
            } else {
                dom.attr(file, attributes);
            }
        }

        return false;
    },

    _dialogTemplate: function(showBrowser) {
        return kendo.template(
            '<div class="k-editor-dialog k-popup-edit-form">' +
                '<div class="k-edit-form-container">' +
                    '<div class="k-edit-form-content">' +
                        '# if (showBrowser) { #' +
                            '<div class="k-filebrowser"></div>' +
                        '# } #' +
                        "<div class='k-edit-label'>" +
                            '<label for="k-editor-file-url">#: messages.fileWebAddress #</label>' +
                        "</div>" +
                        "<div class='k-edit-field'>" +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-file-url"></span>' +
                        "</div>" +
                        "<div class='k-edit-label'>" +
                            '<label for="k-editor-file-text">#: messages.fileText #</label>' +
                        "</div>" +
                        "<div class='k-edit-field'>" +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-file-text"></span>' +
                        "</div>" +
                        "<div class='k-edit-label'>" +
                            '<label for="k-editor-file-title">#: messages.fileTitle #</label>' +
                        "</div>" +
                        "<div class='k-edit-field'>" +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-file-title"></span>' +
                        "</div>" +
                    '</div>' +
                    '<div class="k-edit-buttons">' +
                        '<button class="k-dialog-insert k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"><span class="k-button-text">#: messages.dialogInsert #</span></button>' +
                        '<button class="k-dialog-close k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">#: messages.dialogCancel #</span></button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        )({
            messages: this.editor.options.messages,
            showBrowser: showBrowser
        });
    },

    redo: function() {
        var that = this,
            range = that.lockRange();

        this.formatter.apply(range, this.attributes);
        that.releaseRange(range);
    },

    exec: function() {
        var that = this,
            range = that.lockRange(),
            nodes = textNodes(range),
            applied = false,
            file = nodes.length ? this.formatter.finder.findSuitable(nodes[0]) : null,
            dialog,
            isIE = kendo.support.browser.msie,
            options = that.editor.options,
            messages = options.messages,
            fileBrowser = options.fileBrowser,
            showBrowser = !!(kendo.ui.FileBrowser && fileBrowser && fileBrowser.transport && fileBrowser.transport.read !== undefined),
            dialogOptions = {
                title: messages.insertFile,
                visible: false,
                resizable: showBrowser
            };

        this.expandImmutablesIn(range);

        function apply(e) {
            var element = dialog.element,
                href = element.find(KEDITORFILEURL).val().replace(/ /g, "%20"),
                innerHTML = element.find(KEDITORFILETEXT).val(),
                title = element.find(KEDITORFILETITLE).val();

            that.attributes = {
                href: href,
                innerHTML: innerHTML !== "" ? innerHTML : href,
                title: title
            };

            applied = that.insertFile(file, range);

            close(e);

            if (that.change) {
                that.change();
            }
        }

        function close(e) {
            e.preventDefault();
            dialog.destroy();

            dom.windowFromDocument(RangeUtils.documentFromRange(range)).focus();
            if (!applied) {
                that.releaseRange(range);
            }
        }

        function keyDown(e) {
            if (e.keyCode == keys.ENTER) {
                apply(e);
            } else if (e.keyCode == keys.ESC) {
                close(e);
            }
        }

        dialogOptions.close = close;

        if (showBrowser) {
            dialogOptions.width = 750;
        }

        dialog = this.createDialog(that._dialogTemplate(showBrowser), dialogOptions)
            .toggleClass("k-filebrowser-dialog", showBrowser)
            .find(".k-dialog-insert").on("click", apply).end()
            .find(".k-dialog-close").on("click", close).end()
            .find(".k-edit-field input").on("keydown", keyDown).end()
            // IE < 8 returns absolute url if getAttribute is not used
            .find(KEDITORFILEURL).val(file ? file.getAttribute("href", 2) : "http://").end()
            .find(KEDITORFILETEXT).val(file ? file.innerText : "").end()
            .find(KEDITORFILETITLE).val(file ? file.title : "").end()
            .data("kendoWindow");

        var element = dialog.element;
        if (showBrowser) {
            that._fileBrowser = new kendo.ui.FileBrowser(
                element.find(".k-filebrowser"),
                extend({}, fileBrowser)
            );

            that._fileBrowser.bind("change", function(ev) {
                if (ev.selected.get("type") === "f") {
                    element.find(KEDITORFILEURL).val(this.value());
                }
            } );

            that._fileBrowser.bind("apply", apply);
        }

        if (isIE) {
            var dialogHeight = element.closest(".k-window").height();
            element.css("max-height", dialogHeight);
        }
        dialog.center().open();
        element.find(KEDITORFILEURL).trigger("focus").select();
    }

});

kendo.ui.editor.FileCommand = FileCommand;

registerTool("insertFile", new Editor.Tool({ command: FileCommand, template: new ToolTemplate({ template: EditorUtils.buttonTemplate, title: "Insert File" }) }));

})(window.kendo.jQuery);
