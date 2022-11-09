/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../../kendo.core.js";
import "../location.js";

(function($, undefined) {
    // Imports ================================================================
    var kendo = window.kendo,
        Class = kendo.Class,

        dataviz = kendo.dataviz,
        deepExtend = kendo.deepExtend,

        Extent = dataviz.map.Extent,

        util = kendo.drawing.util,
        defined = util.defined;

    // Implementation =========================================================
    var Layer = Class.extend({
        init: function(map, options) {
            this._initOptions(options);
            this.map = map;

            this.element = $("<div class='k-layer'></div>")
               .css({
                   "zIndex": this.options.zIndex,
                   "opacity": this.options.opacity
               })
               .appendTo(map.scrollElement);

            this._beforeReset = this._beforeReset.bind(this);
            this._reset = this._reset.bind(this);
            this._resize = this._resize.bind(this);
            this._panEnd = this._panEnd.bind(this);
            this._activate();

            this._updateAttribution();
        },

        destroy: function() {
            this._deactivate();
        },

        show: function() {
            this.reset();
            this._activate();
            this._applyExtent(true);
        },

        hide: function() {
            this._deactivate();
            this._setVisibility(false);
        },

        reset: function() {
            this._beforeReset();
            this._reset();
        },

        _reset: function() {
            this._applyExtent();
        },

        _beforeReset: $.noop,

        _resize: $.noop,

        _panEnd: function() {
            this._applyExtent();
        },

        _applyExtent: function() {
            var options = this.options;

            var zoom = this.map.zoom();
            var matchMinZoom = !defined(options.minZoom) || zoom >= options.minZoom;
            var matchMaxZoom = !defined(options.maxZoom) || zoom <= options.maxZoom;

            var extent = Extent.create(options.extent);
            var inside = !extent || extent.overlaps(this.map.extent());

            this._setVisibility(matchMinZoom && matchMaxZoom && inside);
        },

        _setVisibility: function(visible) {
            this.element.css("display", visible ? "" : "none");
        },

        _activate: function() {
            var map = this.map;
            this._deactivate();
            map.bind("beforeReset", this._beforeReset);
            map.bind("reset", this._reset);
            map.bind("resize", this._resize);
            map.bind("panEnd", this._panEnd);
        },

        _deactivate: function() {
            var map = this.map;
            map.unbind("beforeReset", this._beforeReset);
            map.unbind("reset", this._reset);
            map.unbind("resize", this._resize);
            map.unbind("panEnd", this._panEnd);
        },

        _updateAttribution: function() {
            var attr = this.map.attribution;

            if (attr) {
                attr.add(this.options.attribution);
            }
        }
    });

    // Exports ================================================================
    deepExtend(dataviz, {
        map: {
            layers: {
                Layer: Layer
            }
        }
    });

})(window.kendo.jQuery);
