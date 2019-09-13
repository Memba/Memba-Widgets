/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assets from '../app/app.assets.es6';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.audiovideo.es6';
import AssetAdapter from './adapters.asset.es6';
import BooleanAdapter from './adapters.boolean.es6';
import { BaseTool } from './tools.base.es6';
import ToolAssets from './util.assets.es6';
import TOOLS from './util.constants.es6';

const { format, ns, roleSelector } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div data-${ns}role="audiovideo" data-${ns}mode="audio" data-${ns}autoplay="#: attributes.autoplay #" data-${ns}files="#: files$() #"></div>`;

/**
 * @class AudioTool
 */
const AudioTool = BaseTool.extend({
    id: 'audio',
    childSelector: `div${roleSelector('audiovideo')}`,
    height: 100,
    width: 400,
    menu: ['attributes.mp3'], // TODO <------------ does not work
    templates: {
        default: TEMPLATE
    },
    attributes: {
        autoplay: new BooleanAdapter({
            title: __('tools.audio.attributes.autoplay.title'),
            defaultValue: false
        }),
        mp3: new AssetAdapter({
            title: __('tools.audio.attributes.mp3.title')
        }),
        ogg: new AssetAdapter({
            title: __('tools.audio.attributes.ogg.title')
        })
    },

    /**
     * getAssets
     * @method getAssets
     * @param component
     * @returns {{audio: Array, image: Array, video: Array}}
     */
    getAssets(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return {
            audio: [
                component.get('attributes.mp3'),
                component.get('attributes.ogg')
            ].filter(item => $.type(item) === CONSTANTS.STRING),
            image: [],
            video: []
        };
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        assert.instanceof(
            ToolAssets,
            assets.audio,
            assert.format(
                assert.messages.instanceof.default,
                'assets.audio',
                'ToolAssets'
            )
        );
        $.extend(component, {
            // The files$ function resolves urls with schemes like cdn://video.mp4 and returns a stringified array
            files$() {
                let mp3 = component.attributes.get('mp3');
                let ogg = component.attributes.get('ogg');
                const files = [];
                // TODO Check when mp3 or ogg is undefined;
                mp3 = assets.audio.scheme2http(mp3);
                if (TOOLS.RX_HTTP_S.test(mp3)) {
                    files.push(mp3);
                }
                ogg = assets.audio.scheme2http(ogg);
                if (TOOLS.RX_HTTP_S.test(ogg)) {
                    files.push(ogg);
                }
                // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                // return `${JSON.stringify(files)}`;
                return JSON.stringify(files);
            }
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
        if (
            !component.attributes ||
            !TOOLS.RX_AUDIO.test(component.attributes.mp3)
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidAudioFile'),
                    toolName,
                    pageIdx + 1
                )
            });
        }
        // Note: we are not testing for an ogg file
        return ret;
    }
});

/**
 * Default eport
 */
export default AudioTool;
