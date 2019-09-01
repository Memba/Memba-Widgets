/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assets from '../app/app.assets.es6';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import ImageListAdapter from './adapters.imagelist.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import QuizAdapter from './adapters.quiz.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import ToolAssets from './util.assets.es6';
import TOOLS from './util.constants.es6';
import { genericLibrary } from './util.libraries.es6';
import { scoreValidator } from './util.validators.es6';

const { format, ns, roleSelector } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * ImageSet Template
 * @type {string}
 */
const IMAGESET = `<div data-${ns}role="imageset" data-${ns}images="#: data$() #" style="#: attributes.style #" {0}></div>`;

/**
 * @class ImageSetTool tool
 * @type {void|*}
 */
const ImageSetTool = BaseTool.extend({
    id: 'imageset',
    childSelector: `${CONSTANTS.DIV}${roleSelector('imageset')}`,
    height: 250,
    width: 250,
    weight: 1,
    // menu: [],
    templates: {
        design: format(IMAGESET, `data-${ns}enabled="false"`),
        play: format(
            IMAGESET,
            `data-${ns}bind="value: #: properties.name #.value"`
        ),
        review:
            format(
                IMAGESET,
                `data-${ns}bind="value: #: properties.name #.value" data-${ns}enabled="false"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        // shuffle: new BooleanAdapter({ title: i18n.quiz.attributes.shuffle.title }),
        style: new StyleAdapter({
            title: __('tools.imageset.attributes.style.title')
        }),
        data: new ImageListAdapter({
            title: __('tools.imageset.attributes.data.title'),
            defaultValue: __('tools.imageset.attributes.data.defaultValue')
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.imageset.properties.name.title')
        }),
        question: new QuestionAdapter({
            title: __('tools.imageset.properties.question.title')
        }),
        solution: new QuizAdapter({
            title: __('tools.imageset.properties.solution.title')
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: __('tools.imageset.properties.validation.title')
        }),
        success: new ScoreAdapter({
            title: __('tools.imageset.properties.success.title'),
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: __('tools.imageset.properties.failure.title'),
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: __('tools.imageset.properties.omit.title'),
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
        assert.instanceof(
            ToolAssets,
            assets.image,
            assert.format(
                assert.messages.instanceof.default,
                'assets.image',
                'ToolAssets'
            )
        );
        // The data$ function resolves urls with schemes like cdn://sample.jpg
        $.extend(component, {
            data$() {
                const data = component.attributes.get('data');
                const clone = [];
                const { schemes } = assets.image;
                for (let i = 0, { length } = data; i < length; i++) {
                    const item = {
                        text: data[i].text,
                        image: ''
                    };
                    Object.keys(schemes).some(scheme => {
                        if (new RegExp(`^${scheme}://`).test(data[i].image)) {
                            item.image = data[i].image.replace(
                                `${scheme}://`,
                                schemes[scheme]
                            );
                            return true;
                        }
                        return false;
                    });
                    clone.push(item);
                }
                // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                return ` ${JSON.stringify(clone)}`;
            }
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidStyle'),
                    toolName,
                    pageIdx + 1
                )
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
                message: format(
                    __('tools.messages.invalidData'),
                    toolName,
                    pageIdx + 1
                )
            });
        }
        // TODO: Check that solution matches one of the data
        return ret;
    }
});

/**
 * Default eport
 */
export default ImageSetTool;
