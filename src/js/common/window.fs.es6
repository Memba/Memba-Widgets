/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';
import Logger from './window.logger.es6';

/**
 * IMPORTANT:
 * This only works in Chrome - See https://caniuse.com/#feat=filesystem
 * In Cordova, there is a cordova-file-plugin so this works: https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html
 *
 * On other platforms we need a polyfill like https://raw.githubusercontent.com/ebidel/idb.filesystem.js/master/src/idb.filesystem.js
 * Check https://docs.microsoft.com/en-us/microsoft-edge/dev-guide/storage/indexeddb/saving-large-files-locally
 * Note that in Cordova, images can be accessed using file://, which is not possible with blobs stored in indexedDB, so the polyfill is only used in app.fs.test.html
 */

const logger = new Logger('window.fs');
// const DOT_TEMP = '.tmp';
const PERSISTENT_STORAGE_SIZE = 100 * 1024 * 1024; // 100 MB
const TEMPORARY_STORAGE_SIZE = 10 * 1024 * 1024; // 10 MB
// The following allows FS_ROOT[window.TEMPORARY] and FS_ROOT[window.PERSISTENT];
// var FS_ROOT = ['cdvfile://localhost/temporary/', 'cdvfile://localhost/persistent/'];
const FS_ERROR_MISSING_API = 'HTML 5 FileSystem API not supported';
const FILE_ERROR_CODES = {
    NOT_FOUND_ERR: 1,
    SECURITY_ERR: 2,
    ABORT_ERR: 3,
    NOT_READABLE_ERR: 4,
    ENCODING_ERR: 5,
    NO_MODIFICATION_ALLOWED_ERR: 6,
    INVALID_STATE_ERR: 7,
    SYNTAX_ERR: 8,
    INVALID_MODIFICATION_ERR: 9,
    QUOTA_EXCEEDED_ERR: 10,
    TYPE_MISMATCH_ERR: 11,
    PATH_EXISTS_ERR: 12
};
const FILE_TRANFER_ERROR_CODES = {
    FILE_NOT_FOUND_ERR: 1,
    INVALID_URL_ERR: 2,
    CONNECTION_ERR: 3,
    ABORT_ERR: 4,
    NOT_MODIFIED_ERR: 5
};

/**
 * Make directory
 * @param dfd
 * @param root
 * @param folders
 * @returns {*}
 */
function makeDir(dfd, root, folders) {
    assert.type(
        CONSTANTS.OBJECT,
        dfd,
        assert.format(assert.messages.type.default, 'dfd', CONSTANTS.OBJECT)
    );
    assert.isFunction(
        dfd.then,
        assert.format(assert.messages.isFunction.default, 'dfd.then')
    );
    assert.type(
        CONSTANTS.OBJECT,
        root,
        assert.format(assert.messages.type.default, 'root', CONSTANTS.OBJECT)
    );
    assert.ok(
        root.isDirectory,
        'root should be a DirectoryEntry and therefore return directoryEntry.isDirectory === true'
    );
    assert.isArray(
        folders,
        assert.format(assert.messages.isArray.default, 'folders')
    );

    // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
    if (folders[0] === '.' || folders[0] === '') {
        // eslint-disable-next-line no-param-reassign
        folders = folders.slice(1);
    }
    if (folders.length === 0) {
        dfd.resolve(root);
    } else {
        // Note: cdvfile urls do not work in the browser and in WKWebViewEngine - https://issues.apache.org/jira/browse/CB-10141
        // To test WKWebView against UIWebView, check https://stackoverflow.com/questions/28795476/detect-if-page-is-loaded-inside-wkwebview-in-javascript
        // var rootURL = window.cordova && window.device && window.device.platform !== 'browser' && !window.indexedDB  ?
        // var rootURL = window.cordova && window.device && window.device.platform !== 'browser' && !(window.webkit && window.webkit.messageHandlers) ?
        //     root.toInternalURL() : root.toURL();
        const rootURL = root.toURL();

        logger.debug({
            message: 'Calling root.getDirectory',
            method: 'makeDir',
            data: { rootURL, folder: folders[0] }
        });

        root.getDirectory(
            folders[0],
            { create: true },
            directoryEntry => {
                // Recursively add the new subfolder (if we still have another to create).
                if (folders.length > 1) {
                    makeDir(dfd, directoryEntry, folders.slice(1));
                } else {
                    dfd.resolve(directoryEntry);
                }
            },
            dfd.reject
        );
    }
}

/**
 * FileSystem
 * @class
 */
