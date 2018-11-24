/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: Add name to localize algorithm names
// TODO  Add alternate solutions (array of solutions)
// TODO consider replacer and reviver to singify and parse library item

/**
 * IMPORTANT
 * Add params as in:
 *      key: 'oneOf',
 *      params: new StringArrayAdapter(), <-- note the use of an adapter
 *      formula: 'function (value, params, all) { return params.indexOf(value) }'
 * Then SolutionAdapter possibly selects one of params in ComboBox
 * Check how such design affects all existing tools
 * Check how this design affects the code editor / code input
 * Check how this could work with randomization and solution formulas
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import regexpEditor from '../editors/editors.input.es6';

const { format } = window.kendo;

export const LIB_COMMENT = '// ';
export const LIB_PARAMS = ' [{0}]';
const RX_VALIDATION_LIBRARY = /^\/\/ ([^\s[\n]+)( \[([^\n]+)])?$/;
export const RX_VALIDATION_FORMULA = /^function[\s]+validate[\s]*\([\s]*value[\s]*,/;
const RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*{[\s\S]*}$/;

export const VALIDATION_CUSTOM =
    'function validate(value, solution, all) {\n\t{0}\n}';
const VALIDATION_LIBRARY_SOLUTION =
    'function validate(value, solution) {\n\t{0}\n}';
const VALIDATION_LIBRARY_PARAMS =
    'function validate(value, params) {\n\t{0}\n}';
// Note: Library functions cannot use page field values and random numbers gathered in `all`

/**
 * Check that value refers to a custom function and not a library item
 * i.e. function (value, solution, all) { ... }
 * @function isCustomFormula
 * @param value
 * @returns {boolean}
 */
export function isCustomFormula(value) {
    /*
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    const matches = value.match(RX_VALIDATION_CUSTOM);
    return Array.isArray(matches) && matches.length === 2;
    */
    return RX_VALIDATION_CUSTOM.test(value);
}

/**
 * Check that value refers to a library item and params
 * i.e. // ... [...]
 * @param value
 * @returns {boolean}
 */
export function isLibraryFormula(value) {
    /*
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    const matches = value.match(RX_VALIDATION_LIBRARY);
    return Array.isArray(matches) && matches.length === 4;
    */
    return RX_VALIDATION_LIBRARY.test(value);
}

/**
 * Serialize a library item
 * @function serializeLibraryItem
 * @param item
 * @param params
 * @returns {string}
 */
export function stringifyLibraryItem(item, params) {
    assert.type(
        CONSTANTS.OBJECT,
        item,
        assert.format(assert.messages.type.default, 'item', CONSTANTS.OBJECT)
    );
    let options = '';
    if ($.type(params) !== CONSTANTS.UNDEFINED && $.isFunction(item.editor)) {
        options = format(LIB_PARAMS, JSON.stringify(params));
    }
    return `${LIB_COMMENT}${item.key}${options}`;
}

/**
 * Returns the library item and parsed params from value
 * i.e. parsing `// <name> (<params>)`) return { item, item.parse(params) }
 * @param value
 * @returns {*}
 */
export function parseLibraryItem(value, library) {
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    assert.isDefined(
        library,
        assert.format(assert.messages.isDefined.default, 'library')
    );
    assert.isFunction(
        library.filter,
        assert.format(assert.messages.isFunction.default, 'library.filter')
    );
    const ret = {};
    const libraryMatches = value.match(RX_VALIDATION_LIBRARY);
    if (Array.isArray(libraryMatches) && libraryMatches.length === 4) {
        const params = libraryMatches[3];
        // Add ret.item
        const found = library.filter(
            // Array.find is not available in Internet Explorer
            item => item.key === libraryMatches[1]
        );
        if (Array.isArray(found) && found.length) {
            [ret.item] = found;
        }
        // Add ret.params
        if (
            ret.item &&
            $.isFunction(ret.item.editor) &&
            $.type(params) === CONSTANTS.STRING &&
            params.length
        ) {
            ret.params = JSON.parse(params);
        }
    }
    return ret;
}

/**
 * Custom entry
 * @type {{name: string, key: string, formula: *}}
 */
export const CUSTOM = {
    key: 'custom',
    name: 'Custom',
    formula: format(
        VALIDATION_CUSTOM,
        '// Your code should return true when value is validated against solution.\n\treturn true;'
    )
};

/**
 * String array library (compares string arrays)
 * @type {{defaultKey: string, library: *[]}}
 */
