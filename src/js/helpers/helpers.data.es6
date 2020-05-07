/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Could be merge with ./helpers.components.es6

import JSC from 'jscheck';
import ObjectId from '../common/window.objectid.es6';
import { randomVal } from '../common/window.util.es6';

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
            'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png',
    },
    {
        alt: 'Facebook',
        src:
            'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg',
    },
];

/**
 * getAudio
 * @function getAudio
 */
function getAudio() {
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
            ogg: '',
        },
    };
}

/**
 * getImage
 * @function getImage
 * @param index
 */
function getImage(index) {
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
        attributes: IMAGES[index],
    };
}

/**
 * getLabel
 * @function getLabel
 */
function getLabel() {
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
            text: 'World',
        },
    };
}

/**
 * getQuiz
 * @function getQuiz
 */
function getQuiz() {
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
            groupStyle: 'font-size: 30px; text-decoration: underline;',
        },
    };
}

/**
 * getDummy
 * @function getDummy
 */
function getDummy() {
    const height = JSC.integer(
        MIN_HEIGHT,
        Math.floor(MAX_HEIGHT * MAX_RATIO)
    )();
    const width = JSC.integer(MIN_WIDTH, Math.floor(MAX_WIDTH * MAX_RATIO))();
    return {
        id: new ObjectId().toString(),
        tool: 'dummy',
        top: JSC.integer(MAX_HEIGHT - height)(),
        left: JSC.integer(MAX_WIDTH - width)(),
        height,
        width,
        rotate: JSC.integer(MAX_ROTATE)(),
    };
}

/**
 * getTextBox
 * @function getTextBox
 */
function getTextBox() {
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
            name: randomVal(),
        },
    };
}

/**
 * getComponentArray
 * @function getComponentArray
 */
function getComponentArray() {
    return [
        getDummy(),
        getImage(0),
        // getAudio(),
        getLabel(),
        getImage(1),
        // getQuiz(),
        getTextBox(),
    ];
}

/**
 * getPage
 * @function getPage
 */
function getPage() {
    return {};
}

/**
 * getPageArray
 * @function getPageArray
 */
function getPageArray() {
    return [
        {
            id: new ObjectId().toString(),
            instructions: 'Company?',
            components: [
                {
                    id: new ObjectId().toString(),
                    tool: 'image',
                    top: 50,
                    left: 370,
                    height: 250,
                    width: 250,
                    rotate: 0,
                    attributes: {
                        src:
                            'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png',
                    },
                },
                {
                    id: new ObjectId().toString(),
                    tool: 'label',
                    top: 300,
                    left: 300,
                    height: 100,
                    width: 300,
                    rotate: 0,
                    attributes: {
                        style: 'font-family: Georgia, serif; color: #0000FF;',
                        text: 'Company?',
                    },
                },
                {
                    id: new ObjectId().toString(),
                    tool: 'textbox',
                    top: 450,
                    left: 350,
                    height: 100,
                    width: 300,
                    rotate: 0,
                    attributes: {},
                    properties: { name: randomVal() },
                },
            ],
        },
        {
            id: new ObjectId().toString(),
            instructions: 'Marignan?',
            components: [
                {
                    id: new ObjectId().toString(),
                    tool: 'label',
                    top: 150,
                    left: 280,
                    height: 100,
                    width: 300,
                    rotate: 0,
                    attributes: {
                        style: 'font-family: Georgia, serif; color: #FF0000;',
                        text: 'Marignan?',
                    },
                },
                {
                    id: new ObjectId().toString(),
                    tool: 'textbox',
                    top: 300,
                    left: 330,
                    height: 100,
                    width: 300,
                    rotate: 0,
                    attributes: {},
                    properties: { name: randomVal() },
                },
            ],
        },
        {
            id: new ObjectId().toString(),
            instructions: 'Cheval IV?',
            components: [
                {
                    id: new ObjectId().toString(),
                    tool: 'label',
                    top: 120,
                    left: 280,
                    height: 150,
                    width: 400,
                    rotate: 0,
                    attributes: {
                        style: 'font-family: Georgia, serif; color: #00FF00;',
                        text: "Couleur du cheval blanc d'Henri IV?",
                    },
                },
                {
                    id: new ObjectId().toString(),
                    tool: 'textbox',
                    top: 300,
                    left: 330,
                    height: 100,
                    width: 300,
                    rotate: 0,
                    attributes: {},
                    properties: { name: randomVal() },
                },
            ],
        },
    ];
}

/**
 * Export
 */
export {
    getAudio,
    getDummy,
    getImage,
    getLabel,
    getQuiz,
    getTextBox,
    getComponentArray,
    getPage,
    getPageArray,
};
