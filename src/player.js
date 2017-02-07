/* Functions to access the YouTube player */

ytcenter.player = {};
ytcenter.player.config = {};

ytcenter.player.fixThumbnailOverlay = function(state) {
    if (ytcenter.utils.hasClass(document.body, "exp-watch-controls-overlay") && ytcenter.page === "watch") {
        var player = document.getElementById("player-api");
        if (player) {
            var thumbOverlay = player.getElementsByClassName("ytp-thumbnail-overlay ytp-cued-thumbnail-overlay");
            if (thumbOverlay.length > 0 && thumbOverlay[0]) {
                thumbOverlay = thumbOverlay[0];

                var playIcon = thumbOverlay.getElementsByClassName("ytp-large-play-button");
                if (playIcon.length > 0 && playIcon[0]) {
                    playIcon = playIcon[0];

                    thumbOverlay.removeAttribute("aria-hidden");
                    playIcon.removeAttribute("aria-hidden");

                    if (typeof state !== "number") {
                        var api = ytcenter.player.getAPI();
                        if (api && api.getPlayerState) {
                            state = api.getPlayerState();
                        }
                    }

                    var movie_player = document.getElementById("movie_player");

                    if (state === -1) {
                        thumbOverlay.style.display = "";
                        playIcon.style.display = "";
                        movie_player && ytcenter.utils.addClass(movie_player, "unstarted-mode");
                    } else {
                        thumbOverlay.style.display = "none";
                        playIcon.style.display = "none";
                        movie_player && ytcenter.utils.removeClass(movie_player, "unstarted-mode");
                    }
                }
            }
        }
    }
};

