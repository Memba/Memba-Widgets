/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import JSC from 'jscheck';
import ObjectId from '../common/window.objectid.es6';
import { randomVal } from '../common/window.util.es6';
import '../app/app.tools.es6';
// import tools from '../tools/tools.es6';
// import BaseTool from '../tools/tools.base.es6';

const MAX_HEIGHT = 768;
const MAX_RATIO = 0.25;
const MAX_ROTATE = 359;
const MAX_WIDTH = 1024;
const MIN_HEIGHT = 40;
const MIN_WIDTH = 80;
const IMAGES = [
    {
        alt: 'Google',
        src:
            'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png'
    },
    {
        alt: 'Facebook',
        src:
            'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg'
    }
];

/**
 * getAudio
 * @function getAudio
 */
export function getAudio() {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'audio',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)(),
        attributes: {
            autoplay: false,
            mp3: '',
            ogg: ''
        }
    };
}

/**
 * getImage
 * @function getImage
 * @param index
 */
export function getImage(index) {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'image',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)(),
        attributes: IMAGES[index]
    };
}

export function getLabel() {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'label',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)(),
        attributes: {
            style: 'font-family: Georgia; font-style: italic; color: #FF0000;',
            text: 'World'
        }
    };
}

/**
 * getQuiz
 * @function getQuiz
 */
export function getQuiz() {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'quiz',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)(),
        attributes: {
            data: 'a\nb\nc\nd\n',
            activeStyle: '',
            itemStyle: '',
            groupStyle: 'font-size: 30px; text-decoration: underline;'
        }
    };
}

/**
 * getSquare
 * @function getSquare
 */
export function getSquare() {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'square',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)()
    };
}

/**
 * getTextBox
 * @function getTextBox
 */
export function getTextBox() {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'textbox',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)(),
        attributes: {},
        properties: {
            name: randomVal()
        }
    };
}

/**
 * getComponentArray
 * @function getComponentArray
 */
export function getComponentArray() {
    return [
        getSquare(),
        getImage(0),
        // getAudio(),
        getLabel(),
        getImage(1),
        // getQuiz(),
        getTextBox()
    ];
}
