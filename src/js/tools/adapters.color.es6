/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */



/**
 * Color adapter
 */
adapters.ColorAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '#000000');
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[kendo.attr('role')] = 'colorpicker';
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
        }
    ],
    libraryDefault: 'equal'
});
