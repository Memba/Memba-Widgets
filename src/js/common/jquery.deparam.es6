/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';

/**
 * Deserialize a params string into an object, optionally coercing numbers,
 * booleans, null and undefined values; this method is the counterpart to the
 * internal jQuery.param method.
 *
 * Source: https://github.com/cowboy/jquery-bbq
 *
 * @param params A params string to be parsed.
 * @param coerce If true, coerces any numbers or true, false, null, and undefined to their actual value. Defaults to false if omitted.
 * @returns {{}} An object representing the deserialized params string.
 */
function deparam(params, coerce) {
    const obj = {};
    const coerceTypes = { true: !0, false: !1, null: null };

    // If params is an empty string or otherwise falsy, return obj.
    if (!params) {
        return obj;
    }

    // Iterate over all name=value pairs.
    params
        .replace(/\+/g, ' ')
        .split('&')
        .forEach((v) => {
            const param = v.split('=');
            let key = window.decodeURIComponent(param[0]);
            let val;
            let cur = obj;
            let i = 0;

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
            let keys = key.split('][');
            let keysLast = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /]$/.test(keys[keysLast])) {
                // Remove the trailing ] from the last keys part.
                keys[keysLast] = keys[keysLast].replace(/]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keysLast = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keysLast = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = window.decodeURIComponent(param[1]);

                // Coerce values
                if (coerce) {
                    /* eslint-disable no-nested-ternary, prettier/prettier */
                    val =
                        parseFloat(val).toString() === val // val && !Number.isNaN(val)
                            ? +val // number
                            : val === 'undefined'
                                ? undefined // undefined
                                : coerceTypes[val] !== undefined
                                    ? coerceTypes[val] // true, false, null
                                    : val; // string
                    /* eslint-enable no-nested-ternary, prettier/prettier */
                }

                if (keysLast) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keysLast; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur[key] =
                            i < keysLast
                                ? cur[key] ||
                                  (keys[i + 1] &&
                                  Number.isNaN(parseFloat(keys[i + 1]))
                                      ? {}
                                      : [])
                                : val;
                        cur = cur[key];
                    }
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.
                } else if (Array.isArray(obj[key])) {
                    // val is already an array, so push on the next value.
                    obj[key].push(val);
                } else if (obj[key] !== undefined) {
                    // val isn't an array, but since a second value has been specified,
                    // convert val into an array.
                    obj[key] = [obj[key], val];
                } else {
                    // val is a scalar.
                    obj[key] = val;
                }
            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce ? undefined : '';
            }
        });

    return obj;
}

/**
 * Add to jQuery
 * @type {function(*, *=)}
 */
$.deparam = deparam;
$.prototype.deparam = $.deparam;

/**
 * Default export
 */
export default deparam;
