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

    }
});

/**
 * CUSTOM
 */
$.extend(true, CUSTOM, {
    name: 'Personnalisé'
});

/**
 * arrayLibrary
 */
$.extend(true, arrayLibrary, {
    library: [
        { name: 'Égal' },
        { name: 'Égal (sans maj.)' },
        { name: 'Égal (sommes)' }
    ]
});

/**
 * booleanLibrary
 */
$.extend(true, booleanLibrary, {
    library: [{ name: 'Égal' }, { name: 'Pas égal' }]
});

/**
 * charGridLibrary
 */
$.extend(true, charGridLibrary, {
    library: [{ name: 'Égal' }]
});

/**
 * dateLibrary
 */
$.extend(true, dateLibrary, {
    library: [{ name: 'Égal' }]
});

/**
 * genericLibrary
 */
$.extend(true, genericLibrary, {
    library: [{ name: 'Égal' }]
});

/**
 * mathLibrary
 */
$.extend(true, mathLibrary, {
    library: [{ name: 'Égal' }]
});

/**
 * multiQuizLibrary
 */
$.extend(true, multiQuizLibrary, {
    library: [{ name: 'Égal' }]
});

/**
 * numberLibrary
 */
$.extend(true, numberLibrary, {
    library: [
        { name: '=' },
        { name: '>' },
        { name: '>=' },
        { name: '<' },
        { name: '<=' }
    ]
});

/**
 * stringLibrary
 */
$.extend(true, stringLibrary, {
    library: [
        { name: 'Égal' },
        { name: 'Égal (sans maj.)' },
        { name: 'Correspond (sans maj.)' },
        { name: 'Égal (sans diacritique)' },
        { name: 'Correspond' },
        { name: 'Métaphone' },
        { name: 'Soundex' }
    ]
});

/**
 * textLibrary
 */
$.extend(true, textLibrary, {
    library: [
        { name: 'Égal' },
        { name: 'Égal (sans espace)' },
        { name: 'Égal (sans ponctuation)' }
    ]
});
