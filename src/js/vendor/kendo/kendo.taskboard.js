/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('taskboard/toolbar',["../kendo.toolbar"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        ToolBar = kendo.ui.ToolBar,
        Item = kendo.toolbar.Item,

        CLICK = "click",
        TOGGLE = "toggle",
        CLOSE = "close",
        ACTION = "action",
        CHANGE = "change",
        NS = ".taskBoardToolbar";

    var TaskBoardToolbarStyles = {
        searchbox: "k-searchbox k-textbox k-input k-input-md k-rounded-md k-input-solid",
        searchIcon: "k-input-icon k-icon k-i-search",
        searchInput: "k-input-inner"
    };

    var TaskBoardToolBar = ToolBar.extend({
        init: function(element, options) {
            var that = this;

            that._extendOptions(options);

            ToolBar.fn.init.call(that, element, options);

            that._attachEvents();
        },

        events: ToolBar.fn.events.concat([
            ACTION
        ]),

        defaultTools: {
            addColumn: { type: "button", text: "Add Column", name: "addColumn", command: "AddColumnCommand", icon: "plus", rules: "isEditable" },
            spacer: { type: "spacer" },
            search: { type: "TaskBoardSearch", text: "Search", name: "search", command: "SearchCommand", icon: "search", overflow: "never", rules: "isSearchable" }
        },

        _attachEvents: function() {
            var that = this;

            that.bind(TOGGLE, that._click.bind(that));
            that.bind(CLOSE, that._click.bind(that));
            that.bind(CLICK, that._click.bind(that));
            that.bind(CHANGE, that._change.bind(that));
        },

        _extendOptions: function(options) {
            var that = this,
                tools = options.items ? options.items : Object.keys(that.defaultTools);

            that.options = options;

            that.options.items = that._extendToolsOptions(tools);
        },

        _extendToolsOptions: function(tools) {
            var that = this,
                messages = that.options.messages;

            if (!tools.length) {
                return;
            }

            return tools.map(function (tool) {
                var isBuiltInTool =  $.isPlainObject(tool) && Object.keys(tool).length === 1 && tool.name,
                    attr = {},
                    toolOptions;


                tool = isBuiltInTool ? tool.name : tool;
                toolOptions = $.isPlainObject(tool) ? tool : extend({}, that.defaultTools[tool] || { name: tool, command: tool + "Command", type: "button" });

                if(!that._validateRules(toolOptions)) {
                    return { hidden: true };
                }

                attr[kendo.attr("command")] = toolOptions.command;
                attr[kendo.attr("options")] = toolOptions.options;

                kendo.deepExtend(toolOptions, {
                    id: toolOptions.id || toolOptions.name + "-" + kendo.guid(),
                    name: toolOptions.name,
                    text: messages[toolOptions.name] || toolOptions.name,
                    attributes: extend({
                        "aria-label": messages[toolOptions.name] || toolOptions.name,
                        "title": messages[toolOptions.name]
                    }, attr),
                    overflow: toolOptions.overflow
                });

                if(toolOptions.type === "buttonGroup") {
                    toolOptions.buttons = toolOptions.buttons.map(that._mapButtonGroups.bind(that));
                }

                if(toolOptions.type === "splitButton") {
                    toolOptions.menuButtons = toolOptions.menuButtons.map(that._mapMenuButtons.bind(that));
                }

                return toolOptions;
            }, that);
        },

        _mapButtonGroups: function(button) {
            var that = this,
                messages = that.options.messages,
                attr = {};

            attr[kendo.attr("command")]= button.command;
            attr[kendo.attr("options")]= button.options;

            return kendo.deepExtend(button, {
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name]
                }, attr)
            });
        },

        _mapMenuButtons: function(button) {
            var that = this,
                messages = that.options.messages,
                attr = {};

            attr[kendo.attr("command")]= button.command;
            attr[kendo.attr("options")]= button.options;

            return kendo.deepExtend(button,{
                text: messages[button.name],
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name]
                }, attr)
            });
        },

        _validateRules: function (tool) {
            var that = this,
                states = that.options.states,
                rules = tool.rules ? tool.rules.split(";") : [];

            if(!rules.length) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if(!states[rules[i]]){
                    return false;
                }
            }

            return true;
        },

        _click: function(ev) {
            var command = $(ev.target).attr(kendo.attr("command")),
                options = $(ev.target).attr(kendo.attr("options"));

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: options
            });
        },

        _change: function (ev) {
            var command = $(ev.target).attr(kendo.attr("command")),
                options = $(ev.target).attr(kendo.attr("options"));

            options = extend({}, options, { value: $(ev.target).val() });

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: options
            });
        },

        isToolEnabled: function(toolName) {
            var that = this,
                options = that.options,
                found = false;

            for(var i = 0; i < options.items.length; i++) {
                if (options.items[i].name == toolName) {
                    found = true;
                    break;
                }
            }

            return options.items[toolName] || found;
        },

        action: function (args) {
            this.trigger(ACTION, args);
        },

        destroy: function () {
            if(this.search) {
                this.search.destroy();
            }

            ToolBar.fn.destroy.call(this);
        }
    });

    var SearchTool = Item.extend({
        init: function(options, toolbar) {
            var that = this,
                styles = TaskBoardToolBar.styles,
                element = $("<span class='" + styles.searchbox  + "'></span>"),
                icon = $("<span class='" + styles.searchInputIcon + "'></span>"),
                input = $("<input class='" + styles.searchInput + "' autocomplete='off' />");

            that.element = element;
            that.input = input;
            that.icon = icon;
            that.options = options;
            that.options.type = "taskBoardSearch";
            that.toolbar = toolbar;

            that.attributes();
            that.renderIcon();
            that.addUidAttr();
            that.addIdAttr();
            that.addOverflowAttr();

            that.input.attr({
                placeholder: that.options.text,
                title: that.options.text
            });

            that.element.append(icon).append(that.input);

            that._bindEvents();
            that.toolbar.search = that;
        },
        attributes: function () {
            if (this.options.attributes) {
                this.input.attr(this.options.attributes);
            }
        },
        renderIcon: function() {
            if (this.options.icon) {
                this.icon.addClass(TaskBoardToolBar.styles.searchIcon);
            }
        },
        _bindEvents: function(){
            this._inputHandler = this._input.bind(this);
            this.input.on("input" + NS, this._inputHandler);
        },
        _input: function (ev) {
            this.toolbar.trigger(CHANGE, {target: ev.target});
        },
        destroy: function(){
            this.element.off(NS);
        }
    });

    kendo.toolbar.registerComponent("TaskBoardSearch", SearchTool);


    extend(kendo.ui, {
        taskboard: {
            ToolBar: TaskBoardToolBar
        }
    });

    extend(true, kendo.ui.taskboard.ToolBar, { styles: TaskBoardToolbarStyles });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('taskboard/column',["../kendo.sortable"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Observable = kendo.Observable,
        extend = $.extend,

        DOT = ".",
        NS = DOT + "kendoTaskBoardColumn",

        CLICK = "click",
        BLUR = "blur",

        MOVE = "move",
        MOVE_START = "moveStart",
        MOVE_END = "moveEnd",
        CHANGE = "change",
        ACTION = "action";

    var TaskBoardColumnStyles = {
        element: "k-taskboard-column",
        header: "k-taskboard-column-header",
        headerText: "k-taskboard-column-header-text",
        ellipsis: "k-text-ellipsis",
        spacer: "k-spacer",
        actions: "k-taskboard-column-header-actions",
        cardsContainer: "k-taskboard-column-cards-container",
        columnCards: "k-taskboard-column-cards",
        actionButton: "k-taskboard-column-action-button",
        button: "k-button k-icon-button k-button-md k-rounded-md k-button-flat k-button-flat-base",
        card: "k-taskboard-card",
        cardTitle: "k-card-title",
        sortableSuffix: "-kendosortable",
        textbox: "k-textbox k-input k-input-md k-rounded-md k-input-solid",
        input: "k-input-inner",
        newColumn: "k-taskboard-column-new",
        editColumn: "k-taskboard-column-edit",
        disabled: "k-state-disabled",
        dragPlaceholder: "k-taskboard-drag-placeholder",
        dragHint: "k-taskboard-drag-hint",
        ignoreDrag: "k-taskboard-drag-ignore",
        grabbingCursor: "k-cursor-grabbing"
    };

    function preventDefault(ev) { ev.preventDefault(); }

    var TaskBoardColumn = Observable.extend({
        init: function (options, dataItem) {
            var that = this;

            that._dataItem = dataItem;
            that.options = extend(true, {}, options);

            that.sortableUniqueClass = that.options.sortableIdentifier + TaskBoardColumn.styles.sortableSuffix;
            that._render();
            that._attachEvents();

            if(options.states.isReorderable) {
                that._initSortable();
            }

            Observable.fn.init.call(that);
        },

        empty: function () {
            var that = this;
            that.container.empty();
        },

        addCard: function (cardHtml) {
            var that = this;
            that.container.append(cardHtml);
        },

        edit: function () {
            var that = this,
                styles = TaskBoardColumn.styles;

            that.element.addClass(styles.editColumn);
            that._renderEditHeader();
        },

        getDataItem: function () {
            return this._dataItem;
        },

        cards: function () {
            var that = this;

            return that.container.children();
        },

        template: '<div class="#: styles.headerText # #: styles.ellipsis #">{0}</div>' +
                  '<span class="#: styles.spacer #"></span>' +
                  '#=buttons#',

        editTemplate: '<div class="#: styles.headerText # #: styles.ellipsis #">' +
                        '<span class="#: styles.textbox #">' +
                            '<input class="#: styles.input #" placeholder="#: {0} ? messages.editColumn : messages.newColumn #" #:kendo.attr("command")#="SaveColumnCommand" value="#:{0}#" />' +
                        '</span>' +
                        '</div>' +
                        '<span class="#: styles.spacer #"></span>' +
                        '#=buttons#',

        actionButton: '<button class="#: styles.actionButton # #: styles.button #" title="#:text#" #:kendo.attr("command")#="#:command#" #if(options){##:kendo.attr("options")#="#:options#"#}#>' +
                        '<i class="k-button-icon #:icon# #:spriteCssClass#"></i>' +
                      '</button>',

        builtinButtons: {
            "editColumn": { name: "editColumn", icon: "edit", text: "Edit Column", command: "EditColumnCommand", rules: "isEditable" },
            "addCard": { name: "addCard", icon: "add", text: "Add Card", command: "AddCardCommand", rules: "isEditable" },
            "deleteColumn": { name: "deleteColumn", icon: "close", text: "Delete Column", command: "DeleteColumnCommand", rules: "isEditable" }
        },

        defaultButtons: [ "editColumn", "addCard", "deleteColumn" ],

        _render: function () {
            var that = this,
                styles = TaskBoardColumn.styles,
                headerLabelId = kendo.guid(),
                element = $("<div class='" + styles.element + "'></div>")
                    .attr(kendo.attr("uid"), that._dataItem.uid)
                    .css({
                        width: that.options.width
                    })
                    .attr("role", "list").attr("aria-labelledby", headerLabelId),
                header = $("<div class='" + styles.header + "'></div>"),
                cardsContainer = $("<div class='" + styles.cardsContainer + "'></div>"),
                columnCards = $("<div class='" + styles.columnCards + "'></div>");

            that.header = header.appendTo(element).attr("id", headerLabelId);

            that._renderHeader();

            cardsContainer.appendTo(element);
            that.container = columnCards
                                .appendTo(cardsContainer)
                                .addClass(that.sortableUniqueClass);

            that.element = element;
        },

        _renderHeader: function () {
            var that = this,
                styles = TaskBoardColumn.styles,
                options = that.options,
                template = options.template ? options.template : kendo.format(that.template, "#:" + options.dataTextField + "#");

            that.header.append(kendo.template(template)(extend(true, {}, {
                styles: styles,
                buttons: that._buildActionsHtml()
            }, that._dataItem)));
        },

        _renderEditHeader: function () {
            var that = this,
                styles = TaskBoardColumn.styles,
                options = that.options,
                template = options.editTemplate ? options.editTemplate : kendo.format(that.editTemplate, options.dataTextField);

            that.header.html("");

            that.header.append(kendo.template(template)(extend(true, {}, {
                styles: styles,
                messages: options.messages,
                buttons: that._buildActionsHtml()
            }, that._dataItem)));

            setTimeout(function () {
                that.header.find("input").trigger("focus");
            }, 0);

            that.header.find(DOT + styles.actions).addClass(styles.disabled);
        },

        _buildActionsHtml: function () {
            var that = this,
                options = that.options,
                messages = options.messages,
                buttons = options.buttons || that.defaultButtons,
                styles = TaskBoardColumn.styles,
                html = "<div class='" + styles.actions + "'>";

            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button = ($.isPlainObject(button) && Object.keys(button).length === 1 && button.name) ? button.name : button;

                if(typeof button === "string") {
                    button = extend(true, {},
                        that.builtinButtons[button] || { spriteCssClass: button, command: button + "Command" },
                        { text: messages[button] || button }
                    );
                } else if ($.isPlainObject(button) && button.name) {
                    button = extend(true, button,
                        { text: messages[button.name] }
                    );
                }

                if (!that._validateRules(button)) {
                    continue;
                }

                var icon = button.icon ? "k-icon k-i-" + button.icon : "";

                button.icon = icon;
                button.spriteCssClass = button.spriteCssClass || "";

                html += kendo.template(that.actionButton)(extend(true, {}, {
                    styles: styles,
                    options: false
                }, button));
            }

            html += "</div>";

            return html;
        },

        _validateRules: function (tool) {
            var that = this,
                states = that.options.states,
                rules = tool.rules ? tool.rules.split(";") : [];

            if(!rules.length) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if(!states[rules[i]]){
                    return false;
                }
            }

            return true;
        },

        _actionClick: function (ev) {
            var that = this,
                target = $(ev.target).closest("[" + kendo.attr("command") + "]"),
                command = target.attr(kendo.attr("command")),
                options = target.attr(kendo.attr("options"));

            options = typeof(options) === "string" ? { value: options } : options;

            if (!command) {
                return;
            }

            that.trigger(ACTION, {
                command: command,
                options: extend({ target: target }, options)
            });
        },

        _textboxBlur: function (ev) {
            var that = this,
                target = $(ev.target).closest("[" + kendo.attr("command") + "]"),
                command = target.attr(kendo.attr("command")),
                options = target.attr(kendo.attr("options"));

            options = typeof(options) === "string" ? { value: options } : options;

            if (!command) {
                return;
            }

            that.trigger(ACTION, {
                command: command,
                options: extend({ target: target }, options)
            });
        },

        _attachEvents: function () {
            var that = this;

            that.header.on(CLICK + NS,
                DOT + TaskBoardColumn.styles.actionButton,
                that._actionClick.bind(that));

            that.header.on(BLUR + NS,
                DOT + TaskBoardColumn.styles.input,
                that._textboxBlur.bind(that));

            that.header.on("keyup" + NS,
                DOT + TaskBoardColumn.styles.input,
                function (ev) {
                    if (ev.keyCode === kendo.keys.ENTER) {
                        that._textboxBlur(ev);
                    }
                }
            );

            if (that.container) {
                that.container.on(CLICK + NS,
                    DOT + TaskBoardColumn.styles.card + " [" + kendo.attr("command") + "]",
                    that._actionClick.bind(that));

                that.container.on(CLICK + NS,
                    DOT + TaskBoardColumn.styles.card + " a." + TaskBoardColumn.styles.cardTitle,
                    preventDefault);

            }
        },

        _initSortable: function () {
            var that = this,
                isRtl = that.options.states.isRtl,
                dirClass = isRtl ? " k-rtl" : "",
                container = that.container;

            if (!that.container) {
                return;
            }

            that.sortable = new ui.Sortable(container, {
                ignore: DOT + TaskBoardColumn.styles.ignoreDrag + " *",
                connectWith: DOT + that.sortableUniqueClass,
                filter: DOT + TaskBoardColumn.styles.card,
                hint: function(element) {
                    return element.clone()
                        .addClass(TaskBoardColumn.styles.dragHint + " " + TaskBoardColumn.styles.grabbingCursor + dirClass)
                        .css({
                        width: element[0].offsetWidth,
                        height: element[0].offsetHeight
                    });
                },
                placeholder: function(element) {
                    return $("<div></div>")
                        .addClass(TaskBoardColumn.styles.dragPlaceholder)
                        .css({
                            height: element[0].offsetHeight
                        });
                },
                move: that._move.bind(that),
                start: that._start.bind(that),
                end: that._end.bind(that),
                change: that._change.bind(that)
            });

            that.sortable.draggable.userEvents.unbind("select");
            that.sortable.draggable.userEvents.bind("select", that._select.bind(that));
        },

        _select: function (ev) {
            var ignoreDragSelectors = TaskBoardColumn.ignoreDragSelectors;
            var target = $(ev.event.target);

            for (var i = 0; i < ignoreDragSelectors.length; i++) {
                if (target.is(ignoreDragSelectors[i])) {
                    ev.preventDefault();
                    break;
                }
            }
        },

        _move: function (ev) {
            extend(ev, {
                columnElement: ev.sender.element.parents(DOT + TaskBoardColumn.styles.element)
            });
            this.trigger(MOVE, ev);
        },

        _start: function (ev) {
            extend(ev, {
                columnElement: ev.sender.element.parents(DOT + TaskBoardColumn.styles.element)
            });
            this.trigger(MOVE_START, ev);
        },

        _end: function (ev) {
            extend(ev, {
                columnElement: ev.sender.element.parents(DOT + TaskBoardColumn.styles.element)
            });
            this.trigger(MOVE_END, ev);
        },

        _change: function (ev) {
            var that = this;

            extend(ev, {
                columnElement: ev.sender.element.parents(DOT + TaskBoardColumn.styles.element)
            });

            that.trigger(CHANGE, ev);

            if ((ev.action === "receive" && ev.newIndex >= 0) || (ev.action === "sort" && ev.newIndex !== ev.oldIndex)) {
                that.trigger(ACTION, {
                    command: "MoveCardCommand",
                    options: ev
                });
            }
        },

        destroy: function () {
            var that = this;

            that.header.off(NS);
            that.container.off(NS);

            if (that.sortable) {
                that.sortable.destroy();
            }
        }
    });

    var TaskBoardNewColumn = TaskBoardColumn.extend({
        _render: function () {
            var that = this,
                styles = TaskBoardColumn.styles,
                element = $("<div class='" + styles.element + "'></div>").addClass(styles.newColumn).attr(kendo.attr("uid"), that._dataItem.uid),
                header = $("<div class='" + styles.header + "'></div>");

            that.header = header.appendTo(element);

            that._renderEditHeader();

            that.element = element;
        }
    });

    extend(kendo.ui.taskboard, {
        Column: TaskBoardColumn,
        NewColumn: TaskBoardNewColumn
    });

    extend(true, kendo.ui.taskboard.Column, {
        styles: TaskBoardColumnStyles,
        ignoreDragSelectors: ["img"]
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('taskboard/card',["../kendo.core"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        Observable = kendo.Observable,
        extend = $.extend;

    var TaskBoardCardStyles = {
        element: "k-taskboard-card",
        card: "k-card",
        header: "k-card-header",
        hbox: "k-hbox",
        title: "k-card-title",
        link: "k-link",
        spacer: "k-spacer",
        button: "k-button",
        cardMenuButton: "k-taskboard-card-menu-button k-icon-button",
        flatButton: "k-button-md k-rounded-md k-button-flat k-button-flat-base",
        body: "k-card-body",
        actionsIcon: "k-icon k-i-more-vertical",
        moveCursor: "k-cursor-move",
        categoryBorder: "k-taskboard-card-category",
        headerActions: "k-card-header-actions",
        disabled: "k-state-disabled"
    };

    var TaskBoardCard = Observable.extend({
        init: function (options, dataItem, resources) {
            var that = this;

            that._dataItem = dataItem;
            that.resources = resources;

            that.options = extend(true, {}, options);

            that._render();

            Observable.fn.init.call(that);
        },

        headerTemplate: '<div class="#:styles.header# #:styles.hbox#">' +
                            '<a class="#:styles.title# #:styles.link#" href="\\#" #if(selectable){##:kendo.attr("command")#="SelectCardCommand"#}#>#:{0}#</a>' +
                            '<span class="#:styles.spacer#"></span>' +
                            '#=cardMenuButton#' +
                        '</div>',
        bodyTemplate: '<div class="#:styles.body#"><p>#:{0}#</p></div>',
        cardMenuButtonTemplate: '<div class="#:styles.headerActions#"><button aria-label="menu" class="#:styles.button# #:styles.flatButton# #:styles.cardMenuButton#">' +
                                    '<span class="k-button-icon #:styles.actionsIcon#"></span>' +
                                '</button></div>',

        _render: function(){
            var that = this,
                options = that.options,
                styles = TaskBoardCard.styles,
                template = options.template || that._buildTemplate(),
                element = $("<div class='" + styles.element + " " + styles.card + " " + styles.moveCursor + "'></div>"),
                cardMenuButtonTemplate = options.cardMenu ? that.cardMenuButtonTemplate : "",
                resources = that._resources(that._dataItem),
                borderDir = options.states.isRtl ? "borderRightColor" : "borderLeftColor",
                categoryColor;

            element
                .attr(kendo.attr("uid"), that._dataItem.uid)
                .attr("aria-disabled", !options.states.isDisabled)
                .attr("role", "listitem")
                .toggleClass(styles.disabled, options.states.isDisabled);

            categoryColor = (resources[options.dataCategoryField] && resources[options.dataCategoryField].color) ||
                                that._dataItem.get(options.dataCategoryField);

            if (categoryColor) {
                element.addClass(styles.categoryBorder).css(borderDir, categoryColor);
            }

            element.append(kendo.template(template)(extend(true, {}, {
                styles: styles,
                cardMenuButton: kendo.template(cardMenuButtonTemplate)({ styles: styles }),
                selectable: options.states.isSelectable,
                resources: resources
            }, that._dataItem)));

            that.element = element;
        },

        _resources: function(card) {
            var that = this,
                resources = {};

            if (!that.resources) {
                return resources;
            }

            for (var key in that.resources) {
                var resource = that.resources[key];
                var field = resource.field;
                var cardResources = kendo.getter(field)(card);

                if (!cardResources) {
                    continue;
                }

                if (!resource.multiple) {
                    cardResources = [cardResources];
                }

                var data = resource.dataSource.view();

                for (var resourceIndex = 0; resourceIndex < cardResources.length; resourceIndex++) {
                    var cardResource = null;

                    var value = cardResources[resourceIndex];

                    if (!resource.valuePrimitive) {
                        value = kendo.getter(resource.dataValueField)(value);
                    }

                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        if (data[dataIndex].get(resource.dataValueField) == value) {
                            cardResource = data[dataIndex];
                            break;
                        }
                    }

                    if (cardResource !== null) {
                        var resourceColor = kendo.getter(resource.dataColorField)(cardResource);
                        var result = {
                            field: resource.field,
                            title: resource.title,
                            name: resource.name,
                            text: kendo.getter(resource.dataTextField)(cardResource),
                            value: value,
                            color: resourceColor
                        };

                        if(resource.multiple){
                            if(resources[resource.field]) {
                                resources[resource.field].push(result);
                            } else {
                                resources[resource.field] = [result];
                            }
                        } else {
                            resources[resource.field] = result;
                        }
                    }
                }
            }
            return resources;
        },

        _buildTemplate: function () {
            var that = this,
                options = that.options,
                headerTemplate = kendo.format(that.headerTemplate, options.dataTitleField),
                bodyTemplate = kendo.format(that.bodyTemplate, options.dataDescriptionField);

            return headerTemplate + bodyTemplate;
        }
    });

    extend(kendo.ui.taskboard, {
        Card: TaskBoardCard
    });

    extend(true, kendo.ui.taskboard.Card, { styles: TaskBoardCardStyles });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('taskboard/cardmenu',["../kendo.menu"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        template = kendo.template,
        ContextMenu = kendo.ui.ContextMenu,

        ACTION = "action";

    var TaskBoardCardMenu = ContextMenu.extend({
        init: function(element, options) {
            var that = this;

            ContextMenu.fn.init.call(that, element, options);

            that._overrideTemplates();
            that._extendItems();

            that.bind("select", that._onSelect.bind(that));
            that.bind("open", that._onOpen.bind(that));
            that.bind("activate", that._focus.bind(that));
        },

        _overrideTemplates: function(){
            this.templates.sprite = template("#if(spriteCssClass) {#<span class='#: spriteCssClass #'></span>#}#");
        },

        defaultItems: {
            "editCard": { name: "editCard", text: "Edit card", icon: "edit", command: "EditCardCommand", rules: "isEditable" },
            "deleteCard": { name: "deleteCard", text: "Delete card", icon: "delete", command: "DeleteCardCommand", rules: "isEditable" }
        },

        events: ContextMenu.fn.events.concat([
            ACTION
        ]),

        _extendItems: function(){
            var that = this,
                items = that.options.items,
                item, isBuiltInTool;

            if(items && items.length){
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    isBuiltInTool =  $.isPlainObject(item) && Object.keys(item).length === 1 && item.name;

                    if (isBuiltInTool) {
                        item = item.name;
                    }

                    if ($.isPlainObject(item)) {
                        that._append(item);
                    } else if (that.defaultItems[item]) {
                        item = that.defaultItems[item];
                        that._append(item);
                    } else if (typeof(item) === "string") {
                        item = { name: item, text: item, spriteCssClass: item, command: item + "Command" };
                        that._append(item);
                    }
                }
            } else {
                for (var key in that.defaultItems) {
                    item = that.defaultItems[key];
                    that._append(item);
                }
            }
        },

        _append: function (item) {
            var that = this;

            that._extendItem(item);

            if (that._validateRules(item)) {
                that.append(item);
            }
        },

        _extendItem: function(item) {
            var that = this,
                messages = that.options.messages,
                icon = item.icon ? "k-icon k-i-" + item.icon : "",
                attr = {};

            attr[kendo.attr("command")] = item.command;

            if(item.options) {
                attr[kendo.attr("options")] = item.options;
            }

            extend(item, {
                text: messages[item.name],
                spriteCssClass: icon + " " + item.spriteCssClass || "",
                attr: attr,
                uid: kendo.guid()
            });
        },

        _validateRules: function (tool) {
            var that = this,
                states = that.options.states,
                rules = tool.rules ? tool.rules.split(";") : [];

            if(!rules.length) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if(!states[rules[i]]){
                    return false;
                }
            }

            return true;
        },

        _onSelect: function(ev) {
            var command = $(ev.item).attr(kendo.attr("command")),
                options = $(ev.item).attr(kendo.attr("options")),
                target = $(ev.target);

            options = typeof(options) === "string" ? { value: options } : options;

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: extend({ target: target }, options)
            });
        },

        _onOpen: function(ev) {
            var menu = ev.sender,
                items = menu.options.items;

            if (!items && $.isEmptyObject(this.defaultItems)) {
                ev.preventDefault();
            }
        },

        _focus: function (ev) {
            if (ev.sender) {
                ev.sender.element.trigger("focus");
            }
        },

        action: function (args) {
            this.trigger(ACTION, args);
        }
    });

    extend(kendo.ui.taskboard, {
        CardMenu: TaskBoardCardMenu
    });

    })(window.kendo.jQuery);

    return window.kendo;

    }, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function (f, define) {
    define('taskboard/commands',["../kendo.dialog"], f);
})(function () {

    (function ($, undefined) {
        var kendo = window.kendo,
            extend = $.extend,
            isPlainObject = $.isPlainObject,
            Class = kendo.Class;

        var TaskBoardCommand = Class.extend({
            init: function (options) {
                this.options = options;
                this.taskboard = options.taskboard;
            },
            _confirm: function (title, content, okText, cancel) {
                var that = this,
                    taskboard = that.taskboard,
                    taskboardOptions = taskboard.options,
                    confirm;

                if (isPlainObject(taskboardOptions.editable) && taskboardOptions.editable.confirmation === false ) {
                    var fakePromise = $.Deferred();
                    fakePromise.resolve();
                    return fakePromise;
                }

                confirm = $("<div></div>").kendoConfirm(extend({}, {
                    title: title,
                    content: content,
                    messages: {
                        okText: okText,
                        cancel: cancel
                    },
                    buttonLayout: "normal"
                })).data("kendoConfirm");

                confirm.open();

                setTimeout(function () {
                    confirm.element.trigger("focus");
                });

                return confirm.result;
            }
        });

        // Column commands
        var AddColumnCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard;

                if (taskboard.trigger("editColumn", { column: null })) {
                    return;
                }

                taskboard.columns().each(function(index, column){
                    taskboard.enableByColumn(column, false);
                });
                taskboard.addColumn();
            }
        });

        var EditColumnCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    options = that.options,
                    taskboard = that.taskboard;

                if (taskboard.trigger("editColumn", { column: options.column })) {
                    return;
                }

                taskboard.columns().each(function(index, column){
                    taskboard.enableByColumn(column, false);
                });
                taskboard.editColumn(options.columnElement);
            }
        });

        var DeleteColumnCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    options = that.options,
                    taskboard = that.taskboard,
                    taskboardOptions = taskboard.options,
                    messages = taskboardOptions.messages,
                    columnDS = taskboard.columnsDataSource;

                var result = that._confirm(messages.deleteColumn, messages.deleteColumnConfirm, messages["delete"], messages.cancel);

                result.done(function () {
                    if (taskboard.trigger("deleteColumn", { column: options.column })) {
                        taskboard.dataSource.cancelChanges();
                        return;
                    }

                    columnDS.remove(options.column);
                    columnDS.sync();
                });
            }
        });

        var SaveColumnCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    options = that.options,
                    taskboard = that.taskboard,
                    columnSettings = taskboard.options.columnSettings,
                    columnDS = taskboard.columnsDataSource,
                    column = options.column,
                    text = options.target.val();

                if (taskboard.trigger("saveColumn", { column: options.column })) {
                    taskboard.dataSource.cancelChanges();
                    return;
                }

                column.set(columnSettings.dataTextField, text);
                columnDS.sync();
            }
        });

        var CancelEditColumnCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    columnDS = taskboard.columnsDataSource;

                columnDS.cancelChanges();
            }
        });

        //Move focus command
        var MoveFocusCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    options = that.options,
                    cardElement = options.cardElement,
                    columnElement = options.columnElement,
                    columns = taskboard.columns(),
                    currentColumnIndex = columnElement.index(),
                    direction = options.value,
                    columnIndex, column;

                switch (direction) {
                    case "left":
                        columnIndex = Math.max(0, currentColumnIndex - 1);
                        break;
                    case "right":
                        columnIndex = Math.min(columns.length - 1,  currentColumnIndex + 1);
                        break;
                    default:
                        columnIndex = currentColumnIndex;
                        break;
                }

                that.columns = columns;
                that.columnIndex = columnIndex;
                that.column = column = taskboard._getColumnByElement(columns.eq(columnIndex));
                that.cards = column.cards();

                if (cardElement) {
                    that._moveFromCardFocus(direction, cardElement);
                } else if (columnElement && direction === "down") {
                    that.cards.eq(0).trigger("focus");
                } else {
                    columns.eq(columnIndex).trigger("focus");
                }
            },
            _moveFromCardFocus: function (direction, cardElement) {
                var that = this,
                    currentIndex = cardElement.index(),
                    focusCard, index, seekFocusableCard = false;

                switch (direction) {
                    case "up":
                        index = currentIndex - 1;
                        break;
                    case "down":
                        index = currentIndex + 1;
                        break;
                    default:
                        seekFocusableCard = true;
                        index = currentIndex;
                        break;
                }

                focusCard = that.cards.eq(index);

                if (!focusCard.length && seekFocusableCard) {
                    focusCard = that._getFocusableCard(index, direction);
                }

                if (index >= 0) {
                    focusCard.trigger("focus");
                } else {
                    that.options.columnElement.focus();
                }
            },
            _getFocusableCard: function (index, direction) {
                var that = this,
                    lastIndex = that.cards.length - 1,
                    focusable = that.cards.eq(Math.min(index, lastIndex));

                if(focusable.length) {
                    return focusable;
                }

                if(that.columnIndex <= 0 || that.columnIndex >= that.columns.length - 1) {
                    return;
                }

                switch (direction) {
                    case "left":
                        that.columnIndex = Math.max(0, that.columnIndex - 1);
                        break;
                    case "right":
                        that.columnIndex = Math.min(that.columns.length - 1,  that.columnIndex + 1);
                        break;
                }

                that.column = that.taskboard._getColumnByElement(that.columns.eq(that.columnIndex));
                that.cards = that.column.cards();

                return that._getFocusableCard(index, direction);

            }
        });

        // Card commands
        var TaskBoardBaseCardCommand = TaskBoardCommand.extend({
            _updateOrder: function (column, currentIndex) {
                var that = this,
                    taskboard = that.taskboard,
                    taskBoardOptions = taskboard.options,
                    dataOrderField = taskBoardOptions.dataOrderField,
                    options = that.options,
                    currentCard = options.card,
                    cardIndex = options.cardElement ? options.cardElement.index() : column.cards().length,
                    newIndex = currentIndex,
                    cards = column.cards().map(function (idx, card) {
                        return taskboard.dataItem(card);
                    }),
                    prevCard = cards[cardIndex - 1],
                    nextCard;

                    currentCard.set(dataOrderField, newIndex);

                    if (prevCard && prevCard.get(dataOrderField) >= currentCard.get(dataOrderField)) {
                        currentCard.set(dataOrderField, prevCard.get(dataOrderField) + 1);
                    }

                    for (var i = newIndex + 1; i < cards.length; i++) {
                        nextCard = cards[i];

                        if (nextCard.get(dataOrderField) <= currentCard.get(dataOrderField)) {
                            nextCard.set(dataOrderField, currentCard.get(dataOrderField) + 1);
                            currentCard = nextCard;
                        } else {
                            break;
                        }
                    }
            }
        });

        var SelectCardCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    options = that.options,
                    cardElement = options.cardElement;

                taskboard._select(cardElement, true);
                cardElement.focus();
            }
        });

        var SaveChangesCommand = TaskBoardBaseCardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    taskBoardOptions = taskboard.options,
                    options = that.options,
                    receivedStatus = options.card.get(taskBoardOptions.dataStatusField),
                    targetColumn = taskboard._getColumn(receivedStatus),
                    activeElm = $(document.activeElement);

                if (activeElm.length) {
                    activeElm.trigger("change");
                }

                if(taskboard.pane && taskboard.pane.form && !taskboard.pane.form.validate()) {
                    return;
                }

                if (taskboard.trigger("saveCard", { card: options.card })) {
                    taskboard.dataSource.cancelChanges();
                    return;
                }

                if (targetColumn && taskBoardOptions.dataOrderField) {
                    that._updateOrder(targetColumn, options.card.get(taskBoardOptions.dataOrderField));
                }

                taskboard.dataSource.sync().then(function () {
                    taskboard.columns().eq(0).trigger("focus");
                });
            }
        });

        var DeleteCardCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    messages = taskboard.options.messages,
                    options = that.options;

                var result = that._confirm(messages.deleteCard, messages.deleteCardConfirm, messages["delete"], messages.cancel);

                result
                    .done(function () {
                        if (taskboard.trigger("deleteCard", { card: options.card })) {
                            taskboard.dataSource.cancelChanges();
                            return;
                        }

                        taskboard.dataSource.remove(options.card);
                        taskboard.dataSource.sync().then(function () {
                            taskboard.columns().eq(0).trigger("focus");
                        });
                    })
                    .fail(function () {
                        options.cardElement.trigger("focus");
                    });
            }
        });

        var MoveCardCommand = TaskBoardBaseCardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    taskBoardOptions = taskboard.options,
                    columnSettings = taskBoardOptions.columnSettings,
                    options = that.options,
                    receivedStatus = options.column.get(columnSettings.dataStatusField);

                options.card.set(taskBoardOptions.dataStatusField, receivedStatus);

                if (taskBoardOptions.dataOrderField) {
                    that._updateOrder(taskboard._getColumn(receivedStatus), options.newIndex);
                }

                taskboard.dataSource.sync();
            }
        });

        var EditCardCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    options = that.options;

                if (taskboard.trigger("editCard", { card: options.card })) {
                    return;
                }

                taskboard._openPane(extend({
                    pane: "Edit"
                }, options));
            }
        });

        var AddCardCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    taskboard = that.taskboard,
                    options = that.options;

                if (taskboard.trigger("editCard", { card: null })) {
                    return;
                }
                taskboard.dataSource.cancelChanges();
                taskboard._openPane(extend({
                    pane: "Create"
                }, options));
            }
        });

        // Pane commands
        var OpenPaneCommand = TaskBoardCommand.extend({
            exec: function() {
                var that = this,
                    options = that.options,
                    taskboard = that.taskboard;

                taskboard._openPane({
                    pane: options.value,
                    card: options.card,
                    cardElement: options.cardElement,
                    column: options.column,
                    columnElement: options.columnElement
                });
            }
        });

        var ClosePaneCommand = TaskBoardCommand.extend({
            exec: function() {
                var that = this,
                    taskboard = that.taskboard;

                taskboard._closePane();
                taskboard.dataSource.cancelChanges();
            }
        });

        // Search command

        var SearchCommand = TaskBoardCommand.extend({
            exec: function () {
                var that = this,
                    value = that.options.value,
                    taskboard = that.taskboard,
                    taskboardOptions = taskboard.options,
                    searchOptions = taskboardOptions.search,
                    operator = searchOptions.operator,
                    fields = (searchOptions && searchOptions.fields) || [ taskboardOptions.dataTitleField, taskboardOptions.dataDescriptionField ],
                    filters;

                filters = that._buildFilters(fields, operator, value);

                taskboard.dataSource.filter(filters);
            },
            _buildFilters: function (fields, operator, value) {
                var filters = fields.map(function (field) {
                    return { field: field, operator: operator, value: value };
                });

                return  { logic: "or", filters: filters };
            }
        });

        extend(kendo.ui.taskboard, {
            Command: TaskBoardCommand,
            commands: {
                AddColumnCommand: AddColumnCommand,
                EditColumnCommand: EditColumnCommand,
                DeleteColumnCommand: DeleteColumnCommand,
                SaveColumnCommand: SaveColumnCommand,
                CancelEditColumnCommand: CancelEditColumnCommand,
                OpenPaneCommand: OpenPaneCommand,
                ClosePaneCommand: ClosePaneCommand,
                SelectCardCommand: SelectCardCommand,
                MoveFocusCommand: MoveFocusCommand,
                SaveChangesCommand: SaveChangesCommand,
                DeleteCardCommand: DeleteCardCommand,
                MoveCardCommand: MoveCardCommand,
                EditCardCommand: EditCardCommand,
                AddCardCommand: AddCardCommand,
                SearchCommand: SearchCommand
            }
        });

    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });
