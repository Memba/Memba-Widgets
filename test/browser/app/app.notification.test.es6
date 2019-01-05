/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import notification from '../../../src/js/app/app.notification.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    ui: { Notification }
} = window.kendo;

chai.use((c, u) => chaiJquery(c, u, $));

describe('app.notification', () => {
    it('Initialization', () => {
        expect($('#notification')).to.exist;
        expect(notification).to.be.an.instanceof(Notification);
    });
});
