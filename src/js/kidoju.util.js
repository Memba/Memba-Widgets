/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.data'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.util');
        // var BOOLEAN = 'boolean';
        var NUMBER = 'number';
        var STRING = 'string';
        // var UNDEFINED = 'undefined';

        var kidoju = window.kidoju = window.kidoju || {};
        var util = kidoju.util = kidoju.util || {};

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         *
         * @param a
         * @returns {*|boolean}
         */
        util.isAnyArray = function (a) {
            return Array.isArray(a) || a instanceof kendo.data.ObservableArray;
        };

        /**
         * Compare string arrays
         * @param a
         * @param b
         * @returns {arg is Array<any> | boolean}
         */
        util.compareStringArrays = function (a, b) {
            return util.isAnyArray(a) && util.isAnyArray(b) && a.length === b.length && a.join(';') === b.join(';');
        };

        /**
         * Convert radians to degrees
         * @param deg
         * @returns {number}
         */
        util.deg2rad = function (deg) {
            return deg * Math.PI / 180;
        };

        /**
         * Convert degrees to radians
         * @param rad
         * @returns {number}
         */
        util.rad2deg = function (rad) {
            return rad * 180 / Math.PI;
        };

        /**
         * Get the position of the center of an element
         * @param element
         * @param stage
         * @param scale
         */
        util.getElementCenter = function (element, stage, scale) {
            assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'element', 'jQuery'));
            assert.instanceof($, stage, assert.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
            assert.type(NUMBER, scale, assert.format(assert.messages.type.default, 'scale', NUMBER));
            // We need getBoundingClientRect to especially account for rotation
            var rect = element[0].getBoundingClientRect();
            var ownerDocument = $(stage.get(0).ownerDocument);
            var stageOffset = stage.offset();
            return {
                left: (rect.left - stageOffset.left + rect.width / 2  + ownerDocument.scrollLeft()) / scale,
                top: (rect.top - stageOffset.top + rect.height / 2 + ownerDocument.scrollTop()) / scale
            };
        };

        /**
         * Get the mouse (or touch) position
         * @param e
         * @param stage
         * @returns {{x: *, y: *}}
         */
        util.getMousePosition = function (e, stage) {
            assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
            assert.instanceof($, stage, assert.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
            // See http://www.jacklmoore.com/notes/mouse-position/
            // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
            // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
            // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
            var originalEvent = e.originalEvent;
            // var clientX = originalEvent && originalEvent.touches ? originalEvent.touches[0].clientX : e.clientX;
            // var clientY = originalEvent && originalEvent.touches ? originalEvent.touches[0].clientY : e.clientY;
            var clientX = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientX : e.clientX;
            var clientY = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientY : e.clientY;
            // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
            var ownerDocument = $(stage.get(0).ownerDocument);
            var stageOffset = stage.offset();
            var mouse = {
                x: clientX - stageOffset.left + ownerDocument.scrollLeft(),
                y: clientY - stageOffset.top + ownerDocument.scrollTop()
            };
            return mouse;
        };

        /**
         * Rotate a point by an angle around a center
         * @param point
         * @param center
         * @param radians
         * @returns {*}
         */
        util.getRotatedPoint = function (point, center, radians) {
            if ($.isPlainObject(point) && $.type(point.x) === 'number' && $.type(point.y) === 'number' &&
                $.isPlainObject(center) && $.type(center.x) === 'number' && $.type(center.y) === 'number' &&
                $.type(radians) === 'number') {
                return {
                    // See http://stackoverflow.com/questions/786472/rotate-a-point-by-another-point-in-2d
                    // See http://www.felixeve.co.uk/how-to-rotate-a-point-around-an-origin-with-javascript/
                    x: center.x + (point.x - center.x) * Math.cos(radians) - (point.y - center.y) * Math.sin(radians),
                    y: center.y + (point.x - center.x) * Math.sin(radians) + (point.y - center.y) * Math.cos(radians)
                };
            }
        };

        /**
         * Calculate the angle between two points rotated around a center
         * @param center
         * @param p1
         * @param p2
         * @returns {*}
         */
        util.getRadiansBetween2Points = function (center, p1, p2) {
            if ($.isPlainObject(center) && $.type(center.x) === 'number' && $.type(center.y) === 'number' &&
                $.isPlainObject(p1) && $.type(p1.x) === 'number' && $.type(p1.y) === 'number' &&
                $.isPlainObject(p2) && $.type(p2.x) === 'number' && $.type(p2.y) === 'number') {
                // See http://www.euclideanspace.com/maths/algebra/vectors/angleBetween/
                // See http://stackoverflow.com/questions/7586063/how-to-calculate-the-angle-between-a-line-and-the-horizontal-axis
                // See http://code.tutsplus.com/tutorials/euclidean-vectors-in-flash--active-8192
                // See http://gamedev.stackexchange.com/questions/69649/using-atan2-to-calculate-angle-between-two-vectors
                return Math.atan2(p2.y - center.y, p2.x - center.x) - Math.atan2(p1.y - center.y, p1.x - center.x);
            }
        };

        /**
         * Get a random pastel color to draw connections
         * @returns {string}
         */
        util.getRandomColor = function ()
        {
            var r = (Math.round(Math.random() * 127) + 127).toString(16);
            var g = (Math.round(Math.random() * 127) + 127).toString(16);
            var b = (Math.round(Math.random() * 127) + 127).toString(16);
            return '#' + r + g + b;
        };

        /**
         * Gets the selection
         * @param htmlElement
         * @private
         */
        util.getSelection = function (htmlElement) {
            assert.instanceof(HTMLDivElement, htmlElement, assert.format(assert.messages.instanceof.default, 'htmlElement', 'HTMLDivElement'));
            assert.ok(htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === 3, '`htmlElement` should only have on child node of type #Text');
            var cursor = {};
            // document.selection && document.selection.createRange were used in IE < 9
            // All modern browsers support the HTML Selection API, but Safari does not support selection events
            // @see https://caniuse.com/#feat=selection-api
            var selection = window.getSelection();
            if (selection.rangeCount) {
                var range = selection.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode === htmlElement) {
                    cursor.start = range.startOffset;
                    cursor.end = range.endOffset;
                }
            }
            return cursor;
        };

        /**
         * Sets the selection
         * @param htmlElement
         * @private
         */
        util.setSelection = function (htmlElement, cursor) {
            assert.instanceof(HTMLDivElement, htmlElement, assert.format(assert.messages.instanceof.default, 'htmlElement', 'HTMLDivElement'));
            assert.ok(htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === 3, '`htmlElement` should only have on child node of type #Text');
            assert.isPlainObject(cursor, assert.format(assert.messages.isPlainObject.default, 'cursor'));
            assert.type(NUMBER, cursor.start, assert.format(assert.messages.type.default, 'cursor.start', NUMBER));
            assert.type(NUMBER, cursor.end, assert.format(assert.messages.type.default, 'cursor.end', NUMBER));
            // document.selection && document.selection.createRange were used in IE < 9
            // All modern browsers support the HTML Selection API, but Safari does not support selection events
            // @see https://caniuse.com/#feat=selection-api
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(htmlElement.childNodes[0], cursor.start);
            range.setEnd(htmlElement.childNodes[0], cursor.end);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        };

        /**
         * Replaces the selection with alternate text
         * @param htmlElement
         * @param cursor
         * @param text
         * @private
         */
        util.replaceSelection = function (htmlElement, text) {
            assert.instanceof(HTMLDivElement, htmlElement, assert.format(assert.messages.instanceof.default, 'htmlElement', 'HTMLDivElement'));
            assert.ok(htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === 3, '`htmlElement` should only have on child node of type #Text');
            assert.type(STRING, text, assert.format(assert.messages.type.default, 'cursor.end', NUMBER));
            var selection = window.getSelection();
            var range = document.createRange();

            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        };

        /**
         * Get the rotation angle (in degrees) of an element's CSS transformation
         * @param element
         * @returns {Number|number}
         */
        util.getTransformRotation = function (element) {
            assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'element', 'jQuery'));
            // $(element).css('transform') returns a matrix, so we have to read the style attribute
            var match = (element.attr('style') || '').match(/rotate\([\s]*([0-9\.]+)[deg\s]*\)/); // TODO: Do we need $
            return Array.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 0 : 0;
        };

        /**
         * Get the scale of an element's CSS transformation
         * Note: the same function is used in kidoju.widgets.stage
         * @param element
         * @returns {Number|number}
         */
        util.getTransformScale = function (element) {
            assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'element', 'jQuery'));
            // element.css('transform') returns a matrix, so we have to read the style attribute
            var match = (element.attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
            return Array.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
        };

        /**
         * Test valid guid
         * @param value
         * @returns {boolean}
         */
        util.isGuid = function (value) {
            // http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
            return ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
        };

        /**
         * Get a random id
         * @returns {string}
         */
        util.randomId = function () {
            return 'id_' + util.randomString(6);
        };

        /**
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        util.randomString = function (length) {
            assert.type(NUMBER, length, assert.messages.type.default, 'length', NUMBER);
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function (c) {
                /* jshint -W016 */
                return (Math.random() * 16|0).toString(16);
                /* jshint +W016 */
            });
        };

        /**
         * Fisher-Yates shuffle
         * @see https://bost.ocks.org/mike/shuffle/
         * @param array
         * @returns {*}
         */
        util.shuffle = function (array) {
            var m = array.length;
            var t;
            var i;

            // While there remain elements to shuffle…
            while (m) {

                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);

                // And swap it with the current element.
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }

            return array;
        };

        /**
         * Snapping consists in rounding the value to the closest multiple of snapValue
         * @param value
         * @param snapValue
         * @returns {*}
         */
        util.snap = function (value, snapValue) {
            assert.type(NUMBER, value, assert.messages.type.default, 'value', NUMBER);
            assert.type(NUMBER, snapValue, assert.messages.type.default, 'snapValue', NUMBER);
            snapValue = Math.round(snapValue);
            if (snapValue) {
                return value % snapValue < snapValue / 2 ? value - value % snapValue : value + snapValue - value % snapValue;
            } else {
                // return value;
                return Math.round(value);
            }
        };

        /**
         * Style string to css object
         * allows to get a string from style="color: #ff0000; background: #ffffff;" and turn it into an object that can be used with jQuery.css
         * @param style
         * @returns {*}
         */
        util.styleString2CssObject = function (style) {
            if ($.isPlainObject(style)) {
                return style;
            } else if ($.type(style) === STRING) {
                var ret = {};
                var styleArray = style.split(';');
                for (var i = 0; i < styleArray.length; i++) {
                    var styleKeyValue = styleArray[i].split(':');
                    if ($.isArray(styleKeyValue) && styleKeyValue.length === 2) {
                        var key = $.camelCase(styleKeyValue[0].trim());
                        var value = styleKeyValue[1].trim();
                        if (key.length && value.length) {
                            ret[key] = value;
                        }
                    }
                }
                return ret;
            } else {
                return {};
            }
        };

    }(window.jQuery));

    /* jshint +W071 */

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
