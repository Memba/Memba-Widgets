/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Note: this cursor concept is supposed to be similar to https://github.com/Khan/math-input

// TODO check caret position with https://stackoverflow.com/questions/16212871/get-the-offset-position-of-the-caret-in-a-textarea-in-pixels
// TODO See also https://github.com/component/textarea-caret-position
// TODO use kendo.caret(element, start, end) to position or simply kendo.caret(element) to get position
// TODO What if there are two such widgets on the same page?
// TODO hide cursor with keypresses
// TODO consider adding mouse/touch events to _onFocusIn and key events to _onFocusOut
// TODO consider resizable textareas
// TODO What about CodeMirror and kendoEditor?

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.userevents';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    applyEventMap,
    caret,
    destroy,
    getTouches,
    ui: { plugin, Widget },
    support,
    unbind,
    UserEvents
} = window.kendo;

const logger = new Logger('widgets.cursor');
const NS = '.kendoCursor';

/**
 * Cursor
 * Note: The concept comes from https://github.com/Khan/math-input
 * but is generalized to all tags specified in options.filter
 * These tags need to support focusIn/focusOut and the selection apis
 * @class Cursor
 * @extends Widget
 */
const Cursor = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.enable(this.options.enabled);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Cursor',
        color: '#78C008',
        enabled: support.touch,
        filter: 'input, textarea',
        size: 20,
        friction: 1
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        assert.ok(
            element.is(CONSTANTS.SPAN),
            'Please use a span tag to instantiate a Cursor widget.'
        );
        const cursorColor = options.color;
        const cursorHandleRadiusPx = 11;
        const touchTargetRadiusPx = 22;
        // The amount to multiply the radius by to get the distance from the
        // center to the tip of the cursor handle.  The cursor is a circle with
        // one quadrant replace with a square.  The hypotenuse of the square is
        // 1.41 times the radius of the circle.
        const cursorHandleDistanceMultiplier = 1.41;
        const cursorRadiusPx = cursorHandleRadiusPx;
        const cursorHeightPx =
            cursorHandleDistanceMultiplier * cursorRadiusPx + cursorRadiusPx;
        const cursorWidthPx = 2 * cursorRadiusPx;
        const innerStyle = `margin-left: ${touchTargetRadiusPx -
            cursorRadiusPx};`;
        this.wrapper = element
            .html(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${cursorWidthPx}" height="${cursorHeightPx}" viewBox="-${cursorRadiusPx} 0 ${cursorWidthPx} ${cursorHeightPx}" style="${innerStyle}"><path d="M 0 0 L -${0.707 *
                    cursorRadiusPx} ${0.707 *
                    cursorRadiusPx} A ${cursorRadiusPx} ${cursorRadiusPx}, 0, 1, 0, ${0.707 *
                    cursorRadiusPx} ${0.707 *
                    cursorRadiusPx} Z" fill="${cursorColor}" /></svg>`
            )
            .css({
                cursor: 'pointer',
                position: 'absolute',
                top: 0,
                left: 0
            })
            .hide();
    },

    /**
     * enable/disable
     * @method enable
     * @param enable
     * @private
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const {
            element,
            options: { filter }
        } = this;
        element.hide();
        $(document).off(NS);
        if (this.userEvents instanceof UserEvents) {
            this.userEvents.destroy();
            this.userEvents = undefined;
        }
        if (enabled) {
            $(document)
                .on(
                    `focusin${NS} mousedown${NS} touchdown${NS}`,
                    filter,
                    this._onFocusIn.bind(this)
                )
                .on(
                    `focusout${NS} keydown${NS}`,
                    filter,
                    this._onFocusOut.bind(this)
                );
            this.userEvents = new UserEvents(this.element, {
                global: true,
                start: this._onDragStart.bind(this),
                move: this._onDragMove.bind(this),
                end: this._onDragEnd.bind(this)
            });
        }
    },

    /**
     * Event handler for the focusin event
     * @param e
     * @private
     */
    _onFocusIn(e) {
        debugger;
        this.element
            // TODO position
            .show();
    },

    /**
     * Event handler for the focusout event
     * @param e
     * @private
     */
    _onFocusOut(e) {
        this.element.hide();
    },

    /**
     * Event handler for the dragstart event
     * @param e
     * @private
     */
    _onDragStart(e) {
        $.noop();
    },

    /**
     * Event handler for the drag event
     * @method _onDragMove
     * @param e
     * @private
     */
    _onDragMove(e) {
        // debugger;
        const { options } = this;
        const position = e.target.position();
        const cursorPos = this._getCursorPosition();
        e.target.css({
            left: position.left + e.x.delta,
            top: position.top + e.y.delta
        });
        // TODO Set caret
    },

    /**
     * Event handler for the dragend event
     * @method _onDragEnd
     * @param e
     * @private
     */
    _onDragEnd(e) {
        // TODO Ease back to cursor position
        $.noop();
    },

    /**
     * _getPositionBounds
     * @method _getPositionBounds
     * @param input
     * @private
     */
    _getPositionBounds(input) {
        if (input.is(CONSTANTS.INPUT)) {
        } else if (input.is(CONSTANTS.TEXTAREA)) {
        }
        // TODO mathquill
        // TODO content editable
    },

    /**
     * Utility method to get the cursor position
     * Note: the cursor is the visual element users can drag to positiuon the caret
     * @method _getCursorPosition
     * @param input
     * @private
     */
    _getCursorPosition(input) {},

    /**
     * Utility method to
     * @method _getCaretPosition
     * @param input
     * @private
     */
    _getCaretPosition(input) {},

    /**
     * Utility method to set the caret position
     * Note: The caret is the text insertion/selection cursor
     * @method _setCaretPosition
     * @param input
     * @param mouse
     * @private
     */
    _setCaretPosition(input, mouse) {},

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.enable(false);
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Cursor')) {
    // Prevents loading several times in karma
    plugin(Cursor);
}
