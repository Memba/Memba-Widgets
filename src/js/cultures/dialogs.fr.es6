/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

const res = {
    /* basedialog */
    /*
        basedialog: {
            actions: {
                ok: {
                    text:
                        '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK'
                },
                cancel: {
                    text:
                        '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Annuler'
                }
            }
        },
         */

    /* dialogs.assetmanager */
    assetmanager: {},

    /* dialogs.chargrid */
    chargrid: {
        layout:
            '<h3>Concevez la grille</h3><p>Chaque caractère saisi dans la grille est verrouillé et ne peut être modifié en mode d’exécution.</p><p>Utilisez le caractère `{0}` pour désigner les cellules vides.</p>',
        solution:
            '<h3>Saisissez la solution</h3><p>Utilisez les caractères autorisés de la liste blanche, i.e. `{0}`.</p>'
    },

    /* dialogs.codeeditor */
    codeeditor: {},

    /* dialogs.finder */
    finder: {
        language: 'Langue',
        me: 'Mes projets',
        published: 'Publié le {0:dd-MMM-yyyy} par {1}',
        search: 'Recherche'
    },

    /* dialogs.newsummary */
    newsummary: {},

    /* dialogs.publish */
    publish: {
        message: 'message', // TODO
        title: 'title' // TODO
    },

    /* dialogs.quizwizard */
    quizwizard: {
        add: 'Ajouter',
        message:
            'Veuillez saisir une question et remplir la grille avec les choix multiples.',
        option: 'Option',
        question: 'Question',
        solution: 'Solution',
        text: 'Option 1',
        validation: {
            grid:
                'Au moins une option et une solution cochée sont requises. Les options ne peuvent pas non plus être laissées vides.',
            question: 'Une question est requise.'
        }
    },

    /* dialogs.signin */
    signin: {},

    /* dialogs.speeadsheet */
    spreadsheet: {},

    /* dialogs.styleeditor */
    styleeditor: {},

    /* dialogs.textboxwizard */
    textboxwizard: {
        message:
            'Veuillez saisir une question et des solutions (une par ligne) à comparer aux réponses',
        question: 'Question',
        solution: 'Solution',
        title: 'Nouvelle question ouverte',
        validation: {
            question: 'Une question est requise.',
            solution: 'Une solution est requise.'
        }
    }
};

/**
 * Default export
 */
export default res;
