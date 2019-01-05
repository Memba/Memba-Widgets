/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

//http://www.hongkiat.com/blog/node-js-server-side-javascript/
//http://stackoverflow.com/questions/6084360/node-js-as-a-simple-web-server
//https://github.com/requirejs/example-jquery-cdn/blob/master/tools/server.js

//Install: add --debug=8081 in Node parameters

var http = require('http'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    port = parseInt(process.argv[3], 10) || parseInt(process.argv[2], 10) || 8080,
    types = {
        'html'  : 'text/html',
        'txt'   : 'text/plain',
        'css'   : 'text/css',
        'js'    : 'text/javascript',
        'ico'   : 'image/x-icon',
        'jpg'   : 'image/jpeg',
        'png'   : 'image/png',
        'gif'   : 'image/gif',
        'svg'   : 'image/svg+xml',
        'json'  : 'application/json',
        'xml'   : 'text/xml',
        'bin'   : 'application/octet-stream',
        'mp3'   : 'audio/mpeg',
        'ogg'   : 'audio/ogg',
        'mp4'   : 'video/mpeg',
        'ogv'   : 'video/ogg',
        'webm'   : 'video/webm',
        'ttf'  : 'font/ttf',
        'woff'  : 'font/woff'
    };

console.log('Server Running on port ' + port.toString() + '\n');

module.exports = http.createServer(function(request,response){
    //debugger;
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(),uri);
    console.log(request.url); //basic console.log
    console.log(filename);
    fs.exists(filename,function(exists){
        if(!exists){
            response.writeHeader(404, {'Content-Type': 'text/plain'});
            response.write('404 Not Found\n');
            response.end();
            return;
        }
        if(fs.lstatSync(filename).isDirectory()) {
            response.writeHead(301, {'Location': path.join(process.cwd(),'index.html') });
            response.end();
            return;
        }
        var type = filename.split('.');
        type = type[type.length - 1];
        response.writeHead(200, { 'Content-Type': (types[type] || types['bin']) + '; charset=utf-8' });
        fs.createReadStream(filename).pipe(response);
    });
}).listen(parseInt(port, 10));