export default class FileSystem {
    /**
     * Constructor
     * @constructor
     */
    // constructor() {}

    /**
     * Initialization of FileSystem
     * Note: cannot use constructor because this is asynchronous
     */
    init() {
        return $.when(
            this._initTemporary(), // Temporary by default
            this._initPersistent()
        );
    }

    /**
     * File error codes
     * @see https://developer.mozilla.org/en-US/docs/Web/API/FileError
     * @see https://github.com/apache/cordova-plugin-file/blob/master/README.md#list-of-error-codes-and-meanings
     * @returns {*}
     * @private
     */
    static get fileErrorCodes() {
        return FILE_ERROR_CODES;
    }

    /**
     * FileTransfer error codes
     * @see https://github.com/apache/cordova-plugin-file-transfer#filetransfererror
     * @returns {*}
     * @private
     */
    static get fileTranferErrorCodes() {
        return FILE_TRANFER_ERROR_CODES;
    }

    /**
     * Initialize the temporary file system
     * @private
     */
    _initTemporary() {
        const that = this;
        const dfd = $.Deferred();
        window.requestFileSystem =
            window.requestFileSystem || window.webkitRequestFileSystem;
        window.storageInfo = window.storageInfo || window.webkitStorageInfo; // Check window.navigator.webkitTemporaryStorage;
        logger.debug({
            message: 'Initializing temporary file system',
            method: '_initTemporary',
            data: {
                requestFileSystem:
                    $.type(window.requestFileSystem) !== CONSTANTS.UNDEFINED,
                storageInfo: $.type(window.storageInfo) !== CONSTANTS.UNDEFINED
            }
        });
        window.storageInfo = window.storageInfo || {
            // Stub requestQuota for systems that do not implement/require it, including iOS Cordova
            // requestQuota(type, requestedBytes, successCallback, errorCallback) {
            requestQuota(type, requestedBytes, successCallback) {
                // @see https://github.com/apache/cordova-plugin-file#create-a-temporary-file
                // @see https://www.html5rocks.com/en/tutorials/file/filesystem/#toc-requesting
                successCallback(requestedBytes);
            }
        };
        if (
            window.requestFileSystem &&
            $.type(window.TEMPORARY) !== CONSTANTS.UNDEFINED
        ) {
            if ($.type(that._temporary) === CONSTANTS.UNDEFINED) {
                window.storageInfo.requestQuota(
                    window.TEMPORARY,
                    TEMPORARY_STORAGE_SIZE,
                    grantedBytes => {
                        window.requestFileSystem(
                            window.TEMPORARY,
                            grantedBytes,
                            temporary => {
                                that._temporary = temporary;
                                dfd.resolve(temporary);
                                logger.debug({
                                    message: 'Temporary file system granted',
                                    method: '_initTemporary',
                                    data: { grantedBytes }
                                });
                            },
                            dfd.reject
                        );
                    },
                    dfd.reject
                );
            } else {
                dfd.resolve(that._temporary);
            }
        } else {
            dfd.reject(new Error(FS_ERROR_MISSING_API));
        }
        return dfd.promise();
    }

    /**
     * Initialize the persistent file system
     * @private
     */
    _initPersistent() {
        const that = this;
        const dfd = $.Deferred();
        window.requestFileSystem =
            window.requestFileSystem || window.webkitRequestFileSystem; // Check window.navigator.webkitPersistentStorage;
        window.storageInfo = window.storageInfo || window.webkitStorageInfo;
        logger.debug({
            message: 'Initializing persistent file system',
            method: '_initPersistent',
            data: {
                requestFileSystem:
                    $.type(window.requestFileSystem) !== CONSTANTS.UNDEFINED,
                storageInfo: $.type(window.storageInfo) !== CONSTANTS.UNDEFINED
            }
        });
        window.storageInfo = window.storageInfo || {
            // Stub requestQuota for systems that do not implement/require it, including iOS Cordova
            // requestQuota(type, requestedBytes, successCallback, errorCallback) {
            requestQuota(type, requestedBytes, successCallback) {
                // @see https://github.com/apache/cordova-plugin-file#create-a-persistent-file-
                // @see https://www.html5rocks.com/en/tutorials/file/filesystem/#toc-requesting
                successCallback(requestedBytes);
            }
        };
        if (
            window.requestFileSystem &&
            $.type(window.PERSISTENT) !== CONSTANTS.UNDEFINED
        ) {
            if ($.type(that._persistent) === CONSTANTS.UNDEFINED) {
                window.storageInfo.requestQuota(
                    window.PERSISTENT,
                    PERSISTENT_STORAGE_SIZE,
                    grantedBytes => {
                        window.requestFileSystem(
                            window.PERSISTENT,
                            grantedBytes,
                            persistent => {
                                that._persistent = persistent;
                                dfd.resolve(persistent);
                                logger.debug({
                                    message: 'Persistent file system granted',
                                    method: '_initPersistent',
                                    data: { grantedBytes }
                                });
                            },
                            dfd.reject
                        );
                    },
                    dfd.reject
                );
            } else {
                dfd.resolve(that._persistent);
            }
        } else {
            dfd.reject(new Error(FS_ERROR_MISSING_API));
        }
        return dfd.promise();
    }

