/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import 'kendo.grid';
import 'kendo.validator';
import __ from '../app/app.i18n.es6';
import CONSTANTS from '../common/window.constants.es6';
import './widgets.basedialog.es6';

const {
    bind,
    data: { DataSource, Model },
    guid,
    ns,
    resize,
    support: { touch },
    ui: { BaseDialog },
} = window.kendo;

/**
 * A shortcut function to display a dialog with a quiz wizard
 * @param options
 * @returns {*}
 */
function openQuizWizard(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: '' });

    // Unique ids
    const ids = { question: guid(), grid: guid() };

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog({
            title: __('dialogs.quizwizard.title'),
            /* eslint-disable prettier/prettier */
            content: `<div class="k-widget k-notification k-notification-info" role="alert">
                            <div class="k-notification-wrap"><span class="k-icon k-i-info"></span>${__('dialogs.quizwizard.message')}</div>
                          </div>
                          <div class="kj-dialog-form">
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${ids.question}">${__('dialogs.quizwizard.question')}:</label></div>
                              <div class="kj-dialog-col75"><input id="${ids.question}" type="text" name="question" class="k-input k-textbox" data-${ns}bind="value:question"></div>
                            </div>
                            <div class="kj-dialog-flexrow">
                              <div id="${ids.grid}"></div>
                            </div>
                            <div>
                              <input type="hidden" name="grid">
                              <span class="k-invalid-msg" data-for="grid"></span>
                            </div>
                          </div>`,
            /* eslint-enable prettier/prettier */
            data: {
                question: '',
                source: new DataSource({
                    autoSync: true,
                    data: [
                        {
                            text: __('dialogs.quizwizard.text'),
                            solution: true,
                        },
                    ],
                    schema: {
                        model: Model.define({
                            fields: {
                                text: {
                                    type: CONSTANTS.STRING,
                                },
                                solution: {
                                    type: CONSTANTS.BOOLEAN,
                                },
                            },
                        }),
                    },
                }),
            },
            actions: [
                BaseDialog.fn.options.messages.actions.ok,
                BaseDialog.fn.options.messages.actions.cancel,
            ],
            width: 860,
            ...options,
        })
        .data('kendoBaseDialog');

    const validator = $dialog
        .find('.kj-dialog-form')
        .kendoValidator({
            rules: {
                question(input) {
                    if (input.is('[name="question"]')) {
                        return input.val().trim().length > 0;
                    }
                    return true;
                },
                grid(input) {
                    if (input.is('[name="grid"]')) {
                        const data = dialog.viewModel.source.data();
                        const total = dialog.viewModel.source.total();
                        let solutionCount = 0;
                        let emptyCount = 0;
                        data.forEach((dataItem) => {
                            if ((dataItem.text || '').trim().length === 0) {
                                emptyCount += 1;
                            }
                            if (dataItem.solution) {
                                solutionCount += 1;
                            }
                        });
                        return (
                            total > 0 && solutionCount > 0 && emptyCount === 0
                        );
                    }
                    return true;
                },
            },
            messages: {
                question: __('dialogs.quizwizard.validation.question'),
                grid: __('dialogs.quizwizard.validation.grid'),
            },
        })
        .data('kendoValidator');

    dialog.unbind(CONSTANTS.INITOPEN);
    dialog.one(CONSTANTS.INITOPEN, (e) => {
        // Create the grid widget
        const $grid = e.sender.element.find(`#${ids.grid}`).width('100%');
        const grid = $grid
            .kendoGrid({
                columns: [
                    {
                        template:
                            '<span class="k-icon k-i-handler-drag"></span>',
                        width: '2em',
                    },
                    {
                        field: 'text',
                        title: __('dialogs.quizwizard.option'),
                    },
                    {
                        attributes: {
                            style: 'text-align: center',
                        },
                        editable() {
                            return false;
                        },
                        field: 'solution',
                        template:
                            '<input type="checkbox" #= solution ? \'checked="checked"\' : "" #>',
                        title: __('dialogs.quizwizard.solution'),
                        width: '5em',
                    },
                    {
                        command: ['destroy'],
                        title: '&nbsp;',
                        width: '6em',
                    },
                ],
                dataSource: e.sender.viewModel.source,
                editable: {
                    confirmation: false,
                    createAt: 'bottom',
                    mode: 'incell',
                },
                navigatable: true,
                scrollable: false,
                toolbar: [
                    { name: 'create', text: __('dialogs.quizwizard.add') },
                ],
            })
            .data('kendoGrid');

        // Make the grid sortable
        grid.table.kendoSortable({
            filter: '>tbody >tr',
            handler: 'td:first-child, td:first-child>span',
            holdToDrag: touch,
            hint: $.noop,
            cursor: 'move',
            placeholder(element) {
                return element
                    .clone()
                    .addClass('k-state-hover')
                    .css({ opacity: 0.65 });
            },
            container: `#${ids.grid} tbody`,
            change(evt) {
                const { dataSource } = grid;
                const skip = dataSource.skip() || 0;
                // const oldIndex = evt.oldIndex + skip;
                const newIndex = evt.newIndex + skip;
                // const data = dataSource.data();
                const dataItem = dataSource.getByUid(evt.item.data('uid'));
                dataSource.remove(dataItem);
                dataSource.insert(newIndex, dataItem);
            },
        });

        // Add an event handler to ensure a blur (change event) commits input changes
        // See https://docs.telerik.com/kendo-ui/knowledge-base/grid-bound-checkbox-editable-column
        $grid.find('tbody').on('change', 'input', (evt) => {
            const $target = $(evt.target);
            const dataItem = grid.dataItem($(evt.target).closest('tr'));
            // use equals, not the set() method because set will trigger the change event of the data source and the grid will rebind
            if ($target.is('[type="text"]')) {
                dataItem.text = $target.val().trim();
            } else if ($target.is('[type="checkbox"]')) {
                dataItem.solution = $target.prop('checked');
            }
            // add the dirty red corner flag to the cell
            // $target.closest('td').prepend('<span class="k-dirty"></span>');
            // mark the item as dirty so it will be added to the next update request
            dataItem.dirty = true;
        });

        // Bind the question input
        bind(
            e.sender.element.find('.kj-dialog-flexrow:first-child'),
            e.sender.viewModel
        );
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
            $(`#${ids.grid}`).find('tbody').off('change');
            dfd.resolve({
                action: e.action,
                data: {
                    question: e.sender.viewModel.get('question'),
                    source: e.sender.viewModel.source.data().toJSON(),
                },
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
export default openQuizWizard;
