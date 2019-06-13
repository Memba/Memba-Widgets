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
            '<h3>Design the grid layout</h3><p>Any character you enter in the grid is locked and cannot be changed in play mode.</p><p>Use `{0}` to blank out empty cells.</p>',
        solution:
            '<h3>Enter the solution</h3><p>Use any whitelisted character, i.e. `{0}`.</p>'
    },

    /* dialogs.codeeditor */
    codeeditor: {},

    /* dialogs.finder */
    finder: {
        language: 'Language',
        me: 'My projects',
        published: 'Published on {0:dd-MMM-yyyy} by {1}',
        search: 'Search'
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
        add: 'Add',
        message:
            'Please enter a question and fill in the grid with multiple choices.',
        option: 'Option',
        question: 'Question',
        solution: 'Solution',
        text: 'Option 1',
        validation: {
            grid:
                'At least one option and one checked solution are required. Also options cannot be left empty.',
            question: 'A question is required.'
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
            'Please enter a question and solutions (one per line) to compare answers with.',
        title: 'New open question',
        question: 'Question',
        solution: 'Solution',
        validation: {
            question: 'A question is required.',
            solution: 'A solution is required.'
        }
    }
};

/**
 * Default export
 */
export default res;
