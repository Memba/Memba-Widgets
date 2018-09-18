

// TODO this is teh number adapter with options

/**
 * Score adapter
 */
adapters.ScoreAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = NUMBER;
        this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[kendo.attr('role')] = 'numerictextbox';
    }
});
