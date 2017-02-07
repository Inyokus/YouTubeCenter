/* "Scroll to top to make video fullscreen" feature */

ytcenter.topScrollPlayer = (function(){
    function enterComplete() {
        if (inTransition) {
            ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top");
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-player-pre");

            uw.setTimeout(function(){ inTransition = false; }, 500);
            window.dispatchEvent(ytcenter.utils.createCustomEvent("resize", "ytcenter"));
        }
    }
    function exitComplete() {
        if (inTransition) {
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-static");
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-disable-animation");

            inTransition = false;

            window.dispatchEvent(ytcenter.utils.createCustomEvent("resize", "ytcenter"));
        }
    }
    function onTransitionEnd() {
        if (!transitionEndListenerAdded) {
            inTransition = true;
            if (inTransitionTimer !== null) {
                uw.clearTimeout(inTransitionTimer);
            }

            var fullscreenData = { fullscreen: activated };

            var api = ytcenter.player.getAPI();
            if (api && api.getVideoData) {
                var data = api.getVideoData();
                fullscreenData.videoId = data.video_id;
                if (data.list) {
                    fullscreenData.listId = data.list;
                }
                ytcenter.player.listeners.fireEvent("onFullscreenChange", fullscreenData);
            }

            if (activated) {
                inTransitionTimer = uw.setTimeout(function(){ enterComplete(); inTransitionTimer = null; }, 50);
            } else {
                inTransitionTimer = uw.setTimeout(function(){ exitComplete(); inTransitionTimer = null; }, 500);
            }
        }
        window.dispatchEvent(ytcenter.utils.createCustomEvent("resize", "ytcenter"));
    }
    function onTransitionEndListener() {
        if (activated) {
            enterComplete();
        } else {
            exitComplete();
        }
    }
    function scroll(e, delta, deltaX, deltaY) {
        if (!enabled || inTransition) return;
        if (ytcenter.settingsPanelDialog && ytcenter.settingsPanelDialog.isVisible()) return;

        if (ytcenter.html5) {
            var playlistPlayerTray = document.getElementsByClassName("ytp-playlist-tray-container");

            if (playlistPlayerTray && playlistPlayerTray.length > 0 && playlistPlayerTray[0] && ytcenter.utils.isParent(playlistPlayerTray[0], e.target)) {
                return;
            }
        }

        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var pa = document.getElementById("player-api") || document.getElementById("player-api-legacy"),
            p = document.getElementById("player") || document.getElementById("player-api"),
            api = ytcenter.player.getAPI(),
            scrollUpExit = ytcenter.settings.topScrollPlayerScrollUpToExit;
        if (document.getElementById("player")) {
            document.getElementById("player").style.position = "";
        }
        if (activated) {
            if ((deltaY < 0 && !scrollUpExit) || (deltaY > 0 && scrollUpExit)) {
                if (ytcenter.settings.topScrollPlayerTimesToExit > count) {
                    exports.bumpCount();
                    count++;
                    //ytcenter.utils.scrollTop(scrollUpExit ? 1 : 0);
                } else {
                    //ytcenter.utils.scrollTop(1);
                    p.style.height = "";
                    ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-inverse");
                    ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
                    ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                    ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-static");
                    activated = false;
                    onTransitionEnd();
                    count = 0;
                    exports.stopTimer();
                    setTimeout(function(){ ytcenter.utils.scrollTop(0); }, 7);
                }
            } else if (scrollUpExit) {
                setTimeout(function(){ ytcenter.utils.scrollTop(0); }, 7);
                //ytcenter.utils.scrollTop(1);
            }
        } else {
            if (scrollTop === 0 && deltaY > 0) {
                if (ytcenter.settings.topScrollPlayerTimesToEnter > count) {
                    exports.bumpCount();
                    count++;
                } else {
                    if (ytcenter.settings.topScrollPlayerEnabledOnlyVideoPlaying && (!api || !api.getPlayerState || api.getPlayerState() !== 1)) {
                        return;
                    }
                    p.style.height = pa.style.height;
                    if (!ytcenter.settings.topScrollPlayerAnimation)
                        ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-disable-animation");
                    ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-player-pre");
                    if (scrollUpExit) ytcenter.utils.addClass(document.body, "ytcenter-scrolled-inverse");
                    activated = true;
                    onTransitionEnd();
                    count = 0;
                    exports.stopTimer();
                    setTimeout(function(){ ytcenter.utils.scrollTop(0); }, 7);
                }
            } else if (scrollTop === 0 && ytcenter.settings.topScrollPlayerCountIncreaseBefore) {
                exports.bumpCount();
                count++;
            }
        }
    }
    function addEventListeners() {
        if (throttleFunc) ytcenter.scrollEvent.removeEventListener(window, throttleFunc);
        throttleFunc = ytcenter.utils.throttle(scroll, throttleTimer);
        ytcenter.scrollEvent.addEventListener(window, throttleFunc);
    }
    function removeEventListener() {
        if (throttleFunc) ytcenter.scrollEvent.removeEventListener(window, throttleFunc);
        throttleFunc = null;
    }
    function setEnabled(a) {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        enabled = a;

        if (enabled && ytcenter.getPage() !== "watch") enabled = false;
        removeEventListener();

        if (!enabled) {
            if (elm && elm.parentNode) elm.parentNode.removeChild(elm);
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-inverse");
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-player-pre");
            ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-disable-animation");
        } else {
            addEventListeners();
            if (elm) {
                if (!elm.parentNode) {
                    document.body.insertBefore(elm, document.body.children[0]);
                }
            } else {
                elm = document.createElement("div");
                elm.className = "ytcenter-scrolled-top-element";
                document.body.insertBefore(elm, document.body.children[0]);
            }
        }
    }
    function enter() {
        p.style.height = pa.style.height;

        if (!ytcenter.settings.topScrollPlayerAnimation)
            ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-disable-animation");
        ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-player-pre");

        if (scrollUpExit) ytcenter.utils.addClass(document.body, "ytcenter-scrolled-inverse");

        activated = true;
        onTransitionEnd();

        count = 0;
        exports.stopTimer();
    }
    function exit() {
        p.style.height = "";
        ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-inverse");
        ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
        ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
        ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-static");

        activated = false;
        onTransitionEnd();

        count = 0;
        exports.stopTimer();
    }
    function setRedirectURL(url) {
        redirectURL = url;
    }
    function isActive() {
        return activated;
    }

    var exports = {};
    var count = 0;
    var activated = false;
    var enabled = null;
    var elm = null;
    var timer = null;
    var buffer = null;
    var throttleTimer = 50;
    var throttleFunc = null;
    var prev = null;
    var transitionEndListenerAdded = false;
    var inTransition = false;
    var inTransitionTimer = null;
    var redirectURL = null;

    exports.isActive = isActive;
    exports.setRedirectURL = setRedirectURL;
    exports.setEnabled = setEnabled;
    exports.bumpCount = function(){
        uw.clearTimeout(timer);
        timer = uw.setTimeout(function(){
            count = 0;
        }, ytcenter.settings.topScrollPlayerBumpTimer);
    };
    exports.stopTimer = function(){
        uw.clearTimeout(timer);
    };
    exports.setup = function(){
        if (elm && elm.parentNode) elm.parentNode.removeChild(elm);
        if (!elm) {
            elm = document.createElement("div");
            elm.className = "ytcenter-scrolled-top-element";
            if (ytcenter.settings.topScrollPlayerEnabled) document.body.insertBefore(elm, document.body.children[0]);
        }
        enabled = ytcenter.settings.topScrollPlayerEnabled;
        activated = ytcenter.settings.topScrollPlayerActivated;
        removeEventListener();

        if (enabled) {
            if (ytcenter.settings.topScrollPlayerEnabled && ytcenter.getPage() === "watch") {
                if (activated) {
                    if (!ytcenter.settings.topScrollPlayerAnimation)
                        ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-disable-animation");
                    if (ytcenter.settings.topScrollPlayerScrollUpToExit) ytcenter.utils.addClass(document.body, "ytcenter-scrolled-inverse");
                    ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top");
                    if (ytcenter.settings.topScrollPlayerHideScrollbar) {
                        ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                    } else {
                        ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                    }
                    //ytcenter.utils.scrollTop(ytcenter.settings.topScrollPlayerScrollUpToExit ? 1 : 0);
                } else {
                    ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
                    ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                    ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-disable-animation");
                    //ytcenter.utils.scrollTop(1);
                }
                addEventListeners();
            }
            if (document.getElementById("player")) {
                document.getElementById("player").style.position = "";
            }
        }
        exports.setEnabled(ytcenter.settings.topScrollPlayerEnabled);

        ytcenter.player.listeners.addEventListener("onStateChange", function(state){
            if (!enabled) return;

            var p = document.getElementById("player") || document.getElementById("player-api"),
                pa = document.getElementById("player-api") || document.getElementById("player-api-legacy"),
                api = ytcenter.player.getAPI(),
                scrollUpExit = ytcenter.settings.topScrollPlayerScrollUpToExit;

            if (state === 0 && ytcenter.settings.topScrollPlayerExitOnVideoEnd && activated) {
                p.style.height = "";
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-inverse");
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-static");

                activated = false;
                onTransitionEnd();

                count = 0;
                exports.stopTimer();
            } else if (state === 1 && ytcenter.settings.topScrollPlayerEnterOnVideoPlay && !activated) {
                enter();
            } else if (state === 2 && ytcenter.settings.topScrollPlayerExitOnVideoPause && activated) {
                exit();
            }
        });
        ytcenter.events.addEvent("settings-update", function(){
            exports.setEnabled(ytcenter.settings.topScrollPlayerEnabled);
            if (enabled) {
                if (document.getElementById("player")) {
                    document.getElementById("player").style.position = "";
                }
            }
        });
        ytcenter.events.addEvent("resize-update", function(){
            exports.setEnabled(ytcenter.settings.topScrollPlayerEnabled);
            if (enabled) {
                if (document.getElementById("player")) {
                    document.getElementById("player").style.position = "";
                }
            }
        });
    };

    return exports;
})();