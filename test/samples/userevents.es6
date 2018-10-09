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
const stage = $('.kj-stage');

stage.kendoDraggable({
    container: stage,
    filter: '.kj-element:has([data-behavior="draggable"])',
    ignore: 'input,textarea',
    hint(element) {
        console.log('hint');
        const hint = element.clone()
        .css({
            // position: 'absolute',
            // left:
            //     scale * element.position().left + stage.offset().left,
            // top: scale * element.position().top + stage.offset().top,
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
        });
        // element.hide();
        return hint;
    },
    dragstart(e) {
        console.log('dragstart');
        // const { element, hint } = e.sender;
        // hint.css({
        //     left:
        //         scale * element.position().left + stage.offset().left,
        //     top: scale * element.position().top + stage.offset().top
        // });
    },
    drag(e) {
        if (
            Math.round(
                e.sender.hintOffset.left +
                    e.sender.hint.width() -
                    stage.offset().left
            ) >=
            stage.width() * scale
        ) {
            e.sender.hintOffset.left = stage.width() * scale;
        }
        if (
            Math.round(
                e.sender.hintOffset.top +
                    e.sender.hint.height() -
                    stage.offset().top
            ) >=
            stage.height() * scale
        ) {
            e.sender.hintOffset.top = stage.height() * scale;
        }
    },
    dragend(e) {
        e.sender.hint.remove();
        $(e.sender.currentTarget)
            .closest('.kj-element')
            .css({
                left: 15 + (e.sender.hintOffset.left - stage.offset().left) / scale,
                top: 15 + (e.sender.hintOffset.top - stage.offset().top) / scale
            })
            .show();
        e.preventDefault();
    }
});
