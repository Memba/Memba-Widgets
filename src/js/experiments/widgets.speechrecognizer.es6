/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.tooltip';
// TODO import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// TODO: import Logger from '../common/.logger.es6';

const { destroy } = window.kendo;
const { plugin, Widget } = window.kendo.ui;
const NS = '.kendoSpeechRecognizer';

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

// https://www.google.com/intl/en/chrome/assets/common/images/content/mic.gif
const MIC_STATIC =
    'data:image/gif;base64,R0lGODlhMgAyAPUxAJqampubm5ycnJ2dnZ6enp+fn6CgoKSkpKWlpaampqurq62tra+vr7KysrS0tLW1tbe3t7i4uLm5ucTExMXFxcbGxsfHx8zMzM3Nzc7Ozs/Pz9jY2NnZ2dzc3N3d3d7e3t/f3+Pj4+bm5ujo6Orq6uzs7PLy8vPz8/T09PX19fb29vf39/r6+vv7+/z8/P39/f7+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAsAAAAADIAMgAABunAmHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TD66RiNXGckxAAAGzroYetsBofmwcX839EIFfQAFgDGDb4aIAYqDjICLjX2PepGQjmQpHyBDAYMDQyAfKV4iAAEvQgqDC0IvniJeKG8kQhmDGkIkbyhfCwATQjARdxIwQhMArV8cAAIloRUVnEIlAgAbYDAMAAfQRyUHAAzHYCcJzhYtRC0W1wgmYysPbwQQFBQQBG8OKmUwGNz0MXCh3BoWHiS8kdCBhSEhH958eDgkIoCJFGNYxEhxY8aPIEOKHEmypMmTKK8EAQA7';

// https://www.google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif
const MIC_ANIMATED =
    'data:image/gif;base64,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WDCLVKBZDKa4qtOLwTFcZ44xGCaszDBkzapEWxCs2pBjC3p5G9JrVbogsxaMihcA1YJM3z49WPRtUp9vhybEafZLz4Rdckr9YpOhSaNAWT5uqCWwzJEbCUb0cuXjFYx/QxcE8xGM6tewYwcEACH5BAUIAAAALAwADAAaABoAAAiwADMIHEiwoMGDCDO8IkXqVcKHp2C1MgUAgKlWsE49JAhhyoSKIEFOmAJhI6tVIVOCXMUqIatSKmMCKNXSIASUMmOuKllwSs6cUwqe+vgz5gSNA2EVzQmLoKulMl0RTAU1ZiqCqKqqRIVVa0quA6l6BXl14NOxFaUmRVux6cChaI/2RBu04E2vOw++rErTJc6fLDd2JKpyJM+NGSK6UlVRlauMiA+CqQgmcsLJACo/DAgAIfkEBQgAAAAsDgAOABYAFgAACJ4AMwgcKNDQIQAADhkiyLAhIoQQASBqSPGJn4gI/TyhSLCODIwQZdThmMENSJBuKNY5eXIkwScfWWKUsXHgDZknbwxc4wQnSCdrBKbxeTKNQEBEQQIS+Ccpxj8C0TiNiEagmqkQ1Qzkg3UQQTZYAxFUBMdpHEUME70hiocRxUJzcMohRFJRGz0g99hBS1LgIkF0ENLps6hvQzAIwZAMCAAh+QQFCAAAACwPABAAFAATAAAIhAAzCBwYCYDBg5EGKlS4Y9PBg5t2LFTYydPDh546TczQScPFixo0MrT48aIniQNxlCyJYyAEUSs/ioIgMFTMkqEEnrj58USGS5x4XuR0CZTQj6AsHb1oKcOnpQY/CTQEFQCmg5CWZn34SKijkpQMNno4FoCkmKMOfTxUSaimSQYnZSoZEAAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAIf8LSW1hZ2VNYWdpY2sNZ2FtbWE9MC40NTQ1NQAh/wtJbWFnZU1hZ2ljaw1nYW1tYT0wLjQ1NDU1ACH/C0ltYWdlTWFnaWNrDWdhbW1hPTAuNDU0NTUAOw==';

