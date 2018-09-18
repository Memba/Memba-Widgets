/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

var QUIZ = '<div data-#= ns #role="quiz" data-#= ns #mode="#: attributes.mode #" data-#= ns #source="#: data$() #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #" {0}></div>';
/**
 * Quiz tool
 * @class Quiz
 * @type {void|*}
 */
var Quiz = Tool.extend({
    id: 'quiz',
    icon: 'radio_button_group',
    description: i18n.quiz.description,
    cursor: CURSOR_CROSSHAIR,
    weight: 1,
    templates: {
        design: kendo.format(QUIZ, 'data-#= ns #enable="false"'),
        play: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
        review: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
    },
    height: 120,
    width: 490,
    attributes: {
        mode: new adapters.EnumAdapter(
            { title: i18n.quiz.attributes.mode.title, defaultValue: 'button', enum: ['button', 'dropdown', 'image', 'link', 'radio'] },
            { style: 'width: 100%;' }
        ),
        shuffle: new adapters.BooleanAdapter({ title: i18n.quiz.attributes.shuffle.title }),
        groupStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.groupStyle.title, defaultValue: 'font-size:60px;' }),
        itemStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.itemStyle.title }),
        selectedStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.selectedStyle.title }),
        data: new adapters.ImageListBuilderAdapter({ title: i18n.quiz.attributes.data.title, defaultValue: i18n.quiz.attributes.data.defaultValue })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.quiz.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.quiz.properties.question.title }),
        solution: new adapters.QuizSolutionAdapter({ title: i18n.quiz.properties.solution.title }),
        validation: new adapters.ValidationAdapter({ title: i18n.quiz.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.quiz.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.quiz.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.quiz.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(Quiz, that, assert.format(assert.messages.instanceof.default, 'this', 'Quiz'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
        var template = kendo.template(that.templates[mode]);
        // The data$ function resolves urls with schemes like cdn://sample.jpg
        component.data$ = function () {
            var data = component.attributes.get('data');
            var clone = [];
            var schemes = assets.image.schemes;
            for (var i = 0, length = data.length; i < length; i++) {
                var item = {
                    text: data[i].text,
                    image: ''
                };
                for (var scheme in schemes) {
                    if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(data[i].image)) {
                        item.image = data[i].image.replace(scheme + '://', schemes[scheme]);
                        break;
                    }
                }
                clone.push(item);
            }
            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ' ' + JSON.stringify(clone);
        };
        return template($.extend(component, { ns: kendo.ns }));
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
        var content = stageElement.children('div' + kendo.roleSelector('quiz'));
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        /*
         // Auto-resize algorithm is not great so let's wait until we find a better solution
         var data = component.attributes.data;
         var length = data.trim().split('\n').length || 1;
         switch (component.attributes.mode) {
         case 'button':
         content.css('font-size', Math.floor(0.57 * component.height));
         break;
         case 'dropdown':
         content.css('font-size', Math.floor(0.5 * component.height));
         break;
         case 'radio':
         var h = component.height / (length || 1);
         content.css('font-size', Math.floor(0.9 * h));
         content.find('input')
         .height(0.6 * h)
         .width(0.6 * h);
         break;
         }
         */
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
        /* jshint maxcomplexity: 8 */
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
            (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
            (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            !component.attributes.data ||
            !RX_DATA.test(component.attributes.data)) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidData, description, pageIdx + 1)
            });
        }
        // TODO: Check that solution matches one of the data
        return ret;
    }

    /* jshint +W074 */

});
tools.register(Quiz);
