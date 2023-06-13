/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./inlineformat.js";
import "../../kendo.form.js";

(function($, undefined) {

var kendo = window.kendo,
    encode = kendo.htmlEncode,
    Class = kendo.Class,
    extend = $.extend,
    Editor = kendo.ui.editor,
    dom = Editor.Dom,
    RangeUtils = Editor.RangeUtils,
    Command = Editor.Command,
    Tool = Editor.Tool,
    InlineFormatter = Editor.InlineFormatter,
    InlineFormatFinder = Editor.InlineFormatFinder,
    textNodes = RangeUtils.textNodes,
    editableTextNodes = RangeUtils.editableTextNodes,
    registerTool = Editor.EditorUtils.registerTool,
    keys = kendo.keys;

var HTTP_PROTOCOL = "http://";
var protocolRegExp = /^\w*:\/\//;
var endLinkCharsRegExp = /[\w\/\$\-_\*\?]/i;

var LinkFormatFinder = Class.extend({
    findSuitable: function(sourceNode) {
        return dom.parentOfType(sourceNode, ["a"]);
    }
});

var LinkFormatter = Class.extend({
    init: function() {
        this.finder = new LinkFormatFinder();
    },

    apply: function(range, attributes) {
        var nodes = this.immutables ? editableTextNodes(range) : textNodes(range);
        var markers, doc, formatter, a, parent;

        if (attributes.innerText) {
            doc = RangeUtils.documentFromRange(range);
            markers = RangeUtils.getMarkers(range);

            range.deleteContents();
            a = dom.create(doc, "a", attributes);
            range.insertNode(a);

            parent = a.parentNode;
            if (dom.name(parent) == "a") {
                dom.insertAfter(a, parent);
            }

            if (dom.emptyNode(parent)) {
                dom.remove(parent);
            }

            // move range and markers after inserted link
            var ref = a;
            for (var i = 0; i < markers.length; i++) {
                dom.insertAfter(markers[i], ref);
                ref = markers[i];
            }

            if (markers.length) {
                dom.insertBefore(doc.createTextNode("\ufeff"), markers[1] || markers[0]);
                dom.insertAfter(doc.createTextNode("\ufeff"), markers[1] || markers[0]);
                range.setStartBefore(markers[0]);
                range.setEndAfter(markers[markers.length - 1]);
            }
        } else {
            formatter = new InlineFormatter([{ tags: ["a"] }], attributes);
            formatter.finder = this.finder;
            formatter.apply(nodes);
        }
    }
});

var UnlinkCommand = Command.extend({
    init: function(options) {
        var that = this;
        options.formatter = /** @ignore */ {
            toggle: function(range) {
                var nodes = that.immutables() ? editableTextNodes(range) : textNodes(range);
                new InlineFormatter([{ tags: ["a"] }]).remove(nodes);
            }
        };
        this.options = options;
        Command.fn.init.call(this, options);
    }
});

var LinkCommand = Command.extend({
    init: function(options) {
        var that;
        this.options = options;
        Command.fn.init.call(this, options);
        this.formatter = new LinkFormatter();

        if (!options.url) {
            this.attributes = null;
            this.async = true;
        } else {
            this.exec = function() {
                this.formatter.immutables = that && that.immutables();
                this.formatter.apply(options.range, {
                    href: options.url,
                    innerText: options.text || options.url,
                    target: options.target
                });
            };
        }
    },

    exec: function() {
        var messages = this.editor.options.messages;
        this._initialText = "";
        this._range = this.lockRange(true);
        this.formatter.immutables = this.immutables();

        var nodes = textNodes(this._range);
        var a = nodes.length ? this.formatter.finder.findSuitable(nodes[0]) : null;
        var img = nodes.length && dom.name(nodes[0]) == "img";

        var dialog = this.createDialog("<div/>", {
            title: messages.createLink,
            minWidth: 340,
            close: this._close.bind(this),
            visible: false
        }).data("kendoWindow");

        this._form = this._createForm(dialog);

        if (a) {
            this._range.selectNodeContents(a);
            nodes = textNodes(this._range);
        }

        this._initialText = this.linkText(nodes);

        dialog.wrapper
            .find(".k-dialog-insert").on("click", this._apply.bind(this)).end()
            .find(".k-dialog-close").on("click", this._close.bind(this)).end()
            .find(".k-form-field input").on("keydown", this._keydown.bind(this)).end()
            .find("#k-editor-link-url").val(this.linkUrl(a)).end()
            .find("#k-editor-link-text").val(this._initialText).end()
            .find("#k-editor-link-title").val(a ? a.title : "").end()
            .find("#k-editor-link-target").prop("checked", a ? a.target == "_blank" : false).end()
            .find(".k-editor-link-text-row").toggle(!img);

        this._dialog = dialog.center().open();

        $("#k-editor-link-url", dialog.element).trigger("focus").select();
    },

    _createForm: function(dialog) {
        var that = this;
        var formElement = $("<div/>").appendTo(dialog.element);
        var messages = that.editor.options.messages;
        var form = formElement.kendoForm({
            renderButtons: false,
            items: [
                {
                    field: "k-editor-link-url",
                    label: encode(messages.linkWebAddress),
                    editor: "TextBox"
                },
                {
                    field: "k-editor-link-text",
                    label: encode(messages.linkText),
                    editor: "TextBox"
                },
                {
                    field: "k-editor-link-title",
                    label: encode(messages.linkToolTip),
                    editor: "TextBox"
                },
                {
                    field: "k-editor-link-target",
                    editorOptions: {
                        label: encode(messages.linkOpenInNewWindow)
                    },
                    label: "",
                    editor: "CheckBox"
                }
            ]
        }).data("kendoForm");

        formElement.find("#k-editor-link-text").parents(".k-form-field").addClass("k-editor-link-text-row");

        dialog.element.after($(that._actionButtonsTemplate({ messages, insertButtonIcon: "link", cancelButtonIcon: "cancel-outline" })));

        return form;
    },

    _keydown: function(e) {
        var keys = kendo.keys;

        if (e.keyCode == keys.ENTER) {
            this._apply(e);
        } else if (e.keyCode == keys.ESC) {
            this._close(e);
        }
    },

    _apply: function(e) {
        var element = this._dialog.element;
        var href = $("#k-editor-link-url", element).val();
        var title, text, target;
        var textInput = $("#k-editor-link-text", element);

        if (href && href != HTTP_PROTOCOL) {

            if (href.indexOf("@") > 0 && !/^(\w+:)|(\/\/)/i.test(href)) {
                href = "mailto:" + href;
            }

            this.attributes = { href: href };

            title = $("#k-editor-link-title", element).val();
            if (title) {
                this.attributes.title = title;
            }

            if (textInput.is(":visible")) {
                text = kendo.trim(textInput.val());
                if (!text && !this._initialText) {
                    this.attributes.innerText = href;
                } else if (text && (text !== this._initialText)) {
                    this.attributes.innerText = dom.stripBom(text);
                }
            }

            target = $("#k-editor-link-target", element).is(":checked");
            this.attributes.target = target ? "_blank" : null;

            this.formatter.apply(this._range, this.attributes);
        }

        this._close(e);

        if (this.change) {
            this.change();
        }
    },

    _close: function(e) {
        e.preventDefault();
        this._form.destroy();
        this._dialog.destroy();

        dom.windowFromDocument(RangeUtils.documentFromRange(this._range)).focus();

        this.releaseRange(this._range);
    },

    linkUrl: function(anchor) {
        if (anchor) {
            // IE < 8 returns absolute url if getAttribute is not used
            return anchor.getAttribute("href", 2);
        }

        return HTTP_PROTOCOL;
    },

    linkText: function(nodes) {
        var text = "";
        var i;

        for (i = 0; i < nodes.length; i++) {
            text += nodes[i].nodeValue;
        }

        return dom.stripBom(text || "");
    },

    redo: function() {
        var range = this.lockRange(true);

        this.formatter.apply(range, this.attributes);
        this.releaseRange(range);
    }

});

var AutoLinkCommand = Command.extend({
    init: function(options) {
        Command.fn.init.call(this, options);

        this.formatter = new LinkFormatter();
    },

    exec: function() {
        var detectedLink = this.detectLink();
        if (!detectedLink) {
            return;
        }

        var range = this.getRange();
        var linkMarker = new kendo.ui.editor.Marker();
        var linkRange = range.cloneRange();

        linkRange.setStart(detectedLink.start.node, detectedLink.start.offset);
        linkRange.setEnd(detectedLink.end.node, detectedLink.end.offset);

        range = this.lockRange();
        linkMarker.add(linkRange);

        this.formatter.apply(linkRange, {
            href: this._ensureWebProtocol(detectedLink.text)
        });

        linkMarker.remove(linkRange);
        this.releaseRange(range);
    },

    detectLink: function() {
        var range = this.getRange();
        var startNode = range.startContainer;
        var startOffset = range.startOffset;
        var prev = startNode.previousSibling;
        if (!prev && ((dom.isBom(startNode) && !startNode.nextSibling) || (!startOffset && dom.isDataNode(startNode)))) {
            startNode = startNode.parentNode;
            startOffset = 0;
        }
        var traverser = new LeftDomTextTraverser({
            node: startNode,
            offset: startOffset,
            cancelAtNode: function(node) { return node && dom.name(node) === "a"; }
        });

        var detection = new DomTextLinkDetection(traverser);
        return detection.detectLink();
    },

    changesContent: function() {
        return !!this.detectLink();
    },

    _ensureWebProtocol: function(linkText) {
        var hasProtocol = this._hasProtocolPrefix(linkText);
        return hasProtocol ? linkText : this._prefixWithWebProtocol(linkText);
    },

    _hasProtocolPrefix: function(linkText) {
        return protocolRegExp.test(linkText);
    },

    _prefixWithWebProtocol: function(linkText) {
        return HTTP_PROTOCOL + linkText;
    }
});

var UnlinkTool = Tool.extend({
    init: function(options) {
        this.options = options;
        this.finder = new InlineFormatFinder([{ tags: ["a"] }]);

        Tool.fn.init.call(this, $.extend(options, { command: UnlinkCommand }));
    },

    update: function(ui, nodes) {
        var isLink = this.finder.isFormatted(nodes),
            toolbar = ui.closest(".k-toolbar").data("kendoToolBar");

        if (isLink) {
            toolbar.enable(ui, true);
        } else {
            toolbar.enable(ui, false);
        }
    }
});

var DomTextLinkDetection = Class.extend({
    init: function(traverser) {
        this.traverser = traverser;
        this.start = DomPos();
        this.end = DomPos();
        this.text = "";
    },

    detectLink: function() {
        var node = this.traverser.node;
        var offset = this.traverser.offset;
        if (dom.isDataNode(node)) {
            var text = node.data.substring(0, offset);
            if (/\s{2}$/.test(dom.stripBom(text))) {
                return;
            }
        } else if (offset === 0) {//heuristic for new line
            var p = dom.closestEditableOfType(node, dom.blockElements);
            if (p && p.previousSibling) {
                this.traverser.init({
                    node: p.previousSibling
                });
            }
        }

        this.traverser.traverse(this._detectEnd.bind(this));
        if (!this.end.blank()) {
            this.traverser = this.traverser.clone(this.end);
            this.traverser.traverse(this._detectStart.bind(this));

            if (!this._isLinkDetected()) {
                var puntuationOptions = this.traverser.extendOptions(this.start);
                var puntuationTraverser = new RightDomTextTraverser(puntuationOptions);
                puntuationTraverser.traverse(this._skipStartPuntuation.bind(this));
                if (!this._isLinkDetected()) {
                    this.start = DomPos();
                }
            }
        }

        if (this.start.blank()) {
            return null;
        } else {
            return {
                start: this.start,
                end: this.end,
                text: this.text
            };
        }
    },

    _isLinkDetected: function() {
        return protocolRegExp.test(this.text) || /^w{3}\./i.test(this.text);
    },

    _detectEnd: function(text, node) {
        var i = lastIndexOfRegExp(text, endLinkCharsRegExp);
        if (i > -1) {
            this.end.node = node;
            this.end.offset = i + 1;

            return false;
        }
    },

    _detectStart: function(text, node) {
        var i = lastIndexOfRegExp(text, /\s/);
        var ii = i + 1;
        this.text = text.substring(ii) + this.text;

        this.start.node = node;
        this.start.offset = ii;

        if (i > -1) {
            return false;
        }
    },

    _skipStartPuntuation: function(text, node, offset) {
        var i = indexOfRegExp(text, /\w/);
        var ii = i;
        if (i === -1) {
            ii = text.length;
        }

        this.text = this.text.substring(ii);
        this.start.node = node;
        this.start.offset = ii + (offset | 0);

        if (i > -1) {
            return false;
        }
    }
});

function lastIndexOfRegExp(str, search) {
    var i = str.length;
    while (i-- && !search.test(str[i])) {}

    return i;
}
function indexOfRegExp(str, search) {
    var r = search.exec(str);

    return r ? r.index : -1;
}

var DomPos = function() {
    return {
        node: null,
        offset: null,
        blank: function() {
            return this.node === null && this.offset === null;
        }
    };
};

var DomTextTraverser = Class.extend({
    init: function(options) {
        this.node = options.node;
        this.offset = options.offset === undefined ? (dom.isDataNode(this.node) && this.node.length) || 0 : options.offset;
        this.cancelAtNode = options.cancelAtNode || this.cancelAtNode || $.noop;
    },

    traverse: function(callback) {
        if (!callback) {
            return;
        }
        this.cancel = false;
        this._traverse(callback, this.node, this.offset);
    },

    _traverse: function(callback, node, offset) {
        if (!node || this.cancel) {
            return;
        }
        if (node.nodeType === 3) {
            var text = node.data;
            if (offset !== undefined) {
                text = this.subText(text, offset);
            }
            this.cancel = (callback(text, node, offset) === false);
        }
        else {
            var edgeNode = this.edgeNode(node);
            this.cancel = this.cancel || this.cancelAtNode(edgeNode);
            return this._traverse(callback, edgeNode);
        }

        var next = this.next(node);
        if (!next) {
            var parent = node.parentNode;
            while (!next && dom.isInline(parent)) {
                next = this.next(parent);
                parent = parent.parentNode;
            }
        }
        this.cancel = this.cancel || this.cancelAtNode(next);
        this._traverse(callback, next);
    },

    extendOptions: function(o) {
        return $.extend({
            node: this.node,
            offset: this.offset,
            cancelAtNode: this.cancelAtNode
        }, o || {});
    },

    edgeNode: function(node) {},
    next: function(node) {},
    subText: function(text, offset) {}

});

var LeftDomTextTraverser = DomTextTraverser.extend({
    subText: function(text, splitIndex) {
        return text.substring(0, splitIndex);
    },

    next: function(node) {
        return node.previousSibling;
    },

    edgeNode: function(node) {
        return node.lastChild;
    },

    clone: function(options) {
        var o = this.extendOptions(options);
        return new LeftDomTextTraverser(o);
    }
});

var RightDomTextTraverser = DomTextTraverser.extend({
    subText: function(text, splitIndex) {
        return text.substring(splitIndex);
    },

    next: function(node) {
        return node.nextSibling;
    },

    edgeNode: function(node) {
        return node.firstChild;
    },

    clone: function(options) {
        var o = this.extendOptions(options);
        return new RightDomTextTraverser(o);
    }
});

extend(kendo.ui.editor, {
    LinkFormatFinder: LinkFormatFinder,
    LinkFormatter: LinkFormatter,
    UnlinkCommand: UnlinkCommand,
    LinkCommand: LinkCommand,
    AutoLinkCommand: AutoLinkCommand,
    UnlinkTool: UnlinkTool,
    DomTextLinkDetection: DomTextLinkDetection,
    LeftDomTextTraverser: LeftDomTextTraverser,
    RightDomTextTraverser: RightDomTextTraverser
});

registerTool("createLink", new Tool({ key: "K", ctrl: true, command: LinkCommand }));
registerTool("unlink", new UnlinkTool({ key: "K", ctrl: true, shift: true, ui: { enable: false } }));
registerTool("autoLink", new Tool({ key: [keys.ENTER, keys.SPACEBAR], keyPressCommand: true, command: AutoLinkCommand }));

})(window.kendo.jQuery);