    /**
     * Get the underlying file system
     * @param type
     * @returns {*}
     * @private
     */
    _getFileSystem(type) {
        if (type === window.PERSISTENT) {
            return this._persistent;
        }
        return this._temporary; // Temporary by default
    }

    /**
     * Get directory entry
     * @see https://www.html5rocks.com/en/tutorials/file/filesystem/#toc-dir
     * @param path (from that._fs.root)
     * @param type
     */
    getDirectoryEntry(path, type = window.TEMPORARY) {
        assert.type(
            CONSTANTS.STRING,
            path,
            assert.format(
                assert.messages.type.default,
                'path',
                CONSTANTS.STRING
            )
        );
        assert.ok(
            type === window.TEMPORARY || type === window.PERSISTENT,
            '`type` should either be window.TEMPORARY or window.PERSISTENT'
        );
        const fs = this._getFileSystem(type);
        assert.ok(
            $.type(fs) !== CONSTANTS.UNDEFINED,
            'Call init on FileSystem before using it.'
        );

        logger.debug({
            message: 'Getting directory',
            method: 'getDirectoryEntry',
            data: { path, type }
        });

        const dfd = $.Deferred();
        makeDir(dfd, fs.root, path.split('/'));
        return dfd.promise();
    }

    /**
     * Create file
     * @param directoryEntry (determines file storage type)
     * @param fileName
     */
    // eslint-disable-next-line class-methods-use-this
    getFileEntry(directoryEntry, fileName) {
        assert.type(
            CONSTANTS.OBJECT,
            directoryEntry,
            assert.format(
                assert.messages.type.default,
                'directoryEntry',
                CONSTANTS.OBJECT
            )
        );
        assert.ok(
            directoryEntry.isDirectory,
            'directoryEntry should be a DirectoryEntry and therefore return directoryEntry.isDirectory === true'
        );
        assert.type(
            CONSTANTS.STRING,
            fileName,
            assert.format(
                assert.messages.type.default,
                'fileName',
                CONSTANTS.STRING
            )
        );

        // Note: cdvfile urls do not work in the browser and in WKWebViewEngine - https://issues.apache.org/jira/browse/CB-10141
        // To test WKWebView against UIWebView, check https://stackoverflow.com/questions/28795476/detect-if-page-is-loaded-inside-wkwebview-in-javascript
        // var directoryURL = window.cordova && window.device && window.device.platform !== 'browser' && !window.indexedDB  ?
        // var directoryURL = window.cordova && window.device && window.device.platform !== 'browser' && !(window.webkit && window.webkit.messageHandlers) ?
        //    directoryEntry.toInternalURL() : directoryEntry.toURL();
        const directoryURL = directoryEntry.toURL();

        logger.debug({
            message: 'Getting file entry',
            method: 'FileSystem.getFileEntry',
            data: { directoryURL, fileName }
        });

        const dfd = $.Deferred();
        directoryEntry.getFile(
            fileName,
            { create: true, exclusive: false },
            dfd.resolve,
            dfd.reject
        );
        return dfd.promise();
    }

