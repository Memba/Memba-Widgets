/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO use kendo.getTouches and consider specializing UserEvents

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

/**
 * Get the position of the center of an element
 * @param element
 * @param stage
 * @param scale
 */
export function getElementCenter(element, stage, scale) {
    assert.instanceof(
        $,
        element,
        assert.format(assert.messages.instanceof.default, 'element', 'jQuery')
    );
    assert.instanceof(
        $,
        stage,
        assert.format(assert.messages.instanceof.default, 'stage', 'jQuery')
    );
    assert.type(
        CONSTANTS.NUMBER,
        scale,
        assert.format(assert.messages.type.default, 'scale', CONSTANTS.NUMBER)
    );
    // We need getBoundingClientRect to especially account for rotation
    const rect = element[0].getBoundingClientRect();
    const ownerDocument = $(stage.get(0).ownerDocument);
    const stageOffset = stage.offset();
    return {
        left:
            (rect.left -
                stageOffset.left +
                rect.width / 2 +
                ownerDocument.scrollLeft()) /
            scale,
        top:
            (rect.top -
                stageOffset.top +
                rect.height / 2 +
                ownerDocument.scrollTop()) /
            scale
    };
}

/**
 * Get the mouse (or touch) position
 * @param e
 * @param stage
 * @returns {{x: *, y: *}}
 */
export function getMousePosition(e, stage) {
    assert.instanceof(
        $.Event,
        e,
        assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event')
    );
    assert.instanceof(
        $,
        stage,
        assert.format(assert.messages.instanceof.default, 'stage', 'jQuery')
    );
    const { originalEvent } = e;
    let clientX;
    let clientY;
    if (
        originalEvent &&
        originalEvent.touches &&
        originalEvent.touches.length
    ) {
        [{ clientX, clientY }] = originalEvent.touches;
    } else if (
        originalEvent &&
        originalEvent.changedTouches &&
        originalEvent.changedTouches.length
    ) {
        // See http://www.jacklmoore.com/notes/mouse-position/
        // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
        // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
        // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
        [{ clientX, clientY }] = originalEvent.changedTouches;
    } else {
        ({ clientX, clientY } = e);
    }
    // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
    const ownerDocument = $(stage.get(0).ownerDocument);
    const stageOffset = stage.offset();
    const mouse = {
        x: clientX - stageOffset.left + ownerDocument.scrollLeft(),
        y: clientY - stageOffset.top + ownerDocument.scrollTop()
    };
    return mouse;
}

/**
 * Get the rotation angle (in degrees) of an element's CSS transformation
 * @param element
 * @returns {Number|number}
 */
export function getTransformRotation(element) {
    assert.instanceof(
        $,
        element,
        assert.format(assert.messages.instanceof.default, 'element', 'jQuery')
    );
    // $(element).css('transform') returns a matrix, so we have to read the style attribute
    const match = (element.attr('style') || '').match(
        /rotate\([\s]*([0-9.]+)[deg\s]*\)/
    ); // TODO: Do we need $
    return Array.isArray(match) && match.length > 1
        ? parseFloat(match[1]) || 0
        : 0;
}

/**
 * Get the scale of an element's CSS transformation
 * Note: the same function is used in kidoju.widgets.stage
 * @param element
 * @returns {Number|number}
 */
export function getTransformScale(element) {
    assert.instanceof(
        $,
        element,
        assert.format(assert.messages.instanceof.default, 'element', 'jQuery')
    );
    // element.css('transform') returns a matrix, so we have to read the style attribute
    const match = (element.attr('style') || '').match(
        /scale\([\s]*([0-9.]+)[\s]*\)/
    );
    return Array.isArray(match) && match.length > 1
        ? parseFloat(match[1]) || 1
        : 1;
}
