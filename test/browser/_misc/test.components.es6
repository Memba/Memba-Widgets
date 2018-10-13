/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import JSC from 'jscheck';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';
import { randomVal } from '../../../src/js/common/window.util.es6';
import { error2xhr } from '../../../src/js/data/data.util.es6';
import tools from '../../../src/js/tools/tools.es6';
import BaseTool from '../../../src/js/tools/tools.base.es6';

// Note: floating numbers generate errors due to changes in the last digit
const angleGenerator = JSC.integer(0, 360);
const positionGenerator = JSC.integer(0, 500);
const styleGenerator = () =>
    `${[
        'background-color: #ffffff',
        'border: solid 1px #000000',
        'color: #ff0000',
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

/**
 * getImage
 * @function getImage
 */
export function getImage() {
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
 * getLabel
 * @function getLabel
 */
export function getLabel() {
    return {
        attributes: {
            style: styleGenerator(),
            text: JSC.string()()
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
 * getTextBox
 * @function getTextBox
 */
export function getTextBox() {
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

const componentGenerator = {
    image: getImage,
    label: getLabel, // <- always keep
    textbox: getTextBox
};

/**
 * getComponentArray
 * @function getComponentArray
 */
export function getComponentArray() {
    let ret = [];
    const generators = [];
    Object.keys(componentGenerator).forEach(key => {
        // This ensures we only create components for registered tools
        if (tools[key] instanceof BaseTool) {
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
export function getPage() {
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
export function getPageArray() {
    return JSC.array(JSC.number(3, 5), getPage)();
}

/**
 * getStream
 * @function getStream
 * @returns {{}}
 */
export function getStream() {
    return {
        pages: getPageArray()
    };
}

/**
 * getSpyingTransport
 * @function getSpyingTransport
 * @param data
 * @param spies
 * @returns {*}
 */
export function getSpyingTransport(data, spies = {}) {
    return {
        create(options) {
            const resp = Object.assign(options.data, {
                id: new ObjectId().toString()
            });
            if (typeof spies.create === 'function') {
                spies.create(resp);
            }
            options.success(options.data);
        },
        destroy(options) {
            if (typeof spies.destroy === 'function') {
                spies.destroy(options.data);
            }
            options.success(options.data);
        },
        read(options) {
            const resp = { data, total: data.length };
            if (typeof spies.read === 'function') {
                spies.read(resp);
            }
            options.success(resp);
        },
        update(options) {
            if (typeof spies.update === 'function') {
                spies.update(options.data);
            }
            options.success(options.data);
        }
    };
}

/**
 * getErrorTransport
 * @function getErrorTransport
 * @param data
 * @returns {*}
 */
export function getErrorTransport() {
    return {
        create(options) {
            options.error(error2xhr(new Error('Create error')));
        },
        destroy(options) {
            options.error(error2xhr(new Error('Destroy error')));
        },
        read(options) {
            options.error(error2xhr(new Error('Read error')));
        },
        update(options) {
            options.error(error2xhr(new Error('Update error')));
        }
    };
}