ytcenter.player.setPlaybackState = (function(){
    function updateState(state, s) {
        con.log("[Player:setPlaybackState] Preferred state: " + state + ", current state: " + s);
        var api = ytcenter.player.getAPI();
        var muted = false;
        if (s === 1) {
            if (state === 0) {
                api.mute();
                api.stopVideo();
                !ytcenter.settings.mute && api.isMuted && api.unMute();
            } else if (state === 1) {
                api.playVideo();
            } else if (state === 2) {
                api.mute();
                api.pauseVideo();
                !ytcenter.settings.mute && api.isMuted && api.unMute();
            }
            ytcenter.player.listeners.removeEventListener("onStateChange", listener);

            if (!ytcenter.html5) {
                setState.preferredState = null;
            }
        } else if (s <= 0 && state === 2) {
            api.mute();

            api.playVideo();
            api.pauseVideo();

            !ytcenter.settings.mute && api.isMuted && api.unMute();

            ytcenter.player.listeners.removeEventListener("onStateChange", listener);

            if (!ytcenter.html5) {
                setState.preferredState = null;
            }
        }

        /*if (ytcenter.html5) {
         ytcenter.utils.asyncCall(function(){
         var newState = api.getPlayerState();
         if (newState !== state && (newState !== -1 && newState !== 5) && typeof newState === "number") {
         updateState(state, newState);
         } else {
         setState.preferredState = null;
         }
         });
         }*/
    }
    function setState(state) {
        if (ytcenter.html5PlayWrapper.isInitialized() && ytcenter.html5) return;
        setState.preferredState = state;

        var api = ytcenter.player.getAPI();

        con.log("[Player:setPlaybackState] State is changed to " + state);

        if (listener !== null) {
            ytcenter.player.listeners.removeEventListener("onStateChange", listener);
        }
        listener = ytcenter.utils.bindArgument(updateState, state);
        ytcenter.player.listeners.addEventListener("onStateChange", listener);

        updateState(state, api.getPlayerState());
    }
    var listener = null;

    setState.preferredState = null;

    return setState;
})();
ytcenter.player.setQuality = (function(){
    function stateChange(vq, state) {
        api = ytcenter.player.getAPI();
        if (api) {
            if (state === 1 && step === 0) {
                step = 1;
                api.setPlaybackQuality(vq);
                api.seekTo(api.getCurrentTime());
                api.pauseVideo();
            } else if (state === 2 && step === 1) {
                step = 2;
                api.setPlaybackQuality(vq);
                api.seekTo(api.getCurrentTime());
                api.playVideo();
            } else if (state === 1 && step === 2) {
                step = -1;
                api.setPlaybackQuality(vq);
                api.seekTo(api.getCurrentTime());

                removeStateListener();
            }
        }
    }
    function addStateListener(vq) {
        listener = ytcenter.utils.bindArgument(stateChange, vq);
        ytcenter.player.listeners.addEventListener("onStateChange", listener);
        addedListener = true;
    }
    function removeStateListener(vq) {
        ytcenter.player.listeners.removeEventListener("onStateChange", listener);
        listener = null;
        addedListener = false;
    }
    function reloadQuality(vq) {
        api = ytcenter.player.getAPI();

        /* Forcing the quality */
        step = 0; /* Starting the hack */
        if (!addedListener) {
            addStateListener(vq);
        }
        /* Checking if the player is already playing the video. If that's the case then execute the stateChange with state set to 1 */
        if (api.getPlayerState() === 1) {
            stateChange(vq, 1);
        }
    }
    function setQuality(vq) {
        if (!ytcenter.player.isAutoResolutionEnabled()) return;
        api = ytcenter.player.getAPI();
        if (api && typeof api.setPlaybackQuality === "function") {
            con.log("[Player:SetQuality] Setting quality to " + vq);

            api.setPlaybackQuality(vq); /* Setting the preferred quality. */
            //reloadQuality(vq);
        } else {
            con.log("[Player:SetQuality] API not ready!");
        }
    }

    var addedListener = false;
    var listener = null;
    var step = -1;
    var api = null;

    return setQuality;
})();
ytcenter.player.isAutoResolutionEnabled = function(){
    var page = ytcenter.getPage();
    return (page === "watch" && ytcenter.settings.enableAutoVideoQuality) ||
        (page === "embed" && ytcenter.settings.embed_enableAutoVideoQuality) ||
        (page === "channel" && ytcenter.settings.channel_enableAutoVideoQuality)
};
ytcenter.player.isPreventAutoPlay = function(){
    var notFocused = document && document.hasFocus && typeof document.hasFocus === "function" && !document.hasFocus(),
        preventAutoPlay = false,
        autoPlay = false;

    if (ytcenter.page === "watch") {
        autoPlay = ytcenter.settings.preventAutoPlay;
    } else if (ytcenter.page === "embed") {
        autoPlay = ytcenter.settings.embed_preventAutoPlay;
    } else if (ytcenter.page === "channel") {
        autoPlay = ytcenter.settings.channel_preventAutoPlay;
    }

    if (ytcenter.page === "watch" && notFocused && ((ytcenter.playlist && ytcenter.settings.preventTabPlaylistAutoPlay) || (!ytcenter.playlist && ytcenter.settings.preventTabAutoPlay))) {
        preventAutoPlay = true;
    } else {
        if (ytcenter.playlist && ytcenter.page === "watch") {
            preventAutoPlay = ytcenter.settings.preventPlaylistAutoPlay;
        } else {
            preventAutoPlay = autoPlay;
        }
    }
    return preventAutoPlay;
};
ytcenter.player.isPreventAutoBuffering = function(){
    var notFocused = document && document.hasFocus && typeof document.hasFocus === "function" && !document.hasFocus(),
        preventAutoBuffering = false,
        autoBuffering = false;

    if (ytcenter.page === "watch") {
        autoBuffering = ytcenter.settings.preventAutoBuffer;
    } else if (ytcenter.page === "embed") {
        autoBuffering = ytcenter.settings.embed_preventAutoBuffer;
    } else if (ytcenter.page === "channel") {
        autoBuffering = ytcenter.settings.channel_preventAutoBuffer;
    }

    if (ytcenter.page === "watch" && notFocused && ((ytcenter.playlist && ytcenter.settings.preventTabPlaylistAutoBuffer) || (!ytcenter.playlist && ytcenter.settings.preventTabAutoBuffer))) {
        preventAutoBuffering = true;
    } else {
        if (ytcenter.playlist && ytcenter.page === "watch") {
            preventAutoBuffering = ytcenter.settings.preventPlaylistAutoBuffer;
        } else {
            preventAutoBuffering = autoBuffering;
        }
    }
    return preventAutoBuffering;
};
ytcenter.player.darkside = function(){
    var player = document.getElementById("player");
    var playlistTray = document.getElementById("playlist-tray");
    var theaterBackground = document.getElementById("theater-background");
    if (!theaterBackground && player) {
        theaterBackground = document.createElement("div");
        theaterBackground.setAttribute("id", "theater-background");
        player.insertBefore(theaterBackground, player.children[0]);
    }
    if (ytcenter.getPage() === "watch" && ytcenter.player.getCurrentPlayerSize().large) {
        if (ytcenter.settings.playerDarkSideBG) {
            if (theaterBackground && !ytcenter.settings.playerDarkSideBGRetro) {
                theaterBackground.style.backgroundColor = ytcenter.settings.playerDarkSideBGColor;
            }
            if (playlistTray) {
                playlistTray.style.top = "-" + ytcenter.player.getCurrentPlayerSize().playerHeight + "px";
            }
            return true;
        }
    }
    if (theaterBackground) {
        theaterBackground.style.backgroundColor = "";
    }
    if (playlistTray) {
        playlistTray.style.top = "";
    }
    return false;
};
ytcenter.player.network = {};
ytcenter.player.network.pause = function(){
    con.log("[Tab Event] Calling player.pauseVideo();");
    ytcenter.tabEvents.fireEvent("player", "pauseVideo");
};
ytcenter.player.setPlaybackQuality = function(preferredQuality){
    function recall(vq){
        if (vq === 1) {
            ytcenter.player.listeners.removeEventListener("onStateChange", recall);
            ytcenter.player.setPlaybackQuality(preferredQuality);
        }
    }
    if (!ytcenter.player.isAutoResolutionEnabled()) return;
    var api = ytcenter.player.getAPI(),
        config = ytcenter.player.getConfig();
    if (config && config.args) {
        config.args.vq = preferredQuality;
    }
    if (!api) {
        ytcenter.player.listeners.addEventListener("onStateChange", recall);
    } else {
        /*if (api.getPlaybackQuality() === preferredQuality && preferredQuality !== "small") api.setPlaybackQuality("small");
         else if (api.getPlaybackQuality() === preferredQuality && preferredQuality !== "medium") api.setPlaybackQuality("medium");*/
        ytcenter.player.setQuality(preferredQuality);
    }
};
ytcenter.player.cpn = ytcenter.utils.crypt();
ytcenter.player.getVideoDataRequest = function(){
    /* Making sure that the require configuration is available */
    if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG)
        ytcenter.player.config = uw.yt.config_.PLAYER_CONFIG;
    if (!ytcenter.player.config || !ytcenter.player.config.args)
        ytcenter.player.config = ytcenter.player.getRawPlayerConfig();
    var emvid = loc.pathname.match(/\/embed\/([0-9a-zA-Z_-]+)/);
    if (emvid && emvid.length > 1 && emvid[1]) emvid = emvid[1];
    /* Creating URL */
    var a = {
        html5: (ytcenter.player.config && ytcenter.player.config.html5 ? "1" : "0"),
        video_id: ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.video_id || emvid,
        cpn: ytcenter.player.cpn,
        eurl: loc.href,
        ps: null,
        el: "embedded",
        hl: (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.hl ? ytcenter.player.config.args.hl : null),
        sts: 15973,
        c: "web",
        cver: (ytcenter.player.config.html5 ? "html5" : "flash")
    }, b = [], k;
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.list) {
        a.list = ytcenter.player.config.args.list;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.cr) {
        a.cr = ytcenter.player.config.args.cr;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.access_token) {
        a.access_token = ytcenter.player.config.args.access_token;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.adformat) {
        a.adformat = ytcenter.player.config.args.adformat;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.iv_load_policy) {
        a.iv_load_policy = ytcenter.player.config.args.iv_load_policy;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.autoplay) {
        a.autoplay = ytcenter.player.config.args.autoplay;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.mdx) {
        a.mdx = ytcenter.player.config.args.mdx;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.utpsa) {
        a.utpsa = ytcenter.player.config.args.utpsa;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.is_fling) {
        a.is_fling = ytcenter.player.config.args.is_fling;
    }
    if (window.clientWidth) {
        a.width = window.clientWidth;
    }
    if (window.clientHeight) {
        a.width = window.clientHeight;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.ypc_preview) {
        a.ypc_preview = ytcenter.player.config.args.ypc_preview;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.splay) {
        a.splay = ytcenter.player.config.args.splay;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.content_v) {
        a.content_v = ytcenter.player.config.args.content_v;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.livemonitor) {
        a.livemonitor = ytcenter.player.config.args.livemonitor;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.authuser) {
        a.authuser = ytcenter.player.config.args.authuser;
    }
    if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.pageid) {
        a.pageid = ytcenter.player.config.args.pageid;
    }

    for (k in a) {
        if (a.hasOwnProperty(k)) {
            if (a[k] !== null) {
                b.push(encodeURIComponent(k) + "=" + encodeURIComponent(a[k]));
            }
        }
    }

    return ytcenter.utils.getLocationOrigin() + "/get_video_info?" + b.join("&");
};
ytcenter.player.isLiveStream = function(config){
    config = config || ytcenter.player.config;
    return (config && config.args && config.args.live_playback == 1);
};
ytcenter.player.isOnDemandStream = function(config){
    config = config || ytcenter.player.config;
    return (config && config.args && config.args.ypc_module && config.args.ypc_vid);
};
ytcenter.player.getRawPlayerConfig = function(){
    function loadMethod1() {
        try {
            var a = document.body.innerHTML;
            a = a.split("<script>var ytplayer = ytplayer || {};ytplayer.config = {");
            if (!a || !a[1]) return null;
            a = a[1];
            a = a.split("};");
            if (!a || !a[0]) return null;
            a = a[0];
            a = JSON.parse("{" + a + "}");
            return a;
        } catch (e) {
            con.error(e);
            return null;
        }
    }
    function loadMethod2() {
        var a;
        try {
            a = document.body.innerHTML;
            a = a.split("'PLAYER_CONFIG': ");
            if (!a || !a[1]) return null;
            a = a[1];
            a = a.split(");");
            if (!a || !a[0]) return null;
            a = a[0];
            a = JSON.parse(a);
            return a;
        } catch (e) {
            con.error(e, a);
            return null;
        }
    }
    function loadMethod3() {
        var a;
        try {
            a = document.body.innerHTML;
            a = a.split("var videoPlayer = new yt.player.Application('p', ");
            if (!a || !a[1]) return null;
            a = a[1];
            a = a.split(");");
            if (!a || !a[0]) return null;
            a = a[0];
            a = JSON.parse(a);
            return a;
        } catch (e) {
            con.error(e, a);
            return null;
        }
    }

    function loadMethod4() {
        var a;
        try {
            a = document.body.innerHTML;
            a = a.split("flashvars=\"");
            if (!a || !a[1]) return null;
            a = a[1];
            a = a.split("\" ");
            if (!a || !a[0]) return null;
            a = a[0].replace(/&amp;/g, "&");
            a = {args: ytcenter.utils.urlComponentToObject(a)};
            return a;
        } catch (e) {
            con.error(e, a);
            return null;
        }
    }

    var _a = null,
        page = ytcenter.getPage();
    if (!_a && ytcenter.feather && page === "watch")
        _a = loadMethod3();
    if (!_a && ytcenter.feather && page === "watch")
        _a = loadMethod4();
    if (!_a && uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG)
        _a = uw.yt.config_.PLAYER_CONFIG;
    if (!_a && document && document.body && document.body.innerHTML && document.body.innerHTML.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1)
        _a = loadMethod1();
    if (!_a && document && document.body && document.body.innerHTML && document.body.innerHTML.indexOf("'PLAYER_CONFIG': ") !== -1)
        _a = loadMethod2();
    if (_a) return _a;

    return {};
};
ytcenter.player.parseRVS = function(rvs){
    var a = [], b = rvs.split(","), c, d, e, i, j;
    for (i = 0; i < b.length; i++) {
        c = {};
        d = b[i].split("&");
        for (j = 0; j < d.length; j++) {
            e = d[j].split("=");
            c[unescape(e[0])] = unescape(e[1]);
        }
        a.push(c);
    }
    return a;
};
ytcenter.player.stringifyRVS = function(rvs){
    var sb = "", i, key, j;
    for (i = 0; i < rvs.length; i++) {
        if (i > 0) sb += ",";
        j = 0;
        for (key in rvs[i]) {
            if (rvs[i].hasOwnProperty(key)) {
                if (j > 0) sb += "&";
                sb += escape(key) + "=" + escape(rvs[i][key]);
                j++;
            }
        }
    }
    return sb;
};
ytcenter.player.shortcuts = function(){
    con.log("Adding player shortcuts to document");
    ytcenter.utils.addEventListener(document, "keydown", function(e){
        e = e || window.event;
        if (ytcenter.settings.enableYouTubeShortcuts && ytcenter.settings.enableShortcuts && ytcenter.getPage() === "watch" && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            if (document.activeElement.tagName.toLowerCase() === "input" || document.activeElement.tagName.toLowerCase() === "textarea" || document.activeElement.tagName.toLowerCase() === "object" || document.activeElement.tagName.toLowerCase() === "embed" || document.activeElement.tagName.toLowerCase() === "button" || document.activeElement.tagName.toLowerCase() === "iframe") return;
            if (document.activeElement.id === "movie_player" && ytcenter.utils.hasClass(document.activeElement, "html5-video-player")) return;
            if (ytcenter.utils.isParent(document.getElementById("movie_player"), document.activeElement)) return;
            if (document.activeElement.isContentEditable === true) return;
            var player = ytcenter.player.getAPI();
            switch (e.keyCode) {
                case 32: // Space
                    if (player.getPlayerState() == 1) {
                        player.pauseVideo();
                    } else {
                        player.playVideo();
                    }
                    break;
                case 37: // Left Arrow
                    player.seekTo(player.getCurrentTime()-5, true);
                    break;
                case 39: // Right Arrow
                    player.seekTo(player.getCurrentTime()+5, true);
                    break;
                case 35: // End
                    player.seekTo(player.getDuration(), true);
                    break;
                case 36: // Home
                    player.seekTo(0, true);
                    break;
                case 48: // 0
                    player.seekTo(0, true);
                    break;
                case 49: // 1
                    player.seekTo(0.1*player.getDuration(), true);
                    break;
                case 50: // 2
                    player.seekTo(0.2*player.getDuration(), true);
                    break;
                case 51: // 3
                    player.seekTo(0.3*player.getDuration(), true);
                    break;
                case 52: // 4
                    player.seekTo(0.4*player.getDuration(), true);
                    break;
                case 53: // 5
                    player.seekTo(0.5*player.getDuration(), true);
                    break;
                case 54: // 6
                    player.seekTo(0.6*player.getDuration(), true);
                    break;
                case 55: // 7
                    player.seekTo(0.7*player.getDuration(), true);
                    break;
                case 56: // 8
                    player.seekTo(0.8*player.getDuration(), true);
                    break;
                case 57: // 9
                    player.seekTo(0.9*player.getDuration(), true);
                    break;
                default:
                    return;
            }
            e.preventDefault();
        }
    }, false);
};
ytcenter.player.setConfig = function(config){
    ytcenter.player.config = config;
};
ytcenter.player.updateConfig = function(page, config){
    if (!config || !config.args) return;
    var api = ytcenter.player.getAPI();
    con.log("[Config Update] Updating as page " + page);

    if (page === "watch") {
        ytcenter.effects.playerGlow.update();
        uw.setTimeout(ytcenter.effects.playerGlow.update, 1000); // Make sure that the player glow got the state update
        ytcenter.player.updateResize();
        if (ytcenter.player.isAutoResolutionEnabled()) {
            ytcenter.player.setQuality(ytcenter.player.getQuality(ytcenter.settings.autoVideoQuality, ytcenter.video.streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false)));
        }

        if (api.getVolume && api.getVolume() !== ytcenter.settings.volume && ytcenter.settings.enableVolume) {
            if (ytcenter.settings.volume < 0) {
                ytcenter.settings.volume = 0;
            } else if (ytcenter.settings.volume > 100) {
                ytcenter.settings.volume = 100;
            }
            api.setVolume(ytcenter.settings.volume);
        }
        if (ytcenter.settings.mute && api.isMuted && !api.isMuted()) {
            api.mute();
        } else if (!ytcenter.settings.mute && api.isMuted && api.isMuted()) {
            api.unMute();
        }

        ytcenter.playlist = false;
        try {
            if (document.getElementById("watch7-playlist-data") || loc.search.indexOf("list=") !== -1) {
                ytcenter.playlist = true;
            }
        } catch (e) {
            con.error(e);
        }

        // Prevent Auto Play/Buffering
        if (document && document.hasFocus && typeof document.hasFocus === "function" && !document.hasFocus() && ((!ytcenter.playlist && (ytcenter.settings.preventTabAutoBuffer || ytcenter.settings.preventTabAutoPlay)) || (ytcenter.playlist && (ytcenter.settings.preventTabPlaylistAutoBuffer || ytcenter.settings.preventTabPlaylistAutoPlay)))) {
            if (ytcenter.playlist) {
                if (ytcenter.settings.preventTabPlaylistAutoBuffer) {
                    if (ytcenter.html5) {
                        ytcenter.player.setPlaybackState(0);
                    }
                } else if (ytcenter.settings.preventTabPlaylistAutoPlay) {
                    ytcenter.player.setPlaybackState(2);
                }
            } else {
                if (ytcenter.settings.preventTabAutoBuffer) {
                    if (ytcenter.html5) {
                        ytcenter.player.setPlaybackState(0);
                    }
                } else if (ytcenter.settings.preventTabAutoPlay) {
                    ytcenter.player.setPlaybackState(2);
                }
            }
        } else {
            if (ytcenter.playlist) {
                if (ytcenter.settings.preventPlaylistAutoBuffer) {
                    if (ytcenter.html5) {
                        ytcenter.player.setPlaybackState(0);
                    }
                } else if (ytcenter.settings.preventPlaylistAutoPlay) {
                    ytcenter.player.setPlaybackState(2);
                }
            } else {
                if (ytcenter.settings.preventAutoBuffer) {
                    if (ytcenter.html5) {
                        ytcenter.player.setPlaybackState(0);
                    }
                } else if (ytcenter.settings.preventAutoPlay) {
                    ytcenter.player.setPlaybackState(2);
                }
            }
        }
    } else if (page === "channel") {
        if (ytcenter.settings.channel_enableVolume) {
            if (ytcenter.settings.channel_volume < 0) {
                ytcenter.settings.channel_volume = 0;
            } else if (ytcenter.settings.channel_volume > 100) {
                ytcenter.settings.channel_volume = 100;
            }
            if (api.setVolume) {
                api.setVolume(ytcenter.settings.channel_volume);
            }
        }
        if (ytcenter.settings.channel_mute && api.mute) {
            api.mute();
        } else if (!ytcenter.settings.channel_mute && api.unMute) {
            api.unMute();
        }

        if (ytcenter.settings.channel_preventAutoBuffer) {
            ytcenter.player.setPlaybackState(0);
        } else if (ytcenter.settings.channel_preventAutoPlay) {
            ytcenter.player.setPlaybackState(2);
        } else {
            ytcenter.player.setPlaybackState(1);
        }

        if (api.getPlaybackQuality() !== config.args.vq && ytcenter.player.isAutoResolutionEnabled()) {
            if (config.args.vq === "auto") {
                config.args.vq = ytcenter.settings.channel_autoVideoQuality;
            }
            con.log("[Player Update] Quality => " + config.args.vq);
            ytcenter.player.setQuality(config.args.vq);
        }
    } else if (page === "embed") {
        if (ytcenter.settings.embed_enableVolume) {
            if (ytcenter.settings.embed_volume < 0) {
                ytcenter.settings.embed_volume = 0;
            } else if (ytcenter.settings.embed_volume > 100) {
                ytcenter.settings.embed_volume = 100;
            }
            if (api.setVolume) {
                api.setVolume(ytcenter.settings.embed_volume);
            }
        }
        try {
            if (ytcenter.settings.embed_mute) {
                api.mute();
            } else if (!ytcenter.settings.embed_mute) {
                api.unMute();
            }
        } catch (e) {
            con.error(e);
        }
        if (!ytcenter.settings.embed_defaultAutoplay) {
            if (ytcenter.settings.embed_preventAutoBuffer) {
                var played = false;
                ytcenter.player.listeners.addEventListener("onStateChange", function(s){
                    if (s !== 1 || played) return;
                    played = true;
                    if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality && ytcenter.player.isAutoResolutionEnabled()) {
                        if (config.args.vq === "auto") {
                            config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                        }
                        con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                        ytcenter.player.setPlaybackQuality(config.args.vq);
                    }
                });
            } else if (ytcenter.settings.embed_preventAutoPlay) {
                api.playVideo();
                api.pauseVideo();
                uw.setTimeout(function(){
                    if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality && ytcenter.player.isAutoResolutionEnabled()) {
                        if (config.args.vq === "auto") {
                            config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                        }
                        con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                        ytcenter.player.setPlaybackQuality(config.args.vq);
                    }
                }, 600);
            } else {
                ytcenter.player.listeners.addEventListener("onStateChange", function(s){
                    if (s !== 1 || played) return;
                    played = true;
                    if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality && ytcenter.player.isAutoResolutionEnabled()) {
                        if (config.args.vq === "auto") {
                            config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                        }
                        con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                        ytcenter.player.setPlaybackQuality(config.args.vq);
                    }
                });
                api.playVideo();
            }
        } else if (loc.search.indexOf("ytcenter-autoplay=1") !== -1) {
            ytcenter.player.listeners.addEventListener("onStateChange", function(s){
                if (s !== 1 || played) return;
                played = true;
                if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality && ytcenter.player.isAutoResolutionEnabled()) {
                    if (config.args.vq === "auto") {
                        config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                    }
                    con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                    ytcenter.player.setPlaybackQuality(config.args.vq);
                }
            });
            api.playVideo();
        }

        if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality && ytcenter.player.isAutoResolutionEnabled()) {
            if (config.args.vq === "auto") {
                config.args.vq = ytcenter.settings.embed_autoVideoQuality;
            }
            con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
            ytcenter.player.setPlaybackQuality(config.args.vq);
        }
    }
};
ytcenter.player.calculateRatio = function(dash, predefinedAspect){
    var i, a;

    var priority = [];

    predefinedAspect = predefinedAspect || ytcenter.settings['playerSizeAspect'];
    // Checking if the ratio is predefined
    if (predefinedAspect && predefinedAspect !== "default") {
        a = predefinedAspect;
        if (a.indexOf(":") !== -1) {
            a = a.split(":");
            a = parseInt(a[0])/parseInt(a[1]);
            if (!isNaN(a)) priority.push(a);
        }
    }

    // Calculating the aspect ratio...
    if (dash) {
        for (i = 0; i < ytcenter.video.streams.length; i++) {
            if (ytcenter.video.streams[i].size) {
                a = ytcenter.video.streams[i].size.split("x");
                break;
            }
        }
    } else {
        for (i = 0; i < ytcenter.video.streams.length; i++) {
            if (ytcenter.video.streams[i].dimension) {
                a = ytcenter.video.streams[i].dimension.split("x");
                break;
            }
        }
    }
    if (a) {
        a = parseInt(a[0])/parseInt(a[1]);
        if (isNaN(a)) priority.push(16/9);
        priority.push(a);
    } else {
        priority.push(16/9);
    }

    return priority;
};
ytcenter.player.experiments = (function(){
    function add(exp, config) {
        var cfg = getConfig(config);
        if (!has(exp, config)) {
            cfg.args.fexp += "," + exp;
        }
    }
    function remove(exp, config) {
        var cfg = getConfig(config);
        if (cfg && cfg.args && cfg.args.fexp) {
            var e = cfg.args.fexp.split(","), i, a = [];
            for (i = 0; i < e.length; i++) {
                if (exp !== e[i]) {
                    a.push(e[i]);
                }
            }
            cfg.args.fexp = a.join(",");
        }
    }
    function has(exp, config) {
        var cfg = getConfig(config);
        if (cfg && cfg.args && typeof cfg.fexp === "string") {
            var e = cfg.args.fexp.split(","), i, a = [];
            for (i = 0; i < e.length; i++) {
                if (exp === e[i]) {
                    return true;
                }
            }
        }
        return false;
    }
    function clear(config) {
        var cfg = getConfig(config);
        if (cfg && cfg.args) {
            cfg.args.fexp = "";
        }
    }
    function getConfig(config) {
        return config || ytcenter.player.config.args;
    }

    return { add: add, remove: remove, has: has, clear: clear };
})();
ytcenter.player.modifyConfig = function(page, config){
    if (page !== "watch" && page !== "embed" && page !== "channel") return config;
    if (loc.href.indexOf(".youtube.com/embed/") !== -1 && !ytcenter.settings.embed_enabled) return config;
    if (!config) config = {};
    if (!config.args) config.args = {};
    con.log("[Player modifyConfig] => " + page);

    if (loc.hash.indexOf("t=") !== -1) {
        var hashObject = ytcenter.utils.urlComponentToObject(loc.hash.substring(1)),
            value = null,
            matches = null,
            i;
        if (typeof hashObject.t !== "undefined") {
            if (matches = hashObject.t.match(/^([0-9]+m)|([0-9]+s)$/g)) {
                value = 0;
                for (i = 0; i < matches.length; i++) {
                    if (matches[i].indexOf("s") === matches[i].length - 1) {
                        value += parseInt(matches[i], 10);
                    } else if (matches[i].indexOf("m") === matches[i].length - 1) {
                        value += parseInt(matches[i], 10) * 60;
                    } else if (matches[i].indexOf("h") === matches[i].length - 1) {
                        value += parseInt(matches[i], 10) * 60 * 60;
                    }
                }
            } else {
                value = parseInt(hashObject.t, 10);
            }
        }
        if (value !== null) {
            config.args.start = value;
        }
    }

    if (config && config.args && ((config.args.url_encoded_fmt_stream_map && config.args.fmt_list) || config.args.adaptive_fmts)) {
        var streams = ytcenter.parseStreams(config.args);
        ytcenter.video.streams = streams;
        try {
            if (ytcenter.video && ytcenter.video.streams && ytcenter.video.streams[0] && ytcenter.video.streams[0].s) {
                ytcenter.utils.updateSignatureDecipher(); // Only Updating the signature decoder when it's needed!
            }
        } catch (e) {
            con.error("[updateSignatureDecipher] Error,", e);
        }
        ytcenter.unsafe.video = {};
        ytcenter.unsafe.video.streams = ytcenter.video.streams;

        ytcenter.video.id = config.args.video_id;
        ytcenter.video.title = config.args.title;
    }
    config.args.ytcenter = 1;
    config.args.enablejsapi = 1;
    config.args.jsapicallback = "ytcenter.player.onReady";

    if (page === "watch") {
        if (config && config.args && config.args.keywords) {
            ytcenter.descriptionTags.addSection("DESCRIPTIONTAG_KEYWORDS", config.args.keywords.split(","));
        }
        ytcenter.descriptionTags.addSection("DESCRIPTIONTAG_FPS", ytcenter.player.getFPSArray(ytcenter.video.streams));

        if (ytcenter.settings.bufferEnabled) {
            config.args.tsp_buffer = ytcenter.settings.bufferSize;
        }
        if (ytcenter.settings.enable_custom_fexp) {
            config.args.fexp = ytcenter.settings.custom_fexp;
        }

        if (!config.args.video_id) {
            config.args.video_id = ytcenter.utils.query("v");
        }

        if (ytcenter.settings.enableYouTubeShortcuts) {
            config.args.disablekb = 0;
        } else {
            config.args.disablekb = 1;
        }

        if ((ytcenter.settings.forcePlayerType === "flash" || ytcenter.settings.forcePlayerType === "aggressive_flash") && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
            config.html5 = false;
            ytcenter.player.setPlayerType("flash");
        } else if (ytcenter.settings.forcePlayerType === "html5" && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
            config.html5 = true;
            delete config.args.ad3_module;
            config.args.allow_html5_ads = 1;
            config.args.html5_sdk_version = "3.1";
            ytcenter.player.setPlayerType("html5");
        }
    } else if (ytcenter.getPage() === "embed") {
        if (ytcenter.settings.embedBufferEnabled) {
            config.args.tsp_buffer = ytcenter.settings.embedBufferSize;
        }
        if ((ytcenter.settings.embed_forcePlayerType === "flash" || ytcenter.settings.embed_forcePlayerType === "aggressive_flash") && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
            config.html5 = false;
            config.args.html5_sdk_version = "0";
        } else if (ytcenter.settings.embed_forcePlayerType === "html5" && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
            config.html5 = true;
            delete config.args.ad3_module;
            config.args.allow_html5_ads = 1;
            config.args.html5_sdk_version = "3.1";
        }
    } else if (ytcenter.getPage() === "channel") {
        if (ytcenter.settings.channelBufferEnabled) {
            config.args.tsp_buffer = ytcenter.settings.channelBufferSize;
        }
        if ((ytcenter.settings.channel_forcePlayerType === "flash" || ytcenter.settings.channel_forcePlayerType === "aggressive_flash") && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
            config.html5 = false;
            config.args.html5_sdk_version = "0";
        } else if (ytcenter.settings.channel_forcePlayerType === "html5" && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
            config.html5 = true;
            delete config.args.ad3_module;
            config.args.allow_html5_ads = 1;
            config.args.html5_sdk_version = "3.1";
        }
    }

    if (config.html5) ytcenter.html5 = true;
    else ytcenter.html5 = false;
    con.log("[Player Type] " + (ytcenter.html5 ? "HTML5" : "Flash"));

    if (ytcenter.settings.removeRelatedVideosEndscreen) {
        delete config.args.endscreen_module;
        delete config.args.rvs;
    }

    if (ytcenter.settings.enableResize)
        config.args.player_wide = ytcenter.settings.player_wide ? "1" : "0";

    if (page === "watch") {
        var ___callback = function(response){
            try {
                var txt = response.responseText;
                if (txt) {
                    txt = txt.split("<published>");
                    if (txt && txt.length > 1) {
                        txt = txt[1].split("</published>");
                        if (txt && txt.length > 0) {
                            txt = txt[0];
                            ytcenter.video.published = new Date(txt);
                        }
                    }
                }
            } catch (e) {
                con.error(e);
            }
            //ytcenter.events.performEvent("ui-refresh");
        };
        if (config.args.video_id) {
            ytcenter.utils.xhr({
                method: "GET",
                url: "https://gdata.youtube.com/feeds/api/videos/" + config.args.video_id + "?v=2",
                headers: {
                    "Content-Type": "text/plain"
                },
                onerror: ___callback,
                onload: ___callback
            });
        }
        if (ytcenter.settings.dashPlayback && config.args.adaptive_fmts) {
            config.args.dash = "1";
        } else {
            config.args.dash = "0";
            config.args.dashmpd = "";
        }
        if (ytcenter.settings.enableAutoVideoQuality) {
            // This does not work with the HTML5 player anymore.
            config.args.vq = ytcenter.player.getQuality(ytcenter.settings.autoVideoQuality, streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false));
            config.args.suggestedQuality = config.args.vq;
            var vqDim = ytcenter.player.getQualityDimension(config.args.vq);
            if (vqDim) config.args.video_container_override = vqDim;
        }
        if (config.args.dash === "1" && config.args.adaptive_fmts) {
            ytcenter.player.setRatio(ytcenter.player.calculateRatio(true));
        } else {
            ytcenter.player.setRatio(ytcenter.player.calculateRatio(false));
        }
        if (ytcenter.settings.removeAdvertisements) {
            config = ytcenter.site.removeAdvertisement(config);
        }
        if (ytcenter.settings.removeBrandingWatermark) {
            delete config.args.watermark;
            delete config.args.interstitial;
        }
        if (ytcenter.settings.aspectValue !== "none" && ytcenter.settings.aspectValue !== "default" && ytcenter.settings.aspectValue.indexOf("yt:") === 0) {
            con.log("Chaning aspect to " + ytcenter.settings.aspectValue);
            config.args.keywords = ytcenter.settings.aspectValue;
        } else if (ytcenter.settings.aspectValue !== "default") {
            con.log("Chaning aspect to none");
            config.args.keywords = "";
        } else {
            con.log("Keeping the aspect");
        }
        if ((ytcenter.settings.forcePlayerType === "flash" || ytcenter.settings.forcePlayerType === "aggressive_flash")) {
            config.html5 = false;
        } else if (ytcenter.settings.forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
            config.html5 = true;
            delete config.args.ad3_module;
        }
        if (ytcenter.settings.enableAnnotations) {
            config.args.iv_load_policy = 1;
        } else {
            config.args.iv_load_policy = 3;
        }
        if (typeof ytcenter.settings.autohide != "undefined" && ytcenter.settings.autohide !== "-1") {
            config.args.autohide = ytcenter.settings.autohide;
        }

        if (ytcenter.settings.bgcolor === "none") {
            config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "#000000");
        } else if (ytcenter.settings.bgcolor !== "default" && ytcenter.settings.bgcolor.indexOf("#") === 0) {
            config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.bgcolor);
        }
        ytcenter.playlist = false;
        try {
            if (document.getElementById("watch7-playlist-data") || loc.search.indexOf("list=") !== -1) {
                ytcenter.playlist = true;
            }
        } catch (e) {
            con.error(e);
        }
        con.log("[Playlist] " + (ytcenter.playlist ? "Enabled" : "Disabled"));
        if (document && document.hasFocus && typeof document.hasFocus === "function" && !document.hasFocus() && ((!ytcenter.playlist && (ytcenter.settings.preventTabAutoBuffer || ytcenter.settings.preventTabAutoPlay)) || (ytcenter.playlist && (ytcenter.settings.preventTabPlaylistAutoBuffer || ytcenter.settings.preventTabPlaylistAutoPlay)))) {
            config.args.autoplay = "0";
        } else {
            if (ytcenter.playlist) {
                if (ytcenter.settings.preventPlaylistAutoBuffer || ytcenter.settings.preventPlaylistAutoPlay) {
                    config.args.autoplay = "0";
                } else {
                    config.args.autoplay = "1";
                }
            } else {
                if (ytcenter.settings.preventAutoBuffer || ytcenter.settings.preventAutoPlay) {
                    config.args.autoplay = "0";
                } else {
                    config.args.autoplay = "1";
                }
            }
        }
        config.args.theme = ytcenter.settings.playerTheme;
        config.args.color = ytcenter.settings.playerColor;

        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.autohide);

        if (config.args.rvs) {
            var rvs = ytcenter.player.parseRVS(config.args.rvs), i;
            if (ytcenter.settings.enableEndscreenAutoplay && ytcenter.settings.removeRelatedVideosEndscreen) {
                if (rvs.length > 0) {
                    rvs[0].endscreen_autoplay = 1;
                    for (i = 1; i < rvs.length; i++) {
                        if (typeof rvs[i].endscreen_autoplay !== "undefined") {
                            delete rvs[i].endscreen_autoplay;
                        }
                    }
                }
                config.args.rvs = ytcenter.player.stringifyRVS(rvs);
            } else {
                if (rvs.length > 0) {
                    for (i = 0; i < rvs.length; i++) {
                        if (typeof rvs[i].endscreen_autoplay !== "undefined") {
                            delete rvs[i].endscreen_autoplay;
                        }
                    }
                }
                config.args.rvs = ytcenter.player.stringifyRVS(rvs);
            }
        }
    } else if (page === "embed") {
        if (ytcenter.settings.embed_forcePlayerType === "flash" || ytcenter.settings.embed_forcePlayerType === "aggressive_flash") {

            config.html5 = false;
        } else if (ytcenter.settings.embed_forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
            config.html5 = true;
            delete config.args.ad3_module;
        }
        if (ytcenter.settings.removeAdvertisements) {
            config = ytcenter.site.removeAdvertisement(config);
        }

        if (ytcenter.settings.embed_dashPlayback) {
            config.args.dash = "1";
        } else {
            config.args.dash = "0";
            config.args.dashmpd = "";
        }

        if (ytcenter.settings.embed_enableAutoVideoQuality) {
            var vq = ytcenter.player.getQuality(ytcenter.settings.embed_autoVideoQuality, streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false));
            config.args.vq = vq;
            config.args.suggestedQuality = vq;
            var vqDim = ytcenter.player.getQualityDimension(vq);
            if (vqDim) config.args.video_container_override = vqDim;
        }
        if (!ytcenter.settings.embed_enableAnnotations) {
            config.args.iv_load_policy = 3;
        } else {
            config.args.iv_load_policy = 1;
        }
        if (typeof ytcenter.settings.embed_autohide !== "undefined" && ytcenter.settings.embed_autohide !== "-1") {
            config.args.autohide = ytcenter.settings.embed_autohide;
        }
        if (!ytcenter.settings.embed_defaultAutoplay) config.args.autoplay = "0";

        config.args.theme = ytcenter.settings.embed_playerTheme;
        config.args.color = ytcenter.settings.embed_playerColor;

        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);

        if (ytcenter.settings.embed_bgcolor === "none") {
            config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "");
        } else if (ytcenter.settings.embed_bgcolor !== "default" && ytcenter.settings.embed_bgcolor.indexOf("#") === 0) {
            config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.embed_bgcolor);
        }
    } else if (page === "channel") {
        if (ytcenter.settings.channel_forcePlayerType === "flash" || ytcenter.settings.channel_forcePlayerType === "aggressive_flash") {
            config.html5 = false;
        } else if (ytcenter.settings.channel_forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
            config.html5 = true;
            delete config.args.ad3_module;
        }

        if (ytcenter.settings.channel_dashPlayback) {
            config.args.dash = "1";
        } else {
            config.args.dash = "0";
            config.args.dashmpd = "";
        }

        if (ytcenter.settings.channel_enableAutoVideoQuality) {
            var vq = ytcenter.player.getQuality(ytcenter.settings.channel_autoVideoQuality, streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false));
            config.args.vq = vq;
            config.args.suggestedQuality = vq;
            var vqDim = ytcenter.player.getQualityDimension(vq);
            if (vqDim) config.args.video_container_override = vqDim;
        }

        if (ytcenter.settings.removeAdvertisements) {
            config = ytcenter.site.removeAdvertisement(config);
        }
        if (!ytcenter.settings.channel_enableAnnotations) {
            config.args.iv_load_policy = 3;
        } else {
            config.args.iv_load_policy = 1;
        }
        if (typeof ytcenter.settings.channel_autohide != "undefined" && ytcenter.settings.channel_autohide !== "-1") {
            config.args.autohide = ytcenter.settings.channel_autohide;
        }

        /*if (ytcenter.settings.embed_defaultAutoplay) {
         if (loc.search.indexOf("ytcenter-autoplay=1") !== -1) {
         config.args.autoplay = "1";
         } else {
         config.args.autoplay = "0";
         }
         } else {
         config.args.autoplay = (ytcenter.settings.embed_preventAutoBuffer ? "0" : "1");
         }*/
        config.args.autoplay = "0";

        config.args.theme = ytcenter.settings.channel_playerTheme;
        config.args.color = ytcenter.settings.channel_playerColor;

        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.channel_autohide);

        config.args.enablejsapi = "1";

        if (ytcenter.settings.channel_bgcolor === "none") {
            config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "#000000");
        } else if (ytcenter.settings.channel_bgcolor !== "default" && ytcenter.settings.channel_bgcolor.indexOf("#") === 0) {
            config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.channel_bgcolor);
        }
    }

    return config;
};
ytcenter.player.getAPI = function(){
    if (loc.pathname.indexOf("/embed/") === 0 && uw.yt && uw.yt.player && uw.yt.player.getPlayerByElement) {
        return uw.yt.player.getPlayerByElement(document.getElementById("player"));
    }

    if (ytcenter.player.__getAPI && ytcenter.player.__getAPI.addEventListener) {
        return ytcenter.player.__getAPI; // Note: Never use yt.player.embed function to fetch the API. Just catch the API through onYouTubePlayerReady.
    } else {
        var player = document.getElementById("movie_player");
        var api = ytcenter.player.__getAPI || { };

        if (player && player.getApiInterface) {
            var apiInterface = player.getApiInterface();
            for (var i = 0, len = apiInterface.length; i < len; i++) {
                api[apiInterface[i]] = ytcenter.utils.funcBind(player, player[apiInterface[i]]);
            }
        }
        return api;
    }
};

