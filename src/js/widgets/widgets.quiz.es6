/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Use ImageDataSource and DataBoundWidget
// TODO Check html encoding and XSS
// TODO Check with all widgets that setOptions uses this.options after calling Widget.fn.setOptions.call and not options, otherwise default values are missing

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { getTransformScale } from '../common/window.position.es6';
import Style from '../common/window.style.es6';
import { randomId, shuffle } from '../common/window.util.es6';

const {
    attr,
    data: { DataSource, ObservableArray },
    destroy,
    format,
    ns,
    template,
    ui: { plugin, DataBoundWidget, DropDownList }
} = window.kendo;
const logger = new Logger('widgets.quiz');

const NS = '.kendoQuiz';
const WIDGET_CLASS = 'kj-quiz'; // 'k-widget kj-quiz',
const DROPDOWN_TMPL =
    '<span class="kj-quiz-item kj-quiz-dropdown"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></span>';
const BUTTON_TMPL = `<button class="k-button kj-quiz-item kj-quiz-button" data-${ns}uid="#: data.uid #" data-${ns}value="#: data.{0} #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></button>`;
const IMAGE_TMPL = `<div class="k-widget kj-quiz-item kj-quiz-image" data-${ns}uid="#: data.uid #" data-${ns}value="#: data.{0} #"><div class="k-image" style="background-image:url(#: data.{1} #)"></div></div>`;
const LINK_TMPL = `<span class="kj-quiz-item kj-quiz-link" data-${ns}uid="#: data.uid #" data-${ns}value="#: data.{0} #">#: data.{0} #</span>`;
const RADIO_TMPL = `<div class="kj-quiz-item kj-quiz-radio" data-${ns}uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="radio" class="k-radio" value="#: data.{0} #"><label class="k-radio-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>`;
const BUTTON_SELECTOR = '.kj-quiz-item.kj-quiz-button';
const IMAGE_SELECTOR = '.kj-quiz-item.kj-quiz-image';
const LINK_SELECTOR = '.kj-quiz-item.kj-quiz-link';
const ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
const RADIO_SELECTOR = '.kj-quiz-item.kj-quiz-radio>input[type="radio"]';
const MODES = {
    BUTTON: 'button',
    DROPDOWN: 'dropdown',
    IMAGE: 'image',
    LINK: 'link',
    RADIO: 'radio'
};
const CHECKED = 'checked';

/**
 * Quiz
 * @class Quiz
 * @extends DataBoundWidget
 */
