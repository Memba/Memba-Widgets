/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import 'kendo.combobox';
import 'kendo.listview';
import 'kendo.pager';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

const {
    ns,
    resize,
    roleSelector,
    ui: { BaseDialog, ListView }
} = window.kendo;

/**
 * A shortcut function to display a dialog with a summary finder
 * @param options
 * @returns {*}
 */
export default function openFinder(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: 0 });

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    // TODO: Important i18n --------------------------------------------------------------------------------
                    content: `<div>
                            <div class="k-header k-toolbar" style="display:flex;padding:0.5em 1em">
                                <div style="width:10%;text-align: right;line-height:2em;">Language:</div>
                                <div style="width:30%;" data-${ns}role="combobox" data-${ns}bind="value: language, source:languages" data-text-field="text" data-value-field="value"></div>
                                <div style="width:10%;text-align: right;line-height:2em;">Search:</div>
                                <input style="width:50%;" type="search" class="k-input k-textbox" data-${ns}bind="value: search">
                            </div>
                            <ul class="media-list" data-${ns}role="listview" data-${ns}selectable="single" data-${ns}template="finder-listview-template" data-${ns}bind="source: summaries"></ul>                         
                            <script id="finder-listview-template" type="text/x-kendo-template">
                                <li class="media">
                                    <div class="media-left">
                                        <a href="#= summaryUri$() #">
                                            <img class="media-object" src="#= icon$() #" alt="#: title #">
                                        </a>
                                    </div>
                                    <div class="media-body">
                                        <h4 class="media-heading"><a href="#= summaryUri$() #">#: title #</a></h4>
                                        <% // Do not use tags as a variable name otherwise the model tags will be changed %>
                                        # var t$ = tags$(); if (Array.isArray(t$) && t$.length) { #
                                        <div class="tags"><i class="kf kf-tags"></i>
                                            # for (var i = 0; i < t$.length; i++) { #
                                            <a href="#= t$[i].hash #">#: t$[i].name #</a>#: i < t$.length - 1 ? ', ' : '' #
                                            # } #
                                        </div>
                                        # } #
                                        <div class="publication">
                                            <div class="author">
                                                <%- __('finder.list.author.publishedOn') %><span>#: kendo.toString(published, "<%- __('dateFormat') %>") #</span><%- __('finder.list.author.by') %><a href="#= authorUri$() #">#: authorName$() #</a>
                                            </div>
                                            <div class="metrics">
                                                <span class="kf"><input data-role="rating" value="#: ratings #" readonly></span>
                                                <i class="kf kf-view"></i><span>#: views #</span>
                                                # if (scores) { #<i class="kf kf-score"></i><span>#: kendo.toString(scores, 'n0') #%</span># } #
                                            </div>
                                        </div>
                                        <div class="buttons hidden-print">
                                            <button data-role="button" data-command="summary" data-image-url="<%- url.resolve(config.uris.cdn.root, format(config.uris.cdn.icons, __('finder.list.buttons.summary.icon'))) %>"><%- __('finder.list.buttons.summary.text') %></button>
                                            <button data-role="button" data-command="play" class="k-primary" data-image-url="<%- url.resolve(config.uris.cdn.root, format(config.uris.cdn.icons, __('finder.list.buttons.play.icon'))) %>"><%- __('finder.list.buttons.play.text') %></button>
                                        </div>
                                    </div>
                                </li>
                            </script>
                            <div  style="border:0" data-${ns}role="pager" data-${ns}bind="source: summaries" data-auto-bind="false"></div>
                         </div>`,
                    data: {
                        language: 'en',
                        languages: [
                            { text: 'English', value: 'en' },
                            { text: 'French', value: 'fr' }
                        ], // TODO i18n
                        search: '',
                        summaries: []
                    },
                    actions: [
                        BaseDialog.fn.options.messages.actions.ok,
                        BaseDialog.fn.options.messages.actions.cancel
                    ],
                    width: 860
                },
                options
            )
        )
        .data('kendoBaseDialog');

    // Bind the show event to resize once opened
    dialog.one('show', e => {
        resize(e.sender.element);
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, e => {
        const listView = $dialog
            .find(roleSelector('listview'))
            .data('kendoListView');
        if (
            listView instanceof ListView &&
            $.type(listView.select) === CONSTANTS.FUNCTION
        ) {
            e.sender.viewModel.set('summaryId', listView.select());
        }
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON()
        });
    });

    // Display the message dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openFinder = openFinder;
