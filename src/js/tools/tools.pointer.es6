/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
            description: 'Pointer'
        }
    );
}

/**
 * @class Pointer
 */
const Pointer = BaseTool.extend({
    id: CONSTANTS.POINTER,
    icon: 'mouse_pointer',
    description: i18n().description,
    cursor: CONSTANTS.DEFAULT_CURSOR,
    height: 0,
    width: 0,
    getHtmlContent: undefined
});

/**
 * Registration
 */
tools.register(Pointer);
