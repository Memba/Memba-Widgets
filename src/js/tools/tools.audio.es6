/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import AssetAdapter from './adapters.asset.es6';
import BooleanAdapter from './adapters.boolean.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import { ToolAssets, assets } from './util.assets.es6';

const {
    format,
    ns,
    roleSelector,
    template,
    ui: { Stage }
} = window.kendo;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).audio || {
            description: 'Audio Player',
            attributes: {
                autoplay: { title: 'Autoplay' },
                mp3: { title: 'MP3 File' },
                ogg: { title: 'OGG File' }
            }
        }
    );
}

/**
 * @class AudioTool
 */
const AudioTool = BaseTool.extend({
    id: 'audio',
    icon: 'loudspeaker3',
    description: i18n().description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default:
            '<div data-#= ns #role="mediaplayer" data-#= ns #mode="audio" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: files$() #"></div>'
    },
    height: 100,
    width: 400,
    attributes: {
        autoplay: new BooleanAdapter({
            title: i18n().attributes.autoplay.title,
            defaultValue: false
        }),
        mp3: new AssetAdapter({ title: i18n().attributes.mp3.title }),
        ogg: new AssetAdapter({ title: i18n().attributes.ogg.title })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const that = this;
        assert.instanceof(
            Audio,
            that,
            assert.format(assert.messages.instanceof.default, 'this', 'Audio')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        assert.enum(
            Object.keys(Stage.fn.modes),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.keys(Stage.fn.modes)
            )
        );
        assert.instanceof(
            ToolAssets,
            assets.audio,
            assert.format(
                assert.messages.instanceof.default,
                'assets.audio',
                'kidoju.ToolAssets'
            )
        );
        const tmpl = template(that.templates.default);
        // The files$ function resolves urls with schemes like cdn://audio.mp3 and returns a stringified array
        component.files$ = function() {
            let mp3 = component.attributes.get('mp3');
            let ogg = component.attributes.get('ogg');
            const schemes = assets.audio.schemes;
            for (const scheme in schemes) {
                if (Object.prototype.hasOwnProperty.call(schemes, scheme)) {
                    const schemeRx = new RegExp(`^${scheme}://`);
                    if (schemeRx.test(mp3)) {
                        mp3 = mp3.replace(`${scheme}://`, schemes[scheme]);
                    }
                    if (schemeRx.test(ogg)) {
                        ogg = ogg.replace(`${scheme}://`, schemes[scheme]);
                    }
                }
            }
            const files = [];
            if (RX_HTTP_S.test(mp3)) {
                files.push(mp3);
            }
            if (RX_HTTP_S.test(ogg)) {
                files.push(ogg);
            }
            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ` ${JSON.stringify(files)}`;
        };
        return tmpl($.extend(component, { ns }));
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            format('e.currentTarget is expected to be a stage element')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        const content = stageElement.children(
            `div${roleSelector('mediaplayer')}`
        );
        const widget = content.data('kendoMediaPlayer');
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(
                component.get('width') -
                    content.outerWidth(true) +
                    content.outerWidth()
            );
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(
                component.get('height') -
                    content.outerHeight(true) +
                    content.outerHeight()
            );
        }
        widget.resize();
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const description = this.description; // tool description
        const messages = this.i18n.messages;
        if (!component.attributes || !RX_AUDIO.test(component.attributes.mp3)) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidAudioFile,
                    description,
                    pageIdx + 1
                )
            });
        }
        // Note: we are not testing for an ogg file
        return ret;
    }
});

/**
 * Registration
 */
tools.register(AudioTool);
