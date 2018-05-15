/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
// import 'kendo.core';

if (window.kidoju && window.kidoju.dialogs) {
    window.kidoju.dialogs.messages = $.extend(
        true,
        {},
        window.kidoju.dialogs.messages,
        {
            /* kidoju.dialogs.chargrid */
            chargrid: {
                layout:
                    '<h3>Concevez la grille</h3><p>Chaque caractère saisi dans la grille est verrouillé et ne peut être modifié  en mode d’exécution.</p><p>Utilisez le caractère `{0}` pour désigner les cellules vides.</p>',
                solution:
                    '<h3>Saisissez la solution</h3><p>Utilisez les caractères autorisés de la liste blanche, i.e. `{0}`.</p>'
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
                    'Veuillez saisir une question et une solution à comparer aux réponses',
                question: 'Question',
                solution: 'Solution'
            }
        }
    );
}
