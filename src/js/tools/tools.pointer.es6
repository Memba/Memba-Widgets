/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
import CONSTANTS from '../common/window.constants.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';

/**
 * @class PointerTool
 */
const PointerTool = BaseTool.extend({
    id: TOOLS.POINTER,
    cursor: CONSTANTS.DEFAULT_CURSOR,
    height: 0,
    width: 0,
    getHtmlContent: undefined,
    onResize: undefined,
});

/**
 * Default eport
 */
export default PointerTool;
