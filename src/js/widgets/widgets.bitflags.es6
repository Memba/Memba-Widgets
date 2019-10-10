/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.multiselect';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    ui: { plugin, DataBoundWidget, MultiSelect }
} = window.kendo;
const logger = new Logger('widgets.bitflags');
const WIDGET_CLASS = 'kj-bitflags';

/**
 * BitFlags
 * @class BitFlags
 * @extends Widget
 */
const BitFlags = DataBoundWidget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        DataBoundWidget.fn.init.call(this, element, options);
        this._render();
        this.setOptions(options);
        logger.debug({ method: 'init', message: 'Widget initialized' });
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'BitFlags',
        // ------------------> For kendo.ui.MultiSelect
        // tagMode: 'multiple',
        enabled: true,
        autoBind: true,
        // autoClose: true,
        // highlightFirst: true,
        dataTextField: CONSTANTS.TEXT,
        dataValueField: CONSTANTS.VALUE,
        // filter: 'startswith',
        // ignoreCase: true,
        // minLength: 1,
        // enforceMinLength: false,
        // delay: 100,
        value: 0,
        // maxSelectedItems: null,
        placeholder: '',
        height: 200,
        // animation: {},
        // virtual: false,
        // itemTemplate: '',
        // tagTemplate: '',
        // groupTemplate: '#:data#',
        // fixedGroupTemplate: '#:data#',
        clearButton: true,
        autoWidth: false,
        // popup: null
        // ------------------> Specific to widgets.bitflags
        readonly: false
    },

    /**
     * Value
     * @method value
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        const { multiSelect } = this;
        assert.instanceof(
            MultiSelect,
            multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        const oldArray = multiSelect.value();
        const oldValue = this._convertBitArrayAsValue(oldArray || []);
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._convertBitArrayAsValue(oldArray);
        } else if (value !== oldValue) {
            const trunc = Math.trunc(value);
            this.element.val(trunc);
            const newArray = this._convertValueAsBitArray(trunc);
            multiSelect.value(newArray);
        }
        return ret;
    },

    /**
     * setOptions
     * @param options
     */
    setOptions(options) {
        const { multiSelect } = this;
        assert.instanceof(
            MultiSelect,
            multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        multiSelect.setOptions(options);
    },

    /**
     * Convert an array of [2^0, 2^1, 2^2, ...2^n) into a number value
     * @param array
     * @private
     */
    _convertBitArrayAsValue(array) {
        assert.isArray(
            array,
            assert.format(assert.messages.isArray.default, 'array')
        );
        let ret = 0;
        array.forEach(item => {
            if ($.type(item) === CONSTANTS.NUMBER) {
                ret += item;
            }
        });
        return ret;
    },

    /**
     * Convert a number value into an array of [2^0, 2^1, 2^2, ...2^n)
     * @param value
     * @returns {Array}
     * @private
     */
    _convertValueAsBitArray(value) {
        assert.type(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.type.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let b = 1;
        const ret = [];
        while (b <= value) {
            /* eslint-disable no-bitwise */
            if (b & value) {
                ret.push(b);
            }
            b <<= 1;
            /* eslint-enable no-bitwise */
        }
        return ret;
    },

    /**
     * _render
     * @method
     * @private
     */
    _render() {
        const { element } = this;
        assert.ok(
            element.is(CONSTANTS.INPUT),
            'Please use an input tag to instantiate a BitFlags widget.'
            // otherwise kendo ui validators won't work
        );
        this.wrapper = element
            .attr('type', 'number')
            .hide() // Comment to see how values change
            .wrap(`<${CONSTANTS.DIV}/>`)
            .parent()
            .addClass(WIDGET_CLASS);
        const options = { ...this.options };
        delete options.name;
        // For whatever reason, this does set the initial value
        options.value = this._convertValueAsBitArray(options.value);
        this.multiSelect = $(`<${CONSTANTS.SELECT}/>`)
            .appendTo(this.wrapper)
            .kendoMultiSelect(options)
            .data('kendoMultiSelect');
        // Ouf! this now sets the initial value
        this.multiSelect.value(options.value);
        this.dataSource = this.multiSelect.dataSource;
        this.element.val(this.options.value);
        this.multiSelect.readonly(options.readonly);
        this.multiSelect.wrapper.toggleClass('k-readonly', options.readonly);
        this.multiSelect.bind(
            CONSTANTS.CHANGE,
            this._onMultiSelectChange.bind(this)
        );
    },

    /**
     * Event handler triggered when the multi select triggers a change
     * @param e
     * @private
     */
    _onMultiSelectChange(e) {
        const { dataTextField, dataValueField } = this.options;
        const { dataSource, tagList } = e.sender;
        const data = dataSource.data();
        // Reorder tags
        const tags = tagList.find('> li').sort((a, b) => {
            const aText = $(a).text();
            const aNum = (data.find(
                item => item[dataTextField || CONSTANTS.TEXT] === aText
            ) || {})[dataValueField || CONSTANTS.VALUE];
            const bText = $(b).text();
            const bNum = (data.find(
                item => item[dataTextField || CONSTANTS.TEXT] === bText
            ) || {})[dataValueField || CONSTANTS.VALUE];
            return aNum - bNum;
        });
        tagList.empty().append(tags);
        // Update input value
        this.element.val(this._convertBitArrayAsValue(e.sender.value() || 0));
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Set data source
     * @method setDataSource
     * @param dataSource
     */
    setDataSource(dataSource) {
        const { multiSelect } = this;
        assert.instanceof(
            MultiSelect,
            multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        this.options.dataSource = dataSource;
        multiSelect.setDataSource(dataSource);
        this.dataSource = multiSelect.dataSource;
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const { multiSelect } = this;
        assert.instanceof(
            MultiSelect,
            multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        multiSelect.refresh();
    },

    /**
     * Enable
     * @method enable
     * @param enabled
     */
    enable(enabled) {
        const { multiSelect } = this;
        assert.instanceof(
            MultiSelect,
            multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        multiSelect.enable(enabled);
    },

    /**
     * Readonly
     * @param readonly
     */
    readonly(readonly) {
        const { multiSelect } = this;
        assert.instanceof(
            MultiSelect,
            multiSelect,
            assert.format(
                assert.messages.instanceof.default,
                'multiSelect',
                'kendo.ui.MultiSelect'
            )
        );
        multiSelect.readonly(readonly);
    },

    /**
     * Destroy
     * @method destriy
     */
    destroy() {
        DataBoundWidget.fn.destroy.call(this);
        destroy(this.element); // Destroys MultiSelect
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'BitFlags')) {
    // Prevents loading several times in karma
    plugin(BitFlags);
}
