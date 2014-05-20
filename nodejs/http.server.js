//http://www.hongkiat.com/blog/node-js-server-side-javascript/
//http://stackoverflow.com/questions/6084360/node-js-as-a-simple-web-server

//Install: add --debug=8081 in Node parameters

var sys = require("sys"),
    my_http = require("http"),
    path = require("path"),
    url = require("url"),
    filesys = require("fs");

my_http.createServer(function(request,response){
    //debugger;
    sys.puts(request.url);
    var my_path = url.parse(request.url).pathname;
    var full_path = path.join(process.cwd(),my_path);
    sys.puts(full_path);
    //path.exists(full_path,function(exists){
    filesys.exists(full_path,function(exists){
        if(!exists){
            response.writeHeader(404, {'Content-Type': "text/plain"});
            response.write("404 Not Found\n");
            response.end();
        }
        else{
            filesys.readFile(full_path, 'binary', function(err, file) {
                if(err) {
                    response.writeHeader(500, {'Content-Type': 'text/plain'});
                    response.write(err + '\n');
                    response.end();

                }
                else{
                    switch(path.extname(full_path)){
                        case '.html':
                        case '.htm':
                            response.writeHeader(200, {'Content-Type': 'text/html'});
                            break;
                        case '.txt':
                            response.writeHeader(200, {'Content-Type': 'text/plain'});
                            break;
                        case '.css':
                            response.writeHeader(200, {'Content-Type': 'text/css'});
                            break;
                        case '.js':
                            response.writeHeader(200, {'Content-Type': 'text/javascript'});
                            break;
                        case '.jpg':
                            response.writeHeader(200, {'Content-Type': 'image/jpeg'});
                            break;
                        case '.png':
                            response.writeHeader(200, {'Content-Type': 'image/png'});
                            break;
                        case '.gif':
                            response.writeHeader(200, {'Content-Type': 'image/gif'});
                            break;
                        case '.svg':
                            response.writeHeader(200, {'Content-Type': 'image/svg+xml'});
                            break;
                        case '.json':
                            response.writeHeader(200, {'Content-Type': 'application/json'});
                            break;
                        case '.xml':
                            response.writeHeader(200, {'Content-Type': 'text/xml'});
                            break;
                        default:
                            response.writeHeader(200, {'Content-Type': 'application/octet-stream'});
                            break;
                    }

                    response.write(file, "binary");
                    response.end();
                }

            });
        }
    });
}).listen(8080);
sys.puts("Server Running on 8080");			
