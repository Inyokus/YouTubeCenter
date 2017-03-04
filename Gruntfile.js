module.exports = function(grunt) {

    // Initialize properties (app name, translations, ...)
    var properties = grunt.file.readJSON("properties.json");
    properties['ant-database-language'] = grunt.file.read("language.json");

    // Constants
    var IDENTIFIERS = {
        userscript: 0,
        chrome: 1,
        maxthon: 2,
        safari: 4,
        opera: 5,
        firefox: 6,
        scriptish: 7,
        chrome_webstore: 8
    };

    var PATHS = {
        src: "src/",
        build: "grunt/",
        dist: "grunt/"
    };
    PATHS.styles = {
        srcDir: PATHS.src + ".styles/",
        buildDir: PATHS.build + "styles/"
    };
    PATHS.common = {
        src: PATHS.src + "YouTubeCenter.user.js",
        build: PATHS.build + "YouTubeCenter.user.js"
    };
    PATHS.userscript = {
        src: PATHS.src + "YouTubeCenter.user.js",
        build: PATHS.build + "YouTubeCenter.user.js",
        dist: PATHS.dist + "YouTubeCenter.user.js"
    };
    PATHS.userscript_meta = {
        src: PATHS.src + "user_script_header.js",
        dist: PATHS.dist + "YouTubeCenter.meta.js"
    };
    PATHS.firefox = {
        srcDir: PATHS.src + ".firefox/",
        dist: PATHS.dist + "YouTubeCenter.xpi"
    };

    // Task configuration
    grunt.initConfig({
        set_identifier: IDENTIFIERS,
        preprocess: {
            build: {
                src: PATHS.common.src,
                dest: PATHS.common.build
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
            dist: {
                src: PATHS.userscript.build,
                dest: PATHS.userscript.dist
            },
            meta: {
                src: PATHS.userscript_meta.src,
                dest: PATHS.userscript_meta.dist
            },
            build: {
                src: PATHS.common.build,
                dest: PATHS.common.build
            }
        },
        cssmin: {
            dist: {
                expand: true,
                cwd: PATHS.styles.srcDir,
                src: "*.css",
                dest: PATHS.styles.buildDir
            }
        },
        compress: {
            firefox: {
                options: {
                    mode: 'zip',
                    archive: PATHS.firefox.dist
                },
                files: {
                    src: [PATHS.common.build, PATHS.firefox.srcDir + "*"]
                }
            }
        }
    });

    //Load/Set up tasks that have a configuration
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerMultiTask('set_identifier', function () {
        properties.identifier = this.data;
    });


    // Register function only tasks
    grunt.registerTask('load-css', function () {
        grunt.file.expandMapping(PATHS.styles.buildDir + "*.css", "", {ext: "", flatten: true}).forEach(function (file) {
            properties['styles-' + file.dest] = grunt.file.read(file.src);
        });
    });


    // Common tasks
    grunt.registerTask('for_all', ['preprocess', 'cssmin', 'load-css']);
    grunt.registerTask('common', ['for_all', 'replace:build']);

    // Userscript tasks
    grunt.registerTask('userscript_bare', ['set_identifier:userscript', 'for_all', 'replace:dist']);
    grunt.registerTask('userscript_meta', ['replace:meta']);

    // Public tasks
    grunt.registerTask('firefox', ['set_identifier:firefox', 'common', 'compress:firefox']);
    grunt.registerTask('userscript', ['userscript_bare', 'userscript_meta']);
};