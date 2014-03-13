/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        binders = data.binders,
        Binder = data.Binder,
        ui = kendo.ui,
        
        CHANGE = 'change',
        
        DEBUG = true,
        MODULE = 'kidoju.widgets.bindings: ';

    /**
     * Enable binding the index value of a Playbar widget
     * @type {*|void}
     */
    binders.widget.index = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.index.set(this.widget.index());
        },
        refresh: function() {
            this.widget.index(this.bindings.index.get());
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });

    /**
     * Enable binding the id value of a Playbar widget
     * @type {*|void}
     */
    binders.widget.id = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.id.set(this.widget.id());
        },
        refresh: function() {
            this.widget.id(this.bindings.id.get());
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });

    /**
     * Enable binding the fields value of a Page widget
     * @type {*|void}
     */
    binders.widget.fields = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.fields.set(this.widget.fields());
        },
        refresh: function() {
            this.widget.fields(this.bindings.fields.get());
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });




} (jQuery));