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

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).multiquiz || {
            // TODO
        }
    );
}


var MULTIQUIZ = '<div data-#= ns #role="multiquiz" data-#= ns #mode="#: attributes.mode #" data-#= ns #source="#: data$() #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #" {0}></div>';
/**
 * MultiQuiz tool
 * @class MultiQuiz
 * @type {void|*}
 */
var MultiQuiz = BaseTool.extend({
    id: 'multiquiz',
    icon: 'checkbox_group',
    description: i18n.multiquiz.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: kendo.format(MULTIQUIZ, 'data-#= ns #enable="false"'),
        play: kendo.format(MULTIQUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
        review: kendo.format(MULTIQUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + BaseTool.fn.showResult()
    },
    height: 150,
    width: 420,
    attributes: {
        mode: new adapters.EnumAdapter(
            { title: i18n.multiquiz.attributes.mode.title, defaultValue: 'checkbox', enum: ['button', 'checkbox', 'image', 'link', 'multiselect'] },
            { style: 'width: 100%;' }
        ),
        shuffle: new adapters.BooleanAdapter({ title: i18n.multiquiz.attributes.shuffle.title }),
        groupStyle: new adapters.StyleAdapter({ title: i18n.multiquiz.attributes.groupStyle.title, defaultValue: 'font-size:60px;' }),
        itemStyle: new adapters.StyleAdapter({ title: i18n.multiquiz.attributes.itemStyle.title }),
        selectedStyle: new adapters.StyleAdapter({ title: i18n.multiquiz.attributes.selectedStyle.title }),
        data: new adapters.ImageListBuilderAdapter({ title: i18n.multiquiz.attributes.data.title, defaultValue: i18n.multiquiz.attributes.data.defaultValue })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.multiquiz.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.multiquiz.properties.question.title }),
        solution: new adapters.MultiQuizSolutionAdapter({ title: i18n.multiquiz.properties.solution.title, defaultValue: [] }),
        validation: new adapters.ValidationAdapter({ title: i18n.multiquiz.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.multiquiz.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.multiquiz.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.multiquiz.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(MultiQuiz, that, assert.format(assert.messages.instanceof.default, 'this', 'MultiQuiz'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        assert.instanceof(ToolAssets, utilAssets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
        var template = kendo.template(that.templates[mode]);
        // The data$ function resolves urls with schemes like cdn://sample.jpg
        component.data$ = function () {
            var data = component.attributes.get('data');
            var clone = [];
            var schemes = utilAssets.image.schemes;
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
     * Improved display of value in score grid
     * @param testItem
     */
    value$: function (testItem) {
        var ret = (testItem.value || []).slice();
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode(ret[i]);
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$: function (testItem) {
        var ret = (testItem.solution || []).slice();
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode(ret[i]);
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
        assert.ok(stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`), kendo.format('e.currentTarget is expected to be a stage element'));
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
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
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
        return ret;
    }

    /* jshint +W074 */

});

/**
 * Registration
 */
tools.register(MultiQuiz);
