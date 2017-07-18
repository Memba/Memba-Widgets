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
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.popup',
        './vendor/kendo/kendo.slider',
        './vendor/kendo/kendo.button',
        './vendor/kendo/kendo.colorpicker',
        './vendor/kendo/kendo.combobox',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.toolbar',
        './vendor/kendo/kendo.window'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.markeditor.toolbar');
        var kendo = window.kendo;
        var deepExtend = kendo.deepExtend;
        var isFunction = kendo.isFunction;
        var DataSource = kendo.data.DataSource;
        var ToolBar = kendo.ui.ToolBar;
        var StaticList = kendo.ui.StaticList;
        kendo.markeditor = { messages: {}};
        var TOOLBAR = [
            'undo',
            'redo',
            'headings',
            'bold',
            'italic',
            'bulleted',
            'numbered',
            'blockquote',
            'hrule',
            'link',
            'image',
            'code',
            'latex',
            // 'symbols',
            // 'emoji',
            'window'
        ];

        /*********************************************************************************
         * MarkEditorToolBar Widget
         *********************************************************************************/

        var toolDefaults = {
            separator: { type: 'separator' },
            undo: {
                type: 'button',
                command: 'ToolbarUndoCommand',
                iconClass: 'undo'
            },
            redo: {
                type: 'button',
                command: 'ToolbarRedoCommand',
                iconClass: 'redo'
            },
            headings: {
                type: 'markHeadings',
                iconClass: 'font-size'
            },
            bold: {
                type: 'button',
                command: 'ToolbarBoldCommand',
                iconClass: 'bold'
            },
            italic: {
                type: 'button',
                command: 'ToolbarItalicCommand',
                iconClass: 'italic'
            },
            bulleted: {
                type: 'button',
                command: 'ToolbarBulletedCommand',
                iconClass: 'list-bulleted'
                // group: 'list',
                // togglable: true
            },
            numbered: {
                type: 'button',
                command: 'ToolbarNumberedCommand',
                iconClass: 'list-numbered'
                // group: 'list',
                // togglable: true
            },
            blockquote: {
                type: 'button',
                command: 'ToolbarBlockquoteCommand',
                iconClass: 'insert-middle'
            },
            hrule: {
                type: 'button',
                command: 'ToolbarHruleCommand',
                iconClass: 'rule-horizontal'
            },
            link: {
                type: 'markDialog',
                dialogName: 'markLink',
                iconClass: 'hyperlink',
                // if commented, kendo.ui.ToolBar raises `component.overflow is not a constructor`
                // because kendo.toolbar.registerComponent('markDialog', kendo.toolbar.ToolBarButton.extend({...}));
                // does not register an overflow button - see spreadsheet toolbar
                overflow: 'never',
                text: false
            },
            image: {
                type: 'markDialog',
                dialogName: 'markImage',
                iconClass: 'image-insert',
                // See comment above
                overflow: 'never',
                text: false
            },
            code: {
                type: 'button',
                command: 'ToolbarCodeCommand',
                iconClass: 'js'
            },
            latex: {
                type: 'button',
                command: 'ToolbarLatexCommand',
                iconClass: 'formula-fx' // 'sum'
            },
            // symbols ????
            // emojis,
            window: {
                type: 'button',
                command: 'ToolbarWindowCommand',
                iconClass: 'window-maximize'
            }
        };
        var TOOLBAR_MESSAGES = kendo.markeditor.messages.toolbar = {
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
            window: 'Open in New Window'
        };

        /**
         * MarkEditorToolBar
         */
        var MarkEditorToolBar = ToolBar.extend({

            /**
             * Initialization
             * @param element
             * @param options
             */
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || MarkEditorToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar kj-markeditor-toolbar');
                this._addSeparators(this.element);
                this.bind({
                    click: handleClick,
                    toggle: handleClick
                });
                logger.info({ method: 'init', message: 'widget initialized' });
            },

            /**
             * Add separators
             * @param element
             * @private
             */
            _addSeparators: function (element) {
                var groups = element.children('.k-widget, a.k-button, .k-button-group');
                groups.before('<span class=\'k-separator\' />');
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Layout the toolbar
             * @param tools
             * @private
             */
            _expandTools: function (tools) {
                function expandTool(toolName) {
                    var options = $.isPlainObject(toolName) ? toolName : toolDefaults[toolName] || {};
                    var spriteCssClass = 'k-icon k-i-' + options.iconClass;
                    var type = options.type;
                    var typeDefaults = {
                        button: { showText: 'overflow' },
                        /*
                        splitButton: { spriteCssClass: spriteCssClass },
                        colorPicker: {
                            toolIcon: spriteCssClass,
                            spriteCssClass: spriteCssClass
                        }*/
                        headings: { spriteCssClass: spriteCssClass }
                    };
                    var tool = $.extend({
                        name: options.name || toolName,
                        text: TOOLBAR_MESSAGES[options.name || toolName],
                        icon: options.iconClass,
                        spriteCssClass: spriteCssClass,
                        attributes: {
                            title: TOOLBAR_MESSAGES[options.name || toolName],
                            'aria-label': TOOLBAR_MESSAGES[options.name || toolName]
                        }
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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Click event handler
             * @param e
             * @private
             */
            _click: function (e) {
                var toolName = e.target.attr(kendo.attr('tool'));
                var tool = toolDefaults[toolName] || {};
                var commandType = tool.command;
                if (!commandType) {
                    return;
                }
                var args = {
                    command: commandType,
                    params: {
                        property: tool.property || null,
                        value: tool.value || null,
                        options: tool.options || {}
                    }
                };
                if (typeof args.params.value === 'boolean') {
                    args.params.value = e.checked ? true : null;
                }
                this.action(args);
            },

            /* jshint +W074 */

            /**
             * Events
             */
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

            /**
             * Options
             */
            options: {
                name: 'MarkEditorToolBar',
                resizable: true,
                tools: TOOLBAR
            },

            /**
             *
             * @param args
             */
            action: function (args) {
                this.trigger('action', args);
            },

            /**
             *
             * @param args
             */
            dialog: function (args) {
                this.trigger('dialog', args);
            },

            /**
             * Refresh the toolbar on a new selection
             * @param selected
             */
            /*
            refresh: function (selection) {
                if ($.isArray(selected) && selected.length !== 1) {
                    // For now, we disable fill and stroke buttons on multiple selections
                    // TODO: Disable toolbar options
                    return;
                }
                selected = selected[0];
                var that = this;
                var tools = that._tools();
                function toggle(tool, value) {
                    var toolbarItem = tool.toolbar;
                    var overflowItem = tool.overflow;
                    var togglable = toolbarItem && toolbarItem.options.togglable || overflowItem && overflowItem.options.togglable;
                    if (!togglable) {
                        return;
                    }
                    var toggle = false;
                    if (typeof value === 'boolean') {
                        toggle = value;
                    } else if (typeof value === 'string') {
                        toggle = toolbarItem.options.value === value;
                    }
                    that._configuration[toolbarItem.options.name] = toggle;
                    toolbarItem.toggle(toggle);
                    if (overflowItem) {
                        overflowItem.toggle(toggle);
                    }
                }
                function update(tool, value) {
                    var toolbarItem = tool.toolbar;
                    var overflowItem = tool.overflow;
                    if (toolbarItem && toolbarItem.update) {
                        that._configuration[toolbarItem.options.name] = value;
                        toolbarItem.update(value);
                    }
                    if (overflowItem && overflowItem.update) {
                        overflowItem.update(value);
                    }
                }
                function enable(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    if (toolbar && toolbar.enable) {
                        toolbar.enable(value);
                        // TODO: not sufficient, popups drop down
                    }
                    if (overflow && overflow.enable) {
                        overflow.enable(value);
                    }
                }
                for (var i = 0; i < tools.length; i++) {
                    var property = tools[i].property;
                    var tool = tools[i].tool;
                    if (property === 'background') {
                        continue;
                    }
                    // This is what the SpreadSheetToolbar does and we can do it thanks to our DiagramElementMixIn
                    var value = isFunction(selected[property]) ? selected[property]() : selected;
                    if (tool.type === 'button') {
                        toggle(tool, value);
                    } else {
                        update(tool, value);
                    }
                    var features = isFunction(selected.features) && selected.features();
                    enable(tool, features && features[property]);
                }
            },
            */

            /**
             * List tools
             * @private
             */
            _tools: function () {
                return this.element.find('[' + kendo.attr('property') + ']').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr('data-property'),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },

            /**
             * Destroy
             */
            destroy: function () {
                this._destroyFileInput();
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
        kendo.ui.plugin(MarkEditorToolBar);

        /*********************************************************************************
         * MarkEditorToolBar Tools
         *********************************************************************************/

        var DropDownTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var dropDownList = $('<select />').attr('title', options.attributes.title).attr('aria-label', options.attributes.title).kendoDropDownList({ height: 'auto' }).data('kendoDropDownList');
                this.dropDownList = dropDownList;
                this.element = dropDownList.wrapper;
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                dropDownList.bind('open', this._open.bind(this));
                dropDownList.bind('change', this._change.bind(this));
                this.element.width(options.width).attr({
                    'data-command': 'PropertyChangeCommand',
                    'data-property': options.property
                });
            },
            _open: function (e) {
                // Note: testing k-state-disabled is not part of the original DropDownTool from SpreadsheetToolbar
                if (this.element.hasClass('k-state-disabled')) {
                    e.preventDefault();
                    return false;
                }
                var ddl = this.dropDownList;
                var list = ddl.list;
                var listWidth;
                list.css({
                    whiteSpace: 'nowrap',
                    width: 'auto'
                });
                listWidth = list.width();
                if (listWidth) {
                    listWidth += 20;
                } else {
                    listWidth = ddl._listWidth;
                }
                list.css('width', listWidth + kendo.support.scrollbar());
                ddl._listWidth = listWidth;
            },
            _change: function (e) {
                var instance = e.sender;
                var value = instance.value();
                var dataItem = instance.dataItem();
                var popupName = dataItem ? dataItem.popup : undefined;
                if (popupName) {
                    this.toolbar.dialog({ name: popupName });
                } else {
                    this.toolbar.action({
                        command: 'PropertyChangeCommand',
                        params: {
                            property: this.options.property,
                            value: value === 'null' ? null : value
                        }
                    });
                }
            },
            value: function (value) {
                if (value !== undefined) {
                    this.dropDownList.value(value);
                } else {
                    return this.dropDownList.value();
                }
            }
        });
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
            open: function (e) {
                e.preventDefault();
                // Note: testing k-state-disabled is not part of the original DropDownTool from SpreadsheetToolbar
                if (!this.element.hasClass('k-state-disabled')) {
                    this.popup.toggle();
                }
            },
            _popup: function () {
                var element = this.element;
                this.popup = $('<div class=\'k-spreadsheet-popup kj-markeditor-popup\' />')
                .appendTo(element)
                .kendoPopup({ anchor: element }).data('kendoPopup');
            }
        });
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
         * Headings
         */
        var HeadingsTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.element.attr({ 'data-property': 'headings' });
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'markHeadings',
                    markHeadings: this,
                    instance: this
                });
            },
            buttons: [
                {
                    property: 'headings',
                    value: '#',
                    iconClass: 'h1',
                    text: TOOLBAR_MESSAGES.headingsButtons.h1
                },
                {
                    property: 'headings',
                    value: '##',
                    iconClass: 'h2',
                    text: TOOLBAR_MESSAGES.headingsButtons.h2
                },
                {
                    property: 'headings',
                    value: '###',
                    iconClass: 'h3',
                    text: TOOLBAR_MESSAGES.headingsButtons.h3
                },
                {
                    property: 'headings',
                    value: '####',
                    iconClass: 'h4',
                    text: TOOLBAR_MESSAGES.headingsButtons.h4
                },
                {
                    property: 'headings',
                    value: '#####',
                    iconClass: 'h5',
                    text: TOOLBAR_MESSAGES.headingsButtons.h5
                },
                {
                    property: 'headings',
                    value: '######',
                    iconClass: 'h6',
                    text: TOOLBAR_MESSAGES.headingsButtons.h6
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            update: function (selected) {
                var headings = selected && selected.options && selected.options.startCap && selected.options.startCap.type;
                var element = this.popup.element;
                element.find('.k-button').removeClass('k-state-active');
                if (headings) {
                    element.find('[data-property=headings][data-value=' + headings + ']').addClass('k-state-active');
                }
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-property=\'' + options.property + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var property = button.attr('data-property');
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarHeadingsCommand',
                    params: {
                        property: property,
                        value: value
                    }
                });
            }
        });
        var HeadingsButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'markHeadings' });
            }
        });
        kendo.toolbar.registerComponent('markHeadings', HeadingsTool, HeadingsButton);

        /*********************************************************************************
         * MarkEditorToolBar Dialogs
         *********************************************************************************/

        var DIALOG_MESSAGES = kendo.markeditor.messages.dialogs = {
            cancel: 'Cancel',
            okText: 'OK',
            headingsDialog: {
                title: 'Headings',
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
                    url: 'Url' // TODO + inline/display
                }
            }
        };

        /**
         * Dialog registry
         * @type {{}}
         */
        var registry = {};
        kendo.markeditor.dialogs = {
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
         * Generic dialog registration with toolbar
         */
        kendo.toolbar.registerComponent('markDialog', kendo.toolbar.ToolBarButton.extend({
            init: function (options, toolbar) {
                kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
                this._dialogName = options.dialogName;
                this.element.bind('click touchend', this.open.bind(this)).data('instance', this);
            },
            open: function () {
                this.toolbar.dialog({ name: this._dialogName });
            }
        }));

        /**
         * MarkEditorDialog base class
         */
        var MarkEditorDialog = kendo.markeditor.MarkEditorDialog = kendo.Observable.extend({
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
                    // this._dialog = $('<div class=\'k-spreadsheet-window k-action-window k-popup-edit-form\' />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
                    this._dialog = $('<div class=\'k-spreadsheet-window k-action-window kj-markeditor-window\' />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
                        messages: kendo.markeditor.messages.dialogs || DIALOG_MESSAGES,
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
         * Headings
         */
        var HeadingsDialog = MarkEditorDialog.extend({
            init: function (options) {
                var messages = kendo.markeditor.messages.dialogs.headingsDialog || DIALOG_MESSAGES;
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            property: 'headings',
                            value: '#',
                            iconClass: 'h1',
                            text: messages.buttons.h1
                        },
                        {
                            property: 'headings',
                            value: '##',
                            iconClass: 'h2',
                            text: messages.buttons.h2
                        },
                        {
                            property: 'headings',
                            value: '###',
                            iconClass: 'h3',
                            text: messages.buttons.h3
                        },
                        {
                            property: 'headings',
                            value: '####',
                            iconClass: 'h4',
                            text: messages.buttons.h4
                        },
                        {
                            property: 'headings',
                            value: '#####',
                            iconClass: 'h5',
                            text: messages.buttons.h5
                        },
                        {
                            property: 'headings',
                            value: '######',
                            iconClass: 'h6',
                            text: messages.buttons.h6
                        }
                    ]
                };
                MarkEditorDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new StaticList(ul, {
                    dataSource: new DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-icon k-i-#=iconClass#\'></span>#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                if (!dataItem) {
                    $.noop(); // TODO
                    // debugger;
                }
                MarkEditorDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'PropertyChangeCommand',
                    params: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.markeditor.dialogs.register('markHeadings', HeadingsDialog);

        /**
         * Link
         */
        var LinkDialog = MarkEditorDialog.extend({
            options: {
                template: '<div class=\'k-edit-label\'><label>#: messages.linkDialog.labels.text #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.linkDialog.title,
                autoFocus: false
            },
            open: function (url) {
                var self = this;
                MarkEditorDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    url: '',
                    apply: function () {
                        if (!/\S/.test(model.url)) {
                            model.url = null;
                        }
                        self.trigger('action', {
                            command: 'ToolbarLinkCommand',
                            params: {
                                property: 'link',
                                value: model.url
                            }
                        });
                        self.close();
                    },
                    cancel: self.close.bind(self)
                });
                kendo.bind(element, model);
                element.find('input').focus().on('keydown', function (ev) {
                    if (ev.keyCode === 13) {
                        model.text = $(this).val();
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.apply();
                    } else if (ev.keyCode === 27) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.cancel();
                    }
                });
            }
        });
        kendo.markeditor.dialogs.register('markLink', LinkDialog);

        /**
         * Image
         */
        var ImageDialog = MarkEditorDialog.extend({
            options: {
                template: '<div class=\'k-edit-label\'><label>#: messages.imageDialog.labels.url #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.imageDialog.title,
                autoFocus: false
            },
            open: function (url) {
                var self = this;
                MarkEditorDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    url: '',
                    // url: 'http://localhost:63342/Kidoju.Widgets/test/data/images/miscellaneous/Elvis.jpg',
                    apply: function () {
                        if (!/\S/.test(model.url)) {
                            model.url = null;
                        }
                        self.trigger('action', {
                            command: 'ToolbarImageCommand',
                            params: {
                                property: 'image',
                                value: model.url
                            }
                        });
                        self.close();
                    },
                    cancel: self.close.bind(self)
                });
                kendo.bind(element, model);
                element.find('input').focus().on('keydown', function (ev) {
                    if (ev.keyCode === 13) {
                        model.url = $(this).val();
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.apply();
                    } else if (ev.keyCode === 27) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.cancel();
                    }
                });
            }
        });
        kendo.markeditor.dialogs.register('markImage', ImageDialog);

        /**
         * Latex
         */
        var LatexDialog = MarkEditorDialog.extend({
            options: {
                template: '<div class=\'k-edit-label\'><label>#: messages.latexDialog.labels.url #:</label></div>' + '<div class=\'k-edit-field\'><input class=\'k-textbox\' data-bind=\'value: url\' /></div>' + '<div class=\'k-action-buttons\'>' + ('<button class=\'k-button k-primary\' data-bind=\'click: apply\'>#= messages.okText #</button>' + '<button class=\'k-button\' data-bind=\'click: cancel\'>#= messages.cancel #</button>') + '</div>',
                title: DIALOG_MESSAGES.latexDialog.title,
                autoFocus: false
            },
            open: function (url) { // TODO: url especially for edit mode
                var self = this;
                MarkEditorDialog.fn.open.apply(self, arguments);
                var element = self.dialog().element;
                var model = kendo.observable({
                    url: 'https://cdn.kidoju.com/s/en/570cc7f46d1dd91900729417/image.png',
                    // url: 'http://localhost:63342/Kidoju.Widgets/test/data/images/miscellaneous/Elvis.jpg',
                    apply: function () {
                        if (!/\S/.test(model.url)) {
                            model.url = null;
                        }
                        self.trigger('action', {
                            command: 'DrawingToolChangeCommand',
                            params: {
                                property: 'tool',
                                value: 'ShapeTool',
                                options: {
                                    type: 'image',
                                    source: model.url
                                }
                            }
                        });
                        self.close();
                    },
                    cancel: self.close.bind(self)
                });
                kendo.bind(element, model);
                element.find('input').focus().on('keydown', function (ev) {
                    if (ev.keyCode === 13) {
                        model.url = $(this).val();
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.apply();
                    } else if (ev.keyCode === 27) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        model.cancel();
                    }
                });
            }
        });
        kendo.markeditor.dialogs.register('markLatex', LatexDialog);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
