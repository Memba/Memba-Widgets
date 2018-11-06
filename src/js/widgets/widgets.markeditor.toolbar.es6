/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO fix commands
// TODO add solution$() and value$(), and random numbers....

// TODO i18n issues - https://github.com/kidoju/Kidoju-Widgets/issues/203
// TODO add tables to toolbar - https://github.com/kidoju/Kidoju-Widgets/issues/204
// TODO twemoji selector - https://github.com/kidoju/Kidoju-Widgets/issues/205
// TODO Insert a video - https://github.com/kidoju/Kidoju-Widgets/issues/208

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.list';
import 'kendo.splitter';
import 'kendo.toolbar';
// import 'kendo.validator';
import 'kendo.popup';
import 'kendo.window';
import assert from '../common/window.assert.es6';
// import CONSTANTS from '../common/window.constants.es6';
// import Logger from '../common/window.logger.es6';
import './widgets.markdown.es6';
// import './widgets.markeditor.es6'; // <-- cyclical dependency
// import './widgets.mathinput.es6'; // <-- TODO

// Extend kendo with our own namespace
window.kendo.extensions = window.kendo.extensions || {};
window.kendo.extensions.markeditor = { messages: {} };

const {
    attr,
    bind,
    data: { DataSource },
    extensions: { markeditor },
    observable,
    Observable,
    resize,
    roleSelector,
    template,
    toolbar,
    ui,
    ui: {
        // Note: we cannot value MarkEditor here, because it is only registered
        // as a Kendo UI plugin after loading widgets.markedior.toolbar.es6
        // MarkEditor,
        plugin,
        StaticList,
        ToolBar,
        Window
    }
} = window.kendo;
const logger = new window.Logger('widgets.markeditor.toolbar');
const NO_PADDING_CLASS = 'kj-no-padding';
const TOOLBAR = [
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
    'preview'
];

/** *******************************************************************************
 * MarkEditorToolBar
 ******************************************************************************** */

const toolDefaults = {
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
        // because toolbar.registerComponent('markDialog', toolbar.ToolBarButton.extend({...}));
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
        type: 'markDialog',
        dialogName: 'markLatex',
        iconClass: 'formula-fx', // 'sum'
        // See comment above
        overflow: 'never',
        text: false
    },
    preview: {
        type: 'markDialog',
        dialogName: 'markPreview',
        iconClass: 'window-maximize',
        // See comment above
        overflow: 'never',
        text: false
    }
};
const TOOLBAR_MESSAGES = {
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
};
markeditor.messages.toolbar = TOOLBAR_MESSAGES;

/**
 * MarkEditorToolBar
 */
