/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


/**
 * @class Image tool
 * @type {void|*}
 */
var Image = Tool.extend({
    id: 'image',
    icon: 'painting_landscape',
    description: i18n.image.description,
    cursor: CURSOR_CROSSHAIR,
    templates: {
        default: '<img src="#: src$() #" alt="#: attributes.alt #" class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #">'
    },
    height: 250,
    width: 250,
    attributes: {
        alt: new adapters.StringAdapter({ title: i18n.image.attributes.alt.title, defaultValue: i18n.image.attributes.alt.defaultValue }),
        src: new adapters.AssetAdapter({ title: i18n.image.attributes.src.title, defaultValue: i18n.image.attributes.src.defaultValue }),
        style: new adapters.StyleAdapter({ title: i18n.image.attributes.style.title })
    },
    properties: {
        behavior: new adapters.EnumAdapter(
            {
                title: i18n.image.properties.behavior.title,
                defaultValue: 'none',
                enum: ['none', 'draggable', 'selectable']
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new adapters.StringAdapter({ title: i18n.image.properties.constant.title })
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
        assert.instanceof(Image, that, assert.format(assert.messages.instanceof.default, 'this', 'Image'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
        var template = kendo.template(that.templates.default);
        // The class$ function adds the kj-interactive class to draggable components
        component.class$ = function () {
            return 'kj-image' + (component.properties.behavior === 'draggable' ? ' ' + INTERACTIVE_CLASS : '');
        };
        // The id$ function returns the component id for components that have a behavior
        component.id$ = function () {
            return (component.properties.behavior !== 'none' && $.type(component.id) === STRING && component.id.length) ? component.id : '';
        };
        // The src$ function resolves urls with schemes like cdn://sample.jpg
        component.src$ = function () {
            var src = component.attributes.get('src');
            var schemes = assets.image.schemes;
            for (var scheme in schemes) {
                if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(src)) {
                    src = src.replace(scheme + '://', schemes[scheme]);
                    break;
                }
            }
            return src;
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
        assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('img');
        // Assuming we can get the natural size of the image, we shall keep proportions
        var naturalHeight = content[0].naturalHeight;
        var naturalWidth = content[0].naturalWidth;
        if (naturalHeight && naturalWidth) {
            var height = component.get('height');
            var width = component.get('width');
            var rectLimitedByHeight = {
                height: Math.round(height),
                width: Math.round(height * naturalWidth / naturalHeight)
            };
            /*
             // Note: comparing rectLimitedByHeight and rectLimitedByWidth does not work because
             // we are using the component size and not the mouse position
             // therefore, we can only reduce the size proportionnaly, not increase it
             var rectLimitedByWidth = {
             height: Math.round(width * naturalHeight / naturalWidth),
             width: Math.round(width)
             };
             // if (rectLimitedByHeight.height * rectLimitedByHeight.width <= rectLimitedByWidth.height * rectLimitedByWidth.width) {
             if (rectLimitedByHeight.width <= width) {
             */
            if (height !== rectLimitedByHeight.height) { // avoids a stack overflow
                component.set('height', rectLimitedByHeight.height);
            }
            if (width !== rectLimitedByHeight.width) { // avoids a stack overflow
                component.set('width', rectLimitedByHeight.width);
            }
            /*
             } else if(rectLimitedByWidth.height <= height) {
             if (height !== rectLimitedByWidth.height) {
             component.set('height', rectLimitedByWidth.height);
             }
             if (width !== rectLimitedByWidth.width) {
             component.set('width', rectLimitedByWidth.width);
             }
             }
             */
        }
        // Set content size
        content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /* This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate: function (component, pageIdx) {
        /* jshint maxcomplexity: 12 */
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            !component.attributes.alt ||
            (component.attributes.alt === i18n.image.attributes.alt.defaultValue) ||
            !RX_TEXT.test(component.attributes.alt)) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidAltText, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            !component.attributes.src ||
            (component.attributes.src === i18n.image.attributes.src.defaultValue) ||
            !RX_IMAGE.test(component.attributes.src)) {
            ret.push({
                type: (component.attributes.src === i18n.image.attributes.src.defaultValue) ? WARNING : ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidImageFile, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO: We should also check that there is a dropZone/Selector on the page if draggable/selectable
        return ret;
    }

    /* jshint +W074 */

});
tools.register(Image);
