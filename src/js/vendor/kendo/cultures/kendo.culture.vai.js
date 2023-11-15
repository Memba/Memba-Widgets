/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
(function( window, undefined ) {
    kendo.cultures["vai"] = {
        name: "vai",
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
                symbol: "$"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["ꕞꕌꔵ","ꗳꗡꘉ","ꕚꕞꕚ","ꕉꕞꕒ","ꕉꔤꕆꕢ","ꕉꔤꕀꕮ","ꔻꔬꔳ"],
                    namesAbbr: ["ꕞꕌꔵ","ꗳꗡꘉ","ꕚꕞꕚ","ꕉꕞꕒ","ꕉꔤꕆꕢ","ꕉꔤꕀꕮ","ꔻꔬꔳ"],
                    namesShort: ["ꕞꕌꔵ","ꗳꗡꘉ","ꕚꕞꕚ","ꕉꕞꕒ","ꕉꔤꕆꕢ","ꕉꔤꕀꕮ","ꔻꔬꔳ"]
                },
                months: {
                    names: ["ꖨꖕ ꕪꕴ ꔞꔀꕮꕊ","ꕒꕡꖝꖕ","ꕾꖺ","ꖢꖕ","ꖑꕱ","ꖱꘋ","ꖱꕞꔤ","ꗛꔕ","ꕢꕌ","ꕭꖃ","ꔞꘋꕔꕿ ꕸꖃꗏ","ꖨꖕ ꕪꕴ ꗏꖺꕮꕊ"],
                    namesAbbr: ["ꖨꖕꔞ","ꕒꕡ","ꕾꖺ","ꖢꖕ","ꖑꕱ","ꖱꘋ","ꖱꕞ","ꗛꔕ","ꕢꕌ","ꕭꖃ","ꔞꘋ","ꖨꖕꗏ"]
                },
                AM: ["AM","am","AM"],
                PM: ["PM","pm","PM"],
                patterns: {
                    d: "dd/MM/yyyy",
                    D: "dddd, d MMMM yyyy",
                    F: "dddd, d MMMM yyyy h:mm:ss tt",
                    g: "dd/MM/yyyy h:mm tt",
                    G: "dd/MM/yyyy h:mm:ss tt",
                    m: "MMMM d",
                    M: "MMMM d",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "h:mm tt",
                    T: "h:mm:ss tt",
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
})();
