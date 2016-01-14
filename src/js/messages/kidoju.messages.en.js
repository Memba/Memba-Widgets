/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([], f);
})(function () {

    'use strict';

    /*  This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    (function ($, undefined) {

        /* kidoju.widgets.assetmanager */
        if (kendo.ui.AssetManager) {
            kendo.ui.AssetManager.prototype.options.messages =
                $.extend(true, kendo.ui.AssetManager.prototype.options.messages, {
                    toolbar: {
                        upload: 'Upload',
                        delete: 'Delete',
                        filter: 'Collection: ',
                        search: 'Search'
                    },
                    tabs: {
                        default: 'Project'
                    }
                });
        }

        /* kidoju.widgets.codeeditor */
        /*
        if (kendo.ui.CodeEditor) {
            kendo.ui.CodeEditor.prototype.options.messages =
                $.extend(true, kendo.ui.CodeEditor.prototype.options.messages, {
                    // TODO
                });
        }
        */

        /* kidoju.widgets.codeinput */
        /*
         if (kendo.ui.CodeInput) {
            kendo.ui.CodeInput.prototype.options.messages =
                $.extend(true, kendo.ui.CodeInput.prototype.options.messages, {
                    // TODO
                });
         }
         */

        /* kidoju.widgets.explorer */
        if (kendo.ui.Explorer) {
            kendo.ui.Explorer.prototype.options.messages =
                $.extend(true, kendo.ui.Explorer.prototype.options.messages, {
                    empty: 'No item to display'
                });
        }

        /* kidoju.widgets.mediaplayer */
        if (kendo.ui.MediaPlayer) {
            kendo.ui.MediaPlayer.prototype.options.messages =
                $.extend(true, kendo.ui.MediaPlayer.prototype.options.messages, {
                    play: 'Play/Pause',
                    mute: 'Mute/Unmute',
                    full: 'Full Screen',
                    notSupported: 'Media not supported'
                });
        }

        /* kidoju.widgets.multiinput */
        if (kendo.ui.MultiInput) {
            kendo.ui.MultiInput.prototype.options.messages =
                $.extend(true, kendo.ui.MultiInput.prototype.options.messages, {
                    delete: 'Delete'
                });
        }

        /* kidoju.widgets.navigation */
        if (kendo.ui.Navigation) {
            kendo.ui.Navigation.prototype.options.messages =
                $.extend(true, kendo.ui.Navigation.prototype.options.messages, {
                    empty: 'No item to display'
                });
        }

        /* kidoju.widgets.playbar */
        if (kendo.ui.PlayBar) {
            kendo.ui.PlayBar.prototype.options.messages =
                $.extend(true, kendo.ui.PlayBar.prototype.options.messages, {
                    empty: 'No page to display',
                    page: 'Page',
                    of: 'of {0}',
                    first: 'Go to the first page',
                    previous: 'Go to the previous page',
                    next: 'Go to the next page',
                    last: 'Go to the last page',
                    refresh: 'Refresh',
                    morePages: 'More pages'
                });
        }

        /* kidoju.widgets.propertygrid */
        if (kendo.ui.PropertyGrid) {
            kendo.ui.PropertyGrid.prototype.options.messages =
                $.extend(true, kendo.ui.PropertyGrid.prototype.options.messages, {
                    property: 'Property',
                    value: 'Value'
                });
        }

        /* kidoju.widgets.quiz */
        if (kendo.ui.Quiz) {
            kendo.ui.Quiz.prototype.options.messages =
                $.extend(true, kendo.ui.Quiz.prototype.options.messages, {
                    optionLabel: 'Select...'
                });
        }

        /* kidoju.widgets.rating */
        /*
        if (kendo.ui.Rating) {
            kendo.ui.Rating.prototype.options.messages =
                $.extend(true, kendo.ui.Rating.prototype.options.messages, {
                    // TODO
                });
        }
        */

        /* kidoju.widgets.social */
        /*
        if (kendo.ui.Social) {
            kendo.ui.Social.prototype.options.messages =
                $.extend(true, kendo.ui.Social.prototype.options.messages, {
                    // TODO
                });
        }
        */

        /* kidoju.widgets.stage */
        if (kendo.ui.Stage) {
            kendo.ui.Stage.prototype.options.messages =
                $.extend(true, kendo.ui.Stage.prototype.options.messages, {
                    noPage: 'Please add or select a page'
                });
        }

        /* kidoju.widgets.styleeditor */
        if (kendo.ui.StyleEditor) {
            kendo.ui.StyleEditor.prototype.options.messages =
                $.extend(true, kendo.ui.StyleEditor.prototype.options.messages, {
                    columns: {
                        name: 'Name',
                        value: 'Value'
                    },
                    toolbar: {
                        create: 'New Style',
                        destroy: 'Delete'
                    },
                    validation: {
                        name: 'Name is required',
                        value: 'Value is required'
                    }
                });
        }

        /* kidoju.widgets.toolbox */
        /*
        if (kendo.ui.ToolBox) {
            kendo.ui.ToolBox.prototype.options.messages =
                $.extend(true, kendo.ui.ToolBox.prototype.options.messages, {
                    // TODO
                });
        }
        */

    })(window.kendo.jQuery);

    /* jshint +W074 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
