//This is to be run with phantom.cmd
console.log('Loading a web page');
var page = require('webpage').create();

//TODO: Set the URL you want to debug - set breakpoints in the Javascript code using the debugger; statement
//TODO: Open http://127.0.0.1:9000/ in chrome and click about:blank, then launch __run() in the console
//TODO: As explained in http://phantomjs.org/troubleshooting.html
var url = 'http://localhost:63342/Kidoju.Widgets/test/browsers/kidoju.widgets.navigation.test.html';


page.onResourceRequested = function (request) {
    console.log('Request ' + JSON.stringify(request, undefined, 4));
};
page.onConsoleMessage = function(msg) {
    console.log(msg);
};
page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};
page.open(url, function (status) {
    //Page is loaded!
    phantom.exit();
});
