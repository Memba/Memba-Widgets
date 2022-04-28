/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.skeletoncontainer',[ "./kendo.core"], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "skeletoncontainer",
    name: "SkeletonContainer",
    category: "web",
    depends: [ "core"]
};

(function($) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        WAVE_ANIMATION = "k-skeleton-wave",
        PULSE_ANIMATION = "k-skeleton-pulse",
        WRAPPER_CLASS = "k-skeleton-container";

    var SkeletonContainer = Widget.extend( {
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            $.cssNumber.gridColumnStart = true;
            $.cssNumber.gridColumnEnd = true;
            $.cssNumber.gridRowStart = true;
            $.cssNumber.gridRowEnd = true;

            that.element = $(element).addClass(WRAPPER_CLASS);

            that._setWrapperStyles();
            that._initItems();
            that._initTemplate();
            that._aria();
        },

        options: {
            name: "SkeletonContainer",
            animation: "pulse",
            grid: null,
            template: null,
            height: "",
            width: ""
        },

        setOptions: function(options) {
            kendo.deepExtend(this.options, options);
            this.element.empty();
            this.init(this.element, this.options);
        },

        getOptions: function() {
            var result = $.extend(true, {}, this.options);

            return result;
        },

        _aria: function() {
            var element = this.element;

            element.attr({
                "role": "alert",
                "aria-live": "polite",
                "aria-label": kendo.ui.progress.messages.loading
            });
        },

        _initItems: function() {
            if (!this.options.grid) {
                return;
            }

            var that = this;
            var grid = that.options.grid;
            var items = grid.items;
            var shape;
            var settings;
            var item;

            for (var i = 0; i < items.length; i++) {
                settings = items[i];
                item = $("<div></div>");

                shape = settings.shape.toLowerCase();

                item
                    .css({
                        "grid-column": kendo.format("{0} / span {1}",settings.colStart, settings.colSpan),
                        "grid-row": kendo.format("{0} / span {1}",settings.rowStart, settings.rowSpan)
                    })
					.addClass("k-skeleton")
                    .addClass(kendo.format("k-skeleton-{0}", shape === "rectangle" ? "rect" : shape));

                item.appendTo(that.element);
            }
        },

        _initTemplate: function () {
            if (!this.options.template || this.options.grid) {
                return;
            }

            var template = kendo.template(this.options.template)({});

            template = template
                    .replace(/data-animation/gi, "k-skeleton")
                    .replace(/data-shape/gi, "k-skeleton")
                    .replace(/k-skeleton-rectangle/gi, "k-skeleton-rect");

            this.element.append(template);

            this._addClasses();
        },

        _addClasses: function() {
            var shapes = ["circle", "rect", "text"];
            var animations = ["wave", "pulse"];

            for(var i = 0; i < shapes.length; i++) {
                this.element
                    .find("[k-skeleton-" + shapes[i] + "]")
                    .removeAttr("k-skeleton-" + shapes[i])
                    .addClass("k-skeleton k-skeleton-" + shapes[i] + "");
            }

            for(var j = 0; j < animations.length; j++) {
                this.element
                    .find("[k-skeleton-" + animations[j] + "]")
                    .removeAttr("k-skeleton-" + animations[j])
                    .addClass("k-skeleton-" + animations[j] + "");
            }
        },

        _setWrapperStyles: function () {
            var that = this;
            var options = that.options;
            var grid = options.grid;
            var animation = options.animation.toLowerCase();

            if (grid) {
                that.element
                    .css({
                        "grid-template-columns": kendo.format("repeat({0}, 1fr)", grid.columns),
                        "grid-template-rows":  kendo.format("repeat({0}, 1fr)", grid.rows),
                        "column-gap": (grid.gap || {}).columns,
                        "row-gap": (grid.gap || {}).rows
                    })
                    .addClass("k-d-grid");
            }

            that.element.css({
                "width": typeof options.width === "string" ? options.width : options.width + "px",
                "height": typeof options.height === "string" ? options.height : options.height + "px"
            });

            if (animation !== "none") {
                that.element.addClass(animation == "wave" ? WAVE_ANIMATION : PULSE_ANIMATION);
            }
        }
    });

    ui.plugin(SkeletonContainer);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

