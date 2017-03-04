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
        './vendor/kendo/kendo.color',
        './vendor/kendo/kendo.drawing'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var DataSource = data.DataSource;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var ToolBar = kendo.ui.ToolBar;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.drawing');
        var NUMBER = 'number';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoVectorDrawing';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var DIV = '<div/>';
        var WIDGET_CLASS = 'kj-drawing';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var SURFACE = 'surface';
        // var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

            /**
             * Get the mouse (or touch) position
             * @param e
             * @param stage
             * @returns {{x: *, y: *}}
             */
            getMousePosition: function (e, stage) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                // See http://www.jacklmoore.com/notes/mouse-position/
                // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
                // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
                // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
                var originalEvent = e.originalEvent;
                var clientX = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientX : e.clientX;
                var clientY = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientY : e.clientY;
                // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
                // var stage = $(e.target).closest('.kj-stage').find(kendo.roleSelector('stage'));
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                var mouse = {
                    x: clientX - stageOffset.left + ownerDocument.scrollLeft(),
                    y: clientY - stageOffset.top + ownerDocument.scrollTop()
                };
                return mouse;
            },

            /**
             * Get the position of the center of an element
             * @param element
             * @param stage
             * @param scale
             */
            getElementCenter: function (element, stage, scale) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                assert.type(NUMBER, scale, kendo.format(assert.messages.type.default, 'scale', NUMBER));
                // We need getBoundingClientRect to especially account for rotation
                var rect = element[0].getBoundingClientRect();
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                return {
                    left: (rect.left - stageOffset.left + rect.width / 2  + ownerDocument.scrollLeft()) / scale,
                    top: (rect.top - stageOffset.top + rect.height / 2 + ownerDocument.scrollTop()) / scale
                };
            },

            /**
             * Get the scale of an element's CSS transformation
             * Note: the same function is used in kidoju.widgets.stage
             * @param element
             * @returns {Number|number}
             */
            getTransformScale: function (element) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                // element.css('transform') returns a matrix, so we have to read the style attribute
                var match = (element.attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
            }

        };

        /*********************************************************************************
         * VectorDrawingToolBar Widget
         *********************************************************************************/

        var MESSAGES = kendo.spreadsheet.messages.toolbar = {
            addColumnLeft: 'Add column left',
            addColumnRight: 'Add column right',
            addRowAbove: 'Add row above',
            addRowBelow: 'Add row below',
            alignment: 'Alignment',
            alignmentButtons: {
                justtifyLeft: 'Align left',
                justifyCenter: 'Center',
                justifyRight: 'Align right',
                justifyFull: 'Justify',
                alignTop: 'Align top',
                alignMiddle: 'Align middle',
                alignBottom: 'Align bottom'
            },
            backgroundColor: 'Background',
            bold: 'Bold',
            borders: 'Borders',
            colorPicker: {
                reset: 'Reset color',
                customColor: 'Custom color...'
            },
            copy: 'Copy',
            cut: 'Cut',
            deleteColumn: 'Delete column',
            deleteRow: 'Delete row',
            filter: 'Filter',
            fontFamily: 'Font',
            fontSize: 'Font size',
            format: 'Custom format...',
            formatTypes: {
                automatic: 'Automatic',
                number: 'Number',
                percent: 'Percent',
                financial: 'Financial',
                currency: 'Currency',
                date: 'Date',
                time: 'Time',
                dateTime: 'Date time',
                duration: 'Duration',
                moreFormats: 'More formats...'
            },
            formatDecreaseDecimal: 'Decrease decimal',
            formatIncreaseDecimal: 'Increase decimal',
            freeze: 'Freeze panes',
            freezeButtons: {
                freezePanes: 'Freeze panes',
                freezeRows: 'Freeze rows',
                freezeColumns: 'Freeze columns',
                unfreeze: 'Unfreeze panes'
            },
            italic: 'Italic',
            merge: 'Merge cells',
            mergeButtons: {
                mergeCells: 'Merge all',
                mergeHorizontally: 'Merge horizontally',
                mergeVertically: 'Merge vertically',
                unmerge: 'Unmerge'
            },
            open: 'Open...',
            paste: 'Paste',
            quickAccess: {
                redo: 'Redo',
                undo: 'Undo'
            },
            exportAs: 'Export...',
            toggleGridlines: 'Toggle gridlines',
            sortAsc: 'Sort ascending',
            sortDesc: 'Sort descending',
            sortButtons: {
                sortSheetAsc: 'Sort sheet A to Z',
                sortSheetDesc: 'Sort sheet Z to A',
                sortRangeAsc: 'Sort range A to Z',
                sortRangeDesc: 'Sort range Z to A'
            },
            textColor: 'Text Color',
            textWrap: 'Wrap text',
            underline: 'Underline',
            validation: 'Data validation...',
            hyperlink: 'Link'
        };
        var defaultTools = {
            home: [
                'open',
                'exportAs',
                [
                    'cut',
                    'copy',
                    'paste'
                ],
                [
                    'bold',
                    'italic',
                    'underline'
                ],
                'hyperlink',
                'backgroundColor',
                'textColor',
                'borders',
                'fontSize',
                'fontFamily',
                'alignment',
                'textWrap',
                [
                    'formatDecreaseDecimal',
                    'formatIncreaseDecimal'
                ],
                'format',
                'merge',
                'freeze',
                'filter',
                'toggleGridlines'
            ],
            insert: [
                [
                    'addColumnLeft',
                    'addColumnRight',
                    'addRowBelow',
                    'addRowAbove'
                ],
                [
                    'deleteColumn',
                    'deleteRow'
                ]
            ],
            data: [
                'sort',
                'filter',
                'validation'
            ]
        };
        var toolDefaults = {
            open: {
                type: 'open',
                overflow: 'never',
                iconClass: 'xlsa'
            },
            exportAs: {
                type: 'exportAsDialog',
                dialogName: 'exportAs',
                overflow: 'never',
                text: '',
                iconClass: 'xlsa'
            },
            bold: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'bold',
                value: true,
                iconClass: 'bold',
                togglable: true
            },
            italic: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'italic',
                value: true,
                iconClass: 'italic',
                togglable: true
            },
            underline: {
                type: 'button',
                command: 'PropertyChangeCommand',
                property: 'underline',
                value: true,
                iconClass: 'underline',
                togglable: true
            },
            formatDecreaseDecimal: {
                type: 'button',
                command: 'AdjustDecimalsCommand',
                value: -1,
                iconClass: 'decrease-decimal'
            },
            formatIncreaseDecimal: {
                type: 'button',
                command: 'AdjustDecimalsCommand',
                value: +1,
                iconClass: 'increase-decimal'
            },
            textWrap: {
                type: 'button',
                command: 'TextWrapCommand',
                property: 'wrap',
                value: true,
                iconClass: 'text-wrap',
                togglable: true
            },
            cut: {
                type: 'button',
                command: 'ToolbarCutCommand',
                iconClass: 'cut'
            },
            copy: {
                type: 'button',
                command: 'ToolbarCopyCommand',
                iconClass: 'copy'
            },
            paste: {
                type: 'button',
                command: 'ToolbarPasteCommand',
                iconClass: 'paste'
            },
            separator: { type: 'separator' },
            alignment: {
                type: 'alignment',
                iconClass: 'justify-left'
            },
            backgroundColor: {
                type: 'colorPicker',
                property: 'background',
                iconClass: 'background'
            },
            textColor: {
                type: 'colorPicker',
                property: 'color',
                iconClass: 'text'
            },
            fontFamily: {
                type: 'fontFamily',
                property: 'fontFamily',
                iconClass: 'text'
            },
            fontSize: {
                type: 'fontSize',
                property: 'fontSize',
                iconClass: 'font-size'
            },
            format: {
                type: 'format',
                property: 'format',
                iconClass: 'format-number'
            },
            filter: {
                type: 'filter',
                property: 'hasFilter',
                iconClass: 'filter'
            },
            merge: {
                type: 'merge',
                iconClass: 'merge-cells'
            },
            freeze: {
                type: 'freeze',
                iconClass: 'freeze-panes'
            },
            borders: {
                type: 'borders',
                iconClass: 'all-borders'
            },
            formatCells: {
                type: 'dialog',
                dialogName: 'formatCells',
                overflow: 'never'
            },
            hyperlink: {
                type: 'dialog',
                dialogName: 'hyperlink',
                iconClass: 'hyperlink',
                overflow: 'never',
                text: ''
            },
            toggleGridlines: {
                type: 'button',
                command: 'GridLinesChangeCommand',
                property: 'gridLines',
                value: true,
                iconClass: 'no-borders',
                togglable: true
            },
            addColumnLeft: {
                type: 'button',
                command: 'AddColumnCommand',
                value: 'left',
                iconClass: 'add-column-left'
            },
            addColumnRight: {
                type: 'button',
                command: 'AddColumnCommand',
                value: 'right',
                iconClass: 'add-column-right'
            },
            addRowBelow: {
                type: 'button',
                command: 'AddRowCommand',
                value: 'below',
                iconClass: 'add-row-below'
            },
            addRowAbove: {
                type: 'button',
                command: 'AddRowCommand',
                value: 'above',
                iconClass: 'add-row-above'
            },
            deleteColumn: {
                type: 'button',
                command: 'DeleteColumnCommand',
                iconClass: 'delete-column'
            },
            deleteRow: {
                type: 'button',
                command: 'DeleteRowCommand',
                iconClass: 'delete-row'
            },
            sort: {
                type: 'sort',
                iconClass: 'sort-desc'
            },
            validation: {
                type: 'dialog',
                dialogName: 'validation',
                iconClass: 'exception',
                overflow: 'never'
            }
        };

        var VectorDrawingToolBar = ToolBar.extend({
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || ToolBar.prototype.options.tools[options.toolbarName]);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar');
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
                        text: MESSAGES[options.name || toolName],
                        spriteCssClass: spriteCssClass,
                        attributes: { title: MESSAGES[options.name || toolName] }
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
                name: 'MiniToolBar',
                resizable: true,
                tools: defaultTools
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
        // kendo.spreadsheet.ToolBar = VectorDrawingToolBar;
        kendo.ui.plugin(VectorDrawingToolBar);

        var DropDownTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var dropDownList = $('<select />').kendoDropDownList({ height: 'auto' }).data('kendoDropDownList');
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
            _open: function () {
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
                        options: {
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
                this.element = $('<a href=\'#\' class=\'k-button k-button-icon\'>' + '<span class=\'' + options.spriteCssClass + '\'>' + '</span><span class=\'k-icon k-i-arrow-s\'></span>' + '</a>');
                this.element.on('click touchend', this.open.bind(this)).attr('data-command', options.command);
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
                this.popup = $('<div class=\'k-spreadsheet-popup\' />').appendTo(element).kendoPopup({ anchor: element }).data('kendoPopup');
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

        // Color Picker
        /*
        var ColorPicker = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.popup.element.addClass('k-spreadsheet-colorpicker');
                this.colorChooser = new kendo.spreadsheet.ColorChooser(this.popup.element, { change: this._colorChange.bind(this) });
                this.element.attr({ 'data-property': options.property });
                this.element.data({
                    type: 'colorPicker',
                    colorPicker: this,
                    instance: this
                });
            },
            destroy: function () {
                this.colorChooser.destroy();
                PopupTool.fn.destroy.call(this);
            },
            update: function (value) {
                this.value(value);
            },
            value: function (value) {
                this.colorChooser.value(value);
            },
            _colorChange: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    options: {
                        property: this.options.property,
                        value: e.sender.value()
                    }
                });
                this.popup.close();
            }
        });
        var ColorPickerButton = OverflowDialogButton.extend({
            init: function (options, toolbar) {
                options.iconName = 'text';
                OverflowDialogButton.fn.init.call(this, options, toolbar);
            },
            _click: function () {
                this.toolbar.dialog({
                    name: 'colorPicker',
                    options: {
                        title: this.options.property,
                        property: this.options.property
                    }
                });
            }
        });
        kendo.toolbar.registerComponent('colorPicker', ColorPicker, ColorPickerButton);
        */

        // Font sizes
        var FONT_SIZES = [
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            16,
            18,
            20,
            22,
            24,
            26,
            28,
            36,
            48,
            72
        ];
        var DEFAULT_FONT_SIZE = 12;
        var FontSize = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var comboBox = $('<input />').kendoComboBox({
                    change: this._valueChange.bind(this),
                    clearButton: false,
                    dataSource: options.fontSizes || FONT_SIZES,
                    value: DEFAULT_FONT_SIZE
                }).data('kendoComboBox');
                this.comboBox = comboBox;
                this.element = comboBox.wrapper;
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                this.element.width(options.width).attr({
                    'data-command': 'PropertyChangeCommand',
                    'data-property': options.property
                });
                this.element.data({
                    type: 'fontSize',
                    fontSize: this
                });
            },
            _valueChange: function (e) {
                this.toolbar.action({
                    command: 'PropertyChangeCommand',
                    options: {
                        property: this.options.property,
                        value: kendo.parseInt(e.sender.value())
                    }
                });
            },
            update: function (value) {
                this.value(kendo.parseInt(value) || DEFAULT_FONT_SIZE);
            },
            value: function (value) {
                if (value !== undefined) {
                    this.comboBox.value(value);
                } else {
                    return this.comboBox.value();
                }
            }
        });
        var FontSizeButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({
                    name: 'fontSize',
                    options: {
                        sizes: FONT_SIZES,
                        defaultSize: DEFAULT_FONT_SIZE
                    }
                });
            },
            update: function (value) {
                this._value = value || DEFAULT_FONT_SIZE;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('fontSize', FontSize, FontSizeButton);

        // Font families
        var FONT_FAMILIES = [
            'Arial',
            'Courier New',
            'Georgia',
            'Times New Roman',
            'Trebuchet MS',
            'Verdana'
        ];
        var DEFAULT_FONT_FAMILY = 'Arial';
        var FontFamily = DropDownTool.extend({
            init: function (options, toolbar) {
                DropDownTool.fn.init.call(this, options, toolbar);
                var ddl = this.dropDownList;
                ddl.setDataSource(options.fontFamilies || FONT_FAMILIES);
                ddl.value(DEFAULT_FONT_FAMILY);
                this.element.data({
                    type: 'fontFamily',
                    fontFamily: this
                });
            },
            update: function (value) {
                this.value(value || DEFAULT_FONT_FAMILY);
            }
        });
        var FontFamilyButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({
                    name: 'fontFamily',
                    options: {
                        fonts: FONT_FAMILIES,
                        defaultFont: DEFAULT_FONT_FAMILY
                    }
                });
            },
            update: function (value) {
                this._value = value || DEFAULT_FONT_FAMILY;
                this.element.find('.k-text').text(this.message + ' (' + this._value + ') ...');
            }
        });
        kendo.toolbar.registerComponent('fontFamily', FontFamily, FontFamilyButton);

        // Cell formats
        /*
         var defaultFormats = kendo.spreadsheet.formats = {
         automatic: null,
         number: '#,0.00',
         percent: '0.00%',
         financial: '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
         currency: '$#,##0.00;[Red]$#,##0.00',
         date: 'm/d/yyyy',
         time: 'h:mm:ss AM/PM',
         dateTime: 'm/d/yyyy h:mm',
         duration: '[h]:mm:ss'
         };
         var Format = DropDownTool.extend({
         _revertTitle: function (e) {
         e.sender.value('');
         e.sender.wrapper.width('auto');
         },
         init: function (options, toolbar) {
         DropDownTool.fn.init.call(this, options, toolbar);
         var ddl = this.dropDownList;
         var icon = '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\' style=\'line-height: 1em; width: 1.35em;\'></span>';
         ddl.bind('change', this._revertTitle.bind(this));
         ddl.bind('dataBound', this._revertTitle.bind(this));
         ddl.setOptions({
         dataValueField: 'format',
         dataTextField: 'name',
         dataValuePrimitive: true,
         valueTemplate: icon,
         template: '# if (data.sample) { #' + '<span class=\'k-spreadsheet-sample\'>#: data.sample #</span>' + '# } #' + '#: data.name #'
         });
         ddl.text(icon);
         ddl.setDataSource([
         {
         format: defaultFormats.automatic,
         name: MESSAGES.formatTypes.automatic
         },
         {
         format: defaultFormats.number,
         name: MESSAGES.formatTypes.number,
         sample: '1,499.99'
         },
         {
         format: defaultFormats.percent,
         name: MESSAGES.formatTypes.percent,
         sample: '14.50%'
         },
         {
         format: defaultFormats.financial,
         name: MESSAGES.formatTypes.financial,
         sample: '(1,000.12)'
         },
         {
         format: defaultFormats.currency,
         name: MESSAGES.formatTypes.currency,
         sample: '$1,499.99'
         },
         {
         format: defaultFormats.date,
         name: MESSAGES.formatTypes.date,
         sample: '4/21/2012'
         },
         {
         format: defaultFormats.time,
         name: MESSAGES.formatTypes.time,
         sample: '5:49:00 PM'
         },
         {
         format: defaultFormats.dateTime,
         name: MESSAGES.formatTypes.dateTime,
         sample: '4/21/2012 5:49:00'
         },
         {
         format: defaultFormats.duration,
         name: MESSAGES.formatTypes.duration,
         sample: '168:05:00'
         },
         {
         popup: 'formatCells',
         name: MESSAGES.formatTypes.moreFormats
         }
         ]);
         this.element.data({
         type: 'format',
         format: this
         });
         }
         });
         var FormatButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'formatCells' });
         }
         });
         kendo.toolbar.registerComponent('format', Format, FormatButton);
         */

        // border
        /*
         var BorderChangeTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this._borderPalette();
         this.element.data({
         type: 'borders',
         instance: this
         });
         },
         destroy: function () {
         this.borderPalette.destroy();
         PopupTool.fn.destroy.call(this);
         },
         _borderPalette: function () {
         var element = $('<div />').appendTo(this.popup.element);
         this.borderPalette = new kendo.spreadsheet.BorderPalette(element, { change: this._action.bind(this) });
         },
         _action: function (e) {
         this.toolbar.action({
         command: 'BorderChangeCommand',
         options: {
         border: e.type,
         style: {
         size: 1,
         color: e.color
         }
         }
         });
         }
         });
         var BorderChangeButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'borders' });
         }
         });
         kendo.toolbar.registerComponent('borders', BorderChangeTool, BorderChangeButton);
         */

        // Alignment
        /*
         var AlignmentTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this.element.attr({ 'data-property': 'alignment' });
         this._commandPalette();
         this.popup.element.on('click', '.k-button', function (e) {
         this._action($(e.currentTarget));
         }.bind(this));
         this.element.data({
         type: 'alignment',
         alignment: this,
         instance: this
         });
         },
         buttons: [
         {
         property: 'textAlign',
         value: 'left',
         iconClass: 'justify-left',
         text: MESSAGES.alignmentButtons.justtifyLeft
         },
         {
         property: 'textAlign',
         value: 'center',
         iconClass: 'justify-center',
         text: MESSAGES.alignmentButtons.justifyCenter
         },
         {
         property: 'textAlign',
         value: 'right',
         iconClass: 'justify-right',
         text: MESSAGES.alignmentButtons.justifyRight
         },
         {
         property: 'textAlign',
         value: 'justify',
         iconClass: 'justify-full',
         text: MESSAGES.alignmentButtons.justifyFull
         },
         {
         property: 'verticalAlign',
         value: 'top',
         iconClass: 'align-top',
         text: MESSAGES.alignmentButtons.alignTop
         },
         {
         property: 'verticalAlign',
         value: 'center',
         iconClass: 'align-middle',
         text: MESSAGES.alignmentButtons.alignMiddle
         },
         {
         property: 'verticalAlign',
         value: 'bottom',
         iconClass: 'align-bottom',
         text: MESSAGES.alignmentButtons.alignBottom
         }
         ],
         destroy: function () {
         this.popup.element.off();
         PopupTool.fn.destroy.call(this);
         },
         update: function (range) {
         var textAlign = range.textAlign();
         var verticalAlign = range.verticalAlign();
         var element = this.popup.element;
         element.find('.k-button').removeClass('k-state-active');
         if (textAlign) {
         element.find('[data-property=textAlign][data-value=' + textAlign + ']').addClass('k-state-active');
         }
         if (verticalAlign) {
         element.find('[data-property=verticalAlign][data-value=' + verticalAlign + ']').addClass('k-state-active');
         }
         },
         _commandPalette: function () {
         var buttons = this.buttons;
         var element = $('<div />').appendTo(this.popup.element);
         buttons.forEach(function (options, index) {
         var button = '<a title=\'' + options.text + '\' data-property=\'' + options.property + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
         if (index !== 0 && buttons[index - 1].property !== options.property) {
         element.append($('<span class=\'k-separator\' />'));
         }
         element.append(button);
         });
         },
         _action: function (button) {
         var property = button.attr('data-property');
         var value = button.attr('data-value');
         this.toolbar.action({
         command: 'PropertyChangeCommand',
         options: {
         property: property,
         value: value
         }
         });
         }
         });
         var AlignmentButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'alignment' });
         }
         });
         kendo.toolbar.registerComponent('alignment', AlignmentTool, AlignmentButton);
         */

        // Merge
        /*
         var MergeTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this._commandPalette();
         this.popup.element.on('click', '.k-button', function (e) {
         this._action($(e.currentTarget));
         }.bind(this));
         this.element.data({
         type: 'merge',
         merge: this,
         instance: this
         });
         },
         buttons: [
         {
         value: 'cells',
         iconClass: 'merge-cells',
         text: MESSAGES.mergeButtons.mergeCells
         },
         {
         value: 'horizontally',
         iconClass: 'merge-horizontally',
         text: MESSAGES.mergeButtons.mergeHorizontally
         },
         {
         value: 'vertically',
         iconClass: 'merge-vertically',
         text: MESSAGES.mergeButtons.mergeVertically
         },
         {
         value: 'unmerge',
         iconClass: 'normal-layout',
         text: MESSAGES.mergeButtons.unmerge
         }
         ],
         destroy: function () {
         this.popup.element.off();
         PopupTool.fn.destroy.call(this);
         },
         _commandPalette: function () {
         var element = $('<div />').appendTo(this.popup.element);
         this.buttons.forEach(function (options) {
         var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icontext\'>' + '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\'></span>' + options.text + '</a>';
         element.append(button);
         });
         },
         _action: function (button) {
         var value = button.attr('data-value');
         this.toolbar.action({
         command: 'MergeCellCommand',
         options: { value: value }
         });
         }
         });
         var MergeButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'merge' });
         }
         });
         kendo.toolbar.registerComponent('merge', MergeTool, MergeButton);
         */

        /*
         var FreezeTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this._commandPalette();
         this.popup.element.on('click', '.k-button', function (e) {
         this._action($(e.currentTarget));
         }.bind(this));
         this.element.data({
         type: 'freeze',
         freeze: this,
         instance: this
         });
         },
         buttons: [
         {
         value: 'panes',
         iconClass: 'freeze-panes',
         text: MESSAGES.freezeButtons.freezePanes
         },
         {
         value: 'rows',
         iconClass: 'freeze-row',
         text: MESSAGES.freezeButtons.freezeRows
         },
         {
         value: 'columns',
         iconClass: 'freeze-col',
         text: MESSAGES.freezeButtons.freezeColumns
         },
         {
         value: 'unfreeze',
         iconClass: 'normal-layout',
         text: MESSAGES.freezeButtons.unfreeze
         }
         ],
         destroy: function () {
         this.popup.element.off();
         PopupTool.fn.destroy.call(this);
         },
         _commandPalette: function () {
         var element = $('<div />').appendTo(this.popup.element);
         this.buttons.forEach(function (options) {
         var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icontext\'>' + '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\'></span>' + options.text + '</a>';
         element.append(button);
         });
         },
         _action: function (button) {
         var value = button.attr('data-value');
         this.toolbar.action({
         command: 'FreezePanesCommand',
         options: { value: value }
         });
         }
         });
         var FreezeButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'freeze' });
         }
         });
         kendo.toolbar.registerComponent('freeze', FreezeTool, FreezeButton);
         */

        // Sort
        /*
         var Sort = DropDownTool.extend({
         _revertTitle: function (e) {
         e.sender.value('');
         e.sender.wrapper.width('auto');
         },
         init: function (options, toolbar) {
         DropDownTool.fn.init.call(this, options, toolbar);
         var ddl = this.dropDownList;
         ddl.bind('change', this._revertTitle.bind(this));
         ddl.bind('dataBound', this._revertTitle.bind(this));
         ddl.setOptions({
         valueTemplate: '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\' style=\'line-height: 1em; width: 1.35em;\'></span>',
         template: '<span class=\'k-icon k-font-icon k-i-#= iconClass #\' style=\'line-height: 1em; width: 1.35em;\'></span>#=text#',
         dataTextField: 'text',
         dataValueField: 'value'
         });
         ddl.setDataSource([
         {
         value: 'asc',
         sheet: false,
         text: MESSAGES.sortButtons.sortRangeAsc,
         iconClass: 'sort-asc'
         },
         {
         value: 'desc',
         sheet: false,
         text: MESSAGES.sortButtons.sortRangeDesc,
         iconClass: 'sort-desc'
         }
         ]);
         ddl.select(0);
         this.element.data({
         type: 'sort',
         sort: this
         });
         },
         _change: function (e) {
         var instance = e.sender;
         var dataItem = instance.dataItem();
         if (dataItem) {
         this.toolbar.action({
         command: 'SortCommand',
         options: {
         value: dataItem.value,
         sheet: dataItem.sheet
         }
         });
         }
         },
         value: $.noop
         });
         var SortButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'sort' });
         }
         });
         kendo.toolbar.registerComponent('sort', Sort, SortButton);
         */

        // Filter
        /*
         var Filter = kendo.toolbar.ToolBarButton.extend({
         init: function (options, toolbar) {
         options.showText = 'overflow';
         kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
         this.element.on('click', this._click.bind(this));
         this.element.data({
         type: 'filter',
         filter: this
         });
         },
         _click: function () {
         this.toolbar.action({ command: 'FilterCommand' });
         },
         update: function (value) {
         this.toggle(value);
         }
         });
         var FilterButton = OverflowDialogButton.extend({
         init: function (options, toolbar) {
         OverflowDialogButton.fn.init.call(this, options, toolbar);
         this.element.data({
         type: 'filter',
         filter: this
         });
         },
         _click: function () {
         this.toolbar.action({ command: 'FilterCommand' });
         },
         update: function (value) {
         this.toggle(value);
         }
         });
         kendo.toolbar.registerComponent('filter', Filter, FilterButton);
         */

        // Open
        /*
         var Open = kendo.toolbar.Item.extend({
         init: function (options, toolbar) {
         this.toolbar = toolbar;
         this.element = $('<div class=\'k-button k-upload-button k-button-icon\'>' + '<span class=\'k-icon k-font-icon k-i-folder-open\' />' + '</div>').data('instance', this);
         this._title = options.attributes.title;
         this._reset();
         },
         _reset: function () {
         this.element.remove('input');
         $('<input type=\'file\' autocomplete=\'off\' accept=\'.xlsx\'/>').attr('title', this._title).one('change', this._change.bind(this)).appendTo(this.element);
         },
         _change: function (e) {
         this.toolbar.action({
         command: 'OpenCommand',
         options: { file: e.target.files[0] }
         });
         this._reset();
         }
         });
         kendo.toolbar.registerComponent('open', Open);
         */

        /*********************************************************************************
         * VectorDrawing Widget
         *********************************************************************************/

        /**
         * VectorDrawing
         * @class VectorDrawing Widget (kendoVectorDrawing)
         */
        var VectorDrawing = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that._dataSource();
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'VectorDrawing',
                id: null,
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]',
                enable: true
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING || $.type(value) === NULL) {
                    that._value = value;
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a nullable string if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                // touch-action: 'none' is for Internet Explorer - https://github.com/jquery/jquery/issues/2987
                that.element
                    .addClass(WIDGET_CLASS)
                    .css({ touchAction: 'none' });
                that.surface = drawing.Surface.create(that.element);
            },

            /**
             * Add drag and drop handlers
             * @private
             */
            _addDragAndDrop: function () {
                // IMPORTANT
                // We can have several containers containing connectors on a page
                // But we only have one set of event handlers shared across all containers
                // So we cannot use `this`, which is specific to this connector
                var element;
                var path;
                var target;
                $(document)
                    .off(NS)
                    .on(MOUSEDOWN, DOT + WIDGET_CLASS, function (e) {
                        e.preventDefault(); // prevents from selecting the div
                        element = $(e.currentTarget);
                        var elementOffset = element.offset();
                        var elementWidget = element.data(WIDGET);
                        if (elementWidget instanceof VectorDrawing && elementWidget._enabled) {
                            elementWidget._dropConnection();
                            var scaler = element.closest(elementWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var container = element.closest(elementWidget.options.container);
                            assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                            var mouse = util.getMousePosition(e, container);
                            var center = util.getElementCenter(element, container, scale);
                            var surface = container.data(SURFACE);
                            assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'surface', 'kendo.drawing.Surface'));
                            path = new drawing.Path({
                                stroke: {
                                    color: elementWidget.options.color
                                    // lineCap: PATH_LINECAP,
                                    // width: PATH_WIDTH
                                }
                            });
                            path.moveTo(center.left, center.top);
                            path.lineTo(mouse.x / scale, mouse.y / scale);
                            surface.draw(path);
                        }
                    })
                    .on(MOUSEMOVE, function (e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            var elementWidget = element.data(WIDGET);
                            assert.instanceof(VectorDrawing, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.VectorDrawing'));
                            var scaler = element.closest(elementWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var container = element.closest(elementWidget.options.container);
                            assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                            var mouse = util.getMousePosition(e, container);
                            path.segments[1].anchor().move(mouse.x / scale, mouse.y / scale);
                        }
                    })
                    .on(MOUSEUP, DOT + WIDGET_CLASS, function (e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            var targetElement = e.originalEvent && e.originalEvent.changedTouches ?
                                document.elementFromPoint(e.originalEvent.changedTouches[0].clientX, e.originalEvent.changedTouches[0].clientY) :
                                e.currentTarget;
                            target = $(targetElement).closest(DOT + WIDGET_CLASS);
                            var targetWidget = target.data(WIDGET);
                            // with touchend, target === element
                            // BUG REPORT  here: https://github.com/jquery/jquery/issues/2987
                            if (element.attr(kendo.attr(ID)) !== target.attr(kendo.attr(ID)) && targetWidget instanceof VectorDrawing && targetWidget._enabled) {
                                var elementWidget = element.data(WIDGET);
                                assert.instanceof(VectorDrawing, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.VectorDrawing'));
                                var container = element.closest(elementWidget.options.container);
                                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                                var targetContainer = target.closest(targetWidget.options.container);
                                assert.hasLength(targetContainer, kendo.format(assert.messages.hasLength.default, targetWidget.options.container));
                                if (container[0] === targetContainer[0]) {
                                    elementWidget._addConnection(target);
                                } else {
                                    // We cannot erase so we need to redraw all
                                    elementWidget.refresh();
                                }
                            }  else {
                                target = undefined;
                            }
                        }
                        // Note: The MOUSEUP events bubble and the following handler is always executed after this one
                    })
                    .on(MOUSEUP, function (e) {
                        if (path instanceof kendo.drawing.Path) {
                            path.close();
                        }
                        if (element instanceof $ && $.type(target) === UNDEFINED) {
                            var elementWidget = element.data(WIDGET);
                            if (elementWidget instanceof VectorDrawing) {
                                elementWidget.refresh();
                            }
                        }
                        path = undefined;
                        element = undefined;
                        target = undefined;
                    });
            },

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function () {
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = DataSource.create(that.options.dataSource);

                // bind to the change event to refresh the widget
                if (that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                that._refreshHandler = $.proxy(that.refresh, that);
                that.dataSource.bind(CHANGE, that._refreshHandler);

                // trigger a read on the dataSource if one hasn't happened yet
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                var that = this;
                // set the internal datasource equal to the one passed in by MVVM
                that.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                that._dataSource();
            },

            /**
             * Refresh upon changing the dataSource
             * Redraw all connections
             */
            refresh: function () {
                var that = this;
                var options = that.options;
                var container = that.element.closest(options.container);
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var connections = this.dataSource.data();
                var surface = container.data(SURFACE);
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();

                }
            },

            /**
             * Enable/disable user interactivity on connector
             */
            enable: function (enabled) {
                // this._enabled is checked in _addDragAndDrop
                this._enabled = enabled;
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                var container = element.closest(that.options.container);
                var surface = container.data(SURFACE);
                Widget.fn.destroy.call(that);
                // unbind document events
                $(document).off(NS);
                // unbind and destroy all descendants
                kendo.unbind(element);
                kendo.destroy(element);
                // unbind all other events (probably redundant)
                element.find('*').off();
                element.off();
                // remove descendants
                element.empty();
                // remove widget class
                element.removeClass(WIDGET_CLASS);
                // If last connector on stage, remove surface
                if (container.find(DOT + WIDGET_CLASS).length === 0 && surface instanceof Surface) {
                    kendo.destroy(surface.element);
                    surface.element.remove();
                    container.removeData(SURFACE);
                }
            }
        });

        kendo.ui.plugin(VectorDrawing);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
