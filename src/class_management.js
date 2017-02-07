/* Is responsible for automatically applying CSS classes to specific elements */

ytcenter.classManagement = {};
ytcenter.classManagement.applyClassesExceptElement = function(el, url){
    if (ytcenter.page === "embed") return;
    if (url) url = ytcenter.utils.getURL(url);
    else url = loc;
    var i;
    for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element() && ytcenter.classManagement.db[i].element() !== el) {
            if (ytcenter.classManagement.db[i].condition(url))
                ytcenter.utils.addClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
            else
                ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else if (!ytcenter.classManagement.db[i].element()) {
            //con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
    }
};
ytcenter.classManagement.applyClassesForElement = function(el, url){
    var i, elm;
    if (ytcenter.page === "embed") return;
    if (url) url = ytcenter.utils.getURL(url);
    else url = loc;
    for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        elm = ytcenter.classManagement.db[i].element();
        if (elm === el) {
            if (ytcenter.classManagement.db[i].condition(url)) {
                ytcenter.utils.addClass(elm, ytcenter.classManagement.db[i].className);
            } else {
                ytcenter.utils.removeClass(elm, ytcenter.classManagement.db[i].className);
            }
        }
    }
};
ytcenter.classManagement.applyClasses = function(url){
    if (ytcenter.page === "embed") return;
    if (url) url = ytcenter.utils.getURL(url);
    else url = loc;
    var i;
    for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
            if (ytcenter.classManagement.db[i].condition(url))
                ytcenter.utils.addClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
            else
                ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else {
            //con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
    }
};
ytcenter.classManagement.getClassesForElementById = function(id, url){
    if (ytcenter.page === "embed") return;
    if (url) url = ytcenter.utils.getURL(url);
    else url = loc;
    var i, a = [];
    for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
            if (ytcenter.classManagement.db[i].element().getAttribute("id") === id
                && ytcenter.classManagement.db[i].condition(url))
                a.push(ytcenter.classManagement.db[i].className);
        } else {
            //con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
    }
    return a.join(" ");
};
ytcenter.classManagement.getClassesForElementByTagName = function(tagname, url){
    if (ytcenter.page === "embed") return;
    if (url) url = ytcenter.utils.getURL(url);
    else url = loc;
    var i, a = [];
    for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
            if (ytcenter.classManagement.db[i].element().tagName === tagname
                && ytcenter.classManagement.db[i].condition(url))
                a.push(ytcenter.classManagement.db[i].className);
        } else {
            //con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
    }
    return a.join(" ");
};
ytcenter.classManagement.updateClassesByGroup = function(groups, url) {
    function isGroup(a, b) {
        var i, j;

        if (a.length === 1 && b.length === 1) {
            return a[0] === b[0];
        } else if (a.length === 1 && b.length > 1) {
            for (i = 0; i < b.length; i++) {
                if (a[0] === b[i]) {
                    return true;
                }
            }
        } else if (a.length > 1 && b.length === 1) {
            for (i = 0; i < a.length; i++) {
                if (a[i] === b[0]) {
                    return true;
                }
            }
        } else if (a.length > 1 && b.length > 1) {
            for (i = 0; i < a.length; i++) {
                for (j = 0; j < b.length; j++) {
                    if (a[i] === b[j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    var i, j, k, elm = null;

    if (ytcenter.page === "embed") return;
    if (url) url = ytcenter.utils.getURL(url);
    else url = loc;

    if (!ytcenter.utils.isArray(groups)) {
        groups = [groups];
    }
    for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (isGroup(groups, ytcenter.classManagement.db[i].groups)) {
            elm = ytcenter.classManagement.db[i].element();
            if (elm) {
                if (ytcenter.classManagement.db[i].condition(url)) {
                    ytcenter.utils.addClass(elm, ytcenter.classManagement.db[i].className);
                } else {
                    ytcenter.utils.removeClass(elm, ytcenter.classManagement.db[i].className);
                }
            }
        }
    }
};
/* TODO remove this mess and create dedicated functions */
ytcenter.classManagement.db = [
    {element: function(){return document.getElementById("page");}, className: "watch-stage-mode", condition: function(){return false;}, groups: ["init", "page", "page-center"]}, // We have our own theatre mode
    {element: function(){return document.getElementById("player");}, className: "", condition: function(loc){
        if (ytcenter.settings.removeBrandingBackground) {
            var p = document.getElementById("player");
            p.style.backgroundImage = "";
            p.style.backgroundColor = "";
        }
        return false;
    }, groups: ["player-branding"]},
    {element: function(){return document.getElementById("page");}, className: "", condition: function(loc){
        document.getElementById("page").style.setProperty("padding-left", "");
    }, groups: ["page-center", "page"]},
    {element: function(){return document.body;}, className: "white", condition: function(loc){
        var p = ytcenter.getPage();
        if (p === "watch") {
            return ytcenter.html5 && ytcenter.settings.playerColor === "white";
        } else if (p === "embed") {
            return ytcenter.html5 && ytcenter.settings.embed_playerColor === "white";
        } else if (p === "channel") {
            return ytcenter.html5 && ytcenter.settings.channel_playerColor === "white";
        }
        return false;
    }, groups: ["player-color"]},
    {element: function(){return document.body;}, className: "ytcenter-player-darkside-bg", condition: function(loc){
        return ytcenter.player.darkside();
    }, groups: ["darkside", "page"]},
    {groups: ["hide-recommended-channels"], element: function(){return document.body;}, className: "ytcenter-hide-recommended-channels", condition: function(loc){return ytcenter.settings.hideRecommendedChannels;}},
    {groups: ["hide-feed-item-action-menu"], element: function(){return document.body;}, className: "ytcenter-hide-feed-item-action-menu", condition: function(loc){return ytcenter.settings.disableFeedItemActionMenu;}},
    {groups: ["hide-guide-count"], element: function(){return document.body;}, className: "ytcenter-hide-guide-count", condition: function(loc){return ytcenter.settings.disableGuideCount;}},
    {groups: ["darkside"], element: function(){return document.body;}, className: "ytcenter-player-darkside-bg-retro", condition: function(loc){return (ytcenter.getPage() === "watch" && ytcenter.player.getCurrentPlayerSize().large && ytcenter.settings.playerDarkSideBG && ytcenter.settings.playerDarkSideBGRetro);}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-topleft", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "topleft";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-topright", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "topright";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-bottomleft", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "bottomleft";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-bottomright", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "bottomright";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-always", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "always";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-show_hover", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "show_hover";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-hide_hover", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "hide_hover";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-never", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "never";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-topleft", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "topleft";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-topright", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "topright";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-bottomleft", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "bottomleft";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-bottomright", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "bottomright";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-always", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "always";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-show_hover", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "show_hover";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-hide_hover", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "hide_hover";}},
    {groups: ["thumbnail"], element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-never", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "never";}},
    {groups: ["hide-ticker", "page"], element: function(){return document.body;}, className: "ytcenter-ticker-hidden", condition: function(loc){
        if (ytcenter.settings["hideTicker"]) {
            ytcenter.utils.removeClass(document.body, "sitewide-ticker-visible");
            return true;
        } else {
            return false;
        }
    }},
    {groups: ["hide-lang", "page"], element: function(){return document.body;}, className: "hide-lang-alert", condition: function(loc){ return ytcenter.settings["hideLangAlert"]; }},
    {groups: ["player-endscreen"], element: function(){return document.body;}, className: "ytcenter-disable-endscreen", condition: function(loc){return loc.pathname === "/watch" && ytcenter.settings["removeRelatedVideosEndscreen"];}},
    {groups: ["lightsoff"], element: function(){return document.body;}, className: "ytcenter-lights-off-click-through", condition: function(loc){return ytcenter.settings["lightbulbClickThrough"];}},
    {groups: ["hide-watched-videos", "page"], element: function(){return document.body;}, className: "ytcenter-hide-watched-videos", condition: function(loc){return ytcenter.gridview.isEnabled() && loc.pathname.indexOf("/feed/watch_later") !== 0 && ytcenter.settings.hideWatchedVideos;}},
    {groups: ["gridview", "page"], element: function(){return document.body;}, className: "ytcenter-gridview", condition: function(loc){return ytcenter.gridview.isEnabled();}},
    {groups: ["flex"], element: function(){return document.getElementById("page");}, className: "no-flex", condition: function(loc){return !ytcenter.settings.flexWidthOnPage && loc.pathname !== "/watch";}},
    {groups: ["lightsoff"], element: function(){return document.body;}, className: "ytcenter-lights-off", condition: function(loc){return ytcenter.player.isLightOff;}},
    {groups: ["ads"], element: function(){return document.getElementById("watch-video-extra");}, className: "hid", condition: function(loc){return ytcenter.settings.removeAdvertisements;}},
    {groups: ["flex", "page"], element: function(){return document.body;}, className: "flex-width-enabled", condition: function(loc){var p = ytcenter.getPage();return (loc.pathname === "/watch" || (ytcenter.settings.flexWidthOnPage && loc.pathname !== "/html5" && loc.pathname !== "/watch" && p !== "channel") || (ytcenter.settings.flexWidthOnChannelPage && p === "channel"))}},
    {groups: ["player-branding"], element: function(){return document.body;}, className: "ytcenter-branding-remove-banner", condition: function(loc){return ytcenter.settings.removeBrandingBanner;}},
    {groups: ["player-branding"], element: function(){return document.body;}, className: "ytcenter-branding-remove-background", condition: function(loc){return ytcenter.settings.removeBrandingBackground;}},
    {groups: ["ads"], element: function(){return document.body;}, className: "ytcenter-remove-ads-page", condition: function(loc){return ytcenter.settings.removeAdvertisements;}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-not-watch", condition: function(loc){return loc.pathname !== "/watch";}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-search", condition: function(loc){return loc.pathname === "/results";}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-watch", condition: function(loc){return loc.pathname === "/watch";}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-home", condition: function(loc){return loc.pathname === "/";}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-feed", condition: function(loc){return loc.pathname.indexOf("/feed/") === 0 || loc.pathname === "/";}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-subscriptions", condition: function(loc){return loc.pathname.indexOf("/feed/subscriptions") === 0;}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-site-channel", condition: function(){return ytcenter.getPage() === "channel";}},
    {groups: ["header", "page"], element: function(){return document.body;}, className: "static-header", condition: function(){return ytcenter.settings.staticHeader;}},
    {groups: ["player-resize", "page"], element: function(){return document.body;}, className: "ytcenter-non-resize", condition: function(loc){return loc.pathname === "/watch" && !ytcenter.settings.enableResize;}},
    {groups: ["player-resize", "page"], element: function(){return document.body;}, className: "ytcenter-resize", condition: function(loc){return loc.pathname === "/watch" && ytcenter.settings.enableResize;}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-livestream", condition: function(){return ytcenter.player.isLiveStream();}},
    {groups: ["page"], element: function(){return document.getElementById("watch-appbar-playlist");}, className: "player-height", condition: function(){return !ytcenter.settings.enableResize;}},
    {groups: ["page", "html5player"], element: function(){return document.body;}, className: "ytcenter-hide-watch-later-on-player", condition: function(){return ytcenter.settings.hideWatchLaterOnPlayer;}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-hide-footer", condition: function(){return ytcenter.settings.hideFooter;}},
    {groups: ["page"], element: function(){return document.body;}, className: "ytcenter-player-gap", condition: function(){return ytcenter.settings.player_gap;}}
];