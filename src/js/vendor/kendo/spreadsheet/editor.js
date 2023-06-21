/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function(kendo) {

    var SheetEditor = kendo.Observable.extend({
        init: function(view) {
            kendo.Observable.fn.init.call(this);

            this.view = view;
            this.formulaBar = view.formulaBar;
            this._active = false;

            this.barInput = view.formulaBar.formulaInput;
            this.cellInput = view.formulaInput;

            this.barInput.syncWith(this.cellInput);
            this.cellInput.syncWith(this.barInput);

            this.barInput.bind("keyup", this._triggerUpdate.bind(this));
            this.cellInput.bind("keyup", this._triggerUpdate.bind(this));

            this.barInput.bind("blur", this._blur.bind(this));
            this.cellInput.bind("blur", this._blur.bind(this));
        },

        events: [
            "activate",
            "deactivate",
            "change",
            "update"
        ],

        _blur: function() {
            this.deactivate();
        },

        _triggerUpdate: function() {
            this.trigger("update", { value: this.value() });
        },

        activeEditor: function() {
            var editor = null;
            var activeElement = kendo._activeElement();

            if (this.barElement()[0] === activeElement) {
                editor = this.barInput;
            } else if (this.cellElement()[0] === activeElement) {
                editor = this.cellInput;
            }

            return editor;
        },

        activate: function(options) {
            var viewElement = this.view.element,
                viewWidth, scrollerElement, scrollbarWidth;

            this._active = true;
            this._rect = options.rect;
            this._range = options.range;

            this.cellInput.position(options.rect);
            this.cellInput.resize(options.rect);
            this.cellInput.tooltip(options.tooltip);
            this.cellInput.activeCell = this.barInput.activeCell = this._range.topLeft();
            this.cellInput.activeSheet = this.barInput.activeSheet = this._range._sheet;

            if(viewElement) {
                viewWidth = viewElement.width();
                scrollerElement = viewElement.find(".k-spreadsheet-scroller")[0];
                scrollbarWidth = scrollerElement.offsetWidth - scrollerElement.clientWidth;

                this.cellInput.element.css("max-width", viewWidth - scrollbarWidth - this.cellInput.element.position().left + "px");
            }

            this.trigger("activate");

            return this;
        },

        deactivate: function(noChange) {
            var cellInput = this.cellInput;

            if (!this._active) {
                return;
            }

            this._active = false;

            if (!noChange && cellInput.value() != this._value) {
                this.trigger("change", {
                    value: cellInput.value(),
                    range: this._range
                });
            }

            this._rect = null;
            cellInput.hide();
            this.trigger("deactivate");
        },

        enable: function(enable) {
            this.barInput.enable(enable);
            this.cellInput.enable(enable);
        },

        barElement: function() {
            return this.barInput.element;
        },

        cellElement: function() {
            return this.cellInput.element;
        },

        focus: function(inputType) {
            inputType = inputType || "cell";

            if (inputType === "cell") {
                this.cellInput.element.trigger("focus");
                this.cellInput.end();
            } else {
                this.barInput.element.trigger("focus");
            }
        },

        isActive: function() {
            return this._active;
        },

        isFiltered: function() {
            return this.barInput.popup.visible() || this.cellInput.popup.visible();
        },

        canInsertRef: function(isKeyboardAction) {
            var editor = this.activeEditor();
            return editor && editor.canInsertRef(isKeyboardAction);
        },

        highlightedRefs: function() {
            var editor = this.activeEditor();
            var refs = [];

            if (editor) {
                refs = editor.highlightedRefs();
            }

            return refs;
        },

        scale: function() {
            this.cellInput.scale();
        },

        toggleTooltip: function(rect) {
            this.cellInput.toggleTooltip(notEqual(this._rect, rect));
        },

        value: function(value, isArrayFormula) {
            if (value === undefined) {
                return this.barInput.value();
            }

            if (value === null) {
                value = "";
            }

            this._value = value;

            this.barInput.value(value);
            this.cellInput.value(value);

            this.barInput.element.toggleClass("k-spreadsheet-array-formula", !!isArrayFormula);
        },

        insertNewline: function() {
            this.activeEditor().insertNewline();
            this.scale();
        },

        select: function() {
            this.activeEditor().select();
        }
    });

    function notEqual(oldRect, newRect) {
        return oldRect && (oldRect.top !== newRect.top || oldRect.left !== newRect.left);
    }

    kendo.spreadsheet.SheetEditor = SheetEditor;
})(kendo);
