/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import BaseModel from './models.base.es6';

const logger = new Logger('models.basetest');

/**
 * BaseTest
 * @class BaseTest
 * @extends BaseModel
 */
const BaseTest = BaseModel.define({
    // id
    fields: {
        // Store for interactions
        interactions: {
            defaultValue: []
        }
        // TODO store for random/calculated constants

        // TODO time ....
    },

    /**
     * Get score array for grid display
     * @method getScoreArray
     * @returns {Array}
     */
    getScoreTable() {
        const that = this;
        const scoreArray = [];
        Object.keys(that.fields).forEach(key => {
            if (CONSTANTS.RX_TEST_FIELD_NAME.test(key)) {
                const field = that.get(key);
                const component = field.component();
                if (!component.get('properties.disabled')) {
                    const scoreLine = field.toJSON();
                    // Add name, pageIdx and question
                    scoreLine.name = key;
                    scoreLine.pageIdx = component.page().index();
                    scoreLine.question = component.get('properties.question');
                    // Improved display of values in score grids
                    scoreLine.value = field.value$();
                    scoreLine.solution = field.solution$();
                    // TODO result, score and values for icon success/failure/omit
                    scoreArray.push(scoreLine);
                }
            }
        });
        return scoreArray;
    },

    /**
     * Grade
     * @method grade (formerly validateTestFromProperties)
     * @param pageIdx (a page index)
     */
    grade(pageIdx) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            pageIdx,
            assert.format(
                assert.messages.typeOrUndef.default,
                'pageIdx',
                CONSTANTS.NUMBER
            )
        );
        const that = this;
        const promises = [];
        // Iterate through test fields
        Object.keys(this.fields).forEach(key => {
            // Filter test value fields
            if (CONSTANTS.RX_TEST_FIELD_NAME.test(key)) {
                const field = that.get(key);
                const component = field.component();
                // Filter page non-disabled fields
                if (
                    !component.get('properties.disabled') &&
                    ($.type(pageIdx) === CONSTANTS.UNDEFINED ||
                        pageIdx === field.page().index())
                ) {
                    // Grade field using worker pool
                    promises.push(field.grade());
                }
            }
        });
        logger.info({
            method: 'grade',
            message: 'graded a test',
            data: { pageIdx }
        });
        return $.when(...promises);
    },

    /**
     * Maximum score
     * @method max
     * @returns {number}
     */
    max() {
        const that = this;
        let max = 0;
        // Note: this.fields has less properties than this
        Object.keys(that.fields).forEach(key => {
            if (CONSTANTS.RX_TEST_FIELD_NAME.test(key)) {
                const component = that.get(key).component();
                if (!component.get('properties.disabled')) {
                    max += component.get('properties.success') || 0;
                }
            }
        });
        return max;
    },

    /**
     * Total user score as a percentage (score()/max())
     * @method percent
     * @returns {number}
     */
    percent() {
        const max = this.max();
        const score = this.score();
        return score === 0 || max === 0 ? 0 : (100 * score) / max;
    },

    /**
     * Total user score
     * @method score
     * @returns {number}
     */
    score() {
        const that = this;
        let score = 0;
        Object.keys(that.fields).forEach(key => {
            if (CONSTANTS.RX_TEST_FIELD_NAME.test(key)) {
                const component = that.get(key).component();
                if (!component.get('properties.disabled')) {
                    debugger;
                    score += that.get(`${key}.score`);
                }
            }
        });
        return score;
    },

    // TODO count/total/progress of graded fields (or pages?)

    /**
     * toJSON
     * @method toJSON
     */
    toJSON() {
        const that = this;
        const json = {};
        Object.keys(that.fields).forEach(key => {
            if (CONSTANTS.RX_TEST_FIELD_NAME.test(key)) {
                // TODO use field.toJSON()
                json[key] = {
                    result: this.get(`${key}.result`),
                    score: this.get(`${key}.score`),
                    value: this.get(`${key}.value`)
                };
            } else if (key === 'interactions') {
                json[key] = this.get(key).toJSON(); // .slice();
            }
        });
        debugger;
        return json;
    }
});

/**
 * Default export
 */
export default BaseTest;
