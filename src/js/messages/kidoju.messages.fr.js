/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
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
                },
                data: {
                    defaultName: 'Chargement...',
                    defaultImage: '' // TODO
                }
            });
        }

        /* kidoju.widgets.codeeditor */
        if (ui.CodeEditor) {
            options = ui.CodeEditor.prototype.options;
            options.messages = $.extend(true, options.messages, {
                formula: 'Formule:',
                notApplicable: 'N/A',
                solution: 'Solution:',
                value: 'Valeur:',
                test: 'Test',
                success: 'Succès',
                failure: 'Échec',
                omit: 'Omission',
                error: 'Erreur',
                ajaxError: 'Erreur de chargement de la librairie de validation.',
                jsonError: 'Erreur d\'analyse de la valeur par json. Placez les chaînes de caractères entre guillemets.',
                timeoutError: 'L\'exécution du processus de validation a pris trop de temps.'
            });
        }

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

        /* kidoju.widgets.imagelist */
        if (ui.ImageList) {
            options = ui.ImageList.prototype.options;
            options.messages = $.extend(true, options.messages, {
                toolbar: {
                    add: 'Ajouter'
                },
                validation: {
                    image: 'Une image est requise.',
                    text: 'Du texte est requis.'
                }
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

        /* kidoju.widgets.multiquiz */
        if (ui.MultiQuiz) {
            options = ui.MultiQuiz.prototype.options;
            options.messages = $.extend(true, options.messages, {
                placeholder: 'Sélectionner...'
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
                previous: 'Aller à la page précédente',
                next: 'Aller à la prochaine page',
                last: 'Aller à la dernière page',
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
        if (ui.Social) {
            options = ui.Social.prototype.options;
            options.messages = $.extend(true, options.messages, {
                classroom: 'Partager sur Google Classroom',
                facebook: 'Partager sur Facebook',
                google: 'Partager sur Google+',
                linkedin: 'Partager sur LinkedIn',
                pinterest: 'Partager sur Pinterest',
                twitter: 'Partager sur Twitter'
            });
        }

        /* kidoju.widgets.stage */
        if (ui.Stage) {
            options = ui.Stage.prototype.options;
            options.messages = $.extend(true, options.messages, {
                contextMenu: {
                    delete: 'Supprimer',
                    duplicate: 'Dupliquer'
                },
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
         * kidoju.data & kidoju.tools
         */

        if (window.kidoju) {

            var kidoju = window.kidoju;
            var adapters = kidoju.adapters;
            var data = kidoju.data;
            var tools = kidoju.tools;
            var Tool = kidoju.Tool;
            var attributes;
            var properties;

            if (adapters && adapters.CharGridAdapter) {
                adapters.CharGridAdapter.prototype.messages = {
                    layout: '<h3>Concevez la grille</h3><p>Chaque caractère saisi dans la grille est verrouillé et ne peut être modifié  en mode d\'exécution.</p><p>Utilisez le caractère `{0}` pour désigner les cellules vides.</p>',
                    solution: '<h3>Saisissez la solution</h3><p>Utilisez les caractères autorisés de la liste blanche, i.e. `{0}`.</p>'
                };
            }

            /*
            if (data && data.PageComponent) {
                data.PageComponent.prototype.messages = {
                }
            }
            */

            if (data && data.Page) {
                data.Page.prototype.messages = {
                    emptyPage: 'La page {0} ne doit pas être vide.',
                    minConnectors: 'Au moins {0} Connecteurs sont nécessaires pour faire une question en page {1}.',
                    missingDraggable: 'Des Étiquettes et Images déplaçables sont requis pour la/les Zone(s) de Dépôt en page {0}.',
                    missingDropZone: 'Une Zone de Dépôt est requise pour les Étiquettes et Images déplaçables en page {0}.',
                    missingLabel: 'Une Étiquettes est recommandée en page {0}.',
                    missingMultimedia: 'Un élément multimédia (Image, Audio, Vidéo) est recommandé en page {0}.',
                    missingQuestion: 'Une question est recommandé en page {0}.',
                    missingInstructions: 'Des instructions sont recommandées en page {0}.',
                    missingExplanations: 'Des explications sont recommandées en page {0}.'
                };
            }

            if (data && data.Stream) {
                data.Stream.prototype.messages = {
                    duplicateNames: 'Supprimez les composants utilisant le même nom `{0}` en pages {1}',
                    minPages: 'Il faut au moins {0} pages pour pouvoir publier.',
                    minQuestions: 'Il faut au moins {0} questions pour pouvoir publier.',
                    typeVariety: 'On recommande l\'usage d\'au moins {0} types de questions (Choix Multiple, Boîte de Texte, Connecteurs ou autre).',
                    qtyVariety: 'On recommande plus de variété quand {0:p0} des questions sont du type {1}.'
                };
            }

            // if (kidoju.Tool instanceof Function) {
            if (Tool && Tool.constructor && Tool.constructor.name === 'Function') {
                Tool.prototype.i18n = $.extend(true, Tool.prototype.i18n, {
                    tool: {
                        top: { title: 'Pos. Haut' },
                        left: { title: 'Pos. Gauche' },
                        height: { title: 'Hauteur' },
                        width: { title: 'Largeur' },
                        rotate: { title: 'Rotation' }
                    },
                    dialogs: {
                        ok: { text: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK' },
                        cancel: { text: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Annuler' }
                    },
                    messages: {
                        invalidAltText: 'Un(e) {0} en page {1} nécessite un texte alternatif dans les attributs d\'affichage.',
                        invalidAudioFile: 'Un(e) {0} en page {1} nécessite un fichier mp3 dans les attributs d\'affichage.',
                        invalidColor: 'Un(e) {0} on page {1} a une couleur invalide dans les attributs d\'affichage.',
                        invalidData: 'Un(e) {0} en page {1} nécessite des valeurs dans les attributs d\'affichage.',
                        invalidDescription: 'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une question dans la logique de test.',
                        invalidDropValue: 'Une {0} en page {1} nécessite une valeur de dépôt dans la logique de test.',
                        invalidFailure: 'Un(e) {0} nommé(e) `{1}` en page {2} a un score d\'échec supérieur au score d\'omission ou zéro dans la logique de test.',
                        invalidFormula: 'Un(e) {0} on page {1} nécessite une formule dans les attributs d\'affichage.',
                        invalidImageFile: 'Un(e) {0} en page {1} nécessite un fichier image dans les attributs d\'affichage.',
                        invalidName: 'Un(e) {0} nommé(e) `{1}` on page {2} a un nom invalide.',
                        invalidSolution: 'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une solution dans la logique de test.',
                        invalidStyle: 'Un(e) {0} en page {1} a un style invalide dans les attributs d\'affichage.',
                        invalidSuccess: 'Un(e) {0} nommé(e) `{1}` en page {2} a un score de succès inférieur au score d\'omission ou zéro dans la logique de test.',
                        invalidText: 'Un(e) {0} en page {1} nécessite un texte dans les attributs d\'affichage.',
                        invalidValidation: 'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une formule de validation dans la logique de test.',
                        invalidVideoFile: 'Un(e) {0} en page {1} nécessite un fichier mp4 dans les attributs d\'affichage.'
                    }
                });
            }

            if (tools instanceof kendo.Observable) {

                if (tools.audio instanceof Tool) {
                    // Description
                    tools.audio.constructor.prototype.description = 'Lecteur Audio';
                    // Attributes
                    attributes = tools.audio.constructor.prototype.attributes;
                    attributes.autoplay.title = 'Auto.';
                    attributes.mp3.title = 'Fichier MP3';
                    attributes.ogg.title = 'Fichier OGG';
                }

                if (tools.chart instanceof Tool) {
                    // Description
                    tools.chart.constructor.prototype.description = 'Diagramme';
                    // Attributes
                    attributes = tools.chart.constructor.prototype.attributes;
                    attributes.type.title = 'Type';
                    attributes.title.title = 'Titre';
                    attributes.categories.title = 'Catégories';
                    attributes.values.title = 'Valeurs';
                    attributes.legend.title = 'Légende';
                    attributes.data.title = 'Données';
                    attributes.style.title = 'Style';
                }

                if (tools.chargrid instanceof Tool) {
                    // Description
                    tools.chargrid.constructor.prototype.description = 'Character Grid';
                    // Attributes
                    attributes = tools.chargrid.constructor.prototype.attributes;
                    attributes.blank.title = 'Vide';
                    attributes.columns.title = 'Colonnes';
                    attributes.layout.title = 'Mise en Page';
                    attributes.rows.title = 'Lignes';
                    attributes.whitelist.title = 'Caractères';
                    attributes.gridFill.title = 'Fond de Grille';
                    attributes.gridStroke.title = 'Contour de Grille';
                    // blankFill = gridStroke
                    attributes.selectedFill.title = 'Fond Sélectionné';
                    attributes.lockedFill.title = 'Fond Vérouillé';
                    // lockedColor = valueColor = fontColor
                    attributes.fontColor.title = 'Couleur Police';
                    // Properties
                    properties = tools.chargrid.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                }

                if (tools.connector instanceof Tool) {
                    // Description
                    tools.connector.constructor.prototype.description = 'Connecteur';
                    // Attributes
                    attributes = tools.connector.constructor.prototype.attributes;
                    attributes.color.title = 'Couleur';
                    // Properties
                    properties = tools.connector.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                    properties.disabled.title = 'Désactivé';
                }

                if (tools.dropzone instanceof Tool) {
                    // Description
                    tools.dropzone.constructor.prototype.description = 'Zone de Dépot';
                    // Attributes
                    attributes = tools.dropzone.constructor.prototype.attributes;
                    attributes.center.title = 'Centrer';
                    attributes.text.defaultValue = false;
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Texte';
                    attributes.text.defaultValue = 'Veuillez déposer ici.';
                    // Properties
                    properties = tools.dropzone.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                    properties.disabled.title = 'Désactivé';
                }

                if (tools.image instanceof Tool) {
                    // Description
                    tools.image.constructor.prototype.description = 'Image';
                    // Attributes
                    attributes = tools.image.constructor.prototype.attributes;
                    attributes.alt.title = 'Texte';
                    attributes.alt.defaultValue = 'Image';
                    attributes.src.title = 'Source';
                    attributes.src.defaultValue = 'cdn://images/o_collection/svg/office/painting_landscape.svg';
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.image.constructor.prototype.properties;
                    properties.draggable.title = 'Déplaçable';
                    properties.dropValue.title = 'Valeur';
                }

                if (tools.imageset instanceof Tool) {
                    // Description
                    tools.imageset.constructor.prototype.description = 'Image';
                    // Attributes
                    attributes = tools.imageset.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    attributes.data.title = 'Images';
                    attributes.data.defaultValue = [{ text: 'Image set', image: 'cdn://images/o_collection/svg/office/photos.svg' }];
                    // Properties
                    properties = tools.imageset.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.label instanceof Tool) {
                    // Description
                    tools.label.constructor.prototype.description = 'Étiquette';
                    // Attributes
                    attributes = tools.label.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Texte';
                    attributes.text.defaultValue = 'Label';
                    // Properties
                    properties = tools.label.constructor.prototype.properties;
                    properties.draggable.title = 'Déplaçable';
                    properties.dropValue.title = 'Valeur';
                }

                if (tools.mathexpression instanceof Tool) {
                    // Description
                    tools.mathexpression.constructor.prototype.description = 'Expression Mathématique';
                    // Attributes
                    attributes = tools.mathexpression.constructor.prototype.attributes;
                    attributes.formula.title = 'Formule';
                    attributes.formula.defaultValue = '\\sum_{n=1}^{\\infty}2^{-n}=1';
                    attributes.inline.title = 'Aligné';
                    attributes.inline.defaultValue = false;
                    attributes.style.title = 'Style';
                }

                if (tools.multiquiz instanceof Tool) {
                    // Description
                    tools.multiquiz.constructor.prototype.description = 'Question à Choix Multiple';
                    // Attributes
                    attributes = tools.multiquiz.constructor.prototype.attributes;
                    attributes.data.title = 'Valeurs';
                    attributes.data.defaultValue = [{ text: 'Option 1', image: 'cdn://images/o_collection/svg/office/hand_count_one.svg' }, { text: 'Option 2', image: 'cdn://images/o_collection/svg/office/hand_point_up.svg' }];
                    attributes.groupStyle.title = 'Style Groupe';
                    attributes.itemStyle.title = 'Style Element';
                    attributes.mode.title = 'Mode';
                    attributes.selectedStyle.title = 'Style Sélection';
                    attributes.shuffle.title = 'Mélanger';
                    // Properties
                    properties = tools.multiquiz.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                }

                if (tools.quiz instanceof Tool) {
                    // Description
                    tools.quiz.constructor.prototype.description = 'Question à Choix Unique';
                    // Attributes
                    attributes = tools.quiz.constructor.prototype.attributes;
                    attributes.data.title = 'Valeurs';
                    attributes.data.defaultValue = [{ text: 'Vrai', image: 'cdn://images/o_collection/svg/office/ok.svg' }, { text: 'Faux', image: 'cdn://images/o_collection/svg/office/error.svg' }];
                    attributes.groupStyle.title = 'Style Groupe';
                    attributes.itemStyle.title = 'Style Element';
                    attributes.mode.title = 'Mode';
                    attributes.selectedStyle.title = 'Style Sélection';
                    attributes.shuffle.title = 'Mélanger';
                    // Properties
                    properties = tools.quiz.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                }

                if (tools.selector instanceof Tool) {
                    // Description
                    tools.selector.constructor.prototype.description = 'Selecteur';
                    // Attributes
                    attributes = tools.selector.constructor.prototype.attributes;
                    attributes.color.title = 'Couleur';
                    attributes.shape.title = 'Forme';
                    // Properties
                    properties = tools.selector.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                    properties.disabled.title = 'Désactiver';
                }

                if (tools.table instanceof Tool) {
                    // Description
                    tools.table.constructor.prototype.description = 'Table Statique';
                    // Attributes
                    attributes = tools.table.constructor.prototype.attributes;
                    attributes.columns.title = 'Colonnes';
                    attributes.rows.title = 'Lignes';
                    attributes.data.title = 'Données';
                }

                if (tools.textarea instanceof Tool) {
                    // Description
                    tools.textarea.constructor.prototype.description = 'Aire de Texte';
                    // Attributes
                    attributes = tools.textarea.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.textarea.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                }

                if (tools.textbox instanceof Tool) {
                    // Description
                    tools.textbox.constructor.prototype.description = 'Boîte de Texte';
                    // Attributes
                    attributes = tools.textbox.constructor.prototype.attributes;
                    attributes.mask.title = 'Masque';
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.textbox.constructor.prototype.properties;
                    properties.name.title = 'Nom';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Succès';
                    properties.failure.title = 'Échec';
                    properties.omit.title = 'Omission';
                    properties.disabled.title = 'Désactivé';
                }

                if (tools.video instanceof Tool) {
                    // Description
                    tools.video.constructor.prototype.description = 'Lecteur Vidéo';
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
