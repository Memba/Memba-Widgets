/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* ************************************************
 * IMPORTANT! Do not use this file in production
 ************************************************ */

import ToolAssets from '../tools/util.assets.es6';

/**
 * Application assets
 * @type {{audio, image, video}}
 */
const assets = {
    // Assets for the audio tool
    audio: new ToolAssets(),
    // Assets for the image tool
    image: new ToolAssets(),
    // Assets for the video tool
    video: new ToolAssets()
};

/**
 * Default export
 */
export default assets;
