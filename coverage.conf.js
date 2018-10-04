/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

const path = require('path');

// Karma configuration
module.exports = config => {
    config.set({
        // mocha configuration
        client: {
            mocha: {
                ui: 'bdd',
                timeout: 10000
            }
        },

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // Increase timeout especially for phantomJS
        browserDisconnectTimeout: 5000,

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai'],

        // list of files / patterns to load in the browser
        // See: http://karma-runner.github.io/0.12/config/files.html
        files: [
            // CSS Stylesheets have to be included
            {
                pattern: 'src/styles/vendor/kendo/web/kendo.common.min.css',
                served: true,
                included: true
            },
            {
                pattern: 'src/styles/vendor/kendo/web/kendo.default.min.css',
                served: true,
                included: true
            },
            {
                pattern:
                    'src/styles/vendor/kendo/web/kendo.default.mobile.min.css',
                served: true,
                included: true
            },
            {
                pattern: 'src/styles/vendor/kendo/**/*',
                served: true,
                included: false
            },
            // External jQuery and polyfill
            {
                pattern: 'src/js/vendor/jquery/jquery-3.3.1.min.js',
                served: true,
                included: true
            },
            {
                pattern: 'test/vendor/polyfill.min.js',
                served: true,
                included: true
            },
            // Our mocha tests
            {
                pattern: 'test/browser/**/*.test.es6',
                served: true,
                included: true // They need to be included!
            }
            // served but not included
            // {
            //     pattern: 'test/data/*.json',
            //     served: true,
            //     included: false
            // },
            // {
            //     pattern: 'src/**/*.*',
            //     served: true,
            //     included: false
            // }
        ],

        // list of files to exclude
        exclude: ['**/Thumbs.db'],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // Do not add the coverage preprocessor
            // @see https://github.com/istanbuljs/babel-plugin-istanbul#karma
            // '/src/js/*.js': ['coverage'],
            '/src/js/**/*.es6': ['coverage'],
            'test/browser/**/*.test.es6': ['webpack', 'sourcemap']
        },

        webpack: {
            context: path.join(__dirname, '/'),
            devtool: 'inline-source-map', // Requires --max-old-space-size=4096
            externals: {
                // CDN modules
                jquery: 'jQuery'
            },
            mode:
                process.env.NODE_ENV === 'production'
                    ? 'production'
                    : 'development',
            module: {
                rules: [
                    {
                        test: /\.es6$/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'babel-loader',
                                options: { babelrc: true }
                            }
                        ]
                    },
                    {
                        // import sinonChai from 'sinon-chai' does not work
                        // @see https://github.com/domenic/sinon-chai/issues/85
                        test: require.resolve('sinon-chai'),
                        use: [
                            {
                                loader: 'imports-loader',
                                options: {
                                    require: '>function(){}'
                                }
                            }
                        ]
                    }
                ]
            },
            resolve: {
                extensions: ['.es6', '.js'],
                modules: [
                    '.',
                    path.resolve(__dirname, 'src/js/vendor/kendo'), // required since Kendo UI 2016.1.112
                    path.resolve(__dirname, 'test/browser/vendor'),
                    'node_modules'
                ]
            }
        },

        /*
        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            noInfo: false,
            stats: 'errors-only'
        },
        */

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

        // Configure Chrome headless for Travis
        // @see https://developers.google.com/web/updates/2017/06/headless-karma-mocha-chai#running_it_all_on_travis_ci
        // @see https://docs.travis-ci.com/user/chrome#Karma-Chrome-Launcher
        customLaunchers: {
            ChromeTravis: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox'] // --disable-gpu
            }
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            // 'Chrome'
            // 'ChromeHeadless'
            'ChromeTravis'
            // 'Edge',
            // 'Firefox',
            // 'IE',
            // 'Opera',
            // 'PhantomJS',
            // 'Safari'
        ],

        // optionally, configure the reporter
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true

        // Concurrency (Infinity by default)
        // concurrency: 1
    });
};
