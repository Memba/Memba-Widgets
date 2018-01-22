/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 * Portions Copyright (c) 2015, Vladimir Agafonkin
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/kendo/kendo.core',
        './vendor/kendo/kendo.drawing'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;

        /**************************************************************************************************************
         * Algorithm to simplify a path
         * https://github.com/mourner/simplify-js
         * https://karthaus.nl/rdp/js/rdp2.js
         **************************************************************************************************************/

        /**
         * Square distance between 2 points
         * @param p1
         * @param p2
         * @returns {number}
         */
        function getSqDist(p1, p2) {

            var dx = p1.x - p2.x,
                dy = p1.y - p2.y;

            return dx * dx + dy * dy;
        }

        /**
         * Square distance from a point to a segment
         * @param p
         * @param p1
         * @param p2
         * @returns {number}
         */
        function getSqSegDist(p, p1, p2) {

            var x = p1.x,
                y = p1.y,
                dx = p2.x - x,
                dy = p2.y - y;

            if (dx !== 0 || dy !== 0) {

                var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = p2.x;
                    y = p2.y;

                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }

            dx = p.x - x;
            dy = p.y - y;

            return dx * dx + dy * dy;
        }

        /**
         * Basic distance-based simplification
         * @param points
         * @param sqTolerance
         * @returns {[*]}
         */
        function simplifyRadialDist(points, sqTolerance) {

            var prevPoint = points[0],
                newPoints = [prevPoint],
                point;

            for (var i = 1, len = points.length; i < len; i++) {
                point = points[i];

                if (getSqDist(point, prevPoint) > sqTolerance) {
                    newPoints.push(point);
                    prevPoint = point;
                }
            }

            if (prevPoint !== point) newPoints.push(point);

            return newPoints;
        }

        /**
         *
         * @param points
         * @param first
         * @param last
         * @param sqTolerance
         * @param simplified
         */
        function simplifyDPStep(points, first, last, sqTolerance, simplified) {
            var maxSqDist = sqTolerance,
                index;

            for (var i = first + 1; i < last; i++) {
                var sqDist = getSqSegDist(points[i], points[first], points[last]);

                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }

            if (maxSqDist > sqTolerance) {
                if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
                simplified.push(points[index]);
                if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
            }
        }

        /**
         * Simplification using Ramer-Douglas-Peucker algorithm
         * @param points
         * @param sqTolerance
         * @returns {[*]}
         */
        function simplifyDouglasPeucker(points, sqTolerance) {
            var last = points.length - 1;

            var simplified = [points[0]];
            simplifyDPStep(points, 0, last, sqTolerance, simplified);
            simplified.push(points[last]);

            return simplified;
        }

        /**************************************************************************************************************
         * Algorith to interpolate control points from a series of points
         * see https://www.particleincell.com/2012/bezier-splines/
         **************************************************************************************************************/

        /**
         * Computes a series of control points on an x or y axis to make a bezier spline
         * @param K
         * @returns {{p1: Array, p2: Array}}
         */
        function computeControlPoints(K)
        {
            var p1 = [];
            var p2 = [];
            var i;
            var m;
            var n = K.length-1;

            /*rhs vector*/
            var a = [];
            var b = [];
            var c = [];
            var r = [];

            /*left most segment*/
            a[0] = 0;
            b[0] = 2;
            c[0] = 1;
            r[0] = K[0] + 2 * K[1];

            /*internal segments*/
            for (i = 1; i < n - 1; i++)
            {
                a[i] = 1;
                b[i] = 4;
                c[i] = 1;
                r[i] = 4 * K[i] + 2 * K[i+1];
            }

            /*right segment*/
            a[n-1] = 2;
            b[n-1] = 7;
            c[n-1] = 0;
            r[n-1] = 8 * K[n - 1] + K[n];

            /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
            for (i = 1; i < n; i++)
            {
                m = a[i] / b[i-1];
                b[i] = b[i] - m * c[i - 1];
                r[i] = r[i] - m * r[i - 1];
            }

            p1[n - 1] = r[n - 1] / b[n - 1];
            for (i = n - 2; i >= 0; --i)
                p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];

            /*we have p1, now compute p2*/
            for (i = 0; i < n - 1; i++)
                p2[i] = 2 * K[i + 1] - p1[i + 1];

            p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

            return { p1:p1, p2:p2 };
        }

        /**************************************************************************************************************
         * kendo.drawing.PathEx
         **************************************************************************************************************/

        /**
         * An extended class for kendo.drawing.Path
         * @see https://medium.com/@jlchereau/an-extended-kendo-drawing-path-for-pen-drawing-7c40b5a83059
         */
        drawing.PathEx = drawing.Path.extend({

            /**
             * A combination of distance-based and Ramer-Douglas-Peucker algorithms to simplify a path (list of points)
             * @param points
             * @param tolerance - number of pixels (the higher the less precise but the quicker)
             * @param useDistances - false only applies Ramer-Douglas-Peucker
             */
            simplify: function (tolerance, useDistances) {
                if (this.segments.length <= 2) {
                    return this;
                }
                var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

                // Calculate simplified anchors using Ramer-Douglas-Peucker
                var anchors = Array.prototype.map.call(this.segments, function (segment) { return segment.anchor().clone() });
                anchors = useDistances ? simplifyRadialDist(anchors, sqTolerance) : anchors;
                anchors = simplifyDouglasPeucker(anchors, sqTolerance);

                // Modify the path
                var segments = anchors.map(function (anchor) { return new drawing.Segment(anchor) });
                // ElementsArray is not public to call ElementsArray.prototype.splice.apply and pass an array
                // this.segments.splice(0, this.segments.length, segments[0], segments[1], ...);
                this.segments._splice(0, this.segments.length, segments);
                this.segments._change();

                // return the path, especially to chain with smooth
                return this;
            },

            /**
             * Smooth the path
             */
            smooth: function () {

                var i;
                var length = this.segments.length;
                var xes = [];
                var yes = [];

                // Collect anchor coordinates
                for (i = 0; i < length; i++) {
                    var segment = this.segments[i];
                    xes.push(segment.anchor().x);
                    yes.push(segment.anchor().y);
                }

                // Compute control points p1 and p2 for x and y directions
                var pxes = computeControlPoints(xes);
                var pyes = computeControlPoints(yes);

                // Update path with control points
                for (i = 0; i < length - 1; i++) {
                    this.segments[i].controlOut(new geometry.Point(pxes.p1[i], pyes.p1[i]));
                    this.segments[i + 1].controlIn(new geometry.Point(pxes.p2[i], pyes.p2[i]));
                }

                return this;
            },

            /**
             * Prints an SVG path
             * @returns {*}
             */
            stringify: function () {
                var PathNode = drawing.svg.PathNode;
                return PathNode.fn.printPath(this);
            }

            /**
             * TODO: compute intersections:
             * See https://www.particleincell.com/2013/cubic-line-intersection/
             * See https://sites.google.com/site/curvesintersection/
             */

        });

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
