/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import app from '../common/window.global.es6';

const { i18n } = app;
i18n.fr = i18n.fr || {};

$.extend(true, i18n.fr, {
    libraries: {
        /* custom */
        custom: { name: 'Personnalisé' },

        /* arrayLibrary */
        arrayLibrary: {
            equal: { name: 'Égal' },
            ignoreCaseEqual: { name: 'Égal (sans maj.)' },
            sumEqual: { name: 'Égal (sommes)' }
        },

        /* booleanLibrary */
        booleanLibrary: {
            equal: { name: 'Égal' },
            notEqual: { name: 'Pas égal' }
        },

        /* charGridLibrary */
        charGridLibrary: {
            equal: { name: 'Égal' }
        },

        /* dateLibrary */
        dateLibrary: {
            equal: { name: 'Égal' }
        },

        /* genericLibrary */
        genericLibrary: {
            equal: { name: 'Égal' }
        },

        /* mathLibrary */
        mathLibrary: {
            equal: { name: 'Égal' }
        },

        /* multiQuizLibrary */
        multiQuizLibrary: {
            equal: { name: 'Égal' }
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
            equal: { name: 'Égal' },
            ignoreCaseEqual: { name: 'Égal (sans maj.)' },
            ignoreCaseMatch: { name: 'Correspond (sans maj.)' },
            ignoreDiacriticsEqual: { name: 'Égal (sans diacritique)' },
            match: { name: 'Correspond' },
            metaphone: { name: 'Métaphone' },
            soundex: { name: 'Soundex' }
        },

        /* textLibrary */
        textLibrary: {
            euqal: { name: 'Égal' },
            ignoreSpacesEqual: { name: 'Égal (sans espace)' },
            ignorePunctuationEqual: { name: 'Égal (sans ponctuation)' }
        }
    }
});
