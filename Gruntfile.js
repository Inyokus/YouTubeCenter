module.exports = function(grunt) {
    var properties = grunt.file.readJSON('properties.json');
    properties["ant-database-language"] = grunt.file.read("language.json");



    grunt.initConfig({
        preprocess: {
            dist: {
                src: "src/YouTubeCenter.user.js",
                dest: "grunt/YouTubeCenter.user.js"
            }
        },
        replace: {
            dist: {
                src: "grunt/YouTubeCenter.user.js",
                overwrite: true,
                replacements: [{
                    from: /\@([a-zA-Z0-9\-_]*?)\@/g,
                    to: function (matchedWord, index, fullText, regexMatches) {
                        if (properties[regexMatches[0]] !== undefined) {
                            return properties[regexMatches[0]]
                        } else {
                            grunt.log.writeln("Key not found: " + regexMatches[0]);
                            return matchedWord;
                        }
                    }
                }]
            }
        },
        cssmin: {
            dist: {
                expand: true,
                cwd: "src/.styles/",
                src: "*.css",
                dest: "grunt/styles/"
            }
        }
    });

    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks("grunt-contrib-cssmin");

    grunt.registerTask("load-css", function () {
        grunt.file.expandMapping("grunt/styles/*.css", "", {ext: "", flatten: true}).forEach(function (file) {
            properties["styles-" + file.dest] = grunt.file.read(file.src);
        });
    });

    grunt.registerTask('userscript' , ["cssmin", "load-css", "preprocess", "replace"])
};