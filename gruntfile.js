/**
 * Copyright (c) 2013-2014 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba/Kidoju-Platform
 */

module.exports = grunt => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            files: [
                '*.js',
                'templates/*.es6',
                'src/js/**/*.es6',
                'test/**/*.es6'
            ],
            options: {
                config: '.eslintrc'
            }
        },
        jscs: {
            files: ['src/js/**/*.js', 'test/**/*.js'],
            options: {
                config: '.jscsrc',
                // There is no .jscsignore file
                excludeFiles: [
                    '*.js',
                    'src/js/vendor/**/*.js',
                    'test/vendor/**/*.js'
                ]
            }
        },
        jsdoc: {
            dist: {
                src: ['src/**/*.es6', 'src/**/*.js', 'README.md'],
                options: {
                    destination: 'docs',
                    template:
                        'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
                    configure:
                        'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json'
                }
            }
        },
        jshint: {
            files: ['src/js/**/*.js', 'test/**/*.js'],
            options: {
                // .jshintignore does ot work with grunt-contrib-jshint
                ignores: [
                    '*.js',
                    'src/js/vendor/**/*.js',
                    'test/vendor/**/*.js'
                ],
                jshintrc: true
            }
        },
        karma: {
            // https://github.com/npm/npm/issues/12238#issuecomment-367147962
            // If webpack runs out of memory on Travis-CI
            unit: {
                configFile: 'coverage.conf.js'
            }
        },
        /*
        kendo_lint: {
            files: ['src/js/kidoju.*.js']
        },
        */
        modernizr: {
            // @see https://github.com/Modernizr/customizr#config-file
            dist: {
                crawl: false,
                customTests: [],
                devFile: false,
                dest: 'src/js/vendor/modernizr/modernizr.js',
                tests: [
                    'atobbtoa',
                    'audio',
                    'blobconstructor',
                    'canvas',
                    'canvastext',
                    'hashchange',
                    'history',
                    'svg',
                    'touchevents',
                    'video',
                    'flexbox',
                    'csstransforms',
                    'filereader',
                    'filesystem',
                    'xhr2',
                    'speechrecognition',
                    'speechsynthesis',
                    'localstorage',
                    'sessionstorage',
                    'svgasimg',
                    'inlinesvg',
                    'bloburls',
                    'datauri',
                    'getusermedia',
                    'webworkers'
                ],
                options: ['setClasses'],
                uglify: false
            }
        },
        stylelint: {
            options: {
                configFile: '.stylelintrc'
            },
            src: ['src/styles/**/*.{css,less,scss}']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-karma');
    // grunt.loadNpmTasks('grunt-kendo-lint');
    grunt.loadNpmTasks('grunt-modernizr');
    grunt.loadNpmTasks('grunt-stylelint');

    grunt.registerTask('lint', ['eslint', 'jscs', 'jshint', 'stylelint']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('default', ['modernizr', 'lint', 'test']);
};
