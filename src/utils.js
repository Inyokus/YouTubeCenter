/* Various utility functions */

/* The util function "throttle" and "once" has been taken from Underscore.
 * **************************
 * http://underscorejs.org
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Underscore may be freely distributed under the MIT license.
 */

ytcenter.utils = {};
ytcenter.utils.createCustomEvent = function(type, detail) {
    try {
        var e = document.createEvent('CustomEvent');
        if (detail) {
            e.initCustomEvent(type, true, true, detail);
        } else {
            e.initCustomEvent(type, true, true);
        }
        return e;
    } catch (e) {
        var e = new CustomEvent(type);
        if (detail) {
            e.detail = detail;
        }
        return e;
    }
};
ytcenter.utils.ie = (function(){
    for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
    return v > 4 ? v : !!document.documentMode;
}());

ytcenter.utils.throttle = function(func, delay, options){
    function timeout() {
        previous = options.leading === false ? 0 : new Date;
        timer = null;
        result = func.apply(context, args);
    }
    var context, args, result, timer = null, previous = 0;
    options = options || {};
    return function(){
        var now = new Date, dt;

        context = this;
        args = arguments;

        if (!previous && options.leading === false) previous = now;
        dt = delay - (now - previous);

        if (dt <= 0) {
            uw.clearTimeout(timer);
            timer = null;
            previous = now;
            result = func.apply(context, args);
        } else if (!timer && options.trailing !== false) {
            timer = uw.setTimeout(timeout, dt);
        }
        return result;
    };
};

// @utils
ytcenter.utils.getViewPort = function() {
    var width = 0;
    var height = 0;

    if (typeof window.innerWidth === "number") {
        width = window.innerWidth;
        height = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
    }
    return { width: width, height: height };
};
ytcenter.utils.getAbsolutePosition = function(el) {
    var x = el.offsetLeft || 0;
    var y = el.offsetTop || 0;

    if (el.offsetParent) {
        var parentAbsolutePosition = ytcenter.utils.getAbsolutePosition(el.offsetParent);
        x += parentAbsolutePosition.x;
        y += parentAbsolutePosition.y;
    }

    return { x: x, y: y };
};
ytcenter.utils.listClass = function(el) {
    if (!el || !el.className) return [];
    return el.className.split(" ");
};
ytcenter.utils.getLocationOrigin = function(){
    if (loc.origin) {
        return loc.origin;
    } else {
        return loc.protocol + "//" + loc.hostname + (loc.port ? ":" + loc.port: "");
    }
};
ytcenter.utils.getHTML5Player = function(){
    var movie_player = document.getElementById("movie_player");
    if (!movie_player) return null;

    var video = movie_player.getElementsByClassName("html5-main-video")[0];
    return video || null;
};
ytcenter.utils.errorProxy = function(scope, func){
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
        try {
            return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
        } catch (e) {
            console.error(e);
        }
    };
};
ytcenter.utils.funcBind = function(scope, func){
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
        return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
    };
};
(function(){
    var cssElements = {};
    ytcenter.utils.setCustomCSS = function(id, css){
        ytcenter.utils.removeCustomCSS(id);
        if (css) {
            var el = document.createElement("style");
            el.type = "text/css";
            el.textContent = css;
            document.getElementsByTagName('head')[0].appendChild(el);
            cssElements[id] = el;
        }
    };
    ytcenter.utils.removeCustomCSS = function(id){
        if (cssElements.hasOwnProperty(id)) {
            cssElements[id].parentNode.removeChild(cssElements[id]);
            delete cssElements[id];
        }
    };
})();
(function(){
    function loadCanvas(url, rgba) {
        var i;
        for (i = 0; i < tintImages.length; i++) {
            if (url === tintImages[i].url
                && rgba.r === tintImages[i].rgba.r
                && rgba.g === tintImages[i].rgba.g
                && rgba.b === tintImages[i].rgba.b
                && rgba.a === tintImages[i].rgba.a
            ) {
                return tintImages[i].canvas;
            }
        }
    }
    var tintImages = [];
    ytcenter.utils.tintImage = function(url, rgba, callback) {
        function onerror() {
            throw "Couldn't load image!";
        }
        function onload() {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.clearRect(0, 0, img.width, img.height);
            ctx.drawImage(img, 0, 0, img.width, img.height);

            var imageData = ctx.getImageData(0, 0, img.width, img.height);
            var idx, i, pixel;
            for (i = (img.width * img.height); i >= 0; --i) {
                idx = i << 2;
                pixel = {r: imageData.data[idx], g: imageData.data[idx + 1], b: imageData.data[idx + 2]};

                imageData.data[idx] = (rgba.a * rgba.r + (1 - rgba.a) * pixel.r);
                imageData.data[idx + 1] = (rgba.a * rgba.g + (1 - rgba.a) * pixel.g);
                imageData.data[idx + 2] = (rgba.a * rgba.b + (1 - rgba.a) * pixel.b);
            }
            ctx.putImageData(imageData, 0, 0);

            tintImages.push({ url: url, rgba: rgba, canvas: canvas });
            if (tintImages.length > 10) tintImages.splice(0, tintImages.length - 10);
            callback && callback(canvas);
        }
        var cache = loadCanvas(url, rgba);
        if (cache) {
            callback && callback(cache);
            return;
        }

        var canvas = document.createElement("canvas");
        if (!(canvas.getContext && canvas.getContext('2d'))) return null; // Canvas is not supported!
        var ctx = canvas.getContext("2d");

        var img = new Image();
        img.src = url;
        img.onload = onload;
        img.onerror = onerror;
    };
})();
ytcenter.utils.setStyles = function(el, styles){
    var key;
    for (key in styles) {
        if (styles.hasOwnProperty(key)) {
            el.style.setProperty(key, styles[key])
        }
    }
};
ytcenter.utils.filterColor = function(color, ohsv){
    var hsv = ytcenter.utils.getHSV(color.red, color.green, color.blue);

    hsv.hue = Math.round(hsv.hue - ohsv.hue);
    if (hsv.hue < 0) hsv.hue += 360;
    hsv.saturation = Math.round(100 + (hsv.saturation - ohsv.saturation));
    hsv.value = Math.round(100 + (hsv.value - ohsv.value));

    return "hue-rotate(" + hsv.hue + "deg) saturate(" + hsv.saturation + "%) brightness(" + hsv.value + "%)";
};
ytcenter.utils.asyncCall = function(func){
    var args = Array.prototype.splice.call(arguments, 1, arguments.length);
    var proxy = ytcenter.utils.oldBind(func);
    uw.setTimeout(function(){ proxy.apply(null, args); }, 0);
};
ytcenter.utils.getScrollPosition = function(scrollElm){
    var posX = 0;
    var posY = 0;
    while (scrollElm != null) {
        posX += scrollElm.offsetLeft;
        posY += scrollElm.offsetTop;
        scrollElm = scrollElm.offsetParent;
    }
    return { x: posX, y: posY };
};
ytcenter.utils.live = (function(){
    function getElements(query) {
        return document.querySelectorAll(query);
    }
    function isElementParent(el, parent) {
        /*var found = false;
         while (el && !(found = el === parent)) el = el.parentElement;
         return found;*/

        return parent.contains(el);
    }
    function handleElements(elements, e, listener) {
        var i;
        for (i = 0; i < elements.length; i++) {
            if (isElementParent(e.target, elements[i]) && typeof listener.listener === "function") {
                listener.listener.call(e.target, e);
            }
        }
    }
    function onListener(e) {
        var i;
        e = e || win.event;

        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].type === e.type) {
                handleElements(getElements(listeners[i].query), e, listeners[i]);
            }
        }
    }
    function shutdown() {
        listeners = [];
        var i;
        for (i = 0; i < events.length; i++) {
            shutdownEvent(events[i]);
        }
        events = [];
    }
    function shutdownEvent(event) {
        document.removeEventListener(event, onListener, false);
    }
    function setupEvent(event) {
        if (!isEventInitialized(event)) {
            document.addEventListener(event, onListener, false);
        }
    }
    function clean(event) {
        var i;
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].type === event) {
                return;
            }
        }

        shutdownEvent(event);
        for (i = 0; i < events.length; i++) {
            if (events[i] === event) {
                events.splice(i, 1);
                break;
            }
        }
    }
    function isEventInitialized(event) {
        var i;
        for (i = 0; i < events.length; i++) {
            if (events[i] === event)
                return true;
        }
        return false;
    }
    function addEventListener(type, query, listener) {
        setupEvent(type);
        listeners.push({
            type: type,
            query: query,
            listener: listener
        });
    }
    function removeEventListener(type, query, listener) {
        var i;
        for (i = 0; i < listeners.length; i++) {
            if (type === listeners[i].type && query === listeners[i].query && listener === listeners[i].listener) {
                listeners.splice(i, 1);
                return;
            }
        }
    }
    var listeners = [],
        events = [];

    return {
        add: addEventListener,
        rem: removeEventListener,
        unload: shutdown
    };
})();

