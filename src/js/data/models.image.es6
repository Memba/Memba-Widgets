/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import assets from '../app/app.assets.es6';
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
            /*
            // Note: validation is handled in ../widgets/widgets.imagelist
            validation: {
                required: true,
                pattern: '^\\S.{0,99}$'
            }
            */
        },
        url: {
            type: CONSTANTS.STRING
            /*
            // Note: validation is handled in ../widgets/widgets.imagelist
            validation: {
                required: true
            }
            */
        }
    },
    url$() {
        const url = this.get('url');
        return assets.image.scheme2http(url);
    }
});

/**
 * Default export
 */
export default Image;
