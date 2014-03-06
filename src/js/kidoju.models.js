//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        kidoju = global.kidoju = global.kidoju || {},

        //Types
        STRING = 'string',
        NUMBER = 'number',
        DATE = 'date',
        BOOLEAN = 'boolean',

        //Defaults
        DEFAULT_GUID = '00000000-0000-0000-0000-000000000000',

        //Debug
        DEBUG = true,
        MODULE = 'kidoju.models: ';

    /**
     * A PageItem is what we store and a PageElement is what we display
     * @class PageItem
     * @type {void|*}
     */
    var PageItem = kidoju.PageItem = kendo.data.Model.define({
        id: "id",
        fields: {
            id: {
                type: STRING,
                defaultValue: DEFAULT_GUID,
                editable: false
            },
            tool: {
                type: STRING,
                editable: false
            },
            top: {
                type: NUMBER,
                defaultValue: 0
            },
            left: {
                type: NUMBER,
                defaultValue: 0
            },
            height: {
                type: NUMBER,
                defaultValue: 100
            },
            width: {
                type: NUMBER,
                defaultValue: 300
            },
            rotate: {
                type: NUMBER,
                defaultValue: 0
                //parse modulo 360
            },
            properties: {
                type: STRING
                //parse: function (value) { return value; }
            },
            fields: {
                type: STRING
                //parse: function (value) { return value; }
            },
            defaults: {
                type: STRING
                //parse: function (value) { return value; }
            },
            solutions: {
                type: STRING
                //parse: function (value) { return value; }
            }
        }
    });

    //TODO Check SchedulerDataSource to build a PageDataSource


}(jQuery));