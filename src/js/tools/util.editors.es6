/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Note: kendo widgets are not loaded here

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getRoleBinding } from '../data/data.util.es6';
import input from '../editors/editors.input.es6';
import span from '../editors/editors.span.es6';
import template from '../editors/editors.template.es6';
import textarea from '../editors/editors.textarea.es6';

const { rolesFromNamespaces, mobile, ui } = window.kendo;

/**
 * Standard editors
 */
const editors = {
    input,
    span,
    template,
    textarea
};

/**
 * Improve the editor defined in row
 * @function optimizeEditor
 * @param row
 */
function optimizeEditor(row = {}) {
    /* eslint-disable no-param-reassign */
    assert.isPlainObject(
        row,
        assert.format(assert.messages.isPlainObject.default, 'row')
    );

    // If the field is not editable, use a span
    if (!row.editable) {
        row.editor = editors.span;
        return;
    }

    // INPUT_TYPES = 'color,date,datetime,datetime-local,email,month,number,range,search,tel,text,time,url,week',
    // We have left: button, checkbox, file, hidden, image, password, radio, reset, submit
    // SEE:http://www.w3schools.com/tags/att_input_type.asp

    // If row.editor is a function, there is nothing to optimize
    if ($.isFunction(row.editor)) {
        return;
    }

    // If row editor is a string
    if ($.type(row.editor) === CONSTANTS.STRING) {
        row.editor = row.editor.toLowerCase();

        // If it designates a public well-known editor
        if (row.editor.length && $.isFunction(editors[row.editor])) {
            row.editor = editors[row.editor];
            return;
        }

        // If it designates a kendo UI widget that works with an input html tag
        if (
            [
                'colorpicker',
                'datepicker',
                'datetimepicker',
                'maskedtextbox',
                'multicolumncombobox',
                'multiinput',
                'numerictextbox',
                'rating',
                'slider',
                'switch',
                'timepicker'
            ].indexOf(row.editor) > -1 &&
            (Object.prototype.hasOwnProperty.call(
                rolesFromNamespaces(ui),
                row.editor
            ) ||
                Object.prototype.hasOwnProperty.call(
                    rolesFromNamespaces(mobile.ui),
                    row.editor
                ))
        ) {
            row.attributes = {
                ...row.attributes,
                ...getRoleBinding(row.editor)
            };
            row.editor = editors.input;
            return;
        }

        // If it designates a kendo UI widget that works with a select html tag
        if (
            ['combobox', 'dropdownlist', 'nultiselect'].indexOf(row.editor) >
                -1 &&
            Object.prototype.hasOwnProperty.call(
                rolesFromNamespaces(ui),
                row.editor
            )
        ) {
            row.attributes = {
                ...row.attributes,
                ...getRoleBinding(row.editor)
            };
            row.editor = editors.select;
            return;
        }
    }

    // At this stage, there should be no row editor
    row.editor = undefined;

    // If there is a template, use the corresponding editor
    if ($.type(row.template) === CONSTANTS.STRING && row.template.length) {
        row.editor = editors.template;
        return;
    }

    // Otherwise we can only rely on data type
    switch (row.type) {
        case CONSTANTS.NUMBER:
            row.attributes = {
                ...row.attributes,
                ...getRoleBinding('numerictextbox')
            };
            row.editor = editors.input;
            break;
        case CONSTANTS.BOOLEAN:
            row.attributes = {
                ...row.attributes,
                ...getRoleBinding('switch')
            };
            row.editor = editors.input;
            break;
        case CONSTANTS.DATE:
            row.attributes = {
                ...row.attributes,
                ...getRoleBinding('datepicker')
            };
            row.editor = editors.input;
            break;
        default:
            // CONSTANTS.STRING
            row.attributes = {
                type: 'text',
                ...row.attributes
            };
            row.editor = editors.input;
    }
    /* eslint-enable no-param-reassign */
}

/**
 * Default export
 */
export default optimizeEditor;
