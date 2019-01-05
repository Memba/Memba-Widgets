/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import CONSTANTS from '../common/window.constants.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).pointer || {
            name: 'Pointer',
            description: 'Pointer',
            help: ''
        }
    );
}

/**
 * @class PointerTool
 */
const PointerTool = BaseTool.extend({
    id: CONSTANTS.POINTER,
    icon: 'mouse_pointer',
    cursor: CONSTANTS.DEFAULT_CURSOR,
    name: i18n().name,
    description: i18n().description,
    help: i18n().help,
    height: 0,
    width: 0,
    getHtmlContent: undefined
});

/**
 * Registration
 */
tools.register(PointerTool);
