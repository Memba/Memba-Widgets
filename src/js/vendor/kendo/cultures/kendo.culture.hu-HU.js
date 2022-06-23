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
    kendo.cultures["hu-HU"] = {
        name: "hu-HU",
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
                name: "Hungarian Forint",
                abbr: "HUF",
                pattern: ["-n $","n $"],
                decimals: 2,
                ",": " ",
                ".": ",",
                groupSize: [3],
                symbol: "Ft"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"],
                    namesAbbr: ["V","H","K","Sze","Cs","P","Szo"],
                    namesShort: ["V","H","K","Sze","Cs","P","Szo"]
                },
                months: {
                    names: ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"],
                    namesAbbr: ["jan.","febr.","márc.","ápr.","máj.","jún.","júl.","aug.","szept.","okt.","nov.","dec."]
                },
                AM: ["de.","de.","DE."],
                PM: ["du.","du.","DU."],
                patterns: {
                    d: "yyyy. MM. dd.",
                    D: "yyyy. MMMM d., dddd",
                    F: "yyyy. MMMM d., dddd H:mm:ss",
                    g: "yyyy. MM. dd. H:mm",
                    G: "yyyy. MM. dd. H:mm:ss",
                    m: "MMMM d.",
                    M: "MMMM d.",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "H:mm",
                    T: "H:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "yyyy. MMMM",
                    Y: "yyyy. MMMM"
                },
                "/": ". ",
                ":": ":",
                firstDay: 1
            }
        }
    };
})(this);
}));