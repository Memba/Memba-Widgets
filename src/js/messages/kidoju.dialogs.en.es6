/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';

if (window.kidoju && window.kidoju.dialogs) {
    window.kidoju.dialogs.messages = $.extend(
        true,
        {},
        window.kidoju.dialogs.messages,
        {
            /* kidoju.dialogs.chargrid */
            chargrid: {
                layout:
                    '<h3>Design the grid layout</h3><p>Any character you enter in the grid is locked and cannot be changed in play mode.</p><p>Use `{0}` to blank out empty cells.</p>',
                solution:
                    '<h3>Enter the solution</h3><p>Use any whitelisted character, i.e. `{0}`.</p>'
            },

            /* kidoju.dialogs.finder */
            finder: {},

            /* kidoju.dialogs.newsummary */
            newsummary: {},

            /* kidoju.dialogs.publish */
            publish: {},

            /* kidoju.dialogs.quizwizard */
            quizwizard: {},

            /* kidoju.dialogs.signin */
            signin: {},

            /* kidoju.dialogs.textboxwizard */
            textboxwizard: {
                message:
                    'Please enter a question and a solution to compare answers with.',
                question: 'Question',
                solution: 'Solution'
            }
        }
    );
}
