/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import CONSTANTS from '../common/window.constants.es6';
import BaseTool from './tools.base.es6';
import tools from './tools.es6';

/**
 * Pointer
 * @class
 */
class Pointer extends BaseTool {
    /**
     * Constructor
     * @constructor
     */
    constructor() {
        super({
            id: CONSTANTS.POINTER,
            icon: 'mouse_pointer',
            description: 'Pointer',
            cursor: CONSTANTS.DEFAULT_CURSOR,
            height: 0,
            width: 0
        });
    }

    /**
     * getHtmlContent
     */
    // eslint-disable-next-line class-methods-use-this, getter-return, no-empty-function
    get getHtmlContent() {}
}

/**
 * Register tool
 */
tools.register(Pointer);
