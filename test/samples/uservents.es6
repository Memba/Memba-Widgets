/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.userevents';

const { getComputedStyles, UserEvents } = window.kendo;
const mouse = $('#mouse');
// calculate scale???
const scale = 0.6;
const stage = $('.kj-stage');

function getPosition(e) {
    // assert(e.sender.surface)
    const matrix = getComputedStyles(e.sender.surface[0], ['transform']);
    // https://www.michael1e.com/get-scale-value-css-javascript/
    // https://stackoverflow.com/questions/5603615/get-the-scale-value-of-an-element
    const offset = stage.offset();
    const touch = e.sender.touches[0];
    return {
        top: (touch.y.location - offset.top) / scale,
        left: (touch.x.location - offset.left) / scale
    };
}

function hit(e) {
    mouse
        .css(getPosition(e))
        .fadeIn(500)
        .fadeOut(2000);
}

function getDelta(e) {
    // assert(e.sender.surface)
    // const matrix = getComputedStyles(e.sender.surface[0], ['transform']);
    // https://www.michael1e.com/get-scale-value-css-javascript/
    // https://stackoverflow.com/questions/5603615/get-the-scale-value-of-an-element
    return {
        x: e.x.initialDelta / scale,
        y: e.y.initialDelta / scale
    };
}

let initial;

function handler(e) {
    if (!initial) {
        initial = $(e.target).position();
    }
    const delta = getDelta(e);
    $(e.target).css({
        top: initial.top + delta.y,
        left: initial.left + delta.x
    });
}

const userEvents = new UserEvents($('.kj-stage'), {
    global: false,
    allowSelection: true,
    filter: '.kj-element:has([data-behavior="draggable"])',
    threshold: 0,
    cancel(e) {
        console.log('cancel');
    },
    doubleTap(e) {
        console.log('doubleTap');
    },
    end(e) {
        console.log('end');
        handler(e);
    },
    gesturechange(e) {
        console.log('gesturechange');
    },
    gestureend(e) {
        console.log('gestureend');
    },
    gesturestart(e) {
        console.log('gesturestart');
    },
    gesturetap(e) {
        console.log('gesturetap');
    },
    hold(e) {
        console.log('hold');
    },
    move(e) {
        console.log('move');
        handler(e);
    },
    press(e) {
        console.log('press');
        e.data = {
            oops: 'toto'
        };
    },
    select(e) {
        console.log('select');
        hit(e);
    },
    start(e) {
        console.log('start');
        handler(e);
    },
    release(e) {
        console.log('release');
        initial = undefined;
        hit(e);
    },
    tap(e) {
        console.log('tap');
    }
});

