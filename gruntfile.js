/**
 * Copyright (c) 2013-2014 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba/Kidoju-Platform
 */

/* jslint node: true */
/* jshint node: true */

'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/'],
        concat: {
            css: {
                src: ['src/styles/kidoju*.css'],
                dest: 'dist/styles/<%= pkg.name %>.css'
            },
            js: {
                options: {
                    separator: '\n;\n',
                    process: function(src /*, filepath*/) {
                        //Replace DEBUG = true with DEBUG = false
                        return src.replace(/DEBUG[\s]*=[\s]*true/gm, 'DEBUG = false');
                    }
                },
                src: [/*'src/js/vendor/*.js',*/ 'src/js/kidoju*.js'],
                dest: 'dist/js/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '// <%= pkg.name %> <%= pkg.version %> built on <%= grunt.template.today("dd-mm-yyyy") %> - <%= pkg.copyright %>\n',
                sourceMap: 'dist/js/<%= pkg.name %>.map',
                sourceMappingURL: '<%= pkg.name %>.map'
            },
            dist: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
                }
            }
        },
        mocha: {
            unit: { //In browser unit tests
                src: ['test/unit/kidoju*.html'],
                options: {
                    run: true,
                    log: true,
                    debug: true,
                    timeout: 5000,
                    reporter: 'Spec'
                }
            }
        },
        mochaTest: { //zombie
            ui: {
                src: ['test/ui/kidoju*.js'],
                options: {
                    debug: true,
                    reporter: 'spec'
                }
            }
        },
        jshint: {
            files: ['gruntfile.js', 'src/js/kidoju*.js', 'test/ui/*.js', 'test/unit/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        kendo_lint: { // TODO: html too
            files: ['src/js/kidoju*.js']
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'mocha']
        },
        csslint: {
            strict: {
                options: {
                    import: 2
                },
                src: ['src/styles/kidoju.*.css']
            }
        },
        cssmin: {
            add_banner: {
                options: {
                    banner: '/* <%= pkg.name %> <%= pkg.version %> built on <%= grunt.template.today("dd-mm-yyyy") %> - <%= pkg.copyright %> */\n'
                },
                files: {
                    'dist/styles/kidoju.widgets.min.css': ['<%= concat.css.dest %>']
                }
            }
        },
        copy: {
            dist: {
                // options: {
                //    process: function(src, filepath) {
                //        //Replace with min versions
                //        var ret;
                //        if (filepath === 'src/js/init.js'){
                //            ret = src
                //                .replace(/DEBUG[\s]*=[\s]*true/gm, 'DEBUG = false')
                //                .replace(/init.js/gm, 'init.min.js');
                //        }
                //        return ret || src;
                //    },
                //    noProcess: ['**/*.{png,gif,jpg,ico,psd}'] //otherwise images are corrupeted
                // },
                files: [
                    //{ cwd: 'src/styles', src: ['fonts/**'], dest: 'dist/styles', expand: true },
                    { cwd: 'src/styles', src: ['images/**'], dest: 'dist/styles', expand: true }
                ]
            }

        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/js/',
                    outdir: 'docs/'
                }
            }
        }
    });

    //File management
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    //Javascript
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-kendo-lint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Styles
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //Tests
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-mocha-test');

    //Documentation
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('lint', ['jshint', 'kendo_lint']);
    grunt.registerTask('test', ['mocha', 'mochaTest']);
    grunt.registerTask('default', ['clean', 'lint', 'test', 'concat', 'uglify', 'cssmin', 'copy', 'yuidoc']);

};