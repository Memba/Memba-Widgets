/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import Stream from './js/data/data.stream.es6';
import './js/app/app.tools.es6'; // Load tools
import ToolAssets from './js/tools/util.assets.es6';

const { localStorage, location } = window;
const { guid, stringify } = window.kendo;
const storageKey = 'integration';

// Data
const data = {
    pages: [
        {
            id: '40365503-413a-49e2-990b-bde37541892b',
            style: '',
            components: [
                {
                    id: 'f96ade80-c6bd-415e-a58e-200097bdc1da',
                    tool: 'label',
                    top: 40,
                    left: 50,
                    height: 205,
                    width: 800,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        text: 'Who painted this self-portrait?',
                        style:
                            'font-family:Georgia, serif;font-size:80px;color:#663300;'
                    }
                },
                {
                    id: '54a74fb1-12f0-43b2-a9ac-b03325624276',
                    tool: 'quiz',
                    top: 310,
                    left: 460,
                    height: 300,
                    width: 500,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        mode: 'radio',
                        groupStyle: '',
                        itemStyle:
                            'font-family:Georgia, serif;color:#663300;font-size:60px;',
                        activeStyle: 'background-color:#c7aa7d;',
                        data: [
                            { text: 'Fernand Léger' },
                            { text: 'Pablo Picasso' },
                            { text: 'George Braque' },
                            { text: 'Paul Cézanne' }
                        ]
                    },
                    properties: {
                        name: 'val_e57345',
                        question: 'Self-portrait',
                        solution: 'Pablo Picasso',
                        validation: '// equal',
                        success: 1,
                        failure: 0,
                        omit: 0
                    }
                },
                {
                    id: 'c971f83d-2dcf-48f4-ab96-7fbbefd870ed',
                    tool: 'image',
                    top: 274,
                    left: 67,
                    height: 450,
                    width: 370,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        src: 'data://self-portrait-1907.jpg',
                        alt: 'Painting Landscape'
                    }
                }
            ]
        },
        {
            id: 'c9caa1a7-8f5f-4b4a-a4dc-c9a98652dc2a',
            style: '',
            components: [
                {
                    id: '31ba6ec9-5b77-45cd-b11f-e659b3a1d8e3',
                    tool: 'textbox',
                    top: 227,
                    left: 637,
                    height: 101,
                    width: 288,
                    rotate: 0,
                    tag: null,
                    attributes: { style: 'font-family:Georgia, serif;' },
                    properties: {
                        name: 'val_1b0890',
                        question: 'Year Elvis dies',
                        solution: '1977',
                        validation: '// equal',
                        success: 1,
                        failure: 0,
                        omit: 0
                    }
                },
                {
                    id: 'ed5d0c8f-7e77-4b57-881a-ec11f76279a2',
                    tool: 'label',
                    top: 61,
                    left: 52,
                    height: 115,
                    width: 932,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        text: 'Which year did Elvis die?',
                        style:
                            'font-family:Georgia, serif;font-size:80px;color:#FF0000;'
                    }
                },
                {
                    id: '285b7355-91dc-447e-869f-3db89d96fac0',
                    tool: 'image',
                    top: 228,
                    left: 54,
                    height: 397,
                    width: 520,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        src: 'data://Elvis.jpg',
                        alt: 'Painting Landscape'
                    }
                }
            ]
        },
        {
            id: '7c187777-deea-41e8-83f4-4b7fab333702',
            style: '',
            components: [
                {
                    id: 'f294c11f-be14-4a93-9123-5748d20e3ee8',
                    tool: 'image',
                    top: 30,
                    left: 343,
                    height: 710,
                    width: 652,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        src: 'data://France-Fleuves-1.png',
                        alt: 'Painting Landscape'
                    }
                },
                {
                    id: '76923b71-d891-4ef7-9090-f2cfe5e14bbb',
                    tool: 'textbox',
                    top: 171,
                    left: 622,
                    height: 60,
                    width: 193,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        style:
                            'color:#0066CC;background-color:#E0F0FF;opacity:0.8;'
                    },
                    properties: {
                        name: 'val_123890',
                        question: 'French river (north)',
                        solution: 'Seine',
                        validation: '// ignoreCaseEqual',
                        success: 0.25,
                        failure: 0,
                        omit: 0
                    }
                },
                {
                    id: '75275998-467d-4374-a6ea-d221b8c14d30',
                    tool: 'textbox',
                    top: 274,
                    left: 576,
                    height: 60,
                    width: 183,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        style:
                            'color:#0066CC;background-color:#E0F0FF;opacity:0.8;'
                    },
                    properties: {
                        name: 'val_5ee0ab',
                        question: 'French river (west)',
                        solution: 'Loire',
                        validation: '// ignoreCaseEqual',
                        success: 0.25,
                        failure: 0,
                        omit: 0
                    }
                },
                {
                    id: 'b1222495-1bc1-41cc-8cc6-086057f769f6',
                    tool: 'label',
                    top: 38,
                    left: 35,
                    height: 695,
                    width: 303,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        text: 'Please name the french rivers on the map',
                        style:
                            'font-family:Georgia, serif;font-size:80px;color:#0066CC;'
                    }
                },
                {
                    id: '6c4dec80-6c44-4fa3-a919-904987ec5094',
                    tool: 'textbox',
                    top: 555,
                    left: 475,
                    height: 60,
                    width: 230,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        style:
                            'color:#0066CC;background-color:#E0F0FF;opacity:0.8;'
                    },
                    properties: {
                        name: 'val_304345',
                        question: 'French river (south-west)',
                        solution: 'Garonne',
                        validation: '// ignoreCaseEqual',
                        success: 0.25,
                        failure: 0,
                        omit: 0
                    }
                },
                {
                    id: 'a08a68d2-7d19-4576-bf61-12f46acaeb02',
                    tool: 'textbox',
                    top: 525,
                    left: 735,
                    height: 60,
                    width: 230,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        style:
                            'color:#0066CC;background-color:#E0F0FF;opacity:0.8;'
                    },
                    properties: {
                        name: 'val_a8aef1',
                        question: 'French river (south-east)',
                        solution: 'Rhône',
                        validation: '// ignoreCaseMatch ["(Rh(o|ô)ne)"]',
                        success: 0.25,
                        failure: 0,
                        omit: 0
                    }
                }
            ]
        },
        {
            id: '82b02398-7810-467c-9328-b554c26d5786',
            style: '',
            components: [
                {
                    id: 'a23a63bb-6dfd-42f4-b828-2995cbe44e51',
                    tool: 'label',
                    top: 60,
                    left: 100,
                    height: 400,
                    width: 820,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        text:
                            '"S.O.S.," the Morse code distress signal, originally stood for "Save Our Ship."',
                        style:
                            'text-align:center;font-family:Georgia, serif;font-size:80px;color:#000000;'
                    }
                },
                {
                    id: '2c64f70f-727e-4d40-a070-2ad675ba4a5f',
                    tool: 'quiz',
                    top: 500,
                    left: 200,
                    height: 140,
                    width: 650,
                    rotate: 0,
                    tag: null,
                    attributes: {
                        mode: 'button',
                        groupStyle: 'font-size:50px;',
                        itemStyle: 'width:300px;',
                        activeStyle: '',
                        data: [{ text: 'True' }, { text: 'False' }]
                    },
                    properties: {
                        name: 'val_667456',
                        question: 'SOS for Save Our Ships',
                        solution: 'False',
                        validation: '// equal',
                        success: 1,
                        failure: 0,
                        omit: 0
                    }
                }
            ]
        }
    ]
};

