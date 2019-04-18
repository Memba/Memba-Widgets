/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Rename into checkboxes

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import BaseAdapter from './adapters.base.es6';

const {
    attr,
    data: { DataSource, Model },
    format,
    ns
} = window.kendo;

/**
 * MultiQuizAdapter
 * @class MultiQuizAdapter
 * @extends BaseAdapter
 */
const MultiQuizAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = undefined;
        this.defaultValue = this.defaultValue || [];
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = (container, settings) => {
            const input = $(`<${CONSTANTS.DIV}/>`)
                .attr(
                    $.extend(
                        true,
                        {},
                        settings.attributes,
                        getValueBinding(settings.field),
                        attributes
                    )
                )
                .appendTo(container);
            input.kendoMultiQuiz({
                mode: 'checkbox',
                // checkboxTemplate: '<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-' + kendo.ns + 'uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>',
                checkboxTemplate: `<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-${ns}uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1}$() #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>`,
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
                })
            });
        };
    }
});

/**
 * Default export
 */
export default MultiQuizAdapter;
