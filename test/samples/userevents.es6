/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.userevents';
import 'kendo.draganddrop';

/*
const { UserEvents } = window.kendo;
const userEvents = new UserEvents($('.kj-stage'), {
    global: true,
    allowSelection: true,
    filter: '.kj-element:has([data-behavior="draggable"])',
    threshold: 0,
    start(e) {
        console.log('start');
    },
    hold(e) {
        console.log('hold');
    },
    move(e) {
        console.log('move');
    },
    end(e) {
        console.log('end');
    },
    cancel(e) {
        console.log('cancel');
    },
    select(e) {
        console.log('select');
    }
});
*/

// calculate scale???
const scale = 0.6;

$('.kj-element:has([data-behavior="draggable"])').kendoDraggable({
    container: $('.kj-stage'),
    ignore: 'input,textarea',
    hint(element) {
        console.log('hint');
        const hint = element.clone().css({
            position: 'absolute',
            left:
                scale * element.position().left + $('.kj-stage').offset().left,
            top: scale * element.position().top + $('.kj-stage').offset().top,
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
        });
        element.hide();
        return hint;
    },
    drag(e) {
        console.log('drag');
    },
    dragcancel(e) {
        console.log('dragcancel');
    },
    dragend(e) {
        console.log('dragend');
        e.sender.hint.remove();
        e.sender.element
            .css({
                left:
                    (e.sender.hintOffset.left - $('.kj-stage').offset().left) /
                    scale,
                top:
                    (e.sender.hintOffset.top - $('.kj-stage').offset().top) /
                    scale
            })
            .show();
    },
    dragstart(e) {
        console.log('dragstart');
        const { element, hint } = e.sender;
        hint.css({
            left:
                scale * element.position().left + $('.kj-stage').offset().left,
            top: scale * element.position().top + $('.kj-stage').offset().top
        });
    }
});
