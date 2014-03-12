//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true, jquery:true*/
/*jshint browser:true, jquery:true*/

(function ($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        ui = kendo.ui;

    /**
     * Enable binding the index value of a Playbar widget
     * @type {*|void}
     */
    kendo.data.binders.widget.index = kendo.data.Binder.extend({
        init: function(widget, bindings, options) {
            //call the base constructor
            kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
        },
        refresh: function() {
            var that = this,
                value = that.bindings.index.get(), //get the value from the View-Model
                widget = kendo.widgetInstance($(that.element));
            if (widget instanceof ui.Playbar) {
                widget.index(value); //update our widget
            } else if ($.isFunction(widget.index)) { //try not to mess with other widgets
                try {
                    widget.index(value);
                } catch(err) {
                    $.noop();
                }
            }
        }
    });

} (jQuery));