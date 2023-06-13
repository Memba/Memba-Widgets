/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo-sparkline.js";

(function($) {

var dataviz = kendo.dataviz;
var Chart = dataviz.ui.Chart;
var KendoSparkline = dataviz.Sparkline;
var ChartInstanceObserver = dataviz.ChartInstanceObserver;

var extend = $.extend;

var Sparkline = Chart.extend({

    init: function(element, userOptions) {
        var options = userOptions;
        if (options instanceof kendo.data.ObservableArray) {
            options = { seriesDefaults: { data: options } };
        }

        Chart.fn.init.call(this, element, KendoSparkline.normalizeOptions(options));
    },

    _createChart: function(options, themeOptions) {
        this._instance = new KendoSparkline(this.element[0], options, themeOptions, {
            observer: new ChartInstanceObserver(this),
            sender: this,
            rtl: this._isRtl()
        });
    },

    _createTooltip: function() {
        return new SparklineTooltip(this.element, extend({}, this.options.tooltip, {
            rtl: this._isRtl()
        }));
    },

    options: {
        name: "Sparkline",
        chartArea: {
            margin: 2
        },
        axisDefaults: {
            visible: false,
            majorGridLines: {
                visible: false
            },
            valueAxis: {
                narrowRange: true
            }
        },
        seriesDefaults: {
            type: "line",
            area: {
                line: {
                    width: 0.5
                }
            },
            bar: {
                stack: true
            },
            padding: 2,
            width: 0.5,
            overlay: {
                gradient: null
            },
            highlight: {
                visible: false
            },
            border: {
                width: 0
            },
            markers: {
                size: 2,
                visible: false
            }
        },
        tooltip: {
            visible: true,
            shared: true
        },
        categoryAxis: {
            crosshair: {
                visible: true,
                tooltip: {
                    visible: false
                }
            }
        },
        legend: {
            visible: false
        },
        transitions: false,

        pointWidth: 5,

        panes: [{
            clip: false
        }]
    }
});

dataviz.ui.plugin(Sparkline);

var SparklineTooltip = dataviz.Tooltip.extend({
    options: {
        animation: {
            duration: 0
        }
    },

    _hideElement: function() {
        if (this.element) {
            this.element.hide().remove();
        }
    }
});

dataviz.SparklineTooltip = SparklineTooltip;

})(window.kendo.jQuery);
