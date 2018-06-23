/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './models.base.es6';

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
            type: CONSTANTS.STRING,
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
        offline: {
            // Used in Kidoju-Mobile only
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
        userScore: {
            // Used in Kidoju-Mobile only
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
    authorName$() {
        return `${(this.get('firstName') || '').trim()} ${(
            this.get('lastName') || ''
        ).trim()}`.trim();
    },
    authorUri$() {
        return format(
            uris.webapp.user,
            this.get('language'),
            this.get('userId')
        );
    },
    hasUserScore$() {
        // Used in Kidoju-Mobile only
        return $.type(this.get('userScore')) === CONSTANTS.NUMBER;
    },
    icon$() {
        return format(
            window.cordova ? uris.mobile.icons : uris.cdn.icons,
            this.get('icon')
        );
    },
    isError$() {
        // Used in Kidoju-Mobile only
        const userScore = this.get('userScore');
        // Note: we need to test the value type because comparing a null to a number is always true
        return $.type(userScore) === CONSTANTS.NUMBER && userScore < 50;
    },
    isSuccess$() {
        // Used in Kidoju-Mobile only
        const userScore = this.get('userScore');
        return $.type(userScore) === CONSTANTS.NUMBER && userScore >= 75;
    },
    isWarning$() {
        // Used in Kidoju-Mobile only
        const userScore = this.get('userScore');
        return (
            $.type(userScore) === CONSTANTS.NUMBER && userScore >= 50 && userScore < 75
        );
    },
    summaryUri$() {
        // TODO test window.cordova or uris.webapp to build a mobile URI
        return format(
            uris.webapp.summary,
            this.get('language'),
            this.get('id')
        );
    },
    tags$() {
        let ret = [];
        const tags = this.get('tags');
        // In kendo.mobile.ui.ListView, tags are a kendo.data.ObservableArray when the list is built
        // but tags are an array when redrawing the list after scrolling back (up then down)
        // @see https://github.com/kidoju/Kidoju-Mobile/issues/147
        if (Array.isArray(tags) || tags instanceof ObservableArray) {
            ret = tags.map(tag => ({
                name: tag,
                hash:
                    HASHBANG +
                    $.param({
                        filter: { field: 'tags', operator: 'eq', value: tag }
                    })
            }));
        }
        return ret;
    },
    userScore$() {
        // Used in Kidoju-Mobile only
        return toString(this.get('userScore') / 100, 'p0');
    },
    createDraft() {
        return rapi.v1.content.executeCommand(
            this.get('language'),
            this.get('id'),
            { command: 'draft' }
        );
    },
    publish() {
        // TODO: check state to avoid a call if not necessary
        return rapi.v1.content.executeCommand(
            this.get('language'),
            this.get('id'),
            { command: 'publish' }
        );
    }
});

/**
 * Default export
 */
export default LazySummary;
