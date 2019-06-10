/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Are we missing a  quizLibrary!!!!!
// TODO Add alternate solutions (array of solutions)
// TODO consider replacer and reviver to stringify and parse library item

/*
 * IMPORTANT
 * Add params as in:
 *      key: 'oneOf',
 *      params: new StringArrayAdapter(), <-- note the use of an adapter/editor
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
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import regexpEditor from '../editors/editors.regexp.es6'; // TODO use string to designate entry in util.editors;
import TOOLS from './util.constants.es6';

const { format } = window.kendo;

/**
 * Check that value refers to a custom function and not a library item
 * i.e. function (value, solution, all) { ... }
 * @function isCustomFormula
 * @param value
 * @returns {boolean}
 */
function isCustomFormula(value) {
    /*
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    const matches = value.match(TOOLS.RX_VALIDATION_CUSTOM);
    return Array.isArray(matches) && matches.length === 2;
    */
    return TOOLS.RX_VALIDATION_CUSTOM.test(value);
}

/**
 * Check that value refers to a library item and params
 * i.e. // ... [...]
 * @param value
 * @returns {boolean}
 */
function isLibraryFormula(value) {
    /*
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    const matches = value.match(TOOLS.RX_VALIDATION_LIBRARY);
    return Array.isArray(matches) && matches.length === 4;
    */
    return TOOLS.RX_VALIDATION_LIBRARY.test(value);
}

/**
 * Serialize a library item
 * @function serializeLibraryItem
 * @param item
 * @param params
 * @returns {string}
 */
function stringifyLibraryItem(item, params) {
    assert.type(
        CONSTANTS.OBJECT,
        item,
        assert.format(assert.messages.type.default, 'item', CONSTANTS.OBJECT)
    );
    let options = '';
    if ($.type(params) !== CONSTANTS.UNDEFINED && $.isFunction(item.editor)) {
        options = format(TOOLS.LIB_PARAMS, JSON.stringify(params));
    }
    return `${TOOLS.LIB_COMMENT}${item.key}${options}`;
}

/**
 * Returns the library item and parsed params from value
 * i.e. parsing `// <name> (<params>)`) return { item, item.parse(params) }
 * @param value
 * @param library
 * @returns {*}
 */
function parseLibraryItem(value, library) {
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
    const libraryMatches = value.match(TOOLS.RX_VALIDATION_LIBRARY);
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
const CUSTOM = {
    key: 'custom',
    name: __('libraries.custom.name'),
    formula: format(
        TOOLS.VALIDATION_CUSTOM,
        '// Your code should return true when value is validated against solution.\n\treturn true;'
    )
};

/**
 * String array library (compares string arrays)
 * @type {{defaultKey: string, library: *[]}}
 */
const arrayLibrary = {
    // TODO: Cannot we make sure the data is formatted properly to simplify these formulas ???
    // TODO: Add sorted versus unsorted
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.arrayLibrary.equal.name'),
            // formula: format(TOOLS.VALIDATION_CUSTOM, 'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
            // With the formula here above, each string in the array cannot be trimmed properly
            // because String(arr) is the same as join(',') and each value might contain commas
            // So we use |•| because there is little chance any value would contain this sequence
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'return (value || []).sort().join(•).trim().replace(/\\s*|•|\\s*/g, "|•|") === String(solution).trim().split("\\n").sort().join("|•|").replace(/\\s*|•|\\s*/g, "|•|");'
            )
        },
        {
            key: 'ignoreCaseEqual', // TODO <--- This is useless because we generally know the arrays
            name: __('libraries.arrayLibrary.ignoreCaseEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                '// Note: value is an array and solution is a multiline string\n\t' +
                    'return (value || []).sort().join("|•|").trim().replace(/\\s*|•|\\s*/g, "|•|").toLowerCase() === String(solution).trim().split("\\n").sort().join("|•|").replace(/\\s*|•|\\s*/g, "|•|").toLowerCase();'
            )
        },
        {
            key: 'sumEqual',
            name: __('libraries.arrayLibrary.sumEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
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
const booleanLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.booleanLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).toLowerCase() === String(solution).toLowerCase();'
            )
        },
        {
            key: 'notEqual',
            name: __('libraries.booleanLibrary.notEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).toLowerCase() !== String(solution).toLowerCase();'
            )
        }
    ]
};

