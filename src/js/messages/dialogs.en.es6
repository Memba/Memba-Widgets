/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';

if (window.kendo && window.kendo.ex && window.kendo.ex.dialogs) {
    window.kendo.ex.dialogs.messages = $.extend(
        true,
        {},
        window.kendo.ex.dialogs.messages,
        {
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
            publish: {},

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
            speeadsheet: {},

            /* dialogs.styleeditor */
            styleeditor: {},

            /* dialogs.textboxwizard */
            textboxwizard: {
                message:
                    'Please enter a question and solutions (one per line) to compare answers with.',
                question: 'Question',
                solution: 'Solution',
                validation: {
                    question: 'A question is required.',
                    solution: 'A solution is required.'
                }
            }
        }
    );
}
