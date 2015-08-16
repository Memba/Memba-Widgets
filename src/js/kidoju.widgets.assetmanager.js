/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define){
    'use strict';
    define(['./vendor/kendo/kendo.binder', './vendor/kendo/kendo.tabstrip', './vendor/kendo/kendo.listview'], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            STRING = 'string',
            DELETE = 'delete',
            UPLOAD = 'upload',
            NS = '.kendoAssetManager',
            WIDGET_CLASS = 'k-widget kj-assetmanager',
            TOOLBAR_TMPL = '<div class="k-widget k-filebrowser-toolbar k-header k-floatwrap">' +
                '<div class="k-toolbar-wrap">' +
                    '<div class="k-widget k-upload"><div class="k-button k-button-icontext k-upload-button"><span class="k-icon k-add"></span>#=messages.toolbar.upload#<input type="file" name="file" /></div></div>' +
                    '<button type="button" class="k-button k-button-icon k-state-disabled"><span class="k-icon k-delete" /></button>&nbsp;' +
                '</div>' +
                '<div class="k-tiles-arrange">' +
                    '<label>#=messages.filter#: <select /></label>' +
                '</div>' +
            '</div>';

            // EVENTS
            // CLICK = 'click',
            // CHANGE = 'change';


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.assetmanager: ' + message);
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class AssetManager Widget (kendoAssetManager)
         */
        var AssetManager = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                log('widget initialized');
                that._layout();
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'AssetManager',
                transport: {
                    read: function(options) {},
                    coll1: function(options) {},
                    coll2: function(options) {}
                },
                messages: {
                    filter: 'Filter',
                    toolbar: {
                        upload: 'Upload',
                        delete: 'Delete'
                    },
                    transport: {
                        read: 'Project',
                        coll1: 'O-Collection',
                        coll2: 'X-Collection'
                    }
                }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                DELETE,
                UPLOAD
            ],

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that._tabStrip();
                that._tabContent();
            },

            _tabStrip: function() {
                var that = this;
                // Create as many tabs as there are transports
                var transports = Object.keys(that.options.transport),
                    div = $('<div></div>'),
                    ul = $('<ul></ul>').appendTo(div);
                for (var i = 0; i < transports.length; i++) {
                    ul.append('<li' + (transports[i] === 'read' ? ' class="k-state-active"' : '') + '>' + that.options.messages.transport[transports[i]] + '</li>');
                    div.append('<div></div>');
                }
                div.appendTo(that.element);
                // Set the tabStrip item of the component
                that.tabStrip = div.kendoTabStrip({
                    tabPosition: "left",
                    animation: { open: { effects: "fadeIn" } }
                }).data('kendoTabStrip');
            },

            _tabContent: function() {
                var that = this,
                    tabStrip = that.tabStrip;
                that.contentElement = $('<div class="kj-assetmanager-content k-filebrowser"></div>')
                    .appendTo(tabStrip.contentHolder(0));
                that._toolbar();
            },

            _toolbar: function() {
                var that = this,
                    template = kendo.template(TOOLBAR_TMPL),
                    messages = that.options.messages,
                    arrangeBy = [
                        { text: messages.orderByName, value: "name" },
                        { text: messages.orderBySize, value: "size" }
                    ];

                that.toolbar = $(template({
                    messages: messages
                })).appendTo(that.contentElement);

                // TODO : upload

                /*
                that.arrangeBy = that.toolbar.find(".k-tiles-arrange select")
                    .kendoDropDownList({
                        dataSource: arrangeBy,
                        dataTextField: "text",
                        dataValueField: "value",
                        change: function() {
                            that.orderBy(this.value());
                        }
                    })
                    .data("kendoDropDownList");
                */

                /*
                that._attachDropzoneEvents();
                */
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                // remove descendants
                $(that.element).empty();
                // remove element classes
                $(that.element).removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                // if ($.isFunction(that._refreshHandler)) {
                //    that.options.tools.unbind(CHANGE, that._refreshHandler);
                // }
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(AssetManager);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });
