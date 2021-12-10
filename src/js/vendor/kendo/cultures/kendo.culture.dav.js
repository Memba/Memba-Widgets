/** 
 * Kendo UI v2021.3.1207 (http://www.telerik.com/kendo-ui)                                                                                                                                              
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
    kendo.cultures["dav"] = {
        name: "dav",
        numberFormat: {
            pattern: ["-n"],
            decimals: 2,
            ",": ",",
            ".": ".",
            groupSize: [3],
            percent: {
                pattern: ["-n%","n%"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "%"
            },
            currency: {
                name: "",
                abbr: "",
                pattern: ["-$n","$n"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "Ksh"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["Ituku ja jumwa","Kuramuka jimweri","Kuramuka kawi","Kuramuka kadadu","Kuramuka kana","Kuramuka kasanu","Kifula nguwo"],
                    namesAbbr: ["Jum","Jim","Kaw","Kad","Kan","Kas","Ngu"],
                    namesShort: ["Jum","Jim","Kaw","Kad","Kan","Kas","Ngu"]
                },
                months: {
                    names: ["Mori ghwa imbiri","Mori ghwa kawi","Mori ghwa kadadu","Mori ghwa kana","Mori ghwa kasanu","Mori ghwa karandadu","Mori ghwa mfungade","Mori ghwa wunyanya","Mori ghwa ikenda","Mori ghwa ikumi","Mori ghwa ikumi na imweri","Mori ghwa ikumi na iwi"],
                    namesAbbr: ["Imb","Kaw","Kad","Kan","Kas","Kar","Mfu","Wun","Ike","Iku","Imw","Iwi"]
                },
                AM: ["Luma lwa K","luma lwa k","LUMA LWA K"],
                PM: ["luma lwa p","luma lwa p","LUMA LWA P"],
                patterns: {
                    d: "dd/MM/yyyy",
                    D: "dddd, d MMMM yyyy",
                    F: "dddd, d MMMM yyyy HH:mm:ss",
                    g: "dd/MM/yyyy HH:mm",
                    G: "dd/MM/yyyy HH:mm:ss",
                    m: "MMMM d",
                    M: "MMMM d",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM yyyy",
                    Y: "MMMM yyyy"
                },
                "/": "/",
                ":": ":",
                firstDay: 0
            }
        }
    }
})(this);
}));