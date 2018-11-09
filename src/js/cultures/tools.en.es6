/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: Check loading issue that would require loading tools in global variable
// Especially i18n is packed as a separate webpack bundle and we do not want to duplicate tools and BaseTool

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import tools from '../tools/tools.es6';
import BaseTool from '../tools/tools.base.es6';

/**
 * Page, PageComponent and Stream
 */
/*
if (window.kidoju && window.kidoju.data) {
    const { Page, Stream } = window.kidoju.data;

    // if (PageComponent) {
    //    PageComponent.prototype.messages = {}
    // }

    if (Page) {
        Page.prototype.messages = {
            createMultiQuizExplanations:
                'The correct answers are:\n\n- **{0}**.',
            createMultiQuizInstructions:
                'Please select the options which correspond to your answers to the question: _{0}_.',
            createTextBoxExplanations: 'The correct answer is **{0}**.',
            createTextBoxInstructions:
                'Please fill in the text box with your answer to the question: _{0}_.',
            createQuizExplanations: 'The correct answer is **{0}**.',
            createQuizInstructions:
                'Please select the option which corresponds to your answer to the question: _{0}_.',
            emptyPage: 'Page {0} cannot be empty.',
            minConnectors:
                'At least {0} Connectors are required to make a question on page {1}.',
            missingDraggable:
                'Draggable Labels or Images are required for a Drop Zone on page {0}.',
            missingDropZone:
                'A Drop Zone is required for draggable Labels or Images on page {0}.',
            missingLabel: 'A Label is recommended on page {0}.',
            missingMultimedia:
                'A multimedia element (Image, Audio, Video) is recommended on page {0}.',
            missingQuestion: 'A question is recommended on page {0}.',
            missingSelectable:
                'Selectable Labels or Images are required for a Selector on page {0}.',
            missingSelector:
                'A Selector is required for selectable Labels or Images on page {0}.',
            missingInstructions: 'Instructions are recommended on page {0}.',
            missingExplanations: 'Explanations are recommended on page {0}.'
        };
    }

    if (Stream) {
        Stream.prototype.messages = {
            duplicateNames:
                'Delete components using the same name `{0}` on pages {1}',
            minPages:
                'At least {0} pages are required to be allowed to publish.',
            minQuestions:
                'At least {0} questions are required to be allowed to publish.',
            typeVariety:
                'The use of at least {0} types of questions (Multiple Choice, TextBox, Connector or else) is recommended.',
            qtyVariety:
                'More variety is recommended because {0:p0} of questions are of type {1}.'
        };
    }
}
*/

/**
 * BaseTool and tools
 */
BaseTool.prototype.i18n = $.extend(true, BaseTool.prototype.i18n, {
    tool: {
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
        invalidDescription:
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

if (tools.audio instanceof BaseTool) {
    // Description
    tools.audio.constructor.prototype.description = 'Audio Player';
    // Attributes
    const { attributes } = tools.audio.constructor.prototype;
    attributes.autoplay.title = 'Autoplay';
    attributes.mp3.title = 'MP3 File';
    attributes.ogg.title = 'OGG File';
}

if (tools.chart instanceof BaseTool) {
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

if (tools.chargrid instanceof BaseTool) {
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

if (tools.connector instanceof BaseTool) {
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

if (tools.dropzone instanceof BaseTool) {
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

if (tools.highlighter instanceof BaseTool) {
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

if (tools.image instanceof BaseTool) {
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
    properties.behavior.title = 'Behaviour';
    properties.constant.title = 'Constant';
}

if (tools.imageset instanceof BaseTool) {
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

if (tools.label instanceof BaseTool) {
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

if (tools.mathexpression instanceof BaseTool) {
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

if (tools.multiquiz instanceof BaseTool) {
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

if (tools.quiz instanceof BaseTool) {
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

if (tools.selector instanceof BaseTool) {
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

if (tools.table instanceof BaseTool) {
    // Description
    tools.table.constructor.prototype.description = 'Static Table';
    // Attributes
    const { attributes } = tools.table.constructor.prototype;
    attributes.columns.title = 'Columns';
    attributes.rows.title = 'Rows';
    attributes.data.title = 'Data';
}

if (tools.textarea instanceof BaseTool) {
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

if (tools.textbox instanceof BaseTool) {
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

if (tools.textgaps instanceof BaseTool) {
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

if (tools.video instanceof BaseTool) {
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
