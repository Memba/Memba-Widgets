/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
export class Navigation {
    constructor(options) {
        this.tabIndex = 0;
        this.root = null;
        this.eventHandlers = {};
        this.update = () => { };
        this.tabIndex = options.tabIndex;
    }
    get elements() {
        return this.root ? Array.from(this.root.querySelectorAll(this.selectors.join(','))) : [];
    }
    get first() {
        return (this.root && this.root.querySelector(this.selectors.join(','))) || null;
    }
    get last() {
        const all = this.elements;
        return all[all.length - 1] || null;
    }
    get current() {
        return this.elements.find(el => el.matches(':focus'));
    }
    start(root) {
        this.root = root;
        for (const eventType in this.mouseEvents) {
            if (this.mouseEvents[eventType]) {
                this.eventHandlers[eventType] = (ev => {
                    const target = ev.target instanceof Element && ev.target.closest(this.selectors.join(','));
                    if (target) {
                        this.mouseEvents[eventType].call(undefined, target, this, ev);
                    }
                });
                root.addEventListener(eventType, this.eventHandlers[eventType]);
            }
        }
        for (const eventType in this.keyboardEvents) {
            if (this.keyboardEvents[eventType]) {
                this.eventHandlers[eventType] = (ev => {
                    const target = ev.target instanceof Element && ev.target.closest(this.selectors.join(','));
                    const key = ev.key === ' ' ? 'Space' : ev.key;
                    if (target && this.keyboardEvents[eventType][key]) {
                        this.keyboardEvents[eventType][key].call(undefined, target, this, ev);
                    }
                });
                root.addEventListener(eventType, this.eventHandlers[eventType]);
            }
        }
    }
    stop() {
        if (this.root) {
            for (const eventType in this.eventHandlers) {
                if (this.eventHandlers[eventType]) {
                    this.root.removeEventListener(eventType, this.eventHandlers[eventType]);
                }
            }
        }
        this.root = null;
    }
    focusElement(element, previous) {
        if (element) {
            if (previous) {
                previous.removeAttribute('tabindex');
                previous.classList.remove('k-focus');
            }
            element.setAttribute('tabindex', String(this.tabIndex));
            element.focus({ preventScroll: true });
        }
    }
}
