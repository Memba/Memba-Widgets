/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* ************************************************
 * IMPORTANT! Do not use this file in production
 ************************************************ */

import ToolAssets from '../tools/util.assets.es6';

const { location } = window;
// const base = `${location.protocol}//${location.host}`;
const base = window.__karma__
    ? 'base' // Base directory for Karma assets
    : `${location.protocol}//${location.host}${
        /^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : '' // eslint-disable-line prettier/prettier
    }`; // eslint-disable-line prettier/prettier

/**
 * O Collection with sub-collections
 * @type {{name: string, collections: *[]}}
 */
const O_COLLECTION = {
    name: 'O-Collection',
    collections: [
        {
            name: 'Office',
            transport: {
                read: `${base}/test/data/images/o_collection/svg/office/index.json`,
            },
        },
    ],
};

/**
 * Application assets
 * @type {{audio, image, video}}
 */
const assets = {
    // Assets for the audio tool
    audio: new ToolAssets({
        schemes: {
            // cdn: `${base}/src/styles/`,
            data: `${base}/test/data/audio/`,
        },
    }),
    // Assets for the image tool
    image: new ToolAssets({
        collections: [O_COLLECTION],
        schemes: {
            cdn: `${base}/src/styles/`,
            data: `${base}/test/data/images/miscellaneous/`,
        },
    }),
    // Assets for the video tool
    video: new ToolAssets({
        schemes: {
            // cdn: `${base}/src/styles/`,
            data: `${base}/test/data/video/`,
        },
    }),
};

/**
 * Default export
 */
export default assets;
