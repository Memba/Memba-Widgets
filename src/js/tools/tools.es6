/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* globals __NODE_ENV__: false */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { BaseTool, StubTool } from './tools.base.es6';
import PointerTool from './tools.pointer.es6';
import TOOLS from './util.constants.es6';

const { observable } = window.kendo;
const logger = new Logger('tools');

let _tools;

/**
 * tools
 * We need a function to access tools
 * otherwise i18n resources might not be loaded
 * amd _(...) might return empty strings
 * @function tools
 * @param id
 * @returns {*}
 */
function tools(id) {
    assert.typeOrUndef(
        CONSTANTS.STRING,
        id,
        assert.format(
            assert.messages.typeOrUndef.default,
            'id',
            CONSTANTS.STRING
        )
    );

    if ($.type(_tools) === CONSTANTS.UNDEFINED) {
        logger.info({
            method: 'tools',
            message: 'Initializing tools with stubs',
        });

        /**
         * Registry of tools
         * @type {{register: Function}}
         */
        _tools = observable({
            /**
             * The active tool
             */
            active: null,

            /**
             * Load
             * @param toolId
             * @returns {*}
             */
            load(toolId) {
                assert.type(
                    CONSTANTS.STRING,
                    toolId,
                    assert.format(
                        assert.messages.type.default,
                        'toolId',
                        CONSTANTS.STRING
                    )
                );
                assert.hasLength(
                    CONSTANTS.STRING,
                    toolId,
                    assert.format(assert.messages.hasLength.default, 'toolId')
                );

                const dfd = $.Deferred();
                const tool = this[toolId];
                if (tool instanceof BaseTool) {
                    // The tool is already loaded
                    dfd.resolve();
                } else if (tool instanceof StubTool) {
                    // The tool is not loaded
                    logger.debug({
                        method: 'load',
                        message: `Loading ${toolId}`,
                    });
                    import(
                        /* webpackMode: "lazy" */
                        /* webpackChunkName: "[request]" */
                        `./tools.${toolId}.es6`
                    )
                        .then((module) => {
                            assert.extends(
                                BaseTool,
                                module.default,
                                assert.format(
                                    assert.messages.extends.default,
                                    'module.default',
                                    'BaseTool'
                                )
                            );
                            const Tool = module.default;
                            this[toolId] = new Tool({
                                description: tool.description,
                                help: tool.help,
                                icon: tool.icon,
                                name: tool.name,
                            });
                            logger.debug({
                                method: 'load',
                                message: `Loaded ${toolId}`,
                            });
                            dfd.resolve();
                        })
                        .catch(dfd.reject);
                } else {
                    // This is not a tool
                    dfd.reject(new Error(`Cannot load tool ${toolId}`));
                }
                return dfd.promise();
            },
        });

        /**
         * Pointer
         */
        _tools[TOOLS.POINTER] = new PointerTool({
            description: __('tools.pointer.description'),
            help: __('tools.pointer.help'),
            icon: __('tools.pointer.icon'),
            name: __('tools.pointer.name'),
        });
        _tools.set(TOOLS.ACTIVE, TOOLS.POINTER);

        /* ***************************************************
         * BEWARE! The following order defines the order
         * in which tools are displayed in the toolbar
         * ************************************************ */

        /**
         * Label
         */
        _tools.label = new StubTool({
            description: __('tools.label.description'),
            help: __('tools.label.help'),
            icon: __('tools.label.icon'),
            name: __('tools.label.name'),
        });

        /**
         * Image
         */
        _tools.image = new StubTool({
            description: __('tools.image.description'),
            help: __('tools.image.help'),
            icon: __('tools.image.icon'),
            name: __('tools.image.name'),
        });

        /**
         * ImageSet
         */
        _tools.imageset = new StubTool({
            description: __('tools.imageset.description'),
            help: __('tools.imageset.help'),
            icon: __('tools.imageset.icon'),
            name: __('tools.imageset.name'),
        });

        /**
         * TextArea
         */
        _tools.textarea = new StubTool({
            description: __('tools.textarea.description'),
            help: __('tools.textarea.help'),
            icon: __('tools.textarea.icon'),
            name: __('tools.textarea.name'),
        });

        /**
         * TextBox
         */
        _tools.textbox = new StubTool({
            description: __('tools.textbox.description'),
            help: __('tools.textbox.help'),
            icon: __('tools.textbox.icon'),
            name: __('tools.textbox.name'),
        });

        /**
         * NumericBox
         */
        _tools.numericbox = new StubTool({
            description: __('tools.numericbox.description'),
            help: __('tools.numericbox.help'),
            icon: __('tools.numericbox.icon'),
            name: __('tools.numericbox.name'),
        });

        /**
         * Variable
         */
        _tools.variable = new StubTool({
            description: __('tools.variable.description'),
            help: __('tools.variable.help'),
            icon: __('tools.variable.icon'),
            name: __('tools.variable.name'),
        });

        /**
         * Quiz
         */
        _tools.quiz = new StubTool({
            description: __('tools.quiz.description'),
            help: __('tools.quiz.help'),
            icon: __('tools.quiz.icon'),
            name: __('tools.quiz.name'),
        });

        /**
         * MultiQuiz
         */
        _tools.multiquiz = new StubTool({
            description: __('tools.multiquiz.description'),
            help: __('tools.multiquiz.help'),
            icon: __('tools.multiquiz.icon'),
            name: __('tools.multiquiz.name'),
        });

        /**
         * HighLighter
         */
        _tools.highlighter = new StubTool({
            description: __('tools.highlighter.description'),
            help: __('tools.highlighter.help'),
            icon: __('tools.highlighter.icon'),
            name: __('tools.highlighter.name'),
        });

        /**
         * TextGaps
         */
        _tools.textgaps = new StubTool({
            description: __('tools.textgaps.description'),
            help: __('tools.textgaps.help'),
            icon: __('tools.textgaps.icon'),
            name: __('tools.textgaps.name'),
        });

        /**
         * Line
         */
        _tools.line = new StubTool({
            description: __('tools.line.description'),
            help: __('tools.line.help'),
            icon: __('tools.line.icon'),
            name: __('tools.line.name'),
        });

        /**
         * Shape
         */
        _tools.shape = new StubTool({
            description: __('tools.shape.description'),
            help: __('tools.shape.help'),
            icon: __('tools.shape.icon'),
            name: __('tools.shape.name'),
        });

        /**
         * Connector
         */
        _tools.connector = new StubTool({
            description: __('tools.connector.description'),
            help: __('tools.connector.help'),
            icon: __('tools.connector.icon'),
            name: __('tools.connector.name'),
        });

        /**
         * Selector
         */
        _tools.selector = new StubTool({
            description: __('tools.selector.description'),
            help: __('tools.selector.help'),
            icon: __('tools.selector.icon'),
            name: __('tools.selector.name'),
        });

        /**
         * Drop Zone
         */
        _tools.dropzone = new StubTool({
            description: __('tools.dropzone.description'),
            help: __('tools.dropzone.help'),
            icon: __('tools.dropzone.icon'),
            name: __('tools.dropzone.name'),
        });

        /**
         * Latex
         */
        _tools.mathinput = new StubTool({
            description: __('tools.mathinput.description'),
            help: __('tools.mathinput.help'),
            icon: __('tools.mathinput.icon'),
            name: __('tools.mathinput.name'),
        });

        /**
         * Latex
         */
        _tools.latex = new StubTool({
            description: __('tools.latex.description'),
            help: __('tools.latex.help'),
            icon: __('tools.latex.icon'),
            name: __('tools.latex.name'),
        });

        /**
         * Audio
         */
        _tools.audio = new StubTool({
            description: __('tools.audio.description'),
            help: __('tools.audio.help'),
            icon: __('tools.audio.icon'),
            name: __('tools.audio.name'),
        });

        /**
         * Video
         */
        _tools.video = new StubTool({
            description: __('tools.video.description'),
            help: __('tools.video.help'),
            icon: __('tools.video.icon'),
            name: __('tools.video.name'),
        });

        /**
         * Table
         */
        _tools.table = new StubTool({
            description: __('tools.table.description'),
            help: __('tools.table.help'),
            icon: __('tools.table.icon'),
            name: __('tools.table.name'),
        });

        /**
         * Chart
         */
        _tools.chart = new StubTool({
            description: __('tools.chart.description'),
            help: __('tools.chart.help'),
            icon: __('tools.chart.icon'),
            name: __('tools.chart.name'),
        });

        /**
         * CharGrid
         */
        _tools.chargrid = new StubTool({
            description: __('tools.chargrid.description'),
            help: __('tools.chargrid.help'),
            icon: __('tools.chargrid.icon'),
            name: __('tools.chargrid.name'),
        });

        /**
         * Dummy tool for tests
         */
        try {
            // Code is packaged via WebPack
            $.noop(__NODE_ENV__);
        } catch (ex) {
            // ReferenceError: __NODE_ENV__ is not defined
            if (window.DEBUG) {
                _tools.dummy = new StubTool({
                    description: __('tools.dummy.description'),
                    help: __('tools.dummy.help'),
                    icon: __('tools.dummy.icon'),
                    name: __('tools.dummy.name'),
                });
            }
        }
    }

    let ret;
    if ($.type(id) === CONSTANTS.UNDEFINED) {
        ret = _tools;
    } else if (
        $.type(id) === CONSTANTS.STRING &&
        id.length &&
        _tools[id] instanceof StubTool
    ) {
        // Note: the tool returned might not be loaded
        ret = _tools[id];
    }
    return ret;
}

/**
 * Load a tool designated by its id
 * @function load
 * @param id
 */
tools.load = function load(id) {
    return tools().load(id);
};

/**
 * Define tools.active
 */
Object.defineProperty(tools, TOOLS.ACTIVE, {
    /**
     * Get the active tools
     * @returns {*}
     */
    get() {
        return tools().get(TOOLS.ACTIVE);
    },
    /**
     * Set the active tool
     * @param id
     */
    set(id) {
        assert.type(
            CONSTANTS.STRING,
            id,
            assert.format(assert.messages.type.default, 'id', CONSTANTS.STRING)
        );
        assert.hasLength(
            CONSTANTS.STRING,
            id,
            assert.format(assert.messages.hasLength.default, 'id')
        );
        if (tools(id) instanceof StubTool) {
            tools().set(TOOLS.ACTIVE, id);
        } else {
            throw new Error(`${id} is not a registered tool`);
        }
    },
    enumerable: true,
});

/**
 * Default export
 */
export default tools;
