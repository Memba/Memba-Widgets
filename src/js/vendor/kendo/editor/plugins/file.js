/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.filebrowser.js";
import "./link.js";
import "../../kendo.form.js";

(function($, undefined) {

var kendo = window.kendo,
    extend = $.extend,
    encode = kendo.htmlEncode,
    Editor = kendo.ui.editor,
    EditorUtils = Editor.EditorUtils,
    dom = Editor.Dom,
    registerTool = EditorUtils.registerTool,
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
            form,
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
            form.destroy();
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
        dialogOptions.minWidth = 350;

        dialog = this.createDialog("<div/>", dialogOptions).data("kendoWindow");
        form = that._createForm(dialog, showBrowser);

        dialog.element.toggleClass("k-filebrowser-dialog", showBrowser);
        dialog.wrapper
        .find(".k-dialog-insert").on("click", apply).end()
        .find(".k-dialog-close").on("click", close).end()
        .find(".k-form-field input").on("keydown", keyDown).end()
        // IE < 8 returns absolute url if getAttribute is not used
        .find(KEDITORFILEURL).val(file ? file.getAttribute("href", 2) : "http://").end()
        .find(KEDITORFILETEXT).val(file ? file.innerText : "").end()
        .find(KEDITORFILETITLE).val(file ? file.title : "").end();

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
    },

    _createForm: function(dialog, showBrowser) {
        var that = this;
        var formElement = $("<div/>").appendTo(dialog.element);
        var messages = that.editor.options.messages;

        var form = formElement.kendoForm({
            renderButtons: false,
            items: [
                {
                    field: "k-editor-file-url",
                    label: encode(messages.fileWebAddress),
                    editor: "TextBox"
                },
                {
                    field: "k-editor-file-text",
                    label: encode(messages.fileText),
                    editor: "TextBox"
                },
                {
                    field: "k-editor-file-title",
                    label: encode(messages.fileTitle),
                    editor: "TextBox"
                }
            ]
        }).data("kendoForm");

        if (showBrowser) {
            formElement.prepend($('<div class="k-filebrowser"></div>'));
        }

        dialog.element.after($(that._actionButtonsTemplate({ messages, insertButtonIcon: "file-add", cancelButtonIcon: "cancel-outline" })));

        return form;
    }

});

kendo.ui.editor.FileCommand = FileCommand;

registerTool("insertFile", new Editor.Tool({ command: FileCommand }));

})(window.kendo.jQuery);
