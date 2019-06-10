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
    libraries: {}
});


import {
    CUSTOM,
    arrayLibrary,
    booleanLibrary,
    charGridLibrary,
    dateLibrary,
    genericLibrary,
    mathLibrary,
    multiQuizLibrary,
    numberLibrary,
    stringLibrary,
    textLibrary
} from '../tools/util.libraries.es6';

/**
 * CUSTOM
 */
$.extend(true, CUSTOM, { name: 'Custom' });

/**
 * arrayLibrary
 */
$.extend(true, arrayLibrary, {
    library: [
        { name: 'Equal' },
        { name: 'Equal (ignore case)' },
        { name: 'Equal (compare sums)' }
    ]
});

/**
 * booleanLibrary
 */
$.extend(true, booleanLibrary, {
    library: [{ name: 'Equal' }, { name: 'Not equal' }]
});

/**
 * charGridLibrary
 */
$.extend(true, charGridLibrary, {
    library: [{ name: 'Equal' }]
});

/**
 * dateLibrary
 */
$.extend(true, dateLibrary, {
    library: [{ name: 'Equal' }]
});

/**
 * genericLibrary
 */
$.extend(true, genericLibrary, {
    library: [{ name: 'Equal' }]
});

/**
 * mathLibrary
 */
$.extend(true, mathLibrary, {
    library: [{ name: 'Equal' }]
});

/**
 * multiQuizLibrary
 */
$.extend(true, multiQuizLibrary, {
    library: [{ name: 'Equal' }]
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
        { name: 'Equal' },
        { name: 'Equal (ignore case)' },
        { name: 'Match (ignore case)' },
        { name: 'Equal (ignore diacritics)' },
        { name: 'Match' },
        { name: 'Metaphone' },
        { name: 'Soundex' }
    ]
});

/**
 * textLibrary
 */
$.extend(true, textLibrary, {
    library: [
        { name: 'Equal' },
        { name: 'Equal (ignore spaces)' },
        { name: 'Equal (ignore punctuation)' }
    ]
});