export const arrayLibrary = {
    // TODO: Cannot we make sure the data is formatted properly to simplify these formulas???
    // TODO: Add sorted versus unsorted
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            // formula: format(VALIDATION_CUSTOM, 'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
            // With the formula here above, each string in the array cannot be trimmed properly
            // because String(arr) is the same as join(',') and each value might contain commas
            // So we use }-{ because there is little chance any value would contain this sequence
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{") === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{");'
            )
        },
        {
            key: 'ignoreCaseEqual', // TODO <--- This is useless becuase we generally know the arrays
            name: 'Equal (ignore case)',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{").toLowerCase() === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{").toLowerCase();'
            )
        },
        {
            key: 'sumEqual',
            name: 'Equal (compare sums)',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
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
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
export const booleanLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).toLowerCase() === String(solution).toLowerCase();'
            )
        },
        {
            key: 'notEqual',
            name: 'Not equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).toLowerCase() !== String(solution).toLowerCase();'
            )
        }
    ]
};

/**
 * Character grid library
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
export const charGridLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
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
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            // Note: new Date(1994,1,1) !== new Date(1994,1,1) as they are two different objects
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return new Date(value) - new Date(solution) === 0;'
            )
        }
    ]
};

/**
 * Generic library
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
export const genericLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            )
        }
    ]
};

/**
 * Math library (compares formulas)
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
export const mathLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            ) // TODO several MathQuillMathField
        } /* ,
                {
                    // TODO permutations
                    key: 'anyCommutations',
                    formula: format(VALIDATION_LIBRARY_SOLUTION, 'return shuntingYard(value).equals(solution);')
                }
                */
    ]
};

/**
 * Multiquiz Library
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
export const multiQuizLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                '// Note: both value and solution are arrays of strings\n\t' +
                    'return String(value.sort()) === String(solution.sort());'
            )
        }
    ]
};

/**
 * Number library (compares numbers)
 * @type {{defaultKey: string, library: *[]}}
 */
export const numberLibrary = {
    // IMPORTANT TODO: localization parsing
    // TODO: parsing raises a culture issue with 5.3 in english and 5,3 in french
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: '=',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) === Number(solution);'
            )
        },
        {
            key: 'greaterThan',
            name: '>',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) > Number(solution);'
            )
        },
        {
            key: 'greaterThanOrEqual',
            name: '>=',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) >= Number(solution);'
            )
        },
        {
            key: 'lowerThan',
            name: '<',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) < Number(solution);'
            )
        },
        {
            key: 'lowerThanOrEqual',
            name: '<=',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) <= Number(solution);'
            )
        }
    ]
};

/**
 * String library (compares strings)
 * @type {{defaultKey: string, library: *[]}}
 */
export const stringLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            )
        },
        {
            key: 'ignoreCaseEqual',
            name: 'Equal (ignore case)',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();'
            )
        },
        {
            key: 'ignoreCaseMatch',
            name: 'Match (ignore case)',
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(
                VALIDATION_LIBRARY_PARAMS,
                'return new RegExp(params, "i").test(String(value).trim());'
            ),
            editor: regexpEditor
        },
        {
            key: 'ignoreDiacriticsEqual',
            name: 'Equal (ignore diacritics)',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());'
            )
        },
        {
            key: 'match',
            name: 'Match',
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(
                VALIDATION_LIBRARY_PARAMS,
                'return new RegExp(params, "i").test(String(value).trim());'
            ),
            editor: regexpEditor
        },
        {
            key: 'metaphone',
            name: 'Metaphone',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));'
            )
        },
        {
            key: 'soundex',
            name: 'Soundex',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));'
            )
        }
    ]
};

/**
 * Text Library (compares long text entered in text areas)
 * @type {{defaultKey: string, library: *[]}}
 */
export const textLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: 'Equal',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            )
        },
        {
            key: 'ignoreSpacesEqual',
            name: 'Equal (ignore spaces)',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();'
            )
        },
        {
            key: 'ignorePunctuationEqual',
            name: 'Equal (ignore punctuation)',
            formula: format(
                VALIDATION_LIBRARY_SOLUTION,
                'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();'
            )
        }
    ]
};

/**
 * Global references for i18n
 * Note: Cannot extend to make copies, these are to be the same objects
 */
window.kendo.ex = window.kendo.ex || {};
window.kendo.ex.libraries = window.kendo.ex.libraries || {};
window.kendo.ex.libraries.CUSTOM = CUSTOM;
window.kendo.ex.libraries.arrayLibrary = arrayLibrary;
window.kendo.ex.libraries.booleanLibrary = booleanLibrary;
window.kendo.ex.libraries.charGridLibrary = charGridLibrary;
window.kendo.ex.libraries.dateLibrary = dateLibrary;
window.kendo.ex.libraries.genericLibrary = genericLibrary;
window.kendo.ex.libraries.mathLibrary = mathLibrary;
window.kendo.ex.libraries.multiQuizLibrary = multiQuizLibrary;
window.kendo.ex.libraries.numberLibrary = numberLibrary;
window.kendo.ex.libraries.stringLibrary = stringLibrary;
window.kendo.ex.libraries.textLibrary = textLibrary;
