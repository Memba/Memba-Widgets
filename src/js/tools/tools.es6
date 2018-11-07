/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.binder';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import BaseTool from './tools.base.es6';

const { observable } = window.kendo;

/**
 * Registry of tools
 * @type {{register: Function}}
 */
const tools = observable({
    /**
     * The active tool
     */
    active: null,

    /**
     * Register a tool
     * @param Class
     */
    register(Class) {
        assert.isFunction(
            Class,
            assert.format(assert.messages.isFunction.default, 'Class')
        );
        assert.type(
            CONSTANTS.OBJECT,
            Class.prototype,
            assert.format(
                assert.messages.type.default,
                'Class.prototype',
                CONSTANTS.OBJECT
            )
        );
        const tool = new Class();
        assert.instanceof(
            BaseTool,
            tool,
            assert.format(
                assert.messages.instanceof.default,
                'tool',
                'BaseTool'
            )
        );
        assert.type(
            CONSTANTS.STRING,
            tool.id,
            assert.format(
                assert.messages.type.default,
                'tool.id',
                CONSTANTS.STRING
            )
        );
        assert.ok(
            tool.id !== 'active' && tool.id !== 'register',
            'A tool cannot have `active` or `register` for id'
        );
        assert.isUndefined(this[tool.id], 'Existing tools cannot be replaced');
        this[tool.id] = tool;
        if (tool.id === CONSTANTS.POINTER) {
            this.active = CONSTANTS.POINTER;
        }
    }
});

/**
 * Default export
 */
export default tools;
