/**
 * Copyright (c) 2013-2014 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba/Kidoju-Platform
 */

module.exports = grunt => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            files: [
                'gruntfile.js',
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
                config: '.jscsrc'
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
                // options here to override JSHint defaults
                jshintrc: '.jshintrc'
                /*
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
                */
            }
        },
        /*
        kendo_lint: {
            files: ['src/js/kidoju.*.js']
        },
        */
        mocha: {
            // Tests running in a browser (phantomJS)
            browser: {
                options: {
                    // debug: true,
                    log: true,
                    logErrors: true,
                    reporter: 'Spec',
                    run: true,
                    timeout: 20000
                },
                src: ['test/browser/*.test.html']
            }
        },
        mochaTest: {
            // Test running in nodeJS (supertest, zombie, ...)
            zombie: {
                options: {
                    debug: true,
                    quiet: false,
                    reporter: 'spec',
                    timeout: 10000,
                    ui: 'bdd'
                },
                src: ['test/node/zombie/*.test.js']
            }
        },
        stylelint: {
            options: {
                configFile: '.stylelintrc'
            },
            src: ['src/styles/**/*.{css,less,scss}']
        }
        /*
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/js/',
                    outdir: 'docs/yui/'
                }
            }
        }
        */
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-jsdoc');
    // grunt.loadNpmTasks('grunt-kendo-lint');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-stylelint');

    grunt.registerTask('lint', ['eslint', 'jscs', 'jshint', 'stylelint']);
    grunt.registerTask('test', ['mocha']); // , 'mochaTest']);
    grunt.registerTask('default', ['lint', 'test']);
};
