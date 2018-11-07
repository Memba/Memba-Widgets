/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import tools from '../tools/tools.es6';

/**
 * Load pointer tool (always required)
 */
import '../tools/tools.pointer.es6';

/**
 * Load all tools
 */
// import '../tools/tools.audio.es6';
// import '../tools/tools.chargrid.es6';
// import '../tools/tools.chart.es6';
// import '../tools/tools.connector.es6';
// import '../tools/tools.dropzone.es6';
// import '../tools/tools.highlighter.es6';
import '../tools/tools.image.es6';
// import '../tools/tools.imageset.es6';
import '../tools/tools.label.es6';
// import '../tools/tools.mathexpression.es6';
// import '../tools/tools.mathinput.es6';
// import '../tools/tools.multiquiz.es6';
// import '../tools/tools.numericbox.es6';
// import '../tools/tools.quiz.es6';
// import '../tools/tools.random.es6'; */
// import '../tools/tools.selector.es6';
// import '../tools/tools.table.es6';
// import '../tools/tools.textarea.es6';
import '../tools/tools.textbox.es6';
// import '../tools/tools.textgaps.es6';
// import '../tools/tools.video.es6';

/**
 * Global access to change i18n values with locale
 */
window.app = window.app || {};
window.app.tools = tools;
