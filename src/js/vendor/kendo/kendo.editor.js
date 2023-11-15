/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.combobox.js";
import "./kendo.dropdownlist.js";
import "./kendo.resizable.js";
import "./kendo.window.js";
import "./kendo.colorpicker.js";
import "./kendo.imagebrowser.js";
import "./kendo.numerictextbox.js";
import "./kendo.textarea.js";
import "./util/undoredostack.js";
import "./editor/main.js";
import "./editor/dom.js";
import "./editor/serializer.js";
import "./editor/range.js";
import "./editor/command.js";
import "./editor/immutables.js";
import "./editor/plugins/viewhtml.js";
import "./editor/plugins/link.js";
import "./editor/plugins/lists.js";
import "./editor/plugins/formatting.js";
import "./editor/plugins/image.js";
import "./editor/plugins/import.js";
import "./editor/plugins/insert.js";
import "./editor/plugins/export.js";
import "./editor/plugins/indent.js";
import "./editor/plugins/linebreak.js";
import "./editor/plugins/format.js";
import "./editor/plugins/inlineformat.js";
import "./editor/plugins/formatblock.js";
import "./editor/plugins/file.js";
import "./editor/plugins/tables.js";
import "./editor/plugins/clipboard.js";
import "./editor/plugins/keyboard.js";
import "./editor/plugins/exportpdf.js";
import "./editor/plugins/print.js";
import "./editor/plugins/formatpainter.js";
import "./editor/resizing/column-resizing.js";
import "./editor/resizing/row-resizing.js";
import "./editor/resizing/element-resizing.js";
import "./editor/resizing/element-resize-handle.js";
import "./editor/table-wizard/table-wizard-command.js";
import "./editor/table-wizard/table-wizard-dialog.js";

    var __meta__ = {
        id: "editor",
        name: "Editor",
        category: "web",
        description: "Rich text editor component",
        depends: [ "combobox", "dropdownlist", "window", "colorpicker", "toolbar", "icons" ],
        features: [ {
            id: "editor-imagebrowser",
            name: "Image Browser",
            description: "Support for uploading and inserting images",
            depends: [ "imagebrowser" ]
        }, {
            id: "editor-resizable",
            name: "Resize handle",
            description: "Support for resizing the content area via a resize handle",
            depends: [ "resizable" ]
        }, {
            id: "editor-tablewizard",
            name: "Table wizard dialog",
            description: "Support for table properties configuration",
            depends: [ "tabstrip", "button", "numerictextbox", "textarea" ]
        }, {
            id: "editor-pdf-export",
            name: "PDF export",
            description: "Export Editor content as PDF",
            depends: [ "pdf", "drawing" ]
        }]
    };
export default kendo;

