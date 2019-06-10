/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import app from '../common/window.global.es6';

const { i18n } = app;
i18n.en = i18n.en || {};

$.extend(true, i18n.en, {
    libraries: {
        /* custom */
        custom: {
            name: 'Custom'
        },

        /* arrayLibrary */
        arrayLibrary: {
            equal: { name: 'Equal' },
            ignoreCaseEqual: { name: 'Equal (ignore case)' },
            sumEqual: { name: 'Equal (compare sums)' }
        },

        /* booleanLibrary */
        booleanLibrary: {
            equal: { name: 'Equal' },
            notEqual: { name: 'Not equal' }
        },

        /* charGridLibrary */
        charGridLibrary: {
            equal: { name: 'Equal' }
        },

        /* dateLibrary */
        dateLibrary: {
            equal: { name: 'Equal' }
        },

        /* genericLibrary */
        genericLibrary: {
            equal: { name: 'Equal' }
        },

        /* mathLibrary */
        mathLibrary: {
            equal: { name: 'Equal' }
        },

        /* multiQuizLibrary */
        multiQuizLibrary: {
            equal: { name: 'Equal' }
        },

        /* numberLibrary */
        numberLibrary: {
            equal: { name: '=' },
            greaterThan: { name: '>' },
            greaterThanOrEqual: { name: '>=' },
            lowerThan: { name: '<' },
            lowerThanOrEqual: { name: '<=' }
        },

        /* stringLibrary */
        stringLibrary: {
            equal: { name: 'Equal' },
            ignoreCaseEqual: { name: 'Equal (ignore case)' },
            ignoreCaseMatch: { name: 'Match (ignore case)' },
            ignoreDiacriticsEqual: { name: 'Equal (ignore diacritics)' },
            match: { name: 'Match' },
            metaphone: { name: 'Metaphone' },
            soundex: { name: 'Soundex' }
        },

        /* textLibrary */
        textLibrary: {
            equal: { name: 'Equal' },
            ignoreSpacesEqual: { name: 'Equal (ignore spaces)' },
            ignorePunctuationEqual: { name: 'Equal (ignore punctuation)' }
        }
    }
});