/* Apparently schedules a function for asap (but async) execution (why not simply use setTimeout(fn, 0)?) */
ytcenter.utils.setZeroTimeout = (function(){
    function setZeroTimeout(fn) {
        timeouts.push(fn);
        window.postMessage(uniqueMessageName, "*");
    }
    function handleMessage(event) {
        if ((event.source === window || event.source === uw) && event.data === uniqueMessageName) {
            event && event.stopPropagation && event.stopPropagation();
            if (timeouts.length > 0) {
                timeouts.shift()();
            }
        }
    }
    var timeouts = [],
        uniqueMessageName = "ytcenter-zero-timeout-message";

    window.addEventListener("message", handleMessage, true);

    return setZeroTimeout;
})();
ytcenter.utils.addEndTransitionListener = function(elm, listener){
    function getTransitionEndKey() {
        var transitions = {
            "transition": "transitionend",
            "WebkitTransition": "webkitTransitionEnd",
            "MozTransition": "transitionend",
            "OTransition": "oTransitionEnd otransitionend"
        }, key;
        for (key in transitions) {
            if (typeof elm.style[key] !== "undefined") {
                return transitions[key];
            }
        }
        return null;
    }
    var transitionKey = getTransitionEndKey();
    if (transitionKey === null) return false;
    transitionKey = transitionKey.split(" ");

    ytcenter.utils.addEventListener(elm, transitionKey[0], listener, false);
    if (transitionKey[1]) {
        ytcenter.utils.addEventListener(elm, transitionKey[1], listener, false);
    }

    return true;
};
ytcenter.utils.removeEndTransitionListener = function(elm, listener){
    function getTransitionEndKey() {
        var transitions = {
            "transition": "transitionend",
            "WebkitTransition": "webkitTransitionEnd",
            "MozTransition": "transitionend",
            "OTransition": "oTransitionEnd otransitionend"
        }, key;
        for (key in transitions) {
            if (typeof elm.style[key] !== "undefined") {
                return transitions[key];
            }
        }
        return null;
    }
    var transitionKey = getTransitionEndKey();
    if (transitionKey === null) return false;
    transitionKey = transitionKey.split(" ");
    ytcenter.utils.removeEventListener(elm, transitionKey[0], listener, false);
    if (transitionKey[1]) {
        ytcenter.utils.removeEventListener(elm, transitionKey[1], listener, false);
    }
    return true;
};
ytcenter.utils.urlComponentToObject = function(str){
    var parts = str.split("&"),
        hash = {},
        i,
        _tmp;
    for (i = 0; i < parts.length; i++) {
        _tmp = parts[i].split("=");
        hash[decodeURIComponent(_tmp[0])] = decodeURIComponent(_tmp[1]);
    }
    return hash;
};
ytcenter.utils.objectToUrlComponent = function(obj){
    var urlComponent = "",
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (urlComponent !== "") urlComponent += "&";
            urlComponent += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
        }
    }
    return urlComponent;
};
ytcenter.utils.cssFix = function(elm){
    var width = elm.style.width;
    elm.style.width = "0px";
    elm.offsetHeight;
    elm.style.width = (width ? width : "");
};
ytcenter.utils.getContentByTags = function(text, startTag, endTag){
    text = text.split(startTag)[1];
    text = text.split(endTag)[0];
    return text;
};
ytcenter.utils.cleanObject = function(obj){
    try {
        if (obj instanceof Object && typeof obj["__exposedProps__"] !== "undefined") delete obj["__exposedProps__"];
    } catch (e) {
        con.error(e);
    }
    var key;
    for (key in obj) {
        if (!obj.hasOwnProperty(key)) {
            delete obj[key];
        } else {
            if (key === "__exposedProps__") {
                delete obj[key];
            } else if (obj[key] instanceof Object) {
                obj[key] = ytcenter.utils.cleanObject(obj[key]);
            }
        }
    }
    return obj;
};

ytcenter.utils.setCaretPosition = function(el, pos){
    if (pos < 0) pos = 0;
    if (pos > el.value.length) pos = el.value.length;

    if (typeof el.selectionStart === "number") {
        el.selectionStart = pos;
        el.selectionEnd = pos;
    } else if (document.selection) {
        el.focus();

        var sel = document.selection.createRange();
        sel.moveStart("character", pos);
        sel.moveEnd("character", 0);
        sel.select();
    }
};
ytcenter.utils.getCaretPosition = function(el){
    var pos = 0;
    if (typeof el.selectionStart === "number") {
        pos = el.selectionStart;
    } else if (document.selection) {
        el.focus();

        var sel = document.selection.createRange();
        sel.moveStart("character", -el.value.length);
        pos = sel.text.length;
    }

    return pos;
};

ytcenter.utils.prefixText = function(text, prefixChar, preferedLength){
    var t = ("" + text);
    if (t.length < preferedLength) {
        var i;
        for (i = 0; i < preferedLength - t.length; i++) {
            t = prefixChar + t;
        }
    }
    return t;
};

ytcenter.utils.replaceContent = function(content, data, start, end) {
    var a = content.indexOf(start)
    b = content.indexOf(end);
    return content.substring(0, a + start.length) + JSON.stringify(data) + content.substring(b);
}

/* Code taken from https://code.google.com/p/doctype-mirror/wiki/ArticleNodeContains */
ytcenter.utils.contains = function(parent, descendant){
    // W3C DOM Level 3
    if (typeof parent.compareDocumentPosition != 'undefined') {
        return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16);
    }

    // W3C DOM Level 1
    while (descendant && parent != descendant) {
        descendant = descendant.parentNode;
    }
    return descendant == parent;
};
ytcenter.utils.toArray = function(list){
    var arr = [], i, len = list.length;
    for (i = 0; i < len; i++) {
        arr.push(list[i]);
    }
    return arr;
};
ytcenter.utils.scrollTop = function(scrollTop){
    if (!document) return null;
    if (typeof scrollTop === "number") {
        con.log("[scrollTop] Scrolling to y-position: " + scrollTop);
        window.scroll(0, scrollTop);
    } else if (typeof scrollTop === "object" && scrollTop.scrollIntoView) {
        con.log("[scrollTop] Scrolling to element.");
        scrollTop.scrollIntoView(true);
    }
    if (document.body && typeof document.body.scrollTop === "number") {
        return document.body.scrollTop;
    } else {
        return document.documentElement.scrollTop;
    }
};
/**
 * Checks if an element is a child of parent.
 *
 * @method isParent
 * @param {HTMLElement} parent The parent element.
 * @param {HTMLElement} child The child element.
 * @return {Boolean} Returns true if the child element is a child of the parent element.
 **/
ytcenter.utils.isParent = function(parent, child){
    if (parent && child && typeof parent.contains === "function") {
        return parent.contains(child);
    }

    var children = parent.getElementsByTagName(child.tagName);
    for (var i = 0, len = children.length; i < len; i++) {
        if (children[i] === child) {
            return true;
        }
    }
    return false;
};
ytcenter.utils.once = function(func) {
    var ran = false, memo;
    return function() {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
    };
};

