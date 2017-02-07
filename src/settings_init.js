/* Initializes the settings panel (i.e. adds the option UI-elements) */

var _settingsInit = false;
function settingsInit(){
    var cat, subcat, option;

    if (_settingsInit || !ytcenter.settingsPanel || !ytcenter.__settingsLoaded) return;
    _settingsInit = true;

    /* Category:General */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_TAB_GENERAL");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "language", // defaultSetting
        "list", // Module
        "SETTINGS_LANGUAGE", // label
        { // Args
            "list": function(){
                function sortCompare(a, b) {
                    if (a === "en-US") return -1;
                    if (b === "en-US") return 1;
                    if (ytcenter.languages[a].LANGUAGE < ytcenter.languages[b].LANGUAGE)
                        return -1;
                    if (ytcenter.languages[a].LANGUAGE > ytcenter.languages[b].LANGUAGE)
                        return 1;
                    return 0;
                }
                var sortList = [];
                for (var key in ytcenter.languages) {
                    if (ytcenter.languages.hasOwnProperty(key)) {
                        sortList.push(key);
                    }
                }
                sortList.sort(sortCompare);

                var a = [];
                a.push({
                    "label": "LANGUAGE_AUTO",
                    "value": "auto"
                });
                for (var i = 0, len = sortList.length; i < len; i++) {
                    a.push({
                        "value": sortList[i],
                        "label": (function(key){
                            return function(){
                                return ytcenter.languages[key].LANGUAGE;
                            };
                        })(sortList[i])
                    });
                }
                return a;
            },
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.language.update();
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Multiple_Languages" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "removeAdvertisements", // defaultSetting
        "bool", // module
        "SETTINGS_REMOVEADVERTISEMENTS_LABEL", // label
        null, // args
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Advertisements" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "ytspf", // defaultSetting
        "bool", // module
        "SETTINGS_YTSPF", // label
        null, // args
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-SPF" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "expandDescription", // defaultSetting
        "bool", // module
        "SETTINGS_AUTOEXPANDDESCRIPTION_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Expand_Description"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "headlineTitleExpanded", // defaultSetting
        "bool", // module
        "SETTINGS_AUTOEXPANDTITLE_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Expand_Title"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channelUploadedVideosPlaylist", // defaultSetting
        "bool", // module
        "SETTINGS_CHANNELUPLOADVIDEOSPLAYLIST_LABEL"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "removeYouTubeTitleSuffix", // defaultSetting
        "bool", // module
        "SETTINGS_TITLE_REMOVE_YOUTUBE_SUFFIX", // label
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.title.update();
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_YouTube_Title_Suffix"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerPlayingTitleIndicator", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_PLAYING_INDICATOR", // label
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.title.update();
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Show_Player_Playing_Icon_In_Title"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerOnlyOneInstancePlaying", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_ONLY_ONE_INSTANCE_PLAYING",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Only_One_Player_Instance_Playing"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "google_apikey", // defaultSetting
        "textfield", // module
        "SETTINGS_GOOGLE_API_KEY",
        null,
        "https://developers.google.com/api-client-library/python/guide/aaa_apikeys"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "importexport"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "button",
        null,
        {
            "text": "SETTINGS_RESETSETTINGS_LABEL",
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        var msgElm = document.createElement("h3");
                        msgElm.style.fontWeight = "normal";
                        msgElm.textContent = ytcenter.language.getLocale("SETTINGS_RESETSETTINGS_TEXT");
                        ytcenter.language.addLocaleElement(msgElm, "SETTINGS_RESETSETTINGS_TEXT", "@textContent");

                        var dialog = ytcenter.dialog("SETTINGS_RESETSETTINGS_LABEL", msgElm, [
                            {
                                label: "CONFIRM_CANCEL",
                                primary: false,
                                callback: function(){
                                    dialog.setVisibility(false);
                                }
                            }, {
                                label: "CONFIRM_RESET",
                                primary: true,
                                callback: function(){
                                    ytcenter.settings = ytcenter._settings;
                                    ytcenter.settings.lastUpdated = ytcenter.utils.now();
                                    ytcenter.saveSettings(false, function(){
                                        loc.reload();
                                    });
                                    dialog.setButtonsEnabled(false);
                                }
                            }
                        ]);
                        dialog.setVisibility(true);
                    }
                }
            ]
        }
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_WATCHEDVIDEOS"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "watchedVideosIndicator", // defaultSetting
        "bool", // module
        "SETTINGS_WATCHEDVIDEOS_INDICATOR",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Watched_Videos"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideWatchedVideos", // defaultSetting
        "bool", // module
        "SETTINGS_HIDEWATCHEDVIDEOS",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["hide-watched-videos"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Hide_Watched_Videos"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "button", // module
        null,
        {
            "text": "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY",
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        var msgElm = document.createElement("h3");
                        msgElm.style.fontWeight = "normal";
                        msgElm.textContent = ytcenter.language.getLocale("SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY_CONTENT");
                        ytcenter.language.addLocaleElement(msgElm, "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY_CONTENT", "@textContent");

                        var dialog = ytcenter.dialog("SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY", msgElm, [
                            {
                                label: "CONFIRM_CANCEL",
                                primary: false,
                                callback: function(){
                                    dialog.setVisibility(false);
                                }
                            }, {
                                label: "CONFIRM_CLEAN",
                                primary: true,
                                callback: function(){
                                    ytcenter.settings.watchedVideos = [];
                                    ytcenter.settings.notwatchedVideos = [];
                                    ytcenter.saveSettings(false, function(){
                                        loc.reload();
                                    });
                                    dialog.setButtonsEnabled(false);
                                }
                            }
                        ]);
                        dialog.setVisibility(true);
                    }
                }
            ]
        }
    );
    subcat.addOption(option);


    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LAYOUT"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "hideFooter", // defaultSetting
        "bool", // module
        "SETTINGS_HIDE_FOOTER"
    );
    option.addEventListener('update', function(){
        if (ytcenter.settings.hideFooter) {
            ytcenter.utils.addClass(document.body, "ytcenter-hide-footer");
        } else {
            ytcenter.utils.removeClass(document.body, "ytcenter-hide-footer");
        }
        //ytcenter.classManagement.updateClassesByGroup(["page"]);
    });
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "flexWidthOnPage", // defaultSetting
        "bool", // module
        "SETTINGS_FLEXWIDTHONPAGE_LABEL", // label
        { // args
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["flex"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Flex_Width_on_Page" // help
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "flexWidthOnChannelPage", // defaultSetting
        "bool", // module
        "SETTINGS_FLEXWIDTHONCHANNELPAGE_LABEL", // label
        { // args
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["flex"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Flex_Width_on_Channel" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "gridSubscriptionsPage", // defaultSetting
        "bool", // module
        "SETTINGS_GRIDSUBSCRIPTIONS",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Grid_Subscriptions"
    );
    option.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["gridview"]);
    });

    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "gridCollectionPage", // defaultSetting
        "bool", // module
        "SETTINGS_GRIDCOLLECTIONS",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Grid_Collections"
    );
    option.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["gridview"]);
    });

    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "hideTicker", // defaultSetting
        "bool", // module
        "SETTINGS_HIDE_TICKER",
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Hide_Ticker"
    );
    option.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["hide-ticker"]);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "hideLangAlert", // defaultSetting
        "bool", // module
        "SETTINGS_HIDE_LANG_ALERT"
    );
    option.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["hide-lang"]);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "staticHeader", // defaultSetting
        "bool", // module
        "SETTINGS_STATIC_HEADER"
    );
    option.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["header"]);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "staticHeader_scrollToPlayer", // defaultSetting
        "bool", // module
        "SETTINGS_SCROLLTOPLAYER_LABEL"
    );
    ytcenter.events.addEvent("settings-update", (function(opt){ return function(){ opt.setVisibility(ytcenter.settings.staticHeader); }; })(option));
    option.setVisibility(ytcenter.settings.staticHeader);
    subcat.addOption(option);

    /*option = ytcenter.settingsPanel.createOption(
     "yonezCleanYT", // defaultSetting
     "bool", // module
     "SETTINGS_LAYOUT_YONEZ_CLEAN_YT"
     );
     option.addEventListener("update", function(){
     if (ytcenter.settings.yonezCleanYT) {
     ytcenter.cssElements.yonez.add();
     } else {
     ytcenter.cssElements.yonez.remove();
     }
     });
     subcat.addOption(option);*/

    /* Category:Player */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_PLAYER");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "removeRelatedVideosEndscreen", // defaultSetting
        "bool", // module
        "SETTINGS_REMOVE_RELATED_VIDEOS_ENDSCREEN", // label
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Endscreen"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "player_gap", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_GAP", // label
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "enablePlayerDocking", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_DOCK_ENABLE"
    );
    option.addEventListener("update", ytcenter.playerDocking.update);
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "enableEndscreenAutoplay", // defaultSetting
        "bool", // module
        "SETTINGS_ENDSCREEN_AUTOPLAY",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Play_First_Video_in_Endscreen"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideWatchLaterOnPlayer", // defaultSetting
        "bool", // module
        "SETTINGS_HIDE_WATCH_LATER_ON_PLAYER"
    );
    option.addEventListener("update", ytcenter.utils.bind(null, ytcenter.classManagement.updateClassesByGroup, ["html5player"]));
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "likeSwitchToTab",
        "list",
        "SETTINGS_SWITCHTOTAB_LIKE",
        {
            "list": [
                { "value": "none", "label": "SETTINGS_SWITCHTOTAB_NONE" },
                { "value": "share", "label": "SETTINGS_SWITCHTOTAB_SHARE" }/*,
                 { "value": "stats", "label": "SETTINGS_SWITCHTOTAB_STATS" },
                 { "value": "report", "label": "SETTINGS_SWITCHTOTAB_REPORT" },
                 { "value": "ratings-disabled", "label": "SETTINGS_SWITCHTOTAB_RATINGS_DISABLED" },
                 { "value": "rental-required", "label": "SETTINGS_SWITCHTOTAB_RENTAL_REQUIRED" },
                 { "value": "error", "label": "SETTINGS_SWITCHTOTAB_ERROR" }*/
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Switch_To_Tab_At_Like_of_Video"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "endOfVideoAutoSwitchToTab",
        "list",
        "SETTINGS_SWITCHTOTAB_ENDOFVIDEO",
        {
            "list": [
                { "value": "none", "label": "SETTINGS_SWITCHTOTAB_NONE" },
                { "value": "share", "label": "SETTINGS_SWITCHTOTAB_SHARE" },
                { "value": "stats", "label": "SETTINGS_SWITCHTOTAB_STATS" },
                { "value": "report", "label": "SETTINGS_SWITCHTOTAB_REPORT" },
                { "value": "ratings-disabled", "label": "SETTINGS_SWITCHTOTAB_RATINGS_DISABLED" },
                { "value": "rental-required", "label": "SETTINGS_SWITCHTOTAB_RENTAL_REQUIRED" },
                { "value": "error", "label": "SETTINGS_SWITCHTOTAB_ERROR" },
                { "value": "mysubscriptions", "label": "SETTINGS_SWITCHTOTAB_MYSUBSCRIPTIONS" }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Switch_To_Tab_At_End_of_Video"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "dashPlayback", // defaultSetting
        "bool", // module
        "SETTINGS_DASHPLAYBACK",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-DASH_Playback"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "forcePlayerType", // defaultSetting
        "list", // module
        "SETTINGS_FORCEPLAYERTYPE",
        {
            "list": [
                { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
                { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
                { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" },
                { "value": "aggressive_flash", "label": "SETTINGS_FORCEPLAYERTYPE_AGGRESSIVE_FLASH" }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Type"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "autohide", // defaultSetting
        "list", // module
        "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
        {
            "list": [
                {
                    "value": "-1",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_DEFAULT"
                }, {
                    "value": "0",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
                }, {
                    "value": "1",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
                }, {
                    "value": "2",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
                }, {
                    "value": "3",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.page === "watch") {
                            ytcenter.player.setAutoHide(ytcenter.settings.autohide);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Hide_Bar"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "playerTheme", // defaultSetting
        "list", // module
        "SETTINGS_PLAYERTHEME_LABEL",
        {
            "list": [
                {
                    "value": "dark",
                    "label": "SETTINGS_PLAYERTHEME_DARK"
                }, {
                    "value": "light",
                    "label": "SETTINGS_PLAYERTHEME_LIGHT"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.page === "watch") {
                            ytcenter.player.setTheme(ytcenter.settings.playerTheme);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Theme"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "playerColor", // defaultSetting
        "list", // module
        "SETTINGS_PLAYERCOLOR_LABEL",
        {
            "list": [
                {
                    "value": "red",
                    "label": "SETTINGS_PLAYERCOLOR_RED"
                }, {
                    "value": "white",
                    "label": "SETTINGS_PLAYERCOLOR_WHITE"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.page === "watch") {
                            ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Color"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "flashWMode", // defaultSetting
        "list", // module
        "SETTINGS_WMODE_LABEL",
        {
            "list": [
                {
                    "value": "none",
                    "label": "SETTINGS_WMODE_NONE"
                }, {
                    "value": "window",
                    "label": "SETTINGS_WMODE_WINDOW"
                }, {
                    "value": "direct",
                    "label": "SETTINGS_WMODE_DIRECT"
                }, {
                    "value": "opaque",
                    "label": "SETTINGS_WMODE_OPAQUE"
                }, {
                    "value": "transparent",
                    "label": "SETTINGS_WMODE_TRANSPARENT"
                }, {
                    "value": "gpu",
                    "label": "SETTINGS_WMODE_GPU"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Flash_WMode"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "enableAnnotations", // defaultSetting
        "bool", // module
        "SETTINGS_ENABLEANNOTATIONS_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Annotations"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "line"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideHeaderWhenPlayerPlaying", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_PLAYING_HIDE_HEADER"
    );
    option.addEventListener("update", ytcenter.hideHeaderWhenPlayerPlaying.update);
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideHeaderWhenPlayerPlayingTransition", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_PLAYING_HIDE_HEADER_TRANSITION"
    );
    option.addEventListener("update", ytcenter.hideHeaderWhenPlayerPlaying.updateTransition);
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideHeaderWhenPlayerPlayingTransitionTime", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYER_PLAYING_HIDE_HEADER_TRANSITION_TIME",
        {
            "min": 0,
            "max": 5000,
            "suffix": " ms"
        }
    );
    option.addEventListener("update", ytcenter.hideHeaderWhenPlayerPlaying.updateTransitionTime);
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideHeaderWhenPlayerPlayingMouseVisibility", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_PLAYING_HIDE_HEADER_MOUSE_ENABLED"
    );
    option.addEventListener("update", ytcenter.hideHeaderWhenPlayerPlaying.updateEventListeners);
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideHeaderWhenPlayerPlayingMouseThreshold", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYER_PLAYING_HIDE_HEADER_MOUSE_THRESHOLD",
        {
            "min": 0,
            "max": 500,
            "suffix": "px"
        }
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "hideHeaderWhenPlayerPlayingFocus", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYER_PLAYING_HIDE_HEADER_FOCUS_ENABLED"
    );
    option.addEventListener("update", ytcenter.hideHeaderWhenPlayerPlaying.updateEventListeners);
    subcat.addOption(option);
    /*option = ytcenter.settingsPanel.createOption(
     "hideHeaderWhenPlayerPlayingKeepScrollPosition", // defaultSetting
     "bool", // module
     "SETTINGS_PLAYER_PLAYING_HIDE_HEADER_KEEP_SCROLL_POSITION"
     );
     subcat.addOption(option);*/
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "bufferEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_BUFFER_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Enable_custom_buffer"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "bufferSize", // defaultSetting
        "rangetext", // module
        "SETTINGS_BUFFER_SIZE",
        {
            "min": 0, /* 0 bytes - I have no idea if this will break something */
            "max": 1099511627776, /* 1 TB - Why not... */
            "suffix": " B",
            "text-width": "135px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Custom_buffer_size"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "line"
    );
    subcat.addOption(option);

    /*option = ytcenter.settingsPanel.createOption(
     "removeBrandingBanner", // defaultSetting
     "bool", // module
     "SETTINGS_BRANDING_BANNER_REMOVE", // label
     {
     "listeners": [
     {
     "event": "click",
     "callback": function(){
     ytcenter.events.performEvent("ui-refresh");
     }
     }
     ]
     },
     "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_Banner"
     );
     subcat.addOption(option);*/
    /*option = ytcenter.settingsPanel.createOption(
     "removeBrandingBackground", // defaultSetting
     "bool", // module
     "SETTINGS_BRANDING_BACKGROUND_REMOVE", // label
     {
     "listeners": [
     {
     "event": "click",
     "callback": function(){
     ytcenter.events.performEvent("ui-refresh");
     }
     }
     ]
     },
     "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_Background"
     );
     subcat.addOption(option);*/
    option = ytcenter.settingsPanel.createOption(
        "removeBrandingWatermark", // defaultSetting
        "bool", // module
        "SETTINGS_BRANDING_WATERMARK_REMOVE", // label
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_Watermark"
    );
    subcat.addOption(option);
    if (devbuild) {
        option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "line"
        );
        subcat.addOption(option);
        option = ytcenter.settingsPanel.createOption(
            "enable_custom_fexp", // defaultSetting
            "bool", // module
            "SETTINGS_ENABLE_CUSTOM_FEXP"
        );
        subcat.addOption(option);
        option = ytcenter.settingsPanel.createOption(
            "custom_fexp", // defaultSetting
            "textfield", // module
            "SETTINGS_CUSTOM_FEXP"
        );
        subcat.addOption(option);
    }

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_AUTOPLAY"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "preventAutoPlay", // defaultSetting
        "bool", // module
        "SETTINGS_PREVENTAUTOPLAY_LABEL", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_AutoPlay"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventAutoBuffer", // defaultSetting
        "bool", // module
        "SETTINGS_PREVENTAUTOBUFFERING_LABEL", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_AutoBuffering"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventPlaylistAutoPlay", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYLIST_PREVENT_AUTOPLAY", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_Playlist_AutoPlay"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventPlaylistAutoBuffer", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYLIST_PREVENT_AUTOBUFFERING", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_Playlist_AutoBuffering"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventTabAutoPlay", // defaultSetting
        "bool", // module
        "SETTINGS_PREVENTTABAUTOPLAY_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_Tab_AutoPlay"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventTabAutoBuffer", // defaultSetting
        "bool", // module
        "SETTINGS_PREVENTTABAUTOBUFFERING_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_Tab_AutoBuffering"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventTabPlaylistAutoPlay", // defaultSetting
        "bool", // module
        "SETTINGS_PREVENTTABPLAYLISTAUTOPLAY_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_Tab_Playlist_AutoPlay"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "preventTabPlaylistAutoBuffer", // defaultSetting
        "bool", // module
        "SETTINGS_PREVENTTABPLAYLISTAUTOBUFFERING_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_Tab_Playlist_AutoBuffering"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "playlistAutoPlay", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYLIST_AUTOPLAY",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Playlist_auto_play"
    );
    ytcenter.events.addEvent("settings-update", (function(opt){
        return function(){
            var module = opt.getLiveModule();
            if (module) {
                module.update(ytcenter.settings.playlistAutoPlay);
            }
        };
    })(option));
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "playlistAutoPlayFreeze", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYLIST_AUTOPLAY_FREEZE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Playlist_auto_play_freeze"
    );
    subcat.addOption(option);
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_RESOLUTION"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableAutoVideoQuality", // defaultSetting
        "bool", // module
        "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Auto_Resolution"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "autoVideoQuality", // defaultSetting
        "list", // module
        "SETTINGS_AUTORESOLUTION_LABEL",
        {
            "list": [
                {
                    "value": "highres",
                    "label": "SETTINGS_HIGHRES"
                }, {
                    "value": "hd1440",
                    "label": "SETTINGS_HD1440"
                }, {
                    "value": "hd1080",
                    "label": "SETTINGS_HD1080"
                }, {
                    "value": "hd720",
                    "label": "SETTINGS_HD720"
                }, {
                    "value": "large",
                    "label": "SETTINGS_LARGE"
                }, {
                    "value": "medium",
                    "label": "SETTINGS_MEDIUM"
                }, {
                    "value": "small",
                    "label": "SETTINGS_SMALL"
                }, {
                    "value": "tiny",
                    "label": "SETTINGS_TINY"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Resolution"
    );
    subcat.addOption(option);


    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PLAYERSIZE"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableResize", // defaultSetting
        "bool", // module
        "SETTINGS_RESIZE_FEATURE_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Size"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "resize-default-playersize", // defaultSetting
        "defaultplayersizedropdown", // module
        "SETTINGS_RESIZE_DEFAULT",
        {
            "bind": "resize-playersizes"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Default_Player_Size"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "resize-small-button", // defaultSetting
        "defaultplayersizedropdown", // module
        "SETTINGS_RESIZE_SMALL_BUTTON",
        {
            "bind": "resize-playersizes"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Small_Resize_Button"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "resize-large-button", // defaultSetting
        "defaultplayersizedropdown", // module
        "SETTINGS_RESIZE_LARGE_BUTTON",
        {
            "bind": "resize-playersizes"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Large_Resize_Button"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "playerSizeAspect", // defaultSetting
        "list", // module
        "SETTINGS_RESIZE_ASPECT_LABEL",
        {
            "list": [
                {
                    "value": "default",
                    "label": "SETTINGS_RESIZE_ASPECT_DEFAULT"
                }, {
                    "value": "4:3", // 1.33333
                    "label": "SETTINGS_RESIZE_ASPECT_4:3"
                }, {
                    "value": "3:2", // 1.33333
                    "label": "SETTINGS_RESIZE_ASPECT_3:2"
                }, {
                    "value": "5:4", // 1.25
                    "label": "SETTINGS_RESIZE_ASPECT_5:4"
                }, {
                    "value": "16:9", // 1.7778
                    "label": "SETTINGS_RESIZE_ASPECT_16:9"
                }, {
                    "value": "16:10", // 1.6
                    "label": "SETTINGS_RESIZE_ASPECT_16:10"
                }, {
                    "value": "24:10", // 2.4
                    "label": "SETTINGS_RESIZE_ASPECT_24:10"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.player.setRatio(ytcenter.player.calculateRatio(ytcenter.player.getConfig().args.dash === "1" && ytcenter.player.getConfig().args.adaptive_fmts));
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Aspect"
    );
    subcat.addOption(option);
    /*option = ytcenter.settingsPanel.createOption(
     "ytOnlyStageMode", // defaultSetting
     "bool", // module
     "SETTINGS_RESIZE_ONLY_STAGE_MODE",
     {
     "listeners" : [
     {
     "event": "click",
     "callback": function(){
     ytcenter.player.resizeUpdater();
     }
     }
     ]
     },
     "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Only_stage_mode"
     );
     subcat.addOption(option);*/
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        null, // module
        "SETTINGS_RESIZE_LIST",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Size_Editor"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "resize-playersizes", // defaultSetting
        "resizeItemList" // module
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_VOLUME"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableVolume", // defaultSetting
        "bool", // module
        "SETTINGS_VOLUME_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Volume_Control"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "volume", // defaultSetting
        "rangetext", // module
        "SETTINGS_VOLUME_LABEL",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Volume-2"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "mute", // defaultSetting
        "bool", // module
        "SETTINGS_MUTE_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Mute"
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_SHORTCUTS"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableYouTubeShortcuts", // defaultSetting
        "bool", // module
        "SETTINGS_ENABLEYTSHORTCUTS_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_YouTube_Player_Shortcuts"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "enableShortcuts", // defaultSetting
        "bool", // module
        "SETTINGS_ENABLESHORTCUTS_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Shortcuts_on_Page"
    );
    subcat.addOption(option);
    ytcenter.events.addEvent("settings-update", (function(opt){
        return function(){ opt.setVisibility(ytcenter.settings.enableYouTubeShortcuts); };
    })(option));
    option.setVisibility(ytcenter.settings.enableYouTubeShortcuts);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_TOPSCROLLPLAYER"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_ENABLED",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Fullscreen_Top_Player"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerActivated", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_ACTIVATED",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Activated_by_Default"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerEnabledOnlyVideoPlaying", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_ONLYVIDEOPLAYING",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Only_when_Video_is_Playing"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerEnterOnVideoPlay", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_ENTERONVIDEOPLAY",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enter_On_Video_Play"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerExitOnVideoPause", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_EXITONVIDEOPAUSE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Exit_On_Video_Pause"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerExitOnVideoEnd", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_EXITONVIDEOEND",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Exit_On_Video_End"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerScrollUpToExit", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_SCROLLUPEXIT",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Scroll_Up_To_Exit_Mode"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerAnimation", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_ANIMATION",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Animations"
    );
    subcat.addOption(option);

    /*option = ytcenter.settingsPanel.createOption(
     "topScrollPlayerHideScrollbar", // defaultSetting
     "bool", // module
     "SETTINGS_TOPSCROLLPLAYER_HIDESCROLLBAR",
     null,
     "https://github.com/YePpHa/YouTubeCenter/wiki/Features#hide-scrollbar"
     );
     subcat.addOption(option);*/

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerCountIncreaseBefore", // defaultSetting
        "bool", // module
        "SETTINGS_TOPSCROLLPLAYER_COUNTINCREASEBEFORE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Increase_Counter_by_Scrolling_To_The_Top_of_The_Page"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerTimesToEnter", // defaultSetting
        "rangetext", // module
        "SETTINGS_TOPSCROLLPLAYER_TIMESTOENTER", // label
        {
            "min": 0,
            "max": 20
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Amount_To_Enter"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerTimesToExit", // defaultSetting
        "rangetext", // module
        "SETTINGS_TOPSCROLLPLAYER_TIMESTOEXIT", // label
        {
            "min": 0,
            "max": 20
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Amount_To_Exit"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "topScrollPlayerBumpTimer", // defaultSetting
        "rangetext", // module
        "SETTINGS_TOPSCROLLPLAYER_BUMPTIMER", // label
        {
            "min": 0,
            "max": 10000,
            "suffix": " ms"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Counter_Reset_After"
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PLAYERGLOW"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "playerGlowEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYERGLOW_ENABLED",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Enabled"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setEnabled(ytcenter.settings.playerGlowEnabled);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowFactor", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_FACTOR", // label
        {
            "min": 1,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Quality"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("factor", ytcenter.settings.playerGlowFactor);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowPixelInterval", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_PIXEL_INTERVAL", // label
        {
            "min": 1,
            "max": 10000000
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Pixel_interval"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("pixelInterval", ytcenter.settings.playerGlowPixelInterval);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowRequestAnimationFrame", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYERGLOW_USE_REQUEST_ANIMATION_FRAME",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Use_request_animation_frame"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowUpdateInterval", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_UPDATE_INTERVAL", // label
        {
            "min": 0,
            "max": 10000,
            "suffix": " ms"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Update_interval"
    );

    ytcenter.events.addEvent("settings-update", (function(opt){
        return function(){
            ytcenter.effects.playerGlow.setOption("interval", (ytcenter.settings.playerGlowRequestAnimationFrame ? -1 : ytcenter.settings.playerGlowUpdateInterval));
            opt.setVisibility(!ytcenter.settings.playerGlowRequestAnimationFrame);
        };
    })(option));
    option.setVisibility(!ytcenter.settings.playerGlowRequestAnimationFrame);

    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowTransition", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_TRANSITION", // label
        {
            "min": 0,
            "max": 10000,
            "suffix": " ms"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Transition"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("transition", ytcenter.settings.playerGlowTransition);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowBlur", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_BLUR", // label
        {
            "min": 0,
            "max": 200,
            "suffix": "px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Blur"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("blur", ytcenter.settings.playerGlowBlur);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowSpread", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_SPREAD", // label
        {
            "min": 0,
            "max": 200,
            "suffix": "px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Spread"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("spread", ytcenter.settings.playerGlowSpread);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowOpacity", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_OPACITY", // label
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Opacity"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("opacity", ytcenter.settings.playerGlowOpacity/100);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerMultiGlowEffect", // defaultSetting
        "bool", // module
        "SETTINGS_PLAYERGLOW_MULTI_ENABLED",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Multi_glow_enabled"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("multiglow", ytcenter.settings.playerMultiGlowEffect);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerMultiGlowEffectDepth", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_MULTI_DEPTH", // label
        {
            "min": 1,
            "max": 500,
            "suffix": "px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Depth"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("depth", ytcenter.settings.playerMultiGlowEffectDepth);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerMultiGlowEffectBlockInterval", // defaultSetting
        "rangetext", // module
        "SETTINGS_PLAYERGLOW_MULTI_BLOCK_INTERVAL", // label
        {
            "min": 1,
            "max": 200,
            "suffix": "px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Block_interval"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("blockInterval", ytcenter.settings.playerMultiGlowEffectBlockInterval);
    });
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerGlowEffectOnPlayer",
        "list",
        "SETTINGS_PLAYERGLOW_APPLIED",
        {
            "list": [
                { "value": "both", "label": "SETTINGS_PLAYERGLOW_LIGHTS_OFF_BOTH" },
                { "value": "only-lights-off", "label": "SETTINGS_PLAYERGLOW_LIGHTS_OFF_ONLY_LIGHTS_OFF" },
                { "value": "only-without-lights-off", "label": "SETTINGS_PLAYERGLOW_LIGHTS_OFF_ONLY_WITHOUT_LIGHTS_OFF" }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Glow_on"
    );
    ytcenter.events.addEvent("settings-update", function(){
        ytcenter.effects.playerGlow.setOption("glowEffectOnPlayer", ytcenter.settings.playerGlowEffectOnPlayer);
    });
    subcat.addOption(option);

    /* Category:External Players */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_EXTERNAL_PLAYERS");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_EMBED"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "embed_enabled",
        "bool",
        "SETTINGS_EMBEDS_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Embeds"
    );
    subcat.addOption(option);

    // Only needed in the developer version for testing.
    if (devbuild) {
        option = ytcenter.settingsPanel.createOption(
            "embedWriteEmbedMethod",
            "list",
            "SETTINGS_EMBEDS_WRITEMETHOD",
            {
                "list": [
                    {
                        "value": "standard",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_STANDARD"
                    }, {
                        "value": "test1",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST1"
                    }, {
                        "value": "test2",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST2"
                    }, {
                        "value": "test3",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST3"
                    }, {
                        "value": "standard+reload",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_STANDARDRELOAD"
                    }, {
                        "value": "test1+reload",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST1RELOAD"
                    }, {
                        "value": "test2+reload",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST2RELOAD"
                    }, {
                        "value": "test3+reload",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST3RELOAD"
                    }, {
                        "value": "test4",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST4"
                    }, {
                        "value": "test5",
                        "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST5"
                    }
                ]
            }
        );
        subcat.addOption(option);

        option = ytcenter.settingsPanel.createOption(
            "embedWriteEmbedMethodReloadDelay",
            "rangetext",
            "SETTINGS_EMBEDS_WRITEMETHOD_RELOADDELAY",
            {
                "min": 0,
                "max": 10000,
                "suffix": " ms"
            }
        );
        ytcenter.events.addEvent("settings-update", (function(opt){
            return function(){ opt.setVisibility(ytcenter.settings.embedWriteEmbedMethod.indexOf("+reload") !== -1); };
        })(option));
        option.setVisibility(ytcenter.settings.embedWriteEmbedMethod.indexOf("+reload") !== -1);
        subcat.addOption(option);

        option = ytcenter.settingsPanel.createOption(
            null,
            "line"
        );
        subcat.addOption(option);
    }

    option = ytcenter.settingsPanel.createOption(
        "embed_dashPlayback",
        "bool",
        "SETTINGS_DASHPLAYBACK",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-DASH_Playback-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_forcePlayerType",
        "list",
        "SETTINGS_FORCEPLAYERTYPE",
        {
            "list": [
                { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
                { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
                { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" },
                { "value": "aggressive_flash", "label": "SETTINGS_FORCEPLAYERTYPE_AGGRESSIVE_FLASH" }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Type-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_autohide",
        "list",
        "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
        {
            "list": [
                {
                    "value": "-1",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_DEFAULT"
                }, {
                    "value": "0",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
                }, {
                    "value": "1",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
                }, {
                    "value": "2",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
                }, {
                    "value": "3",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.getPage() === "embed") {
                            ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Hide_Bar-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_playerTheme",
        "list",
        "SETTINGS_PLAYERTHEME_LABEL",
        {
            "list": [
                {
                    "value": "dark",
                    "label": "SETTINGS_PLAYERTHEME_DARK"
                }, {
                    "value": "light",
                    "label": "SETTINGS_PLAYERTHEME_LIGHT"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.getPage() === "embed") {
                            ytcenter.player.setTheme(ytcenter.settings.embed_playerTheme);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Theme-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_playerColor",
        "list",
        "SETTINGS_PLAYERCOLOR_LABEL",
        {
            "list": [
                {
                    "value": "red",
                    "label": "SETTINGS_PLAYERCOLOR_RED"
                }, {
                    "value": "white",
                    "label": "SETTINGS_PLAYERCOLOR_WHITE"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.getPage() === "embed") {
                            ytcenter.player.setProgressColor(ytcenter.settings.embed_playerColor);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Color-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_flashWMode",
        "list",
        "SETTINGS_WMODE_LABEL",
        {
            "list": [
                {
                    "value": "none",
                    "label": "SETTINGS_WMODE_NONE"
                }, {
                    "value": "window",
                    "label": "SETTINGS_WMODE_WINDOW"
                }, {
                    "value": "direct",
                    "label": "SETTINGS_WMODE_DIRECT"
                }, {
                    "value": "opaque",
                    "label": "SETTINGS_WMODE_OPAQUE"
                }, {
                    "value": "transparent",
                    "label": "SETTINGS_WMODE_TRANSPARENT"
                }, {
                    "value": "gpu",
                    "label": "SETTINGS_WMODE_GPU"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Flash_WMode-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_enableAnnotations",
        "bool",
        "SETTINGS_ENABLEANNOTATIONS_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Annotations-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embedBufferEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_BUFFER_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Enable_custom_buffer"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embedBufferSize", // defaultSetting
        "rangetext", // module
        "SETTINGS_BUFFER_SIZE",
        {
            "min": 0, /* 0 bytes - I have no idea if this will break something */
            "max": 1099511627776, /* 1 TB - Why not... */
            "suffix": " B",
            "text-width": "135px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Custom_buffer_size"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_enableAutoVideoQuality",
        "bool",
        "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Auto_Resolution-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_autoVideoQuality",
        "list",
        "SETTINGS_AUTORESOLUTION_LABEL",
        {
            "list": [
                {
                    "value": "highres",
                    "label": "SETTINGS_HIGHRES"
                }, {
                    "value": "hd1440",
                    "label": "SETTINGS_HD1440"
                }, {
                    "value": "hd1080",
                    "label": "SETTINGS_HD1080"
                }, {
                    "value": "hd720",
                    "label": "SETTINGS_HD720"
                }, {
                    "value": "large",
                    "label": "SETTINGS_LARGE"
                }, {
                    "value": "medium",
                    "label": "SETTINGS_MEDIUM"
                }, {
                    "value": "small",
                    "label": "SETTINGS_SMALL"
                }, {
                    "value": "tiny",
                    "label": "SETTINGS_TINY"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Resolution-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_defaultAutoplay",
        "bool",
        "SETTINGS_DEFAULT_AUTOPLAY",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Use_Default_AutoPlay"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_preventAutoPlay",
        "bool",
        "SETTINGS_PREVENTAUTOPLAY_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_AutoPlay-2"
    );
    option.setVisibility(!ytcenter.settings.embed_defaultAutoplay);
    ytcenter.events.addEvent("settings-update", (function(opt){
        return function(){ opt.setVisibility(!ytcenter.settings.embed_defaultAutoplay); };
    })(option));
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_preventAutoBuffer",
        "bool",
        "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_AutoBuffering-2"
    );
    option.setVisibility(!ytcenter.settings.embed_defaultAutoplay);
    ytcenter.events.addEvent("settings-update", (function(opt){
        return function(){ opt.setVisibility(!ytcenter.settings.embed_defaultAutoplay); };
    })(option));
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_enableVolume",
        "bool",
        "SETTINGS_VOLUME_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Volume_Control-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_volume",
        "rangetext",
        "SETTINGS_VOLUME_LABEL",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Volume-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "embed_mute",
        "bool",
        "SETTINGS_MUTE_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Mute-2"
    );
    subcat.addOption(option);
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_CHANNEL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "embed_dashPlayback",
        "bool",
        "SETTINGS_DASHPLAYBACK",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-DASH_Playback-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_forcePlayerType",
        "list",
        "SETTINGS_FORCEPLAYERTYPE",
        {
            "list": [
                { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
                { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
                { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" },
                { "value": "aggressive_flash", "label": "SETTINGS_FORCEPLAYERTYPE_AGGRESSIVE_FLASH" }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Type-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_autohide",
        "list",
        "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
        {
            "list": [
                {
                    "value": "-1",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_DEFAULT"
                }, {
                    "value": "0",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
                }, {
                    "value": "1",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
                }, {
                    "value": "2",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
                }, {
                    "value": "3",
                    "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.getPage() === "embed") {
                            ytcenter.player.setAutoHide(ytcenter.settings.channel_autohide);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Hide_Bar-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_playerTheme",
        "list",
        "SETTINGS_PLAYERTHEME_LABEL",
        {
            "list": [
                {
                    "value": "dark",
                    "label": "SETTINGS_PLAYERTHEME_DARK"
                }, {
                    "value": "light",
                    "label": "SETTINGS_PLAYERTHEME_LIGHT"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.getPage() === "embed") {
                            ytcenter.player.setTheme(ytcenter.settings.channel_playerTheme);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Theme-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_playerColor",
        "list",
        "SETTINGS_PLAYERCOLOR_LABEL",
        {
            "list": [
                {
                    "value": "red",
                    "label": "SETTINGS_PLAYERCOLOR_RED"
                }, {
                    "value": "white",
                    "label": "SETTINGS_PLAYERCOLOR_WHITE"
                }
            ],
            "listeners" : [
                {
                    "event": "update",
                    "callback": function(){
                        if (ytcenter.getPage() === "embed") {
                            ytcenter.player.setProgressColor(ytcenter.settings.channel_playerColor);
                        }
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Player_Color-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_flashWMode",
        "list",
        "SETTINGS_WMODE_LABEL",
        {
            "list": [
                {
                    "value": "none",
                    "label": "SETTINGS_WMODE_NONE"
                }, {
                    "value": "window",
                    "label": "SETTINGS_WMODE_WINDOW"
                }, {
                    "value": "direct",
                    "label": "SETTINGS_WMODE_DIRECT"
                }, {
                    "value": "opaque",
                    "label": "SETTINGS_WMODE_OPAQUE"
                }, {
                    "value": "transparent",
                    "label": "SETTINGS_WMODE_TRANSPARENT"
                }, {
                    "value": "gpu",
                    "label": "SETTINGS_WMODE_GPU"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Flash_WMode-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_enableAnnotations",
        "bool",
        "SETTINGS_ENABLEANNOTATIONS_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Annotations-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channelBufferEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_BUFFER_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Enable_custom_buffer"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channelBufferSize", // defaultSetting
        "rangetext", // module
        "SETTINGS_BUFFER_SIZE",
        {
            "min": 0, /* 0 bytes - I have no idea if this will break something */
            "max": 1099511627776, /* 1 TB - Why not... */
            "suffix": " B",
            "text-width": "135px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Custom_buffer_size"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_enableAutoVideoQuality",
        "bool",
        "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Auto_Resolution-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_autoVideoQuality",
        "list",
        "SETTINGS_AUTORESOLUTION_LABEL",
        {
            "list": [
                {
                    "value": "highres",
                    "label": "SETTINGS_HIGHRES"
                }, {
                    "value": "hd1440",
                    "label": "SETTINGS_HD1440"
                }, {
                    "value": "hd1080",
                    "label": "SETTINGS_HD1080"
                }, {
                    "value": "hd720",
                    "label": "SETTINGS_HD720"
                }, {
                    "value": "large",
                    "label": "SETTINGS_LARGE"
                }, {
                    "value": "medium",
                    "label": "SETTINGS_MEDIUM"
                }, {
                    "value": "small",
                    "label": "SETTINGS_SMALL"
                }, {
                    "value": "tiny",
                    "label": "SETTINGS_TINY"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Resolution-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_preventAutoPlay",
        "bool",
        "SETTINGS_PREVENTAUTOPLAY_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_AutoPlay-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_preventAutoBuffer",
        "bool",
        "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Prevent_AutoBuffering-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_enableVolume",
        "bool",
        "SETTINGS_VOLUME_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Volume_Control-3"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_volume",
        "rangetext",
        "SETTINGS_VOLUME_LABEL",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Volume-4"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "channel_mute",
        "bool",
        "SETTINGS_MUTE_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Mute-3"
    );
    subcat.addOption(option);

    /* Category:Download */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DOWNLOAD");
    if (identifier === 8) cat.setVisibility(false);
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "downloadQuality",
        "list",
        "SETTINGS_DOWNLOADQUALITY_LABEL",
        {
            "list": [
                {
                    "value": "highres",
                    "label": "SETTINGS_HIGHRES"
                }, {
                    "value": "hd1440",
                    "label": "SETTINGS_HD1440"
                }, {
                    "value": "hd1080",
                    "label": "SETTINGS_HD1080"
                }, {
                    "value": "hd720",
                    "label": "SETTINGS_HD720"
                }, {
                    "value": "large",
                    "label": "SETTINGS_LARGE"
                }, {
                    "value": "medium",
                    "label": "SETTINGS_MEDIUM"
                }, {
                    "value": "small",
                    "label": "SETTINGS_SMALL"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Quality"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "downloadFormat",
        "list",
        "SETTINGS_DOWNLOADFORMAT_LABEL",
        {
            "list": [
                {
                    "value": "mp4",
                    "label": "SETTINGS_DOWNLOADFORMAT_LIST_MP4"
                }, {
                    "value": "webm",
                    "label": "SETTINGS_DOWNLOADFORMAT_LIST_WEBM"
                }, {
                    "value": "flv",
                    "label": "SETTINGS_DOWNLOADFORMAT_LIST_FLV"
                }, {
                    "value": "3gp",
                    "label": "SETTINGS_DOWNLOADFORMAT_LIST_3GP"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Format"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "downloadAsLinks",
        "bool",
        "SETTINGS_DOWNLOADASLINKS_LABEL",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Download_as_links"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "show3DInDownloadMenu",
        "bool",
        "SETTINGS_SHOW3DINDOWNLOADMENU_LABEL",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Show_3D_in_Download_Menu"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "filename",
        "textfield",
        "SETTINGS_FILENAME_LABEL",
        {
            "listeners": [
                {
                    "event": "change",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Filename"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "fixfilename",
        "bool",
        "SETTINGS_FIXDOWNLOADFILENAME_LABEL",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_NonAlphanumeric_Characters"
    );
    subcat.addOption(option);
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_MP3SERVICES"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "mp3Services",
        "multilist",
        "SETTINGS_MP3SERVICES_LABEL",
        {
            "list": ytcenter.mp3services,
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-MP3_Services"
    );
    option.setModuleStyle("display", "block");
    subcat.addOption(option);
    /* Category:Repeat */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_REPEAT");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "autoActivateRepeat",
        "bool",
        "SETTINGS_AUTOACTIVATEREPEAT_LABEL",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Auto_Activate_Repeat"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "repeatShowIcon",
        "bool",
        "SETTINGS_REPEAT_SHOW_ICON",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Show_Icon"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "repeatShowText",
        "bool",
        "SETTINGS_REPEAT_SHOW_TEXT",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Show_Text"
    );
    subcat.addOption(option);


    /* Category:UI */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_UI");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "guideMode",
        "list",
        "SETTINGS_GUIDEMODE",
        {
            "list": [
                {
                    "value": "default",
                    "label": "SETTINGS_GUIDEMODE_DEFAULT"
                }, {
                    "value": "always_open",
                    "label": "SETTINGS_GUIDEMODE_ALWAYS_OPEN"
                }, {
                    "value": "always_closed",
                    "label": "SETTINGS_GUIDEMODE_ALWAYS_CLOSED"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Guide_Mode"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "watch7playerguidealwayshide",
        "bool",
        "SETTINGS_GUIDE_ALWAYS_HIDE",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        /*ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
                         ytcenter.guide.update();*/
                        ytcenter.player._updateResize();

                        ytcenter.classManagement.updateClassesByGroup(["hide-guide"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Always_Hide_The_Guide"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "watch7playerguidehide",
        "bool",
        "SETTINGS_WATCH7_PLAYER_GUIDE_HIDE",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.player._updateResize();
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Hide_Guide_When_Resizing"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "disableGuideCount",
        "bool",
        "SETTINGS_HIDE_GUIDE_COUNT",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["hide-guide-count"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Hide_Guide_Count"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line",
        null
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "useStaticLogo",
        "bool",
        "SETTINGS_USE_STATIC_YT_LOGO"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "logoLink",
        "textfield",
        "SETTINGS_LOGO_LINK",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.updateLogoLink();
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-YouTube_Logo_Link"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "disableFeedItemActionMenu",
        "bool",
        "SETTINGS_HIDE_FEED_ITEM_ACTION_MENU",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["hide-feed-item-action-menu"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Hide_Feed_Item_Action_Menu_Button"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "hideRecommendedChannels",
        "bool",
        "SETTINGS_HIDE_RECOMMENDED_CHANNELS",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["hide-recommended-channels"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Hide_Recommended_Channels"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line",
        null
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerDarkSideBG",
        "bool",
        "SETTINGS_PLAYER_DARK_SIDE",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["darkside"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Dark_Player_Background"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerDarkSideBGRetro",
        "bool",
        "SETTINGS_PLAYER_DARK_SIDE_RETRO",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Dark_player_background_retro"
    );
    var playerDarkSideBGRetroOption = option;
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "playerDarkSideBGColor",
        "colorpicker",
        "SETTINGS_PLAYER_DARK_SIDE_COLOR",
        {
            "presetColors": ["#1b1b1b", "#444444"],
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.classManagement.updateClassesByGroup(["darkside"]);
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Dark_Player_Background_Color"
    );

    var playerDarkSideBGColorOption = option;
    playerDarkSideBGRetroOption.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["darkside"]);

        playerDarkSideBGColorOption.setVisibility(!ytcenter.settings.playerDarkSideBGRetro);
    });

    option.addEventListener("update", function(){
        ytcenter.classManagement.updateClassesByGroup(["darkside"]);
    });
    if (ytcenter.settings.playerDarkSideBGRetro) option.setVisibility(false);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "line",
        null
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "uploaderCountryEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_UPLOADER_COUNTRY_FLAG_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Country_Flag_for_Uploader"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "uploaderCountryShowFlag", // defaultSetting
        "bool", // module
        "SETTINGS_UPLOADER_COUNTRY_FLAG_SHOW_FLAG",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Show_Country_Flag"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "uploaderCountryUseNames", // defaultSetting
        "bool", // module
        "SETTINGS_UPLOADER_COUNTRY_FLAG_USE_NAME",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Use_Country_Names"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "uploaderCountryPosition", // defaultSetting
        "list", // module
        "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION", // label
        {
            "list": [
                {
                    "value": "before_username",
                    "label": "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION_BEFORE_USERNAME"
                }, {
                    "value": "after_username",
                    "label": "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION_AFTER_USERNAME"
                }, {
                    "value": "last",
                    "label": "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION_LAST"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Flag_Country_Position"
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_SEARCH"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "limitSearchRowWidthEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_SEARCH_LIMIT_WIDTH_ENABLED"
    );
    option.addEventListener("update", ytcenter.searchRowLimit.update);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "limitSearchRowWidth", // defaultSetting
        "rangetext", // module
        "SETTINGS_SEARCH_LIMIT_WIDTH", // label
        {
            "min": 700,
            "max": 10000,
            "suffix": "px"
        }
    );
    option.addEventListener("update", ytcenter.searchRowLimit.update);
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LIKEDISLIKEBUTTON"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "likedislikeUIEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_LIKEDISLIKE_UI_ENABLED"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.update);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likeButtonColor",
        "colorpicker",
        "SETTINGS_LIKEBUTTON_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Like_button_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikeTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likeButtonHoverColor",
        "colorpicker",
        "SETTINGS_LIKEBUTTON_HOVER_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Like_button_hover_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikeHoverTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likeButtonOpacity",
        "rangetext",
        "SETTINGS_LIKEBUTTON_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Like_button_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikeButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likeButtonHoverOpacity",
        "rangetext",
        "SETTINGS_LIKEBUTTON_HOVER_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Like_button_hover_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikeButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikeButtonColor",
        "colorpicker",
        "SETTINGS_DISLIKEBUTTON_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Dislike_button_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikeTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikeButtonHoverColor",
        "colorpicker",
        "SETTINGS_DISLIKEBUTTON_HOVER_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Dislike_button_hover_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikeHoverTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikeButtonOpacity",
        "rangetext",
        "SETTINGS_DISLIKEBUTTON_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Dislike_button_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikeButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikeButtonHoverOpacity",
        "rangetext",
        "SETTINGS_DISLIKEBUTTON_HOVER_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Dislike_button_hover_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikeButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likedButtonColor",
        "colorpicker",
        "SETTINGS_LIKEDBUTTON_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Liked_button_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikedTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likedButtonHoverColor",
        "colorpicker",
        "SETTINGS_LIKEDBUTTON_HOVER_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Liked_button_hover_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikedHoverTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likedButtonOpacity",
        "rangetext",
        "SETTINGS_LIKEDBUTTON_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Liked_button_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikedButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "likedButtonHoverOpacity",
        "rangetext",
        "SETTINGS_LIKEDBUTTON_HOVER_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Liked_button_hover_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateLikedButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikedButtonColor",
        "colorpicker",
        "SETTINGS_DISLIKEDBUTTON_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Disliked_button_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikedTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikedButtonHoverColor",
        "colorpicker",
        "SETTINGS_DISLIKEDBUTTON_HOVER_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff", "#000"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Disliked_button_hover_color"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikeHoverTint);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikedButtonOpacity",
        "rangetext",
        "SETTINGS_DISLIKEDBUTTON_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Disliked_button_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikedButtonOpacity);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "dislikedButtonHoverOpacity",
        "rangetext",
        "SETTINGS_DISLIKEDBUTTON_HOVER_OPACITY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Disliked_button_hover_opacity"
    );
    option.addEventListener("update", ytcenter.likedislikeButtons.updateDislikedButtonOpacity);
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_RATINGBAR"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "sparkbarEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_SPARKBAR_ENABLED"
    );
    option.addEventListener("update", ytcenter.sparkbar.update);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "sparkbarLikesColor", // defaultSetting
        "colorpicker", // module
        "SETTINGS_SPARKBAR_LIKES_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Rating_Bar_Likes_Color"
    );
    option.addEventListener("update", ytcenter.sparkbar.update);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "sparkbarDislikesColor", // defaultSetting
        "colorpicker", // module
        "SETTINGS_SPARKBAR_DISLIKES_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Rating_Bar_Dislikes_Color"
    );
    option.addEventListener("update", ytcenter.sparkbar.update);
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "sparkbarHeight", // defaultSetting
        "rangetext", // module
        "SETTINGS_SPARKBAR_HEIGHT", // label
        {
            "min": 1,
            "max": 100,
            "suffix": "px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Height"
    );
    option.addEventListener("update", ytcenter.sparkbar.update);
    subcat.addOption(option);


    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PLACEMENT"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableDownload",
        "bool",
        "SETTINGS_ENABLEDOWNLOAD_LABEL",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Placement"
    );
    if (identifier === 8) option.setVisibility(false);
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "enableRepeat",
        "bool",
        "SETTINGS_ENABLEREPEAT_LABEL",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "lightbulbEnable",
        "bool",
        "SETTINGS_LIGHTBULB_ENABLE",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "resizeEnable",
        "bool",
        "SETTINGS_RESIZE_ENABLE",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "aspectEnable",
        "bool",
        "SETTINGS_ASPECT_ENABLE",
        {
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Placement"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "newline"
    );
    option.setVisibility(ytcenter.getPage() === "watch");
    ytcenter.events.addEvent("ui-refresh", ytcenter.utils.bind(option, function(){
        this.setVisibility(ytcenter.getPage() === "watch");
    }));
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "button",
        null,
        {
            "text": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_LABEL"
        }
    );
    var placementsystemToggler = false;
    var focus = null;
    option.addModuleEventListener("click", function placementToggleFunction(){
        function save() {
            // Retrive the changed sort list and update the settings accordingly.
            var sortList = ytcenter.placementsystem.getSortList(ytcenter.placementsystem.placementGroupsReferenceList);
            //ytcenter.placementsystem.setSortList(sortList);
            ytcenter.settings.placementGroups = sortList;

            ytcenter.saveSettings();

            placementToggleFunction();
        }

        function cancel() {
            ytcenter.placementsystem.setSortList(ytcenter.settings.placementGroups, ytcenter.placementsystem.placementGroupsReferenceList);

            placementToggleFunction();
        }

        placementsystemToggler = !placementsystemToggler;

        if (focus !== null) {
            focus();
            focus = null;
        }

        ytcenter.placementsystem.setMoveable(placementsystemToggler);
        if (placementsystemToggler) {
            ytcenter.utils.addClass(document.body, "ytcenter-placementsystem-activated");
            ytcenter.settingsPanelDialog.setVisibility(false);
            ytcenter.cssElements.elementFocus.add();
            focus = ytcenter.elementfocus.focus(document.getElementById("watch8-action-buttons"), save, cancel);
        } else {
            ytcenter.cssElements.elementFocus.remove();
            ytcenter.utils.removeClass(document.body, "ytcenter-placementsystem-activated");
            ytcenter.settingsPanelDialog.setVisibility(true);
        }
    });
    option.setVisibility(ytcenter.getPage() === "watch");
    ytcenter.events.addEvent("ui-refresh", ytcenter.utils.bind(option, function(){
        this.setVisibility(ytcenter.getPage() === "watch");
    }));
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "textContent",
        null,
        {
            "textlocale": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_INSTRUCTIONS",
            "styles": {
                "margin-left": "20px"
            }
        }
    );
    option.setVisibility(ytcenter.getPage() === "watch");
    ytcenter.events.addEvent("ui-refresh", ytcenter.utils.bind(option, function(){
        this.setVisibility(ytcenter.getPage() === "watch");
    }));
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LIGHTSOFF"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "lightbulbAutoOff", // defaultSetting
        "bool", // module
        "SETTINGS_LIGHTBULB_AUTO", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Lights_Off"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "lightbulbClickThrough", // defaultSetting
        "bool", // module
        "SETTINGS_LIGHTBULB_CLICK_THROUGH", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Click_Through"
    );
    option.addEventListener("update", function(){
        ytcenter.tmp.lightoffwarning();
    });
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "lightbulbBackgroundColor", // defaultSetting
        "colorpicker", // module
        "SETTINGS_LIGHTBULB_COLOR",
        {
            "presetColors": ["#000", "#fff", "#590", "#ccc", "#f00", "#2793e6", "#ff8f00"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Light_Off_Color"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "lightbulbBackgroundOpaque", // defaultSetting
        "rangetext", // module
        "SETTINGS_LIGHTBULB_TRANSPARENCY",
        {
            "min": 0,
            "max": 100,
            "suffix": "%"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Light_Off_Opacity"
    );
    subcat.addOption(option);

    (function(opt){
        option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            null,
            {
                "textlocale": "SETTINGS_LIGHTBULB_WARNING",
                "styles": {
                    "color": "#ff0000"
                }
            }
        );
        if (ytcenter.settings.lightbulbBackgroundOpaque > 90 && ytcenter.settings.lightbulbClickThrough) {
            option.setVisibility(true);
        } else {
            option.setVisibility(false);
        }
        opt.addEventListener("update", (function(o){
            ytcenter.tmp = ytcenter.tmp || {};
            ytcenter.tmp.lightoffwarning = function(){
                if (ytcenter.settings.lightbulbBackgroundOpaque > 90 && ytcenter.settings.lightbulbClickThrough) {
                    o.setVisibility(true);
                } else {
                    o.setVisibility(false);
                }
            };
            return ytcenter.tmp.lightoffwarning;
        })(option), false);
        subcat.addOption(option);
    })(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_VIDEO_THUMBNAIL"); cat.addSubCategory(subcat);
    // Animation
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        "SETTINGS_THUMBNAIL_ANIMATION", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Animation"
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailAnimationEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBNAIL_ANIMATION_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Animation"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailAnimationShuffle", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBNAIL_ANIMATION_SHUFFLE", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Shuffle"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailAnimationDelay", // defaultSetting
        "rangetext", // module
        "SETTINGS_THUMBNAIL_ANIMATION_DELAY", // label
        {
            "min": 250,
            "max": 5250,
            "suffix": " ms"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Delay"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailAnimationInterval", // defaultSetting
        "rangetext", // module
        "SETTINGS_THUMBNAIL_ANIMATION_INTERVAL", // label
        {
            "min": 0,
            "max": 5000,
            "suffix": " ms"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Interval"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailAnimationFallbackInterval", // defaultSetting
        "rangetext", // module
        "SETTINGS_THUMBNAIL_ANIMATION_FALLBACK_INTERVAL", // label
        {
            "min": 0,
            "max": 5000,
            "suffix": " ms"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Fallback_Interval"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    // Quality
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        "SETTINGS_THUMBVIDEO_QUALITY", // label
        null, // args
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Quality-2" // help
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailQualityBar", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBVIDEO_QUALITY_ENABLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailQualitySeparated", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBVIDEO_QUALITY_DASHNONDASHSEPARATED",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Separate_DASH_and_nonDASH_formats"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailQualityFPS", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBVIDEO_QUALITY_FPS" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailQualityPosition", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_POSITION", // label
        { // args
            "list": [
                {
                    "value": "topleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                    "value": "topright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                    "value": "bottomleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                    "value": "bottomright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailQualityDownloadAt", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
        { // args
            "list": [
                {
                    "value": "page_start",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
                }, {
                    "value": "scroll_into_view",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_INVIEW"
                }, {
                    "value": "hover_thumbnail",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailQualityVisible", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_VISIBLE", // label
        { // args
            "list": [
                {
                    "value": "always",
                    "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                    "value": "show_hover",
                    "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                    "value": "hide_hover",
                    "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    // Rating bar
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        "SETTINGS_THUMBVIDEO_RATING_BAR", // label
        null, // args
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-bar" // help
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBar", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBVIDEO_RATING_BAR_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Rating_Bar-2"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarPosition", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_POSITION", // label
        { // args
            "list": [
                {
                    "value": "top",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOP"
                }, {
                    "value": "bottom",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOM"
                }, {
                    "value": "left",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_LEFT"
                }, {
                    "value": "right",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_RIGHT"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarDownloadAt", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
        { // args
            "list": [
                {
                    "value": "page_start",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
                }, {
                    "value": "scroll_into_view",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_INVIEW"
                }, {
                    "value": "hover_thumbnail",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarVisible", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_VISIBLE", // label
        { // args
            "list": [
                {
                    "value": "always",
                    "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                    "value": "show_hover",
                    "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                    "value": "hide_hover",
                    "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarDefaultColor", // defaultSetting
        "colorpicker", // module
        "SETTINGS_THUMBNAIL_SPARKBAR_DEFAULT_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff"]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarLikesColor", // defaultSetting
        "colorpicker", // module
        "SETTINGS_THUMBNAIL_SPARKBAR_LIKES_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Likes_Color"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarDislikesColor", // defaultSetting
        "colorpicker", // module
        "SETTINGS_THUMBNAIL_SPARKBAR_DISLIKES_COLOR",
        {
            "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00", "#fff"]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Disikes_Color"
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsBarHeight", // defaultSetting
        "rangetext", // module
        "SETTINGS_SPARKBAR_HEIGHT", // label
        {
            "min": 1,
            "max": 100,
            "suffix": "px"
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Height-2"
    );
    option.setStyle("margin-left", "12px");

    subcat.addOption(option);

    // Rating count
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        "SETTINGS_THUMBVIDEO_RATING_COUNT", // label
        null, // args
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Rating_Count" // help
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsCount", // defaultSetting
        "bool", // module
        "SETTINGS_THUMBVIDEO_RATING_COUNT_ENABLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsCountPosition", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_POSITION", // label
        { // args
            "list": [
                {
                    "value": "topleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                    "value": "topright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                    "value": "bottomleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                    "value": "bottomright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsCountDownloadAt", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
        { // args
            "list": [
                {
                    "value": "page_start",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
                }, {
                    "value": "scroll_into_view",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_INVIEW"
                }, {
                    "value": "hover_thumbnail",
                    "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailRatingsCountVisible", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_VISIBLE", // label
        { // args
            "list": [
                {
                    "value": "always",
                    "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                    "value": "show_hover",
                    "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                    "value": "hide_hover",
                    "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    // Watch later button
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        "SETTINGS_THUMBVIDEO_WATCH_LATER",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Watch_Later_Button"
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailWatchLaterPosition", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_POSITION", // label
        {
            "list": [
                {
                    "value": "topleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                    "value": "topright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                    "value": "bottomleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                    "value": "bottomright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailWatchLaterVisible", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_VISIBLE", // label
        { // args
            "list": [
                {
                    "value": "always",
                    "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                    "value": "show_hover",
                    "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                    "value": "hide_hover",
                    "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }, {
                    "value": "never",
                    "label": "SETTINGS_THUMBVIDEO_NEVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    // Time code
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        "SETTINGS_THUMBVIDEO_TIME_CODE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Time_Code"
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailTimeCodePosition", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_POSITION", // label
        { // args
            "list": [
                {
                    "value": "topleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                    "value": "topright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                    "value": "bottomleft",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                    "value": "bottomright",
                    "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "videoThumbnailTimeCodeVisible", // defaultSetting
        "list", // module
        "SETTINGS_THUMBVIDEO_VISIBLE", // label
        { // args
            "list": [
                {
                    "value": "always",
                    "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                    "value": "show_hover",
                    "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                    "value": "hide_hover",
                    "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }, {
                    "value": "never",
                    "label": "SETTINGS_THUMBVIDEO_NEVER"
                }
            ],
            "listeners": [
                {
                    "event": "update",
                    "callback": function(){
                        ytcenter.events.performEvent("ui-refresh");
                    }
                }
            ]
        }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_COMMENTS"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableComments",
        "bool",
        "SETTINGS_COMMENTS_ENABLE"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "commentCountryEnabled", // defaultSetting
        "bool", // module
        "SETTINGS_COMMENTS_COUNTRY_ENABLE", // label
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Country_For_Comments" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "commentCountryShowFlag", // defaultSetting
        "bool", // module
        "SETTINGS_COMMENTS_COUNTRY_SHOW_FLAG",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Show_Country_Flag-2" // label
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "commentCountryUseNames", // defaultSetting
        "bool", // module
        "SETTINGS_COMMENTS_COUNTRY_USE_NAME",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Use_Country_Names-2"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "commentCountryLazyLoad", // defaultSetting
        "bool", // module
        "SETTINGS_COMMENTS_COUNTRY_LAZY_LOAD",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Lazy_Load"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "commentCountryButtonLoad", // defaultSetting
        "bool", // module
        "SETTINGS_COMMENTS_COUNTRY_BUTTON_LOAD",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#Load_by_button"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "commentCountryPosition", // defaultSetting
        "list", // module
        "SETTINGS_COMMENTS_COUNTRY_POSITION", // label
        {
            "list": [
                {
                    "value": "before_username",
                    "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_BEFORE_USERNAME"
                }, {
                    "value": "after_username",
                    "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_AFTER_USERNAME"
                }, {
                    "value": "last",
                    "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_LAST"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Comment_Country_Position"
    );
    subcat.addOption(option);

    /* Not needed as of now
     subcat = ytcenter.settingsPanel.createSubCategory("Subscriptions"); cat.addSubCategory(subcat);
     */

    /* Category:Update */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_UPDATE");
    if (!devbuild) {
        if ((identifier === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || identifier === 6 || identifier === 8) {
            cat.setVisibility(false);
        }
        ytcenter.events.addEvent("ui-refresh", ytcenter.utils.bind(cat, function(){
            if ((identifier === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || identifier === 6 || identifier === 8) {
                this.setVisibility(false);
            } else {
                this.setVisibility(true);
            }
        }));
    }
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "enableUpdateChecker",
        "bool",
        "SETTINGS_UPDATE_ENABLE",
        null,
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Enable_Update_Checker"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        "updateCheckerInterval",
        "list",
        "SETTINGS_UPDATE_INTERVAL",
        {
            "list": [
                {
                    "value": "0",
                    "label": "SETTINGS_UPDATE_INTERVAL_ALWAYS"
                }, {
                    "value": "1",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERYHOUR"
                }, {
                    "value": "2",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERY2HOUR"
                }, {
                    "value": "12",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERY12HOUR"
                }, {
                    "value": "24",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERYDAY"
                }, {
                    "value": "48",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERY2DAY"
                }, {
                    "value": "168",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERYWEEK"
                }, {
                    "value": "336",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERY2WEEK"
                }, {
                    "value": "720",
                    "label": "SETTINGS_UPDATE_INTERVAL_EVERYMONTH"
                }
            ]
        },
        "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Update_Interval"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null,
        "button",
        null,
        {
            "text": "SETTINGS_UPDATE_CHECKFORNEWUPDATES",
            "listeners": [
                {
                    "event": "click",
                    "callback": function(){
                        this.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATES");
                        this.disabled = true;
                        ytcenter.checkForUpdates((function(self){
                            return function(){
                                self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKFORNEWUPDATESSUCCESS");
                                self.disabled = false;
                            };
                        })(this), (function(self){
                            return function(){
                                self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATESERROR");
                                self.disabled = false;
                            };
                        })(this), (function(self){
                            return function(){
                                self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATESDISABLED");
                                self.disabled = true;
                            };
                        })(this));
                    }
                }
            ]
        }
    );
    subcat.addOption(option);

    /* DISABLED until implemented
     subcat = ytcenter.settingsPanel.createSubCategory("Channel"); cat.addSubCategory(subcat);
     */

    /* Category:Report */
    ytcenter.reportIssue.createSettingsCategory();

    /* Category:Debug */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DEBUG");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LOG"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "debugConsole", // defaultSetting
        "bool", // module
        "SETTINGS_DEBUG_CONSOLE"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textarea",
        null,
        {
            "styles": {
                "width": "100%",
                "height": "130px",
                "background-color": "#fff",
                "border": "1px solid #ccc"
            }
        }
    );
    subcat.addOption(option);
    subcat.addEventListener("click", (function(opt){
        return function(){
            con.log("[Debug] Loading debug log...");
            var module = opt.getLiveModule();
            if (module) {
                module.setText(ytcenter.language.getLocale("SETTINGS_DEBUG_LOADING"));
                uw.setTimeout(function(){
                    module.setText(ytcenter.getDebug());
                    module.selectAll();
                }, 100);
            }
        };
    })(option));

    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "button",
        null,
        {
            "text": "SETTINGS_DEBUG_CREATEGIST",
            "listeners": [
                {
                    "event": "click",
                    "callback": function() {
                        var content = document.createElement("div");
                        var data = {
                            "description": null,
                            "public": false,
                            "files": {
                                "debug_log.js": {
                                    "content": JSON.stringify(ytcenter.getDebug(false), undefined, 2)
                                }
                            }
                        };

                        if (devbuild) {
                            data.description = "@name@ v" + devnumber + " Debug Info";
                        } else {
                            data.description = "@name@ ".concat(ytcenter.version, "-", ytcenter.revision, " Debug Info");
                        }

                        var text = document.createElement("p");
                        text.appendChild(document.createTextNode(ytcenter.language.getLocale("GIST_TEXT")));
                        text.setAttribute("style", "margin-bottom: 10px");

                        content.appendChild(text);

                        var gistURL = document.createElement("input");
                        gistURL.setAttribute("type", "text");
                        gistURL.setAttribute("class", "yt-uix-form-input-text");
                        gistURL.setAttribute("value", ytcenter.language.getLocale("GIST_LOADING"));
                        gistURL.setAttribute("readonly", "readonly");
                        ytcenter.utils.addEventListener(gistURL, "focus", function() { this.select(); }, false);

                        content.appendChild(gistURL);

                        ytcenter.dialog("GIST_TITLE", content).setVisibility(true);

                        ytcenter.utils.xhr({
                            method: "POST",
                            url: "https://api.github.com/gists",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            data: JSON.stringify(data),
                            contentType: "application/x-www-form-urlencoded", // Firefox Addon
                            content: JSON.stringify(data), // Firefox Addon
                            onload: function(response) {
                                var details = JSON.parse(response.responseText);
                                gistURL.value = details.html_url;
                            }
                        });
                    }
                }
            ]
        }
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_EXPERIMENTS"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        "YouTubeExperiments", // defaultSetting
        "layoutExperiments"
    );
    subcat.addEventListener("click", (function(opt){
        return function(){
            var module = opt.getLiveModule();
            if (module && !module.hasLoadedOnce()) {
                module.loadExperiments();
            }
        };
    })(option));
    subcat.addOption(option);
    //subcat = ytcenter.settingsPanel.createSubCategory("Options"); cat.addSubCategory(subcat);


    /* Category:Share DISABLED until I implement it*/
    /*cat = ytcenter.settingsPanel.createCategory("Share");
     subcat = ytcenter.settingsPanel.createSubCategory("Share"); cat.addSubCategory(subcat);
     */

    /* Category:Donate */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DONATE");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_DONATE"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        null, // label
        {
            "textlocale": "SETTINGS_DONATE_TEXT",
            "replace": {
                "{wiki-donate}": function(){
                    var a = document.createElement("a");
                    a.setAttribute("target", "_blank");
                    a.setAttribute("href", "https://github.com/YePpHa/YouTubeCenter/wiki/Donate");
                    a.textContent = ytcenter.language.getLocale("SETTINGS_DONATE_WIKI");
                    ytcenter.language.addLocaleElement(a, "SETTINGS_DONATE_WIKI", "@textContent");
                    return a;
                }
            }
        }
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PAYPAL"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "textContent", // module
        null, // label
        {
            "textlocale": "SETTINGS_DONATE_PAYPAL_TEXT2",
            "replace": {
                "{page-link}": function(){
                    var a = document.createElement("a");
                    a.setAttribute("target", "_blank");
                    a.setAttribute("href", "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/support/PayPal.html");
                    a.textContent = ytcenter.language.getLocale("SETTINGS_DONATE_PAYPAL_LINK2");
                    ytcenter.language.addLocaleElement(a, "SETTINGS_DONATE_PAYPAL_LINK2", "@textContent");
                    return a;
                }
            }
        }
    );
    subcat.addOption(option);


    /* Category:About */
    cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_ABOUT");
    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_ABOUT"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "aboutText", // module
        null // label
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "link", // module
        null, // label
        {
            "titleLocale": "SETTINGS_ABOUT_LINKS",
            "links": [
                {text: "Wiki", url: "https://github.com/YePpHa/YouTubeCenter/wiki"},
                {text: "Facebook", url: "https://www.facebook.com/YouTubeCenter"},
                {text: "Google+", url: "https://plus.google.com/111275247987213661483/posts"},
                {text: "Firefox", url: "https://addons.mozilla.org/en-us/firefox/addon/youtube-center/"},
                {text: "Opera", url: "https://addons.opera.com/en/extensions/details/youtube-center/"},
                {text: "Maxthon", url: "http://extension.maxthon.com/detail/index.php?view_id=1201"},
                {text: "Github", url: "https://github.com/YePpHa/YouTubeCenter/"}
            ]
        }
    );
    subcat.addOption(option);

    subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_TRANSLATORS"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
        null, // defaultSetting
        "translators", // module
        null, // label
        { // args
            "translators": {
                "ar-BH": [
                    { name: "alihill381" }
                ],
                "bg-BG": [
                    { name: "Mani Farone" }
                ],
                "ca-ES": [
                    { name: "Joan Alemany" },
                    { name: "Raül Cambeiro" }
                ],
                "cs-CZ": [
                    { name: "Petr Vostřel", url: "http://petr.vostrel.cz/" },
                    { name: "R3gi", url: "mailto:regiprogi@gmail.com" }
                ],
                "da-DK": [
                    { name: "Lasse Olsen" },
                    { name: "Jeppe Rune Mortensen", url: "https://github.com/YePpHa/" }
                ],
                "de-DE": [
                    { name: "Simon Artmann" },
                    { name: "Sven \"Hidden\" W" }
                ],
                "en-US": [],
                "es-ES": [
                    { name: "Roxz" }
                ],
                "fa-IR": [],
                "fr-FR": [
                    { name: "ThePoivron", url: "http://www.twitter.com/DaPavron" }
                ],
                "he-IL": [
                    { name: "baryoni" }
                ],
                "hu-HU": [
                    { name: "Eugenox" },
                    { name: "Mateus" }
                ],
                "it-IT": [
                    { name: "Pietro De Nicolao" }
                ],
                "ja-JP": [
                    { name: "Lightning-Natto" }
                ],
                "ko-KR": [
                    { name: "Hyeongi Min", url: "https://www.facebook.com/MxAiNM" },
                    { name: "U Bless", url: "http://userscripts.org/users/ubless" }
                ],
                "no-NO": [
                    { name: "master3395", url: "https://www.youtube.com/user/master33951" },
                    { name: "Mathias Solheim", url: "http://mathias.ocdevelopment.net/" }
                ],
                "nl-NL": [
                    { name: "Marijn Roes" }
                ],
                "pl-PL": [
                    { name: "Piotr" },
                    { name: "kasper93" },
                    { name: "Piter432" }
                ],
                "pt-BR": [
                    { name: "Thiago R. M. Pereira" },
                    { name: "José Junior" },
                    { name: "Igor Rückert" }
                ],
                "pt-PT": [
                    { name: "Rafael Damasceno", url: "http://userscripts.org/users/264457" },
                    { name: "João P. Moutinho Barbosa" }
                ],
                "ro-RO": [
                    { name: "BlueMe", url: "http://www.itinerary.ro/" }
                ],
                "ru-RU": [
                    { name: "KDASOFT", url: "http://kdasoft.narod.ru/" }
                ],
                "sk-SK": [
                    { name: "ja1som" }
                ],
                "sv-SE": [
                    { name: "Christian Eriksson" }
                ],
                "tr-TR": [
                    { name: "Ismail Aksu" }
                ],
                "uk-UA": [
                    { name: "SPIDER-T1" },
                    { name: "Petro Lomaka", url: "https://plus.google.com/103266219992558963899/" }
                ],
                "vi-VN": [
                    { name: "Tuấn Phạm" }
                ],
                "zh-CN": [
                    { name: "雅丶涵", url: "http://www.baidu.com/p/%E9%9B%85%E4%B8%B6%E6%B6%B5" },
                    { name: "MatrixGT" }
                ],
                "zh-TW": [
                    { name: "泰熊" }
                ]
            }
        }
    );
    subcat.addOption(option);
};