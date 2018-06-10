/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';

/**
 * kidoju.data
 */
if (window.kidoju && window.kidoju.data) {
    const { Page, Stream } = window.kidoju.data;

    /*
    if (data && data.PageComponent) {
        data.PageComponent.prototype.messages = {
        }
    }
    */

    if (Page) {
        Page.prototype.messages = {
            createMultiQuizExplanations:
                'Les bonnes réponses sont:\n\n- **{0}**.',
            createMultiQuizInstructions:
                'Veuillez sélectionner les options qui correspondent à vos réponses à la question: _{0}_.',
            createTextBoxExplanations: 'La bonne réponse est **{0}**.',
            createTextBoxInstructions:
                'Veuillez remplir la zone de texte avec votre réponse à la question: _{0}_.',
            createQuizExplanations: 'La bonne réponse est **{0}**.',
            createQuizInstructions:
                'Veuillez sélectionner l´option qui correspond à votre réponse à la question: _{0}_.',
            emptyPage: 'La page {0} ne doit pas être vide.',
            minConnectors:
                'Au moins {0} Connecteurs sont nécessaires pour faire une question en page {1}.',
            missingDraggable:
                'Des Étiquettes et Images déplaçables sont requises pour la/les Zone(s) de Dépôt en page {0}.',
            missingDropZone:
                'Une Zone de Dépôt est requise pour les Étiquettes et Images déplaçables en page {0}.',
            missingLabel: 'Une Étiquettes est recommandée en page {0}.',
            missingMultimedia:
                'Un élément multimédia (Image, Audio, Vidéo) est recommandé en page {0}.',
            missingQuestion: 'Une question est recommandé en page {0}.',
            missingSelectable:
                'Des Étiquettes et Images sélectables sont requises pour le Sélecteur en page {0}.',
            missingSelector:
                'Un Sélecteur est requis pour les Étiquettes et Images sélectables en page {0}.',
            missingInstructions:
                'Des instructions sont recommandées en page {0}.',
            missingExplanations:
                'Des explications sont recommandées en page {0}.'
        };
    }

    if (Stream) {
        Stream.prototype.messages = {
            duplicateNames:
                'Supprimez les composants utilisant le même nom `{0}` en pages {1}',
            minPages: 'Il faut au moins {0} pages pour pouvoir publier.',
            minQuestions:
                'Il faut au moins {0} questions pour pouvoir publier.',
            typeVariety:
                'On recommande l’usage d’au moins {0} types de questions (Choix Multiple, Boîte de Texte, Connecteurs ou autre).',
            qtyVariety:
                'On recommande plus de variété quand {0:p0} des questions sont du type {1}.'
        };
    }
}

/**
 * kidoju.tools
 */