// LocalStream
const LocalStream = Stream.define({
    _fetchAll() {
        const that = this;
        const dfd = $.Deferred();
        that.pages
            .fetch()
            .then(() => {
                const promises = that.pages
                    .data()
                    // .map(page => page.components.fetch());
                    .map(page => {
                        const d = $.Deferred();
                        page.components
                            .fetch()
                            .then(() => {
                                d.resolve();
                            })
                            .catch(d.reject);
                        return d.promise();
                    });
                $.when(...promises)
                    .then(dfd.resolve)
                    .catch(dfd.reject);
            })
            .catch(dfd.reject);
        return dfd.promise();
    },
    load() {
        const stream = JSON.parse(localStorage.getItem(storageKey)) || {};
        this.accept(stream);
        return this._fetchAll();
    },
    save() {
        const that = this;
        const json = that.toJSON(true);
        json.pages.forEach(page => {
            // eslint-disable-next-line no-param-reassign
            page.id = page.id || guid();
            page.components.forEach(component => {
                // eslint-disable-next-line no-param-reassign
                component.id = component.id || guid();
            });
        });
        localStorage.setItem(storageKey, stringify(json));
        that.accept(json);
        return that._fetchAll();
    }
});

// Store data
LocalStream.reset = force => {
    if (!!force || !localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, stringify(data));
    }
};
LocalStream.reset();

// Schemes
const schemes = {
    cdn: 'https://cdn.kidoju.com/',
    data: `${location.protocol}//${
        location.host
    }/Kidoju.Widgets/test/data/images/miscellaneous/`
};

// Assets
window.app = window.app || {};
window.app.assets = {
    audio: new ToolAssets({
        collections: [],
        extensions: ['.mp3', '.ogg'],
        schemes,
        transport: {}
    }),
    image: new ToolAssets({
        collections: [
            {
                name: 'G-Collection',
                transport: {
                    read:
                        'http://localhost:63342/Kidoju.Widgets/test/data/images/g_collection/svg/all/index.json'
                }
            },
            {
                name: 'O-Collection',
                collections: [
                    {
                        name: 'Dark Grey',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/dark_grey/index.json'
                        }
                    },
                    {
                        name: 'Office',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/office/index.json'
                        }
                    },
                    {
                        name: 'White',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/white/index.json'
                        }
                    }
                ]
            },
            {
                name: 'V-Collection',
                collections: [
                    {
                        name: 'Small',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/32x32/index.json'
                        }
                    },
                    {
                        name: 'Medium',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/64x64/index.json'
                        }
                    },
                    {
                        name: 'Large',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/128x128/index.json'
                        }
                    },
                    {
                        name: 'Huge',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/256x256/index.json'
                        }
                    }
                ]
            },
            {
                name: 'X-Collection',
                collections: [
                    {
                        name: 'Small',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/x_collection/png/32x32/index.json'
                        }
                    },
                    {
                        name: 'Large',
                        transport: {
                            read:
                                'http://localhost:63342/Kidoju.Widgets/test/data/images/x_collection/png/128x128/index.json'
                        }
                    }
                ]
            }
        ],
        extensions: ['.gif', '.jpg', '.png', '.svg'],
        schemes,
        transport: {}
    }),
    video: new ToolAssets({
        collections: [],
        extensions: ['.mp4', '.ogv', '.wbem'],
        schemes,
        transport: {}
    })
};

// Default export
export default LocalStream;
