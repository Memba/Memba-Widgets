/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./tile.js";

(function($, undefined) {
    // Imports ================================================================
    var kendo = window.kendo,

        dataviz = kendo.dataviz,
        deepExtend = kendo.deepExtend,
        defined = kendo.drawing.util.defined,

        Extent = dataviz.map.Extent,
        Location = dataviz.map.Location,
        TileLayer = dataviz.map.layers.TileLayer,
        TileView = dataviz.map.layers.TileView;

    // Bing tile layer =============================================================
    var BingLayer = TileLayer.extend({
        init: function(map, options) {
            this.options.baseUrl =
                this._scheme() +
                "://dev.virtualearth.net/REST/v1/Imagery/Metadata/";

            TileLayer.fn.init.call(this, map, options);

            this._onMetadata = this._onMetadata.bind(this);
            this._fetchMetadata();
        },

        options: {
            imagerySet: "road"
        },

        _fetchMetadata: function() {
            var options = this.options;

            if (!options.key) {
                throw new Error("Bing tile layer: API key is required");
            }

            $.ajax({
                url: options.baseUrl + options.imagerySet,
                data: {
                    output: "json",
                    include: "ImageryProviders",
                    key: options.key,
                    uriScheme: this._scheme()
                },
                type: "get",
                dataType: "jsonp",
                jsonp: "jsonp",
                success: this._onMetadata
            });
        },

        _scheme: function(proto) {
            proto = proto || window.location.protocol;
            return proto.replace(":", "") === "https" ? "https" : "http";
        },

        _onMetadata: function(data) {
            var that = this;
            if (data && data.resourceSets.length) {
                var resource = that.resource = data.resourceSets[0].resources[0];

                deepExtend(that._view.options, {
                    urlTemplate: ({ subdomain, quadkey, culture }) => that.resource.imageUrl
                        .replace("{subdomain}", subdomain)
                        .replace("{quadkey}", quadkey)
                        .replace("{culture}", culture),
                    subdomains: resource.imageUrlSubdomains
                });

                var options = that.options;
                if (!defined(options.minZoom)) {
                    options.minZoom = resource.zoomMin;
                }
                if (!defined(options.maxZoom)) {
                    options.maxZoom = resource.zoomMax;
                }

                that._addAttribution();

                if (that.element.css("display") !== "none") {
                    that._reset();
                }
            }
        },

        _viewType: function() {
            return BingView;
        },

        _addAttribution: function() {
            var attr = this.map.attribution;
            if (attr) {
                var items = this.resource.imageryProviders;
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        for (var y = 0; y < item.coverageAreas.length; y++) {
                            var area = item.coverageAreas[y];
                            attr.add({
                                text: item.attribution,
                                minZoom: area.zoomMin,
                                maxZoom: area.zoomMax,
                                extent: new Extent(
                                    new Location(area.bbox[2], area.bbox[1]),
                                    new Location(area.bbox[0], area.bbox[3])
                                )
                            });
                        }
                    }
                }
            }
        },

        imagerySet: function(value) {
            if (value) {
                this.options.imagerySet = value;
                this.map.attribution.clear();
                this._fetchMetadata();
            } else {
                return this.options.imagerySet;
            }
        }
    });

    var BingView = TileView.extend({
        options: {
            culture: "en-US"
        },

        tileOptions: function(currentIndex) {
            var options = TileView.fn.tileOptions.call(this, currentIndex);

            options.culture = this.options.culture;
            options.quadkey = this.tileQuadKey(this.wrapIndex(currentIndex));

            return options;
        },

        tileQuadKey: function(index) {
            var quadKey = "",
                digit, mask, i;

            for (i = this._zoom; i > 0; i--) {
                digit = 0;
                mask = 1 << (i - 1);

                if ((index.x & mask) !== 0) {
                    digit++;
                }

                if ((index.y & mask) !== 0) {
                    digit += 2;
                }

                quadKey += digit;
            }

            return quadKey;
        }
    });

    // Exports ================================================================
    deepExtend(dataviz, {
        map: {
            layers: {
                bing: BingLayer,
                BingLayer: BingLayer,
                BingView: BingView
            }
        }
    });

})(window.kendo.jQuery);
