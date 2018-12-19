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
import { LIB_COMMENT, genericLibrary } from './util.libraries.es6';

const { format, ns, roleSelector, template } = window.kendo;
const ScoreAdapter = NumberAdapter;

// TODO review location
const RX_DATA = /\S+/i;
const RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).quiz || {
            description: 'Quiz',
            name: 'Quiz',
            help: null,
            attributes: {
                data: {
                    title: 'Values',
                    defaultValue: [
                        {
                            text: 'True',
                            image: 'cdn://images/o_collection/svg/office/ok.svg'
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
                mode: { title: 'Mode' },
                selectedStyle: { title: 'Select. Style' },
                shuffle: { title: 'Shuffle' }
            },
            // Properties
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
    );
}

const QUIZ =
    '<div data-#= ns #role="quiz" data-#= ns #mode="#: attributes.mode #" data-#= ns #source="#: data$() #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #" {0}></div>';

/**
 * QuizTool
 * @class QuizTool
 * @extends BaseTool
 */
const QuizTool = BaseTool.extend({
    id: 'quiz',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().description,
    height: 120,
    help: i18n().help,
    icon: 'radio_button_group',
    menu: [
        'attributes.data',
        '', // separator
        'properties.question',
        'properties.solution',
        'properties.validation'
    ],
    name: i18n().name,
    weight: 1,
    width: 490,
    templates: {
        design: format(QUIZ, 'data-#= ns #enable="false"'),
        play: format(
            QUIZ,
            'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'
        ),
        review:
            format(
                QUIZ,
                'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"'
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        mode: new DropDownListAdapter(
            {
                title: i18n().attributes.mode.title,
                defaultValue: 'button',
                enum: ['button', 'dropdown', 'image', 'link', 'radio']
            },
            { style: 'width: 100%;' }
        ),
        shuffle: new BooleanAdapter({
            title: i18n().attributes.shuffle.title
        }),
        groupStyle: new StyleAdapter({
            title: i18n().attributes.groupStyle.title,
            defaultValue: 'font-size:60px;'
        }),
        itemStyle: new StyleAdapter({
            title: i18n().attributes.itemStyle.title
        }),
        selectedStyle: new StyleAdapter({
            title: i18n().attributes.selectedStyle.title
        }),
        data: new ImageListAdapter({
            title: i18n().attributes.data.title,
            defaultValue: i18n().attributes.data.defaultValue
        })
    },
    properties: {
        name: new ReadOnlyAdapter({ title: i18n().properties.name.title }),
        question: new QuestionAdapter({
            title: i18n().properties.question.title
        }),
        solution: new QuizAdapter({
            title: i18n().properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: `${LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: i18n().properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n().properties.success.title,
            defaultValue: 1
        }),
        failure: new ScoreAdapter({
            title: i18n().properties.failure.title,
            defaultValue: 0
        }),
        omit: new ScoreAdapter({
            title: i18n().properties.omit.title,
            defaultValue: 0
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
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.keys(CONSTANTS.STAGE_MODES)
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
        // eslint-disable-next-line no-param-reassign
        component.data$ = function() {
            const data = component.attributes.get('data');
            const clone = [];
            const { schemes } = assets.image;
            for (let i = 0, length = data.length; i < length; i++) {
                const item = {
                    text: data[i].text,
                    image: ''
                };
                // TODO use scheme2http
                for (const scheme in schemes) {
                    if (
                        Object.prototype.hasOwnProperty.call(schemes, scheme) &&
                        new RegExp(`^${scheme}://`).test(data[i].image)
                    ) {
                        item.image = data[i].image.replace(
                            `${scheme}://`,
                            schemes[scheme]
                        );
                        break;
                    }
                }
                clone.push(item);
            }
            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ` ${JSON.stringify(clone)}`;
        };
        return tmpl($.extend(component, { ns }));
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
        const description = this.description; // tool description
        const messages = this.i18n.messages;
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.groupStyle &&
                !RX_STYLE.test(component.attributes.groupStyle)) ||
            (component.attributes.itemStyle &&
                !RX_STYLE.test(component.attributes.itemStyle)) ||
            (component.attributes.selectedStyle &&
                !RX_STYLE.test(component.attributes.selectedStyle))
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
            !RX_DATA.test(component.attributes.data)
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