ytcenter.utils.isContainerOverflowed = function(a){ // Possible going to use this one
    // AKA Is the container bigger on the inside than the outside?
    return {
        x: a.scrollWidth > a.clientWidth,
        y: a.scrollHeight > a.clientHeight
    };
};
ytcenter.utils.isScrollable = function(a){
    var b = ytcenter.utils.getOverflow(a);
    if (!b.x && !b.y) return false;
    return {
        x: b.x && a.scrollWidth > a.clientWidth,
        y: b.y && a.scrollHeight > a.clientHeight
    };
};
ytcenter.utils.getOverflow = function(a){
    var b = ytcenter.utils.getComputedStyles(a),
        c = {
            auto: true,
            scroll: true,
            visible: false,
            hidden: false
        };
    return { x: c[b.overflowX.toLowerCase()], y: c[b.overflowY.toLowerCase()] };
};
ytcenter.utils.getComputedStyles = function(a){
    if (!a) return {};
    if (document && document.defaultView && document.defaultView.getComputedStyle)
        return document.defaultView.getComputedStyle(a, null);
    return a.currentStyle;
};
ytcenter.utils.getComputedStyle = function(a, b) {
    return ytcenter.utils.getComputedStyles(a)[b];
};
ytcenter.utils.getBoundingClientRect = function(a) {
    var b;
    if (!a) return null;
    try {
        b = a.getBoundingClientRect();
        b = {
            left: b.left,
            top: b.top,
            right: b.right,
            bottom: b.bottom
        };
    } catch (c) {
        return {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        }
    }
    if (a.ownerDocument.body) {
        a = a.ownerDocument;
        b.left -= a.documentElement.clientLeft + a.body.clientLeft;
        b.top -= a.documentElement.clientTop + a.body.clientTop;
    }
    return b;
};
ytcenter.utils.getDimension = function(elm){
    if (!elm) return { width: 0, height: 0 };
    return { width: elm.offsetWidth, height: elm.offsetHeight };
};
ytcenter.utils.isElementPartlyInView = function(elm, offset, winDim){
    var box = ytcenter.utils.getBoundingClientRect(elm) || { left: 0, top: 0, right: 0, bottom: 0 },
        dim = ytcenter.utils.getDimension(elm), a = elm, b, c, d;
    offset = offset || { top: 0, left: 0 };

    winDim = winDim || {width: window.innerWidth || document.documentElement.clientWidth, height: window.innerHeight || document.documentElement.clientHeight };

    return (box.top + offset.top >= 0 - dim.height
    && box.left + offset.left >= 0 - dim.width
    && box.bottom + offset.top <= winDim.height + dim.height
    && box.right + offset.left <= winDim.width + dim.width);
};
ytcenter.utils.isElementInView = function(elm){ // TODO Implement scrollable elements support.
    if (ytcenter.utils.getComputedStyle(elm, "display").toLowerCase() === "none")
        return false;
    var box = ytcenter.utils.getBoundingClientRect(elm) || { left: 0, top: 0, right: 0, bottom: 0 }, a = elm, b, c;
    while (!!(a = a.parentNode) && a !== document.body) {
        if (ytcenter.utils.getComputedStyle(a, "display").toLowerCase() === "none")
            return false;
        b = ytcenter.utils.isContainerOverflowed(a);
        if (b.x || b.y) {
            c = ytcenter.utils.getBoundingClientRect(a) || { left: 0, top: 0, right: 0, bottom: 0 };
            c.top = c.top - box.top + a.scrollTop;
            c.left = c.left - box.left + a.scrollLeft;
            c.bottom = c.bottom - box.bottom + a.scrollTop;
            c.right = c.right - box.right + a.scrollLeft;
            if (!(c.top >= 0 && c.left >= 0 && c.bottom <= a.clientHeight && c.right <= a.clientWidth))
                return false;
            // We now know that the element is visible in the parent and therefore we can just check if the parent is visible ~magic.
            return ytcenter.utils.isElementInView(a);
        }
    };
    return (box.top >= 0
    && box.left >= 0
    && box.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && box.right <= (window.innerWidth || document.documentElement.clientWidth));
};
ytcenter.utils.getVideoIdFromLink = function(url){
    var videoIdRegex = /v=([a-zA-Z0-9-_]+)/,
        indexRegex = /index=([0-9]+)/,
        videoIdsRegex = /video_ids=([0-9a-zA-Z-_%]+)/,
        i = 0, a;
    if (url.match(videoIdRegex)) {
        a = videoIdRegex.exec(url);
        if (a && a[1]) return a[1];
    } else if (url.match(videoIdsRegex)) {
        a = indexRegex.exec(url);
        if (a && a[1]) {
            i = parseInt(a[1]);
        }

        a = videoIdsRegex.exec(url);
        if (a && a[1] && a[1].split("%2C").length > 0 && a[1].split("%2C")[i]) {
            return a[1].split("%2C")[i];
        }
    }

    return null;
};
ytcenter.utils.replaceTextAsString = function(text, rep) {
    if (!text) return text;
    var tmp = "";
    var startB = false;
    var func = "";
    var tmpName = "";
    var tmpFunc = "";
    var inFunc = false;
    for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) == "{" && !startB && !inFunc) {
            startB = true;
        } else if (text.charAt(i) == "}" && startB) {
            var t = tmpName;
            for (var key in rep) {
                if (rep.hasOwnProperty(key)) {
                    if (key === tmpName) {
                        tmpName = "";
                        t = rep[key];
                        break;
                    }
                }
            }
            tmp += t;
            startB = false;
        } else if (startB) {
            if (tmpName == "" && text.charAt(i) == "!") {
                tmp += "{";
                startB = false;
            } else {
                tmpName += text.charAt(i);
            }
        } else {
            tmp += text.charAt(i);
        }
    }
    return tmp;
};
ytcenter.utils.replaceTextToText = function(text, replacer){
    var regex, arr = [], tmp = "";
    text = text || "";
    for (key in replacer) {
        if (replacer.hasOwnProperty(key)) {
            arr.push(ytcenter.utils.escapeRegExp(key));
        }
    }
    regex = new RegExp(arr.join("|") + "|.", "g");
    text.replace(regex, function(matched){
        if (replacer[matched]) {
            if (typeof replacer[matched] === "function") {
                var a = replacer[matched]();
                if (typeof a === "string") {
                    tmp += a;
                } else {
                    con.error("[TextReplace] Unknown type of replacer!");
                }
            } else if (typeof replacer[matched] === "string") {
                tmp += replacer[matched];
            } else if (typeof replacer[matched] === "number") {
                tmp += replacer[matched];
            } else {
                con.error("[TextReplace] Unknown type of replacer!");
            }
        } else {
            tmp += matched;
        }
    });

    return tmp;
};
ytcenter.utils.guid = function(){
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};
ytcenter.utils.srtTimeFormat = function(totalSeconds){
    var sec_num = Math.floor(totalSeconds),
        hours = Math.floor(sec_num / 3600),
        minutes = Math.floor((sec_num - (hours * 3600)) / 60),
        seconds = sec_num - (hours * 3600) - (minutes * 60),
        milliseconds = Math.round((totalSeconds - sec_num)*100);
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    if (milliseconds < 100) milliseconds = "0" + milliseconds;
    if (milliseconds < 10) milliseconds = "0" + milliseconds;
    return hours + ":" + minutes + ":" + seconds + "," + milliseconds;
};
ytcenter.utils.parseXML = function(rawxml){
    var doc;
    if (uw.DOMParser) {
        var parser = new uw.DOMParser();
        doc = parser.parseFromString(rawxml, "text/xml");
    } else if (uw.ActiveXObject) {
        doc = new uw.ActiveXObject("Microsoft.XMLDOM");
        doc.async = false;
        doc.loadXML(rawxml);
    } else {
        throw new Error("[XMLParser] Cannot parse XML!");
    }
    return doc;
};
ytcenter.utils.getURL = function(url){
    var a = document.createElement("a");
    a.href = url;
    return a;
};
ytcenter.utils.wrapModule = function(module, tagname){
    var a = document.createElement(tagname || "span");
    a.appendChild(module.element);
    return a;
};
ytcenter.utils.transformToArray = function(domArray){
    var a = [], i;
    for (i = 0; i < domArray.length; i++) {
        a.push(domArray[i]);
    }
    return a;
};
ytcenter.utils.decodeHTML = function(a){
    return a.replace(/&([^;]+);/g, function(a, c){
        switch (c) {
            case "amp":
                return "&";
            case "lt":
                return "<";
            case "gt":
                return ">";
            case "quot":
                return '"';
            default:
                if ("#" == c.charAt(0)) {
                    var d = Number("0" + c.substr(1));
                    if (!isNaN(d)) return String.fromCharCode(d)
                }
                return a
        }
    })
};
ytcenter.utils.decode = function(a){
    var b = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"'
    }, c = window.document.createElement("div");
    return a.replace(/&([^;\s<&]+);?/g, function(a, e){
        var g = b[a];
        if (g) return g;
        if ("#" == e.charAt(0)) {
            var h = Number("0" + e.substr(1));
            (0, window.isNaN)(h) || (g = String.fromCharCode(h))
        }
        g || (c.innerHTML = a + " ", g = c.firstChild.nodeValue.slice(0, -1));
        return b[a] = g
    })
};
ytcenter.utils.encodeRawTag = function(text){
    var a = document.createElement("a"),
        b = document.createElement("div");
    a.setAttribute("class", text);
    b.appendChild(a);
    return b.innerHTML.substring("<a class=\"".length, b.innerHTML.length - "\"></a>".length);
};
ytcenter.utils.decodeRawTag = function(text){
    var a = document.createElement("div");
    a.innerHTML = "<a class=\"" + text + "\"></a>";
    return a.firstChild.getAttribute("class");
};
ytcenter.utils.setterGetterClassCompatible = function(){
    try {
        var a_getter = false, a_setter = false, a_instance, a_confirm = "WORKS";
        a_instance = defineLockedProperty({}, "test", function(value){a_setter = value === a_confirm}, function(){a_getter = true;return a_confirm;});
        if (a_confirm === a_instance.test) {
            a_instance.test = a_confirm;
            if (a_getter && a_setter)
                return true;
        }
    } catch (e) {
        con.error(e);
        return false;
    }
    return false;
};
ytcenter.utils.isNode = function(a){
    if (typeof Node === "object") {
        return a instanceof Node;
    } else if (a && typeof a === "object" && typeof a.nodeType === "number" && typeof a.nodeName === "string") {
        return true;
    }
    return false;
};
ytcenter.utils.escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

