/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import CONSTANTS from '../common/window.constants.es6';
import i18n from '../common/window.i18n.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.pointer)) {
    $.extend(true, i18n(), {
        tools: {
            pointer: {
                name: 'Pointer',
                description: 'Pointer',
                help: ''
            }
        }
    });
}

/**
 * @class PointerTool
 */
const PointerTool = BaseTool.extend({
    id: TOOLS.POINTER,
    icon: 'mouse_pointer',
    cursor: CONSTANTS.DEFAULT_CURSOR,
    name: i18n().tools.pointer.name,
    description: i18n().tools.pointer.description,
    help: i18n().tools.pointer.help,
    height: 0,
    width: 0,
    getHtmlContent: undefined
});

/**
 * Registration
 */
tools.register(PointerTool);
