/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([], f);
})(function () {

    'use strict';

    var kendo = window.kendo;
    var ui = kendo.ui;
    var options;

    /*  This function has too many statements. */
    /* jshint -W071 */

    /*  This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    (function ($, undefined) {

        /* kidoju.widgets.assetmanager */
        if (ui.AssetManager) {
            options = ui.AssetManager.prototype.options;
            options.messages = $.extend(true, options.messages, {
                toolbar: {
                    upload: 'Upload',
                    delete: 'Delete',
                    filter: 'Collection: ',
                    search: 'Search'
                },
                tabs: {
                    default: 'Project'
                },
                data: {
                    defaultName: 'Uploading...',
                    defaultImage: '' // TODO
                }
            });
        }

        /* kidoju.widgets.codeeditor */
        if (ui.CodeEditor) {
            options = ui.CodeEditor.prototype.options;
            options.messages = $.extend(true, options.messages, {
                formula: 'Formula:',
                notApplicable: 'N/A',
                solution: 'Solution:',
                value: 'Value:',
                test: 'Test',
                success: 'Success',
                failure: 'Failure',
                omit: 'Omit',
                error: 'Error',
                ajaxError: 'Error loading worker library.',
                jsonError: 'Error parsing value as json. Wrap strings in double quotes.',
                timeoutError: 'The execution of a web worker has timed out.'
            });
        }

        /* kidoju.widgets.codeinput */
        /*
         if (ui.CodeInput) {
             options = ui.CodeInput.prototype.options;
             options.messages = $.extend(true, options.messages, {
                // TODO
            });
         }
         */

        /* kidoju.widgets.explorer */
        if (ui.Explorer) {
            options = ui.Explorer.prototype.options;
            options.messages = $.extend(true, options.messages, {
                empty: 'No item to display'
            });
        }

        /* kidoju.widgets.imagelist */
        if (ui.ImageList) {
            options = ui.ImageList.prototype.options;
            options.messages = $.extend(true, options.messages, {
                toolbar: {
                    add: 'Add'
                },
                validation: {
                    image: 'An image url is required.',
                    text: 'Some text is required.'
                }
            });
        }

        /* kidoju.widgets.markeditor */
        if (ui.MarkEditor) {
            options = ui.MarkEditor.prototype.options;
            options.messages = $.extend(true, options.messages, {
                image: 'An undescribed image',
                link: 'Click here'
            });
        }
        if (kendo.markeditor && kendo.markeditor.messages.dialogs) {
            kendo.markeditor.messages.dialogs =
                $.extend(true, kendo.markeditor.messages.dialogs, {
                    cancel: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel',
                    okText: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK',
                    headingsDialog: {
                        title: 'Start Cap',
                        buttons: {
                            h1: 'Heading 1',
                            h2: 'Heading 2',
                            h3: 'Heading 3',
                            h4: 'Heading 4',
                            h5: 'Heading 5',
                            h6: 'Heading 6'
                        }
                    },
                    linkDialog: {
                        title: 'Hyperlink',
                        labels: {
                            text: 'Url'
                        }
                    },
                    imageDialog: {
                        title: 'Image',
                        labels: {
                            url: 'Url'
                        }
                    },
                    latexDialog: {
                        title: 'Mathematic Expression',
                        labels: {
                            display: 'Display',
                            inline: 'inline'
                        }
                    },
                    previewDialog: {
                        title: 'Preview'
                    }
                });
        }
        if (kendo.markeditor && kendo.markeditor.messages.toolbar) {
            kendo.markeditor.messages.toolbar =
                $.extend(true, kendo.markeditor.messages.toolbar, {
                    undo: 'Undo',
                    redo: 'Redo',
                    headings: 'Headings',
                    headingsButtons: {
                        h1: 'Heading 1',
                        h2: 'Heading 2',
                        h3: 'Heading 3',
                        h4: 'Heading 4',
                        h5: 'Heading 5',
                        h6: 'Heading 6'
                    },
                    bold: 'Bold',
                    italic: 'Italic',
                    bulleted: 'Bulleted List',
                    numbered: 'Numbered List',
                    blockquote: 'Blockquote',
                    hrule: 'Horizontal Rule',
                    link: 'Hyperlink',
                    image: 'Image',
                    code: 'Code',
                    latex: 'Mathematic Expression',
                    preview: 'Preview in New Window'
                });
        }

        /* kidoju.widgets.mathinput */
        if (kendo.mathinput && kendo.mathinput.messages.dialogs) {
            kendo.mathinput.messages.dialogs =
                $.extend(true, kendo.mathinput.messages.dialogs, {
                    keypad: {
                        title: 'KeyPad',
                        buttons: {
                            comma: ',',
                            stop: '.',
                            n0: '0',
                            n1: '1',
                            n2: '2',
                            n3: '3',
                            n4: '4',
                            n5: '5',
                            n6: '6',
                            n7: '7',
                            n8: '8',
                            n9: '9',
                            a: 'a',
                            b: 'b',
                            c: 'c',
                            i: 'i',
                            j: 'j',
                            k: 'k',
                            n: 'n',
                            p: 'p',
                            q: 'q',
                            x: 'x',
                            y: 'y',
                            z: 'z',
                            pi: 'Pi',
                            infty: 'Infinity',
                            space: 'Space',
                            subscript: 'Subscript'
                        }
                    },
                    basic: {
                        title: 'Basic',
                        buttons: {
                            // WARNING: Make sure mathjs can calculate all these functions
                            equal: 'Equal',
                            plus: 'Plus',
                            minus: 'Minus',
                            cdot: 'Times',
                            times: 'Times',
                            div: 'Divide',
                            pleft: 'Left parenthesis (',
                            pright: 'Right parenthesis )',
                            frac: 'Fraction',
                            sqrt: 'Square root',
                            pow2: 'Power of 2',
                            pow3: 'Power of 3',
                            sin: 'Sine',
                            cos: 'Cosine',
                            tan: 'Tangent'
                        }
                    },
                    greek: {
                        title: 'Greek',
                        buttons: {
                            // Note: upper case and lower case share the same values
                            alpha: 'Alpha',
                            beta: 'Beta',
                            gamma: 'Gamma',
                            delta: 'Delta',
                            epsilon: 'Epsilon', // varepsilon
                            zeta: 'Zeta',
                            eta: 'Eta',
                            theta: 'Theta', // vartheta
                            iota: 'Iota',
                            kappa: 'Kappa', // varkappa
                            lambda: 'Lambda',
                            mu: 'Mu',
                            nu: 'Nu',
                            xi: 'Xi',
                            omicron: 'Omicron',
                            pi: 'Pi', // varpi
                            rho: 'Rho', // varrho
                            sigma: 'Sigma', // varsigma
                            tau: 'Tau',
                            upsilon: 'Upsilon',
                            phi: 'Phi', // varphi
                            chi: 'Chi',
                            psi: 'Psi',
                            omega: 'Omega'
                        }
                    },
                    operators: {
                        title: 'Operators',
                        buttons: {
                            equal: 'Equal',
                            plus: 'Plus',
                            minus: 'Minus',
                            cdot: 'Times',
                            times: 'Times',
                            div: 'Divide',
                            pleft: 'Left parenthesis (',
                            pright: 'Right parenthesis )',
                            bleft: 'Left square bracket [',
                            bright: 'Right square bracket ]',
                            cleft: 'Left curly bracket {',
                            cright: 'Right curly bracket }',
                            vleft: 'Left vertical line |',
                            vright: 'Right vertical line |',
                            lt: 'Lower than',
                            le: 'Lower than or equal',
                            gt: 'Greater than',
                            ge: 'Greater than or equal',
                            neq: 'Not equal',
                            approx: 'Approximate',
                            propto: 'Proportional',
                            plusminus: 'Plus-Minus',
                            percent: 'Percent',
                            not: 'Not',
                            and: 'And',
                            or: 'Or',
                            circ: 'Composition',
                            nabla: 'Nabla'
                        }
                    },
                    expressions: {
                        title: 'Functions',
                        buttons: {
                            sqrt: 'Square root',
                            cubert: 'Cube root',
                            nthroot: 'Nth root',
                            pow2: 'Power of 2',
                            pow3: 'Power of 3',
                            pow: 'Power',
                            log: 'Logarithm',
                            log10: 'Logarithm base 10',
                            ln: 'Naperian logarithm',
                            sin: 'Sine',
                            cos: 'Cosine',
                            tan: 'Tangent',
                            arcsin: 'Arc sine',
                            arccos: 'Arc cosine',
                            arctan: 'Arc tangent',
                            deriv: 'Derivative',
                            partial: 'Partial derivative',
                            int: 'Integral',
                            oint: 'Contour integral',
                            sum: 'Sum',
                            prod: 'Product',
                            lim: 'Limit'
                        }
                    },
                    sets: {
                        title: 'Sets',
                        buttons: {
                            cset: 'Complexes',
                            pset: 'Primes',
                            nset: 'Naturals',
                            qset: 'Rationals',
                            rset: 'Reals',
                            zset: 'Integers',
                            emptyset: 'Empty set',
                            forall: 'For all',
                            exists: 'Exists',
                            nexists: 'Not exists',
                            in: 'In',
                            nin: 'Not in',
                            subset: 'Subset',
                            supset: 'Superset',
                            nsubset: 'Not subset',
                            nsupset: 'Not superset',
                            intersection: 'Intersection',
                            union: 'Union',
                            to: 'To',
                            implies: 'Implies',
                            impliedby: 'Implied by',
                            nimplies: 'Not implies',
                            iff: 'Equivalent to'
                        }
                    },
                    matrices: {
                        title: 'Matrices',
                        buttons: {
                            vector: 'Vector',
                            widehat: 'Widehat (angle)',
                            matrix: 'Matrix',
                            pmatrix: 'Matrix with parentheses',
                            bmatrix: 'Matrix with square brackets',
                            bbmatrix: 'Matrix with curly braces',
                            vmatrix: 'Matrix with vertical lines',
                            vvmatrix: 'Matrix with double vertical lines',
                            column: 'Add column',
                            row: 'Add row'
                        }
                    },
                    statistics: {
                        title: 'Statistics',
                        buttons: {
                            factorial: 'Factorial',
                            binomial: 'Binomial',
                            overline: 'Overline (mean)'
                        }
                    }
                    /*
					units: {
						title: 'Units',
						buttons: {}
					},
					chemistry: {
						title: 'Chemistry',
						buttons: {}
					}
					*/
                });
        }
        if (kendo.mathinput && kendo.mathinput.messages.toolbar) {
            kendo.mathinput.messages.toolbar =
                $.extend(true, kendo.mathinput.messages.toolbar, {
                    field: {
                        title: 'Field'
                    },
                    backspace: {
                        title: 'Backspace'
                    },
                    keypad: {
                        title: 'KeyPad',
                        buttons: {
                            comma: ',',
                            stop: '.',
                            n0: '0',
                            n1: '1',
                            n2: '2',
                            n3: '3',
                            n4: '4',
                            n5: '5',
                            n6: '6',
                            n7: '7',
                            n8: '8',
                            n9: '9',
                            a: 'a',
                            b: 'b',
                            c: 'c',
                            i: 'i',
                            j: 'j',
                            k: 'k',
                            n: 'n',
                            p: 'p',
                            q: 'q',
                            x: 'x',
                            y: 'y',
                            z: 'z',
                            pi: 'Pi',
                            infty: 'Infinity',
                            space: 'Space',
                            subscript: 'Subscript'
                        }
                    },
                    basic: {
                        title: 'Basic',
                        buttons: {
                            // WARNING: Make sure mathjs can calculate all these functions
                            equal: 'Equal',
                            plus: 'Plus',
                            minus: 'Minus',
                            cdot: 'Times',
                            times: 'Times',
                            div: 'Divide',
                            pleft: 'Left parenthesis (',
                            pright: 'Right parenthesis )',
                            frac: 'Fraction',
                            sqrt: 'Square root',
                            pow2: 'Power of 2',
                            pow3: 'Power of 3',
                            sin: 'Sine',
                            cos: 'Cosine',
                            tan: 'Tangent'
                        }
                    },
                    greek: {
                        title: 'Greek',
                        buttons: {
                            alpha: 'Alpha',
                            beta: 'Beta',
                            gamma: 'Gamma',
                            delta: 'Delta',
                            epsilon: 'Epsilon', // varepsilon
                            zeta: 'Zeta',
                            eta: 'Eta',
                            theta: 'Theta', // vartheta
                            iota: 'Iota',
                            kappa: 'Kappa', // varkappa
                            lambda: 'Lambda',
                            mu: 'Mu',
                            nu: 'Nu',
                            xi: 'Xi',
                            omicron: 'Omicron',
                            pi: 'Pi', // varpi
                            rho: 'Rho', // varrho
                            sigma: 'Sigma', // varsigma
                            tau: 'Tau',
                            upsilon: 'Upsilon',
                            phi: 'Phi', // varphi
                            chi: 'Chi',
                            psi: 'Psi',
                            omega: 'Omega'
                        }
                    },
                    operators: {
                        title: 'Operators',
                        buttons: {
                            equal: 'Equal',
                            plus: 'Plus',
                            minus: 'Minus',
                            cdot: 'Times',
                            times: 'Times',
                            div: 'Divide',
                            pleft: 'Left parenthesis (',
                            pright: 'Right parenthesis )',
                            bleft: 'Left square bracket [',
                            bright: 'Right square bracket ]',
                            cleft: 'Left curly bracket {',
                            cright: 'Right curly bracket }',
                            vleft: 'Left vertical line |',
                            vright: 'Right vertical line |',
                            lt: 'Lower than',
                            le: 'Lower than or equal',
                            gt: 'Greater than',
                            ge: 'Greater than or equal',
                            neq: 'Not equal',
                            approx: 'Approximate',
                            propto: 'Proportional',
                            plusminus: 'Plus-Minus',
                            percent: 'Percent',
                            not: 'Not',
                            and: 'And',
                            or: 'Or',
                            circ: 'Composition',
                            nabla: 'Nabla'
                        }
                    },
                    expressions: {
                        title: 'Functions',
                        buttons: {
                            sqrt: 'Square root',
                            cubert: 'Cube root',
                            nthroot: 'Nth root',
                            pow2: 'Power of 2',
                            pow3: 'Power of 3',
                            pow: 'Power',
                            log: 'Logarithm',
                            log10: 'Logarithm base 10',
                            ln: 'Naperian logarithm',
                            sin: 'Sine',
                            cos: 'Cosine',
                            tan: 'Tangent',
                            arcsin: 'Arc sine',
                            arccos: 'Arc cosine',
                            arctan: 'Arc tangent',
                            deriv: 'Derivative',
                            partial: 'Partial derivative',
                            int: 'Integral',
                            oint: 'Contour integral',
                            sum: 'Sum',
                            prod: 'Product',
                            lim: 'Limit'
                        }
                    },
                    sets: {
                        title: 'Sets',
                        buttons: {
                            cset: 'Complexes',
                            pset: 'Primes',
                            nset: 'Naturals',
                            qset: 'Rationals',
                            rset: 'Reals',
                            zset: 'Integers',
                            emptyset: 'Empty set',
                            forall: 'For all',
                            exists: 'Exists',
                            nexists: 'Not exists',
                            in: 'In',
                            nin: 'Not in',
                            subset: 'Subset',
                            supset: 'Superset',
                            nsubset: 'Not subset',
                            nsupset: 'Not superset',
                            intersection: 'Intersection',
                            union: 'Union',
                            to: 'To',
                            implies: 'Implies',
                            impliedby: 'Implied by',
                            nimplies: 'Not implies',
                            iff: 'Equivalent to'
                        }
                    },
                    matrices: {
                        title: 'Matrices',
                        buttons: {
                            vector: 'Vector',
                            widehat: 'Widehat (angle)',
                            matrix: 'Matrix',
                            pmatrix: 'Matrix with parentheses',
                            bmatrix: 'Matrix with square brackets',
                            bbmatrix: 'Matrix with curly braces',
                            vmatrix: 'Matrix with vertical lines',
                            vvmatrix: 'Matrix with double vertical lines',
                            column: 'Add column',
                            row: 'Add row'
                        }
                    },
                    statistics: {
                        title: 'Statistics',
                        buttons: {
                            factorial: 'Factorial',
                            binomial: 'Binomial',
                            overline: 'Overline (mean)'
                        }
                    }
                    /*
					units: {
						title: 'Units',
						buttons: {}
					},
					chemistry: {
						title: 'Chemistry',
						buttons: {}
					}
					*/
                });
        }

        /* kidoju.widgets.mediaplayer */
        if (ui.MediaPlayer) {
            options = ui.MediaPlayer.prototype.options;
            options.messages = $.extend(true, options.messages, {
                play: 'Play/Pause',
                mute: 'Mute/Unmute',
                full: 'Full Screen',
                notSupported: 'Media not supported'
            });
        }

        /* kidoju.widgets.multiinput */
        if (ui.MultiInput) {
            options = ui.MultiInput.prototype.options;
            options.messages = $.extend(true, options.messages, {
                delete: 'Delete'
            });
        }

        /* kidoju.widgets.multiquiz */
        if (ui.MultiQuiz) {
            options = ui.MultiQuiz.prototype.options;
            options.messages = $.extend(true, options.messages, {
                placeholder: 'Select...'
            });
        }

        /* kidoju.widgets.navigation */
        if (ui.Navigation) {
            options = ui.Navigation.prototype.options;
            options.messages = $.extend(true, options.messages, {
                empty: 'No item to display'
            });
        }

        /* kidoju.widgets.playbar */
        if (ui.PlayBar) {
            options = ui.PlayBar.prototype.options;
            options.messages = $.extend(true, options.messages, {
                empty: 'No page to display',
                page: 'Page',
                of: 'of {0}',
                first: 'Go to the first page',
                previous: 'Go to the previous page',
                next: 'Go to the next page',
                last: 'Go to the last page',
                refresh: 'Refresh',
                morePages: 'More pages'
            });
        }

        /* kidoju.widgets.propertygrid */
        if (ui.PropertyGrid) {
            options = ui.PropertyGrid.prototype.options;
            options.messages = $.extend(true, options.messages, {
                property: 'Property',
                value: 'Value'
            });
        }

        /* kidoju.widgets.quiz */
        if (ui.Quiz) {
            options = ui.Quiz.prototype.options;
            options.messages = $.extend(true, options.messages, {
                optionLabel: 'Select...'
            });
        }

        /* kidoju.widgets.rating */
        /*
        if (ui.Rating) {
             options = ui.Rating.prototype.options;
             options.messages = $.extend(true, options.messages, {
                // TODO
            });
        }
        */

        /* kidoju.widgets.social */
        if (ui.Social) {
            options = ui.Social.prototype.options;
            options.messages = $.extend(true, options.messages, {
                classroom: 'Share to Google Classroom',
                facebook: 'Share to Facebook',
                google: 'Share to Google+',
                linkedin: 'Share to LinkedIn',
                pinterest: 'Share to Pinterest',
                twitter: 'Share to Twitter'
            });
        }

        /* kidoju.widgets.stage */
        if (ui.Stage) {
            options = ui.Stage.prototype.options;
            options.messages = $.extend(true, options.messages, {
                contextMenu: {
                    delete: 'Delete',
                    duplicate: 'Duplicate'
                },
                noPage: 'Please add or select a page'
            });
        }

        /* kidoju.widgets.styleeditor */
        if (ui.StyleEditor) {
            options = ui.StyleEditor.prototype.options;
            options.messages = $.extend(true, options.messages, {
                columns: {
                    name: 'Name',
                    value: 'Value'
                },
                toolbar: {
                    create: 'New Style',
                    destroy: 'Delete'
                },
                validation: {
                    name: 'Name is required',
                    value: 'Value is required'
                }
            });
        }

        /* kidoju.widgets.toolbox */
        /*
        if (ui.ToolBox) {
             options = ui.ToolBox.prototype.options;
             options.messages = $.extend(true, options.messages, {
                // TODO
            });
        }
        */

        /**
         * kidoju.data & kidoju.tools
         */

        if (window.kidoju) {

            var kidoju = window.kidoju;
            var adapters = kidoju.adapters;
            var data = kidoju.data;
            var tools = kidoju.tools;
            var Tool = kidoju.Tool;
            var attributes;
            var properties;

            if (adapters && adapters.CharGridAdapter) {
                adapters.CharGridAdapter.prototype.messages = {
                    layout: '<h3>Design the grid layout</h3><p>Any character you enter in the grid is locked and cannot be changed in play mode.</p><p>Use `{0}` to blank out empty cells.</p>',
                    solution: '<h3>Enter the solution</h3><p>Use any whitelisted character, i.e. `{0}`.</p>'
                };
            }

            /*
             if (data && data.PageComponent) {
                data.PageComponent.prototype.messages = {
                }
             }
             */

            if (data && data.Page) {
                data.Page.prototype.messages = {
                    emptyPage: 'Page {0} cannot be empty.',
                    minConnectors: 'At least {0} Connectors are required to make a question on page {1}.',
                    missingDraggable: 'Draggable Labels or Images are required for a Drop Zone on page {0}.',
                    missingDropZone: 'A Drop Zone is required for draggable Labels or Images on page {0}.',
                    missingLabel: 'A Label is recommended on page {0}.',
                    missingMultimedia: 'A multimedia element (Image, Audio, Video) is recommended on page {0}.',
                    missingQuestion: 'A question is recommended on page {0}.',
                    missingSelectable: 'Selectable Labels or Images are required for a Selector on page {0}.',
                    missingSelector: 'A Selector is required for selectable Labels or Images on page {0}.',
                    missingInstructions: 'Instructions are recommended on page {0}.',
                    missingExplanations: 'Explanations are recommended on page {0}.'
                };
            }

            if (data && data.Stream) {
                data.Stream.prototype.messages = {
                    duplicateNames: 'Delete components using the same name `{0}` on pages {1}',
                    minPages: 'At least {0} pages are required to be allowed to publish.',
                    minQuestions: 'At least {0} questions are required to be allowed to publish.',
                    typeVariety: 'The use of at least {0} types of questions (Multiple Choice, TextBox, Connector or else) is recommended.',
                    qtyVariety: 'More variety is recommended because {0:p0} of questions are of type {1}.'
                };
            }

            // if (kidoju.Tool instanceof Function) {
            if (Tool && Tool.constructor && Tool.constructor.name === 'Function') {
                Tool.prototype.i18n = $.extend(true, Tool.prototype.i18n, {
                    tool: {
                        top: { title: 'Top' },
                        left: { title: 'Left' },
                        height: { title: 'Height' },
                        width: { title: 'Width' },
                        rotate: { title: 'Rotate' }
                    },
                    dialogs: {
                        ok: { text: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK' },
                        cancel: { text: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel' }
                    },
                    messages: {
                        invalidAltText: 'A(n) {0} on page {1} requires some alternate text in display attributes.',
                        invalidAudioFile: 'A(n) {0} on page {1} requires an mp3 file in display attributes.',
                        invalidColor: 'A(n) {0} on page {1} has an invalid color in display attributes.',
                        invalidData: 'A(n) {0} on page {1} requires values in display attributes.',
                        invalidDescription: 'A(n) {0} named `{1}` on page {2} requires a question in test logic.',
                        invalidConstant: 'A(n) {0} on page {1} requires a constant in test logic.',
                        invalidFailure: 'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
                        invalidFormula: 'A(n) {0} on page {1} requires a formula in display attributes.',
                        invalidImageFile: 'A(n) {0} on page {1} requires an image file in display attributes.',
                        invalidName: 'A(n) {0} named `{1}` on page {2} has an invalid name.',
                        invalidShape: 'A(n) {0} named `{1}` on page {2} requires a shape in display attributes.',
                        invalidSolution: 'A(n) {0} named `{1}` on page {2} requires a solution in test logic.',
                        invalidStyle: 'A(n) {0} on page {1} has an invalid style in display attributes.',
                        invalidSuccess: 'A(n) {0} named `{1}` on page {2} has a success score lower than the omit score or zero in test logic.',
                        invalidText: 'A(n) {0} on page {1} requires some text in display attributes.',
                        invalidValidation: 'A(n) {0} named `{1}` on page {2} requires a validation formula in test logic.',
                        invalidVideoFile: 'A(n) {0} on page {1} requires an mp4 file in display attributes.'
                    }
                });
            }

            if (tools instanceof kendo.Observable) {

                if (tools.audio instanceof Tool) {
                    // Description
                    tools.audio.constructor.prototype.description = 'Audio Player';
                    // Attributes
                    attributes = tools.audio.constructor.prototype.attributes;
                    attributes.autoplay.title = 'Autoplay';
                    attributes.mp3.title = 'MP3 File';
                    attributes.ogg.title = 'OGG File';
                }

                if (tools.chart instanceof Tool) {
                    // Description
                    tools.chart.constructor.prototype.description = 'Chart';
                    // Attributes
                    attributes = tools.chart.constructor.prototype.attributes;
                    attributes.type.title = 'Type';
                    attributes.title.title = 'Title';
                    attributes.categories.title = 'Categories';
                    attributes.values.title = 'Values';
                    attributes.legend.title = 'Legend';
                    attributes.data.title = 'Data';
                    attributes.style.title = 'Style';
                }

                if (tools.chargrid instanceof Tool) {
                    // Description
                    tools.chargrid.constructor.prototype.description = 'Character Grid';
                    // Attributes
                    attributes = tools.chargrid.constructor.prototype.attributes;
                    attributes.blank.title = 'Blank';
                    attributes.columns.title = 'Columns';
                    attributes.layout.title = 'Layout';
                    attributes.rows.title = 'Rows';
                    attributes.whitelist.title = 'Whitelist';
                    attributes.gridFill.title = 'Grid Fill';
                    attributes.gridStroke.title = 'Grid Stroke';
                    // blankFill = gridStroke
                    attributes.selectedFill.title = 'Selection Fill';
                    attributes.lockedFill.title = 'Locked Fill';
                    // lockedColor = valueColor = fontColor
                    attributes.fontColor.title = 'Font Color';
                    // Properties
                    properties = tools.chargrid.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.connector instanceof Tool) {
                    // Description
                    tools.connector.constructor.prototype.description = 'Connector';
                    // Attributes
                    attributes = tools.connector.constructor.prototype.attributes;
                    attributes.color.title = 'Color';
                    // Properties
                    properties = tools.connector.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                    properties.disabled.title = 'Disabled';
                }

                if (tools.dropzone instanceof Tool) {
                    // Description
                    tools.dropzone.constructor.prototype.description = 'Drop Zone';
                    // Attributes
                    attributes = tools.dropzone.constructor.prototype.attributes;
                    attributes.center.title = 'Centre';
                    attributes.center.defaultValue = false;
                    attributes.empty.title = 'Empty';
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Text';
                    attributes.text.defaultValue = 'Please drop here.';
                    // Properties
                    properties = tools.dropzone.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                    properties.disabled.title = 'Disabled';
                }

                if (tools.highlighter instanceof Tool) {
                    // Description
                    tools.highlighter.constructor.prototype.description = 'Highlighter';
                    // Attributes
                    attributes = tools.highlighter.constructor.prototype.attributes;
                    attributes.highlightStyle.title = 'Highlight';
                    attributes.split.title = 'Split';
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Text';
                    attributes.text.defaultValue = 'Some text you can highlight.';
                    // Properties
                    properties = tools.highlighter.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.image instanceof Tool) {
                    // Description
                    tools.image.constructor.prototype.description = 'Image';
                    // Attributes
                    attributes = tools.image.constructor.prototype.attributes;
                    attributes.alt.title = 'Text';
                    attributes.alt.defaultValue = 'Image';
                    attributes.src.title = 'Source';
                    attributes.src.defaultValue = 'cdn://images/o_collection/svg/office/painting_landscape.svg';
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.image.constructor.prototype.properties;
                    properties.behavior.title = 'Behaviour';
                    properties.constant.title = 'Constant';
                }

                if (tools.imageset instanceof Tool) {
                    // Description
                    tools.imageset.constructor.prototype.description = 'Image Set';
                    // Attributes
                    attributes = tools.imageset.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    attributes.data.title = 'Images';
                    attributes.data.defaultValue = [{ text: 'Image set', image: 'cdn://images/o_collection/svg/office/photos.svg' }];
                    // Properties
                    properties = tools.imageset.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.label instanceof Tool) {
                    // Description
                    tools.label.constructor.prototype.description = 'Label';
                    // Attributes
                    attributes = tools.label.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Text';
                    attributes.text.defaultValue = 'Label';
                    // Properties
                    properties = tools.label.constructor.prototype.properties;
                    properties.behavior.title = 'Behaviour';
                    properties.constant.title = 'Constant';
                }

                if (tools.mathexpression instanceof Tool) {
                    // Description
                    tools.mathexpression.constructor.prototype.description = 'Mathematic Expression';
                    // Attributes
                    attributes = tools.mathexpression.constructor.prototype.attributes;
                    attributes.formula.title = 'Formula';
                    attributes.formula.defaultValue = '\\sum_{n=1}^{\\infty}2^{-n}=1';
                    attributes.inline.title = 'Inline';
                    attributes.inline.defaultValue = false;
                    attributes.style.title = 'Style';
                }

                if (tools.multiquiz instanceof Tool) {
                    // Description
                    tools.multiquiz.constructor.prototype.description = 'MultiQuiz';
                    // Attributes
                    attributes = tools.multiquiz.constructor.prototype.attributes;
                    attributes.data.title = 'Values';
                    attributes.data.defaultValue = [{ text: 'Option 1', image: 'cdn://images/o_collection/svg/office/hand_count_one.svg' }, { text: 'Option 2', image: 'cdn://images/o_collection/svg/office/hand_point_up.svg' }];
                    attributes.groupStyle.title = 'Group Style';
                    attributes.itemStyle.title = 'Item Style';
                    attributes.mode.title = 'Mode';
                    attributes.selectedStyle.title = 'Select. Style';
                    attributes.shuffle.title = 'Shuffle';
                    // Properties
                    properties = tools.multiquiz.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.quiz instanceof Tool) {
                    // Description
                    tools.quiz.constructor.prototype.description = 'Quiz';
                    // Attributes
                    attributes = tools.quiz.constructor.prototype.attributes;
                    attributes.data.title = 'Values';
                    attributes.data.defaultValue = [{ text: 'True', image: 'cdn://images/o_collection/svg/office/ok.svg' }, { text: 'False', image: 'cdn://images/o_collection/svg/office/error.svg' }];
                    attributes.groupStyle.title = 'Group Style';
                    attributes.itemStyle.title = 'Item Style';
                    attributes.mode.title = 'Mode';
                    attributes.selectedStyle.title = 'Select. Style';
                    attributes.shuffle.title = 'Shuffle';
                    // Properties
                    properties = tools.quiz.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.selector instanceof Tool) {
                    // Description
                    tools.selector.constructor.prototype.description = 'Selector';
                    // Attributes
                    attributes = tools.selector.constructor.prototype.attributes;
                    attributes.color.title = 'Color';
                    attributes.shape.title = 'Shape';
                    // Properties
                    properties = tools.selector.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                    properties.disabled.title = 'Disabled';
                }

                if (tools.table instanceof Tool) {
                    // Description
                    tools.table.constructor.prototype.description = 'Static Table';
                    // Attributes
                    attributes = tools.table.constructor.prototype.attributes;
                    attributes.columns.title = 'Columns';
                    attributes.rows.title = 'Rows';
                    attributes.data.title = 'Data';
                }

                if (tools.textarea instanceof Tool) {
                    // Description
                    tools.textarea.constructor.prototype.description = 'TextArea';
                    // Attributes
                    attributes = tools.textarea.constructor.prototype.attributes;
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.textarea.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.textbox instanceof Tool) {
                    // Description
                    tools.textbox.constructor.prototype.description = 'TextBox';
                    // Attributes
                    attributes = tools.textbox.constructor.prototype.attributes;
                    attributes.mask.title = 'Mask';
                    attributes.style.title = 'Style';
                    // Properties
                    properties = tools.textbox.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.textgaps instanceof Tool) {
                    // Description
                    tools.textgaps.constructor.prototype.description = 'Text gaps';
                    // Attributes
                    attributes = tools.textgaps.constructor.prototype.attributes;
                    attributes.inputStyle.title = 'Input Style';
                    attributes.style.title = 'Style';
                    attributes.text.title = 'Text';
                    attributes.text.defaultValue = 'Some text with gaps like [] or [] to fill.';
                    // Properties
                    properties = tools.textgaps.constructor.prototype.properties;
                    properties.name.title = 'Name';
                    properties.question.title = 'Question';
                    properties.solution.title = 'Solution';
                    properties.validation.title = 'Validation';
                    properties.success.title = 'Success';
                    properties.failure.title = 'Failure';
                    properties.omit.title = 'Omit';
                }

                if (tools.video instanceof Tool) {
                    // Description
                    tools.video.constructor.prototype.description = 'Video Player';
                    // Attributes
                    attributes = tools.video.constructor.prototype.attributes;
                    attributes.autoplay.title = 'Autoplay';
                    attributes.toolbarHeight.title = 'Toolbar Height';
                    attributes.mp4.title = 'MP4 File';
                    attributes.ogv.title = 'OGV File';
                    attributes.wbem.title = 'Fichier WBEM';
                }
            }

        }

    })(window.kendo.jQuery);

    /* jshint +W074 */
    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
