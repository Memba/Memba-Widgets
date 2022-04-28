/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.circularprogressbar',[ "./kendo.dataviz", "./kendo.dataviz.themes" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "circularprogressBar",
    name: "CircularProgressBar",
    category: "web",
    description: "The Circular ProgressBar component represents an SVG loader",
    depends: [ "core" ]
};

(function ($, undefined) {

    window.kendo.dataviz = window.kendo.dataviz || {};
    var dataviz = kendo.dataviz;
    var interpolateValue = dataviz.interpolateValue;
    var drawing = kendo.drawing;
    var ui = kendo.ui;
    var Widget = ui.Widget;
    var Surface = drawing.Surface;
    var geometry = kendo.geometry;
    var Animation = drawing.Animation;
    var Arc = drawing.Arc;
    var limitValue = dataviz.limitValue;
    var round = dataviz.round;
    var DrawingGroup = drawing.Group;
    var DEFAULT_HEIGHT = 200;
    var GEO_ARC_ADJUST_ANGLE = 180;
    var MINVALUE = 0;
    var MAXVALUE = 100;
    var DEFAULT_MARGIN = 5;
    var ANGULAR_SPEED = 150;
    var DEFAULT_WIDTH = 200;
    var MAX_DURATION = 800;
    var announceElement = '<span aria-live="polite" class="k-sr-only k-progress-announce"></span>';

    var PointerAnimation = Animation.extend({
        init: function(element, options) {
            Animation.fn.init.call(this, element, options);

            var animationOptions = this.options;
            var color = options.endColor;
            var startColor = options.startColor;
            var duration = (Math.abs(animationOptions.newAngle - animationOptions.oldAngle) / animationOptions.duration) * 1000;
            animationOptions.duration = limitValue(duration, ANGULAR_SPEED, MAX_DURATION);

            this.element = element;

            if (startColor !== color) {
                this.startColor = new kendo.Color(startColor);
                this.color = new kendo.Color(color);
            }
        },

        step: function(pos) {
            var that = this;
            var options = that.options;
            var startColor = that.startColor;
            var color = that.color;
            var angle = interpolateValue(options.oldAngle, options.newAngle, pos);

            this.element.geometry().setEndAngle(angle);

            if (color) {
                var r = round(interpolateValue(startColor.r, color.r, pos));
                var g = round(interpolateValue(startColor.g, color.g, pos));
                var b = round(interpolateValue(startColor.b, color.b, pos));

                this.element.stroke(new kendo.Color(r, g, b).toHex());
            }
        },
    });

    var CircularProgressBar = Widget.extend({
        init: function(element, userOptions) {

            var that = this;
            Widget.fn.init.call(that, element, userOptions);
            this.theme = themeOptions(this.options);
            this._value = this.options.value;
            this.element.addClass("k-gauge");

            this.redraw();
            this._centerTemplate();
            this._aria();
        },

        options: {
            name: "CircularProgressBar",
            ariaRole: false,
            theme: "default",
            centerTemplate: '',
            color: "",
            colors: [],
            transitions: true,
            pointerWidth: 5,
            indeterminate: false,
            label: null,
            labelId: null
        },

        events: [ ],

        value: function (value) {
            var that = this;

            if (value === undefined) {
                return that._value;
            }

            value = that._restrictValue(value);

            that._centerSvgElements();
            that._pointerChange(that._value, value);
            that._value = value;
            that._centerTemplate();
            that._updateProgress();
        },

        redraw: function() {
            this._initSurface();
            this._buildVisual();
            this._draw();
        },

        resize: function() {
            var transitions = this.options.transitions;

            this.options.transitions = false;
            this._initSurface();
            this._buildVisual();
            this._draw();
            this._centerTemplate();
            this.options.transitions = transitions;
        },

        destroy: function() {
            var that = this;

            if (that.announce) {
                that.announce.remove();
            }

            Widget.fn.destroy.call(that);
        },

        _aria: function() {
            var that = this,
                options = that.options,
                value = that.value() || 0,
                wrapper = that.element;

            if (!options.ariaRole) {
                return;
            }

            wrapper.attr({
                "role": "progressbar"
            });

            if (!options.indeterminate) {
                wrapper.attr({
                    "aria-valuemin": 0,
                    "aria-valuemax": 100
                });
            }

            if (!!options.labelId) {
                wrapper.attr("aria-labelledby", options.labelId);
            } else if(!!options.label) {
                wrapper.attr("aria-label", options.label);
            }

            that.announce = $(announceElement);
            that.announce.appendTo($("body"));

            if (!options.indeterminate) {
                wrapper.attr("aria-valuenow", value);

                that.announce.text(value + "%");
            } else {
                that.announce.text("Loading...");
            }
        },

        _restrictValue: function (value) {

            if (value < MINVALUE) {
                return MINVALUE;
            }

            if (value > MAXVALUE) {
                return MAXVALUE;
            }

            return value;
        },

        _updateProgress: function() {
            var that = this;
            var options = that.options;
            var value = that.value() || 0;

            if (options.ariaRole && !options.indeterminate) {
                that.element.attr("aria-valuenow", value);

                if (that.announce) {
                    that.announce.text(value + "%");
                }
            }
        },

        _centerSvgElements: function () {
            var center = this._getCenter();

            if (this.circle._geometry.center.x !== center.x ||
                this.circle._geometry.center.y !== center.y) {

                    this.circle._geometry.center.x = center.x;
                    this.circle._geometry.center.y = center.y;
                    this.arc._geometry.center.x = center.x;
                    this.arc._geometry.center.y = center.y;
                    this.circle.geometryChange();
                    this.arc.geometryChange();
            }
        },

        _centerTemplate: function() {
            var position;
            var template;
            var centerElement;

            if (this.options.centerTemplate) {
                template = kendo.template(this.options.centerTemplate);

                centerElement = this._getCenterElement();

                centerElement.html(template({ color: this._getColor(this.value()), value: this.value() }));

                position = this._centerTemplatePosition(centerElement.width(), centerElement.height());

                centerElement.css(position);
            } else if (this._centerElement) {
                this._centerElement.remove();
                this._centerElement = null;
            }
        },

        _getCenterElement: function() {
            var centerElement = this._centerElement;
            if (!centerElement) {
                centerElement = this._centerElement = $('<div></div>').addClass('k-arcgauge-label');
                this.element.append(centerElement);
            }

            return centerElement;
        },

        _pointerChange: function (oldValue, newValue) {
            var animation;

            if (this.options.transitions) {
                animation = new PointerAnimation(this.arc, {
                    oldAngle: this._slotAngle(oldValue),
                    startColor: this._getColor(oldValue),
                    newAngle: this._slotAngle(newValue),
                    endColor: this._getColor(newValue)
                });
                animation.play();
            } else {
                this.arc.stroke(this._getColor(newValue));
                this.arc.geometry().setEndAngle(this._slotAngle(newValue));
            }
        },

        _draw: function() {
            var arc;
            var center;
            var animation;
            var surface = this.surface;

            surface.clear();
            surface.draw(this._visuals);

            if (this.options.indeterminate) {
                arc = surface.element.find("path");
                center = this._getCenter();
                arc[0].innerHTML = kendo.format('<animateTransform attributeName="transform" type="rotate" from="0 {0} {1}" to="360 {0} {1}" dur="1s" repeatCount="indefinite" />', center.x, center.y);
            } else if (this.options.transitions) {
                animation = new PointerAnimation(this.arc, {
                    oldAngle: this._slotAngle(0),
                    startColor: this._getColor(0),
                    newAngle: this._slotAngle(this.value()),
                    endColor: this._getColor(this.value()),
                });
                animation.play();
            }
        },


        _buildVisual: function() {
            var visuals = this._visuals = new DrawingGroup();
            var center = this._getCenter();
            var color = this._getColor(this.value()) || this.theme.pointer.color;
            var radius = Math.min(center.x, center.y) - DEFAULT_MARGIN - this.options.pointerWidth;

            var circleGeometry = new geometry.Circle([center.x, center.y], radius + (this.options.pointerWidth/2));
            var circle = this.circle = new drawing.Circle(circleGeometry, {
                fill: { color: "none" },
                stroke :{ color: this.theme.scale.rangePlaceholderColor, width: this.options.pointerWidth }
            });

            visuals.append(circle);

            if (this.options.indeterminate) {
                this.arc = this._createArc(360, radius, center, color);
            } else {
                this.arc = this._createArc(this._slotAngle(this.value()), radius, center, color);
            }

            visuals.append(this.arc);
        },

        _slotAngle: function(value) {
            var result;
    
            result = ((value - MINVALUE) / (MAXVALUE) * 360) + 90;
    
            return result + GEO_ARC_ADJUST_ANGLE;
        },

        _getColor: function(value) {
            var options = this.options;
            var colors = options.colors;
            var color = options.color;
            var currentValue = dataviz.isNumber(value) ? value : 0;
    
            if (colors) {
                for (var idx = 0; idx < colors.length; idx++) {
                    var range = colors[idx];
                    var rangeColor = range.color;
                    var from = range.from; if (from === void 0) { from = 0; }
                    var to = range.to; if (to === void 0) { to = 100; }
    
                    if (from <= currentValue && currentValue <= to) {
                        return rangeColor;
                    }
                }
            }
    
            return color;
        },

        _createArc: function(endAngle, rangeRadius, center, color) {
            var rangeSize = this.options.pointerWidth;
            var rangeGeom = new geometry.Arc([center.x, center.y], {
                radiusX: rangeRadius + (rangeSize / 2),
                radiusY: rangeRadius + (rangeSize / 2),
                startAngle: 270,
                endAngle: endAngle
            });
    
            return new Arc(rangeGeom, {
                stroke: {
                    width: rangeSize,
                    color: this.options.color || color,
                    opacity: this.options.opacity
                }
            });
        },

        _centerTemplatePosition: function(width, height) {
            var size = this._getSize();
            var center = this._getCenter();
    
            var left = center.x - width / 2;
            var top = center.y - height / 2;
            var right;
            var bottom;
    
            if (width < size.width) {
                right = left + width;
    
                left = Math.max(left, 0);
    
                if (right > size.width) {
                    left -= right - size.width;
                }
            }
    
            if (height < size.height) {
                bottom = top + height;
    
                if (bottom > size.height) {
                    top -= bottom - size.height;
                }
            }
    
            return {
                left: left,
                top: top
            };
        },

        _getCenter: function() {
            var size = this._getSize();
            return new dataviz.Point(size.width/2, size.height/2);
        },

        _getSize: function() {
            var element = this.element;
            var defaultSize = {
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT
            };
            var width = element[0].offsetWidth;
            var height = element[0].offsetHeight;

            if (!width) {
                width = defaultSize.width;
            }

            if (!height) {
                height = defaultSize.height;
            }

            return { width: width, height: height };
        },

        _surfaceElement: function() {
            if (!this.surfaceElement) {
                this.surfaceElement = document.createElement('div');
                this.element[0].appendChild(this.surfaceElement);
            }

            return this.surfaceElement;
        },

        _initSurface: function() {
            var that = this;
            var options = that.options;
            var surface = that.surface;
            var element = this._surfaceElement();
            var size = this._getSize();

            dataviz.elementSize(element, size);

            if (!surface) {
                this.surface = Surface.create(element, {
                    type: options.renderAs
                });
            } else {
                this.surface.clear();
                this.surface.resize();
            }
        }

    });

    function themeOptions(options) {
        var themes = dataviz.ui.themes || {};
        var themeName = options.theme || "";
        var lowerName = themeName.toLowerCase();

        if(dataviz.SASS_THEMES.indexOf(lowerName) != -1) {
            return dataviz.autoTheme().gauge;
        }

        return (themes[themeName] || themes[lowerName] || {}).gauge;
    }

    ui.plugin(CircularProgressBar);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
