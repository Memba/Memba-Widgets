/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.data';
import BaseModel from './kidoju.models.base.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    data: { ObservableArray },
    format,
    toString
} = window.kendo;

// TODO uris
// TODO rapi

/**
 * Lazy summary model (for lazy loading in lists)
 * @type {kidoju.data.Model}
 */
const LazySummary = BaseModel.define({
    id: CONSTANTS.ID, // the identifier of the model, which is required for isNew() to work
    fields: {
        id: {
            type: CONSTANTS.,
            editable: false,
            nullable: true
        },
        comments: {
            type: CONSTANTS.NUMBER,
            editable: false
        },
        created: {
            type: CONSTANTS.DATE,
            editable: false
        },
        firstName: {
            type: CONSTANTS.STRING,
            editable: false
        },
        language: {
            type: CONSTANTS.STRING,
            editable: false
        },
        lastName: {
            type: CONSTANTS.STRING,
            editable: false
        },
        icon: {
            type: CONSTANTS.STRING,
            editable: false
        },
        offline: { // Used in Kidoju-Mobile only
            type: CONSTANTS.BOOLEAN,
            editable: false
        },
        published: {
            type: CONSTANTS.DATE,
            nullable: true,
            editable: false
        },
        ratings: {
            type: CONSTANTS.NUMBER,
            nullable: true,
            editable: false
        },
        scores: {
            type: CONSTANTS.NUMBER,
            nullable: true,
            editable: false
        },
        tags: {
            // type: Array
            defaultValue: [],
            editable: false
        },
        title: {
            type: CONSTANTS.STRING,
            editable: false
        },
        type: {
            type: CONSTANTS.STRING,
            editable: false
        },
        updated: {
            type: CONSTANTS.DATE,
            editable: false
        },
        userId: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        },
        userScore: { // Used in Kidoju-Mobile only
            type: CONSTANTS.NUMBER,
            nullable: true,
            editable: false
        },
        views: {
            type: CONSTANTS.NUMBER,
            defaultValue: 0,
            editable: false
        }
    },
    authorName$: function () {
        return ((this.get('firstName') || '').trim() + ' ' + (this.get('lastName') || '').trim()).trim();
    },
    authorUri$: function () {
        return format(uris.webapp.user, this.get('language'), this.get('userId'));
    },
    hasUserScore$: function () { // Used in Kidoju-Mobile only
        return $.type(this.get('userScore')) === CONSTANTS.NUMBER;
    },
    icon$: function () {
        return format(window.cordova ? uris.mobile.icons : uris.cdn.icons, this.get('icon'));
    },
    isError$: function () { // Used in Kidoju-Mobile only
        var userScore = this.get('userScore');
        // Note: we need to test the value type because comparing a null to a number is always true
        return ($.type(userScore) === CONSTANTS.NUMBER) && userScore < 50;
    },
    isSuccess$: function () { // Used in Kidoju-Mobile only
        var userScore = this.get('userScore');
        return ($.type(userScore) === CONSTANTS.NUMBER) && userScore >= 75;
    },
    isWarning$: function () { // Used in Kidoju-Mobile only
        var userScore = this.get('userScore');
        return ($.type(userScore) === NUMBER) && userScore >= 50 && userScore < 75;
    },
    summaryUri$: function () {
        // TODO test window.cordova or uris.webapp to build a mobile URI
        return format(uris.webapp.summary, this.get('language'), this.get('id'));
    },
    tags$: function () {
        var ret = [];
        var tags = this.get('tags');
        // In kendo.mobile.ui.ListView, tags are a kendo.data.ObservableArray when the list is built
        // but tags are an array when redrawing the list after scrolling back (up then down)
        // @see https://github.com/kidoju/Kidoju-Mobile/issues/147
        if (Array.isArray(tags) || tags instanceof ObservableArray) {
            ret = tags.map(function (tag) {
                return {
                    name: tag,
                    hash: HASHBANG + $.param({ filter: { field: 'tags', operator: 'eq', value: tag } })
                };
            });
        }
        return ret;
    },
    userScore$: function () { // Used in Kidoju-Mobile only
        return kendo.toString(this.get('userScore') / 100, 'p0');
    },
    createDraft: function () {
        return rapi.v1.content.executeCommand(this.get('language'), this.get('id'), { command: 'draft' });
    },
    publish: function () {
        // TODO: check state to avoid a call if not necessary
        return rapi.v1.content.executeCommand(this.get('language'), this.get('id'), { command: 'publish' });
    }
});

/**
 * Default export
 */
export default LazySummary;
