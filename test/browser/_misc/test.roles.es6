/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Helper to fix kendo.ui.roles for Karms
 * Repeatedly importing kendo.core resets kendo.ui.roles = {} and kendo.init won't work
 * IMPORTANT! import after all kendo.*
 */

// import 'kendo.core';

export default function fixKendoRoles() {
    const { ui } = window.kendo || {};
    // if (window.__karma__) {
    Object.keys(ui || {}).forEach(key => {
        if (
            key !== 'Widget' &&
            key !== 'DataBoundWidget' &&
            typeof ui[key] === 'function' &&
            ui[key].fn === ui[key].prototype &&
            (ui[key].fn.options || {}).name
            /*
            Object.prototype.isPrototypeOf.call(
                ui.Widget.prototype,
                ui[key].prototype
            )
            */
        ) {
            // Re-register every widget
            ui.plugin(ui[key]);
        }
    });
    // }
}
