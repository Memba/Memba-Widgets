/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: this is tools.variable.es6

import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import NumberAdapter from './adapters.number.es6';
import TextAdapter from './adapters.textbox.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';

const { ns } = window.kendo;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).random || {
            name: 'Random',
            description: 'Random',
            help: '',
            properties: {
                constant: '',
                min: '',
                max: '',
                decimals: ''
            }
        }
    );
}

/**
 * @class RandomTool
 */
const RandomTool = BaseTool.extend({
    id: 'random',
    icon: 'magic_wand',
    cursor: CONSTANTS.DEFAULT_CURSOR,
    name: i18n().name,
    description: i18n().description,
    help: i18n().help,
    height: 64,
    width: 64,
    templates: {
        default: `<img src="#: src$() #" alt="#: attributes.alt #" class="#: class$() #" style="#: attributes.style #" data-${ns}id="#: id$() #">`
    },
    properties: {
        constant: new TextAdapter({
            title: i18n().properties.constant.title
        }),
        min: new NumberAdapter({
            title: i18n().properties.min.title,
            defaultValue: Number.MIN_VALUE
        }),
        max: new NumberAdapter({
            title: i18n().properties.max.title,
            defaultValue: Number.MAX_VALUE
        }),
        decimals: new NumberAdapter({
            title: i18n().properties.decimals.title,
            defaultValue: 0
        })
    },
    getHtmlContent(component, mode) {
        // TODO Display none
        return '';
    }
});

/**
 * Registration
 */
tools.register(RandomTool);
