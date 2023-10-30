/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import '../kendo.core.js';
import Draggable from '@progress/kendo-draggable';

var __meta__ = {
    id: "pdfviewercommon",
    name: "PdfViewerCommon",
    category: "web",
    description: "This is the common package for PdfViewer across all kendo flavours",
    depends: ["core"]
};

(function($, undefined) {
    const throttle = function(func, wait, options = {}) {
        let timeout, context, args, result;
        let previous = 0;
        const later = function() {
            previous = options.leading === false ? 0 : new Date().getTime();
            timeout = undefined;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };
        const throttled = function() {
            const now = new Date().getTime();
            if (!previous && options.leading === false) {
                previous = now;
            }
            const remaining = wait - (now - previous);
            context = undefined; // this
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = undefined;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            }
            else if (!timeout && options.trailing !== false) {
                timeout = window.setTimeout(later, remaining);
            }
            return result;
        };
        return throttled;
    };
    const preventDefault = (e) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.originalEvent) {
            e.originalEvent.preventDefault();
        }
    };
    const matchesElementSelector = (element, selector) => {
        if (!element || !selector) {
            return false;
        }
        return element.closest(selector);
    };
    const FRAMES_PER_SECOND = 1000 / 60;
    const SCROLL = 'scroll';
    /**
     * @hidden
     */
    class Scroller {
        constructor(element, options) {
            this.options = {
                events: {
                    [SCROLL]: () => undefined
                },
                filter: '',
                // throttle the scroll events to get a more similar experience
                // to the scrolling behavior in Adobe Acrobat Reader
                // as well as allow a way to improve the scrolling performance for large files
                panScrollThrottleDelay: FRAMES_PER_SECOND,
                // the drag directions are actually reversed, e.g.
                // dragging to the right actually moves the document to the left
                scrollDirectionModifier: -1,
                scrollThrottleDelay: FRAMES_PER_SECOND
            };
            this.onElementScroll = () => {
                const element = this.element;
                if (this.state.trackNextElementScroll) {
                    this.scrollTo(element.scrollLeft, element.scrollTop);
                }
                else {
                    // reset the state, so that consecutive scroll events can be handled
                    this.state.trackNextElementScroll = true;
                }
            };
            this.onDragStart = (e) => {
                this.state.dragStarted = false;
                if (!this.shouldTrackPanEvents()) {
                    return;
                }
                const target = e.target || (e.originalEvent || {}).target;
                if (this.options.filter &&
                    !matchesElementSelector(target, this.options.filter)) {
                    return;
                }
                preventDefault(e);
                this.setState({
                    dragStarted: true,
                    location: {
                        pageX: e.pageX,
                        pageY: e.pageY
                    },
                    locationDelta: {
                        x: 0,
                        y: 0
                    }
                });
            };
            this.onDrag = (e) => {
                if (!this.shouldTrackPanEvents() || !this.state.dragStarted) {
                    return;
                }
                this.calculateEventLocationDelta(e);
                this.setState({
                    location: {
                        pageX: e.pageX,
                        pageY: e.pageY
                    }
                });
                const directionModifier = this.options.scrollDirectionModifier;
                const scrollLeft = this.element.scrollLeft +
                    directionModifier * this.state.locationDelta.x;
                const scrollTop = this.element.scrollTop +
                    directionModifier * this.state.locationDelta.y;
                this.scrollTo(scrollLeft, scrollTop);
            };
            this.onDragEnd = () => {
                if (!this.shouldTrackPanEvents()) {
                    return;
                }
            };
            this.element = element;
            this.options = Object.assign({}, this.options, options);
            this.resetState();
            this.bindEvents();
        }
        destroy() {
            this.unbindEvents();
        }
        initDraggable() {
            this.destroyDraggable();
            if (this.options.panScrollThrottleDelay > 0) {
                this.throttledOnDrag = throttle(this.onDrag, this.options.panScrollThrottleDelay);
            }
            else {
                this.throttledOnDrag = this.onDrag;
            }
            this.draggable = new Draggable({
                mouseOnly: false,
                press: this.onDragStart,
                drag: this.throttledOnDrag,
                release: this.onDragEnd
            });
            this.draggable.bindTo(this.element);
        }
        destroyDraggable() {
            if (this.draggable && this.draggable.destroy) {
                this.draggable.destroy();
                if (this.throttledOnDrag && this.throttledOnDrag.cancel) {
                    this.throttledOnDrag.cancel();
                    this.throttledOnDrag = null;
                }
            }
        }
        bindEvents() {
            this.bindDraggableEvents();
            this.bindElementScroll();
        }
        bindDraggableEvents() {
            this.initDraggable();
        }
        bindElementScroll() {
            if (this.options.scrollThrottleDelay > 0) {
                this.throttledOnElementScroll = throttle(this.onElementScroll, this.options.scrollThrottleDelay);
            }
            else {
                this.throttledOnElementScroll = this.onElementScroll;
            }
            this.element.addEventListener(SCROLL, this.throttledOnElementScroll);
        }
        unbindEvents() {
            this.unbindElementScroll();
            this.unbindDraggableEvents();
        }
        unbindDraggableEvents() {
            this.destroyDraggable();
        }
        unbindElementScroll() {
            if (this.throttledOnElementScroll &&
                this.throttledOnElementScroll.cancel) {
                this.throttledOnElementScroll.cancel();
                this.throttledOnElementScroll = null;
            }
            this.element.removeEventListener(SCROLL, this.throttledOnElementScroll);
        }
        setState(newState) {
            this.state = Object.assign({}, this.state || {}, newState);
        }
        resetState() {
            this.setState({
                trackPanEvents: false,
                trackNextElementScroll: false,
                location: { pageX: 0, pageY: 0 },
                locationDelta: { x: 0, y: 0 }
            });
        }
        enablePanEventsTracking() {
            this.state.trackPanEvents = true;
            this.bindDraggableEvents();
        }
        disablePanEventsTracking() {
            this.unbindDraggableEvents();
            this.state.trackPanEvents = false;
        }
        shouldTrackPanEvents() {
            return this.state.trackPanEvents;
        }
        calculateEventLocationDelta(e) {
            this.state.locationDelta = {
                x: e.pageX - this.state.location.pageX,
                y: e.pageY - this.state.location.pageY
            };
        }
        scrollTo(x, y, options = { trackScrollEvent: true }) {
            if (!options.trackScrollEvent) {
                this.state.trackNextElementScroll = false;
            }
            this.element.scrollLeft = x;
            this.element.scrollTop = y;
        }
    }

    /**
     * A function which gives you the page number of the document according to the scroll position.
     *
     * @param rootElement The root HTML element of the PDFViewer component.
     * @returns The page number.
     */
    const currentPage = (rootElement) => {
        const scrollElement = rootElement.querySelector(
            '.k-pdf-viewer-canvas'
        );
        const page = rootElement.querySelector('.k-page');

        return scrollElement && page
            ? Math.floor(
                Math.round(scrollElement.scrollTop) /
                (page.offsetHeight + page.offsetTop) +
                0.01
            )
            : 0;
    };

    const scrollToPage = (
        rootElement,
        pageNumber
    ) => {
        const pages = rootElement.querySelectorAll('.k-page');
        const page = pages[0];
        if (page instanceof HTMLDivElement) {
            const top =
                (page.offsetHeight + page.offsetTop) *
                Math.max(0, Math.min(pageNumber, pages.length - 1));
            const scrollElement = page.closest('.k-pdf-viewer-canvas');
            if (scrollElement) {
                scrollElement.scrollTo({ top, behavior: 'auto' });
            }
        }
    };

    const searchMatchScrollLeftOffset = 0;
    const searchMatchScrollTopOffset = -64;

    const scrollToSearchMatch = (matchElement, scroller) => {
        if (!matchElement) {
            return;
        }

        const closestCharElement = matchElement.closest('.k-text-char');
        const closestTextElement = closestCharElement
            ? closestCharElement.closest('span[role="presentation"]')
            : null;

        if (!closestTextElement) {
            return;
        }

        const closestPageElement =
            closestTextElement.closest('.k-page');

        if (!closestPageElement) {
            return;
        }

        const scrollLeft =
            closestPageElement.offsetLeft +
            -1 * scroller.element.offsetLeft +
            closestTextElement.offsetLeft +
            searchMatchScrollLeftOffset;

        const scrollTop =
            closestPageElement.offsetTop +
            -1 * scroller.element.offsetTop +
            closestTextElement.offsetTop +
            searchMatchScrollTopOffset;

        scroller.scrollTo(scrollLeft, scrollTop, { trackScrollEvent: false });
    };

    kendo.ui.PdfViewerCommon = { Scroller, currentPage, scrollToPage, scrollToSearchMatch };
})(window.kendo.jQuery);