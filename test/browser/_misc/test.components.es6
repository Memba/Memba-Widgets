/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import JSC from 'jscheck';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

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
            src: urlGenerator('png'),
            alt: textGenerator()
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
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
 * getTexbox
 * @function getTexbox
 */
export function getTexbox() {
    return {
        attributes: {
            // TODO
        },
        height: positionGenerator(),
        id: new ObjectId().toString(),
        left: positionGenerator(),
        properties: {
            name: 'textfield3' // TODO random
        },
        rotate: angleGenerator(),
        tool: 'textbox',
        top: positionGenerator(),
        width: positionGenerator()
    };
}

/**
 * getComponentArray
 * @function getComponentArray
 */
export function getComponentArray() {
    // TODO Randomize
    return [
        // getImage(),
        getLabel()
        // getTextbox()
    ];
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
    return [
        // TODO
    ];
}

/**
 * getStream
 * @function getStream
 * @returns {{}}
 */
export function getStream() {
    return {
        // TODO
    };
}

/**
 * getTransport
 * @function getTransport
 * @param data
 * @returns {*}
 */
export function getTransport(data) {
    return {
        create(options) {
            options.success(
                // TODO: Check whther option.data has an id???
                Object.assign(options.data, { id: new ObjectId().toString() })
            );
        },
        destroy(options) {
            options.success(options.data);
        },
        read(options) {
            options.success({ data, total: data.length });
        },
        update(options) {
            options.success(options.data);
        }
    };
}
