/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

var HIGHLIGHTER = '<div class="kj-interactive" data-#= ns #role="highlighter" data-#= ns #text="#: attributes.text #" data-#= ns #split="#: attributes.split #"  data-#= ns #highlight-style="#: attributes.highlightStyle #" style="#: attributes.style #" {0}></div>';
/**
 * @class HighLighter tool
 * @type {void|*}
 */
var HighLighter = Tool.extend({
    id: 'highlighter',
    icon: 'marker',
    description: i18n.highlighter.description,
    cursor: CURSOR_CROSSHAIR,
    weight: 1,
    templates: {
        design: kendo.format(HIGHLIGHTER, 'data-#= ns #enable="false"'),
        play: kendo.format(HIGHLIGHTER, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
        review: kendo.format(HIGHLIGHTER, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + Tool.fn.showResult()
    },
    height: 250,
    width: 250,
    attributes: {
        highlightStyle: new adapters.StyleAdapter({ title: i18n.highlighter.attributes.highlightStyle.title }),
        style: new adapters.StyleAdapter({ title: i18n.highlighter.attributes.style.title, defaultValue: 'font-size:32px;' }),
        text: new adapters.TextAdapter({ title: i18n.highlighter.attributes.text.title, defaultValue: i18n.highlighter.attributes.text.defaultValue }),
        split: new adapters.StringAdapter({ title: i18n.highlighter.attributes.split.title, defaultValue: '([\\s\\.,;:\\?¿!<>\\(\\)&"`«»\\[\\]{}])' })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.highlighter.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.highlighter.properties.question.title }),
        solution: new adapters.HighLighterAdapter({ title: i18n.highlighter.properties.solution.title }),
        validation: new adapters.ValidationAdapter({ title: i18n.highlighter.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.highlighter.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.highlighter.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.highlighter.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(HighLighter, that, assert.format(assert.messages.instanceof.default, 'this', 'HighLighter'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        var template = kendo.template(that.templates[mode]);
        return template($.extend(component, { ns: kendo.ns }));
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
        var content = stageElement.children('div');
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
            (component.attributes.text === i18n.highlighter.attributes.text.defaultValue) ||
            !RX_TEXT.test(component.attributes.text)) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.highlightStyle && !RX_STYLE.test(component.attributes.highlightStyle))) {
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
tools.register(HighLighter);
