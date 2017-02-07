/* Adds country flags to comments */

ytcenter.commentsPlus = (function(){
    var exports = {}, comments = [], observer = null;

    ytcenter.unload(function(){
        if (observer) {
            observer.disconnect();
        }
    });
    exports.__commentInfoIdNext = 0;
    exports.getCommentByElement = function(element){
        var i;
        for (i = 0; i < exports.comments.length; i++) {
            if (exports.comments[i].element === element) return exports.comments[i];
        }
        return null;
    };
    exports.getCommentObject = function(element){
        var detail = {};
        detail.element = element;
        detail.entryElement = element.parentNode;
        detail.contentElement = element.getElementsByClassName("content")[0];

        detail.headerElement = detail.contentElement.getElementsByClassName("comment-header")[0];
        detail.textElement = detail.contentElement.getElementsByClassName("comment-text")[0];

        detail.isReply = ytcenter.utils.hasClass(element, "reply");
        detail.hasSource = element.getElementsByClassName("comment-source").length > 0;

        detail.parentComment = null;
        if (detail.isReply) {
            detail.parentComment = exports.getCommentByElement(element.parentNode.previousElementSibling);
        }

        detail.url = element.getElementsByTagName("a")[0].getAttribute("href");
        console.log(detail.url);
        detail.protocol = detail.url.indexOf("https://") === 0 ? "https" : "http";

        if (detail.url.indexOf(ytcenter.protocol) !== 0) {
            if (ytcenter.protocol === "http://") {
                detail.url = detail.url.replace(/^https/, "http");
            } else if (ytcenter.protocol === "https://") {
                detail.url = detail.url.replace(/^http/, "https");
            }
        }

        detail.channelId = null;
        detail.googleId = null;
        detail.profileId = null;

        if (detail.url.indexOf("youtube.com/profile_redirector/") !== -1) {
            detail.profileId = detail.url.split("youtube.com/profile_redirector/")[1];
        } else if (detail.url.indexOf("youtube.com/channel/") !== -1) {
            detail.channelId = detail.url.split("youtube.com/channel/")[1];
        } else if (detail.url.indexOf("/channel/") !== -1) {
            detail.channelId = detail.url.split("/channel/")[1];
        } else if (detail.url.indexOf("youtube.com/user/") !== -1) {
            detail.channelId = detail.url.split("youtube.com/user/")[1];
        } else if (detail.url.indexOf("/user/") !== -1) {
            detail.channelId = detail.url.split("/user/")[1];
        } else if (detail.url.indexOf("apis.google.com/u/") !== -1) {
            var tokens = detail.url.split("/");
            detail.googleId = tokens[tokens.length - 1];
        }

        detail.country = ytcenter.cache.getItem("profile_country", detail.profileId || detail.channelId);

        if (detail.country) {
            detail.country = detail.country.data;
        } else {
            detail.country = null;
        }

        detail.flagAdded = false;

        return detail;
    };
    exports.comments = [];
    exports.commentLoaded = function(commentObject){
        var i;
        for (i = 0; i < exports.comments.length; i++) {
            /* Make sure that a comment won't be added multiple times */
            if (exports.comments[i].element === commentObject.element) {
                return true;
            }
        }
        return false;
    };
    exports.addCommentObject = function(commentObject){
        //if (ytcenter.utils.hasClass(commentObject.contentElement, "ytcenter-comments-loaded")) return;
        if (exports.commentLoaded(commentObject)) return;
        con.log("[CommentsPlus:addCommentObject] Adding new comment with id: " + exports.__commentInfoIdNext + ".");

        commentObject.id = exports.__commentInfoIdNext;
        exports.__commentInfoIdNext += 1;

        exports.comments.push(commentObject);
    };
    exports.loadComments = function(){
        var comments = document.getElementsByClassName("comment-item");
        for (var i = 0; i < comments.length; i++) {
            try {
                exports.addCommentObject(exports.getCommentObject(comments[i]));
            } catch (e) {
                con.error(e);
            }
        }
    };
    exports.addFlagPlaceholder = function(comment){
        function onLanguageUpdate() {
            var title = ytcenter.language.getLocale(comment.flagElements.title);
            img.setAttribute("alt", title);
            img.setAttribute("title", title);
            img.setAttribute("data-tooltip-text", title);
        }
        comment && comment.unloadLoadButton && comment.unloadLoadButton();

        var metadata = comment.headerElement;

        var container = document.createElement("span");
        container.className = "country";

        var img = document.createElement("img");
        img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
        img.className = "ytcenter-flag-loading";

        container.appendChild(img);

        comment.flagElements = {};
        comment.flagElements.container = container;
        comment.flagElements.img = img;
        comment.flagElements.title = "COMMENTS_COUNTRY_BUTTON_LOAD_LOADING";
        comment.flagElements.onLanguageUpdate = onLanguageUpdate;

        ytcenter.events.addEvent("language-refresh", onLanguageUpdate);
        onLanguageUpdate();

        exports.addElement(metadata, container, comment);
    };
    exports.completeFlag = function(comment, country){
        if (!comment.flagElements) exports.addFlagPlaceholder(comment);
        var container = comment.flagElements.container;
        var img = comment.flagElements.img;
        var onLanguageUpdate = comment.flagElements.onLanguageUpdate;

        if (ytcenter.settings.commentCountryShowFlag && ytcenter.flags[country.toLowerCase()]) {
            img.className = ytcenter.flags[country.toLowerCase()];
            if (ytcenter.settings.commentCountryUseNames) {
                if (country === "unknown") {
                    comment.flagElements.title = "COUNTRY_UNKNOWN";
                } else {
                    comment.flagElements.title = "COUNTRY_ISO3166-1_CODES_" + country.toUpperCase();
                }
            } else {
                comment.flagElements.title = country;
            }
            onLanguageUpdate();
        } else {
            ytcenter.events.removeEvent("language-refresh", onLanguageUpdate);
            if (country === "unknown") {
                var countryName = ytcenter.language.getLocale("COUNTRY_UNKNOWN");
            } else {
                var countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
            }

            if (ytcenter.settings.commentCountryUseNames) {
                container.textContent = countryName || country;
                ytcenter.events.addEvent("language-refresh", function(){
                    if (country === "unknown") {
                        var _countryName = ytcenter.language.getLocale("COUNTRY_UNKNOWN");
                    } else {
                        var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
                    }
                    container.textContent = _countryName || country;
                });
            } else {
                container.textContent = country;
            }
        }
    };
    exports.addLoadButton = function(comment){
        function onLanguageRefresh(){
            var title = ytcenter.language.getLocale(btn_text);
            btn.element.setAttribute("alt", title);
            btn.element.setAttribute("title", title);
            btn.element.setAttribute("data-tooltip-text", title);
        }
        var countryContainer = document.createElement("span"),
            metadata = comment.headerElement, btn = null,
            btn_text = "COMMENTS_COUNTRY_BUTTON_LOAD";
        countryContainer.className = "country";
        btn = ytcenter.modules.button({
            args: {
                listeners: [
                    {
                        event: "click",
                        callback: function(){
                            if (countryContainer && countryContainer.parentNode) {
                                comment.unloadLoadButton = function(){
                                    countryContainer && countryContainer.parentNode && countryContainer.parentNode.removeChild && countryContainer.parentNode.removeChild(countryContainer);
                                    ytcenter.events.removeEvent("language-refresh", onLanguageRefresh);

                                    comment.unloadLoadButton = null;
                                    btn = null;
                                    btn_text = null;
                                    countryContainer = null;
                                    metadata = null;
                                };
                                exports.handleFlagWorker(comment);
                            }
                        }
                    }
                ]
            }
        });

        onLanguageRefresh();
        ytcenter.events.addEvent("language-refresh", onLanguageRefresh);

        btn.element.className += " ytcenter-flag-button yt-uix-tooltip";
        btn.element.style.verticalAlign = "middle";
        countryContainer.appendChild(btn.element);

        exports.addElement(metadata, countryContainer, comment);
    };
    exports.addElement = function(metadata, container, comment){
        if (ytcenter.settings.commentCountryPosition === "before_username") {
            container.style.marginRight = "10px";
            if (comment.hasSource) {
                metadata.insertBefore(container, metadata.children[1]);
            } else {
                metadata.insertBefore(container, metadata.children[0]);
            }
        } else if (ytcenter.settings.commentCountryPosition === "after_username") {
            container.style.marginLeft = "6px";
            if (comment.hasSource) {
                metadata.insertBefore(container, metadata.childNodes[2]);
            } else {
                metadata.insertBefore(container, metadata.children[1]);
            }
        } else if (ytcenter.settings.commentCountryPosition === "last") {
            container.style.marginLeft = "10px";
            if (comment.hasSource) {
                metadata.insertBefore(container, metadata.lastChild);
            } else if (!comment.isReply) {
                if (metadata.children.length > 2) {
                    metadata.insertBefore(container, metadata.children[2]);
                } else {
                    metadata.appendChild(container);
                }
            } else {
                if (metadata.children.length > 3) {
                    metadata.insertBefore(container, metadata.children[3]);
                } else {
                    metadata.appendChild(container);
                }
            }
        }
    };
    exports.handleFlagWorker = function(comment){
        exports.addFlagPlaceholder(comment);
        ytcenter.jobs.createWorker(comment.profileId || comment.channelId || comment.googleId, function(args){
            try {
                if (comment.profileId || comment.googleId) {
                    ytcenter.getGooglePlusUserData(comment.profileId || comment.googleId, function(data){
                        if (data) {
                            comment.country = data;
                        } else {
                            comment && comment.unloadLoadButton && comment.unloadLoadButton();
                            con.error("[Comment Country] Unknown Location", data);
                        }
                        args.complete(comment.country || null);
                    });
                } else if (comment.channelId) {
                    ytcenter.getUserData(comment.channelId, function(data){
                        if (data) {
                            comment.country = data;
                        } else {
                            comment && comment.unloadLoadButton && comment.unloadLoadButton();
                            con.error("[Comment Country] Unknown Location", data);
                        }
                        args.complete(comment.country || null);
                    });
                } else {
                    comment && comment.unloadLoadButton && comment.unloadLoadButton();
                    args.complete(null);
                }
            } catch (e) {
                comment && comment.unloadLoadButton && comment.unloadLoadButton();
                con.error(e);
                args.complete(null);
            }
        }, function(data){
            if (!data) data = "unknown";
            if (comment.profileId || comment.channelId) {
                ytcenter.cache.putItem("profile_country", comment.profileId || comment.channelId, data, 2678400000 /* 31 days */);
            }

            comment.country = data;
            exports.completeFlag(comment, data);
        });
    };
    exports.handleFlag = function(comment){
        if (comment.flagAdded) return;
        comment.flagAdded = true;

        if (comment.country) {
            exports.completeFlag(comment, comment.country);
        } else if (ytcenter.settings.commentCountryButtonLoad) {
            exports.addLoadButton(comment);
        } else {
            if (ytcenter.settings.commentCountryLazyLoad) {
                ytcenter.domEvents.addEvent(comment.element, "enterview", function(){
                    exports.handleFlagWorker(comment);
                }, true);
            } else {
                exports.handleFlagWorker(comment);
            }
        }
    };
    exports.addFlags = function(){
        if (!ytcenter.settings.commentCountryEnabled) return;
        var i;
        for (i = 0; i < exports.comments.length; i++) {
            exports.handleFlag(exports.comments[i]);
        }
    };

    exports.update = function(){
        if (!ytcenter.settings.commentCountryEnabled) return;

        exports.loadComments();
        exports.addFlags();
    };
    exports.setupObserver = function(){
        try {
            observer = ytcenter.mutation.observe(document.getElementById("watch-discussion"), { childList: true, subtree: true }, exports.update);
        } catch (e) {
            con.error(e);
        }
    };
    exports.dispose = function(){
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };
    exports.setup = function(){
        if (!ytcenter.settings.commentCountryEnabled) return;
        ytcenter.cache.putCategory("profile_country", ytcenter.settings.commentCacheSize);

        ytcenter.domEvents.setup();

        exports.update();

        document.body.className += " ytcenter-comments-plus";

        ytcenter.events.addEvent("resize-update", function(){
            exports.update();
        });
        exports.setupObserver();
    };

    return exports;
})();