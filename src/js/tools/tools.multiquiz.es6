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
import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.multiquiz.es6';
import BooleanAdapter from './adapters.boolean.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import ImageListAdapter from './adapters.imagelist.es6';
import MultiQuizAdapter from './adapters.multiquiz.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import ToolAssets from './util.assets.es6';
import TOOLS from './util.constants.es6';
import { multiQuizLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator,
} from './util.validators.es6';

const { format, htmlEncode, ns, roleSelector } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="multiquiz"
    data-${ns}mode="#: attributes.mode #"
    data-${ns}source="#: data$() #"
    data-${ns}item-style="#: attributes.itemStyle #"
    data-${ns}selected-style="#: attributes.selectedStyle #"
    style="#: attributes.groupStyle #" {0}>
    </div>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value"`;
const DISABLED = `data-${ns}enable="false"`;
const SHUFFLE = `data-${ns}shuffle="#: attributes.shuffle #"`;

/**
 * MultiQuizTool tool
 * @class MultiQuizTool
 * @type {void|*}
 */
const MultiQuizTool = BaseTool.extend({
    id: 'multiquiz',
    childSelector: `${CONSTANTS.DIV}${roleSelector('multiquiz')}`,
    height: 150,
    menu: [
        'attributes.data',
        'attributes.mode',
        '', // separator
        'properties.question',
        'properties.solution',
    ],
    weight: 1,
    width: 420,
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(TEMPLATE, `${BINDING} ${SHUFFLE}`),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        mode: new DropDownListAdapter(
            {
                defaultValue: 'checkbox',
                source: __('tools.multiquiz.attributes.mode.source'),
                title: __('tools.multiquiz.attributes.mode.title'),
            },
            { style: 'width: 100%;' }
        ),
        shuffle: new BooleanAdapter({
            title: __('tools.multiquiz.attributes.shuffle.title'),
        }),
        groupStyle: new StyleAdapter({
            title: __('tools.multiquiz.attributes.groupStyle.title'),
            validation: styleValidator,
        }),
        itemStyle: new StyleAdapter({
            title: __('tools.multiquiz.attributes.itemStyle.title'),
            validation: styleValidator,
        }),
        selectedStyle: new StyleAdapter({
            title: __('tools.multiquiz.attributes.selectedStyle.title'),
            validation: styleValidator,
        }),
        data: new ImageListAdapter({
            title: __('tools.multiquiz.attributes.data.title'),
            defaultValue: __('tools.multiquiz.attributes.data.defaultValue'),
        }),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.multiquiz.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.multiquiz.properties.question.help'),
            title: __('tools.multiquiz.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new MultiQuizAdapter({
            defaultValue: [],
            help: __('tools.multiquiz.properties.solution.help'),
            title: __('tools.multiquiz.properties.solution.title'),
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${multiQuizLibrary.defaultKey}`,
            library: multiQuizLibrary.library,
            title: __('tools.multiquiz.properties.validation.title'),
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.multiquiz.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.multiquiz.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.multiquiz.properties.omit.title'),
            validation: scoreValidator,
        }),
    },

    /**
     * getAssets
     * @param component
     * @returns {{image: [], audio: [], video: []}}
     */
    getAssets(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return {
            audio: [],
            image: component
                .get('attributes.data')
                .map((item) => assets.image.scheme2http(item.url)),
            video: [],
        };
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
        $.extend(component, {
            // The data$ function resolves urls with schemes like cdn://sample.jpg
            data$() {
                const data = component.get('attributes.data').map((item) => {
                    return {
                        text: item.text,
                        url: assets.image.scheme2http(item.url),
                    };
                });
                return JSON.stringify(data);
            },
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * onEnable Event Handler
     * @param e
     * @param component
     */
    onEnable(e, component) {
        // TODO ????
        $.noop(e, component);
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$(testItem) {
        const ret = (testItem.value || []).slice();
        for (let i = 0; i < ret.length; i++) {
            ret[i] = htmlEncode(ret[i]);
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$(testItem) {
        const ret = (testItem.solution || []).slice();
        for (let i = 0; i < ret.length; i++) {
            ret[i] = htmlEncode(ret[i]);
        }
        return ret.join('<br/>');
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
                message: format(
                    __('tools.messages.invalidStyle'),
                    toolName,
                    pageIdx + 1
                ),
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
                ),
            });
        }
        return ret;
    },
});

/**
 * Default eport
 */
export default MultiQuizTool;
