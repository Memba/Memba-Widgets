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
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'mocha']
        },
        jshint: {
            files: ['gruntfile.js', 'src/js/kidoju*.js', 'test/browsers/*.js', 'test/zombie/*.js']/*,
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }*/
        },
        kendo_lint: {
            files: ['src/js/kidoju*.js']
        },
        csslint: {
            strict: {
                options: {
                    import: 2
                },
                src: ['src/styles/kidoju.*.css']
            }
        },
        // TODO: Consider linting html too
        mocha: {
            browsers: {
                src: ['test/browsers/kidoju.*.html'],
                options: {
                    run: true,
                    log: true,
                    debug: true,
                    timeout: 5000,
                    reporter: 'Spec'
                }
            }
        },
        mochaTest: {
            zombie: {
                src: ['test/zombie/kidoju.*.js'],
                options: {
                    debug: true,
                    reporter: 'spec'
                }
            }
        },
        clean: ['dist/', 'docs/'],
        copy: {
            /*
            dist: {
                options: {
                    process: function(src, filepath) {
                        //Replace with min versions
                        var ret;
                        if (filepath === 'src/js/init.js'){
                            ret = src
                                .replace(/DEBUG[\s]*=[\s]*true/gm, 'DEBUG = false')
                                .replace(/init.js/gm, 'init.min.js');
                        }
                        return ret || src;
                    },*/
                    //noProcess: ['**/*.{png,gif,jpg,ico,psd}'] //otherwise images are corrupted
                /*},
                files: [
                    //{ cwd: 'src/styles', src: ['fonts/**'], dest: 'dist/styles', expand: true },
                    { cwd: 'src/styles', src: ['images/**'], dest: 'dist/styles', expand: true }
                ]
            },*/
            vendor: {
                files: [{
                    expand: true,
                    cwd: 'src/js/vendor/',
                    src: '**',
                    dest: 'dist/js/vendor/'
                }]
            }
        },
        concat: {
            css: {
                src: ['src/styles/kidoju*.css'],
                dest: 'dist/styles/<%= pkg.filename %>.css'
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
                dest: 'dist/js/<%= pkg.filename %>.js'
            }
        },
        uglify: {
            options: {
                banner: '// <%= pkg.name %> <%= pkg.version %> built on <%= grunt.template.today("dd-mm-yyyy") %> - <%= pkg.copyright %>\n',
                sourceMap: 'dist/js/<%= pkg.filename %>.map',
                sourceMappingURL: '<%= pkg.filename %>.map'
            },
            dist: {
                files: {
                    'dist/js/<%= pkg.filename %>.min.js': ['<%= concat.js.dest %>']
                }
            }
        },
        cssmin: {
            widgets: {
                options: {
                    banner: '/* <%= pkg.name %> <%= pkg.version %> built on <%= grunt.template.today("dd-mm-yyyy") %> - <%= pkg.copyright %> */\n'
                },
                files: {
                    'dist/styles/<%= pkg.filename %>.min.css': ['<%= concat.css.dest %>']
                }
            }
        },
        imagemin: {
            widgets: {
                files: [{
                    expand: true,
                    cwd: 'src/styles/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/styles/images/'
                }]
            }
        },
        jsdoc : {
            dist : {
                src: ['src/**/*.js', 'README.md'],
                options: {
                    destination: 'docs',
                    template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
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

    //Watching
    grunt.loadNpmTasks('grunt-contrib-watch');

    //Linting
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-kendo-lint');
    grunt.loadNpmTasks('grunt-contrib-csslint');

    //Testing
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-mocha-test');

    //Building
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-jsdoc');
    //grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('lint', ['jshint', 'kendo_lint', 'csslint']);
    grunt.registerTask('test', ['mocha', 'mochaTest']);
    grunt.registerTask('build', ['clean', 'copy', 'concat', 'uglify', 'cssmin', 'imagemin', 'jsdoc']);
    grunt.registerTask('default', ['lint', 'test', 'build']);
};
