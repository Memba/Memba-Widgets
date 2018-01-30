;(function (root, factory) {
    // See template at https://github.com/umdjs/umd/blob/master/templates/amdWebGlobal.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            '../khan/katex'
        ], function (katex) {
            return (root.markdownItKatex = factory(katex));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('../khan/katex'));
    } else {
        // Browser globals
        root.markdownItKatex = factory(root.katex);
    }
})(this, function (katex) {

    /**
     * Backslash rule
     * @see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/backticks.js
     * @param state
     * @param silent
     * @returns {boolean}
     *
     * Identifies math expressions between \( \) (inline mode) and \[ \] (display mode) as in:
     *
     * The well known Pythagorean theorem \(x^2 + y^2 = z^2\) was
     * proved to be invalid for other exponents.
     * Meaning the next equation has no integer solutions:
     * \[ x^n + y^n = z^n \]
     *
     * Also identifies math expressions between \begin{...} \end{...} as in:
     *
     * In natural units \begin{math}c = 1\end{math}, the formula \begin{math}E = mc^21\end{math} expresses the identity
     * \begin{equation}
     * E=m
     * \end{equation}
     */
    function backslash(state, silent) {
        var beginPos = state.pos;
        if (state.src.charCodeAt(beginPos) !== 0x5C /* \ */) {
            return false
        }
        var match = state.src.substr(beginPos).match(/^(?:\\\[|\\\(|\\begin\{([^}]*)\})/);
        if (!match) {
            return false
        }
        var type = 'inline_math';
        var beginMarker = match[0];
        var endMarker;
        beginPos += beginMarker.length;
        if (beginMarker === '\\[') {
            endMarker = '\\]';
            type = 'display_math';
        } else if (beginMarker === '\\(') {
            endMarker = '\\)';
        } else if (match[1]) {
            endMarker = '\\end{' + match[1] + '}';
            if (match[1] !== 'math') {
                // Other acceptable values are `displaymath` and `equation`
                // see https://www.sharelatex.com/learn/Mathematical_expressions
                type = 'display_math';
            }
        }
        var endPos = state.src.indexOf(endMarker, beginPos);
        if (endPos === -1) {
            return false
        }
        var nextPos = endPos + endMarker.length;
        if (!silent) {
            var token = state.push(type, '', 0);
            token.content = state.src.slice(beginPos, endPos).replace(/\s/g, ' ');
        }
        state.pos = nextPos;
        return true
    }

    /**
     * Dollar rule
     * @param state
     * @param silent
     * @returns {boolean}
     *
     * Identifies math expressions between $ (inline mode) and $$ (display mode) as in:
     *
     * The mass-energy equivalence is described by the famous equation
     * $$E=mc^2$$
     * discovered in 1905 by Albert Einstein.
     */
    function dollar(state, silent) {
        var beginPos = state.pos;
        if (state.src.charCodeAt(beginPos) !== 0x24 /* $ */) {
            return false
        }

        // Parse tex math according to http://pandoc.org/README.html#math
        var endMarker = '$';
        var afterStartMarker = state.src.charCodeAt(++beginPos);
        if (afterStartMarker === 0x24 /* $ */) {
            endMarker = '$$';
            if (state.src.charCodeAt(++beginPos) === 0x24 /* $ */) {
                // 3 markers are too much
                return false
            }
        } else {
            // Skip if opening $ is succeeded by a space character
            if (afterStartMarker === 0x20 /* space */ || afterStartMarker === 0x09 /* \t */ || afterStartMarker === 0x0a /* \n */) {
                return false
            }
        }
        var endPos= state.src.indexOf(endMarker, beginPos);
        if (endPos === -1) {
            return false
        }
        if (state.src.charCodeAt(endPos - 1) === 0x5C /* \ */) {
            return false
        }
        var nextPos = endPos + endMarker.length;
        if (endMarker.length === 1) {
            // Skip if $ is preceded by a space character
            var beforeEndMarker = state.src.charCodeAt(endPos - 1);
            if (beforeEndMarker === 0x20 /* space */ || beforeEndMarker === 0x09 /* \t */ || beforeEndMarker === 0x0a /* \n */) {
                return false
            }
            // Skip if closing $ is succeeded by a digit (eg $5 $10 ...)
            var suffix = state.src.charCodeAt(nextPos);
            if (suffix >= 0x30 && suffix < 0x3A) {
                return false
            }
        }

        if (!silent) {
            var token = state.push(endMarker.length === 1 ? 'inline_math' : 'display_math', '', 0);
            token.content = state.src.slice(beginPos, endPos).replace(/\s/g, ' ');
        }
        state.pos = nextPos;
        return true
    }

    function htmlEncode(value) {
        return ('' + value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    return function (md) {
        // Insert new `backslash` rule to execute before the `escape` rule
        md.inline.ruler.before('escape', 'backslash', backslash);
        // Add dollar rule
        md.inline.ruler.push('dollar', dollar);
        // Inline mode for backslash \(<expression>\) and dollar $<expression>$
        // See https://www.sharelatex.com/learn/Mathematical_expressions
        md.renderer.rules.inline_math = function (tokens, idx) {
            try {
                // throwOnError: false does not seem to work in all situations - try \begin within the expression
                // return katex.renderToString(tokens[idx].content, { displayMode: false, throwOnError: false });
                return katex.renderToString(tokens[idx].content, { displayMode: false });
            } catch(ex) {
                return '<span style="color:#cc0000">' + htmlEncode(ex.message) + '</span>';
            }
        };
        // Display mode for backslash \[<expression>\] and dollar $$<expression>$$
        // See https://www.sharelatex.com/learn/Mathematical_expressions
        md.renderer.rules.display_math = function (tokens, idx) {
            try {
                return katex.renderToString(tokens[idx].content, { displayMode: true });
            } catch(ex) {
                // TODO html escape
                return '<span style="color:#cc0000">' + htmlEncode(ex.message) + '</span>';
            }
        }
    }
});
