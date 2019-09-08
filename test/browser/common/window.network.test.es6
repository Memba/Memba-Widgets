/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Network from '../../../src/js/common/window.network.es6';

const { describe, it } = window;
const { expect } = chai;
const FIXTURES = 'fixtures';

chai.use(sinonChai);

const network = new Network({
    ajax: {
        url: 'https://www.kidoju.com/api/ping',
        timeout: 5000
    },
    enabled: true,
    global: false
});

/**
 * Note: When setting Google Chrome to offline, it is not possible to reload the page
 * So a button is convenient to test online status in development
 */
const fixtures = $(`#${FIXTURES}`);
if (fixtures.length) {
    $('<button>Network</button>')
        .appendTo(fixtures)
        .on('click', () => {
            // eslint-disable-next-line no-alert
            network.check().then(status => window.alert(status));
        });
}

describe('window.network', () => {
    describe('using default options', () => {
        it('check', done => {
            network
                .check()
                .then(status => {
                    expect(status).to.be.true;
                    done();
                })
                .catch(done);
        });

        it('isOffline', () => {
            expect(network.isOffline()).to.be.false;
        });

        it('isOnline', () => {
            expect(network.isOnline()).to.be.true;
        });
    });

    /*
    describe('enabling global interceptions', () => {
        before(() => {
            network.global(true);
        });
    });
    */

    describe('using simulation', () => {
        before(() => {
            network.global(false);
            network.enable(false);
        });

        it('check', done => {
            const on = JSC.boolean()();
            network._setStatus(on);
            network
                .check()
                .then(status => {
                    expect(status).to.equal(on);
                    done();
                })
                .catch(done);
        });

        it('isOffline', () => {
            const on = JSC.boolean()();
            network._setStatus(on);
            expect(network.isOffline()).to.equal(!on);
        });

        it('isOnline', () => {
            const on = JSC.boolean()();
            network._setStatus(on);
            expect(network.isOnline()).to.equal(on);
        });

        it('offline event', () => {
            const offline = sinon.spy();
            network._setStatus(true);
            network.bind('offline', offline);
            expect(offline).not.to.have.been.called;
            network._setStatus(false);
            expect(offline).to.have.been.calledOnce;
            network._setStatus(true);
            expect(offline).to.have.been.calledOnce;
            network._setStatus(false);
            expect(offline).to.have.been.calledTwice;
        });

        it('online event', () => {
            const online = sinon.spy();
            network._setStatus(false);
            network.bind('online', online);
            expect(online).not.to.have.been.called;
            network._setStatus(true);
            expect(online).to.have.been.calledOnce;
            network._setStatus(false);
            expect(online).to.have.been.calledOnce;
            network._setStatus(true);
            expect(online).to.have.been.calledTwice;
        });

        afterEach(() => {
            network.bind('offline');
            network.bind('online');
        });
    });

    describe('using a 404 url', () => {
        before(() => {
            network.setOptions({
                // @ see http://api.jquery.com/jquery.ajax/
                ajax: {
                    url: 'https://www.kidoju.com/api/404',
                    timeout: 5000
                },
                enabled: true,
                global: false
            });
        });

        it('check', done => {
            network
                .check()
                .then(status => {
                    expect(status).to.be.true;
                    done();
                })
                .catch(done);
        });

        it('isOffline', () => {
            expect(network.isOffline()).to.be.false;
        });

        it('isOnline', () => {
            expect(network.isOnline()).to.be.true;
        });
    });

    describe('using an unresolved domain name', () => {
        before(() => {
            network.setOptions({
                // @ see http://api.jquery.com/jquery.ajax/
                ajax: {
                    url: 'https://www.kidojuxxxxxxxxx.com/api/ping',
                    timeout: 5000
                },
                enabled: true,
                global: false
            });
        });

        it('check', done => {
            network
                .check()
                .then(status => {
                    expect(status).to.be.false;
                    done();
                })
                .catch(done);
        });

        it('isOffline', () => {
            expect(network.isOffline()).to.be.true;
        });

        it('isOnline', () => {
            expect(network.isOnline()).to.be.false;
        });
    });
});
