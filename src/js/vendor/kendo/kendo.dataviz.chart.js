/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./dataviz/chart/kendo-chart.js";
import "./dataviz/chart/chart.js";

var __meta__ = {
    id: "dataviz.chart",
    name: "Chart",
    category: "dataviz",
    description: "The Chart widget uses modern browser technologies to render high-quality data visualizations in the browser.",
    depends: [ "data", "userevents", "drawing", "dataviz.core", "dataviz.themes" ],
    features: [{
        id: "dataviz.chart-pdf-export",
        name: "PDF export",
        description: "Export Chart as PDF",
        depends: [ "pdf" ]
    }]
};

export default kendo;

