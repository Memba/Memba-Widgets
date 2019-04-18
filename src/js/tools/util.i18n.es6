/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* *****************************************************************
 * Note: We need this to avoid loading tools.base.es6 from cultures
 ***************************************************************** */

const _i18n = {
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

    libraries: {
        CUSTOM: {
            name: 'Custom'
        },
        arrayLibrary: {

        },
        booleanLibrary: {},
        charGridLibrary: {},
        dateLibrary: {},
        genericLibrary: {},
        mathLibrary: {},
        multiQuizLibrary: {},
        numberLibrary: {},
        stringLibrary: {},
        textLibrary: {}
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
};

/**
 * Default export
 */
export default function i18n() {
    return _i18n;
}
