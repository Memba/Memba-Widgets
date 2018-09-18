/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * @class ImageSet tool
 * @type {void|*}
 */
var IMAGESET = '<div data-#= ns #role="imageset" data-#= ns #images="#: data$() #" style="#: attributes.style #" {0}></div>';
var ImageSet = Tool.extend({
    id: 'imageset',
    icon: 'photos',
    description: i18n.imageset.description,
    cursor: CURSOR_CROSSHAIR,
    weight: 1,
    templates: {
        design: kendo.format(IMAGESET, 'data-#= ns #enabled="false"'),
        play: kendo.format(IMAGESET, 'data-#= ns #bind="value: #: properties.name #.value"'),
        review: kendo.format(IMAGESET, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enabled="false"') + Tool.fn.showResult()
    },
    height: 250,
    width: 250,
    attributes: {
        // shuffle: new adapters.BooleanAdapter({ title: i18n.quiz.attributes.shuffle.title }),
        style: new adapters.StyleAdapter({ title: i18n.imageset.attributes.style.title }),
        data: new adapters.ImageListBuilderAdapter({ title: i18n.imageset.attributes.data.title, defaultValue: i18n.imageset.attributes.data.defaultValue })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.imageset.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.imageset.properties.question.title }),
        solution: new adapters.QuizSolutionAdapter({ title: i18n.imageset.properties.solution.title }),
        validation: new adapters.ValidationAdapter({ title: i18n.imageset.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.imageset.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.imageset.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.imageset.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(ImageSet, that, assert.format(assert.messages.instanceof.default, 'this', 'ImageSet'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
        var template = kendo.template(that.templates[mode]);
        // The data$ function resolves urls with schemes like cdn://sample.jpg
        component.data$ = function () {
            var data = component.attributes.get('data');
            var clone = [];
            var schemes = assets.image.schemes;
            for (var i = 0, length = data.length; i < length; i++) {
                var item = {
                    text: data[i].text,
                    image: ''
                };
                for (var scheme in schemes) {
                    if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(data[i].image)) {
                        item.image = data[i].image.replace(scheme + '://', schemes[scheme]);
                        break;
                    }
                }
                clone.push(item);
            }
            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ' ' + JSON.stringify(clone);
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
        /* jshint maxcomplexity: 8 */
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('div' + kendo.roleSelector('imageset'));
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
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
        /* jshint maxcomplexity: 8 */
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            !component.attributes.data ||
            !RX_DATA.test(component.attributes.data)) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidData, description, pageIdx + 1)
            });
        }
        // TODO: Check that solution matches one of the data
        return ret;
    }

    /* jshint +W074 */

});
tools.register(ImageSet);
