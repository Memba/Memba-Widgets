/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function($, undefined) {
    var Class = kendo.Class,
        extend = $.extend,
        SEARCH_HIGHLIGHT_MARK_CLASS = "k-search-highlight-mark",
        isArray = Array.isArray;

    var SearchDOM = Class.extend({
        init: function(options) {
            var that = this;

            that.options = extend({}, that.options, options);

            that.processDom();
        },

        options: {
            highlightClass: "k-search-highlight",
            charClass: "k-text-char"
        },

        processDom: function() {
            var that = this;

            that.targets = isArray(that.options.target) ? that.options.target : [that.options.target];
            that.textNodes = [];
            that.charIndex = 0;
            that.text = "";

            that.targets.forEach(function(target) {
                that.traverseToTextNode(target);
            });

            for (var i = 0; i < that.textNodes.length; i++) {
                that.processTextNode(that.textNodes[i]);
            }
        },

        traverseToTextNode: function(node) {
            var that = this;

            if (node.nodeType === 3) {
                that.textNodes.push(node);
            } else {
                for (var i = 0; i < node.childNodes.length; i++) {
                    that.traverseToTextNode(node.childNodes[i]);
                }
            }
        },

        processTextNode: function(node) {
            var that = this;
            var text = node.textContent;
            var span;

            that.text = that.text + text;

            if (text.length > 0) {
                span = $(node).wrap("<span>").parent();
                span.parent().attr("role", "presentation");
                span.empty();
                that.splitChars(span.get(0), text);
                span.children().unwrap();
            }
        },

        splitChars: function(span, text) {
            var that = this;
            var newHtml = "";

            for (var i = 0; i < text.length; i++) {
                newHtml = newHtml + "<span class='" + that.options.charClass + "' " + kendo.attr("char-index") + "=" + that.charIndex + ">" + text[i] + "</span>";
                that.charIndex++;
            }

            span.innerHTML = newHtml;
        },

        search: function(value, matchCase) {
            var that = this;
            var expression = new RegExp(value, !matchCase ? "gi" : "g");
            var match;

            that.matches = [];

            that.resetMark();
            that.resetHighlight();
            that.resetMatchIndex();

            if (value === "") {
                return;
            }

            match = expression.exec(that.text);

            while (match) {
                that.matches.push({
                    startOffset: match.index,
                    endOffset: match.index + match[0].length
                });

                match = expression.exec(that.text);
            }

            that.highlightAll();
            that.mark();
        },

        highlightAll: function() {
            var that = this;

            that.matches.forEach(function(match, index) {
                var start = match.startOffset;
                var end = match.endOffset;

                that.highlight(start, end, index + 1);
            });
        },

        highlight: function(start, end, matchIndex) {
            var that = this;

            for (var i = start; i < end; i++) {
                $(that.targets)
                    .find("." + that.options.charClass + "[" + kendo.attr("char-index") + "=" + i + "]")
                    .addClass(that.options.highlightClass)
                    .attr(kendo.attr("match-index"), matchIndex);
            }
        },

        resetHighlight: function() {
            var that = this;

            $(that.targets)
                .find("." + that.options.highlightClass)
                .removeClass(that.options.highlightClass);
        },

        resetMatchIndex: function() {
            var that = this;

            $(that.targets)
                .find("." + that.options.charClass + "[" + kendo.attr("match-index") + "]")
                .removeAttr(kendo.attr("match-index"));
        },

        mark: function() {
            var that = this;

            if (!that.currentIndex && that.currentIndex !== 0) {
                that.currentIndex = 0;
            } else if (that.currentIndex > that.matches.length) {
                that.currentIndex = that.matches.length;
            } else {
                that.resetMark();
            }

            $(that.targets)
                .find("." + that.options.charClass + "[" + kendo.attr("match-index") + "=" + that.currentIndex + "]")
                .wrapInner(`<span class="${SEARCH_HIGHLIGHT_MARK_CLASS}">`);
        },

        resetMark: function() {
            var that = this;
            $(that.targets).find("." + SEARCH_HIGHLIGHT_MARK_CLASS).contents().unwrap();
        },

        nextMatch: function() {
            var that = this;

            that.currentIndex++;

            if (that.currentIndex > that.matches.length) {
                that.currentIndex = 1;
            }

            that.mark();
        },

        previousMatch: function() {
            var that = this;

            that.currentIndex--;

            if (that.currentIndex < 1) {
                that.currentIndex = that.matches.length;
            }

            that.mark();
        },

        getMarkedIndex: function() {
            return this.matches.length ? this.currentIndex : 0;
        },

        getFirstMarked: function() {
            return $(this.targets).find("." + SEARCH_HIGHLIGHT_MARK_CLASS).eq(0);
        },

        destroy: function() {
            var that = this;

            that.resetMark();
            $(that.targets).children("span:not(." + that.options.charClass + ")").each(function(i, item) {
                $(item).text($(item).text());
            });
        }
    });

    extend(kendo.pdfviewer, {
        SearchDOM: SearchDOM
    });
})(window.kendo.jQuery);

