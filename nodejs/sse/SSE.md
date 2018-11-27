# WebSockets or else

## Issues

- Scalability (see MongoDB)
- Infrastructure (proxies, load balancers)
- ["Transfer" user connections between servers](https://hackernoon.com/scaling-websockets-9a31497af051)

## Options

- WebSockets
- Server Events
- Polling (inefficient)
- HTTP/2

## MongoDB

Whatever the option used, we need to observe mongodb changes to broadcast them:
- https://docs.mongodb.com/manual/changeStreams/
- https://www.mongodb.com/blog/post/an-introduction-to-change-streams
- https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4

## WebSockets

> Kahoot uses websockets (does not mean this is the right choice)

- May be overkill (we do not really need full duplex)
- Difficult to secure (DoS attacks)
- Do not work with HTTP/2
- Do not work with proxies 
- Check [ALB configuration on AWS](https://aws.amazon.com/blogs/aws/new-aws-application-load-balancer/)

Implementation: on nodeJS, do not use old [sockets.io](https://www.npmjs.com/package/socket.io), but prefer [ws](https://www.npmjs.com/package/ws).

## HTTP2 push

Not a real contender, see https://building.lang.ai/our-journey-from-websockets-to-http-2-4d069c54effd.

## Server-Side Events (SSE EventSource)
 
- Works on HTTP2
- [Performance similar to WebSockets and much better than polling](http://www.diva-portal.se/smash/get/diva2:1133465/FULLTEXT01.pdf)
- [There is a polyfill for IE/Edge](https://github.com/Yaffle/EventSource)
- Beware not for 2-way conversations: this is only server towards client!


See more at:
- https://caniuse.com/#search=server-sent%20events
- https://dotsandbrackets.com/when-sse-is-much-better-choice-than-websocket/
- http://html5doctor.com/server-sent-events/
- https://www.infoq.com/articles/websocket-and-http2-coexist
- https://www.html5rocks.com/en/tutorials/eventsource/basics/
- https://medium.com/conectric-networks/a-look-at-server-sent-events-54a77f8d6ff7

## Fetch streaming

See more at:
- https://jakearchibald.com/2016/streams-ftw/
- https://github.com/whatwg/html/issues/2177#issuecomment-332071504
- https://caniuse.com/#search=streams

## Protocole

### Student (player)

$.ajax: join channel/game + normal progresses with test activity
SSE: nothing, but possibly page changes and annotating (drawing)

### Teacher (game orchestrator)
$.ajax: game creation (channel) + invitations (subscribe)
SSE: student progresses - url includes channel

## Questions

How to recover from a lost connection (change of server)?
How to authenticate with teh event source (Bearer?)
https://stackoverflow.com/questions/28176933/http-authorization-header-in-eventsource-server-sent-events

