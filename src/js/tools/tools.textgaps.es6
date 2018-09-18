/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

var TEXTGAPS = '<div data-#= ns #role="textgaps" data-#= ns #text="#: attributes.text #" data-#= ns #input-style="#: attributes.inputStyle #" style="#: attributes.style #" {0}></div>';
/**
 * TextGaps tool
 * @class MultiQuiz
 * @type {void|*}
 */
var TextGaps = Tool.extend({
    id: 'textgaps',
    icon: 'text_gaps',
    description: i18n.textgaps.description,
    cursor: CURSOR_CROSSHAIR,
    weight: 1,
    templates: {
        design: kendo.format(TEXTGAPS, 'data-#= ns #enable="false"'),
        play: kendo.format(TEXTGAPS, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
        review: kendo.format(TEXTGAPS, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
    },
    height: 150,
    width: 420,
    attributes: {
        inputStyle: new adapters.StyleAdapter({ title: i18n.textgaps.attributes.inputStyle.title }),
        style: new adapters.StyleAdapter({ title: i18n.textgaps.attributes.style.title, defaultValue: 'font-size:32px;' }),
        text: new adapters.StringAdapter({ title: i18n.textgaps.attributes.text.title, defaultValue: i18n.textgaps.attributes.text.defaultValue })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.textgaps.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.textgaps.properties.question.title }),
        solution: new adapters.StringArrayAdapter({ title: i18n.textgaps.properties.solution.title, defaultValue: [] }),
        validation: new adapters.ValidationAdapter({ title: i18n.textgaps.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.textgaps.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.textgaps.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.textgaps.properties.omit.title, defaultValue: 0 })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent: function (component, mode) {
        var that = this;
        assert.instanceof(TextGaps, that, assert.format(assert.messages.instanceof.default, 'this', 'TextGaps'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        var template = kendo.template(that.templates[mode]);
        return template($.extend(component, { ns: kendo.ns }));
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$: function (testItem) {
        var ret = (testItem.value || []).slice();
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$: function (testItem) {
        var ret = (testItem.solution || '').split('\n');
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        /* jshint maxcomplexity: 8 */
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('div' + kendo.roleSelector('textgaps'));
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

    /* This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate: function (component, pageIdx) {
        /* jshint maxcomplexity: 12 */
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            !component.attributes.text ||
            (component.attributes.text === i18n.textgaps.attributes.text.defaultValue) ||
            !RX_TEXT.test(component.attributes.text)) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.inputStyle && !RX_STYLE.test(component.attributes.inputStyle))) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO also check that split regex is safe
        return ret;
    }

    /* jshint +W074 */

});
tools.register(TextGaps);
