/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

function noop() {}

if (window.PHANTOMJS) {
    // eslint-disable-next-line no-console
    console.log('Mocking HTML 5 File API for PhantomJS');

    try {
        // We need a try catch block because if they exist, they are readonly (for debugging in Chrome)
        window.TEMPORARY = 0;
        window.PERSISTENT = 1;
    } catch (ex) {
        noop(ex); // To please eslint
    }

    const path = {
        join(...args) {
            let ret = '';
            // var args = Array.prototype.slice.call(arguments);
            for (let i = 0, { length } = args; i < length; i++) {
                ret += `/${args[i]}`;
            }
            return ret.replace(/[/]+/, '/').replace(/\/$/, '');
        }
    };

    class FileEntry {
        constructor(fullPath) {
            this.fullPath = fullPath.replace(/\/$/, '');
            this.name = fullPath.substr(fullPath.lastIndexOf('/') + 1);
            this.isDirectory = false;
            this.isFile = true;
        }
        toURL() {
            return this.fullPath;
        }
        toInternalURL() {
            return this.fullPath;
        }
    }
    window.FileEntry = FileEntry;

    class DirectoryEntry {
        constructor(fullPath) {
            this.fullPath = fullPath.replace(/\/$/, '');
            this.name = fullPath.substr(fullPath.lastIndexOf('/') + 1);
            this.isDirectory = true;
            this.isFile = false;
        }
        // getDirectory(name, options, successCallback, errorCallback) {
        getDirectory(name, options, successCallback) {
            successCallback(new DirectoryEntry(path.join(this.fullPath, name)));
        }
        // getFile(name, options, successCallback, errorCallback) {
        getFile(name, options, successCallback) {
            successCallback(new FileEntry(path.join(this.fullPath, name)));
        }
        toURL() {
            return this.fullPath;
        }
        toInternalURL() {
            return this.fullPath;
        }
    }
    window.DirectoryEntry = DirectoryEntry;

    class FileSystem {
        constructor(type, size) {
            this._type = type;
            this._size = size;
            this.root = new window.DirectoryEntry('/');
        }
    }
    window.FileSystem = FileSystem;

    // window.requestFileSystem = function requestFileSystem(type, size, successCallback, errorCallback) {
    window.requestFileSystem = function requestFileSystem(
        type,
        size,
        successCallback
    ) {
        successCallback(new FileSystem(type, size));
    };

    // window.resolveLocalFileSystemURL =  function resolveLocalFileSystemURL(url, successCallback, errorCallback) {
    window.resolveLocalFileSystemURL = function resolveLocalFileSystemURL(
        url,
        successCallback
    ) {
        successCallback(new FileEntry(url));
    };
}
