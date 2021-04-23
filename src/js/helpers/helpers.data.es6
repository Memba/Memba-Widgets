/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import JSC from 'jscheck';
import ObjectId from '../common/window.objectid.es6';
import { randomVal } from '../common/window.util.es6';
import basiclist from '../editors/editors.basiclist.es6';
import regex from '../editors/editors.regex.es6';
import tools from '../tools/tools.es6';
import { BaseTool } from '../tools/tools.base.es6';

// Note: floating numbers generate errors due to changes in the last digit
const angleGenerator = JSC.integer(0, 359);
const boxGenerator = () => {
    const minHeight = 40;
    const maxHeight = 768;
    const minWidth = 60;
    const maxWidth = 1024;
    const ratio = 0.6;
    const height = JSC.integer(minHeight, Math.ceil(ratio * maxHeight))();
    const width = JSC.integer(minWidth, Math.ceil(ratio * maxWidth))();
    return {
        height,
        left: JSC.integer(maxWidth - width)(),
        top: JSC.integer(maxHeight - height)(),
        width,
    };
};
const colorGenerator = () =>
    `#${JSC.string(JSC.integer(6), JSC.one_of('0123456789abcdef'))()}`;
const quizMode = JSC.one_of(['button', 'dropdown', 'image', 'link', 'radio']);
const styleGenerator = () =>
    `${[
        `background-color: #${JSC.string(
            JSC.integer(6),
            JSC.one_of('0123456789abcdef')
        )()}`,
        'border: solid 1px #000000',
        `color: ${colorGenerator()}`,
        'font-family: Georgia, serif',
        'font-size: 3rem',
        'font-weight: 800',
        'opacity: 0.5',
    ]
        .filter(() => JSC.boolean(2 / 3)())
        .join('; ')};`;
const textGenerator = JSC.string();
const urlGenerator = (ext) =>
    `http://www.${JSC.string(
        JSC.integer(3, 10),
        JSC.character('a', 'z')
    )()}.com/${JSC.character('a', 'z')()}${JSC.string(
        JSC.integer(1, 100),
        JSC.one_of('abcdefghijklmnopqrstuvwxyz0123456789-/')
    )()}${JSC.character('a', 'z')()}.${ext}`;
const imageList = () => [
    { text: JSC.string()(), url: urlGenerator('png') },
    { text: JSC.string()(), url: urlGenerator('png') },
    { text: JSC.string()(), url: urlGenerator('png') },
    { text: JSC.string()(), url: urlGenerator('png') },
];

/**
 * getValidationLibrary
 * @function getValidationLibrary
 */
function getValidationLibrary() {
    return [
        {
            name: 'Custom',
            key: 'custom',
            formula:
                'function validate(value, solution, all) {\n\t// Your code should return true when value is validated against solution.\n}',
        },
        {
            name: 'equal',
            key: 'equal',
            formula:
                'function validate(value, solution) {\n\treturn String(value).trim() === String(solution).trim();\n}',
        },
        {
            name: 'Equal (int)',
            key: 'intEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseInt(value, 10) === parseInt(solution, 10);\n}',
        },
        {
            name: 'Equal (float)',
            key: 'floatEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) === parseFloat(solution);\n}',
        },
        {
            name: 'Equal (2 decimals))',
            key: 'round2DecimalsEqual',
            formula:
                'function validate(value, solution) {\n\treturn Math.round(parseFloat(value)*100)/100 === parseFloat(solution);\n}',
        },
        {
            name: 'Greater than',
            key: 'greaterThan',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) > parseFloat(solution);\n}',
        },
        {
            name: 'Greater or equal',
            key: 'greaterThanOrEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) >= parseFloat(solution);\n}',
        },
        {
            name: 'Lower than',
            key: 'lowerThan',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) < parseFloat(solution);\n}',
        },
        {
            name: 'Lower or equal',
            key: 'lowerThanOrEqual',
            formula:
                'function validate(value, solution) {\n\treturn parseFloat(value) <= parseFloat(solution);\n}',
        },
        {
            name: 'With regex',
            key: 'withRegex',
            formula:
                'function validate(value, params) {\n\tconsole.log(params);\n\treturn new RegExp(params, "i").test(value);\n}',
            editor: regex,
            options: {
                field: 'params', // Note: this is required for editors
            },
            defaultParams: '\\w+',
        },
        {
            name: 'With list',
            key: 'withList',
            formula:
                'function validate(value, params) {\n\treturn (params || []).indexOf(value) > -1;\n}',
            editor: basiclist,
            options: {
                field: 'params', // Note: this is required for editors
                type: 'number',
                attributes: {
                    'data-culture': 'fr-FR',
                },
            },
            defaultParams: [],
        },
    ];
}

/**
 * getAudio
 * @function getAudio
 */
