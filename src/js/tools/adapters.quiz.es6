/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import 'kendo.dropdownlist';
import assets from '../app/app.assets.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import BaseAdapter from './adapters.base.es6';
import '../widgets/widgets.quiz.es6';

const {
    data: { DataSource, Model },
    ui: { Quiz }
} = window.kendo;

// Important: kj-quiz-item kj-quiz-dropdown defines background-position:vover;background-position:center,display:inline-block;height:1.1em;width:1.1em;
const QUIZSOLUTION_TMPL =
    '<span class="kj-quiz-item kj-quiz-dropdown"># if (data.image) { #<span class="k-image" style="background-image:url(#: data.image$() #);"></span># } #<span class="k-text">#: data.text #</span></span>';

/**
 * QuizAdapter
 * @class QuizAdapter
 * @extends BaseAdapter
 */
const QuizAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = function(container, settings) {
            const input = $(`<${CONSTANTS.INPUT}/>`)
                .css({ width: '100%' })
                .attr(
                    $.extend(
                        {},
                        settings.attributes,
                        getValueBinding(settings.field)
                    )
                )
                .appendTo(container);
            input.kendoDropDownList({
                autoWidth: true,
                dataSource: new DataSource({
                    data: settings.model.get('attributes.data'),
                    schema: {
                        model: Model.define({
                            id: 'text',
                            fields: {
                                text: { type: CONSTANTS.STRING },
                                image: { type: CONSTANTS.STRING }
                            },
                            image$() {
                                const image = this.get('image');
                                return assets.image.scheme2http(image);
                            }
                        })
                    }
                }),
                dataTextField: 'text',
                dataValueField: 'text',
                optionLabel: Quiz.fn.options.messages.optionLabel,
                template: QUIZSOLUTION_TMPL,
                valueTemplate: QUIZSOLUTION_TMPL
            });
        };
    }
});

/**
 * Default export
 */
export default QuizAdapter;
