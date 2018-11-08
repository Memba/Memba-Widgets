/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './models.base.es6';

/**
 * Image
 * @class Image
 * @extends BaseModel
 */
const Image = BaseModel.define({
    id: 'text', // `text` is used for component validation
    fields: {
        text: {
            type: CONSTANTS.STRING
        },
        url: {
            type: CONSTANTS.STRING
        }
    }
    // TODO Add validation
});

/**
 * Default export
 */
export default Image;
