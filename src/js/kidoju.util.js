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
        './window.logger'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var assert = window.assert;
        var logger = new window.Logger('kidoju.util');
        // var BOOLEAN = 'boolean';
        var NUMBER = 'number';
        // var STRING = 'string';
        // var UNDEFINED = 'undefined';

        var kidoju = window.kidoju = window.kidoju || {};
        var util = kidoju.util = kidoju.util || {};

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

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
         * Get the rotation angle (in degrees) of an element's CSS transformation
         * @param element
         * @returns {Number|number}
         */
        util.getTransformRotation = function (element) {
            // $(element).css('transform') returns a matrix, so we have to read the style attribute
            var match = ($(element).attr('style') || '').match(/rotate\([\s]*([0-9\.]+)[deg\s]*\)/);
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
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        util.randomString = function (length) {
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function (c) {
                /* jshint -W016 */
                return (Math.random() * 16|0).toString(16);
                /* jshint +W016 */
            });
        };

        /**
         * Snapping consists in rounding the value to the closest multiple of snapValue
         * @param value
         * @param snapValue
         * @returns {*}
         */
        util.snap = function (value, snapValue) {
            if (snapValue) {
                return value % snapValue < snapValue / 2 ? value - value % snapValue : value + snapValue - value % snapValue;
            } else {
                return value;
            }
        };

    }(window.jQuery));

    /* jshint +W071 */

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
