/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import ObjectId from '../common/pongodb.objectid.es6';
import { randomVal } from '../common/window.util.es6';
import '../app/app.tools.es6';
// import tools from '../tools/tools.es6';
// import BaseTool from '../tools/tools.base.es6';

/**
 * getComponentArray
 * @function getComponentArray1
 */
export function getComponentArray() {
    return [
        {
            id: new ObjectId().toString(),
            tool: 'image',
            top: 50,
            left: 100,
            height: 250,
            width: 250,
            rotate: 45,
            attributes: {
                src:
                    'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png'
            }
        },
        /*
        {
            id: new ObjectId().toString(),
            tool : 'audio',
            top: 300,
            left : 500,
            height: 100,
            width: 500,
            rotate: 0,
            attributes: {
                autoplay: false,
                mp3: '',
                ogg: ''
            }
        },
        */
        {
            id: new ObjectId().toString(),
            tool: 'label',
            top: 250,
            left: 500,
            height: 100,
            width: 300,
            rotate: 90,
            attributes: {
                style:
                    'font-family: Georgia; font-style: italic; color: #FF0000;',
                text: 'World'
            }
        },
        {
            id: new ObjectId().toString(),
            tool: 'quiz',
            top: 300,
            left: 300,
            height: 250,
            width: 250,
            rotate: 315,
            attributes: {
                data: 'a\nb\nc\nd\n',
                activeStyle: '',
                itemStyle: '',
                groupStyle: 'font-size: 30px; text-decoration: underline;'
            }
        },
        {
            id: new ObjectId().toString(),
            tool: 'textbox',
            top: 20,
            left: 20,
            height: 100,
            width: 300,
            rotate: 0,
            attributes: {},
            properties: {
                name: randomVal()
            }
        }
    ];
}

export function noop() {}
