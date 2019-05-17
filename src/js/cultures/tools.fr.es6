/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import i18n from '../common/window.i18n.es6';
import tools from '../tools/tools.es6';

const { attr } = window.kendo;

/**
 * BaseTool and tools
 */
$.extend(true, i18n(), {
    basetool: {
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
        invalidQuestion:
            'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une question dans la logique de test.',
        invalidConstant:
            'Une {0} en page {1} nécessite une constante dans la logique de test.',
        invalidFailure:
            'Un(e) {0} nommé(e) `{1}` en page {2} a un score d’échec supérieur au score d’omission ou zéro dans la logique de test.',
        invalidFormula:
            'Un(e) {0} on page {1} nécessite une formule dans les attributs d’affichage.',
        invalidImageFile:
            'Un(e) {0} en page {1} nécessite un fichier image dans les attributs d’affichage.',
        invalidName: 'Un(e) {0} nommé(e) `{1}` on page {2} a un nom invalide.',
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

/**
 *
 */
if (tools.audio) {
    // Description
    tools.audio.constructor.prototype.description = 'Lecteur Audio';
    // Attributes
    const { attributes } = tools.audio.constructor.prototype;
    attributes.autoplay.title = 'Auto.';
    attributes.mp3.title = 'Fichier MP3';
    attributes.ogg.title = 'Fichier OGG';
}

/**
 *
 */
if (tools.chargrid) {
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

/**
 *
 */
if (tools.chart) {
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

/**
 *
 */
if (tools.connector) {
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

/**
 *
 */
if (tools.dropzone) {
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

/**
 *
 */
if (tools.highlighter) {
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

/**
 *
 */
if (tools.image) {
    // Description
    tools.image.constructor.prototype.description = 'Image';
    // Attributes
    const { attributes } = tools.image.constructor.prototype;
    attributes.alt.defaultValue = 'Image';
    attributes.alt.help = 'Entrez la description pour les malvoyants';
    attributes.alt.title = 'Texte';
    attributes.src.defaultValue =
        'cdn://images/o_collection/svg/office/painting_landscape.svg';
    attributes.src.help = 'Sélectionnez une image';
    attributes.src.title = 'Source';
    attributes.style.title = 'Style';
    // Properties
    const { properties } = tools.image.constructor.prototype;
    properties.behavior.attributes[attr('source')] = JSON.stringify([
        { text: 'Aucun', value: 'none' },
        { text: 'Glissable', value: 'draggable' },
        { text: 'Sélectionnable', value: 'selectable' }
    ]);
    properties.behavior.title = 'Comportement';
    properties.constant.title = 'Constante';
}

/**
 *
 */
if (tools.imageset) {
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

/**
 *
 */
if (tools.label) {
    // Description
    tools.label.constructor.prototype.description = 'Étiquette';
    // Attributes
    const { attributes } = tools.label.constructor.prototype;
    attributes.style.title = 'Style';
    attributes.text.defaultValue = 'Label';
    attributes.text.help = 'Entrez le texte de l´étiquette';
    attributes.text.title = 'Texte';
    // Properties
    const { properties } = tools.label.constructor.prototype;
    properties.behavior.title = 'Comportement';
    properties.constant.title = 'Constante';
}

/**
 * tools.mathexpression
 */
if (tools.mathexpression) {
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

/**
 * tools.mathinput
 */
if (tools.mathinput) {
    // TODO
}

/**
 * tools.multiquiz
 */
if (tools.multiquiz) {
    // Description
    tools.multiquiz.constructor.prototype.description =
        'Question à Choix Multiple';
    // Attributes
    const { attributes } = tools.multiquiz.constructor.prototype;
    attributes.data.title = 'Valeurs';
    attributes.data.defaultValue = [
        {
            text: 'Option 1',
            image: 'cdn://images/o_collection/svg/office/hand_count_one.svg'
        },
        {
            text: 'Option 2',
            image: 'cdn://images/o_collection/svg/office/hand_point_up.svg'
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

/**
 * tools.numericbox
 */
if (tools.numericbox) {
    // TODO
}

/**
 * tools.quiz
 */
if (tools.quiz) {
    // Description
    tools.quiz.constructor.prototype.description = 'Question à Choix Unique';
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

// if (tools.random) {}

if (tools.selector) {
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

if (tools.table) {
    // Description
    tools.table.constructor.prototype.description = 'Table Statique';
    // Attributes
    const { attributes } = tools.table.constructor.prototype;
    attributes.columns.title = 'Colonnes';
    attributes.rows.title = 'Lignes';
    attributes.data.title = 'Données';
}

if (tools.textarea) {
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

if (tools.textbox) {
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

if (tools.textgaps) {
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

if (tools.video) {
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
