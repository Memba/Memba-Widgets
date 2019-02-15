/* globals self: false */self.onmessage = function (event) {
    'use strict';
    var data = JSON.parse(event.data);
    if (typeof data === 'number') {
        self.postMessage(data);
    } else {
        throw new TypeError('invalid message');
    }
    self.close();
};
