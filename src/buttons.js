/* Functions for creating the buttons below the player and the settings button */

function $CreateAspectButton() {
    var btn = document.createElement("button");
    btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.aspectEnable ? "" : " hid") + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
    btn.setAttribute("title", ytcenter.language.getLocale("BUTTON_ASPECT_TOOLTIP"));
    btn.setAttribute("type", "button");
    btn.setAttribute("role", "button");
    ytcenter.events.addEvent("ui-refresh", function(){
        btn.setAttribute("title", ytcenter.language.getLocale("BUTTON_ASPECT_TOOLTIP"));
        if (ytcenter.settings.aspectEnable) {
            ytcenter.utils.removeClass(btn, "hid");
        } else {
            ytcenter.utils.addClass(btn, "hid");
        }
    });

    var btnContent = document.createElement("span");
    btnContent.className = "yt-uix-button-content";
    btnContent.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_TEXT");
    ytcenter.language.addLocaleElement(btnContent, "BUTTON_ASPECT_TEXT", "@textContent");

    btn.appendChild(btnContent);

    var arrow = document.createElement("img");
    arrow.className = "yt-uix-button-arrow";
    arrow.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
    arrow.setAttribute("alt", "");

    btn.appendChild(arrow);

    var groups = {
        'crop': 'BUTTON_ASPECT_CROP',
        'stretch': 'BUTTON_ASPECT_STRETCH'
    };

    var groupChoices = {
        '4:3': 'BUTTON_ASPECT_4:3',
        '3:2': 'BUTTON_ASPECT_3:2',
        '16:9': 'BUTTON_ASPECT_16:9'
    };

    var menu = document.createElement("ul");
    menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-haspopup", "true");
    var playerAspectTMP = ytcenter.settings['aspectValue'];
    var item;

    item = document.createElement("span");
    if (ytcenter.settings.aspectValue === "none") {
        item.setAttribute("style", "background:#555!important;color:#FFF!important;");
    }
    item.className = "yt-uix-button-menu-item";
    item.setAttribute("onclick", ";return false;");
    item.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_NONE");
    ytcenter.language.addLocaleElement(item, "BUTTON_ASPECT_NONE", "@textContent");
    ytcenter.utils.addEventListener(item, "click", function(){
        playerAspectTMP = "none";
        if (ytcenter.settings.aspectSave) {
            ytcenter.settings['aspectValue'] = "none";
        }
        for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
            if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
                this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
            }
        }
        this.setAttribute("style", "background:#555!important;color:#FFF!important;");
        ytcenter.saveSettings();
        ytcenter.player.aspect("none");
    }, false);
    var li = document.createElement("li");
    li.setAttribute("role", "menuitem");
    li.appendChild(item);

    menu.appendChild(li);

    item = document.createElement("span");
    if (ytcenter.settings.aspectValue === "default") {
        item.setAttribute("style", "background:#555!important;color:#FFF!important;");
    }
    item.className = "yt-uix-button-menu-item";
    item.setAttribute("onclick", ";return false;");
    item.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_DEFAULT");

    ytcenter.utils.addEventListener(item, "click", function(){
        playerAspectTMP = "default";
        if (ytcenter.settings.aspectSave) {
            ytcenter.settings['aspectValue'] = "default";
        }
        for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
            if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
                this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
            }
        }
        this.setAttribute("style", "background:#555!important;color:#FFF!important;");
        ytcenter.saveSettings();
        ytcenter.player.aspect("default");
    }, false);
    ytcenter.language.addLocaleElement(item, "BUTTON_ASPECT_DEFAULT", "@textContent");
    li = document.createElement("li");
    li.setAttribute("role", "menuitem");
    li.appendChild(item);

    menu.appendChild(li);

    for (var group in groups) {
        if (groups.hasOwnProperty(group)) {
            item = document.createElement("li");
            item.style.fontWeight = "bold";
            item.style.padding = "6px";
            item.textContent = ytcenter.language.getLocale(groups[group]);
            ytcenter.language.addLocaleElement(item, groups[group], "@textContent");
            menu.appendChild(item);
            for (var child in groupChoices) {
                if (groupChoices.hasOwnProperty(child)) {
                    if (child === "4:3" && group === "crop") continue;
                    var val = "yt:" + group + "=" + child;
                    item = document.createElement("span");
                    if (val === ytcenter.settings.aspectValue) {
                        item.setAttribute("style", "background:#555!important;color:#FFF!important;");
                    }
                    item.className = "yt-uix-button-menu-item";
                    item.setAttribute("role", "menuitem");
                    item.setAttribute("onclick", ";return false;");
                    item.textContent = ytcenter.language.getLocale(groupChoices[child]);
                    ytcenter.language.addLocaleElement(item, groupChoices[child], "@textContent");
                    ytcenter.utils.addEventListener(item, "click", (function(val, group, child){
                        return function(){
                            var val = "yt:" + group + "=" + child;
                            playerAspectTMP = val;
                            if (ytcenter.settings.aspectSave) {
                                ytcenter.settings['aspectValue'] = val;
                            }
                            for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
                                if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
                                    this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
                                }
                            }
                            this.setAttribute("style", "background:#555!important;color:#FFF!important;");
                            ytcenter.saveSettings();
                            ytcenter.player.aspect(val);
                        };
                    })(val, group, child), false);
                    var li = document.createElement("li");
                    li.setAttribute("role", "menuitem");

                    li.appendChild(item);
                    menu.appendChild(li);
                }
            }
            if (group === "crop") {
                var val = "yt:" + group + "=24:10";
                item = document.createElement("span");
                if (val === ytcenter.settings.aspectValue) {
                    item.setAttribute("style", "background:#555!important;color:#FFF!important;");
                }
                item.className = "yt-uix-button-menu-item";
                item.setAttribute("role", "menuitem");
                item.setAttribute("onclick", ";return false;");
                item.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_24:10");
                ytcenter.language.addLocaleElement(item, "BUTTON_ASPECT_24:10", "@textContent");
                ytcenter.utils.addEventListener(item, "click", (function(val, group, child){
                    return function(){
                        var val = "yt:" + group + "=24:10";
                        playerAspectTMP = val;
                        if (ytcenter.settings.aspectSave) {
                            ytcenter.settings['aspectValue'] = val;
                        }
                        for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
                            if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
                                this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
                            }
                        }
                        this.setAttribute("style", "background:#555!important;color:#FFF!important;");
                        ytcenter.saveSettings();
                        ytcenter.player.aspect(val);
                    };
                })(val, group, child), false);
                var li = document.createElement("li");
                li.setAttribute("role", "menuitem");

                li.appendChild(item);
                menu.appendChild(li);
            }
        }
    }

    item = document.createElement("div");
    item.style.padding = "7px 9px 0 9px";
    item.style.borderTop = "1px #555 solid";
    var itemLabel = document.createElement("label");
    var label = document.createTextNode(ytcenter.language.getLocale("SETTINGS_ASPECT_REMEMBER"));
    itemLabel.appendChild(label);
    ytcenter.language.addLocaleElement(label, "SETTINGS_ASPECT_REMEMBER", "@textContent");

    var itemCheckbox = $CreateCheckbox(ytcenter.settings.aspectSave);
    itemCheckbox.style.marginLeft = "3px";

    ytcenter.utils.addEventListener(itemLabel, "click", function(){
        ytcenter.settings.aspectSave = !ytcenter.settings.aspectSave;
        if (ytcenter.settings.aspectSave) {
            ytcenter.utils.addClass(itemCheckbox, "checked");
            ytcenter.settings.aspectValue = playerAspectTMP;
        } else {
            ytcenter.utils.removeClass(itemCheckbox, "checked");
        }
        ytcenter.saveSettings();
    }, false);


    itemLabel.appendChild(itemCheckbox);

    item.appendChild(itemLabel);

    menu.appendChild(item);

    btn.appendChild(menu);

    ytcenter.placementsystem.addElement("ytcenter", "aspectbtn", btn);
}