// https://www.google.com/intl/en/chrome/assets/common/images/content/mic-slash.gif
const MIC_ERROR =
    'data:image/gif;base64,R0lGODlhMgAyAMZgAPsDQ/oERPsFRPkGRfsGRfoHRvcJRvsIR/sJR/sKSPsLSfsNSvsQTfsTT/sdVuIqWvwjW9w0X/wyZtQ/ZuQ7Z/w1addCaMtObuJNdMFdd/xOe8RgesVhe8ZifPxUf9Vxi6x+iv1ojqSLkaSMkv10l+p9maqSmJmZmZqamq2Vm5ubm5ycnJ2dneqGn/2BoZ6enp+fn6CgoKGhoaKioqOjo6SkpKWlpaampqenp6mpqf2QrKqqqqurq6ysrK2tra6urv2Zs7GxsbOzs7W1tba2trm5ubq6ury8vL29vb6+vr+/v/6twsDAwMHBwcbGxsrKys7Ozv7A0NHR0dLS0tPT09TU1P7O2tra2t7e3t/f3+Dg4OLi4uTk5OXl5efn5//m7f///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH5BAEUAH8ALAAAAAAyADIAAAf+gH+Cg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goZhfVl+ijFEOABqnXk9JU4Y6DQAADKJSMDMxNTiEUQq1CCShXjArKiorND2Cs7UKUaJONCso1yovXlG0AA06p0gyKtfXMCXB3tLhMtYoyhsEtQ3r7OQoIBEDtQngp4LiyIl4UItAhSX/BgVEMaFWgBYJCYkbMSEAgAEbsERUaCJCLQMZXmjc+AeJhVoDMpyAMVLUFCRX/nzBUAtABnNZBDk54uWTEiFI/oSoeeHaihWDWPjQ8olKjh1AanZItgIHE0FdYMQIxYJDgVohgryAweKqICU5goT6sA+AB1OFXlr+yfJCRsxPQBbUomDKEJYYN4iAclFLgIUUNqAQ4qIEBQ4fn74MBbulh40bK2rkGJcjRpHIHmqG6AvlBwoWLGDAEHK3U5QKNV0YyipjSKgoEGodAIIoBg0loLjVYsAbkYwaQT8RVqdIBQ8jwSVA8JeoCZIqJLNr3869u/fv4MOLH78pEAA7';

/**
 * SpeechRecognizer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/SpeechRecognition
 * @see https://hacks.mozilla.org/2016/01/firefox-and-the-web-speech-api/
 * @see https://w3c.github.io/speech-api/speechapi.html#examples
 * @see https://www.google.com/intl/en/chrome/demos/speech.html
 */
