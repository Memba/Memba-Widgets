/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Notes
// https://discuss.prosemirror.net/t/custom-prosemirror-format/41/8

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import pm from '../vendor/prosemirror/prosemirror.mjs';
import './widgets.prosemirror.toolbar.es6';

const {
    destroy,
    ui: { plugin, Widget, ProseMirrorToolBar },
} = window.kendo;
const {
    exampleSetup: { exampleSetup }, // Menu
    markdown: { schema, defaultMarkdownParser, defaultMarkdownSerializer },
    // schemaBasic: { schema },
    state: { EditorState },
    view: { EditorView },
} = pm;
const logger = new Logger('widgets.prosemirror');
// const NS = '.kendoProseMirror';
const WIDGET_CLASS = 'k-widget m-prosemirror';

/**
 * ProseMirror
 * @class ProseMirror
 * @extends Widget
 */
const ProseMirror = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
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
    events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'ProseMirror',
        enabled: true,
        value: CONSTANTS.EMPTY,
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    setOptions(options) {
        this.enable(options.enabled);
        this.value(options.value);
    },

    /**
     * Value
     * @method value
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        const { view } = this;
        let ret;
        const oldValue = defaultMarkdownSerializer.serialize(view.state.doc);
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = oldValue;
        } else if (value !== oldValue) {
            // @see https://discuss.prosemirror.net/t/replacing-a-states-doc/634
            // @see https://discuss.prosemirror.net/t/find-beginning-and-end-of-document/841
            const state = EditorState.create({
                schema: view.state.schema,
                doc: defaultMarkdownParser.parse(value || CONSTANTS.EMPTY), // if null
                plugins: view.state.plugins,
            });
            view.updateState(state);
        }
        return ret;
    },

    /**
     * _render
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
        if (!(this.toolbar instanceof ProseMirrorToolBar)) {
            this.toolbar = $(`<${CONSTANTS.DIV}/>`)
                .appendTo(this.element)
                .kendoProseMirrorToolBar({
                    command: this._onToolBarCommand.bind(this),
                    resizable: true,
                })
                .data('kendoProseMirrorToolBar');
        }
        if (!(this.view instanceof EditorView)) {
            const $editorElement = $(`<${CONSTANTS.DIV}/>`).appendTo(
                this.element
            );
            const state = EditorState.create({
                ...schema,
                doc: defaultMarkdownParser.parse(
                    this.options.value || CONSTANTS.EMPTY
                ),
                plugins: exampleSetup({ schema }),
            });
            this.view = new EditorView($editorElement[0], {
                state,
                dispatchTransaction: this._dispatchTransaction.bind(this),
                editable: this._isEditable.bind(this),
                // filterTransaction: this._filterTransaction.bind(this),
                // handleDoubleClick() { console.log("Double click!") }
            });
        }
    },

    /**
     * _onToolBarCommand
     * @param e
     * @private
     */
    _onToolBarCommand(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        console.log(e.command);
        const {
            commands: { setBlockType, toggleMark, wrapIn },
            history: { undo, redo },
            schemaList: { wrapInList },
        } = pm;
        const { marks, nodes } = schema;
        const { state, dispatch } = this.view;
        switch (e.command) {
            case 'bold':
                toggleMark(marks.strong)(state, dispatch);
                break;
            case 'code':
                toggleMark(marks.code)(state, dispatch);
                break;
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                setBlockType(nodes.heading, {
                    level: parseInt(e.command.slice(-1), 10),
                })(state, dispatch);
                break;
            case 'italic':
                toggleMark(marks.em)(state, dispatch);
                break;
            case 'ordered':
                // TODO https://prosemirror.net/docs/ref/#schema-list
                // TODO https://discuss.prosemirror.net/t/list-type-toggle/948/9
                // const mySchema = new Schema({
                //   nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
                //   marks: baseSchema.spec.marks
                // })
                // --------------
                wrapInList(nodes.ordered_list)(state, dispatch);
                break;
            case 'undo':
                undo(state, dispatch);
                break;
            case 'redo':
                redo(state, dispatch);
                break;
            case 'unordered':
                wrapInList(nodes.bullet_list)(state, dispatch);
                break;
            default:
                e.preventDefault();
        }
    },

    /**
     * Dispatch transaction
     * @method _dispatchTransaction
     * @param transaction
     * @private
     */
    _dispatchTransaction(transaction) {
        if (this._isEditable()) {
            const state = this.view.state.apply(transaction);
            this.view.updateState(state);
            this.trigger(CONSTANTS.CHANGE); // TODO: do not trigger on selections and other non-modifying transactions
        }
    },

    /**
     * Editable
     * @returns {boolean}
     * @private
     */
    _isEditable() {
        // Enables read-only behavior
        return this._enabled;
    },

    /**
     * Focus
     * @methodL focus
     */
    focus() {
        this.view.focus();
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        this._enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        /*
        const { element } = this;
        element.off(NS);
        element.css('cursor', 'default');
        if (enabled) {
            element.on(CONSTANTS.CLICK + NS, this._onClick.bind(this));
            element.css('cursor', 'pointer');
        }
        */
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.view.destroy();
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
plugin(ProseMirror);
