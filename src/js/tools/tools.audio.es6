/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert';
import CONSTANTS from '../common/window.constants';
import tools from './tools';

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).audio || {
            // TODO
        }
    );
}

/**
 * Audio tool
 * @class Audio
 */
var Audio = BaseTool.extend({
    id: 'audio',
    icon: 'loudspeaker3',
    description: i18n.audio.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="audio" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: files$() #"></div>'
    },
    height: 100,
    width: 400,
    attributes: {
        autoplay: new adapters.BooleanAdapter({ title: i18n.audio.attributes.autoplay.title, defaultValue: false }),
        mp3: new adapters.AssetAdapter({ title: i18n.audio.attributes.mp3.title }),
        ogg: new adapters.AssetAdapter({ title: i18n.audio.attributes.ogg.title })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent: function (component, mode) {
        var that = this;
        assert.instanceof(Audio, that, assert.format(assert.messages.instanceof.default, 'this', 'Audio'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        assert.instanceof(ToolAssets, utilAssets.audio, assert.format(assert.messages.instanceof.default, 'assets.audio', 'kidoju.ToolAssets'));
        var template = kendo.template(that.templates.default);
        // The files$ function resolves urls with schemes like cdn://audio.mp3 and returns a stringified array
        component.files$ = function () {
            var mp3 = component.attributes.get('mp3');
            var ogg = component.attributes.get('ogg');
            var schemes = utilAssets.audio.schemes;
            for (var scheme in schemes) {
                if (Object.prototype.hasOwnProperty.call(schemes, scheme)) {
                    var schemeRx = new RegExp('^' + scheme + '://');
                    if (schemeRx.test(mp3)) {
                        mp3 = mp3.replace(scheme + '://', schemes[scheme]);
                    }
                    if (schemeRx.test(ogg)) {
                        ogg = ogg.replace(scheme + '://', schemes[scheme]);
                    }
                }
            }
            var files = [];
            if (RX_HTTP_S.test(mp3)) {
                files.push(mp3);
            }
            if (RX_HTTP_S.test(ogg)) {
                files.push(ogg);
            }
            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ' ' + JSON.stringify(files);
        };
        return template($.extend(component, { ns: kendo.ns }));
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('div' + kendo.roleSelector('mediaplayer'));
        var widget = content.data('kendoMediaPlayer');
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
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
    validate: function (component, pageIdx) {
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            !RX_AUDIO.test(component.attributes.mp3)) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidAudioFile, description, pageIdx + 1)
            });
        }
        // Note: we are not testing for an ogg file
        return ret;
    }

});

/**
 * Registration
 */
tools.register(Audio);
