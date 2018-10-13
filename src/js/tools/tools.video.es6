/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assets from '../app/app.assets.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import AssetAdapter from './adapters.asset.es6';
import BooleanAdapter from './adapters.boolean.es6';
import NumberAdapter from './adapters.number.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import ToolAssets from './util.assets.es6';

const { ns, template } = window.kendo;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).video || {
            description: 'Video Player',
            attributes: {
                autoplay: { title: 'Autoplay' },
                toolbarHeight: { title: 'Toolbar Height' },
                mp4: { title: 'MP4 File' },
                ogv: { title: 'OGV File' },
                wbem: { title: 'WBEM File' }
            }
        }
    );
}

/**
 * Video tool
 * @class Video
 */
var Video = BaseTool.extend({
    id: 'video',
    icon: 'movie',
    description: i18n.video.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default:
            '<div data-#= ns #role="mediaplayer" data-#= ns #mode="video" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: files$() #" data-#= ns #toolbar-height="#: attributes.toolbarHeight #"></div>'
    },
    height: 300,
    width: 600,
    attributes: {
        autoplay: new BooleanAdapter({
            title: 'Autoplay',
            defaultValue: false
        }),
        toolbarHeight: new NumberAdapter({
            title: 'Toolbar Height',
            defaultValue: 48
        }),
        mp4: new AssetAdapter({ title: 'MP4 File' }),
        ogv: new AssetAdapter({ title: 'OGV File' }),
        wbem: new AssetAdapter({ title: 'WBEM File' })
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
            Video,
            that,
            assert.format(assert.messages.instanceof.default, 'this', 'Video')
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
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(CONSTANTS.STAGE_MODES)
            )
        );
        assert.instanceof(
            ToolAssets,
            assets.video,
            assert.format(
                assert.messages.instanceof.default,
                'assets.video',
                'kidoju.ToolAssets'
            )
        );
        const tmpl = template(this.templates.default);

        $.extend(component, {
            // The files$ function resolves urls with schemes like cdn://video.mp4 and returns a stringified array
            files$() {
                let mp4 = component.attributes.get('mp4');
                let ogv = component.attributes.get('ogv');
                let wbem = component.attributes.get('wbem');
                const files = [];
                mp4 = assets.video.scheme2http(mp4);
                if (RX_HTTP_S.test(mp4)) {
                    files.push(mp4);
                }
                ogv = assets.video.scheme2http(ogv);
                if (RX_HTTP_S.test(ogv)) {
                    files.push(ogv);
                }
                wbem = assets.video.scheme2http(wbem);
                if (RX_HTTP_S.test(wbem)) {
                    files.push(wbem);
                }

                // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                // return ` ${JSON.stringify(files)}`;
                return JSON.stringify(files);
            },
            // ns is required for data-* declarations
            ns
        });

        return tmpl(component);
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
            `div${kendo.roleSelector('mediaplayer')}`
        );
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
        const widget = content.data('kendoMediaPlayer');
        if (kendo.ui.MediaPlayer && widget instanceof kendo.ui.MediaPlayer) {
            widget.resize();
        }
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
        const {
            description,
            i18n: { messages }
        } = this; // tool description
        if (!component.attributes || !RX_VIDEO.test(component.attributes.mp4)) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidVideoFile,
                    description,
                    pageIdx + 1
                )
            });
        }
        // Note: we are not testing for an ogv or wbem file
        return ret;
    }
});

/**
 * Registration
 */
tools.register(Video);
