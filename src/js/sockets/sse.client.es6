// source: https://www.html5rocks.com/en/tutorials/eventsource/basics/#toc-js-api

if (window.EventSource) {
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
} else {
    // Result to xhr polling :(
}
