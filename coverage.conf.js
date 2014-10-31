// Karma configuration
// Generated on Mon May 19 2014 13:48:20 GMT+0100 (GMT Summer Time)

module.exports = function(config) {

    'use strict';

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        //frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],
        frameworks: ['mocha', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'http://code.jquery.com/jquery-1.9.1.min.js',
            'http://cdn.kendostatic.com/2014.2.1008/js/kendo.all.min.js',
            {pattern: 'src/js/*.js', served: true, included: false},
            {pattern: 'src/*.html', served: true, included: false},
            'test/browsers/*.js'
        ],

        // list of files to exclude
        exclude: [

        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/js/*.js': ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome', 'IE', 'Safari', 'Firefox', 'PhantomJS'],
        //browsers: ['PhantomJS'],

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
