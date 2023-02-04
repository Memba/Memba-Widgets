/**
 * Kendo UI v2023.1.117 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.imagebrowser.js";
import "../command.js";

(function($, undefined) {

var kendo = window.kendo,
    extend = $.extend,
    encode = kendo.htmlEncode,
    Editor = kendo.ui.editor,
    EditorUtils = Editor.EditorUtils,
    dom = Editor.Dom,
    registerTool = EditorUtils.registerTool,
    ToolTemplate = Editor.ToolTemplate,
    RangeUtils = Editor.RangeUtils,
    Command = Editor.Command,
    keys = kendo.keys,
    KEDITORIMAGEURL = "#k-editor-image-url",
    KEDITORIMAGETITLE = "#k-editor-image-title",
    KEDITORIMAGEWIDTH = "#k-editor-image-width",
    KEDITORIMAGEHEIGHT = "#k-editor-image-height";

var ImageCommand = Command.extend({
    init: function(options) {
        var that = this;
        Command.fn.init.call(that, options);

        that.async = true;
        that.attributes = {};
    },

    insertImage: function(img, range) {
        var attributes = this.attributes;
        var doc = RangeUtils.documentFromRange(range);

        if (attributes.src && attributes.src != "http://") {

            var removeIEAttributes = function() {
                setTimeout(function() {
                    if (!attributes.width) {
                        img.removeAttribute("width");
                    }

                    if (!attributes.height) {
                        img.removeAttribute("height");
                    }

                    img.removeAttribute("complete");
                });
            };

            if (!img) {
                img = dom.create(doc, "img", attributes);
                img.onload = img.onerror = removeIEAttributes;

                range.deleteContents();
                range.insertNode(img);

                if (!img.nextSibling) {
                    dom.insertAfter(doc.createTextNode("\ufeff"), img);
                }

                removeIEAttributes();

                range.setStartAfter(img);
                range.setEndAfter(img);
                RangeUtils.selectRange(range);
                return true;
            } else {
                img.onload = img.onerror = removeIEAttributes;
                dom.attr(img, attributes);
                removeIEAttributes();
            }
        }

        return false;
    },

    _dialogTemplate: function(showBrowser) {
        return kendo.template(({ messages }) =>
            '<div class="k-editor-dialog k-popup-edit-form">' +
                '<div class="k-edit-form-container">' +
                    '<div class="k-edit-form-content">' +
                        `${showBrowser ? '<div class="k-filebrowser k-imagebrowser"></div>' : ''}` +
                        '<div class="k-edit-label">' +
                            `<label for="k-editor-image-url">${encode( messages.imageWebAddress )}</label>` +
                        '</div>' +
                        '<div class="k-edit-field">' +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-image-url"></span>' +
                        '</div>' +
                        '<div class="k-edit-label">' +
                            `<label for="k-editor-image-title">${encode( messages.imageAltText )}</label>` +
                        '</div>' +
                        '<div class="k-edit-field">' +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-image-title"></span>' +
                        '</div>' +
                        '<div class="k-edit-label">' +
                            `<label for="k-editor-image-width">${encode( messages.imageWidth )}</label>` +
                        '</div>' +
                        '<div class="k-edit-field">' +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-image-width"></span>' +
                        '</div>' +
                        '<div class="k-edit-label">' +
                            `<label for="k-editor-image-height">${encode( messages.imageHeight )}</label>` +
                        '</div>' +
                        '<div class="k-edit-field">' +
                            '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input type="text" class="k-input-inner" id="k-editor-image-height"></span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="k-edit-buttons">' +
                        `<button class="k-dialog-insert k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"><span class="k-button-text">${encode(messages.dialogInsert)}</span></button>` +
                        `<button class="k-dialog-close k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">${encode(messages.dialogCancel)}</span></button>` +
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

        if (!that.insertImage(RangeUtils.image(range), range)) {
            that.releaseRange(range);
        }
    },

    exec: function() {
        var that = this,
            range = that.lockRange(),
            applied = false,
            img = RangeUtils.image(range),
            imageWidth = img && img.getAttribute("width") || "",
            imageHeight = img && img.getAttribute("height") || "",
            dialog,
            isIE = kendo.support.browser.msie,
            options = that.editor.options,
            messages = options.messages,
            imageBrowser = options.imageBrowser,
            showBrowser = !!(kendo.ui.ImageBrowser && imageBrowser && imageBrowser.transport && imageBrowser.transport.read !== undefined),
            dialogOptions = {
                title: messages.insertImage,
                visible: false,
                resizable: showBrowser
            };

        this.expandImmutablesIn(range);

        function apply(e) {
            var element = dialog.element,
                w = parseInt(element.find(KEDITORIMAGEWIDTH).val(), 10),
                h = parseInt(element.find(KEDITORIMAGEHEIGHT).val(), 10);

            that.attributes = {
                src: element.find(KEDITORIMAGEURL).val().replace(/ /g, "%20"),
                alt: element.find(KEDITORIMAGETITLE).val()
            };

            that.attributes.width = null;
            that.attributes.height = null;

            if (!isNaN(w) && w > 0) {
                that.attributes.width = w;
            }

            if (!isNaN(h) && h > 0) {
                that.attributes.height = h;
            }

            applied = that.insertImage(img, range);

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
            .find(KEDITORIMAGEURL).val(img ? img.getAttribute("src", 2) : "http://").end()
            .find(KEDITORIMAGETITLE).val(img ? img.alt : "").end()
            .find(KEDITORIMAGEWIDTH).val(imageWidth).end()
            .find(KEDITORIMAGEHEIGHT).val(imageHeight).end()
            .data("kendoWindow");

        var element = dialog.element;
        if (showBrowser) {
            this._imageBrowser = new kendo.ui.ImageBrowser(
                element.find(".k-imagebrowser"),
                extend({}, imageBrowser)
            );

            this._imageBrowser.bind("change", function(ev) {
                if (ev.selected.get("type") === "f") {
                    element.find(KEDITORIMAGEURL).val(this.value());
                }
            });

            this._imageBrowser.bind("apply", apply);
        }

        if (isIE) {
            var dialogHeight = element.closest(".k-window").height();
            element.css("max-height", dialogHeight);
        }
        dialog.center().open();
        element.find(KEDITORIMAGEURL).trigger("focus").select();
    }

});

kendo.ui.editor.ImageCommand = ImageCommand;

registerTool("insertImage", new Editor.Tool({ command: ImageCommand, template: new ToolTemplate({ template: EditorUtils.buttonTemplate, title: "Insert Image" }) }));

})(window.kendo.jQuery);
