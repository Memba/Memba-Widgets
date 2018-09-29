/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import tools from '../tools/tools.es6';
import BaseTool from '../tools/tools.base.es6';

const {
    attr,
    data: { DataSource },
    format,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.splitbutton');

const NS = '.kendoSplitButton';
const WIDGET_CLASS = /* 'k-widget */ 'kj-splitbutton';

const keys = kendo.keys;
const outerWidth = kendo._outerWidth;

const UNDEFINED = 'undefined';
const CLICK = 'click';
const KEYDOWN = 'keydown';
const DISABLED_CLASS = 'k-state-disabled';
const BUTTON_TMPL = '<a class="k-button">{0}</a>';
// var ARROW_BUTTON_TMPL = '<a class="k-button kj-splitbutton-arrow"><span class="' + (options.mobile ? 'km-icon km-arrowdown' : 'k-icon k-i-arrow-60-down') + '"></span></a>';
const ARROW_BUTTON_TMPL =
    '<a class="k-button kj-splitbutton-arrow"><span class="k-icon k-i-arrow-60-down"></span></a>';
const ICON_TMPL = '<span class="k-icon k-i-{0}"></span>';
const IMAGE_TMPL = '<img alt="icon" class="k-image" src="{0}">';
const POPUP_TMPL = '<ul class="k-list-container k-split-container"></ul>';
const BUTTON_SELECTOR = 'a.k-button';
const ARROW_BUTTON_SELECTOR = '.kj-splitbutton-arrow';

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

/* If a strict mode function is executed using function invocation, its 'this' value will be undefined. */
/* jshint -W040 */

/**
 * adjustPopupWidth can be found in kendo.toolbar.js
 * Note: It does not make sense to add it as a widget method, because
 * this actually refers to this.popup
 */
function adjustPopupWidth() {
    const anchor = this.options.anchor;
    const computedWidth = outerWidth(anchor);
    let width;
    kendo.wrap(this.element).addClass('k-split-wrapper');
    if (this.element.css('box-sizing') !== 'border-box') {
        width =
            computedWidth - (outerWidth(this.element) - this.element.width());
    } else {
        width = computedWidth;
    }
    this.element.css({
        fontFamily: anchor.css('font-family'),
        'min-width': width
    });
}

/* jshint +W040 */

/**
function toggleActive(e) {
    if (!e.target.is('.k-toggle-button')) {
        e.target.toggleClass(STATE_ACTIVE, e.type == 'press');
    }
}

function actionSheetWrap(element) {
    element = $(element);
    return element.hasClass('km-actionsheet') ? element.closest('.km-popup-wrapper') : element.addClass('km-widget km-actionsheet').wrap('<div class="km-actionsheet-wrapper km-actionsheet-tablet km-widget km-popup"></div>').parent().wrap('<div class="km-popup-wrapper k-popup"></div>').parent();
}
*/

/**
 * findFocusableSibling can be found in kendo.toolbar.js
 * @param element
 * @param dir
 * @returns {*}
 */
function findFocusableSibling(element, dir) {
    const getSibling = dir === 'next' ? $.fn.next : $.fn.prev;
    const getter = dir === 'next' ? $.fn.first : $.fn.last;
    const candidate = getSibling.call(element);
    if (candidate.is(':kendoFocusable') || !candidate.length) {
        return candidate;
    }
    if (candidate.find(':kendoFocusable').length) {
        return getter.call(candidate.find(':kendoFocusable'));
    }
    return findFocusableSibling(candidate, dir);
}

/**
 * SplitButton
 * @class SplitButton
 * @extends Widget
 */
const SplitButton = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        this.ns = NS;
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._layout();
        this.enable(
            this.element.prop('disabled') ? false : !!this.options.enabled
        );
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'SplitButton',
        command: '',
        enabled: true,
        icon: '',
        imageUrl: '',
        text: 'Button',
        menuButtons: []
    },

    /**
     * Events
     * @property events
     */
    events: [CLICK],

    /**
     * Builds the widget layout
     * @method _layout
     * @private
     */
    _layout() {
        const element = this.element;
        const options = this.options;
        if (!element.is('div')) {
            throw new Error('Please instantiate a split button with a div');
        }
        this.wrapper = element;
        element.addClass(WIDGET_CLASS).prop('tabIndex', 0);
        const icon = options.icon
            ? kendo.format(ICON_TMPL, options.icon)
            : options.imageUrl
                ? kendo.format(IMAGE_TMPL, options.imageUrl)
                : '';
        this.mainButton = $(kendo.format(BUTTON_TMPL, icon + options.text))
            .attr(kendo.attr('command'), options.command || '')
            .appendTo(element);
        this.arrowButton = $(ARROW_BUTTON_TMPL).appendTo(element);
        this._createPopup();
    },

    /**
     * Adds button popup
     * @private
     */
    _createPopup() {
        const options = this.options;
        const element = this.element;
        const items = options.menuButtons;
        this.popupElement = $(POPUP_TMPL).appendTo(element);
        /*
        if (options.mobile) {
            this.popupElement = actionSheetWrap(this.popupElement);
        }
        */
        for (
            var i = 0, length = items.length, item, icon;
            i < items.length;
            i++
        ) {
            item = items[i];
            icon = item.icon
                ? kendo.format(ICON_TMPL, item.icon)
                : item.imageUrl
                    ? kendo.format(IMAGE_TMPL, item.imageUrl)
                    : '';
            $(kendo.format(BUTTON_TMPL, icon + item.text))
                .attr(kendo.attr('command'), item.command || '')
                .prop('tabIndex', 0)
                .wrap('<li></li>')
                .parent()
                .appendTo(this.popupElement);
        }
        this.popup = this.popupElement
            .kendoPopup({
                // appendTo: options.mobile ? $(options.mobile).children('.km-pane') : null,
                anchor: element,
                // isRtl: this.toolbar._isRtl,
                copyAnchorStyles: false,
                animation: options.animation,
                open: adjustPopupWidth,
                activate() {
                    this.element
                        .find(':kendoFocusable')
                        .first()
                        .focus();
                },
                close() {
                    element.focus();
                }
            })
            .data('kendoPopup');
    },

    /**
     * Add keyboard navigation to split button
     * Again, this is similar to the _navigatable method if kendo.toolbar.js
     * @private
     */
    _navigatable(enabled) {
        const that = this;

        that.element.off(KEYDOWN + NS);
        that.popupElement.off(KEYDOWN + NS);

        if (enabled) {
            // that.element.on(KEYDOWN + NS, BUTTON_SELECTOR, function (e) {
            that.element.on(KEYDOWN + NS, e => {
                if (e.keyCode === keys.DOWN) {
                    that.toggle();
                } else if (
                    e.keyCode === keys.SPACEBAR ||
                    e.keyCode === keys.ENTER
                ) {
                    that._onButtonClick({
                        currentTarget: $(e.currentTarget)
                            .children(BUTTON_SELECTOR)
                            .first(),
                        preventDefault: $.noop
                    });
                }
            });

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            that.popupElement.on(KEYDOWN + NS, BUTTON_SELECTOR, e => {
                const li = $(e.target).parent();
                e.preventDefault();
                if (
                    e.keyCode === keys.ESC ||
                    e.keyCode === keys.TAB ||
                    (e.altKey && e.keyCode === keys.UP)
                ) {
                    that.toggle();
                    that.focus();
                } else if (e.keyCode === keys.DOWN) {
                    findFocusableSibling(li, 'next').focus();
                } else if (e.keyCode === keys.UP) {
                    findFocusableSibling(li, 'prev').focus();
                } else if (
                    e.keyCode === keys.SPACEBAR ||
                    e.keyCode === keys.ENTER
                ) {
                    // that.toolbar.userEvents.trigger('tap', { target: $(e.target) });
                    that._onButtonClick({
                        currentTarget: $(e.currentTarget),
                        preventDefault: $.noop
                    });
                }
            });

            /* jshint +W074 */
        }
    },

    /**
     * Toggle popup
     */
    toggle() {
        this.popup.toggle();
    },

    /**
     * Focus
     */
    focus() {
        this.element.focus();
    },

    /**
     * Function called by the enabled/disabled bindings
     * @param enable
     */
    enable(enabled) {
        const that = this;
        const element = that.element;
        enabled = $.type(enabled) === UNDEFINED ? true : !!enabled;
        element.toggleClass(DISABLED_CLASS, !enabled);
        element.off(CLICK + NS);
        this.popupElement.off(CLICK + NS);
        if (enabled) {
            element.on(
                CLICK + NS,
                BUTTON_SELECTOR,
                this._onButtonClick.bind(this)
            );
            this.popupElement.on(
                CLICK + NS,
                BUTTON_SELECTOR,
                this._onButtonClick.bind(this)
            );
        }
        this._navigatable(enabled);
    },

    /**
     * Event handler for clicking a button of the split button
     * @param e
     * @private
     */
    _onButtonClick(e) {
        e.preventDefault();
        if ($(e.currentTarget).is(ARROW_BUTTON_SELECTOR)) {
            this.toggle();
        } else {
            // Close the popup
            if ($.contains(this.popup.element.get(0), e.currentTarget)) {
                this.toggle();
            }
            // Trigger click event
            this.trigger(CLICK, {
                command: $(e.currentTarget).attr(kendo.attr('command'))
            });
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const element = that.element;
        // Unbind events
        that.enable(false);
        // Clear references
        that.popup.destroy();
        that.popup.wrapper.remove();
        that.popup = undefined;
        that.popupElement = undefined;
        that.mainButton = undefined;
        that.arrowButton = undefined;
        // Destroy widget
        Widget.fn.destroy.call(that);
        kendo.destroy(element);
    }
});

/**
 * Registration
 */
plugin(SplitButton);
