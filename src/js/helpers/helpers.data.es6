/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import JSC from 'jscheck';
import ObjectId from '../common/window.objectid.es6';
import { randomVal } from '../common/window.util.es6';
import '../app/app.tools.es6';
import input from '../editors/editors.input.es6';
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
 * getValidationLibrary
 * @function getValidationLibrary
 */
export function getValidationLibrary() {
    return [
        {
            name: 'Custom',
            key: 'custom',
            formula:
                'function validate(value, solution, all) {\n\t// Your code should return true when value is validated against solution.\n}'
        },
        // { // Test another options.default
        //    name: 'equal',
        //    key: 'equal',
        //    formula:
        //        'function validate(value, solution) {\n\treturn String(value).trim() === String(solution).trim();\n}'
        // },
        {
            name: 'Equal (int)',
            key: 'intEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseInt(value, 10) === parseInt(solution, 10);\n}'
        },
        {
            name: 'Equal (float)',
            key: 'floatEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) === parseFloat(solution);\n}'
        },
        {
            name: 'Equal (2 decimals))',
            key: 'round2DecimalsEqual',
            formula:
                'function validate(value, solution) {\n\treturn Math.round(parseFloat(value)*100)/100 === parseFloat(solution);\n}'
        },
        {
            name: 'Greater than',
            key: 'greaterThan',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) > parseFloat(solution);\n}'
        },
        {
            name: 'Greater or equal',
            key: 'greaterThanOrEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) >= parseFloat(solution);\n}'
        },
        {
            name: 'Lower than',
            key: 'lowerThan',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) < parseFloat(solution);\n}'
        },
        {
            name: 'Lower or equal',
            key: 'lowerThanOrEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) <= parseFloat(solution);\n}'
        },
        {
            name: 'With parameters',
            key: 'withParam',
            formula:
                'function validate(value, params) {\n\tconsole.log(params);\n\treturn new RegExp(params, "i").test(value);\n}',
            editor: input
        }
    ];
}

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

/**
 * getLabel
 * @function getLabel
 */
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

/**
 * getPage
 * @function getPage
 */
export function getPage() {
    return {};
}

/**
 * getPageArray
 * @function getPageArray
 */
export function getPageArray() {
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
                            'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png'
                    }
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
                        text: 'Company?'
                    }
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
                    properties: { name: randomVal() }
                }
            ]
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
                        text: 'Marignan?'
                    }
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
                    properties: { name: randomVal() }
                }
            ]
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
                        text: "Couleur du cheval blanc d'Henri IV?"
                    }
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
                    properties: { name: randomVal() }
                }
            ]
        }
    ];
}
