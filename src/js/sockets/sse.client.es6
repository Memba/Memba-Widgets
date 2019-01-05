/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// source: https://www.html5rocks.com/en/tutorials/eventsource/basics/#toc-js-api

// TODO "Last-Event-ID" is sent in a query string (CORS + "Last-Event-ID" header is not supported by all browsers)
// It is required to send 2 KB padding for IE < 10 and Chrome < 13 at the top of the response stream
// You need to send "comment" messages each 15-30 seconds, these messages will be used as heartbeat to detect disconnects - see https://bugzilla.mozilla.org/show_bug.cgi?id=444328

// Polyfill for IE11 at https://github.com/Yaffle/EventSource
import {
    NativeEventSource,
    EventSourcePolyfill
} from '../vendor/yaffle/eventsource';

const EventSource = NativeEventSource || EventSourcePolyfill;

const url = 'http://localhost:8080/events';
const source = new EventSource(url);

source.addEventListener(
    'message',
    e => {
        // Check event id + retry + name
        console.log(e.data);
    },
    false
);

source.addEventListener(
    'open',
    e => {
        // Connection was opened
    },
    false
);

source.addEventListener(
    'error',
    e => {
        if (e.readyState === EventSource.CLOSED) {
            // Connection was closed.
        }
    },
    false
);

/*
source.addEventListener(
    'ping',
    e => {
        // Check event id + retry + name
        console.log(e.data);
    },
    false
);
*/
