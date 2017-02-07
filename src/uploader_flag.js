/* Adds country flag to uploader */

ytcenter.uploaderFlag = (function(){
    function init() {
        if (!ytcenter.settings.uploaderCountryEnabled) return;

        ytcenter.cache.putCategory("profile_country", ytcenter.settings.commentCacheSize);

        var userHeader = (ytcenter.feather ? document.getElementById("ud") : document.getElementById("watch7-user-header")), user, id;
        if (userHeader) {
            user = (ytcenter.feather ? userHeader.getElementsByTagName("a")[0] : userHeader.getElementsByTagName("a")[1]);
            id = user.getAttribute("data-ytid");

            var country = ytcenter.cache.getItem("profile_country", id);
            if (country) {
                addFlag(country.data);
            } else {
                work(id);
            }
        }
    }
    function work(id) {
        ytcenter.jobs.createWorker(id, function(args){
            try {
                ytcenter.getUserData(id, function(country){
                    args.complete(country);
                });
            } catch (e) {
                con.error(e);
                args.complete(null);
            }
        }, function(data){
            if (!data) return;
            if (id) {
                ytcenter.cache.putItem("profile_country", id, data, 2678400000 /* 31 days */);
            }
            addFlag(data);
        });
    }
    function addFlag(country) {
        var userHeader = (ytcenter.feather ? document.getElementById("ud") : document.getElementById("watch7-user-header"));
        var userInfo = userHeader;
        if (!ytcenter.feather && userHeader && userHeader.getElementsByClassName("yt-user-info").length > 0) {
            userInfo = userHeader.getElementsByClassName("yt-user-info")[0];
        }
        var separator = userInfo.children[1];

        var user = (ytcenter.feather ? userInfo.getElementsByTagName("a")[0] : userInfo.getElementsByTagName("a")[1]);
        var linebreak = (ytcenter.feather ? userInfo.lastChild : userInfo.getElementsByTagName("br")[0]);
        var countryContainer = document.createElement("span");
        var countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());

        if (userInfo.getElementsByClassName("country").length > 0) return;
        countryContainer.className = "country";
        if (ytcenter.settings.uploaderCountryShowFlag && ytcenter.flags[country.toLowerCase()]) {
            var img = document.createElement("img");
            img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
            img.className = ytcenter.flags[country.toLowerCase()] + " yt-uix-tooltip";
            if (ytcenter.settings.uploaderCountryUseNames) {
                img.setAttribute("alt", countryName || country);
                img.setAttribute("title", countryName || country);
                ytcenter.events.addEvent("language-refresh", function(){
                    var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
                    img.setAttribute("alt", _countryName || country);
                    img.setAttribute("title", _countryName || country);
                });
            } else {
                img.setAttribute("alt", country);
                img.setAttribute("title", country);
            }
            countryContainer.appendChild(img);
        } else {
            if (ytcenter.settings.uploaderCountryUseNames) {
                countryContainer.textContent = countryName || country;
                ytcenter.events.addEvent("language-refresh", function(){
                    var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
                    countryContainer.textContent = _countryName || country;
                });
            } else {
                countryContainer.textContent = country;
            }
        }

        countryContainer.style.verticalAlign = "middle";


        if (ytcenter.settings.uploaderCountryPosition === "before_username") {
            countryContainer.style.marginRight = "10px";
            userInfo.insertBefore(countryContainer, userInfo.children[0]);
        } else if (ytcenter.settings.uploaderCountryPosition === "after_username") {
            if (ytcenter.utils.hasClass(separator, "yt-user-name-icon-verified") || ytcenter.utils.hasClass(separator, "yt-channel-title-icon-verified")) {
                separator = userInfo.children[2];
            }
            countryContainer.style.marginLeft = "5px";
            userInfo.insertBefore(countryContainer, separator);
        } else if (ytcenter.settings.uploaderCountryPosition === "last") {
            countryContainer.style.marginLeft = "5px";
            if (ytcenter.feather) {
                userInfo.appendChild(countryContainer);
            } else {
                userInfo.insertBefore(countryContainer, linebreak);
            }
        }
    }

    return {
        init: init
    };
})();