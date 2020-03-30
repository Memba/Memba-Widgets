/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.validator';
import './widgets.basedialog.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import optimizeEditor from '../tools/util.editors.es6';

const {
    bind,
    data: { Model },
    deepExtend,
    resize,
    template,
    ui: { BaseDialog },
} = window.kendo;

const NOTIFICATION =
    '<div class="k-widget k-notification k-notification-info"><div class="k-notification-wrap"><span class="k-icon k-i-info"></span>#: help #</div></div>';
const CONTENT =
    '<div class="kj-dialog-form"><div class="kj-dialog-row"></div></div>';

/**
 * A shortcut function to display a dialog with a property editor
 * @param options
 * @returns {*}
 */
function openPropertyDialog(options = {}) {
    const dfd = $.Deferred();

    assert.type(
        CONSTANTS.STRING,
        options.field,
        assert.format(
            assert.messages.type.default,
            'options.field',
            CONSTANTS.STRING
        )
    );
    assert.instanceof(
        Model,
        options.model,
        assert.format(
            assert.messages.instanceof.default,
            'options.model',
            'kendo.data.Model'
        )
    );
    assert.isPlainObject(
        options.row,
        assert.format(assert.messages.isPlainObject.default, 'options.row')
    );

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: '' });

    // Get model field
    const name =
        options.field.indexOf(CONSTANTS.DOT) > -1
            ? options.field.replace(CONSTANTS.DOT, '.fields.')
            : `fields.${options.field}`;
    const field = options.model.get(name);

    // Add validation
    if ($.isPlainObject(field.validation)) {
        $.extend(true, options.row, {
            attributes: {
                required: field.validation.required,
                min: field.validation.min,
                max: field.validation.max,
                maxlength: field.validation.maxlength, // See http://docs.telerik.com/kendo-ui/aspnet-mvc/helpers/editor/how-to/add-max-length-validation
                step: field.validation.step,
                pattern: field.validation.pattern,
                type: field.validation.type,
            },
        });
    }

    // Optimize editor
    $.extend(options.row, { editable: true });
    optimizeEditor(options.row);

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog({
            title: BaseDialog.fn.options.messages[options.type || 'info'],
            content: options.row.help
                ? template(NOTIFICATION)(options.row) + CONTENT
                : CONTENT,
            // data: options.model.clone(),
            data: deepExtend({}, options.model),
            actions: [
                BaseDialog.fn.options.messages.actions.ok,
                BaseDialog.fn.options.messages.actions.cancel,
            ],
            width: 500,
            ...options,
        })
        .data('kendoBaseDialog');

    // Build rules
    const rules = {};
    if ($.isPlainObject(field.validation)) {
        Object.keys(field.validation).forEach((key) => {
            if ($.isFunction(field.validation[key])) {
                rules[key] = field.validation[key];
            }
        });
    }

    // Add validator
    const validator = $dialog
        .find('.kj-dialog-form')
        .kendoValidator({ rules })
        .data('kendoValidator');

    dialog.unbind(CONSTANTS.INITOPEN);
    dialog.one(CONSTANTS.INITOPEN, (e) => {
        // Add editor
        const { row } = options;
        row.model = e.sender.viewModel;
        const container = e.sender.element.find('.kj-dialog-row');
        row.editor(container, row);
        // Bind viewModel
        bind(container, e.sender.viewModel);
    });

    // Bind the show event to resize once opened
    dialog.one(CONSTANTS.SHOW, (e) => {
        resize(e.sender.element);
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, (e) => {
        if (
            e.action === BaseDialog.fn.options.messages.actions.cancel.action ||
            validator.validate()
        ) {
            dfd.resolve({
                action: e.action,
                data: e.sender.viewModel.toJSON(),
            });
        } else {
            e.preventDefault();
        }
    });

    // Display the message dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Default export
 */
export default openPropertyDialog;
