/* YouTube-look-alike GUI elements */

ytcenter.gui = {};
ytcenter.gui.icons = {};
ytcenter.gui.icons.cog = "data:image/png;base64,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";
ytcenter.gui.createMiddleAlignHack = function(content){
    var e = document.createElement("div"),
        a = document.createElement("span");
    a.className = "yt-dialog-align";
    content.style.verticalAlign = "middle";
    content.style.display = "inline-block";

    e.appendChild(a);
    e.appendChild(content);
    return e;
};
ytcenter.gui.createYouTubeButtonIcon = function(src){
    var wrapper = document.createElement("span");
    wrapper.className = "yt-uix-button-icon-wrapper";

    var img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.style.marginLeft = "3px";

    wrapper.appendChild(img);
    return wrapper;
};
ytcenter.gui.createYouTubeButtonArrow = function(){
    var img = document.createElement("img");
    img.className = "yt-uix-button-arrow";
    img.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
    img.alt = "";

    return img;
};
ytcenter.gui.createYouTubeTextInput = function(){
    var elm = document.createElement("input");
    elm.setAttribute("type", "text");
    elm.className = "yt-uix-form-input-text";

    return elm;
};
ytcenter.gui.createYouTubeCheckBox = function(selected){
    if (typeof selected === "undefined") selected = false;
    var cw = document.createElement("span");
    cw.className = "yt-uix-form-input-checkbox-container" + (selected ? " checked" : "");
    cw.style.height = "auto";
    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("value", "true");
    checkbox.className = "yt-uix-form-input-checkbox";
    if (selected) checkbox.checked = true;
    var elm = document.createElement("span");
    elm.className = "yt-uix-form-input-checkbox-element";
    cw.appendChild(checkbox);
    cw.appendChild(elm);

    return cw;
};
ytcenter.gui.createYouTubeButtonText = function(text){
    var wrapper = document.createElement("span");
    wrapper.className = "yt-uix-button-content";

    wrapper.textContent = text;
    return wrapper;
};
ytcenter.gui.createYouTubeButtonTextLabel = function(label){
    var wrapper = document.createElement("span");
    wrapper.className = "yt-uix-button-content";
    wrapper.textContent = ytcenter.language.getLocale(label);
    ytcenter.language.addLocaleElement(wrapper, label, "@textContent");

    return wrapper;
};
ytcenter.gui.createYouTubeButton = function(title, content, styles){
    var btn = document.createElement("button");
    if (typeof title === "string" && title !== "") {
        btn.setAttribute("title", ytcenter.language.getLocale(title));
        ytcenter.language.addLocaleElement(btn, title, "title");
    }
    btn.setAttribute("role", "button");
    btn.setAttribute("type", "button");
    btn.setAttribute("onclick", ";return false;");
    btn.className = "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-text yt-uix-tooltip";

    if (typeof styles !== "undefined") {
        for (var key in styles) {
            if (styles.hasOwnProperty(key)) {
                btn.style[key] = styles[key];
            }
        }
    }

    for (var i = 0; i < content.length; i++) {
        btn.appendChild(content[i]);
    }
    return btn;
};
ytcenter.gui.createYouTubeDefaultButton = function(title, content, styles){
    var btn = document.createElement("button");
    if (title !== "") {
        btn.setAttribute("title", ytcenter.language.getLocale(title));
        ytcenter.language.addLocaleElement(btn, title, "title");
    }
    btn.setAttribute("role", "button");
    btn.setAttribute("type", "button");
    btn.setAttribute("onclick", ";return false;");
    btn.className = "yt-uix-button yt-uix-button-default yt-uix-tooltip";

    if (typeof styles !== "undefined") {
        for (var key in styles) {
            if (styles.hasOwnProperty(key)) {
                btn.style[key] = styles[key];
            }
        }
    }

    for (var i = 0; i < content.length; i++) {
        btn.appendChild(content[i]);
    }
    return btn;
};
ytcenter.gui.createYouTubePrimaryButton = function(title, content, styles){
    var btn = document.createElement("button");
    if (title !== "") {
        btn.setAttribute("title", ytcenter.language.getLocale(title));
        ytcenter.language.addLocaleElement(btn, title, "title");
    }
    btn.setAttribute("role", "button");
    btn.setAttribute("type", "button");
    btn.setAttribute("onclick", ";return false;");
    btn.setAttribute("class", "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-primary yt-uix-tooltip");

    if (typeof styles !== "undefined") {
        for (var key in styles) {
            if (styles.hasOwnProperty(key)) {
                btn.style[key] = styles[key];
            }
        }
    }

    for (var i = 0; i < content.length; i++) {
        btn.appendChild(content[i]);
    }
    return btn;
};
ytcenter.gui.createYouTubeButtonGroup = function(buttons){
    // <span style="margin: 0px 4px 0px 0px;" class="yt-uix-button-group yt-uix-tooltip-reverse"> start end
    var wrapper = document.createElement("span");
    wrapper.className = "yt-uix-button-group";

    for (var i = 0; i < buttons.length; i++) {
        if (i == 0) {
            ytcenter.utils.addClass(buttons[i], "start");
        } else {
            ytcenter.utils.removeClass(buttons[i], "start");
        }
        if (i === buttons.length-1) {
            ytcenter.utils.addClass(buttons[i], "end");
        } else {
            ytcenter.utils.removeClass(buttons[i], "end");
        }
        wrapper.appendChild(buttons[i]);
    }

    return wrapper;
};
ytcenter.gui.createYouTubeGuideHelpBoxAfter = function(){
    var after = document.createElement("div");
    after.className = "after";

    return after;
};
ytcenter.gui.createMask = function(zIndex){
    zIndex = zIndex || "4";
    var iframe = document.createElement("iframe");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("src", "");
    iframe.style.position = "absolute";
    iframe.style.top = "0px";
    iframe.style.left = "0px";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.overflow = "hidden";
    iframe.style.zIndex = zIndex;

    return iframe;
};