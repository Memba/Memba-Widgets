/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import './kendo.core.js';
import { DateInput } from '@progress/kendo-dateinputs-common';

var __meta__ = {
    id: "dateinputcommon",
    name: "DateInputCommon",
    category: "web",
    description: "This is the common package for date editing accross all kendo flavours",
    depends: ["core"]
};

(function($, undefined) {
    kendo.ui.DateInputCommon = DateInput;
})(window.kendo.jQuery);