ytcenter.utils.replaceTextAsString = function(text, rep) {
    if (!text) return text;
    var tmp = "";
    var startB = false;
    var func = "";
    var tmpName = "";
    var tmpFunc = "";
    var inFunc = false;
    for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) == "{" && !startB && !inFunc) {
            startB = true;
        } else if (text.charAt(i) == "}" && startB) {
            var t = tmpName;
            for (var key in rep) {
                if (rep.hasOwnProperty(key)) {
                    if (key === tmpName) {
                        tmpName = "";
                        t = rep[key];
                        break;
                    }
                }
            }
            tmp += t;
            startB = false;
        } else if (startB) {
            if (tmpName == "" && text.charAt(i) == "!") {
                tmp += "{";
                startB = false;
            } else {
                tmpName += text.charAt(i);
            }
        } else {
            tmp += text.charAt(i);
        }
    }
    return tmp;
};
/** This will replace strings in a text with other strings or HTML elements.
 * replacer :  {
     *                "__REPLACEDSTRING__": document.createElement("div"),
     *                "{REPLACESTRING}": "ANOTHER STRING"
     *             }
 */
ytcenter.utils.replaceText = function(text, replacer){
    var frag = document.createDocumentFragment(),
        regex, arr = [], tmp = "";
    for (key in replacer) {
        if (replacer.hasOwnProperty(key)) {
            arr.push(ytcenter.utils.escapeRegExp(key));
        }
    }
    regex = new RegExp(arr.join("|") + "|.", "g");
    text.replace(regex, function(matched){
        if (replacer[matched]) {
            if (tmp !== "") {
                frag.appendChild(document.createTextNode(tmp));
                tmp = "";
            }
            if (typeof replacer[matched] === "function") {
                var a = replacer[matched]();
                if (typeof a === "string") {
                    frag.appendChild(document.createTextNode(a));
                } else if (ytcenter.utils.isNode(a)) {
                    frag.appendChild(a);
                } else {
                    con.error("[TextReplace] Unknown type of replacer!");
                }
            } else if (typeof replacer[matched] === "string") {
                frag.appendChild(document.createTextNode(replacer[matched]));
            } else if (ytcenter.utils.isNode(replacer[matched])) {
                frag.appendChild(replacer[matched]);
            } else {
                con.error("[TextReplace] Unknown type of replacer!");
            }
        } else {
            tmp += matched;
        }
    });
    if (tmp !== "") {
        frag.appendChild(document.createTextNode(tmp));
        tmp = "";
    }

    return frag;
};
ytcenter.utils._escape_html_entities = [
    ["&nbsp;", "&iexcl;", "&cent;", "&pound;", "&curren;", "&yen;", "&brvbar;", "&sect;", "&uml;", "&copy;", "&ordf;", "&laquo;", "&not;", "&shy;", "&reg;", "&macr;", "&deg;", "&plusmn;", "&sup2;", "&sup3;", "&acute;", "&micro;", "&para;", "&middot;", "&cedil;", "&sup1;", "&ordm;", "&raquo;", "&frac14;", "&frac12;", "&frac34;", "&iquest;", "&Agrave;", "&Aacute;", "&Acirc;", "&Atilde;", "&Auml;", "&Aring;", "&AElig;", "&Ccedil;", "&Egrave;", "&Eacute;", "&Ecirc;", "&Euml;", "&Igrave;", "&Iacute;", "&Icirc;", "&Iuml;", "&ETH;", "&Ntilde;", "&Ograve;", "&Oacute;", "&Ocirc;", "&Otilde;", "&Ouml;", "&times;", "&Oslash;", "&Ugrave;", "&Uacute;", "&Ucirc;", "&Uuml;", "&Yacute;", "&THORN;", "&szlig;", "&agrave;", "&aacute;", "&acirc;", "&atilde;", "&auml;", "&aring;", "&aelig;", "&ccedil;", "&egrave;", "&eacute;", "&ecirc;", "&euml;", "&igrave;", "&iacute;", "&icirc;", "&iuml;", "&eth;", "&ntilde;", "&ograve;", "&oacute;", "&ocirc;", "&otilde;", "&ouml;", "&divide;", "&oslash;", "&ugrave;", "&uacute;", "&ucirc;", "&uuml;", "&yacute;", "&thorn;", "&yuml;", "&quot;", "&amp;", "&lt;", "&gt;", "&OElig;", "&oelig;", "&Scaron;", "&scaron;", "&Yuml;", "&circ;", "&tilde;", "&ensp;", "&emsp;", "&thinsp;", "&zwnj;", "&zwj;", "&lrm;", "&rlm;", "&ndash;", "&mdash;", "&lsquo;", "&rsquo;", "&sbquo;", "&ldquo;", "&rdquo;", "&bdquo;", "&dagger;", "&Dagger;", "&permil;", "&lsaquo;", "&rsaquo;", "&euro;", "&fnof;", "&Alpha;", "&Beta;", "&Gamma;", "&Delta;", "&Epsilon;", "&Zeta;", "&Eta;", "&Theta;", "&Iota;", "&Kappa;", "&Lambda;", "&Mu;", "&Nu;", "&Xi;", "&Omicron;", "&Pi;", "&Rho;", "&Sigma;", "&Tau;", "&Upsilon;", "&Phi;", "&Chi;", "&Psi;", "&Omega;", "&alpha;", "&beta;", "&gamma;", "&delta;", "&epsilon;", "&zeta;", "&eta;", "&theta;", "&iota;", "&kappa;", "&lambda;", "&mu;", "&nu;", "&xi;", "&omicron;", "&pi;", "&rho;", "&sigmaf;", "&sigma;", "&tau;", "&upsilon;", "&phi;", "&chi;", "&psi;", "&omega;", "&thetasym;", "&upsih;", "&piv;", "&bull;", "&hellip;", "&prime;", "&Prime;", "&oline;", "&frasl;", "&weierp;", "&image;", "&real;", "&trade;", "&alefsym;", "&larr;", "&uarr;", "&rarr;", "&darr;", "&harr;", "&crarr;", "&lArr;", "&uArr;", "&rArr;", "&dArr;", "&hArr;", "&forall;", "&part;", "&exist;", "&empty;", "&nabla;", "&isin;", "&notin;", "&ni;", "&prod;", "&sum;", "&minus;", "&lowast;", "&radic;", "&prop;", "&infin;", "&ang;", "&and;", "&or;", "&cap;", "&cup;", "&int;", "&there4;", "&sim;", "&cong;", "&asymp;", "&ne;", "&equiv;", "&le;", "&ge;", "&sub;", "&sup;", "&nsub;", "&sube;", "&supe;", "&oplus;", "&otimes;", "&perp;", "&sdot;", "&lceil;", "&rceil;", "&lfloor;", "&rfloor;", "&lang;", "&rang;", "&loz;", "&spades;", "&clubs;", "&hearts;", "&diams;"],
    ["&#160;", "&#161;", "&#162;", "&#163;", "&#164;", "&#165;", "&#166;", "&#167;", "&#168;", "&#169;", "&#170;", "&#171;", "&#172;", "&#173;", "&#174;", "&#175;", "&#176;", "&#177;", "&#178;", "&#179;", "&#180;", "&#181;", "&#182;", "&#183;", "&#184;", "&#185;", "&#186;", "&#187;", "&#188;", "&#189;", "&#190;", "&#191;", "&#192;", "&#193;", "&#194;", "&#195;", "&#196;", "&#197;", "&#198;", "&#199;", "&#200;", "&#201;", "&#202;", "&#203;", "&#204;", "&#205;", "&#206;", "&#207;", "&#208;", "&#209;", "&#210;", "&#211;", "&#212;", "&#213;", "&#214;", "&#215;", "&#216;", "&#217;", "&#218;", "&#219;", "&#220;", "&#221;", "&#222;", "&#223;", "&#224;", "&#225;", "&#226;", "&#227;", "&#228;", "&#229;", "&#230;", "&#231;", "&#232;", "&#233;", "&#234;", "&#235;", "&#236;", "&#237;", "&#238;", "&#239;", "&#240;", "&#241;", "&#242;", "&#243;", "&#244;", "&#245;", "&#246;", "&#247;", "&#248;", "&#249;", "&#250;", "&#251;", "&#252;", "&#253;", "&#254;", "&#255;", "&#34;", "&#38;", "&#60;", "&#62;", "&#338;", "&#339;", "&#352;", "&#353;", "&#376;", "&#710;", "&#732;", "&#8194;", "&#8195;", "&#8201;", "&#8204;", "&#8205;", "&#8206;", "&#8207;", "&#8211;", "&#8212;", "&#8216;", "&#8217;", "&#8218;", "&#8220;", "&#8221;", "&#8222;", "&#8224;", "&#8225;", "&#8240;", "&#8249;", "&#8250;", "&#8364;", "&#402;", "&#913;", "&#914;", "&#915;", "&#916;", "&#917;", "&#918;", "&#919;", "&#920;", "&#921;", "&#922;", "&#923;", "&#924;", "&#925;", "&#926;", "&#927;", "&#928;", "&#929;", "&#931;", "&#932;", "&#933;", "&#934;", "&#935;", "&#936;", "&#937;", "&#945;", "&#946;", "&#947;", "&#948;", "&#949;", "&#950;", "&#951;", "&#952;", "&#953;", "&#954;", "&#955;", "&#956;", "&#957;", "&#958;", "&#959;", "&#960;", "&#961;", "&#962;", "&#963;", "&#964;", "&#965;", "&#966;", "&#967;", "&#968;", "&#969;", "&#977;", "&#978;", "&#982;", "&#8226;", "&#8230;", "&#8242;", "&#8243;", "&#8254;", "&#8260;", "&#8472;", "&#8465;", "&#8476;", "&#8482;", "&#8501;", "&#8592;", "&#8593;", "&#8594;", "&#8595;", "&#8596;", "&#8629;", "&#8656;", "&#8657;", "&#8658;", "&#8659;", "&#8660;", "&#8704;", "&#8706;", "&#8707;", "&#8709;", "&#8711;", "&#8712;", "&#8713;", "&#8715;", "&#8719;", "&#8721;", "&#8722;", "&#8727;", "&#8730;", "&#8733;", "&#8734;", "&#8736;", "&#8743;", "&#8744;", "&#8745;", "&#8746;", "&#8747;", "&#8756;", "&#8764;", "&#8773;", "&#8776;", "&#8800;", "&#8801;", "&#8804;", "&#8805;", "&#8834;", "&#8835;", "&#8836;", "&#8838;", "&#8839;", "&#8853;", "&#8855;", "&#8869;", "&#8901;", "&#8968;", "&#8969;", "&#8970;", "&#8971;", "&#9001;", "&#9002;", "&#9674;", "&#9824;", "&#9827;", "&#9829;", "&#9830;"]
];
ytcenter.utils.escapeXML = function(str){
    return ytcenter.utils.replaceArray(str, ["<", ">", "&", "\"", "'"], ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"]);
};
ytcenter.utils.unescapeXML = function(str){
    return ytcenter.utils.replaceArray(str, ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"], ["<", ">", "&", "\"", "'"]);
};
ytcenter.utils.escapeHTML = function(str){
    if (str === "") return "";
    var i, a = "";
    for (i = 0; i < str.length; i++) {
        switch (str[i]) {
            case "<":
                a += "&lt;";
                break;
            case ">":
                a += "&gt;";
                break;
            case "&":
                a += "&amp;";
                break;
            case "\"":
                a += "&quot;";
                break;
            case "'":
                a += "&apos;";
                break;
            default:
                if (str[i] < " " || str[i] > "~")
                    a += "&#" + (str.charCodeAt(i)) + ";";
                else
                    a += str[i];
                break;
        }
        if (str[i] === "<") {
            a += "&lt;";
        }
    }
    return a;
};
ytcenter.utils.unescapeHTML = function(str){
    if (typeof str !== "string" || str === "") return "";
    str = ytcenter.utils.replaceArray(str, ytcenter.utils._escape_html_entities[0], ytcenter.utils._escape_html_entities[1]);
    var i, a = str.match(/&#[0-9]{1,5};/g), b, c;
    if (!a) return str;
    for (i = 0; i < a.length; i++) {
        b = a[i];
        c = b.substring(2, b.length - 1);
        if (c > -32769 && c < 65536) {
            str = str.replace(b, String.fromCharCode(c));
        } else {
            str = str.replace(b, "");
        }
    }
    return str;
};
ytcenter.utils.replaceArray = function(str, find, replace){
    var i;
    if (find.length !== replace.length) throw "The find & replace array doesn't have the same length!";
    for (i = 0; i < find.length; i++) {
        str = str.replace(new RegExp(find[i], "g"), replace[i]);
    }
    return str;
};
ytcenter.utils.number1000Formating = function(num){
    var i, j = 0, r = [], tmp = "";
    num = num + "";
    for (i = num.length - 1; i >= 0; i--) {
        tmp = num[i] + tmp;
        if (tmp.length === 3) {
            r.unshift(tmp);
            tmp = "";
        }
    }
    if (tmp !== "") r.unshift(tmp);
    return r.join(",");
};
ytcenter.utils.xhr = function(details){
    ytcenter.unsafeCall("xhr", [details], null);
};
ytcenter.utils.browser_xhr = function(details){
    var xmlhttp;
    if (typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
    } else {
        details["onerror"](responseState);
    }
    xmlhttp.onreadystatechange = function(){
        var responseState = {
            responseXML: '',
            responseText: (xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
            readyState: xmlhttp.readyState,
            responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
            status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
            statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : ''),
            finalUrl: (xmlhttp.readyState == 4 ? xmlhttp.finalUrl : '')
        };
        if (details["onreadystatechange"]) {
            details["onreadystatechange"](responseState);
        }
        if (xmlhttp.readyState == 4) {
            if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
                details["onload"](responseState);
            }
            if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
                details["onerror"](responseState);
            }
        }
    };
    try {
        xmlhttp.open(details.method, details.url);
    } catch(e) {
        details["onerror"]();
    }
    if (details.headers) {
        for (var prop in details.headers) {
            xmlhttp.setRequestHeader(prop, details.headers[prop]);
        }
    }
    xmlhttp.send((typeof(details.data) !== 'undefined') ? details.data : null);
};
ytcenter.utils.getScrollOffset = function(){
    var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    var left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
    return {top:top,left:left};
};
ytcenter.utils.addEventListener = (function(){
    var listeners = [];
    ytcenter.unload(function(){
        var i;
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].elm.removeEventListener) {
                listeners[i].elm.removeEventListener(listeners[i].event, listeners[i].callback, listeners[i].useCapture || false);
            }
        }
        listeners = [];
    });
    ytcenter.utils.removeEventListener = function(elm, event, callback, useCapture){
        var i;
        if (elm.removeEventListener) {
            elm.removeEventListener(event, callback, useCapture || false);
        }
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].elm === elm && listeners[i].event === event && listeners[i].callback === callback && listeners[i].useCapture === useCapture) {
                listeners.splice(i, 1);
                break;
            }
        }
    };
    return function(elm, event, callback, useCapture){
        if (!elm) return;
        listeners.push({elm: elm, event: event, callback: callback, useCapture: useCapture});

        if (elm.addEventListener) {
            elm.addEventListener(event, callback, useCapture || false);
        } else if (elm.attachEvent) {
            elm.attachEvent("on" + event, callback);
        }
    };
})();
ytcenter.utils.getRGB = function(h, s, v){
    h = h/360 * 6;
    s = s/100;
    v = v/100;

    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return {red: r * 255, green: g * 255, blue: b * 255};
};
ytcenter.utils.getHSV = function(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max == min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {hue: h*360, saturation: s*100, value: v/255*100};
};
ytcenter.utils.hsvToHex = function(hue, sat, val){
    var rgb = ytcenter.utils.getRGB(hue, sat, val);
    return ytcenter.utils.colorToHex(rgb.red, rgb.green, rgb.blue);
};
ytcenter.utils.colorToHex = function(red, green, blue){
    red = Math.round(red);
    green = Math.round(green);
    blue = Math.round(blue);
    if (red > 255) red = 255;
    if (red < 0) red = 0;
    if (green > 255) green = 255;
    if (green < 0) green = 0;
    if (blue > 255) blue = 255;
    if (blue < 0) blue = 0;
    var r = red.toString(16);
    if (r.length === 1) r = "0" + r;
    var g = green.toString(16);
    if (g.length === 1) g = "0" + g;
    var b = blue.toString(16);
    if (b.length === 1) b = "0" + b;
    r = r.toUpperCase();
    g = g.toUpperCase();
    b = b.toUpperCase();
    return "#" + r + g + b;
};
ytcenter.utils.hexToColor = function(hex){
    if (hex.indexOf("#") === 0) hex = hex.substring(1);
    var r,g,b;
    if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 3) {
        r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
        g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
        b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
    } else {
        r = 0;
        g = 0;
        b = 0;
    }
    return {red: r, green: g, blue: b};
};
ytcenter.utils.setKeyword = function(keywords, key, value){
    var a = keywords.split(",");
    for (var i = 0; i < a.length; i++) {
        if (a[i].split("=")[0] === "key") {
            if (typeof value === "string") {
                a[i] = key + "=" + value;
            } else {
                a[i] = key;
            }
            return a.join(",");
        }
    }
    if (typeof value === "string") {
        a.push(key + "=" + value);
    } else {
        a.push(key);
    }
    return a.join(",");
};
ytcenter.utils.updateSignatureDecipher = function(){
    //ytcenter.utils.updateSignatureDecipher = function(){}; // I'm just cheating a little bit ...
    if (ytcenter && ytcenter.player && ytcenter.player.config && ytcenter.player.config.assets && ytcenter.player.config.assets.js) {
        var js = (loc.href.indexOf("https") === 0 ? "https:" : "http:") + ytcenter.player.config.assets.js,
            regex = /function [a-zA-Z$0-9]+\(a\){a=a\.split\(""\);(.*?)return a\.join\(""\)}/g,
            regex2 = /function [a-zA-Z$0-9]+\(a\){a=a\.split\(""\);(((a=([a-zA-Z$0-9]+)\(a,([0-9]+)\);)|(a=a\.slice\([0-9]+\);)|(a=a\.reverse\(\);)|(var b=a\[0\];a\[0\]=a\[[0-9]+%a\.length\];a\[[0-9]+\]=b;)))*return a\.join\(""\)}/g;
        con.log("[updateSignatureDecipher] Contacting " + js);
        ytcenter.utils.xhr({
            method: "GET",
            url: js,
            onload: function(response) {
                var a,i,b,v;

                if (response.responseText.match(regex2)) {
                    con.log("[updateSignatureDecipher] Using regex 1");
                    a = regex2.exec(response.responseText)[0].split("{")[1].split("}")[0].split(";");
                    ytcenter.settings['signatureDecipher'] = []; // Clearing signatureDecipher
                    for (i = 1; i < a.length-1; i++) {
                        b = a[i];
                        if (b.indexOf("a.slice") !== -1) { // Slice
                            v = b.split("(")[1].split(")")[0];
                            ytcenter.settings['signatureDecipher'].push({func: "slice", value: parseInt(v)});
                        } else if (b.indexOf("a.reverse") !== -1) { // Reverse
                            ytcenter.settings['signatureDecipher'].push({func: "reverse", value: null});
                        } else if ((a[i] + ";" + a[i+1] + ";" + a[i+2]).indexOf("var b=a[0];a[0]=a[") !== -1){ // swapHeadAndPosition
                            v = (a[i] + ";" + a[i+1] + ";" + a[i+2]).split("var b=a[0];a[0]=a[")[1].split("%")[0];
                            ytcenter.settings['signatureDecipher'].push({func: "swapHeadAndPosition", value: parseInt(v)});
                            i = i+2;
                        } else { // swapHeadAndPosition (maybe it's deprecated by YouTube)
                            v = b.split("(a,")[1].split(")")[0];
                            ytcenter.settings['signatureDecipher'].push({func: "swapHeadAndPosition", value: parseInt(v)});
                        }
                    }
                } else if (response.responseText.match(regex)) {
                    con.log("[updateSignatureDecipher] Using regex 2");
                    a = regex.exec(response.responseText)[1];
                    if (a.match(/a=([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\(a,([0-9]+)\)/g)) {
                        var commonObject = null;
                        var arr = a.split(";");
                        var methods = [];
                        var methodValues = [];
                        for (var i = 0, len = arr.length - 1; i < len; i++) {
                            var tokens = /a=([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\(a,([0-9]+)\)/g.exec(arr[i]);
                            if (commonObject !== tokens[1] && commonObject !== null) {
                                throw "Unknown cipher method!";
                            } else {
                                commonObject = tokens[1];
                            }
                            methods.push(tokens[2]);
                            methodValues.push(tokens[3]);
                        }

                        var prefix = "var " + ytcenter.utils.escapeRegExp(commonObject) + "=\\{(";

                        var uniqueMethods = [];
                        var regexMeth = [];
                        for (var i = 0, len = methods.length; i < len; i++) {
                            if (!ytcenter.utils.inArray(uniqueMethods, methods[i])) {
                                uniqueMethods.push(methods[i]);
                                regexMeth.push(ytcenter.utils.escapeRegExp(methods[i]));
                            }
                        }

                        for (var i = 0, len = uniqueMethods.length; i < len; i++) {
                            if (i > 0) prefix += "|";
                            prefix += "(([a-zA-Z0-9]+):function\\(([a-zA-Z0-9,]+)\\)\\{(.*?)\\}[,]?)";
                        }

                        prefix += ")\\}";

                        var regexMethod = new RegExp(prefix, "g").exec(response.responseText);
                        var definedFunctions = new RegExp("([a-zA-Z0-9]+):function\\(([a-zA-Z0-9,]+)\\)\\{(.*?)\\}", "g");

                        ytcenter.settings['signatureDecipher'] = [];

                        var definedFunction;
                        while (definedFunction = definedFunctions.exec(regexMethod[0])) {
                            ytcenter.settings['signatureDecipher'].push({ func: "function", name: definedFunction[1], value: definedFunction[3] });
                        }

                        for (var i = 0, len = methods.length; i < len; i++) {
                            ytcenter.settings['signatureDecipher'].push({ func: "call", name: methods[i], value: methodValues[i] });
                        }

                    } else if (a.match(/([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\(a,([0-9]+)\)/g)) {
                        var commonObject = null;
                        var arr = a.split(";");
                        var methods = [];
                        var methodValues = [];
                        for (var i = 0, len = arr.length - 1; i < len; i++) {
                            var tokens = /([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\(a,([0-9]+)\)/g.exec(arr[i]);
                            if (commonObject !== tokens[1] && commonObject !== null) {
                                throw "Unknown cipher method!";
                            } else {
                                commonObject = tokens[1];
                            }
                            methods.push(tokens[2]);
                            methodValues.push(tokens[3]);
                        }

                        var prefix = "var " + ytcenter.utils.escapeRegExp(commonObject) + "=\\{(";

                        var uniqueMethods = [];
                        var regexMeth = [];
                        for (var i = 0, len = methods.length; i < len; i++) {
                            if (!ytcenter.utils.inArray(uniqueMethods, methods[i])) {
                                uniqueMethods.push(methods[i]);
                                regexMeth.push(ytcenter.utils.escapeRegExp(methods[i]));
                            }
                        }

                        for (var i = 0, len = uniqueMethods.length; i < len; i++) {
                            if (i > 0) prefix += "|";
                            prefix += "(([a-zA-Z0-9]+):function\\(([a-zA-Z0-9,]+)\\)\\{(.*?)\\}[,]?)";
                        }

                        prefix += ")\\}";

                        var regexMethod = new RegExp(prefix, "g").exec(response.responseText);
                        var definedFunctions = new RegExp("([a-zA-Z0-9]+):function\\(([a-zA-Z0-9,]+)\\)\\{(.*?)\\}", "g");

                        ytcenter.settings['signatureDecipher'] = [];

                        var definedFunction;
                        while (definedFunction = definedFunctions.exec(regexMethod[0])) {
                            ytcenter.settings['signatureDecipher'].push({ func: "function", name: definedFunction[1], value: definedFunction[3] + ";return a;" });
                        }

                        for (var i = 0, len = methods.length; i < len; i++) {
                            ytcenter.settings['signatureDecipher'].push({ func: "call", name: methods[i], value: methodValues[i] });
                        }
                    } else {
                        ytcenter.settings['signatureDecipher'] = []; // Clearing signatureDecoder
                        ytcenter.settings['signatureDecipher'].push({ func: "code", value: a });
                    }
                } else {
                    con.error("[updateSignatureDecipher] Couldn't retrieve the signatureDecipher!");
                }
                ytcenter.events.performEvent("ui-refresh");
                ytcenter.saveSettings();
            },
            onerror: function() {
                con.error("[SignatureDecipher] Couldn't download data!");
            }
        });
    }
};
ytcenter.utils.signatureDecipher = function(signatureCipher, decipherRecipe){
    function swapHeadAndPosition(array, position) {
        var head = array[0];
        var other = array[position % array.length];
        array[0] = other;
        array[position] = head;
        return array;
    }
    if (!signatureCipher) return "";
    var cipherArray = signatureCipher.split(""), i;
    decipherRecipe = decipherRecipe || ytcenter.settings['signatureDecipher'];

    var funcMap = {};

    for (i = 0; i < decipherRecipe.length; i++) {
        if (decipherRecipe[i].func === "function") {
            funcMap[decipherRecipe[i].name] = new Function("a", "b", decipherRecipe[i].value);
        } else if (decipherRecipe[i].func === "call") {
            cipherArray = funcMap[decipherRecipe[i].name](cipherArray, decipherRecipe[i].value);
        } else if (decipherRecipe[i].func === "code") {
            cipherArray = new Function("a", decipherRecipe[i].value + "return a.join(\"\")")(cipherArray);
        } else if (decipherRecipe[i].func === "swapHeadAndPosition") {
            cipherArray = swapHeadAndPosition(cipherArray, decipherRecipe[i].value);
        } else if (decipherRecipe[i].func === "slice") {
            cipherArray = cipherArray.slice(decipherRecipe[i].value);
        } else if (decipherRecipe[i].func === "reverse") {
            cipherArray = cipherArray.reverse();
        }
    }
    if (!ytcenter.utils.isArray(cipherArray)) return signatureCipher;
    return cipherArray.join("");
};
ytcenter.utils.crypt_h = void 0;
ytcenter.utils.crypt_l = !0;
ytcenter.utils.crypt_p = !1;
ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_h;
ytcenter.utils.crypt = function(){
    try {
        var a;
        try {
            if (ytcenter.utils.crypt_Ej == ytcenter.utils.crypt_h && (ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_p, window.crypto && window.crypto.wx)) {
                try {
                    a = new Uint8Array(1), window.crypto.wx(a), ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_l
                } catch (b) {
                }
            }
        } catch (e) {
            con.error(e);
        }
        if (ytcenter.utils.crypt_Ej) {
            a = Array(16);
            var c = new Uint8Array(16);
            window.crypto.getRandomValues(c);
            for (var d = 0; d < a.length; d++)
                a[d] = c[d]
        } else {
            a = Array(16);
            for (c = 0; 16 > c; c++) {
                for (var d = ytcenter.utils.now(), f = 0; f < d % 23; f++)
                    a[c] = Math.random();
                a[c] = Math.floor(64 * Math.random())
            }
        }
        c = [];
        for (d = 0; d < a.length; d++)
            c.push("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"[a[d] & 63]);
        return c.join("");
    } catch (e) {
        con.error(e);
    }
};
ytcenter.utils.calculateDimensions = function(width, height, player_ratio){
    player_ratio = player_ratio || 16/9;
    var calcWidth, calcHeight;
    var widthType, heightType;
    if (width.indexOf("%") !== -1 && width.match(/%$/)) {
        widthType = "%";
    } else {
        widthType = "px";
    }
    if (height.indexOf("%") !== -1 && height.match(/%$/)) {
        heightType = "%";
    } else {
        heightType = "px";
    }

    if (widthType === "px") {
        calcWidth = parseInt(width);
    } else {
        calcWidth = width;
    }
    if (heightType === "px") {
        calcHeight = parseInt(height);
    } else {
        calcHeight = height;
    }
    if (widthType === "px" && heightType === "px") {
        if (!isNaN(parseInt(width)) && isNaN(parseInt(height))) {
            calcHeight = Math.round(calcWidth/player_ratio);
        } else if (isNaN(parseInt(width)) && !isNaN(parseInt(height))) {
            calcWidth = Math.round(calcHeight*player_ratio);
        }
    }
    return [calcWidth, calcHeight];
};
ytcenter.utils.bindArgument = function(func) {
    var sargs = Array.prototype.splice.call(arguments, 1, arguments.length);
    return function() {
        var args = Array.prototype.slice.call(sargs);
        Array.prototype.push.apply(args, arguments);
        return func.apply(null, args);
    };
};

ytcenter.utils.bind = function(scope, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
        return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
    };
};

ytcenter.utils.oldBind = function(func){
    return func.call.apply(func.bind, arguments);
};
ytcenter.utils.query = function(key){
    if (loc.search.indexOf("?") === 0) {
        var a = loc.search.substring(1).split("&");
        for (var i = 0; i < a.length; i++) {
            if (decodeURIComponent(a[i].split("=")[0]) === key) {
                return decodeURIComponent(a[i].split("=")[1]);
            }
        }
    }
};
ytcenter.utils.now = Date.now || function () {
        return +new Date;
    };
ytcenter.utils.setCookie = function(name, value, domain, path, expires){
    domain = domain ? ";domain=" + encodeURIComponent(domain) : "";
    path = path ? ";path=" + encodeURIComponent(path) : "";
    expires = 0 > expires ? "" : 0 == expires ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date(ytcenter.utils.now() + 1E3 * expires)).toUTCString();

    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + domain + path + expires;
};
ytcenter.utils.getCookie = function(key){
    return ytcenter.utils.getCookies()[key];
};
ytcenter.utils.getCookies = function(){
    function trimLeft(obj){
        return obj.replace(/^\s+/, "");
    }
    function trimRight(obj){
        return obj.replace(/\s+$/, "");
    }
    function map(obj, callback, thisArg) {
        for (var i = 0, n = obj.length, a = []; i < n; i++) {
            if (i in obj) a[i] = callback.call(thisArg, obj[i]);
        }
        return a;
    }
    var c = document.cookie, v = 0, cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
        c = RegExp.$1;
        v = 1;
    }
    if (v === 0) {
        map(c.split(/[,;]/), function(cookie) {
            var parts = cookie.split(/=/, 2),
                name = decodeURIComponent(trimLeft(parts[0])),
                value = parts.length > 1 ? decodeURIComponent(trimRight(parts[1])) : null;
            cookies[name] = value;
        });
    } else {
        map(c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g), function($0, $1) {
            var name = $0,
                value = $1.charAt(0) === '"'
                    ? $1.substr(1, -1).replace(/\\(.)/g, "$1")
                    : $1;
            cookies[name] = value;
        });
    }
    return cookies;
};
ytcenter.utils.assignId = (function(){
    var ___count = -1;
    return function(prefix) {
        ___count++;
        var timestamp = (new Date()).getTime();
        return (prefix ? prefix : "") + ___count + (timestamp);
    };
})();
ytcenter.utils.inArrayIndex = function(a, v) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === v) return i;
    }
    return -1;
};
ytcenter.utils.inArray = function(array, value) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] === value) {
            return true;
        }
    }
    return false;
};
ytcenter.utils.decodeURIArguments = function(uri){
    var a = {};
    ytcenter.utils.each(uri.split("&"), function(i, item){
        var key = decodeURIComponent(item.split("=")[0]);
        var value = decodeURIComponent(item.split("=")[1]);
        a[key] = value;
    });
    return a;
};
ytcenter.utils.call = function(func, args){
    var a = "";
    ytcenter.utils.each(args, function(i){
        if (i > 0) a += ", ";
        a += "b[" + i + "]";
    });
    return new Function("a", "return a(" + a + ")")(func);
};
ytcenter.utils.randomString = function(str, len) {
    var buff = "";
    for (var i = 0; i < len; i++) {
        buff += str[Math.floor(Math.random()*len)];
    }

    return buff;
};
ytcenter.utils.insertAfter = function(elm, after){
    if (typeof after.parentNode === "undefined") return;

    if (typeof elm.parentNode !== "undefined") elm.parentNode.removeChild(elm);
    if (after.parentNode.lastChild === after) {
        after.parentNode.appendChild(elm);
    } else {
        after.parentNode.insertBefore(elm, after.nextSibling);
    }
};
ytcenter.utils.hasChild = function(parent, elm){
    var c = parent.children;

    for (var i = 0; i < c.length; i++) {
        if (c[i] === elm) return true;
        if (ytcenter.utils.hasChild(c[i], elm)) return true;
    }

    return false;
};
ytcenter.utils.toParent = function(elm, className){
    while (elm !== document.body && typeof elm !== "undefined") {
        if (ytcenter.utils.hasClass(elm, className)) return elm;
        elm = elm.parentNode;
    }
};
ytcenter.utils.isArray = function(arr){
    return Object.prototype.toString.call(arr) === "[object Array]";
};
ytcenter.utils.each = function(obj, callback){
    if (ytcenter.utils.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            try {
                if (callback(i, obj[i]) === true) break;
            } catch (e) {
                con.error(e);
            }
        }
    } else {
        for (var key in obj) {
            try {
                if (obj.hasOwnProperty(key)) {
                    if (callback(key, obj[key]) === true) break;
                }
            } catch (e) {
                con.error(e);
            }
        }
    }
};
ytcenter.utils.mergeArrays = function(){
    if (arguments.length <= 0) return [];
    if (arguments.length === 1) return arguments[0];
    var arr = [], i, j;
    for (i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "undefined") continue;
        for (j = 0; j < arguments[i].length; j++) {
            arr.push(arguments[i][j]);
        }
    }
    return arr;
}
ytcenter.utils.mergeObjects = function(){
    if (arguments.length <= 0) return {};
    if (arguments.length === 1) return arguments[0];
    var _o = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === "undefined") continue;
        ytcenter.utils.each(arguments[i], function(key, value){
            var type = Object.prototype.toString.call(value);
            if (_o[key] && (type === "[object Array]" || type === "[object Object]")) {
                _o[key] = ytcenter.utils.mergeObjects(_o[key], value);
            } else {
                _o[key] = value;
            }
        });
    }
    return _o;
};
ytcenter.utils.cleanClasses = function(elm){
    if (!elm) return;
    var classes = elm.className + '';
    var classNames = classes.split(" "),
        i, _new = [];
    for (i = 0; i < classNames.length; i++) {
        if (classNames[i] !== "" && !ytcenter.utils.inArray(_new, classNames[i])) {
            _new.push(classNames[i]);
        }
    }
    elm.className = _new.join(" ");
};
ytcenter.utils.hasClass = function(elm, className){
    if (!elm) return;
    var classes = elm.className + '';
    var classNames = classes.split(" "),
        i;
    for (i = 0; i < classNames.length; i++) {
        if (classNames[i] === className) return true;
    }
    return false;
};
ytcenter.utils.toggleClass = function(elm, className){
    if (!elm) return;
    if (ytcenter.utils.hasClass(elm, className)) {
        ytcenter.utils.removeClass(elm, className);
    } else {
        ytcenter.utils.addClass(elm, className);
    }
};
ytcenter.utils.addClass = function(elm, className){
    if (!elm) return;
    var classes = elm.className + '';
    var classNames = classes.split(" "),
        addClassNames = className.split(" "),
        _new = [],
        i, j, found;
    for (i = 0; i < addClassNames.length; i++) {
        found = false;
        for (j = 0; j < classNames.length; j++) {
            if (addClassNames[i] === classNames[j]) {
                found = true;
                break;
            }
        }
        if (!found) {
            _new.push(addClassNames[i]);
        }
    }
    elm.className += " " + _new.join(" ");
    ytcenter.utils.cleanClasses(elm);
};
ytcenter.utils.removeClass = function(elm, className){
    if (!elm) return;
    var classes = elm.className + '';
    var classNames = classes.split(" "),
        remClassNames = className.split(" "),
        _new = [],
        i, j, found;
    for (var i = 0; i < classNames.length; i++) {
        if (classNames[i] === "") continue;
        found = false;
        for (j = 0; j < remClassNames.length; j++) {
            if (classNames[i] === remClassNames[j]) {
                found = true;
                break;
            }
        }
        if (!found) {
            _new.push(classNames[i]);
        }
    }
    elm.className = _new.join(" ");
};
ytcenter.utils.getOffset = function(elm, toElement){
    var _x = 0;
    var _y = 0;
    while(elm && elm !== toElement && !isNaN(elm.offsetLeft) && !isNaN(elm.offsetTop)) {
        _x += elm.offsetLeft - elm.scrollLeft;
        _y += elm.offsetTop - elm.scrollTop;
        elm = elm.offsetParent;
    }
    return { top: _y, left: _x };
};
ytcenter.utils.getOffScreenX = function(elm, border){
    border = border || 0;
    if (ytcenter.utils.getOffset(elm).left - border < 0) {
        return ytcenter.utils.getOffset(elm).left + border;
    } else if (ytcenter.utils.getOffset(elm).left + elm.offsetWidth + border > window.innerWidth) {
        return ytcenter.utils.getOffset(elm).left + elm.offsetWidth + border - window.innerWidth;
    } else {
        return 0;
    }
};
ytcenter.utils.getOffScreenY = function(elm, border){
    border = border || 0;
    if (ytcenter.utils.getOffset(elm).top + border < 0) {
        return ytcenter.utils.getOffset(elm).top - border;
    } else if (ytcenter.utils.getOffset(elm).top + elm.offsetWidth > window.innerWidth - border) {
        return ytcenter.utils.getOffset(elm).top + elm.offsetWidth + border - window.innerWidth;
    } else {
        return 0;
    }
};
ytcenter.utils.addCSS = function(id, styles, addElement) {
    function add() {
        if (oStyle.parentNode) {
            con.error("[addCSS] Element already added to document.");
        } else {
            if (document && document.body) {
                document.body.appendChild(oStyle);
            } else if (document && document.head) {
                document.head.appendChild(oStyle);
            } else if (document && document.documentElement) {
                document.documentElement.appendChild(oStyle);
            } else if (document) {
                document.appendChild(oStyle);
            } else {
                con.error("[addCSS] Couldn't add style to document!");
            }
        }
    }
    function remove() {
        if (isAdded()) {
            oStyle.parentNode.removeChild(oStyle);
        }
    }
    function isAdded() {
        return oStyle && oStyle.parentNode;
    }
    if (typeof addElement !== "boolean") {
        addElement = true;
    }
    var oStyle = document.createElement("style");
    oStyle.setAttribute("id", "ytcenter-styles-" + id);
    oStyle.setAttribute("type", "text\/css");
    oStyle.appendChild(document.createTextNode(styles));

    if (addElement) {
        add();
    }

    return {
        add: add,
        remove: remove,
        isAdded: isAdded
    };
};
ytcenter.utils.createElement = function(tagname, options){
    options = options || {};
    var elm = document.createElement(tagname);
    ytcenter.utils.each(options, function(key, value){
        if (key === "style" && typeof value === "object") {
            ytcenter.utils.each(value, function(_key, _value){
                elm.style[_key] = _value;
            });
        } else if (key === "listeners" && typeof value === "object") {
            ytcenter.utils.each(value, function(_key, _value){
                if (ytcenter.utils.isArray(_value)) {
                    ytcenter.utils.each(_value, function(i, __value){
                        ytcenter.utils.addEventListener(elm, _key, __value, false);
                    });
                } else {
                    ytcenter.utils.addEventListener(elm, _key, _value, false);
                }
            });
        } else {
            elm.setAttribute(key, value);
        }
    });

    return elm;
};
ytcenter.utils.objectKeys = function(obj){
    if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        con.error("ytcenter.utils.objectKeys called on non-object");
    }
    var result = [], key, i;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result.push(key);
        }
    }

    if (!({toString: null}).propertyIsEnumerable('toString')) {
        var dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;
        for (i = 0; i < dontEnumsLength; i++) {
            if (Object.prototype.hasOwnProperty.call(obj, dontEnums[i])) {
                result.push(dontEnums[i]);
            }
        }
    }
    return result;
};
ytcenter.utils.indexOf = function(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return true;
        }
    }
    return false;
};
ytcenter.utils.indexOf_ = function(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return i;
        }
    }
    return -1;
};
ytcenter.utils.arrayCompare = function(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
        if (!ytcenter.utils.indexOf(arr2, arr1[i])) {
            return false;
        }
    }
    return true;
};

ytcenter.utils.extend = function(what, wit) {
    var extObj, witKeys = Object.keys(wit);

    extObj = ytcenter.utils.objectKeys(what).length ? ytcenter.utils.clone(what) : {};

    witKeys.forEach(function(key) {
        Object.defineProperty(extObj, key, Object.getOwnPropertyDescriptor(wit, key));
    });

    return extObj;
}
ytcenter.utils.jsonClone = function(obj){
    return JSON.parse(JSON.stringify(obj));
};
ytcenter.utils.clone = function(obj){
    return ytcenter.utils.extend({}, obj);
};