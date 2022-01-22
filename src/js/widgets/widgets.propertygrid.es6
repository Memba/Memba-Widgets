/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO validators
// TODO highlight selection from API
// TODO set/get resize position handle
// TODO disable some attributes/properties
// Refresh properties when attributes change (see highlighter)

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.resizable';
import 'kendo.tooltip';
import 'kendo.validator';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import optimizeEditor from '../tools/util.editors.es6';

const {
    bind,
    destroy,
    getter,
    mobile,
    resize,
    template,
    toHyphens,
    ui,
    ui: { plugin, Tooltip, Validator, Widget },
    unbind,
} = window.kendo;
const logger = new Logger('widgets.propertygrid');
// const NS = '.kendoPropertyGrid';
const TCELL = 'td[role="gridcell"]';
const WIDGET_CLASS = 'k-grid k-widget kj-propertygrid';
const HANDLE_CLASS = 'k-resize-handle';

/**
 * PropertyGrid
 * @class PropertyGrid
 * @extends Widget
 */
const PropertyGrid = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        // base call to widget initialization
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.value(this.options.value);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'PropertyGrid',
        value: null,
        rows: null, // [] means no row to display
        validation: null,
        size: ['35%', '65%'],
        templates: {
            row: '<tr role="row"><td role="gridcell">#: title ## if (help) { #<span class="k-icon k-i-help" title="#: help #"/># } #</td><td role="gridcell"/></tr>',
            altRow: '<tr class="k-alt" role="row"><td role="gridcell">#: title ## if (help) { #<span class="k-icon k-i-help" title="#: help #"/># } #</td><td role="gridcell"/></tr>',
        },
        messages: {
            property: 'Property',
            value: 'Value',
        },
    },

    /**
     * Value is the object whose properties are displayed in the property grid
     * @param value
     * @returns {*}
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.OBJECT,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.OBJECT
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * Rows setter/getter
     * @param rows
     * @returns {*}
     */
    rows(rows) {
        assert.nullableTypeOrUndef(
            CONSTANTS.ARRAY,
            rows,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'rows',
                CONSTANTS.ARRAY
            )
        );
        let ret;
        if ($.type(rows) === CONSTANTS.UNDEFINED) {
            ret = this.options.rows;
        } else if (rows !== this.options.rows) {
            this.options.rows = rows || [];
            this.refresh();
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const {
            element,
            options: { messages, size },
        } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS); // the kendo.ui.Grid has style="height:..."

        // Add column headers (matches markup generated by kendo.ui.Grid)
        if (
            $.type(messages.property) === CONSTANTS.STRING &&
            $.type(messages.value) === CONSTANTS.STRING
        ) {
            element.append(
                `${
                    '<div class="k-grid-header" style="padding-right:17px;">' +
                    '<div class="k-grid-header-wrap k-auto-scrollable">' +
                    '<table role="grid">' +
                    `<colgroup><col style="width:${size[0]};"><col style="width:${size[1]};"></colgroup>` +
                    '<thead role="rowgroup"><tr role="row">' +
                    '<th role="columnheader" class="k-header">'
                }${messages.property}</th>` +
                    `<th role="columnheader" class="k-header">${messages.value}</th>` +
                    `</tr></thead>` +
                    `</table>` +
                    `</div>` +
                    `</div>`
            );
        }

        // Add property grid content (matches markup generated by kendo.ui.Grid)
        element.append(
            '<div class="k-grid-content k-auto-scrollable">' + // the kendo.ui.Grid has style="height:..."
                '<table role="grid" style="height: auto;">' +
                `<colgroup><col style="width:${size[0]};"><col style="width:${size[1]};"></colgroup>` +
                '<tbody role="rowgroup">' +
                // ------------------------------ This is where rows are added
                '</tbody>' +
                '</table>' +
                '</div>'
        );

        // Add column resizing
        this._addColumnResizing();
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const { element, options } = this;
        const tbody = element.find(CONSTANTS.TBODY).first();
        const properties = this.value();

        // Unbind and empty tbody
        unbind(tbody);
        destroy(tbody);
        // tbody.find('*').off();
        tbody.empty();

        // Without value properties, we are done
        if ($.type(properties) !== CONSTANTS.OBJECT) {
            return;
        }

        const rowTemplate = template(options.templates.row);
        const altRowTemplate = template(options.templates.altRow);
        const rows = this.getRows();
        let discarded = 0;

        rows.forEach((row, index) => {
            if (row) {
                const tmpl =
                    (index - discarded) % 2 === 1
                        ? altRowTemplate
                        : rowTemplate;

                // Append the HTML table cells
                // with the key (title) in the left cell
                // And value in the right cell
                tbody.append(
                    tmpl({
                        title: row.title,
                        help: row.help || '',
                    })
                );

                // Add the editor to the right cell
                const container = tbody.find(TCELL).last();
                const settings = $.extend({}, row, { model: properties });
                row.editor(container, settings);
            } else {
                // debugger; // TODO can row be undefined?
                discarded += 1;
            }
        });

        // Bind properties of property grid
        bind(tbody, properties, ui, mobile.ui);

        // Add validator
        this._addValidator(rows);

        // Reposition column resizing handle
        this._resize();

        // Add tooltips (rows need to be added for tooltips to work)
        this._enableTooltip();

        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Build rows by mixing object fields with options.rows
     * @returns {Array}
     * @private
     */
    getRows() {
        // options.rows gives:
        // - field (name) - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.field
        // - title        - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.title
        // - format       - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.format --> TODO
        // - help         - Not in the grid
        // - template     - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.template
        // - editor       - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.editor
        // - values?????  - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.values --> TODO
        // - encoded????  - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.encoded --> TODO
        // - attributes   - https://docs.telerik.com/kendo-ui/api/javascript/ui/grid/configuration/columns.attributes

        // options.fields gives: - https://docs.telerik.com/kendo-ui/api/javascript/data/model/methods/define
        // - type
        // - editable
        // - nullable
        // - defaultValue - see options.value.defaults
        // - validation

        // options.value gives
        // - type
        // - value (for data-binding)

        return this._buildRows(this.value(), this._hash(this.options.rows), '');
    },

    /**
     * Match hierarchical fields to flattened rows
     * @method _buildRows
     * @param properties
     * @param hashedOptionRows
     * @param path
     * @private
     */
    _buildRows(properties, hashedOptionRows, path) {
        const that = this;
        let rows = [];
        const { defaults, fields } = properties;
        // if hashedOptionRows is an empty object, then there won't be any rows
        const hasRows = $.isPlainObject(hashedOptionRows);
        const optionRows = hashedOptionRows || {};
        Object.keys(properties).forEach((prop) => {
            // Select only public properties that are not functions (discards _events)
            if (
                prop.indexOf(CONSTANTS.UNDERSCORE) !== 0 &&
                !$.isFunction(properties[prop]) &&
                // if rows are designated in this.options.rows, only select these rows
                (!hasRows ||
                    Object.prototype.hasOwnProperty.call(optionRows, prop))
            ) {
                // TODO: the following line has been modified to care for complex values like CharGrid, which should be edited as a whole in a specific editor
                // if ($.type(properties[prop]) === CONSTANTS.OBJECT) {
                if (
                    $.type(properties[prop]) === CONSTANTS.OBJECT &&
                    properties[prop].fields
                ) {
                    rows = rows.concat(
                        this._buildRows(
                            properties[prop],
                            optionRows[prop] || {},
                            path.length === 0 ? prop : `${path}.${prop}`
                        )
                    );
                } else {
                    const row = {
                        attributes:
                            hasRows &&
                            optionRows[prop] &&
                            optionRows[prop].attributes
                                ? optionRows[prop].attributes
                                : undefined,
                        // defaultValue
                        editable: !(
                            fields &&
                            fields[prop] &&
                            fields[prop].editable === false
                        ),
                        editor:
                            hasRows &&
                            optionRows[prop] &&
                            optionRows[prop].editor
                                ? optionRows[prop].editor
                                : undefined,
                        field: path.length === 0 ? prop : `${path}.${prop}`,
                        help:
                            hasRows && optionRows[prop] && optionRows[prop].help
                                ? optionRows[prop].help
                                : CONSTANTS.EMPTY,
                        // nullable
                        template:
                            hasRows &&
                            optionRows[prop] &&
                            optionRows[prop].template
                                ? optionRows[prop].template
                                : undefined,
                        title:
                            hasRows &&
                            optionRows[prop] &&
                            optionRows[prop].title
                                ? optionRows[prop].title
                                /* eslint-disable prettier/prettier */
                                : toHyphens(prop).replace(/(^\w|-\w)/g, v =>
                                    v.replace('-', ' ').toUpperCase()
                                ),
                        /* eslint-enable prettier/prettier */
                        type: that._getType(
                            fields && fields[prop],
                            defaults && defaults[prop],
                            properties[prop]
                        ),
                    };

                    // Add validation rules to attributes
                    // See https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
                    // and https://docs.telerik.com/kendo-ui/controls/editors/validator/overview#default-validation-rules
                    if (fields && fields[prop] && fields[prop].validation) {
                        const attributes = {
                            required: fields[prop].validation.required, // ? true : undefined,
                            min: fields[prop].validation.min,
                            max: fields[prop].validation.max,
                            maxlength: fields[prop].validation.maxlength, // See http://docs.telerik.com/kendo-ui/aspnet-mvc/helpers/editor/how-to/add-max-length-validation
                            step: fields[prop].validation.step,
                            pattern: fields[prop].validation.pattern,
                            type: fields[prop].validation.type,
                        };
                        row.attributes = $.extend(
                            {},
                            row.attributes,
                            attributes
                        );
                    }

                    optimizeEditor(row);

                    // TODO: the following line has been modified to care for
                    //  complex values like CharGrid, which have a type of undefined
                    // if (row.type) {
                    if (hasRows) {
                        // With this.options.rows, only designated properties are displayed
                        rows[optionRows[prop]._index] = row;
                    } else {
                        // Without this.options.rows, all public properties are displayed
                        rows.push(row);
                    }
                    // }
                }
            }
        });
        return rows;
    },

    /**
     * Return a hash object from an array of rows
     * @param rows
     * @returns {{}}
     */
    _hash(rows) {
        let ret = null;
        if (Array.isArray(rows)) {
            ret = {};
            $.each(rows, (index, row) => {
                // check fields like attributes.src
                const hierarchy = row.field.split('.');
                let obj = ret;
                for (let i = 0; i < hierarchy.length; i++) {
                    obj[hierarchy[i]] = obj[hierarchy[i]] || {};
                    obj = obj[hierarchy[i]];
                }
                obj._index = index;
                Object.keys(row).forEach((key) => {
                    obj[key] = row[key];
                });
            });
        }
        return ret;
    },

    /**
     * Get the field type
     * @method getType
     * @param field
     * @param defaultValue
     * @param value
     */
    _getType(field, defaultValue, value) {
        const fieldTypes = ['string', 'number', 'boolean', 'date'];
        let type;
        if (field && fieldTypes.indexOf(field.type) > -1) {
            return field.type;
        }
        if (
            $.type(defaultValue) !== CONSTANTS.UNDEFINED &&
            $.type(defaultValue) !== CONSTANTS.NULL
        ) {
            type = $.type(defaultValue);
            return fieldTypes.indexOf(type) > -1 ? type : undefined;
        }
        if (
            $.type(value) !== CONSTANTS.UNDEFINED &&
            $.type(value) !== CONSTANTS.NULL
        ) {
            type = $.type(value);
            return fieldTypes.indexOf(type) > -1 ? type : undefined;
        }
        // By default
        return CONSTANTS.STRING;
    },

    /**
     * _resize is called by Widget.resize and kendo.resize to reposition the handle used to resize columns
     * This is especially required in the Kidoju editor because the handle is not correctly positionned
     * because the PropertyGrid widget is created withng a PanelBar which is initially collapsed (hidden)
     * @private
     */
    _resize(/* size, force */) {
        const { element } = this;
        // reposition the resize handle
        const handle = element.children(`.${HANDLE_CLASS}:visible`);
        const propertyColumn = element.find(
            '.k-grid-content>table>tbody>tr>td:first-child'
        );
        if (handle.length && propertyColumn.length) {
            handle.css({
                left: propertyColumn.outerWidth() - handle.outerWidth() / 2,
            });
        }
    },

    /**
     * Add column resizing
     * @method _addColumnResizing
     * @private
     */
    _addColumnResizing() {
        const { element } = this;
        const headerColGroup = element.find(
            '.k-grid-header>.k-grid-header-wrap>table>colgroup'
        );
        const contentColGroup = element.find('.k-grid-content>table>colgroup');
        const tbody = element.find('.k-grid-content>table>tbody');
        let propertyCell;
        let valueCell;
        // var call;
        if (!element.children(`.${HANDLE_CLASS}`).length) {
            $('<div />').addClass(HANDLE_CLASS).appendTo(element);
        }
        const resizableWidget = element.data('kendoResisable');
        if (!(resizableWidget instanceof ui.Resizable)) {
            element.kendoResizable({
                handle: `.${HANDLE_CLASS}`,
                hint(handle) {
                    const clone = handle.clone();
                    handle.hide();
                    return clone;
                },
                start(/* e */) {
                    // Property and value cells do not exist when initializing element.kendoResizable
                    propertyCell = tbody.find('tr>td:first-child');
                    valueCell = tbody.find('tr>td:last-child');
                    // call = Date.now();
                },
                resize(e) {
                    // if (Date.now() - call > 25) { // throttle
                    setTimeout(() => {
                        const hint = $(e.elementUnderCursor);
                        // td cell do not exist when
                        const propertyWidth = propertyCell.outerWidth();
                        const valueWidth = valueCell.outerWidth();
                        const shift =
                            e.pageX -
                            element.offset().left -
                            e.offsetX +
                            hint.outerWidth() / 2 -
                            propertyWidth;
                        // Testing prevents a flickering effect when resizing but there must be a better way
                        // Also this requires that resizing be performed with slow mouse/touch moves
                        if (Math.abs(shift) < 50) {
                            const propertyPercent =
                                (propertyWidth + shift) /
                                (propertyWidth + valueWidth);
                            const valuePercent =
                                (valueWidth - shift) /
                                (propertyWidth + valueWidth);
                            headerColGroup
                                .children('col:first-child')
                                .width(`${propertyPercent}%`);
                            headerColGroup
                                .children('col:last-child')
                                .width(`${valuePercent}%`);
                            contentColGroup
                                .children('col:first-child')
                                .width(`${propertyPercent}%`);
                            contentColGroup
                                .children('col:last-child')
                                .width(`${valuePercent}%`);
                        }
                        // call = Date.now();
                    }, 0);
                    // }
                },
                resizeend(e) {
                    const propertyWidth = element
                        .find('.k-grid-content>table>tbody>tr>td:first-child')
                        .outerWidth();
                    const handle = $(e.currentTarget);
                    handle
                        .css({ left: propertyWidth - handle.outerWidth() / 2 })
                        .show();
                    // Resize all widgets in the property grid
                    element.children().each((index, child) => {
                        resize($(child));
                    });
                },
            });
        }
    },

    /**
     * @method _enableTooltip
     * @param enable
     * @private
     */
    _enableTooltip(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const table = this.element.find(CONSTANTS.TABLE).last();
        if (this.tooltip instanceof Tooltip) {
            this.tooltip.destroy();
            this.tooltip = undefined;
        }
        if (enabled) {
            this.tooltip = table
                .kendoTooltip({
                    filter: 'span.k-icon.k-i-help[title]',
                    width: 120,
                    position: 'top',
                    showOn: 'click mouseenter',
                    animation: {
                        open: {
                            effects: 'zoom',
                            duration: 150,
                        },
                    },
                })
                .data('kendoTooltip');
        }
    },

    /**
     * Add validator
     * See http://docs.telerik.com/kendo-ui/api/javascript/ui/validator
     * @param rows
     * @private
     */
    _addValidator(rows) {
        if (this.validator instanceof Validator) {
            this.validator.destroy();
            this.validator = undefined;
        }
        if (rows) {
            const rules = {};
            const value = this.value();
            // Only add validator rules for property grid rows
            rows.forEach((row) => {
                // For each row find the validation rules in the data.Model field
                const name = row.field;
                let validation;
                let pos = 0;
                while ($.type(validation) === CONSTANTS.UNDEFINED && pos > -1) {
                    // Find the next dot as in `attributes.text` or in `properties.question`
                    pos = name.indexOf(CONSTANTS.DOT, pos + 1);
                    if (pos === -1) {
                        // If there is no dot left to find, try fields.<name>.validation
                        validation = getter(
                            `fields.${name}.validation`,
                            true
                        )(value);
                    } else {
                        // If there is a dot left, break the field into prefix.suffix and try prefix.fields.suffix.validation
                        // as in attributes.fields.text.validation or properties.fields.question.validation
                        validation = getter(
                            `${name.substr(0, pos)}.fields${name.substr(
                                pos
                            )}.validation`,
                            true
                        )(value);
                    }
                }
                if ($.type(validation) === CONSTANTS.OBJECT) {
                    Object.keys(validation).forEach((key) => {
                        const rule = validation[key];
                        /*
                        if ($.isFunction(rule)) {
                            // Custom validation function names should be unique in a data.Model
                            assert.isUndefined(
                                rules[key],
                                assert.format(
                                    assert.messages.isUndefined.default,
                                    `rules.${key}`
                                )
                        */
                        // TODO failure, omit and success share the same scoreValidator rule
                        //  so the assert above throws an error
                        if (
                            $.isFunction(rule) &&
                            $.type(rules[key]) === CONSTANTS.UNDEFINED
                        ) {
                            // Note, we cannot use rule.bind(value) because kendo.ui.Validator calls
                            // rules[rule].call(this, input), where this is the Validator widget
                            rules[key] = rule;
                        }
                    });
                }
            });
            this.validator = this.element
                .find(CONSTANTS.TBODY)
                .first()
                .kendoValidator(
                    /* eslint-disable prettier/prettier */
                    $.isEmptyObject(rules)
                        ? this.options.validation
                        : {
                            rules
                            // messages -> We use a single validationMessage per field
                        }
                    /* eslint-enable prettier/prettier */
                )
                .data('kendoValidator');
        }
    },

    /**
     * Get the error messages if any. (call validate first)
     * @returns {*}
     */
    errors() {
        let ret;
        if (this.validator instanceof Validator) {
            ret = this.validator.errors();
        }
        return ret;
    },

    /**
     * Hides the validation messages.
     * @returns {*}
     */
    hideMessages() {
        let ret;
        if (this.validator instanceof Validator) {
            ret = this.validator.hideMessages();
        }
        return ret;
    },

    /**
     * Validates the input element(s) against the declared validation rules.
     * @returns {*}
     */
    validate() {
        let ret;
        if (this.validator instanceof Validator) {
            ret = this.validator.validate();
        }
        return ret;
    },

    /**
     * Validates the input element against the declared validation rules.
     * @param input
     * @returns {*}
     */
    validateInput(input) {
        let ret;
        if (this.validator instanceof Validator) {
            ret = this.validator.validateInput(input);
        }
        return ret;
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { element } = this;
        this._enableTooltip(false);
        this._addValidator(false);
        // element.off(NS).removeClass(WIDGET_CLASS);
        // Destroy
        Widget.fn.destroy.call(this);
        destroy(element);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'PropertyGrid')) {
    // Prevents loading several times in karma
    plugin(PropertyGrid);
}