const SpeechRecognizer = Widget.extend({
    /**
     * Constructor
     * @constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        this.wrapper = this.element;
        this._initSpeechRecognition();
        this._render();
        this.enable(this.options.enable);
        // this.value(this.options.value);
    },

    /**
     * Events
     * @field
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @field
     */
    options: {
        name: 'SpeechRecognizer',
        enable: true,
        locale: 'en-US',
        messages: {
            alt: 'Microphone',
            denied: 'Denied',
            noEvent: 'No event triggered',
            noMicrophone: 'No microphone',
            noSpeech: 'No speech',
            speakNow: 'Speak now!',
            unknown: 'Unknown error',
            upgrade: 'Upgrade your browser'
        },
        multiline: true,
        value: ''
    },

    /**
     * Value
     * Note: get/set won't work
     * @method
     * @param value
     */
    value() {
        return this._value;
    },

    /**
     * Initialize speech recognition
     * @method
     * @private
     */
    _initSpeechRecognition() {
        if ($.isFunction(SpeechRecognition)) {
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interim = true;
            // this.speechRecognition.grammars = this.options.grammars;
            this.speechRecognition.lang = this.options.locale;
            this.speechRecognition.onstart = this._onStart.bind(this);
            this.speechRecognition.onerror = this._onError.bind(this);
            this.speechRecognition.onresult = this._onResult.bind(this);
            this.speechRecognition.onend = this._onEnd.bind(this);
        } else {
            // Microsoft Edge
        }
    },

    /**
     * Render the widget
     * @method
     * @private
     */
    _render() {
        this.element.css({ display: 'flex' });
        this.textarea = $(
            this.options.multiline
                ? '<textarea style="resize: none;"/>'
                : '<input type="text">'
        )
            .addClass('k-textbox')
            .width('100%')
            .appendTo(this.element);
        this.image = $('<img>')
            .height(50)
            .width(50)
            .attr({
                alt: this.options.messages.alt,
                role: 'button',
                src: MIC_STATIC,
                tabindex: 0,
                title: 'Please speak' // TODO
            })
            .css({ outline: 'none' })
            .prop({ ariaPressed: false })
            .appendTo(this.element);
        this.tooltip = this.element
            .kendoTooltip({
                // autoHide: true,
                // height: "300px",
                // width: "500px"
                position: 'left',
                showOn: 'click'
            })
            .data('kendoTooltip');
    },

    /**
     * Enable/disable the widget
     * @method
     * @param enable
     */
    enable(enable) {
        const isEnabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        this.image.off(NS);
        if ($.isFunction(this._refreshHandler)) {
            this.unbind(CONSTANTS.CHANGE, this._refreshHandler);
        }
        if (isEnabled) {
            this.image.on(CONSTANTS.CLICK + NS, this._onClick.bind(this));
            this._refreshHandler = this.refresh.bind(this);
            this.bind(CONSTANTS.CHANGE, this._refreshHandler);
        }
    },

    /**
     * Refresh
     * @method
     */
    refresh() {
        this.textarea.val(this._value || '');
    },

    /**
     * Display tooltip
     * @method
     * @param text
     */
    showInfo(text) {
        this.image.attr('title', text);
        this.tooltip.show(this.image);
    },

    /**
     * Click event handler
     * @method
     * @private
     */
    _onClick() {
        if (
            this._recognizing &&
            $.isFunction(SpeechRecognition) &&
            this.speechRecognition instanceof SpeechRecognition
        ) {
            this.speechRecognition.stop();
        } else if (
            $.isFunction(SpeechRecognition) &&
            this.speechRecognition instanceof SpeechRecognition
        ) {
            this.speechRecognition.start();
            setTimeout(() => {
                // This is for Opera which only has placeholders for webkitSpeechRecognition which do not trigger events
                if (!this._recognizing) {
                    this.speechRecognition.stop();
                    this._onError({ error: 'no-event' });
                }
            }, 250);
        } else {
            // This is for Microsoft Edge and other browsers that do not implement SpeechRecognition
            this._onError({ error: 'no-speech' });
        }
    },

    /**
     * Start event handler
     * @method
     * @private
     */
    _onStart() {
        this._recognizing = true;
        this.image.prop({ ariaPressed: true }).attr({ src: MIC_ANIMATED });
        this.showInfo(this.options.messages.speakNow);
        this._value = '';
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Error event handler
     * @method
     * @param e
     * @private
     */
    _onError(e) {
        this._recognizing = false;
        this._errored = true;
        this.image.prop({ ariaPressed: false }).attr({ src: MIC_ERROR });
        switch (e.error) {
            case 'no-speech':
                this.showInfo(this.options.messages.noSpeech);
                break;
            case 'audio-capture':
                this.showInfo(this.options.messages.noMicrophone);
                break;
            case 'not-allowed':
                this.showInfo(this.options.messages.denied);
                break;
            case 'no-event': // Custom for Opera
                this.showInfo(this.options.messages.noEvent);
                break;
            default:
                this.showInfo(this.options.messages.unknown);
                break;
        }
    },

    /**
     * Result event handler
     * @method
     * @param e
     * @private
     */
    _onResult(e) {
        if ($.type(e.results) === CONSTANTS.UNDEFINED) {
            this.speechRecognition.onend = null;
            this.speechRecognition.stop();
            this._errored = true;
            this.image.prop({ ariaPressed: false }).attr({ src: MIC_ERROR });
            this.showInfo(this.options.messages.upgrade);
            return;
        }
        for (let i = e.resultIndex; i < e.results.length; i++) {
            this._value += e.results[i][0].transcript;
        }
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * End event handler
     * @method
     * @private
     */
    _onEnd() {
        this._recognizing = false;
        if (this._errored) {
            this._errored = undefined;
            return;
        }
        this.image.prop({ ariaPressed: false }).attr({ src: MIC_STATIC });
    },

    /**
     * Destroy
     * @method
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(SpeechRecognizer);
