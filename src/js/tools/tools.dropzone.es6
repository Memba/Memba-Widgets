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
import BooleanAdapter from './adapters.boolean.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
// import StringArrayAdapter from './adapters..es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { arrayLibrary } from './util.libraries.es6';
import {scoreValidator} from './util.validators.es6';

const { attr, format, htmlEncode, ns } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).dropzone ||
        {
            // TODO
        }
    );
}

const DROPZONE = `<div id="#: properties.name #" data-${ns}role="dropzone" data-${ns}center="#: attributes.center #"  data-${ns}empty="#: attributes.empty #" style="#: attributes.style #" {0}><div>#: attributes.text #</div></div>`;
// TODO: Check whether DROPZONE requires class="kj-interactive"
/**
 * @class DropZoneTool tool
 * @type {void|*}
 */
const DropZoneTool = BaseTool.extend({
    id: 'dropzone',
    icon: 'elements_selection',
    description: i18n.dropzone.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: format(DROPZONE, `data-${ns}enable="false"`),
        play: format(
            DROPZONE,
            `data-${ns}bind="value: #: properties.name #.value, source: interactions"`
        ),
        review:
            format(
                DROPZONE,
                `data-${ns}bind="value: #: properties.name #.value, source: interactions" data-${ns}enable="false"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 250,
    width: 250,
    attributes: {
        center: new BooleanAdapter({
            title: i18n.dropzone.attributes.center.title,
            defaultValue: i18n.dropzone.attributes.center.defaultValue
        }),
        empty: new TextBoxAdapter({
            title: i18n.dropzone.attributes.empty.title
        }),
        text: new TextBoxAdapter({
            title: i18n.dropzone.attributes.text.title,
            defaultValue: i18n.dropzone.attributes.text.defaultValue
        }),
        style: new StyleAdapter({
            title: i18n.dropzone.attributes.style.title,
            defaultValue: 'font-size:30px;border:dashed 3px #e1e1e1;'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n.dropzone.properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n.dropzone.properties.question.title
        }),
        solution: new StringArrayAdapter({
            title: i18n.dropzone.properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: i18n.dropzone.properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n.dropzone.properties.success.title,
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: i18n.dropzone.properties.failure.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: i18n.dropzone.properties.omit.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        disabled: new DisabledAdapter({
            title: i18n.dropzone.properties.disabled.title,
            defaultValue: false
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
        const content = stageElement.children('div');
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
        const { description } = this; // tool description
        const { messages } = this.i18n;
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
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        return ret;
        // TODO: we should also check that there are draggable components on the page
        // TODO: Check order of draggables 'on top' of drop zone
    }
});

/**
 * Registration
 */
tools.register(DropZoneTool);
