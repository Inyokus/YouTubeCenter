/* Thumbnail enhancements (quality, (dis)like-counts, animation, ...) */

ytcenter.thumbnail = (function(){
    function getPlaylistVideoThumbs() {
        var pt = document.getElementById("watch7-playlist-tray"),
            pt2 = document.getElementById("guide"),
            pt3 = document.getElementById("watch-appbar-playlist"),
            a = [], b, i;
        if (pt) {
            b = pt.getElementsByClassName("video-thumb");
            for (i = 0; i < b.length; i++) {
                a.push(b[i]);
            }
        }
        if (pt2) {
            b = pt2.getElementsByClassName("video-thumb");
            for (i = 0; i < b.length; i++) {
                a.push(b[i]);
            }
        }
        if (pt3) {
            b = pt3.getElementsByClassName("video-thumb");
            for (i = 0; i < b.length; i++) {
                a.push(b[i]);
            }
        }
        return a;
    }
    function handleVideoThumbs(videoThumb, videoElement) {
        var maxIterations = 10;
        var linkRegex = /v=([a-zA-Z0-9-_]+)/;
        var linkRegex2 = /index=([0-9]+)/;
        var linkRegex3 = /video_ids=([0-9a-zA-Z-_%]+)/;
        var i = null;
        var a = null;
        var id = null;
        var data = null;
        var cacheData = null;
        var wrapper = null;
        var rgx = null;
        var index = null;

        if (videoElement.tagName === "A") {
            wrapper = videoElement;
        } else if (videoElement.parentNode.tagName === "A") {
            wrapper = videoElement.parentNode;
        } else {
            wrapper = null;
        }
        if (wrapper) {
            if (wrapper.href.match(linkRegex)) {
                rgx = linkRegex.exec(wrapper.href);
                if (rgx && rgx[1]) id = rgx[1];
                else return null;
                cacheData = getDataCacheById(id);
                data = {id: id, content: videoElement, wrapper: wrapper, videoThumb: videoThumb};
                if (cacheData) {
                    if (cacheData.stream) data.stream = cacheData.stream;
                    if (cacheData.likes) data.likes = cacheData.likes;
                    if (cacheData.dislikes) data.dislikes = cacheData.dislikes;
                }
            } else if (wrapper.href.match(linkRegex3)) {
                rgx = linkRegex2.exec(wrapper.href);
                if (rgx && rgx[1]) index = parseInt(rgx[1]);
                else index = 0;
                rgx = linkRegex3.exec(wrapper.href);
                if (rgx && rgx[1]) id = rgx[1];
                else return null;
                if (id.split("%2C").length > 0 && id.split("%2C")[index]) id = id.split("%2C")[index];
                else return null;
                cacheData = getDataCacheById(id);
                data = {id: id, content: videoElement, wrapper: wrapper, videoThumb: videoThumb};
                if (cacheData) {
                    if (cacheData.stream) data.stream = cacheData.stream;
                    if (cacheData.likes) data.likes = cacheData.likes;
                    if (cacheData.dislikes) data.dislikes = cacheData.dislikes;
                }
            }
            if (data) {
                a = wrapper;
                for (i = 0; i < maxIterations; i++) {
                    a = a.parentNode;
                    if (!a) break; // At the top of the tree
                    if (a.tagName === "LI") { // We found it guys. Great job.
                        data.itemWrapper = a;
                        break;
                    }
                }
                if (ytcenter.utils.hasClass(videoThumb, "yt-uix-simple-thumb-wrap")) {
                    data.content = videoThumb;
                }
                var img = videoThumb.getElementsByTagName("img");
                if (img && img.length > 0 && img[0]) {
                    data.thumbnailImage = img[0];
                }

                return data;
            }
        }
        return null;
    }
    function inArray_(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].wrapper === item.wrapper) {
                return true;
            }
        }
        return false;
    }
    function getVideoThumbs() {
        var userHeader = document.getElementById("watch7-user-header"); // Improved performance by moving this part out of the for loop
        var arr = ytcenter.utils.toArray(document.getElementsByClassName("video-thumb")).concat(ytcenter.utils.toArray(document.getElementsByClassName("yt-uix-simple-thumb-wrap")));
        var videos = [];
        var playlistVideoThumbs = getPlaylistVideoThumbs();
        var i;
        for (var i = 0, len = arr.length; i < len; i++) {
            if (ytcenter.utils.inArray(playlistVideoThumbs, arr[i]) || (userHeader && ytcenter.utils.isParent(userHeader, arr[i]))) continue;
            var data = handleVideoThumbs(arr[i], arr[i].parentNode);
            if (data && !inArray_(videos, data)) {
                videos.push(data);
            }
        }
        return videos;
    }
    function loadVideoConfig(item, callback) {
        if (item.stream && item.storyboard) {
            callback(item.stream, item.storyboard);
        } else {
            var spflink = true,
                url = "//www.youtube.com/watch?v=" + item.id + (spflink ? "&spf=navigate" : "");
            var headers = {};
            if (window.ytspf && window.ytspf.config && window.ytspf.config["experimental-request-headers"]) {
                headers = window.ytspf.config["experimental-request-headers"];
            }
            headers["X-SPF-previous"] = window.location.href;
            headers["X-SPF-referer"] = window.location.href;
            if (loc.href.indexOf("https://") === 0) {
                url = "https:" + url;
            } else {
                url = "http:" + url;
            }
            ytcenter.utils.xhr({
                url: url,
                method: "GET",
                headers: headers,
                onload: function(r){
                    var cfg = null;
                    var errorType = "unknown";
                    try {
                        try {
                            if (spflink) {
                                var parts = JSON.parse(r.responseText);

                                for (var i = 0, len = parts.length; i < len; i++) {
                                    var part = parts[i];
                                    if (part && part.data && part.data.swfcfg) {
                                        cfg = part.data.swfcfg;
                                        break;
                                    }
                                }

                                if (!cfg) throw "Player configurations not found in spf.";
                            } else {
                                cfg = r.responseText.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1].split(";</script>")[0];
                                cfg = JSON.parse(cfg);
                            }
                        } catch (e) {
                            con.error(e);
                            if (r.responseText.indexOf("flashvars=\"") !== -1) {
                                var a = r.responseText.split("flashvars=\"")[1].split("\"")[0].replace(/&amp;/g, "&").replace(/&quot;/g, "\"").split("&"),
                                    i, b;
                                cfg = {args: {}};
                                for (i = 0; i < a.length; i++) {
                                    b = a[i].split("=");
                                    cfg.args[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
                                }
                            } else if (r.responseText.indexOf("new yt.player.Application('p', {") !== -1) {
                                cfg = {};
                                cfg.args = r.responseText.split("new yt.player.Application('p', ")[1].split(");var fbetatoken")[0];
                                cfg.args = JSON.parse(cfg.args);
                            }
                        }
                        item.stream = ytcenter.player.getBestStream(ytcenter.parseStreams(cfg.args), (ytcenter.settings.videoThumbnailQualitySeparated ? (ytcenter.settings.dashPlayback ? 1 : 0) : -1));
                        if (!item.stream) {
                            if (cfg && cfg.args && cfg.args.ypc_module && cfg.args.ypc_vid) {
                                item.stream = {
                                    quality: "ondemand"
                                };
                            }
                        }
                        if (cfg && cfg.args) {
                            item.storyboard = cfg.args.storyboard_spec || cfg.args.live_storyboard_spec;
                        }
                        try {
                            delete item.stream.fallback_host;
                            delete item.stream.sig;
                            delete item.stream.flashVersion;
                            delete item.stream.url;
                        } catch (e) {
                            con.error(e);
                        }
                        try {
                            if (isInCache(item)) {
                                updateItemInCache(item);
                            } else {
                                addNewDataToCache(item);
                            }
                        } catch (e) {
                            con.error(e);
                        }
                        if (item.stream) {
                            callback(item.stream, item.storyboard);
                        } else {
                            callback("error", null, "Error!");
                        }
                    } catch (e) {
                        var msg = "";
                        if (e === "unavailable") {
                            msg = "Video Unavailable!";
                        } else {
                            if (r.responseText.indexOf("Too many") !== -1) {
                                msg = "Too many requests!";
                            } else {
                                msg = "Error!";
                                con.error(e);
                                con.error(cfg);
                                try {
                                    con.error(JSON.parse(r.responseText));
                                } catch (e) {
                                    con.error(r.responseText);
                                }
                            }
                        }
                        con.error("[VideoThumbnail Quality] IO Error => " + msg);
                        callback("error", null, msg);
                    }
                },
                onerror: function(){
                    var msg = "Connection failed!";
                    con.error("[VideoThumbnail Quality] IO Error => " + msg);
                    callback("error", null, msg);
                }
            });
        }
    }
    function loadRatings(items, callback) {
        var apikey = ytcenter.settings.google_apikey || "AIzaSyCO5gfGpEiqmc8XTknN9RyC3TCJz1-XyAI";
        var ids = [];
        var ids_item = [];

        var pendingItems = [];

        for (var i = 0; i < items.length; i++) {
            if (!items[i].processing && !ytcenter.utils.inArray(processedVideoIds, items[i].id)) {
                if ((!items[i].likes || !items[i].dislikes)) {
                    processedVideoIds.push(items[i].id);
                    items[i].processing = true;
                    ids_item.push(items[i]);
                    ids.push(items[i].id);
                }
                pendingItems.push(items[i]);
            }
        }

        if (ids.length > 0) {
            var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics&id=" + encodeURIComponent(ids.join(",")) + "&key=" + encodeURIComponent(apikey);
            ytcenter.utils.browser_xhr({
                url: url,
                method: "GET",
                onload: function(detail){
                    try {
                        var data = JSON.parse(detail.responseText);
                        for (var i = 0; i < data.items.length; i++) {
                            try {
                                var statistics = data.items[i].statistics;

                                var index = ytcenter.utils.indexOf_(ids, data.items[i].id);
                                var item = ids_item[index];

                                item.likes = parseInt(statistics ? statistics.likeCount : 0);
                                item.dislikes = parseInt(statistics ? statistics.dislikeCount : 0);

                                if (isInCache(item)) {
                                    updateItemInCache(item);
                                } else {
                                    addNewDataToCache(item);
                                }
                            } catch (e) {
                                con.error("Internal error", e);
                            }
                        }
                        callback(pendingItems);
                    } catch (e) {
                        var msg = "";
                        if (e === "unavailable") {
                            msg = "Unavailable!";
                        } else {
                            if (r.responseText.indexOf("<errors xmlns='http://schemas.google.com/g/2005'><error><domain>GData</domain>") === 0) {
                                msg = "Error!";
                                if (r.responseText.indexOf("<internalReason>") !== -1 && r.responseText.indexOf("</internalReason>") !== -1) {
                                    msg = ytcenter.utils.unescapeXML(r.responseText.split("<internalReason>")[1].split("</internalReason>")[0]) + "!";
                                }
                            } else if (r.responseText.indexOf("<code>too_many_recent_calls</code>") !== -1 && r.responseText.indexOf("<domain>yt:quota</domain>") !== -1) {
                                msg = "Too many requests!";
                            } else {
                                msg = "Error!";
                                con.error(e);
                                try {
                                    con.error(JSON.parse(r.responseText));
                                } catch (e) {
                                    con.error(r.responseText);
                                }
                            }
                        }
                        con.error("[VideoThumbnail Ratings] IO Error => " + msg);
                        callback("error", msg);
                    }
                },
                onerror: function(){
                    var msg = "Connection failed!";
                    con.error("[VideoThumbnail Quality] IO Error => " + msg);
                    callback("error", msg);
                }
            });
        } else {
            callback(pendingItems);
        }
    }
    function loadVideoData(item, callback) {
        if (item.likes && item.dislikes) {
            callback(item.likes, item.dislikes);
        } else if (item.id) {
            var apikey = ytcenter.settings.google_apikey || "AIzaSyCO5gfGpEiqmc8XTknN9RyC3TCJz1-XyAI";
            var url = "https://www.googleapis.com/youtube/v3/videos?part=statistics&id=" + encodeURIComponent(item.id) + "&key=" + encodeURIComponent(apikey);

            ytcenter.utils.browser_xhr({
                url: url,
                method: "GET",
                onload: function(r){
                    try {
                        if (!r.responseText) throw "unavailable";
                        var videoData = JSON.parse(r.responseText).items[0];
                        var statistics = videoData.statistics;
                        item.likes = parseInt(statistics ? statistics.likeCount : 0);
                        item.dislikes = parseInt(statistics ? statistics.dislikeCount : 0);

                        if (isInCache(item)) {
                            updateItemInCache(item);
                        } else {
                            addNewDataToCache(item);
                        }
                        callback(item.likes, item.dislikes);
                    } catch (e) {
                        var msg = "";
                        if (e === "unavailable") {
                            msg = "Unavailable!";
                        } else {
                            if (r.responseText.indexOf("<errors xmlns='http://schemas.google.com/g/2005'><error><domain>GData</domain>") === 0) {
                                msg = "Error!";
                                if (r.responseText.indexOf("<internalReason>") !== -1 && r.responseText.indexOf("</internalReason>") !== -1) {
                                    msg = ytcenter.utils.unescapeXML(r.responseText.split("<internalReason>")[1].split("</internalReason>")[0]) + "!";
                                }
                            } else if (r.responseText.indexOf("<code>too_many_recent_calls</code>") !== -1 && r.responseText.indexOf("<domain>yt:quota</domain>") !== -1) {
                                msg = "Too many requests!";
                            } else {
                                msg = "Error!";
                                con.error(e);
                                try {
                                    con.error(JSON.parse(r.responseText));
                                } catch (e) {
                                    con.error(r.responseText);
                                }
                            }
                        }
                        con.error("[VideoThumbnail Ratings] IO Error => " + msg);
                        callback("error", msg);
                    }
                },
                onerror: function(){
                    var msg = "Connection failed!";
                    con.error("[VideoThumbnail Quality] IO Error => " + msg);
                    callback("error", msg);
                }
            });
        }
    }
    function appendRatingBar(item, likes, dislikes) {
        try {
            var total = likes + dislikes,
                sparkBars = document.createElement("div"),
                sparkBarLikes = document.createElement("div"),
                sparkBarDislikes = document.createElement("div"),
                barLength;
            sparkBars.className = "video-extras-sparkbars"
                + (ytcenter.settings.videoThumbnailRatingsBarVisible === "show_hover" ? " ytcenter-video-thumb-show-hover" : "")
                + (ytcenter.settings.videoThumbnailRatingsBarVisible === "hide_hover" ? " ytcenter-video-thumb-hide-hover" : "");
            sparkBars.style.height = ytcenter.settings.videoThumbnailRatingsBarHeight + "px";
            if (!ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-fluid") && item.videoThumb.className.match(/yt-thumb-[0-9]+/)) {
                barLength = /yt-thumb-([0-9]+)/.exec(item.videoThumb.className)[1] + "px";
            } else if (item.videoThumb.style.width && parseInt(item.videoThumb.style.width) > 0) {
                barLength = item.videoThumb.style.width;
            } else {
                barLength = "100%";
            }
            sparkBarLikes.className = "video-extras-sparkbar-likes";
            sparkBarLikes.style.background = ytcenter.settings.videoThumbnailRatingsBarLikesColor;
            sparkBarLikes.style.height = ytcenter.settings.videoThumbnailRatingsBarHeight + "px";

            sparkBarDislikes.className = "video-extras-sparkbar-dislikes";
            sparkBarDislikes.style.height = ytcenter.settings.videoThumbnailRatingsBarHeight + "px";
            if (likes === "error") {
                sparkBarDislikes.style.background = "#BF3EFF";
                total = 1;
                likes = 0;
                dislikes = 1;
            } else if (total > 0) {
                sparkBarDislikes.style.background = ytcenter.settings.videoThumbnailRatingsBarDislikesColor;
            } else {
                sparkBarDislikes.style.background = ytcenter.settings.videoThumbnailRatingsBarDefaultColor;
                likes = 0;
                dislikes = 1;
                total = 1;
            }

            sparkBars.appendChild(sparkBarLikes);
            sparkBars.appendChild(sparkBarDislikes);

            sparkBars.style.position = "absolute";
            switch (ytcenter.settings.videoThumbnailRatingsBarPosition) {
                case "top":
                    sparkBars.style.top = "0px";
                    sparkBars.style.left = "0px";

                    sparkBarLikes.style.width = (likes/total*100) + "%";
                    sparkBarDislikes.style.width = (dislikes/total*100) + "%";
                    sparkBars.style.width = barLength;
                    break;
                case "bottom":
                    sparkBars.style.bottom = "0px";
                    sparkBars.style.left = "0px";

                    sparkBarLikes.style.width = (likes/total*100) + "%";
                    sparkBarDislikes.style.width = (dislikes/total*100) + "%";
                    sparkBars.style.width = barLength;
                    break;
                case "left":
                    sparkBars.style.top = "0px";
                    sparkBars.style.left = "0px";

                    sparkBarLikes.style.height = (likes/total*100) + "%";
                    sparkBarDislikes.style.height = (dislikes/total*100) + "%";
                    sparkBarLikes.style.width = "2px";
                    sparkBarDislikes.style.width = "2px";
                    sparkBarLikes.style.cssFloat = "none";
                    sparkBarDislikes.style.cssFloat = "none";
                    sparkBars.style.height = "100%";
                    break;
                case "right":
                    sparkBars.style.top = "0px";
                    sparkBars.style.right = "0px";

                    sparkBarLikes.style.height = (likes/total*100) + "%";
                    sparkBarDislikes.style.height = (dislikes/total*100) + "%";
                    sparkBarLikes.style.width = "2px";
                    sparkBarDislikes.style.width = "2px";
                    sparkBarLikes.style.cssFloat = "none";
                    sparkBarDislikes.style.cssFloat = "none";
                    sparkBars.style.height = "100%";
                    break;
            }
            item.content.appendChild(sparkBars);
        } catch (e) {
            con.error("[Id=" + item.id + "] Likes: " + likes + ", " + dislikes);
            con.error(e);
        }
    }
    function appendRatingCount(item, likes, dislikes) {
        try {
            var numLikesDislikes = document.createElement("span"),
                likesCount = document.createElement("span"),
                dislikesCount = document.createElement("span"),
                likeIcon = document.createElement("div"),
                dislikeIcon = document.createElement("div");
            numLikesDislikes.className = "video-extras-likes-dislikes"
                + (ytcenter.settings.videoThumbnailRatingsCountVisible === "show_hover" ? " ytcenter-video-thumb-show-hover" : "")
                + (ytcenter.settings.videoThumbnailRatingsCountVisible === "hide_hover" ? " ytcenter-video-thumb-hide-hover" : "")
                + " ytcenter-thumbnail-ratingcount";
            numLikesDislikes.style.background = "#000";
            numLikesDislikes.style.opacity = "0.75";
            numLikesDislikes.style.filter = "alpha(opacity=75)";
            numLikesDislikes.style.padding = "0 4px";
            numLikesDislikes.style.lineHeight = "14px";
            numLikesDislikes.style.fontWeight = "bold";
            numLikesDislikes.style.zoom = "1";
            if (likes === "error") {
                numLikesDislikes.style.color = "#fff";
                numLikesDislikes.style.verticalAlign = "middle";
                numLikesDislikes.style.fontSize = "11px";
                numLikesDislikes.appendChild(document.createTextNode(dislikes));
            } else {
                likesCount.className = "likes-count";
                likesCount.style.marginRight = "4px";
                likesCount.style.color = "#fff";
                likesCount.style.verticalAlign = "middle";
                likesCount.style.fontSize = "11px";
                likesCount.textContent = ytcenter.utils.number1000Formating(likes);
                dislikesCount.className = "dislikes-count";
                dislikesCount.style.color = "#fff";
                dislikesCount.style.verticalAlign = "middle";
                dislikesCount.style.fontSize = "11px";
                dislikesCount.textContent = ytcenter.utils.number1000Formating(dislikes);

                if (ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-120") || ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-106")) {
                    likesCount.style.fontSize = "11px";
                    dislikesCount.style.fontSize = "11px";
                }

                likeIcon.className = "ytcenter-icon-thumbs-like"; // icon-watch-stats-like
                likeIcon.setAttribute("alt", "Like");
                likeIcon.style.position = "relative";
                likeIcon.style.marginRight = "2px";
                likeIcon.style.marginTop = "4px";
                likeIcon.style.top = "-2px";
                likeIcon.style.verticalAlign = "middle";
                dislikeIcon.className = "ytcenter-icon-thumbs-dislike"; // icon-watch-stats-dislike
                dislikeIcon.setAttribute("alt", "Dislike");
                dislikeIcon.style.position = "relative";
                dislikeIcon.style.marginRight = "2px";
                dislikeIcon.style.marginTop = "4px";
                dislikeIcon.style.top = "-2px";
                dislikeIcon.style.verticalAlign = "middle";

                numLikesDislikes.appendChild(likeIcon);
                numLikesDislikes.appendChild(likesCount);
                numLikesDislikes.appendChild(dislikeIcon);
                numLikesDislikes.appendChild(dislikesCount);
            }

            numLikesDislikes.style.position = "absolute";
            item.content.className += " ytcenter-thumbnail-ratingcount-pos-" + ytcenter.settings.videoThumbnailRatingsCountPosition;
            item.content.appendChild(numLikesDislikes);
        } catch (e) {
            con.error("[Id=" + item.id + "] Likes: " + likes + ", " + dislikes);
            con.error(e);
        }
    }
    var addedThumbnails = [];
    function appendAnimatedThumbnail(item, storyboard, errorMessage) {
        function preload(images) {
            var i, img;
            for (i = 0; i < images.length; i++) {
                img = new Image();
                img.src = images[i];
            }
        }
        function preloadNextMosaic(frame) {
            if (level) {
                var nextMosaic = level.getMosaic(frame) + 1;
                if (preloadURLS.length <= nextMosaic || nextMosaic < 0) {
                    nextMosaic = 0;
                }
                if (!preloaded[nextMosaic]) {
                    preload([preloadURLS[nextMosaic]]);
                    con.log("[Animated Thumbnail] Preloaded " + preloadURLS[nextMosaic]);
                    preloaded[nextMosaic] = true;
                }
            } else {
                frame += 1;
                if (frame > 3 || frame < 1) frame = 1;
                if (!preloadedDefaultImgs[frame - 1]) {
                    preload([urlTemplate.replace("$N", frame)]);
                    con.log("[Animated Thumbnail] Preloaded " + urlTemplate.replace("$N", frame));
                    preloadedDefaultImgs[frame - 1] = true;
                }
            }
        }
        function mouseover() {
            function moi() {
                if (level) {
                    a.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
                    a.parentNode.style.backgroundColor = "#000000";

                    if (frame >= level.frames) frame = 0;
                    rect = level.getRect(frame, box);
                    a.style.width = rect.width + "px";
                    a.style.height = rect.height + "px";
                    a.style.top = "0px";
                    a.style.backgroundSize = rect.imageWidth + "px " + rect.imageHeight + "px";
                    a.style.backgroundImage = "URL(" + level.getURL(frame) + ")";
                    a.style.backgroundPosition = -rect.x + "px " + -rect.y + "px";

                    preloadNextMosaic(frame);
                } else {
                    if (frame > 3 || frame < 1) frame = 1;
                    a.src = urlTemplate.replace("$N", frame);

                    preloadNextMosaic(frame);
                }
                if (ytcenter.settings.videoThumbnailAnimationShuffle) {
                    if (level) {
                        frame = Math.round(Math.random()*(level.frames - 1));
                    } else {
                        frame = Math.round(Math.random()*2) + 1;
                    }
                } else {
                    frame++;
                }
            }
            preloadNextMosaic(frame - 1);
            timer2 = uw.setTimeout(function(){
                if (level) {
                    timer = uw.setInterval(moi, ytcenter.settings.videoThumbnailAnimationInterval);
                } else {
                    urlTemplate = originalImage.replace(/\/(mq)?default\.jpg$/, "/$N.jpg");
                    timer = uw.setInterval(moi, ytcenter.settings.videoThumbnailAnimationFallbackInterval);
                }
                moi();
            }, ytcenter.settings.videoThumbnailAnimationDelay);
        }
        function mouseout() {
            uw.clearInterval(timer);
            uw.clearTimeout(timer2);
            a.src = originalImage;
            a.style.backgroundSize = "";
            a.style.backgroundImage = "";
            a.style.backgroundPosition = "";
            a.style.width = "";
            a.style.height = "";
            a.style.top = "";
            a.parentNode.style.backgroundColor = "";
            frame = 0;
        }
        if (item && item.wrapper) {
            if (ytcenter.utils.inArray(addedThumbnails, item.wrapper)) {
                return;
            } else {
                addedThumbnails.push(item.wrapper);
            }
        } else {
            return;
        }
        try {
            var a = item.wrapper.getElementsByTagName("img")[0],
                b = ytcenter.player.parseThumbnailStream(storyboard || ""),
                originalImage = a.getAttribute("data-thumb") || a.src,
                timer, timer2, frame = 0, level, i, urlTemplate,
                box = { width: a.offsetWidth, height: 0 }, rect,
                preloaded = [], preloadURLS = null, preloadedDefaultImgs = [false, false, false];
            if (b.levels.length > 0) {
                for (i = 0; i < b.levels.length; i++) {
                    if (!level) level = b.levels[i];
                    else if (b.levels[i].width > level.width)
                        level = b.levels[i];
                }
            }
            if (level) {
                preloadURLS = level.getURLS();
                for (i = 0; i < preloadURLS.length; i++) {
                    preloaded.push(false);
                }
            } else {
                urlTemplate = originalImage.replace(/\/(mq)?default\.jpg$/, "/$N.jpg");
            }
            if (item.mouseover) {
                mouseover();
            } else {
                mouseout();
            }
            ytcenter.utils.addEventListener(item.wrapper, "mouseover", mouseover, false);
            ytcenter.utils.addEventListener(item.wrapper, "mouseout", mouseout, false);
        } catch (e) {
            con.error(e);
        }
    }
    function appendQuality(item, stream, errorMessage) {
        var tableQuality = {
                "error": errorMessage,
                "auto": errorMessage,
                "ondemand": "OnDemand",
                "tiny": "144p",
                "small": "240p",
                "medium": "360p",
                "large": "480p",
                "hd720": "720p",
                "hd1080": "1080p",
                "hd1440": "1440p",
                "highres": "1080p+"
            },
            tableBackground = {
                "error": "#b00",
                "auto": "#b00",
                "ondemand": "#aaa",
                "tiny": "#7e587e",
                "small": "#aaa",
                "medium": "#0aa",
                "large": "#00f",
                "hd720": "#0a0",
                "hd1080": "#f00",
                "hd1440": "#000",
                "highres": "#000"
            },
            tableColor = {
                "error": "#fff",
                "auto": "#fff",
                "ondemand": "#fff",
                "tiny": "#fff",
                "small": "#fff",
                "medium": "#fff",
                "large": "#fff",
                "hd720": "#fff",
                "hd1080": "#fff",
                "hd1440": "#fff",
                "highres": "#fff"
            },
            text, background, color, wrapper = document.createElement("span");
        if (stream === null) {
            text = tableQuality["error"];
            background = tableBackground["error"];
            color = tableColor["error"];
        } else if (stream === "error") {
            text = tableQuality[stream];
            background = tableBackground[stream];
            color = tableColor[stream];
        } else if (stream && stream.quality === "ondemand") {
            text = tableQuality[stream.quality];
            background = tableBackground[stream.quality];
            color = tableColor[stream.quality];
        } else if (stream && stream.quality && stream.dimension) {
            text = stream.dimension.split("x")[1] + "p";
            background = tableBackground[stream.quality];
            color = tableColor[stream.quality];
        } else if (stream && stream.size) {
            var quality = ytcenter.player.convertDimensionToQuality(stream.size);
            text = stream.size.split("x")[1] + "p";
            background = tableBackground[quality];
            color = tableColor[quality];
        }

        if (ytcenter.settings.videoThumbnailQualityFPS && stream && stream !== "error") {
            var fps = stream.fps || "30";
            text += "@" + fps;
        }


        wrapper.className = (ytcenter.settings.videoThumbnailQualityVisible === "show_hover" ? " ytcenter-video-thumb-show-hover" : "")
            + (ytcenter.settings.videoThumbnailQualityVisible === "hide_hover" ? " ytcenter-video-thumb-hide-hover" : "")
            + " ytcenter-thumbnail-quality";
        wrapper.textContent = text;
        item.content.className += " ytcenter-thumbnail-quality-pos-" + ytcenter.settings.videoThumbnailQualityPosition;

        wrapper.style.background = background;
        wrapper.style.color = color;

        item.content.appendChild(wrapper);
    }
    function updateWatchedClass(item) {
        var watched = ytcenter.utils.hasClass(item.content, "watched"),
            am, li, s;
        if (item.itemWrapper && watched) {
            ytcenter.utils.addClass(item.itemWrapper, "ytcenter-video-watched-wrapper"); // For hiding the item
        } else if (item.itemWrapper) {
            ytcenter.utils.removeClass(item.itemWrapper, "ytcenter-video-watched-wrapper"); // For hiding the item
        }
        if (loc.pathname === "/feed/subscriptions" && !item.actionMenu) {
            item.actionMenu = item.wrapper.parentNode.parentNode.parentNode.parentNode.parentNode.nextElementSibling;
            if (item.actionMenu) {
                am = item.actionMenu.getElementsByTagName("ul")[0];
                li = document.createElement("li");
                li.setAttribute("role", "menuitem");
                s = document.createElement("span");
                s.className = "dismiss-menu-choice yt-uix-button-menu-item";
                s.setAttribute("onclick", ";return false;");
                if (ytcenter.videoHistory.isVideoWatched(item.id)) {
                    s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_REMOVE");
                } else {
                    s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_ADD");
                }
                ytcenter.utils.addEventListener(li, "click", function(){
                    if (ytcenter.videoHistory.isVideoWatched(item.id)) {
                        ytcenter.videoHistory.removeVideo(item.id);
                        s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_ADD");
                    } else {
                        ytcenter.videoHistory.addVideo(item.id);
                        s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_REMOVE");
                    }
                    updateWatchedMessage(item);
                }, false);

                li.appendChild(s);
                am.insertBefore(li, am.children[0]);
                ytcenter.events.addEvent("language-refresh", function(){
                    if (ytcenter.videoHistory.isVideoWatched(item.id)) {
                        s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_REMOVE");
                    } else {
                        s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_ADD");
                    }
                });
            }
        }
    }

    function updateWatchedMessage(item) {
        var ivw = ytcenter.videoHistory.isVideoWatched(item.id),
            watchedElement;
        if (ivw) {
            watchedElement = document.createElement("div");
            if (item.content.getElementsByClassName("watched-message").length === 0
                && item.content.getElementsByClassName("watched-badge").length === 0) {
                //watchedElement.className = "watched-message";
                watchedElement.className = "watched-badge";
                watchedElement.textContent = ytcenter.language.getLocale("SETTINGS_WATCHED");
                ytcenter.language.addLocaleElement(watchedElement, "SETTINGS_WATCHED", "@textContent");
                item.content.insertBefore(watchedElement, item.content.children[1]);
            }
            ytcenter.utils.addClass(item.content, "watched");
        } else {
            ytcenter.utils.removeClass(item.content, "watched");
            if (item.itemWrapper) ytcenter.utils.removeClass(item.itemWrapper, "ytcenter-video-watched-wrapper");
        }
    }
    function getChannelBubble(item) {
        var elm = null;
        if (item.itemWrapper) {
            elm = item.itemWrapper.getElementsByTagName("a");
            if (elm && elm.length > 0) {
                elm = elm[0];
            } else {
                elm = null;
            }
        }
        return elm;
    }
    function getChannelName(wrapper) {
        var elm = null;
        if (wrapper) {
            elm = wrapper.getElementsByTagName("img");
            if (elm && elm.length > 0) {
                elm = elm[0];
            }
        }
        if (elm) {
            elm = elm.getAttribute("alt");
        }
        return elm;
    }
    function convertChannelBubble(elm) {
        if (elm) {
            elm.textContent = getChannelName(elm);
            elm.className = elm.className.replace("feed-author-bubble", "");
        }
        return elm;
    }
    function isInSubscription(item) {
        var feed = document.getElementById("feed"),
            children = feed.getElementsByClassName("video-thumb"),
            i;

        for (i = 0; i < children.length; i++) {
            if (children[i] === item.videoThumb) {
                return true;
            }
        }

        return false;
    }
    function processItemHeavyLoad(item) {
        if (!ytcenter.settings.videoThumbnailQualityBar && !ytcenter.settings.videoThumbnailAnimationEnabled) return;
        if (ytcenter.settings.videoThumbnailQualityDownloadAt === "scroll_into_view") {
            ytcenter.domEvents.addEvent(item.wrapper, "enterview", function(){
                loadVideoConfig(item, function(stream, storyboard, errorMessage){
                    if (ytcenter.settings.videoThumbnailQualityBar)
                        appendQuality(item, stream, errorMessage);
                    if (ytcenter.settings.videoThumbnailAnimationEnabled)
                        appendAnimatedThumbnail(item, storyboard, errorMessage);
                });
            }, true);
        } else if (ytcenter.settings.videoThumbnailQualityDownloadAt === "hover_thumbnail") {
            ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
                var added = false;
                return function(){
                    if (added) return;
                    added = true;
                    loadVideoConfig(item, function(stream, storyboard, errorMessage){
                        if (ytcenter.settings.videoThumbnailQualityBar)
                            appendQuality(item, stream, errorMessage);
                        if (ytcenter.settings.videoThumbnailAnimationEnabled)
                            appendAnimatedThumbnail(item, storyboard, errorMessage);
                    });
                };
            })(), false);
        } else {
            loadVideoConfig(item, function(stream, storyboard, errorMessage){
                if (ytcenter.settings.videoThumbnailQualityBar)
                    appendQuality(item, stream, errorMessage);
                if (ytcenter.settings.videoThumbnailAnimationEnabled) {
                    ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
                        var added = false;
                        return function(){
                            if (added) return;
                            added = true;
                            appendAnimatedThumbnail(item, storyboard, errorMessage);
                        };
                    })(), false);
                }
            });
        }
    }
    function processItems(items) {
        if (!items || items.length === 0) return;
        if (!ytcenter.settings.videoThumbnailRatingsCount && !ytcenter.settings.videoThumbnailRatingsBar) return;
        var options = [ "hover_thumbnail", "scroll_into_view", "page_start" ];
        var optionIndex = -1;
        if (ytcenter.settings.videoThumbnailRatingsBar) {
            optionIndex = Math.max(ytcenter.utils.indexOf_(options, ytcenter.settings.videoThumbnailRatingsBarDownloadAt), optionIndex);
        }
        if (ytcenter.settings.videoThumbnailRatingsCount) {
            optionIndex = Math.max(ytcenter.utils.indexOf_(options, ytcenter.settings.videoThumbnailRatingsCountDownloadAt), optionIndex);
        }

        if (optionIndex === -1) return;

        var option = options[optionIndex];
        var countEnabled = ytcenter.settings.videoThumbnailRatingsCount;
        var barEnabled = ytcenter.settings.videoThumbnailRatingsBar;

        if (option === "page_start") {
            loadRatings(items, function(items){
                for (var i = 0; i < items.length; i++) {
                    if (countEnabled) {
                        appendRatingCount(items[i], items[i].likes, items[i].dislikes);
                    }
                    if (barEnabled) {
                        appendRatingBar(items[i], items[i].likes, items[i].dislikes);
                    }
                }
            });
        } else if (option === "scroll_into_view") {
            ytcenter.domEvents.addEvent(items.slice(), "enterview", function(items){
                loadRatings(items, function(items){
                    for (var i = 0; i < items.length; i++) {
                        if (countEnabled) {
                            appendRatingCount(items[i], items[i].likes, items[i].dislikes);
                        }
                        if (barEnabled) {
                            appendRatingBar(items[i], items[i].likes, items[i].dislikes);
                        }
                    }
                });
            }, true);
        } else if (option === "hover_thumbnail") {
            for (var i = 0; i < items.length; i++) {
                ytcenter.utils.addEventListener(items[i].wrapper, "mouseover", (function(item){
                    var fn = function(){
                        ytcenter.utils.removeEventListener(item.wrapper, "mouseover", fn, false);

                        loadVideoData(item, function(likes, dislikes){
                            if (countEnabled) {
                                appendRatingCount(item, likes, dislikes);
                            }
                            if (barEnabled) {
                                appendRatingBar(item, likes, dislikes);
                            }
                        });
                    };
                    return fn;
                })(items[i]), false);
            }
        }
    }

    function processItem(item) {
        if (!ytcenter.settings.videoThumbnailRatingsCount && !ytcenter.settings.videoThumbnailRatingsBar) return;
        var options = [ "hover_thumbnail", "scroll_into_view", "page_start" ];
        var optionIndex = -1;
        if (ytcenter.settings.videoThumbnailRatingsBar) {
            optionIndex = Math.max(ytcenter.utils.indexOf_(options, ytcenter.settings.videoThumbnailRatingsBarDownloadAt), optionIndex);
        }
        if (ytcenter.settings.videoThumbnailRatingsCount) {
            optionIndex = Math.max(ytcenter.utils.indexOf_(options, ytcenter.settings.videoThumbnailRatingsCountDownloadAt), optionIndex);
        }

        if (optionIndex === -1) return;

        var option = options[optionIndex];
        var countEnabled = ytcenter.settings.videoThumbnailRatingsCount;
        var barEnabled = ytcenter.settings.videoThumbnailRatingsBar;

        if (option === "page_start") {
            loadVideoData(item, function(likes, dislikes){
                if (countEnabled) {
                    appendRatingCount(item, likes, dislikes);
                }
                if (barEnabled) {
                    appendRatingBar(item, likes, dislikes);
                }
            });
        } else if (option === "scroll_into_view") {
            ytcenter.domEvents.addEvent(item.wrapper, "enterview", function(){
                loadVideoData(item, function(likes, dislikes){
                    if (countEnabled) {
                        appendRatingCount(item, likes, dislikes);
                    }
                    if (barEnabled) {
                        appendRatingBar(item, likes, dislikes);
                    }
                });
            }, true);
        } else if (option === "hover_thumbnail") {
            ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
                var added = false;
                return function(){
                    if (added) return;
                    added = true;
                    loadVideoData(item, function(likes, dislikes){
                        if (countEnabled) {
                            appendRatingCount(item, likes, dislikes);
                        }
                        if (barEnabled) {
                            appendRatingBar(item, likes, dislikes);
                        }
                    });
                };
            })(), false);
        } else {
            con.error("Unknown option for video thumbnail", option);
        }
    }
    function compareDifference(newData, oldData) {
        function inArray(arr, item) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].wrapper === item.wrapper) {
                    return true;
                }
            }
            return false;
        }
        var arr = [];
        for (var i = 0, len = newData.length; i < len; i++) {
            if (!inArray(oldData, newData[i])) {
                arr.push(newData[i]);
            }
        }
        return arr;
    }
    function updateItemInCache(data) {
        var index = getDataCacheIndex(data);
        if (data.stream && !ytcenter.settings.videoThumbnailData[index].stream) {
            ytcenter.settings.videoThumbnailData[index].stream = data.stream;
        }
        if (data.storyboard && !ytcenter.settings.videoThumbnailData[index].storyboard) {
            ytcenter.settings.videoThumbnailData[index].storyboard = data.storyboard;
        }
        if (data.likes && data.dislikes && !ytcenter.settings.videoThumbnailData[index].likes && !ytcenter.settings.videoThumbnailData[index].dislikes) {
            ytcenter.settings.videoThumbnailData[index].likes = data.likes;
            ytcenter.settings.videoThumbnailData[index].dislikes = data.dislikes;
        }
        ytcenter.saveSettings();
    }
    function updateReuse(data) {
        var index = getDataCacheIndex(data);
        if (index === -1) return;
        ytcenter.settings.videoThumbnailData[index].reused++;
        if (ytcenter.settings.videoThumbnailData[index].reused > 5)
            ytcenter.settings.videoThumbnailData[index].reused = 5;
        ytcenter.saveSettings();
    }
    function getDataCacheById(id) {
        var i;
        for (i = 0; i < ytcenter.settings.videoThumbnailData.length; i++) {
            if (id === ytcenter.settings.videoThumbnailData[i].id) return ytcenter.settings.videoThumbnailData[i];
        }
        return null;
    }
    function getDataCacheIndex(data) {
        var i;
        for (i = 0; i < ytcenter.settings.videoThumbnailData.length; i++) {
            if (data.id === ytcenter.settings.videoThumbnailData[i].id) return i;
        }
        return -1;
    }
    function isInCache(data) {
        return getDataCacheIndex(data) !== -1;
    }
    function addNewDataToCache(data) {
        if (isInCache(data)) return;
        var nData = {};
        while (ytcenter.settings.videoThumbnailData.length >= ytcenter.settings.videoThumbnailCacheSize) removeOldestFromCache();
        nData.id = data.id;
        nData.reused = 0;
        nData.date = ytcenter.utils.now();
        if (data.stream) nData.stream = data.stream;
        if (data.storyboard) nData.storyboard = data.storyboard;
        if (data.likes) nData.likes = data.likes;
        if (data.dislikes) nData.dislikes = data.dislikes;

        ytcenter.settings.videoThumbnailData.push(nData);

        ytcenter.saveSettings();
    }
    function calculateCacheLife(data) {
        return 1000*60*10 + (1000*60*5)*(data.reused ? data.reused : 0);
    }
    function removeOldestFromCache() {
        if (ytcenter.settings.videoThumbnailData.length === 0) return;
        var i, now = ytcenter.utils.now(), life, lifeRemaining, oldest = ytcenter.settings.videoThumbnailData[0], j = 0;
        for (i = 1; i < ytcenter.settings.videoThumbnailData.length; i++) {
            life = calculateCacheLife(ytcenter.settings.videoThumbnailData[i]);
            lifeRemaining = (ytcenter.settings.videoThumbnailData[i].date + life) - now;
            if (lifeRemaining < (oldest.date + calculateCacheLife(oldest)) - now) {
                oldest = ytcenter.settings.videoThumbnailData[i];
                j = i;
            }
        }
        ytcenter.settings.videoThumbnailData.splice(j, 1);
    }
    function cacheChecker() {
        if (ytcenter.settings.videoThumbnailData.length === 0) return;
        var i, now = ytcenter.utils.now(), life, nData = [];

        for (i = 0; i < ytcenter.settings.videoThumbnailData.length; i++) {
            life = calculateCacheLife(ytcenter.settings.videoThumbnailData[i]);
            if (now < ytcenter.settings.videoThumbnailData[i].date + life) {
                if (ytcenter.settings.videoThumbnailData[i].reused < 5) ytcenter.settings.videoThumbnailData[i].reused++;
                nData.push(ytcenter.settings.videoThumbnailData[i]);
            }
        }
        ytcenter.settings.videoThumbnailData = nData;
        ytcenter.saveSettings();
    }
    var exports = {}, videoThumbs = [], observer = null, observer2 = null;
    exports.update = function(){
        ytcenter.gridview.update();
        ytcenter.videoHistory.loadWatchedVideosFromYouTubePage();
        ytcenter.channelPlaylistLinks.update();

        var vt = compareDifference(getVideoThumbs(), videoThumbs), i;
        processItems(vt);
        for (i = 0; i < vt.length; i++) {
            ytcenter.utils.addEventListener(vt[i].wrapper, "mouseover", (function(item){
                return function(){ item.mouseover = true; };
            })(vt[i]), false);
            ytcenter.utils.addEventListener(vt[i].wrapper, "mouseout", (function(item){
                return function(){ item.mouseover = false; };
            })(vt[i]), false);
            videoThumbs.push(vt[i]);
            updateReuse(vt[i]);

            // TODO make it load with scrolling.
            /*if (vt[i].thumbnailImage && vt[i].thumbnailImage.hasAttribute("data-thumb")) {
             vt[i].thumbnailImage.src = vt[i].thumbnailImage.getAttribute("data-thumb");
             }*/

            processItemHeavyLoad(vt[i]);
            if (loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) {
                updateWatchedClass(vt[i]);
            }
            if (((loc.pathname.indexOf("/user/") === 0 && loc.pathname.indexOf("/videos") !== -1) || loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) && ytcenter.settings.watchedVideosIndicator) {
                updateWatchedMessage(vt[i]);
            }
        }
    };
    exports.setupObserver = function(){
        exports.dispose(); // We don't want multiple observers
        if (document.getElementById("content")) {
            observer = ytcenter.mutation.observe(document.getElementById("content"), { childList: true, subtree: true }, function(){
                exports.update();
            });
        }
    };
    exports.dispose = function(){
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (observer2) {
            observer2.disconnect();
            observer2 = null;
        }
    };
    ytcenter.unload(exports.dispose);
    exports.setup = function(){
        con.log("[Thumbnail] Setup has begun...");
        ytcenter.gridview.update();
        try {
            var i;
            cacheChecker();
            ytcenter.videoHistory.loadWatchedVideosFromYouTubePage();
            videoThumbs = getVideoThumbs();
            processItems(videoThumbs);
            for (i = 0; i < videoThumbs.length; i++) {
                ytcenter.utils.addEventListener(videoThumbs[i].wrapper, "mouseover", (function(item){
                    return function(){ item.mouseover = true; };
                })(videoThumbs[i]), false);
                ytcenter.utils.addEventListener(videoThumbs[i].wrapper, "mouseout", (function(item){
                    return function(){ item.mouseover = false; };
                })(videoThumbs[i]), false);
                updateReuse(videoThumbs[i]);
                processItemHeavyLoad(videoThumbs[i]);
                if (loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) {
                    updateWatchedClass(videoThumbs[i]);
                }
                if (((loc.pathname.indexOf("/user/") === 0 && loc.pathname.indexOf("/videos") !== -1) || loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) && ytcenter.settings.watchedVideosIndicator) {
                    updateWatchedMessage(videoThumbs[i]);
                }
            }
            exports.setupObserver();
        } catch (e) {
            con.error(e);
        }
    };

    var processedVideoIds = [];

    return exports;
})();