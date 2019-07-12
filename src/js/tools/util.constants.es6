/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

const TOOLS = {
    ACTIVE: 'active',

    KENDO_VAR: '#: $1 #',

    LIB_COMMENT: '// ',
    LIB_PARAMS: ' [{0}]',

    MEDIUM_GREY: '#808080',

    POINTER: 'pointer',

    RX_COLOR: /#[0-9a-f]{3}([0-9a-f]{3})?/i,
    RX_CONSTANT: /\S+/i,
    RX_DATA: /\S+/i,
    RX_FONT_SIZE: /font(-size)?:[^;]*[0-9]+px/,
    RX_IMAGE: /^(cdn|data):\/\/[\s\S]+.(gif|jpe?g|png|svg)$/i,
    RX_MUSTACHE_VAR: /{{(\s*[^}]+\s*)}}/g,
    RX_NAME: /val_[0-9a-f]{6}/,
    RX_QUESTION: /\S+/i,
    RX_SOLUTION: /\S+/i,
    RX_STYLE: /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i,
    RX_TEST_FIELD_NAME: /^val_[a-z0-9]{6}$/,
    RX_TEXT: /\S+/i, // RX_TEXT: /\S[\s\S]{0, 99}/
    RX_VALIDATION_FORMULA: /^function[\s]+validate[\s]*\([\s]*value[\s]*,/,
    // RX_VALIDATION_LIBRARY: /^\/\/ ([^\s[\n]+)( \[([^\n]+)])?$/,
    RX_VALIDATION_LIBRARY: /^\/\/ ([^\s[\n]+)( (\[[^\n]+]))?$/,
    // RX_VALIDATION_CUSTOM: /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*{[\s\S]*}$/,
    // RX_VALIDATION_CUSTOM: /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/,
    RX_VALIDATION_CUSTOM: /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/,
    RX_VARIABLE: /\w+/,

    STAGE_MODES: {
        DESIGN: 'design',
        PLAY: 'play',
        REVIEW: 'review'
    },

    VALIDATION_CUSTOM: 'function validate(value, solution, all) {\n\t{0}\n}',
    VALIDATION_LIBRARY_SOLUTION:
        'function validate(value, solution) {\n\t{0}\n}',
    VALIDATION_LIBRARY_PARAMS: 'function validate(value, params) {\n\t{0}\n}'
};

/**
 * Default export
 */
export default TOOLS;