const MarkEditorToolBar = ToolBar.extend({
    /**
     * Initialization
     * @param element
     * @param options
     */
    init(element, options) {
        options = options || {};
        options.items = this._expandTools(
            options.tools || MarkEditorToolBar.prototype.options.tools
        );
        ToolBar.fn.init.call(this, element, options);
        const handleClick = this._click.bind(this);
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
    _addSeparators(element) {
        const groups = element.children(
            '.k-widget, a.k-button, .k-button-group'
        );
        groups.before('<span class="k-separator" />');
    },

    /**
     * Layout the toolbar
     * @param tools
     * @private
     */
    _expandTools(tools) {
        function expandTool(toolName) {
            const options = $.isPlainObject(toolName)
                ? toolName
                : toolDefaults[toolName] || {};
            const spriteCssClass = `k-icon k-i-${options.iconClass}`;
            const { type } = options;
            const typeDefaults = {
                button: { showText: 'overflow' },
                /*
                        splitButton: { spriteCssClass: spriteCssClass },
                        colorPicker: {
                            toolIcon: spriteCssClass,
                            spriteCssClass: spriteCssClass
                        } */
                headings: { spriteCssClass }
            };
            const tool = $.extend(
                {
                    name: options.name || toolName,
                    text: TOOLBAR_MESSAGES[options.name || toolName],
                    icon: options.iconClass,
                    spriteCssClass,
                    attributes: {
                        title: TOOLBAR_MESSAGES[options.name || toolName],
                        'aria-label': TOOLBAR_MESSAGES[options.name || toolName]
                    }
                },
                typeDefaults[type],
                options
            );
            if (type === 'splitButton') {
                tool.menuButtons = tool.menuButtons.map(expandTool);
            }
            tool.attributes[attr('tool')] = toolName;
            if (options.property) {
                tool.attributes[attr('property')] = options.property;
            }
            return tool;
        }
        return tools.reduce(function(all, tool) {
            if ($.isArray(tool)) {
                all.push({
                    type: 'buttonGroup',
                    buttons: tool.map(expandTool)
                });
            } else {
                all.push(expandTool.call(this, tool));
            }
            return all;
        }, []);
    },

    /**
     * Click event handler
     * @param e
     * @private
     */
    _click(e) {
        const toolName = e.target.attr(attr('tool'));
        const tool = toolDefaults[toolName] || {};
        const commandType = tool.command;
        if (!commandType) {
            return;
        }
        const args = {
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
    action(args) {
        this.trigger('action', args);
    },

    /**
     *
     * @param args
     */
    dialog(args) {
        this.trigger('dialog', args);
    },

    /**
     * Refresh
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
    _tools() {
        return this.element
            .find(`[${attr('property')}]`)
            .toArray()
            .map(element => {
                const el = $(element);
                return {
                    property: el.attr('data-property'),
                    tool: this._getItem(el)
                };
            });
    },

    /**
     * Destroy
     */
    destroy() {
        this.element.find('[data-command],.k-button').each((index, element) => {
            const instance = $(element).data('instance');
            if (instance && instance.destroy) {
                instance.destroy();
            }
        });
        ToolBar.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registrtation
 */
plugin(MarkEditorToolBar);

/** *******************************************************************************
 * MarkEditorToolBar Tools
 ******************************************************************************** */

/*
        var DropDownTool = toolbar.Item.extend({
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
        */
const PopupTool = toolbar.Item.extend({
    init(options, tb) {
        this.element = $(
            `${'<a href="#" class="k-button k-button-icon">' +
                '<span class="'}${options.spriteCssClass}">` +
                `</span><span class="k-icon k-i-arrow-60-down"></span>` +
                `</a>`
        );
        this.element
            .on('click touchend', this.open.bind(this))
            .attr('data-command', options.command);
        this.options = options;
        this.toolbar = tb;
        this.attributes();
        this.addUidAttr();
        this.addOverflowAttr();
        this._popup();
    },
    destroy() {
        this.popup.destroy();
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
    open(e) {
        e.preventDefault();
        // Note: testing k-state-disabled is not part of the original PopupTool from SpreadsheetToolbar
        if (!this.element.hasClass('k-state-disabled')) {
            this.popup.toggle();
        }
    },
    _popup() {
        const { element } = this;
        this.popup = $(
            '<div class="k-spreadsheet-popup kj-markeditor-popup" />'
        )
            .appendTo(element)
            .kendoPopup({ anchor: element })
            .data('kendoPopup');
    }
});

const OverflowDialogButton = toolbar.OverflowButton.extend({
    init(options, tb) {
        toolbar.OverflowButton.fn.init.call(this, options, tb);
        this.element.on('click touchend', this._click.bind(this));
        this.message = this.options.text;
        const instance = this.element.data('button');
        this.element.data(this.options.type, instance);
    },
    _click: $.noop
});

/**
 * Headings
 */
const HeadingsTool = PopupTool.extend({
    init(options, tb) {
        PopupTool.fn.init.call(this, options, tb);
        this.element.attr({ 'data-property': 'headings' });
        this._commandPalette();
        this.popup.element.on('click', '.k-button', e => {
            this._action($(e.currentTarget));
            this.popup.close();
        });
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
    destroy() {
        this.popup.element.off();
        PopupTool.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
    update(selected) {
        const headings =
            selected &&
            selected.options &&
            selected.options.startCap &&
            selected.options.startCap.type;
        const { element } = this.popup;
        element.find('.k-button').removeClass('k-state-active');
        if (headings) {
            element
                .find(`[data-property=headings][data-value=${headings}]`)
                .addClass('k-state-active');
        }
    },
    _commandPalette() {
        const { buttons } = this;
        const element = $('<div />').appendTo(this.popup.element);
        buttons.forEach((options, index) => {
            const button =
                `<a title="${options.text}" data-property="${
                    options.property
                }" data-value="${
                    options.value
                }" class="k-button k-button-icon">` +
                `<span class="k-icon k-i-${options.iconClass}"></span>` +
                `</a>`;
            if (
                index !== 0 &&
                buttons[index - 1].iconClass !== options.iconClass
            ) {
                element.append($('<span class="k-separator" />'));
            }
            element.append(button);
        });
    },
    _action(button) {
        const property = button.attr('data-property');
        const value = button.attr('data-value');
        this.toolbar.action({
            command: 'ToolbarHeadingsCommand',
            params: {
                property,
                value
            }
        });
    }
});
const HeadingsButton = OverflowDialogButton.extend({
    _click() {
        this.toolbar.dialog({ name: 'markHeadings' });
    }
});
toolbar.registerComponent('markHeadings', HeadingsTool, HeadingsButton);

/** *******************************************************************************
 * MarkEditorToolBar Dialogs
 ******************************************************************************** */

const DIALOG_MESSAGES = {
    cancel:
        '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel',
    okText:
        '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK',
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
            display: 'Display',
            inline: 'inline'
        }
    },
    previewDialog: {
        title: 'Preview'
    }
};
markeditor.messages.dialogs = DIALOG_MESSAGES;

/**
 * Dialog registry
 * @type {{}}
 */
const registry = {};
markeditor.dialogs = {
    register(name, dialogClass) {
        registry[name] = dialogClass;
    },
    registered(name) {
        return !!registry[name];
    },
    create(name, options) {
        const DialogClass = registry[name];
        let ret;
        if (DialogClass) {
            ret = new DialogClass(options);
        }
        return ret;
    }
};

/**
 * Generic dialog registration with toolbar
 */
toolbar.registerComponent(
    'markDialog',
    toolbar.ToolBarButton.extend({
        init(options, tb) {
            toolbar.ToolBarButton.fn.init.call(this, options, tb);
            this._dialogName = options.dialogName;
            this.element
                .bind('click touchend', this.open.bind(this))
                .data('instance', this);
        },
        open() {
            this.toolbar.dialog({ name: this._dialogName });
        }
    })
);

/**
 * MarkEditorDialog base class
 */
const MarkEditorDialog = Observable.extend({
    init(options) {
        Observable.fn.init.call(this, options);
        this.options = $.extend(true, {}, this.options, options);
        this.bind(this.events, options);
    },
    events: ['close', 'activate', 'deactivate', 'resize'],
    options: { autoFocus: true },
    dialog() {
        if (!this._dialog) {
            // this._dialog = $('<div class="k-spreadsheet-window k-action-window k-popup-edit-form" />').addClass(this.options.className || '').append(template(this.options.template)({
            this._dialog = $(
                '<div class="k-spreadsheet-window k-action-window kj-markeditor-window" />'
            )
                .addClass(this.options.className || '')
                .append(
                    template(this.options.template)({
                        messages:
                            markeditor.messages.dialogs || DIALOG_MESSAGES,
                        errors: this.options.errors
                    })
                )
                .appendTo(document.body)
                .kendoWindow({
                    actions: this.options.actions || ['Close'], // This was added for resizing PreviewDialog
                    autoFocus: this.options.autoFocus,
                    scrollable: false,
                    // resizable: false,
                    resizable: this.options.resizable || false, // This was added for resizing PreviewDialog
                    modal: true,
                    visible: false,
                    width: this.options.width || 320,
                    title: this.options.title,
                    open() {
                        const that = this;
                        // We need setTimeout otherwise PreviewDialog is not centered
                        setTimeout(() => {
                            that.center();
                            resize(
                                that.element
                                    .find(roleSelector('markeditortoolbar'))
                                    .parent()
                            );
                        }, 0);
                    },
                    close: this._onDialogClose.bind(this),
                    activate: this._onDialogActivate.bind(this),
                    deactivate: this._onDialogDeactivate.bind(this),
                    resize: this._onDialogResize.bind(this) // This was added for resizing PreviewDialog
                })
                .data('kendoWindow');
        }
        return this._dialog;
    },
    _onDialogClose() {
        this.trigger('close', { action: this._action });
    },
    _onDialogActivate() {
        this.trigger('activate');
    },
    _onDialogDeactivate() {
        this.trigger('deactivate');
        this.destroy();
    },
    _onDialogResize(e) {
        this._resizeDialog(e);
    },
    _resizeDialog: $.noop,
    destroy() {
        if (this._dialog) {
            this._dialog.destroy();
            this._dialog = null;
        }
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
    open() {
        this.dialog().open();
    },
    apply() {
        this.close();
    },
    close() {
        this._action = 'close';
        this.dialog().close();
    }
});
markeditor.MarkEditorDialog = MarkEditorDialog;

/**
 * Headings
 */
const HeadingsDialog = MarkEditorDialog.extend({
    init(options) {
        const messages =
            markeditor.messages.dialogs.headingsDialog || DIALOG_MESSAGES;
        const defaultOptions = {
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
    options: { template: '<ul class="k-list k-reset"></ul>' },
    _list() {
        const ul = this.dialog().element.find('ul');
        this.list = new StaticList(ul, {
            dataSource: new DataSource({ data: this.options.buttons }),
            template:
                '<a title="#=text#" data-property="#=property#" data-value="#=value#">' +
                '<span class="k-icon k-icon k-i-#=iconClass#"></span>#=text#' +
                '</a>',
            change: this.apply.bind(this)
        });
        this.list.dataSource.fetch();
    },
    apply(e) {
        const dataItem = e.sender.value()[0];
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
markeditor.dialogs.register('markHeadings', HeadingsDialog);

/**
 * Link
 */
const LinkDialog = MarkEditorDialog.extend({
    options: {
        template:
            '<div class="k-edit-label"><label>#: messages.linkDialog.labels.text #:</label></div>' +
            '<div class="k-edit-field"><input class="k-textbox" data-bind="value: url" /></div>' +
            '<div class="k-action-buttons">' +
            ('<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' +
                '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>') +
            '</div>',
        title: DIALOG_MESSAGES.linkDialog.title,
        autoFocus: false
    },
    open(...args) {
        const self = this;
        MarkEditorDialog.fn.open.apply(self, args);
        const { element } = self.dialog();
        const model = observable({
            // Note: markeditor.codeMirror knows the selection to possibly fill url
            url: '',
            apply() {
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
        bind(element, model);
        element
            .find('input')
            .focus()
            .on('keydown', function(ev) {
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
markeditor.dialogs.register('markLink', LinkDialog);

/**
 * Image
 */
const ImageDialog = MarkEditorDialog.extend({
    options: {
        template:
            '<div class="k-edit-label"><label>#: messages.imageDialog.labels.url #:</label></div>' +
            '<div class="k-edit-field"><input class="k-textbox" data-bind="value: url" /></div>' +
            '<div class="k-action-buttons">' +
            ('<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' +
                '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>') +
            '</div>',
        title: DIALOG_MESSAGES.imageDialog.title,
        autoFocus: false
    },
    open(...args) {
        const self = this;
        MarkEditorDialog.fn.open.apply(self, args);
        const { element } = self.dialog();
        const model = observable({
            // Note: markeditor.codeMirror knows the selection to possibly fill url
            url: '',
            apply() {
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
        bind(element, model);
        element
            .find('input')
            .focus()
            .on('keydown', function(ev) {
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
markeditor.dialogs.register('markImage', ImageDialog);

/**
 * Latex
 */
const LatexDialog = MarkEditorDialog.extend({
    options: {
        template:
            '<div data-role="mathinput" data-bind="value: latex" data-toolbar="{&quot;resizable&quot;:true,&quot;tools&quot;:[&quot;keypad&quot;,&quot;basic&quot;,&quot;greek&quot;,&quot;operators&quot;,&quot;expressions&quot;,&quot;sets&quot;,&quot;matrices&quot;,&quot;statistics&quot;]}"/></div>' +
            '<div class="k-edit-form-container">' +
            '<div class="k-edit-label">#: messages.latexDialog.labels.display #:</div>' +
            '<div class="k-edit-field"><input id="markeditor_latex_inline" type="checkbox" class="k-checkbox" data-bind="checked: inline"><label class="k-checkbox-label" for="markeditor_latex_inline">&nbsp;#: messages.latexDialog.labels.inline #</label></div>' +
            '</div>' +
            '<div class="k-action-buttons">' +
            ('<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' +
                '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>') +
            '</div>',
        title: DIALOG_MESSAGES.latexDialog.title,
        autoFocus: false,
        width: 480
    },
    open(...args) {
        const self = this;
        MarkEditorDialog.fn.open.apply(self, args);
        const { element } = self.dialog();
        const model = observable({
            // Note: markeditor.codeMirror knows the selection to possibly fill latex and inline
            latex: '',
            inline: true,
            apply() {
                if (!/\S/.test(model.latex)) {
                    model.latex = null;
                }
                self.trigger('action', {
                    command: 'ToolbarLatexCommand',
                    params: {
                        property: 'latex',
                        value: {
                            latex: model.latex,
                            inline: model.inline
                        }
                    }
                });
                self.close();
            },
            cancel: self.close.bind(self)
        });
        bind(element, model);
        resize(element);
        /*
                // TODO with mathinput instead of input
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
                */
    }
});
markeditor.dialogs.register('markLatex', LatexDialog);

/**
 * Preview
 */
const PreviewDialog = MarkEditorDialog.extend({
    options: {
        actions: ['Maximize', 'Close'],
        autoFocus: false,
        className: NO_PADDING_CLASS,
        resizable: true,
        template:
            '<div class="kj-markeditor-preview">' +
            '<div id="preview_toolbar_container"></div>' +
            '<div data-role="splitter" data-panes="[{&quot;scrollable&quot;:false},{&quot;scrollable&quot;:true}]">' +
            '<div><div data-role="markeditor" data-bind="value: markdown"></div></div>' + // Note: data-gfm and data-toolbar are added in the open function
            '<div><div data-role="markdown" data-bind="value: markdown"></div></div>' + // Note data-schemes are added in the open function
            '</div>' +
            '<div class="k-action-buttons">' +
            ('<button class="k-button k-primary" data-bind="click: apply">#= messages.okText #</button>' +
                '<button class="k-button" data-bind="click: cancel">#= messages.cancel #</button>') +
            '</div>' +
            '</div>',
        title: DIALOG_MESSAGES.previewDialog.title,
        width: $(window).width() / 2
    },
    open(...args) {
        const self = this;
        const editor = args[0];
        const { options } = editor;
        MarkEditorDialog.fn.open.apply(self, args);
        const { element } = self.dialog();
        const model = observable({
            markdown: editor.value(),
            apply() {
                if (!/\S/.test(model.markdown)) {
                    model.markdown = null;
                }
                self.trigger('action', {
                    command: 'ToolbarPreviewCommand',
                    params: {
                        property: 'preview',
                        value: model.markdown
                    }
                });
                self.close();
            },
            cancel: self.close.bind(self)
        });

        // Set markeditor options
        const tb = {
            container: '#preview_toolbar_container',
            resizable: options.toolbar.resizable,
            tools: options.toolbar.tools.filter(tool => tool !== 'preview')
        };
        element
            .find(roleSelector('markeditor'))
            .attr(attr('gfm'), options.gfm)
            .attr(attr('toolbar'), JSON.stringify(tb));

        // Set markdown options
        element
            .find(roleSelector('markdown'))
            .attr(attr('schemes'), JSON.stringify(options.schemes));

        // Now we can bind the element to the model
        bind(element, model);

        // We now need to pass the dialog hooks to the markeditor widget in the preview dialog
        // Note this is how we hook the asset manager in place of the default image dialog
        const previewMarkEditor = element
            .find(roleSelector('markeditor'))
            .data('kendoMarkEditor');
        $.each(editor._events.command || [], (index, handler) => {
            previewMarkEditor.bind('command', handler);
        });
        $.each(editor._events.dialog || [], (index, handler) => {
            previewMarkEditor.bind('dialog', handler);
        });

        /*
                // TODO with CodeMirror instead of input
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
                */
    },
    _resizeDialog(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        assert.instanceof(
            Window,
            e.sender,
            assert.format(
                assert.messages.instanceof.default,
                'e.sender',
                'kendo.ui.Window'
            )
        );
        const { element } = e.sender;
        const contentHeight = element.height();
        element.children('.kj-markeditor.preview').height(contentHeight);
        const toolBarContainer = element.find('#preview_toolbar_container');
        assert.hasLength(
            toolBarContainer,
            assert.format(assert.messages.hasLength.default, 'toolBarContainer')
        );
        const toolBarHeight = toolBarContainer.outerHeight();
        const footerHeight = element.find('.k-action-buttons').outerHeight();
        const splitter = element
            .find('.k-splitter')
            .outerHeight(contentHeight - toolBarHeight - footerHeight)
            // Triggering resize is suggested at http://www.telerik.com/forums/splitter-not-resizing-along-with-window
            .trigger('resize');
        assert.hasLength(
            splitter,
            assert.format(assert.messages.hasLength.default, 'splitter')
        );
        const pane = splitter.children('.k-pane:first-child');
        assert.hasLength(
            pane,
            assert.format(assert.messages.hasLength.default, 'pane')
        );
        const markEditorWidget = element
            .find(roleSelector('markeditor'))
            .data('kendoMarkEditor');
        assert.instanceof(
            // Note: we cannot value MarkEditor in {...} = window.kendo
            // because it is only registered after loading widgets.markedior.toolbar
            ui.MarkEditor,
            markEditorWidget,
            assert.format(
                assert.messages.instanceof.default,
                'markEditorWidget',
                'kendo.ui.MarkEditor'
            )
        );
        markEditorWidget.codeMirror.setSize('100%', pane.height());
        resize(toolBarContainer);
    }
});

markeditor.dialogs.register('markPreview', PreviewDialog);
