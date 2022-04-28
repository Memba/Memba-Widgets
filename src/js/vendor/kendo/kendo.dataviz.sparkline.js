/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
/***********************************************************************
 * WARNING: this file is auto-generated.  If you change it directly,
 * your modifications will eventually be lost.  The source code is in
 * `kendo-charts` repository, you should make your changes there and
 * run `src-modules/sync.sh` in this repository.
 */
(function(f, define){
    define('dataviz/sparkline/kendo-sparkline',[
        "../../kendo.dataviz.chart"
    ], f);
})(function(){

(function () {

window.kendo.dataviz = window.kendo.dataviz || {};
var dataviz = kendo.dataviz;
var constants = dataviz.constants;
var Chart = dataviz.Chart;
var elementSize = dataviz.elementSize;
var deepExtend = dataviz.deepExtend;

var TOP_OFFSET = -2;

var SharedTooltip$1 = dataviz.SharedTooltip.extend({
    _slotAnchor: function(coords, slot) {
        var axis = this.plotArea.categoryAxis;
        var vertical = axis.options.vertical;
        var align = vertical ? {
            horizontal: "left",
            vertical: "center"
        } : {
            horizontal: "center",
            vertical: "bottom"
        };

        var point;

        if (vertical) {
            point = new dataviz.Point(this.plotArea.box.x2, slot.center().y);
        } else {
            point = new dataviz.Point(slot.center().x, TOP_OFFSET);
        }

        return {
            point: point,
            align: align
        };
    },

    _defaultAnchor: function(point, slot) {
        return this._slotAnchor({}, slot);
    }
});

var DEAULT_BAR_WIDTH = 150;
var DEAULT_BULLET_WIDTH = 150;
var NO_CROSSHAIR = [ constants.BAR, constants.BULLET ];

function hide(children) {
    var state = [];
    for (var idx = 0; idx < children.length; idx++) {
        var child = children[idx];
        state[idx] = child.style.display;
        child.style.display = "none";
    }

    return state;
}

function show(children, state) {
    for (var idx = 0; idx < children.length; idx++) {
        children[idx].style.display = state[idx];
    }
}

function wrapNumber(value) {
    return dataviz.isNumber(value) ? [ value ] : value;
}

var Sparkline = Chart.extend({
    _setElementClass: function(element) {
        dataviz.addClass(element, 'k-sparkline');
    },

    _initElement: function(element) {
        Chart.fn._initElement.call(this, element);

        this._initialWidth = Math.floor(elementSize(element).width);
    },

    _resize: function() {
        var element = this.element;
        var state = hide(element.childNodes);

        this._initialWidth = Math.floor(elementSize(element).width);

        show(element.childNodes, state);

        Chart.fn._resize.call(this);
    },

    _modelOptions: function() {
        var chartOptions = this.options;
        var stage = this._surfaceWrap();
        var displayState = hide(stage.childNodes);

        var space = document.createElement('span');
        space.innerHTML = '&nbsp;';

        stage.appendChild(space);

        var options = deepExtend({
            width: this._autoWidth,
            height: elementSize(stage).height,
            transitions: chartOptions.transitions
        }, chartOptions.chartArea, {
            inline: true,
            align: false
        });

        elementSize(stage, {
            width: options.width,
            height: options.height
        });

        stage.removeChild(space);

        show(stage.childNodes, displayState);

        if (this.surface) {
            this.surface.resize();
        }

        return options;
    },

    _surfaceWrap: function() {
        if (!this.stage) {
            var stage = this.stage = document.createElement('span');
            this.element.appendChild(stage);
        }
        return this.stage;
    },

    _createPlotArea: function(skipSeries) {
        var plotArea = Chart.fn._createPlotArea.call(this, skipSeries);
        this._autoWidth = this._initialWidth || this._calculateWidth(plotArea);

        return plotArea;
    },

    _calculateWidth: function(plotArea) {
        var options = this.options;
        var margin = dataviz.getSpacing(options.chartArea.margin);
        var charts = plotArea.charts;
        var stage = this._surfaceWrap();
        var total = 0;

        for (var i = 0; i < charts.length; i++) {
            var currentChart = charts[i];
            var firstSeries = (currentChart.options.series || [])[0];
            if (!firstSeries) {
                continue;
            }

            if (firstSeries.type === constants.BAR) {
                return DEAULT_BAR_WIDTH;
            }

            if (firstSeries.type === constants.BULLET) {
                return DEAULT_BULLET_WIDTH;
            }

            if (firstSeries.type === constants.PIE) {
                return elementSize(stage).height;
            }

            var categoryAxis = currentChart.categoryAxis;
            if (categoryAxis) {
                var pointsCount = categoryAxis.categoriesCount() *
                    (!currentChart.options.isStacked && dataviz.inArray(firstSeries.type, [ constants.COLUMN, constants.VERTICAL_BULLET ]) ? currentChart.seriesOptions.length : 1);

                total = Math.max(total, pointsCount);
            }
        }

        var size = total * options.pointWidth;
        if (size > 0) {
            size += margin.left + margin.right;
        }

        return size;
    },

    _createSharedTooltip: function(options) {
        return new SharedTooltip$1(this._plotArea, options);
    }
});

Sparkline.normalizeOptions = function(userOptions) {
    var options = wrapNumber(userOptions);

    if (dataviz.isArray(options)) {
        options = { seriesDefaults: { data: options } };
    } else {
        options = deepExtend({}, options);
    }

    if (!options.series) {
        options.series = [ { data: wrapNumber(options.data) } ];
    }

    deepExtend(options, {
        seriesDefaults: {
            type: options.type
        }
    });

    if (dataviz.inArray(options.series[0].type, NO_CROSSHAIR) ||
        dataviz.inArray(options.seriesDefaults.type, NO_CROSSHAIR)) {
        options = deepExtend({}, {
            categoryAxis: {
                crosshair: {
                    visible: false
                }
            }
        }, options);
    }

    return options;
};

dataviz.setDefaultOptions(Sparkline, {
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

    panes: [ { clip: false } ]
});

kendo.deepExtend(kendo.dataviz, {
    Sparkline: Sparkline
});

})();

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('dataviz/sparkline/sparkline',[
        "./kendo-sparkline"
    ], f);
})(function(){

(function ($) {

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

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

(function(f, define){
    define('kendo.dataviz.sparkline',[ "./dataviz/sparkline/kendo-sparkline", "./dataviz/sparkline/sparkline" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "dataviz.sparkline",
    name: "Sparkline",
    category: "dataviz",
    description: "Sparkline widgets.",
    depends: [ "dataviz.chart" ]
};

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

