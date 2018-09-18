/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


var SELECTOR = '<div data-#= ns #role="selector" data-#= ns #id="#: properties.name #" data-#= ns #shape="#: attributes.shape #" data-#= ns #stroke="{ color: \'#: attributes.color #\', dashType: \'solid\', opacity: 1, width: \'#: attributes.strokeWidth #\' }" data-#= ns #empty="#: attributes.empty #" data-#= ns #hit-radius="#: attributes.hitRadius #" {0}></div>';
/**
 * @class Selector tool
 * @type {void|*}
 */
var Selector = Tool.extend({
    id: 'selector',
    icon: 'selector',
    description: i18n.selector.description,
    cursor: CURSOR_CROSSHAIR,
    weight: 1,
    templates: {
        design: '<img src="https://cdn.kidoju.com/images/o_collection/svg/office/selector.svg" alt="selector">',
        // design: '<img src="#: icon$() #" alt="#: description$() #">',
        play: kendo.format(SELECTOR, 'data-#= ns #toolbar="\\#floating .kj-floating-content" data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
        review: kendo.format(SELECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + Tool.fn.showResult()
    },
    height: 50,
    width: 50,
    attributes: {
        color: new adapters.ColorAdapter({ title: i18n.selector.attributes.color.title, defaultValue: '#FF0000' }),
        empty: new adapters.StringAdapter({ title: i18n.selector.attributes.empty.title }),
        hitRadius: new adapters.NumberAdapter({ title: i18n.selector.attributes.hitRadius.title, defaultValue: 15 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 15, 'data-max': 999 }),
        shape: new adapters.EnumAdapter(
            { title: i18n.selector.attributes.shape.title, defaultValue: 'circle', enum: ['circle', 'cross', 'rect'] },
            { style: 'width: 100%;' }
        ),
        strokeWidth: new adapters.NumberAdapter({ title: i18n.selector.attributes.strokeWidth.title, defaultValue: 12 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 50 })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.selector.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.selector.properties.question.title }),
        solution: new adapters.StringArrayAdapter({ title: i18n.selector.properties.solution.title }),
        validation: new adapters.ValidationAdapter({ title: i18n.selector.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.selector.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.selector.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.selector.properties.omit.title, defaultValue: 0 }),
        disabled: new adapters.DisabledAdapter({ title: i18n.selector.properties.disabled.title, defaultValue: false })
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
        var content = stageElement.children('div[' + kendo.attr('role') + '="selector"]');
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        // Redraw the selector widget
        // var selectorWidget = content.data('kendoSelector');
        // assert.instanceof(kendo.ui.Selector, selectorWidget, assert.format(assert.messages.instanceof.default, 'selectorWidget', 'kendo.ui.Selector'));
        // selectorWidget._drawPlaceholder();

        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Improved display of value in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    value$: function (testItem) {
        if (testItem.result) {
            return kendo.htmlEncode(testItem.solution || '');
        } else {
            return 'N/A'; // TODO translate
        }
    },

    /**
     * Improved display of solution in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    solution$: function (testItem) {
        return kendo.htmlEncode(testItem.solution || '');
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
            !RX_COLOR.test(component.attributes.color)) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidColor, description, pageIdx + 1)
            });
        }
        // TODO: We should have a generic validation for  enumerators
        if (!component.attributes || ['circle', 'cross', 'rect'].indexOf(component.attributes.shape) === -1) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidShape, description, pageIdx + 1)
            });
        }
        // TODO: Check selectors on top of static images and labels
        return ret;
    }

});
tools.register(Selector);
