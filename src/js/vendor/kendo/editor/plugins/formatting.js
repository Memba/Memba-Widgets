/**
 * Kendo UI v2023.1.314 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./inlineformat.js";

(function($) {

var kendo = window.kendo,
    Editor = kendo.ui.editor,
    Tool = Editor.Tool,
    DelayedExecutionTool = Editor.DelayedExecutionTool,
    Command = Editor.Command,
    dom = Editor.Dom,
    EditorUtils = Editor.EditorUtils,
    RangeUtils = Editor.RangeUtils,
    registerTool = EditorUtils.registerTool;


var FormattingTool = DelayedExecutionTool.extend({
    init: function(options) {
        var that = this;
        Tool.fn.init.call(that, kendo.deepExtend({}, that.options, options));

        that.type = "kendoDropDownList";

        that.finder = {
            getFormat: function() { return ""; }
        };
    },

    options: {
        items: [
            { text: "Paragraph", value: "p" },
            { text: "Quotation", value: "blockquote" },
            { text: "Heading 1", value: "h1" },
            { text: "Heading 2", value: "h2" },
            { text: "Heading 3", value: "h3" },
            { text: "Heading 4", value: "h4" },
            { text: "Heading 5", value: "h5" },
            { text: "Heading 6", value: "h6" }
        ],
        width: 110
    },

    toFormattingItem: function(item) {
        var value = item.value;

        if (!value) {
            return item;
        }

        if (item.tag || item.className) {
            return item;
        }

        var dot = value.indexOf(".");

        if (dot === 0) {
            item.className = value.substring(1);
        } else if (dot == -1) {
            item.tag = value;
        } else {
            item.tag = value.substring(0, dot);
            item.className = value.substring(dot + 1);
        }

        return item;
    },

    command: function(args) {
        var that = this;
        var item = args.value;

        item = this.toFormattingItem(item);

        return new Editor.FormatCommand({
            range: args.range,
            formatter: function() {
                var formatter,
                    tags = (item.tag || item.context || "span").split(","),
                    format = [{
                        tags: tags,
                        attr: { className: item.className || "" }
                    }];

                if ($.inArray(tags[0], dom.inlineElements) >= 0) {
                    formatter = new Editor.GreedyInlineFormatter(format);
                } else {
                    formatter = new Editor.GreedyBlockFormatter(format);
                }

                formatter.editor = that.editor;
                return formatter;
            }
        });
    },

    decorate: function(body) {
        var component = this.component,
            dataSource = component.dataSource,
            items = dataSource.data(),
            i, tag, className, style;

        if (body) {
            component.list.css("background-color", dom.getEffectiveBackground($(body)));
        }

        for (i = 0; i < items.length; i++) {
            tag = items[i].tag || "span";
            className = items[i].className;

            style = dom.inlineStyle(body, tag, { className: className });

            style = style.replace(/"/g, "'");

            items[i].style = style + ";display:inline-block";
        }

        dataSource.trigger("change");
    },

    initialize: function(ui, editor) {
        var options = this.options;
        var toolName = options.name;
        var that = this;
        var component = ui.getKendoDropDownList();

        if (!component) {
            return;
        }

        that.editor = editor;
        that.component = component;

        // must be moved to themes
        ui.closest(".k-dropdownlist").width(options.width);

        component.setOptions({
            optionLabel: editor.options.messages.formatting,
            change: () => {
                var dataItem = component.dataItem();

                if (dataItem) {
                    Tool.exec(editor, toolName, dataItem.toJSON());
                }
            },
            dataBound: function() {
                var i, items = component.dataSource.data(),
                    optionLabel = component.list.parent().find(".k-list-optionlabel");

                for (i = 0; i < items.length; i++) {
                    items[i] = that.toFormattingItem(items[i]);
                }

                if (optionLabel.length) {
                    optionLabel.remove();
                }
            }
        });
    },

    getFormattingValue: function(items, nodes) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var tag = item.tag || item.context || "";
            var className = item.className ? "." + item.className : "";
            var selector = tag + className;

            var element = $(nodes[0]).closest(selector)[0];

            if (!element) {
                continue;
            }

            if (nodes.length == 1) {
                return item.value;
            }

            for (var n = 1; n < nodes.length; n++) {
                if (!$(nodes[n]).closest(selector)[0]) {
                    break;
                } else if (n == nodes.length - 1) {
                    return item.value;
                }
            }
        }

        return "";
    },

    update: function(ui, nodes) {
        var selectBox = $(ui).data(this.type);
        // necessary until formatBlock is deleted
        if (!selectBox) {
            return;
        }

        var dataSource = selectBox.dataSource,
            items = dataSource.data(),
            i, context,
            ancestor = dom.commonAncestor.apply(null, nodes);

        if (ancestor != dom.closestEditable(ancestor) && this._ancestor == ancestor) {
            return;
        } else {
            this._ancestor = ancestor;
        }

        for (i = 0; i < items.length; i++) {
            context = items[i].context;

            items[i].visible = !context || !!$(ancestor).closest(context).length;
        }

        dataSource.filter([{ field: "visible", operator: "eq", value: true }]);

        DelayedExecutionTool.fn.update.call(this, ui, nodes);

        selectBox.value(this.getFormattingValue(dataSource.view(), nodes));

        selectBox.wrapper.toggleClass("k-disabled", !dataSource.view().length);
    },

    destroy: function() {
        this._ancestor = null;
    }
});

var CleanFormatCommand = Command.extend({
    exec: function() {
        var range = this.lockRange(true);
        this.tagsToClean = this.options.remove || "strong,em,span,sup,sub,del,b,i,u,font".split(",");

        RangeUtils.wrapSelectedElements(range);

        var nodes = RangeUtils.mapAll(range, function(node) {
            return node;
        });


        for (var c = nodes.length - 1; c >= 0; c--) {
            var node = nodes[c];
            if (!this.immutableParent(node)) {
                this.clean(node);
            }
        }

        this.releaseRange(range);
    },

    clean: function(node) {
        if (!node || dom.isMarker(node)) {
            return;
        }

        var name = dom.name(node);

        if (name == "ul" || name == "ol") {
            var listFormatter = new Editor.ListFormatter(name);
            var prev = node.previousSibling;
            var next = node.nextSibling;

            listFormatter.unwrap(node);

            // clean contents
            for (; prev && prev != next; prev = prev.nextSibling) {
                this.clean(prev);
            }
        } else if (name == "blockquote") {
            dom.changeTag(node, "p");
        } else if (node.nodeType == 1 && !dom.insignificant(node)) {
            for (var i = node.childNodes.length - 1; i >= 0; i--) {
                this.clean(node.childNodes[i]);
            }

            node.removeAttribute("style");
            node.removeAttribute("class");
        } else {
            unwrapListItem(node);
        }

        if ($.inArray(name, this.tagsToClean) > -1) {
            dom.unwrap(node);
        }
    },

    immutableParent: function(node) {
        return this.immutables() && Editor.Immutables.immutableParent(node);
    }
});


function unwrapListItem(node) {
    var li = dom.closestEditableOfType(node, ["li"]);
    if (li) {
        var listFormatter = new Editor.ListFormatter(dom.name(li.parentNode));
        var range = kendo.ui.editor.W3CRange.fromNode(node);
        range.selectNode(li);
        listFormatter.toggle(range);
    }
}

$.extend(Editor, {
    FormattingTool: FormattingTool,
    CleanFormatCommand: CleanFormatCommand
});

registerTool("formatting", new FormattingTool({
    ui: {
        type: "component",
        component: "DropDownList",
        componentOptions: {
            dataTextField: "text",
            dataValueField: "value",
            highlightFirst: false,
            autoWidth: true,
            template: kendo.template(
                (data) => `<span unselectable="on" style="display:block;${data.style || ""}">${kendo.htmlEncode(data.text)}</span>`
            )
        },
        overflow: "never"
    }
}));

registerTool("cleanFormatting", new Tool({ command: CleanFormatCommand }));

})(window.kendo.jQuery);