function $CreateResizeButton() {
    function getItemTitle(item) {
        var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
        if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
            return item.config.customName;
        } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
            return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
        } else {
            return dim[0] + "×" + dim[1];
        }
    }
    function getItemSubText(item) {
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
            return ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER") + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        } else {
            return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER") + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        }
    }
    function setValue(id) {
        var item;
        ytcenter.utils.each(ytcenter.settings["resize-playersizes"], function(i, val){
            if (val.id !== ytcenter.player.currentResizeId) return;
            item = val;
            return false;
        });
    }
    function updateItems(items) {
        menu.innerHTML = "";
        var db = [];
        ytcenter.utils.each(items, function(i, item){
            var li = document.createElement("li");
            li.setAttribute("role", "menuitem");
            var span = document.createElement("span");
            db.push(span);

            span.className = "yt-uix-button-menu-item" + (ytcenter.player.currentResizeId === item.id ? " ytcenter-resize-dropdown-selected" : "");
            span.style.paddingBottom = "12px";

            if (ytcenter.player.currentResizeId === item.id) {
                setValue(ytcenter.player.currentResizeId);
            }

            var title = document.createElement("span");
            title.textContent = getItemTitle(item);
            ytcenter.events.addEvent("ui-refresh", function(){
                title.textContent = getItemTitle(item);
            });
            title.style.display = "block";
            title.style.fontWeight = "bold";
            var subtext = document.createElement("span");
            subtext.textContent = getItemSubText(item);
            ytcenter.events.addEvent("ui-refresh", function(){
                subtext.textContent = getItemSubText(item);
            });
            subtext.style.display = "block";
            subtext.style.fontSize = "11px";
            subtext.style.lineHeight = "0px";

            ytcenter.utils.addEventListener(li, "click", function(){
                try {
                    ytcenter.player.currentResizeId = item.id;
                    ytcenter.player.updateResize();
                    setValue(ytcenter.player.currentResizeId);

                    try {
                        document.body.click();
                    } catch (e) {
                        con.error(e);
                    }

                    ytcenter.utils.each(db, function(_i, elm){
                        ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
                    });
                    ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
                } catch (e) {
                    con.error(e);
                }
            });

            span.appendChild(title);
            span.appendChild(subtext);
            li.appendChild(span);

            menu.appendChild(li);
        });
    }
    var btnLabel = ytcenter.gui.createYouTubeButtonTextLabel("BUTTON_RESIZE_TEXT");

    var menu = document.createElement("ul");
    menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
    menu.setAttribute("role", "menu");

    var arrow = ytcenter.gui.createYouTubeButtonArrow();

    var btn = ytcenter.gui.createYouTubeButton("BUTTON_RESIZE_TOOLTIP", [btnLabel, arrow, menu]);
    btn.style.textAlign = "left";
    if (ytcenter.settings.resizeEnable && ytcenter.settings.enableResize) {
        ytcenter.utils.removeClass(btn, "hid");
    } else {
        ytcenter.utils.addClass(btn, "hid");
    }

    updateItems(ytcenter.settings["resize-playersizes"]);
    ytcenter.events.addEvent("settings-update", function(){
        updateItems(ytcenter.settings["resize-playersizes"]);
    });
    ytcenter.player.resizeCallback.push(function(){
        updateItems(ytcenter.settings["resize-playersizes"]);
    });

    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.resizeEnable && ytcenter.settings.enableResize) {
            ytcenter.utils.removeClass(btn, "hid");
        } else {
            ytcenter.utils.addClass(btn, "hid");
        }
    });
    ytcenter.placementsystem.addElement("ytcenter", "resizebtn", btn);
}

