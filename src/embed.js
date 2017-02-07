/* Functions for handling embedded videos */

try {
    ytcenter.embed = {};
    ytcenter.embed.isYouTubeReady = false;
    ytcenter.embed.isYouTubeCenterReady = false;
    ytcenter.embed.failsafe = false;

    ytcenter.embed._writeEmbed = uw.writeEmbed;
    defineLockedProperty(uw, "writeEmbed", function(func){
        con.log("[Embed] writeEmbed has been leaked to @name@.");
        ytcenter.embed._writeEmbed = func;
    }, function(){
        if (ytcenter.embed.failsafe)
            return ytcenter.embed._writeEmbed;
        return function(){
            con.log("[Embed] YouTube has called writeEmbed.");
            ytcenter.embed.isYouTubeReady = true;
            if (ytcenter.embed.writePlayer)
                ytcenter.embed.writePlayer();
        };
    });

    ytcenter.embed.callWriteEmbed = function(){
        var reload = false;
        try {
            if (ytcenter.settings.embedWriteEmbedMethod === "standard") { // Async
                ytcenter.embed._writeEmbed();
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test1") { // Async
                uw.yt.player.embed("player", ytcenter.player.getConfig());
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test2") { // Sync
                var data = new uw.yt.player.Application("player", ytcenter.player.getConfig());
                con.log("[callWriteEmbed]", data);
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test3") { // Sync
                uw.yt.player.Application.create("player", ytcenter.player.getConfig());
            } else if (ytcenter.settings.embedWriteEmbedMethod === "standard+reload") { // Async
                ytcenter.embed._writeEmbed();
                reload = true;
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test1+reload") { // Async
                uw.yt.player.embed("player", ytcenter.player.getConfig());
                reload = true;
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test2+reload") { // Sync
                var data = new uw.yt.player.Application("player", ytcenter.player.getConfig());
                con.log("[callWriteEmbed]", data);
                reload = true;
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test3+reload") { // Sync
                uw.yt.player.Application.create("player", ytcenter.player.getConfig());
                reload = true;
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test4") { // Sync
                uw.ytcenter_writeEmbed = ytcenter.embed._writeEmbed;
                ytcenter.inject(function(){
                    var c = JSON.parse(JSON.stringify(ytplayer.config));
                    yt.config_.PLAYER_CONFIG = c;
                    ytcenter_writeEmbed();
                });
            } else if (ytcenter.settings.embedWriteEmbedMethod === "test5") { // Sync
                try {
                    uw.yt.config_.PLAYER_CONFIG = ytcenter.utils.jsonClone(ytcenter.player.getConfig());
                } catch (e) {
                    con.error(e);
                }
                ytcenter.embed._writeEmbed();
            }
        } catch (e) {
            con.error(e);
        }
        if (reload) {
            // Reload the embedded video if there is no children of the player element after 1.0 seconds.
            uw.setTimeout(function(){
                var p = document.getElementById("player");
                if (!p) return;
                if (p.children.length === 0) {
                    loc.reload();
                }
            }, ytcenter.settings.embedWriteEmbedMethodReloadDelay);
        }
    };

    ytcenter.embed.writePlayer = function(){
        try {
            if (typeof ytcenter.embed._writeEmbed !== "function") {
                con.log("[Embed] writeEmbed is not yet ready!");
                return;
            }
            con.log("[Embed] Checking if YouTube and @name@ are ready...");
            if (!ytcenter.embed.isYouTubeReady || !ytcenter.embed.isYouTubeCenterReady) {
                con.log("[Embed] They're both not ready yet!");
                return;
            }
            /* Settings the player config according to @name@ */
            var cfg = ytcenter.player.getConfig();
            if (cfg) uw.yt.config_.PLAYER_CONFIG = cfg;

            /* Writing the embedded player */
            con.log("[Embed] Writing the embedded player.");
            ytcenter.embed.callWriteEmbed();
        } catch (e) {
            con.error(e);
            ytcenter.embed.failsafe = true;
            /* Trying to write the player when an error was thrown */
            try {
                con.log("[Embed] Writing the embedded player.");
                ytcenter.embed.callWriteEmbed();
            } catch (e) {
                con.error(e);
            }
        }
    };

    ytcenter.embed.load = function(){
        try {
            var url = ytcenter.player.getVideoDataRequest();

            con.log("[Embed] Downloading data from " + url);
            ytcenter.utils.xhr({
                method: "GET",
                url: url,
                headers: {
                    "Content-Type": "text/plain"
                },
                onload: function(response){
                    try {
                        if (response.responseText) {
                            con.log("[Embed] Download complete.");
                            var object = {}, tokens = response.responseText.split("&");
                            for (var i = 0; i < tokens.length; i++) {
                                var ss = tokens[i].split("=");
                                object[ss[0]] = decodeURIComponent(ss[1]);
                            }
                            if (object.errorcode) {
                                con.error("[Embed] Error: " + object.errorcode + ": " + object.reason);
                            } else {
                                if (object.dash) ytcenter.player.config.args.dash = object.dash;
                                if (object.dashmpd) ytcenter.player.config.args.dashmpd = object.dashmpd;
                                if (object.adaptive_fmts) ytcenter.player.config.args.adaptive_fmts = object.adaptive_fmts;
                                if (object.fmt_list) ytcenter.player.config.args.fmt_list = object.fmt_list;
                                if (object.url_encoded_fmt_stream_map) ytcenter.player.config.args.url_encoded_fmt_stream_map = object.url_encoded_fmt_stream_map;
                                if (object.url_encoded_fmt_stream_map || object.adaptive_fmts) {
                                    ytcenter.video.streams = ytcenter.parseStreams(object);
                                }
                                ytcenter.player.setConfig(ytcenter.player.modifyConfig("embed", ytcenter.player.config));
                            }

                            ytcenter.embed.isYouTubeCenterReady = true;
                            ytcenter.embed.writePlayer();
                        } else {
                            con.error("[Embed] Didn't receive any data!");
                            ytcenter.embed.failsafe = true;
                            /* Going to set @name@ as ready to make it possible for the user to watch the embedded video if possible. */
                            ytcenter.embed.isYouTubeCenterReady = true;
                            ytcenter.embed.writePlayer();
                        }
                    } catch (e) {
                        con.error(e);
                        ytcenter.embed.failsafe = true;
                        /* Just to make people happy. */
                        ytcenter.embed.isYouTubeCenterReady = true;
                        ytcenter.embed.writePlayer();
                    }
                },
                onerror: function(){
                    con.error("[Embed] Connection failed!");
                    ytcenter.embed.failsafe = true;
                    /* Going to set @name@ as ready to make it possible for the user to watch the embedded video if possible. */
                    ytcenter.embed.isYouTubeCenterReady = true;
                    ytcenter.embed.writePlayer();
                }
            });
        } catch (e) {
            con.error(e);
            ytcenter.embed.failsafe = true;
            ytcenter.embed.isYouTubeCenterReady = true;
            ytcenter.embed.writePlayer();
        }
    };
} catch (e) {
    con.error(e);
}