    /**
     * File download
     * @see https://github.com/apache/cordova-plugin-file-transfer#download-a-binary-file-to-the-application-cache-
     * @param remoteUrl
     * @param fileEntry
     * @param headers
     */
    // eslint-disable-next-line class-methods-use-this
    download(remoteUrl, fileEntry, headers) {
        assert.type(
            CONSTANTS.STRING,
            remoteUrl,
            assert.format(
                assert.messages.type.default,
                'remoteUrl',
                CONSTANTS.STRING
            )
        );
        assert.ok(
            fileEntry.isFile,
            'fileEntry should be a FileEntry and therefore return fileEntry.isFile === true'
        );
        assert.isOptionalObject(
            headers,
            assert.format(assert.messages.isOptionalObject.default, 'headers')
        );

        const dfd = $.Deferred();

        /*
        var fileTransfer = new window.FileTransfer();

        // Note: cdvfile urls do not work in the browser and in WKWebViewEngine - https://issues.apache.org/jira/browse/CB-10141
        // To test WKWebView against UIWebView, check https://stackoverflow.com/questions/28795476/detect-if-page-is-loaded-inside-wkwebview-in-javascript
        var fileURL = window.cordova && window.device && window.device.platform !== 'browser' && !(window.webkit && window.webkit.messageHandlers) ?
            fileEntry.toInternalURL() : fileEntry.toURL();

        logger.debug({
            message: 'Downloading a file',
            method: 'download',
            data: { remoteUrl: remoteUrl, fileURL: fileURL, headers: JSON.stringify(headers) }
        });

        fileTransfer.onProgress = dfd.notify; // Consider reviewing event parameter passed to dfd.notify without formatting

        // An error (especially no connection) erases the existing file instead of updating
        // @see https://issues.apache.org/jira/browse/CB-7073
        // So we download with DOT_TMP extension and rename (moveTo) without DOT_TMP upon successful download
        fileTransfer.download(
            remoteUrl,
            fileURL + DOT_TEMP,
            function (fileEntry) {
                fileEntry.getParent(
                    function (directoryEntry) {
                        fileEntry.moveTo(
                            directoryEntry,
                            fileEntry.name.slice(0, -DOT_TEMP.length),
                            dfd.resolve,
                            dfd.reject
                        );
                        dfd.resolve(fileEntry);
                    },
                    dfd.reject
                );
            },
            dfd.reject,
            false, // trustAllHosts
            $.isPlainObject(headers) ? { headers: headers } : {}
        );
        */

        /** *****************************************************************************************************
         * cordova-plugin-filetransfer is now deprecated
         * @see https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html
         ****************************************************************************************************** */

        const xhr = new window.XMLHttpRequest();

        // Make sure you add the domain name to the Content-Security-Policy <meta> element.
        xhr.open('GET', remoteUrl, true);

        // Define how you want the XHR data to come back
        xhr.responseType = 'blob';

        // Fails on Facebook and transparent with other providers
        // xhr.withCredentials = true;

        // Set request headers
        if ($.isPlainObject(headers)) {
            Object.keys(headers).forEach(header => {
                xhr.setRequestHeader(header, headers[header]);
            });
        }

        // Add a referer (does not help downloading live picture)
        // xhr.setRequestHeader('referer', window.location.href);

        // Save file when loaded
        xhr.onload = function onload() {
            if (this.readyState === this.DONE && this.status === 200) {
                const blob = xhr.response; // not xhr.responseText
                if (blob) {
                    fileEntry.createWriter(fileWriter => {
                        /* eslint-disable no-param-reassign */
                        fileWriter.onwriteend = dfd.resolve;
                        fileWriter.onerror = dfd.reject;
                        /* eslint-enable no-param-reassign */
                        fileWriter.write(blob);
                    }, dfd.reject);
                } else {
                    dfd.reject(new Error('XMLHttpRequest missing body'));
                }
            } else {
                // Especially errors 400, 401 and 403
                dfd.reject(new Error(`XMLHttpRequest status ${this.status}`));
            }
        };

        // Report download progress
        xhr.onprogress = dfd.notify;
        // Change state
        // xhr.onreadystatechange = function (e) {};
        // Report errors
        xhr.onerror = function onerror() {
            // Especially error 404 ends here: why?
            // e is an XMLHttpRequestProgressEvent with no error code
            dfd.reject(new Error('XMLHttpRequest error'));
        };
        xhr.ontimeout = function ontimeout() {
            // e is an XMLHttpRequestProgressEvent
            dfd.reject(new Error('XMLHttpRequest timeout'));
        };
        // Report cancellation
        xhr.onabort = function onabort() {
            // e is an XMLHttpRequestProgressEvent
            dfd.reject(new Error('XMLHttpRequest aborted'));
        };

        logger.debug({
            message: 'Downloading a file',
            method: 'download',
            data: { remoteUrl, headers: JSON.stringify(headers) }
        });

        // Send the request
        xhr.send(null);

        return dfd.promise();
    }

    /**
     * File upload
     * @see https://github.com/apache/cordova-plugin-file-transfer#upload-a-file-
     * @param fileEntry
     * @param remoteUrl
     */
    // Beware of Firefox sendAsBinary: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data#Firefox-specific_examples
    // upload(fileEntry, remoteUrl) {};
}

/**
 * Maintain compatibility with legacy code
 */
window.app = window.app || {};
window.app.FileSystem = FileSystem;
