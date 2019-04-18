/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import i18n from '../common/window.i18n.es6';
import tools from '../tools/tools.es6';

const { attr } = window.kendo;

/**
 * BaseTool and tools
 */
$.extend(true, i18n(), {
    basetool: {
        top: { title: 'Top' },
        left: { title: 'Left' },
        height: { title: 'Height' },
        width: { title: 'Width' },
        rotate: { title: 'Rotate' }
    },
    dialogs: {
        ok: {
            text:
                '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK'
        },
        cancel: {
            text:
                '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel'
        }
    },
    messages: {
        invalidAltText:
            'A(n) {0} on page {1} requires some alternate text in display attributes.',
        invalidAudioFile:
            'A(n) {0} on page {1} requires an mp3 file in display attributes.',
        invalidColor:
            'A(n) {0} on page {1} has an invalid color in display attributes.',
        invalidData:
            'A(n) {0} on page {1} requires values in display attributes.',
        invalidQuestion:
            'A(n) {0} named `{1}` on page {2} requires a question in test logic.',
        invalidConstant:
            'A(n) {0} on page {1} requires a constant in test logic.',
        invalidFailure:
            'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
        invalidFormula:
            'A(n) {0} on page {1} requires a formula in display attributes.',
        invalidImageFile:
            'A(n) {0} on page {1} requires an image file in display attributes.',
        invalidName: 'A(n) {0} named `{1}` on page {2} has an invalid name.',
        invalidShape:
            'A(n) {0} named `{1}` on page {2} requires a shape in display attributes.',
        invalidSolution:
            'A(n) {0} named `{1}` on page {2} requires a solution in test logic.',
        invalidStyle:
            'A(n) {0} on page {1} has an invalid style in display attributes.',
        invalidSuccess:
            'A(n) {0} named `{1}` on page {2} has a success score lower than the omit score or zero in test logic.',
        invalidText:
            'A(n) {0} on page {1} requires some text in display attributes.',
        invalidValidation:
            'A(n) {0} named `{1}` on page {2} requires a validation formula in test logic.',
        invalidVideoFile:
            'A(n) {0} on page {1} requires an mp4 file in display attributes.'
    }
});

/**
 * tools.audio
 */
if (tools.audio) {
    // Description
    tools.audio.constructor.prototype.description = 'Audio Player';
    // Attributes
    const { attributes } = tools.audio.constructor.prototype;
    attributes.autoplay.title = 'Autoplay';
    attributes.mp3.title = 'MP3 File';
    attributes.ogg.title = 'OGG File';
}

/**
 * tools.chart
 */
if (tools.chart) {
    // Description
    tools.chart.constructor.prototype.description = 'Chart';
    // Attributes
    const { attributes } = tools.chart.constructor.prototype;
    attributes.type.title = 'Type';
    attributes.title.title = 'Title';
    attributes.categories.title = 'Categories';
    attributes.values.title = 'Values';
    attributes.legend.title = 'Legend';
    attributes.data.title = 'Data';
    attributes.style.title = 'Style';
}

/**
 * tools.chargrid
 */
