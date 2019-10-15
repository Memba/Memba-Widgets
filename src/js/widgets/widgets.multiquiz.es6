/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO keys
// TODO touchend for click (tap does not exist???)
// TODO Use ImageDataSOurce
// TODO Check html encoding and XSS
// TODO Use setDataSource(null) in destroy

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.multiselect';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { getTransformScale } from '../common/window.position.es6';
import Style from '../common/window.style.es6';
import { isAnyArray, randomId, shuffle } from '../common/window.util.es6';
import { ImageDataSource } from '../data/data.image.es6';

const {
    attr,
    data: { ObservableArray },
    destroy,
    format,
    ns,
    template,
    ui: { DataBoundWidget, MultiSelect, plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.multiquiz');
const NS = '.kendoMultiQuiz';
const WIDGET_CLASS = 'kj-multiquiz'; // 'k-widget kj-multiquiz',

const MULTISELECT_TMPL =
    '<span class="kj-multiquiz-item kj-multiquiz-multiselect"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></span>';
const BUTTON_TMPL = `<button class="k-button kj-multiquiz-item kj-multiquiz-button" data-${ns}uid="#: data.uid #" data-${ns}value="#: data.{0} #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></button>`;
const IMAGE_TMPL = `<div class="k-widget kj-multiquiz-item kj-multiquiz-image" data-${ns}uid="#: data.uid #" data-${ns}value="#: data.{0} #"><div class="k-image" style="background-image:url(#: data.{1} #)"></div></div>`;
const LINK_TMPL = `<span class="kj-multiquiz-item kj-multiquiz-link" data-${ns}uid="#: data.uid #" data-${ns}value="#: data.{0} #">#: data.{0} #</span>`;
const CHECKBOX_TMPL = `<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-${ns}uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>`;
const BUTTON_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-button';
const IMAGE_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-image';
const LINK_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-link';
const ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
const CHECKBOX_SELECTOR =
    '.kj-multiquiz-item.kj-multiquiz-checkbox>input[type="checkbox"]';
const MODES = {
    BUTTON: 'button',
    CHECKBOX: 'checkbox',
    IMAGE: 'image',
    LINK: 'link',
    MULTISELECT: 'multiselect'
};
const CHECKED = 'checked';

/**
 * MultiQuiz
 * @class MultiQuiz
 * @extends Widget
 */
const MultiQuiz = DataBoundWidget.extend({
    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._value = this.options.value;
        this.setOptions(this.options);
        this._render();
        this._dataSource();
        this.enable(this.options.enabled);
    },

    /**
     * Diplay modes
     */
    modes: {
        button: MODES.BUTTON,
        checkbox: MODES.CHECKBOX,
        image: MODES.IMAGE,
        link: MODES.LINK,
        multiselect: MODES.MULTISELECT
    },

    /**
     * Options
     */
    options: {
        name: 'MultiQuiz',
        autoBind: true,
        dataSource: [],
        mode: MODES.BUTTON,
        shuffle: false,
        textField: 'text',
        imageField: 'url',
        buttonTemplate: BUTTON_TMPL,
        checkboxTemplate: CHECKBOX_TMPL,
        imageTemplate: IMAGE_TMPL,
        linkTemplate: LINK_TMPL,
        multiSelectTemplate: MULTISELECT_TMPL,
        itemStyle: {},
        selectedStyle: {},
        scaler: 'div.kj-stage',
        stageElement: 'div.kj-element',
        value: null,
        enabled: true,
        messages: {
            placeholder: 'Select...'
        }
    },

    /**
     * setOptions
     * @nethod setOptions
     * @param options
     */
    setOptions(options) {
        assert.isNonEmptyPlainObject(
            options,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'options'
            )
        );
        Widget.fn.setOptions.call(this, options);
        const {
            buttonTemplate,
            checkboxTemplate,
            groupStyle,
            imageField,
            itemStyle,
            imageTemplate,
            linkTemplate,
            multiSelectTemplate,
            selectedStyle,
            textField
        } = this.options;
        this._groupStyle = new Style(groupStyle || ''); // TODO where is it used?
        this._itemStyle = new Style(itemStyle || '');
        this._selectedStyle = new Style(selectedStyle || '');
        this._buttonTemplate = template(
            format(buttonTemplate, textField, imageField)
        );
        this._checkboxTemplate = template(
            format(checkboxTemplate, textField, imageField, randomId())
        );
        this._imageTemplate = template(
            format(imageTemplate, textField, imageField)
        );
        this._linkTemplate = template(
            format(linkTemplate, textField, imageField)
        );
        this._multiSelectTemplate = format(
            multiSelectTemplate,
            textField,
            imageField
        ); // ! not a compiled template
    },

    /**
     * Events
     */
    events: [CONSTANTS.CHANGE],

    /* This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    /**
     * Gets/sets the value
     * @param value
     */
    value(value) {
        const that = this;
        const { options } = that;
        if (Array.isArray(value) || value instanceof ObservableArray) {
            if (that.dataSource instanceof ImageDataSource) {
                // finder is used to satisfy jshint which would otherwise complain about making functions within loops
                const finder = function(value) {
                    return that.dataSource
                        .data()
                        .find(
                            dataItem => dataItem[options.textField] === value
                        );
                };
                // Only retain values that have a match in dataSource
                for (let i = value.length - 1; i >= 0; i--) {
                    if (!finder(value[i])) {
                        value.splice(i, 1);
                    }
                }
            } else {
                value = [];
            }
            that._value = value;
            that._toggleSelection();
        } else if ($.type(value) === CONSTANTS.NULL) {
            // null is the same as [] but we allow it for data bindings
            if ($.type(that._value) !== CONSTANTS.NULL) {
                that._value = null;
                that._toggleSelection();
            }
        } else if ($.type(value) === CONSTANTS.UNDEFINED) {
            return that._value;
        } else {
            throw new TypeError(
                '`value` is expected to be a an array if not null or undefined'
            );
        }
    },

    /* jshint +W074 */

    /**
     * Widget layout
     * @private
     */
    _render() {
        const { element } = this;
        // CONSTANTS.INTERACTIVE_CLASS (which might be shared with other widgets)
        // is used to position any drawing surface underneath interactive widgets
        this.wrapper = element
            .addClass(WIDGET_CLASS)
            .addClass(CONSTANTS.INTERACTIVE_CLASS);
        if (this.options.mode === MODES.MULTISELECT) {
            this._layoutMultiSelect();
        }
        // refresh layouts all other modes (buttons, checkboxes, ...)
    },

    /**
     * Widget layout as multiselect list
     * @private
     */
    _layoutMultiSelect() {
        const { element, options } = this;
        this.multiSelect = $(`<${CONSTANTS.INPUT}>`)
            .width('100%')
            .appendTo(element)
            .kendoMultiSelect({
                autoBind: options.autoBind,
                change: this._onMultiSelectChange.bind(this), // change is not triggered by multiSelect api calls incl. value()
                open: this._onMultiSelectOpen.bind(this),
                dataSource: [], // ImageDataSource.create(options.dataSource),
                dataTextField: options.textField,
                dataValueField: options.textField,
                placeholder: options.messages.placeholder,
                itemTemplate: this._multiSelectTemplate,
                tagTemplate: this._multiSelectTemplate,
                value: options.value,
                height: 400
            })
            .data('kendoMultiSelect');
    },

    /**
     * Event handler triggered when changing the value of the drop down list in the header
     * @private
     */
    _onMultiSelectChange() {
        assert.instanceof(
            MultiSelect,
            this.multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'this.multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        const value = this.multiSelect.value();
        if (Array.isArray(value) || value instanceof ObservableArray) {
            this._value = value;
        } else {
            this._value = null;
        }
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Event handler triggered when opening the popup list
     * @method _onMultiSelectOpen
     * @private
     */
    _onMultiSelectOpen() {
        const { element, options } = this;
        // We need to scale the popup
        const scaler = element.closest(options.scaler);
        const scale = getTransformScale(scaler);
        const width = element.width();
        const height = element.height();
        const fontSize = parseInt(element.css('font-size'), 10);
        const { popup } = this.multiSelect;
        popup.element.css({
            fontSize: `${Math.floor(fontSize * scale)}px`,
            minWidth: `${Math.floor(width * scale)}px`,
            width: `${Math.floor(width * scale)}px`
        });
        // And reposition the popup
        // popup.one('open', function () { // the popup is already opened so the open event won't fire
        // popup.one('activate', function () { // activate is only triggered at the end of the open animation which flickers in FF
        setTimeout(() => {
            const stageElement = element.closest(options.stageElement);
            if (scaler.length && stageElement.length) {
                const top = stageElement.position().top + scaler.offset().top;
                const popupTop = popup.wrapper.position().top;
                if (popupTop > top) {
                    popup.wrapper.css('top', popupTop + (scale - 1) * height);
                }
            }
        }, 0);
    },

    /**
     * Event handler for click event on checkbox buttons
     * @method _onCheckBoxClick
     * @param e
     * @private
     */
    _onCheckBoxClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const checkbox = $(e.currentTarget);
        const value = checkbox.val();
        if (
            !Array.isArray(this._value) &&
            !(this._value instanceof ObservableArray)
        ) {
            this._value = [];
        }
        const index = this._value.indexOf(value);
        // Note: contrary to k-state.selected which would be toggled later, prop checked is true here
        const checked = !!checkbox.prop(CHECKED);
        if (checked && index === -1) {
            this._value.push(value);
        } else if (!checked && index >= 0) {
            // clicking the same value resets the button (and value)
            this._value.splice(index, 1);
        }
        this._toggleCheckBoxes();
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Event handler for click event on buttons
     * Handles
     * @param e
     * @private
     */
    _onButtonClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const button = $(e.currentTarget);
        const value = button.attr(attr('value'));
        if (
            !Array.isArray(this._value) &&
            !(this._value instanceof ObservableArray)
        ) {
            this._value = [];
        }
        const index = this._value.indexOf(value);
        const checked = button.hasClass(CONSTANTS.SELECTED_CLASS);
        if (!checked && index === -1) {
            this._value.push(value);
        } else if (checked && index >= 0) {
            // clicking the same value resets the button (and value)
            this._value.splice(index, 1);
        }
        this._toggleButtons();
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Event handler for click event on images
     * Handles
     * @param e
     * @private
     */
    _onImageClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const image = $(e.currentTarget);
        const value = image.attr(attr('value'));
        if (
            !Array.isArray(this._value) &&
            !(this._value instanceof ObservableArray)
        ) {
            this._value = [];
        }
        const index = this._value.indexOf(value);
        const checked = image.hasClass(CONSTANTS.SELECTED_CLASS);
        if (!checked && index === -1) {
            this._value.push(value);
        } else if (checked && index >= 0) {
            // clicking the same value resets the button (and value)
            this._value.splice(index, 1);
        }
        this._toggleImages();
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Event handler for click event on links
     * Handles
     * @param e
     * @private
     */
    _onLinkClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const that = this;
        const link = $(e.currentTarget);
        const value = link.attr(attr('value'));
        if (
            !Array.isArray(that._value) &&
            !(that._value instanceof ObservableArray)
        ) {
            that._value = [];
        }
        const index = that._value.indexOf(value);
        const checked = link.hasClass(CONSTANTS.SELECTED_CLASS);
        if (!checked && index === -1) {
            that._value.push(value);
        } else if (checked && index >= 0) {
            // clicking the same value resets the button (and value)
            that._value.splice(index, 1);
        }
        that._toggleLinks();
        that.trigger(CONSTANTS.CHANGE, { value: that._value });
    },

    /**
     * Toggle the selection when value is changed
     * @private
     */
    _toggleSelection() {
        switch (this.options.mode) {
            case MODES.BUTTON:
                this._toggleButtons();
                break;
            case MODES.CHECKBOX:
                this._toggleCheckBoxes();
                break;
            case MODES.IMAGE:
                this._toggleImages();
                break;
            case MODES.LINK:
                this._toggleLinks();
                break;
            case MODES.MULTISELECT:
                this._toggleMultiSelect();
                break;
            default:
                break;
        }
    },

    /**
     * Toggle button selection when value is changed
     * @private
     */
    _toggleButtons() {
        const { _itemStyle, _selectedStyle, element } = this;
        element
            .find(BUTTON_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .attr('style', '')
            .css(_itemStyle.toJSON());
        if (isAnyArray(this._value)) {
            this._value.forEach(value => {
                element
                    .find(
                        BUTTON_SELECTOR +
                            format(ATTRIBUTE_SELECTOR, attr('value'), value)
                    )
                    .addClass(CONSTANTS.SELECTED_CLASS)
                    .attr('style', '')
                    .css(
                        $.extend(_itemStyle.toJSON(), _selectedStyle.toJSON())
                    );
            });
        }
    },

    /**
     * Toggle checkbox selection when value is changed
     * @private
     */
    _toggleCheckBoxes() {
        const { _itemStyle, _selectedStyle, element } = this;
        element
            .children('div')
            .attr('style', '')
            .css(_itemStyle.toJSON());
        element
            .find(CHECKBOX_SELECTOR)
            .prop(CHECKED, false)
            .parent()
            .attr('style', '')
            .css(_itemStyle.toJSON());
        if (isAnyArray(this._value)) {
            this._value.forEach(value => {
                element
                    .find(
                        CHECKBOX_SELECTOR +
                            format(ATTRIBUTE_SELECTOR, 'value', value)
                    )
                    .prop(CHECKED, true)
                    .parent()
                    .attr('style', '')
                    .css(
                        $.extend(
                            {},
                            _itemStyle.toJSON(),
                            _selectedStyle.toJSON()
                        )
                    );
            });
        }
    },

    /**
     * Select image selection when value is changed
     * @private
     */
    _toggleImages() {
        const { _itemStyle, _selectedStyle, element } = this;
        element
            .find(IMAGE_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .attr('style', '')
            .css(_itemStyle.toJSON());
        if (isAnyArray(this._value)) {
            this._value.forEach(value => {
                element
                    .find(
                        IMAGE_SELECTOR +
                            format(ATTRIBUTE_SELECTOR, attr('value'), value)
                    )
                    .addClass(CONSTANTS.SELECTED_CLASS)
                    .attr('style', '')
                    .css(
                        $.extend(
                            {},
                            _itemStyle.toJSON(),
                            _selectedStyle.toJSON()
                        )
                    );
            });
        }
    },

    /**
     * Select link selection when value is changed
     * @private
     */
    _toggleLinks() {
        const { _itemStyle, _selectedStyle, element } = this;
        element
            .find(LINK_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .attr('style', '')
            .css(_itemStyle.toJSON());
        if (isAnyArray(this._value)) {
            this._value.forEach(value => {
                element
                    .find(
                        LINK_SELECTOR +
                            format(ATTRIBUTE_SELECTOR, attr('value'), value)
                    )
                    .addClass(CONSTANTS.SELECTED_CLASS)
                    .attr('style', '')
                    .css(
                        $.extend(
                            {},
                            _itemStyle.toJSON(),
                            _selectedStyle.toJSON()
                        )
                    );
            });
        }
    },

    /**
     * Select multi selection when value is changed
     * @private
     */
    _toggleMultiSelect() {
        assert.instanceof(
            MultiSelect,
            this.multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'this.multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        this.multiSelect.value(this._value);
    },

    /**
     * _dataSource function to bind refresh to the change event
     * @private
     */
    _dataSource() {
        // TODO review for null

        if (
            this.dataSource instanceof ImageDataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // returns the datasource OR creates one if using array or configuration
            this.dataSource = ImageDataSource.create(this.options.dataSource);

            // bind to the CONSTANTS.CHANGE event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            // Assign dataSource to multiSelect
            const { multiSelect } = this;
            if (
                multiSelect instanceof MultiSelect &&
                multiSelect.dataSource !== this.dataSource
            ) {
                multiSelect.setDataSource(this.dataSource);
            }

            // trigger a read on the dataSource if one hasn't happened yet
            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        }
    },

    /**
     * sets the dataSource for source binding
     * @param dataSource
     */
    setDataSource(dataSource) {
        // set the internal datasource equal to the one passed in by MVVM
        this.options.dataSource = dataSource;
        // rebuild the datasource if necessary, or just reassign
        this._dataSource();
    },

    /**
     * Refresh
     * for example to add buttons or options
     * @param e
     */
    refresh(e) {
        const that = this;
        const { element, options } = that;
        assert.instanceof(
            $,
            element,
            assert.format(
                assert.messages.instanceof.default,
                'this.element',
                'jQuery'
            )
        );
        if (options.mode === MODES.MULTISELECT) {
            assert.instanceof(
                MultiSelect,
                that.multiSelect,
                assert.format(
                    assert.messages.instanceof.default,
                    'that.multiSelect',
                    'kendo.ui.MultiSelect'
                )
            );
            that.multiSelect.refresh(e); // Note: shuffle does not apply here.
        } else {
            let items = that.dataSource.data();
            if (e && e.items instanceof ObservableArray) {
                ({ items } = e);
            }
            // Shuffle
            if (options.shuffle) {
                items = shuffle(items);
            }
            // Note: we only add elements here (not modify or remove depending on e.action) and we might have to improve
            element.empty();
            $(items).each((index, item) => {
                switch (options.mode) {
                    case MODES.BUTTON:
                        $(that._buttonTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    case MODES.IMAGE:
                        $(that._imageTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    case MODES.LINK:
                        $(that._linkTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    case MODES.CHECKBOX:
                        $(that._checkboxTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    default:
                }
            });
        }
        // Get rid of value if there is no match in the dataSource
        if (that.dataSource.data().indexOf(that._value) === -1) {
            that._value = null;
            that.trigger(CONSTANTS.CHANGE, { value: that._value });
        }
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Enable/disable the widget
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        switch (this.options.mode) {
            case MODES.BUTTON:
                this._enableButtons(enabled);
                break;
            case MODES.CHECKBOX:
                this._enableCheckBoxes(enabled);
                break;
            case MODES.IMAGE:
                this._enableImages(enabled);
                break;
            case MODES.LINK:
                this._enableLinks(enabled);
                break;
            case MODES.MULTISELECT:
                this._enableMultiSelect(enabled);
                break;
            default:
        }
    },

    /**
     * Enable buttons
     * @param enable
     * @private
     */
    _enableButtons(enable) {
        const { element } = this;
        element.off(NS);
        if (enable) {
            element.on(
                `${CONSTANTS.CLICK + NS} ${CONSTANTS.TAP}${NS}`,
                BUTTON_SELECTOR,
                this._onButtonClick.bind(this)
            );
        }
        element.toggleClass(CONSTANTS.DISABLED_CLASS, !enable);
    },

    /**
     * Enable checkboxes
     * @param enable
     * @private
     */
    _enableCheckBoxes(enable) {
        const { element } = this;
        element.off(NS);
        if (enable) {
            element.on(
                CONSTANTS.CLICK + NS,
                CHECKBOX_SELECTOR,
                this._onCheckBoxClick.bind(this)
            );
        } else {
            // Because input are readonly and not disabled, we need to prevent default (checking options)
            // and let it bubble to the stage element to display the handle box
            element
                .on(CONSTANTS.CLICK + NS, CHECKBOX_SELECTOR, e => {
                    e.preventDefault();
                })
                .on(CONSTANTS.CHANGE + NS, CHECKBOX_SELECTOR, e => {
                    // In the very specific case of iOS and only when all checkbox buttons are unchecked
                    // a change event is triggered before the click event and the checkbox clicked is checked
                    // like if iOS wanted one checkbox to always be checked
                    // When one checkbox is checked, the click event handler above does the job
                    // and the change event is not raised
                    // This issue does not occur with checkboxes
                    $(e.target).prop('checked', false);
                });
        }
        element
            .find(CHECKBOX_SELECTOR)
            .toggleClass(CONSTANTS.DISABLED_CLASS, !enable)
            // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
            .prop('readonly', !enable);
    },

    /**
     * Enable images
     * @param enable
     * @private
     */
    _enableImages(enable) {
        const { element } = this;
        element.off(NS);
        if (enable) {
            element.on(
                CONSTANTS.CLICK + NS,
                IMAGE_SELECTOR,
                this._onImageClick.bind(this)
            );
        }
        element.toggleClass(CONSTANTS.DISABLED_CLASS, !enable);
    },

    /**
     * Enable links
     * @param enable
     * @private
     */
    _enableLinks(enable) {
        const { element } = this;
        element.off(NS);
        if (enable) {
            element.on(
                CONSTANTS.CLICK + NS,
                LINK_SELECTOR,
                this._onLinkClick.bind(this)
            );
        }
        element.toggleClass(CONSTANTS.DISABLED_CLASS, !enable);
    },

    /**
     * Enable drop down list
     * @param enable
     * @private
     */
    _enableMultiSelect(enable) {
        assert.instanceof(
            MultiSelect,
            this.multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'this.multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        this.multiSelect.enable(enable);
    },

    /**
     * Destroy widget
     */
    destroy() {
        this.setDataSource(null);
        /*
        if (this.multiSelect instanceof MultiSelect) {
            this.multiSelect.destroy();
        }
        */
        this.enable(false);
        this.element.off(NS); // For disabled checkboxes
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'MultiQuiz')) {
    // Prevents loading several times in karma
    plugin(MultiQuiz);
}
