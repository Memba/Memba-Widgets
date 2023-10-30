/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.splitter.js";
import "./kendo.tabstrip.js";
import "./kendo.window.js";
import "./kendo.html.button.js";
import "./kendo.resizable.js";
import "./kendo.draganddrop.js";

const __meta__ = {
    id: "dockManager",
    name: "DockManager",
    category: "web",
    description: "The DockManager widget represents a layout component that allows users to achieve custom layouts by docking panes.",
    depends: ["core", "splitter", "tabstrip", "window", "html.button"]
};

(function($, undefined) {
    const kendo = window.kendo,
        Widget = kendo.ui.Widget,
        NS = ".kendoDockManager",
        ui = kendo.ui,
        extend = $.extend,
        pxUnitsRegex = /^\d+(\.\d+)?px$/i,
        percentageUnitsRegex = /^\d+(\.\d+)?%$/i,
        isPlainObject = $.isPlainObject,
        DOCK_MANAGER = "k-dock-manager",
        DOCK_MANAGER_TOOLBAR = "k-dock-manager-toolbar",
        TOOLBAR_TEMPLATE = `<div class="${DOCK_MANAGER_TOOLBAR} k-toolbar-left k-toolbar k-toolbar-md"></div>`,
        TOOLBAR_BUTTON = "k-toolbar-button",
        SEPARATOR = `<div class="k-separator k-separator-horizontal"></div>`,
        KSTATIC_PANE = "k-pane-static",
        KKPINNED_PANE = "k-pane-pinned",
        KPANE_TABBED = "k-pane-tabbed",
        SPLITTER = "k-splitter",
        KSPLITBAR = "k-splitbar",
        SPLITTER_FLEX = "k-splitter-flex",
        DOCK_SPLITTER = "k-dock-manager-splitter",
        KUNPINNED_CONTAINER = "k-dock-manager-unpinned-container",
        PANE_SIZING_PROP = "flex-basis",
        HORIZONTAL = "horizontal",
        VERTICAL = "vertical",
        KHIDDEN = "k-hidden",
        KBUTTON = "k-button",
        MAX_NUMBER_VALUE = Number.MAX_SAFE_INTEGER,
        KPANE = "k-pane",
        KPANE_FLEX = "k-pane-flex",
        KPANES_CONTAINER = "k-dock-manager-pane-container",
        KPANE_SCROLLABLE = "k-pane-scrollable",
        KPANE_ACTIONS = "k-pane-actions",
        KDOCK_INDICATOR = "k-dock-indicator",
        KDOCK_NAVIGATOR = "k-dock-navigator",
        KDOCK_PREVIEW = "k-docking-preview",
        KSELECTED = "k-selected",
        KACTIVE = "k-active",
        KTABSTRIP = "k-tabstrip",
        KSPLITBAR_DRAGGABLE = "k-splitbar-draggable",
        SPLIT = "split",
        TAB = "tab",
        CONTENT = "content",
        HEIGHT = "height",
        WIDTH = "width",
        TOP = "top",
        BOTTOM = "bottom",
        LEFT = "left",
        RIGHT = "right",
        MIDDLE = "middle",
        CLICK = "click",
        PIN = "pin",
        UNPIN = "unpin",
        UNSHIFT = "unshift",
        PUSH = "push",
        PANE = `<div class="${KPANE} ${KPANE_FLEX} ${KSTATIC_PANE}"></div>`,
        paneSelector = uid => `.${KPANE}[${kendo.attr("uid")}="${uid}"]`,
        buttonTextTemplate = text => `<span class="k-button-text">${text}</span>`,
        contentPaneTemplate = data => `<div class="${KPANE_SCROLLABLE}">
                                            <div class="k-pane-header">
                                                <span class="k-pane-title">${data.title}</span>
                                                <div class="${KPANE_ACTIONS}"></div>
                                            </div>
                                            <div class="k-pane-content">${data.content}</div>
                                        </div>`,
        tabTemplate = title => `<li><span class="k-link">${title}</span></li>`,
        unpinnedResizeSplitbar = `<div class="k-splitbar k-splitbar-horizontal ${KSPLITBAR_DRAGGABLE}-horizontal">
                                    <div class="k-resize-handle"></div>
                                </div>`,
        UID_ATTR = kendo.attr("uid"),
        INDICATOR_ATTR = kendo.attr("indicator"),
        ACTION_ATTR = kendo.attr("action"),
        hintTemplate = pane => `<div class="k-tooltip k-tooltip-primary">
                                    <div class="k-tooltip-content">${pane.title}</div>
                                </div>`,
        INDICATOR_TEMPLATE = `<div class="${KDOCK_INDICATOR}">
                        <span class="k-svg-icon k-icon-xl k-svg-i-position-top">
                        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M480 448V32H32v448h448v-32zm-416 0V64h384v384H64zM96 96h320v96H96z"></path>
                        </svg>
                        </span>
                    </div>`,
        NAVIGATOR_TEMPLATE = `<div class="${KDOCK_NAVIGATOR}" style="position: relative;">
                                <div class="k-dock-indicator k-dock-indicator-top" ${INDICATOR_ATTR}="top">
                                <span class="k-svg-icon k-icon-xl k-svg-i-position-top">
                                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M480 448V32H32v448h448v-32zm-416 0V64h384v384H64zM96 96h320v96H96z"></path>
                                    </svg>
                                </span>
                                </div>
                                <div class="k-dock-indicator k-dock-indicator-right" ${INDICATOR_ATTR}="right">
                                <span class="k-svg-icon k-icon-xl k-svg-i-position-right">
                                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M64 480h416V32H32v448h32zm0-416h384v384H64V64zm256 32h96v320h-96z"></path>
                                    </svg>
                                </span>
                                </div>
                                <div class="k-dock-indicator k-dock-indicator-bottom" ${INDICATOR_ATTR}="bottom">
                                <span class="k-svg-icon k-icon-xl k-svg-i-position-bottom">
                                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M32 64v416h448V32H32v32zm416 0v384H64V64h384zM96 320h320v96H96z"></path>
                                    </svg>
                                </span>
                                </div>
                                <div class="k-dock-indicator k-dock-indicator-left" ${INDICATOR_ATTR}="left">
                                <span class="k-svg-icon k-icon-xl k-svg-i-position-left">
                                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M448 32H32v448h448V32h-32zm0 416H64V64h384v384zM96 96h96v320H96z"></path>
                                    </svg>
                                </span>
                                </div>
                                <div class="k-dock-indicator k-dock-indicator-middle" ${INDICATOR_ATTR}="middle">
                                <span class="k-svg-icon k-icon-xl k-svg-i-window">
                                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M96 96v320h320V96H96zm288 288H128V192h256v192z"></path>
                                    </svg>
                                </span>
                                </div>
                            </div>`,
        SPLITBAR = (splitter) => $(`<div class="${KSPLITBAR} ${KSPLITBAR}-${splitter.options.orientation} ${KSPLITBAR_DRAGGABLE}-${splitter.options.orientation}" ${kendo.attr("marker")}="${splitter._marker}" >
                        <div class="k-resize-handle"></div>
                    </div>`),
        CLOSE = "close",
        DOCK = "dock",
        INNER_DOCK = "innerDock",
        RESIZE = "resize",
        DRAG = "drag",
        DRAGSTART = "dragStart",
        DRAGEND = "dragEnd",
        CHANGE = "change";

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function isPercentageSize(size) {
        return percentageUnitsRegex.test(size);
    }

    function isPixelSize(size) {
        return pxUnitsRegex.test(size) || /^\d+$/.test(size);
    }

    function isFluid(size) {
        return !isPercentageSize(size) && !isPixelSize(size);
    }

    function calculateSize(size, total) {
        let output = parseInt(size, 10);

        if (isPercentageSize(size)) {
            output = Math.floor(output * total / 100);
        }

        return output;
    }

    function toPercentages(value) {
        return `${value}%`;
    }

    function toPixel(value ) {
        return kendo.parseFloat(value) + "px";
    }

    function percentage(partialValue, totalValue) {
        return (100 * partialValue) / totalValue;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    const DockSplitter = Widget.extend({
        init: function(element, options) {
            const that = this;

            Widget.fn.init.call(that, element, options);
            options = $.extend(true, {}, options);
            that._marker = kendo.guid().substring(0, 8);
            that.element.addClass(`${SPLITTER} ${SPLITTER_FLEX} ${SPLITTER}-${options.orientation} ${DOCK_SPLITTER}`);
            that._initPanes();
            that._initResizable();
            kendo.notify(that);
        },

        options: {
            orientation: "horizontal",
            panes: []
        },

        events: [
            RESIZE
        ],

        _initPanes: function() {
            const that = this;
            const paneElements = that.element.children();
            const panesCount = paneElements.length;
            const orientation = that.options.orientation;
            const markerAttribute = kendo.attr("marker");
            const sizedPanes = [];

            for (let i = 0; i < panesCount; i++) {
                const paneElement = paneElements.eq(i);
                let pane = that.options.panes[i];

                if (!pane) {
                    pane = that.options.panes[i] = {};
                }

                pane.size = pane.size || "auto";
                paneElement.attr(kendo.attr("uid"), pane.uid)
                            .attr("role", "group")
                            .css("flex-basis", pane.size)
                            .addClass();

                if (pane.collapsed) {
                    pane.css("display", "none");
                }

                if (i < panesCount - 1 && !that.options.panes[i + 1].collapsed) {
                    let splitbar = SPLITBAR(that);

                    splitbar.insertAfter(paneElement);
                }

                if (pane.size) {
                    sizedPanes.push(paneElement);
                }
            }

            if (sizedPanes.length === 1 && panesCount > 1) {
                sizedPanes.pop().addClass(KSTATIC_PANE);
            }
        },

        _initResizable: function() {
            const that = this;
            const orientation = that.options.orientation;
            const markerAttribute = kendo.attr("marker");

            that._resizable = new kendo.ui.Resizable(that.element, {
                orientation: orientation,
                handle: `[${markerAttribute}=${that._marker}].${KSPLITBAR_DRAGGABLE}-${orientation} `,
                clickMoveClick: that.options.clickMoveClick,
                invalidClass: "k-restricted-size-" + orientation,
                resizeend: function() {
                    that.element.find(".k-splitter-overlay").remove();
                },
                resize: function(e) {
                    const axis = orientation === HORIZONTAL ? 'x' : 'y';
                    let delta;
                    const splitterBarIndex = that._getElementIndex(e.currentTarget, `.${KSPLITBAR}`);
                    const splitterBar = e.currentTarget;

                    if (orientation === HORIZONTAL) {
                        const rtlModifier = kendo.support.isRtl(that.element) ? -1 : 1;
                        delta = e.x.delta * rtlModifier;
                    } else {
                        delta = e.y.delta;
                    }

                    const { leftPane, rightPane } = that._dragSplitterBar(splitterBar, splitterBarIndex, delta);
                    that.trigger(RESIZE, { leftPane: leftPane, rightPane: rightPane });
                },
                start: that._onResizeStart.bind(that)
            });

        },

        _dragSplitterBar: function(splitterBar, splitterBarIndex, delta) {
            const that = this;
            const { leftPane, rightPane } = that._getAdjacentPanes(splitterBar, splitterBarIndex);

            const leftPaneNewSize = leftPane.computedSize + delta;
            const isLeftPaneSizeInBounds = leftPaneNewSize > leftPane.min && leftPaneNewSize < leftPane.max;

            const panesWithoutSize = that._getPaneElements().filter(x => !x.style[PANE_SIZING_PROP]);
            const canResizeBothPanes = (leftPane.size || rightPane.size) && panesWithoutSize.length > 1;

            if ((leftPane.size && rightPane.size) || canResizeBothPanes) {
                if (isLeftPaneSizeInBounds) {
                    that._resizePane(leftPane, delta);
                    that._resizePane(rightPane, -delta);
                }
            } else if (rightPane.size) {
                that._resizePane(rightPane, -delta);
            } else {
                that._resizePane(leftPane, delta);
            }
            return { leftPane, rightPane };
        },

        _getAdjacentPanes: function(splitterBar, splitterBarIndex) {
            const that = this;
            const leftPaneIndex = splitterBarIndex;
            const rightPaneIndex = splitterBarIndex + 1;

            const leftPaneELement = that._getPaneElement(leftPaneIndex);
            const rightPaneELement = that._getPaneElement(rightPaneIndex);

            const leftPane = that._getPane(leftPaneIndex);
            const rightPane = that._getPane(rightPaneIndex);

            const leftPaneSize = that._getPaneOffsetSize(leftPaneIndex);
            const rightPaneSize = that._getPaneOffsetSize(rightPaneIndex);

            const totalPaneSize = leftPaneSize + rightPaneSize;
            const splitterSize = that._getElementClientSize(that.element, that.options.orientation);
            const getPixelSize = paneSize => that._calculatePixelSize(paneSize, splitterSize);

            const { leftPaneMaxSize, rightPaneMaxSize } = that._getAdjacentPanesMaxSize(leftPaneIndex, rightPaneIndex);
            const rightMaxPixelSize = getPixelSize(rightPane && rightPane.max);
            const leftMaxPixelSize = getPixelSize(leftPane && leftPane.max);

            return {
                leftPane: {
                    index: leftPaneIndex,
                    computedSize: leftPaneSize,
                    min: getPixelSize(leftPane && leftPane.min) || ( rightMaxPixelSize ? totalPaneSize - rightMaxPixelSize : 0 ) || 0,
                    max: leftPaneMaxSize,
                    size: leftPaneELement.style[PANE_SIZING_PROP],
                    collapsible: leftPane && leftPane.collapsible,
                    uid: leftPane.uid
                },
                rightPane: {
                    index: rightPaneIndex,
                    computedSize: rightPaneSize,
                    min: getPixelSize(rightPane && rightPane.min) || (leftMaxPixelSize ? totalPaneSize - leftMaxPixelSize : 0) || 0,
                    max: rightPaneMaxSize,
                    size: rightPaneELement.style[PANE_SIZING_PROP],
                    collapsible: rightPane && rightPane.collapsible,
                    uid: rightPane.uid
                }
            };
        },

        _resizePane: function(pane, delta) {
            const that = this;
            const constrainedSize = clamp(pane.computedSize + delta, pane.min, pane.max);
            let newSize = "";

            if (isPercentageSize(pane.size)) {
                const splitterSize = that._getElementClientSize(that.element, that.options.orientation);
                newSize = toPercentages(100 * constrainedSize / splitterSize);
            } else {
                newSize = toPixel(constrainedSize);
            }
            pane.size = newSize;
            that._setPaneSize(pane.index, newSize);
        },

        _allExpandedPanesHaveSize: function() {
            const that = this;
            const expandedPanes = that.options.panes.filter(x=> !x.collapsed);

            if (expandedPanes.length) {
                return expandedPanes.filter(x=> x.size).length;
            }

            return false;
        },

        _setPaneSize: function(paneIndex, size) {
            const that = this;
            const paneElement = that._getPaneElement(paneIndex);

            if (!paneElement) {
                return;
            }

            if (!that._allExpandedPanesHaveSize()) {
                $(paneElement).addClass(KSTATIC_PANE);
            }

            paneElement.style[PANE_SIZING_PROP] = size;
        },

        _getPaneSizes: function(paneIndex) {
            const that = this;
            const splitterSize = that._getElementClientSize(that.element, that.options.orientation);
            const pane = that._getPane(paneIndex);
            const paneSize = that._getPaneOffsetSize(paneIndex);
            const paneMinSize = pane && pane.min ? that._calculatePixelSize(pane.min, splitterSize) : 0;
            const paneMaxSize = pane && pane.max ? that._calculatePixelSize(pane.max, splitterSize) : MAX_NUMBER_VALUE;

            return {
                size: paneSize,
                min: paneMinSize,
                max: paneMaxSize
            };
        },

        _calculatePixelSize: function(size, containerSize) {
            let numericSize = kendo.parseFloat(size);

            if (isPercentageSize(size)) {
                numericSize = (containerSize * numericSize / 100);
            }

            return numericSize;
        },

        _getPaneOffsetSize: function(paneIndex) {
            const that = this;
            const paneElement = that._getPaneElement(paneIndex);
            const size = that._getElementOffsetSize(paneElement, that.options.orientation);
            return size;
        },


        _getElementOffsetSize: function(element, orientation) {
            if (!element) {
                return 0;
            }

            const rect = element.getBoundingClientRect();

            if (orientation === HORIZONTAL) {
                return rect.width;
            } else {
                return rect.height;
            }
        },

        _getElementClientSize: function(element, orientation) {
            const that = this;

            return that._getElementSize(element, orientation, "client");
        },

        _getElementSize: function(element, orientation, sizeType) {
            if (!element) {
                return 0;
            }

            element = element[0];

            if (orientation === HORIZONTAL) {
                return element[`${sizeType}Width`];
            } else {
                return element[`${sizeType}Height`];
            }
        },

        _getPane: function(paneIndex) {
            const that = this;

            return (that.options.panes || [])[paneIndex];
        },

        _getPaneIndex: function(pane) {
            const that = this;

            return that.options.panes.indexOf(pane);
        },

        _getAdjacentPanesMaxSize: function(leftPaneIndex, rightPaneIndex) {
            const that = this;
            const {
                size: leftPaneSize,
                min: leftPaneMinSize,
                max: leftPaneMaxPixelSize
            } = that._getPaneSizes(leftPaneIndex);

            const {
                size: rightPaneSize,
                min: rightPaneMinSize,
                max: rightPaneMaxPixelSize
            } = that._getPaneSizes(rightPaneIndex);

            const totalPaneSize = leftPaneSize + rightPaneSize;

            const leftPaneMaxSize = Math.min(leftPaneMaxPixelSize, totalPaneSize - rightPaneMinSize);
            const rightPaneMaxSize = Math.min(rightPaneMaxPixelSize, totalPaneSize - leftPaneMinSize);

            return {
                leftPaneMaxSize,
                rightPaneMaxSize
            };
        },

        _onResizeStart: function(e) {
            const that = this;

            e.stopPropagation();

            const splitterBarIndex = that._getElementIndex(e.currentTarget, `.${SPLITTER}`);

            that._addResizeOverlays(splitterBarIndex);
        },

        _addResizeOverlays: function(splitterBarIndex) {
            const that = this;

            that._addResizeOverlay(splitterBarIndex);
            that._addResizeOverlay(splitterBarIndex + 1);
        },

        _addResizeOverlay: function(paneIndex) {
            const that = this;
            const paneElement = that._getPaneElement(paneIndex);

            if (!paneElement) {
                return;
            }

            const overlay = $(`<div class="k-splitter-overlay k-overlay"></div>`);

            $(paneElement).append(overlay);
        },


        _getPaneElement: function(paneIndex) {
            const that = this;
            const panes = that._getPaneElements();
            return panes[paneIndex];
        },

        _getPaneElements: function() {
            const that = this;
            const panes = Array.from(that.element.children() || []).filter(x => $(x).hasClass("k-pane") || $(x).hasClass("k-splitter"));
            return panes;
        },

        _getElementIndex: function(element, childrenSelector) {
            if (!element) {
                return [].indexOf(element);
            }

            let children = Array.from(element.parent().children());

            if (childrenSelector) {
                children = children.filter(x => x.matches(childrenSelector));
            }

            return Array.from(children).indexOf(element[0]);
        },

        destroy: function() {
            const that = this;

            Widget.fn.destroy.call(that);

            that.element.off(NS);
            that.element.empty();

            that._resizable.destroy();
            kendo.destroy(that.element);
        }
    });

    const DockManager = Widget.extend({
        init: function(element, options) {
            const that = this;

            Widget.fn.init.call(that, element, options);
            options = $.extend(true, {}, options);
            that.element.addClass(DOCK_MANAGER);

            that.panesContainer = $(`<div class="${KPANES_CONTAINER}" />`).appendTo(that.element);
            that._processPanes(that.options.rootPane);
            that._refreshToolbar();
            that._createPane(that.panesContainer, that.options.rootPane);
            that._bindEvents();
            that._initNavigator();
            that._initUnpinnedResizable();

            kendo.notify(that);
        },

        events: [
            CLOSE,
            PIN,
            UNPIN,
            DOCK,
            INNER_DOCK,
            RESIZE,
            DRAG,
            DRAGSTART,
            DRAGEND
        ],

        options: {
            name: 'DockManager',
            rootPane: {
                type: SPLIT,
                orientation: HORIZONTAL,
                panes: []
            }
        },

        paneDefaults: {
            visible: true,
            closeable: true,
            collapsed: false,
            size: ''
        },

        actions: [
            {
                name: "pin",
                icon: "unpin",
                shouldAdd: pane => pane.unpinnable && pane.unpinnable.unpinned
            },{
                name: "unpin",
                icon: "pin",
                shouldAdd: pane => pane.unpinnable && !pane.unpinnable.unpinned
            },{
                name: "minimize",
                icon: "minimize",
                shouldAdd: pane => pane.minimizable
            },{
                name: "maximize",
                icon: "maximize",
                shouldAdd: pane => pane.maximizable
            },{
                name: "close",
                icon: "x",
                shouldAdd: pane => pane.closeable != false
            },{
                name: "more",
                icon: "more-vertical",
                shouldAdd: pane => false //not needed for v1 as currently only 2 actions are available
            }
        ],

        indicators: [
            {
                name: TOP,
                top: 0,
                left: "50%",
                transform: "translate(-50%, 0)",
                previewTop: () => 0,
                previewLeft: () => 0,
                rotate: "0deg"
            },{
                name: BOTTOM,
                top: "100%",
                left: "50%",
                transform: "translate(-50%, -100%)",
                previewTop: (hoveredPaneHeight, draggedPaneHeight) => hoveredPaneHeight - draggedPaneHeight,
                previewLeft: () => 0,
                rotate: "180deg"
            },{
                name: LEFT,
                top: "50%",
                left: 0,
                transform: "translate(0, -50%)",
                previewTop: () => 0,
                previewLeft: () => 0,
                rotate: "270deg"
            },{
                name: RIGHT,
                top: "50%",
                left: "100%",
                transform: "translate(-100%, -50%)",
                previewTop: () => 0,
                previewLeft: (hoveredPaneWidth, draggedPaneWidth) => hoveredPaneWidth - draggedPaneWidth,
                rotate: "90deg"
            },{
                name: MIDDLE,
                previewTop: () => 0,
                previewLeft: () => 0,
            }
        ],

        togglePane: function(id) {
            const that = this,
            pane = that._getPaneById(that.options.rootPane, "id", id);

            if (pane != undefined) {
                that._togglePane(pane);
            }
        },

        removePane: function(id) {
            const that = this;
            const pane = that._getPaneById(that.options.rootPane, "id", id);

            if (pane != undefined) {
                that._removePane(pane);
            }
        },

        getOptions: function() {
            const that = this;
            return that.options;
        },

        setOptions: function(options) {
            const that = this;
            let currentOptions = that.getOptions();
            kendo.deepExtend(currentOptions, options);

            that.destroy();
            that.element.empty();

            that.init(that.element, currentOptions);

        },

        _initUnpinnedResizable: function() {
            const that = this;

            that._unpinnedResizable = new kendo.ui.Resizable(that.unpinnedContainer, {
                orientation: HORIZONTAL,
                handle: ".k-splitbar-horizontal.k-splitbar-draggable-horizontal",
                resize: function(e) {
                    const delta = e.x.delta;
                    const containerWidth = that.unpinnedContainer.width();

                    that.unpinnedContainer.width(containerWidth + delta);
                }
            });
        },

        _bindEvents: function() {
            const that = this;

            that.element.on(CLICK + NS, `.k-dock-manager-toolbar .${KBUTTON}`, that._toolbarButtonClick.bind(that));
            that.element.on(CLICK + NS, `.${KPANES_CONTAINER}`, that._hideUnpinnedPanes.bind(that));
            that.element.on(CLICK + NS, `.${KBUTTON}[${ACTION_ATTR}="pin"], .${KBUTTON}[${ACTION_ATTR}="unpin"]`, that._pinPaneClick.bind(that));
            that.element.on(CLICK + NS, `.${KBUTTON}[${ACTION_ATTR}="close"]`, that._closePane.bind(that));
            that.element.on("mouseenter" + NS, `.${KDOCK_INDICATOR}`, that._displayDockPreview.bind(that));
            that.element.on("mouseleave" + NS, `.${KDOCK_INDICATOR}`, that._hideDockPreview.bind(that));
        },

        _hideUnpinnedPanes: function(e) {
            const that = this;
            const unpinnedPanes = that.unpinnedContainer.find(`.${KPANE}`);
            const currentlyOpened = unpinnedPanes.filter(":visible");
            const unpinnedContainerVisible = that.unpinnedContainer.is(":visible");

            if (currentlyOpened && unpinnedContainerVisible) {
                that._toolbar.find(`.${KSELECTED}`).removeClass(KSELECTED);
                that.unpinnedContainer.addClass(KHIDDEN);
                return;
            }
        },

        _toolbarButtonClick: function(e) {
            const that = this;
            const itemUid = $(e.currentTarget).attr(UID_ATTR);
            const unpinnedPanes = that.unpinnedContainer.find(`.${KPANE}`);
            const currentlyOpened = unpinnedPanes.filter(":visible");
            const unpinnedContainerVisible = that.unpinnedContainer.is(":visible");

            e.preventDefault();
            that._toolbar.find(`.${KBUTTON}`).removeClass(KSELECTED);

            if (currentlyOpened.attr(UID_ATTR) === itemUid && unpinnedContainerVisible) {
                that.unpinnedContainer.addClass(KHIDDEN);
                return;
            }

            that._showUnpinnedPane(itemUid);
        },

        _showUnpinnedPane: function(paneUid) {
            const that = this;
            const toolbarWidth = that._toolbar.outerWidth();
            const pane = that._findPaneByUid(paneUid);
            const hasUnpinnedSize = pane.unpinnable.unpinnedSize;

            that.unpinnedContainer.removeClass(KHIDDEN).css({ left: `${toolbarWidth}px` });
            that.unpinnedContainer.find(`.${KPANE}`).addClass(KHIDDEN);
            that.unpinnedContainer.find(paneSelector(paneUid)).removeClass(KHIDDEN);

            if (hasUnpinnedSize) {
                that.unpinnedContainer.css({ width: `${pane.unpinnable.unpinnedSize}` });
            }

            that._toolbar.find(`.${KBUTTON}[${UID_ATTR}="${paneUid}"]`).addClass(KSELECTED);
        },

        _pinPaneClick: function(e) {
            const that = this;
            const button = $(e.currentTarget);
            const isTabbed = button.parent().is("li");
            const action = button.attr(ACTION_ATTR);
            const paneElement = isTabbed ? button.parent() : $(e.currentTarget).closest(`.${KPANE}`);
            const pane = that._findPaneByUid(paneElement.attr(UID_ATTR));
            const parentPane = that._findPaneByUid(pane.parentUid);
            const parentPaneElement = that.panesContainer.find(`.${KPANE}[${UID_ATTR}="${parentPane.uid}"], .${SPLITTER}[${UID_ATTR}="${parentPane.uid}"]`);
            const eventData = { pane: pane, paneElement: paneElement };

            pane.unpinnable.unpinned = action === PIN ? false : true;
            that._refreshRootPane();
            that.unpinnedContainer.toggleClass(KHIDDEN, action === PIN);

            if (action === "pin") {
                that.trigger(PIN, eventData);
                return;
            }

            that.trigger(UNPIN, eventData);
            that._showUnpinnedPane(pane.uid);
        },

        _closePane: function(e) {
            const that = this;
            const button = $(e.currentTarget);
            const isTabbed = button.parent().is("li");
            const paneElement = isTabbed ? button.parent() : $(e.currentTarget).closest(`.${KPANE}`);
            const pane = that._findPaneByUid(paneElement.attr(UID_ATTR));
            const parentPane = that._findPaneByUid(pane.parentUid);
            const parentPaneElement = that.panesContainer.find(`.${KPANE}[${UID_ATTR}="${parentPane.uid}"], .${SPLITTER}[${UID_ATTR}="${parentPane.uid}"]`);
            const paneIndex = parentPane.panes.indexOf(pane);
            const eventData = { pane: pane, paneElement: paneElement, event: e };

            if (that.trigger(CLOSE, eventData)) {
                e.preventDefault();
            }

            if (pane.unpinnable && pane.unpinnable.unpinned) {
                that.unpinnedContainer.addClass(KHIDDEN);
            }

            parentPane.panes.splice(paneIndex, 1);

            if (that._shouldHideParent(parentPane)) {
                parentPane.visible = false;
            }

            that._refreshRootPane();
        },

        _shouldHideParent: function(pane) {
            const that = this,
            parent = that._findPaneByUid(pane.parentUid);

            if (pane.panes.length == 0) {
                if (pane.type == TAB && parent.panes.length == 1) {
                    parent.panes.splice(0,1);
                    parent.visible = false;
                }
                return true;
            }

            if (pane.panes.length == 1 &&
                pane.panes[0].type == TAB &&
                !pane.panes.some(x => x.visible)) {
                return true;
            }

            return false;
        },

        _refreshPane: function(paneElement, pane) {
            const that = this;
            const parentElement = paneElement.parent();
            const isTabbed = paneElement.is(`.${KPANE_TABBED}`);

            kendo.destroy(paneElement);
            isTabbed ? paneElement.empty() : paneElement.remove();
            that._refreshToolbar();
            that._createPane(isTabbed ? paneElement : parentElement, pane);
        },

        _processPanes: function(pane) {
            const that = this;
            pane.uid = pane.uid || kendo.guid();
            that._extendPane(pane);

            if (pane.type === SPLIT && !pane.orientation) {
                pane.orientation = HORIZONTAL;
            }

            pane.panes.forEach((childPane) => {
                childPane.parentUid = pane.uid;

                if (childPane.type == CONTENT) {
                    if (childPane.unpinnable === undefined || childPane.unpinnable === true) {
                        childPane.unpinnable = {
                            unpinned: false
                        };
                    }
                    childPane.uid = childPane.uid || kendo.guid();
                }

                if (childPane.panes && childPane.panes.length) {
                    that._processPanes(childPane);
                }
            });
        },

        _extendPane: function(pane) {
            const that = this;

            if (pane.panes) {
                for (var j = 0; j < pane.panes.length; j++) {
                    pane.panes.forEach(subItem => {
                        that._extendPane(subItem);
                    });
                }
            }

            extend(pane, {
                visible: pane.visible === undefined ? that.paneDefaults.visible : pane.visible,
                closeable: pane.closeable === undefined ? that.paneDefaults.closeable : pane.closeable,
                collapsed: pane.collapsed === undefined ? that.paneDefaults.collapsed : pane.collapsed,
                size: pane.size === undefined ? that.paneDefaults.size : pane.size,
            });
        },

        _togglePane: function(pane) {
            const that = this;

            pane.visible = !pane.visible;
            that._refreshRootPane();
        },

        _removePane: function(pane) {
            const that = this;
            const parentPane = that._findPaneByUid(pane.parentUid);
            const paneIndex = parentPane.panes.indexOf(pane);
            const parentPaneElement = that.panesContainer.find(`[${UID_ATTR}="${pane.uid}"]`).parent();

            parentPane.panes.splice(paneIndex, 1);
            that._refreshRootPane();
        },

        _refreshToolbar: function() {
            const that = this;
            const unpinnedPanes = that._unpinnedPanes();
            const unpinnedPannesContainer = $(`<div class="${KHIDDEN}"/>`).addClass(KUNPINNED_CONTAINER);

            if (!that.unpinnedContainer) {
                that.unpinnedContainer = unpinnedPannesContainer;
                unpinnedPannesContainer.append(unpinnedResizeSplitbar);
                unpinnedPannesContainer.insertBefore(that.panesContainer);
            }

            if (!unpinnedPanes.length) {
                that._toolbar && that._toolbar.remove();
                that._toolbar = null;
                return;
            }

            if (!that._toolbar) {
                that._toolbar = that.element.prepend(TOOLBAR_TEMPLATE).find(`.${DOCK_MANAGER_TOOLBAR}`);
            }

            that._toolbar.empty();

            for (let i = 0; i < unpinnedPanes.length; i++) {
                const pane = unpinnedPanes[i];
                const button = $(kendo.html.renderButton({ fillMode: "flat", size: "medium" }))
                                .addClass(TOOLBAR_BUTTON)
                                .append(buttonTextTemplate(that._paneHeader(pane)));

                button.attr(UID_ATTR, pane.uid);
                that._toolbar.append(button);

                if (i < unpinnedPanes.length - 1) {
                    that._toolbar.append(SEPARATOR);
                }
            }
        },

        destroy: function() {
            const that = this;

            Widget.fn.destroy.call(that);

            that.element.off(NS);
            that.element.empty();

            kendo.destroy(that.wrapper);
        },

        refresh: function() {
            const that = this;

            that._refreshRootPane();
        },

        _refreshRootPane: function() {
            const that = this;
            const rootPaneElement = that.element.find(`[${UID_ATTR}="${that.options.rootPane.uid}"]`);

            that._refreshPane(rootPaneElement, that.options.rootPane);
        },

        _createSplitPane: function(parentElement, pane) {
            const that = this;
            const splitterElement = $("<div/>").attr(UID_ATTR, pane.uid);
            const splitterOptions = {
                orientation: pane.orientation || HORIZONTAL,
                panes: []
            };

            if (!pane.panes.some(x=>x.visible)) {
                return;
            }

            parentElement.append(splitterElement);

            pane.panes.forEach((childPane) => {
                const paneOptions = {
                    uid: childPane.uid
                };
                const paneElement = $(PANE).removeClass(KSTATIC_PANE);

                if (childPane.unpinnable && childPane.unpinnable.unpinned) {
                    that._createUnpinnedPane(childPane);
                    return;
                }

                if (childPane.size) {
                    paneOptions.size = childPane.size;
                }

                if (childPane.visible != undefined) {
                    paneOptions.visible = childPane.visible;
                }

                if (childPane.visible) {
                    splitterElement.append(paneElement);
                    that._createPane(paneElement, childPane);
                    splitterOptions.panes.push(paneOptions);
                }
            });

           pane.splitter = new DockSplitter(splitterElement, splitterOptions); // eslint-disable-line no-new
           pane.splitter.bind(RESIZE, that._updatePaneSize.bind(that));
        },

        _updatePaneSize: function(e) {
            const that = this;
            const leftPane = that._findPaneByUid(e.leftPane.uid),
            rightPane = that._findPaneByUid(e.rightPane.uid);

            leftPane.size = e.leftPane.size;
            rightPane.size = e.rightPane.size;
            that.trigger(RESIZE, { ev: e, leftPane: leftPane, rightPane: rightPane });
        },

        _createTabPane: function(parentElement, pane) {
            const that = this;
            const tabStripElement = $("<div class='k-header'/>");
            const tabContainer = $("<ul/>");
            const tabStripOptions = {
                animation: false
            };
            const selectedPane = (pane.selected === undefined || pane.panes.indexOf(pane.panes[pane.selected]) == -1 || pane.panes[pane.selected].unpinnable.unpinned) ? 0 : pane.selected;

            if (!pane.panes.some(x=>x.visible)) {
                return;
            }

            tabStripElement.append(tabContainer);
            parentElement.append(tabStripElement);
            parentElement.attr(UID_ATTR, pane.uid);
            parentElement.addClass(KPANE_TABBED);

            pane.panes.forEach((childPane) => {
                const tab = $(tabTemplate(that._paneHeader(childPane))).attr(UID_ATTR, childPane.uid);
                const contentElement = $("<div/>");

                if (childPane.unpinnable && childPane.unpinnable.unpinned) {
                    that._createUnpinnedPane(childPane);
                    return;
                }

                if (childPane.visible) {
                    that._addActions(tab, childPane);
                    tabContainer.append(tab);
                    tabStripElement.append(contentElement);
                    that._createPane(contentElement, childPane);
                }
            });

            $(tabContainer.children()[selectedPane]).addClass(KACTIVE);
            tabStripElement.kendoTabStrip(tabStripOptions);
        },

        _createContentPane: function(parentElement, pane) {
            const that = this;
            const content = typeof pane.content === "function" ? kendo.template(pane.content)({}) : pane.content;
            const element = $(contentPaneTemplate(extend(pane, { title: that._paneHeader(pane), content: content })));
            const parentPane = that._findPaneByUid(pane.parentUid);
            const isUnnpinned = pane.unpinnable && pane.unpinnable.unpinned;


            if (parentPane && parentPane.type === TAB && !isUnnpinned) {
                parentElement.append(pane.content);
                return;
            }

            parentElement.addClass(KKPINNED_PANE)
                         .removeClass(KSTATIC_PANE)
                         .attr(UID_ATTR, pane.uid);
            that._addActions(element.find(`.${KPANE_ACTIONS}`), pane);
            parentElement.append(element);
        },

        _createUnpinnedPane: function(pane) {
            const that = this;
            const paneElement = $(PANE).removeClass(KSTATIC_PANE);

            if (that.unpinnedContainer.find(paneSelector(pane.uid)).length) {
                return;
            }

            that.unpinnedContainer.prepend(paneElement);
            that._createContentPane(paneElement, pane);
        },

        _addActions: function(actionsContainer, pane) {
            const that = this;

            that.actions.forEach((action) => {
                if (action.shouldAdd(pane)) {
                    actionsContainer.append($(kendo.html.renderButton({ fillMode: "flat", icon: action.icon })).attr(ACTION_ATTR, action.name));
                }
            });

        },

        _createPane: function(parentElement, pane) {
            const that = this;

            if (pane.id) {
                parentElement.attr("id", pane.id);
            }

            return that["_create" + capitalizeFirstLetter(pane.type) + "Pane"](parentElement, pane);
        },

        _unpinnedPanes: function(panes) {
            const that = this;
            const options = that.options;
            let result = [];

            if (!panes) {
                panes = options.rootPane.panes;
            }

            panes.forEach((pane) => {
                if (pane.unpinnable && pane.unpinnable.unpinned) {
                    result.push(pane);
                }

                if (pane.panes && pane.panes.length) {
                    result = result.concat(that._unpinnedPanes(pane.panes));
                }
            });

            return result;
        },

        _paneHeader: function(pane) {
            const that = this;
            const parentPane = that._findPaneByUid(pane.parentUid);
            const isTabbed = parentPane && parentPane.type === "tab";
            let header = pane.header;

            if (isTabbed && pane.tabHeader) {
                header = pane.tabHeader;
            }

            if (!header) {
                return pane.title || "";
            }

            return kendo.template(header)(pane);
        },

        _findPaneByUid: function(uid, parent) {
            const that = this;
            let found;

            parent = parent || that.options.rootPane;

            if (parent.uid === uid) {
                return parent;
            }

            parent.panes.forEach((pane) => {
                if (pane.uid === uid) {
                    found = pane;
                    return;
                }

                if (pane.panes && pane.panes.length) {
                    const result = that._findPaneByUid(uid, pane);

                    if (result) {
                        found = result;
                        return;
                    }
                }
            });
            return found;
        },

        _getPaneById: function(pane, prop, value) {
            const that = this;
            let found;

            if (pane[prop] == value) {
                return pane;
            }

            if (pane.panes) {
                pane.panes.forEach((childPane) => {
                    let result = that._getPaneById(childPane, prop, value);
                    if (result) {
                        found = result;
                    }
                });
            }
            return found;
        },

        _initNavigator: function(params) {
            const that = this;

            that.navigatorDraggable = new kendo.ui.Draggable(that.element, {
                autoScroll: true,
                filter: ".k-pane-header, .k-pane-tabbed .k-tabstrip-item",
                hint: function(element) {
                    const isTabbed = element.is("li");
                    const paneElement = element.closest(`.${KPANE}`);
                    const pane = that._findPaneByUid((isTabbed ? element : paneElement).attr(UID_ATTR));
                    const actionsHtml = isTabbed ? that._getActionButtons(element) : paneElement.find(`.${KPANE_ACTIONS}`).html();

                    return hintTemplate({
                        width: paneElement.width(),
                        height: paneElement.height(),
                        content: pane.content,
                        title: that._paneHeader(pane),
                        actions: actionsHtml
                    });
                },
                dragstart: that._dragStart.bind(that),
                dragend: that._dragEnd.bind(that),
                drag: that._drag.bind(that)
            });
        },

        _dragStart: function(e) {
            const that = this;
            const target = $(e.currentTarget);
            const pane = target.closest(`.${KPANE}`);

            that.draggedPane = {
                width: pane.width(),
                height: pane.height(),
                pane,
                target
            };

            that._displayGlobalIndicators();

            that.trigger(DRAGSTART, { pane: that.draggedPane.pane, draggableEvent: e });
        },

        _dragEnd: function(e) {
            const that = this;
            const hoveredIndicator = that.element.find(`.${KDOCK_INDICATOR}:hover`);
            const eventData = { pane: that.draggedPane.pane, draggableEvent: e };

            if (hoveredIndicator.length) {
                that.navigatorDraggable.hint.hide();
                that._updateLayout(hoveredIndicator);
            }

            that.element.find(`.${KDOCK_INDICATOR}`).remove();
            that.element.find(`.${KDOCK_PREVIEW}`).remove();

            if (!hoveredIndicator.length) {
                that._showHiddenPanes();
            }
            that.trigger(DRAGEND, eventData);
            that.hoveredPane = null;
            that.draggedPane = null;
        },

        _drag: function(e) {
            const that = this;
            const currentPane = $(e.elementUnderCursor).closest(`.${KPANE}[${UID_ATTR}]`);
            const pane = that._findPaneByUid(currentPane.attr(UID_ATTR));
            const navigator = $(NAVIGATOR_TEMPLATE);
            const currentPaneUid = currentPane.attr(UID_ATTR);
            const prevPaneUid = that.hoveredPane && that.hoveredPane.attr(UID_ATTR);
            var eventData = { pane: that.draggedPane.pane, draggableEvent: e };

            if (that.trigger(DRAG, eventData)) {
                e.preventDefault();
                return;
            }

            if (currentPaneUid === prevPaneUid) {
                return;
            }

            that.hoveredPane = currentPane;
            that.element.find(`.${KDOCK_NAVIGATOR}`).remove();
            navigator.css({
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                "z-index": 100008
            });

            if (pane && pane.dockable && !pane.dockable.innerDock) {
                navigator.css("display", "none");
            }

            currentPane.append(navigator);
        },

        _showHiddenPanes: function() {
            const that = this;
            const isTabbed = that.draggedPane.pane.is(`.${KPANE_TABBED}`);

            if (isTabbed) {
                return that._showTab();
            }

            that._showPane(that.draggedPane.pane);
        },

        _showTab: function(tab) {
            if (tab === undefined) {
                return;
            }

            const that = this;
            const tabstrip = tab.closest(`.${KTABSTRIP}`).data("kendoTabStrip");

            tab.show();
            tabstrip.activateTab(tab);
        },

        _showPane: function(paneElement) {
            const that = this;
            const splitbar = paneElement.siblings(`.${KSPLITBAR}:hidden`);
            paneElement.show();
            splitbar.show();
        },

        _hideDraggedPane: function(draggedElement) {
            const that = this;
            const isTabbed = draggedElement.is("li");

            if (isTabbed) {
                return that._hideTab(draggedElement);
            }

            that._hidePane(draggedElement);
        },

        _hidePane: function(draggedElement) {
            const that = this;
            const paneElement = draggedElement.closest(`.${KPANE}`);
            const prevElement = paneElement.prev();
            const nextElement = paneElement.next();

            paneElement.hide();

            if (prevElement.is(`.${KSPLITBAR}`)) {
                return prevElement.hide();
            }

            nextElement.hide();
        },

        _hideTab: function(tab) {
            const that = this;
            const isActive = tab.is(`.${KACTIVE}`);
            const tabstrip = tab.closest(`.${KTABSTRIP}`).data("kendoTabStrip");

            tab.hide();

            if (isActive) {
                tabstrip.activateTab("li:visible:first");
            }
        },

        _getActionButtons: function(paneElement) {
            const buttons = paneElement.find("button");
            const container = $("<div/>");

            buttons.each((_, button) => container.append($(button).clone()));

            return container.html();
        },

        _displayGlobalIndicators: function() {
            const that = this;

            that.indicators.forEach((indicator) => {
                const element = $(INDICATOR_TEMPLATE);

                if (indicator.name === "middle") {
                    return;
                }

                that.element.append(element);
                element.css({
                    position: "absolute",
                    "z-index": "100002",
                    top: indicator.top,
                    left: indicator.left,
                    transform: `${indicator.transform} rotate(${indicator.rotate})`
                });
                element.attr(INDICATOR_ATTR, indicator.name);
            });
        },

        _displayDockPreview: function(e) {
            const that = this;
            const indicator = $(e.currentTarget);
            const isGlobalIndicator = !indicator.parent().is(`.${KDOCK_NAVIGATOR}`);
            const indicatorName = indicator.attr(INDICATOR_ATTR);
            const indicatorUid = indicator.attr(UID_ATTR);
            const indicatorData = that.indicators.filter(i => i.name === indicatorName)[0];
            const previewElement = $(`<div class="${KDOCK_PREVIEW}"/>`);
            const container = isGlobalIndicator ? that.panesContainer : that.hoveredPane;
            const toolbarWidth = that._toolbar ? that._toolbar.outerWidth() : 0;
            const containerWidth = container.outerWidth();
            const containerHeight = container.outerHeight();
            const existingPreview = indicatorUid && container.find(`.${KDOCK_PREVIEW}[${UID_ATTR}="${indicatorUid}"]`);
            const uid = kendo.guid();
            let width = that.draggedPane.width;
            let height = that.draggedPane.height;

            if (existingPreview && existingPreview.length) {
                return existingPreview.show();
            }

            if (indicatorName === MIDDLE) {
                width = containerWidth;
                height = containerHeight;
            }

            if (indicatorName === TOP || indicatorName === BOTTOM) {
                if (height > containerHeight / 2) {
                    height = containerHeight / 2;
                }

                width = containerWidth;
            }

            if (indicatorName === LEFT || indicatorName === RIGHT) {
                if (width > containerWidth / 2) {
                    width = containerWidth / 2;
                }

                height = containerHeight;
            }

            const css = {
                position: "absolute",
                "z-index": 100000,
                top: indicatorData.previewTop(containerHeight, height),
                left: indicatorData.previewLeft(containerWidth, width) + (isGlobalIndicator ? toolbarWidth : 0),
                width: width,
                height
            };

            previewElement.css(css);
            previewElement.attr(INDICATOR_ATTR, indicatorData.name)
                          .attr(UID_ATTR, uid);
            indicator.attr(UID_ATTR, uid);
            container.append(previewElement);
            that.draggedPane.preview = {
                width,
                height
            };
            that.draggedPane.container = {
                width: containerWidth,
                height: containerHeight
            };
        },

        _hideDockPreview: function() {
            const that = this;

            that.element.find(`.${KDOCK_PREVIEW}`).hide();
        },

        _updateLayout: function(indicator) {
            const that = this;
            const isTabbed = that.draggedPane.target.is("li");
            const isGlobalIndicator = !indicator.parent().is(`.${KDOCK_NAVIGATOR}`);
            const paneElement = isTabbed ? that.draggedPane.target : that.draggedPane.pane;
            const hoveredPane = that._findPaneByUid(that.hoveredPane.attr(UID_ATTR));
            const draggedPane = that._findPaneByUid(paneElement.attr(UID_ATTR));
            const location = indicator.attr(INDICATOR_ATTR);
            const draggedPaneParent = that._findPaneByUid(draggedPane.parentUid);
            const draggedPaneIndex = draggedPaneParent.panes.indexOf(draggedPane);
            const rootPaneElement = that.element.find(`[${UID_ATTR}="${that.options.rootPane.uid}"]`);

            draggedPaneParent.panes.splice(draggedPaneIndex, 1);
            location == MIDDLE ? that._tabDock(hoveredPane, draggedPane) : that._splitDock(hoveredPane, draggedPane, location, isGlobalIndicator);
            that._processPanes(that.options.rootPane);
            that._adjustSiblingSizes(draggedPane, location, isGlobalIndicator);
            that._refreshPane(rootPaneElement, that.options.rootPane);
            location == MIDDLE ?
                that.trigger(INNER_DOCK, { pane: draggedPane, paneElement: paneElement }) :
                that.trigger(DOCK, { pane: draggedPane, paneElement: paneElement });
        },

        _splitDock: function(targetPane, pane, location, isGlobalDock) {
            const that = this;
            const targetPaneParent = isGlobalDock ? that.options.rootPane : that._findPaneByUid(targetPane.parentUid);
            const targetPaneIndex = targetPaneParent.panes.indexOf(targetPane);
            const action = location === TOP || location === LEFT ? UNSHIFT : PUSH;
            const paneIndex = targetPaneIndex + (action === UNSHIFT ? 0 : 1);
            const orientation = location === TOP || location === BOTTOM ? VERTICAL : HORIZONTAL;
            const dimension = location === TOP || location === BOTTOM ? HEIGHT : WIDTH;
            const newParentPane = {
                type: SPLIT,
                orientation,
                panes: [],
            };
            const previewSize = that.draggedPane.preview[dimension];
            const size = `${previewSize}px`;

            pane.size = size;

            if (isGlobalDock) {
                newParentPane.panes.push(targetPaneParent);
                (location === TOP || location === LEFT) ? newParentPane.panes.unshift(pane) : newParentPane.panes.push(pane);
                that.options.rootPane = newParentPane;
                return;
            }

            if (((location === TOP || location === BOTTOM) && targetPaneParent.orientation === VERTICAL) ||
                ((location === LEFT || location === RIGHT) && targetPaneParent.orientation === HORIZONTAL)) {
                return targetPaneParent.panes.splice(paneIndex, 0, pane);
            }

            if (targetPane) {
                newParentPane.size = targetPane.size;
                targetPane.size = null;
            }

            targetPaneParent.panes.splice(targetPaneIndex, 1);
            newParentPane.panes.push(targetPane);
            newParentPane.panes[action](pane);
            targetPaneParent.panes.splice(targetPaneIndex, 0, newParentPane);
        },

        _tabDock: function name(targetPane, pane) {
            const that = this;
            const targetPaneParent = that._findPaneByUid(targetPane.parentUid);
            const targetPaneIndex = targetPaneParent.panes.indexOf(targetPane);
            const newParentPane = {
                type: TAB,
                panes: [
                    targetPane,
                    pane
                ]
            };

            if (targetPane.type === TAB) {
                targetPane.panes.push(pane);
                return;
            }

            targetPaneParent.panes.splice(targetPaneIndex, 1);
            targetPaneParent.panes.splice(targetPaneIndex, 0, newParentPane);

        },

        _adjustSiblingSizes: function(pane, location, isGlobalDock) {
            const that = this;
            const siblings = that._getSiblings(pane);
            const dimension = location === TOP || location === BOTTOM ? HEIGHT : WIDTH;
            const parentSize = that.draggedPane.container[dimension];
            const draggedPaneSize = that.draggedPane[dimension];
            const newParentSize = parentSize - draggedPaneSize;
            const noSizePanes = [];
            let freeSpace = newParentSize;

            if (location === MIDDLE) {
                return;
            }

            if (siblings.length === 2) {
                siblings[0].size = null;
                return;
            }

            siblings.forEach((childPane) => {
                if (childPane.uid === pane.uid) {
                    return;
                }

                if (!childPane.size) {
                    noSizePanes.push(childPane);
                    return;
                }

                childPane.size = that._calculateNewSize(parentSize, newParentSize, childPane.size);
                freeSpace -= childPane.size;
            });

            noSizePanes.forEach((noSizePane) => {
                const newSize = freeSpace / noSizePanes.length;

                noSizePane.size = newSize;
            });

        },

        _calculateNewSize: function(parentSize, newParentSize, paneSize) {
            const proportion = newParentSize / parentSize;
            let unit = "px";
            let noUnitSize;

            if (isPercentageSize(paneSize)) {
                unit = "%";
            }

            noUnitSize = +paneSize.replace(unit, "");

            return `${noUnitSize * proportion}${unit}`;
        },

        _getSiblings: function(pane) {
            const that = this;
            const parent = that._findPaneByUid(pane.parentUid);

            return parent.panes.filter(p => p.visible !== false &&
                                            p.uid !== pane.uid &&
                                            (p.unpinnable && p.unpinnable.unpinned !== true));
        }
    });

    ui.plugin(DockManager);
})(window.kendo.jQuery);
export default kendo;
