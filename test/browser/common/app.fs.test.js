/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, expr: true, mocha: true */

;(function ($, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var FileSystem = window.app.FileSystem;

    describe('app.fs', function () {

        describe('Initialization', function () {

            it('it should init a window.TEMPORARY file system', function (done) {
                var fileSystem = new FileSystem();
                fileSystem._initTemporary()
                    .done(function (temporary) {
                        // expect(temporary).to.be.an('object');
                        expect(temporary).not.to.be.undefined;
                        fileSystem._initTemporary()
                            .done(function (fs) {
                                expect(fs).to.equal(temporary);
                                done();
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

            it('it should init a window.PERSISTENT file system', function (done) {
                var fileSystem = new FileSystem();
                fileSystem._initPersistent()
                    .done(function (persistent) {
                        // expect(persistent).to.be.an('object');
                        expect(persistent).not.to.be.undefined;
                        fileSystem._initPersistent()
                            .done(function (fs) {
                                expect(fs).to.equal(persistent);
                                done();
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

            it('it should init a file system (temporary and persistent)', function (done) {
                var fileSystem = new FileSystem();
                fileSystem.init()
                    .done(function (temporary, persistent) {
                        // expect(temporary).to.be.an('object');
                        // expect(persistent).to.be.an('object');
                        expect(temporary).not.to.be.undefined;
                        expect(persistent).not.to.be.undefined;
                        done();
                    })
                    .fail(done);
            });

        });

        describe('getDirectoryEntry', function () {

            it('it should fail to get a directoryEntry if FileSystem has not been initialized', function (done) {
                var fileSystem = new FileSystem();
                var path = '/images';
                fileSystem.getDirectoryEntry(path, window.TEMPORARY)
                    .done(function () {
                        done(new Error('Making a directory without initializing a FileSystem should fail'));
                    })
                    .fail(function (err) {
                        expect(err).to.be.an.instanceof(Error);
                        done();
                    });
            });

            it('it should get a directoryEntry in a temporary FileSystem', function (done) {
                var fileSystem = new FileSystem();
                fileSystem.init()
                    .done(function () {
                        var path = '/images';
                        fileSystem.getDirectoryEntry(path, window.TEMPORARY)
                            .done(function (directoryEntry) {
                                expect(directoryEntry).not.to.be.undefined;
                                expect(directoryEntry.isDirectory).to.be.true;
                                expect(directoryEntry.fullPath).to.equal(path);
                                done();
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

            it('it should get a directoryEntry in a persistent FileSystem', function (done) {
                var fileSystem = new FileSystem();
                fileSystem.init()
                    .done(function (fs) {
                        var path = '/images/icons/office';
                        fileSystem.getDirectoryEntry(path, window.PERSISTENT)
                            .done(function (directoryEntry) {
                                expect(directoryEntry).not.to.be.undefined;
                                expect(directoryEntry.isDirectory).to.be.true;
                                expect(directoryEntry.fullPath).to.equal(path);
                                done();
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

        });

        describe('getFileEntry', function () {

            it('it should get a fileEntry in a temporary FileSystem', function (done) {
                var fileSystem = new FileSystem();
                var path = '/images';
                var fileName = 'temp.jpg';
                fileSystem.init()
                    .done(function () {
                        fileSystem.getDirectoryEntry(path, window.TEMPORARY)
                            .done(function (directoryEntry) {
                                fileSystem.getFileEntry(directoryEntry, fileName)
                                    .done(function (fileEntry) {
                                        expect(fileEntry).not.to.be.undefined;
                                        expect(fileEntry.isFile).to.be.true;
                                        expect(fileEntry.name).to.equal(fileName);
                                        expect(fileEntry.fullPath).to.equal(path + '/' + fileName);
                                        done();
                                    })
                                    .fail(done);
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

            it('it should get a fileEntry in a persistent FileSystem', function (done) {
                var fileSystem = new FileSystem();
                var path = '/images';
                var fileName = 'temp.jpg';
                fileSystem.init()
                    .done(function () {
                        fileSystem.getDirectoryEntry(path, window.PERSISTENT)
                            .done(function (directoryEntry) {
                                fileSystem.getFileEntry(directoryEntry, fileName)
                                    .done(function (fileEntry) {
                                        expect(fileEntry).not.to.be.undefined;
                                        expect(fileEntry.isFile).to.be.true;
                                        expect(fileEntry.name).to.equal(fileName);
                                        expect(fileEntry.fullPath).to.equal(path + '/' + fileName);
                                        done();
                                    })
                                    .fail(done);
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

        });

        // window.FileTransfer is now deprecated
        xdescribe('download with window.FileTransfer', function () {

            var transfer = sinon.spy();

            before(function () {
                // Create a stub for window.FileTransfer
                window.FileTransfer = function () {};

                /* This function has too many parameters. */
                /* jshint -W072 */

                window.FileTransfer.prototype.download = function (remoteUrl, fileUrl, successCallback, errorCallback, trueAllHosts, options) {
                    window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
                    window.resolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                        transfer(fileUrl);
                        successCallback(fileEntry);
                    });
                };

                /* jshint +W072 */
            });

            it('it should download a remote url to a temporary FileSystem', function (done) {
                var fileSystem = new FileSystem();
                var remoteUrl = 'https://cdn.kidoju.com/kidoju/kidoju.logo.png';
                var path = '/images';
                var fileName = 'logo.png';
                fileSystem.init()
                    .done(function () {
                        fileSystem.getDirectoryEntry(path, window.TEMPORARY)
                            .done(function (directoryEntry) {
                                fileSystem.getFileEntry(directoryEntry, fileName)
                                    .done(function (fileEntry) {
                                        fileSystem.download(remoteUrl, fileEntry)
                                            .done(function (entry) {
                                                expect(transfer).to.have.been.calledOnce;
                                                expect(transfer).to.have.been.calledWith(entry.toURL());
                                                done();
                                            })
                                            .fail(done);
                                    })
                                    .fail(done);
                            })
                            .fail(done);
                    })
                    .fail(done);
            });

        });

        describe('download without window.FileTransfer', function () {

            function download (remoteUrl, fileName) {
                var dfd = $.Deferred();
                var fileSystem = new FileSystem();
                var path = '/images';
                fileSystem.init()
                    .done(function () {
                        fileSystem.getDirectoryEntry(path, window.TEMPORARY)
                            .done(function (directoryEntry) {
                                expect(directoryEntry).not.to.be.undefined;
                                expect(directoryEntry.isDirectory).to.be.true;
                                fileSystem.getFileEntry(directoryEntry, fileName)
                                    .done(function (fileEntry) {
                                        expect(fileEntry).not.to.be.undefined;
                                        expect(fileEntry.isFile).to.be.true;
                                        fileSystem.download(remoteUrl, fileEntry)
                                            .done(dfd.resolve)
                                            .fail(dfd.reject);
                                    })
                                    .fail(dfd.reject);
                            })
                            .fail(dfd.reject);
                    })
                    .fail(dfd.reject);
                return dfd.promise();
            }

            it('it should download a remote url to a temporary FileSystem', function (done) {
                var remoteUrl = 'https://cdn.kidoju.com/kidoju/kidoju.logo.png';
                var fileName = 'logo.png';
                download(remoteUrl, fileName)
                    .done(function (e) {
                        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                            // Only on Chrome - https://caniuse.com/#feat=filesystem
                            expect(e).to.be.an.instanceof(window.ProgressEvent);
                            expect(e.type).to.equal('writeend');
                            expect(e.loaded).to.equal(e.total);
                        } else {
                            // On other platforms we use https://github.com/ebidel/idb.filesystem.js/
                            // Which does not report a ProgressEvent - see https://github.com/ebidel/idb.filesystem.js/issues/23
                            expect(e).to.be.undefined;
                        }
                        done();
                    })
                    .fail(done);
            });

            it('it should grab a profile picture from Facebook', function (done) {
                // var remoteUrl = 'https://lookaside.facebook.com/platform/profilepic/?asid=357323574748619&height=50&width=50&ext=1524312400&hash=AeS041AQDB6qcqqu'; // Fly Flyerson
                var remoteUrl = 'https://graph.facebook.com/v2.8/357323574748619/picture'; // Fly Flyerson
                // var remoteUrl = 'https://graph.facebook.com/v2.8/168077410636906/picture'; // Hai Chan (default)
                // var remoteUrl = 'https://graph.facebook.com/v2.8/10154518601432883/picture'; //
                var fileName = 'picture.jpg';
                download(remoteUrl, fileName)
                    .done(function (e) {
                        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                            // Only on Chrome - https://caniuse.com/#feat=filesystem
                            expect(e).to.be.an.instanceof(window.ProgressEvent);
                            expect(e.type).to.equal('writeend');
                            expect(e.loaded).to.equal(e.total);
                        } else {
                            // On other platforms we use https://github.com/ebidel/idb.filesystem.js/
                            // Which does not report a ProgressEvent - see https://github.com/ebidel/idb.filesystem.js/issues/23
                            expect(e).to.be.undefined;
                        }
                        done();
                    })
                    .fail(done);
            });

            it('it should grab the default profile picture from Google', function (done) {
                var remoteUrl = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';
                var fileName = 'picture.jpg';
                download(remoteUrl, fileName)
                .done(function (e) {
                    if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                        // Only on Chrome - https://caniuse.com/#feat=filesystem
                        expect(e).to.be.an.instanceof(window.ProgressEvent);
                        expect(e.type).to.equal('writeend');
                        expect(e.loaded).to.equal(e.total);
                    } else {
                        // On other platforms we use https://github.com/ebidel/idb.filesystem.js/
                        // Which does not report a ProgressEvent - see https://github.com/ebidel/idb.filesystem.js/issues/23
                        expect(e).to.be.undefined;
                    }
                    done();
                })
                .fail(done);
            });

            it('it should grab a custom profile picture from Google', function (done) {
                var remoteUrl = 'https://lh3.googleusercontent.com/-3ZCodtNM7jE/AAAAAAAAAAI/AAAAAAABcuo/s-E1n4YTpik/photo.jpg';
                var fileName = 'picture.jpg';
                download(remoteUrl, fileName)
                    .done(function (e) {
                        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                            // Only on Chrome - https://caniuse.com/#feat=filesystem
                            expect(e).to.be.an.instanceof(window.ProgressEvent);
                            expect(e.type).to.equal('writeend');
                            expect(e.loaded).to.equal(e.total);
                        } else {
                            // On other platforms we use https://github.com/ebidel/idb.filesystem.js/
                            // Which does not report a ProgressEvent - see https://github.com/ebidel/idb.filesystem.js/issues/23
                            expect(e).to.be.undefined;
                        }
                        done();
                    })
                    .fail(done);
            });

            it('it should grab a profile picture from Twitter', function (done) {
                var remoteUrl = 'https://pbs.twimg.com/profile_images/681812478876119042/UQ6KWVL8_normal.jpg'; // JLC
                // var remoteUrl = 'https://pbs.twimg.com/profile_images/2259969465/iPhoto_Library_Twitt_normal.jpg'; // PJ
                var fileName = 'picture.jpg';
                download(remoteUrl, fileName)
                    .done(function (e) {
                        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                            // Only on Chrome - https://caniuse.com/#feat=filesystem
                            expect(e).to.be.an.instanceof(window.ProgressEvent);
                            expect(e.type).to.equal('writeend');
                            expect(e.loaded).to.equal(e.total);
                        } else {
                            // On other platforms we use https://github.com/ebidel/idb.filesystem.js/
                            // Which does not report a ProgressEvent - see https://github.com/ebidel/idb.filesystem.js/issues/23
                            expect(e).to.be.undefined;
                        }
                        done();
                    })
                    .fail(done);
            });

            xit('it should grab a profile picture from Window Live', function (done) {
                var remoteUrl = 'https://apis.live.net/v5.0/afe934f8913d4112/picture?type=medium';
                // var remoteUrl = 'https://cid-afe934f8913d4112.users.storage.live.com/users/0xafe934f8913d4112/myprofile/expressionprofile/profilephoto:UserTileStatic';
                var fileName = 'picture.jpg';
                download(remoteUrl, fileName)
                    .done(function (e) {
                        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                            // Only on Chrome - https://caniuse.com/#feat=filesystem
                            expect(e).to.be.an.instanceof(window.ProgressEvent);
                            expect(e.type).to.equal('writeend');
                            expect(e.loaded).to.equal(e.total);
                        } else {
                            // On other platforms we use https://github.com/ebidel/idb.filesystem.js/
                            // Which does not report a ProgressEvent - see https://github.com/ebidel/idb.filesystem.js/issues/23
                            expect(e).to.be.undefined;
                        }
                        done();
                    })
                    .fail(done);
            });

            it('it should fail if remote url is forbidden (403)', function (done) {
                var remoteUrl = 'https://cdn.kidoju.com/foo/bar';
                var fileName = 'bar.png';
                download(remoteUrl, fileName)
                    .done(function () {
                        done(new Error('Should have caught a status error'));
                    })
                    .fail(function (err) {
                        expect(err.message).to.equal('XMLHttpRequest status 403');
                        done();
                    });
            });

            it('it should fail if remote url is mot found (404)', function (done) {
                var remoteUrl = 'https://www.memba.com/foo.png';
                var fileName = 'foo.png';
                download(remoteUrl, fileName)
                    .done(function () {
                        done(new Error('Should have caught a status error'));
                    })
                    .fail(function (err) {
                        // expect(err.message).to.equal('XMLHttpRequest status 404');
                        expect(err.message).to.equal('XMLHttpRequest error');
                        done();
                    });
            });

        });

        xdescribe('download with jQuery', function () {

            $.ajaxPrefilter('arraybuffer', function (s) {
                s.xhrFields = { responseType: 'arraybuffer' };
                s.responseFields.arraybuffer = 'response';
                s.converters['binary arraybuffer'] = true;
            });

            function downloadFile(url) {
                var dfd = $.Deferred();
                $.ajax({
                    cache: true,
                    // crossDomain: true,
                    dataType: 'arraybuffer',
                    type: 'GET',
                    url: url
                })
                .done(function (response, status, xhr) {
                    if (xhr.status === 200) {
                        var blob = new window.Blob([response], { type: xhr.getResponseHeader('content-type') });
                        blob.name = url.split('/').pop();
                        dfd.resolve(blob);
                    } else {
                        dfd.reject(xhr, status, 'error');
                    }
                })
                .fail(dfd.reject); // Note: cross domain $.get from localhost is not allowed in Google Chrome and will end up here
                return dfd.promise();
            }

            it('it should grab a profile picture from Facebook', function (done) {
                var remoteUrl = 'https://graph.facebook.com/v2.8/357323574748619/picture';
                // var remoteUrl = 'https://lookaside.facebook.com/platform/profilepic/?asid=357323574748619&height=50&width=50&ext=1524312400&hash=AeS041AQDB6qcqqu';
                // var remoteUrl = 'https://apis.live.net/v5.0/afe934f8913d4112/picture?suppress_response_code=true';
                // var remoteUrl = 'https://cid-afe934f8913d4112.users.storage.live.com/users/0xafe934f8913d4112/myprofile/expressionprofile/profilephoto:UserTileStatic';
                downloadFile(remoteUrl)
                    .done(function (blog) {
                        debugger;
                        done();
                    })
                    .fail(function (xhr, status, error) {
                        debugger;
                        done(xhr);
                    });
            });

        });

    });

}(window.jQuery));
