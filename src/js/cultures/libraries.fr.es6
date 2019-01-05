/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
        { name: 'Personnalisé' }
    );

    /**
     * arrayLibrary
     */
    window.kendo.ex.libraries.arrayLibrary = $.extend(
        true,
        window.kendo.ex.libraries.arrayLibrary,
        {
            library: [
                { name: 'Égal' },
                { name: 'Égal (sans maj.)' },
                { name: 'Égal (sommes)' }
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
            library: [{ name: 'Égal' }, { name: 'Pas égal' }]
        }
    );

    /**
     * charGridLibrary
     */
    window.kendo.ex.libraries.charGridLibrary = $.extend(
        true,
        window.kendo.ex.libraries.charGridLibrary,
        {
            library: [{ name: 'Égal' }]
        }
    );

    /**
     * dateLibrary
     */
    window.kendo.ex.libraries.dateLibrary = $.extend(
        true,
        window.kendo.ex.libraries.dateLibrary,
        {
            library: [{ name: 'Égal' }]
        }
    );

    /**
     * genericLibrary
     */
    window.kendo.ex.libraries.genericLibrary = $.extend(
        true,
        window.kendo.ex.libraries.genericLibrary,
        {
            library: [{ name: 'Égal' }]
        }
    );

    /**
     * mathLibrary
     */
    window.kendo.ex.libraries.mathLibrary = $.extend(
        true,
        window.kendo.ex.libraries.mathLibrary,
        {
            library: [{ name: 'Égal' }]
        }
    );

    /**
     * multiQuizLibrary
     */
    window.kendo.ex.libraries.multiQuizLibrary = $.extend(
        true,
        window.kendo.ex.libraries.multiQuizLibrary,
        {
            library: [{ name: 'Égal' }]
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
                { name: 'Égal' },
                { name: 'Égal (sans maj.)' },
                { name: 'Correspond (sans maj.)' },
                { name: 'Égal (sans diacritique)' },
                { name: 'Correspond' },
                { name: 'Métaphone' },
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
                { name: 'Égal' },
                { name: 'Égal (sans espace)' },
                { name: 'Égal (sans ponctuation)' }
            ]
        }
    );
}
