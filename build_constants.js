module.exports = function () {
    var c = {};

    c.MAIN_ARTIFACT_NAME = "YouTubeCenter.user.js";

    c.PATHS = {
        src: "src/",
        build: "grunt/",
        dist: "grunt/dist/"
    };
    c.PATHS.styles = {
        srcDir: c.PATHS.src + ".styles/",
        buildDir: c.PATHS.build + "styles/"
    };
    c.PATHS.common = {
        src: c.PATHS.src + c.MAIN_ARTIFACT_NAME,
        build: c.PATHS.build + c.MAIN_ARTIFACT_NAME
    };
    c.PATHS.userscript = {
        src: c.PATHS.src + c.MAIN_ARTIFACT_NAME,
        build: c.PATHS.build + c.MAIN_ARTIFACT_NAME,
        dist: c.PATHS.dist + c.MAIN_ARTIFACT_NAME
    };
    c.PATHS.userscript_meta = {
        src: c.PATHS.src + "user_script_header.js",
        dist: c.PATHS.dist + "YouTubeCenter.meta.js"
    };
    c.PATHS.firefox = {
        srcDir: c.PATHS.src + ".firefox/",
        buildDir: c.PATHS.build + "firefox/",
        dist: c.PATHS.dist + "YouTubeCenter.xpi"
    };

    return c;
}();