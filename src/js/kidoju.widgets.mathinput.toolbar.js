/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.popup',
        './vendor/kendo/kendo.list',
        './vendor/kendo/kendo.toolbar'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var ToolBar = kendo.ui.ToolBar;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.mathinput.toolbar');
        var TOOLBAR = [
            'backspace',
            'field',
            'keypad',
            'basic',
            'lowergreek',
            'uppergreek',
            'operator',
            'expression',
            'group',
            'matrix',
            'statistics'
            // 'units',
            // 'chemistry'
        ];

        /*********************************************************************************
         * MathInputToolBar Widget
         * @see math symbols at http://htmlarrows.com/math/
         * @see MQ supported LaTeX at https://inspera.atlassian.net/wiki/display/KB/MathQuill+symbols
         *********************************************************************************/

        kendo.mathinput = { messages: {} };

        var TOOLBAR_MESSAGES = kendo.mathinput.messages.toolbar = {
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
                    x: 'x',
                    y: 'y',
                    z: 'z',
                    pi: 'Pi',
                    infty: 'Infinity',
                    space: 'Space'
                }
            },
            basic: {
                title: 'Basic',
                buttons: {
                    // These are the functions that mathjs can calculate
                    sqrt: 'Square root',
                    cubert: 'Cube root',
                    nthroot: 'Nth root',
                    frac: 'Fraction',
                    pow: 'Power',
                    pow2: 'Power of 2',
                    pow3: 'Power of 3',
                    log: 'Logarithm',
                    log10: 'Logarithm base 10',
                    ln: 'Naperian logarithm',
                    subscript: 'Subscript',
                    sin: 'Sine',
                    cos: 'Cosine',
                    tan: 'Tangent',
                    arcsin: 'Arc sine',
                    arccos: 'Arc cosine',
                    arctan: 'Arc tangent',
                    deriv: 'Derivative',
                    partial: 'Partial derivative',
                    int: 'Integral',
                    sum: 'Sum',
                    prod: 'Product',
                    lim: 'Limit',
                    matrix: 'Matrix 2x2'
                    // TODO: fact, binomial
                }
            },
            lowergreek: {
                title: 'Greek (Lower Case)',
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
            uppergreek: {
                title: 'Greek (Upper Case)',
                buttons: {
                    // alpha: 'Alpha',
                    // beta: 'Beta',
                    gamma: 'Gamma',
                    delta: 'Delta',
                    // epsilon: 'Epsilon', // varepsilon
                    // zeta: 'Zeta',
                    // eta: 'Eta',
                    theta: 'Theta', // vartheta
                    // iota: 'Iota',
                    // kappa: 'Kappa', // varkappa
                    lambda: 'Lambda',
                    // mu: 'Mu',
                    // nu: 'Nu',
                    xi: 'Xi',
                    // omicron: 'Omicron',
                    pi: 'Pi', // varpi
                    // rho: 'Rho', // varrho
                    sigma: 'Sigma', // varsigma
                    // tau: 'Tau',
                    upsilon: 'Upsilon',
                    phi: 'Phi', // varphi
                    // chi: 'Chi',
                    psi: 'Psi',
                    omega: 'Omega'
                }
            },
            operator: {
                title: 'Operators',
                buttons: {
                    equal: 'Equal',
                    plus: 'Plus',
                    minus: 'Minus',
                    cdot: 'Times',
                    times: 'Times',
                    div: 'Divide',
                    lt: 'Lower then',
                    le: 'Lower than or equal',
                    gt: 'Greater than',
                    ge: 'Greater than or equal',
                    neq: 'Not equal',
                    approx: 'Approximate',
                    propto: 'Proportional',
                    plusminus: 'Plus-Minus',
                    percent: 'Percent',
                    factorial: 'Factorial',
                    and: 'And',
                    or: 'Or',
                    circ: 'Composition',
                    nabla: 'Nabla'
                }
            },
            expression: {
                title: 'Functions',
                buttons: {

                }
            },
            group: {
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
                    nimplies: 'Not implies',
                    iff: ''
                }
            },
            matrix: {
                title: 'Matrices',
                buttons: {

                }
            },
            statistics: {
                title: 'Statistics',
                buttons: {

                }
            },
            units: {
                title: 'Units',
                buttons: {

                }
            },
            chemistry: {
                title: 'Chemistry',
                buttons: {

                }
            }
        };
        var toolDefaults = {
            separator: { type: 'separator' },
            field: {
                type: 'button',
                command: 'ToolbarFieldCommand',
                iconClass: 'field'
            },
            backspace: {
                type: 'button',
                command: 'ToolbarBackspaceCommand',
                iconClass: 'backspace'
            },
            keypad: {
                type: 'keypad',
                iconClass: 'keypad'
            },
            basic: {
                type: 'basic',
                iconClass: 'basic'
            },
            lowergreek: {
                type: 'lowergreek',
                iconClass: 'lowergreek'
            },
            uppergreek: {
                type: 'uppergreek',
                iconClass: 'uppergreek'
            },
            operator: {
                type: 'operator',
                iconClass: 'operator'
            },
            expression: {
                type: 'expression',
                iconClass: 'expression'
            },
            group: {
                type: 'group',
                iconClass: 'group'
            },
            matrix: {
                type: 'matrix',
                iconClass: 'matrix'
            },
            statistics: {
                type: 'statistics',
                iconClass: 'statistics'
            },
            units: {
                type: 'units',
                iconClass: 'units'
            },
            chemistry: {
                type: 'chemistry',
                iconClass: 'chemistry'
            }
        };

        /**
         * MathInputToolBar
         */
        var MathInputToolBar = ToolBar.extend({
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || MathInputToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                logger.debug({ method: 'init', message: 'Widget initialized' });
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar kj-mathinput-toolbar');
                this._addSeparators(this.element);
                this.bind({
                    click: handleClick,
                    toggle: handleClick
                });
            },
            _addSeparators: function (element) {
                var groups = element.children('.k-widget, a.k-button, .k-button-group');
                groups.before('<span class=\'k-separator\' />');
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            _expandTools: function (tools) {
                function expandTool(toolName) {
                    var options = $.isPlainObject(toolName) ? toolName : toolDefaults[toolName] || {};
                    var spriteCssClass = 'k-icon k-font-icon k-i-' + options.iconClass;
                    var type = options.type;
                    var typeDefaults = {
                        splitButton: { spriteCssClass: spriteCssClass },
                        button: { showText: 'overflow' },
                        colorPicker: { toolIcon: spriteCssClass }
                    };
                    var tool = $.extend({
                        name: options.name || toolName,
                        text: TOOLBAR_MESSAGES[options.name || toolName].title,
                        spriteCssClass: spriteCssClass,
                        attributes: { title: TOOLBAR_MESSAGES[options.name || toolName].title }
                    }, typeDefaults[type], options);
                    if (type === 'splitButton') {
                        tool.menuButtons = tool.menuButtons.map(expandTool);
                    }
                    tool.attributes[kendo.attr('tool')] = toolName;
                    if (options.property) {
                        tool.attributes[kendo.attr('property')] = options.property;
                    }
                    return tool;
                }
                return tools.reduce(function (tools, tool) {
                    if ($.isArray(tool)) {
                        tools.push({
                            type: 'buttonGroup',
                            buttons: tool.map(expandTool)
                        });
                    } else {
                        tools.push(expandTool.call(this, tool));
                    }
                    return tools;
                }, []);
            },

            /* jshint +W074 */

            _click: function (e) {
                var toolName = e.target.attr(kendo.attr('tool'));
                var tool = toolDefaults[toolName] || {};
                var commandType = tool.command;
                if (!commandType) {
                    return;
                }
                var args = {
                    command: commandType,
                    options: {
                        property: tool.property || null,
                        value: tool.value || null
                    }
                };
                if (typeof args.options.value === 'boolean') {
                    args.options.value = e.checked ? true : null;
                }
                this.action(args);
            },
            events: [
                'click',
                'toggle',
                'open',
                'close',
                'overflowOpen',
                'overflowClose',
                'action',
                'dialog'
            ],
            options: {
                name: 'MathInputToolBar',
                resizable: true,
                tools: TOOLBAR
            },
            focused: function () {
                // TODO: from kendo.editor at ln 8410
                return this.element.find('.k-state-focused').length > 0; // || this.preventPopupHide || this.overflowPopup && this.overflowPopup.visible();
            },
            action: function (args) {
                this.trigger('action', args);
            },
            dialog: function (args) {
                this.trigger('dialog', args);
            },
            refresh: function (activeCell) {
                var range = activeCell;
                var tools = this._tools();
                function setToggle(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    var togglable = toolbar && toolbar.options.togglable || overflow && overflow.options.togglable;
                    if (!togglable) {
                        return;
                    }
                    var toggle = false;
                    if (typeof value === 'boolean') {
                        toggle = value;
                    } else if (typeof value === 'string') {
                        toggle = toolbar.options.value === value;
                    }
                    toolbar.toggle(toggle);
                    if (overflow) {
                        overflow.toggle(toggle);
                    }
                }
                function update(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    if (toolbar && toolbar.update) {
                        toolbar.update(value);
                    }
                    if (overflow && overflow.update) {
                        overflow.update(value);
                    }
                }
                for (var i = 0; i < tools.length; i++) {
                    var property = tools[i].property;
                    var tool = tools[i].tool;
                    var value = kendo.isFunction(range[property]) ? range[property]() : range;
                    if (property === 'gridLines') {
                        value = range.sheet().showGridLines();
                    }
                    if (tool.type === 'button') {
                        setToggle(tool, value);
                    } else {
                        update(tool, value);
                    }
                }
            },
            _tools: function () {
                return this.element.find('[' + kendo.attr('property') + ']').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr('data-property'),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },
            destroy: function () {
                this.element.find('[data-command],.k-button').each(function () {
                    var element = $(this);
                    var instance = element.data('instance');
                    if (instance && instance.destroy) {
                        instance.destroy();
                    }
                });
                ToolBar.fn.destroy.call(this);
            }
        });
        kendo.ui.plugin(MathInputToolBar);

        /*********************************************************************************
         * MathInputToolBar Tools
         * See list of MathQuill supported LaTeX symbols at https://inspera.atlassian.net/wiki/display/KB/MathQuill+symbols
         *********************************************************************************/

        /**
         * PopupTool
         */
        var PopupTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                this.element = $('<a href=\'#\' class=\'k-button k-button-icon\'>' + '<span class=\'' + options.spriteCssClass + '\'>' + '</span><span class=\'k-icon k-i-arrow-60-down\'></span>' + '</a>');
                this.element
                    .on('click touchend', this.open.bind(this))
                    .attr('data-command', options.command);
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                this._popup();
            },
            destroy: function () {
                this.popup.destroy();
            },
            open: function (ev) {
                ev.preventDefault();
                this.popup.toggle();
            },
            _popup: function () {
                var element = this.element;
                this.popup = $('<div class=\'k-spreadsheet-popup kj-mathinput-popup\' />')
                    .appendTo(element)
                    .kendoPopup({ anchor: element }).data('kendoPopup');
            }
        });

        /*
         kendo.toolbar.registerComponent('dialog', kendo.toolbar.ToolBarButton.extend({
         init: function (options, toolbar) {
         kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
         this._dialogName = options.dialogName;
         this.element.bind('click touchend', this.open.bind(this)).data('instance', this);
         },
         open: function () {
         this.toolbar.dialog({ name: this._dialogName });
         }
         }));
         kendo.toolbar.registerComponent('exportAsDialog', kendo.toolbar.Item.extend({
         init: function (options, toolbar) {
         this._dialogName = options.dialogName;
         this.toolbar = toolbar;
         this.element = $('<button class=\'k-button k-button-icon\' title=\'' + options.attributes.title + '\'>' + '<span class=\'k-icon k-font-icon k-i-xls\' />' + '</button>').data('instance', this);
         this.element.bind('click', this.open.bind(this)).data('instance', this);
         },
         open: function () {
         this.toolbar.dialog({ name: this._dialogName });
         }
         }));
         */

        /**
         * OverflowDialogButton
         */
        var OverflowDialogButton = kendo.toolbar.OverflowButton.extend({
            init: function (options, toolbar) {
                kendo.toolbar.OverflowButton.fn.init.call(this, options, toolbar);
                this.element.on('click touchend', this._click.bind(this));
                this.message = this.options.text;
                var instance = this.element.data('button');
                this.element.data(this.options.type, instance);
            },
            _click: $.noop
        });

        /**
         * KeyPadTool and KeyPadButton
         */
        var KeyPadTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'keypad',
                    keypad: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '7',
                    iconClass: 'n7',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n7
                },
                {
                    value: '8',
                    iconClass: 'n8',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n8
                },
                {
                    value: '9',
                    iconClass: 'n9',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n9
                },
                {
                    value: 'a',
                    iconClass: 'a',
                    text: TOOLBAR_MESSAGES.keypad.buttons.a
                },
                {
                    value: 'b',
                    iconClass: 'b',
                    text: TOOLBAR_MESSAGES.keypad.buttons.b
                },
                {
                    value: 'c',
                    iconClass: 'c',
                    text: TOOLBAR_MESSAGES.keypad.buttons.c
                },
                {
                    value: '4',
                    iconClass: 'n4',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n4
                },
                {
                    value: '5',
                    iconClass: 'n5',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n5
                },
                {
                    value: '6',
                    iconClass: 'n6',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n6
                },
                {
                    value: 'i',
                    iconClass: 'i',
                    text: TOOLBAR_MESSAGES.keypad.buttons.i
                },
                {
                    value: 'j',
                    iconClass: 'j',
                    text: TOOLBAR_MESSAGES.keypad.buttons.j
                },
                {
                    value: 'k',
                    iconClass: 'k',
                    text: TOOLBAR_MESSAGES.keypad.buttons.k
                },
                {
                    value: '1',
                    iconClass: 'n1',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n1
                },
                {
                    value: '2',
                    iconClass: 'n2',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n2
                },
                {
                    value: '3',
                    iconClass: 'n3',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n3
                },
                {
                    value: 'n',
                    iconClass: 'n',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n
                },
                {
                    value: 'p',
                    iconClass: 'p',
                    text: TOOLBAR_MESSAGES.keypad.buttons.p
                },
                {
                    value: 'q',
                    iconClass: 'q',
                    text: TOOLBAR_MESSAGES.keypad.buttons.q
                },
                {
                    value: ',',
                    iconClass: 'comma',
                    text: TOOLBAR_MESSAGES.keypad.buttons.comma
                },
                {
                    value: '0',
                    iconClass: 'n0',
                    text: TOOLBAR_MESSAGES.keypad.buttons.n0
                },
                {
                    value: '.',
                    iconClass: 'stop',
                    text: TOOLBAR_MESSAGES.keypad.buttons.stop
                },
                {
                    value: 'x',
                    iconClass: 'x',
                    text: TOOLBAR_MESSAGES.keypad.buttons.x
                },
                {
                    value: 'y',
                    iconClass: 'y',
                    text: TOOLBAR_MESSAGES.keypad.buttons.y
                },
                {
                    value: 'z',
                    iconClass: 'z',
                    text: TOOLBAR_MESSAGES.keypad.buttons.z
                },
                {
                    value: '\\pi',
                    iconClass: 'pi',
                    text: TOOLBAR_MESSAGES.keypad.buttons.pi
                },
                {
                    value: '\\infty',
                    iconClass: 'infty',
                    text: TOOLBAR_MESSAGES.keypad.buttons.infty
                },
                {
                    value: ' ',
                    iconClass: 'space',
                    text: TOOLBAR_MESSAGES.keypad.buttons.space
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarKeyPadCommand',
                    options: {
                        value: value
                    }
                });
            }
        });
        var KeyPadButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'keypad' });
            }
        });
        kendo.toolbar.registerComponent('keypad', KeyPadTool, KeyPadButton);

        /**
         * BasicTool and BasicButton (compatible with kidoju.widgets.mathgraph)
         */
        var BasicTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'basic',
                    basic: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '\\sqrt',
                    iconClass: 'sqrt',
                    text: TOOLBAR_MESSAGES.basic.buttons.sqrt
                },
                {
                    value: '\\sqrt[3]{ }',
                    iconClass: 'cbrt',
                    text: TOOLBAR_MESSAGES.basic.buttons.cubert
                },
                {
                    value: '\\sqrt[]{ }',
                    iconClass: 'nthroot',
                    text: TOOLBAR_MESSAGES.basic.buttons.nthroot
                },
                {
                    value: '\\frac',
                    iconClass: 'frac',
                    text: TOOLBAR_MESSAGES.basic.buttons.frac
                },
                {
                    value: '_{ }',
                    iconClass: 'subscript',
                    text: TOOLBAR_MESSAGES.basic.buttons.subscript
                },
                {
                    value: '^{ }',
                    iconClass: 'pow',
                    text: TOOLBAR_MESSAGES.basic.buttons.pow
                },
                {
                    value: '^2',
                    iconClass: 'pow2',
                    text: TOOLBAR_MESSAGES.basic.buttons.pow2
                },
                {
                    value: '^3',
                    iconClass: 'pow3',
                    text: TOOLBAR_MESSAGES.basic.buttons.pow3
                },
                {
                    value: '\\log_{}\\left(\\right)',
                    iconClass: 'log',
                    text: TOOLBAR_MESSAGES.basic.buttons.log
                },
                {
                    value: '\\log\\left(\\right)',
                    iconClass: 'log10',
                    text: TOOLBAR_MESSAGES.basic.buttons.log10
                },
                {
                    value: '\\ln\\left(\\right)',
                    iconClass: 'ln',
                    text: TOOLBAR_MESSAGES.basic.buttons.ln
                },
                {
                    value: '\\arcsin\\left(\\right)',
                    iconClass: 'arcsin',
                    text: TOOLBAR_MESSAGES.basic.buttons.arcsin
                },
                {
                    value: '\\arccos\\left(\\right)',
                    iconClass: 'arccos',
                    text: TOOLBAR_MESSAGES.basic.buttons.arccos
                },
                {
                    value: '\\arctan\\left(\\right)',
                    iconClass: 'arctan',
                    text: TOOLBAR_MESSAGES.basic.buttons.arctan
                },
                {
                    value: '\\frac{d}{dx}\\left(\\right)',
                    iconClass: 'deriv',
                    text: TOOLBAR_MESSAGES.basic.buttons.deriv
                },
                {
                    value: '\\frac{\\partial}{\\partial x}\\left(\\right)',
                    iconClass: 'partial',
                    text: TOOLBAR_MESSAGES.basic.buttons.partial
                },
                {
                    value: '\\int',
                    iconClass: 'int',
                    text: TOOLBAR_MESSAGES.basic.buttons.int
                },
                {
                    value: '\\sum',
                    iconClass: 'sum',
                    text: TOOLBAR_MESSAGES.basic.buttons.sum
                },
                {
                    value: '\\prod',
                    iconClass: 'prod',
                    text: TOOLBAR_MESSAGES.basic.buttons.prod
                },
                {
                    value: '\\lim_{\\to}\\left(\\right)',
                    iconClass: 'lim',
                    text: TOOLBAR_MESSAGES.basic.buttons.lim
                },
                {
                    value: '\\left[',
                    iconClass: 'leftsb',
                    text: TOOLBAR_MESSAGES.basic.buttons.leftsb
                },
                {
                    value: '\\right]',
                    iconClass: 'rightsb',
                    text: TOOLBAR_MESSAGES.basic.buttons.rightsb
                },
                {
                    value: '\\left{',
                    iconClass: 'leftcb',
                    text: TOOLBAR_MESSAGES.basic.buttons.leftcb
                },
                {
                    value: '\\right}',
                    iconClass: 'rightcb',
                    text: TOOLBAR_MESSAGES.basic.buttons.rightcb
                },
                {
                    value: '\\left|',
                    iconClass: 'leftvl',
                    text: TOOLBAR_MESSAGES.basic.buttons.leftvl
                },
                {
                    value: '\\right|',
                    iconClass: 'rightvl',
                    text: TOOLBAR_MESSAGES.basic.buttons.rightvl
                }
                // TODO fact, binomial
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarBasicCommand',
                    options: { value: value }
                });
            }
        });
        var BasicButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'basic' });
            }
        });
        kendo.toolbar.registerComponent('basic', BasicTool, BasicButton);

        /**
         * LowerGreekTool and LowerGreekButton
         */
        var LowerGreekTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'lowergreek',
                    lowergreek: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '\\alpha',
                    iconClass: 'alpha',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.alpha
                },
                {
                    value: '\\beta',
                    iconClass: 'beta',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.beta
                },
                {
                    value: '\\gamma',
                    iconClass: 'gamma',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.gamma
                },
                {
                    value: '\\delta',
                    iconClass: 'delta',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.delta
                },
                {
                    value: '\\epsilon',
                    iconClass: 'epsilon',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.epsilon
                },
                {
                    value: '\\zeta',
                    iconClass: 'zeta',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.zeta
                },
                {
                    value: '\\eta',
                    iconClass: 'eta',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.eta
                },
                {
                    value: '\\theta',
                    iconClass: 'theta',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.theta
                },
                {
                    value: '\\iota',
                    iconClass: 'iota',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.iota
                },
                {
                    value: '\\kappa',
                    iconClass: 'kappa',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.kappa
                },
                {
                    value: '\\lambda',
                    iconClass: 'lambda',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.lambda
                },
                {
                    value: '\\mu',
                    iconClass: 'mu',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.mu
                },
                {
                    value: '\\nu',
                    iconClass: 'nu',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.nu
                },
                {
                    value: '\\xi',
                    iconClass: 'xi',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.xi
                },
                {
                    // Omicron does not exist in LaTeX
                    // see https://tex.stackexchange.com/questions/233257/omicron-not-working-in-latex
                    value: 'o', // \\omicron',
                    iconClass: 'omicron',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.omicron
                },
                {
                    value: '\\pi',
                    iconClass: 'pi',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.pi
                },
                {
                    value: '\\rho',
                    iconClass: 'rho',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.rho
                },
                {
                    value: '\\sigma',
                    iconClass: 'sigma',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.sigma
                },
                {
                    value: '\\tau',
                    iconClass: 'tau',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.tau
                },
                {
                    value: '\\upsilon',
                    iconClass: 'upsilon',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.upsilon
                },
                {
                    value: '\\phi',
                    iconClass: 'phi',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.phi
                },
                {
                    value: '\\chi',
                    iconClass: 'chi',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.chi
                },
                {
                    value: '\\psi',
                    iconClass: 'psi',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.psi
                },
                {
                    value: '\\omega',
                    iconClass: 'omega',
                    text: TOOLBAR_MESSAGES.lowergreek.buttons.omega
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarLowerGreekCommand',
                    options: { value: value }
                });
            }
        });
        var LowerGreekButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'lowergreek' });
            }
        });
        kendo.toolbar.registerComponent('lowergreek', LowerGreekTool, LowerGreekButton);

        /**
         * UpperGreekTool and UpperGreekButton
         */
        var UpperGreekTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'uppergreek',
                    uppergreek: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 // Note: when deleting, you need two strokes to delete unicode characters, one for the unicode character and one for the text directive
                 // TODO: So let us comment that for now
                 {
                 value: '\\text{\u0391}',
                 iconClass: 'alpha-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.alpha
                 },
                 {
                 value: '\\text{\u0392}',
                 iconClass: 'beta-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.beta
                 },
                 */
                {
                    value: '\\Gamma',
                    iconClass: 'gamma-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.gamma
                },
                {
                    value: '\\Delta',
                    iconClass: 'delta-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.delta
                },
                /*
                 {
                 value: '\\text{\u0395}',
                 iconClass: 'epsilon-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.epsilon
                 },
                 {
                 value: '\\text{\u0396}',
                 iconClass: 'zeta-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.zeta
                 },
                 {
                 value: '\\text{\u0397}',
                 iconClass: 'eta-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.eta
                 },
                 */
                {
                    value: '\\Theta',
                    iconClass: 'theta-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.theta
                },
                /*
                 {
                 value: '\\text{\u0399}',
                 iconClass: 'iota-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.iota
                 },
                 {
                 value: '\\text{\u039a}',
                 iconClass: 'kappa-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.kappa
                 },
                 */
                {
                    value: '\\Lambda',
                    iconClass: 'lambda-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.lambda
                },
                /*
                 {
                 value: '\\text{\u039c}',
                 iconClass: 'mu-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.mu
                 },
                 {
                 value: '\\text{\u039d}',
                 iconClass: 'nu-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.nu
                 },
                 */
                {
                    value: '\\Xi',
                    iconClass: 'xi-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.xi
                },
                /*
                 {
                 value: '\\text{\u039f}',
                 iconClass: 'omicron-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.omicron
                 },
                 */
                {
                    value: '\\Pi',
                    iconClass: 'pi-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.pi
                },
                /*
                 {
                 value: '\\text{\u03a1}',
                 iconClass: 'rho-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.rho
                 },
                 */
                {
                    value: '\\Sigma',
                    iconClass: 'sigma-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.sigma
                },
                /*
                 {
                 value: '\\text{\u03a4}',
                 iconClass: 'tau-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.tau
                 },
                 */
                {
                    value: '\\Upsilon',
                    iconClass: 'upsilon-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.upsilon
                },
                {
                    value: '\\Phi',
                    iconClass: 'phi-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.phi
                },
                /*
                 {
                 value: '\\text{\u03a7}',
                 iconClass: 'chi-maj',
                 text: TOOLBAR_MESSAGES.uppergreek.buttons.chi
                 },
                 */
                {
                    value: '\\Psi',
                    iconClass: 'psi-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.psi
                },
                {
                    value: '\\Omega',
                    iconClass: 'omega-maj',
                    text: TOOLBAR_MESSAGES.uppergreek.buttons.omega
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarUpperGreekCommand',
                    options: { value: value }
                });
            }
        });
        var UpperGreekButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'uppergreek' });
            }
        });
        kendo.toolbar.registerComponent('uppergreek', UpperGreekTool, UpperGreekButton);

        /**
         * OperatorTool and OperatorButton
         */
        var OperatorTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'operator',
                    operator: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '=',
                    iconClass: 'equal',
                    text: TOOLBAR_MESSAGES.operator.buttons.equal
                },
                {
                    value: '+',
                    iconClass: 'plus',
                    text: TOOLBAR_MESSAGES.operator.buttons.plus
                },
                {
                    value: '-',
                    iconClass: 'minus',
                    text: TOOLBAR_MESSAGES.operator.buttons.minus
                },
                {
                    value: '\\cdot',
                    iconClass: 'cdot',
                    text: TOOLBAR_MESSAGES.operator.buttons.cdot
                },
                {
                    value: '\\times',
                    iconClass: 'times',
                    text: TOOLBAR_MESSAGES.operator.buttons.times
                },
                {
                    value: '\\div',
                    iconClass: 'div',
                    text: TOOLBAR_MESSAGES.operator.buttons.div
                },
                {
                    value: '<',
                    iconClass: 'lt',
                    text: TOOLBAR_MESSAGES.operator.buttons.lt
                },
                {
                    value: '\\le',
                    iconClass: 'le',
                    text: TOOLBAR_MESSAGES.operator.buttons.le
                },
                {
                    value: '>',
                    iconClass: 'gt',
                    text: TOOLBAR_MESSAGES.operator.buttons.gt
                },
                {
                    value: '\\ge',
                    iconClass: 'ge',
                    text: TOOLBAR_MESSAGES.operator.buttons.ge
                },
                {
                    value: '\\neq',
                    iconClass: 'neq',
                    text: TOOLBAR_MESSAGES.operator.buttons.neq
                },
                {
                    value: '\\approx',
                    iconClass: 'approx',
                    text: TOOLBAR_MESSAGES.operator.buttons.approx
                },
                {
                    value: '\\propto',
                    iconClass: 'propto',
                    text: TOOLBAR_MESSAGES.operator.buttons.propto
                },
                {
                    value: '\\pm',
                    iconClass: 'plusminus',
                    text: TOOLBAR_MESSAGES.operator.buttons.plusminus
                },
                {
                    value: '%',
                    iconClass: 'percent',
                    text: TOOLBAR_MESSAGES.operator.buttons.percent
                },
                {
                    value: '!',
                    iconClass: 'factorial',
                    text: TOOLBAR_MESSAGES.operator.buttons.factorial
                },
                {
                    value: '\\wedge', // also '\\and',
                    iconClass: 'and',
                    text: TOOLBAR_MESSAGES.operator.buttons.and
                },
                {
                    value: '\\vee',// also '\\or',
                    iconClass: 'or',
                    text: TOOLBAR_MESSAGES.operator.buttons.or
                },
                {
                    value: '\\circ',
                    iconClass: 'circ',
                    text: TOOLBAR_MESSAGES.operator.buttons.circ
                },
                {
                    value: '\\nabla',
                    iconClass: 'nabla',
                    text: TOOLBAR_MESSAGES.operator.buttons.nabla
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarOperatorCommand',
                    options: { value: value }
                });
            }
        });
        var OperatorButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'operator' });
            }
        });
        kendo.toolbar.registerComponent('operator', OperatorTool, OperatorButton);

        /**
         * ExpressionTool and ExpressionButton
         */
        var ExpressionTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'expression',
                    expression: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: TOOLBAR_MESSAGES.expression.buttons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarExpressionCommand',
                    options: { value: value }
                });
            }
        });
        var ExpressionButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'expression' });
            }
        });
        kendo.toolbar.registerComponent('expression', ExpressionTool, ExpressionButton);

        /**
         * GroupTool and GroupButton
         */
        var GroupTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'group',
                    group: this,
                    instance: this
                });
            },
            buttons: [
                // See also https://texblog.org/2007/08/27/number-sets-prime-natural-integer-rational-real-and-complex-in-latex/
                {
                    value: '\\C', // also '\\complexes', but \\mathbb{C} does not work
                    iconClass: 'cset',
                    text: TOOLBAR_MESSAGES.group.buttons.cset
                },
                {
                    value: '\\N', // also '\\naturals', but \\mathbb{N} does not work
                    iconClass: 'nset',
                    text: TOOLBAR_MESSAGES.group.buttons.nset
                },
                {
                    value: '\\P', // also '\\primes',
                    iconClass: 'pset',
                    text: TOOLBAR_MESSAGES.group.buttons.pset
                },
                {
                    value: '\\Q', // also '\\rationals',
                    iconClass: 'qset',
                    text: TOOLBAR_MESSAGES.group.buttons.qset
                },
                {
                    value: '\\R', // also '\\reals',
                    iconClass: 'rset',
                    text: TOOLBAR_MESSAGES.group.buttons.rset
                },
                {
                    value: '\\Z', // also '\\integers',
                    iconClass: 'zset',
                    text: TOOLBAR_MESSAGES.group.buttons.zset
                },
                {
                    value: '\\varnothing', // also '\\O', '\\empty' and '\\emptyset',
                    iconClass: 'emptyset',
                    text: TOOLBAR_MESSAGES.group.buttons.emptyset
                },
                {
                    value: '\\forall',
                    iconClass: 'forall',
                    text: TOOLBAR_MESSAGES.group.buttons.forall
                },
                {
                    value: '\\exists',
                    iconClass: 'exists',
                    text: TOOLBAR_MESSAGES.group.buttons.exists
                },
                {
                    value: '\\nexists',
                    iconClass: 'nexists',
                    text: TOOLBAR_MESSAGES.group.buttons.nexists
                },
                {
                    value: '\\in',
                    iconClass: 'in',
                    text: TOOLBAR_MESSAGES.group.buttons.in
                },
                {
                    value: '\\notin',
                    iconClass: 'nin',
                    text: TOOLBAR_MESSAGES.group.buttons.nin
                },
                {
                    value: '\\subset',
                    iconClass: 'subset',
                    text: TOOLBAR_MESSAGES.group.buttons.subset
                },
                {
                    value: '\\supset',
                    iconClass: 'supset',
                    text: TOOLBAR_MESSAGES.group.buttons.supset
                },
                // TODO: does not work - see https://github.com/mathquill/mathquill/pull/624
                /*
                 {
                 value: '\\notsubset',
                 iconClass: 'nsubset',
                 text: TOOLBAR_MESSAGES.group.buttons.nsubset
                 },
                 {
                 value: '\\notsupset',
                 iconClass: 'nsupset',
                 text: TOOLBAR_MESSAGES.group.buttons.nsupset
                 },
                 */
                {
                    value: '\\cap', // also '\\intersection'
                    iconClass: 'intersection',
                    text: TOOLBAR_MESSAGES.group.buttons.intersection
                },
                {
                    value: '\\cup', // also '\\union',
                    iconClass: 'union',
                    text: TOOLBAR_MESSAGES.group.buttons.union
                },
                {
                    value: '\\to',
                    iconClass: 'to',
                    text: TOOLBAR_MESSAGES.group.buttons.to
                },
                {
                    value: '\\Rightarrow', // also '\\implies',
                    iconClass: 'implies',
                    text: TOOLBAR_MESSAGES.group.buttons.implies
                },
                // TODO does not work
                /*
                 {
                 value: '\nRightarrow',
                 iconClass: 'nimplies',
                 text: TOOLBAR_MESSAGES.group.buttons.nimplies
                 },
                 */
                {
                    value: '\\iff',
                    iconClass: 'iff',
                    text: TOOLBAR_MESSAGES.group.buttons.iff
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarGroupCommand',
                    options: { value: value }
                });
            }
        });
        var GroupButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'group' });
            }
        });
        kendo.toolbar.registerComponent('group', GroupTool, GroupButton);

        /**
         * MatrixTool and MatrixButton
         */
        var MatrixTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'matrix',
                    matrix: this,
                    instance: this
                });
            },
            buttons: [
                // https://github.com/mathquill/mathquill/issues/332
                // Matrix support: https://github.com/Learnosity/mathquill/commit/50315cf9056946fd59f2ffc14e2b1d0e03f6ec4b
                {
                    value: '\\begin{matrix}1&amp;2\\\\x&amp;y\\end{matrix}', // Bare
                    iconClass: 'matrix2x2',
                    text: TOOLBAR_MESSAGES.matrix.buttons.matrix2x2
                },
                {
                    value: '\\begin{pmatrix}1&amp;2\\\\x&amp;y\\end{pmatrix}', // Parenthesis
                    iconClass: 'matrix2x2',
                    text: TOOLBAR_MESSAGES.matrix.buttons.matrix2x2
                },
                {
                    value: '\\begin{bmatrix}1&amp;2\\\\x&amp;y\\end{bmatrix}', // Square Brackets
                    iconClass: 'matrix2x2',
                    text: TOOLBAR_MESSAGES.matrix.buttons.matrix2x2
                },
                {
                    value: '\\begin{Bmatrix}1&amp;2\\\\x&amp;y\\end{Bmatrix}', // Curly braces
                    iconClass: 'matrix2x2',
                    text: TOOLBAR_MESSAGES.matrix.buttons.matrix2x2
                },
                {
                    value: '\\begin{vmatrix}1&amp;2\\\\x&amp;y\\end{vmatrix}', // Vertical line
                    iconClass: 'matrix2x2',
                    text: TOOLBAR_MESSAGES.matrix.buttons.matrix2x2
                },
                {
                    value: '\\begin{Vmatrix}&amp;\\\\&amp;\\end{Vmatrix}', // Double vertical lines
                    iconClass: 'matrix2x2',
                    text: TOOLBAR_MESSAGES.matrix.buttons.matrix2x2
                }
                // TODO matrix, \pmatrix, \bmatrix, \Bmatrix, \vmatrix, \Vmatrix
                // TODO add column, add row, remove column, remove row
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarMatrixCommand',
                    options: { value: value }
                });
            }
        });
        var MatrixButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'matrix' });
            }
        });
        kendo.toolbar.registerComponent('matrix', MatrixTool, MatrixButton);

        /**
         * StatisticsTool and StatisticsButton
         */
        var StatisticsTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'statistics',
                    statistics: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: TOOLBAR_MESSAGES.statistics.buttons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarStatisticsCommand',
                    options: { value: value }
                });
            }
        });
        var StatisticsButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'statistics' });
            }
        });
        kendo.toolbar.registerComponent('statistics', StatisticsTool, StatisticsButton);

        // TODO UnitsTool: how to delete kg or km as one symbol although it is made of 2 letters
        // TODO the same applies to chemistry with periodic table elements like Ag, Br, Cl, Na, ...

        /**
         * ChemistryTool and ChemistryButton
         */
        var ChemistryTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'chemistry',
                    chemistry: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: TOOLBAR_MESSAGES.chemistry.buttons.alpha
                 },
                 */
                /*
                 Periodic table
                 Subscripts and Superscripts 0-9 + and -
                 arrow and arrow + text
                 Rightwards Harpoon Over Leftwards Harpoon (U+21cc)
                 parenthesis and square brackets
                 https://en.wikipedia.org/wiki/Gibbs_free_energy (energy, entropy, enthalpy and their deltas)
                 d/dt
                 K equilibirum constant
                 k rate constant
                 Also look at bond symbols https://github.com/mathquill/mathquill/pull/557
                 Check that everyting works in KaTeX
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarChemistryCommand',
                    options: { value: value }
                });
            }
        });
        var ChemistryButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'chemistry' });
            }
        });
        kendo.toolbar.registerComponent('chemistry', ChemistryTool, ChemistryButton);

        /*********************************************************************************
         * MathInputToolBar Dialogs
         *********************************************************************************/

        var DIALOG_MESSAGES = kendo.mathinput.messages.dialogs = {
            apply: 'Apply',
            save: 'Save',
            cancel: 'Cancel',
            remove: 'Remove',
            retry: 'Retry',
            revert: 'Revert',
            okText: 'OK',
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
                    x: 'x',
                    y: 'y',
                    z: 'z',
                    pi: 'Pi',
                    // euler `e` and imaginary `i`
                    infty: 'Infinity',
                    space: 'Space'
                }
            },
            basic: {
                title: 'Basic',
                buttons: {

                }
            },
            lowergreek: {
                title: 'Greek (Lower Case)',
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
            uppergreek: {
                title: 'Greek (Upper Case)',
                buttons: {
                    // alpha: 'Alpha',
                    // beta: 'Beta',
                    gamma: 'Gamma',
                    delta: 'Delta',
                    // epsilon: 'Epsilon', // varepsilon
                    // zeta: 'Zeta',
                    // eta: 'Eta',
                    theta: 'Theta', // vartheta
                    // iota: 'Iota',
                    // kappa: 'Kappa', // varkappa
                    lambda: 'Lambda',
                    // mu: 'Mu',
                    // nu: 'Nu',
                    xi: 'Xi',
                    // omicron: 'Omicron',
                    pi: 'Pi', // varpi
                    // rho: 'Rho', // varrho
                    sigma: 'Sigma', // varsigma
                    // tau: 'Tau',
                    upsilon: 'Upsilon',
                    phi: 'Phi', // varphi
                    // chi: 'Chi',
                    psi: 'Psi',
                    omega: 'Omega'
                }
            },
            operator: {
                title: 'Operators',
                buttons: {
                    equal: 'Equal',
                    plus: 'Plus',
                    minus: 'Minus',
                    cdot: 'Times',
                    times: 'Times',
                    div: 'Divide',
                    lt: 'Lower then',
                    le: 'Lower than or equal',
                    gt: 'Greater than',
                    ge: 'Greater than or equal',
                    neq: 'Not equal',
                    approx: 'Approximate',
                    propto: 'Proportional',
                    plusminus: 'Plus-Minus',
                    percent: 'Percent',
                    factorial: 'Factorial',
                    and: 'And',
                    or: 'Or',
                    circ: 'Composition',
                    nabla: 'Nabla'
                }
            },
            expression: {
                title: 'Functions',
                buttons: {}
            },
            group: {
                title: 'Sets',
                buttons: {}
            },
            matrix: {
                title: 'Matrices',
                buttons: {}
            },
            statistics: {
                title: 'Statistics',
                buttons: {}
            },
            chemistry: {
                title: 'Chemistry',
                buttons: {}
            }
        };

        /**
         * Dialog registry
         * @type {{}}
         */
        var registry = {};
        kendo.mathinput.dialogs = {
            register: function (name, dialogClass) {
                registry[name] = dialogClass;
            },
            registered: function (name) {
                return !!registry[name];
            },
            create: function (name, options) {
                var DialogClass = registry[name];
                if (DialogClass) {
                    return new DialogClass(options);
                }
            }
        };

        /**
         * MathInputDialog
         */
        var MathInputDialog = kendo.mathinput.MathInputDialog = kendo.Observable.extend({
            init: function (options) {
                kendo.Observable.fn.init.call(this, options);
                this.options = $.extend(true, {}, this.options, options);
                this.bind(this.events, options);
            },
            events: [
                'close',
                'activate'
            ],
            options: { autoFocus: true },
            dialog: function () {
                if (!this._dialog) {
                    this._dialog = $('<div class=\'k-spreadsheet-window k-action-window kj-mathinput-dialog\' />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
                        messages: kendo.spreadsheet.messages.dialogs || DIALOG_MESSAGES,
                        errors: this.options.errors
                    })).appendTo(document.body).kendoWindow({
                        autoFocus: this.options.autoFocus,
                        scrollable: false,
                        resizable: false,
                        modal: true,
                        visible: false,
                        width: this.options.width || 320,
                        title: this.options.title,
                        open: function () {
                            this.center();
                        },
                        close: this._onDialogClose.bind(this),
                        activate: this._onDialogActivate.bind(this),
                        deactivate: this._onDialogDeactivate.bind(this)
                    }).data('kendoWindow');
                }
                return this._dialog;
            },
            _onDialogClose: function () {
                this.trigger('close', { action: this._action });
            },
            _onDialogActivate: function () {
                this.trigger('activate');
            },
            _onDialogDeactivate: function () {
                this.trigger('deactivate');
                this.destroy();
            },
            destroy: function () {
                if (this._dialog) {
                    this._dialog.destroy();
                    this._dialog = null;
                }
            },
            open: function () {
                this.dialog().open();
            },
            apply: function () {
                this.close();
            },
            close: function () {
                this._action = 'close';
                this.dialog().close();
            }
        });

        /**
         * KeyPadDialog
         */
        var KeyPadDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.keypad.title,
                    buttons: [
                        {
                            value: '7',
                            iconClass: 'n7',
                            text: DIALOG_MESSAGES.keypad.buttons.n7
                        },
                        {
                            value: '8',
                            iconClass: 'n8',
                            text: DIALOG_MESSAGES.keypad.buttons.n8
                        },
                        {
                            value: '9',
                            iconClass: 'n9',
                            text: DIALOG_MESSAGES.keypad.buttons.n9
                        },
                        {
                            value: 'a',
                            iconClass: 'a',
                            text: DIALOG_MESSAGES.keypad.buttons.a
                        },
                        {
                            value: 'b',
                            iconClass: 'b',
                            text: DIALOG_MESSAGES.keypad.buttons.b
                        },
                        {
                            value: 'c',
                            iconClass: 'c',
                            text: DIALOG_MESSAGES.keypad.buttons.c
                        },
                        {
                            value: '4',
                            iconClass: 'n4',
                            text: DIALOG_MESSAGES.keypad.buttons.n4
                        },
                        {
                            value: '5',
                            iconClass: 'n5',
                            text: DIALOG_MESSAGES.keypad.buttons.n5
                        },
                        {
                            value: '6',
                            iconClass: 'n6',
                            text: DIALOG_MESSAGES.keypad.buttons.n6
                        },
                        {
                            value: 'i',
                            iconClass: 'i',
                            text: DIALOG_MESSAGES.keypad.buttons.i
                        },
                        {
                            value: 'j',
                            iconClass: 'j',
                            text: DIALOG_MESSAGES.keypad.buttons.j
                        },
                        {
                            value: 'k',
                            iconClass: 'k',
                            text: DIALOG_MESSAGES.keypad.buttons.k
                        },
                        {
                            value: '1',
                            iconClass: 'n1',
                            text: DIALOG_MESSAGES.keypad.buttons.n1
                        },
                        {
                            value: '2',
                            iconClass: 'n2',
                            text: DIALOG_MESSAGES.keypad.buttons.n2
                        },
                        {
                            value: '3',
                            iconClass: 'n3',
                            text: DIALOG_MESSAGES.keypad.buttons.n3
                        },
                        {
                            value: 'n',
                            iconClass: 'n',
                            text: DIALOG_MESSAGES.keypad.buttons.n
                        },
                        {
                            value: 'p',
                            iconClass: 'p',
                            text: DIALOG_MESSAGES.keypad.buttons.p
                        },
                        {
                            value: 'q',
                            iconClass: 'q',
                            text: DIALOG_MESSAGES.keypad.buttons.q
                        },
                        {
                            value: ',',
                            iconClass: 'comma',
                            text: DIALOG_MESSAGES.keypad.buttons.comma
                        },
                        {
                            value: '0',
                            iconClass: 'n0',
                            text: DIALOG_MESSAGES.keypad.buttons.n0
                        },
                        {
                            value: '.',
                            iconClass: 'stop',
                            text: DIALOG_MESSAGES.keypad.buttons.stop
                        },
                        {
                            value: 'x',
                            iconClass: 'x',
                            text: DIALOG_MESSAGES.keypad.buttons.x
                        },
                        {
                            value: 'y',
                            iconClass: 'y',
                            text: DIALOG_MESSAGES.keypad.buttons.y
                        },
                        {
                            value: 'z',
                            iconClass: 'z',
                            text: DIALOG_MESSAGES.keypad.buttons.z
                        },
                        {
                            value: '\\pi',
                            iconClass: 'pi',
                            text: DIALOG_MESSAGES.keypad.buttons.pi
                        },
                        {
                            value: '\\infty',
                            iconClass: 'infty',
                            text: DIALOG_MESSAGES.keypad.buttons.infty
                        },
                        {
                            value: ' ',
                            iconClass: 'space',
                            text: DIALOG_MESSAGES.keypad.buttons.space
                        }
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarKeyPadCommand',
                    options: {
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.mathinput.dialogs.register('keypad', KeyPadDialog);

        /**
         * BasicDialog
         */
        var BasicDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.basic.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.basic.buttons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarBasicCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('basic', BasicDialog);

        /**
         * LowerGreekDialog
         */
        var LowerGreekDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.lowergreek.title,
                    buttons: [
                        {
                            value: '\\alpha',
                            iconClass: 'alpha',
                            text: messages.lowergreek.buttons.alpha
                        },
                        {
                            value: '\\beta',
                            iconClass: 'beta',
                            text: messages.lowergreek.buttons.beta
                        },
                        {
                            value: '\\gamma',
                            iconClass: 'gamma',
                            text: messages.lowergreek.buttons.gamma
                        },
                        {
                            value: '\\delta',
                            iconClass: 'delta',
                            text: messages.lowergreek.buttons.delta
                        },
                        {
                            value: '\\epsilon',
                            iconClass: 'epsilon',
                            text: messages.lowergreek.buttons.epsilon
                        },
                        {
                            value: '\\zeta',
                            iconClass: 'zeta',
                            text: messages.lowergreek.buttons.zeta
                        },
                        {
                            value: '\\eta',
                            iconClass: 'eta',
                            text: messages.lowergreek.buttons.eta
                        },
                        {
                            value: '\\theta',
                            iconClass: 'theta',
                            text: messages.lowergreek.buttons.theta
                        },
                        {
                            value: '\\iota',
                            iconClass: 'iota',
                            text: messages.lowergreek.buttons.iota
                        },
                        {
                            value: '\\kappa',
                            iconClass: 'kappa',
                            text: messages.lowergreek.buttons.kappa
                        },
                        {
                            value: '\\lambda',
                            iconClass: 'lambda',
                            text: messages.lowergreek.buttons.lambda
                        },
                        {
                            value: '\\mu',
                            iconClass: 'mu',
                            text: messages.lowergreek.buttons.mu
                        },
                        {
                            value: '\\nu',
                            iconClass: 'nu',
                            text: messages.lowergreek.buttons.nu
                        },
                        {
                            value: '\\xi',
                            iconClass: 'xi',
                            text: messages.lowergreek.buttons.xi
                        },
                        {
                            value: '\\omicron',
                            iconClass: 'omicron',
                            text: messages.lowergreek.buttons.omicron
                        },
                        {
                            value: '\\pi',
                            iconClass: 'pi',
                            text: messages.lowergreek.buttons.pi
                        },
                        {
                            value: '\\rho',
                            iconClass: 'rho',
                            text: messages.lowergreek.buttons.rho
                        },
                        {
                            value: '\\sigma',
                            iconClass: 'sigma',
                            text: messages.lowergreek.buttons.sigma
                        },
                        {
                            value: '\\tau',
                            iconClass: 'tau',
                            text: messages.lowergreek.buttons.tau
                        },
                        {
                            value: '\\upsilon',
                            iconClass: 'upsilon',
                            text: messages.lowergreek.buttons.upsilon
                        },
                        {
                            value: '\\phi',
                            iconClass: 'phi',
                            text: messages.lowergreek.buttons.phi
                        },
                        {
                            value: '\\chi',
                            iconClass: 'chi',
                            text: messages.lowergreek.buttons.chi
                        },
                        {
                            value: '\\psi',
                            iconClass: 'psi',
                            text: messages.lowergreek.buttons.psi
                        },
                        {
                            value: '\\omega',
                            iconClass: 'omega',
                            text: messages.lowergreek.buttons.omega
                        }
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarLowerGreekCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('lowergreek', LowerGreekDialog);

        /**
         * UpperGreekDialog
         */
        var UpperGreekDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.uppergreek.title,
                    buttons: [
                        /*
                        {
                            value: '\\Alpha',
                            iconClass: 'alpha-maj',
                            text: messages.uppergreek.buttons.alpha
                        },
                        {
                            value: '\\Beta',
                            iconClass: 'beta-maj',
                            text: messages.uppergreek.buttons.beta
                        },
                        */
                        {
                            value: '\\Gamma',
                            iconClass: 'gamma-maj',
                            text: messages.uppergreek.buttons.gamma
                        },
                        {
                            value: '\\Delta',
                            iconClass: 'delta-maj',
                            text: messages.uppergreek.buttons.delta
                        },
                        /*
                        {
                            value: '\\Epsilon',
                            iconClass: 'epsilon-maj',
                            text: messages.uppergreek.buttons.epsilon
                        },
                        {
                            value: '\\Zeta',
                            iconClass: 'zeta-maj',
                            text: messages.uppergreek.buttons.zeta
                        },
                        {
                            value: '\\Eta',
                            iconClass: 'eta-maj',
                            text: messages.uppergreek.buttons.eta
                        },
                        */
                        {
                            value: '\\Theta',
                            iconClass: 'theta-maj',
                            text: messages.uppergreek.buttons.theta
                        },
                        /*
                        {
                            value: '\\Iota',
                            iconClass: 'iota-maj',
                            text: messages.uppergreek.buttons.iota
                        },
                        {
                            value: '\\Kappa',
                            iconClass: 'kappa-maj',
                            text: messages.uppergreek.buttons.kappa
                        },
                        */
                        {
                            value: '\\Lambda',
                            iconClass: 'lambda-maj',
                            text: messages.uppergreek.buttons.lambda
                        },
                        /*
                        {
                            value: '\\Mu',
                            iconClass: 'mu-maj',
                            text: messages.uppergreek.buttons.mu
                        },
                        {
                            value: '\\Nu',
                            iconClass: 'nu-maj',
                            text: messages.uppergreek.buttons.nu
                        },
                        */
                        {
                            value: '\\Xi',
                            iconClass: 'xi-maj',
                            text: messages.uppergreek.buttons.xi
                        },
                        /*
                        {
                            value: '\\Omicron',
                            iconClass: 'omicron-maj',
                            text: messages.uppergreek.buttons.omicron
                        },
                        */
                        {
                            value: '\\Pi',
                            iconClass: 'pi-maj',
                            text: messages.uppergreek.buttons.pi
                        },
                        /*
                        {
                            value: '\\Rho',
                            iconClass: 'rho-maj',
                            text: messages.uppergreek.buttons.rho
                        },
                        */
                        {
                            value: '\\Sigma',
                            iconClass: 'sigma-maj',
                            text: messages.uppergreek.buttons.sigma
                        },
                        /*
                        {
                            value: '\\Tau',
                            iconClass: 'tau-maj',
                            text: messages.uppergreek.buttons.tau
                        },
                        */
                        {
                            value: '\\Upsilon',
                            iconClass: 'upsilon-maj',
                            text: messages.uppergreek.buttons.upsilon
                        },
                        {
                            value: '\\Phi',
                            iconClass: 'phi-maj',
                            text: messages.uppergreek.buttons.phi
                        },
                        /*
                        {
                            value: '\\Chi',
                            iconClass: 'chi-maj',
                            text: messages.uppergreek.buttons.chi
                        },
                        */
                        {
                            value: '\\Psi',
                            iconClass: 'psi-maj',
                            text: messages.uppergreek.buttons.psi
                        },
                        {
                            value: '\\Omega',
                            iconClass: 'omega-maj',
                            text: messages.uppergreek.buttons.omega
                        }
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarUpperGreekCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('uppergreek', UpperGreekDialog);

        /**
         * OperatorDialog
         */
        var OperatorDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.operator.title,
                    buttons: [
                        {
                            value: '=',
                            iconClass: 'equal',
                            text: DIALOG_MESSAGES.operator.buttons.equal
                        },
                        {
                            value: '+',
                            iconClass: 'plus',
                            text: DIALOG_MESSAGES.operator.buttons.plus
                        },
                        {
                            value: '-',
                            iconClass: 'minus',
                            text: DIALOG_MESSAGES.operator.buttons.minus
                        },
                        {
                            value: '\\cdot',
                            iconClass: 'cdot',
                            text: DIALOG_MESSAGES.operator.buttons.cdot
                        },
                        {
                            value: '\\times',
                            iconClass: 'times',
                            text: DIALOG_MESSAGES.operator.buttons.times
                        },
                        {
                            value: '\\div',
                            iconClass: 'div',
                            text: DIALOG_MESSAGES.operator.buttons.div
                        },
                        {
                            value: '<',
                            iconClass: 'lt',
                            text: DIALOG_MESSAGES.operator.buttons.lt
                        },
                        {
                            value: '\\le',
                            iconClass: 'le',
                            text: DIALOG_MESSAGES.operator.buttons.le
                        },
                        {
                            value: '>',
                            iconClass: 'gt',
                            text: DIALOG_MESSAGES.operator.buttons.gt
                        },
                        {
                            value: '\\ge',
                            iconClass: 'ge',
                            text: DIALOG_MESSAGES.operator.buttons.ge
                        },
                        {
                            value: '\\neq',
                            iconClass: 'neq',
                            text: DIALOG_MESSAGES.operator.buttons.neq
                        },
                        {
                            value: '\\approx',
                            iconClass: 'approx',
                            text: DIALOG_MESSAGES.operator.buttons.approx
                        },
                        {
                            value: '\\propto',
                            iconClass: 'propto',
                            text: DIALOG_MESSAGES.operator.buttons.propto
                        },
                        {
                            value: '\\pm',
                            iconClass: 'plusminus',
                            text: DIALOG_MESSAGES.operator.buttons.plusminus
                        },
                        {
                            value: '%',
                            iconClass: 'percent',
                            text: DIALOG_MESSAGES.operator.buttons.percent
                        },
                        {
                            value: '!',
                            iconClass: 'factorial',
                            text: DIALOG_MESSAGES.operator.buttons.factorial
                        },
                        {
                            value: '\\wedge', // also '\\and',
                            iconClass: 'and',
                            text: DIALOG_MESSAGES.operator.buttons.and
                        },
                        {
                            value: '\\vee',// also '\\or',
                            iconClass: 'or',
                            text: DIALOG_MESSAGES.operator.buttons.or
                        },
                        {
                            value: '\\circ',
                            iconClass: 'circ',
                            text: DIALOG_MESSAGES.operator.buttons.circ
                        },
                        {
                            value: '\\nabla',
                            iconClass: 'nabla',
                            text: DIALOG_MESSAGES.operator.buttons.nabla
                        }
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarOperatorCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('operator', OperatorDialog);

        /**
         * ExpressionDialog
         */
        var ExpressionDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.expression || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.expression.buttons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarExpressionCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('expression', ExpressionDialog);

        /**
         * GroupDialog
         */
        var GroupDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.group || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.group.buttons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarGroupCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('group', GroupDialog);

        /**
         * MatrixDialog
         */
        var MatrixDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.matrix || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.matrix.buttons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarMatrixCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('matrix', MatrixDialog);

        /**
         * StatisticsDialog
         */
        var StatisticsDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.statistics || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.statistics.buttons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarStatisticsCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('statistics', StatisticsDialog);

        /**
         * ChemistryDialog
         */
        var ChemistryDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.chemistry || DIALOG_MESSAGES; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.chemistry.buttons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    // template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    template: '<a title=\'#=text#\' data-value=\'#=value#\'><span class=\'k-icon k-i-#=iconClass#\'></span></a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarChemistryCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('chemistry', ChemistryDialog);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
