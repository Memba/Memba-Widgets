/**
 * Kendo UI v2022.2.802 (http://www.telerik.com/kendo-ui)
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
    kendo.cultures["sw-CD"] = {
        name: "sw-CD",
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
                name: "Congolese Franc",
                abbr: "CDF",
                pattern: ["-$ n","$ n"],
                decimals: 2,
                ",": ".",
                ".": ",",
                groupSize: [3],
                symbol: "FC"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"],
                    namesAbbr: ["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"],
                    namesShort: ["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"]
                },
                months: {
                    names: ["Januari","Februari","Machi","Aprili","Mei","Juni","Julai","Agosti","Septemba","Oktoba","Novemba","Desemba"],
                    namesAbbr: ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ago","Sep","Okt","Nov","Des"]
                },
                AM: ["AM","am","AM"],
                PM: ["PM","pm","PM"],
                patterns: {
                    d: "dd/MM/yyyy",
                    D: "dddd, d MMMM yyyy",
                    F: "dddd, d MMMM yyyy HH:mm:ss",
                    g: "dd/MM/yyyy HH:mm",
                    G: "dd/MM/yyyy HH:mm:ss",
                    m: "d MMMM",
                    M: "d MMMM",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM yyyy",
                    Y: "MMMM yyyy"
                },
                "/": "/",
                ":": ":",
                firstDay: 1
            }
        }
    };
})(this);
}));