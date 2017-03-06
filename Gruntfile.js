module.exports = function(grunt) {
    var c = require('./build_constants.js');

    // Initialize properties (app name, translations, ...)
    var properties = grunt.file.readJSON("properties.json");
    properties['ant-database-language'] = grunt.file.read("language.json");


    // Task configuration
    grunt.initConfig({
        set_identifier: properties.identifiers,
        preprocess: {
            common: {
                src: c.PATHS.common.src,
                dest: c.PATHS.common.build
            }
        },
        replace: {
            options: {
                patterns: [{
                    match: /@([a-zA-Z0-9\-_]*?)@/g,
                    replacement: function (fullMatch, key) {
                        if (properties[key] !== undefined) {
                            return properties[key]
                        } else {
                            grunt.log.writeln("Key not found: " + key);
                            return fullMatch;
                        }
                    }
                }]
            },
            userscript: {
                src: c.PATHS.userscript.build,
                dest: c.PATHS.userscript.dist
            },
            userscript_meta: {
                src: c.PATHS.userscript_meta.src,
                dest: c.PATHS.userscript_meta.dist
            },
            common: {
                src: c.PATHS.common.build,
                dest: c.PATHS.common.build
            }
        },
        cssmin: {
            common: {
                expand: true,
                cwd: c.PATHS.styles.srcDir,
                src: "*.css",
                dest: c.PATHS.styles.buildDir
            }
        },
        compress: {
            firefox: {
                options: {
                    mode: 'zip',
                    archive: c.PATHS.firefox.dist
                },
                files: {
                    src: [PATHS.common.build, PATHS.firefox.srcDir + "*"]
                }
            }
        },
        shell: {
            git_describe: {
                command: "git describe",
                options: {
                    stdout: false,
                    callback: function (err, stdout, stderr, callback) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        properties.devnumber = stdout.trim();
                        callback();
                    }
                }
            }
        }
    });

    //Load/Set up tasks that have a configuration
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-shell');
    grunt.registerMultiTask('set_identifier', function () {
        properties.identifier = this.data;
    });


    // Register function only tasks
    grunt.registerTask('load_css', function () {
        grunt.file.expandMapping(c.PATHS.styles.buildDir + "*.css", "", {ext: "", flatten: true}).forEach(function (file) {
            properties['styles-' + file.dest] = grunt.file.read(file.src);
        });
    });


    // Common tasks
    grunt.registerTask('for_all', ['shell:git_describe', 'preprocess', 'cssmin', 'load_css']);
    grunt.registerTask('common', ['for_all', 'replace:common']);

    // Userscript tasks
    grunt.registerTask('userscript_bare', ['set_identifier:userscript', 'for_all', 'replace:userscript']);
    grunt.registerTask('userscript_meta', ['replace:userscript_meta']);

    // Public tasks
    grunt.registerTask('firefox', ['set_identifier:firefox', 'common', 'compress:firefox']);
    grunt.registerTask('userscript', ['userscript_bare', 'userscript_meta']);
};