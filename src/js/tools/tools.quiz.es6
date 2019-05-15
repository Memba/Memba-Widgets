/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import i18n from '../common/window.i18n.es6';
import assets from '../app/app.assets.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import BooleanAdapter from './adapters.boolean.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import ImageListAdapter from './adapters.imagelist.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import QuizAdapter from './adapters.quiz.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import ToolAssets from './util.assets.es6';
import TOOLS from './util.constants.es6';
import { genericLibrary } from './util.libraries.es6';
import { questionValidator, scoreValidator } from './util.validators.es6';

const { format, ns, roleSelector, template } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.quiz)) {
    $.extend(true, i18n(), {
        tools: {
            quiz: {
                description: 'Quiz',
                help: null,
                name: 'Quiz',
                attributes: {
                    data: {
                        title: 'Values',
                        defaultValue: [
                            {
                                text: 'True',
                                image:
                                    'cdn://images/o_collection/svg/office/ok.svg'
                            },
                            {
                                text: 'False',
                                image:
                                    'cdn://images/o_collection/svg/office/error.svg'
                            }
                        ]
                    },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    mode: {
                        source: [
                            { text: 'Button', value: 'button' },
                            { text: 'DropDown', value: 'dropdown' },
                            { text: 'Image', value: 'image' },
                            { text: 'Link', value: 'link' },
                            { text: 'Radio', value: 'radio' }
                        ],
                        title: 'Mode'
                    },
                    selectedStyle: { title: 'Select. Style' },
                    shuffle: { title: 'Shuffle' }
                },
                properties: {
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' },
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    success: { title: 'Success' },
                    validation: { title: 'Validation' }
                }
            }
        }
    });
}

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div data-${ns}role="quiz" data-${ns}mode="#: attributes.mode #" data-${ns}source="#: data$() #" style="#: attributes.groupStyle #" data-${ns}item-style="#: attributes.itemStyle #" data-${ns}selected-style="#: attributes.selectedStyle #" {0}></div>`;

/**
 * QuizTool
 * @class QuizTool
 * @extends BaseTool
 */
const QuizTool = BaseTool.extend({
    id: 'quiz',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().tools.quiz.description,
    height: 120,
    help: i18n().tools.quiz.help,
    icon: 'radio_button_group',
    menu: [
        'attributes.data',
        '', // separator
        'properties.question',
        'properties.solution',
        'properties.validation'
    ],
    name: i18n().tools.quiz.name,
    weight: 1,
    width: 490,
    templates: {
        design: format(TEMPLATE, `data-${ns}enable="false"`),
        play: format(
            TEMPLATE,
            `data-${ns}bind="value: #: properties.name #.value" data-${ns}shuffle="#: attributes.shuffle #"`
        ),
        review:
            format(
                TEMPLATE,
                `data-${ns}bind="value: #: properties.name #.value" data-${ns}enable="false"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        mode: new DropDownListAdapter(
            {
                defaultValue: 'button',
                source: i18n().tools.quiz.attributes.mode.source,
                title: i18n().tools.quiz.attributes.mode.title
            },
            { style: 'width: 100%;' }
        ),
        shuffle: new BooleanAdapter({
            title: i18n().tools.quiz.attributes.shuffle.title
        }),
        groupStyle: new StyleAdapter({
            title: i18n().tools.quiz.attributes.groupStyle.title,
            defaultValue: 'font-size:60px;'
        }),
        itemStyle: new StyleAdapter({
            title: i18n().tools.quiz.attributes.itemStyle.title
        }),
        selectedStyle: new StyleAdapter({
            title: i18n().tools.quiz.attributes.selectedStyle.title
        }),
        data: new ImageListAdapter({
            title: i18n().tools.quiz.attributes.data.title,
            defaultValue: i18n().tools.quiz.attributes.data.defaultValue
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n().tools.quiz.properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n().tools.quiz.properties.question.title,
            validation: questionValidator
        }),
        solution: new QuizAdapter({
            title: i18n().tools.quiz.properties.solution.title
            // TODO validation: solutionValidator
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: i18n().tools.quiz.properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n().tools.quiz.properties.success.title,
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: i18n().tools.quiz.properties.failure.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: i18n().tools.quiz.properties.omit.title,
            defaultValue: 0,
            validation: scoreValidator
        })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const that = this;
        assert.instanceof(
            QuizTool,
            that,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'QuizTool'
            )
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        assert.enum(
            Object.values(TOOLS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.keys(TOOLS.STAGE_MODES)
            )
        );
        assert.instanceof(
            ToolAssets,
            assets.image,
            assert.format(
                assert.messages.instanceof.default,
                'assets.image',
                'ToolAssets'
            )
        );
        const tmpl = template(that.templates[mode]);
        // The data$ function resolves urls with schemes like cdn://sample.jpg
        $.extend(component, {
            data$() {
                const data = component.attributes.get('data').map(item => {
                    return {
                        text: item.text,
                        url: assets.image.scheme2http(item.url)
                    };
                });
                // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                return ` ${JSON.stringify(data)}`;
            }
        });
        return tmpl(component);
    },

    /**
     * onEnable Event Handler
     * @param e
     * @param component
     */
    onEnable(e, component) {
        // TODO ????
        $.noop();
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            format('e.currentTarget is expected to be a stage element')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        const content = stageElement.children(`div${roleSelector('quiz')}`);
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(
                component.get('width') -
                    content.outerWidth(true) +
                    content.outerWidth()
            );
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(
                component.get('height') -
                    content.outerHeight(true) +
                    content.outerHeight()
            );
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

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const { description } = this; // tool description
        const { messages } = this.i18n;
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.groupStyle &&
                !TOOLS.RX_STYLE.test(component.attributes.groupStyle)) ||
            (component.attributes.itemStyle &&
                !TOOLS.RX_STYLE.test(component.attributes.itemStyle)) ||
            (component.attributes.selectedStyle &&
                !TOOLS.RX_STYLE.test(component.attributes.selectedStyle))
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            !component.attributes.data ||
            !TOOLS.RX_DATA.test(component.attributes.data)
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidData, description, pageIdx + 1)
            });
        }
        // TODO: Check that solution matches one of the data
        return ret;
    }
});

/**
 * Registration
 */
tools.register(QuizTool);
