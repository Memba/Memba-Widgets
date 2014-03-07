//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        kidoju = global.kidoju = global.kidoju || {},

        //Types
        STRING = 'string',
        NUMBER = 'number',
        DATE = 'date',
        BOOLEAN = 'boolean',

        //Defaults
        ZERO_GUID = '00000000-0000-0000-0000-000000000000',
        ZERO_NUMBER = 0,
        NEGATIVE_NUMBER = -1,

        //Debug
        DEBUG = true,
        MODULE = 'kidoju.models: ';


    /**
     * Page node
     * @class Page
     * @type {void|*}
     */
    var Page = kidoju.Page = data.Model.define({
        id: 'id',
        fields: {
            id: {
                type: STRING,
                defaultValue: ZERO_GUID,
                editable:false
            }
            //background image and color?
        }
        //PageItems
    });


    /**
     * PageItem model
     * @class PageItem
     * @type {void|*}
     */
    var PageItem = kidoju.PageItem = data.Model.define({
        id: 'id',
        fields: {
            id: {
                type: STRING,
                defaultValue: ZERO_GUID,
                editable: false
            },
            tool: {
                type: STRING,
                editable: false
            },
            top: {
                type: NUMBER,
                defaultValue: ZERO_NUMBER
            },
            left: {
                type: NUMBER,
                defaultValue: ZERO_NUMBER
            },
            height: {
                type: NUMBER,
                defaultValue: NEGATIVE_NUMBER
            },
            width: {
                type: NUMBER,
                defaultValue: NEGATIVE_NUMBER
            },
            rotate: {
                type: NUMBER,
                defaultValue: ZERO_NUMBER,
                parse: function(value) {
                    return (value + 360) % 360;
                }
            },
            properties: {
                type: STRING,
                defaultValue: JSON.stringify({}),
                parse: function (value) {
                    //Enforce valid JSON
                    try {
                        JSON.parse(value);
                        return value;
                    }
                    catch(e) {
                        return JSON.stringify({});
                    }
                }
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
        },
        //See SchedulerEvent and Node in kendo.all.js
        init: function(item) {
            var that = this;
            //If we call the following, somme properties are not initialized
            //kendo.data.Model.fn.init.call(that, item);
            kendo.data.Model.fn.init.call(that, undefined);
            for (var prop in item) {
                if (item.hasOwnProperty(prop)) {
                    that[prop] = item[prop];
                }
            }
            if (kidoju.tools && $.type(that.tool) === STRING) {
                var tool = kidoju.tools[that.tool];
                if (tool instanceof kidoju.Tool) {
                    var properties = tool._getProperties();
                    try {
                        //the tool might have been updated to implement some new properties
                        $.extend(properties, JSON.parse(that.properties));
                    } catch (err) {}
                    that.properties = JSON.stringify(properties);
                }
            }
        },
        update: function(item) {
            for (var field in item) {
                this.set(field, item[field]);
            }
        },
        setProperty: function(key, value) {
            var properties = JSON.parse(this.get('properties'));
            properties[key] = value;
            this.set('properties', properties);
        },
        getProperty: function(key) {
            var properties = JSON.parse(this.get('properties'));
            return properties[key];
        },
        getProperties: function() {
            return JSON.parse(this.get('properties'));
        }
    });

    /**
     * @class PageCollectionDataSource
     * @type {*|void|Object}
     */
    var PageCollectionDataSource =  kidoju.PageCollectionDataSource = data.DataSource.extend({
        //TODO
    });

    /**
     * @method create
     * @param options
     */
    PageCollectionDataSource.create = function(options) {
        //TODO
    };



}(jQuery));