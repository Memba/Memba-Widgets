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
                        upload: 'Mettre en ligne', // comme sur Youtube.fr
                        delete: 'Supprimer',
                        filter: 'Collection: ',
                        search: 'Recherche'
                    },
                    tabs: {
                        default: 'Projet'
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
                    empty: 'Rien à afficher'
                });
        }

        /* kidoju.widgets.mediaplayer */
        if (kendo.ui.MediaPlayer) {
            kendo.ui.MediaPlayer.prototype.options.messages =
                $.extend(true, kendo.ui.MediaPlayer.prototype.options.messages, {
                    play: 'Jouer/Pauser',
                    mute: 'Avec/Sans son',
                    full: 'Plein écran',
                    notSupported: 'Fichier non supporté'
                });
        }

        /* kidoju.widgets.multiinput */
        if (kendo.ui.MultiInput) {
            kendo.ui.MultiInput.prototype.options.messages =
                $.extend(true, kendo.ui.MultiInput.prototype.options.messages, {
                    delete: 'Effacer'
                });
        }

        /* kidoju.widgets.navigation */
        if (kendo.ui.Navigation) {
            kendo.ui.Navigation.prototype.options.messages =
                $.extend(true, kendo.ui.Navigation.prototype.options.messages, {
                    empty: 'Rien à afficher'
                });
        }

        /* kidoju.widgets.playbar */
        if (kendo.ui.PlayBar) {
            kendo.ui.PlayBar.prototype.options.messages =
                $.extend(true, kendo.ui.PlayBar.prototype.options.messages, {
                    empty: 'Rien à afficher',
                    page: 'Page',
                    of: 'de {0}',
                    first: 'Aller à la première page',
                    previous: 'Aller à la dernière page',
                    next: 'Aller à la prochaine page',
                    last: 'Aller à la page précédente',
                    refresh: 'Rafraichîr',
                    morePages: 'Plus de pages'
                });
        }

        /* kidoju.widgets.propertygrid */
        if (kendo.ui.PropertyGrid) {
            kendo.ui.PropertyGrid.prototype.options.messages =
                $.extend(true, kendo.ui.PropertyGrid.prototype.options.messages, {
                    property: 'Propriété',
                    value: 'Valeur'
                });
        }

        /* kidoju.widgets.quiz */
        if (kendo.ui.Quiz) {
            kendo.ui.Quiz.prototype.options.messages =
                $.extend(true, kendo.ui.Quiz.prototype.options.messages, {
                    optionLabel: 'Sélectionner...'
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
                    noPage: 'Veuillez ajouter ou sélectionner une page'
                });
        }

        /* kidoju.widgets.styleeditor */
        if (kendo.ui.StyleEditor) {
            kendo.ui.StyleEditor.prototype.options.messages =
                $.extend(true, kendo.ui.StyleEditor.prototype.options.messages, {
                    columns: {
                        name: 'Nom',
                        value: 'Valeur'
                    },
                    toolbar: {
                        create: 'Nouveau',
                        destroy: 'Effacer'
                    },
                    validation: {
                        name: 'Nom de style manquant',
                        value: 'Valeur manquante'
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
