/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('util/ripple',[
        "../kendo.core"
    ], f);
})(function(){

(function () {

window.kendo.util = window.kendo.util || {};
window.kendo.util.ripple = window.kendo.util.ripple || {};

var closest = function (element, selector) {
    if (element.closest) {
        return element.closest(selector);
    }
    var matches = Element.prototype.matches ?
        function (el, sel) { return el.matches(sel); }
        : function (el, sel) { return el.msMatchesSelector(sel); };
    var node = element;
    while (node) {
        if (matches(node, selector)) {
            return node;
        }
        node = node.parentElement;
    }
};
var createRipple = function (doc) {
    var ripple = doc.createElement('div');
    ripple.className = 'k-ripple';
    var blob = doc.createElement('div');
    blob.className = 'k-ripple-blob';
    ripple.appendChild(blob);
    return [ripple, blob];
};
var once = function (element, eventName, fn) {
    var listener = function () {
        fn();
        element.removeEventListener(eventName, listener, false);
    };
    var remove = function () { return element.addEventListener(eventName, listener, false); };
    remove();
    return { remove: remove };
};
var activate = function (containerSelector, options) { return function (e) {
    var target = e.target;
    var doc = target.document || target.ownerDocument;
    var container;
    if (options.container) {
        container = options.container(target);
    }
    else {
        container = closest(target, containerSelector);
    }
    if (!container) {
        return;
    }
    // focus event of ripple container triggers double-focus
    var doubleFocus = /focus/i.test(e.type) && container.classList.contains("k-ripple-target");
    if (doubleFocus) {
        return;
    }
    if (!target.classList.contains('k-checkbox') && !target.classList.contains('k-radio')) {
        // suppress focus when animating ripples
        container.classList.add("k-ripple-target");
        var _a = createRipple(doc), ripple = _a[0], blob = _a[1];
        var state_1 = {
            animated: false,
            released: false,
            blob: blob,
            container: container,
            ripple: ripple
        };
        var eventType = {
            'focusin': 'focusout',
            'keydown': 'keyup',
            'mousedown': 'mouseup',
            'pointerdown': 'pointerup',
            'touchdown': 'touchup',
            'animationstart': 'animationend'
        }[e.type];
        once(e.currentTarget, eventType, function () { return release(state_1); });
        container.appendChild(ripple);
        // recalc to allow the effect to animate
        window.getComputedStyle(ripple).getPropertyValue('opacity');
        var rect = container.getBoundingClientRect();
        var left = 0;
        var top = 0;
        if ((/mouse|pointer|touch/).test(e.type)) {
            left = e.clientX - rect.left;
            top = e.clientY - rect.top;
        }
        else {
            left = rect.width / 2;
            top = rect.height / 2;
        }
        // coordinates of the farthest corner
        var xMax = left < rect.width / 2 ? rect.width : 0;
        var yMax = top < rect.height / 2 ? rect.height : 0;
        // distance to the farthest corner
        var dx = left - xMax;
        var dy = top - yMax;
        // blob size is twice the blob radius
        var size = 2 * Math.sqrt(dx * dx + dy * dy);
        var duration = 500;
        blob.style.width = blob.style.height = size + "px";
        // force reflow for Safari 11 to align ripple blob
        if (blob.offsetWidth < 0) {
            throw new Error("Inconceivable!");
        }
        blob.style.cssText = "\n        width: " + size + "px;\n        height: " + size + "px;\n        transform: translate(-50%, -50%) scale(1);\n        left: " + left + "px;\n        top: " + top + "px;\n    ";
        setTimeout(function () { return finishAnimation(state_1); }, duration);
    }
    else {
        e.target.classList.remove('k-ripple-focus');
        if (e.type !== 'animationend') {
            e.target.classList.add('k-ripple-focus');
        }
    }
}; };
var finishAnimation = function (state) {
    state.animated = true;
    deactivate(state);
};
var release = function (state) {
    state.released = true;
    deactivate(state);
};
var deactivate = function (state) {
    // deactivation happens when both
    // - the activation event has been released (release)
    // - the ripple has finished animating (finishAnimation)
    if (!state.released || !state.animated) {
        return;
    }
    var blob = state.blob, ripple = state.ripple, container = state.container;
    if (container) {
        once(container, 'blur', function () { return container.classList.remove("k-ripple-target"); });
    }
    if (blob) {
        once(blob, 'transitionend', function () {
            if (ripple && ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        });
        blob.style.transition = 'opacity 200ms linear';
        blob.style.opacity = '0';
    }
};
/**
 * @hidden
 */
var register = function (root, elements) {
    var flatten = function (arr) { return [].concat.apply([], arr); };
    var handlers = flatten(elements.map(function (item) {
        var defaultOptions = {
            events: ['mousedown', 'touchdown'],
            global: false
        };
        var selector = item.selector, _a = item.options, options = _a === void 0 ? defaultOptions : _a;
        var activator = activate(selector, options);
        var events = options.events || defaultOptions.events;
        var container = options.global ? document.body : root;
        events.forEach(function (evt) { return container.addEventListener(evt, activator, false); });
        return { events: events, options: options, activator: activator };
    }));
    return function () {
        if (!root) {
            return;
        }
        var removeListener = function (_a) {
            var events = _a.events, options = _a.options, activator = _a.activator;
            var container = options.global ? document.body : root;
            events.forEach(function (evt) { return container.removeEventListener(evt, activator, false); });
        };
        handlers.forEach(removeListener);
        root = null;
    };
};

kendo.deepExtend(kendo.util.ripple, {
    register: register
});

})();

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('kendo.ripple',[
        "./util/ripple"
    ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "ripplecontainer",
    name: "RippleContainer",
    category: "web",
    depends: [ "core" ]
};

(function ($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        extend = $.extend,
        ripple = kendo.util.ripple;

    var RippleContainer = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element);

            element = that.wrapper = that.element;

            that.options = extend({}, that.options, options);

            that.registerListeners();
        },

        options: {
            name: "RippleContainer",
            elements: [
                { selector: ".k-button:not(li)" },
                { selector: ".k-list > .k-item", options: { global: true } },
                { selector: ".k-checkbox-label, .k-radio-label" },
                {
                    selector: ".k-checkbox, .k-radio",
                    options: {
                        events: ["focusin"],
                        container: function(el) {
                            if (/\b(k-checkbox|k-radio)\b/.test(el.className)) {
                                return el.nextElementSibling;
                            }
                        }
                    }
                }
            ]
        },

        removeListeners: function() {},

        registerListeners: function() {
            var that = this;
            var root = that.element[0];
            var elements = that.options.elements;

            that.removeListeners();

            var callback = ripple.register(root, elements);

            that.removeListeners = callback;
        },

        destroy: function() {
            var that = this;

            Widget.fn.destroy.call(that);

            that.removeListeners();
        }
    });

    ui.plugin(RippleContainer);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

