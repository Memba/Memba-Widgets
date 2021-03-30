/** 
 * Kendo UI v2021.1.330 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2021 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.floatingactionbutton', [
        'kendo.core',
        'kendo.popup',
        'kendo.fx'
    ], f);
}(function () {
    var __meta__ = {
        id: 'floatingactionbutton',
        name: 'Floating Action Button',
        category: 'web',
        description: 'The Floating Action Button represents the primary action of a screen and provides the ability to display related actions.',
        depends: ['core']
    };
    (function ($, undefined) {
        var kendo = window.kendo, Widget = kendo.ui.Widget, NS = '.kendoFloatingActionButton', ui = kendo.ui, keys = kendo.keys, support = kendo.support, proxy = $.proxy, extend = $.extend, DOT = '.', ID = 'id', HIDDEN = 'k-hidden', LEFT = 'left', RIGHT = 'right', TOP = 'top', BOTTOM = 'bottom', CENTER = 'center', START = 'start', AUTO = 'auto', ARIA_DISABLED = 'aria-disabled', ARIA_HASPOPUP = 'aria-haspopup', ARIA_CONTROLS = 'aria-controls', ARIA_EXPANDED = 'aria-expanded', ARIA_LABEL = 'aria-label', ARIA_ROLE = 'role', ROLE_MENU = 'menu', ROLE_MENU_ITEM = 'menuitem', TABINDEX = 'tabindex', CLICK = 'click', EXPAND = 'expand', COLLAPSE = 'collapse', KEYDOWN = 'keydown', HOVEREVENTS = 'mouseenter' + NS + ' mouseleave' + NS;
        var cssClasses = {
            widget: 'k-widget k-fab',
            text: 'k-fab-text',
            icon: 'k-fab-icon',
            list: 'k-fab-items',
            listTop: 'k-fab-items-top',
            listBottom: 'k-fab-items-bottom',
            listTextLeft: 'k-text-left',
            listTextRight: 'k-text-right',
            item: 'k-fab-item',
            itemIcon: 'k-fab-item-icon',
            itemText: 'k-fab-item-text',
            popup: 'k-fab-popup',
            popupTransparent: 'k-popup-transparent',
            disabled: 'k-state-disabled',
            hover: 'k-state-hover',
            focus: 'k-state-focus'
        };
        var templates = {
            icon: '<span class="k-fab-icon k-icon k-i-#: icon #"></span>',
            text: '<span class="k-fab-text">#:text#</span>',
            item: '# if (text) { # ' + '<span class="k-fab-item-text" aria-hidden="true">#:text#</span>' + '# } #' + '# if (icon) { # ' + '<span class="k-fab-item-icon k-icon k-i-#: icon #"></span>' + '# } #'
        };
        var FloatingActionButton = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that._wrapper();
                that._content();
                that._appearance();
                that._renderList();
                that._initPopup();
                that._aria();
                that._attachEvents();
                kendo.notify(that);
            },
            options: {
                name: 'FloatingActionButton',
                icon: '',
                text: '',
                items: [],
                themeColor: 'primary',
                sizes: {
                    'small': 'sm',
                    'medium': 'md',
                    'large': 'lg'
                },
                size: 'medium',
                shape: 'pill',
                align: 'bottom end',
                alignOffset: {
                    x: 16,
                    y: 16
                },
                positionMode: 'fixed',
                visible: true,
                enable: true,
                enabled: true,
                _classNames: []
            },
            events: [
                CLICK,
                EXPAND,
                COLLAPSE
            ],
            _offsetMap: {
                start: LEFT,
                end: RIGHT,
                top: TOP,
                bottom: BOTTOM
            },
            _reversedOffsetMap: {
                start: RIGHT,
                end: LEFT
            },
            _getAlignment: function () {
                var that = this, alignPoints = that.options.align.split(' ');
                return {
                    vertical: alignPoints[0],
                    horizontal: alignPoints[1]
                };
            },
            _getOffset: function () {
                var that = this, options = that.options, isRtl = support.isRtl(that.element), alignment = that._getAlignment(), alignOffset = options.alignOffset, horizontalMap = isRtl ? that._reversedOffsetMap : that._offsetMap, horizontalMapReversed = isRtl ? that._offsetMap : that._reversedOffsetMap, offset = {};
                offset[that._offsetMap[alignment.vertical]] = alignOffset.y;
                offset[horizontalMap[alignment.horizontal]] = alignOffset.x;
                offset[horizontalMapReversed[alignment.horizontal]] = AUTO;
                return offset;
            },
            _wrapper: function () {
                var that = this;
                that.wrapper = that.element.addClass(cssClasses.widget);
                that.wrapper.css(that._getOffset());
            },
            _content: function () {
                var that = this, options = that.options, text = options.text, icon = options.icon;
                that.icon(icon);
                that.text(text !== '' ? text : that.element.text());
            },
            _appearance: function () {
                var that = this, options = that.options;
                that._themeColor = options.themeColor;
                that._sizes = options.sizes;
                that._size = options.size;
                that._shape = options.shape;
                that._align = options.align;
                that._positionMode = options.positionMode;
                that._visible = options.visible;
                that._enabled = options.enabled;
                that._updateClassNames();
            },
            _updateClassNames: function () {
                var that = this, classNames = [cssClasses.widget], keepClassNames = that.options._classNames, themeColor = that._themeColor, sizes = that._sizes, size = that._size, sizeAbbr = sizes[size] === undefined ? size : sizes[size], shape = that._shape, align = that._align, positionMode = that._positionMode, visible = that._visible, enabled = that._enabled;
                that.element.removeClass(function (index, className) {
                    if (className.indexOf('k-') === 0 && keepClassNames.indexOf(className) === -1) {
                        that.element.removeClass(className);
                    }
                });
                if (typeof themeColor === 'string' && themeColor !== '') {
                    classNames.push('k-fab-' + themeColor);
                }
                if (typeof size === 'string' && size !== '' && sizeAbbr !== '') {
                    classNames.push('k-fab-' + sizeAbbr);
                }
                if (typeof shape === 'string' && shape !== '') {
                    classNames.push('k-fab-' + shape);
                }
                if (typeof align === 'string' && align.split(' ').length == 2) {
                    classNames.push('k-' + align.replace(' ', '-'));
                }
                if (typeof positionMode === 'string' && positionMode !== '') {
                    classNames.push('k-pos-' + positionMode);
                }
                if (visible === false) {
                    classNames.push(HIDDEN);
                }
                if (enabled === false) {
                    classNames.push(cssClasses.disabled);
                }
                that.element.addClass(classNames.join(' '));
            },
            _aria: function () {
                var that = this, element = that.element, popup = that._popup, enabled = that._enabled;
                element.attr(ARIA_DISABLED, !enabled);
                element.attr(ARIA_HASPOPUP, popup ? true : null);
                element.attr(ARIA_EXPANDED, popup ? false : null);
                element.attr(ARIA_CONTROLS, popup ? popup.element.attr(ID) : null);
                if (popup) {
                    popup.element.attr(ARIA_ROLE, ROLE_MENU);
                    popup.element.find(DOT + cssClasses.item).attr(ARIA_ROLE, ROLE_MENU_ITEM).attr(TABINDEX, -1);
                }
            },
            _renderList: function () {
                var that = this, items = that.options.items, appendTarget = document.body, container = $('<ul>').addClass(cssClasses.list);
                if (!items.length) {
                    return;
                }
                that._list = container.appendTo(appendTarget);
                items.forEach(that._renderListItem.bind(that));
                container.addClass(that._getListOrientation());
            },
            _renderListItem: function (item) {
                var that = this, itemTemplate = kendo.template(templates.item), template = item.template ? kendo.template(item.template) : itemTemplate, itemWrapper = $('<li>').addClass(cssClasses.item);
                itemWrapper.addClass(that._getListItemsAlignment());
                itemWrapper.addClass(item.cssClass);
                itemWrapper.attr(ARIA_LABEL, item.title || item.label || '');
                that._enableListItem(itemWrapper, item.enabled);
                itemWrapper.append(template({
                    icon: item.icon,
                    text: item.label
                }));
                that._list.append(itemWrapper);
            },
            _enableListItem: function (item, value) {
                if (!item || value === undefined) {
                    return;
                }
                item.toggleClass(cssClasses.disabled, !value);
                if (value) {
                    item.removeAttr(ARIA_DISABLED);
                } else {
                    item.attr(ARIA_DISABLED, true);
                }
            },
            _getListOrientation: function () {
                var that = this, alignment = that._getAlignment();
                if (alignment.vertical === BOTTOM) {
                    return cssClasses.listTop;
                }
                return cssClasses.listBottom;
            },
            _getListItemsAlignment: function () {
                var that = this, isRtl = support.isRtl(that.element), alignment = that._getAlignment();
                if (alignment.horizontal === START || alignment.horizontal === CENTER) {
                    return !isRtl ? cssClasses.listTextLeft : cssClasses.listTextRight;
                }
                return !isRtl ? cssClasses.listTextRight : cssClasses.listTextLeft;
            },
            _getListItemOffset: function () {
                var that = this, element = that.element, icons = that._list.find(DOT + cssClasses.itemIcon), margin = 0;
                if (element.length && icons.length && !that.options.text) {
                    margin = element.outerWidth() / 2 - icons.first().outerWidth() / 2;
                }
                return margin;
            },
            _initPopup: function () {
                var that = this, element = that.element, options = that.options, list = that._list, positionOptions;
                if (!list) {
                    return;
                }
                positionOptions = that._getPopupPosition();
                that._popup = new ui.Popup(list, extend({}, options.popup, {
                    anchor: element,
                    appendTo: list.parent(),
                    copyAnchorStyles: false,
                    autosize: false,
                    collision: '',
                    position: positionOptions.position,
                    origin: positionOptions.origin,
                    animation: { open: { effects: kendo.parseEffects(ui.Popup.fn.options.animation.open.effects, positionOptions.flipped) } },
                    open: proxy(that._popupOpenHandler, that),
                    close: proxy(that._popupCloseHandler, that),
                    activate: proxy(that._popupExpandHandler, that),
                    deactivate: proxy(that._popupCollapseHandler, that)
                }));
                that._popup.element.addClass([
                    cssClasses.popup,
                    cssClasses.popupTransparent
                ].join(' '));
                that._setPopupId();
            },
            _setPopupId: function () {
                var that = this, id = that.element.attr(ID);
                if (!id) {
                    id = kendo.guid();
                }
                that._popup.element.attr(ID, id + '-list');
            },
            _getPopupPosition: function () {
                var that = this, align = that.options.align, isRtl = support.isRtl(that.element), start = isRtl ? RIGHT : LEFT, end = isRtl ? LEFT : RIGHT, origin, position, flipped = false;
                switch (align) {
                case 'top end':
                case 'middle end':
                    origin = 'bottom ' + end;
                    position = 'top ' + end;
                    break;
                case 'bottom start':
                case 'bottom center':
                    origin = 'top ' + start;
                    position = 'bottom ' + start;
                    flipped = true;
                    break;
                case 'bottom end':
                    origin = 'top ' + end;
                    position = 'bottom ' + end;
                    flipped = true;
                    break;
                default:
                    origin = 'bottom ' + start;
                    position = 'top ' + start;
                }
                return {
                    origin: origin,
                    position: position,
                    flipped: flipped
                };
            },
            _popupOpenHandler: function () {
                var that = this, popup = that._popup, containerOffset = this._getListItemOffset();
                this.element.attr(ARIA_EXPANDED, true);
                popup.element.css({ paddingLeft: containerOffset });
                popup.element.css({ paddingRight: containerOffset });
            },
            _popupCloseHandler: function () {
                this.element.attr(ARIA_EXPANDED, false);
            },
            _popupExpandHandler: function (ev) {
                if (this.trigger(EXPAND)) {
                    ev.preventDefault();
                }
                this._popup.element.find(DOT + cssClasses.item).first().focus();
            },
            _popupCollapseHandler: function (ev) {
                if (this.trigger(COLLAPSE)) {
                    ev.preventDefault();
                }
            },
            _attachEvents: function () {
                var that = this, popup = that._popup;
                that.element.bind(CLICK + NS, proxy(that._click, that));
                if (popup) {
                    popup.element.bind(CLICK + NS, DOT + cssClasses.item, proxy(that._itemClick, that)).bind(KEYDOWN + NS, DOT + cssClasses.item, proxy(that._itemKeydown, that)).on(HOVEREVENTS, DOT + cssClasses.item, proxy(that._itemHover, that));
                }
            },
            _click: function (ev) {
                var that = this, options = that.options, popup = that._popup;
                if (that.trigger(CLICK, { event: ev })) {
                    ev.preventDefault();
                    return;
                }
                if (!popup && !options.items.length) {
                    return;
                }
                if (!popup.visible()) {
                    popup.open();
                } else {
                    popup.close();
                }
            },
            _itemClick: function (ev) {
                var that = this, target = $(ev.target), item, itemOptions, handler, eventData;
                if (!target) {
                    return;
                }
                item = target.closest(DOT + cssClasses.item);
                if (item.length) {
                    itemOptions = that.options.items[item.index()];
                    handler = itemOptions.click && kendo.isFunction(itemOptions.click) ? itemOptions.click : null;
                    eventData = {
                        sender: that,
                        target: item,
                        item: itemOptions
                    };
                    if (handler) {
                        that.element.focus();
                        that._popup.close();
                        handler.call(that, eventData);
                    }
                }
            },
            _itemKeydown: function (ev) {
                var that = this, target = $(ev.target), keyCode = ev.keyCode, element = that.element, popup = that._popup, isBottom = that._getAlignment().vertical === BOTTOM, isDisabled = target.hasClass(cssClasses.disabled), listItems = that._list.children(), index = listItems.index(ev.target);
                if (!target.is(DOT + cssClasses.item)) {
                    return;
                }
                ev.preventDefault();
                if ((keyCode === keys.ENTER || keyCode === keys.SPACEBAR) && !isDisabled) {
                    that._itemClick(ev);
                }
                if (!isBottom && keyCode === keys.DOWN || isBottom && keyCode === keys.UP) {
                    if (index === listItems.length - 1) {
                        listItems.first().focus();
                        return;
                    }
                    $(listItems[index + 1]).focus();
                }
                if (!isBottom && keyCode === keys.UP || isBottom && keyCode === keys.DOWN) {
                    if (index === 0) {
                        listItems.last().focus();
                        return;
                    }
                    $(listItems[index - 1]).focus();
                }
                if (keyCode === keys.ESC || keyCode === keys.TAB) {
                    popup.close();
                    element.focus();
                }
                if (keyCode === keys.HOME) {
                    listItems.first().focus();
                }
                if (keyCode === keys.END) {
                    listItems.last().focus();
                }
            },
            _itemHover: function (ev) {
                var target = $(kendo.eventTarget(ev) || ev.target).closest(DOT + cssClasses.item);
                if (!target.hasClass(cssClasses.item)) {
                    return;
                }
                target.siblings().removeClass(cssClasses.hover);
                target.toggleClass(cssClasses.hover);
            },
            text: function (text) {
                var that = this, element = that.element, textElement = element.find(DOT + cssClasses.text), textTemplate = kendo.template(templates.text);
                if (arguments.length === 0 || text === undefined) {
                    return that._text;
                }
                that.options.text = that._text = kendo.htmlEncode(text);
                element.contents().filter(function () {
                    return this.nodeType === 3;
                }).remove();
                if (text === false || text === null || text === '') {
                    that._text = '';
                    textElement.remove();
                    return;
                }
                if (!textElement.length) {
                    textElement = $(textTemplate({ text: text })).appendTo(element);
                    return;
                }
                textElement.text(text);
            },
            icon: function (icon) {
                var that = this, element = that.element, iconElement = element.find(DOT + cssClasses.icon), iconTemplate = kendo.template(templates.icon);
                if (arguments.length === 0 || icon === undefined) {
                    return that._icon;
                }
                that.options.icon = that._icon = kendo.htmlEncode(icon);
                if (icon === false || icon === null || icon === '') {
                    that._icon = '';
                    iconElement.remove();
                    return;
                }
                iconElement.remove();
                element.prepend(iconTemplate({ icon: icon }));
            },
            themeColor: function (color) {
                var that = this;
                if (arguments.length === 0 || color === undefined) {
                    return that._themeColor;
                }
                that.options.themeColor = that._themeColor = color;
                that._updateClassNames();
            },
            shape: function (shape) {
                var that = this;
                if (arguments.length === 0 || shape === undefined) {
                    return that._shape;
                }
                that.options.shape = that._shape = shape;
                that._updateClassNames();
            },
            hide: function () {
                var that = this;
                that.options.visible = that._visible = false;
                that._updateClassNames();
            },
            show: function () {
                var that = this;
                that.options.visible = that._visible = true;
                that._updateClassNames();
            },
            enable: function (enable) {
                var that = this;
                if (enable === undefined) {
                    enable = true;
                }
                that.options.enabled = that._enabled = enable;
                that._updateClassNames();
                that.element.attr(ARIA_DISABLED, !enable);
            },
            setOptions: function (options) {
                var that = this;
                Widget.fn.setOptions.call(that, options);
                that.element.removeAttr('style');
                that.element.css(that._getOffset());
                that._content();
                that._appearance();
                if (options.align || options.items) {
                    that.element.off(NS);
                    that.destroyPopup();
                    that._renderList();
                    that._initPopup();
                    that._attachEvents();
                }
                that._aria();
            },
            destroyPopup: function () {
                var that = this;
                if (that._popup) {
                    that._popup.destroy();
                    that._popup = null;
                    that._list.off(NS);
                    that._list.remove();
                    that._list = null;
                }
            },
            destroy: function () {
                var that = this;
                that.destroyPopup();
                that.element.off(NS);
                Widget.fn.destroy.call(that);
            }
        });
        ui.plugin(FloatingActionButton);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));