/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Resources
 */
const res = {
    // basetool
    basetool: {
        top: { title: 'Top' },
        left: { title: 'Left' },
        height: { title: 'Height' },
        width: { title: 'Width' },
        rotate: { title: 'Rotate' },
        icons: {
            // Incors O-Collection check.svg
            // success: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
            success:
                'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+',

            // Incors O-Collection delete.svg
            // failure: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>',
            failure:
                'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+',

            // Incors O-Collection sign_warning.svg
            // warning: '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" clip-rule="evenodd" viewBox="0 0 10240 10240"><path fill="#EDC87E" d="M5680 1282l3846 6712c117 205 117 439 0 644s-319 322-554 322H1281c-234 0-436-117-553-322s-117-439 0-644l3846-6712c117-205 318-322 553-322s436 117 553 322zm-560 318L1280 8320h7680L5120 1600z"/><path fill="gray" d="M5120 6720c353 0 640 287 640 640s-287 640-640 640-640-287-640-640 287-640 640-640zm-320-2880h640c176 0 320 144 320 320v802c0 110-12 204-38 311l-252 1006c-18 72-81 121-155 121h-390c-74 0-137-49-155-121l-252-1006c-26-107-38-201-38-311v-802c0-176 144-320 320-320z"/></svg>',
            warning:
                'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY2xpcC1ydWxlPSJldmVub2RkIiB2aWV3Qm94PSIwIDAgMTAyNDAgMTAyNDAiPjxwYXRoIGZpbGw9IiNFREM4N0UiIGQ9Ik01NjgwIDEyODJsMzg0NiA2NzEyYzExNyAyMDUgMTE3IDQzOSAwIDY0NHMtMzE5IDMyMi01NTQgMzIySDEyODFjLTIzNCAwLTQzNi0xMTctNTUzLTMyMnMtMTE3LTQzOSAwLTY0NGwzODQ2LTY3MTJjMTE3LTIwNSAzMTgtMzIyIDU1My0zMjJzNDM2IDExNyA1NTMgMzIyem0tNTYwIDMxOEwxMjgwIDgzMjBoNzY4MEw1MTIwIDE2MDB6Ii8+PHBhdGggZmlsbD0iZ3JheSIgZD0iTTUxMjAgNjcyMGMzNTMgMCA2NDAgMjg3IDY0MCA2NDBzLTI4NyA2NDAtNjQwIDY0MC02NDAtMjg3LTY0MC02NDAgMjg3LTY0MCA2NDAtNjQwem0tMzIwLTI4ODBoNjQwYzE3NiAwIDMyMCAxNDQgMzIwIDMyMHY4MDJjMCAxMTAtMTIgMjA0LTM4IDMxMWwtMjUyIDEwMDZjLTE4IDcyLTgxIDEyMS0xNTUgMTIxaC0zOTBjLTc0IDAtMTM3LTQ5LTE1NS0xMjFsLTI1Mi0xMDA2Yy0yNi0xMDctMzgtMjAxLTM4LTMxMXYtODAyYzAtMTc2IDE0NC0zMjAgMzIwLTMyMHoiLz48L3N2Zz4=',
        },
    },

    // validation messages
    messages: {
        invalidAltText:
            'A(n) {0} on page {1} requires some alternate text in display attributes.',
        invalidAudioFile:
            'A(n) {0} on page {1} requires an mp3 file in display attributes.',
        invalidColor:
            'A(n) {0} on page {1} has an invalid color in display attributes.',
        invalidData:
            'A(n) {0} on page {1} requires values in display attributes.',
        invalidQuestion:
            'A(n) {0} named `{1}` on page {2} requires a question in test logic.',
        invalidConstant:
            'A(n) {0} on page {1} requires a constant in test logic.',
        invalidFailure:
            'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
        invalidFormula:
            'A(n) {0} on page {1} requires a formula in display attributes.',
        invalidImageFile:
            'A(n) {0} on page {1} requires an image file in display attributes.',
        invalidName: 'A(n) {0} named `{1}` on page {2} has an invalid name.',
        invalidShape:
            'A(n) {0} named `{1}` on page {2} requires a shape in display attributes.',
        invalidSolution:
            'A(n) {0} named `{1}` on page {2} requires a solution in test logic.',
        invalidStyle:
            'A(n) {0} on page {1} has an invalid style in display attributes.',
        invalidSuccess:
            'A(n) {0} named `{1}` on page {2} has a success score lower than the omit score or zero in test logic.',
        invalidText:
            'A(n) {0} on page {1} requires some text in display attributes.',
        invalidValidation:
            'A(n) {0} named `{1}` on page {2} requires a validation formula in test logic.',
        invalidVideoFile:
            'A(n) {0} on page {1} requires an mp4 file in display attributes.',
    },

    // audio
    audio: {
        description: 'Audio Player',
        help: 'TODO',
        icon: 'loudspeaker3',
        name: 'Audio Player',
        attributes: {
            autoplay: { title: 'Autoplay' },
            mp3: { title: 'MP3 File' },
            ogg: { title: 'OGG File' },
        },
    },

    // chargrid
    chargrid: {
        description: 'Character Grid',
        help: 'TODO',
        icon: 'dot_matrix',
        name: 'Character Grid',
        // Attributes
        attributes: {
            blank: { title: 'Blank' },
            // blankFill = gridStroke,
            columns: { title: 'Columns' },
            fontColor: { title: 'Font Color' },
            gridFill: { title: 'Grid Fill' },
            gridStroke: { title: 'Grid Stroke' },
            layout: { title: 'Layout' },
            // lockedColor = valueColor = fontColor,
            lockedFill: { title: 'Locked Fill' },
            rows: { title: 'Rows' },
            selectedFill: { title: 'Selection Fill' },
            whitelist: { title: 'Whitelist' },
        },
        // Properties
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
        },
    },

    // chart
    chart: {
        description: 'Chart',
        help: 'TODO',
        icon: 'chart_area',
        name: 'Chart',
        attributes: {
            categories: { title: 'Categories' },
            data: {
                help: 'Enter chart data',
                title: 'Data',
            },
            legend: {
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Top', value: 'top' },
                    { text: 'Bottom', value: 'bottom' },
                    { text: 'Left', value: 'left' },
                    { text: 'Right', value: 'right' },
                ],
                title: 'Legend',
            },
            style: { title: 'Style' },
            title: { title: 'Title' },
            type: {
                help: 'Enter a chart type',
                source: [
                    { text: 'Area', value: 'area' },
                    { text: 'Bar', value: 'bar' },
                    { text: 'Column', value: 'column' },
                    { text: 'Line', value: 'line' },
                    { text: 'Radar Area', value: 'radarArea' },
                    { text: 'Radar Column', value: 'radarColumn' },
                    { text: 'Radar Line', value: 'radarLine' },
                    { text: 'Smooth Line', value: 'smoothLine' },
                    { text: 'Stack Bar', value: 'stackBar' },
                    { text: 'Waterfall', value: 'waterfall' },
                    { text: 'Vertical Area', value: 'verticalArea' },
                    { text: 'Vertical Line', value: 'verticalLine' },
                ],
                title: 'Type',
            },
            values: { title: 'Values' },
        },
    },

    // connector
    connector: {
        description: 'Connector',
        help: 'TODO',
        icon: 'target',
        name: 'Connector',
        attributes: {
            color: { title: 'Color' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
            disabled: { title: 'Disabled' },
        },
    },

    // dropzone
    dropzone: {
        description: 'Drop Zone: <em>#: attributes.text #</em>',
        help: 'TODO',
        icon: 'elements_selection',
        name: 'Drop Zone',
        attributes: {
            center: {
                defaultValue: false,
                title: 'Centre',
            },
            empty: { title: 'Empty' },
            style: { title: 'Style' },
            text: {
                defaultValue: 'Please drop here.',
                title: 'Text',
            },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
            disabled: { title: 'Disabled' },
        },
    },

    // dummy
    dummy: {
        description: 'Dummy tool',
        help: 'No help for a dummy tool',
        icon: 'astrologer',
        name: 'Dummy',
    },

    // highlighter
    highlighter: {
        description: 'Highlighter',
        help: 'TODO',
        icon: 'marker',
        name: 'Highlighter',
        attributes: {
            highlightStyle: { title: 'Highlight' },
            split: { title: 'Split' },
            style: { title: 'Style' },
            text: {
                defaultValue: 'Some text you can highlight.',
                title: 'Text',
            },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
        },
    },

    // image
    image: {
        description: 'Image: <em>#: attributes.alt #</em>',
        help: 'TODO',
        icon: 'painting_landscape',
        name: 'Image',
        attributes: {
            alt: {
                defaultValue: 'Image',
                help: 'Enter alternate text for disabled people',
                title: 'Text',
            },
            src: {
                defaultValue:
                    'cdn://images/o_collection/svg/office/painting_landscape.svg',
                help: 'Select an image',
                title: 'Source',
            },
            style: { title: 'Style' },
        },
        properties: {
            behavior: {
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Draggable', value: 'draggable' },
                    { text: 'Selectable', value: 'selectable' },
                ],
                title: 'Behaviour',
            },
            constant: { title: 'Constant' },
        },
    },

    // imageset
    imageset: {
        description: 'Image Set',
        help: 'TODO',
        icon: 'photos',
        name: 'Image Set',
        attributes: {
            data: {
                defaultValue: [
                    {
                        text: 'Image set',
                        url: 'cdn://images/o_collection/svg/office/photos.svg',
                    },
                ],
                title: 'Images',
            },
            style: { title: 'Style' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
        },
    },

    // label
    label: {
        description: 'Label: <em>#: attributes.text #</em>',
        help: 'TODO',
        icon: 'font',
        name: 'Label',
        attributes: {
            style: { title: 'Style' },
            text: {
                defaultValue: 'Label',
                help: 'Enter the label text',
                title: 'Text',
            },
        },
        properties: {
            behavior: {
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Draggable', value: 'draggable' },
                    { text: 'Selectable', value: 'selectable' },
                ],
                title: 'Behaviour',
            },
            constant: { title: 'Constant' },
        },
    },

    // latex
    latex: {
        description: 'Mathematic Expression',
        help: 'TODO',
        icon: 'formula',
        name: 'Mathematic Expression',
        attributes: {
            formula: {
                defaultValue: '\\sum_{n=1}^{\\infty}2^{-n}=1',
                title: 'Formula',
            },
            inline: {
                defaultValue: false, // TODO
                title: 'Inline',
            },
            style: { title: 'Style' },
        },
        properties: {
            behavior: {
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Draggable', value: 'draggable' },
                    { text: 'Selectable', value: 'selectable' },
                ],
                title: 'Behaviour',
            },
            constant: { title: 'Constant' },
        },
    },

    // line
    line: {
        description:
            'Line: <div style="background-color: #: attributes.lineColor #; display: inline-block; height: 1em; width: 1em; vertical-align: top;"/>',
        help: 'TODO',
        icon: 'vector_line',
        name: 'Line',
        attributes: {
            endCap: {
                title: 'End Type',
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Arrow', value: 'arrow' },
                    { text: 'Circle', value: 'circle' },
                    { text: 'Diamond', value: 'diamond' },
                    { text: 'Square', value: 'square' },
                ],
            },
            lineColor: {
                help: 'Select a color for the line',
                title: 'Color',
            },
            lineWidth: {
                help: 'Enter a number for the thickness of the line',
                title: 'Thickness',
            },
            startCap: {
                title: 'Begin Type',
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Arrow', value: 'arrow' },
                    { text: 'Circle', value: 'circle' },
                    { text: 'Diamond', value: 'diamond' },
                    { text: 'Square', value: 'square' },
                ],
            },
        },
        properties: {},
    },

    // mathinput
    mathinput: {
        description: 'Math input',
        help: 'TODO',
        icon: 'formula_input',
        name: 'Math input',
        attributes: {},
        properties: {},
    },

    // multiquiz
    multiquiz: {
        description: 'MultiQuiz: <em>#: properties.name #</em>',
        help: 'TODO',
        icon: 'checkbox_group',
        name: 'MultiQuiz',
        attributes: {
            data: {
                defaultValue: [
                    {
                        text: 'Option 1',
                        url:
                            'cdn://images/o_collection/svg/office/hand_count_one.svg',
                    },
                    {
                        text: 'Option 2',
                        url:
                            'cdn://images/o_collection/svg/office/hand_point_up.svg',
                    },
                ],
                help: 'Enter the answers to choose from',
                title: 'Values',
            },
            groupStyle: { title: 'Group Style' },
            itemStyle: { title: 'Item Style' },
            mode: {
                help: 'Enter a display mode',
                source: [
                    { text: 'Button', value: 'button' },
                    { text: 'Checkbox', value: 'checkbox' },
                    { text: 'Image', value: 'image' },
                    { text: 'Link', value: 'link' },
                    { text: 'Multiselection', value: 'multiselect' },
                ],
                title: 'Mode',
            },
            selectedStyle: { title: 'Selection Style' },
            shuffle: { title: 'Shuffle' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
        },
    },

    // numericbox
    numericbox: {
        description: 'Numeric Box',
        help: 'TODO',
        icon: 'odometer',
        name: 'Numeric Box',
        attributes: {
            decimals: { title: 'Decimals' },
            min: { title: 'Minimum' },
            max: { title: 'Maximum' },
            style: { title: 'Style' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
        },
    },

    // pointer
    pointer: {
        description: 'Pointer',
        help: 'TODO',
        icon: 'mouse_pointer',
        name: 'Pointer',
    },

    // quiz
    quiz: {
        description: 'Quiz: <em>#: properties.name #</em>',
        help: 'TODO',
        icon: 'radio_button_group',
        name: 'Quiz',
        attributes: {
            data: {
                defaultValue: [
                    {
                        text: 'True',
                        url: 'cdn://images/o_collection/svg/office/ok.svg',
                    },
                    {
                        text: 'False',
                        url: 'cdn://images/o_collection/svg/office/error.svg',
                    },
                ],
                help: 'Enter the answers to choose from',
                title: 'Values',
            },
            groupStyle: { title: 'Group Style' },
            itemStyle: { title: 'Item Style' },
            mode: {
                help: 'Enter a display mode',
                source: [
                    { text: 'Button', value: 'button' },
                    { text: 'Drop-down list', value: 'dropdown' },
                    { text: 'Image', value: 'image' },
                    { text: 'Link', value: 'link' },
                    { text: 'Radio button', value: 'radio' },
                ],
                title: 'Mode',
            },
            selectedStyle: { title: 'Selection Style' },
            shuffle: { title: 'Shuffle' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
        },
    },

    // selector
    selector: {
        description: 'Selector',
        help: 'TODO',
        icon: 'selector',
        name: 'Selector',
        attributes: {
            color: { title: 'Color' },
            shape: {
                source: [
                    { text: 'Circle', value: 'circle' },
                    { text: 'Cross', value: 'cross' },
                    { text: 'Rectangle', value: 'rect' },
                ],
                title: 'Shape',
            },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
            disabled: { title: 'Disabled' },
        },
    },

    // shape
    shape: {
        description:
            'Shape: <div style="background-color: #: attributes.fillColor #; display: inline-block; height: 1em; width: 1em; vertical-align: top;"/>',
        help: 'TODO',
        icon: 'shapes',
        name: 'shape',
        attributes: {
            shape: {
                help: 'Select a shape',
                title: 'Shape',
                source: [
                    { text: 'Ellipsis', value: 'ellipsis' },
                    { text: 'Polygon', value: 'polygon' },
                    { text: 'Rectangle', value: 'rectangle' },
                ],
            },
            angles: {
                help: 'Enter the number of polygon angles',
                title: 'Angles',
            },
            text: {
                help: 'Enter the text to display inside the shape',
                title: 'Text',
            },
            fillColor: {
                help: 'Select a color for the background',
                title: 'Fill Color',
            },
            strokeColor: {
                help: 'Select a color for the border',
                title: 'Border Color',
            },
            strokeWidth: {
                help: 'Enter a number for the width of the border',
                title: 'Border Width',
            },
        },
        properties: {
            behavior: {
                source: [
                    { text: 'None', value: 'none' },
                    { text: 'Draggable', value: 'draggable' },
                    { text: 'Selectable', value: 'selectable' },
                ],
                title: 'Behaviour',
            },
            constant: { title: 'Constant' },
        },
    },

    // table
    table: {
        description: 'Table',
        help: 'TODO',
        icon: 'table',
        name: 'Table',
        attributes: {
            columns: { title: 'Columns' },
            data: { title: 'Data' },
            rows: { title: 'Rows' },
        },
    },

    // textarea
    textarea: {
        description: 'TextArea: <em>#: properties.name #</em>',
        help: 'TODO',
        icon: 'text_area',
        name: 'TextArea',
        attributes: {
            style: { title: 'Style' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
            // disabled: { title: 'Disabled' }
        },
    },

    // textbox
    textbox: {
        description: 'TextBox: <em>#: properties.name #</em>',
        help: 'TODO',
        icon: 'text_field',
        name: 'TextBox',
        attributes: {
            mask: {
                // TODO: Add help
                title: 'Mask',
            },
            style: { title: 'Style' },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
            // disabled: { title: 'Disabled' }
        },
    },

    // textgaps
    textgaps: {
        description: 'Text gaps',
        help: 'TODO',
        icon: 'text_gaps',
        name: 'Text gaps',
        attributes: {
            inputStyle: { title: 'Input Style' },
            style: { title: 'Style' },
            text: {
                title: 'Text',
                defaultValue: 'Some text with gaps like [] or [] to fill.',
            },
        },
        properties: {
            name: { title: 'Name' },
            question: {
                help: 'Enter the question shown in score reports',
                title: 'Question',
            },
            solution: {
                help: 'Enter the solution shown in score reports',
                title: 'Solution',
            },
            validation: { title: 'Validation' },
            success: { title: 'Success' },
            failure: { title: 'Failure' },
            omit: { title: 'Omit' },
            // disabled: { title: 'Disabled' }
        },
    },

    // variable
    variable: {
        description: 'Calculated variable',
        help: 'TODO',
        icon: 'magic_wand',
        name: 'Variable',
        // attributes: {},
        properties: {
            expression: {
                help: 'Enter a calculated expression',
                title: 'Expression',
            },
            variable: {
                help: 'Enter a variable name',
                title: 'Variable',
            },
        },
    },

    // video
    video: {
        description: 'Video Player',
        help: 'TODO',
        icon: 'movie',
        name: 'Video Player',
        attributes: {
            autoplay: { title: 'Autoplay' },
            mp4: { title: 'MP4 File' },
            ogv: { title: 'OGV File' },
            toolbarHeight: { title: 'Toolbar Height' }, // TODO: Make style
            wbem: { title: 'WBEM File' },
        },
    },
};

/**
 * Default export
 */
export default res;
