/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./format.js";
(function($) {

var kendo = window.kendo,
    Class = kendo.Class,
    Editor = kendo.ui.editor,
    formats = kendo.ui.Editor.fn.options.formats,
    Tool = Editor.Tool,
    FormatTool = Editor.FormatTool,
    dom = Editor.Dom,
    RangeUtils = Editor.RangeUtils,
    extend = $.extend,
    registerTool = Editor.EditorUtils.registerTool,
    registerFormat = Editor.EditorUtils.registerFormat,
    MOUSEDOWN_NS = "mousedown.kendoEditor",
    KEYDOWN_NS = "keydown.kendoEditor",
    KMARKER = "k-marker";

var InlineFormatFinder = Class.extend({
    init: function(format) {
        this.format = format;
    },

    numberOfSiblings: function(referenceNode) {
        var textNodesCount = 0,
            elementNodesCount = 0,
            markerCount = 0,
            parentNode = referenceNode.parentNode,
            node;

        for (node = parentNode.firstChild; node; node = node.nextSibling) {
            if (node != referenceNode) {
                if (node.className == KMARKER) {
                    markerCount++;
                } else if (node.nodeType == 3) {
                    textNodesCount++;
                } else {
                    elementNodesCount++;
                }
            }
        }

        if (markerCount > 1 && parentNode.firstChild.className == KMARKER && parentNode.lastChild.className == KMARKER) {
            // full node selection
            return 0;
        } else {
            return elementNodesCount + textNodesCount;
        }
    },

    findSuitable: function(sourceNode, skip) {
        if (!skip && this.numberOfSiblings(sourceNode) > 0) {
            return null;
        }

        var node = sourceNode.parentNode;
        var tags = this.format[0].tags;

        while (!dom.ofType(node, tags)) {
            if (this.numberOfSiblings(node) > 0) {
                return null;
            }

            node = node.parentNode;
        }

        return node;
    },

    findFormat: function(sourceNode) {
        var format = this.format,
            attrEquals = dom.attrEquals,
            i, len, node, tags, attributes;

        for (i = 0, len = format.length; i < len; i++) {
            node = sourceNode;
            tags = format[i].tags;
            attributes = format[i].attr;

            if (node && dom.ofType(node, tags) && attrEquals(node, attributes)) {
                return node;
            }

            while (node) {
                node = dom.parentOfType(node, tags);
                if (node && attrEquals(node, attributes)) {
                    return node;
                }
            }
        }

        return null;
    },

    isFormatted: function(nodes) {
        var i, len;

        for (i = 0, len = nodes.length; i < len; i++) {
            if (this.findFormat(nodes[i])) {
                return true;
            }
        }
        return false;
    }
});

var InlineFormatter = Class.extend({
    init: function(format, values) {
        this.finder = new InlineFormatFinder(format);
        this.attributes = extend({}, format[0].attr, values);
        this.tag = format[0].tags[0];
    },

    wrap: function(node) {
        return dom.wrap(node, dom.create(node.ownerDocument, this.tag, this.attributes));
    },

    activate: function(range, nodes) {
        if (this.finder.isFormatted(nodes)) {
            this.split(range);
            this.remove(nodes);
        } else {
            this.apply(nodes);
        }
    },

    toggle: function(range) {
        var textNodes = this.immutables() ? RangeUtils.editableTextNodes : RangeUtils.textNodes;
        var nodes = textNodes(range);

        if (nodes.length > 0) {
            this.activate(range, nodes);
        }
    },

    immutables: function() {
        return this.editor && this.editor.options.immutables;
    },

    apply: function(nodes) {
        var formatNodes = [];
        var i, l, node, formatNode;

        if (nodes.length > 1) {
            for (i = 0, l = nodes.length; i < l; i++) {
                node = nodes[i];
                formatNode = this.format(node, true);
                formatNodes.push(formatNode);

            }
        } else {
            node = nodes[0];
            formatNode = this.format(node, false);
        }

        this.consolidate(formatNodes);
    },

    format: function(node, outerMostInline) {
        var formatNode = this.finder.findSuitable(node);
        var attributes = this.attributes;
        var styleAttr = attributes ? attributes.style || {} : {};

        if (formatNode) {
            if (dom.is(formatNode, "font")) {
                if (styleAttr.color) {
                    formatNode.removeAttribute("color");
                }
                if (styleAttr.fontName) {
                    formatNode.removeAttribute("face");
                }
                if (styleAttr.fontSize) {
                    formatNode.removeAttribute("size");
                }
            }
            dom.attr(formatNode, attributes);
        } else {
            while (!dom.isBlock(node.parentNode) && node.parentNode.childNodes.length == 1 && node.parentNode.contentEditable !== 'true' && outerMostInline) {
                node = node.parentNode;
            }

            formatNode = this.wrap(node);
        }

        return formatNode;
    },

    remove: function(nodes) {
        var i, l, formatNode;

        for (i = 0, l = nodes.length; i < l; i++) {
            formatNode = this.finder.findFormat(nodes[i]);
            if (formatNode) {
                if (this.attributes && this.attributes.style) {
                    dom.unstyle(formatNode, this.attributes.style);
                    if (!formatNode.style.cssText && !formatNode.attributes["class"]) {
                        dom.unwrap(formatNode);
                    }
                } else {
                    dom.unwrap(formatNode);
                }
            }
        }
    },

    split: function(range) {
        var nodes = RangeUtils.textNodes(range);
        var l = nodes.length;
        var i, formatNode;

        if (l > 0) {
            for (i = 0; i < l; i++) {
                formatNode = this.finder.findFormat(nodes[i]);
                if (formatNode) {
                    RangeUtils.split(range, formatNode, true);
                }
            }
        }
    },

    consolidate: function(nodes) {
        var node, last;

        while (nodes.length > 1) {
            node = nodes.pop();
            last = nodes[nodes.length - 1];

            if (node.previousSibling && node.previousSibling.className == KMARKER) {
                last.appendChild(node.previousSibling);
            }

            if (node.tagName == last.tagName &&
                node.previousSibling == last &&
                node.style.cssText == last.style.cssText &&
                node.className === last.className) {

                while (node.firstChild) {
                    last.appendChild(node.firstChild);
                }

                dom.remove(node);
            }
        }
    }
});

var GreedyInlineFormatFinder = InlineFormatFinder.extend({
    init: function(format, greedyProperty, fontAttr) {
        this.format = format;
        this.greedyProperty = greedyProperty;
        this.fontAttr = fontAttr;
        InlineFormatFinder.fn.init.call(this, format);
    },

    getInlineCssValue: function(node) {
        var attributes = node.attributes;
        var trim = kendo.trim;
        var i, l, attribute, name, attributeValue, css, pair, cssIndex, len;
        var propertyAndValue, property, value;

        if (!attributes) {
            return;
        }

        for (i = 0, l = attributes.length; i < l; i++) {
            attribute = attributes[i];
            name = attribute.nodeName;
            attributeValue = attribute.nodeValue;

            if (attribute.specified && name == "style") {

                css = trim(attributeValue || node.style.cssText).split(";");

                for (cssIndex = 0, len = css.length; cssIndex < len; cssIndex++) {
                    pair = css[cssIndex];
                    if (pair.length) {
                        propertyAndValue = pair.split(":");
                        property = trim(propertyAndValue[0].toLowerCase());
                        value = trim(propertyAndValue[1]);

                        if (property != this.greedyProperty) {
                            continue;
                        }

                        return property.indexOf("color") >= 0 ? dom.toHex(value) : value;
                    }
                }
            }

            if (this.fontAttr && attribute.specified && name == this.fontAttr) {
                property = attribute.nodeValue;
                value = attribute.nodeValue;

                return property.indexOf("color") >= 0 ? dom.toHex(value) : value;
            }
        }
    },

    getFormatInner: function(node) {
        var $node = $(dom.isDataNode(node) ? node.parentNode : node);
        var parents = $node.parentsUntil("[contentEditable]").addBack().toArray().reverse();
        var i, len, value;

        for (i = 0, len = parents.length; i < len; i++) {
            value = this.greedyProperty == "className" ? parents[i].className : this.getInlineCssValue(parents[i]);

            if (value) {
                return value;
            }
        }

        return "inherit";
    },

    getFormat: function(nodes) {
        var result = this.getFormatInner(nodes[0]), i, len;

        for (i = 1, len = nodes.length; i < len; i++) {
            if (result != this.getFormatInner(nodes[i])) {
                return "";
            }
        }

        return result;
    },

    isFormatted: function(nodes) {
        return this.getFormat(nodes) !== "";
    }
});

var GreedyInlineFormatter = InlineFormatter.extend({
    init: function(format, values, greedyProperty) {
        InlineFormatter.fn.init.call(this, format, values);

        this.values = values;
        this.finder = new GreedyInlineFormatFinder(format, greedyProperty);

        if (greedyProperty) {
            this.greedyProperty = kendo.toCamelCase(greedyProperty);
        }

    },

    activate: function(range, nodes) {
        var greedyProperty = this.greedyProperty;
        var action = "apply";

        this.split(range);

        if (greedyProperty && this.values.style[greedyProperty] == "inherit") {
            action = "remove";
        }

        this[action](nodes);
    }
});

var InlineFormatTool = FormatTool.extend({
    init: function(options) {
        FormatTool.fn.init.call(this, extend(options, {
            finder: new InlineFormatFinder(options.format),
            formatter: function() { return new InlineFormatter(options.format); }
        }));
    }
});

var DelayedExecutionTool = Tool.extend({
    update: function(ui, nodes) {
        var list = ui.data(this.type);

        list.close();
        list.value(this.finder.getFormat(nodes));
    }
});

var FontTool = DelayedExecutionTool.extend({
    init: function(options) {
        Tool.fn.init.call(this, options);

        // IE has single selection hence we are using select box instead of combobox
        this.type = "kendoComboBox";
        this.format = [{ tags: ["span", "font"] }];
        this.finder = new GreedyInlineFormatFinder(this.format, options.cssAttr, options.fontAttr);
    },

    command: function(commandArguments) {
        var options = this.options,
            format = this.format,
            style = {};

        return new Editor.FormatCommand(extend(commandArguments, {
            formatter: function() {
                style[options.domAttr] = commandArguments.value;

                return new GreedyInlineFormatter(format, { style: style }, options.cssAttr);
            }
        }));
    },

    initialize: function(ui, editor) {
        var options = this.options,
            toolName = options.name,
            dataSource,
            range,
            widget = ui.data("kendoComboBox"),
            defaultValue = [];

        if (!widget) {
            return;
        }

        if (options.defaultValue) {
           defaultValue = [{
                text: editor.options.messages[options.defaultValue[0].text],
                value: options.defaultValue[0].value
           }];
        }

        dataSource = defaultValue.concat(options.items ? options.items : (editor.options[toolName] || [] ));
        widget.setDataSource(dataSource);

        widget.bind("change", (e) => {
            editor._range = range;
            Tool.exec(editor, toolName, e.sender.value());
        });

        widget.bind("close", () => {
            setTimeout(function() {
                editor._deleteSavedRange();
            },0);
        });

        widget.value("inherit");

        widget.wrapper.on(MOUSEDOWN_NS, ".k-select,.k-input-button,.k-input", function() {
            var newRange = editor.getRange();
            range = editor._containsRange(newRange) ? newRange : range;
        })
        .on(KEYDOWN_NS, function(e) {
            if (e.keyCode === kendo.keys.ENTER) {
                editor._deleteSavedRange();
                e.preventDefault();
            }
        });
    }

});

var ColorTool = Tool.extend({
    init: function(options) {
        Tool.fn.init.call(this, options);

        this.format = [{ tags: ["span","font"] }];
        this.finder = new GreedyInlineFormatFinder(this.format, options.cssAttr);
    },

    options: {
        palette: "websafe",
        columns: 18
    },

    update: function() {
        this._widget.close();
    },

    command: function(commandArguments) {
        var options = this.options,
            format = this.format,
            style = {};

        return new Editor.FormatCommand(extend(commandArguments, {
            formatter: function() {
                style[options.domAttr] = commandArguments.value;

                return new GreedyInlineFormatter(format, { style: style }, options.cssAttr);
            }
        }));
    },

    initialize: function(ui, editor) {
        var that = this,
            toolName = that.options.name,
            component = this._widget = ui.getKendoColorPicker();

        if (!component) {
            return;
        }

        component.bind("change", () => {
            var color = component.value();

            if (color) {
                Tool.exec(editor, toolName, color);
            }

            delete that.storedRange;
            delete that._inputFocused;

            editor.focus();
        });

        component.bind("open", () => {
            that.storedRange = editor.getRange();

            component._popup.element.on(MOUSEDOWN_NS, function(e) {
                if (!$(e.target).is("input.k-color-value")) {
                    e.preventDefault();
                }
            });

            if (!component._popup.element.is("[unselectable='on']")) {
                component._popup.element
                    .attr({ unselectable: "on" })
                    .find("*:not(input)").attr("unselectable", "on")
                    .end().find("input").on("focus", function() {
                        that._inputFocused = true;
                    });
            }

            component._popup.one("activate", () => {
                component._popup.element.find(".k-colorpalette").trigger("focus");
            });
        });

        component.bind("close", (e) => {
            component._popup.element.off(MOUSEDOWN_NS);
        });

        component.unbind("activate").bind("activate", (e) => {
            if (!component._value || component._value.toCssRgba() === "rgba(255, 255, 255, 0)") {
                return;
            }

            component.trigger("change");
        });

        component.wrapper
            .attr({ unselectable: "on" })
            .find("*:not(input)").attr("unselectable", "on");

        component.value("transparent");
    }
});

extend(Editor, {
    InlineFormatFinder: InlineFormatFinder,
    InlineFormatter: InlineFormatter,
    DelayedExecutionTool: DelayedExecutionTool,
    GreedyInlineFormatFinder: GreedyInlineFormatFinder,
    GreedyInlineFormatter: GreedyInlineFormatter,
    InlineFormatTool: InlineFormatTool,
    FontTool: FontTool,
    ColorTool: ColorTool
});

registerFormat("bold", [ { tags: ["strong", "b"] }, { tags: ["span"], attr: { style: { fontWeight: "bold" } } } ]);
registerTool("bold", new InlineFormatTool({
    key: "B",
    ctrl: true,
    format: formats.bold,
    ui: {
        togglable: true
    }
}));

registerFormat("italic", [ { tags: ["em", "i"] }, { tags: ["span"], attr: { style: { fontStyle: "italic" } } } ]);
registerTool("italic", new InlineFormatTool({
    key: "I",
    ctrl: true,
    format: formats.italic,
    ui: {
        togglable: true
    }
}));

registerFormat("underline", [ { tags: ["span"], attr: { style: { textDecoration: "underline" } } }, { tags: ["u"] } ]);
registerTool("underline", new InlineFormatTool({
    key: "U",
    ctrl: true,
    format: formats.underline,
    ui: {
        togglable: true
    }
}));

registerFormat("strikethrough", [ { tags: ["del", "strike"] }, { tags: ["span"], attr: { style: { textDecoration: "line-through" } } } ]);
registerTool("strikethrough", new InlineFormatTool({
    format: formats.strikethrough,
    ui: {
        togglable: true
    }
}));

registerFormat("superscript", [ { tags: ["sup"] } ]);
registerTool("superscript", new InlineFormatTool({
    format: formats.superscript,
    ui: {
        togglable: true
    }
}));

registerFormat("subscript", [ { tags: ["sub"] } ]);
registerTool("subscript", new InlineFormatTool({
    format: formats.subscript,
    ui: {
        togglable: true
    }
}));

registerTool("foreColor", new ColorTool({
    cssAttr: "color",
    fontAttr: "color",
    domAttr: "color",
    name: "foreColor",
    ui: {
        type: "component",
        overflow: "never",
        component: "ColorPicker",
        componentOptions: {
            views: ["palette"],
            toolIcon: "foreground-color",
            palette: "websafe",
            columns: 18,
            preview: false,
            input: false,
            buttons: false,
            commandOn: "change",
            closeOnSelect: true
        }
    }
}));

registerTool("backColor", new ColorTool({
    cssAttr: "background-color",
    domAttr: "backgroundColor",
    name: "backColor",
    ui: {
        type: "component",
        overflow: "never",
        component: "ColorPicker",
        componentOptions: {
            views: ["palette"],
            toolIcon: "droplet",
            palette: "websafe",
            columns: 18,
            preview: false,
            input: false,
            buttons: false,
            commandOn: "change",
            closeOnSelect: true
        }
    }
}));

registerTool("fontName", new FontTool({
    cssAttr: "font-family",
    fontAttr: "face",
    domAttr: "fontFamily",
    name: "fontName",
    defaultValue: [{ text: "fontNameInherit", value: "inherit" }],
    ui: {
        type: "component",
        component: "ComboBox",
        componentOptions: {
            dataValueField: "value",
            dataTextField: "text",
            valuePrimitive: true
        },
        overflow: "never"
    }
}));

registerTool("fontSize", new FontTool({
    cssAttr: "font-size",
    fontAttr: "size",
    domAttr: "fontSize",
    name: "fontSize",
    defaultValue: [{ text: "fontSizeInherit", value: "inherit" }],
    ui: {
        type: "component",
        component: "ComboBox",
        componentOptions: {
            dataValueField: "value",
            dataTextField: "text",
            valuePrimitive: true
        },
        overflow: "never"
    }
}));

})(window.kendo.jQuery);