function $CreateCheckbox(_checked) {
    var checked = _checked || false;
    var cont = document.createElement("span");
    cont.className = "yt-uix-form-input-checkbox-container" + (checked ? " checked" : "");

    var inp = document.createElement("input");
    inp.setAttribute("type", "checkbox");
    inp.className = "yt-uix-form-input-checkbox";
    inp.value = "true";
    if (checked) {
        inp.checked = "checked";
    }

    var span = document.createElement("span");
    span.className = "yt-uix-form-input-checkbox-element";

    cont.appendChild(inp);
    cont.appendChild(span);

    return cont;
}

function $CreateLightButton() {
    var btn = document.createElement("button");
    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.lightbulbEnable) {
            ytcenter.utils.removeClass(btn, "hid");
        } else {
            ytcenter.utils.addClass(btn, "hid");
        }
    });
    btn.setAttribute("onclick", ";return false;");
    btn.setAttribute("type", "button");
    btn.setAttribute("role", "button");
    btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.lightbulbEnable ? "" : " hid") + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
    btn.title = ytcenter.language.getLocale("LIGHTBULB_TOOLTIP");
    //btn.style.marginLeft = ".5em";
    ytcenter.language.addLocaleElement(btn, "LIGHTBULB_TOOLTIP", "title");
    var s = document.createElement("span");
    s.className = "yt-uix-button-content";
    var icon = document.createElement("img");
    icon.setAttribute("alt", "");
    icon.src = ytcenter.icon.lightbulb;
    s.appendChild(icon);
    btn.appendChild(s);

    ytcenter.utils.addEventListener(btn, "click", function(){
        ytcenter.player.toggleLights();
    }, false);

    ytcenter.placementsystem.addElement("ytcenter", "lightbtn", btn);
}
function $CreateRepeatButton() {
    var btn = document.createElement("button");
    btn.style.margin = "0 2px 0 0";
    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.enableRepeat) {
            ytcenter.utils.removeClass(btn, 'hid');
        } else {
            ytcenter.utils.addClass(btn, 'hid');
        }
    });
    btn.title = ytcenter.language.getLocale("BUTTON_REPEAT_TOOLTIP");
    ytcenter.language.addLocaleElement(btn, "BUTTON_REPEAT_TOOLTIP", "title");
    btn.setAttribute("role", "button");
    btn.setAttribute("type", "button");
    btn.setAttribute("onclick", ";return false;");
    btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.autoActivateRepeat ? " ytcenter-uix-button-toggled" : " yt-uix-button-text") + (ytcenter.settings.enableRepeat ? "" : " hid");
    ytcenter.utils.addEventListener(btn, "click", function(){
        if (ytcenter.doRepeat) {
            ytcenter.utils.removeClass(this, 'ytcenter-uix-button-toggled');
            ytcenter.utils.addClass(this, 'yt-uix-button-text');
            ytcenter.doRepeat = false;
        } else {
            ytcenter.utils.addClass(this, 'ytcenter-uix-button-toggled');
            ytcenter.utils.removeClass(this, 'yt-uix-button-text');
            ytcenter.doRepeat = true;
        }
    }, false);
    if (ytcenter.settings.autoActivateRepeat) {
        ytcenter.doRepeat = true;
    } else {
        ytcenter.doRepeat = false;
    }

    var iconw = document.createElement("span");
    iconw.className = "yt-uix-button-icon-wrapper";
    if (!ytcenter.settings.repeatShowIcon) {
        iconw.style.display = "none";
    }
    var icon = document.createElement("img");
    icon.className = "yt-uix-button-icon " + (ytcenter.watch7 ? "ytcenter-repeat-icon" : "yt-uix-button-icon-playlist-bar-autoplay");
    icon.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
    if (!ytcenter.watch7) {
        icon.style.background = "no-repeat url(//s.ytimg.com/yts/imgbin/www-refresh-vflMaphyY.png) -173px -60px";
        icon.style.width = "20px";
        icon.style.height = "17px";
    }
    /*icon.style.width = "20px";
     icon.style.height = "18px";
     icon.style.background = "no-repeat url(//s.ytimg.com/yt/imgbin/www-master-vfl8ZHa_q.png) -303px -38px";*/
    icon.setAttribute("alt", "");
    iconw.appendChild(icon);

    btn.appendChild(iconw);

    var t = document.createElement("span");
    t.className = "yt-uix-button-content";
    t.textContent = ytcenter.language.getLocale("BUTTON_REPEAT_TEXT");
    ytcenter.language.addLocaleElement(t, "BUTTON_REPEAT_TEXT", "@textContent");

    if (!ytcenter.settings.repeatShowText) {
        t.style.display = "none";
    }

    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.repeatShowIcon) {
            iconw.style.display = "";
        } else {
            iconw.style.display = "none";
        }
        if (ytcenter.settings.repeatShowText) {
            t.style.display = "";
        } else {
            t.style.display = "none";
        }
    });

    btn.appendChild(t);

    ytcenter.placementsystem.addElement("ytcenter", "repeatbtn", btn);
}