(function(f, define){
    define('taskboard/pane',["../kendo.form"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        Observable = kendo.Observable,

        Form = kendo.ui.Form,

        DOT = ".",
        NS = DOT + "kendoTaskBoardPane",

        ACTION = "action",
        CLICK = "click";

    var TaskBoardPaneStyles = {
        element: "k-taskboard-pane",
        edit: "k-taskboard-edit-pane",
        preview: "k-taskboard-preview-pane",
        header: "k-taskboard-pane-header",
        headerText: "k-taskboard-pane-header-text",
        spacer: "k-spacer",
        headerActions: "k-taskboard-pane-header-actions",
        flatButton: "k-button k-icon-button k-button-md k-rounded-md k-button-flat k-button-flat-base",
        content: "k-taskboard-pane-content",
        footerActions: "k-taskboard-pane-actions",
        footerActionButtons: "k-actions k-hstack k-justify-content-end",
        footerButton: "k-button k-button-md k-rounded-md k-button-solid",
        baseButton: "k-button-solid-base",
        primaryButton: "k-button-solid-primary"
    };

    var TaskBoardPane = Observable.extend({
        init: function(taskboard, options, dataItem, resources){
            var that = this;

            that.taskboard = taskboard;
            that._dataItem = dataItem;
            that.resources = resources;
            that.options = extend(true, {}, options);

            that._render();

            that.element.on(CLICK + NS,
                "["+kendo.attr("command")+"]",
                that._commandClick.bind(that));

            Observable.fn.init.call(that);
        },
        headerTemplate: '<div class="#:styles.headerText#">{0}</div>' +
                        '<span class="#:styles.spacer#"></span>' +
                        '<div class="#:styles.headerActions#">' +
                            '<button class="#:styles.flatButton#" title="#:messages.close#" #:kendo.attr("command")#="ClosePaneCommand">' +
                                '<span class="k-button-icon k-icon k-i-close"></span>' +
                            '</button>' +
                        '</div>',
        buttonTemplate: '<button class="#:styles.footerButton##if(primary){# #:styles.primaryButton# # } else { # #:styles.baseButton# # } #" title="#:text#" #:kendo.attr("command")#="#:command#" #:kendo.attr("options")#="#:options#">' +
                            '<span class="k-button-icon #:icon# #:spriteCssClass#"></span>' +
                            '<span class="k-button-text">#:text#</span>' +
                        '</button>',
        contentTemplate: '',
        builtinButtons: {
            "edit": { name: "edit", icon: "edit", text: "Edit", primary: true, command: "EditCardCommand", rules: "isEditable" },
            "delete": { name: "delete", icon: "delete", text: "Delete", command: "DeleteCardCommand", rules: "isEditable" },
            "cancel": { name: "cancel", text: "Cancel", command: "ClosePaneCommand" },
            "saveChanges": { name: "saveChanges", text: "Save", command: "SaveChangesCommand", primary: true, rules: "isEditable" },
            "create": { name: "create", text: "Create", command: "SaveChangesCommand", primary: true, rules: "isEditable" }
        },
        defaultButtons: [],
        _render: function () {
            var that = this,
                styles = TaskBoardPane.styles,
                element = $("<div class='" + styles.element + "'></div>"),
                header = $("<div class='" + styles.header + "'></div>"),
                content = $("<div class='" + styles.content + "'></div>"),
                buttonsContainer = $("<div class='" + styles.footerActions + " " + styles.footerActionButtons + "'></div>");

            that.header = header.appendTo(element);
            that._renderHeader();
            that.content = content.appendTo(element);
            that._renderContent();
            that.buttonsContainer = buttonsContainer.appendTo(element);
            that.buttonsContainer.append(that._buildButtonsHtml());
            that.element = element;
        },
        _renderHeader: function () {
            var that = this,
                styles = TaskBoardPane.styles,
                options = that.options,
                messages = options.messages,
                headerTemplate = options.headerTemplate ? options.headerTemplate : that._buildHeaderTemplate(),
                resources = that._resources(that._dataItem);

            that.header.append(kendo.template(headerTemplate)(extend(true, {}, {
                styles: styles,
                messages: messages,
                resources: resources
            }, that._dataItem)));
        },
        _buildHeaderTemplate: function () {
            var that = this;
            return kendo.format(that.headerTemplate, "#:" + that.options.dataTitleField + "#");
        },
        _renderContent: function(){
            var that = this,
                styles = TaskBoardPane.styles,
                options = that.options,
                messages = options.messages,
                contentTemplate = options.template || that.contentTemplate,
                resources = that._resources(that._dataItem);

            that.content.append(kendo.template(contentTemplate)(extend(true, {}, {
                styles: styles,
                messages: messages,
                resources: resources
            }, that._dataItem)));
        },
        _resources: function(card) {
            var that = this,
                resources = {};

            if (!that.resources) {
                return resources;
            }

            for (var key in that.resources) {
                var resource = that.resources[key];
                var field = resource.field;
                var cardResources = kendo.getter(field)(card);

                if (!cardResources) {
                    continue;
                }

                if (!resource.multiple) {
                    cardResources = [cardResources];
                }

                var data = resource.dataSource.view();

                for (var resourceIndex = 0; resourceIndex < cardResources.length; resourceIndex++) {
                    var cardResource = null;

                    var value = cardResources[resourceIndex];

                    if (!resource.valuePrimitive) {
                        value = kendo.getter(resource.dataValueField)(value);
                    }

                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        if (data[dataIndex].get(resource.dataValueField) == value) {
                            cardResource = data[dataIndex];
                            break;
                        }
                    }

                    if (cardResource !== null) {
                        var resourceColor = kendo.getter(resource.dataColorField)(cardResource);
                        var result = {
                            field: resource.field,
                            title: resource.title,
                            name: resource.name,
                            text: kendo.getter(resource.dataTextField)(cardResource),
                            value: value,
                            color: resourceColor
                        };

                        if(resource.multiple){
                            if(resources[resource.field]) {
                                resources[resource.field].push(result);
                            } else {
                                resources[resource.field] = [result];
                            }
                        } else {
                            resources[resource.field] = result;
                        }
                    }
                }
            }
            return resources;
        },
        _buildButtonsHtml: function () {
            var that = this,
                options = that.options,
                messages = options.messages,
                buttons = options.buttons || that.defaultButtons,
                styles = TaskBoardPane.styles,
                html = "";

            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button = ($.isPlainObject(button) && Object.keys(button).length === 1 && button.name) ? button.name : button;

                if (typeof button === "string") {
                    button = extend(true, {},
                        that.builtinButtons[button] || { spriteCssClass: button, command: button + "Command" },
                        { text: messages[button] || button }
                    );
                } else if ($.isPlainObject(button) && button.name) {
                    button = extend(true, button,
                        { text: messages[button.name] }
                    );
                }

                if (!that._validateRules(button)) {
                    continue;
                }

                var icon = button.icon ? "k-icon k-i-" + button.icon : "";

                button.icon = icon;
                button.spriteCssClass = button.spriteCssClass || "";

                html += kendo.template(that.buttonTemplate)(extend(true, {}, {
                    styles: styles,
                    messages: messages,
                    primary: false,
                    options: null
                }, button));
            }

            return html;
        },
        _commandClick: function (ev) {
            var that = this,
                target = $(ev.target).closest("[" + kendo.attr("command") + "]"),
                command = target.attr(kendo.attr("command")),
                options = target.attr(kendo.attr("options")),
                card = that._dataItem;

            options = typeof(options) === "string" ? { value: options } : options;

            if (!command) {
                return;
            }

            that.trigger(ACTION, {
                command: command,
                options: extend({ card: card }, options)
            });
        },
        _validateRules: function (tool) {
            var that = this,
                states = that.options.states,
                rules = tool.rules ? tool.rules.split(";") : [];

            if(!rules.length) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if(!states[rules[i]]){
                    return false;
                }
            }

            return true;
        },
        destroy: function(){
            var that = this;

            that.element.off(NS);
            that.element.remove();
        }
    });

    var TaskBoardPreviewPane = TaskBoardPane.extend({
        init: function (taskboard, options, dataItem, resources) {
            var that = this;

            options = extend({}, options.previewPane, {
                dataTitleField: options.dataTitleField,
                dataDescriptionField: options.dataDescriptionField,
                messages: options.messages,
                states: options.states
            });

            that.contentTemplate = kendo.format(that._contentTemplate, options.dataDescriptionField);

            TaskBoardPane.fn.init.call(that, taskboard, options, dataItem, resources);

            that.element.addClass(TaskBoardPane.styles.preview);
        },
        _contentTemplate: "<p>#:{0}#</p>",
        defaultButtons: [ "delete",  "edit" ]
    });

    var TaskBoardEditPane = TaskBoardPane.extend({
        init: function (taskboard, options, dataItem) {
            var that = this;

            options = extend({}, options.editable, {
                dataTitleField: options.dataTitleField,
                dataDescriptionField: options.dataDescriptionField,
                messages: options.messages,
                states: options.states
            });

            that.formSettings = extend(that.formSettings, {
                items: [
                    { field: options.dataTitleField, label: options.messages[options.dataTitleField] },
                    { field: options.dataDescriptionField, label: options.messages[options.dataDescriptionField] }
                ]
            }, options.form);

            TaskBoardPane.fn.init.call(that, taskboard, options, dataItem);

            that.element.addClass(TaskBoardPane.styles.edit);
        },
        defaultButtons: [ "cancel",  "saveChanges" ],
        formSettings: {
            buttonsTemplate: ""
        },
        _buildHeaderTemplate: function () {
            var that = this;
            return kendo.format(that.headerTemplate, that.options.messages.edit + " #:" + that.options.dataTitleField + "#");
        },
        _renderContent: function(){
            var that = this,
                options = that.options,
                styles = TaskBoardPane.styles,
                formSettings = options.form || that.formSettings,
                formLabelId = kendo.guid(),
                element = $("<div></div>")
                    .attr("role", "form")
                    .attr("aria-labelledby", formLabelId);

            that.header.find(DOT + styles.headerText).attr("id", formLabelId);

            that.content.append(element);

            that.form = new Form(element, extend({}, formSettings, {
                formData: that._dataItem
            }));

            that.form.element.find("input").trigger("focus");
        }
    });

    var TaskBoardCreatePane = TaskBoardEditPane.extend({
        init: function (taskboard, options, dataItem, resources, column) {
            var that = this,
                columnStatusField = options.columnSettings.dataStatusField,
                firstColumn = taskboard.columnsDataSource.view().at(0),
                status = column ? column[columnStatusField] : firstColumn[columnStatusField],
                clone = extend({}, dataItem);

            dataItem = taskboard.dataSource.add();
            dataItem.set(options.dataStatusField, status);

            for (var key in clone) {
                dataItem.set(key, clone[key]);
            }

            TaskBoardEditPane.fn.init.call(that, taskboard, options, dataItem, resources);
        },
        _buildHeaderTemplate: function () {
            var that = this;
            return kendo.format(that.headerTemplate, that.options.messages.createNewCard);
        },
        defaultButtons: [ "cancel",  "create" ]
    });

    extend(kendo.ui.taskboard, {
        Pane: TaskBoardPane,
        panes: {
            Preview: TaskBoardPreviewPane,
            Edit: TaskBoardEditPane,
            Create: TaskBoardCreatePane
        }
    });

    extend(true, kendo.ui.taskboard.Pane, { styles: TaskBoardPaneStyles });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('taskboard/keyboard',["../kendo.core"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        Observable = kendo.Observable,

        extend = $.extend,

        DOT = ".",
        NS = DOT + "kendoKeboardManager",
        KEYDOWN = "keydown",
        ACTION = "action";


    var Keyboard = Observable.extend({
        init: function (element) {
            var that = this;

            that.register = {};
            that.element = element;

            that._attachEvents();

            Observable.fn.init.call(that);
        },

        registerShortcut: function (selector, shortcut, options) {
            var that = this;

            if (!that.register[selector]) {
                that.register[selector] = [];
            }

            if (shortcut.keyCode && isNaN(shortcut.keyCode) && shortcut.keyCode.toUpperCase) {
                shortcut.keyCode = shortcut.keyCode.toUpperCase().charCodeAt(0);
            }

            that.register[selector].push({
                shortcut: extend({
                    keyCode: null,
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false
                }, shortcut),
                options: options
            });

        },

        _attachEvents: function () {
            var that = this,
                handler = that._handler.bind(that);

            that.element.on(KEYDOWN + NS, handler);
        },

        _handler: function (ev) {
            var that = this,
                target = $(ev.target),
                shortcuts, action;

            for (var selector in that.register) {
                if (target.is(selector)) {
                    shortcuts = that.register[selector];
                    action = that._getAction(shortcuts, ev);

                    if (action) {
                        that._trigger(action, ev);
                        break;
                    }
                }
            }
        },

        _trigger: function (action, ev) {
            var that = this,
                target = $(ev.target);

            if (action.command) {
                that.trigger(ACTION, extend({}, ev, {
                    command: action.command,
                    options: extend({}, {
                        target: target
                    }, action.options)
                }));
            }

            if (action.handler) {
                action.handler(ev);
            }
        },

        _getAction: function (shortcuts, ev) {
            var that = this;

            for (var i = 0; i < shortcuts.length; i++) {
                if (that._compareShortcut(shortcuts[i].shortcut, ev)) {
                    return shortcuts[i].options;
                }
            }
        },

        _compareShortcut: function (shortcut, ev) {
            var that = this;

            for (var key in shortcut) {
                var result = false;

                switch (key) {
                    case "ctrlKey":
                        result = shortcut[key] !== that._getShortcutModifier(ev);
                        break;
                    default:
                        result = shortcut[key] !== ev[key];
                        break;
                }

                if(result) {
                    return false;
                }
            }

            return true;
        },

        _getShortcutModifier: function (ev) {
            var mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            return mac ? ev.metaKey : ev.ctrlKey;
        },

        destroy: function(){
            var that = this;

            that.element.off(NS);
        }
    });

    extend(kendo.ui.taskboard, {
        KeyboardManager: Keyboard
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function (f, define) {
    define('kendo.taskboard',[
        "./taskboard/toolbar",
        "./taskboard/column",
        "./taskboard/card",
        "./taskboard/cardmenu",
        "./taskboard/commands",
        "./taskboard/pane",
        "./taskboard/keyboard",

        "./kendo.data"
    ], f);
})(function () {

    var __meta__ = { // jshint ignore:line
        id: "taskboard",
        name: "TaskBoard",
        category: "web",
        description: "The TaskBoard widget displays cards.",
        depends: ["data", "sortable", "dialog", "form", "menu", "toolbar"]
    };

    var TaskBoardStyles = {
        wrapper: "k-taskboard",
        header: "k-taskboard-header",
        content: "k-taskboard-content",
        toolbar: "k-taskboard-toolbar k-toolbar-flat",
        columnsContainer: "k-taskboard-columns-container",
        card: "k-taskboard-card",
        column: "k-taskboard-column",
        selected: "k-state-selected",
        disabled: "k-state-disabled",
        ignoreDrag: "k-taskboard-drag-ignore"
    };

    var preventDefault = function (ev) { ev.preventDefault(); };

    (function ($, undefined) {
        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            DataSource = kendo.data.DataSource,
            extend = $.extend,
            ui = kendo.ui,
            isArray = Array.isArray,
            isPlainObject = $.isPlainObject,

            GENERIC = "_generic",

            DOT = ".",

            MOVE = "move",
            MOVE_START = "moveStart",
            MOVE_END = "moveEnd",
            SELECT = "select",
            EXECUTE = "execute",
            ACTION = "action",
            CHANGE = "change",
            ERROR = "change",
            DATABINDING = "dataBinding",
            DATABOUND = "dataBound",
            EDIT_CARD = "editCard",
            SAVE_CARD = "saveCard",
            DELETE_CARD = "deleteCard",
            EDIT_COLUMN = "editColumn",
            SAVE_COLUMN = "saveColumn",
            DELETE_COLUMN = "deleteColumn",

            COLUMNSDATABINDING = "columnsDataBinding",
            COLUMNSDATABOUND = "columnsDataBound";

        var TaskBoard = Widget.extend({
            init: function (element, options) {
                var that = this;

                Widget.fn.init.call(that, element, options);

                element = that.wrapper = that.element;

                that._sortableIdentifier = that.element.attr("id") || kendo.guid();

                that._wrapper();
                that._columnsDataSource();
                that._initResources();
                that._dataSource();
                that._initToolbar();
                that._initCardMenu();
                that._initKeyboard();

                if (that.options.autoBind) {
                    that.load();
                }

                kendo.notify(that);
            },

            events: [
                MOVE,
                MOVE_START,
                MOVE_END,
                CHANGE,
                EXECUTE,
                SELECT,
                DATABINDING,
                DATABOUND,
                COLUMNSDATABINDING,
                COLUMNSDATABOUND,
                EDIT_CARD,
                SAVE_CARD,
                DELETE_CARD,
                EDIT_COLUMN,
                SAVE_COLUMN,
                DELETE_COLUMN
            ],

            options: {
                name: "TaskBoard",
                autoBind: true,
                height: 600,
                width: "100%",
                toolbar: true,
                dataStatusField: "status",
                dataTitleField: "title",
                dataDescriptionField: "description",
                dataCategoryField: "category",
                dataOrderField: null,
                cardMenu: true,
                editable: true,
                selectable: true,
                reorderable: true,
                previewPane: true,
                search: {
                    operator: "contains"
                },
                dataSource: [],
                columns: [],
                columnSettings: {
                    dataStatusField: "status",
                    dataTextField: "text",
                    dataOrderField: null
                },
                resources: [],
                messages: {
                    edit: "Edit",
                    createNewCard: "Create new card",
                    create: "Create",
                    search: "Search",
                    previewCard: "Preview card",
                    addCard: "Add card",
                    editCard: "Edit card",
                    deleteCard: "Delete Card",
                    addColumn: "Add column",
                    editColumn: "Edit column",
                    deleteColumn: "Delete column",
                    close: "Close",
                    cancel: "Cancel",
                    "delete": "Delete",
                    saveChanges: "Save changes",
                    title: "Title:",
                    description: "Description:",
                    newColumn: "New column",
                    deleteColumnConfirm: "Are you sure you want to delete this column?",
                    deleteCardConfirm: "Are you sure you want to delete this card?"
                }
            },

            items: function () {
                var that = this,
                    result = $([]);

                for (var key in that._columns) {
                    $.merge(result, that._columns[key].cards());
                }

                return result;
            },

            itemsByStatus: function (status) {
                var that = this,
                    result = that._getColumn(status).cards();

                return result;
            },

            itemsByColumn: function (columnElm) {
                var that = this,
                    column = that._getColumnByElement(columnElm);

                if (column) {
                    return column.cards();
                }
            },

            load: function () {
                var that = this,
                    fetchPromises = [];

                that._progress(true);

                fetchPromises.push(that.columnsDataSource.fetch());

                for (var key in that.resources) {
                    fetchPromises.push(that.resources[key].dataSource.fetch());
                }

                $.when.apply(null, fetchPromises)
                    .then(that.dataSource.read.bind(that.dataSource));
            },

            dataItem: function (cardElm) {
                var that = this,
                    dataSource = that.dataSource,
                    uid;

                cardElm = $(cardElm);
                uid = cardElm.attr(kendo.attr("uid"));

                return dataSource.getByUid(uid);
            },

            columnDataItem: function (columnElm) {
                var that = this,
                    columnsDataSource = that.columnsDataSource,
                    uid;

                columnElm = $(columnElm);
                uid = columnElm.attr(kendo.attr("uid"));

                return columnsDataSource.getByUid(uid);
            },

            columns: function () {
                var that = this,
                    result = $([]);

                for (var key in that._columns) {
                    $.merge(result, that._columns[key].element);
                }

                return result;
            },

            columnByStatus: function (status) {
                return this._getColumn(status).element;
            },

            select: function (card, toggle) {
                var that = this;

                if(!card) {
                    return that.element
                        .find(DOT + TaskBoard.styles.card + DOT + TaskBoard.styles.selected).eq(0);
                }

                card = $(card);
                toggle = toggle !== false;

                if (toggle) {
                    that.element
                        .find(DOT + TaskBoard.styles.card + DOT + TaskBoard.styles.selected)
                        .removeClass(TaskBoard.styles.selected);
                }

                card.toggleClass(TaskBoard.styles.selected, toggle);
            },

            previewCard: function (cardElement) {
                var that = this,
                    options = that.options,
                    args = that._extendExecArgs({ target: cardElement });

                if (options.previewPane) {
                    that._openPane(extend({
                        pane: "Preview"
                    }, args));
                }
            },

            editCard: function (cardElement) {
                var that = this,
                    options = that.options,
                    args;

                cardElement = $(cardElement);
                args = that._extendExecArgs({ target: cardElement });

                if (options.editable) {
                    that._openPane(extend({
                        pane: "Edit"
                    }, args));
                }
            },

            saveCard: function () {
                var that = this;

                that.dataSource.sync();
            },

            deleteCard: function (cardElement) {
                var that = this,
                    card = that.dataItem(cardElement);

                that.dataSource.remove(card);
                that.dataSource.sync();
            },

            addCard: function (dataItem) {
                var that = this,
                    options = that.options,
                    args = { card: dataItem };

                if (options.editable) {
                    that._openPane(extend({
                        pane: "Create"
                    }, args));
                }
            },

            addColumn: function (index, data) {
                var that = this,
                    columnSettings = extend(true, {}, that.options.columnSettings, {
                        messages: that.options.messages,
                        states: that._buildStates(),
                        sortableIdentifier: that._sortableIdentifier
                    }),
                    newColumn, model, column;

                if(isNaN(index) && !data) {
                    data = index;
                    index = null;
                }

                model = that.columnsDataSource._createNewModel(data);
                index = isNaN(index) || index === null ? that.columnsDataSource.data().length : index;
                column = that.columns().eq(index);
                that.columnsDataSource.insert(index, model);

                newColumn = new ui.taskboard.NewColumn(columnSettings, model);

                if (isNaN(index) || !column.length) {
                    that.columnsContainer.append(newColumn.element);
                } else {
                    column.before(newColumn.element);
                }

                newColumn.bind(ACTION, that.executeCommand.bind(that));
            },

            editColumn: function (columnElement) {
                var that = this;

                columnElement = $(columnElement);

                that._getColumnByElement(columnElement).edit();
            },

            saveColumn: function () {
                var that = this;

                that.columnsDataSource.sync();
            },

            deleteColumn: function (columnElement) {
                var that = this,
                    column = that.columnDataItem(columnElement);

                that.columnsDataSource.remove(column);
                that.columnsDataSource.sync();
            },

            registerShortcut: function (selector, shortcut, options) {
                var that = this;

                that.keyboardManager.registerShortcut(selector, shortcut, options);
            },

            enable: function (cardElement, toggle) {
                cardElement = $(cardElement);

                cardElement.toggleClass(TaskBoard.styles.disabled, toggle === false);
                cardElement.attr("aria-disabled", toggle === false);
            },

            enableByColumn: function (columnElement, toggle) {
                var that = this;

                columnElement = $(columnElement);

                that.itemsByColumn(columnElement).each(function(index, card){
                    that.enable(card, toggle);
                });
            },

            readOnly: function (cardElement, toggle) {
                cardElement = $(cardElement);

                toggle = toggle !== false;

                cardElement.find("[" + kendo.attr("command") + "]").toggleClass(TaskBoard.styles.disabled, toggle);
                cardElement.find("a,button").toggleClass(TaskBoard.styles.disabled, toggle);

                cardElement.toggleClass(TaskBoard.styles.ignoreDrag, toggle);
                cardElement.attr("aria-readonly", toggle);
            },

            readOnlyByColumn: function (columnElement, toggle) {
                var that = this;

                columnElement = $(columnElement);

                that.itemsByColumn(columnElement).each(function(index, card){
                    that.readOnly(card, toggle);
                });
            },

            setDataSource: function (dataSource) {
                var that = this;

                that.options.dataSource = dataSource;
                that._dataSource();

                if (that.options.autoBind) {
                    that.dataSource.read();
                }
            },

            setColumnsDataSource: function (dataSource) {
                var that = this;

                that.options.columns = dataSource;
                that._columnsDataSource();

                if (that.options.autoBind) {
                    that.columnsDataSource.fetch(function(){
                        that._renderCards(that.dataSource.view());
                    });
                }
            },

            _getColumn: function (status) {
                return this._columns[status];
            },

            _getColumnByElement: function (columnElement) {
                var that = this;

                columnElement = $(columnElement);

                for (var key in that._columns) {
                    if (that._columns[key].element[0] === columnElement[0]) {
                        return that._columns[key];
                    }
                }
            },

            _openPane: function (options) {
                var that = this,
                    pane = new ui.taskboard.panes[options.pane](that, extend({}, that.options, {
                        states: that._buildStates()
                    }), options.card, that.resources, options.column),
                    focusableElement, keyboardManager;

                if (that.pane) {
                    that._closePane();
                }

                that.pane = pane;
                that.content.after(that.pane.element);
                that.content.css("margin-right",
                    that.pane.element.outerWidth() -
                    parseInt(that.content.css("paddingRight"), 10));

                that.pane.bind(ACTION, that.executeCommand.bind(that));

                that.pane.keyboardManager = keyboardManager = new ui.taskboard.KeyboardManager(that.pane.element);

                keyboardManager.bind(ACTION, that.executeCommand.bind(that));

                keyboardManager.registerShortcut("*", {
                    keyCode: kendo.keys.ESC
                }, { command: "ClosePaneCommand" });

                keyboardManager.registerShortcut("*", {
                    keyCode: kendo.keys.ENTER
                }, { command: "SaveChangesCommand", options: {
                    card: that.pane._dataItem
                } });

                focusableElement = that.pane.element.find("input");

                if (!focusableElement.length) {
                    focusableElement = that.pane.element.find("button");
                }

                setTimeout(function () {
                    focusableElement.eq(0).trigger("focus");
                }, 0);
            },

            _closePane: function () {
                var that = this;

                if (that.pane) {
                    that.pane.keyboardManager.destroy();
                    that.pane.unbind(ACTION);
                    that.pane.destroy();
                    delete that.pane;

                    that.content.css("margin-right", "");
                }
            },

            _wrapper: function () {
                var that = this,
                    options = that.options,
                    styles = TaskBoard.styles,
                    headerElm = "<div class='" + styles.header + "'></div>",
                    contentElm = "<div class='" + styles.content + "'></div>",
                    colsContainer = "<div class='" + styles.columnsContainer + "'></div>";

                that.element.addClass(styles.wrapper)
                    .width(options.width)
                    .height(options.height)
                    .attr("role", "application");
                that.header = $(headerElm).appendTo(that.element);
                that.content = $(contentElm).appendTo(that.element);
                that.columnsContainer = $(colsContainer).appendTo(that.content);
            },

            _initToolbar: function () {
                var that = this,
                    styles = TaskBoard.styles,
                    options = that.options,
                    toolbarElm = $("<div class='" + styles.toolbar + "'></div>"),
                    toolbarOptions = isArray(options.toolbar) ? { items: options.toolbar } : options.toolbar;

                if (options.toolbar === false) {
                    return;
                }

                toolbarOptions = extend({}, toolbarOptions, {
                    taskboard: this,
                    messages: options.messages,
                    action: that.executeCommand.bind(that),
                    states: that._buildStates()
                });

                that.header.append(toolbarElm);
                that.toolbar = new ui.taskboard.ToolBar(toolbarElm, toolbarOptions);
            },

            _buildStates: function () {
                var that = this;

                return {
                    isEditable: that._isEditable(),
                    isReorderable: that._isReorderable(),
                    isSelectable: that._isSelectable(),
                    isReadOnly: !that._isReorderable() && !that._isEditable(),
                    isDisabled: !that._isReorderable() && !that._isEditable() && !that._isSelectable(),
                    isSearchable: that._isSearchable(),
                    notLocalColumns: !(that.columnsDataSource.transport instanceof kendo.data.LocalTransport),
                    isRtl: kendo.support.isRtl(that.wrapper)
                };
            },

            _isSearchable: function () {
                return !!this.options.search;
            },

            _isEditable: function () {
                return !!this.options.editable;
            },

            _isReorderable: function () {
                return !!this.options.reorderable;
            },

            _isSelectable: function () {
                return !!this.options.selectable;
            },

            executeCommand: function(args) {
                var that = this,
                    commandName = args.command,
                    commandOptions = extend({ taskboard: this }, isPlainObject(args.options) ? that._extendExecArgs(args.options) : { value: args.options }),
                    command = ui.taskboard.commands[commandName] && new ui.taskboard.commands[commandName](commandOptions);


                if(!that.trigger(EXECUTE, args)) {
                    if (command) {
                        command.exec();
                    } else {
                        window.console.warn(kendo.format("Trying to use {0} command, but such is not available in the kendo.ui.taskboard.commands namespace!", commandName));
                    }
                }
            },

            _extendExecArgs: function (args) {
                var that = this,
                    target = args.draggableEvent ? args.item : args.target,
                    columnElm, cardElm, columnDataItem, cardDataItem;

                if (args.card) {
                    target = that.items().filter(function (idx, elm) {
                        return $(elm).attr(kendo.attr("uid")) === args.card.get("uid");
                    });
                }

                if(!target || !(target && target.length)) {
                    return args;
                }

                columnElm = args.columnElement || (target.is(DOT + TaskBoard.styles.column) ? target : target.parents(DOT + TaskBoard.styles.column));
                columnDataItem = that.columnsDataSource.getByUid(columnElm.data(kendo.ns + "uid"));
                cardElm = target.is(DOT + TaskBoard.styles.card) ? target : target.closest(DOT + TaskBoard.styles.card);
                cardDataItem = that.dataSource.getByUid(cardElm.data(kendo.ns + "uid"));

                return extend(args, {
                    card: cardDataItem,
                    cardElement: cardElm.length ? cardElm : undefined,
                    column: columnDataItem,
                    columnElement: columnElm.length ? columnElm : undefined
                });
            },


            _select: function (card, toggle) {
                var that = this;

                if (toggle === null) {
                    toggle = true;
                }

                if(!that.trigger(SELECT, { card: card })) {
                    that.select(card, toggle);
                    that.previewCard(card);
                }
            },

            _columnsDataSource: function () {
                var that = this,
                    options = that.options,
                    columnSettings = options.columnSettings,
                    columnsDataSource = options.columns;

                columnsDataSource = isArray(columnsDataSource) ? { data: columnsDataSource } : columnsDataSource;

                if (columnSettings.dataOrderField && !columnsDataSource.sort) {
                    columnsDataSource.sort = { field: columnSettings.dataOrderField, dir: "asc" };
                }

                if (!columnsDataSource.schema) {
                    var fields = {};

                    fields[columnSettings.dataStatusField] = { type: "string", defaultValue: function () { return kendo.guid().split("-")[0]; } };
                    fields[columnSettings.dataTextField] = { type: "string" };

                    if (columnSettings.dataOrderField) {
                        fields[columnSettings.dataOrderField] = { type: "number" };
                    }

                    columnsDataSource.schema = {
                        model: {
                            fields: fields
                        }
                    };
                }

                if (that.columnsDataSource && that._columnsChangeHandler) {
                    that.columnsDataSource.unbind(CHANGE, that._columnsChangeHandler);
                    that.columnsDataSource.unbind(CHANGE, that._columnsErrorHandler);
                } else {
                    that._columnsChangeHandler = that._columnsDataSourceChange.bind(that);
                    that._columnsErrorHandler = that._error.bind(that);
                }

                that.columnsDataSource = DataSource.create(columnsDataSource)
                                .bind(CHANGE, that._columnsChangeHandler)
                                .bind(ERROR, that._columnsErrorHandler);
            },

            _columnsDataSourceChange: function (ev) {
                var that = this,
                    view = that.columnsDataSource.view(),
                    columnSettings = extend(true, {}, that.options.columnSettings, {
                        messages: that.options.messages,
                        states: that._buildStates(),
                        sortableIdentifier: that._sortableIdentifier
                     }),
                    statusField = columnSettings.dataStatusField;

                if (ev.action && ev.action !== "sync") {
                    return;
                }

                if (that.trigger(COLUMNSDATABINDING, ev)) {
                    return;
                }

                that._progress(true);

                that._columns = {};
                that.columnsContainer.html("");

                for (var i = 0; i < view.length; i++) {
                    var data = view[i];
                    var status = data[statusField] || GENERIC;
                    var column;

                    column = that._columns[status] = new ui.taskboard.Column(columnSettings, data);
                    that.columnsContainer.append(column.element);
                    column.bind(ACTION, that.executeCommand.bind(that));
                    column.bind(MOVE, that._move.bind(that));
                    column.bind(MOVE_END, that._moveEnd.bind(that));
                    column.bind(MOVE_START, that._moveStart.bind(that));
                    column.bind(CHANGE, that._changeOrder.bind(that));
                    that._tabindex(column.element);
                }

                if (ev.action === "sync" || ev.action === undefined) {
                    that._renderCards(that.dataSource.view());
                }

                that._progress(false);
                that.trigger(COLUMNSDATABOUND, ev);
            },

            _move: function (ev) {
                this.trigger(MOVE, this._extendExecArgs(ev));
            },

            _moveEnd: function (ev) {
                this.trigger(MOVE_END, this._extendExecArgs(ev));
            },

            _moveStart: function (ev) {
                this.trigger(MOVE_START, this._extendExecArgs(ev));
            },

            _changeOrder: function (ev) {
                this.trigger(CHANGE, this._extendExecArgs(ev));
            },

            _dataSource: function () {
                var that = this,
                    options = that.options,
                    dataSource = options.dataSource;

                    dataSource = isArray(dataSource) ? { data: dataSource } : dataSource;

                if (options.dataOrderField && !dataSource.sort) {
                    dataSource.sort = { field: options.dataOrderField, dir: "asc" };
                }

                if (!dataSource.schema) {
                    var fields = {};

                    fields[options.dataStatusField] = { type: "string" };
                    fields[options.dataTitleField] = { type: "string" };
                    fields[options.dataDescriptionField] = { type: "string" };
                    fields[options.dataCategoryField] = { type: "string" };

                    if (options.dataOrderField) {
                        fields[options.dataOrderField] = { type: "number" };
                    }

                    dataSource.schema = {
                        model: {
                            fields: fields
                        }
                    };
                }

                if (that.dataSource && that._changeHandler) {
                    that.dataSource.unbind(CHANGE, that._changeHandler);
                    that.dataSource.unbind(ERROR, that._errorHandler);
                } else {
                    that._changeHandler = that._change.bind(that);
                    that._errorHandler = that._error.bind(that);
                }

                that.dataSource = DataSource.create(dataSource)
                                .bind(CHANGE, that._changeHandler);
            },

            _change: function (ev) {
                var that = this;

                if (ev.action && ev.action !== "sync") {
                    return;
                }

                if (that.trigger(DATABINDING, ev)) {
                    return;
                }

                that._progress(true);

                that._clearColumns();
                that._renderCards(that.dataSource.view());
                that._closePane();

                that.trigger(DATABOUND, ev);
                that._progress(false);
            },

            _error: function () {
                this._progress(false);
            },

            _renderCards: function (data) {
                var that = this;

                for (var i = 0; i < data.length; i++) {
                    that._renderCard(data[i]);
                }
            },

            _renderCard: function (card) {
                var that = this,
                    options = extend({}, that.options, { states: that._buildStates() }),
                    statusField = options.dataStatusField,
                    status = card[statusField] || GENERIC;

                if (status && that._columns[status]) {
                    card = new ui.taskboard.Card(options, card, that.resources);
                    that._columns[status].addCard(card.element);
                    that._tabindex(card.element);
                }
            },

            _clearColumns: function () {
                var that = this;

                for (var key in that._columns) {
                    that._columns[key].empty();
                }
            },

            _initCardMenu: function(){
                var that = this,
                    options = that.options,
                    cardMenuOptions = isArray(options.cardMenu) ? { items: options.cardMenu } : options.cardMenu;

                cardMenuOptions = extend({}, {
                    messages: options.messages,
                    target: that.columnsContainer,
                    filter: ".k-taskboard-card-menu-button",
                    action: that.executeCommand.bind(that),
                    showOn: "click",
                    alignToAnchor: true,
                    states: that._buildStates()
                }, cardMenuOptions);

                if(options.cardMenu === false) {
                    return;
                }

                that.cardMenu = new ui.taskboard.CardMenu("<ul></ul>", cardMenuOptions);
            },

            _initResources: function () {
                var that = this,
                    resources = that.options.resources;

                for (var i = 0; i < resources.length; i++) {
                    that._addResource(resources[i]);
                }
            },

            _addResource: function (resource) {
                var that = this;

                if (!that.resources) {
                    that.resources = {};
                }

                that.resources[resource.field] = {
                    field: resource.field,
                    name: resource.name,
                    title: resource.title || resource.field,
                    dataTextField: resource.dataTextField || "text",
                    dataValueField: resource.dataValueField || "value",
                    dataColorField: resource.dataColorField || "color",
                    valuePrimitive: resource.valuePrimitive === false ? false : true,
                    multiple: resource.multiple || false,
                    dataSource: that._resourceDataSource(resource.dataSource)
                };
            },

            _resourceDataSource: function (resourceDS) {
                var dataSource = isArray(resourceDS) ? { data: resourceDS } : resourceDS,
                    dataSourceInstance = kendo.data.DataSource.create(dataSource);

                return dataSourceInstance;
            },

            _progress: function (toggle) {
                var that = this;

                kendo.ui.progress(that.element, toggle);
            },

            _initKeyboard: function () {
                var that = this;

                that.keyboardManager = new ui.taskboard.KeyboardManager(that.element);

                that.keyboardManager.bind(ACTION, that.executeCommand.bind(that));
                that._registerShortcuts();
            },

            _registerShortcuts: function () {
                var that = this,
                    states = that._buildStates();

                if (states.isEditable) {
                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column, {
                        keyCode: kendo.keys.DELETE
                    }, { command: "DeleteColumnCommand" });

                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column, {
                        keyCode: "e",
                        ctrlKey: true
                    }, { command: "EditColumnCommand", handler: preventDefault });

                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column, {
                        keyCode: "a",
                        ctrlKey: true
                    }, { command: "AddCardCommand", handler: preventDefault });

                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column + " *", {
                        keyCode: kendo.keys.ESC
                    }, { command: "CancelEditColumnCommand" });

                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                        keyCode: kendo.keys.DELETE
                    }, { command: "DeleteCardCommand" });

                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                        keyCode: "e",
                        ctrlKey: true
                    }, { command: "EditCardCommand", handler: preventDefault });
                }

                if (states.isSelectable) {
                    that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                        keyCode: kendo.keys.ENTER
                    }, { command: "SelectCardCommand", handler: preventDefault });
                }

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                    keyCode: kendo.keys.UP
                }, { command: "MoveFocusCommand", options: {value: "up"}, handler: preventDefault });

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                    keyCode: kendo.keys.DOWN
                }, { command: "MoveFocusCommand", options: {value: "down"}, handler: preventDefault });

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                    keyCode: kendo.keys.LEFT
                }, { command: "MoveFocusCommand", options: {value: "left"}, handler: preventDefault });

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.card, {
                    keyCode: kendo.keys.RIGHT
                }, { command: "MoveFocusCommand", options: {value: "right"}, handler: preventDefault });

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column, {
                    keyCode: kendo.keys.LEFT
                }, { command: "MoveFocusCommand", options: {value: "left"}, handler: preventDefault });

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column, {
                    keyCode: kendo.keys.RIGHT
                }, { command: "MoveFocusCommand", options: {value: "right"}, handler: preventDefault });

                that.keyboardManager.registerShortcut(DOT + TaskBoard.styles.column, {
                    keyCode: kendo.keys.DOWN
                }, { command: "MoveFocusCommand", options: {value: "down"}, handler: preventDefault });
            },

            destroy: function() {
                var that = this;

                if (that._columnsChangeHandler) {
                    that.columnsDataSource.unbind(CHANGE, that._columnsChangeHandler);
                    that.columnsDataSource.unbind(CHANGE, that._columnsErrorHandler);
                }

                if (that._changeHandler) {
                    that.dataSource.unbind(CHANGE, that._changeHandler);
                    that.dataSource.unbind(ERROR, that._errorHandler);
                }

                for (var key in that._columns) {
                    that._columns[key].destroy();
                }

                if (that.toolbar) {
                    that.toolbar.destroy();
                }

                if (that.cardMenu) {
                    that.cardMenu.destroy();
                }

                if (that.keyboardManager) {
                    that.keyboardManager.destroy();
                }

                if (that.pane) {
                    that.closePane();
                }

                Widget.fn.destroy.call(that);
            }
        });

        kendo.ui.plugin(TaskBoard);

        extend(true, TaskBoard, { styles: TaskBoardStyles });

    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

