/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';

// Note: $.extend (true) is capable of navigating arrays to update library item names

if (window.kendo && window.kendo.ex && window.kendo.ex.libraries) {
    /**
     * CUSTOM
     */
    window.kendo.ex.libraries.CUSTOM = $.extend(
        true,
        window.kendo.ex.libraries.CUSTOM,
        { name: 'Custom' }
    );

    /**
     * arrayLibrary
     */
    window.kendo.ex.libraries.arrayLibrary = $.extend(
        true,
        window.kendo.ex.libraries.arrayLibrary,
        {
            library: [
                { name: 'Equal' },
                { name: 'Equal (ignore case)' },
                { name: 'Equal (compare sums)' }
            ]
        }
    );

    /**
     * booleanLibrary
     */
    window.kendo.ex.libraries.booleanLibrary = $.extend(
        true,
        window.kendo.ex.libraries.booleanLibrary,
        {
            library: [{ name: 'Equal' }, { name: 'Not equal' }]
        }
    );

    /**
     * charGridLibrary
     */
    window.kendo.ex.libraries.charGridLibrary = $.extend(
        true,
        window.kendo.ex.libraries.charGridLibrary,
        {
            library: [{ name: 'Equal' }]
        }
    );

    /**
     * dateLibrary
     */
    window.kendo.ex.libraries.dateLibrary = $.extend(
        true,
        window.kendo.ex.libraries.dateLibrary,
        {
            library: [{ name: 'Equal' }]
        }
    );

    /**
     * genericLibrary
     */
    window.kendo.ex.libraries.genericLibrary = $.extend(
        true,
        window.kendo.ex.libraries.genericLibrary,
        {
            library: [{ name: 'Equal' }]
        }
    );

    /**
     * mathLibrary
     */
    window.kendo.ex.libraries.mathLibrary = $.extend(
        true,
        window.kendo.ex.libraries.mathLibrary,
        {
            library: [{ name: 'Equal' }]
        }
    );

    /**
     * multiQuizLibrary
     */
    window.kendo.ex.libraries.multiQuizLibrary = $.extend(
        true,
        window.kendo.ex.libraries.multiQuizLibrary,
        {
            library: [{ name: 'Equal' }]
        }
    );

    /**
     * numberLibrary
     */
    window.kendo.ex.libraries.numberLibrary = $.extend(
        true,
        window.kendo.ex.libraries.numberLibrary,
        {
            library: [
                { name: '=' },
                { name: '>' },
                { name: '>=' },
                { name: '<' },
                { name: '<=' }
            ]
        }
    );

    /**
     * stringLibrary
     */
    window.kendo.ex.libraries.stringLibrary = $.extend(
        true,
        window.kendo.ex.libraries.stringLibrary,
        {
            library: [
                { name: 'Equal' },
                { name: 'Equal (ignore case)' },
                { name: 'Match (ignore case)' },
                { name: 'Equal (ignore diacritics)' },
                { name: 'Match' },
                { name: 'Metaphone' },
                { name: 'Soundex' }
            ]
        }
    );

    /**
     * textLibrary
     */
    window.kendo.ex.libraries.textLibrary = $.extend(
        true,
        window.kendo.ex.libraries.textLibrary,
        {
            library: [
                { name: 'Equal' },
                { name: 'Equal (ignore spaces)' },
                { name: 'Equal (ignore punctuation)' }
            ]
        }
    );
}
