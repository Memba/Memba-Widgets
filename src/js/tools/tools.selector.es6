/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
import { iconUri } from '../app/app.uris.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.selector.es6';
import BasicListAdapter from './adapters.basiclist.es6';
import ColorAdapter from './adapters.color.es6';
import DisabledAdapter from './adapters.disabled.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { arrayLibrary } from './util.libraries.es6';
import { questionValidator, scoreValidator } from './util.validators.es6';

const { format, htmlEncode, ns, roleSelector } = window.kendo;
const ScoreAdapter = NumberAdapter;

const TEMPLATE = `<img
    alt="#: alt$() #"
    data-${ns}empty="#: attributes.empty #"
    data-${ns}hit-radius="#: attributes.hitRadius #"
    data-${ns}id="#: properties.name #"
    data-${ns}role="selector"
    data-${ns}shape="#: attributes.shape #"
    data-${ns}stroke="{ color: '#: attributes.color #', dashType: 'solid', opacity: 1, width: '#: attributes.strokeWidth #' }"
    src="#: src$() #" {0}>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value, source: interactions"`;
const DISABLED = `data-${ns}enable="false"`;

/**
 * @class SelectorTool tool
 * @type {void|*}
 */
const SelectorTool = BaseTool.extend({
    id: 'selector',
    childSelector: `${CONSTANTS.IMG}${roleSelector('selector')}`,
    height: 50,
    width: 50,
    weight: 1,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(
            TEMPLATE,
            `data-${ns}toolbar="\\#floating .kj-floating-content" ${BINDING}` // TODO review
        ),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        color: new ColorAdapter({
            title: __('tools.selector.attributes.color.title'),
            defaultValue: '#ff0000',
        }),
        empty: new TextBoxAdapter({
            title: __('tools.selector.attributes.empty.title'),
        }),
        hitRadius: new NumberAdapter(
            {
                title: __('tools.selector.attributes.hitRadius.title'),
                defaultValue: 15,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 15,
                'data-max': 999,
            }
        ),
        shape: new DropDownListAdapter(
            {
                defaultValue: 'circle',
                source: __('tools.selector.attributes.shape.source'),
                title: __('tools.selector.attributes.shape.title'),
            },
            { style: 'width: 100%;' }
        ),
        strokeWidth: new NumberAdapter(
            {
                title: __('tools.selector.attributes.strokeWidth.title'),
                defaultValue: 12,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 50,
            }
        ),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.selector.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.selector.properties.question.help'),
            title: __('tools.selector.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new BasicListAdapter({
            help: __('tools.selector.properties.solution.help'),
            title: __('tools.selector.properties.solution.title'),
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: __('tools.selector.properties.validation.title'),
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.selector.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.selector.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.selector.properties.omit.title'),
            validation: scoreValidator,
        }),
        disabled: new DisabledAdapter({
            defaultValue: false,
            title: __('tools.selector.properties.disabled.title'),
        }),
    },

    /**
     * Improved display of value in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    getHtmlValue(testItem) {
        return 'N/A'; // TODO
    },

    /**
     * Improved display of solution in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param component
     */
    getHtmlSolution(component) {
        this._assertComponent(component);
        const solution = component.get('properties.solution');
        return htmlEncode(solution || CONSTANTS.EMPTY);
    },

    /**
     * getHtmlContent
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const { icon } = this;
        $.extend(component, {
            // alternate text of an image
            alt$() {
                return component.get('properties.name');
            },
            // The src$ function resolves the icon path
            src$() {
                return iconUri(icon);
            },
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * onResize
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        // const content = stageElement.children('img');
        const content = stageElement.children(this.childSelector);
        // Assuming we can get the natural size of the image, we shall keep proportions
        const { naturalHeight, naturalWidth } = content[0];
        if (naturalHeight && naturalWidth) {
            const height = component.get('height');
            const width = component.get('width');
            // Keep the height, change the width
            const w = (height * naturalWidth) / naturalHeight;
            if (width !== w) {
                // `if` avoids a stack overflow
                component.set('width', w);
            }
        }
        BaseTool.fn.onResize.call(this, e, component);
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
            !TOOLS.RX_COLOR.test(component.attributes.color)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidColor'),
                    toolName,
                    pageIdx + 1
                ),
            });
        }
        // TODO: We should have a generic validation for  enumerators
        if (
            !component.attributes ||
            ['circle', 'cross', 'rect'].indexOf(component.attributes.shape) ===
                -1
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidShape'),
                    toolName,
                    pageIdx + 1
                ),
            });
        }
        // TODO: Check selectors on top of static images and labels
        return ret;
    },
});

/**
 * Default eport
 */
export default SelectorTool;
