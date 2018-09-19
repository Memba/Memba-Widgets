/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.core';

const { Class } = window.kendo;

/*********************************************************************************
 * Assets
 *********************************************************************************/

var ToolAssets = kidoju.ToolAssets = Class.extend({
    init: function (options) {
        options = options || {};
        var collections = options.collections || [];
        var extensions = options.extensions || [];
        var schemes = options.schemes || {};
        assert.isArray(collections, assert.format(assert.messages.isArray.default, 'options.collections'));
        assert.isArray(extensions, assert.format(assert.messages.isArray.default, 'options.extensions'));
        assert.type(OBJECT, schemes, assert.format(assert.messages.type.default, 'options.schemes', OBJECT));
        this.collections = collections;
        this.extensions = extensions;
        this.schemes = schemes;
    }
});

var Assets = kidoju.assets = {
    // Assets for the audio tool
    audio : new ToolAssets(),
    // Assets for the image tool
    image: new ToolAssets(),
    // Assets for the video tool
    video: new ToolAssets()
};