ytcenter.player.setPlayerWide = function(center){
    ytcenter.settings.player_wide = (center ? true : false);
    ytcenter.utils.setCookie("wide", (center ? "1" : "0"), null, "/", 3600*60*24*30);
    ytcenter.saveSettings();
};
ytcenter.player.toggleLights = function(){
    if (ytcenter.player.isLightOff) {
        ytcenter.player.turnLightOn();
    } else {
        ytcenter.player.turnLightOff();
    }
};
ytcenter.player.turnLightOn = function(){};
ytcenter.player.isLightOff = false;
ytcenter.player.turnLightOff = (function(){
    var lightElement;
    return function(){
        if (!lightElement) {
            lightElement = document.createElement("div");
            lightElement.className = "ytcenter-lights-off-overlay hid";
            lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
            lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
            lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";
            ytcenter.utils.addEventListener(lightElement, "click", function(){
                if (!ytcenter.settings["lightbulbClickThrough"]) ytcenter.player.turnLightOn();
            }, false);
            ytcenter.player.turnLightOn = function(){
                ytcenter.utils.addClass(lightElement, "hid");
                ytcenter.utils.removeClass(document.body, "ytcenter-lights-off");
                ytcenter.player.isLightOff = false;

                ytcenter.effects.playerGlow.update();
            };
            document.body.appendChild(lightElement);
        }
        // Updating background color and opacity.
        lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
        lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
        lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";

        ytcenter.utils.addClass(document.body, "ytcenter-lights-off");
        ytcenter.utils.removeClass(lightElement, "hid");
        ytcenter.player.isLightOff = true;

        ytcenter.effects.playerGlow.update();
    };
})();
ytcenter.player.checkHTML5Support = function(){
    var v = document.createElement("video");
    if (v && !v.canPlayType) {
        return false;
    }

    var mp4 = v.canPlayType('video/mp4; codecs="avc1.42001E, mp4a.40.2"');
    var webm = v.canPlayType('video/webm; codecs="vp8.0, vorbis"');

    var found = false;
    for (var i = 0; i < ytcenter.video.streams.length; i++) {
        if (mp4 && ytcenter.video.streams[i].type.indexOf("video/mp4;") === 0) {
            found = true;
            break;
        } else if (webm && ytcenter.video.streams[i].type.indexOf("video/webm;") === 0) {
            found = true;
            break;
        }
    }
    return found;
};
ytcenter.player.setYTConfig = function(config){
    if (uw.yt && uw.yt.setConfig) uw.yt.setConfig(config);
};
ytcenter.player.getYTConfig = function(config){
    uw.yt.getConfig(config);
};
ytcenter.player.getConfig = function(){
    return ytcenter.player.config;
};
ytcenter.player.getPlayerId = (function(){
    function verify() {
        var n = -1;
        ytcenter.utils.each(uw, function(key, value){
            if (key.indexOf("ytPlayer") !== 0) return; //  || key.indexOf(("player" + i), key.length - ("player" + i).length) !== -1
            var __n = key.substr(key.lastIndexOf("player") + "player".length);
            if (!/^\d+$/.test(__n)) return;
            var _n = parseInt(__n);
            if (_n > n)
                n = _n;
        });
        if (n > -1) verified = n;
    }
    var verified = 1;
    return function(){
        verify();
        return "player" + verified;
    };
})();
ytcenter.player.getReference = (function(){
    return function(playerid){
        ytcenter.player.reference = ytcenter.player.reference || {};
        if (playerid) {
            ytcenter.player.reference.playerId = playerid;
        }
        //ytcenter.player.reference.api = ytcenter.player.getAPI();
        if (ytcenter.page === "embed") {
            ytcenter.referenceMethod = "embed";
            if (document.getElementById("video-player")) {
                ytcenter.player.reference.target = document.getElementById("video-player");
            } else if (!ytcenter.html5 && document.getElementsByTagName("embed").length > 0) {
                ytcenter.player.reference.target = document.getElementsByTagName("embed")[0];
            }

            ytcenter.player.reference.config = ytcenter.player.getConfig();
        } else if (ytcenter.page === "channel") {
            ytcenter.referenceMethod = "channel";
            if (document.getElementById("movie_player")) {
                ytcenter.player.reference.target = document.getElementById("movie_player");
            } else if (!ytcenter.html5 && document.getElementsByTagName("embed").length > 0) {
                ytcenter.player.reference.target = document.getElementsByTagName("embed")[0];
            }
            ytcenter.player.reference.config = ytcenter.player.getConfig();
        } else {
            if (uw && uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_REFERENCE) {
                ytcenter.referenceMethod = "PLAYER REFERENCE";
                ytcenter.player.reference.api = uw.yt.config_.PLAYER_REFERENCE;
                ytcenter.player.reference.target = document.getElementById("movie_player") || document.getElementById("embed")[0];
                ytcenter.player.reference.onReadyCalled = true;
            } else if (document.getElementById("movie_player") || document.getElementsByTagName("embed").length > 0) {
                ytcenter.referenceMethod = "binding";
                ytcenter.player.reference.target = document.getElementById("movie_player") || document.getElementById("embed")[0];
                ytcenter.player.reference.onReadyCalled = true;
            }

            ytcenter.player.reference.html5 = ytcenter.html5;
        }
        return ytcenter.player.reference;
    };
})();
ytcenter.player.listeners = (function(){
    // Get the YouTube listener for the passed event.
    function getYouTubeListener(event) {
        var ytEvent = "ytPlayer" + event + "player" + getPlayerId();
        return ytListeners[ytEvent];
    }

    // The latest player id registered in the global window.
    function getNewestPlayerId() {
        var id = 1;
        var uid = null;
        var i = null;

        ytcenter.utils.each(uw, function(key, value){
            if (key.indexOf("ytPlayer") !== -1) {
                var match = key.match(/player([0-9]+)$/);
                var uidMatch = key.match(/player_uid_([0-9]+)_([0-9]+)$/);
                if (uidMatch) {
                    uid = parseInt(uidMatch[1], 10);
                    i = parseInt(uidMatch[2], 10);
                    if (i > id) {
                        id = i;
                    }
                } else if (match) {
                    i = parseInt(match[1], 10);
                    if (i > id) {
                        id = i;
                    }
                }
            }
        });
        return [uid, id];
    }

    function ytListenerContainerSetter(event, func) {
        var ytEvent = "ytPlayer" + event + "player" + getPlayerId();
        ytListeners[ytEvent] = func;
    }
    function ytListenerContainerGetter(event, func) {
        return ytcenter.utils.funcBind(null, callListener, event, 1);
    }

    /* Origin argument
     * If origin is equal to 0 then the origin is directly from the player (only @name@'s listeners get executed if override is false).
     * If origin is equal to 1 then the origin is from the global listeners (both YouTube's and @name@'s listeners get executed).
     */
    function callListener(event, origin) {
        function generateThisObject() {
            return {
                getOriginalListener: ytcenter.utils.funcBind(null, getYouTubeListener, event)
            };
        }

        var ytEvent = "ytPlayer" + event + "player" + getPlayerId();
        var args = Array.prototype.slice.call(arguments, 2);
        var returnVal = null;

        ytcenter.player._update_onYouTubeReady = true; // The listener got called therefore the player is here.
        if (enabled && origin === 0 && (!events.hasOwnProperty(event) || (events.hasOwnProperty(event) && !events[event].override))) {
            /* Override is false and the origin is from the player; call the @name@ listeners */
            if (events.hasOwnProperty(event)) {
                for (var i = 0, len = events[event].listeners.length; i < len; i++) {
                    returnVal = events[event].listeners[i].apply(null, args);
                }
            }
        } else if (enabled && origin === 1) {
            if (events.hasOwnProperty(event) && events[event].override) {
                /* Override is true and the origin is from the global window; call the @name@ listeners */
                for (var i = 0, len = events[event].listeners.length; i < len; i++) {
                    events[event].listeners[i].apply(generateThisObject(), args);
                }
                con.log("[Player Listener] Event " + event + " was called with", args);
            } else if (ytListeners[ytEvent]) {
                if (apiNotAvailable) {
                    /* API is not available therefore call @name@ listeners as YouTube listener is called  */
                    for (var i = 0, len = events[event].listeners.length; i < len; i++) {
                        returnVal = events[event].listeners[i].apply(null, args);
                    }
                }

                /* Override is false and the origin is from the global window; call the YouTube listener */
                returnVal = ytListeners[ytEvent].apply(uw, args);

                con.log("[Player Listener] Event " + event + " was called with", args);
            }
        } else if (!enabled) {
            /* Everything is disabled; call the YouTube listener */
            returnVal = ytListeners[ytEvent].apply(uw, args);
        }
        return returnVal;
    }

    function addPlayerListener() {
        var api = ytcenter.player.getAPI();
        var event;

        if (api && api.addEventListener) {
            apiNotAvailable = false;
            for (event in events) {
                if (events.hasOwnProperty(event)) {
                    playerListener[event] = ytcenter.utils.funcBind(null, callListener, event, 0);
                    api.addEventListener(event, playerListener[event]);
                }
            }
        } else {
            apiNotAvailable = true;
            con.error("[Player Listener] Player API is not available!");
        }
    }

    function setupGlobalListeners() {
        if (globalListenersInitialized) return; // Make sure that this function is only called once.
        globalListenersInitialized = true;
        con.log("Setting up global listeners");
        for (var event in events) {
            if (events.hasOwnProperty(event)) {
                var ytEvent = "ytPlayer" + event + "player" + getPlayerId();
                if (uw[ytEvent]) {
                    ytListeners[ytEvent] = uw[ytEvent];
                }
                defineLockedProperty(uw, ytEvent,
                    ytcenter.utils.funcBind(null, ytListenerContainerSetter, event),
                    ytcenter.utils.funcBind(null, ytListenerContainerGetter, event)
                );
            }
        }
    }

    function getPlayerId() {
        if (ytcenter.utils.isArray(playerId)) {
            return "_uid_" + playerId[0] + "_" + playerId[1];
        } else {
            return playerId;
        }
    }

    function setup() {
        if (enabled) return;
        con.log("[Player Listener] Has begun the setup...");
        var api = ytcenter.player.getAPI();
        playerId = getNewestPlayerId();

        enabled = true; // Indicate that the it's active.

        // Add the listeners normally to the player
        addPlayerListener();

        // Replace the global listeners with custom listeners in case the override property is set to true
        setupGlobalListeners();
    }

    function addEventListener(event, listener) {
        if (!events.hasOwnProperty(event)) return;

        removeEventListener(event, listener); // Make sure that there is only one instance of the listener registered.
        events[event].listeners.push(listener);
    }

    function removeEventListener(event, listener) {
        if (!events.hasOwnProperty(event)) return;
        for (var i = 0, len = events[event].listeners.length; i < len; i++) {
            if (events[event].listeners[i] === listener) {
                return events[event].listeners.splice(i, 1);
            }
        }
    }

    function setOverride(event, override) {
        if (!events.hasOwnProperty(event)) return;
        events[event].override = !!override;
    }

    function unloadPlayerListeners() {
        var api = ytcenter.player.getAPI();
        var event;

        if (api && api.removeEventListener) {
            for (event in events) {
                if (events.hasOwnProperty(event)) {
                    api.removeEventListener(event, playerListener[event]);
                    delete playerListener[event];
                }
            }
        } else {
            con.error("[Player Listener] Player API is not available!");
        }
    }

    function unload() {
        unloadPlayerListeners();
        enabled = false;
        apiNotAvailable = true;
    }

    function fireEvent(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        callListener.apply(this, [event, 1].concat(args));
    }

    var playerId = 1;
    var ytListeners = {};
    var playerListener = {}; // Reference for unload
    var enabled = false;
    var globalListenersInitialized = false;
    var apiNotAvailable = true;

    var events = {
        "onApiChange": {
            override: false,
            listeners: []
        },
        "onCueRangeEnter": {
            override: false,
            listeners: []
        },
        "onCueRangeExit": {
            override: false,
            listeners: []
        },
        "onError": {
            override: false,
            listeners: []
        },
        "onNavigate": {
            override: false,
            listeners: []
        },
        "onPlaybackQualityChange": {
            override: false,
            listeners: []
        },
        "onStateChange": {
            override: false,
            listeners: []
        },
        "onTabOrderChange": {
            override: false,
            listeners: []
        },
        "onVolumeChange": {
            override: false,
            listeners: []
        },
        "onAdStart": {
            override: false,
            listeners: []
        },
        "onReady": {
            override: false,
            listeners: []
        },
        "RATE_SENTIMENT": {
            override: false,
            listeners: []
        },
        "SHARE_CLICKED": {
            override: false,
            listeners: []
        },
        "SIZE_CLICKED": {
            override: false,
            listeners: []
        },
        "WATCH_LATER": {
            override: false,
            listeners: []
        },
        "WATCH_LATER_VIDEO_ADDED": {
            override: false,
            listeners: []
        },
        "WATCH_LATER_VIDEO_REMOVED": {
            override: false,
            listeners: []
        },
        "SUBSCRIBE": {
            override: false,
            listeners: []
        },
        "UNSUBSCRIBE": {
            override: false,
            listeners: []
        },
        "AdvertiserVideoView": {
            override: false,
            listeners: []
        },
        "captionschanged": {
            override: false,
            listeners: []
        },
        "onRemoteReceiverSelected": {
            override: false,
            listeners: []
        },
        "onFullscreenChange": {
            override: false,
            listeners: []
        }
    };

    return {
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        fireEvent: fireEvent,
        setOverride: setOverride,
        setup: setup,
        dispose: unload
    };
})();
ytcenter.player.setAutoHide = function(autohide){
    if (!ytcenter.html5) return;
    var target = ytcenter.player.getReference().target;
    if (target) {
        if (autohide === "-1") {
            if (ytcenter.utils.hasClass(target, "autohide-controls-aspect")) {
                ytcenter.utils.addClass(target, "autohide-controls");
            } else if (ytcenter.utils.hasClass(target, "autohide-controls")) {
                ytcenter.utils.addClass(target, "autohide-controls-aspect");
            }
            if (ytcenter.utils.hasClass(target, "autominimize-controls-aspect")) {
                ytcenter.utils.addClass(target, "autominimize-controls");
            } else if (ytcenter.utils.hasClass(target, "utominimize-controls")) {
                ytcenter.utils.addClass(target, "autominimize-controls-aspect");
            }
            if (ytcenter.utils.hasClass(target, "autominimize-progress-bar-aspect")) {
                ytcenter.utils.addClass(target, "autominimize-progress-bar");
            } else if (ytcenter.utils.hasClass(target, "autominimize-progress-bar")) {
                ytcenter.utils.addClass(target, "autominimize-progress-bar-aspect");
            }

            ytcenter.utils.removeClass(target, "autominimize-progress-bar-non-aspect");
            return;
        }
        // Default:
        // autohide-controls
        // autominimize-controls
        // autominimize-progress-bar
        // 
        // Non ideal aspect:
        // autominimize-progress-bar-non-aspect
        // 
        // Ideal aspect:
        // autohide-controls-aspect
        // autominimize-controls-aspect
        // autominimize-progress-bar-aspect
        // 
        // Fullscreen:
        // autominimize-progress-bar-fullscreen
        // autohide-controls-fullscreen
        // autohide-controls-fullscreenonly
        // 

        con.log("[HTML5 Player] Setting autohide to " + autohide);
        ytcenter.utils.removeClass(target, "autohide-controls autominimize-controls autominimize-progress-bar autominimize-progress-bar-non-aspect autohide-controls-aspect autominimize-controls-aspect autominimize-progress-bar-aspect");

        if (autohide === "0") { // None
            //ytcenter.utils.addClass(target, "");
        } else if (autohide === "1") { // Both
            ytcenter.utils.addClass(target, "autominimize-progress-bar autominimize-progress-bar-aspect autohide-controls autohide-controls-aspect");
        } else if (autohide === "2") { // Progressbar
            ytcenter.utils.addClass(target, "autominimize-progress-bar autominimize-progress-bar-aspect autominimize-controls autominimize-controls-aspect");
        } else if (autohide === "3") { // Controlbar
            ytcenter.utils.addClass(target, "autohide-controlbar autohide-controls-aspect autominimize-progress-bar autominimize-progress-bar-aspect");
        }
        ytcenter.events.performEvent("resize-update");
    }
};
ytcenter.player.setTheme = function(theme){
    if (!ytcenter.html5) return;
    con.log("[HTML5 Player] Setting player theme to " + theme);
    var light = "light-theme",
        dark = "dark-theme",
        target = document.getElementById("movie_player");
    if (target) {
        if (theme === "dark") {
            ytcenter.utils.removeClass(target, light);
            ytcenter.utils.addClass(target, dark);
        } else if (theme === "light") {
            ytcenter.utils.removeClass(target, dark);
            ytcenter.utils.addClass(target, light);
        }
    }
};
ytcenter.player.setProgressColor = function(color){
    if (!ytcenter.html5) return;
    con.log("[HTML5 Player] Setting player progress color to " + color);
    var white = "white",
        red = "red",
        els = document.getElementsByClassName("html5-progress-bar"), i;
    for (i = 0; i < els.length; i++) {
        if (color === "red") {
            ytcenter.utils.removeClass(els[i], white);
            ytcenter.utils.addClass(els[i], red);
        } else if (color === "white") {
            ytcenter.utils.removeClass(els[i], red);
            ytcenter.utils.addClass(els[i], white);
        }
    }
    ytcenter.classManagement.applyClasses();
};
ytcenter.player.aspect = function(option){
    var config = ytcenter.player.getConfig();
    config.args.keywords = option;
    con.log("Keywords changed to " + config.args.keywords);
    var api = ytcenter.player.getAPI();
    var muted = api.isMuted();
    var volume = api.getVolume();
    var rate = api.getPlaybackRate();
    var quality = api.getPlaybackQuality();
    var time = api.getCurrentTime();
    var state = api.getPlayerState();
    var dur = api.getDuration();
    if (state === 0) {
        time = dur + 60;
    }
    var __c = function(s){
        if (s !== 1) return;
        ytcenter.player.listeners.removeEventListener("onStateChange", __c);
        con.log("Setting player option to last player");
        if (state === -1) {
            api.stopVideo();
        } else if (state === 2) {
            api.pauseVideo();
            api.seekTo(time);
        } else {
            api.seekTo(time);
        }

        api.setVolume(volume);
        if (muted) {
            api.mute(muted);
        }
        api.setPlaybackRate(rate);
        ytcenter.player.isAutoResolutionEnabled() && ytcenter.player.setQuality(quality);

        con.log("Made a live refresh");
    };
    ytcenter.player.listeners.addEventListener("onStateChange", __c);
    api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);

    if (config.args.dash === "1" && config.args.adaptive_fmts) {
        ytcenter.player.setRatio(ytcenter.player.calculateRatio(true, option));
    } else {
        ytcenter.player.setRatio(ytcenter.player.calculateRatio(false, option));
    }
    ytcenter.player.resizeUpdater && ytcenter.player.resizeUpdater();
};
ytcenter.player.currentResizeId;
ytcenter.player.resizeCallback = [];
ytcenter.player.updateResize = (function(){
    function scrollToPlayer() {
        if (!ytcenter.settings.enableResize) return;
        var scrollElm = (document.getElementById("player-api-legacy") || document.getElementById("player-api"));
        if (ytcenter.settings.staticHeader) {
            scrollElm.scrollIntoView(true);
        } else {
            var posY = 0,
                mp = document.getElementById("masthead-positioner");
            while (scrollElm != null) {
                posY += scrollElm.offsetTop;
                scrollElm = scrollElm.offsetParent;
            }
            var top = posY;
            if (!ytcenter.utils.hasClass(document.body, "hide-header")) {
                top = top - mp.offsetHeight;
            }
            ytcenter.utils.scrollTop(top);
        }
    }

    var scrollToPlayerButtonArrow, scrollToPlayerButton = null;
    var getSizeById = function(id) {
        var sizes = ytcenter.settings["resize-playersizes"];
        for (var i = 0; i < sizes.length; i++) {
            if (id === sizes[i].id) {
                return sizes[i];
            }
        }
        return {
            id: "default",
            config: {
                align: true,
                height: "",
                large: false,
                scrollToPlayer: false,
                scrollToPlayerButton: false,
                width: ""
            }
        };
    }
    var updatescrollToPlayerButtonPosition = function(){
        if (!ytcenter.settings.enableResize) return;
        var appbar = document.getElementById("appbar-onebar-upload-group") || document.getElementById("yt-masthead-user");
        if (appbar && !scrollToPlayerButton.parentNode) {
            appbar.insertBefore(scrollToPlayerButton, appbar.children[0]);
        }
    };
    var updatescrollToPlayerButtonVisibility = function(){
        if (!ytcenter.settings.enableResize) {
            scrollToPlayerButton.style.display = "none";
            return;
        }
        try {
            scrollToPlayerButton.style.bottom = "";
            scrollToPlayerButton.style.right = "";
            scrollToPlayerButton.style.position = "";
            var _s = getSizeById(ytcenter.player.currentResizeId);
            if (_s.config.scrollToPlayerButton) {
                scrollToPlayerButton.style.display = "inline-block";
            } else {
                scrollToPlayerButton.style.display = "none";
            }

            var appbar = document.getElementById("appbar-onebar-upload-group");
            if (appbar && !scrollToPlayerButton.parentNode) {
                appbar.insertBefore(scrollToPlayerButton, appbar.children[0]);
            }
        } catch (e) {
            con.error(e);
        }
    };
    ytcenter.player.updateResize_updatePosition = updatescrollToPlayerButtonPosition;
    ytcenter.player.updateResize_updateVisibility = updatescrollToPlayerButtonVisibility;

    scrollToPlayerButtonArrow = document.createElement("img");
    scrollToPlayerButtonArrow.className = "yt-uix-button-arrow";
    scrollToPlayerButtonArrow.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
    scrollToPlayerButtonArrow.alt = "";
    scrollToPlayerButtonArrow.setAttribute("alt", "");
    scrollToPlayerButtonArrow.style.marginLeft = "0";
    scrollToPlayerButtonArrow.style.marginRight = "0";
    scrollToPlayerButtonArrow.style.display = "inline-block";
    scrollToPlayerButton = ytcenter.gui.createYouTubeDefaultButton("SCROLL_TOOLTIP", [scrollToPlayerButtonArrow]);
    scrollToPlayerButton.className = "yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-has-icon yt-uix-button-empty flip yt-uix-tooltip ";
    scrollToPlayerButton.style.display = "inline-block";
    scrollToPlayerButton.style.position = "absolute";
    ytcenter.utils.addEventListener(scrollToPlayerButton, "click", function(e){
        scrollToPlayer();
    }, false);

    return function(){
        if (!ytcenter.settings.enableResize) return;
        var _s = getSizeById(ytcenter.player.currentResizeId);
        ytcenter.player.resize(_s);
        if (_s.config.scrollToPlayer && ytcenter.getPage() === "watch" && ((ytcenter.settings.topScrollPlayerEnabled && !ytcenter.settings.topScrollPlayerActivated) || !ytcenter.settings.topScrollPlayerEnabled)) {
            scrollToPlayer();
        }

        updatescrollToPlayerButtonVisibility();
        updatescrollToPlayerButtonPosition();
    };
})();
ytcenter.player.isPlayerAligned = function(){
    function getSizeById(id) {
        var sizes = ytcenter.settings["resize-playersizes"];
        for (var i = 0; i < sizes.length; i++) {
            if (id === sizes[i].id) {
                return sizes[i];
            }
        }
        return {
            id: "default",
            config: {
                align: true,
                height: "",
                large: false,
                scrollToPlayer: false,
                scrollToPlayerButton: false,
                width: ""
            }
        };
    }
    if (ytcenter.settings["resize-default-playersize"] === "default") {
        ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
    } else {
        ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
    }
    var playerSize = getSizeById(ytcenter.player.currentResizeId);
    return playerSize.config.align;
};
ytcenter.player.setPlayerSize = function(config){
    for (var i = 0; i < ytcenter.settings["resize-playersizes"].length; i++) {
        if (ytcenter.settings["resize-playersizes"][i].id === config.id) {
            ytcenter.settings["resize-playersizes"][i] = config;
            break;
        }
    }
};
ytcenter.player.getPlayerSize = function(id){
    for (var i = 0; i < ytcenter.settings["resize-playersizes"].length; i++) {
        if (ytcenter.settings["resize-playersizes"][i].id === id) {
            return ytcenter.settings["resize-playersizes"][i];
        }
    }

    // default
    return {
        id: "default",
        config: {
            align: true,
            height: "",
            large: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
            width: ""
        }
    };
};
ytcenter.player.resize = (function(){
    var lastResizeId;
    ytcenter.player.resizeUpdater = function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player.resize(ytcenter.player.getPlayerSize(lastResizeId));
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
    };
    ytcenter.player.isSelectedPlayerSizeById = function(id){
        if (!ytcenter.settings.enableResize) return;
        try {
            if (lastResizeId === id)
                return true;
        } catch (e) {}
        return false;
    };
    var exports_timeout;
    return function(item){
        if (!ytcenter.settings.enableResize) return;

        if (typeof item !== "undefined") lastResizeId = item.id;
        if (typeof lastResizeId === "undefined") return;
        uw.clearTimeout(exports_timeout);

        // Generate the player size name.
        var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
        var sizeName = null;
        if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
            sizeName = item.config.customName;
        } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
            sizeName = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
        } else {
            sizeName = dim[0] + "×" + dim[1];
        }

        // Setting the data attributes to the html tag.
        document.documentElement.setAttribute("data-ytc-player-size-id", item.id);
        document.documentElement.setAttribute("data-ytc-player-size-name", sizeName);

        ytcenter.player._resize(item.config.width, item.config.height, item.config.large, item.config.align);
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
        ytcenter.utils.each(ytcenter.player.resizeCallback, function(i, func){
            func();
        });
    };
})();
ytcenter.player.ratio = 16/9;
ytcenter.player.streamRatio = 16/9;
ytcenter.player.setRatio = function(ratio){
    con.log("[Player Ratio] Player ratio set to " + ratio);
    ytcenter.player.ratio = ratio[0];
    ytcenter.player.streamRatio = ratio[1] || ratio[0];
};
ytcenter.player._resize = (function(){
    function getStage() {
        var innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        var isWatchStage = ytcenter.utils.hasClass(page, "watch-stage-mode");
        var isWatchNonStage = ytcenter.utils.hasClass(page, "watch-non-stage-mode");

        var config = (isWatchStage ? stageConfiguration : (isWatchNonStage ? nonStageConfiguration : []));

        for (var i = 0, len = config.length; i < len; i++) {
            if (config[i].minWidth <= innerWidth && config[i].minHeight <= innerHeight) {
                return config[i];
            }
        }

        return null;
    }

    var _width = "";
    var _height = "";
    var _large = true;
    var _align = true;
    var _playlist_toggled = false;
    var _playerHeight = 0;

    var player_ratio = 16/9;

    ytcenter.player._updateResize = function(){
        if (!ytcenter.settings.enableResize || ytcenter.getPage() !== "watch") return;
        ytcenter.player._resize(_width, _height, _large, _align);
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
    };
    ytcenter.player.getCurrentPlayerSize = function(){
        return {
            width: _width,
            height: _height,
            large: _large,
            align: _align,
            playerHeight: _playerHeight
        };
    };
    ytcenter.events.addEvent("ui-refresh", function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player._resize(_width, _height, _large, _align);
    });
    ytcenter.events.addEvent("resize-update", function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player._resize(_width, _height, _large, _align);
    });
    ytcenter.utils.addEventListener(window, "resize", (function(){
        var timer = null;
        return function(e){
            if (e && e.detail === "ytcenter") return;
            if (!ytcenter.settings.enableResize) return;
            if (timer !== null) uw.clearTimeout(timer);
            timer = uw.setTimeout(function(){
                ytcenter.events.performEvent("resize-update");
            }, 100);
        };
    })(), false);

    var stageConfiguration = [
        {
            minWidth: 1320,
            minHeight: 870,
            playerWidth: 1280
        }
    ];

    var nonStageConfiguration = [
        {
            minWidth: 1720,
            minHeight: 980,
            playerWidth: 1706
        }, {
            minWidth: 1294,
            minHeight: 630,
            playerWidth: 1280
        }, {
            minWidth: 1080,
            minHeight: 560,
            playerWidth: 1066
        }
    ];

    var defaultPlayerMinWidth = 1003;
    var defaultPlayerMaxWidth = 1066;

    var sidebarWidth = 426;

    var lastPlayerSize = { width: null, height: null };

    function resize(width, height, large) {
        var innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // Configurations
        var stageMode = null;
        var invalidDimensions = isNaN(parseInt(width)) && isNaN(parseInt(height));

        // Element references
        var page = document.getElementById("page");
        var player = document.getElementById("player");
        var playerAPI = document.getElementById("player-api");
        var playerPlaylist = document.getElementById("player-playlist");
        var content = document.getElementById("content");
        var sidebar = document.getElementById("watch7-sidebar");
        var wContent = document.getElementById("watch7-content");
        var container = document.getElementById("watch7-container");
        var playlist = document.getElementById("watch-appbar-playlist");

        if (!player) {
            con.error("Player element (#player) could not be found.");
            return;
        }

        if (large) {
            ytcenter.utils.addClass(player, "watch-large");
            ytcenter.utils.removeClass(player, "watch-small");

            ytcenter.utils.addClass(container, "watch-wide");
            ytcenter.utils.addClass(page, "watch-wide");
            playlist && ytcenter.utils.removeClass(playlist, "player-height");
        } else {
            ytcenter.utils.addClass(player, "watch-small");
            ytcenter.utils.removeClass(player, "watch-large");

            ytcenter.utils.removeClass(container, "watch-wide");
            ytcenter.utils.removeClass(page, "watch-wide");
            playlist && ytcenter.utils.addClass(playlist, "player-height");
        }

        if (large) {
            ytcenter.utils.addClass(page, "watch-stage-mode");
            ytcenter.utils.removeClass(page, "watch-non-stage-mode");
            stageMode = 0;
        } else {
            ytcenter.utils.removeClass(page, "watch-stage-mode");
            ytcenter.utils.addClass(page, "watch-non-stage-mode");
            stageMode = 1;
        }

        if (invalidDimensions) {
            var conf = null;

            if (stageMode === 0) { // large
                conf = getStageConfiguration(innerWidth, innerHeight);
            } else if (stageMode === 1) { // small
                conf = getNonStageConfiguration(innerWidth, innerHeight);
            }

            if (conf !== null) {
                width = (conf.playerWidth - (stageMode === 1 ? sidebarWidth : 0)) + "px";
            } else {
                width = large ? "854px" : "640px";
            }
            height = ""; // let YouTube Center calculate the height
        }

        var playerDimension = getPlayerDimension(width, height);
        if (ytcenter.utils.hasClass(player, "watch-multicamera")) {
            playerDimension[1] += 80;
        }

        var playerWidth = playerDimension[0];
        var playerHeight = playerDimension[1] + getPlayerBarHeight();

        // Applying style data to #player
        if (large) {
            //player.style.width = playerWidth + "px";
            player.style.maxWidth = "";
            content.style.width = "";
            content.style.maxWidth = "";
            wContent.style.width = "";
            sidebar.style.marginLeft = "";
        } else {
            var contentWidth = playerWidth + sidebarWidth;

            // The content should have the width range of 1003px to 1066px (or larger)
            if (!invalidDimensions) {
                player.style.maxWidth = contentWidth + "px";
                content.style.maxWidth = contentWidth + "px";
                wContent.style.width = playerWidth + "px";
                sidebar.style.marginLeft = (playerWidth + 10) + "px";
            } else {
                player.style.maxWidth = "";
                content.style.maxWidth = "";
                wContent.style.width = "";
                sidebar.style.marginLeft = "";
            }

            if (defaultPlayerMaxWidth < contentWidth && contentWidth > innerWidth) {
                content.style.width = contentWidth + "px";
            } else {
                content.style.width = "";
            }

            //player.style.width = ""; // The #player should not have a width
        }

        // Applying style data to #player-api
        if (playerAPI) {
            playerAPI.style.width = playerWidth + "px";
            playerAPI.style.height = playerHeight + "px";
        }
        if (playerPlaylist) {
            playerPlaylist.style.marginTop = -playerHeight + "px";
        }
        if (playlist) {
            if (large) {
                playlist.style.top = (playerHeight - (isExperimentalPlayer() ? 360 : 390)) + "px";
            } else {
                playlist.style.top = "";
            }
        }
        ytcenter.playerDocking.updateSize(playerWidth, playerHeight);
        /*if (large) {
         sidebar.style.top = "";
         } else {
         sidebar.style.top = -(playerHeight - 390) + "px";
         }*/
        ytcenter.utils.setCustomCSS("player-width", ".player-width { width: " + playerWidth + "px!important; }");
        ytcenter.utils.setCustomCSS("player-height", ".player-height { height: " + playerHeight + "px!important; }");

        // Add metadat to html
        document.documentElement.setAttribute("data-ytc-player-size-width", width); // The width of the player as given by the player size
        document.documentElement.setAttribute("data-ytc-player-size-height", height); // The height of the player as given by the player size
        document.documentElement.setAttribute("data-ytc-player-size-calc-width", playerWidth); // The calculated width of the player in pixels.
        document.documentElement.setAttribute("data-ytc-player-size-calc-height", playerHeight); // The calculated height of the player in pixels.
        document.documentElement.setAttribute("data-ytc-player-size-large", large); // Whether the player is regarded as a large (or medium) sized player by YouTube.

        if (lastPlayerSize.width !== playerWidth || lastPlayerSize.height !== playerHeight) {
            lastPlayerSize.width = playerWidth;
            lastPlayerSize.height = playerHeight;
            window.dispatchEvent(ytcenter.utils.createCustomEvent("resize", "ytcenter"));
        }
    }

    function getPlayerDimension(width, height) {
        var mastheadPositioner = document.getElementById("masthead-positioner");
        var clientWidth = document.documentElement.clientWidth || window.innerWidth || document.body.clientWidth;
        var clientHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;

        var calculatedWidth = convertToPixels(width, clientWidth);
        var calculatedHeight = convertToPixels(height, clientHeight);

        var playerRatio = ytcenter.player.ratio || 1;
        var barheight = getPlayerBarHeight();

        var heightUnit = getNumberUnit(width);
        if (heightUnit === "%") {
            if (mastheadPositioner && !ytcenter.settings.staticHeader && !ytcenter.utils.hasClass(document.body, "hide-header")) {
                calculatedHeight -= mastheadPositioner.offsetHeight || mastheadPositioner.clientHeight;
            }
            calculatedHeight -= barheight;
        }

        if (!isNaN(calculatedWidth) && isNaN(calculatedHeight)) {
            calculatedHeight = Math.round(calculatedWidth/playerRatio);
        } else if (isNaN(calculatedWidth) && !isNaN(calculatedHeight)) {
            if (heightUnit === "%") {
                calculatedWidth = Math.round((calculatedHeight - barheight)*playerRatio);
            } else {
                calculatedWidth = Math.round(calculatedHeight*playerRatio);
            }
        }

        if (isNaN(calculatedWidth)) calculatedWidth = 0;
        if (isNaN(calculatedHeight)) calculatedHeight = 0;

        return [calculatedWidth, calculatedHeight];
    }

    function getNumberUnit(n) {
        if ((n + '').match(/%$/)) return "%";
        return "px";
    }

    function convertToPixels(n, scaleNumber) {
        if ((!n && n !== 0) || n === "" || (typeof n === "number" && isNaN(n))) return NaN;

        var unit = getNumberUnit(n);
        if (unit === "px" && typeof n !== "number") return Math.round(parseInt(n, 10));

        if (unit === "%") {
            return Math.round(parseInt(n, 10)/100*scaleNumber);
        }
    }

    function getStageConfiguration(width, height) {
        for (var i = 0, len = stageConfiguration.length; i < len; i++) {
            if (stageConfiguration[i].minWidth <= width && stageConfiguration[i].minHeight <= height) {
                return stageConfiguration[i];
            }
        }

        return null;
    }

    function getNonStageConfiguration(width, height) {
        for (var i = 0, len = nonStageConfiguration.length; i < len; i++) {
            if (nonStageConfiguration[i].minWidth <= width && nonStageConfiguration[i].minHeight <= height) {
                return nonStageConfiguration[i];
            }
        }

        return null;
    }

    function isExperimentalPlayer() {
        return true;
    }

    function getPlayerBarHeight() {
        if (isExperimentalPlayer()) return 0;

        var autohide = ytcenter.settings.autohide;
        var target = ytcenter.player.getReference().target;

        if (target && autohide === "-1") {
            if (ytcenter.utils.hasClass(target, "ideal-aspect autominimize-progress-bar-aspect autohide-controls-aspect") || ytcenter.utils.hasClass(target, "autominimize-progress-bar autohide-controls")) {
                return 0;
            } else if (ytcenter.utils.hasClass(target, "ideal-aspect autominimize-progress-bar-aspect autominimize-controls-aspect") || ytcenter.utils.hasClass(target, "autominimize-progress-bar autominimize-controls")) {
                return 30;
            } else if (ytcenter.utils.hasClass(target, "ideal-aspect autohide-controls-aspect") || ytcenter.utils.hasClass(target, "autohide-controls")) {
                return 0;
            } else {
                return 35;
            }
        } else {
            if (ytcenter.html5) {
                if (ytcenter.player.ratio < 1.35 && autohide === "-1") {
                    autohide = "3"
                }
            } else {
                if (ytcenter.player.config && ytcenter.player.config.args && (typeof ytcenter.player.config.args.autohide === "string" || typeof ytcenter.player.config.args.autohide === "number")) {
                    autohide = ytcenter.player.config.args.autohide;
                } else {
                    autohide = "3";
                }
            }
        }

        /*if (autohide === "0") { // None
         //ytcenter.utils.addClass(target, "");
         } else if (autohide === "1") { // Both
         ytcenter.utils.addClass(target, "autominimize-progress-bar autominimize-progress-bar-aspect autohide-controls autohide-controls-aspect");
         } else if (autohide === "2") { // Progressbar
         ytcenter.utils.addClass(target, "autominimize-progress-bar autominimize-progress-bar-aspect autominimize-controls autominimize-controls-aspect");
         } else if (autohide === "3") { // Controlbar
         ytcenter.utils.addClass(target, "autohide-controlbar autohide-controls-aspect autominimize-progress-bar autominimize-progress-bar-aspect");
         }*/

        var playerBarHeight = 30;
        var playerBarHeightNone = 0;
        var playerBarHeightProgress = 3;
        var playerBarHeightBoth = 35;

        if (autohide === "0") {
            return playerBarHeightBoth;
        } else if (autohide === "1") {
            return playerBarHeightNone;
        } else if (autohide === "2") {
            return playerBarHeight;
        } else if (autohide === "3") {
            return playerBarHeightProgress;
        } else {
            return playerBarHeight;
        }
    }

    return function(width, height, large, align){
        if (!ytcenter.settings.enableResize) return;
        if (ytcenter.getPage() !== "watch") return;

        width = width || "";
        height = height || "";
        if (typeof large !== "boolean") large = false;
        if (typeof align !== "boolean") align = false;
        _width = width;
        _height = height;
        _large = large;
        _align = align;

        if (ytcenter.player.darkside()) {
            ytcenter.utils.addClass(document.body, "ytcenter-player-darkside-bg");
        } else {
            ytcenter.utils.removeClass(document.body, "ytcenter-player-darkside-bg");
        }

        return resize(width, height, large);
    };
})();
ytcenter.player.getFPSArray = function(streams){
    var arr = [];
    for (var i = 0, len = streams.length; i < len; i++) {
        var localFPS = parseInt(streams[i].fps || "30", 10);

        if (!ytcenter.utils.inArray(arr, localFPS)) {
            arr.push(localFPS);
        }
    }
    return arr.sort(function(a, b){
        return b - a;
    });
};
ytcenter.player.getHighestFPS = function(streams){
    var fps = -1;
    for (var i = 0, len = streams.length; i < len; i++) {
        var localfps = parseInt(streams[i].fps || "30", 10);

        if (fps < localfps) {
            fps = localfps;
        }
    }
    return fps;
};
ytcenter.player.getBestStream = function(streams, dash){
    var i, stream = null, vqIndex = ytcenter.player.qualities.length - 1, _vq, _vqIndex, currFPS = -1;
    for (i = 0; i < streams.length; i++) {
        if ((dash === 1 && !streams[i].dash) || (dash === 0 && streams[i].dash)) continue;
        if (streams[i].dash && streams[i].size) {
            _vq = ytcenter.player.convertDimensionToQuality(streams[i].size);
        } else if (!streams[i].dash && streams[i].quality) {
            _vq = streams[i].quality;
        }

        var fps = parseInt(streams[i].fps || "30", 10);

        _vqIndex = $ArrayIndexOf(ytcenter.player.qualities, _vq);
        if (_vqIndex < vqIndex || (_vqIndex === vqIndex && currFPS < fps)) {
            stream = streams[i];
            vqIndex = _vqIndex;
            currFPS = fps;
        }
    }
    if (!stream && dash !== -1)
        return ytcenter.player.getBestStream(streams, -1);
    return stream;
};
ytcenter.player.getHighestStreamQuality = function(streams, dash){
    var i, stream = streams[0], stream_dim, tmp_dim;
    if (!stream) return null;
    if (stream.dimension && stream.dimension.indexOf("x") !== -1) {
        stream_dim = stream.dimension.split("x");
        stream_dim[0] = parseInt(stream_dim[0], 10);
        stream_dim[1] = parseInt(stream_dim[1], 10);
    } else if (stream.size && stream.size.indexOf("x") !== -1) {
        stream_dim = stream.size.split("x");
        stream_dim[0] = parseInt(stream_dim[0], 10);
        stream_dim[1] = parseInt(stream_dim[1], 10);
    } else {
        stream_dim = [0, 0];
    }

    for (i = 1; i < streams.length; i++) {
        if (!streams[i].dimension && !streams[i].size) continue;
        if (dash === 0) {
            if (stream.dash) {
                stream = streams[i];
                continue;
            }
            if (streams[i].dash) continue;
        } else if (dash === 1) {
            if (!stream.dash) {
                stream = streams[i];
                continue;
            }
            if (!streams[i].dash) continue;
        }

        if (streams[i].dimension && streams[i].dimension.indexOf("x") !== -1) {
            tmp_dim = streams[i].dimension.split("x");
            tmp_dim[0] = parseInt(tmp_dim[0]);
            tmp_dim[1] = parseInt(tmp_dim[1]);
            if (stream_dim[1] < tmp_dim[1]) {
                stream_dim = tmp_dim;
                stream = streams[i];
            }
        } else if (streams[i].size && streams[i].size.indexOf("x") !== -1) {
            tmp_dim = streams[i].size.split("x");
            tmp_dim[0] = parseInt(tmp_dim[0]);
            tmp_dim[1] = parseInt(tmp_dim[1]);
            if (stream_dim[1] < tmp_dim[1]) {
                stream_dim = tmp_dim;
                stream = streams[i];
            }
        }
    }
    return stream;
};

