/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
// import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.dropzone.es6';
import BasicListAdapter from './adapters.basiclist.es6';
import BooleanAdapter from './adapters.boolean.es6';
import DisabledAdapter from './adapters.disabled.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { arrayLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator
} from './util.validators.es6';

const { format, htmlEncode, ns, roleSelector } = window.kendo;
const ScoreAdapter = NumberAdapter;

const TEMPLATE = `<div
    data-${ns}role="dropzone"
    data-${ns}center="#: attributes.center #"
    data-${ns}empty="#: attributes.empty #"
    id="#: properties.name #"
    style="#: attributes.style #" {0}>
    <div>#: attributes.text #</div>
    </div>`;
// TODO: Check whether TEMPLATE requires class="kj-interactive"
const BINDING = `data-${ns}bind="value: #: properties.name #.value, source: interactions"`;
const DISABLED = `data-${ns}enable="false"`;

/**
 * @class DropZoneTool tool
 * @type {void|*}
 */
const DropZoneTool = BaseTool.extend({
    id: 'dropzone',
    childSelector: `${CONSTANTS.DIV}${roleSelector('dropzone')}`,
    height: 250,
    width: 250,
    weight: 1,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(TEMPLATE, BINDING),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        center: new BooleanAdapter({
            title: __('tools.dropzone.attributes.center.title'),
            defaultValue: __('tools.dropzone.attributes.center.defaultValue')
        }),
        empty: new TextBoxAdapter({
            title: __('tools.dropzone.attributes.empty.title')
        }),
        text: new TextBoxAdapter({
            title: __('tools.dropzone.attributes.text.title'),
            defaultValue: __('tools.dropzone.attributes.text.defaultValue')
        }),
        style: new StyleAdapter({
            title: __('tools.dropzone.attributes.style.title'),
            validation: styleValidator
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.dropzone.properties.name.title')
        }),
        question: new QuestionAdapter({
            help: __('tools.dropzone.properties.question.help'),
            title: __('tools.dropzone.properties.question.title'),
            validation: questionValidator
        }),
        solution: new BasicListAdapter({
            help: __('tools.dropzone.properties.solution.help'),
            title: __('tools.dropzone.properties.solution.title')
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: __('tools.dropzone.properties.validation.title')
        }),
        success: new ScoreAdapter({
            title: __('tools.dropzone.properties.success.title'),
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.dropzone.properties.failure.title'),
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.dropzone.properties.omit.title'),
            validation: scoreValidator
        }),
        disabled: new DisabledAdapter({
            defaultValue: false,
            title: __('tools.dropzone.properties.disabled.title')
        })
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
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
        // Note: any text is acceptable
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
        return ret;
        // TODO: we should also check that there are draggable components on the page
        // TODO: Check order of draggables 'on top' of drop zone
    }
});

/**
 * Default eport
 */
export default DropZoneTool;
