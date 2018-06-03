/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, expr: true, mocha: true */

'use strict';

(function () {

    // Only use for PHANTOMJS
    if (!window.PHANTOMJS) {
        return;
    }

    console.log('Mocking HTML 5 File API for PhantomJS');

    try {
        // We need a try catch block because if they exist, they are readonly (for debugging in Chrome)
        window.TEMPORARY = 0;
        window.PERSISTENT = 1;
    } catch (ex) {}

    var path = {
        join: function () {
            var ret = '';
            // var args = Array.prototype.slice.call(arguments);
            for (var i = 0; i < arguments.length; i++) {
                ret += '/' + arguments[i];
            }
            return ret.replace(/[\/]+/, '/').replace(/\/$/, '');
        }
    };

    window.FileSystem = function (type, size) {
        this._type = type;
        this._size = size;
        this.root = new window.DirectoryEntry('/');
    };

    window.DirectoryEntry = function (fullPath) {
        this.fullPath = fullPath.replace(/\/$/, '');
        this.name = fullPath.substr(fullPath.lastIndexOf('/') + 1);
        this.isDirectory = true;
        this.isFile = false;
        this.getDirectory = function (name, options, successCallback, errorCallback) {
            successCallback(new window.DirectoryEntry(path.join(this.fullPath, name)));
        };
        this.getFile = function (name, options, successCallback, errorCallback) {
            successCallback(new window.FileEntry(path.join(this.fullPath, name)));
        };
        this.toURL = this.toInternalURL = function () {
            return this.fullPath;
        };
    };

    window.FileEntry = function (fullPath) {
        this.fullPath = fullPath.replace(/\/$/, '');
        this.name = fullPath.substr(fullPath.lastIndexOf('/') + 1);
        this.isDirectory = false;
        this.isFile = true;
        this.toURL = this.toInternalURL = function () {
            return this.fullPath;
        };
    };

    window.requestFileSystem = function (type, size, successCallback, errorCallback) {
        successCallback(new window.FileSystem(type, size));
    };

    window.resolveLocalFileSystemURL =  function (url, successCallback, errorCallback) {
        successCallback(new window.FileEntry(url));
    };

}());
