/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Make it a generic DropDownAdapter with a source ofr valkues (see enum also)

// Important: kj-quiz-item kj-quiz-dropdown defines background-position:vover;background-position:center,display:inline-block;height:1.1em;width:1.1em;
var QUIZSOLUTION_TMPL = '<span class="kj-quiz-item kj-quiz-dropdown"># if (data.image) { #<span class="k-image" style="background-image:url(#: data.image$() #);"></span># } #<span class="k-text">#: data.text #</span></span>';
/**
 * Quiz Solution adapter
 */
adapters.QuizSolutionAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            var input = $('<input/>')
            .css({ width: '100%' })
            .attr($.extend({}, settings.attributes, binding))
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
                            image$: function () {
                                var image = this.get('image');
                                var schemes = assets.image.schemes;
                                for (var scheme in schemes) {
                                    if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(image)) {
                                        image = image.replace(scheme + '://', schemes[scheme]);
                                        break;
                                    }
                                }
                                return image;
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
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
        }
    ],
    libraryDefault: 'equal'
});
