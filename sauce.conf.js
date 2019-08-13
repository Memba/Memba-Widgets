/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

const path = require('path');

// Karma configuration
module.exports = config => {
    // Example set of browsers to run on Sauce Labs
    // Check out https://saucelabs.com/platforms for all browser/platform combos
    const customLaunchers = {
        sl_ie_9: {
            base: 'SauceLabs',
            platform: 'Windows 7',
            browserName: 'internet explorer',
            version: '9'
        },
        sl_ie_10: {
            base: 'SauceLabs',
            platform: 'Windows 8',
            browserName: 'internet explorer',
            version: '10'
        },
        sl_ie_11: {
            base: 'SauceLabs',
            platform: 'Windows 8.1',
            browserName: 'internet explorer',
            version: '11'
        },
        sl_chrome_34: {
            base: 'SauceLabs',
            platform: 'Windows 7',
            browserName: 'chrome',
            version: '34'
        },
        sl_firefox_27: {
            base: 'SauceLabs',
            platform: 'Linux',
            browserName: 'firefox',
            version: '27'
        },
        sl_firefox_28: {
            base: 'SauceLabs',
            platform: 'Linux',
            browserName: 'firefox',
            version: '28'
        },
        sl_ios_safari: {
            base: 'SauceLabs',
            platform: 'OS X 10.9',
            browserName: 'iphone',
            version: '7.1'
        },
        sl_android: {
            base: 'SauceLabs',
            platform: 'Linux',
            browserName: 'android',
            version: '4.3'
        }
    };

    config.set({
        // mocha configuration
        client: {
            mocha: {
                ui: 'bdd',
                timeout: 10000
            }
        },

        // saucelabs configuration
        sauceLabs: {
            startConnect: true,
            testName: 'Kidoju.Widgets',
            recordVideo: true,
            recordScreenshots: true
        },

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],
        frameworks: ['mocha', 'sinon-chai'],

        // list of files / patterns to load in the browser
        // See: http://karma-runner.github.io/0.12/config/files.html
        files: [
            // LESS/CSS Stylesheets have to be included
            /*
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
             */
            // SCSS/CSS Stylesheets have to be included
            {
                pattern: 'src/styles/themes/app.theme.bootstrap.css',
                served: true,
                included: true
            },
            // External jQuery and polyfill
            {
                pattern: 'src/js/vendor/jquery/jquery-3.4.1.min.js',
                served: true,
                included: true
            },
            {
                pattern: 'test/vendor/polyfill.min.js',
                served: true,
                included: true
            },
            // Other files made available on demand
            {
                pattern: 'src/js/**/*.es6',
                served: true,
                included: false
            },
            {
                pattern: 'src/js/**/*.js',
                served: true,
                included: false
            },
            {
                pattern: 'src/js/**/*.mjs',
                served: true,
                included: false
            },
            {
                pattern: 'src/styles/**/*.css',
                served: true,
                included: false
            },
            // Our mocha tests
            {
                // pattern: 'test/browser/**/*.test.es6',
                pattern: 'test/browser/{app,data}/*.test.es6',
                // pattern: 'test/browser/app/*.test.es6',
                // pattern: 'test/browser/data/*.test.es6',
                // pattern: 'test/browser/common/*.test.es6',
                // pattern: 'test/browser/dialogs/*.test.es6',
                // pattern: 'test/browser/editors/*.test.es6',
                // pattern: 'test/browser/experiments/*.test.es6',
                // pattern: 'test/browser/tools/*.test.es6',
                // pattern: 'test/browser/widgets/*.test.es6',
                served: true,
                included: true // They need to be included!
            },
            // Our test data
            {
                pattern: 'test/data/**/*',
                served: true,
                included: false
            }
        ],

        // list of files to exclude
        exclude: ['/**/Thumbs.db'],

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
                        // Append  module.exports = JSC; to jscheck.js
                        // @see https://webpack.js.org/loaders/exports-loader/
                        test: require.resolve(
                            path.join(__dirname, '/test/vendor/jscheck.js')
                        ),
                        use: 'exports-loader?JSC'
                    },
                    {
                        // Prepend var jQuery = require("jquery"); to jquery.simulate.js.js.
                        // @see https://webpack.js.org/loaders/imports-loader/#usage
                        test: require.resolve(
                            path.join(
                                __dirname,
                                '/test/vendor/jquery.simulate.js'
                            )
                        ),
                        use: [
                            {
                                loader: 'imports-loader',
                                options: { jQuery: 'jquery' }
                            }
                        ]
                    },
                    {
                        // Assign this=window and prevent AMD + CJS loading
                        // @see https://github.com/jakerella/jquery-mockjax/issues/285#issuecomment-342411363
                        // @see https://webpack.js.org/loaders/imports-loader/#disable-amd
                        // @see https://webpack.js.org/guides/shimming/
                        test: require.resolve(
                            path.join(
                                __dirname,
                                '/test/vendor/jquery.mockjax.js'
                            )
                        ),
                        use: [
                            {
                                loader: 'imports-loader',
                                options: {
                                    // define: '>false',
                                    exports: '>false',
                                    this: '>window'
                                }
                            }
                        ]
                    }
                    /* ,
                    {
                        // import sinonChai from 'sinon-chai' does not work
                        // @see https://github.com/domenic/sinon-chai/issues/85
                        // @see https://webpack.js.org/loaders/imports-loader/#disable-amd
                        test: require.resolve('sinon-chai'),
                        use: [
                            {
                                loader: 'imports-loader',
                                options: { require: '>function(){}' }
                            }
                        ]
                    }
                    */
                ]
            },
            resolve: {
                extensions: ['.es6', '.js'],
                modules: [
                    path.resolve(__dirname, 'src/js/vendor/kendo'), // required since Kendo UI 2016.1.112
                    path.resolve(__dirname, 'src/js/vendor/modernizr'),
                    path.resolve(__dirname, 'test/vendor'),
                    'node_modules'
                ]
            }
        },

        /*
        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            // noInfo: false,
            stats: 'errors-only'
        },
        */

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'saucelabs'],

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
        // browsers: ['Chrome', 'IE', 'Safari', 'Firefox', 'PhantomJS'],
        customLaunchers,
        browsers: Object.keys(customLaunchers),

        // Increase timeout in case connection in CI is slow
        captureTimeout: 120000,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true

        // Concurrency (Infinity by default)
        // concurrency: 1
    });
};
