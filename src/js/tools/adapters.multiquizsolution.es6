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

const { attr, format } = window.kendo;
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}'; // TODO remove
// TODO Rename into checkboxes

/**
 * @class MultiQuizSolutionAdapter
 */
const MultiQuizSolutionAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = undefined;
        this.defaultValue = this.defaultValue || [];
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = function(container, settings) {
            const binding = {};
            binding[kendo.attr('bind')] = `value: ${settings.field}`;
            const input = $('<div/>')
                .attr(binding)
                .appendTo(container);
            input.kendoMultiQuiz({
                mode: 'checkbox',
                // checkboxTemplate: '<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-' + kendo.ns + 'uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>',
                checkboxTemplate: `<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-${
                    kendo.ns
                }uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1}$() #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>`,
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
                                const schemes = assets.image.schemes;
                                for (const scheme in schemes) {
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            schemes,
                                            scheme
                                        ) &&
                                        new RegExp(`^${scheme}://`).test(image)
                                    ) {
                                        image = image.replace(
                                            `${scheme}://`,
                                            schemes[scheme]
                                        );
                                        break;
                                    }
                                }
                                return image;
                            }
                        })
                    }
                })
            });
        };
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(
                VALIDATION_CUSTOM,
                '// Note: both value and solution are arrays of strings\n\t' +
                    'return String(value.sort()) === String(solution.sort());'
            )
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default MultiQuizSolutionAdapter;
