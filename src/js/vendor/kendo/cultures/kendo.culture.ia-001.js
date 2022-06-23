/**
 * Kendo UI v2022.2.621 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
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
    kendo.cultures["ia-001"] = {
        name: "ia-001",
        numberFormat: {
            pattern: ["-n"],
            decimals: 2,
            ",": ".",
            ".": ",",
            groupSize: [3],
            percent: {
                pattern: ["-n%","n%"],
                decimals: 2,
                ",": ".",
                ".": ",",
                groupSize: [3],
                symbol: "%"
            },
            currency: {
                name: "Special Drawing Rights",
                abbr: "XDR",
                pattern: ["-$ n","$ n"],
                decimals: 2,
                ",": ".",
                ".": ",",
                groupSize: [3],
                symbol: "XDR"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["dominica","lunedi","martedi","mercuridi","jovedi","venerdi","sabbato"],
                    namesAbbr: ["dom","lun","mar","mer","jov","ven","sab"],
                    namesShort: ["do","lu","ma","me","jo","ve","sa"]
                },
                months: {
                    names: ["januario","februario","martio","april","maio","junio","julio","augusto","septembre","octobre","novembre","decembre"],
                    namesAbbr: ["jan","feb","mar","apr","mai","jun","jul","aug","sep","oct","nov","dec"]
                },
                AM: ["AM","am","AM"],
                PM: ["PM","pm","PM"],
                patterns: {
                    d: "dd-MM-yyyy",
                    D: "dddd 'le' d 'de' MMMM yyyy",
                    F: "dddd 'le' d 'de' MMMM yyyy HH:mm:ss",
                    g: "dd-MM-yyyy HH:mm",
                    G: "dd-MM-yyyy HH:mm:ss",
                    m: "d 'de' MMMM",
                    M: "d 'de' MMMM",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM yyyy",
                    Y: "MMMM yyyy"
                },
                "/": "-",
                ":": ":",
                firstDay: 1
            }
        }
    };
})(this);
}));