function getAudio() {
    return {
        attributes: {
            autoplay: JSC.boolean()(),
            mp3: urlGenerator('mp3'),
            ogg: urlGenerator('ogg'),
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'audio',
        ...boxGenerator(),
    };
}

/**
 * getCharGrid
 * @function getCharGrid
 */
function getCharGrid() {
    return {
        attributes: {
            // TODO
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: [], // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'chargrid',
        ...boxGenerator(),
    };
}

/**
 * getChart
 * @function getChart
 */
function getChart() {
    return {
        attributes: {
            // categories: undefined,
            // data: undefined,
            // legend: undefined,
            // style: undefined,
            // title: undefined,
            // type: undefined,
            // values: undefined
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'chart',
        ...boxGenerator(),
    };
}

/**
 * getConnector
 * @function getConnector
 */
function getConnector() {
    return {
        attributes: {
            color: colorGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'connector',
        ...boxGenerator(),
    };
}

/**
 * getDropZone
 * @function getDropZone
 */
function getDropZone() {
    return {
        attributes: {
            center: JSC.boolean()(),
            // empty
            style: styleGenerator(),
            text: textGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'dropzone',
        ...boxGenerator(),
    };
}

/**
 * getDummy
 * @function getDummy
 */
function getDummy() {
    return {
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'dummy',
        ...boxGenerator(),
    };
}

/**
 * getHighLighter
 * @function getHighLighter
 */
function getHighLighter() {
    // const text = '';
    return {
        attributes: {
            highlightStyle: styleGenerator(),
            style: styleGenerator(),
            text: '',
            // split: ''
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: [], // TODO from text
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'highlighter',
        ...boxGenerator(),
    };
}

/**
 * getImage
 * @function getImage
 */
function getImage() {
    return {
        attributes: {
            alt: textGenerator(),
            src: urlGenerator('png'),
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            behavior: 'none',
            constant: '',
        },
        rotate: angleGenerator(),
        tool: 'image',
        ...boxGenerator(),
    };
}

/**
 * getImageSet
 * @function getImage
 */
function getImageSet() {
    const data = imageList();
    return {
        attributes: {
            data,
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: data[0].text,
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'imageset',
        ...boxGenerator(),
    };
}

/**
 * getLabel
 * @function getLabel
 */
function getLabel() {
    return {
        attributes: {
            style: styleGenerator(),
            text: JSC.string()().replace(/#/g, '\\#'), // Note: avoids breaking kendo templates
        },
        id: new ObjectId().toString(),
        properties: {
            behavior: 'none',
            constant: '',
        },
        rotate: angleGenerator(),
        tool: 'label',
        ...boxGenerator(),
    };
}

/**
 * getLatex
 * @function getLatex
 */
function getLatex() {
    return {
        attributes: {
            formula: '', // TODO
            inline: JSC.boolean()(),
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'latex',
        ...boxGenerator(),
    };
}

/**
 * getLine
 * @function getLine
 */
function getLine() {
    return {
        attributes: {
            endCap: 'none',
            // TODO graduations
            lineColor: '#ff0000',
            lineWidth: 5,
            startCap: 'none',
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'line',
        ...boxGenerator(),
    };
}

/**
 * getMathInput
 * @function getMathInput
 */
function getMathInput() {
    return {
        attributes: {
            keypad: JSC.boolean()(),
            basic: JSC.boolean()(),
            greek: JSC.boolean()(),
            operators: JSC.boolean()(),
            expressions: JSC.boolean()(),
            sets: JSC.boolean()(),
            matrices: JSC.boolean()(),
            statistics: JSC.boolean()(),
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'mathinput',
        ...boxGenerator(),
    };
}

/**
 * getMultiQuiz
 * @function getMultiQuiz
 */
function getMultiQuiz() {
    const data = imageList();
    return {
        attributes: {
            mode: quizMode(),
            shuffle: JSC.boolean()(),
            groupStyle: styleGenerator(),
            itemStyle: styleGenerator(),
            selectStyle: styleGenerator(),
            data,
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: data
                .map((item) => item.text)
                .filter(JSC.boolean())
                .join('\n'), // Review
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'multiquiz',
        ...boxGenerator(),
    };
}

/**
 * getNumericBox
 * @function getNumericBox
 */
function getNumericBox() {
    return {
        attributes: {
            decimals: JSC.integer(0, 2)(),
            // max: undefined
            min: JSC.integer(0, 100)(),
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'numericbox',
        ...boxGenerator(),
    };
}

/**
 * getQuiz
 * @function getQuiz
 */
function getQuiz() {
    const data = imageList();
    return {
        attributes: {
            mode: quizMode(),
            shuffle: JSC.boolean()(),
            groupStyle: styleGenerator(),
            itemStyle: styleGenerator(),
            selectStyle: styleGenerator(),
            data,
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: data[0].text,
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'quiz',
        ...boxGenerator(),
    };
}

/**
 * getSelector
 * @function getSelector
 */
function getSelector() {
    return {
        attributes: {
            // TODO
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'selector',
        ...boxGenerator(),
    };
}

/**
 * getShape
 * @function getShape
 */
function getShape() {
    return {
        attributes: {
            shape: JSC.one_of(['rectangle', 'ellipsis', 'polygon'])(),
            angles: JSC.integer(3, 10)(),
            text: textGenerator(),
            fillColor: colorGenerator(),
            strokeColor: colorGenerator(),
            strockWidth: JSC.integer(3, 10)(),
        },
        properties: {
            behavior: 'none',
            constant: undefined,
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'shape',
        ...boxGenerator(),
    };
}

/**
 * getTable
 * @function getTable
 */
function getTable() {
    return {
        attributes: {
            // columns:
            // rows:
            // data:
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'table',
        ...boxGenerator(),
    };
}

/**
 * getTextArea
 * @function getTextArea
 */
function getTextArea() {
    return {
        attributes: {
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'textarea',
        ...boxGenerator(),
    };
}

/**
 * getTextBox
 * @function getTextBox
 */
function getTextBox() {
    return {
        attributes: {
            mask: '', // Not bothering
            style: styleGenerator(),
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'textbox',
        ...boxGenerator(),
    };
}

/**
 * getTextGaps
 * @function getTextBox
 */
function getTextGaps() {
    return {
        attributes: {
            inputStyle: styleGenerator(),
            style: styleGenerator(),
            text: 'The quick [] fox is jumping over the [] dog',
        },
        id: new ObjectId().toString(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal',
        },
        rotate: angleGenerator(),
        tool: 'textgaps',
        ...boxGenerator(),
    };
}

/**
 * getVariable
 * @function getVariable
 */
function getVariable() {
    return {
        attributes: {
            variable: JSC.string(JSC.integer(1, 10), JSC.character('a', 'z'))(),
            expression: 'round(random(0, 100), 2)',
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'variable',
        ...boxGenerator(),
    };
}

/**
 * getVideo
 * @function getVideo
 */
function getVideo() {
    return {
        attributes: {
            autoplay: JSC.boolean()(),
            toolbarHeight: JSC.integer(10, 50)(),
            mp4: urlGenerator('mp4'),
            ogv: urlGenerator('ogv'),
            wbem: urlGenerator('wbem'),
        },
        id: new ObjectId().toString(),
        rotate: angleGenerator(),
        tool: 'video',
        ...boxGenerator(),
    };
}

/**
 * componentGenerator
 * @type {{image: *, textbox: *, label: *}}
 */
const componentGenerator = {
    // dummy: getDummy,
    image: getImage,
    label: getLabel, // <- always keep
    // quiz: getQuiz,
    textbox: getTextBox,
};

/**
 * getComponentArray
 * @function getComponentArray
 */
function getComponentArray() {
    let ret = [];
    const generators = [];
    Object.keys(componentGenerator).forEach((key) => {
        // This ensures we only create components for registered tools
        if (tools(key) instanceof BaseTool) {
            if (key === 'label') {
                // First component is always a label for some tests
                ret.push(getLabel());
            } else {
                generators.push(componentGenerator[key]);
            }
        }
    });
    const { length } = generators;
    if (length) {
        ret = ret.concat(
            JSC.array(
                JSC.number(1, Math.min(length, 3)),
                JSC.one_of(generators)
            )()
        );
    }
    return ret;
}

/**
 * getPage
 * @function getPage
 */
function getPage() {
    return {
        components: getComponentArray(),
        explanations: textGenerator(),
        id: new ObjectId().toString(),
        instructions: textGenerator(),
        style: styleGenerator(),
        time: JSC.integer(10, 100)(),
    };
}

/**
 * getPageArray
 * @function getPageArray
 */
function getPageArray() {
    return JSC.array(JSC.number(3, 5), getPage)();
}

/**
 * getStream
 * @function getStream
 * @returns {{}}
 */
function getStream() {
    return {
        pages: getPageArray(),
    };
}

/**
 * Export
 */
export {
    // -- Tools
    getAudio,
    getCharGrid,
    getChart,
    getConnector,
    getDropZone,
    getDummy,
    getHighLighter,
    getImage,
    getImageSet,
    getLabel,
    getLatex,
    getLine,
    getMathInput,
    getMultiQuiz,
    getNumericBox,
    getQuiz,
    getSelector,
    getShape,
    getTable,
    getTextArea,
    getTextBox,
    getTextGaps,
    getVariable,
    getVideo,
    // -- Generic
    componentGenerator,
    getComponentArray,
    getPage,
    getPageArray,
    getStream,
    getValidationLibrary,
};
