/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./immutables.js";

(function($) {

    // Imports ================================================================
    var kendo = window.kendo,
        Class = kendo.Class,
        editorNS = kendo.ui.editor,
        dom = editorNS.Dom,
        RestorePoint = editorNS.RestorePoint,
        Marker = editorNS.Marker,
        extend = $.extend;

function finishUpdate(editor, startRestorePoint) {
    var endRestorePoint = editor.selectionRestorePoint = new RestorePoint(editor.getRange(), editor.body);
    var command = new GenericCommand(startRestorePoint, endRestorePoint);
    command.editor = editor;

    editor.undoRedoStack.push(command);
    editor._refreshTools();

    return endRestorePoint;
}

var Command = Class.extend({
    init: function(options) {
        this.options = options;
        this.restorePoint = new RestorePoint(options.range, options.body, { immutables: options.immutables });
        this.marker = new Marker();
        this.formatter = options.formatter;
    },

    getRange: function() {
        return this.restorePoint.toRange();
    },

    lockRange: function(expand) {
        return this.marker.add(this.getRange(), expand);
    },

    releaseRange: function(range) {
        this.marker.remove(range);
        this.editor.selectRange(range);
    },

    undo: function() {
        var point = this.restorePoint;
        point.restoreHtml();
        this.editor.selectRange(point.toRange());
    },

    redo: function() {
        this.exec();
    },

    createDialog: function(content, options) {
        var editor = this.editor;

        return $(content).appendTo(document.body)
            .kendoWindow(extend({}, editor.options.dialogOptions, options))
            .closest(".k-window")
            .addClass("k-editor-window")
            .toggleClass("k-rtl", kendo.support.isRtl(editor.wrapper)).end();
    },

    exec: function() {
        var range = this.lockRange(true);
        this.formatter.editor = this.editor;
        this.formatter.toggle(range);
        this.releaseRange(range);
    },

    immutables: function() {
        return this.editor && this.editor.options.immutables;
    },

    expandImmutablesIn: function(range) {
        if (this.immutables()) {
            kendo.ui.editor.Immutables.expandImmutablesIn(range);
            this.restorePoint = new RestorePoint(range, this.editor.body);
        }
    },

    _actionButtonsTemplate: function({ messages, insertButtonIcon, cancelButtonIcon }) {
        return '<div class="k-actions k-actions-start k-actions-horizontal k-window-buttons">' +
        kendo.html.renderButton(`<button class="k-dialog-insert">${messages.dialogInsert}</button>`, { themeColor: "primary", icon: insertButtonIcon }) +
        kendo.html.renderButton(`<button class="k-dialog-close">${messages.dialogCancel}</button>`, { icon: cancelButtonIcon }) +
    '</div>';
    }
});

var GenericCommand = Class.extend({
    init: function(startRestorePoint, endRestorePoint) {
        this.body = startRestorePoint.body;
        this.startRestorePoint = startRestorePoint;
        this.endRestorePoint = endRestorePoint;
    },

    redo: function() {
        dom.removeChildren(this.body);

        this.body.innerHTML = this.endRestorePoint.html;
        this.editor.selectRange(this.endRestorePoint.toRange());
    },

    undo: function() {
        dom.removeChildren(this.body);

        this.body.innerHTML = this.startRestorePoint.html;
        this.editor.selectRange(this.startRestorePoint.toRange());
    }
});

extend(editorNS, {
    _finishUpdate: finishUpdate,
    Command: Command,
    GenericCommand: GenericCommand
});

})(window.kendo.jQuery);
