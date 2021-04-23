/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Source: https://www.html5rocks.com/en/tutorials/eventsource/basics/#toc-server-code
// Also check https://medium.com/conectric-networks/a-look-at-server-sent-events-54a77f8d6ff7
// Also https://github.com/pavel-klimiankou/SSESample/blob/master/app.js

var http = require('http');
var fs = require('fs');
var path = require('path');
var db = require('./sse/sse.db.es6');

const RX_PLAYER = /^\/player\/([^\?]+)\?id=([\w\-]+)$/
const RX_MASTER = /^\/master\/([^\?]+)\?id=([\w\-]+)$/

http.createServer(function(req, res) {
    //debugHeaders(req);
    if (req.headers.accept && req.headers.accept == 'text/event-stream') {
        // Server-Side Events
        if (RX_PLAYER.test(req.url)) {
            var matches = RX_PLAYER.exec(req.url);
            var id = matches[1];
            var user = { id: matches[2] };
            db.getGame(id).then(game => {
                game.addPlayer(user, res);
            });
        } else if (RX_MASTER.test(req.url)) {
            var matches = RX_MASTER.exec(req.url);
            var id = matches[1];
            var user = { id: matches[2] };
            db.getGame(id).then(game => {
                game.addMaster(user, res);
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    } else if (req.url === '/eventsource.js') {
        // Polyfill for IE
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(fs.readFileSync(path.join(__dirname, '../src/js/vendor/yaffle/eventsource.js')));
        res.end();
    } else if (req.url === '/player.html') {
        // Player page
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(fs.readFileSync(path.join(__dirname, '/sse/sse.player.html')));
        res.end();
    } else if (req.url === '/master.html') {
        // Master page
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(fs.readFileSync(path.join(__dirname, '/sse/sse.master.html')));
        res.end();
    } else if (/^\/game\//.test(req.url) && req.method === 'POST') {
        // Game update post
        // See https://www.dev2qa.com/node-js-http-server-get-post-example/
        const user = { id: req.headers.authorization.substr(7) };
        const id = req.url.substr(6);
        let data = '';
        // Get all post data when receive data event.
        req.on('data', chunk => {
            data += chunk;
        });
        // When all request post data has been received.
        req.on('end', () => {
            res.writeHead(201);
            res.end();
            data = JSON.parse(data);
            db.getGame(id).then(game => {
                game.updateData(user, data);
            });
        });
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8080);

function debugHeaders(req) {
   console.log('URL: ' + req.url);
    for (var key in req.headers) {
        console.log(key + ': ' + req.headers[key]);
    }
    console.log('\n\n');
}