if (tools.chargrid) {
    // Description
    tools.chargrid.constructor.prototype.description = 'Character Grid';
    // Attributes
    const { attributes } = tools.chargrid.constructor.prototype;
    attributes.blank.title = 'Blank';
    attributes.columns.title = 'Columns';
    attributes.layout.title = 'Layout';
    attributes.rows.title = 'Rows';
    attributes.whitelist.title = 'Whitelist';
    attributes.gridFill.title = 'Grid Fill';
    attributes.gridStroke.title = 'Grid Stroke';
    // blankFill = gridStroke
    attributes.selectedFill.title = 'Selection Fill';
    attributes.lockedFill.title = 'Locked Fill';
    // lockedColor = valueColor = fontColor
    attributes.fontColor.title = 'Font Color';
    // Properties
    const { properties } = tools.chargrid.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.connector
 */
if (tools.connector) {
    // Description
    tools.connector.constructor.prototype.description = 'Connector';
    // Attributes
    const { attributes } = tools.connector.constructor.prototype;
    attributes.color.title = 'Color';
    // Properties
    const { properties } = tools.connector.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
    properties.disabled.title = 'Disabled';
}

/**
 * tools.dropzone
 */
if (tools.dropzone) {
    // Description
    tools.dropzone.constructor.prototype.description = 'Drop Zone';
    // Attributes
    const { attributes } = tools.dropzone.constructor.prototype;
    attributes.center.title = 'Centre';
    attributes.center.defaultValue = false;
    attributes.empty.title = 'Empty';
    attributes.style.title = 'Style';
    attributes.text.title = 'Text';
    attributes.text.defaultValue = 'Please drop here.';
    // Properties
    const { properties } = tools.dropzone.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
    properties.disabled.title = 'Disabled';
}

/**
 * tools.highlighter
 */
if (tools.highlighter) {
    // Description
    tools.highlighter.constructor.prototype.description = 'Highlighter';
    // Attributes
    const { attributes } = tools.highlighter.constructor.prototype;
    attributes.highlightStyle.title = 'Highlight';
    attributes.split.title = 'Split';
    attributes.style.title = 'Style';
    attributes.text.title = 'Text';
    attributes.text.defaultValue = 'Some text you can highlight.';
    // Properties
    const { properties } = tools.highlighter.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.image
 */
if (tools.image) {
    // Description
    tools.image.constructor.prototype.description = 'Image';
    // Attributes
    const { attributes } = tools.image.constructor.prototype;
    attributes.alt.title = 'Text';
    attributes.alt.defaultValue = 'Image';
    attributes.src.title = 'Source';
    attributes.src.defaultValue =
        'cdn://images/o_collection/svg/office/painting_landscape.svg';
    attributes.style.title = 'Style';
    // Properties
    const { properties } = tools.image.constructor.prototype;
    properties.behavior.attributes[attr('source')] = JSON.stringify([
        { text: 'None', value: 'none' },
        { text: 'Draggable', value: 'draggable' },
        { text: 'Selectable', value: 'selectable' }
    ]);
    properties.behavior.title = 'Behaviour';
    properties.constant.title = 'Constant';
}

/**
 * tools.imageset
 */
if (tools.imageset) {
    // Description
    tools.imageset.constructor.prototype.description = 'Image Set';
    // Attributes
    const { attributes } = tools.imageset.constructor.prototype;
    attributes.style.title = 'Style';
    attributes.data.title = 'Images';
    attributes.data.defaultValue = [
        {
            text: 'Image set',
            image: 'cdn://images/o_collection/svg/office/photos.svg'
        }
    ];
    // Properties
    const { properties } = tools.imageset.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.label
 */
if (tools.label) {
    // Description
    tools.label.constructor.prototype.description = 'Label';
    // Attributes
    const { attributes } = tools.label.constructor.prototype;
    attributes.style.title = 'Style';
    attributes.text.title = 'Text';
    attributes.text.defaultValue = 'Label';
    // Properties
    const { properties } = tools.label.constructor.prototype;
    properties.behavior.title = 'Behaviour';
    properties.constant.title = 'Constant';
}

/**
 * tools.mathexpression
 */
if (tools.mathexpression) {
    // Description
    tools.mathexpression.constructor.prototype.description =
        'Mathematic Expression';
    // Attributes
    const { attributes } = tools.mathexpression.constructor.prototype;
    attributes.formula.title = 'Formula';
    attributes.formula.defaultValue = '\\sum_{n=1}^{\\infty}2^{-n}=1';
    attributes.inline.title = 'Inline';
    attributes.inline.defaultValue = false;
    attributes.style.title = 'Style';
}

/**
 * tools.mathinput
 */
if (tools.mathinput) {
    // TODO
}

/**
 * tools.multiquiz
 */
if (tools.multiquiz) {
    // Description
    tools.multiquiz.constructor.prototype.description = 'MultiQuiz';
    // Attributes
    const { attributes } = tools.multiquiz.constructor.prototype;
    attributes.data.title = 'Values';
    attributes.data.defaultValue = [
        {
            text: 'Option 1',
            image: 'cdn://images/o_collection/svg/office/hand_count_one.svg'
        },
        {
            text: 'Option 2',
            image: 'cdn://images/o_collection/svg/office/hand_point_up.svg'
        }
    ];
    attributes.groupStyle.title = 'Group Style';
    attributes.itemStyle.title = 'Item Style';
    attributes.mode.title = 'Mode';
    attributes.selectedStyle.title = 'Select. Style';
    attributes.shuffle.title = 'Shuffle';
    // Properties
    const { properties } = tools.multiquiz.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.numericbox
 */
if (tools.numericbox) {
    // TODO
}

/**
 * tools.quiz
 */
if (tools.quiz) {
    // Description
    tools.quiz.constructor.prototype.description = 'Quiz';
    // Attributes
    const { attributes } = tools.quiz.constructor.prototype;
    attributes.data.title = 'Values';
    attributes.data.defaultValue = [
        {
            text: 'True',
            image: 'cdn://images/o_collection/svg/office/ok.svg'
        },
        {
            text: 'False',
            image: 'cdn://images/o_collection/svg/office/error.svg'
        }
    ];
    attributes.groupStyle.title = 'Group Style';
    attributes.itemStyle.title = 'Item Style';
    attributes.mode.title = 'Mode';
    attributes.selectedStyle.title = 'Select. Style';
    attributes.shuffle.title = 'Shuffle';
    // Properties
    const { properties } = tools.quiz.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.selector
 */
if (tools.selector) {
    // Description
    tools.selector.constructor.prototype.description = 'Selector';
    // Attributes
    const { attributes } = tools.selector.constructor.prototype;
    attributes.color.title = 'Color';
    attributes.shape.title = 'Shape';
    // Properties
    const { properties } = tools.selector.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
    properties.disabled.title = 'Disabled';
}

/**
 * tools.table
 */
if (tools.table) {
    // Description
    tools.table.constructor.prototype.description = 'Static Table';
    // Attributes
    const { attributes } = tools.table.constructor.prototype;
    attributes.columns.title = 'Columns';
    attributes.rows.title = 'Rows';
    attributes.data.title = 'Data';
}

/**
 * tools.textarea
 */
if (tools.textarea) {
    // Description
    tools.textarea.constructor.prototype.description = 'TextArea';
    // Attributes
    const { attributes } = tools.textarea.constructor.prototype;
    attributes.style.title = 'Style';
    // Properties
    const { properties } = tools.textarea.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.textbox
 */
if (tools.textbox) {
    // Description
    tools.textbox.constructor.prototype.description = 'TextBox';
    // Attributes
    const { attributes } = tools.textbox.constructor.prototype;
    attributes.mask.title = 'Mask';
    attributes.style.title = 'Style';
    // Properties
    const { properties } = tools.textbox.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.textgaps
 */
if (tools.textgaps) {
    // Description
    tools.textgaps.constructor.prototype.description = 'Text gaps';
    // Attributes
    const { attributes } = tools.textgaps.constructor.prototype;
    attributes.inputStyle.title = 'Input Style';
    attributes.style.title = 'Style';
    attributes.text.title = 'Text';
    attributes.text.defaultValue = 'Some text with gaps like [] or [] to fill.';
    // Properties
    const { properties } = tools.textgaps.constructor.prototype;
    properties.name.title = 'Name';
    properties.question.title = 'Question';
    properties.solution.title = 'Solution';
    properties.validation.title = 'Validation';
    properties.success.title = 'Success';
    properties.failure.title = 'Failure';
    properties.omit.title = 'Omit';
}

/**
 * tools.video
 */
if (tools.video) {
    // Description
    tools.video.constructor.prototype.description = 'Video Player';
    // Attributes
    const { attributes } = tools.video.constructor.prototype;
    attributes.autoplay.title = 'Autoplay';
    attributes.toolbarHeight.title = 'Toolbar Height';
    attributes.mp4.title = 'MP4 File';
    attributes.ogv.title = 'OGV File';
    attributes.wbem.title = 'Fichier WBEM';
}
