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
import { PageComponent } from '../data/data.pagecomponent.es6';
import NumberAdapter from './adapters.number.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import QuestionAdapter from './adapters.question.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { arrayLibrary } from './util.libraries.es6';
import { scoreValidator } from './util.validators.es6';
import __ from '../app/app.i18n';

const { attr, format, htmlEncode, ns, roleSelector, template } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div data-${ns}role="textgaps" data-${ns}text="#: attributes.text #" data-${ns}input-style="#: attributes.inputStyle #" style="#: attributes.style #" {0}></div>`;

/**
 * TextGapsTool
 * @class TextGapsTool
 * @type {void|*}
 */
const TextGapsTool = BaseTool.extend({
    id: 'textgaps',
    icon: 'text_gaps',
    name: __('tools.textgaps.name'),
    description: __('tools.textgaps.description'),
    help: __('tools.textgaps.help'),
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
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
    height: 150,
    width: 420,
    attributes: {
        inputStyle: new StyleAdapter({
            title: __('tools.textgaps.attributes.inputStyle.title')
        }),
        style: new StyleAdapter({
            title: __('tools.textgaps.attributes.style.title'),
            defaultValue: 'font-size:32px;'
        }),
        text: new TextBoxAdapter({
            title: __('tools.textgaps.attributes.text.title'),
            defaultValue: __('tools.textgaps.attributes.text.defaultValue')
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.textgaps.properties.name.title')
        }),
        question: new QuestionAdapter({
            title: __('tools.textgaps.properties.question.title')
        }),
        solution: new StringArrayAdapter({
            title: __('tools.textgaps.properties.solution.title'),
            defaultValue: []
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: __('tools.textgaps.properties.validation.title')
        }),
        success: new ScoreAdapter({
            title: __('tools.textgaps.properties.success.title'),
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: __('tools.textgaps.properties.failure.title'),
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: __('tools.textgaps.properties.omit.title'),
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
            TextGapsTool,
            that,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'TextGapsTool'
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
        const tmpl = template(that.templates[mode]);
        return tmpl(component);
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$(testItem) {
        const ret = (testItem.value || []).slice();
        for (let i = 0; i < ret.length; i++) {
            ret[i] = htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$(testItem) {
        const ret = (testItem.solution || '').split('\n');
        for (let i = 0; i < ret.length; i++) {
            ret[i] = htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
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
        const content = stageElement.children(`div${roleSelector('textgaps')}`);
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
        const toolName = this.name;
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
                __('tools.textgaps.attributes.text.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(__('tools.messages.invalidText'), toolName, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.inputStyle &&
                !TOOLS.RX_STYLE.test(component.attributes.inputStyle))
        ) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(__('tools.messages.invalidStyle'), toolName, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(__('tools.messages.invalidStyle'), toolName, pageIdx + 1)
            });
        }
        // TODO also check that split regex is safe
        return ret;
    }
});

/**
 * Registration
 */
tools.register(TextGapsTool);
