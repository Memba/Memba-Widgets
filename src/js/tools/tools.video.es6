/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Video tool
 * @class Video
 */
var Video = Tool.extend({
    id: 'video',
    icon: 'movie',
    description: i18n.video.description,
    cursor: CURSOR_CROSSHAIR,
    templates: {
        default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="video" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: files$() #" data-#= ns #toolbar-height="#: attributes.toolbarHeight #"></div>'
    },
    height: 300,
    width: 600,
    attributes: {
        autoplay: new adapters.BooleanAdapter({ title: 'Autoplay', defaultValue: false }),
        toolbarHeight: new adapters.NumberAdapter({ title: 'Toolbar Height', defaultValue: 48 }),
        mp4: new adapters.AssetAdapter({ title: 'MP4 File' }),
        ogv: new adapters.AssetAdapter({ title: 'OGV File' }),
        wbem: new adapters.AssetAdapter({ title: 'WBEM File' })
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
        assert.instanceof(Video, that, assert.format(assert.messages.instanceof.default, 'this', 'Video'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        assert.instanceof(ToolAssets, assets.video, assert.format(assert.messages.instanceof.default, 'assets.video', 'kidoju.ToolAssets'));
        var template = kendo.template(this.templates.default);

        /* This function's cyclomatic complexity is too high. */
        /* jshint -W074 */

        // The files$ function resolves urls with schemes like cdn://video.mp4 and returns a stringified array
        component.files$ = function () {
            var mp4 = component.attributes.get('mp4');
            var ogv = component.attributes.get('ogv');
            var wbem = component.attributes.get('wbem');
            var schemes = assets.video.schemes;
            for (var scheme in schemes) {
                if (Object.prototype.hasOwnProperty.call(schemes, scheme)) {
                    var schemeRx = new RegExp('^' + scheme + '://');
                    if (schemeRx.test(mp4)) {
                        mp4 = mp4.replace(scheme + '://', schemes[scheme]);
                    }
                    if (schemeRx.test(ogv)) {
                        ogv = ogv.replace(scheme + '://', schemes[scheme]);
                    }
                    if (schemeRx.test(wbem)) {
                        wbem = wbem.replace(scheme + '://', schemes[scheme]);
                    }
                }
            }
            var files = [];
            if (RX_HTTP_S.test(mp4)) {
                files.push(mp4);
            }
            if (RX_HTTP_S.test(ogv)) {
                files.push(ogv);
            }
            if (RX_HTTP_S.test(wbem)) {
                files.push(wbem);
            }

            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ' ' + JSON.stringify(files);
        };

        /* jshint +W074 */

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
        assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('div' + kendo.roleSelector('mediaplayer'));
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width')  - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        var widget = content.data('kendoMediaPlayer');
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
    validate: function (component, pageIdx) {
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            !RX_VIDEO.test(component.attributes.mp4)) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidVideoFile, description, pageIdx + 1)
            });
        }
        // Note: we are not testing for an ogv or wbem file
        return ret;
    }

});
tools.register(Video);

