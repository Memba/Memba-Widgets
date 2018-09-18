/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

var CHARGRID = '<div data-#= ns #role="chargrid" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #blank="#: attributes.blank #" data-#= ns #whitelist="#: attributes.whitelist #" data-#= ns #grid-fill="#: attributes.gridFill #" data-#= ns #grid-stroke="#: attributes.gridStroke #" data-#= ns #blank-fill="#: attributes.gridStroke #" data-#= ns #selected-fill="#: attributes.selectedFill #" data-#= ns #locked-fill="#: attributes.lockedFill #" data-#= ns #locked-color="#: attributes.fontColor #" data-#= ns #value-color="#: attributes.fontColor #" {0}></div>';
/**
 * @class CharGrid tool
 * @type {void|*}
 */
var CharGrid = Tool.extend({
    id: 'chargrid',
    icon: 'dot_matrix',
    description: i18n.chargrid.description,
    cursor: CURSOR_CROSSHAIR,
    weight: 8,
    templates: {
        design: kendo.format(CHARGRID, 'data-#= ns #value="#: JSON.stringify(attributes.layout) #" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"'),
        play: kendo.format(CHARGRID, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #"'),
        review: kendo.format(CHARGRID, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"') + Tool.fn.showResult()
    },
    height: 400,
    width: 400,
    attributes: {
        columns: new adapters.NumberAdapter({ title: i18n.chargrid.attributes.columns.title, defaultValue: 9 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
        rows: new adapters.NumberAdapter({ title: i18n.chargrid.attributes.rows.title, defaultValue: 9 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
        blank: new adapters.StringAdapter({ title: i18n.chargrid.attributes.blank.title, defaultValue: '.' }),
        whitelist: new adapters.StringAdapter({ title: i18n.chargrid.attributes.whitelist.title, defaultValue: '1-9' }),
        layout: new adapters.CharGridAdapter({ title: i18n.chargrid.attributes.layout.title, defaultValue: null }),
        gridFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.gridFill.title, defaultValue: '#ffffff' }),
        gridStroke: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.gridStroke.title, defaultValue: '#000000' }),
        // blankFill = gridStroke
        selectedFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.selectedFill.title, defaultValue: '#ffffcc' }),
        lockedFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.lockedFill.title, defaultValue: '#e6e6e6' }),
        // lockedColor = valueColor = fontColor
        fontColor: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.fontColor.title, defaultValue: '#9999b6' })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.chargrid.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.chargrid.properties.question.title }),
        solution: new adapters.CharGridAdapter({ title: i18n.chargrid.properties.solution.title }),
        validation: new adapters.ValidationAdapter({ title: i18n.chargrid.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.omit.title, defaultValue: 0 })
    },

    /**
     * Pretiffy array for results grid
     * @param arr
     * @private
     */
    _prettify: function (arr) {
        // var ret = '<table>';
        var ret = '';
        if ($.isArray(arr) || arr instanceof ObservableArray) {
            for (var r = 0, rowTotal = arr.length; r < rowTotal; r++) {
                var row = arr[r];
                // ret += '<tr>';
                for (var c = 0, colTotal = row.length; c < colTotal; c++) {
                    // ret += '<td>' + kendo.htmlEncode(row[c] || '') + '</td>';
                    ret += kendo.htmlEncode(row[c] || '') + (c === colTotal - 1 ? '' : ',');
                }
                // ret += '</tr>';
                ret += '<br/>';
            }
        }
        // ret += '</table>';
        return ret;
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$: function (testItem) {
        return this._prettify(testItem.value);
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$: function (testItem) {
        return this._prettify(testItem.solution);
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
        var content = stageElement.children('div.kj-chargrid');
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        // Redraw the charGrid widget
        var charGridWidget = content.data('kendoCharGrid');
        assert.instanceof(kendo.ui.CharGrid, charGridWidget, assert.format(assert.messages.instanceof.default, 'charGridWidget', 'kendo.ui.CharGrid'));
        charGridWidget.refresh();
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    }

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    /*
     validate: function (component, pageIdx) {
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (component.attributes) {
            // TODO
        }
        return ret;
     }
     */

});
tools.register(CharGrid);
