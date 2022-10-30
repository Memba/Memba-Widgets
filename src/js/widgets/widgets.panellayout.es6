/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.form';
import 'kendo.sortable';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    attr,
    deepExtend,
    destroy,
    support: { touch },
    ui: { plugin, Sortable, Widget },
} = window.kendo;
const NS = '.kendoPanelLayout';
const WIDGET_CLASS = 'k-widget m-panel-layout';

/**
 * PanelLayout
 * @class PanelLayout
 * @extends Widget
 */
const PanelLayout = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        this._render();
        this.setOptions({
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            value: this.options.value,
        });
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CLICK, CONSTANTS.CLOSE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'PanelLayout',
        enabled: true,
        rows: [],
        items: [],
        messages: {
            cancel: 'Cancel',
            close: 'Close',
            edit: 'Edit',
            submit: 'Submit',
        },
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    // setOptions(options) { // this.enable(options.enabled); },

    /**
     * _render
     * @private
     */
    _render() {
        const {
            element,
            options: { items },
        } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        this._renderGrid();
        items.forEach((item) => {
            this._renderItem(item, element);
        });
        this._initSortable();
    },

    /**
     * _renderGrid
     * @private
     */
    _renderGrid() {
        const {
            element,
            options: { rows },
        } = this;
        rows.forEach((row) => {
            const $row = $(`<${CONSTANTS.DIV}/>`)
                .addClass(row.class) // .attr('style', row.style)
                .appendTo(element);
            row.cells.forEach((cell) => {
                $(`<${CONSTANTS.DIV}/>`)
                    .addClass(`m-panel-layout-area ${cell.class}`) // .attr('style', cell.style)
                    .appendTo($row);
            });
        });
    },

    /**
     * _renderItem
     * @param item
     * @param element
     * @private
     */
    _renderItem(item, element) {
        const {
            options: { messages },
        } = this;
        const $panel = $(`<${CONSTANTS.DIV}/>`)
            .attr(attr('name'), item.name)
            .addClass('k-widget k-window m-panel');
        const $title = $(
            `<span class="k-window-title k-cursor-grab m-panel-title">${item.title}</span>`
        );
        const $buttons =
            $(`<div class="k-window-actions k-hstack m-panel-actions">
            <a role="button" href="#" class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-window-action m-panel-action m-panel-edit" title="${messages.edit}" aria-label="${messages.edit}" tabindex="0"><span class="k-button-icon k-icon k-i-edit"></span></a>
            <a role="button" href="#" class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-window-action m-panel-action m-panel-submit" title="${messages.submit}" aria-label="${messages.submit}" tabindex="0"><span class="k-button-icon k-icon k-i-check"></span></a>
            <a role="button" href="#" class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-window-action m-panel-action m-panel-cancel" title="${messages.cancel}" aria-label="${messages.cancel}" tabindex="0"><span class="k-button-icon k-icon k-i-cancel"></span></a>
            <a role="button" href="#" class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-window-action m-panel-action m-panel-close" title="${messages.close}" aria-label="${messages.close}" tabindex="0"><span class="k-button-icon k-icon k-i-close"></span></a>
            </div>`);
        const $header = $(`<${CONSTANTS.DIV}/>`)
            .addClass('k-window-titlebar k-cursor-grab m-panel-titlebar')
            .append($title)
            .append($buttons);
        const $content = $(`<${CONSTANTS.DIV}/>`).addClass(
            'k-window-content m-panel-content'
        );
        $panel
            .append($header)
            .append($content)
            .appendTo(
                element.find(
                    `div:eq(${item.position[0]}) > div.m-panel-layout-area:eq(${item.position[1]})`
                )
            );
        if (item.form) {
            $(`<${CONSTANTS.FORM}/>`)
                .appendTo($content)
                .kendoForm(
                    deepExtend(item.form, { buttonsTemplate: CONSTANTS.EMPTY })
                );
        } else {
            $content.append(item.template({}));
        }
    },

    /**
     * _initSortable
     * @returns {*}
     * @private
     */
    _initSortable() {
        // Make panels draggable
        this.sortable = this.element
            .find('.m-panel-layout-area')
            .kendoSortable({
                filter: '.m-panel',
                handler: '.k-cursor-grab',
                ignore: 'input, textarea', // See http://docs.telerik.com/kendo-ui/api/web/sortable#configuration-ignore
                cursor: 'move',
                connectWith: '.m-panel-layout-area',
                holdToDrag: touch,
                placeholder(element) {
                    assert.instanceof(
                        $,
                        element,
                        assert.format(
                            assert.messages.instanceof.default,
                            'element',
                            'jQuery'
                        )
                    );
                    return element.clone().addClass('m-panel-placeholder');
                },
                hint(element) {
                    assert.instanceof(
                        $,
                        element,
                        assert.format(
                            assert.messages.instanceof.default,
                            'element',
                            'jQuery'
                        )
                    );
                    return element
                        .clone()
                        .addClass('m-panel-hint')
                        .height(element.height())
                        .width(element.width());
                },
                start(e) {
                    e.sender.element.addClass('m-panel-layout-sorting');
                },
                end(e) {
                    e.sender.element.removeClass('m-panel-layout-sorting');
                },
                // change: function () {
                // TODO: update positions and trigger events
                // }
            })
            .data('kendoSortable');
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { element } = this;
        element.off(NS);
        element.css('cursor', 'default');
        if (enabled) {
            element.on(CONSTANTS.CLICK + NS, this._onClick.bind(this));
            element.css('cursor', 'pointer');
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { element, sortable } = this;
        if (sortable instanceof Sortable) {
            sortable.destroy();
        }
        Widget.fn.destroy.call(this);
        destroy(element);
    },
});

/**
 * Registration
 */
plugin(PanelLayout);