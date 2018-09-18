/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


/**
 * @class Static table tool
 * @type {void|*}
 */
var Table = Tool.extend({
    id: 'table',
    icon: 'table',
    description: i18n.table.description,
    cursor: CURSOR_CROSSHAIR,
    templates: {
        default: '<div data-#= ns #role="table" style="#: attributes.style #" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #value="#: JSON.stringify(attributes.data) #"></div>'
    },
    height: 350,
    width: 600,
    attributes: {
        columns: new adapters.NumberAdapter({ title: i18n.table.attributes.columns.title, defaultValue: 4 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
        rows: new adapters.NumberAdapter({ title: i18n.table.attributes.rows.title, defaultValue: 6 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
        data: new adapters.TableAdapter({ title: i18n.table.attributes.data.title, defaultValue: { sheets: [{ rows: [{ index:0, cells: [{ index:0, value: 'Table', fontSize: 48 }] }] }] } })
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children(kendo.roleSelector('table'));
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
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
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
            // TODO validate columns, rows and data
        }
        return ret;
    }

});
tools.register(Table);