if (window.kidoju && window.kidoju.tools && window.kidoju.Tool) {
    const { tools, Tool } = window.kidoju;

    if (Tool) {
        Tool.prototype.i18n = $.extend(true, Tool.prototype.i18n, {
            tool: {
                top: { title: 'Pos. Haut' },
                left: { title: 'Pos. Gauche' },
                height: { title: 'Hauteur' },
                width: { title: 'Largeur' },
                rotate: { title: 'Rotation' }
            },
            dialogs: {
                ok: {
                    text:
                        '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK'
                },
                cancel: {
                    text:
                        '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Annuler'
                }
            },
            messages: {
                invalidAltText:
                    'Un(e) {0} en page {1} nécessite un texte alternatif dans les attributs d’affichage.',
                invalidAudioFile:
                    'Un(e) {0} en page {1} nécessite un fichier mp3 dans les attributs d’affichage.',
                invalidColor:
                    'Un(e) {0} on page {1} a une couleur invalide dans les attributs d’affichage.',
                invalidData:
                    'Un(e) {0} en page {1} nécessite des valeurs dans les attributs d’affichage.',
                invalidDescription:
                    'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une question dans la logique de test.',
                invalidConstant:
                    'Une {0} en page {1} nécessite une constante dans la logique de test.',
                invalidFailure:
                    'Un(e) {0} nommé(e) `{1}` en page {2} a un score d’échec supérieur au score d’omission ou zéro dans la logique de test.',
                invalidFormula:
                    'Un(e) {0} on page {1} nécessite une formule dans les attributs d’affichage.',
                invalidImageFile:
                    'Un(e) {0} en page {1} nécessite un fichier image dans les attributs d’affichage.',
                invalidName:
                    'Un(e) {0} nommé(e) `{1}` on page {2} a un nom invalide.',
                invalidShape:
                    'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une forme dans les attributs d’affichage.',
                invalidSolution:
                    'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une solution dans la logique de test.',
                invalidStyle:
                    'Un(e) {0} en page {1} a un style invalide dans les attributs d’affichage.',
                invalidSuccess:
                    'Un(e) {0} nommé(e) `{1}` en page {2} a un score de succès inférieur au score d’omission ou zéro dans la logique de test.',
                invalidText:
                    'Un(e) {0} en page {1} nécessite un texte dans les attributs d’affichage.',
                invalidValidation:
                    'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une formule de validation dans la logique de test.',
                invalidVideoFile:
                    'Un(e) {0} en page {1} nécessite un fichier mp4 dans les attributs d’affichage.'
            }
        });
    }

    if (tools) {
        if (tools.audio instanceof Tool) {
            // Description
            tools.audio.constructor.prototype.description = 'Lecteur Audio';
            // Attributes
            const { attributes } = tools.audio.constructor.prototype;
            attributes.autoplay.title = 'Auto.';
            attributes.mp3.title = 'Fichier MP3';
            attributes.ogg.title = 'Fichier OGG';
        }

        if (tools.chart instanceof Tool) {
            // Description
            tools.chart.constructor.prototype.description = 'Diagramme';
            // Attributes
            const { attributes } = tools.chart.constructor.prototype;
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
            const { attributes } = tools.chargrid.constructor.prototype;
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
            const { properties } = tools.chargrid.constructor.prototype;
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
            const { attributes } = tools.connector.constructor.prototype;
            attributes.color.title = 'Couleur';
            // Properties
            const { properties } = tools.connector.constructor.prototype;
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
            const { attributes } = tools.dropzone.constructor.prototype;
            attributes.center.title = 'Centrer';
            attributes.center.defaultValue = false;
            attributes.empty.title = 'Vide';
            attributes.style.title = 'Style';
            attributes.text.title = 'Texte';
            attributes.text.defaultValue = 'Veuillez déposer ici.';
            // Properties
            const { properties } = tools.dropzone.constructor.prototype;
            properties.name.title = 'Nom';
            properties.question.title = 'Question';
            properties.solution.title = 'Solution';
            properties.validation.title = 'Validation';
            properties.success.title = 'Succès';
            properties.failure.title = 'Échec';
            properties.omit.title = 'Omission';
            properties.disabled.title = 'Désactivé';
        }

        if (tools.highlighter instanceof Tool) {
            // Description
            tools.highlighter.constructor.prototype.description = 'Surligneur';
            // Attributes
            const { attributes } = tools.highlighter.constructor.prototype;
            attributes.highlightStyle.title = 'Surligne';
            attributes.split.title = 'Césure';
            attributes.style.title = 'Style';
            attributes.text.title = 'Texte';
            attributes.text.defaultValue = 'Un peu de texte à surligner.';
            // Properties
            const { properties } = tools.highlighter.constructor.prototype;
            properties.name.title = 'Nom';
            properties.question.title = 'Question';
            properties.solution.title = 'Solution';
            properties.validation.title = 'Validation';
            properties.success.title = 'Succès';
            properties.failure.title = 'Échec';
            properties.omit.title = 'Omission';
        }

        if (tools.image instanceof Tool) {
            // Description
            tools.image.constructor.prototype.description = 'Image';
            // Attributes
            const { attributes } = tools.image.constructor.prototype;
            attributes.alt.title = 'Texte';
            attributes.alt.defaultValue = 'Image';
            attributes.src.title = 'Source';
            attributes.src.defaultValue =
                'cdn://images/o_collection/svg/office/painting_landscape.svg';
            attributes.style.title = 'Style';
            // Properties
            const { properties } = tools.image.constructor.prototype;
            properties.behavior.title = 'Comportement';
            properties.constant.title = 'Constante';
        }

        if (tools.imageset instanceof Tool) {
            // Description
            tools.imageset.constructor.prototype.description = 'Jeu d’images';
            // Attributes
            const { attributes } = tools.imageset.constructor.prototype;
            attributes.style.title = 'Style';
            attributes.data.title = 'Images';
            attributes.data.defaultValue = [
                {
                    text: 'Image set',
                    image: 'cdn://images/o_collection/svg/office/photos.svg'
                }
            ];
            // Properties
            const { properties } = tools.imageset.constructor.prototype;
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
            const { attributes } = tools.label.constructor.prototype;
            attributes.style.title = 'Style';
            attributes.text.title = 'Texte';
            attributes.text.defaultValue = 'Label';
            // Properties
            const { properties } = tools.label.constructor.prototype;
            properties.behavior.title = 'Comportement';
            properties.constant.title = 'Constante';
        }

        if (tools.mathexpression instanceof Tool) {
            // Description
            tools.mathexpression.constructor.prototype.description =
                'Expression Mathématique';
            // Attributes
            const { attributes } = tools.mathexpression.constructor.prototype;
            attributes.formula.title = 'Formule';
            attributes.formula.defaultValue = '\\sum_{n=1}^{\\infty}2^{-n}=1';
            attributes.inline.title = 'Aligné';
            attributes.inline.defaultValue = false;
            attributes.style.title = 'Style';
        }

        if (tools.multiquiz instanceof Tool) {
            // Description
            tools.multiquiz.constructor.prototype.description =
                'Question à Choix Multiple';
            // Attributes
            const { attributes } = tools.multiquiz.constructor.prototype;
            attributes.data.title = 'Valeurs';
            attributes.data.defaultValue = [
                {
                    text: 'Option 1',
                    image:
                        'cdn://images/o_collection/svg/office/hand_count_one.svg'
                },
                {
                    text: 'Option 2',
                    image:
                        'cdn://images/o_collection/svg/office/hand_point_up.svg'
                }
            ];
            attributes.groupStyle.title = 'Style Groupe';
            attributes.itemStyle.title = 'Style Element';
            attributes.mode.title = 'Mode';
            attributes.selectedStyle.title = 'Style Sélection';
            attributes.shuffle.title = 'Mélanger';
            // Properties
            const { properties } = tools.multiquiz.constructor.prototype;
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
            tools.quiz.constructor.prototype.description =
                'Question à Choix Unique';
            // Attributes
            const { attributes } = tools.quiz.constructor.prototype;
            attributes.data.title = 'Valeurs';
            attributes.data.defaultValue = [
                {
                    text: 'Vrai',
                    image: 'cdn://images/o_collection/svg/office/ok.svg'
                },
                {
                    text: 'Faux',
                    image: 'cdn://images/o_collection/svg/office/error.svg'
                }
            ];
            attributes.groupStyle.title = 'Style Groupe';
            attributes.itemStyle.title = 'Style Element';
            attributes.mode.title = 'Mode';
            attributes.selectedStyle.title = 'Style Sélection';
            attributes.shuffle.title = 'Mélanger';
            // Properties
            const { properties } = tools.quiz.constructor.prototype;
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
            const { attributes } = tools.selector.constructor.prototype;
            attributes.color.title = 'Couleur';
            attributes.shape.title = 'Forme';
            // Properties
            const { properties } = tools.selector.constructor.prototype;
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
            const { attributes } = tools.table.constructor.prototype;
            attributes.columns.title = 'Colonnes';
            attributes.rows.title = 'Lignes';
            attributes.data.title = 'Données';
        }

        if (tools.textarea instanceof Tool) {
            // Description
            tools.textarea.constructor.prototype.description = 'Aire de Texte';
            // Attributes
            const { attributes } = tools.textarea.constructor.prototype;
            attributes.style.title = 'Style';
            // Properties
            const { properties } = tools.textarea.constructor.prototype;
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
            const { attributes } = tools.textbox.constructor.prototype;
            attributes.mask.title = 'Masque';
            attributes.style.title = 'Style';
            // Properties
            const { properties } = tools.textbox.constructor.prototype;
            properties.name.title = 'Nom';
            properties.question.title = 'Question';
            properties.solution.title = 'Solution';
            properties.validation.title = 'Validation';
            properties.success.title = 'Succès';
            properties.failure.title = 'Échec';
            properties.omit.title = 'Omission';
        }

        if (tools.textgaps instanceof Tool) {
            // Description
            tools.textgaps.constructor.prototype.description = 'Texte à trous';
            // Attributes
            const { attributes } = tools.textgaps.constructor.prototype;
            attributes.inputStyle.title = 'Style saisie';
            attributes.style.title = 'Style';
            attributes.text.title = 'Texte';
            attributes.text.defaultValue =
                'Un peu de texte avec un trou comme [] ou [] à remplir.';
            // Properties
            const { properties } = tools.textgaps.constructor.prototype;
            properties.name.title = 'Nom';
            properties.question.title = 'Question';
            properties.solution.title = 'Solution';
            properties.validation.title = 'Validation';
            properties.success.title = 'Succès';
            properties.failure.title = 'Échec';
            properties.omit.title = 'Omission';
        }

        if (tools.video instanceof Tool) {
            // Description
            tools.video.constructor.prototype.description = 'Lecteur Vidéo';
            // Attributes
            const { attributes } = tools.video.constructor.prototype;
            attributes.autoplay.title = 'Auto.';
            attributes.toolbarHeight.title = 'Haut. Commandes';
            attributes.mp4.title = 'Fichier MP4';
            attributes.ogv.title = 'Fichier OGV';
            attributes.wbem.title = 'Fichier WBEM';
        }
    }
}
