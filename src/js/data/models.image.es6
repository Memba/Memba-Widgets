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
    id: 'url',
    fields: {
        text: {
            type: CONSTANTS.STRING,
            nullable: false
        },
        url: {
            type: CONSTANTS.STRING,
            nullable: false
        }
    }
});

/**
 * Default export
 */
export default Image;
