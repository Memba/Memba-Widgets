/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.icons.js";

(function($, undefined) {
    var kendo = window.kendo,
        Observable = kendo.Observable,
        encode = kendo.htmlEncode,
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
        actionsIcon: "more-vertical",
        moveCursor: "k-cursor-move",
        categoryBorder: "k-taskboard-card-category",
        headerActions: "k-card-header-actions",
        disabled: "k-disabled"
    };

    var TaskBoardCard = Observable.extend({
        init: function(options, dataItem, resources) {
            var that = this;

            that._dataItem = dataItem;
            that.resources = resources;

            that.options = extend(true, {}, options);

            that._render();

            Observable.fn.init.call(that);
        },

        contentTemplate: (data) => `<div class="${encode(data.styles.header)} ${encode(data.styles.hbox)}">` +
            `<a class="${encode(data.styles.title)} ${encode(data.styles.link)}" href="#" ${data.selectable ? kendo.attr("command") + '=SelectCardCommand' : ''}>${encode(kendo.getter(data.dataTitleField)(data))}</a>` +
            `<span class="${encode(data.styles.spacer)}"></span>` +
            `${data.cardMenuButton}` +
        '</div>' +
        `<div class="${encode(data.styles.body)}"><p>${encode(kendo.getter(data.dataDescriptionField)(data))}</p></div>`,

        cardMenuButtonTemplate: ({ styles }) => `<div class="${encode(styles.headerActions)}"><button aria-label="menu" class="${encode(styles.button)} ${encode(styles.flatButton)} ${encode(styles.cardMenuButton)}">` +
                                    kendo.ui.icon({ icon: encode(styles.actionsIcon), iconClass: "k-button-icon" }) +
                                '</button></div>',

        _render: function() {
            var that = this,
                options = that.options,
                styles = TaskBoardCard.styles,
                template = options.template || that.contentTemplate,
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
                resources: resources,
                dataTitleField: options.dataTitleField,
                dataDescriptionField: options.dataDescriptionField
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

                        if (resource.multiple) {
                            if (resources[resource.field]) {
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

        _buildTemplate: function() {
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

