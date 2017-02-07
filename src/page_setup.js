/* Sets up YouTube Center for the current page, depending on which kind of page it is */

ytcenter.pageSetup = function(){
    var page = ytcenter.getPage();

    ytcenter.channelPlaylistLinks.update();
    ytcenter.searchRowLimit.update();

    if (ytcenter.settings.useStaticLogo) {
        ytcenter.utils.addClass(document.body, "static-yt-logo");
    }

    // Fix missing tooltip for videos
    var titleLinks = document.getElementsByClassName("yt-uix-tile-link");
    for (var i = 0, len = titleLinks.length; i < len; i++) {
        var titleLink = titleLinks[i];

        titleLink.setAttribute("title", titleLink.textContent);
    }

    if (page !== "watch") {
        ytcenter.player.turnLightOn();
    } else if (ytcenter.settings.lightbulbAutoOff) {
        ytcenter.player.turnLightOff();
    }

    if (page === "watch") {
        if (!ytcenter.settings.enableComments) {
            ytcenter.commentsLoader.setup();
        }
        ytcenter.playlistAutoPlay.init();
        ytcenter.playerDocking.init();
        ytcenter.autoplayRecommendedVideo.init();

        ytcenter.effects.playerGlow.setOption("pixelInterval", ytcenter.settings.playerGlowPixelInterval);
        ytcenter.effects.playerGlow.setOption("factor", ytcenter.settings.playerGlowFactor);
        ytcenter.effects.playerGlow.setOption("glowEffectOnPlayer", ytcenter.settings.playerGlowEffectOnPlayer);
        ytcenter.effects.playerGlow.setOption("interval", (ytcenter.settings.playerGlowRequestAnimationFrame ? -1 : ytcenter.settings.playerGlowUpdateInterval));
        ytcenter.effects.playerGlow.setOption("transition", ytcenter.settings.playerGlowTransition/1000);
        ytcenter.effects.playerGlow.setOption("blur", ytcenter.settings.playerGlowBlur);
        ytcenter.effects.playerGlow.setOption("spread", ytcenter.settings.playerGlowSpread);
        ytcenter.effects.playerGlow.setOption("opacity", ytcenter.settings.playerGlowOpacity/100);

        ytcenter.effects.playerGlow.setOption("multiglow", ytcenter.settings.playerMultiGlowEffect);
        ytcenter.effects.playerGlow.setOption("depth", ytcenter.settings.playerMultiGlowEffectDepth);
        ytcenter.effects.playerGlow.setOption("blockInterval", ytcenter.settings.playerMultiGlowEffectBlockInterval);

        ytcenter.effects.playerGlow.setEnabled(ytcenter.settings.playerGlowEnabled);

        var description = document.getElementById("action-panel-details");
        var headline = document.getElementById("watch7-headline");

        if (description && ytcenter.settings.expandDescription) {
            ytcenter.utils.removeClass(description, "yt-uix-expander-collapsed");
        }
        if (headline && ytcenter.settings.headlineTitleExpanded) {
            ytcenter.utils.removeClass(headline, "yt-uix-expander-collapsed");
        }
    }

    ytcenter.gridview.update();

    if (page !== "embed") {
        ytcenter.title.init();
        ytcenter.topScrollPlayer.setup();
        ytcenter.topScrollPlayer.setEnabled(ytcenter.getPage() === "watch" && ytcenter.settings.topScrollPlayerEnabled);
    }

    var page_element = document.getElementById("page");
    if (page_element && page === "watch" && ytcenter.settings.staticHeader_scrollToPlayer && ytcenter.settings.staticHeader) {
        ytcenter.utils.scrollTop(ytcenter.utils.getScrollPosition(page_element).y/2);
    }

    /* A simple Webkit hack, which will fix the horizontal scroll bar from appearing */
    if (document.body.className.indexOf("webkit") !== -1) {
        var guideButton = document.getElementById("appbar-guide-button"),
            _timer = null;
        ytcenter.utils.addEventListener(guideButton, "click", function(){
            function startTimer() {
                ytcenter.utils.cssFix(pageElm);
                _timer = uw.setInterval(function(){
                    if (count > 3) {
                        stopTimer();
                    }
                    ytcenter.utils.cssFix(pageElm);
                    count++;
                }, 300);
            }
            function stopTimer() {
                if (_timer) {
                    uw.clearInterval(_timer);
                    _timer = null;
                }
            }
            var pageElm = document.getElementById("page"),
                count = 0;
            stopTimer();
            startTimer();
        }, false);
    }

    if (page === "embed") return; // We don't want the embed page to do these things.

    // UI
    ytcenter.classManagement.applyClassesExceptElement(document.body);
    try {
        ytcenter.thumbnail.setup();
        ytcenter.domEvents.setup();
    } catch (e) {
        con.error(e);
    }

    if (page === "feed_what_to_watch") {
        ytcenter.intelligentFeed.setup();
    }

    if (ytcenter.settings["resize-default-playersize"] === "default") {
        ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
        ytcenter.player.updateResize();
    } else {
        ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
        ytcenter.player.updateResize();
    }

    var id, config;
    if (page === "watch") {
        ytcenter.uploaderFlag.init();

        ytcenter.page = "watch";

        ytcenter.sparkbar.update();
        ytcenter.likedislikeButtons.update();

        ytcenter.playlist = false;
        if (document.getElementById("watch7-playlist-data") || (loc && loc.search && typeof loc.search.indexOf === "function" && loc.search.indexOf("list=") !== -1)) {
            ytcenter.playlist = true;
        }

        var cfg = ytcenter.player.getConfig();
        var userHeader = document.getElementById("watch7-user-header");
        var userName = document.getElementsByClassName("yt-user-name");

        if (cfg && cfg.args && cfg.args.author) {
            ytcenter.video.author = cfg.args.author;
        } else if (userName && userName.length > 1 && userName[1] && userName[1].textContent) {
            ytcenter.video.author = userName[1].textContent;
        } else if (userName && userName.length > 0 && userName[0] && userName[0].textContent) {
            ytcenter.video.author = userName[0].textContent;
        }

        if (ytcenter.video.author) {
            ytcenter.user.callChannelFeed(ytcenter.video.author, function(){
                ytcenter.video._channel = this;
                ytcenter.video.channelname = this.title['$t'];
            });
        }
    } else if (page === "channel") {
        ytcenter.page = "channel";
        var upsell = document.getElementById("upsell-video");
        if (upsell) {
            var swf_config = JSON.parse(upsell.getAttribute("data-swf-config").replace(/&amp;/g, "&").replace(/&quot;/g, "\""));
            swf_config = ytcenter.player.modifyConfig(ytcenter.getPage(), swf_config);
            //ytcenter.player.setConfig(swf_config);

            upsell.setAttribute("data-swf-config", JSON.stringify(swf_config).replace(/&/g, "&amp;").replace(/"/g, "&quot;"));
        }

        /*if (document.body.innerHTML.indexOf("data-video-id=\"") !== -1) {
         id = document.body.innerHTML.match(/data-video-id=\"(.*?)\"/)[1];
         } else if (document.body.innerHTML.indexOf("/v/") !== -1) {
         id = document.body.innerHTML.match(/\/v\/([0-9a-zA-Z_-]+)/)[1];
         } else if (document.body.innerHTML.indexOf("\/v\/") !== -1) {
         id = document.body.innerHTML.match(/\\\/v\\\/([0-9a-zA-Z_-]+)/)[1];
         }
         if (id) {
         var url = ytcenter.utils.getLocationOrigin() + "/get_video_info?html5=0&cver=html5&dash=" + (ytcenter.settings.channel_dashPlayback ? "1" : "0") + "&video_id=" + id + "&eurl=" + encodeURIComponent(loc.href);
         con.log("Contacting: " + url);
         ytcenter.utils.xhr({
         method: "GET",
         url: url,
         headers: {
         "Content-Type": "text/plain"
         },
         onload: function(response){
         try {
         if (response.responseText) {
         var o = {};
         var s = response.responseText.split("&");
         for (var i = 0; i < s.length; i++) {
         var ss = s[i].split("=");
         o[ss[0]] = decodeURIComponent(ss[1]);
         }
         ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), {args: o}));
         config = ytcenter.player.config;
         ytcenter.player.update(config);

         if (ytcenter.player.config.updateConfig) {
         ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
         }
         }
         } catch (e) {
         con.error(response.responseText);
         con.error(e);
         }
         },
         onerror: function(){
         ytcenter.video.streams = [];
         }
         });
         }*/
    } else if (page === "search") {
        ytcenter.page = "search";
    } else {
        ytcenter.page = "normal";
    }

    if (page === "watch") {
        //ytcenter.actionPanel.setup();

        ytcenter.player.setYTConfig({ "SHARE_ON_VIDEO_END": false });
        ytcenter.player.setConfig(ytcenter.player.modifyConfig("watch", uw.ytplayer.config));

        ytcenter.player.update(ytcenter.player.config);

        ytcenter.videoHistory.addVideo(ytcenter.player.config.args.video_id);
    }

    // Initialize the placement system
    if (page === "watch") {
        // Clear groups
        ytcenter.placementsystem.clearGroups();

        var watch8ActionButtons = document.getElementById("watch8-action-buttons");

        var watch8SecondaryActions = document.getElementById("watch8-secondary-actions");
        var watch8SentimentActions = document.getElementById("watch8-sentiment-actions");

        var ytcenterGroup = document.createElement("div");
        ytcenterGroup.setAttribute("id", "watch8-ytcenter-buttons");

        var userHeader = document.getElementById("watch7-user-header");
        if (watch8ActionButtons) {
            if (watch8ActionButtons.children.length > 0) {
                watch8ActionButtons.insertBefore(ytcenterGroup, watch8ActionButtons.children[0]);
            } else {
                watch8ActionButtons.appendChild(ytcenterGroup);
            }
        } else if (userHeader && userHeader.nextElementSibling) {
            userHeader.parentNode.insertBefore(ytcenterGroup, userHeader.nextElementSibling);
        } else if (userHeader) {
            userHeader.parentNode.appendChild(ytcenterGroup);
        } else if (watch8ActionButtons) {
            watch8ActionButtons.parentNode.insertBefore(ytcenterGroup, watch8ActionButtons);
        }

        // Add the YouTube Center group
        ytcenter.placementsystem.createGroup("ytcenter", ytcenterGroup, {});

        // Add the watch8-action-buttons group
        if (watch8SecondaryActions) {
            ytcenter.placementsystem.createGroup("watch8-secondary-actions", watch8SecondaryActions, {});
        }

        // Add the watch8-sentiment-actions group
        if (watch8ActionButtons) {
            ytcenter.placementsystem.createGroup("watch8-sentiment-actions", watch8SentimentActions, {});
        }

        // Creating buttons, which will be added to the ytcenter group
        $CreateDownloadButton();
        $CreateRepeatButton();
        $CreateLightButton();
        $CreateAspectButton();
        $CreateResizeButton();

        var referenceList = ytcenter.placementsystem.createReferenceList();
        ytcenter.placementsystem.placementGroupsReferenceList = referenceList;

        if (ytcenter.settings.placementGroups) {
            ytcenter.placementsystem.setSortList(ytcenter.settings.placementGroups, referenceList);
        } else {
            ytcenter.settings.placementGroups = ytcenter.placementsystem.getSortList(referenceList);
        }
    }
};