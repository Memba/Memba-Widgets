# Important Note

There are several conditions to meet so that browser tests can run:

1. when launching any browser,
2. via Karma configuration,
3. via grunt-mocha.

1 & 2 use a web server so conditions are less drastic. 3 loads files from the file system.

Since we are using an iFrame, this raises security issues (same origin policy).
Unfortunately, setting ```webSecurityEnabled: false``` as explained in [grunt-mocha documentation](https://github.com/kmiyashiro/grunt-mocha#optionspage) does not work.
So all CSS and script files need to be loaded from the same location as the HTML file loaded in the iFrame, which prevents the use of CDN.

For whatever reason, though, Karma won't work if the CDN version of jQuery is not loaded in the xxxx.conf.js file (see coverage.conf.js)

```
// list of files / patterns to load in the browser
files: [
    'http://code.jquery.com/jquery-1.9.1.min.js', //IMPORTANT: This is required although jQuery is also in the path below!
    //'http://cdn.kendostatic.com/2014.2.1008/js/kendo.all.min.js',
    {pattern: 'src/*.html', served: true, included: false},
    {pattern: 'src/styles/*.css', served: true, included: false},
    {pattern: 'src/js/**/*.js', served: true, included: false},
    'test/browsers/*.js'
],
```

Karma uses a base path which is set in our conf.js files to an emtpy string.
So in our test.js files, we need to replace the path of our fixtures in the before hook as reproduced below.
See memba.rating.test.js.

```
if (window && window.__karma__  && window.__karma__.VERSION) {
    FIXTURE = FIXTURE.replace('../..', '/base');
}
```

Finally grunt-mocha is configured to run tests automatically. We set ```run:true``` in Gruntfile.js.
As recommended in the [grunt-mocha documentation](https://github.com/kmiyashiro/grunt-mocha#optionsrun),
we should disable running tests in the page script, only in this configuration:

```
// Only tests run in real browser, injected script run if options.run == true
if (navigator.userAgent.indexOf('PhantomJS') < 0) {
    mocha.run();
}
```

Since we also run PhantomJS in Karma, we cannot use the recommended test.
Instead we use a [hack](https://github.com/kmiyashiro/grunt-mocha#hacks):

```
if (!window.PHANTOMJS) {
    mocha.run();
}
```
