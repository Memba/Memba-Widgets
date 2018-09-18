/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO rename as readonly adapter

/**
 * Property name adapter
 */
adapters.NameAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox k-state-disabled',  disabled: true });
    }
});
