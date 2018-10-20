/** 
 * Kendo UI v2018.3.1017 (http://www.telerik.com/kendo-ui)                                                                                                                                              
 * Copyright 2018 Telerik EAD. All rights reserved.                                                                                                                                                     
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('chat/view', [
        'kendo.core',
        'kendo.draganddrop'
    ], f);
}(function () {
    (function ($, undefined) {
        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var extend = $.extend;
        var proxy = $.proxy;
        var DOT = '.';
        var SPACE = ' ';
        var NS = '.kendoChat';
        var MESSAGE_GROUP_TEMPLATE = kendo.template('<div #:text# class="#=styles.messageGroup# #= url ? "" : styles.noAvatar #">' + '<p class="#=styles.author#">#:text#</p>' + '# if (url) { #' + '<img src="#=url#" alt="#:text#" class="#=styles.avatar#">' + '# } #' + '</div>');
        var SELF_MESSAGE_GROUP_TEMPLATE = kendo.template('<div me class="#=styles.messageGroup# #=styles.self# #= url ? "" : styles.noAvatar #">' + '# if (url) { #' + '<img src="#=url#" alt="#:text#" class="#=styles.avatar#">' + '# } #' + '</div>');
        var TEXT_MESSAGE_TEMPLATE = kendo.template('<div class="#=styles.message#">' + '<time class="#=styles.messageTime#">#= kendo.toString(kendo.parseDate(timestamp), "HH:mm:ss") #</time>' + '<div class="#=styles.bubble#">#:text#</div>' + '</div>');
        var TYPING_INDICATOR_TEMPLATE = kendo.template('<div class="#=styles.message#">' + '<div class="#=styles.bubble#">' + '<div class="#=styles.typingIndicator#">' + '<span></span><span></span><span></span>' + '</div>' + '</div>' + '</div>');
        var SUGGESTED_ACTIONS_TEMPLATE = kendo.template('<div class="#=styles.suggestedActions#">' + '# for (var i = 0; i < suggestedActions.length; i++) { #' + '<span class="#=styles.suggestedAction#" data-value="#:suggestedActions[i].value#">#:suggestedActions[i].title#</span>' + '# } #' + '</div>');
        var HERO_CARD_TEMPLATE = kendo.template('<div class="#=styles.card# #=styles.cardRich#">' + '# if (typeof images !== "undefined" && images.length > 0) { #' + '<img src="#:images[0].url#" alt="#:images[0].alt#" class="#=styles.cardImage#" />' + '# } #' + '<div class="#=styles.cardBody#">' + '# if (typeof title !== "undefined") { #' + '<h5 class="#=styles.cardTitle#">#:title#</h5>' + '# } #' + '# if (typeof subtitle !== "undefined") { #' + '<h6 class="#=styles.cardSubtitle#">#:subtitle#</h6>' + '# } #' + '# if (typeof text !== "undefined") { #' + '<p>#:text#</p>' + '# } #' + '</div>' + '# if (typeof buttons !== "undefined" && buttons.length > 0) { #' + '<div class="#=styles.cardActions# #=styles.cardActionsVertical#">' + '# for (var i = 0; i < buttons.length; i++) { #' + '<span class="#=styles.cardAction#"><span class="#=styles.button# #=styles.buttonPrimary#" data-value="#:buttons[i].value#">#:buttons[i].title#</span></span>' + '# } #' + '</div>' + '# } #' + '</div>');
        kendo.chat = {
            Templates: {},
            Components: {}
        };
        kendo.chat.registerTemplate = function (templateName, template) {
            kendo.chat.Templates[templateName] = kendo.template(template);
        };
        kendo.chat.getTemplate = function (templateName) {
            return kendo.chat.Templates[templateName] || TEXT_MESSAGE_TEMPLATE;
        };
        kendo.chat.registerTemplate('text', TEXT_MESSAGE_TEMPLATE);
        kendo.chat.registerTemplate('message', TEXT_MESSAGE_TEMPLATE);
        kendo.chat.registerTemplate('typing', TYPING_INDICATOR_TEMPLATE);
        kendo.chat.registerTemplate('suggestedAction', SUGGESTED_ACTIONS_TEMPLATE);
        kendo.chat.registerTemplate('heroCard', HERO_CARD_TEMPLATE);
        kendo.chat.registerTemplate('application/vnd.microsoft.card.hero', HERO_CARD_TEMPLATE);
        kendo.chat.registerComponent = function (componentName, component) {
            kendo.chat.Components[componentName] = component;
        };
        kendo.chat.getComponent = function (componentName) {
            return kendo.chat.Components[componentName] || null;
        };
        var Component = kendo.chat.Component = kendo.Class.extend({
            init: function (options, view) {
                this.element = $('<div></div>');
                this.options = options;
                this.view = view;
            },
            destroy: function () {
                kendo.destroy(this.element);
            }
        });
        var Calendar = Component.extend({
            init: function (options, view) {
                Component.fn.init.call(this, options, view);
                this.element.kendoCalendar({
                    change: function () {
                        view.trigger('suggestedAction', {
                            text: kendo.toString(this.value(), 'd'),
                            type: 'message'
                        });
                    }
                });
            },
            destroy: function () {
            }
        });
        kendo.chat.registerComponent('calendar', Calendar);
        var viewStyles = {
            wrapper: 'k-widget k-chat',
            messageList: 'k-avatars',
            messageListContent: 'k-message-list-content',
            messageTime: 'k-message-time',
            messageGroup: 'k-message-group',
            message: 'k-message',
            only: 'k-only',
            first: 'k-first',
            middle: 'k-middle',
            last: 'k-last',
            author: 'k-author',
            avatar: 'k-avatar',
            noAvatar: 'k-no-avatar',
            self: 'k-alt',
            button: 'k-button',
            iconButton: 'k-button-icon',
            buttonPrimary: 'k-flat k-primary',
            scrollButtonIcon: 'k-icon',
            scrollButtonIconLeft: 'k-i-arrow-chevron-left',
            scrollButtonIconRight: 'k-i-arrow-chevron-right',
            typingIndicator: 'k-typing-indicator',
            bubble: 'k-bubble',
            suggestedActions: 'k-quick-replies',
            suggestedAction: 'k-quick-reply',
            cardWrapper: 'k-card-container',
            cardDeckScrollWrap: 'k-card-deck-scrollwrap',
            cardDeck: 'k-card-deck',
            cardList: 'k-card-list',
            card: 'k-card',
            cardRich: 'k-card-type-rich',
            cardBody: 'k-card-body',
            cardImage: 'k-card-image',
            cardTitle: 'k-card-title',
            cardSubtitle: 'k-card-subtitle',
            cardActions: 'k-card-actions',
            cardActionsVertical: 'k-card-actions-vertical',
            cardAction: 'k-card-action',
            selected: 'k-state-selected'
        };
        var ChatView = kendo.chat.ChatView = Widget.extend({
            init: function (element, options) {
                Widget.fn.init.call(this, element, options);
                this._list();
                this._lastSender = null;
                this._attachEvents();
                this._scrollable();
            },
            events: [],
            options: {},
            destroy: function () {
                Widget.fn.destroy.call(this);
                if (this._scrollDraggable) {
                    this._scrollDraggable.destroy();
                }
                this.element.empty();
                this.element.off(NS);
                this.list = null;
                this._lastSender = null;
            },
            _list: function () {
                var viewStyles = ChatView.styles;
                this.element.addClass(viewStyles.messageList).attr('aria-live', 'polite');
                this.list = $('<div>').addClass(viewStyles.messageListContent).appendTo(this.element);
            },
            _attachEvents: function () {
                var styles = ChatView.styles;
                this.element.on('click' + NS, proxy(this._listClick, this)).on('click' + NS, DOT + styles.message, proxy(this._messageClick, this)).on('click' + NS, DOT + styles.suggestedAction, proxy(this._suggestedActionClick, this)).on('click' + NS, DOT + styles.cardAction + SPACE + DOT + styles.button, proxy(this._cardActionClick, this));
            },
            _scrollable: function () {
                var viewStyles = ChatView.styles;
                this.element.on('click' + NS, DOT + viewStyles.cardDeckScrollWrap + SPACE + DOT + viewStyles.button, proxy(this._scrollButtonClick, this));
            },
            _scrollButtonClick: function (e) {
                var viewStyles = ChatView.styles;
                var button = $(e.currentTarget);
                var scrollToLeft = button.find(DOT + viewStyles.scrollButtonIconLeft).length !== 0;
                var scrollContainer = button.siblings(DOT + viewStyles.cardDeck);
                var lastCard = scrollContainer.find(DOT + viewStyles.card).last();
                var cardWidth = lastCard.outerWidth(true);
                if (scrollToLeft) {
                    scrollContainer.scrollLeft(scrollContainer.scrollLeft() - cardWidth);
                } else {
                    scrollContainer.scrollLeft(scrollContainer.scrollLeft() + cardWidth);
                }
            },
            getTemplate: function (templateName) {
                return kendo.chat.getTemplate(templateName);
            },
            getComponent: function (type) {
                return kendo.chat.getComponent(type);
            },
            renderMessage: function (message, sender) {
                if (!message.timestamp) {
                    message.timestamp = new Date();
                }
                var bubbleElement = this._renderTemplate(message.type, message);
                this._renderBubble(bubbleElement, sender);
                if (message.type !== 'typing') {
                    this._lastSender = sender.id;
                }
            },
            renderSuggestedActions: function (suggestedActions) {
                this._removeSuggestedActions();
                var element = this._renderTemplate('suggestedAction', { suggestedActions: suggestedActions });
                this.list.append(element);
                this._scrollToBottom();
            },
            renderAttachments: function (options) {
                var wrapper = this._renderAttachmentWrapper(options.attachmentLayout);
                var cardContainer = options.attachmentLayout === 'carousel' ? wrapper.find(DOT + ChatView.styles.cardDeck) : wrapper;
                var attachments = options.attachments;
                if (!attachments.length) {
                    return;
                }
                for (var i = 0; i < attachments.length; i++) {
                    var cardElement = this._renderTemplate(attachments[i].contentType, attachments[i].content);
                    cardContainer.append(cardElement);
                }
                this._removeSuggestedActions();
                this._removeTypingIndicator();
                this.list.append(wrapper);
                this._lastSender = null;
            },
            renderComponent: function (type) {
                var componentType = this.getComponent(type);
                var component = new componentType({}, this);
                this.list.append(component.element);
                this._scrollToBottom();
            },
            _removeTypingIndicator: function () {
                var viewStyles = ChatView.styles;
                var indicator = this.list.find(DOT + viewStyles.typingIndicator);
                if (indicator.length) {
                    var indicatorMessage = indicator.parents(DOT + viewStyles.message).first();
                    var indicatorGroup = indicator.parents(DOT + viewStyles.messageGroup).first();
                    indicatorMessage.remove();
                    if (!indicatorGroup.find(DOT + viewStyles.message).length && !indicatorGroup.find(DOT + viewStyles.cardDeck).length && !indicatorGroup.find(DOT + viewStyles.cardWrapper).length) {
                        indicatorGroup.remove();
                    }
                }
            },
            _renderAttachmentWrapper: function (layout) {
                var viewStyles = ChatView.styles;
                var wrapper = $('<div>');
                if (layout === 'carousel') {
                    wrapper.addClass(viewStyles.cardDeckScrollWrap);
                    var buttonLeft = this._renderScrollButton(viewStyles.scrollButtonIconLeft);
                    wrapper.append(buttonLeft);
                    wrapper.append($('<div>').addClass(viewStyles.cardDeck));
                    var buttonRight = this._renderScrollButton(viewStyles.scrollButtonIconRight);
                    wrapper.append(buttonRight);
                } else {
                    wrapper.addClass(viewStyles.cardList);
                }
                return wrapper;
            },
            _renderScrollButton: function (directionClass) {
                var viewStyles = ChatView.styles;
                return $('<button>').addClass(viewStyles.button).addClass(viewStyles.iconButton).append($('<span>').addClass(viewStyles.scrollButtonIcon).addClass(directionClass));
            },
            _removeSuggestedActions: function () {
                this.list.find(DOT + ChatView.styles.suggestedActions).remove();
            },
            _listClick: function (e) {
                var styles = ChatView.styles;
                var targetElement = $(e.target);
                if (targetElement.hasClass(styles.message) || targetElement.parents(DOT + styles.message).length) {
                    return;
                }
                this._clearSelection();
            },
            _messageClick: function (e) {
                this._clearSelection();
                $(e.currentTarget).addClass(ChatView.styles.selected);
            },
            _suggestedActionClick: function (e) {
                var text = $(e.target).data('value') || '';
                this.trigger('actionClick', { text: text });
                this._removeSuggestedActions();
            },
            _cardActionClick: function (e) {
                var text = $(e.target).data('value') || '';
                this.trigger('actionClick', { text: text });
            },
            _renderBubble: function (bubbleElement, sender) {
                this._removeSuggestedActions();
                this._removeTypingIndicator();
                var group = this._getMessageGroup(sender);
                this._appendToGroup(group, bubbleElement);
                this._scrollToBottom();
            },
            _renderTemplate: function (type, options) {
                var componentType = this.getComponent(type);
                var element;
                if (componentType) {
                    var component = new componentType(options, this);
                    element = component.element;
                } else {
                    var template = this.getTemplate(type);
                    var templateOptions = extend(true, {}, options, { styles: ChatView.styles });
                    element = $(template(templateOptions));
                }
                return element;
            },
            _getMessageGroup: function (sender) {
                var viewStyles = ChatView.styles;
                var template = this._getMessageGroupTemplate(sender);
                var group;
                if (sender.id === this._lastSender && this._lastSender !== null) {
                    group = this.list.find(DOT + viewStyles.messageGroup).last();
                    if (group.length) {
                        return group;
                    }
                }
                return $(template({
                    text: sender.name,
                    url: sender.iconUrl,
                    styles: viewStyles
                })).appendTo(this.list);
            },
            _getMessageGroupTemplate: function (sender) {
                var isOwnMessage = sender.id === this.options.user.id;
                var template = isOwnMessage ? SELF_MESSAGE_GROUP_TEMPLATE : MESSAGE_GROUP_TEMPLATE;
                return template;
            },
            _appendToGroup: function (group, messageElement) {
                var viewStyles = ChatView.styles;
                var children = group.find(DOT + viewStyles.message);
                var childrenCount = children.length;
                messageElement.addClass(childrenCount === 0 ? viewStyles.only : viewStyles.last);
                children.filter(DOT + viewStyles.only).removeClass(viewStyles.only).addClass(viewStyles.first);
                children.filter(DOT + viewStyles.last).removeClass(viewStyles.last).addClass(viewStyles.middle);
                group.append(messageElement);
            },
            _clearSelection: function () {
                var selectedClass = ChatView.styles.selected;
                this.element.find(DOT + selectedClass).removeClass(selectedClass);
            },
            _scrollToBottom: function () {
                this.element.scrollTop(this.element.prop('scrollHeight'));
            }
        });
        extend(true, ChatView, { styles: viewStyles });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('chat/messageBox', ['kendo.core'], f);
}(function () {
    (function ($, undefined) {
        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var extend = $.extend;
        var proxy = $.proxy;
        var DOT = '.';
        var NS = '.kendoChat';
        var keys = kendo.keys;
        var SEND_ICON = '<svg version="1.1" ixmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve"><path d="M0,14.3c-0.1,0.6,0.3,0.8,0.8,0.6l14.8-6.5c0.5-0.2,0.5-0.6,0-0.8L0.8,1.1C0.3,0.9-0.1,1.1,0,1.7l0.7,4.2C0.8,6.5,1.4,7,1.9,7.1l8.8,0.8c0.6,0.1,0.6,0.1,0,0.2L1.9,8.9C1.4,9,0.8,9.5,0.7,10.1L0,14.3z"/></svg>';
        var TOGGLE_ICON = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g>   <path d="M128,240c0-26.4-21.6-48-48-48s-48,21.6-48,48s21.6,48,48,48S128,266.4,128,240z"/>   <path d="M192,240c0,26.4,21.6,48,48,48c26.4,0,48-21.6,48-48s-21.6-48-48-48C213.6,192,192,213.6,192,240z"/>   <path d="M352,240c0,26.4,21.6,48,48,48c26.4,0,48-21.6,48-48s-21.6-48-48-48C373.6,192,352,213.6,352,240z"/></g></svg>';
        var messageBoxStyles = {
            input: 'k-input',
            button: 'k-button',
            buttonFlat: 'k-flat',
            buttonIcon: 'k-button-icon',
            buttonSend: 'k-button-send',
            buttonToggle: 'k-button-toggle',
            iconAdd: 'k-icon k-i-add',
            hidden: 'k-hidden'
        };
        var ChatMessageBox = kendo.chat.ChatMessageBox = Widget.extend({
            init: function (element, options) {
                Widget.fn.init.call(this, element, options);
                this._wrapper();
                this._attachEvents();
                this._typing = false;
            },
            events: [],
            options: { messages: { placeholder: 'Type a message...' } },
            destroy: function () {
                Widget.fn.destroy.call(this);
                if (this.input) {
                    this.input.off(NS);
                    this.input.remove();
                    this.input = null;
                }
                this.element.off(NS);
                this.element.empty();
            },
            _wrapper: function () {
                var styles = ChatMessageBox.styles;
                var options = this.options;
                var messages = options.messages;
                var inputId = 'inputId_' + kendo.guid();
                $('<label>').addClass(styles.hidden).html(messages.placeholder).attr('for', inputId).appendTo(this.element);
                this.input = $('<input type=\'text\'>').addClass(styles.input).attr('id', inputId).attr('placeholder', messages.placeholder).appendTo(this.element);
                if (options.toolbar && options.toolbar.toggleable && options.toolbar.buttons) {
                    $('<button>').addClass(styles.button).addClass(styles.buttonFlat).addClass(styles.buttonIcon).addClass(styles.buttonToggle).attr('type', 'button').append($(TOGGLE_ICON)).appendTo(this.element);
                }
                $('<button>').addClass(styles.button).addClass(styles.buttonFlat).addClass(styles.buttonIcon).addClass(styles.buttonSend).append($(SEND_ICON)).appendTo(this.element);
            },
            _attachEvents: function () {
                var styles = ChatMessageBox.styles;
                this.input.on('keydown' + NS, proxy(this._keydown, this)).on('input' + NS, proxy(this._input, this)).on('focusout' + NS, proxy(this._inputFocusout, this));
                this.element.on('click' + NS, DOT + styles.buttonSend, proxy(this._buttonClick, this));
                this.element.on('click' + NS, DOT + styles.buttonToggle, proxy(this._toggleToolbar, this));
            },
            _input: function () {
                var currentValue = this.input.val();
                var start = currentValue.length > 0;
                this._triggerTyping(start);
            },
            _keydown: function (e) {
                var key = e.keyCode;
                switch (key) {
                case keys.ENTER:
                    e.preventDefault();
                    this._sendMessage();
                    break;
                }
            },
            _buttonClick: function (e) {
                e.preventDefault();
                this._sendMessage();
            },
            _sendMessage: function () {
                var value = this.input.val();
                if (!value.length) {
                    return;
                }
                this._triggerTyping(false);
                var args = { text: value };
                this.trigger('sendMessage', args);
                this.input.val('');
            },
            _inputFocusout: function () {
                this._triggerTyping(false);
            },
            _triggerTyping: function (start) {
                if (start) {
                    if (!this._typing) {
                        this.trigger('typingStart', {});
                        this._typing = true;
                    }
                } else {
                    if (this._typing) {
                        this.trigger('typingEnd', {});
                        this._typing = false;
                    }
                }
            },
            _toggleToolbar: function (ev) {
                this.trigger('toggleToolbar', { originalEvent: ev });
            }
        });
        extend(true, ChatMessageBox, { styles: messageBoxStyles });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('chat/toolbar', ['kendo.core'], f);
}(function () {
    (function ($, undefined) {
        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var extend = $.extend;
        var proxy = $.proxy;
        var DOT = '.';
        var NS = '.kendoChat';
        var DATA_K_BUTTON_NAME = 'kButtonName';
        var SCROLL_LEFT_NAME = 'chatToolbarScrollLeft';
        var SCROLL_RIGHT_NAME = 'chatToolbarScrollRight';
        var VISIBLE = ':visible';
        var DEFAULT_ANIMATION = {
            effects: 'expand:vertical',
            duration: 200
        };
        var NO_ANIMATION = {
            expand: { show: true },
            collapse: { hide: true }
        };
        var toolbarStyles = {
            button: 'k-button',
            buttonFlat: 'k-flat',
            buttonList: 'k-button-list',
            scrollButton: 'k-scroll-button',
            scrollButtonLeft: 'k-scroll-button-left',
            scrollButtonRight: 'k-scroll-button-right',
            scrollButtonLeftIcon: 'k-icon k-i-arrow-chevron-left',
            scrollButtonRightIcon: 'k-icon k-i-arrow-chevron-right',
            buttonIcon: 'k-button-icon'
        };
        var ChatToolBar = kendo.chat.ChatToolBar = Widget.extend({
            init: function (element, options) {
                options = extend({}, options, { name: 'ChatToolbar' });
                var toolbarOptions = options.toolbar;
                var buttonsDefined = toolbarOptions.buttons && toolbarOptions.buttons.length;
                Widget.fn.init.call(this, element, options);
                if (buttonsDefined) {
                    this._createButtonList();
                }
                if (buttonsDefined && toolbarOptions.scrollable && this.buttonsWidth() > this.element.width()) {
                    this._initScrolling();
                }
                this._setupAnimation();
                if (toolbarOptions.toggleable) {
                    this.toggle(true);
                }
                this.element.on('click' + NS, proxy(this._onClick, this));
            },
            events: ['click'],
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.element.off(NS);
                this.element.empty();
            },
            _createButtonList: function () {
                var that = this;
                var styles = ChatToolBar.styles;
                var buttons = that.options.toolbar.buttons;
                var buttonList = $('<div class=\'' + styles.buttonList + '\'></div>');
                for (var i = 0; i < buttons.length; i++) {
                    var button = that._createButton(buttons[i]);
                    buttonList.append(button);
                }
                buttonList.appendTo(this.element);
                this.buttonList = buttonList;
            },
            _createButton: function (btnOptions) {
                var styles = ChatToolBar.styles;
                var buttonElm = $('<button>');
                if (typeof btnOptions === 'string') {
                    btnOptions = { name: btnOptions };
                }
                buttonElm.attr(btnOptions.attr || {}).attr('title', btnOptions.text).attr('type', 'button').addClass(btnOptions.name).data(DATA_K_BUTTON_NAME, btnOptions.name).addClass(styles.button);
                if (btnOptions.iconClass) {
                    buttonElm.addClass(styles.buttonIcon);
                    buttonElm.prepend('<span class=\'' + btnOptions.iconClass + '\'></span>');
                }
                return buttonElm;
            },
            _onClick: function (ev) {
                var styles = ChatToolBar.styles;
                var target = $(ev.target).closest(DOT + styles.button);
                if (target.is(DOT + styles.scrollButton) && !this._scrolling) {
                    this._scroll(target.data(DATA_K_BUTTON_NAME));
                }
                if (target.data(DATA_K_BUTTON_NAME)) {
                    this.trigger('click', {
                        button: target[0],
                        name: target.data(DATA_K_BUTTON_NAME),
                        originalEvent: ev
                    });
                }
            },
            _initScrolling: function () {
                var styles = ChatToolBar.styles;
                this.scrollButtonLeft = this._createButton({
                    name: SCROLL_LEFT_NAME,
                    iconClass: styles.scrollButtonLeftIcon,
                    attr: { 'class': styles.scrollButton + ' ' + styles.scrollButtonLeft }
                });
                this.scrollButtonRight = this._createButton({
                    name: SCROLL_RIGHT_NAME,
                    iconClass: styles.scrollButtonRightIcon,
                    attr: { 'class': styles.scrollButton + ' ' + styles.scrollButtonRight }
                });
                this.element.prepend(this.scrollButtonLeft);
                this.element.append(this.scrollButtonRight);
                this._refreshScrollButtons();
                this.element.on('keydown' + NS, proxy(this._refreshScrollButtons, this));
            },
            _scroll: function (commandName) {
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
                that.buttonList.scrollLeft(scrollValue);
                that._refreshScrollButtons(scrollValue);
            },
            _refreshScrollButtons: function (value) {
                var maxScrollSize = this.maxScrollSize();
                var currentScrollLeft = value === undefined || isNaN(parseInt(value, 10)) ? this.currentScrollLeft() : value;
                if (!this.scrollButtonLeft && !this.scrollButtonRight) {
                    return;
                }
                this.scrollButtonLeft.toggle(currentScrollLeft !== 0);
                this.scrollButtonRight.toggle(currentScrollLeft !== maxScrollSize);
            },
            _setupAnimation: function () {
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
            _animationComplete: function () {
                this._refreshScrollButtons();
            },
            currentScrollLeft: function () {
                return Math.round(this.buttonList.scrollLeft());
            },
            maxScrollSize: function () {
                return Math.round(this.buttonList[0].scrollWidth - this.buttonList[0].clientWidth);
            },
            buttons: function () {
                var styles = ChatToolBar.styles;
                return this.buttonList ? this.buttonList.children(DOT + styles.button) : null;
            },
            buttonWidth: function () {
                return Math.round(this.buttons().last().outerWidth(true));
            },
            buttonsWidth: function () {
                var width = 0;
                if (this.buttons()) {
                    width = this.buttonWidth() * this.buttons().length;
                }
                return width;
            },
            toggle: function (skipAnimation) {
                var animation = this.options.toolbar.animation;
                if (skipAnimation) {
                    animation = extend(true, {}, NO_ANIMATION);
                }
                animation.expand.complete = proxy(this._animationComplete, this);
                animation.collapse.complete = proxy(this._animationComplete, this);
                if (this.element.is(VISIBLE)) {
                    this.element.kendoStop().kendoAnimate(animation.collapse);
                } else {
                    this.element.kendoStop().kendoAnimate(animation.expand);
                }
            }
        });
        extend(true, ChatToolBar, { styles: toolbarStyles });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('kendo.chat', [
        'chat/view',
        'chat/messageBox',
        'chat/toolbar'
    ], f);
}(function () {
    var __meta__ = {
        id: 'chat',
        name: 'Chat',
        category: 'web',
        description: 'The Chat component.',
        depends: [
            'core',
            'draganddrop'
        ]
    };
    (function ($, undefined) {
        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var extend = $.extend;
        var DOT = '.';
        var chatStyles = {
            wrapper: 'k-widget k-chat',
            canvas: 'k-chat-canvas',
            viewWrapper: 'k-message-list',
            messageBoxWrapper: 'k-message-box',
            toolbarBoxWrapper: 'k-toolbar-box'
        };
        var Chat = Widget.extend({
            init: function (element, options, events) {
                Widget.fn.init.call(this, element, options);
                if (events) {
                    this._events = events;
                }
                this._user();
                this._wrapper();
                this._view();
                this._messageBox();
                if (options && options.toolbar && options.toolbar.buttons) {
                    this._toolbar();
                }
                kendo.notify(this);
            },
            events: [
                'typingStart',
                'typingEnd',
                'post',
                'sendMessage',
                'actionClick',
                'toolClick'
            ],
            options: {
                user: {
                    name: 'User',
                    iconUrl: ''
                },
                name: 'Chat',
                messages: { placeholder: 'Type a message...' },
                toolbar: false
            },
            setOptions: function (options) {
                this._setEvents(options);
                $.extend(true, this.options, options);
                if (this.toolbar && 'toolbar' in options) {
                    this.toolbar.destroy();
                    this.toolbar = null;
                }
                if (this.messageBox) {
                    this.messageBox.unbind();
                    this.messageBox.destroy();
                    this.messageBox = null;
                }
                this._messageBox();
                if ('toolbar' in options) {
                    this._resetToolbarButtons(options);
                    this._toolbar();
                }
            },
            _resetToolbarButtons: function (options) {
                var toolbarBoxWrapper = this.wrapper.find(DOT + chatStyles.toolbarBoxWrapper);
                if (!toolbarBoxWrapper.is(':visible')) {
                    toolbarBoxWrapper.show();
                }
                if ('buttons' in options.toolbar) {
                    this.options.toolbar.buttons = options.toolbar.buttons;
                }
            },
            destroy: function () {
                if (this.view) {
                    this.view.unbind();
                    this.view.destroy();
                    this.view = null;
                }
                if (this.messageBox) {
                    this.messageBox.unbind();
                    this.messageBox.destroy();
                    this.messageBox = null;
                }
                if (this.toolbar) {
                    this.toolbar.destroy();
                    this.toolbar = null;
                }
                Widget.fn.destroy.call(this);
            },
            _user: function () {
                this.options.user.id = kendo.guid();
            },
            getUser: function () {
                return extend(true, {}, this.options.user);
            },
            _wrapper: function () {
                var chatStyles = Chat.styles;
                var options = this.options;
                var height = options.height;
                var width = options.width;
                var uiElements = '<div class=\'' + chatStyles.viewWrapper + '\'></div>' + '<div class=\'' + chatStyles.messageBoxWrapper + '\'></div>' + '<div class=\'' + chatStyles.toolbarBoxWrapper + '\' role=\'toolbar\' style=\'display:none;\'></div>';
                this.wrapper = this.element.addClass(chatStyles.wrapper).append(uiElements);
                if (options.toolbar && options.toolbar.buttons && options.toolbar.buttons.length) {
                    this.wrapper.find(DOT + chatStyles.toolbarBoxWrapper).show();
                }
                if (height) {
                    this.wrapper.height(height);
                }
                if (width) {
                    this.wrapper.css('max-width', width);
                }
            },
            _view: function () {
                var that = this;
                var chatStyles = Chat.styles;
                var options = extend(true, {}, this.options);
                var element = this.wrapper.find(DOT + chatStyles.viewWrapper + '');
                this.view = new kendo.chat.ChatView(element, options);
                this.view.bind('actionClick', function (args) {
                    that.trigger('actionClick', args);
                    that.postMessage(args.text);
                });
            },
            _messageBox: function () {
                var that = this;
                var chatStyles = Chat.styles;
                var options = extend(true, {}, this.options);
                var element = this.wrapper.find(DOT + chatStyles.messageBoxWrapper + '');
                this.messageBox = new kendo.chat.ChatMessageBox(element, options);
                this.messageBox.bind('typingStart', function (args) {
                    that.trigger('typingStart', args);
                }).bind('typingEnd', function (args) {
                    that.trigger('typingEnd', args);
                }).bind('sendMessage', function (args) {
                    that.trigger('sendMessage', args);
                    that.postMessage(args.text);
                }).bind('toggleToolbar', function () {
                    that.toggleToolbar();
                });
            },
            _toolbar: function () {
                var that = this;
                var chatStyles = Chat.styles;
                var options = extend(true, {}, that.options);
                var element = that.wrapper.find(DOT + chatStyles.toolbarBoxWrapper + '');
                if (options.toolbar.scrollable === undefined) {
                    this.options.toolbar.scrollable = options.toolbar.scrollable = true;
                }
                if (options.toolbar.toggleable === undefined) {
                    this.options.toolbar.toggleable = options.toolbar.toggleable = false;
                }
                that.toolbar = new kendo.chat.ChatToolBar(element, options);
                that.toolbar.bind('click', function (ev) {
                    that.trigger('toolClick', {
                        sender: that,
                        name: ev.name,
                        button: ev.button,
                        messageBox: that.messageBox.input[0],
                        originalEvent: ev.originalEvent
                    });
                });
            },
            postMessage: function (message) {
                var postArgs = extend(true, {}, {
                    text: message,
                    type: 'message',
                    timestamp: new Date(),
                    from: this.getUser()
                });
                this.trigger('post', postArgs);
                this.renderMessage(postArgs, postArgs.from);
            },
            renderMessage: function (message, sender) {
                this.view.renderMessage(message, sender);
            },
            renderSuggestedActions: function (suggestedActions) {
                this.view.renderSuggestedActions(suggestedActions);
            },
            renderAttachments: function (options, sender) {
                this.view.renderAttachments(options, sender);
            },
            toggleToolbar: function (skipAnimation) {
                this.toolbar.toggle(skipAnimation);
            }
        });
        kendo.ui.plugin(Chat);
        extend(true, Chat, { styles: chatStyles });
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));