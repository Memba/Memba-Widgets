/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.icons.js";

(function($, undefined) {

    var kendo = window.kendo;
    var Widget = kendo.ui.Widget;
    var extend = $.extend;
    var DOT = ".";
    var NS = ".kendoChat";

    var DATA_K_BUTTON_NAME = "kButtonName";
    var SCROLL_LEFT_NAME = "chatToolbarScrollLeft";
    var SCROLL_RIGHT_NAME = "chatToolbarScrollRight";
    var VISIBLE = ":visible";
    var TABINDEX = "tabindex";

    var DEFAULT_ANIMATION = {
        effects: "expand:vertical",
        duration: 200
    };
    var NO_ANIMATION = {
        expand: {
            show: true
        },
        collapse: {
            hide: true
        }
    };

    var toolbarStyles = {
        button: "k-button",
        buttonDefaults: "k-button-md k-rounded-md k-button-solid k-button-solid-base",
        buttonList: "k-button-list k-toolbar-group",
        scrollButton: "k-scroll-button",
        scrollButtonLeft: "k-scroll-button-left",
        scrollButtonRight: "k-scroll-button-right",
        scrollButtonLeftIcon: "chevron-left",
        scrollButtonRightIcon: "chevron-right",
        iconButton: "k-icon-button"
    };

    var ChatToolBar = Widget.extend({
        init: function(element, options) {
            options = extend({}, options, { name: "ChatToolbar" });
            var toolbarOptions = options.toolbar;
            var buttonsDefined = toolbarOptions.buttons && toolbarOptions.buttons.length;

            Widget.fn.init.call(this, element, options);

            if (buttonsDefined) {
                this._createButtonList();
            }

            if (buttonsDefined && toolbarOptions.scrollable &&
                    this.buttonsWidth() > this.element.width()) {
                this._initScrolling();
            }

            this._setupAnimation();

            if (buttonsDefined && toolbarOptions.toggleable) {
                this.toggle(true);
            }

            this.element
                .on("click" + NS, this._onClick.bind(this))
                .on("keydown" + NS, this._onKeydown.bind(this));
        },

        events: [
            "click"
        ],

        destroy: function() {
            Widget.fn.destroy.call(this);

            this.element.off(NS);
            this.element.empty();
        },

        _createButtonList: function() {
            var that = this;
            var styles = ChatToolBar.styles;
            var buttons = that.options.toolbar.buttons;
            var buttonList = $("<div class='" + styles.buttonList + "'></div>");

            for (var i = 0; i < buttons.length; i++) {
                var button = that._createButton(buttons[i]);
                buttonList.append(button);
            }

            buttonList.appendTo(this.element);

            this.buttonList = buttonList;
            this.buttons().first().removeAttr(TABINDEX);
        },

        _createButton: function(btnOptions) {
            var styles = ChatToolBar.styles;
            var buttonElm = $("<button>");
            var attributes;

            if (typeof btnOptions === "string") {
                btnOptions = {
                    name: btnOptions
                };
            }

            attributes = $.extend({}, btnOptions.attr || {}, {
                title: btnOptions.text || btnOptions.name,
                "aria-label": btnOptions.text || btnOptions.name,
                type: "button",
                tabindex: -1
            });

            buttonElm
                .attr(attributes)
                .addClass(btnOptions.name)
                .data(DATA_K_BUTTON_NAME, btnOptions.name)
                .addClass(styles.button)
                .addClass(styles.buttonDefaults);

            if (btnOptions.icon || btnOptions.iconClass) {
                buttonElm.addClass(styles.iconButton);
                buttonElm.prepend(kendo.html.renderIcon({ icon: btnOptions.icon, iconClass: "k-button-icon" + (btnOptions.iconClass ? ` ${btnOptions.iconClass}` : "") }));
            }

            return buttonElm;
        },

        _onClick: function(ev) {
            var styles = ChatToolBar.styles;
            var target = $(ev.target).closest(DOT + styles.button);

            if (target.is(DOT + styles.scrollButton) && !this._scrolling) {
                this._scroll(target.data(DATA_K_BUTTON_NAME));
            }

            if (target.data(DATA_K_BUTTON_NAME)) {
                this.buttons().attr(TABINDEX, -1);
                target.removeAttr(TABINDEX);

                this.trigger("click", {
                    button: target[0],
                    name: target.data(DATA_K_BUTTON_NAME),
                    originalEvent: ev
                });
            }
        },

        _onKeydown: function(e) {
            var key = e.keyCode,
                keys = kendo.keys;

            switch (key) {
                case keys.LEFT:
                    this._focusButton(-1);
                    break;
                case keys.RIGHT:
                    this._focusButton(1);
                    break;
            }
        },

        _focusButton: function(dir) {
            var buttons = this.buttons(),
                current = buttons.not("[tabindex=-1]"),
                candidateIndex = current.index() + dir,
                candidate = buttons[candidateIndex];

            if (candidate) {
                current.attr(TABINDEX, -1);
                candidate.removeAttribute(TABINDEX);
                candidate.focus();
            }
        },

        _initScrolling: function() {
            var styles = ChatToolBar.styles;

            this.scrollButtonLeft = this._createButton({
                name: SCROLL_LEFT_NAME,
                icon: styles.scrollButtonLeftIcon,
                attr: {
                    "class": styles.scrollButton + " " + styles.scrollButtonLeft
                }
            });

            this.scrollButtonRight = this._createButton({
                name: SCROLL_RIGHT_NAME,
                icon: styles.scrollButtonRightIcon,
                attr: {
                    "class": styles.scrollButton + " " + styles.scrollButtonRight
                }
            });

            this.element.prepend(this.scrollButtonLeft);
            this.element.append(this.scrollButtonRight);
            this._refreshScrollButtons();

            this.element.on("keydown" + NS, this._refreshScrollButtons.bind(this));
        },

        _scroll: function(commandName) {
            var that = this;
            var buttonWidth = that.buttonWidth();
            var maxScrollSize = this.maxScrollSize();
            var scrollAmmount = commandName === SCROLL_LEFT_NAME ? buttonWidth * -1 : buttonWidth;
            var currentScroll = this.currentScrollLeft();
            var scrollValue = currentScroll + scrollAmmount;
            scrollValue = Math.min(Math.max(scrollValue, 0), maxScrollSize);

            if (commandName !== SCROLL_LEFT_NAME && commandName !== SCROLL_RIGHT_NAME) {
                return;
            }

            kendo.scrollLeft(that.buttonList, scrollValue);
            that._refreshScrollButtons(scrollValue);
        },

        _refreshScrollButtons: function(value) {
            var maxScrollSize = this.maxScrollSize();
            var currentScrollLeft = value === undefined || isNaN(parseInt(value, 10)) ? this.currentScrollLeft() : value;

            if (!this.scrollButtonLeft && !this.scrollButtonRight) {
                return;
            }

            this.scrollButtonLeft.toggle(currentScrollLeft !== 0);
            this.scrollButtonRight.toggle(currentScrollLeft !== maxScrollSize);
        },

        _setupAnimation: function() {
            var animation = this.options.toolbar.animation;
            var defaultExpandAnimation = extend({}, DEFAULT_ANIMATION);
            var defaultCollapseAnimation = extend({
                reverse: true,
                hide: true
            }, DEFAULT_ANIMATION);

            if (animation === false) {
                animation = extend(true, {}, NO_ANIMATION);
            } else {
                animation = extend(true, {
                    expand: defaultExpandAnimation,
                    collapse: defaultCollapseAnimation
                }, animation);
            }

            this.options.toolbar.animation = animation;
        },

        _animationComplete: function() {
            this._refreshScrollButtons();
        },

        _animationCompleteExpand: function() {
            this._animationComplete();
            this.buttons().not("[tabindex=-1]").trigger("focus");
        },

        currentScrollLeft: function() {
            return Math.round(kendo.scrollLeft(this.buttonList));
        },

        maxScrollSize: function() {
            return Math.round(this.buttonList[0].scrollWidth - this.buttonList[0].clientWidth);
        },

        buttons: function() {
            var styles = ChatToolBar.styles;
            return this.buttonList ? this.buttonList.children(DOT + styles.button) : null;
        },

        buttonWidth: function() {
            return Math.round(this.buttons().last().outerWidth(true));
        },

        buttonsWidth: function() {
            var width = 0;

            if (this.buttons()) {
                width = this.buttonWidth() * this.buttons().length;
            }

            return width;
        },

        toggle: function(skipAnimation) {
            var animation = this.options.toolbar.animation;

            if (skipAnimation) {
                animation = extend(true, {}, NO_ANIMATION);
            }

            animation.expand.complete = this._animationCompleteExpand.bind(this);
            animation.collapse.complete = this._animationComplete.bind(this);

            if (this.element.is(VISIBLE)) {
                this.element.kendoStop().kendoAnimate(animation.collapse);
            } else {
                this.element.kendoStop().kendoAnimate(animation.expand);
            }

        },

        focus: function() {
            if (!this.element.is(VISIBLE)) {
                this.toggle();
            } else {
                this.buttons().not("[tabindex=-1]").trigger("focus");
            }
        }
    });

    extend(true, ChatToolBar, { styles: toolbarStyles });
    extend(kendo.chat, {
        ChatToolBar: ChatToolBar
    });
})(window.kendo.jQuery);

