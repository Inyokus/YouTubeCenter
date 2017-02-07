/* Localization */

ytcenter.language = (function(){
    function __setElementText(lang, elm, name, type, replace) {
        if (type.indexOf("@") === 0) {
            elm[type.substring(1)] = ytcenter.utils.replaceTextAsString(lang[name], replace);
        } else {
            elm.setAttribute(type, ytcenter.utils.replaceTextAsString(lang[name], replace));
        }
    }
    var db = [];
    var currentLang = {};
    var defaultLang = "en-US";

    var exports = {};
    /**
     * Adds an element to the database which will then be updated when the update function is called.
     * @elm The element which will get the update.
     * @name The locale name which will be used to update the text.
     * @type The type of how the element will be manipulated. If there's an @ followed by textContent it will update the textContent or else it's an argument.
     */
    exports.addLocaleElement = function(elm, name, type, replace) {
        replace = replace || {};
        db.push([elm, name, type, replace]);
    };

    exports.getLanguage = function(language){
        return ytcenter.languages[language];
    };
    /**
     * Gets the locale for the specific locale name.
     */
    exports.getLocale = function(name, language){
        if (!currentLang) currentLang = exports.getLanguage(defaultLang);
        if (typeof language !== "string" && currentLang.hasOwnProperty(name)) {
            return currentLang[name];
        } else if (ytcenter.languages.hasOwnProperty(language)) {
            return exports.getLanguage(language)[name];
        } else {
            return null;
        }
    };
    /**
     * Updates all elements added to the database with the given language.
     * @lang The array with the specific language data.
     */
    exports.update = function(lang, doNotRecurse){
        lang = lang || ytcenter.settings.language;
        if (lang === "auto") {
            if (uw.yt && uw.yt.getConfig && uw.yt.getConfig("PAGE_NAME")) {
                if (uw.yt.config_.FEEDBACK_LOCALE_LANGUAGE && ytcenter.languages.hasOwnProperty(uw.yt.config_.FEEDBACK_LOCALE_LANGUAGE)) {
                    lang = uw.yt.config_.FEEDBACK_LOCALE_LANGUAGE;
                } else if (uw.yt.config_.SANDBAR_LOCALE && ytcenter.languages.hasOwnProperty(uw.yt.config_.SANDBAR_LOCALE)) {
                    lang = uw.yt.config_.SANDBAR_LOCALE;
                } else if (uw.yt.config_.HL_LOCALE && ytcenter.languages.hasOwnProperty(uw.yt.config_.HL_LOCALE)) {
                    lang = uw.yt.config_.HL_LOCALE;
                } else {
                    lang = ytcenter.settings.defaultLanguage || defaultLang;
                }
            } else {
                lang = ytcenter.settings.defaultLanguage || defaultLang;
                if (!doNotRecurse) {
                    con.log("Language set to " + lang + " because it could not be auto-detected yet");
                    var languageUpdateCounter = 0;
                    var languageUpdateInterval = uw.setInterval((function(){
                        if (uw.yt && uw.yt.getConfig && uw.yt.getConfig("PAGE_NAME")) {
                            uw.clearInterval(languageUpdateInterval);
                            ytcenter.language.update("auto", true);
                        } else if (++languageUpdateCounter >= 100) {
                            uw.clearInterval(languageUpdateInterval);
                            con.log("YouTube configuration data is inaccessible; giving up on language auto-detection.");
                        }
                    }).bind(this), 500);
                } else {
                    con.log("Language set to " + lang + " because auto-detection failed unexpectedly");
                }
            }
        }
        if (!ytcenter.languages[lang]) lang = defaultLang;
        if (ytcenter.settings.defaultLanguage !== lang) {
            ytcenter.settings.defaultLanguage = lang;
            ytcenter.saveSettings();
        }
        currentLang = ytcenter.languages[lang];
        for (var i = 0; i < db.length; i++) {
            __setElementText(currentLang, db[i][0], db[i][1], db[i][2], db[i][3]);
        }
        ytcenter.events.performEvent("language-refresh");
        //ytcenter.events.performEvent("settings-update");
    };

    return exports;
})();
ytcenter.languages = @ant-database-language@;