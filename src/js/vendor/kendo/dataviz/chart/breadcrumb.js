/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.breadcrumb.js";

(function($, undefined) {

    const kendo = window.kendo;
    const dataviz = kendo.dataviz;
    const Widget = kendo.ui.Widget;

    const ChartBreadcrumb = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            if (!options.chart) {
                throw new Error('ChartBreadcrumb: No Chart instance supplied as `options.chart`');
            }

            this._attachChartEvents();
            this._renderBreadcrumb();

            kendo.notify(this, dataviz.ui);
        },

        events: [],

        options: {
            name: "ChartBreadcrumb",
            rootItem: {
                type: 'rootitem',
                icon: 'home',
                text: 'Home',
                showIcon: true
            }
        },

        destroy: function() {
            if (this.breadcrumb) {
                this.breadcrumb.destroy();
                this.breadcrumb = null;
            }

            if (this.chart) {
                this.chart.unbind('drilldown', this._onChartDrilldown);
                this.chart.unbind('drilldownLevelChange', this._onChartDrilldownLevelChange);
                this.chart = null;
            }

            Widget.fn.destroy.call(this);
        },

        _attachChartEvents(deferred) {
            const options = this.options;

            if (typeof options.chart.resetDrilldownLevel === 'function') {
                this.chart = options.chart;
            } else if (typeof options.chart === 'string') {
                this.chart = $(options.chart).getKendoChart() || $('#' + options.chart).getKendoChart();

                if (!this.chart && !deferred) {
                    setTimeout(() => this._attachChartEvents(true));
                    return;
                }
            } else {
                throw new Error('ChartBreadcrumb: `options.chart` must be a Chart instance, element ID or a selector');
            }

            this._onChartDrilldown = this._onChartDrilldown.bind(this);
            this.chart.bind('drilldown', this._onChartDrilldown);

            this._onChartDrilldownLevelChange = this._onChartDrilldownLevelChange.bind(this);
            this.chart.bind('drilldownLevelChange', this._onChartDrilldownLevelChange);
        },

        _renderBreadcrumb: function() {
            const breadcrumbElement = $('<nav />');
            this.element.append(breadcrumbElement);
            this.breadcrumb = new kendo.ui.Breadcrumb(breadcrumbElement, {
                items: [this.options.rootItem]
            });

            this.breadcrumb.bind('click', e => this._onBreadcrumbClick(e));
        },

        _onBreadcrumbClick: function(e) {
            if (!this.breadcrumb || !this.chart) {
                return;
            }

            let items = this.breadcrumb.items();
            const level = items.findIndex((item) => item === e.item);

            const chart = this.chart;
            chart.resetDrilldownLevel(level);
        },

        _onChartDrilldown: function(e) {
            if (!this.breadcrumb || e.isDefaultPrevented()) {
                return;
            }

            this.breadcrumb.items([
                ...this.breadcrumb.items(),
                { type: 'item', text: e.point.category }
            ]);
        },

        _onChartDrilldownLevelChange: function(e) {
            if (!this.breadcrumb) {
                return;
            }

            let items = this.breadcrumb.items();
            items = items.slice(0, e.level + 1);
            this.breadcrumb.items(items);
        }
    });

    dataviz.ui.plugin(ChartBreadcrumb);

})(window.kendo.jQuery);
