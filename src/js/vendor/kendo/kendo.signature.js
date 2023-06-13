/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.drawing.js";
import "./signature/signature-pad.js";
import "./kendo.dialog.js";
import "./kendo.html.button.js";

var __meta__ = {
    id: "signature",
    name: "Signature",
    category: "web",
    description: "The Signature component ...",
    depends: [ "core", "dialog", "html.button", "drawing" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        Dialog = kendo.ui.Dialog,
        html = kendo.html,
        outerWidth = kendo._outerWidth,
        outerHeight = kendo._outerHeight,
        Pad = kendo.inputs.common.SignaturePad,
        ns = ".kendoSignature",
        DEFAULT_BACKGROUND_COLOR = '#ffffff',
        CHANGE = "change",
        OPEN = "open",
        CLOSE = "close",
        CLICK = "click",
        TABINDEX = "tabindex",
        ARIA_LABEL = "aria-label",
        ARIA_LABELLEDBY = "aria-labelledby";

    var Signature = Widget.extend({
        init: function(element, options) {
            var that = this;

            options = options || {};

            Widget.fn.init.call(that, element, options);

            that._createElements(that.element, that.options.maximizable ? "maxi" : "", false, 1);
            that._createInput();
            that.wrapper = that.element;
            if (!that.options.backgroundColor) {
                that.options.backgroundColor = getComputedStyle(that.element[0]).backgroundColor || DEFAULT_BACKGROUND_COLOR;
            }

            that._createPad();
            that._createDialogPad();
            that._attachHandlers();
            that._assignLabel();

            if (that.options.value) {
                that._pad.loadImage(that.options.value);
                that._dialogPad.loadImage(that.options.value);
            }

            if (that.options.readonly) {
                that.readonly();
            }

            if (!that.options.enable) {
                that.enable(false);
            }
        },

        options: {
            name: "Signature",
            color: "#000000",
            enable: true,
            fillMode: "solid",
            hideLine: false,
            label: "",
            maximizable: true,
            popupScale: 3,
            readonly: false,
            rounded: "medium",
            size: "medium",
            smooth: false,
            strokeWidth: 1,
            exportScale: 2,
            value: ""
        },

        events: [ CHANGE, OPEN, CLOSE],

        setOptions: function(options) {
            var currentOptions = this.options;
            var path;
            var oldBtnClass = kendo.getValidCssClass("k-button-", "size", currentOptions.size);
            var btns = this.element.add(this._dialogPadEl).find("." + oldBtnClass);
            var targets = $(this._pad.element).add(this._dialogPad.element);

            btns.removeClass(oldBtnClass);
            this._clearCssClasses(currentOptions);
            this.element.removeClass(kendo.getValidCssClass("k-signature-", "size", currentOptions.size));
            kendo.deepExtend(currentOptions, options);
            this.options = currentOptions;
            this.element.width(currentOptions.width);
            this.element.height(currentOptions.height);
            this._dialogPadEl.width(currentOptions.width * currentOptions.popupScale);
            this._dialogPadEl.height(currentOptions.height * currentOptions.popupScale);
            path = this._pad.path;
            this._destroyPad();
            this._destroyDialog();
            this._createPad();
            this._createDialogPad();
            copyPath(this._pad, path);
            this.enable(currentOptions.enable);
            this.readonly(currentOptions.readonly);
            this._hideLine(this.element);
            this._hideLine(this._dialogPadEl);
            this._applyCssClasses(this.element);
            this.element.find(".k-signature-maximize").toggle(currentOptions.maximizable);
            this.element.removeClass(kendo.getValidCssClass("k-input-", "size", this.options.size));
            this.element.addClass(kendo.getValidCssClass("k-signature-", "size", this.options.size));
            btns.addClass(kendo.getValidCssClass("k-button-", "size", currentOptions.size));

            targets.removeAttr("aria-label");
            this._assignLabel();
        },

        close: function() {
            if (!this._dialog) {
                return;
            }
            this._dialog.close();
        },

        open: function() {
            if (!this.options.maximizable || !this._dialog) {
                return;
            }
            this._dialog.open();
        },

        destroy: function() {
            var that = this;
            that._destroyPad();

            that._destroyDialog();

            that.element.off(ns);
            that.element.empty();
            Widget.fn.destroy.call(that);
        },

        enable: function(enable) {
            var enable = enable !== false;
            if (!enable) {
                this._dialog.close();
            }

            this.element.find(".k-button").toggle(enable);
            this.element.toggleClass("k-disabled", !enable);
            this._pad.options.readonly = !enable;
            this._dialogPad.options.readonly = !enable;
        },

        readonly: function(toggle) {
            var that = this;
            var toggle = toggle !== false;

            that._pad.options.readonly = toggle;
            that._dialogPad.options.readonly = toggle;

            var clearButton = that.element.find(".k-signature-clear");

            if (!clearButton.length && !toggle) {
                $(html.renderButton('<button class="k-signature-action k-signature-clear"></button>', {
                    icon: "x",
                    size: this.options.size,
                    fillMode: "flat"
                })).insertAfter(that.element.find(".k-signature-actions-bottom"));

                $(html.renderButton('<button class="k-signature-action k-signature-clear"></button>', {
                    icon: "x",
                    size: this.options.size,
                    fillMode: "flat"
                })).insertAfter(that._dialogEl.find(".k-signature-actions-bottom"));
            }

            that.element.find(".k-signature-clear").toggle(!toggle);
            that._dialogEl.find(".k-signature-clear").toggle(!toggle);
        },

        value: function(value) {
            if (value !== undefined) {
                this._value = value;
                this._input.val(value);
                this._pad.loadImage(value);
            }

            return this._value;
        },

        reset: function() {
            this._dialogPad.clear();
            this._pad.clear();
            this._value = "";
        },

        _assignLabel: function() {
            var targets = $(this._pad.element).add(this._dialogPad.element);

            if (this.options.label) {
                targets.attr(ARIA_LABEL, this.options.label);
            } else {
                this._ariaLabel(targets);
            }

            this.element.removeAttr(ARIA_LABELLEDBY);
        },

        _attachHandlers: function() {
            var that = this;
            that.element
                .on(CLICK + ns, ".k-signature-clear", function() {
                    that.reset();
                })
                .on(CLICK + ns, ".k-signature-maximize", function() {
                    that._dialog.open();
                    that._dialog.wrapper.find(".k-signature-minimize").trigger("focus");
                });
        },

        _createInput: function() {
            var that = this;
            var name = that.element.attr("name");
            var autocomplete = that.element.attr("autocomplete");
            var required = that.element.attr("required");

            that._input = $("<input class='k-hidden' aria-hidden='true'/>").appendTo(that.element);

            if (name) {
                that._input.attr("name", name);
                that.element.removeAttr("name");
            }

            if (autocomplete) {
                that._input.attr("autocomplete", autocomplete);
                that.element.removeAttr("autocomplete");
            }

            if (required) {
                that._input.attr("required", required);
                that.element.removeAttr("required");
            }
        },

        _destroyPad: function() {
            if (this._pad) {
                kendo.destroy(this.element.find(".k-signature-canvas"));
                this._pad = null;
                this.element.find(".k-signature-canvas").empty();
            }
        },

        _destroyDialog: function() {
            if (this._dialogPad) {
                this._dialogPad.destroy();
                this._dialogPad = null;
                this._dialogEl.off(ns);
                this._dialog.destroy();
                this._dialog = null;
                this._dialogEl.remove();
                this._dialogEl = null;
            }
        },

        _hideLine: function(wrapper) {
            var line = wrapper.find(".k-signature-line");
            if (!this.options.hideLine && !line.length) {
                $("<div class='k-signature-line'>").appendTo(wrapper);
            }

            if (this.options.hideLine) {
                line.remove();
            }
        },

        _createElements: function(wrapper, button, maximize, scale) {
            $("<div class='k-signature-canvas' role='img' tabindex='0'>").appendTo(wrapper);

            this._hideLine(wrapper);

            $("<div class='k-signature-actions k-signature-actions-top'></div>").appendTo(wrapper);

            if (button == "mini") {
                $(html.renderButton('<button class="k-signature-action k-signature-minimize k-rotate-180" aria-label="Minimize signature"></button>', {
                    icon: "hyperlink-open",
                    size: this.options.size,
                    fillMode: "flat"
                })).appendTo(wrapper.find(".k-signature-actions-top"));
            }

            if (button == "maxi") {
                $(html.renderButton('<button class="k-signature-action k-signature-maximize" aria-label="Maximize signature"></button>', {
                    icon: "hyperlink-open",
                    size: this.options.size,
                    fillMode: "flat"
                })).appendTo(wrapper.find(".k-signature-actions-top"));
            }

            $("<div class='k-signature-actions k-signature-actions-bottom'></div>").appendTo(wrapper);

            if (!this.options.readonly) {
                $(html.renderButton('<button class="k-signature-action k-signature-clear"  aria-label="Clear signature"></button>', {
                    icon: "x",
                    size: this.options.size,
                    fillMode: "flat"
                })).appendTo(wrapper.find(".k-signature-actions-bottom"));
            }

            wrapper.addClass("k-input k-signature");

            wrapper.width(this.options.width * scale);
            wrapper.height(this.options.height * scale);

            if (maximize) {
                wrapper.addClass("k-signature-maximized");
            }

            this._applyCssClasses(wrapper);
            //workaround as the sizings are added to -signature- but roundings to -input-
            wrapper.removeClass(kendo.getValidCssClass("k-input-", "size", this.options.size));
            wrapper.addClass(kendo.getValidCssClass("k-signature-", "size", this.options.size));
        },

        _createPad: function() {
            var that = this;
            var padOptions = $.extend(true, {}, that.options, {
                onChange: function() {
                    var width = outerWidth(that.element, false);
                    var height = outerHeight(that.element, false);
                    that._pad.exportImage({
                        width: width * that.options.exportScale,
                        height: height * that.options.exportScale
                    }).then(function(val) {
                        that._value = val;
                        that._input.val(val);
                        that.trigger(CHANGE);
                    });

                    that._pad.exportImage({
                        width: width * that.options.exportScale * that.options.popupScale,
                        height: height * that.options.exportScale * that.options.popupScale
                    }).then(function(val) {
                        that._dialogPad.loadImage(val);
                    });
                },
                onDraw: function() {
                    that.element.find(".k-button").hide();
                },
                onDrawEnd: function() {
                    that.element.find(".k-button").show();
                }
            });

            that._pad = new Pad(that.element.find(".k-signature-canvas")[0], padOptions);
        },

        _createDialogPad: function() {
            var that = this;
            var canvas = null;

            that._dialogEl = $("<div>").appendTo(that.element);
            that._dialog = new Dialog(that._dialogEl, {
                title: false,
                closable: false,
                open: function() {
                    that.trigger(OPEN);
                },
                close: function() {
                    that.trigger(CLOSE);
                }
            });

            that._dialogEl
                .removeAttr(TABINDEX)
                .on("keydown", function(e) {
                    if (e.keyCode === kendo.keys.ESC) {
                        that._dialog.close();
                    }
                });

            that._dialogPadEl = $("<div>").appendTo(that._dialog.element);
            that._createElements(that._dialogPadEl, "mini", true, this.options.popupScale);
            canvas = that._dialogPadEl.find(".k-signature-canvas")[0];

            that._dialogPad = new Pad(canvas, $.extend(true, {}, that.options, {
                scale: that.options.popupScale,
                onChange: function() {
                    var width = outerWidth(that.element, false);
                    var height = outerHeight(that.element, false);
                    that._dialogPad.exportImage({
                        width: width * that.options.exportScale,
                        height: height * that.options.exportScale
                    }).then(function(val) {
                        that._pad.loadImage(val);
                        that._value = val;
                        that._input.val(val);
                        that.trigger(CHANGE);
                    });
                },
                onDraw: function() {
                    that._dialogEl.find(".k-button").hide();
                },
                onDrawEnd: function() {
                    that._dialogEl.find(".k-button").show();
                }
            }));

            // Dialog should be opened at first for drawing to work
            that._dialog.close();
            that._dialogEl
                .on(CLICK + ns, ".k-signature-clear", function() {
                    that.reset();
                })
                .on(CLICK + ns, ".k-signature-minimize", function() {
                    that._dialog.close();
                });
        }
    });

    function copyPath(pad, path) {
        if (!path || !path.paths || !path.paths.length) {
            return;
        }
        pad.path = new kendo.drawing.MultiPath(pad.pathOptions);
        pad.rootGroup.append(pad.path);

        for (var i = 0; i < path.paths.length; i++) {
            pad.path.paths.push(path.paths[i]);
        }
        pad.options.onChange();
    }

    kendo.cssProperties.registerPrefix("Signature", "k-input-");

    kendo.ui.plugin(Signature);

})(window.kendo.jQuery);

