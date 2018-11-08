/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false, require: false */


(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './window.pongodb',
        './app.constants'
    ], f);
})(function () {

    'use strict';

    var app = window.app = window.app || {};

    // Fix startsWith and https://github.com/kidoju/Kidoju-Mobile/issues/189
    // See https://stackoverflow.com/questions/33106114/cordova-javascript-error-has-no-method-startswith-android
    if (typeof String.prototype.startsWith !== 'function') {
        String.prototype.startsWith = function (str) {
            return this.indexOf(str) === 0;
        };
    }

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var pongodb = window.pongodb;
        var assert = window.assert;
        var logger = new window.Logger('app.db');
        var constants = app.constants;
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var LEVEL_CHARS = 4;
        var RX_ZEROS = new RegExp ('0{' + LEVEL_CHARS + '}', 'g');
        var ROOT_CATEGORY_ID = {
            en: (constants.rootCategoryId.en || '').replace(RX_ZEROS, ''),
            fr: (constants.rootCategoryId.fr || '').replace(RX_ZEROS, '')
        };
        var DB_NAME = 'KidojuDB';
        var COLLECTION = {
            ACTIVITIES: 'activities',
            SUMMARIES: 'summaries',
            USERS: 'users',
            VERSIONS: 'versions'
        };
        var TRIGGER = {
            INSERT: 'insert',
            UPDATE: 'update',
            REMOVE: 'remove'
        };

        /**
         * Database definition
         */
        var db = app.db = new pongodb.Database({
            name: DB_NAME,
            size: 10 * 1024 * 1024,
            collections: [COLLECTION.ACTIVITIES, COLLECTION.SUMMARIES, COLLECTION.USERS, COLLECTION.VERSIONS]
        });

        /**
         * Full-text indexes
         */
        db.addFullTextIndex(COLLECTION.SUMMARIES, ['author.lastName', 'description', 'tags', 'title']);

        /**
         * Trigger to create/update version from activity
         */
        db.createTrigger(COLLECTION.ACTIVITIES, [TRIGGER.INSERT, TRIGGER.UPDATE], function (activity) {
            var dfd = new $.Deferred();
            var language = activity.version.language;
            var activityId = activity.id;
            var summaryId = activity.version.summaryId;
            var versionId = activity.version.versionId;

            logger.debug({
                message: 'Executing trigger on activity to upsert version',
                method: 'db.createTrigger',
                data: { collection: COLLECTION.ACTIVITIES, triggers: [TRIGGER.INSERT, TRIGGER.UPDATE], id: activityId }
            });

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            function upsert(activity, version, deferred) {
                /* jshint maxcomplexity: 11 */
                if ((activity.type === 'Score' && version.type === 'Test') &&
                    ($.type(constants.authorId) === UNDEFINED || constants.authorId === version.userId) &&
                    ($.type(constants.language) === UNDEFINED || constants.language === language) &&
                    ($.type(constants.rootCategoryId[language]) === UNDEFINED || version.categoryId.startsWith(ROOT_CATEGORY_ID[language]))) {
                    // The activity belongs here
                    version.activities = version.activities || []; // We need an array considering we possibly have several users
                    var found;
                    for (var i = 0, length = version.activities.length; i < length; i++) {
                        if (version.activities[i].actorId === activity.actor.userId) {
                            found = i; // There is already an activity for the current user
                        }
                    }
                    var update = true;
                    if ($.type(found) === NUMBER && new Date(version.activities[found].date) > activity.date) {
                        // Keep existing version activity which is more recent
                        update = false;
                    } else if ($.type(found) === NUMBER) {
                        // Update version activity
                        version.activities[found] = { activityId: activity.id, actorId: activity.actor.userId, score: activity.score, date: activity.date };
                    } else {
                        // Create new version activity
                        version.activities.push({ activityId: activity.id, actorId: activity.actor.userId, score: activity.score, date: activity.date });
                    }
                    if (update) {
                        app.db.versions.update({ id: versionId }, version, { upsert: true }).done(deferred.resolve).fail(deferred.reject);
                    } else {
                        deferred.resolve(version);
                    }
                } else {
                    // window.alert('Warning! activity is being removed!');
                    // The activity (especially from synchronization does not belong here)
                    app.db.activities.remove({ id: activityId }).done(function () { deferred.resolve(version); }).fail(deferred.reject);
                    logger.debug({
                        message: 'Removing activity in local database trigger',
                        method: 'db.createTrigger',
                        data: { collection: COLLECTION.ACTIVITIES, triggers: [TRIGGER.INSERT, TRIGGER.UPDATE], id: activityId }
                    });
                }
            }

            /* jshint +W074 */

            if (('Connection' in window && window.navigator.connection.type === window.Connection.NONE) ||
                (window.device && window.device.platform === 'browser' && !window.navigator.onLine)) {
                app.db.versions.findOne({ id: versionId })
                .done(function (local) {
                    upsert(activity, local, dfd);
                })
                .fail(function (err) {
                    dfd.reject(err);
                });
            } else {
                var versions = app.rapi.v2.versions({ language: language, summaryId: summaryId });
                versions.get(versionId)
                .done(function (remote) {
                    app.db.versions.findOne({ id: versionId })
                    .done(function (local) {
                        var version = $.extend(remote, local);
                        upsert(activity, version, dfd);
                    })
                    .fail(function (err) {
                        // Not found
                        upsert(activity, remote, dfd);
                    });
                })
                .fail(dfd.reject);
            }
            return dfd.promise();
        });

        /**
         * Trigger to create/update summary from version
         */
        db.createTrigger(COLLECTION.VERSIONS, [TRIGGER.INSERT, TRIGGER.UPDATE], function (version) {
            var dfd = new $.Deferred();
            var language = version.language;
            var summaryId = version.summaryId;
            var versionId = version.id;

            logger.debug({
                message: 'Executing trigger on version to upsert summary',
                method: 'db.createTrigger',
                data: { collection: COLLECTION.VERSIONS, triggers: [TRIGGER.INSERT, TRIGGER.UPDATE], id: versionId }
            });

            if (('Connection' in window && window.navigator.connection.type === window.Connection.NONE) ||
                (window.device && window.device.platform === 'browser' && !window.navigator.onLine)) {
                // Update local summary
                app.db.summaries.update({ id: summaryId }, { activities: version.activities }).done(dfd.resolve).fail(dfd.reject);
            } else {
                // Get remote summary
                var summaries = app.rapi.v2.summaries({ language: language, type: 'Test' });
                summaries.get(summaryId)
                .done(function (summary) {
                    // Propagate activities from version to summary
                    if (Array.isArray(version.activities)) {
                        summary.activities = version.activities;
                    }
                    app.db.summaries.update({ id: summaryId }, summary, { upsert: true }).done(dfd.resolve).fail(dfd.reject);
                }).fail(dfd.reject);
            }
            return dfd.promise();
        });

        // TODO We could also use a trigger to create/update/remove MobileUser picture

        /**
         * Migration to v0.3.4 (initial)
         */
        db.upgrade.push(new pongodb.Migration({
            version: '0.3.4',
            scripts: [
                function (db) {
                    logger.info({
                        method: 'db.upgrade.push',
                        message: 'Migrating database to ' + db._version
                    });
                    // Basically this first script initializes the database to version 0.3.4
                    // return $.Deferred().notify({ version: db._version, pass: 1, percent: 1 }).reject(new Error('oops')).promise();
                    return $.Deferred().notify({ version: db._version, pass: 1, percent: 1 }).resolve().promise();
                }
            ]
        }));

    }(window.jQuery));

    /* jshint +W071 */

    return app;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
