/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
// import 'kendo.core';

const {
    ui: {
        AssetManager,
        BaseDialog,
        // ButtonSet
        // CharGrid
        CodeEditor,
        // CodeInput,
        // Connector
        // DropZone
        Explorer,
        // Floating
        // FormatStrip
        // Highlighter
        ImageList,
        // ImageSet
        // MarkDown
        MarkEditor,
        // MathExpression
        // MathInput,
        MediaPlayer,
        MultiInput,
        MultiQuiz,
        Navigation,
        PlayBar,
        PropertyGrid,
        Quiz,
        // Rating
        // Selector
        Social,
        // SplitButton
        Stage,
        StyleEditor
        // Table
        // Template
        // TextGaps
        // ToolBox
        // UnitInput
        // VectorDrawing
    },
    markeditor,
    mathinput
} = window.kendo;

/* kidoju.widgets.assetmanager */
if (AssetManager) {
    const { options } = AssetManager.prototype;
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

/* kidoju.widgets.basedialog */
if (BaseDialog) {
    const { options } = BaseDialog.prototype;
    options.messages = $.extend(true, options.messages, {
        title: {
            error: 'Erreur',
            info: 'Information',
            success: 'Succès',
            warning: 'Avertissement'
        },
        actions: {
            cancel: {
                action: 'cancel',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                text: 'Annuler'
            },
            no: {
                action: 'no',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                text: 'Non'
            },
            ok: {
                action: 'ok',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                primary: true,
                text: 'OK'
            },
            yes: {
                action: 'yes',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                primary: true,
                text: 'Oui'
            }
        }
    });
}

/* kidoju.widgets.codeeditor */
if (CodeEditor) {
    const { options } = CodeEditor.prototype;
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
        jsonError:
            'Erreur d’analyse de la valeur par json. Placez les chaînes de caractères entre guillemets.',
        timeoutError:
            'L’exécution du processus de validation a pris trop de temps.'
    });
}

/* kidoju.widgets.explorer */
if (Explorer) {
    const { options } = Explorer.prototype;
    options.messages = $.extend(true, options.messages, {
        empty: 'Rien à afficher'
    });
}

