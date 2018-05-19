/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
// import 'kendo.core';

const {
    ui: {
        AssetManager,
        BaseDialog,
        // ButtonSet
        // CharGrid
        CodeEditor,
        // CodeInput,
        // Connector
        // DropZone
        Explorer,
        // Floating
        // FormatStrip
        // Highlighter
        ImageList,
        // ImageSet
        // MarkDown
        MarkEditor,
        // MathExpression
        // MathInput,
        MediaPlayer,
        MultiInput,
        MultiQuiz,
        Navigation,
        PlayBar,
        PropertyGrid,
        Quiz,
        // Rating
        // Selector
        Social,
        // SplitButton
        Stage,
        StyleEditor
        // Table
        // Template
        // TextGaps
        // ToolBox
        // UnitInput
        // VectorDrawing
    },
    markeditor,
    mathinput
} = window.kendo;

/* kidoju.widgets.assetmanager */
if (AssetManager) {
    const { options } = AssetManager.prototype;
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

/* kidoju.widgets.basedialog */
if (BaseDialog) {
    const { options } = BaseDialog.prototype;
    options.messages = $.extend(true, options.messages, {
        title: {
            error: 'Error',
            info: 'Information',
            success: 'Success',
            warning: 'Warning'
        },
        actions: {
            cancel: {
                action: 'cancel',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                text: 'Cancel'
            },
            close: {
                action: 'close',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                primary: true,
                text: 'Close'
            },
            create: {
                action: 'create',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/plus.svg',
                primary: true,
                text: 'Create'
            },
            no: {
                action: 'no',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                text: 'No'
            },
            ok: {
                action: 'ok',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                primary: true,
                text: 'OK'
            },
            yes: {
                action: 'yes',
                imageUrl:
                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                primary: true,
                text: 'Yes'
            }
        }
    });
}

/* kidoju.widgets.codeeditor */
if (CodeEditor) {
    const { options } = CodeEditor.prototype;
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
        jsonError:
            'Error parsing value as json. Wrap strings in double quotes.',
        timeoutError: 'The execution of a web worker has timed out.'
    });
}

/* kidoju.widgets.explorer */
if (Explorer) {
    const { options } = Explorer.prototype;
    options.messages = $.extend(true, options.messages, {
        empty: 'No item to display'
    });
}

/* kidoju.widgets.imagelist */
if (ImageList) {
    const { options } = ImageList.prototype;
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
if (MarkEditor) {
    const { options } = MarkEditor.prototype;
    options.messages = $.extend(true, options.messages, {
        image: 'An undescribed image',
        link: 'Click here'
    });
}
if (markeditor && markeditor.messages.dialogs) {
    markeditor.messages.dialogs = $.extend(true, markeditor.messages.dialogs, {
        cancel:
            '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel',
        okText:
            '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK',
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
if (markeditor && markeditor.messages.toolbar) {
    markeditor.messages.toolbar = $.extend(true, markeditor.messages.toolbar, {
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
if (mathinput && mathinput.messages.dialogs) {
    mathinput.messages.dialogs = $.extend(true, mathinput.messages.dialogs, {
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
if (mathinput && mathinput.messages.toolbar) {
    mathinput.messages.toolbar = $.extend(true, mathinput.messages.toolbar, {
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
if (MediaPlayer) {
    const { options } = MediaPlayer.prototype;
    options.messages = $.extend(true, options.messages, {
        play: 'Play/Pause',
        mute: 'Mute/Unmute',
        full: 'Full Screen',
        notSupported: 'Media not supported'
    });
}

/* kidoju.widgets.multiinput */
if (MultiInput) {
    const { options } = MultiInput.prototype;
    options.messages = $.extend(true, options.messages, {
        delete: 'Delete'
    });
}

/* kidoju.widgets.multiquiz */
if (MultiQuiz) {
    const { options } = MultiQuiz.prototype;
    options.messages = $.extend(true, options.messages, {
        placeholder: 'Select...'
    });
}

/* kidoju.widgets.navigation */
if (Navigation) {
    const { options } = Navigation.prototype;
    options.messages = $.extend(true, options.messages, {
        empty: 'No item to display'
    });
}

/* kidoju.widgets.playbar */
if (PlayBar) {
    const { options } = PlayBar.prototype;
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
if (PropertyGrid) {
    const { options } = PropertyGrid.prototype;
    options.messages = $.extend(true, options.messages, {
        property: 'Property',
        value: 'Value'
    });
}

/* kidoju.widgets.quiz */
if (Quiz) {
    const { options } = Quiz.prototype;
    options.messages = $.extend(true, options.messages, {
        optionLabel: 'Select...'
    });
}

/* kidoju.widgets.social */
if (Social) {
    const { options } = Social.prototype;
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
if (Stage) {
    const { options } = Stage.prototype;
    options.messages = $.extend(true, options.messages, {
        contextMenu: {
            delete: 'Delete',
            duplicate: 'Duplicate'
        },
        noPage: 'Please add or select a page'
    });
}

/* kidoju.widgets.styleeditor */
if (StyleEditor) {
    const { options } = StyleEditor.prototype;
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