/**
 * Character grid library
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
const charGridLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.charGridLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return value && typeof value.equals === "function" && value.equals(solution);'
            )
        }
    ]
};

/**
 * Date library (compares dates)
 */
const dateLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.dateLibrary.equal.name'),
            // Note: new Date(1994,1,1) !== new Date(1994,1,1) as they are two different objects
            // Also Note: Date(x) returns a string
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return value - solution === 0;'
            )
        }
    ]
};

/**
 * Generic library
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
const genericLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.genericLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            )
        }
    ]
};

/**
 * Math library (compares formulas)
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
const mathLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.mathLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            ) // TODO several MathQuillMathField
        } /* ,
        {
            // TODO permutations
            key: 'anyCommutations',
            formula: format(TOOLS.VALIDATION_LIBRARY_SOLUTION, 'return shuntingYard(value).equals(solution);')
        }
        */
    ]
};

/**
 * Multiquiz Library
 * @type {{defaultKey: string, library: {key: string, formula: *}[]}}
 */
const multiQuizLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.multiQuizLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
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
const numberLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.numberLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) === Number(solution);'
            )
        },
        {
            key: 'greaterThan',
            name: __('libraries.numberLibrary.greaterThan.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) > Number(solution);'
            )
        },
        {
            key: 'greaterThanOrEqual',
            name: __('libraries.numberLibrary.greaterThanOrEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) >= Number(solution);'
            )
        },
        {
            key: 'lowerThan',
            name: __('libraries.numberLibrary.lowerThan.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) < Number(solution);'
            )
        },
        {
            key: 'lowerThanOrEqual',
            name: __('libraries.numberLibrary.lowerThanOrEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return Number(value) <= Number(solution);'
            )
        }
    ]
};

/**
 * String library (compares strings)
 * @type {{defaultKey: string, library: *[]}}
 */
const stringLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.stringLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            )
        },
        {
            key: 'ignoreCaseEqual',
            name: __('libraries.stringLibrary.ignoreCaseEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();'
            )
        },
        {
            key: 'ignoreCaseMatch',
            name: __('libraries.stringLibrary.ignoreCaseMatch.name'),
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(
                TOOLS.VALIDATION_LIBRARY_PARAMS,
                'return new RegExp(params, "i").test(String(value).trim());'
            ),
            editor: regexpEditor
        },
        {
            key: 'ignoreDiacriticsEqual',
            name: __('libraries.stringLibrary.ignoreDiacriticsEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());'
            )
        },
        {
            key: 'match',
            name: __('libraries.stringLibrary.match.name'),
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(
                TOOLS.VALIDATION_LIBRARY_PARAMS,
                'return new RegExp(params, "i").test(String(value).trim());'
            ),
            editor: regexpEditor
        },
        {
            key: 'metaphone',
            name: __('libraries.stringLibrary.metaphone.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));'
            )
        },
        {
            key: 'soundex',
            name: __('libraries.stringLibrary.soundex.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));'
            )
        }
    ]
};

/**
 * Text Library (compares long text entered in text areas)
 * @type {{defaultKey: string, library: *[]}}
 */
const textLibrary = {
    defaultKey: 'equal',
    library: [
        {
            key: 'equal',
            name: __('libraries.textLibrary.equal.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).trim() === String(solution).trim();'
            )
        },
        {
            key: 'ignoreSpacesEqual',
            name: __('libraries.textLibrary.ignoreSpacesEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();'
            )
        },
        {
            key: 'ignorePunctuationEqual',
            name: __('libraries.textLibrary.ignorePunctuationEqual.name'),
            formula: format(
                TOOLS.VALIDATION_LIBRARY_SOLUTION,
                'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();'
            )
        }
    ]
};

/**
 * Exports
 */
export {
    // functions
    isCustomFormula,
    isLibraryFormula,
    parseLibraryItem,
    stringifyLibraryItem,
    // libraries
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
};
