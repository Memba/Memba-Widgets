/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.data.js";
import "./kendo.draganddrop.js";
import "./kendo.userevents.js";
import "./kendo.mobile.scroller.js";
import "./kendo.drawing.js";
import "./dataviz/diagram/utils.js";
import "./dataviz/diagram/math.js";
import "./dataviz/diagram/svg.js";
import "./dataviz/diagram/services.js";
import "./dataviz/diagram/layout.js";
import "./dataviz/diagram/dom.js";

    var __meta__ = {
        id: "dataviz.diagram",
        name: "Diagram",
        category: "dataviz",
        description: "The Kendo DataViz Diagram ",
        depends: [ "data", "userevents", "mobile.scroller", "draganddrop", "drawing", "dataviz.core", "dataviz.themes", "toolbar" ],
        features: [{
            id: "dataviz.diagram-pdf-export",
            name: "PDF export",
            description: "Export Diagram as PDF",
            depends: [ "pdf" ]
        },{
            id: "dataviz.diagram-editing",
            name: "Editing",
            description: "Support for model editing",
            depends: [ "editable", "window", "dropdownlist" ]
        }]
    };