ytcenter.player.getQualityByDimensionHTML5 = function(width, height) {
    var qualityList = ["auto", "highres", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny"],
        tabel = {
            auto: [0, 0],
            tiny: [256, 144],
            light: [426, 240],
            small: [426, 240],
            medium: [640, 360],
            large: [854, 480],
            hd720: [1280, 720],
            hd1080: [1920, 1080],
            hd1440: [2560, 1440],
            highres: [3840, 2160]
        },
        quality = "tiny", i, q;
    for (i = 2; i < qualityList.length; i++) {
        q = tabel[qualityList[i]];
        if (width > q[0] && height >= q[1] || width >= q[0] && height > q[1]) {
            return qualityList[i - 1];
        }
    }
    return quality
}
ytcenter.player.getQualityByDimension = function(width, height) {
    if (height > 1728 || width > 3072) {
        return "highres";
    }
    if (height > 1152 || width > 2048) {
        return "hd1440";
    }
    if (height > 720 || width > 1280) {
        return "hd1080";
    }
    if (height > 480 || width > 854) {
        return "hd720";
    }
    if (height > 360 || width > 640) {
        return "large";
    }
    if (height > 240 || width > 427) {
        return "medium";
    }
    if (height > 144 || width > 256) {
        return "small";
    }
    return "tiny";
}
ytcenter.player.convertDimensionToQuality = function(size){
    if (!size) return "auto";
    size = size.split("x");
    return ytcenter.player.getQualityByDimension(size[0], size[1]);
};
ytcenter.player.convertDimensionToQualityHTML5 = function(size){
    if (!size) return "auto";
    size = size.split("x");
    return ytcenter.player.getQualityByDimensionHTML5(size[0], size[1]);
};
ytcenter.player.qualities = ["highres", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny", "auto"];
ytcenter.player.qualityDimensions = ["3840x2160", "2560x1440", "1920x1080", "1280x720", "854x480", "640x360", "640x360"];
ytcenter.player.getQualityDimension = function(vq){
    if (vq === "auto") return null;
    var i = 0;
    for (i = 0; i < ytcenter.player.qualities.length; i++) {
        if (ytcenter.player.qualities[i] === vq) {
            return ytcenter.player.qualityDimensions[i];
        }
    }

    return null;
};
ytcenter.player.getQuality = function(vq, streams, dash){
    var _vq = "auto", priority = ['auto', 'tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'highres'],
        a = document.createElement("video"), cpt = a && a.canPlayType,
        currentIndex = 0, quality, qualityIndex, preferedIndex;
    if (typeof streams === "undefined") return _vq;
    if (typeof dash === "undefined") {
        if (ytcenter.getPage() === "watch") {
            dash = ytcenter.settings.dashPlayback;
        } else if (ytcenter.getPage() === "embed") {
            dash = ytcenter.settings.embed_dashPlayback;
        } else if (ytcenter.getPage() === "channel") {
            dash = ytcenter.settings.channel_dashPlayback;
        }
    }

    if (ytcenter.html5 && !cpt) {
        con.log("[getQuality] The HTML5 player is not supported by this browser!");
        return _vq;
    }

    for (var i = 0; i < streams.length; i++) {
        if (!streams[i]) continue; // This stream doesn't exist...
        if (ytcenter.html5 && !a.canPlayType(streams[i].type.split(";")[0]).replace(/no/, '')) continue; // Browser doesn't support this format
        if (dash && (!streams[i].dash || !streams[i].size)) continue;
        if (!dash && streams[i].dash) continue;
        if (dash) {
            if (ytcenter.html5) {
                quality = ytcenter.player.convertDimensionToQualityHTML5(streams[i].size);
            } else {
                quality = ytcenter.player.convertDimensionToQuality(streams[i].size);
            }
        } else {
            quality = streams[i].quality;
        }
        qualityIndex = $ArrayIndexOf(priority, quality);
        preferedIndex = $ArrayIndexOf(priority, vq);

        if (qualityIndex <= preferedIndex && qualityIndex > currentIndex) {
            _vq = quality;
            currentIndex = qualityIndex;
        }
    }

    con.log("[Player:getQuality] Most preferred available quality: " + _vq);
    return _vq;
};
ytcenter.player.parseThumbnailStream = function(specs){
    var parts = specs.split("|"),
        baseURL = parts[0],
        levels = [], i, a, b;
    for (i = 1; i < parts.length; i++) {
        a = parts[i].split("#");
        b = {
            width: parseInt(a[0]),
            height: parseInt(a[1]),
            frames: parseInt(a[2]),
            columns: parseInt(a[3]),
            rows: parseInt(a[4]),
            interval: parseInt(a[5]),
            urlPattern: a[6],
            signature: a[7]
        };
        b.numMosaics = Math.ceil(b.frames / (b.rows * b.columns));
        b.getMosaic = (function(c){
            return function(frame){
                return Math.floor(frame/(c.rows*c.columns));
            };
        })(b);
        b.getURLS = (function(c, index){
            return function(){
                var arr = [], j;
                for (j = 0; j < c.numMosaics; j++) {
                    arr.push(baseURL.replace("$L", index).replace("$N", c.urlPattern).replace("$M", j) + "?sigh=" + c.signature);
                }
                return arr;
            };
        })(b, i - 1);
        b.getRect = (function(c){
            return function(frame, maxDim){
                if (frame < 0 || (c.frames && frame >= c.frames))
                    return null;
                var scale = 1,
                    a = frame % (c.rows * c.columns),
                    _x, x, _y, y, width = c.width - 2, height = c.height, iw, ih;
                if (maxDim && width > 0 && height > 0) {
                    if (maxDim.width > 0 && maxDim.height > 0)
                        scale = Math.min(maxDim.width/width, maxDim.height/height);
                    else if (maxDim.width === 0)
                        scale = maxDim.height/height;
                    else if (maxDim.height === 0)
                        scale = maxDim.width/width;
                }
                _x = (c.width * (a % c.columns));
                x = _x*scale;
                _y = (c.height * Math.floor(a / c.rows));
                y = _y*scale;
                width = width*scale,
                    height = height*scale,
                    iw = c.width*c.columns*scale
                ih = c.height*c.rows*scale;
                return {
                    x: Math.round(x),
                    y: Math.round(y),
                    _x: Math.round(_x),
                    _y: Math.round(_y),
                    width: Math.round(width),
                    height: Math.round(height),
                    imageWidth: Math.round(iw),
                    imageHeight: Math.round(ih)
                };
            };
        })(b);
        b.getURL = (function(c, index){
            return function(frame){
                return baseURL.replace("$L", index).replace("$N", c.urlPattern).replace("$M", c.getMosaic(frame)) + "?sigh=" + c.signature;
            };
        })(b, i - 1);
        levels.push(b);
    }
    return {
        baseURL: baseURL,
        levels: levels
    };
};
ytcenter.player._original_update = undefined;
ytcenter.player._appliedBefore = false;
ytcenter.player._onPlayerLoadedBefore = false;
ytcenter.player.setPlayerType = function(type){
    function setType(api, type) {
        var playerType = null;
        if (api && typeof api.getPlayerType === "function" && (playerType = api.getPlayerType()) === type) {
            con.log("[Player:setPlayerType] Type is already " + type + "!");
            return;
        }
        con.log("[Player:setPlayerType] Setting player type from " + playerType + " to " + type);
        if (api && typeof api.writePlayer === "function") {
            api.writePlayer(type);
        }
    }
    con.log("[Player:setPlayerType] Requesting player type change to " + type);

    try {
        if (type !== "html5" && type !== "flash") {
            con.error("[Player:setPlayerType] Invalid type: " + type);
            return;
        }
        if (ytcenter.player.isLiveStream()) {
            con.log("[Player:setPlayerType] Is disabled on live streams!");
            return;
        }
        if (ytcenter.player.isOnDemandStream()) {
            con.log("[Player:setPlayerType] Is disabled on live streams!");
            return;
        }
        var api = ytcenter.player.getAPI();
        if (api) {
            setType(api, type);
        } else {
            var called = false;
            var cb = function(api){
                if (!api || called) return;
                called = true;
                if (type === "flash") ytcenter.player.disableHTML5Tick();
                setType(api, type);
            };
            con.log("[Player:setPlayerType] API isn't ready!");
            if (type === "flash") ytcenter.player.disableHTML5();
            //ytcenter.utils.addClass(document.body, "ytcenter-disable-html5");
            ytcenter.player.listeners.addEventListener("onReady", cb);
        }
    } catch (e) {
        con.error(e);
    }
};
ytcenter.player.disableHTML5Tick = function(){
    if (ytcenter.player.disableHTML5_timeout) {
        uw.clearTimeout(ytcenter.player.disableHTML5_timeout);
        ytcenter.player.disableHTML5_timeout = null;
    }
    ytcenter.utils.removeClass(document.body, "ytcenter-disable-html5");
};
ytcenter.player.disableHTML5_timeout = null;
ytcenter.player.disableHTML5 = function(){
    var a = document.getElementsByClassName("video-stream");
    if (a.length > 0 && a[0])
    //a[0].pause(); // Slower aproach, but will not throw errors (we want the faster method).
        a[0].src = ""; // this can cause YouTube to throw errors, but we're doing it anyway.
    ytcenter.utils.addClass(document.body, "ytcenter-disable-html5");

    if (ytcenter.player.disableHTML5_timeout) {
        uw.clearTimeout(ytcenter.player.disableHTML5_timeout);
        ytcenter.player.disableHTML5_timeout = null;
    }
    ytcenter.player.disableHTML5_timeout = uw.setTimeout(function(){
        ytcenter.utils.removeClass(document.body, "ytcenter-disable-html5");
    }, 2000);
};
ytcenter.player.updateFlashvars = function(player, config){
    if (!config || !config.args || !player) return;
    var flashvars = "", key;
    for (key in config.args) {
        if (config.args.hasOwnProperty(key) && key !== "__exposedProps__") {
            if (flashvars !== "") flashvars += "&";
            flashvars += encodeURIComponent(key) + "=" + encodeURIComponent(config.args[key]);
        }
    }
    player.setAttribute("flashvars", flashvars);
};
ytcenter.player.isHTML5 = function(){
    var movie_player = document.getElementById("movie_player"), cfg = ytcenter.player.getConfig(), api = ytcenter.player.getAPI();
    var isHTML5 = (movie_player && movie_player.tagName === "DIV") || cfg.html5 || (api && api.getPlayerType && api.getPlayerType() === "html5");
    return isHTML5;
};
ytcenter.player.updated = false;
ytcenter.player.update = function(config){
    if (ytcenter.getPage() === "watch" && !config.args.url_encoded_fmt_stream_map && !config.args.adaptive_fmts && !ytcenter.player.isLiveStream(config) && !ytcenter.player.isOnDemandStream(config)) {
        config = ytcenter.player.modifyConfig("watch", ytcenter.player.getRawPlayerConfig());
        ytcenter.player.setConfig(config);
    }
    if (ytcenter.player.isHTML5() || ytcenter.player.updated) return;
    try {
        var player = document.getElementById("movie_player") || document.getElementById("player1"), clone;
        con.log("[Player Update] Checking if player exist!");
        if ((player && player.tagName.toLowerCase() == "embed") || ytcenter.player._update_onYouTubeReady) {
            ytcenter.player.updated = false;
            ytcenter.player.updateFlashvars(player, config);

            if (ytcenter.getPage() === "watch") {
                if (ytcenter.settings.flashWMode !== "none") {
                    player.setAttribute("wmode", ytcenter.settings.flashWMode);
                }
            } else if (ytcenter.getPage() === "embed") {
                if (ytcenter.settings.embed_flashWMode !== "none") {
                    player.setAttribute("wmode", ytcenter.settings.embed_flashWMode);
                }
            } else if (ytcenter.getPage() === "channel") {
                if (ytcenter.settings.channel_flashWMode !== "none") {
                    player.setAttribute("wmode", ytcenter.settings.channel_flashWMode);
                }
            }

            clone = player.cloneNode(true);
            clone.style.display = "";
            player.style.display = "none";
            player.src = "";
            player.parentNode.replaceChild(clone, player);
            player = clone;
            con.log("[Player Update] Player has been cloned and replaced!");
        } else {
            //uw.setTimeout(function(){ ytcenter.player.update(config); }, 100);
        }
    } catch (e) {
        con.error(e);
    }
};