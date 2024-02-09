/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import { Navigation } from './navigation.js';
const scrollableValuesSel = '.k-pivotgrid .k-pivotgrid-values';
const scrollableColumnHeaderSel = '.k-pivotgrid .k-pivotgrid-column-headers';
const scrollableRowHeaderSel = '.k-pivotgrid .k-pivotgrid-row-headers';
const emptyCellSel = '.k-pivotgrid > .k-pivotgrid-empty-cell';
const tableSel = 'table.k-pivotgrid-table';
const cellSel = '.k-pivotgrid-cell';
const scrollables = [scrollableValuesSel, scrollableColumnHeaderSel, scrollableRowHeaderSel].join(',');
const selectors = [
    emptyCellSel,
    [scrollableColumnHeaderSel, tableSel, cellSel].join(' '),
    [scrollableRowHeaderSel, tableSel, cellSel].join(' '),
    [scrollableValuesSel, tableSel, cellSel].join(' ')
];
const onEnter = (target, nav, ev) => {
    const icon = target.querySelector('.k-icon, .k-svg-icon');
    if (icon) {
        const index = nav.elements.indexOf(target);
        nav.update = () => {
            nav.focusElement(nav.elements[index], null);
            nav.update = () => { };
        };
        icon.click();
        ev.preventDefault();
    }
};
const tryScrollLeft = (target, scrollable, elToScroll) => {
    if (target.offsetLeft < scrollable.scrollLeft) {
        elToScroll.scrollLeft = target.offsetLeft;
    }
};
const tryScrollRight = (target, scrollable, elToScroll) => {
    if (target.offsetLeft + target.offsetWidth > scrollable.scrollLeft + scrollable.offsetWidth &&
        target.offsetWidth < scrollable.offsetWidth) {
        elToScroll.scrollLeft = target.offsetLeft + target.offsetWidth - scrollable.offsetWidth;
    }
};
const tryScrollUp = (target, scrollable, elToScroll) => {
    if (scrollable.scrollTop && target.offsetTop < scrollable.scrollTop) {
        elToScroll.scrollTop = target.offsetTop;
    }
};
const tryScrollDown = (target, scrollable, elToScroll) => {
    if (target.offsetTop + target.offsetHeight > scrollable.scrollTop + scrollable.offsetHeight &&
        target.offsetHeight < scrollable.offsetHeight) {
        elToScroll.scrollTop = target.offsetTop + target.offsetHeight - scrollable.offsetHeight;
    }
};
const scrollTo = (target, root, scrollFunc) => {
    const elToScroll = root.querySelector(scrollableValuesSel);
    const scrollable = target && target.closest(scrollables);
    if (!elToScroll || !scrollable || !target) {
        return;
    }
    scrollFunc.forEach(scroll => scroll(target, scrollable, elToScroll));
};
const tableMap = (table) => {
    const rows = Array.from(table.rows);
    const colsCount = Array.from((rows && rows[0] && rows[0].cells) || [])
        .map(c => c.colSpan)
        .reduce((prev, cur) => prev + cur, 0);
    const map = rows.map(() => new Array(colsCount));
    rows.forEach((row, r) => {
        let curColSpan = 0;
        Array.from(row.cells).forEach((c) => {
            for (let colSp = 0; colSp < c.colSpan; colSp++) {
                for (let rowSp = 0; rowSp < c.rowSpan; rowSp++) {
                    const ind = map[r + rowSp].findIndex((val, curInd) => curInd >= curColSpan && !val);
                    map[r + rowSp][ind] = c;
                }
                curColSpan++;
            }
        });
    });
    return map;
};
const navigationMap = (root) => {
    const columnHeader = tableMap(root.querySelector([scrollableColumnHeaderSel, tableSel].join(' ')));
    const rowHeader = tableMap(root.querySelector([scrollableRowHeaderSel, tableSel].join(' ')));
    const values = tableMap(root.querySelector([scrollableValuesSel, tableSel].join(' ')));
    const emptyCell = root.querySelector(emptyCellSel);
    const emptyCellRow = new Array(rowHeader[0].length).fill(emptyCell);
    const map = [];
    for (let i = 0; i < columnHeader.length; i++) {
        map.push(emptyCellRow.concat(columnHeader[i]));
    }
    for (let i = 0; i < rowHeader.length; i++) {
        map.push(rowHeader[i].concat(values[i]));
    }
    return map;
};
const getTargetPos = (map, target) => {
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === target) {
                return [r, c];
            }
        }
    }
    return [-1, -1];
};
const ctrlKey = (ev) => ev.ctrlKey || ev.metaKey;
const cellAt = (root, target, pos) => {
    const map = navigationMap(root);
    let targetPos = getTargetPos(map, target);
    let nextPos = [targetPos[0] + pos[0], targetPos[1] + pos[1]];
    let next = map[nextPos[0]] && map[nextPos[0]][nextPos[1]];
    while (next && next === target) {
        nextPos = [nextPos[0] + pos[0], nextPos[1] + pos[1]];
        next = map[nextPos[0]] && map[nextPos[0]][nextPos[1]];
    }
    return next;
};
const keyboardEvents = {
    keydown: {
        ArrowLeft: (target, nav, ev) => {
            ev.preventDefault();
            const next = cellAt(nav.root, target, [0, -1]);
            nav.focusElement(next, target);
            scrollTo(next, nav.root, [tryScrollRight, tryScrollLeft, tryScrollDown, tryScrollUp]);
        },
        ArrowRight: (target, nav, ev) => {
            ev.preventDefault();
            const next = cellAt(nav.root, target, [0, 1]);
            nav.focusElement(next, target);
            scrollTo(next, nav.root, [tryScrollLeft, tryScrollRight, tryScrollDown, tryScrollUp]);
        },
        ArrowUp: (target, nav, ev) => {
            ev.preventDefault();
            const next = cellAt(nav.root, target, [-1, 0]);
            nav.focusElement(next, target);
            scrollTo(next, nav.root, [tryScrollRight, tryScrollLeft, tryScrollDown, tryScrollUp]);
        },
        ArrowDown: (target, nav, ev) => {
            ev.preventDefault();
            const next = cellAt(nav.root, target, [1, 0]);
            nav.focusElement(next, target);
            scrollTo(next, nav.root, [tryScrollRight, tryScrollLeft, tryScrollUp, tryScrollDown]);
        },
        o: (_target, nav, _ev) => {
            if (!nav.root) {
                return;
            }
            // FIX: ADDED manually to fix an issue where depending on the order of the config element and button
            // you either can open the configurator with Ctrl+O, or you can close the configurator with ESC
            let next = nav.root.nextElementSibling;
            if (!(next && next instanceof HTMLElement)) {
                return;
            }

            if (!next.matches('div.k-pivotgrid-configurator-button')) {
                next = next.nextElementSibling;
            }

            if (next && next instanceof HTMLElement && next.matches('div.k-pivotgrid-configurator-button')) {
                if (!nav.root.parentNode || nav.root.parentNode.querySelector(".k-pivotgrid-configurator.k-hidden")) {
                    next.click();
                }

                setTimeout(() => {
                    if (nav.root.parentNode) {
                        const confHeader = nav.root.parentNode.querySelector('.k-pivotgrid-configurator-content .k-form-field .k-fields-list-wrapper .k-treeview');
                        if (confHeader instanceof HTMLElement) {
                            confHeader.setAttribute('tabindex', String(nav.tabIndex));
                            confHeader.focus();
                        }
                    }
                }, 0);
            }
        },
        Enter: onEnter,
        Space: onEnter,
        Home: (target, nav, ev) => {
            const map = navigationMap(nav.root);
            const ctrl = ctrlKey(ev);
            let row = ctrl ? map[0] : (map.find(ro => Boolean(ro.find(x => x === target))) || []);
            let next = row[0];
            if (next) {
                nav.focusElement(next, target);
                scrollTo(next, nav.root, [tryScrollRight, tryScrollLeft, tryScrollDown, tryScrollUp]);
                ev.preventDefault();
            }
        },
        End: (target, nav, ev) => {
            const map = navigationMap(nav.root);
            const ctrl = ctrlKey(ev);
            let row = ctrl ? map[map.length - 1] : (map.find(ro => Boolean(ro.find(x => x === target))) || []);
            let next = row && row[row.length - 1] || null;
            if (next) {
                nav.focusElement(next, target);
                scrollTo(next, nav.root, [tryScrollLeft, tryScrollRight, tryScrollUp, tryScrollDown]);
                ev.preventDefault();
            }
        }
    }
};
const mouseEvents = {
    click: (target, nav) => {
        if (target && target instanceof HTMLElement) {
            const prev = nav.elements.find(c => c.hasAttribute('tabindex')) || null;
            nav.focusElement(target, prev);
        }
    }
};
/**
 * The PivotGrid keyboard navigation functionality.
 *
 * Usage:
 *
 * On Initialize
 * const navigation = new PivotGridNavigation({ tabindex: 0 });
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
export class PivotGridNavigation extends Navigation {
    constructor() {
        super(...arguments);
        this.selectors = selectors;
        this.mouseEvents = mouseEvents;
        this.keyboardEvents = keyboardEvents;
    }
}
