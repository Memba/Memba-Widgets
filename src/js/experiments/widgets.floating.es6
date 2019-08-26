/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.draganddrop';
import 'kendo.window';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    resize,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.floating');
// const NS = '.kendoFloating';
const WIDGET_CLASS = 'k-toolbar kj-floating';
const CONTENT_CLASS = 'kj-floating-content';
const HANDLE_CLASS = 'kj-floating-handle';

const MutationObserver =
    window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;

/**
 * Floating
 * @class Floating
 * @extends Widget
 */
const Floating = Widget.extend({
    /**
     * Init
     * @constructor inti
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this._setMutationObserver();
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Floating',
        observed: '', // '.k-toolbar:not([style*='display: none']) [data-uid]'
        attributeFilter: [] // ['style']
    },

    /**
     * Widget layout
     * @private
     */
    _render() {
        const { element } = this;
        // Add drag handle and content
        element
            .addClass(WIDGET_CLASS)
            .append(
                $(`<${CONSTANTS.DIV}/>`)
                    .addClass(HANDLE_CLASS)
                    .append('<span class="k-icon k-i-handler-drag"></span>')
            )
            .append($(`<${CONSTANTS.DIV}/>`).addClass(CONTENT_CLASS));
        // Create titleless window
        this.window = element
            .kendoWindow({
                resizable: false,
                scrollable: false,
                title: false
            })
            .data('kendoWindow');
        this.wrapper = this.window.wrapper;
        // Add draggable
        this.draggable = element
            .kendoDraggable({
                group: 'widgets.floating',
                ignore: `${CONSTANTS.DOT}${CONTENT_CLASS}, ${
                    CONSTANTS.DOT
                }${CONTENT_CLASS} *`,
                hint: this._hint.bind(this),
                dragstart: this._onDragStart.bind(this),
                dragend: this._onDragEnd.bind(this)
            })
            .data('kendoDraggable');
    },

    /**
     * Get dragging hint (the thing that moves around on top of everything thanks to a high zIndex)
     * Note: The original element is not modified and should be hidden or displayed with a low opacity
     * @private
     */
    _hint() {
        // element.clone() always sets top=0, left=0 which cannot be updated until the clone is added to the document body
        // which occurs in kendoDraggable before calling _onDragStart
        return this.wrapper.clone();
    },

    /**
     * Drag start event handler
     * @private
     */
    _onDragStart() {
        // hint (the clone) is now added to the document body and its position can be set via CSS
        const {
            draggable: { hint },
            wrapper
        } = this;
        const position = wrapper.position();
        // hide the original element
        wrapper.hide();
        // position the hint on top of the original element
        hint.css({
            // position: 'absolute',
            // zIndex: 15000,
            top: position.top,
            left: position.left
        });
        // show the hint
        hint.show();
    },

    /**
     * Drag end event handler
     * @private
     */
    _onDragEnd() {
        const {
            draggable: { hint },
            wrapper
        } = this;
        const position = hint.position();
        // hide the hint which has been moved around
        hint.hide();
        // set the position of the original element to the position of the hint
        wrapper.css({
            position: 'absolute',
            zIndex: 15000,
            top: position.top,
            left: position.left
        });
        // show the original element
        wrapper.show();
    },

    /**
     * Set Mutation Observer
     * to show/hide the floating whether there is relevant content
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     * @private
     */
    _setMutationObserver() {
        const {
            options: { attributeFilter, observed },
            wrapper
        } = this;
        const content = wrapper.find(`${CONSTANTS.DOT}${CONTENT_CLASS}`);
        if (observed) {
            wrapper.hide();
            // create an observer instance (show only if there are observed nodes)
            this.observer = new MutationObserver(() => {
                // this.wrapper.toggle(!!content.find(observed).length);
                // creates an infinite loop because display attribute is always modified
                // so we need to only apply if there is a change
                if (wrapper.is(':visible') && !content.find(observed).length) {
                    wrapper.hide();
                } else if (
                    wrapper.is(':not(:visible)') &&
                    content.find(observed).length
                ) {
                    wrapper.show();
                }
                // with any change, resize
                resize(wrapper);
            });
            // To observe node additions and removals (e.g. toolbar buttons)
            const config = { childList: true, subtree: true };
            // To also observe attributes (e.g. toolbar visibility)
            if ($.isArray(attributeFilter) && attributeFilter.length) {
                config.attributes = true;
                config.attributeFilter = attributeFilter;
            }
            // pass in the content node to observe, as well as the observer configuration
            this.observer.observe(content.get(0), config);
        } else {
            wrapper.show();
        }
    },

    /**
     * Show
     */
    show() {
        this.wrapper.show();
    },

    /**
     * Hide
     */
    hide() {
        this.wrapper.hide();
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        // Remove references

        Widget.fn.destroy.call(this);
        destroy(this.wrapper);
        // disconnect the mutation observer
        if (that.observer instanceof MutationObserver) {
            that.observer.disconnect();
        }
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(Floating);
