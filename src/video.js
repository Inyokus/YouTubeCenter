/* Initializes ytcenter.video and adds methods. Filling the property with
   data is done in pageSetup or ytcenter.embed.load, respectively */

ytcenter.video = {};
uw.ytcenter._video = ytcenter.video;
ytcenter.video.format = [
    {
        type: 'video/mp4',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_MP4',
        key: 'mp4'
    }, {
        type: 'video/webm',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_WEBM',
        key: 'webm'
    }, {
        type: 'video/x-flv',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_FLV',
        key: 'flv'
    }, {
        type: 'video/3gpp',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_3GP',
        key: '3gp'
    }, {
        type: 'audio/mp4',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_AUDIO',
        key: 'm4a',
        help: 'https://github.com/YePpHa/YouTubeCenter/wiki/Download:Audio'
    }
];
ytcenter.video.resolutions = {
    'tiny': '144p',
    'small': '240p',
    'medium': '360p',
    'large': '480p',
    'hd720': '720p',
    'hd1080': '1080p',
    'hd1440': '1440p',
    'highres': 'Original'
};
ytcenter.video.id = "";
ytcenter.video.title = "";
ytcenter.video.author = "";
ytcenter.video.channelname = "";
ytcenter.video._channel = {};

ytcenter.video.mimetypes = [
    { mimetype: "video/webm", extension: ".webm" },
    { mimetype: "video/x-flv", extension: ".flv" },
    { mimetype: "video/mp4", extension: ".mp4" },
    { mimetype: "video/3gpp", extension: ".3gp" },
    { mimetype: "audio/mp4", extension: ".m4a" },
    { mimetype: "audio/mp4", extension: ".m4a" }
];
ytcenter.video.getFilenameExtension = function(stream){
    if (!stream || !stream.type || stream.type.indexOf(";") === -1) return "";
    var mt = stream.type.split(";")[0], i;
    for (i = 0; i < ytcenter.video.mimetypes.length; i++) {
        if (ytcenter.video.mimetypes[i].mimetype === mt)
            return ytcenter.video.mimetypes[i].extension;
    }
    return "";
};
ytcenter.video.removeNonAlphanumericCharacters = function(text){
    if (ytcenter.settings.fixfilename) {
        var buffer = "";
        for (var i = 0, len = text.length; i < len; i++) {
            if (text.charAt(i).match(/[0-9a-zA-Z ]/i)) {
                buffer += text.charAt(i);
            }
        }
        return buffer;
    } else {
        return text;
    }
};
ytcenter.video.getFilename = function(stream){
    if (stream == null) return "";
    var duration = 0;
    var pubtimestamp = 0, pubsecs = 0, pubmins = 0, pubhours = 0, pubdays = 0, pubmonth = 0, pubyear = 0;
    var nowtimestamp = 0, nowsecs = 0, nowmins = 0, nowhours = 0, nowdays = 0, nowmonth = 0, nowyear = 0;
    var durmin = 0;
    var dursec = 0;
    try {
        duration = ytcenter.player.getConfig().args.length_seconds;
        durmin = Math.floor(duration/60);
        dursec = duration - durmin*60;
    } catch (e) {
        duration = 0;
        durmin = 0;
        dursec = 0;
    }
    try {
        pubtimestamp = Math.floor(ytcenter.video.published.getTime()/1000);
        pubsecs = ytcenter.video.published.getSeconds();
        pubmins = ytcenter.video.published.getMinutes();
        pubhours = ytcenter.video.published.getHours();
        pubdays = ytcenter.video.published.getDate();
        pubmonth = ytcenter.video.published.getMonth() + 1;
        pubyear = ytcenter.video.published.getFullYear();
    } catch (e) {
        pubtimestamp = 0;
        pubsecs = 0;
        pubmins = 0;
        pubhours = 0;
        pubdays = 0;
        pubmonth = 0;
        pubyear = 0;
    }
    try {
        var now = new Date();
        nowtimestamp = Math.floor(now.getTime()/1000);
        nowsecs = now.getSeconds();
        nowmins = now.getMinutes();
        nowhours = now.getHours();
        nowdays = now.getDate();
        nowmonth = now.getMonth() + 1;
        nowyear = now.getFullYear();
    } catch (e) {
        con.error(e);
        nowtimestamp = 0;
        nowsecs = 0;
        nowmins = 0;
        nowhours = 0;
        nowdays = 0;
        nowmonth = 0;
        nowyear = 0;
    }
    var filename = ytcenter.utils.replaceTextAsString(ytcenter.settings.filename, {
        title: ytcenter.video.removeNonAlphanumericCharacters(ytcenter.video.title),
        videoid: ytcenter.video.id,
        author: ytcenter.video.removeNonAlphanumericCharacters(ytcenter.video.author),
        channelname: ytcenter.video.removeNonAlphanumericCharacters(ytcenter.video.channelname),
        resolution: (ytcenter.video.resolutions.hasOwnProperty(stream.quality) ? ytcenter.video.resolutions[stream.quality] : ''),
        itag: stream.itag,
        dimension: (stream.dimension ? stream.dimension : stream.size),
        bitrate: stream.bitrate,
        width: (stream.dimension ? stream.dimension.split("x")[0] : (stream.size ? stream.size.split("x")[0] : 0)),
        height: (stream.dimension ? stream.dimension.split("x")[1] : (stream.size ? stream.size.split("x")[1] : 0)),
        format: (function(){
            for (var i = 0; i < ytcenter.video.format.length; i++) {
                if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                    return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                }
            }
            return "";
        })(),
        quality: stream.quality,
        type: stream.type,
        dur: duration,
        durmins: ytcenter.utils.prefixText(durmin, "0", 2),
        dursecs: ytcenter.utils.prefixText(dursec, "0", 2),
        nowtimestamp: nowtimestamp,
        nowsecs: ytcenter.utils.prefixText(nowsecs, "0", 2),
        nowmins: ytcenter.utils.prefixText(nowmins, "0", 2),
        nowhours: ytcenter.utils.prefixText(nowhours, "0", 2),
        nowdays: ytcenter.utils.prefixText(nowdays, "0", 2),
        nowmonth: ytcenter.utils.prefixText(nowmonth, "0", 2),
        nowyear: nowyear,
        pubtimestamp: pubtimestamp,
        pubsecs: ytcenter.utils.prefixText(pubsecs, "0", 2),
        pubmins: ytcenter.utils.prefixText(pubmins, "0", 2),
        pubhours: ytcenter.utils.prefixText(pubhours, "0", 2),
        pubdays: ytcenter.utils.prefixText(pubdays, "0", 2),
        pubmonth: ytcenter.utils.prefixText(pubmonth, "0", 2),
        pubyear: pubyear
    });

    // Removing illegal characters for filename for OS
    if (uw.navigator.appVersion.toLowerCase().indexOf("win") != -1) {
        filename = filename.replace(new RegExp('[\\\\/:|]+', 'g'), "-");
        filename = filename.replace(new RegExp('["*?<>]+', 'g'), "_");
    } else if (uw.navigator.appVersion.toLowerCase().indexOf("mac") != -1) {
        filename = filename.replace(new RegExp('^\\.'), "_");
        filename = filename.replace(":", "-");
    } else if (uw.navigator.appVersion.toLowerCase().indexOf("linux") != -1) {
        filename = filename.replace(new RegExp('[/\0]+', 'g'), "-");
    }
    return filename;
};
ytcenter.video.filename = function(stream){
    if (stream == null) return "";
    return stream.url + "&title=" + encodeURIComponent(ytcenter.video.getFilename(stream));
};
ytcenter.video.downloadLink = function(stream){
    return ytcenter.video.filename(stream) + "&cpn=" + encodeURIComponent(ytcenter.utils.crypt()) + (stream.s || stream.sig ? "&signature=" + encodeURIComponent(stream.sig || ytcenter.utils.signatureDecipher(stream.s)) : "");
};
ytcenter.video.download = (function(){
    var _download_iframe = null;
    return function(itag){
        con.log("Downloading format " + itag + "...");
        var stream = null;
        for (var i = 0; i < ytcenter.video.streams.length; i++) {
            if (ytcenter.video.streams[i].itag === itag && typeof ytcenter.video.streams[i].url != "undefined") {
                stream = ytcenter.video.streams[i];
                break;
            }
        }
        if (stream) {
            if (!_download_iframe) { // Initalize iframe if it doesn't exist
                _download_iframe = document.createElement("iframe");
                _download_iframe.style.position = "absolute";
                _download_iframe.style.top = "-1000px";
                _download_iframe.style.left = "-1000px";
                _download_iframe.style.width = "1px";
                _download_iframe.style.height = "1px";
                document.body.appendChild(_download_iframe);
            }
            _download_iframe.setAttribute("src", ytcenter.video.downloadLink(stream));
        } else {
            con.log("Format (" + itag + ") not found and therefore couldn't start downloading");
            throw "Stream (" + itag + ") not found!";
        }
    };
})();
ytcenter.video.streams = [];