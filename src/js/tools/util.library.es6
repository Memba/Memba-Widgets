/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.core';

const { format } = window.kendo;

export const LIB_COMMENT = '// ';
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}';

// TODO: Add name/value to localize algorithm names
// TODO  Add alternate solutions (array of solutions)

/**
 * IMPORTANT
 * Add params as in:
 *      name: 'oneOf',
 *      params: new StringArrayAdapter(), <-- note the use of an adapter
 *      formula: 'function (value, params, all) { return params.indexOf(value) }'
 * Then SolutionAdapter possibly selects one of params in ComboBox
 * Check how such design affects all existing tools
 * Check how this design affects the code editor / code input
 * Check how this could work with randomization and solution formulas
 */

/**
 * String array library (compares string arrays)
 * @type {{defaultValue: string, library: *[]}}
 */
export const arrayLibrary = {
    // TODO: Cannot we make sure the data is formatted properly to simplify these formulas???
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            // formula: format(VALIDATION_CUSTOM, 'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
            // With the formula here above, each string in the array cannot be trimmed properly
            // because String(arr) is the same as join(',') and each value might contain commas
            // So we use }-{ because there is little chance any value would contain this sequence
            formula: format(
                VALIDATION_CUSTOM,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{") === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{");'
            )
        },
        {
            name: 'ignoreCaseEqual',
            formula: format(
                VALIDATION_CUSTOM,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{").toLowerCase() === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{").toLowerCase();'
            )
        },
        {
            name: 'sumEqual',
            formula: format(
                VALIDATION_CUSTOM,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'var ret = 0;\t' +
                    '(value || []).forEach(function(val){ ret += parseFloat((val || "").trim() || 0); });\t' +
                    'return ret === parseFloat(String(solution).trim());'
            )
        }
    ]
};

/**
 * Boolean library (compares booleans)
 * @type {{defaultValue: string, library: {name: string, formula: *}[]}}
 */
export const booleanLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).toLowerCase() === String(solution).toLowerCase();'
            )
        }
    ]
};

/**
 * Character grid library
 * @type {{defaultValue: string, library: {name: string, formula: *}[]}}
 */
export const charGridLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return value && typeof value.equals === "function" && value.equals(solution);'
            )
        }
    ]
};

/**
 * Date library (compares dates)
 */
export const dateLibrary = {
    // TODO: parsing raises a culture issue with MM/DD/YYYY in english and DD/MM/YYYY in french
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            // Note: new Date(1994,1,1) !== new Date(1994,1,1) as they are two different objects
            formula: format(
                VALIDATION_CUSTOM,
                'return new Date(value) - new Date(solution) === 0;'
            )
        }
    ]
};

/**
 * Generic library
 * @type {{defaultValue: string, library: {name: string, formula: *}[]}}
 */
export const genericLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).trim() === String(solution).trim();'
            )
        }
    ]
};

/**
 * Math library (compares formulas)
 * @type {{defaultValue: string, library: {name: string, formula: *}[]}}
 */
export const mathLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).trim() === String(solution).trim();'
            ) // TODO several MathQuillMathField
        } /* ,
                {
                    // TODO permutations
                    name: 'anyCommutations',
                    formula: format(VALIDATION_CUSTOM, 'return shuntingYard(value).equals(solution);')
                }
                */
    ]
};

/**
 * Multiquiz Library
 * @type {{defaultValue: string, library: {name: string, formula: *}[]}}
 */
export const multiQuizLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                '// Note: both value and solution are arrays of strings\n\t' +
                    'return String(value.sort()) === String(solution.sort());'
            )
        }
    ]
};

/**
 * Number library (compares numbers)
 * @type {{defaultValue: string, library: *[]}}
 */
export const numberLibrary = {
    // IMPORTANT TODO: localization parsing
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            // TODO: parsing raises a culture issue with 5.3 in english and 5,3 in french
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) === Number(solution);'
            )
        },
        {
            name: 'greaterThan',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) > Number(solution);'
            )
        },
        {
            name: 'greaterThanOrEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) >= Number(solution);'
            )
        },
        {
            name: 'lowerThan',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) < Number(solution);'
            )
        },
        {
            name: 'lowerThanOrEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) <= Number(solution);'
            )
        }
    ]
};

/**
 * String library (compares strings)
 * @type {{defaultValue: string, library: *[]}}
 */
export const stringLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).trim() === String(solution).trim();'
            )
        },
        {
            name: 'ignoreCaseEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();'
            )
        },
        {
            name: 'ignoreCaseMatch',
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(
                VALIDATION_CUSTOM,
                'return /{0}/i.test(String(value).trim());'
            ),
            // TODO IMPORTANT! The parameter {0} should be named
            param: 'Regular Expression'
        },
        {
            name: 'ignoreDiacriticsEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());'
            )
        },
        {
            name: 'match',
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(
                VALIDATION_CUSTOM,
                'return /{0}/.test(String(value).trim());'
            ),
            param: 'Regular Expression'
        },
        {
            name: 'metaphone',
            formula: format(
                VALIDATION_CUSTOM,
                'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));'
            )
        },
        {
            name: 'soundex',
            formula: format(
                VALIDATION_CUSTOM,
                'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));'
            )
        }
    ]
};

/**
 * Text Library (compares long text entered in text areas)
 * @type {{defaultValue: string, library: *[]}}
 */
export const textLibrary = {
    defaultValue: 'equal',
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).trim() === String(solution).trim();'
            )
        },
        {
            name: 'ignoreSpacesEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();'
            )
        },
        {
            name: 'ignorePunctuationEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();'
            )
        }
    ]
};