const Quiz = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        DataBoundWidget.fn.init.call(this, element, options);
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
        dropdown: MODES.DROPDOWN,
        link: MODES.LINK,
        image: MODES.IMAGE,
        radio: MODES.RADIO
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Quiz',
        autoBind: true,
        dataSource: [],
        mode: MODES.BUTTON,
        shuffle: false,
        textField: 'text',
        imageField: 'url',
        buttonTemplate: BUTTON_TMPL,
        dropDownTemplate: DROPDOWN_TMPL,
        imageTemplate: IMAGE_TMPL,
        linkTemplate: LINK_TMPL,
        radioTemplate: RADIO_TMPL,
        itemStyle: {},
        selectedStyle: {},
        scaler: 'div.kj-stage',
        stageElement: 'div.kj-element',
        value: null,
        enabled: true,
        messages: {
            optionLabel: 'Select...'
        }
    },

    /**
     * setOptions
     * @method setOptions
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
        DataBoundWidget.fn.setOptions.call(this, options);
        const {
            buttonTemplate,
            dropDownTemplate,
            groupStyle,
            imageField,
            itemStyle,
            imageTemplate,
            linkTemplate,
            radioTemplate,
            selectedStyle,
            textField
        } = this.options;
        this._groupStyle = new Style(groupStyle || ''); // TODO where is it used?
        this._itemStyle = new Style(itemStyle || '');
        this._selectedStyle = new Style(selectedStyle || '');
        this._buttonTemplate = template(
            format(buttonTemplate, textField, imageField)
        );
        this._dropDownTemplate = format(
            dropDownTemplate,
            textField,
            imageField
        ); // ! not a compiled template
        this._imageTemplate = template(
            format(imageTemplate, textField, imageField)
        );
        this._linkTemplate = template(
            format(linkTemplate, textField, imageField)
        );
        this._radioTemplate = template(
            format(radioTemplate, textField, imageField, randomId())
        );
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Gets/sets the value
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                value,
                CONSTANTS.STRING
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (value !== this._value) {
            // Note: Giving a value to the dropDownList that does not exist in dataSource is discarded without raising an error
            if (
                this.dataSource instanceof DataSource &&
                this.dataSource
                    .data()
                    .find(item => item[this.options.textField] === value)
            ) {
                this._value = value;
            } else {
                this._value = null;
            }
            this._toggleSelection();
        }
        return ret;
    },

    /**
     * Widget layout
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        // CONSTANTS.INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
        element.addClass(`${WIDGET_CLASS} ${CONSTANTS.INTERACTIVE_CLASS}`);
        if (options.mode === MODES.DROPDOWN) {
            this._layoutDropDown();
        }
        // refresh layouts all other modes (buttons, radios, ...)
    },

    /**
     * Widget layout as dropdown list
     * @method _layoutDropDown
     * @private
     */
    _layoutDropDown() {
        const { element, options } = this;
        this.dropDownList = $(`<${CONSTANTS.INPUT}>`)
            .width('100%')
            .appendTo(element)
            .kendoDropDownList({
                autoBind: options.autoBind,
                change: this._onDropDownListChange.bind(this), // Change is not triggered by dropDownList api calls incl. value(), text(), ...
                open: this._onDropDownListOpen.bind(this),
                dataSource: options.dataSource,
                dataTextField: options.textField,
                dataValueField: options.textField,
                optionLabel: options.messages.optionLabel,
                template: this._dropDownTemplate,
                valueTemplate: this._dropDownTemplate,
                value: options.value,
                height: 400
            })
            .data('kendoDropDownList');
    },

    /**
     * Event handler triggered when changing the value of the drop down list in the header
     * @method _onDropDownListChange
     * @private
     */
    _onDropDownListChange() {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        const value = this.dropDownList.value();
        if ($.type(value) === CONSTANTS.STRING && value.length) {
            this._value = value;
        } else {
            this._value = null;
        }
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Event handler triggered when opening the popup list
     * @method _onDropDownListOpen
     * @private
     */
    _onDropDownListOpen() {
        const { element, options } = this;
        // We need to scale the popup
        const scaler = element.closest(options.scaler);
        const scale = getTransformScale(scaler);
        const width = element.width();
        const height = element.height();
        const fontSize = parseInt(element.css('font-size'), 10);
        const { popup } = this.dropDownList;
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
        if (value !== this._value) {
            this._value = value;
        } else {
            // Clicking the same value resets the button (and value)
            this._value = null;
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
        if (value !== this._value) {
            this._value = value;
        } else {
            // Clicking the same value resets the button (and value)
            this._value = null;
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
        const link = $(e.currentTarget);
        const value = link.attr(attr('value'));
        if (value !== this._value) {
            this._value = value;
        } else {
            // Clicking the same value resets the button (and value)
            this._value = null;
        }
        this._toggleLinks();
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Event handler for click event on radio buttons
     * Handles
     * @param e
     * @private
     */
    _onRadioClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const radio = $(e.currentTarget);
        const value = radio.val();
        if (value !== this._value) {
            this._value = value;
        } else {
            // Clicking the same value resets the button (and value)
            this._value = null;
        }
        this._toggleRadios();
        this.trigger(CONSTANTS.CHANGE, { value: this._value });
    },

    /**
     * Toggle the selection when value is CONSTANTS.CHANGEd
     * @private
     */
    _toggleSelection() {
        switch (this.options.mode) {
            case MODES.BUTTON:
            default:
                this._toggleButtons();
                break;
            case MODES.DROPDOWN:
                this._toggleDropDownList();
                break;
            case MODES.IMAGE:
                this._toggleImages();
                break;
            case MODES.LINK:
                this._toggleLinks();
                break;
            case MODES.RADIO:
                this._toggleRadios();
                break;
        }
    },

    /**
     * Toggle the button selection when value is CONSTANTS.CHANGEd
     * @private
     */
    _toggleButtons() {
        const { element } = this;
        element
            .find(BUTTON_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .attr('style', '')
            .css(this._itemStyle.toJSON());
        if ($.type(this._value) === CONSTANTS.STRING) {
            element
                .find(
                    BUTTON_SELECTOR +
                        format(ATTRIBUTE_SELECTOR, attr('value'), this._value)
                )
                .addClass(CONSTANTS.SELECTED_CLASS)
                .attr('style', '')
                .css(
                    $.extend(
                        {}, // TODO Check remove
                        this._itemStyle.toJSON(),
                        this._selectedStyle.toJSON()
                    )
                );
        }
    },

    /**
     * Select drop down list when value is CONSTANTS.CHANGEd
     * @private
     */
    _toggleDropDownList() {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        this.dropDownList.value(this._value);
    },

    /**
     * Select image selection when value is CONSTANTS.CHANGEd
     * @private
     */
    _toggleImages() {
        const { element } = this;
        element
            .find(IMAGE_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .attr('style', '')
            .css(this._itemStyle.toJSON());
        if ($.type(this._value) === CONSTANTS.STRING) {
            element
                .find(
                    IMAGE_SELECTOR +
                        format(ATTRIBUTE_SELECTOR, attr('value'), this._value)
                )
                .addClass(CONSTANTS.SELECTED_CLASS)
                .attr('style', '')
                .css(
                    $.extend(
                        {},
                        this._itemStyle.toJSON(),
                        this._selectedStyle.toJSON()
                    )
                );
        }
    },

    /**
     * Select link selection when value is CONSTANTS.CHANGEd
     * @private
     */
    _toggleLinks() {
        const { element } = this;
        element
            .find(LINK_SELECTOR)
            .removeClass(CONSTANTS.SELECTED_CLASS)
            .attr('style', '')
            .css(this._itemStyle.toJSON());
        if ($.type(this._value) === CONSTANTS.STRING) {
            element
                .find(
                    LINK_SELECTOR +
                        format(ATTRIBUTE_SELECTOR, attr('value'), this._value)
                )
                .addClass(CONSTANTS.SELECTED_CLASS)
                .attr('style', '')
                .css(
                    $.extend(
                        {},
                        this._itemStyle.toJSON(),
                        this._selectedStyle.toJSON()
                    )
                );
        }
    },

    /**
     * Toggle the radio selection when value is CONSTANTS.CHANGEd
     * @private
     */
    _toggleRadios() {
        const { element } = this;
        element
            .children('div')
            .attr('style', '')
            .css(this._itemStyle.toJSON());
        element
            .find(RADIO_SELECTOR)
            .prop(CHECKED, false)
            .parent()
            .attr('style', '')
            .css(this._itemStyle.toJSON());
        if ($.type(this._value) === CONSTANTS.STRING) {
            element
                .find(
                    RADIO_SELECTOR +
                        format(ATTRIBUTE_SELECTOR, 'value', this._value)
                )
                .prop(CHECKED, true)
                .parent()
                .attr('style', '')
                .css(
                    $.extend(
                        {},
                        this._itemStyle.toJSON(),
                        this._selectedStyle.toJSON()
                    )
                );
        }
    },

    /**
     * _dataSource function to bind refresh to the CONSTANTS.CHANGE event
     * @private
     */
    _dataSource() {
        if (
            this.dataSource instanceof DataSource &&
            $.isFunction(this._refreshHandler)
        ) {
            this.dataSource.unbind(CONSTANTS.CHANGE, this._refreshHandler);
            this._refreshHandler = undefined;
        }

        if ($.type(this.options.dataSource) !== CONSTANTS.NULL) {
            // returns the datasource OR creates one if using array or configuration
            this.dataSource = DataSource.create(this.options.dataSource);

            // bind to the CONSTANTS.CHANGE event to refresh the widget
            this._refreshHandler = this.refresh.bind(this);
            this.dataSource.bind(CONSTANTS.CHANGE, this._refreshHandler);

            // Assign dataSource to dropDownList
            const { dropDownList } = this;
            if (
                dropDownList instanceof DropDownList &&
                dropDownList.dataSource !== this.dataSource
            ) {
                dropDownList.setDataSource(this.dataSource);
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
        const { element, options } = this;
        if (options.mode === MODES.DROPDOWN) {
            assert.instanceof(
                DropDownList,
                this.dropDownList,
                assert.format(
                    assert.messages.instanceof.default,
                    'that.dropDownList',
                    'kendo.ui.DropDownList'
                )
            );
            this.dropDownList.refresh(e); // Note: shuffle does not apply here.
        } else {
            let items = this.dataSource.data();
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
                    default:
                        $(this._buttonTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    case MODES.IMAGE:
                        $(this._imageTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    case MODES.LINK:
                        $(this._linkTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                    case MODES.RADIO:
                        $(this._radioTemplate(item))
                            .css(this._itemStyle.toJSON())
                            .appendTo(element);
                        break;
                }
            });
        }
        // Get rid of value if there is no match in the dataSource
        if (this.dataSource.data().indexOf(this._value) === -1) {
            this._value = null;
            this.trigger(CONSTANTS.CHANGE, { value: this._value });
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
            default:
                this._enableButtons(enabled);
                break;
            case MODES.DROPDOWN:
                this._enableDropDownList(enabled);
                break;
            case MODES.IMAGE:
                this._enableImages(enabled);
                break;
            case MODES.LINK:
                this._enableLinks(enabled);
                break;
            case MODES.RADIO:
                this._enableRadios(enabled);
                break;
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
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                BUTTON_SELECTOR,
                this._onButtonClick.bind(this)
            );
        }
        element.toggleClass(CONSTANTS.DISABLED_CLASS, !enable);
    },

    /**
     * Enable drop down list
     * @param enable
     * @private
     */
    _enableDropDownList(enable) {
        assert.instanceof(
            DropDownList,
            this.dropDownList,
            assert.format(
                assert.messages.instanceof.default,
                'this.dropDownList',
                'kendo.ui.DropDownList'
            )
        );
        this.dropDownList.enable(enable);
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
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
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
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                LINK_SELECTOR,
                this._onLinkClick.bind(this)
            );
        }
        element.toggleClass(CONSTANTS.DISABLED_CLASS, !enable);
    },

    /**
     * Enable radios
     * @param enable
     * @private
     */
    _enableRadios(enable) {
        const { element } = this;
        element.off(NS);
        if (enable) {
            element.on(
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                RADIO_SELECTOR,
                this._onRadioClick.bind(this)
            );
        } else {
            // Because input are readonly and not disabled, we need to prevent default (checking options)
            // and let it bubble to the stage element to display the handle box
            element
                .on(
                    `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                    RADIO_SELECTOR,
                    e => {
                        e.preventDefault();
                    }
                )
                .on(`${CONSTANTS.CHANGE}${NS}`, RADIO_SELECTOR, e => {
                    // In the very specific case of iOS and only when all radio buttons are unchecked
                    // a CONSTANTS.CHANGE event is triggered before the CONSTANTS.CLICK event and the radio CONSTANTS.CLICKed is checked
                    // like if iOS wanted one radio to always be checked
                    // When one radio is checked, the CONSTANTS.CLICK event handler above does the job
                    // and the CONSTANTS.CHANGE event is not raised
                    // This issue does not occur with checkboxes
                    $(e.target).prop('checked', false);
                });
        }
        element
            .find(RADIO_SELECTOR)
            .toggleClass(CONSTANTS.DISABLED_CLASS, !enable)
            // .prop('disabled', !enable) <--- suppresses the CONSTANTS.CLICK event so elements are no more selectable in design mode
            .prop('readonly', !enable);
    },

    /**
     * Destroy widget
     * @method destroy
     */
    destroy() {
        const { element } = this;
        if (this.dropDownList instanceof DropDownList) {
            this.dropDownList.destroy();
            this.dropDownList = undefined;
        }
        this.setDataSource(null);
        element.off(NS);
        DataBoundWidget.fn.destroy.call(this);
        destroy(element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(Quiz);
