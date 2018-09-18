/*********************************************************************************
 * Assets
 *********************************************************************************/

var ToolAssets = kidoju.ToolAssets = kendo.Class.extend({
    init: function (options) {
        options = options || {};
        var collections = options.collections || [];
        var extensions = options.extensions || [];
        var schemes = options.schemes || {};
        assert.isArray(collections, assert.format(assert.messages.isArray.default, 'options.collections'));
        assert.isArray(extensions, assert.format(assert.messages.isArray.default, 'options.extensions'));
        assert.type(OBJECT, schemes, assert.format(assert.messages.type.default, 'options.schemes', OBJECT));
        this.collections = collections;
        this.extensions = extensions;
        this.schemes = schemes;
    }
});

var assets = kidoju.assets = {
    // Assets for the audio tool
    audio : new ToolAssets(),
    // Assets for the image tool
    image: new ToolAssets(),
    // Assets for the video tool
    video: new ToolAssets()
};

/**
 * Incors images for corrections
 */
    // Incors O-Collection check.svg
    // var SVG_SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
var SVG_SUCCESS = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';
// Incors O-Collection delete.svg
// var SVG_FAILURE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>';
var SVG_FAILURE = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+';


// TODO Add warninng
