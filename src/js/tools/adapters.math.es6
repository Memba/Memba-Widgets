/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


/**
 * Math input adapter
 */
adapters.MathAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            var input = $('<div/>')
            .css({
                width: '100%',
                fontSize: '1.25em',
                minHeight: '4.6em'
            })
            .attr($.extend(binding, attributes))
            .appendTo(container);
            var mathInputWidget = input.kendoMathInput({
                toolbar: {
                    // container: '',
                    resizable: true,
                    tools: [
                        // 'backspace',
                        // 'field',
                        'keypad',
                        'basic',
                        'greek',
                        'operators',
                        'expressions',
                        'sets',
                        'matrices',
                        'statistics'
                        // 'units',
                        // 'chemistry'
                    ]
                }
            });
        };
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')  // TODO several MathQuillMathField
        }/*,
                {
                    // TODO permutations
                    name: 'anyCommutations',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return shuntingYard(value).equals(solution);')
                }
                */
    ],
    libraryDefault: 'equal'
});
