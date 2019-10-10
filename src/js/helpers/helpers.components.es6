/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Could be merged with src/js/helpers/helpers.data.es6

import JSC from 'jscheck';
import ObjectId from '../common/window.objectid.es6';
import { randomVal } from '../common/window.util.es6';
import tools from '../tools/tools.es6';
import { BaseTool } from '../tools/tools.base.es6';

// Note: floating numbers generate errors due to changes in the last digit
const angleGenerator = JSC.integer(0, 359);
const positionGenerator = JSC.integer(0, 500);
const quizMode = JSC.one_of(['button', 'dropdown', 'image', 'link', 'radio']);
const styleGenerator = () =>
    `${[
        `background-color: #${JSC.string(
            JSC.integer(6),
            JSC.one_of('0123456789abcdef')
        )()}`,
        'border: solid 1px #000000',
        `color: #${JSC.string(
            JSC.integer(6),
            JSC.one_of('0123456789abcdef')
        )()}`,
        'font-family: Georgia, serif',
        'font-size: 3rem',
        'font-weight: 800',
        'opacity: 0.5'
    ]
        .filter(() => JSC.boolean(2 / 3)())
        .join('; ')};`;
const textGenerator = JSC.string();
const urlGenerator = ext =>
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
    { text: JSC.string()(), url: urlGenerator('png') }
];

/**
 * getAudio
 * @function getAudio
 */
function getAudio() {
    return {
        attributes: {
            autoplay: JSC.boolean()(),
            mp3: urlGenerator('mp3'),
            ogg: urlGenerator('ogg')
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'audio',
        top: positionGenerator(),
        width: positionGenerator()
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
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: [], // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'chartgrid',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getChart
 * @function getChart
 */
function getChart() {
    return {
        attributes: {
            // TODO
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'chart',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getConnector
 * @function getConnector
 */
function getConnector() {
    return {
        attributes: {
            // TODO
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'connector',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getDropZone
 * @function getDropZone
 */
function getDropZone() {
    return {
        attributes: {
            // TODO
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'dropzone',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getDummy
 * @function getDummy
 */
function getDummy() {
    return {
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'dummy',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getHighLighter
 * @function getHighLighter
 */
function getHighLighter() {
    return {
        attributes: {
            // TODO
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: [], // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'highlighter',
        top: positionGenerator(),
        width: positionGenerator()
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
            style: styleGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            behavior: 'none',
            constant: ''
        },
        rotate: angleGenerator(),
        tool: 'image',
        top: positionGenerator(),
        width: positionGenerator()
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
            style: styleGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: data[0].text,
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'imageset',
        top: positionGenerator(),
        width: positionGenerator()
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
            text: JSC.string()().replace(/#/g, '\\#') // Note: avoids breaking kendo templates
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            behavior: 'none',
            constant: ''
        },
        rotate: angleGenerator(),
        tool: 'label',
        top: positionGenerator(),
        width: positionGenerator()
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
            style: styleGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'latex',
        top: positionGenerator(),
        width: positionGenerator()
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
            startCap: 'none'
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'line',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getMathInput
 * @function getMathInput
 */
function getMathInput() {
    return {
        attributes: {
            // TODO
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: '', // TODO
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'mathinput',
        top: positionGenerator(),
        width: positionGenerator()
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
            data
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: data
                .map(item => item.text)
                .filter(JSC.boolean())
                .join('\n'), // Review
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'multiquiz',
        top: positionGenerator(),
        width: positionGenerator()
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
            style: styleGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'numericbox',
        top: positionGenerator(),
        width: positionGenerator()
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
            data
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: data[0].text,
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'quiz',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getSelector
 * @function getSelector
 */
function getSelector() {
    return {
        // TODO
    };
}

/**
 * getTable
 * @function getTable
 */
function getTable() {
    return {
        // TODO
    };
}

/**
 * getTextArea
 * @function getTextArea
 */
function getTextArea() {
    return {
        attributes: {
            style: styleGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'textarea',
        top: positionGenerator(),
        width: positionGenerator()
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
            style: styleGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'textbox',
        top: positionGenerator(),
        width: positionGenerator()
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
            text: 'The quick [] fox is jumping over the [] dog'
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            failure: -JSC.integer(0, 1)(),
            name: randomVal(),
            omit: 0,
            question: textGenerator(),
            solution: textGenerator(),
            success: JSC.integer(0, 3)(),
            validation: '// equal'
        },
        rotate: angleGenerator(),
        tool: 'textgaps',
        top: positionGenerator(),
        width: positionGenerator()
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
            expression: 'round(random(0, 100), 2)'
        },
        // height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'variable',
        top: positionGenerator()
        // width: positionGenerator()
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
            wbem: urlGenerator('wbem')
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        rotate: angleGenerator(),
        tool: 'video',
        top: positionGenerator(),
        width: positionGenerator()
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
    textbox: getTextBox
};

/**
 * getComponentArray
 * @function getComponentArray
 */
function getComponentArray() {
    let ret = [];
    const generators = [];
    Object.keys(componentGenerator).forEach(key => {
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
        time: JSC.integer(10, 100)()
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
        pages: getPageArray()
    };
}

/**
 * Exports
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
    getStream
};
