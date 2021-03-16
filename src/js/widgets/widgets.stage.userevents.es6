/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
import 'kendo.userevents';
// import assert from '../common/window.assert.es6';
// import CONSTANTS from '../common/window.constants.es6';
// import Logger from '../common/window.logger.es6';

const { deepExtend, roleSelector, UserEvents } = window.kendo;
const STAGE = 'stage';

/**
 * StageUserEvents
 */
const StageUserEvents = UserEvents.extend({
    /**
     * init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        this._setStage(element);
        UserEvents.fn.init.call(this, element, options);
    },

    /**
     * Set stage element
     * @param element
     * @private
     */
    _setStage(element) {
        // this.stage = element.children(roleSelector(STAGE)); in case this is set on .kj-stage wrapper ???
        // Also what about filter?
        this.stage = element.closest(roleSelector(STAGE));
    },

    /**
     * Get scale
     * @private
     */
    _getScale() {
        // Do not use the stage widget to avoid circular dependencies
        // This is similar to getAnimationProperty in kendo.fx.js
        // See also https://www.michael1e.com/get-scale-value-css-javascript/
        const matrix3dRegExp = /matrix3?d?\s*\(.*,\s*([\d.-]+)\w*?,\s*([\d.-]+)\w*?,\s*([\d.-]+)\w*?,\s*([\d.-]+)\w*?/i;
        const transform = this.stage.parent().css('transform');
        const match = transform.match(matrix3dRegExp) || [0, 0, 1, 0, 0];
        return parseFloat(match[2]);
    },

    /**
     * trigger
     * @param event
     * @param options
     */
    trigger(event, options) {
        // Note: without stage, fallback to base UserEvents
        if (this.stage && this.stage.length) {
            const scale = this._getScale();
            const offset = this.stage.offset();
            deepExtend(options, {
                scale,
                x: {
                    stage: (options.x.location - offset.left) / scale,
                    startStage: (options.x.startLocation - offset.left) / scale,
                },
                y: {
                    stage: (options.y.location - offset.top) / scale,
                    startStage: (options.y.startLocation - offset.top) / scale,
                },
            });
        }
        UserEvents.fn.trigger.call(this, event, options);
    },
});

/**
 * Default export
 */
export default StageUserEvents;
