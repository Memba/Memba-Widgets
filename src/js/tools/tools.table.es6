/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import BaseTool from './tools.base.es6';

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).table || {
            // TODO
        }
    );
}

/**
 * @class Static table tool
 * @type {void|*}
 */
var TableTool = BaseTool.extend({
    id: 'table',
    icon: 'table',
    description: i18n.table.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default: '<div data-#= ns #role="table" style="#: attributes.style #" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #value="#: JSON.stringify(attributes.data) #"></div>'
    },
    height: 350,
    width: 600,
    attributes: {
        columns: new NumberAdapter({ title: i18n.table.attributes.columns.title, defaultValue: 4 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
        rows: new NumberAdapter({ title: i18n.table.attributes.rows.title, defaultValue: 6 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
        data: new TableAdapter({ title: i18n.table.attributes.data.title, defaultValue: { sheets: [{ rows: [{ index:0, cells: [{ index:0, value: 'TableTool', fontSize: 48 }] }] }] } })
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`), format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
        var content = stageElement.children(kendo.roleSelector('table'));
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate: function (component, pageIdx) {
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
            // TODO validate columns, rows and data
        }
        return ret;
    }

});

/**
 * Registration
 */
tools.register(TableTool);
