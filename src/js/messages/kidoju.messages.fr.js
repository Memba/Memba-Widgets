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

    var kendo = window.kendo;
    var ui = kendo.ui;
    var options;

    /*  This function has too many statements. */
    /* jshint -W071 */

    /*  This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    (function ($, undefined) {

        /* kidoju.widgets.assetmanager */
        if (ui.AssetManager) {
            options = ui.AssetManager.prototype.options;
            options.messages = $.extend(true, options.messages, {
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
         if (ui.CodeEditor) {
            options = ui.CodeEditor.prototype.options;
            options.messages = $.extend(true, options.messages, {
                // TODO
            });
         }
         */

        /* kidoju.widgets.codeinput */
        /*
         if (ui.CodeInput) {
            options = ui.CodeInput.prototype.options;
            options.messages = $.extend(true, options.messages, {
                // TODO
            });
         }
         */

        /* kidoju.widgets.explorer */
        if (ui.Explorer) {
            options = ui.Explorer.prototype.options;
            options.messages = $.extend(true, options.messages, {
                empty: 'Rien à afficher'
            });
        }

        /* kidoju.widgets.mediaplayer */
        if (ui.MediaPlayer) {
            options = ui.MediaPlayer.prototype.options;
            options.messages = $.extend(true, options.messages, {
                play: 'Jouer/Pauser',
                mute: 'Avec/Sans son',
                full: 'Plein écran',
                notSupported: 'Fichier non supporté'
            });
        }

        /* kidoju.widgets.multiinput */
        if (ui.MultiInput) {
            options = ui.MultiInput.prototype.options;
            options.messages = $.extend(true, options.messages, {
                delete: 'Effacer'
            });
        }

        /* kidoju.widgets.navigation */
        if (ui.Navigation) {
            options = ui.Navigation.prototype.options;
            options.messages = $.extend(true, options.messages, {
                empty: 'Rien à afficher'
            });
        }

        /* kidoju.widgets.playbar */
        if (ui.PlayBar) {
            options = ui.PlayBar.prototype.options;
            options.messages = $.extend(true, options.messages, {
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
        if (ui.PropertyGrid) {
            options = ui.PropertyGrid.prototype.options;
            options.messages = $.extend(true, options.messages, {
                property: 'Propriété',
                value: 'Valeur'
            });
        }

        /* kidoju.widgets.quiz */
        if (ui.Quiz) {
            options = ui.Quiz.prototype.options;
            options.messages = $.extend(true, options.messages, {
                optionLabel: 'Sélectionner...'
            });
        }

        /* kidoju.widgets.rating */
        /*
         if (ui.Rating) {
             options = ui.Rating.prototype.options;
         options.messages = $.extend(true, options.messages, {
                // TODO
            });
         }
         */

        /* kidoju.widgets.social */
        /*
         if (ui.Social) {
            options = ui.Social.prototype.options;
            options.messages = $.extend(true, options.messages, {
                // TODO
            });
         }
         */

        /* kidoju.widgets.stage */
        if (ui.Stage) {
            options = ui.Stage.prototype.options;
            options.messages = $.extend(true, options.messages, {
                noPage: 'Veuillez ajouter ou sélectionner une page'
            });
        }

        /* kidoju.widgets.styleeditor */
        if (ui.StyleEditor) {
            options = ui.StyleEditor.prototype.options;
            options.messages = $.extend(true, options.messages, {
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
         if (ui.ToolBox) {
            options = ui.ToolBox.prototype.options;
            options.messages = $.extend(true, options.messages, {
                // TODO
            });
         }
         */

        /**
         * kidoju.tools
         */

        if (window.kidoju) {

            var kidoju = window.kidoju;
            var tools = kidoju.tools;
            var Tool = kidoju.Tool;
            var attributes;
            var properties;

            // if (kidoju.Tool instanceof Function) {
            if (Tool && Tool.constructor && Tool.constructor.name === 'Function') {
                Tool.prototype.i18n = $.extend(true, Tool.prototype.i18n, {
                    tool: {
                        top: {title: 'Pos. Haut'},
                        left: {title: 'Pos. Gauche'},
                        height: {title: 'Hauteur'},
                        width: {title: 'Largeur'},
                        rotate: {title: 'Rotation'}
                    },
                    dialogs: {
                        ok: {text: 'OK'},
                        cancel: {text: 'Annuler'}
                    }
                });
            }

            if (tools instanceof kendo.Observable) {

                if (tools.audio instanceof Tool) {
                    // Attributes
                    attributes = tools.audio.constructor.prototype.attributes;
                    attributes.autoplay.title = 'Auto.';
                    attributes.mp3.title = 'Fichier MP3';
                    attributes.ogg.title = 'Fichier OGG';
                }

                if (tools.checkbox instanceof Tool) {
                    // Attributes
                    attributes = tools.checkbox.constructor.prototype.attributes;
                    attributes.checkboxStyle.title = 'Style Boîte';
                    attributes.labelStyle.title = 'Style Texte';
                    attributes.text.title = 'Texte';
                    // Properties
                    properties = tools.checkbox.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.description.title = 'Description';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Echec';
                    properties.omit.title = 'Omission';
                }

                if (tools.image instanceof Tool) {
                    // Attributes
                    attributes = tools.image.constructor.prototype.attributes;
                    attributes.src.title = 'Source';
                    attributes.alt.title = 'Texte';
                }

                if (tools.label instanceof Tool) {
                    // Attributes
                    attributes = tools.label.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Texte';
                }

                if (tools.quiz instanceof Tool) {
                    // Attributes
                    attributes = tools.quiz.constructor.prototype.attributes;
                    attributes.activeStyle.title = 'Style Sélect.';
                    attributes.data.title = 'Valeurs';
                    attributes.groupStyle.title = 'Style Groupe';
                    attributes.itemStyle.title = 'Style Element';
                    attributes.mode.title = 'Mode';
                    // Properties
                    properties = tools.quiz.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.description.title = 'Description';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Echec';
                    properties.omit.title = 'Omission';
                }

                if (tools.textbox instanceof Tool) {
                    // Attributes
                    attributes = tools.textbox.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.textbox.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.description.title = 'Description';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Echec';
                    properties.omit.title = 'Omission';
                }

                if (tools.video instanceof Tool) {
                    // Attributes
                    attributes = tools.video.constructor.prototype.attributes;
                    attributes.autoplay.title = 'Auto.';
                    attributes.toolbarHeight.title = 'Haut. Commandes';
                    attributes.mp4.title = 'Fichier MP4';
                    attributes.ogv.title = 'Fichier OGV';
                    attributes.wbem.title = 'Fichier WBEM';
                }
            }

        }

    })(window.kendo.jQuery);

    /* jshint +W074 */
    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
