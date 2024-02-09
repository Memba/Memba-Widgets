/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import { Navigation } from './navigation.js';
const selectors = [
    '.k-pivotgrid-configurator-content .k-form-field .k-fields-list-wrapper .k-treeview',
    '.k-pivotgrid-configurator-content .k-chip',
    '.k-pivotgrid-configurator-actions button'
];
const onEscape = (_target, nav, ev) => {
    if (ev.target instanceof HTMLElement) {
        if (nav.root) {
            const pivot = nav.root.previousElementSibling;
            const confButton = nav.root.nextElementSibling;
            const pivotCell = Array.from(pivot instanceof HTMLElement ? pivot.querySelectorAll('[tabindex]') : []).find((c) => c.tabIndex >= 0);
            if (pivotCell instanceof HTMLElement) {
                pivotCell.focus();
                if (confButton instanceof HTMLElement) {
                    confButton.click();
                }
            }
        }
    }
};
const navigate = (target, nav, ev, dir) => {
    ev.preventDefault();
    const all = nav.elements;
    let index = all.indexOf(target) + dir;
    if (index < 0) {
        index = all.length - 1;
    }
    nav.focusElement(all[index % all.length], target);
};
const onDelete = (target, nav, ev) => {
    if (ev.target instanceof HTMLElement) {
        const deleteButton = ev.target.querySelector('.k-icon.k-i-x-circle, .k-svg-icon.k-svg-i-x-circle');
        if (deleteButton instanceof HTMLElement) {
            ev.preventDefault();
            navigate(target, nav, ev, -1);
        }
    }
};
const keyboardEvents = {
    keydown: {
        Tab: (target, nav, ev) => {
            navigate(target, nav, ev, ev.shiftKey ? -1 : 1);
        },
        Escape: onEscape,
        Delete: onDelete,
        Backspace: onDelete
    }
};
const mouseEvents = {
    click: (target, nav) => {
        if (target && target instanceof HTMLElement) {
            const prev = nav.elements.find((c) => c.hasAttribute('tabindex')) || null;
            nav.focusElement(target, prev);
        }
    }
};
/**
 * The PivotGrid Configurator keyboard navigation functionality.
 *
 * Usage:
 *
 * On Initialize
 * const navigation = new ConfiguratorNavigation({ tabindex: 0 });
 *
 * Turn on
 * navigation.start(rootDomElement);
 *
 * On After Update
 * navigation.update();
 *
 * On Destroy / Turn off
 * navigation.stop();
 */
export class ConfiguratorNavigation extends Navigation {
    constructor() {
        super(...arguments);
        this.selectors = selectors;
        this.mouseEvents = mouseEvents;
        this.keyboardEvents = keyboardEvents;
    }
}