/* kidoju.widgets.imagelist */
if (ImageList) {
    const { options } = ImageList.prototype;
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

/* kidoju.widgets.markeditor */
if (MarkEditor) {
    const { options } = MarkEditor.prototype;
    options.messages = $.extend(true, options.messages, {
        image: 'Une image sans description',
        link: 'Cliquez ici'
    });
}
if (markeditor && markeditor.messages.dialogs) {
    markeditor.messages.dialogs = $.extend(true, markeditor.messages.dialogs, {
        cancel:
            '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Annuler',
        okText:
            '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK',
        headingsDialog: {
            title: 'Titres',
            buttons: {
                h1: 'Titre 1',
                h2: 'Heading 2',
                h3: 'Heading 3',
                h4: 'Heading 4',
                h5: 'Heading 5',
                h6: 'Heading 6'
            }
        },
        linkDialog: {
            title: 'Hyperlien',
            labels: {
                text: 'Url'
            }
        },
        imageDialog: {
            title: 'Image',
            labels: {
                url: 'Url'
            }
        },
        latexDialog: {
            title: 'Expression Mathématique',
            labels: {
                display: 'Affichage',
                inline: 'en ligne'
            }
        },
        previewDialog: {
            title: 'Aperçu'
        }
    });
}
if (markeditor && markeditor.messages.toolbar) {
    markeditor.messages.toolbar = $.extend(true, markeditor.messages.toolbar, {
        undo: 'Annuler',
        redo: 'Rétablir',
        headings: 'Titres',
        headingsButtons: {
            h1: 'Titre 1',
            h2: 'Titre 2',
            h3: 'Titre 3',
            h4: 'Titre 4',
            h5: 'Titre 5',
            h6: 'Titre 6'
        },
        bold: 'Gras',
        italic: 'Italique',
        bulleted: 'Liste à Puces',
        numbered: 'Liste Numérotée',
        blockquote: 'Bloc de Citation',
        hrule: 'Ligne Horizontale',
        link: 'Hyperlien',
        image: 'Image',
        code: 'Code',
        latex: 'Expression Mathématique',
        preview: 'Aperçu dans une Fenêtre'
    });
}

/* kidoju.widgets.mathinput */
if (mathinput && mathinput.messages.dialogs) {
    mathinput.messages.dialogs = $.extend(true, mathinput.messages.dialogs, {
        keypad: {
            title: 'Clavier',
            buttons: {
                comma: ',',
                stop: '.',
                n0: '0',
                n1: '1',
                n2: '2',
                n3: '3',
                n4: '4',
                n5: '5',
                n6: '6',
                n7: '7',
                n8: '8',
                n9: '9',
                a: 'a',
                b: 'b',
                c: 'c',
                i: 'i',
                j: 'j',
                k: 'k',
                n: 'n',
                p: 'p',
                q: 'q',
                x: 'x',
                y: 'y',
                z: 'z',
                pi: 'Pi',
                infty: 'Infini',
                space: 'Espace',
                subscript: 'Indice'
            }
        },
        basic: {
            title: 'Basique',
            buttons: {
                equal: 'Égal',
                plus: 'Plus',
                minus: 'Moins',
                cdot: 'Fois',
                times: 'Fois',
                div: 'Divisé par',
                pleft: 'Parenthèse gauche (',
                pright: 'Parenthèse droite )',
                frac: 'Fraction',
                sqrt: 'Racine carrée',
                pow2: 'Puissance de 2',
                pow3: 'Puissance de 3',
                sin: 'Sinus',
                cos: 'Cosinus',
                tan: 'Tangente'
            }
        },
        greek: {
            title: 'Grec',
            buttons: {
                alpha: 'Alpha',
                beta: 'Beta',
                gamma: 'Gamma',
                delta: 'Delta',
                epsilon: 'Epsilon', // varepsilon
                zeta: 'Zeta',
                eta: 'Eta',
                theta: 'Theta', // vartheta
                iota: 'Iota',
                kappa: 'Kappa', // varkappa
                lambda: 'Lambda',
                mu: 'Mu',
                nu: 'Nu',
                xi: 'Xi',
                omicron: 'Omicron',
                pi: 'Pi', // varpi
                rho: 'Rho', // varrho
                sigma: 'Sigma', // varsigma
                tau: 'Tau',
                upsilon: 'Upsilon',
                phi: 'Phi', // varphi
                chi: 'Chi',
                psi: 'Psi',
                omega: 'Omega'
            }
        },
        operators: {
            title: 'Operateurs',
            buttons: {
                equal: 'Égal',
                plus: 'Plus',
                minus: 'Moins',
                cdot: 'Fois',
                times: 'Tois',
                div: 'Divisé par',
                pleft: 'Parenthèse gauche (',
                pright: 'Parenthèse droite )',
                bleft: 'Crochet gauche [',
                bright: 'Crochet droit ]',
                cleft: 'Accolade gauche {',
                cright: 'Accolade droite }',
                vleft: 'Ligne verticale gauche |',
                vright: 'Ligne verticale droite |',
                lt: 'Inférieur à',
                le: 'Inférieur ou égal à',
                gt: 'Supérieur à',
                ge: 'Supérieur ou égal à',
                neq: 'Non égal (différent)',
                approx: 'Approximativement égal à',
                propto: 'Proportionnel à',
                plusminus: 'Plus-Moins',
                percent: 'Pourcent',
                not: 'Non (négation)',
                and: 'Et',
                or: 'Ou',
                circ: 'Composition',
                nabla: 'Nabla'
            }
        },
        expressions: {
            title: 'Fonctions',
            buttons: {
                sqrt: 'Racine carrée',
                cubert: 'Racine cubique',
                nthroot: 'Racine Nième',
                pow2: 'Puissance de 2',
                pow3: 'Puissance de 3',
                pow: 'Puissance',
                log: 'Logarithme',
                log10: 'Logarithme base 10',
                ln: 'Logarithm Népérien',
                sin: 'Sinis',
                cos: 'Cosinus',
                tan: 'Tangente',
                arcsin: 'Arc sinus',
                arccos: 'Arc cosinus',
                arctan: 'Arc tangente',
                deriv: 'Dérivée',
                partial: 'Dérivée partielle',
                int: 'Intégrale',
                oint: 'Intégrale curviligne sur un contour fermé',
                sum: 'Somme',
                prod: 'Produit',
                lim: 'Limite'
            }
        },
        sets: {
            title: 'Ensembles',
            buttons: {
                cset: 'Complexes',
                pset: 'Premiers',
                nset: 'Naturels',
                qset: 'Rationels',
                rset: 'Réels',
                zset: 'Entiers',
                emptyset: 'Ensemble vide',
                forall: 'Quel que soit',
                exists: 'Il existe',
                nexists: 'Il n’existe pas',
                in: 'Appartient',
                nin: 'N’appartient pas',
                subset: 'Est inclus dans (sous-ensemble)',
                supset: 'Inclut (sur-ensemble)',
                nsubset: 'N’est pas inclus dans',
                nsupset: 'N’inclut pas',
                intersection: 'Intersection',
                union: 'Union',
                to: 'To',
                implies: 'Implique',
                impliedby: 'Implied by',
                nimplies: 'Not implies',
                iff: 'Equivalent to'
            }
        },
        matrices: {
            title: 'Matrices',
            buttons: {
                vector: 'Vecteur',
                widehat: 'Chapeau (angle)',
                matrix: 'Matrice',
                pmatrix: 'Matrice avec parenthèses',
                bmatrix: 'Matrice avec crochets',
                bbmatrix: 'Matrice with accolades',
                vmatrix: 'Matrice avec lignes verticales',
                vvmatrix: 'Matrice à double ligne verticale',
                column: 'Ajouter un colonne',
                row: 'Ajouter une rangée'
            }
        },
        statistics: {
            title: 'Statistiques',
            buttons: {
                factorial: 'Factorielle',
                binomial: 'Combinaison',
                overline: 'Surlignage (moyenne)'
            }
        }
        /*
            units: {
                title: 'Units',
                buttons: {}
            },
            chemistry: {
                title: 'Chemistry',
                buttons: {}
            }
            */
    });
}
if (mathinput && mathinput.messages.toolbar) {
    mathinput.messages.toolbar = $.extend(true, mathinput.messages.toolbar, {
        field: {
            title: 'Zone de saisie'
        },
        backspace: {
            title: 'Retour arrière'
        },
        keypad: {
            title: 'Clavier',
            buttons: {
                comma: ',',
                stop: '.',
                n0: '0',
                n1: '1',
                n2: '2',
                n3: '3',
                n4: '4',
                n5: '5',
                n6: '6',
                n7: '7',
                n8: '8',
                n9: '9',
                a: 'a',
                b: 'b',
                c: 'c',
                i: 'i',
                j: 'j',
                k: 'k',
                n: 'n',
                p: 'p',
                q: 'q',
                x: 'x',
                y: 'y',
                z: 'z',
                pi: 'Pi',
                infty: 'Infini',
                space: 'Espace',
                subscript: 'Indice'
            }
        },
        basic: {
            title: 'Basique',
            buttons: {
                equal: 'Égal',
                plus: 'Plus',
                minus: 'Moins',
                cdot: 'Fois',
                times: 'Fois',
                div: 'Divisé par',
                pleft: 'Parenthèse gauche (',
                pright: 'Parenthèse droite )',
                frac: 'Fraction',
                sqrt: 'Racine carrée',
                pow2: 'Puissance de 2',
                pow3: 'Puissance de 3',
                sin: 'Sinus',
                cos: 'Cosinus',
                tan: 'Tangente'
            }
        },
        greek: {
            title: 'Grec',
            buttons: {
                alpha: 'Alpha',
                beta: 'Beta',
                gamma: 'Gamma',
                delta: 'Delta',
                epsilon: 'Epsilon', // varepsilon
                zeta: 'Zeta',
                eta: 'Eta',
                theta: 'Theta', // vartheta
                iota: 'Iota',
                kappa: 'Kappa', // varkappa
                lambda: 'Lambda',
                mu: 'Mu',
                nu: 'Nu',
                xi: 'Xi',
                omicron: 'Omicron',
                pi: 'Pi', // varpi
                rho: 'Rho', // varrho
                sigma: 'Sigma', // varsigma
                tau: 'Tau',
                upsilon: 'Upsilon',
                phi: 'Phi', // varphi
                chi: 'Chi',
                psi: 'Psi',
                omega: 'Omega'
            }
        },
        operators: {
            title: 'Operateurs',
            buttons: {
                equal: 'Égal',
                plus: 'Plus',
                minus: 'Moins',
                cdot: 'Fois',
                times: 'Tois',
                div: 'Divisé par',
                pleft: 'Parenthèse gauche (',
                pright: 'Parenthèse droite )',
                bleft: 'Crochet gauche [',
                bright: 'Crochet droit ]',
                cleft: 'Accolade gauche {',
                cright: 'Accolade droite }',
                vleft: 'Ligne verticale gauche |',
                vright: 'Ligne verticale droite |',
                lt: 'Inférieur à',
                le: 'Inférieur ou égal à',
                gt: 'Supérieur à',
                ge: 'Supérieur ou égal à',
                neq: 'Non égal (différent)',
                approx: 'Approximativement égal à',
                propto: 'Proportionnel à',
                plusminus: 'Plus-Moins',
                percent: 'Pourcent',
                not: 'Non (négation)',
                and: 'Et',
                or: 'Ou',
                circ: 'Composition',
                nabla: 'Nabla'
            }
        },
        expressions: {
            title: 'Fonctions',
            buttons: {
                sqrt: 'Racine carrée',
                cubert: 'Racine cubique',
                nthroot: 'Racine Nième',
                pow2: 'Puissance de 2',
                pow3: 'Puissance de 3',
                pow: 'Puissance',
                log: 'Logarithme',
                log10: 'Logarithme base 10',
                ln: 'Logarithm Népérien',
                sin: 'Sinis',
                cos: 'Cosinus',
                tan: 'Tangente',
                arcsin: 'Arc sinus',
                arccos: 'Arc cosinus',
                arctan: 'Arc tangente',
                deriv: 'Dérivée',
                partial: 'Dérivée partielle',
                int: 'Intégrale',
                oint: 'Intégrale curviligne sur un contour fermé',
                sum: 'Somme',
                prod: 'Produit',
                lim: 'Limite'
            }
        },
        sets: {
            title: 'Ensembles',
            buttons: {
                cset: 'Complexes',
                pset: 'Premiers',
                nset: 'Naturels',
                qset: 'Rationels',
                rset: 'Réels',
                zset: 'Entiers',
                emptyset: 'Ensemble vide',
                forall: 'Quel que soit',
                exists: 'Il existe',
                nexists: 'Il n’existe pas',
                in: 'Appartient',
                nin: 'N’appartient pas',
                subset: 'Est inclus dans (sous-ensemble)',
                supset: 'Inclut (sur-ensemble)',
                nsubset: 'N’est pas inclus dans',
                nsupset: 'N’inclut pas',
                intersection: 'Intersection',
                union: 'Union',
                to: 'To',
                implies: 'Implique',
                impliedby: 'Implied by',
                nimplies: 'Not implies',
                iff: 'Equivalent to'
            }
        },
        matrices: {
            title: 'Matrices',
            buttons: {
                vector: 'Vecteur',
                widehat: 'Chapeau (angle)',
                matrix: 'Matrice',
                pmatrix: 'Matrice avec parenthèses',
                bmatrix: 'Matrice avec crochets',
                bbmatrix: 'Matrice with accolades',
                vmatrix: 'Matrice avec lignes verticales',
                vvmatrix: 'Matrice à double ligne verticale',
                column: 'Ajouter un colonne',
                row: 'Ajouter une rangée'
            }
        },
        statistics: {
            title: 'Statistiques',
            buttons: {
                factorial: 'Factorielle',
                binomial: 'Combinaison',
                overline: 'Surlignage (moyenne)'
            }
        }
        /*
            units: {
                title: 'Units',
                buttons: {}
            },
            chemistry: {
                title: 'Chemistry',
                buttons: {}
            }
            */
    });
}

/* kidoju.widgets.mediaplayer */
if (MediaPlayer) {
    const { options } = MediaPlayer.prototype;
    options.messages = $.extend(true, options.messages, {
        play: 'Jouer/Pauser',
        mute: 'Avec/Sans son',
        full: 'Plein écran',
        notSupported: 'Fichier non supporté'
    });
}

/* kidoju.widgets.multiinput */
if (MultiInput) {
    const { options } = MultiInput.prototype;
    options.messages = $.extend(true, options.messages, {
        delete: 'Effacer'
    });
}

/* kidoju.widgets.multiquiz */
if (MultiQuiz) {
    const { options } = MultiQuiz.prototype;
    options.messages = $.extend(true, options.messages, {
        placeholder: 'Sélectionner...'
    });
}

/* kidoju.widgets.navigation */
if (Navigation) {
    const { options } = Navigation.prototype;
    options.messages = $.extend(true, options.messages, {
        empty: 'Rien à afficher'
    });
}

/* kidoju.widgets.playbar */
if (PlayBar) {
    const { options } = PlayBar.prototype;
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
if (PropertyGrid) {
    const { options } = PropertyGrid.prototype;
    options.messages = $.extend(true, options.messages, {
        property: 'Propriété',
        value: 'Valeur'
    });
}

/* kidoju.widgets.quiz */
if (Quiz) {
    const { options } = Quiz.prototype;
    options.messages = $.extend(true, options.messages, {
        optionLabel: 'Sélectionner...'
    });
}

/* kidoju.widgets.social */
if (Social) {
    const { options } = Social.prototype;
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
if (Stage) {
    const { options } = Stage.prototype;
    options.messages = $.extend(true, options.messages, {
        contextMenu: {
            delete: 'Supprimer',
            duplicate: 'Dupliquer'
        },
        noPage: 'Veuillez ajouter ou sélectionner une page'
    });
}

/* kidoju.widgets.styleeditor */
if (StyleEditor) {
    const { options } = StyleEditor.prototype;
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
