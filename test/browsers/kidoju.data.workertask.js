/* globals self: false */
self.onmessage = function (event) {
    'use strict';
    if (typeof event.data === 'number') {
        self.postMessage(event.data);
    } else {
        throw new TypeError('invalid message');
    }
    self.close();
};