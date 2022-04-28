/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.avatar',[ "./kendo.core" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "avatar",
    name: "Avatar",
    category: "web",
    description: "The Avatar component represents an icon, text, or image rendered in a styled container.",
    depends: [ "core" ]
};

(function ($, undefined) {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,

        DASH = "-";

    var AVATAR_STYLES = {
        widget: "k-widget",
        avatar: "k-avatar",
        bordered: "k-avatar-bordered"
    };

    var AVATAR_TYPE = {
        icon: "icon",
        image: "image",
        text: "text"
    };

    var Avatar = Widget.extend({
        init: function(element, options) {
            var that = this;

            options = options || {};

            Widget.fn.init.call(that, element, options);

            this._fromMarkup();
            this._wrapper();

            if(this._markupContent && this._markupContent.length > 0) {
                this._contentFromMarkup();
            } else {
                this._content();
            }
        },

        options: {
            name: "Avatar",
            alt: null,
            border: false,
            className: null,
            fillMode: "solid",
            icon: null,
            image: null,
            rounded: "full",
            size: "medium",
            style: null,
            text: null,
            themeColor: "primary",
            type: AVATAR_TYPE.text
        },

        events: [ ],

        setOptions: function(options) {
            var currentOptions = this.options,
                wrapper = this.wrapper,
                updatedOptions = $.extend({}, currentOptions, options);

            Widget.fn.setOptions.call(this, options);

            if(!updatedOptions[updatedOptions.type]) {
                currentOptions = this._optionsFromWrapper(currentOptions);
            }
            if(updatedOptions.border === false) {
                wrapper.removeClass(AVATAR_STYLES.bordered);
            }

            wrapper.empty();

            this.options = currentOptions;
            this._wrapper();
            this._content();
        },

        _content: function() {
            var span = this.wrapper.find("> span"),
                options = this.options,
                type = options.type,
                content;

            if(type === AVATAR_TYPE.icon) {
                content = $("<span class='k-icon k-i-" + options.icon + "'>");
            } else if(type === AVATAR_TYPE.image) {
                content = $("<img src='" + options.image + "'>");

                if(options.alt) {
                    content.attr("alt", options.alt);
                }
            } else if(type === AVATAR_TYPE.text) {
                content = $("<span>" + options.text + "</span>");
            }

            span.append(content);
        },

        _contentFromMarkup: function() {
            var span = this.wrapper.find("> span").first();

            span.append(this._markupContent);
        },

        _fromMarkup: function() {
            var element = this.element,
                options = this.options,
                image, icon;

            element.children().slice(1).remove();

            image = element.children("img");
            icon = element.children(".k-icon");

            if(image.length > 0 ) {
                options.type = AVATAR_TYPE.image;
                this._markupContent = image.first();
            } else if(icon.length > 0) {
                options.type = AVATAR_TYPE.icon;
                this._markupContent = icon.first();
            } else if(element.children().length > 0) {
                options.type = AVATAR_TYPE.text;
                this._markupContent = element.children();
            }
        },

        _optionsFromWrapper: function(updatedOptions) {
            var wrapper = this.wrapper,
                classes, image;

            if(updatedOptions.type === AVATAR_TYPE.text) {
                updatedOptions.text = wrapper.text().trim();
            } else if(updatedOptions.type === AVATAR_TYPE.icon) {
                classes = wrapper.find(".k-icon").attr("class").split(/\s+/);

                classes.forEach(function(name) {
                    if(name.indexOf("k-i-") === 0) {
                        updatedOptions.icon = name.substring(4);
                    }
                });
            } else if(updatedOptions.type === AVATAR_TYPE.image) {
                image = wrapper.find("img");
                updatedOptions.image = image.attr("src");

                if(image.attr("alt")) {
                    updatedOptions.alt = image.attr("alt");
                }
            }

            return updatedOptions;
        },

        _wrapper: function() {
            var wrapper = this.element,
                options = this.options,
                span = $("<span>");

            this.wrapper = wrapper;
            wrapper.addClass(AVATAR_STYLES.avatar);

            this._applyCssClasses();

            if(options.border) {
                wrapper.addClass(AVATAR_STYLES.bordered);
            }
            if(options.style) {
                wrapper.css(options.style);
            }
            if(options.className) {
                wrapper.addClass(options.className);
            }

            span.addClass(AVATAR_STYLES.avatar + DASH + options.type);
            wrapper.prepend(span);
        }
    });

    kendo.cssProperties.registerPrefix("Avatar", "k-avatar-");

    kendo.cssProperties.registerValues("Avatar", [{
        prop: "rounded",
        values: kendo.cssProperties.roundedValues.concat([['full', 'full']])
    }]);

    kendo.ui.plugin(Avatar);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
