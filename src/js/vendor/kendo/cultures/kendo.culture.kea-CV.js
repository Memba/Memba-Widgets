/** 
 * Kendo UI v2021.1.330 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2021 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/

(function(f){
    if (typeof define === 'function' && define.amd) {
        define(["kendo.core"], f);
    } else {
        f();
    }
}(function(){
(function( window, undefined ) {
    kendo.cultures["kea-CV"] = {
        name: "kea-CV",
        numberFormat: {
            pattern: ["-n"],
            decimals: 2,
            ",": " ",
            ".": ",",
            groupSize: [3],
            percent: {
                pattern: ["-n%","n%"],
                decimals: 2,
                ",": " ",
                ".": ",",
                groupSize: [3],
                symbol: "%"
            },
            currency: {
                name: "Cape Verdean Escudo",
                abbr: "CVE",
                pattern: ["-n $","n $"],
                decimals: 2,
                ",": " ",
                ".": "$",
                groupSize: [3],
                symbol: "​"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["dumingu","sigunda-fera","tersa-fera","kuarta-fera","kinta-fera","sesta-fera","sabadu"],
                    namesAbbr: ["dum","sig","ter","kua","kin","ses","sab"],
                    namesShort: ["du","si","te","ku","ki","se","sa"]
                },
                months: {
                    names: ["Janeru","Febreru","Marsu","Abril","Maiu","Junhu","Julhu","Agostu","Setenbru","Otubru","Nuvenbru","Dizenbru"],
                    namesAbbr: ["Jan","Feb","Mar","Abr","Mai","Jun","Jul","Ago","Set","Otu","Nuv","Diz"]
                },
                AM: ["am","am","AM"],
                PM: ["pm","pm","PM"],
                patterns: {
                    d: "d/M/yyyy",
                    D: "dddd, d 'di' MMMM 'di' yyyy",
                    F: "dddd, d 'di' MMMM 'di' yyyy HH:mm:ss",
                    g: "d/M/yyyy HH:mm",
                    G: "d/M/yyyy HH:mm:ss",
                    m: "d 'di' MMMM",
                    M: "d 'di' MMMM",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM 'di' yyyy",
                    Y: "MMMM 'di' yyyy"
                },
                "/": "/",
                ":": ":",
                firstDay: 1
            }
        }
    }
})(this);
}));