function $DownloadButtonStream() {
    var priority = ['small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'highres'];
    var stream;
    var format = (function(){
        for (var i = 0; i < ytcenter.video.format.length; i++) {
            if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                return ytcenter.video.format[i].type;
            }
        }
        return ytcenter.language.getLocale("UNKNOWN");
    })();
    for (var i = 0; i < ytcenter.video.streams.length; i++) {
        if ((stream == null || $ArrayIndexOf(priority, ytcenter.video.streams[i].quality) > $ArrayIndexOf(priority, stream.quality)) && $ArrayIndexOf(priority, ytcenter.video.streams[i].quality) <= $ArrayIndexOf(priority, ytcenter.settings.downloadQuality) && ytcenter.video.streams[i].type && ytcenter.video.streams[i].type.indexOf(format) == 0 && ytcenter.video.streams[i].url) {
            stream = ytcenter.video.streams[i];
        }
    }
    return stream;
}
function $CreateDownloadButton() {
    if (identifier === 8) return; // The Chrome Webstore version of @name@ has the download feature disabled.
    var g = document.createElement("span");
    g.style.margin = "0 2px 0 0";
    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.enableDownload) {
            ytcenter.utils.removeClass(g, "hid");
            g.style.display = "";
        } else {
            ytcenter.utils.addClass(g, "hid");
            g.style.display = "none";
        }
    });
    g.className = "yt-uix-button-group" + (ytcenter.settings.enableDownload ? "" : " hid");
    if (!ytcenter.settings.enableDownload) {
        g.style.display = "none";
    }

    var stream = $DownloadButtonStream();

    var btn1a = document.createElement("a");
    if (stream) {
        btn1a.setAttribute("href", ytcenter.video.downloadLink(stream));
        btn1a.setAttribute("download", ytcenter.video.getFilename(stream) + ytcenter.video.getFilenameExtension(stream));
    }
    btn1a.setAttribute("target", "_blank");
    ytcenter.events.addEvent("ui-refresh", function(){
        stream = $DownloadButtonStream();
        if (stream) {
            btn1a.setAttribute("href", ytcenter.video.downloadLink(stream));
            btn1a.setAttribute("download", ytcenter.video.getFilename(stream) + ytcenter.video.getFilenameExtension(stream));
        }
    });

    var btn1 = document.createElement("button");
    btn1.className = "start yt-uix-button yt-uix-tooltip" + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
    //btn1.setAttribute("onclick", ";return false;");
    btn1.setAttribute("type", "button");
    btn1.setAttribute("role", "button");
    ytcenter.utils.addEventListener(btn1, "click", function(e){
        if (!ytcenter.settings.downloadAsLinks) {
            stream = $DownloadButtonStream();
            if (stream) {
                ytcenter.video.download(stream.itag);
            }
            e.preventDefault();
        }
    }, false);

    if (stream != null) {
        var stream_name = {
            highres: ytcenter.language.getLocale("HIGHRES"),
            hd1440: ytcenter.language.getLocale("HD1440"),
            hd1080: ytcenter.language.getLocale("HD1080"),
            hd720: ytcenter.language.getLocale("HD720"),
            large: ytcenter.language.getLocale("LARGE"),
            medium: ytcenter.language.getLocale("MEDIUM"),
            small: ytcenter.language.getLocale("SMALL")
        }[stream.quality];
        btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP"), {
            stream_name: stream_name,
            stream_resolution: (stream.dimension ? stream.dimension.split("x")[1] + "p" : "N/A"),
            stream_dimension: stream.dimension,
            stream_3d: (stream.stereo3d && stream.stereo3d == 1 ? "&nbsp;3D" : ""),
            stream_type: (function(stream){
                for (var i = 0; i < ytcenter.video.format.length; i++) {
                    if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                        return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                    }
                }
                return ytcenter.language.getLocale("UNKNOWN");
            })(stream)
        });
    } else {
        btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP_NONE"), {
            type: (function(){
                for (var i = 0; i < ytcenter.video.format.length; i++) {
                    if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                        return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                    }
                }
                return ytcenter.language.getLocale("UNKNOWN");
            })()
        });
    }
    ytcenter.events.addEvent("ui-refresh", function(){
        var stream = $DownloadButtonStream();
        if (stream != null) {
            var stream_name = {
                highres: ytcenter.language.getLocale("HIGHRES"),
                hd1440: ytcenter.language.getLocale("HD1440"),
                hd1080: ytcenter.language.getLocale("HD1080"),
                hd720: ytcenter.language.getLocale("HD720"),
                large: ytcenter.language.getLocale("LARGE"),
                medium: ytcenter.language.getLocale("MEDIUM"),
                small: ytcenter.language.getLocale("SMALL")
            }[stream.quality];

            btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP"), {
                stream_name: stream_name,
                stream_resolution: (stream.dimension ? stream.dimension.split("x")[1] + "p" : "N/A"),
                stream_dimension: stream.dimension,
                stream_3d: (stream.stereo3d && stream.stereo3d == 1 ? " 3D" : ""),
                stream_type: (function(stream){
                    for (var i = 0; i < ytcenter.video.format.length; i++) {
                        if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                            return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                        }
                    }
                    return ytcenter.language.getLocale("UNKNOWN");
                })(stream)
            });
        } else {
            btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP_NONE"), {
                type: (function(){
                    for (var i = 0; i < ytcenter.video.format.length; i++) {
                        if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                            return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                        }
                    }
                    return ytcenter.language.getLocale("UNKNOWN");
                })()
            });
        }
    });
    btn1a.appendChild(btn1);
    var btn1_text = document.createElement("span");
    btn1_text.className = "yt-uix-button-content";
    btn1_text.textContent = ytcenter.language.getLocale("BUTTON_DOWNLOAD_TEXT");
    ytcenter.language.addLocaleElement(btn1_text, "BUTTON_DOWNLOAD_TEXT", "@textContent");
    btn1.appendChild(btn1_text);
    g.appendChild(btn1a);
    var btn2 = document.createElement("button");
    btn2.className = "end yt-uix-button yt-uix-tooltip" + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
    btn2.setAttribute("onclick", ";return false;");
    btn2.setAttribute("type", "button");
    btn2.setAttribute("role", "button");
    btn2.title = ytcenter.language.getLocale("BUTTON_DOWNlOAD2_TOOLTIP");
    ytcenter.language.addLocaleElement(btn2, "BUTTON_DOWNlOAD2_TOOLTIP", "title");
    var img = document.createElement("img");
    img.className = "yt-uix-button-arrow";
    img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
    img.setAttribute("alt", "");
    img.style.marginLeft = "0px";
    img.style.marginRight = "0px";
    btn2.appendChild(img);

    var stream_groups = (function(){
        var groups = (function(){
            var obj = {};
            for (var i = 0; i < ytcenter.video.format.length; i++) {
                obj[ytcenter.video.format[i].type] = {
                    label: ytcenter.video.format[i].name,
                    key: ytcenter.video.format[i].key,
                    help: ytcenter.video.format[i].help
                };
            }
            return obj;
        })();
        var sorted = {};
        for (var i = 0; i < ytcenter.video.streams.length; i++) {
            if (ytcenter.video.streams[i].type.indexOf("audio/mp4") !== 0 && (ytcenter.video.streams[i].size || ytcenter.video.streams[i].bitrate)) continue;
            if (ytcenter.video.streams[i].type) {
                var f = ytcenter.video.streams[i].type.split(";")[0];
                if (groups.hasOwnProperty(f)) {
                    if (!sorted[groups[f].label]) sorted[groups[f].label] = {streams: [], key: groups[f].key, help: groups[f].help};
                    sorted[groups[f].label].streams.push(ytcenter.video.streams[i]);
                } else {
                    if (!sorted['UNKNOWN']) sorted['UNKNOWN'] = {streams: [], key: "unknown"};
                    sorted['UNKNOWN'].streams.push(ytcenter.video.streams[i]);
                }
            } else {
                if (!sorted['UNKNOWN']) sorted['UNKNOWN'] = {streams: [], key: "unknown"};
                sorted['UNKNOWN'].streams.push(ytcenter.video.streams[i]);
            }
        }
        return sorted;
    })();

    var menu = document.createElement("ul");
    menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid" + (ytcenter.settings.show3DInDownloadMenu ? "" : " ytcenter-menu-3d-hide");
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-haspopup", "true");
    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.show3DInDownloadMenu) {
            ytcenter.utils.removeClass(menu, "ytcenter-menu-3d-hide");
        } else {
            ytcenter.utils.addClass(menu, "ytcenter-menu-3d-hide");
        }
    });

    for (var key in stream_groups) {
        if (stream_groups.hasOwnProperty(key)) {
            var title = document.createElement("li");
            title.setAttribute("role", "menuitem");
            title.style.color = "#666";
            title.style.fontSize = "0.9166em";
            title.style.paddingLeft = "9px";
            if (key !== "UNKNOWN") {
                var __t = document.createTextNode(ytcenter.language.getLocale(key));
                title.appendChild(__t);
                ytcenter.language.addLocaleElement(__t, key, "@textContent");
                title.className = "ytcenter-downloadmenu-" + stream_groups[key].key;
                if (stream_groups[key].help) {
                    var help = document.createElement("a");
                    help.setAttribute("href", stream_groups[key].help);
                    help.setAttribute("target", "_blank");
                    help.setAttribute("style", "vertical-align: super; font-size: 10px");
                    help.appendChild(document.createTextNode('?'));

                    var replace = {
                        option: {
                            toString: function() { return ytcenter.language.getLocale(key); }
                        }
                    };
                    help.setAttribute("title", ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("SETTINGS_HELP_ABOUT"), replace));
                    ytcenter.language.addLocaleElement(help, "SETTINGS_HELP_ABOUT", "title", replace);
                    title.appendChild(help);
                }
            } else {
                title.className = "ytcenter-downloadmenu-unknown";
                title.textContent = ytcenter.language.getLocale("UNKNOWN");
                ytcenter.language.addLocaleElement(title, "UNKNOWN", "@textContent");
            }
            //stream_groups[key] = stream_groups[key].streams; // Just lazy...
            menu.appendChild(title);

            for (var i = 0; i < stream_groups[key].streams.length; i++) {
                var is3D = (stream_groups[key].streams[i].stereo3d && stream_groups[key].streams[i].stereo3d == 1 ? true : false);
                var item = document.createElement("a");
                if (!stream_groups[key].streams[i].url) {
                    item.style.color = "#A7A7A7";
                    item.style.display = "block";
                    item.style.margin = "0";
                    item.style.padding = "6px 20px";
                    item.style.textDecoration = "none";
                    item.style.whiteSpace = "nowrap";
                    item.style.wordWrap = "normal";
                } else {
                    item.className = "yt-uix-button-menu-item";
                    item.setAttribute("target", "_blank");
                    item.setAttribute("download", ytcenter.video.getFilename(stream_groups[key].streams[i]) + ytcenter.video.getFilenameExtension(stream_groups[key].streams[i]));
                    item.href = ytcenter.video.downloadLink(stream_groups[key].streams[i]);
                    var downloadStreamListener = (function(_stream){
                        return function(e){
                            if (!ytcenter.settings.downloadAsLinks) {
                                ytcenter.video.download(_stream.itag);
                                e.preventDefault();
                            }
                        };
                    })(stream_groups[key].streams[i]);
                    ytcenter.utils.addEventListener(item, "click", downloadStreamListener, false);
                    ytcenter.events.addEvent("ui-refresh", (function(__stream, item, _downloadStreamListener){
                        return function(){
                            item.href = ytcenter.video.downloadLink(__stream);
                            item.setAttribute("download", ytcenter.video.getFilename(__stream) + ytcenter.video.getFilenameExtension(__stream));
                        };
                    })(stream_groups[key].streams[i], item, downloadStreamListener));
                }

                var stream_name = {
                    highres: ytcenter.language.getLocale("HIGHRES"),
                    hd1440: ytcenter.language.getLocale("HD1440"),
                    hd1080: ytcenter.language.getLocale("HD1080"),
                    hd720: ytcenter.language.getLocale("HD720"),
                    large: ytcenter.language.getLocale("LARGE"),
                    medium: ytcenter.language.getLocale("MEDIUM"),
                    small: ytcenter.language.getLocale("SMALL")
                }[stream_groups[key].streams[i].quality];
                var _t = document.createElement("table"), _tb = document.createElement("tbody"), _tr = document.createElement("tr"),  _td = document.createElement("td"), _td2 = document.createElement("td");
                _t.style.width = "100%";
                _t.style.border = "0";
                _t.style.margin = "0";
                _t.style.padding = "0";

                if (stream_groups[key].streams[i].bitrate) {
                    _td.textContent = Math.round(parseInt(stream_groups[key].streams[i].bitrate)/1000) + " Kbps";
                } else {
                    _td.textContent = stream_name + ", " + (stream_groups[key].streams[i].dimension ? stream_groups[key].streams[i].dimension.split("x")[1] : "") + "p (" + (stream_groups[key].streams[i].dimension ? stream_groups[key].streams[i].dimension : "") + ")";
                    _td2.textContent = (is3D ? "&nbsp;3D" : "");
                }

                _tr.appendChild(_td);
                _tr.appendChild(_td2);
                _tb.appendChild(_tr);
                _t.appendChild(_tb);

                item.appendChild(_t);

                ytcenter.events.addEvent("ui-refresh", (function(stream, _is3D, _td, _td2){
                    return function(){
                        var stream_name = {
                            highres: ytcenter.language.getLocale("HIGHRES"),
                            hd1440: ytcenter.language.getLocale("HD1440"),
                            hd1080: ytcenter.language.getLocale("HD1080"),
                            hd720: ytcenter.language.getLocale("HD720"),
                            large: ytcenter.language.getLocale("LARGE"),
                            medium: ytcenter.language.getLocale("MEDIUM"),
                            small: ytcenter.language.getLocale("SMALL")
                        }[stream.quality];
                        if (stream.bitrate) {
                            _td.textContent = Math.round(parseInt(stream.bitrate)/1000) + " Kbps";
                        } else {
                            _td.textContent = stream_name + ", " + (stream.dimension ? stream.dimension.split("x")[1] : "") + "p (" + (stream.dimension ? stream.dimension : "") + ")";
                            _td2.textContent = (_is3D ? "&nbsp;3D" : "");
                        }
                    };
                })(stream_groups[key].streams[i], is3D, _td, _td2));
                var li = document.createElement("li");
                li.className = "ytcenter-downloadmenu-" + (stream_groups[key].key === "UNKNOWN" ? "unknown" : stream_groups[key].key) + (is3D ? " ytcenter-menu-item-3d" : "");
                li.setAttribute("role", "menuitem");
                li.appendChild(item);
                menu.appendChild(li);
            }
        }
    }
    var mp3title = document.createElement("li");
    mp3title.className = (ytcenter.settings.mp3Services == '' ? "hid" : "");
    if (ytcenter.settings.mp3Services === '') {
        mp3title.style.display = "none";
    }
    mp3title.style.color = "#666";
    mp3title.style.fontSize = "0.9166em";
    mp3title.style.paddingLeft = "9px";
    mp3title.textContent = ytcenter.language.getLocale("BUTTON_DOWNLOAD_MENU_MP3SERVICES");
    ytcenter.language.addLocaleElement(mp3title, "BUTTON_DOWNLOAD_MENU_MP3SERVICES", "@textContent");
    ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.mp3Services === '') {
            ytcenter.utils.addClass(mp3title, 'hid');
            mp3title.style.display = "none";
        } else {
            ytcenter.utils.removeClass(mp3title, 'hid');
            mp3title.style.display = "";
        }
    });
    menu.appendChild(mp3title);
    var hasMP3Service = function(value){
        var a = ytcenter.settings.mp3Services.split("&");
        for (var i = 0; i < a.length; i++) {
            if (decodeURIComponent(a[i]) === value) {
                return true;
            }
        }
        return false;
    };
    var removeNonExistentMP3Services = function(){
        var newArr = [];
        var a = ytcenter.settings.mp3Services.split("&");
        for (var i = 0; i < a.length; i++) {
            for (var j = 0; j < ytcenter.mp3services.length; j++) {
                if (ytcenter.mp3services[j].value === decodeURIComponent(a[i])) {
                    newArr.push(a[i]);
                    break;
                }
            }
        }
        ytcenter.settings.mp3Services = newArr.join("&");
    };
    removeNonExistentMP3Services();

    for (var i = 0; i < ytcenter.mp3services.length; i++) {
        var li = document.createElement("li");
        var item = document.createElement("a");
        item.className = "yt-uix-button-menu-item";
        li.setAttribute("role", "menuitem");
        li.className = "ytcenter-downloadmenu-MP3" + (hasMP3Service(ytcenter.mp3services[i].value) ? "" : " hid");
        if (!hasMP3Service(ytcenter.mp3services[i].value)) {
            li.style.display = "none";
        }
        item.setAttribute("href", ytcenter.utils.replaceTextAsString(ytcenter.mp3services[i].value, {
            title: ytcenter.video.title,
            videoid: ytcenter.video.id,
            author: ytcenter.video.author,
            url: loc.href
        }));
        item.setAttribute("target", "_blank");
        var mp3RedirectListener = (function(mp3){
            return function(e){
                if (!ytcenter.settings.downloadAsLinks) {
                    ytcenter.redirect(mp3.value, true);
                    e.preventDefault();
                    return false;
                }
            };
        })(ytcenter.mp3services[i]);
        ytcenter.utils.addEventListener(item, "click", mp3RedirectListener, false);
        ytcenter.events.addEvent("ui-refresh", (function(mp3, li){
            return function(){
                var a = ytcenter.settings.mp3Services.split("&");
                var f = false;
                for (var i = 0; i < a.length; i++) {
                    if (decodeURIComponent(a[i]) === mp3.value) {
                        f = true;
                        break;
                    }
                }
                if (f) {
                    ytcenter.utils.removeClass(li, 'hid');
                    li.style.display = "";
                } else {
                    ytcenter.utils.addClass(li, 'hid');
                    li.style.display = "none";
                }
            };
        })(ytcenter.mp3services[i], li));

        item.textContent = ytcenter.language.getLocale(ytcenter.mp3services[i].label);
        ytcenter.language.addLocaleElement(item, ytcenter.mp3services[i].label, "@textContent");
        li.appendChild(item);
        menu.appendChild(li);
    }


    btn2.appendChild(menu);
    g.appendChild(btn2);

    ytcenter.placementsystem.addElement("ytcenter", "downloadgroup", g);
}
function $CreateSettingsUI() {
    var appbar = document.getElementById("appbar-settings-menu"),
        appSecondaryContainer = document.getElementById("appbar-secondary-container"),
        liSettings = document.createElement("li"),
        spanText = document.createElement("span"),
        textIconContainer = document.createElement("span"),
        textIcon = document.createElement("img"),
        text = null;

    if (ytcenter.feather) {
        var wrapper = document.getElementById("us"),
            aLink = document.createElement("a"),
            gearicon = document.createElement("img");
        gearicon.src = ytcenter.icon.gear;
        gearicon.setAttribute("alt", "");

        aLink.appendChild(gearicon);

        aLink.className = "ml";
        aLink.setAttribute("href", "javascript:void(0);");
        ytcenter.utils.addEventListener(aLink, "click", function(e){
            if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
            ytcenter.settingsPanelDialog.setVisibility(true);

            e && e.preventDefault && e.preventDefault();
            return false;
        }, false);

        aLink.title = ytcenter.language.getLocale("BUTTON_SETTINGS_TITLE");
        ytcenter.language.addLocaleElement(aLink, "BUTTON_SETTINGS_TITLE", "title");

        wrapper.appendChild(aLink);
    } else if (appbar) {
        liSettings.setAttribute("id", "ytcenter-settings-toggler");
        liSettings.setAttribute("role", "menuitem");
        liSettings.className = "yt-uix-button-menu-new-section-separator";

        spanText.className = "yt-uix-button-menu-item upload-menu-item";
        ytcenter.utils.addEventListener(spanText, "click", function(){
            if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
            ytcenter.settingsPanelDialog.setVisibility(true);
        }, false);

        textIconContainer.className = "yt-valign icon-container";

        textIcon.className = "upload-menu-account-settings-icon yt-valign-container";
        textIcon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
        textIconContainer.appendChild(textIcon);

        text = document.createTextNode(ytcenter.language.getLocale("BUTTON_SETTINGS_LABEL"));
        ytcenter.language.addLocaleElement(text, "BUTTON_SETTINGS_LABEL", "@textContent");

        spanText.appendChild(textIconContainer);
        spanText.appendChild(text);

        liSettings.appendChild(spanText);
        appbar.appendChild(liSettings);
    } else if (appSecondaryContainer) {
        var btn = document.createElement("button"),
            iconWrapper = document.createElement("span"),
            icon = document.createElement("img");
        btn.className = "appbar-action-button flip yt-uix-button yt-uix-button-default yt-uix-button-size-default yt-uix-button-has-icon yt-uix-button-empty yt-uix-tooltip";
        btn.title = ytcenter.language.getLocale("BUTTON_SETTINGS_TITLE");
        ytcenter.language.addLocaleElement(btn, "BUTTON_SETTINGS_TITLE", "title");
        btn.setAttribute("type", "button");
        btn.setAttribute("role", "button");
        btn.setAttribute("onclick", ";return false;");

        ytcenter.utils.addEventListener(btn, "click", function(){
            if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
            ytcenter.settingsPanelDialog.setVisibility(true);
        }, false);

        iconWrapper.className = "yt-uix-button-icon-wrapper";

        icon.className = "yt-uix-button-icon yt-uix-button-icon-appbar-settings";
        icon.src = "https://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
        icon.setAttribute("alt", "");
        icon.setAttribute("title", "");

        iconWrapper.appendChild(icon);
        btn.appendChild(iconWrapper);

        appSecondaryContainer.appendChild(btn);
    } else {
        var btn = document.createElement("button");
        btn.id = "masthead-user-button";
        if (document.getElementById("masthead-gaia-photo-expander")) {
            btn.style.marginTop = "3px";
        } else if (document.getElementById("masthead-user-expander")) {
            btn.style.verticalAlign = "middle";
        }
        btn.title = ytcenter.language.getLocale("BUTTON_SETTINGS_TITLE");
        ytcenter.language.addLocaleElement(btn, "BUTTON_SETTINGS_TITLE", "title");
        btn.setAttribute("type", "button");
        btn.setAttribute("role", "button");
        btn.setAttribute("onclick", ";return false;");
        btn.className = "yt-uix-tooltip-reverse yt-uix-button " + (ytcenter.watch7 ? "yt-uix-button-text" : "yt-uix-button-text") + " yt-uix-tooltip";
        var btnt = document.createElement("span");
        btnt.className = "yt-uix-button-icon-wrapper";
        btnt.style.margin = "0";
        var gearicon = document.createElement("img");
        gearicon.src = ytcenter.icon.gear;
        gearicon.setAttribute("alt", "");

        var ytvt = document.createElement("span");
        ytvt.className = "yt-valign-trick";

        btnt.appendChild(gearicon);
        btnt.appendChild(ytvt);
        btn.appendChild(btnt);

        var ytuixbc = document.createElement("span");
        ytuixbc.className = "yt-uix-button-content";
        ytuixbc.textContent = "  ";

        btn.appendChild(ytuixbc);

        ytcenter.utils.addEventListener(btn, "click", function(){
            if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
            ytcenter.settingsPanelDialog.setVisibility(true);
        }, false);

        if (document.getElementById("masthead-user")) {
            document.getElementById("masthead-user").appendChild(btn);
        } else if (document.getElementById("yt-masthead-user")) {
            document.getElementById("yt-masthead-user").appendChild(btn);
        } else if (document.getElementById("yt-masthead-signin")) {
            btn.style.margin = "0 10px";
            document.getElementById("yt-masthead-signin").appendChild(btn);
        } else {
            con.error("Settings UI - Couldn't add settings button");
        }
    }
}