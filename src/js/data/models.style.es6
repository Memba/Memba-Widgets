/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './models.base.es6';

/**
 * Style
 * @class Style
 * @extends BaseModel
 */
const Style = BaseModel.define({
    id: 'name',
    fields: {
        name: {
            type: CONSTANTS.STRING
        },
        value: {
            type: CONSTANTS.STRING
        }
    }
});

/**
 * Default export
 */
export default Style;
