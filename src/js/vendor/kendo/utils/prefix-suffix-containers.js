/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
let $ = kendo.jQuery;

export function addInputPrefixSuffixContainers({ widget, wrapper, options, prefixInsertBefore, suffixInsertAfter }) {
    var prefix = options.prefixOptions,
        suffix = options.suffixOptions,
        hasPrefixContent = prefix.template || prefix.icon,
        hasSuffixContent = suffix.template || suffix.icon,
        suffixInsertAfter = suffixInsertAfter || prefixInsertBefore,
        layoutFlow = options.layoutFlow,
        containerOrientation = layoutFlow ? (layoutFlow == "vertical" ? "horizontal" : "vertical") : "horizontal",
        separatorOrientation = layoutFlow == "vertical" ? "horizontal" : "vertical",
        INPUT_SEPARATOR = `<span class="k-input-separator k-input-separator-${separatorOrientation}"></span>`,
        prefixContainer,
        suffixContainer;

    if (prefix && hasPrefixContent) {
        prefixContainer = wrapper.children(".k-input-prefix");

        if (!prefixContainer[0]) {
            prefixContainer = $(`<span class="k-input-prefix k-input-prefix-${containerOrientation}" />`);
            if (prefixInsertBefore) {
                prefixContainer.insertBefore(prefixInsertBefore);
            } else {
                prefixContainer.prependTo(wrapper);
            }
        }

        if (prefix.icon) {
            prefixContainer.html(kendo.html.renderIcon({ icon: prefix.icon }));
        }

        if (prefix.template) {
            prefixContainer.html(kendo.template(prefix.template)({}));
        }

        if (prefix.separator) {
            $(INPUT_SEPARATOR).insertAfter(prefixContainer);
        }
    }

    if (suffix && hasSuffixContent) {
        suffixContainer = wrapper.children(".k-input-suffix");

        if (!suffixContainer[0]) {
            suffixContainer = $(`<span class="k-input-suffix k-input-suffix-${containerOrientation}" />`).appendTo(wrapper);
            if (suffixInsertAfter) {
                suffixContainer.insertAfter(suffixInsertAfter);
            } else {
                suffixContainer.appendTo(wrapper);
            }
        }

        if (suffix.icon) {
            suffixContainer.html(kendo.html.renderIcon({ icon: suffix.icon }));
        }

        if (suffix.template) {
            suffixContainer.html(kendo.template(suffix.template)({}));
        }

        if (suffix.separator) {
            $(INPUT_SEPARATOR).insertBefore(suffixContainer);
        }
    }

    widget._prefixContainer = prefixContainer;
    widget._suffixContainer = suffixContainer;
}