/** 
 * Kendo UI v2020.3.1021 (http://www.telerik.com/kendo-ui)                                                                                                                                              
 * Copyright 2020 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('util/text-metrics', ['kendo.core'], f);
}(function () {
    (function ($) {
        window.kendo.util = window.kendo.util || {};
        var LRUCache = kendo.Class.extend({
            init: function (size) {
                this._size = size;
                this._length = 0;
                this._map = {};
            },
            put: function (key, value) {
                var map = this._map;
                var entry = {
                    key: key,
                    value: value
                };
                map[key] = entry;
                if (!this._head) {
                    this._head = this._tail = entry;
                } else {
                    this._tail.newer = entry;
                    entry.older = this._tail;
                    this._tail = entry;
                }
                if (this._length >= this._size) {
                    map[this._head.key] = null;
                    this._head = this._head.newer;
                    this._head.older = null;
                } else {
                    this._length++;
                }
            },
            get: function (key) {
                var entry = this._map[key];
                if (entry) {
                    if (entry === this._head && entry !== this._tail) {
                        this._head = entry.newer;
                        this._head.older = null;
                    }
                    if (entry !== this._tail) {
                        if (entry.older) {
                            entry.older.newer = entry.newer;
                            entry.newer.older = entry.older;
                        }
                        entry.older = this._tail;
                        entry.newer = null;
                        this._tail.newer = entry;
                        this._tail = entry;
                    }
                    return entry.value;
                }
            }
        });
        var REPLACE_REGEX = /\r?\n|\r|\t/g;
        var SPACE = ' ';
        function normalizeText(text) {
            return String(text).replace(REPLACE_REGEX, SPACE);
        }
        function objectKey(object) {
            var parts = [];
            for (var key in object) {
                parts.push(key + object[key]);
            }
            return parts.sort().join('');
        }
        function hashKey(str) {
            var hash = 2166136261;
            for (var i = 0; i < str.length; ++i) {
                hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
                hash ^= str.charCodeAt(i);
            }
            return hash >>> 0;
        }
        function zeroSize() {
            return {
                width: 0,
                height: 0,
                baseline: 0
            };
        }
        var DEFAULT_OPTIONS = { baselineMarkerSize: 1 };
        var defaultMeasureBox;
        if (typeof document !== 'undefined') {
            defaultMeasureBox = document.createElement('div');
            defaultMeasureBox.style.cssText = 'position: absolute !important; top: -4000px !important; width: auto !important; height: auto !important;' + 'padding: 0 !important; margin: 0 !important; border: 0 !important;' + 'line-height: normal !important; visibility: hidden !important; white-space: pre!important;';
        }
        var TextMetrics = kendo.Class.extend({
            init: function (options) {
                this._cache = new LRUCache(1000);
                this.options = $.extend({}, DEFAULT_OPTIONS, options);
            },
            measure: function (text, style, options) {
                if (options === void 0) {
                    options = {};
                }
                if (!text) {
                    return zeroSize();
                }
                var styleKey = objectKey(style);
                var cacheKey = hashKey(text + styleKey);
                var cachedResult = this._cache.get(cacheKey);
                if (cachedResult) {
                    return cachedResult;
                }
                var size = zeroSize();
                var measureBox = options.box || defaultMeasureBox;
                var baselineMarker = this._baselineMarker().cloneNode(false);
                for (var key in style) {
                    var value = style[key];
                    if (typeof value !== 'undefined') {
                        measureBox.style[key] = value;
                    }
                }
                var textStr = options.normalizeText !== false ? normalizeText(text) : String(text);
                measureBox.textContent = textStr;
                measureBox.appendChild(baselineMarker);
                document.body.appendChild(measureBox);
                if (textStr.length) {
                    size.width = measureBox.offsetWidth - this.options.baselineMarkerSize;
                    size.height = measureBox.offsetHeight;
                    size.baseline = baselineMarker.offsetTop + this.options.baselineMarkerSize;
                }
                if (size.width > 0 && size.height > 0) {
                    this._cache.put(cacheKey, size);
                }
                measureBox.parentNode.removeChild(measureBox);
                return size;
            },
            _baselineMarker: function () {
                var marker = document.createElement('div');
                marker.style.cssText = 'display: inline-block; vertical-align: baseline;width: ' + this.options.baselineMarkerSize + 'px; height: ' + this.options.baselineMarkerSize + 'px;overflow: hidden;';
                return marker;
            }
        });
        TextMetrics.current = new TextMetrics();
        function measureText(text, style, measureBox) {
            return TextMetrics.current.measure(text, style, measureBox);
        }
        kendo.deepExtend(kendo.util, {
            LRUCache: LRUCache,
            TextMetrics: TextMetrics,
            measureText: measureText,
            objectKey: objectKey,
            hashKey: hashKey,
            normalizeText: normalizeText
        });
    }(window.kendo.jQuery));
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('kendo.gantt.editors', [
        'kendo.data',
        'kendo.popup',
        'kendo.window',
        'kendo.gantt.data',
        'kendo.grid',
        'kendo.datetimepicker',
        'kendo.numerictextbox'
    ], f);
}(function () {
    var __meta__ = {
        id: 'gantt.editors',
        name: 'GanttEditors',
        category: 'web',
        description: 'The Gantt component editors.',
        depends: [
            'data',
            'popup',
            'window',
            'gantt.data',
            'grid',
            'datetimepicker',
            'numerictextbox'
        ],
        hidden: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, browser = kendo.support.browser, Observable = kendo.Observable, Widget = ui.Widget, outerWidth = kendo._outerWidth, keys = $.extend({ F10: 121 }, kendo.keys), proxy = $.proxy, extend = $.extend, isPlainObject = $.isPlainObject, NS = '.kendoGantt', PERCENTAGE_FORMAT = 'p0', TABINDEX = 'tabIndex', CLICK = 'click', WIDTH = 'width', STRING = 'string', ARIA_DESCENDANT = 'aria-activedescendant', ACTIVE_OPTION = 'action-option-focused', DOT = '.', DIRECTIONS = {
                'down': {
                    origin: 'bottom left',
                    position: 'top left'
                },
                'up': {
                    origin: 'top left',
                    position: 'bottom left'
                }
            }, TASK_DROPDOWN_TEMPLATE = kendo.template('<div class="#=styles.popupWrapper#">' + '<ul class="#=styles.popupList#" role="listbox">' + '#for(var i = 0, l = actions.length; i < l; i++){#' + '<li class="#=styles.item#" data-action="#=actions[i].data#" role="option">#=actions[i].text#</span>' + '#}#' + '</ul>' + '</div>');
        var ganttStyles = {
            buttonDelete: 'k-gantt-delete',
            buttonCancel: 'k-gantt-cancel',
            buttonSave: 'k-gantt-update',
            focused: 'k-state-focused',
            gridContent: 'k-grid-content',
            hovered: 'k-state-hover',
            item: 'k-item',
            popupWrapper: 'k-list-container',
            popupList: 'k-list k-reset',
            popup: {
                form: 'k-popup-edit-form',
                editForm: 'k-gantt-edit-form',
                formContainer: 'k-edit-form-container',
                resourcesFormContainer: 'k-resources-form-container',
                message: 'k-popup-message',
                buttonsContainer: 'k-edit-buttons k-state-default',
                button: 'k-button',
                editField: 'k-edit-field',
                editLabel: 'k-edit-label',
                resourcesField: 'k-gantt-resources'
            },
            primary: 'k-primary',
            toolbar: { appendButton: 'k-gantt-create' }
        };
        var DATERANGEEDITOR = function (container, options) {
            var attr = {
                name: options.field,
                title: options.title
            };
            var validationRules = options.model.fields[options.field].validation;
            if (validationRules && isPlainObject(validationRules) && validationRules.message) {
                attr[kendo.attr('dateCompare-msg')] = validationRules.message;
            }
            $('<input type="text" required ' + kendo.attr('type') + '="date" ' + kendo.attr('role') + '="datetimepicker" ' + kendo.attr('bind') + '="value:' + options.field + '" ' + kendo.attr('validate') + '=\'true\' />').attr(attr).appendTo(container);
            $('<span ' + kendo.attr('for') + '="' + options.field + '" class="k-invalid-msg"/>').hide().appendTo(container);
        };
        var RESOURCESEDITOR = function (container, options) {
            $('<a href="#" class="' + options.styles.button + '">' + options.messages.assignButton + '</a>').click(options.click).appendTo(container);
        };
        var TaskDropDown = Observable.extend({
            init: function (element, options) {
                Observable.fn.init.call(this);
                this.element = element;
                this.options = extend(true, {}, this.options, options);
                this._popup();
            },
            options: {
                direction: 'down',
                navigatable: false
            },
            destroy: function () {
                clearTimeout(this._focusTimeout);
                this.popup.destroy();
                this.element.off(NS);
                this.list.off(NS);
                this.unbind();
            },
            _adjustListWidth: function () {
                var list = this.list;
                var width = list[0].style.width;
                var wrapper = this.element;
                var listOuterWidth = outerWidth(list);
                var computedStyle;
                var computedWidth;
                if (!list.data(WIDTH) && width) {
                    return;
                }
                computedStyle = window.getComputedStyle ? window.getComputedStyle(wrapper[0], null) : 0;
                computedWidth = computedStyle ? parseFloat(computedStyle.width) : outerWidth(wrapper);
                if (computedStyle && (browser.mozilla || browser.msie)) {
                    computedWidth += parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
                }
                if (list.css('box-sizing') !== 'border-box') {
                    width = computedWidth - (outerWidth(list) - list.width());
                } else {
                    width = computedWidth;
                }
                if (listOuterWidth > width) {
                    width = listOuterWidth;
                }
                list.css({
                    fontFamily: wrapper.css('font-family'),
                    width: width
                }).data(WIDTH, width);
            },
            _current: function (method) {
                var current = this.list.find(DOT + ganttStyles.focused);
                var sibling = current[method]();
                if (sibling.length) {
                    current.removeClass(ganttStyles.focused).removeAttr('id');
                    sibling.addClass(ganttStyles.focused).attr('id', ACTIVE_OPTION);
                    this.list.find('ul').removeAttr(ARIA_DESCENDANT).attr(ARIA_DESCENDANT, ACTIVE_OPTION);
                }
            },
            _popup: function () {
                var that = this;
                var itemSelector = 'li' + DOT + ganttStyles.item;
                var actions = this.options.messages.actions;
                var navigatable = this.options.navigatable;
                this.list = $(TASK_DROPDOWN_TEMPLATE({
                    styles: ganttStyles,
                    actions: [
                        {
                            data: 'add',
                            text: actions.addChild
                        },
                        {
                            data: 'insert-before',
                            text: actions.insertBefore
                        },
                        {
                            data: 'insert-after',
                            text: actions.insertAfter
                        }
                    ]
                }));
                this.element.append(this.list);
                this.popup = new kendo.ui.Popup(this.list, extend({
                    anchor: this.element,
                    open: function () {
                        that._adjustListWidth();
                    },
                    animation: this.options.animation
                }, DIRECTIONS[this.options.direction]));
                this.element.on(CLICK + NS, function (e) {
                    var target = $(this);
                    var action = target.attr(kendo.attr('action'));
                    e.preventDefault();
                    if (action) {
                        that.trigger('command', { type: action });
                    } else {
                        that.popup.open();
                        if (navigatable) {
                            that.list.find('li:first').addClass(ganttStyles.focused).attr('id', ACTIVE_OPTION).end().find('ul').attr({
                                TABINDEX: 0,
                                'aria-activedescendant': ACTIVE_OPTION
                            }).focus();
                        }
                    }
                });
                this.list.find(itemSelector).hover(function () {
                    $(this).addClass(ganttStyles.hovered);
                }, function () {
                    $(this).removeClass(ganttStyles.hovered);
                }).end().on(CLICK + NS, itemSelector, function () {
                    that.trigger('command', { type: $(this).attr(kendo.attr('action')) });
                    that.popup.close();
                });
                if (navigatable) {
                    this.popup.bind('close', function () {
                        that.list.find(itemSelector).removeClass(ganttStyles.focused).end().find('ul').attr(TABINDEX, 0);
                        that.element.parents('[' + kendo.attr('role') + '="gantt"]').find(DOT + ganttStyles.gridContent + ' > table:first').focus();
                    });
                    this.list.find('ul').on('keydown' + NS, function (e) {
                        var key = e.keyCode;
                        switch (key) {
                        case keys.UP:
                            e.preventDefault();
                            that._current('prev');
                            break;
                        case keys.DOWN:
                            e.preventDefault();
                            that._current('next');
                            break;
                        case keys.ENTER:
                            that.list.find(DOT + ganttStyles.focused).click();
                            break;
                        case keys.ESC:
                            e.preventDefault();
                            that.popup.close();
                            break;
                        }
                    });
                }
            }
        });
        var editors = {
            desktop: {
                dateRange: DATERANGEEDITOR,
                resources: RESOURCESEDITOR
            }
        };
        var Editor = kendo.Observable.extend({
            init: function (element, options) {
                kendo.Observable.fn.init.call(this);
                this.element = element;
                this.options = extend(true, {}, this.options, options);
                this.createButton = this.options.createButton;
            },
            fields: function (editors, model, plannedEditors) {
                var that = this;
                var options = this.options;
                var messages = options.messages.editor;
                var resources = options.resources;
                var fields;
                var click = function (e) {
                    e.preventDefault();
                    resources.editor(that.container.find(DOT + ganttStyles.popup.resourcesField), model);
                };
                if (options.editable.template) {
                    fields = $.map(model.fields, function (value, key) {
                        return { field: key };
                    });
                } else {
                    fields = [
                        {
                            field: 'title',
                            title: messages.title
                        },
                        {
                            field: 'start',
                            title: messages.start,
                            editor: editors.dateRange
                        },
                        {
                            field: 'end',
                            title: messages.end,
                            editor: editors.dateRange
                        },
                        {
                            field: 'percentComplete',
                            title: messages.percentComplete,
                            format: PERCENTAGE_FORMAT
                        }
                    ];
                    if (plannedEditors) {
                        fields.splice.apply(fields, [
                            1,
                            0
                        ].concat([
                            {
                                field: 'plannedStart',
                                title: messages.plannedStart,
                                editor: editors.dateRange
                            },
                            {
                                field: 'plannedEnd',
                                title: messages.plannedEnd,
                                editor: editors.dateRange
                            }
                        ]));
                    }
                    if (model.get(resources.field)) {
                        fields.push({
                            field: resources.field,
                            title: messages.resources,
                            messages: messages,
                            editor: editors.resources,
                            click: click,
                            styles: ganttStyles.popup
                        });
                    }
                }
                return fields;
            },
            _buildEditTemplate: function (model, fields, editableFields) {
                var resources = this.options.resources;
                var template = this.options.editable.template;
                var settings = extend({}, kendo.Template, this.options.templateSettings);
                var paramName = settings.paramName;
                var popupStyles = ganttStyles.popup;
                var html = '';
                if (template) {
                    if (typeof template === STRING) {
                        template = kendo.unescape(template);
                    }
                    html += kendo.template(template, settings)(model);
                } else {
                    for (var i = 0, length = fields.length; i < length; i++) {
                        var field = fields[i];
                        html += '<div class="' + popupStyles.editLabel + '"><label for="' + field.field + '">' + (field.title || field.field || '') + '</label></div>';
                        if (field.field === resources.field) {
                            html += '<div class="' + popupStyles.resourcesField + '" style="display:none"></div>';
                        }
                        if (!model.editable || model.editable(field.field)) {
                            editableFields.push(field);
                            html += '<div ' + kendo.attr('container-for') + '="' + field.field + '" class="' + popupStyles.editField + '"></div>';
                        } else {
                            var tmpl = '#:';
                            if (field.field) {
                                field = kendo.expr(field.field, paramName);
                                tmpl += field + '==null?\'\':' + field;
                            } else {
                                tmpl += '\'\'';
                            }
                            tmpl += '#';
                            tmpl = kendo.template(tmpl, settings);
                            html += '<div class="' + popupStyles.editField + '">' + tmpl(model) + '</div>';
                        }
                    }
                }
                return html;
            }
        });
        var PopupEditor = Editor.extend({
            destroy: function () {
                this.close();
                this.unbind();
            },
            close: function () {
                var that = this;
                var destroy = function () {
                    if (that.editable) {
                        that.editable.destroy();
                        that.editable = null;
                        that.container = null;
                    }
                    if (that.popup) {
                        that.popup.destroy();
                        that.popup = null;
                    }
                };
                if (this.editable && this.container.is(':visible')) {
                    that.trigger('close', { window: that.container });
                    this.container.data('kendoWindow').bind('deactivate', destroy).close();
                } else {
                    destroy();
                }
            },
            editTask: function (task, plannedEditors) {
                this.editable = this._createPopupEditor(task, plannedEditors);
            },
            showDialog: function (options) {
                var buttons = options.buttons;
                var popupStyles = ganttStyles.popup;
                var html = kendo.format('<div class="{0}"><div class="{1}"><p class="{2}">{3}</p><div class="{4}">', popupStyles.form, popupStyles.formContainer, popupStyles.message, options.text, popupStyles.buttonsContainer);
                for (var i = 0, length = buttons.length; i < length; i++) {
                    html += this.createButton(buttons[i]);
                }
                html += '</div></div></div>';
                var wrapper = this.element;
                if (this.popup) {
                    this.popup.destroy();
                }
                var popup = this.popup = $(html).appendTo(wrapper).eq(0).on('click', DOT + popupStyles.button, function (e) {
                    e.preventDefault();
                    popup.close();
                    var buttonIndex = $(e.currentTarget).index();
                    buttons[buttonIndex].click();
                }).kendoWindow({
                    modal: true,
                    autoFocus: false,
                    resizable: false,
                    draggable: false,
                    title: options.title,
                    visible: false,
                    deactivate: function () {
                        this.destroy();
                        wrapper.focus();
                    }
                }).getKendoWindow();
                popup.center().open();
                popup.element.find('.k-primary').focus();
            },
            _createPopupEditor: function (task, plannedEditors) {
                var that = this;
                var options = {};
                var messages = this.options.messages;
                var popupStyles = ganttStyles.popup;
                var html = kendo.format('<div {0}="{1}" class="{2} {3}"><div class="{4}">', kendo.attr('uid'), task.uid, popupStyles.form, popupStyles.editForm, popupStyles.formContainer);
                var fields = this.fields(editors.desktop, task, plannedEditors);
                var editableFields = [];
                html += this._buildEditTemplate(task, fields, editableFields);
                html += '<div class="' + popupStyles.buttonsContainer + '">';
                html += this.createButton({
                    name: 'update',
                    text: messages.save,
                    className: ganttStyles.primary
                });
                html += this.createButton({
                    name: 'cancel',
                    text: messages.cancel
                });
                if (that.options.editable.destroy !== false) {
                    html += this.createButton({
                        name: 'delete',
                        text: messages.destroy
                    });
                }
                html += '</div></div></div>';
                var container = this.container = $(html).appendTo(this.element).eq(0).kendoWindow(extend({
                    modal: true,
                    resizable: false,
                    draggable: true,
                    title: messages.editor.editorTitle,
                    visible: false,
                    close: function (e) {
                        if (e.userTriggered) {
                            if (that.trigger('cancel', {
                                    container: container,
                                    model: task
                                })) {
                                e.preventDefault();
                            }
                        }
                    }
                }, options));
                var editableWidget = container.kendoEditable({
                    fields: editableFields,
                    model: task,
                    clearContainer: false,
                    validateOnBlur: true,
                    target: that.options.target
                }).data('kendoEditable');
                kendo.cycleForm(container);
                if (!this.trigger('edit', {
                        container: container,
                        model: task
                    })) {
                    container.data('kendoWindow').center().open();
                    container.on(CLICK + NS, DOT + ganttStyles.buttonCancel, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        that.trigger('cancel', {
                            container: container,
                            model: task
                        });
                    });
                    container.on(CLICK + NS, DOT + ganttStyles.buttonSave, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var fields = that.fields(editors.desktop, task, plannedEditors);
                        var updateInfo = {};
                        var field;
                        for (var i = 0, length = fields.length; i < length; i++) {
                            field = fields[i].field;
                            updateInfo[field] = task.get(field);
                        }
                        that.trigger('save', {
                            container: container,
                            model: task,
                            updateInfo: updateInfo
                        });
                    });
                    container.on(CLICK + NS, DOT + ganttStyles.buttonDelete, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        that.trigger('remove', {
                            container: container,
                            model: task
                        });
                    });
                } else {
                    that.trigger('cancel', {
                        container: container,
                        model: task
                    });
                }
                return editableWidget;
            }
        });
        var ResourceEditor = Widget.extend({
            init: function (element, options) {
                Widget.fn.init.call(this, element, options);
                this.wrapper = this.element;
                this.model = this.options.model;
                this.resourcesField = this.options.resourcesField;
                this.createButton = this.options.createButton;
                this._initContainer();
                this._attachHandlers();
            },
            events: ['save'],
            close: function () {
                this.window.bind('deactivate', proxy(this.destroy, this)).close();
            },
            destroy: function () {
                this._dettachHandlers();
                this.grid.destroy();
                this.grid = null;
                this.window.destroy();
                this.window = null;
                Widget.fn.destroy.call(this);
                kendo.destroy(this.wrapper);
                this.element = this.wrapper = null;
            },
            open: function () {
                this.window.center().open();
            },
            _attachHandlers: function () {
                var grid = this.grid;
                var closeHandler = this._cancelProxy = proxy(this._cancel, this);
                this.container.on(CLICK + NS, DOT + ganttStyles.buttonCancel, this._cancelProxy);
                this._saveProxy = proxy(this._save, this);
                this.container.on(CLICK + NS, DOT + ganttStyles.buttonSave, this._saveProxy);
                this.window.bind('close', function (e) {
                    if (e.userTriggered) {
                        closeHandler(e);
                    }
                });
                grid.wrapper.on(CLICK + NS, 'input[type=\'checkbox\']', function () {
                    var element = $(this);
                    var row = $(element).closest('tr');
                    var model = grid.dataSource.getByUid(row.attr(kendo.attr('uid')));
                    var value = $(element).is(':checked') ? 1 : '';
                    model.set('value', value);
                });
            },
            _cancel: function (e) {
                e.preventDefault();
                this.close();
            },
            _createButtons: function () {
                var buttons = this.options.buttons;
                var html = '<div class="' + ganttStyles.popup.buttonsContainer + '">';
                for (var i = 0, length = buttons.length; i < length; i++) {
                    html += this.createButton(buttons[i]);
                }
                html += '</div>';
                this.container.append(html);
            },
            _dettachHandlers: function () {
                this._cancelProxy = null;
                this._saveProxy = null;
                this.container.off(NS);
                this.grid.wrapper.off();
            },
            _initContainer: function () {
                var that = this;
                var popupStyles = ganttStyles.popup;
                var dom = kendo.format('<div class="{0} {1}"><div class="{2} {3}"></div></div>"', popupStyles.form, popupStyles.editForm, popupStyles.formContainer, popupStyles.resourcesFormContainer);
                dom = $(dom);
                this.container = dom.find(DOT + popupStyles.resourcesFormContainer);
                this.window = dom.kendoWindow({
                    modal: true,
                    resizable: false,
                    draggable: true,
                    visible: false,
                    title: this.options.messages.resourcesEditorTitle,
                    open: function () {
                        that.grid.resize(true);
                    }
                }).data('kendoWindow');
                this._resourceGrid();
                this._createButtons();
            },
            _resourceGrid: function () {
                var that = this;
                var messages = this.options.messages;
                var element = $('<div id="resources-grid"/>').appendTo(this.container);
                this.grid = new kendo.ui.Grid(element, {
                    columns: [
                        {
                            field: 'name',
                            title: messages.resourcesHeader,
                            template: '<label><input type=\'checkbox\' value=\'#=name#\'' + '# if (value > 0 && value !== null) {#' + 'checked=\'checked\'' + '# } #' + '/>#=name#</labe>'
                        },
                        {
                            field: 'value',
                            title: messages.unitsHeader,
                            template: function (dataItem) {
                                var valueFormat = dataItem.format;
                                var value = dataItem.value !== null ? dataItem.value : '';
                                return valueFormat ? kendo.toString(value, valueFormat) : value;
                            }
                        }
                    ],
                    height: 280,
                    sortable: true,
                    editable: true,
                    filterable: true,
                    dataSource: {
                        data: that.options.data,
                        schema: {
                            model: {
                                id: 'id',
                                fields: {
                                    id: { from: 'id' },
                                    name: {
                                        from: 'name',
                                        type: 'string',
                                        editable: false
                                    },
                                    value: {
                                        from: 'value',
                                        type: 'number',
                                        validation: this.options.unitsValidation
                                    },
                                    format: {
                                        from: 'format',
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    },
                    save: function (e) {
                        var value = !!e.values.value;
                        e.container.parent().find('input[type=\'checkbox\']').prop('checked', value);
                    }
                });
            },
            _save: function (e) {
                e.preventDefault();
                this._updateModel();
                if (!this.wrapper.is(DOT + ganttStyles.popup.resourcesField)) {
                    this.trigger('save', {
                        container: this.wrapper,
                        model: this.model
                    });
                }
                this.close();
            },
            _updateModel: function () {
                var resources = [];
                var value;
                var data = this.grid.dataSource.data();
                for (var i = 0, length = data.length; i < length; i++) {
                    value = data[i].get('value');
                    if (value !== null && value > 0) {
                        resources.push(data[i]);
                    }
                }
                this.model[this.resourcesField] = resources;
            }
        });
        kendo.gantt = {
            TaskDropDown: TaskDropDown,
            Editor: Editor,
            PopupEditor: PopupEditor,
            ResourceEditor: ResourceEditor
        };
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));