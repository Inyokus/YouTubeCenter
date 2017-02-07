/* API-query methods for getting user country and a (generic, but only used there) job system
   Used in uploader_flag.js and comments_plus.js */

ytcenter.jobs = (function(){
    var exports = {}, workers = {}, pendingWorkers = [], workingWorkers = [], completedWorkers = [], _max_workers = 20;

    /*  id        the id of the worker.
     action    the action function, which will do the job.
     complete  the function which will be called when the job is finished.
     ***
     This creates a new worker, which will execute a job.
     If a worker with the same id is created it will just execute the complete function instead with the previous data.
     */
    exports.createWorker = function(id, action, complete){
        if (id in workers) {
            if (workers[id].completed) {
                con.log("[Worker] Job has already been executed once (" + id + ")");
                complete(workers[id].data);
            } else {
                con.log("[Worker] Job is currently being executed (" + id + ")");
                workers[id].completeActions.push(complete);
            }
        } else {
            workers[id] = {
                completeActions: [ complete ],
                run: function(){ action(workers[id].args); },
                args: {
                    complete: function(data){
                        con.log("[Worker] Job completed (" + id + ")");
                        var i;
                        for (i = 0; i < workingWorkers.length; i++) {
                            if (workingWorkers[i] === id) {
                                completedWorkers.push(workingWorkers.splice(i, 1)[0]);
                                break;
                            }
                        }

                        workers[id].completed = true;
                        workers[id].data = data;
                        var i;
                        for (i = 0; i < workers[id].completeActions.length; i++) {
                            workers[id].completeActions[i](data);
                        }

                        exports.run();
                    },
                    remove: ytcenter.utils.once(function(){ delete workers[id]; })
                },
                completed: false
            };
            con.log("[Worker] Addiong new job (" + id + ")");
            pendingWorkers.push(id);

            exports.run();
        }
    };

    exports.run = function(){
        var id;
        while ((workingWorkers.length < _max_workers || _max_workers === -1) && pendingWorkers.length > 0) {
            id = pendingWorkers.splice(0, 1)[0];
            workingWorkers.push(id);
            con.log("[Worker] Executing new job (" + id + ")");
            workers[id].run();
        }
    };

    exports.getPendingWorkers = function(){
        return pendingWorkers;
    };

    exports.getWorkingWorkers = function(){
        return workingWorkers;
    };
    exports.getCompletedWorkers = function(){
        return completedWorkers;
    };

    return exports;
})();
ytcenter.cache = (function(){
    function saveChanges() {
        if (!_timer) {
            _timer = uw.setTimeout(function(){
                _timer = null;

                ytcenter.saveSettings();
            },  2000);
        }
    }
    var exports = {}, _timer = null;

    exports.putCategory = function(id, size){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        if (ytcenter.settings.cache[id] && ytcenter.settings.cache[id].size === size) return;
        if (ytcenter.settings.cache[id]) {
            ytcenter.settings.cache[id].size = size;
        } else {
            ytcenter.settings.cache[id] = { size: size, items: [] };
        }

        exports.checkCache();
        saveChanges();
    };

    exports.getCategory = function(id){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        return ytcenter.settings.cache[id] || null;
    };

    exports.getItem = function(catId, id){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};

        var cat = exports.getCategory(catId), i;
        if (!cat) return false;
        for (i = 0; i < cat.items.length; i++) {
            if (cat.items[i].i === id)
                return { id: cat.items[i].i, categoryId: catId, data: cat.items[i].d, expires: cat.items[i].e, lastUpdated: cat.items[i].l, index: i };
        }
        return null;
    };

    /**
     * catId : the unique id of the category the item is in.
     * id : the unique id of the item.
     * data : the data of the item.
     * expires : the milliseconds after the last update date. If the sum of expires and the lastUpdate is less than the date the item will be removed.
     */
    exports.putItem = function(catId, id, data, expires){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        exports.checkCache();

        var cat = exports.getCategory(catId), item;
        if (!cat) throw "[Cache] Category " + catId + " doesn't exist!";
        item = exports.getItem(catId, id);
        if (item) {
            cat.items[item.index].d = data;
            cat.items[item.index].e = expires;
            cat.items[item.index].l = +new Date;
        } else {
            item = { i: id, d: data, e: expires, l: +new Date };
            if (cat.items.length >= cat.size) cat.items.shift();
            cat.items.push(item);
        }

        saveChanges();
    };

    /* Find expired items and removes them. */
    exports.checkCache = function(){
        if (!ytcenter.settings.cache) return;
        var key, i, now = +new Date, save = false;

        for (key in ytcenter.settings.cache) {
            if (ytcenter.settings.cache.hasOwnProperty(key)) {
                for (i = 0; i < ytcenter.settings.cache[key].items.length; i++) {
                    if (ytcenter.settings.cache[key].items[i].l + ytcenter.settings.cache[key].items[i].e < now) {
                        save = true;
                        ytcenter.settings.cache[key].items.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        saveChanges();
    };

    return exports;
})();
ytcenter.getUserData = function(userId, callback) {
    var apikey = ytcenter.settings.google_apikey || "AIzaSyCO5gfGpEiqmc8XTknN9RyC3TCJz1-XyAI";
    ytcenter.utils.xhr({
        url: "https://www.googleapis.com/youtube/v3/channels?part=snippet&id=" + encodeURIComponent(userId) + "&key=" + encodeURIComponent(apikey),
        method: "GET",
        onload: function(r) {
            var data = null;
            try {
                data = JSON.parse(r.responseText);
            } catch (e) {
                con.error(e);
            }
            var country = null;
            if (data && data.items && data.items.length > 0 && data.items[0] && data.items[0].snippet) {
                country = data.items[0].snippet.country;
            }
            callback(country);
        },
        onerror: function(){
            callback(null);
        }
    });
};
ytcenter.getGooglePlusUserData = function(oId, callback) {
    function handleFinalUrl(url) {
        var userId = null;
        if (url.indexOf("youtube.com/channel/") !== -1) {
            userId = url.split("youtube.com/channel/");
            if (userId && userId[1])
                ytcenter.getUserData(userId[1], callback);
        } else if (url.indexOf("youtube.com/user/") !== -1) {
            userId = url.split("youtube.com/user/");
            if (userId && userId[1])
                ytcenter.getUserData(userId[1], callback);
        } else {
            con.error("[Comments getGooglePlusUserData] Final URL: " + r.finalUrl);
            callback(null);
        }
    }
    ytcenter.utils.xhr({
        url: ytcenter.protocol + "www.youtube.com/profile_redirector/" + oId,
        method: "GET",
        onload: function(r){
            try {
                if (!r.finalUrl || r.finalUrl === "") {
                    handleFinalUrl(ytcenter.utils.getContentByTags(r.responseText, "<meta property=\"og:url\" content=\"", "\">"));
                } else {
                    handleFinalUrl(r.finalUrl);
                }
            } catch (e) {
                con.error("[Comments getGooglePlusUserData] Couldn't parse data from " + ytcenter.protocol + "www.youtube.com/profile_redirector/" + oId);
                con.error(r);
                con.error(e);
                callback(null);
            }
        },
        onerror: function(){
            con.error("[Comments getGooglePlusUserData] Couldn't fetch data from " + ytcenter.protocol + "www.youtube.com/profile_redirector/" + oId);
            callback(null);
        }
    });
};
ytcenter.flags = {
    "unknown": "ytcenter-flag-unknown",
    /* Country Code : CSS Class */
    "ad": "ytcenter-flag-ad",
    "ae": "ytcenter-flag-ae",
    "af": "ytcenter-flag-af",
    "ag": "ytcenter-flag-ag",
    "ai": "ytcenter-flag-ai",
    "al": "ytcenter-flag-al",
    "am": "ytcenter-flag-am",
    "an": "ytcenter-flag-an",
    "ao": "ytcenter-flag-ao",
    "aq": "ytcenter-flag-aq",
    "ar": "ytcenter-flag-ar",
    "as": "ytcenter-flag-as",
    "at": "ytcenter-flag-at",
    "au": "ytcenter-flag-au",
    "aw": "ytcenter-flag-aw",
    "ax": "ytcenter-flag-ax",
    "az": "ytcenter-flag-az",
    "ba": "ytcenter-flag-ba",
    "bb": "ytcenter-flag-bb",
    "bd": "ytcenter-flag-bd",
    "be": "ytcenter-flag-be",
    "bf": "ytcenter-flag-bf",
    "bg": "ytcenter-flag-bg",
    "bh": "ytcenter-flag-bh",
    "bi": "ytcenter-flag-bi",
    "bj": "ytcenter-flag-bj",
    "bm": "ytcenter-flag-bm",
    "bn": "ytcenter-flag-bn",
    "bo": "ytcenter-flag-bo",
    "br": "ytcenter-flag-br",
    "bs": "ytcenter-flag-bs",
    "bt": "ytcenter-flag-bt",
    "bv": "ytcenter-flag-bv",
    "bw": "ytcenter-flag-bw",
    "by": "ytcenter-flag-by",
    "bz": "ytcenter-flag-bz",
    "ca": "ytcenter-flag-ca",
    "catalonia": "ytcenter-flag-catalonia",
    "cc": "ytcenter-flag-cc",
    "cd": "ytcenter-flag-cd",
    "cf": "ytcenter-flag-cf",
    "cg": "ytcenter-flag-cg",
    "ch": "ytcenter-flag-ch",
    "ci": "ytcenter-flag-ci",
    "ck": "ytcenter-flag-ck",
    "cl": "ytcenter-flag-cl",
    "cm": "ytcenter-flag-cm",
    "cn": "ytcenter-flag-cn",
    "co": "ytcenter-flag-co",
    "cr": "ytcenter-flag-cr",
    "cs": "ytcenter-flag-cs",
    "cu": "ytcenter-flag-cu",
    "cv": "ytcenter-flag-cv",
    "cx": "ytcenter-flag-cx",
    "cy": "ytcenter-flag-cy",
    "cz": "ytcenter-flag-cz",
    "de": "ytcenter-flag-de",
    "dj": "ytcenter-flag-dj",
    "dk": "ytcenter-flag-dk",
    "dm": "ytcenter-flag-dm",
    "do": "ytcenter-flag-do",
    "dz": "ytcenter-flag-dz",
    "ec": "ytcenter-flag-ec",
    "ee": "ytcenter-flag-ee",
    "eg": "ytcenter-flag-eg",
    "eh": "ytcenter-flag-eh",
    "england": "ytcenter-flag-england",
    "er": "ytcenter-flag-er",
    "es": "ytcenter-flag-es",
    "et": "ytcenter-flag-et",
    "europeanunion": "ytcenter-flag-europeanunion",
    "fam": "ytcenter-flag-fam",
    "fi": "ytcenter-flag-fi",
    "fj": "ytcenter-flag-fj",
    "fk": "ytcenter-flag-fk",
    "fm": "ytcenter-flag-fm",
    "fo": "ytcenter-flag-fo",
    "fr": "ytcenter-flag-fr",
    "ga": "ytcenter-flag-ga",
    "gb": "ytcenter-flag-gb",
    "gd": "ytcenter-flag-gd",
    "ge": "ytcenter-flag-ge",
    "gf": "ytcenter-flag-gf",
    "gh": "ytcenter-flag-gh",
    "gi": "ytcenter-flag-gi",
    "gl": "ytcenter-flag-gl",
    "gm": "ytcenter-flag-gm",
    "gn": "ytcenter-flag-gn",
    "gp": "ytcenter-flag-gp",
    "gq": "ytcenter-flag-gq",
    "gr": "ytcenter-flag-gr",
    "gs": "ytcenter-flag-gs",
    "gt": "ytcenter-flag-gt",
    "gu": "ytcenter-flag-gu",
    "gw": "ytcenter-flag-gw",
    "gy": "ytcenter-flag-gy",
    "hk": "ytcenter-flag-hk",
    "hm": "ytcenter-flag-hm",
    "hn": "ytcenter-flag-hn",
    "hr": "ytcenter-flag-hr",
    "ht": "ytcenter-flag-ht",
    "hu": "ytcenter-flag-hu",
    "id": "ytcenter-flag-id",
    "ie": "ytcenter-flag-ie",
    "il": "ytcenter-flag-il",
    "in": "ytcenter-flag-in",
    "io": "ytcenter-flag-io",
    "iq": "ytcenter-flag-iq",
    "ir": "ytcenter-flag-ir",
    "is": "ytcenter-flag-is",
    "it": "ytcenter-flag-it",
    "jm": "ytcenter-flag-jm",
    "jo": "ytcenter-flag-jo",
    "jp": "ytcenter-flag-jp",
    "ke": "ytcenter-flag-ke",
    "kg": "ytcenter-flag-kg",
    "kh": "ytcenter-flag-kh",
    "ki": "ytcenter-flag-ki",
    "km": "ytcenter-flag-km",
    "kn": "ytcenter-flag-kn",
    "kp": "ytcenter-flag-kp",
    "kr": "ytcenter-flag-kr",
    "kw": "ytcenter-flag-kw",
    "ky": "ytcenter-flag-ky",
    "kz": "ytcenter-flag-kz",
    "la": "ytcenter-flag-la",
    "lb": "ytcenter-flag-lb",
    "lc": "ytcenter-flag-lc",
    "li": "ytcenter-flag-li",
    "lk": "ytcenter-flag-lk",
    "lr": "ytcenter-flag-lr",
    "ls": "ytcenter-flag-ls",
    "lt": "ytcenter-flag-lt",
    "lu": "ytcenter-flag-lu",
    "lv": "ytcenter-flag-lv",
    "ly": "ytcenter-flag-ly",
    "ma": "ytcenter-flag-ma",
    "mc": "ytcenter-flag-mc",
    "md": "ytcenter-flag-md",
    "me": "ytcenter-flag-me",
    "mg": "ytcenter-flag-mg",
    "mh": "ytcenter-flag-mh",
    "mk": "ytcenter-flag-mk",
    "ml": "ytcenter-flag-ml",
    "mm": "ytcenter-flag-mm",
    "mn": "ytcenter-flag-mn",
    "mo": "ytcenter-flag-mo",
    "mp": "ytcenter-flag-mp",
    "mq": "ytcenter-flag-mq",
    "mr": "ytcenter-flag-mr",
    "ms": "ytcenter-flag-ms",
    "mt": "ytcenter-flag-mt",
    "mu": "ytcenter-flag-mu",
    "mv": "ytcenter-flag-mv",
    "mw": "ytcenter-flag-mw",
    "mx": "ytcenter-flag-mx",
    "my": "ytcenter-flag-my",
    "mz": "ytcenter-flag-mz",
    "na": "ytcenter-flag-na",
    "nc": "ytcenter-flag-nc",
    "ne": "ytcenter-flag-ne",
    "nf": "ytcenter-flag-nf",
    "ng": "ytcenter-flag-ng",
    "ni": "ytcenter-flag-ni",
    "nl": "ytcenter-flag-nl",
    "no": "ytcenter-flag-no",
    "np": "ytcenter-flag-np",
    "nr": "ytcenter-flag-nr",
    "nu": "ytcenter-flag-nu",
    "nz": "ytcenter-flag-nz",
    "om": "ytcenter-flag-om",
    "pa": "ytcenter-flag-pa",
    "pe": "ytcenter-flag-pe",
    "pf": "ytcenter-flag-pf",
    "pg": "ytcenter-flag-pg",
    "ph": "ytcenter-flag-ph",
    "pk": "ytcenter-flag-pk",
    "pl": "ytcenter-flag-pl",
    "pm": "ytcenter-flag-pm",
    "pn": "ytcenter-flag-pn",
    "pr": "ytcenter-flag-pr",
    "ps": "ytcenter-flag-ps",
    "pt": "ytcenter-flag-pt",
    "pw": "ytcenter-flag-pw",
    "py": "ytcenter-flag-py",
    "qa": "ytcenter-flag-qa",
    "re": "ytcenter-flag-re",
    "ro": "ytcenter-flag-ro",
    "rs": "ytcenter-flag-rs",
    "ru": "ytcenter-flag-ru",
    "rw": "ytcenter-flag-rw",
    "sa": "ytcenter-flag-sa",
    "sb": "ytcenter-flag-sb",
    "sc": "ytcenter-flag-sc",
    "scotland": "ytcenter-flag-scotland",
    "sd": "ytcenter-flag-sd",
    "se": "ytcenter-flag-se",
    "sg": "ytcenter-flag-sg",
    "sh": "ytcenter-flag-sh",
    "si": "ytcenter-flag-si",
    "sj": "ytcenter-flag-sj",
    "sk": "ytcenter-flag-sk",
    "sl": "ytcenter-flag-sl",
    "sm": "ytcenter-flag-sm",
    "sn": "ytcenter-flag-sn",
    "so": "ytcenter-flag-so",
    "sr": "ytcenter-flag-sr",
    "st": "ytcenter-flag-st",
    "sv": "ytcenter-flag-sv",
    "sy": "ytcenter-flag-sy",
    "sz": "ytcenter-flag-sz",
    "tc": "ytcenter-flag-tc",
    "td": "ytcenter-flag-td",
    "tf": "ytcenter-flag-tf",
    "tg": "ytcenter-flag-tg",
    "th": "ytcenter-flag-th",
    "tj": "ytcenter-flag-tj",
    "tk": "ytcenter-flag-tk",
    "tl": "ytcenter-flag-tl",
    "tm": "ytcenter-flag-tm",
    "tn": "ytcenter-flag-tn",
    "to": "ytcenter-flag-to",
    "tr": "ytcenter-flag-tr",
    "tt": "ytcenter-flag-tt",
    "tv": "ytcenter-flag-tv",
    "tw": "ytcenter-flag-tw",
    "tz": "ytcenter-flag-tz",
    "ua": "ytcenter-flag-ua",
    "ug": "ytcenter-flag-ug",
    "um": "ytcenter-flag-um",
    "us": "ytcenter-flag-us",
    "uy": "ytcenter-flag-uy",
    "uz": "ytcenter-flag-uz",
    "va": "ytcenter-flag-va",
    "vc": "ytcenter-flag-vc",
    "ve": "ytcenter-flag-ve",
    "vg": "ytcenter-flag-vg",
    "vi": "ytcenter-flag-vi",
    "vn": "ytcenter-flag-vn",
    "vu": "ytcenter-flag-vu",
    "wales": "ytcenter-flag-wales",
    "wf": "ytcenter-flag-wf",
    "ws": "ytcenter-flag-ws",
    "ye": "ytcenter-flag-ye",
    "yt": "ytcenter-flag-yt",
    "za": "ytcenter-flag-za",
    "zm": "ytcenter-flag-zm",
    "zw": "ytcenter-flag-zw"
};