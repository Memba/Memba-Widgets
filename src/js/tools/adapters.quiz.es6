/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

// TODO Make it a generic DropDownAdapter with a source ofr valkues (see enum also)
const { attr, format } = window.kendo;
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}'; // TODO remove

// Important: kj-quiz-item kj-quiz-dropdown defines background-position:vover;background-position:center,display:inline-block;height:1.1em;width:1.1em;
const QUIZSOLUTION_TMPL =
    '<span class="kj-quiz-item kj-quiz-dropdown"># if (data.image) { #<span class="k-image" style="background-image:url(#: data.image$() #);"></span># } #<span class="k-text">#: data.text #</span></span>';

/**
 * @class QuizAdapter
 */
const QuizAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // this.editor = 'input';
        // $.extend(this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = function(container, settings) {
            const input = $('<input/>')
                .css({ width: '100%' })
                .attr($.extend({}, settings.attributes, getValueBinding(settings.field)))
                .appendTo(container);
            input.kendoDropDownList({
                autoWidth: true,
                dataSource: new kendo.data.DataSource({
                    data: settings.model.get('attributes.data'),
                    schema: {
                        model: kendo.data.Model.define({
                            id: 'text',
                            fields: {
                                text: { type: STRING },
                                image: { type: STRING }
                            },
                            image$() {
                                let image = this.get('image');
                                return assets.image.scheme2http(image);
                            }
                        })
                    }
                }),
                dataTextField: 'text',
                dataValueField: 'text',
                optionLabel: kendo.ui.Quiz.fn.options.messages.optionLabel,
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
